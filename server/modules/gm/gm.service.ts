import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  or,
  sql,
} from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import {
  monopolyAccount,
  monopolyAccountProvider,
  monopolyAnnouncement,
  monopolyGlobalEvent,
  monopolyGmLog,
} from '@server/database/schema';
import type {
  Announcement,
  GlobalEventConfig,
  GmCreateAnnouncementRequest,
  GmOAuthBinding,
  GmSendRewardRequest,
  GmUpdateUserRequest,
  GmUserSearchResult,
  OAuthProvider,
} from '@shared/api.interface';
import { generateGmToken } from './gm-auth.guard';

// 生產環境應透過環境變數 GM_PASSWORD 注入自訂管理密碼；
// 預設值僅供本地開發，避免外網暴露預設密碼。
const GM_PASSWORD = process.env.GM_PASSWORD || 'GM123456';
const GM_ID = 'system';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

type AccountRow = typeof monopolyAccount.$inferSelect;
type AnnouncementRow = typeof monopolyAnnouncement.$inferSelect;
type EventRow = typeof monopolyGlobalEvent.$inferSelect;

type GmUserSearchBase = Omit<GmUserSearchResult, 'oauthBindings'>;

function rowToGmUserSearchResult(row: AccountRow): GmUserSearchBase {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatarFrame: row.avatarFrame,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    coins: row.coins,
    level: row.level,
    isBanned: row.isBanned,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToGmUserDetail(row: AccountRow): Record<string, unknown> {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatarFrame: row.avatarFrame,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    coins: row.coins,
    level: row.level,
    isBanned: row.isBanned,
    banReason: row.banReason,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    unlockedSkins: row.unlockedSkins as string[],
    unlockedTitles: row.unlockedTitles as string[],
    unlockedAchievements: row.unlockedAchievements as Record<string, boolean>,
    inventory: row.inventory as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function bindingRowToGmOAuth(binding: {
  provider: string;
  providerUserId: string;
  displayName: string | null;
  email: string | null;
  boundAt: Date;
}): GmOAuthBinding {
  return {
    provider: binding.provider as OAuthProvider,
    providerUserId: binding.providerUserId,
    displayName: binding.displayName ?? undefined,
    email: binding.email ?? undefined,
    boundAt: binding.boundAt.toISOString(),
  };
}

async function loadBindingsMap(
  db: PostgresJsDatabase,
  accountIds: string[],
): Promise<Map<string, GmOAuthBinding[]>> {
  if (accountIds.length === 0) return new Map();

  const bindingRows = await db
    .select({
      accountId: monopolyAccountProvider.accountId,
      provider: monopolyAccountProvider.provider,
      providerUserId: monopolyAccountProvider.providerUserId,
      displayName: monopolyAccountProvider.displayName,
      email: monopolyAccountProvider.email,
      boundAt: monopolyAccountProvider.boundAt,
    })
    .from(monopolyAccountProvider)
    .where(inArray(monopolyAccountProvider.accountId, accountIds))
    .orderBy(monopolyAccountProvider.boundAt);

  const map = new Map<string, GmOAuthBinding[]>();
  for (const b of bindingRows) {
    const list = map.get(b.accountId) ?? [];
    list.push(bindingRowToGmOAuth(b));
    map.set(b.accountId, list);
  }
  return map;
}

function rowToAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    isActive: row.isActive,
    priority: row.priority,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToGlobalEvent(row: EventRow): GlobalEventConfig {
  const config = row.config as Record<string, unknown>;
  return {
    id: row.id,
    eventType: row.eventType,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.isActive,
    config,
    startsAt: row.startsAt ? row.startsAt.toISOString() : undefined,
    endsAt: row.endsAt ? row.endsAt.toISOString() : undefined,
  } as GlobalEventConfig;
}

@Injectable()
export class GmService {
  private readonly logger = new Logger(GmService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  // ====== GM 登录 ======

  async login(password: string): Promise<{ token: string; expiresAt: string }> {
    if (password !== GM_PASSWORD) {
      throw new UnauthorizedException('密码错误');
    }
    const { token, expiresAt } = generateGmToken(GM_ID);
    this.logger.log('GM 登录成功');
    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  // ====== GM 操作日志 ======

  private async writeLog(
    action: string,
    targetUserId: string | null,
    details: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.db.insert(monopolyGmLog).values({
        gmId: GM_ID,
        action,
        targetUserId,
        details,
      });
    } catch (err) {
      this.logger.error(
        `写入 GM 日志失败: action=${action}, error=${JSON.stringify(err)}`,
      );
    }
  }

  // ====== 用户搜索 ======

  async searchUsers(
    keyword?: string,
    pageParam?: string,
    pageSizeParam?: string,
  ): Promise<{
    items: GmUserSearchResult[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE;
    const pageSize = pageSizeParam
      ? Math.min(parseInt(pageSizeParam, 10), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

    if (Number.isNaN(page) || page < 1) {
      throw new BadRequestException('page 必须是正整数');
    }
    if (Number.isNaN(pageSize) || pageSize < 1) {
      throw new BadRequestException('pageSize 必须是正整数');
    }

    const whereClause = keyword
      ? or(
          ilike(monopolyAccount.nickname, `%${keyword}%`),
          ilike(monopolyAccount.username, `%${keyword}%`),
        )
      : undefined;

    const [countResult] = await this.db
      .select({ count: count() })
      .from(monopolyAccount)
      .where(whereClause);

    const rows = await this.db
      .select()
      .from(monopolyAccount)
      .where(whereClause)
      .orderBy(desc(monopolyAccount.elo))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const bindingMap = await loadBindingsMap(
      this.db,
      rows.map((r: AccountRow) => r.id),
    );

    return {
      items: rows.map(row => ({
        ...rowToGmUserSearchResult(row),
        oauthBindings: bindingMap.get(row.id) ?? [],
      })),
      total: Number(countResult.count),
      page,
      pageSize,
    };
  }

  // ====== 获取单个用户 ======

  async getUserById(id: string): Promise<Record<string, unknown>> {
    const rows = await this.db
      .select()
      .from(monopolyAccount)
      .where(eq(monopolyAccount.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const base = rowToGmUserDetail(rows[0]);
    const bindingMap = await loadBindingsMap(this.db, [id]);
    return {
      ...base,
      oauthBindings: bindingMap.get(id) ?? [],
    };
  }

  // ====== 修改用户 ======

  async updateUser(
    id: string,
    dto: GmUpdateUserRequest,
  ): Promise<Record<string, unknown>> {
    const patch: Partial<typeof monopolyAccount.$inferInsert> = {};

    if (dto.elo !== undefined) patch.elo = dto.elo;
    if (dto.wins !== undefined) patch.wins = dto.wins;
    if (dto.losses !== undefined) patch.losses = dto.losses;
    if (dto.coins !== undefined) patch.coins = dto.coins;
    if (dto.level !== undefined) patch.level = dto.level;
    if (dto.isBanned !== undefined) patch.isBanned = dto.isBanned;
    if (dto.banReason !== undefined) patch.banReason = dto.banReason;
    if (dto.unlockedSkins !== undefined) {
      patch.unlockedSkins = dto.unlockedSkins as unknown as string[];
    }
    if (dto.unlockedTitles !== undefined) {
      patch.unlockedTitles = dto.unlockedTitles as unknown as string[];
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    patch.updatedAt = new Date();

    const updated = await this.db
      .update(monopolyAccount)
      .set(patch)
      .where(eq(monopolyAccount.id, id))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    await this.writeLog('update_user', id, patch);

    return rowToGmUserDetail(updated[0]);
  }

  // ====== 发放奖励 ======

  async sendReward(
    id: string,
    dto: GmSendRewardRequest,
  ): Promise<Record<string, unknown>> {
    const userRows = await this.db
      .select()
      .from(monopolyAccount)
      .where(eq(monopolyAccount.id, id))
      .limit(1);

    if (userRows.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const user = userRows[0];
    const patch: Partial<typeof monopolyAccount.$inferInsert> = {};

    if (dto.coins !== undefined && dto.coins > 0) {
      patch.coins = user.coins + dto.coins;
    }

    if (dto.skins !== undefined && dto.skins.length > 0) {
      const currentSkins = (user.unlockedSkins as string[]) ?? [];
      const newSkins = [...new Set([...currentSkins, ...dto.skins])];
      patch.unlockedSkins = newSkins as unknown as string[];
    }

    if (dto.items !== undefined && Object.keys(dto.items).length > 0) {
      const inv = user.inventory as Record<string, unknown>;
      const currentItems =
        (inv.items as Record<string, number> | undefined) ?? {};
      const mergedItems: Record<string, number> = { ...currentItems };
      for (const [itemKey, qty] of Object.entries(dto.items)) {
        // 僅接受有限的正整數數量，避免 GM 後台誤操作導致背包變負數或 NaN
        if (typeof qty !== 'number' || !Number.isFinite(qty)) continue;
        const safeQty = Math.floor(qty);
        if (safeQty <= 0) continue;
        mergedItems[itemKey] = (mergedItems[itemKey] ?? 0) + safeQty;
      }
      patch.inventory = {
        ...inv,
        items: mergedItems,
      } as unknown as Record<string, unknown>;
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供有效奖励内容');
    }

    patch.updatedAt = new Date();

    const updated = await this.db
      .update(monopolyAccount)
      .set(patch)
      .where(eq(monopolyAccount.id, id))
      .returning();

    await this.writeLog('send_reward', id, {
      coins: dto.coins,
      items: dto.items,
      skins: dto.skins,
      reason: dto.reason,
    });

    return rowToGmUserDetail(updated[0]);
  }

  // ====== 重置用户 ======

  async resetUser(id: string): Promise<Record<string, unknown>> {
    const updated = await this.db
      .update(monopolyAccount)
      .set({
        elo: 1000,
        wins: 0,
        losses: 0,
        coins: 0,
        level: 1,
        updatedAt: new Date(),
      })
      .where(eq(monopolyAccount.id, id))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    await this.writeLog('reset_user', id, {});

    return rowToGmUserDetail(updated[0]);
  }

  // ====== GM 派發稱號 / 頭像框 ======

  async grantTitleOrFrame(
    id: string,
    dto: { titles?: string[]; avatarFrame?: string },
  ): Promise<Record<string, unknown>> {
    const userRows = await this.db
      .select()
      .from(monopolyAccount)
      .where(eq(monopolyAccount.id, id))
      .limit(1);

    if (userRows.length === 0) {
      throw new NotFoundException('使用者不存在');
    }

    const user = userRows[0];
    const patch: Partial<typeof monopolyAccount.$inferInsert> = {};

    // 派發稱號：去空白、去重、長度白名單校驗後合併進已解鎖稱號
    if (Array.isArray(dto.titles)) {
      const cleanTitles = Array.from(
        new Set(
          dto.titles
            .map((t) => String(t).trim())
            .filter((t) => t.length > 0 && t.length <= 50),
        ),
      ).slice(0, 50);
      if (cleanTitles.length === 0) {
        throw new BadRequestException('未提供有效的稱號');
      }
      const currentTitles = (user.unlockedTitles as string[]) ?? [];
      patch.unlockedTitles = Array.from(
        new Set([...currentTitles, ...cleanTitles]),
      ) as unknown as string[];
    }

    if (dto.avatarFrame !== undefined) {
      const frame = String(dto.avatarFrame).trim();
      if (frame.length === 0 || frame.length > 50) {
        throw new BadRequestException('頭像框 ID 長度需在 1-50 字元');
      }
      patch.avatarFrame = frame;
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可派發的內容');
    }

    patch.updatedAt = new Date();

    const updated = await this.db
      .update(monopolyAccount)
      .set(patch)
      .where(eq(monopolyAccount.id, id))
      .returning();

    await this.writeLog('grant_title_frame', id, {
      titles: dto.titles,
      avatarFrame: dto.avatarFrame,
    });

    return rowToGmUserDetail(updated[0]);
  }

  // ====== GM 儀表板總覽 ======

  async getDashboard(): Promise<Record<string, number | string>> {
    const [accountCount] = await this.db
      .select({ count: count() })
      .from(monopolyAccount);

    const [bannedCount] = await this.db
      .select({ count: count() })
      .from(monopolyAccount)
      .where(eq(monopolyAccount.isBanned, true));

    const [announcementCount] = await this.db
      .select({ count: count() })
      .from(monopolyAnnouncement);

    const activeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [newTodayCount] = await this.db
      .select({ count: count() })
      .from(monopolyAccount)
      .where(gte(monopolyAccount.createdAt, activeThreshold));

    return {
      totalAccounts: Number(accountCount?.count ?? 0),
      bannedAccounts: Number(bannedCount?.count ?? 0),
      activeAnnouncements: Number(announcementCount?.count ?? 0),
      newAccounts24h: Number(newTodayCount?.count ?? 0),
      generatedAt: new Date().toISOString(),
    };
  }

  // ====== 公告列表 ======

  async listAnnouncements(): Promise<Announcement[]> {
    const rows = await this.db
      .select()
      .from(monopolyAnnouncement)
      .orderBy(desc(monopolyAnnouncement.createdAt));

    return rows.map(rowToAnnouncement);
  }

  // ====== 创建公告 ======

  async createAnnouncement(
    dto: GmCreateAnnouncementRequest,
  ): Promise<Announcement> {
    if (!dto.title?.trim()) {
      throw new BadRequestException('标题不能为空');
    }
    if (!dto.content?.trim()) {
      throw new BadRequestException('内容不能为空');
    }

    const inserted = await this.db
      .insert(monopolyAnnouncement)
      .values({
        title: dto.title.trim(),
        content: dto.content.trim(),
        priority: dto.priority ?? 0,
      })
      .returning();

    await this.writeLog('create_announcement', null, {
      announcementId: inserted[0].id,
      title: dto.title,
    });

    return rowToAnnouncement(inserted[0]);
  }

  // ====== 更新公告 ======

  async updateAnnouncement(
    id: string,
    dto: {
      title?: string;
      content?: string;
      priority?: number;
      isActive?: boolean;
    },
  ): Promise<Announcement> {
    const patch: Partial<typeof monopolyAnnouncement.$inferInsert> = {};

    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.content !== undefined) patch.content = dto.content;
    if (dto.priority !== undefined) patch.priority = dto.priority;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    patch.updatedAt = new Date();

    const updated = await this.db
      .update(monopolyAnnouncement)
      .set(patch)
      .where(eq(monopolyAnnouncement.id, id))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('公告不存在');
    }

    await this.writeLog('update_announcement', null, {
      announcementId: id,
      ...patch,
    });

    return rowToAnnouncement(updated[0]);
  }

  // ====== 删除公告 ======

  async deleteAnnouncement(id: string): Promise<void> {
    const deleted = await this.db
      .delete(monopolyAnnouncement)
      .where(eq(monopolyAnnouncement.id, id))
      .returning({ id: monopolyAnnouncement.id });

    if (deleted.length === 0) {
      throw new NotFoundException('公告不存在');
    }

    await this.writeLog('delete_announcement', null, { announcementId: id });
  }

  // ====== 活动列表 ======

  async listEvents(): Promise<GlobalEventConfig[]> {
    const rows = await this.db
      .select()
      .from(monopolyGlobalEvent)
      .orderBy(desc(monopolyGlobalEvent.createdAt));

    return rows.map(rowToGlobalEvent);
  }

  // ====== 创建活动 ======

  async createEvent(dto: {
    eventType: string;
    name: string;
    description?: string;
    isActive?: boolean;
    config?: Record<string, unknown>;
    startsAt?: string;
    endsAt?: string;
  }): Promise<GlobalEventConfig> {
    if (!dto.eventType?.trim()) {
      throw new BadRequestException('活动类型不能为空');
    }
    if (!dto.name?.trim()) {
      throw new BadRequestException('活动名称不能为空');
    }

    const inserted = await this.db
      .insert(monopolyGlobalEvent)
      .values({
        eventType: dto.eventType.trim(),
        name: dto.name.trim(),
        description: dto.description,
        isActive: dto.isActive ?? false,
        config: (dto.config ?? {}) as unknown as Record<string, unknown>,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      })
      .returning();

    await this.writeLog('create_event', null, {
      eventId: inserted[0].id,
      eventType: dto.eventType,
      name: dto.name,
    });

    return rowToGlobalEvent(inserted[0]);
  }

  // ====== 更新活动 ======

  async updateEvent(
    id: string,
    dto: {
      eventType?: string;
      name?: string;
      description?: string;
      isActive?: boolean;
      config?: Record<string, unknown>;
      startsAt?: string;
      endsAt?: string;
    },
  ): Promise<GlobalEventConfig> {
    const patch: Partial<typeof monopolyGlobalEvent.$inferInsert> = {};

    if (dto.eventType !== undefined) patch.eventType = dto.eventType;
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.config !== undefined) {
      patch.config = dto.config as unknown as Record<string, unknown>;
    }
    if (dto.startsAt !== undefined) {
      patch.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      patch.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    patch.updatedAt = new Date();

    const updated = await this.db
      .update(monopolyGlobalEvent)
      .set(patch)
      .where(eq(monopolyGlobalEvent.id, id))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('活动不存在');
    }

    await this.writeLog('update_event', null, {
      eventId: id,
      ...patch,
    });

    return rowToGlobalEvent(updated[0]);
  }

  // ====== 删除活动 ======

  async deleteEvent(id: string): Promise<void> {
    const deleted = await this.db
      .delete(monopolyGlobalEvent)
      .where(eq(monopolyGlobalEvent.id, id))
      .returning({ id: monopolyGlobalEvent.id });

    if (deleted.length === 0) {
      throw new NotFoundException('活动不存在');
    }

    await this.writeLog('delete_event', null, { eventId: id });
  }

  // ====== 在线用户 ======

  async getOnlineUsers(): Promise<
    Array<{ id: string; nickname: string; elo: number }>
  > {
    const threshold = new Date(Date.now() - ONLINE_WINDOW_MS);

    const rows = await this.db
      .select({
        id: monopolyAccount.id,
        nickname: monopolyAccount.nickname,
        elo: monopolyAccount.elo,
      })
      .from(monopolyAccount)
      .where(
        or(
          gte(monopolyAccount.lastLoginAt, threshold),
          gte(monopolyAccount.updatedAt, threshold),
        ),
      )
      .orderBy(desc(monopolyAccount.elo));

    return rows;
  }
}
