import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';

import {
  monopolyFriends,
  monopolyFriendMessages,
  monopolyPlayer,
} from '@server/database/schema';
import type {
  FriendInfo,
  FriendMessage,
  FriendStatus,
  OnlineStatus,
  SearchUserResult,
} from '@shared/api.interface';

const MAX_MESSAGES = 100;
const DEFAULT_MESSAGE_LIMIT = 50;
const SEARCH_LIMIT = 20;
// 單則聊天訊息的最大字元數，防止使用者端送出超長訊息造成儲存與頻寬壓力
const MAX_MESSAGE_LENGTH = 2000;

interface FriendRow {
  userId: string;
  nickname: string | null;
  status: string;
  addedAt: string;
  remark: string | null;
}

interface MessageRow {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface SearchRow {
  userId: string;
  nickname: string;
}

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  // ========== 好友列表 ==========

  async getFriends(userId: string): Promise<FriendInfo[]> {
    const rows = await this.db.execute(sql<FriendRow>`
      SELECT
        (f.friend_id).user_id AS "userId",
        p.nickname,
        f.status,
        f._created_at AS "addedAt",
        f.remark
      FROM monopoly_friends f
      LEFT JOIN monopoly_player p ON (f.friend_id).user_id = p.visitor_id
      WHERE (f.user_id).user_id = ${userId} AND f.status = 'accepted'
      UNION ALL
      SELECT
        (f.user_id).user_id AS "userId",
        p.nickname,
        f.status,
        f._created_at AS "addedAt",
        f.remark
      FROM monopoly_friends f
      LEFT JOIN monopoly_player p ON (f.user_id).user_id = p.visitor_id
      WHERE (f.friend_id).user_id = ${userId} AND f.status = 'accepted'
      ORDER BY "addedAt" DESC
    `);

    const friendRows = rows as unknown as FriendRow[];
    const friendIds: string[] = friendRows.map((r: FriendRow) => r.userId);

    // 獲取未讀訊息計數
    const unreadCounts = await this.getUnreadCounts(userId, friendIds);

    return friendRows.map((row: FriendRow) => ({
      userId: row.userId,
      nickname: row.nickname ?? row.userId,
      status: row.status as FriendStatus,
      onlineStatus: 'offline' as OnlineStatus,
      remark: row.remark ?? undefined,
      addedAt: new Date(row.addedAt).toISOString(),
      unreadCount: unreadCounts.get(row.userId) ?? 0,
    }));
  }

  // ========== 待處理請求 ==========

  async getPendingRequests(userId: string): Promise<FriendInfo[]> {
    const rows = await this.db.execute(sql<FriendRow>`
      SELECT
        (f.user_id).user_id AS "userId",
        p.nickname,
        f.status,
        f._created_at AS "addedAt",
        f.remark
      FROM monopoly_friends f
      LEFT JOIN monopoly_player p ON (f.user_id).user_id = p.visitor_id
      WHERE (f.friend_id).user_id = ${userId} AND f.status = 'pending'
      ORDER BY f._created_at DESC
    `);

    const friendRows = rows as unknown as FriendRow[];
    return friendRows.map((row: FriendRow) => ({
      userId: row.userId,
      nickname: row.nickname ?? row.userId,
      status: row.status as FriendStatus,
      onlineStatus: 'offline' as OnlineStatus,
      remark: row.remark ?? undefined,
      addedAt: new Date(row.addedAt).toISOString(),
    }));
  }

  // ========== 搜尋使用者 ==========

  async searchUsers(userId: string, query: string): Promise<SearchUserResult[]> {
    if (!query?.trim()) return [];

    const searchTerm = `%${query.trim()}%`;

    const rows = await this.db.execute(sql<SearchRow>`
      SELECT
        p.visitor_id AS "userId",
        p.nickname
      FROM monopoly_player p
      WHERE p.nickname ILIKE ${searchTerm}
        AND p.visitor_id != ${userId}
      LIMIT ${SEARCH_LIMIT}
    `);

    const searchRows = rows as unknown as SearchRow[];
    if (searchRows.length === 0) return [];

    // 批次檢查好友狀態
    const userIds: string[] = searchRows.map((r: SearchRow) => r.userId);
    const friendStatuses = await this.getFriendStatusMap(userId, userIds);

    return searchRows.map((row: SearchRow) => ({
      userId: row.userId,
      nickname: row.nickname,
      isFriend: friendStatuses.get(row.userId) === 'accepted',
    }));
  }

  // ========== 新增好友 ==========

  async addFriend(
    fromUserId: string,
    toUserId: string,
    remark?: string,
  ): Promise<void> {
    if (fromUserId === toUserId) {
      throw new BadRequestException('不能新增自己為好友');
    }
    if (!toUserId?.trim()) {
      throw new BadRequestException('目標使用者ID不能為空');
    }

    // 檢查是否已存在好友關係或待處理請求（雙向檢查）
    const existing = await this.findFriendship(fromUserId, toUserId);
    if (existing) {
      if (existing.status === 'pending') {
        throw new BadRequestException('已存在待處理的好友請求');
      }
      if (existing.status === 'accepted') {
        throw new BadRequestException('對方已經是你的好友');
      }
      if (existing.status === 'blocked') {
        throw new BadRequestException('對方已被你拉黑');
      }
      // rejected 狀態允許重新發起請求
    }

    try {
      await this.db.insert(monopolyFriends).values({
        userId: fromUserId,
        friendId: toUserId,
        status: 'pending',
        remark: remark?.slice(0, 50),
      });
    } catch (err) {
      const code = this.extractPostgresErrorCode(err);
      if (code === '23505') {
        throw new BadRequestException('好友請求已存在');
      }
      this.logger.error(
        `addFriend failed: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  // ========== 好友操作 ==========

  async handleAction(
    userId: string,
    friendUserId: string,
    action: 'accept' | 'reject' | 'remove' | 'block',
  ): Promise<void> {
    if (!friendUserId?.trim()) {
      throw new BadRequestException('好友使用者ID不能為空');
    }
    if (userId === friendUserId) {
      throw new BadRequestException('不能對自己執行此操作');
    }

    const friendship = await this.findFriendship(userId, friendUserId);

    if (action === 'remove') {
      if (!friendship) {
        throw new NotFoundException('好友關係不存在');
      }
      await this.db.delete(monopolyFriends).where(
        sql`(user_id).user_id = ${friendship.userIdSide}
            AND (friend_id).user_id = ${friendship.friendIdSide}`,
      );
      return;
    }

    if (action === 'block') {
      if (friendship) {
        // 更新現有記錄為 blocked
        await this.db.update(monopolyFriends)
          .set({ status: 'blocked' })
          .where(
            sql`(user_id).user_id = ${friendship.userIdSide}
                 AND (friend_id).user_id = ${friendship.friendIdSide}`,
          );
      } else {
        // 建立新的拉黑記錄
        await this.db.insert(monopolyFriends).values({
          userId,
          friendId: friendUserId,
          status: 'blocked',
        });
      }
      return;
    }

    // accept / reject：只有收到請求的一方可以操作
    if (!friendship) {
      throw new NotFoundException('好友請求不存在');
    }

    // 必須是對方發給當前使用者的請求（friend_id = 當前使用者）
    if (friendship.friendIdSide !== userId) {
      throw new BadRequestException('無權處理此好友請求');
    }

    if (friendship.status !== 'pending') {
      throw new BadRequestException('該好友請求已被處理');
    }

    if (action === 'accept') {
      await this.db.update(monopolyFriends)
        .set({ status: 'accepted' })
        .where(
          sql`(user_id).user_id = ${friendship.userIdSide}
               AND (friend_id).user_id = ${friendship.friendIdSide}`,
        );
    } else if (action === 'reject') {
      await this.db.update(monopolyFriends)
        .set({ status: 'rejected' })
        .where(
          sql`(user_id).user_id = ${friendship.userIdSide}
               AND (friend_id).user_id = ${friendship.friendIdSide}`,
        );
    }
  }

  // ========== 聊天訊息 ==========

  async getMessages(
    userId: string,
    otherUserId: string,
    limit: number = DEFAULT_MESSAGE_LIMIT,
  ): Promise<FriendMessage[]> {
    if (!otherUserId?.trim()) {
      throw new BadRequestException('對方使用者ID不能為空');
    }

    const actualLimit = Math.min(Math.max(limit, 1), MAX_MESSAGES);

    const rows = await this.db.execute(sql<MessageRow>`
      SELECT
        id,
        (from_user).user_id AS "fromUserId",
        (to_user).user_id AS "toUserId",
        content,
        type,
        is_read AS "isRead",
        _created_at AS "createdAt"
      FROM monopoly_friend_messages
      WHERE
        ((from_user).user_id = ${userId} AND (to_user).user_id = ${otherUserId})
        OR
        ((from_user).user_id = ${otherUserId} AND (to_user).user_id = ${userId})
      ORDER BY _created_at DESC
      LIMIT ${actualLimit}
    `);

    const msgRows = rows as unknown as MessageRow[];
    // 倒序後再正序排列（最新的N條，按時間正序返回）
    const sorted = [...msgRows].reverse();

    return sorted.map((row: MessageRow) => ({
      id: row.id,
      fromUserId: row.fromUserId,
      toUserId: row.toUserId,
      content: row.content,
      type: row.type as 'text' | 'emoji' | 'system',
      isRead: row.isRead,
      createdAt: new Date(row.createdAt).toISOString(),
    }));
  }

  async sendMessage(
    fromUserId: string,
    toUserId: string,
    content: string,
  ): Promise<FriendMessage> {
    if (!toUserId?.trim()) {
      throw new BadRequestException('接收使用者ID不能為空');
    }
    if (!content?.trim()) {
      throw new BadRequestException('訊息內容不能為空');
    }
    if (fromUserId === toUserId) {
      throw new BadRequestException('不能給自己發訊息');
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `訊息內容不能超過 ${MAX_MESSAGE_LENGTH} 個字元`,
      );
    }

    const result = await this.db.insert(monopolyFriendMessages)
      .values({
        fromUser: fromUserId,
        toUser: toUserId,
        content: trimmedContent,
        type: 'text',
        isRead: false,
      })
      .returning({
        id: monopolyFriendMessages.id,
        createdAt: monopolyFriendMessages.createdAt,
      });

    if (result.length === 0) {
      throw new BadRequestException('訊息傳送失敗');
    }

    return {
      id: result[0].id,
      fromUserId,
      toUserId,
      content: trimmedContent,
      type: 'text',
      isRead: false,
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async markAsRead(userId: string, fromUserId: string): Promise<void> {
    if (!fromUserId?.trim()) {
      throw new BadRequestException('傳送方使用者ID不能為空');
    }

    await this.db.update(monopolyFriendMessages)
      .set({ isRead: true })
      .where(
        sql`(from_user).user_id = ${fromUserId}
             AND (to_user).user_id = ${userId}
             AND is_read = false`,
      );
  }

  // ========== 線上狀態 ==========

  async getOnlineStatus(
    userIds: string[],
  ): Promise<Record<string, OnlineStatus>> {
    const result: Record<string, OnlineStatus> = {};
    for (const uid of userIds) {
      result[uid] = 'offline';
    }
    return result;
  }

  // ========== 輔助方法 ==========

  private async getUnreadCounts(
    userId: string,
    friendIds: string[],
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (friendIds.length === 0) return result;

    const rows = await this.db.execute(sql`
      SELECT
        (from_user).user_id AS "fromUserId",
        COUNT(*) AS "unreadCount"
      FROM monopoly_friend_messages
      WHERE (to_user).user_id = ${userId}
        AND (from_user).user_id = ANY(ARRAY[${sql.join(
          friendIds.map((id: string) => sql`${id}`),
          sql`, `,
        )}]::text[])
        AND is_read = false
      GROUP BY (from_user).user_id
    `);

    const countRows = rows as unknown as Array<{
      fromUserId: string;
      unreadCount: string;
    }>;

    for (const row of countRows) {
      result.set(row.fromUserId, Number(row.unreadCount));
    }

    return result;
  }

  private async getFriendStatusMap(
    userId: string,
    otherUserIds: string[],
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (otherUserIds.length === 0) return result;

    const idsArray = sql.join(
      otherUserIds.map((id: string) => sql`${id}`),
      sql`, `,
    );

    const rows = await this.db.execute(sql`
      SELECT
        CASE
          WHEN (user_id).user_id = ${userId} THEN (friend_id).user_id
          ELSE (user_id).user_id
        END AS "otherUserId",
        status
      FROM monopoly_friends
      WHERE
        ((user_id).user_id = ${userId}
         AND (friend_id).user_id = ANY(ARRAY[${idsArray}]::text[]))
        OR
        ((friend_id).user_id = ${userId}
         AND (user_id).user_id = ANY(ARRAY[${idsArray}]::text[]))
    `);

    const statusRows = rows as unknown as Array<{
      otherUserId: string;
      status: string;
    }>;

    for (const row of statusRows) {
      result.set(row.otherUserId, row.status);
    }

    return result;
  }

  private async findFriendship(
    userIdA: string,
    userIdB: string,
  ): Promise<{
    userIdSide: string;
    friendIdSide: string;
    status: string;
  } | null> {
    const rows = await this.db.execute(sql`
      SELECT
        (user_id).user_id AS "userIdSide",
        (friend_id).user_id AS "friendIdSide",
        status
      FROM monopoly_friends
      WHERE
        ((user_id).user_id = ${userIdA} AND (friend_id).user_id = ${userIdB})
        OR
        ((user_id).user_id = ${userIdB} AND (friend_id).user_id = ${userIdA})
      LIMIT 1
    `);

    const result = rows as unknown as Array<{
      userIdSide: string;
      friendIdSide: string;
      status: string;
    }>;

    return result.length > 0 ? result[0] : null;
  }

  private extractPostgresErrorCode(error: unknown): string | undefined {
    let current: unknown = error;
    for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
      const { code, cause } = current as { code?: unknown; cause?: unknown };
      if (typeof code === 'string') return code;
      current = cause;
    }
    return undefined;
  }
}
