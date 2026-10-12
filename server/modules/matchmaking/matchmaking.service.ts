import { Inject, Injectable, OnModuleInit, OnModuleDestroy, BadRequestException } from '@nestjs/common';
import { eq, and, asc, lt, inArray, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import { monopolyMatchQueue } from '@server/database/schema';
import type { GameMode, MatchStatusResponse } from '@shared/api.interface';
import { MonopolyService } from '../monopoly/monopoly.service';

const MATCH_TIMEOUT_SECONDS = 60;
const CLEANUP_INTERVAL_MS = 30_000;
const VALID_GAME_MODES: GameMode[] = ['classic', 'fast', 'crazy', 'custom'];
const VALID_MAX_PLAYERS = [2, 4, 6];

interface QueueRecord {
  id: string;
  visitorId: string;
  nickname: string;
  gameMode: string;
  maxPlayers: number;
  joinedAt: Date;
}

const pendingMatches = new Map<string, string>();

@Injectable()
export class MatchmakingService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly monopolyService: MonopolyService,
  ) {}

  onModuleInit(): void {
    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpired(MATCH_TIMEOUT_SECONDS).catch(() => {
        // 靜默失敗，避免定時器崩潰
      });
    }, CLEANUP_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 加入配對佇列
   */
  async joinQueue(
    visitorId: string,
    nickname: string,
    gameMode: string,
    maxPlayers: number,
  ): Promise<{ position: number; waitedSeconds: number }> {
    // 引數校驗
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    const trimmedNickname = nickname?.trim();
    if (!trimmedNickname) {
      throw new BadRequestException('暱稱不能為空');
    }
    if (trimmedNickname.length > 20) {
      throw new BadRequestException('暱稱長度不能超過 20 字元');
    }
    if (!VALID_GAME_MODES.includes(gameMode as GameMode)) {
      throw new BadRequestException('無效的遊戲模式');
    }
    if (!VALID_MAX_PLAYERS.includes(maxPlayers)) {
      throw new BadRequestException('無效的玩家數量');
    }

    const cleanId = visitorId.trim();
    const now = new Date();

    await this.db.transaction(async (tx) => {
      // 先移除該 visitorId 已有的佇列記錄（防止重複加入）
      await tx.delete(monopolyMatchQueue).where(eq(monopolyMatchQueue.visitorId, cleanId));

      // 清理超時記錄
      const cutoff = new Date(now.getTime() - MATCH_TIMEOUT_SECONDS * 1000);
      await tx.delete(monopolyMatchQueue).where(
        and(
          eq(monopolyMatchQueue.gameMode, gameMode),
          eq(monopolyMatchQueue.maxPlayers, maxPlayers),
          lt(monopolyMatchQueue.joinedAt, cutoff),
        ),
      );

      // 插入新記錄
      await tx.insert(monopolyMatchQueue).values({
        visitorId: cleanId,
        nickname: trimmedNickname,
        gameMode,
        maxPlayers,
        joinedAt: now,
      });
    });

    // 獲取當前位置
    const { position, waitedSeconds } = await this.getQueuePosition(
      cleanId,
      gameMode,
      maxPlayers,
    );

    // 嘗試配對
    await this.checkMatch(gameMode, maxPlayers);

    return { position, waitedSeconds };
  }

  /**
   * 檢查並執行配對
   * @returns 配對成功返回房間碼，否則返回 null
   */
  async checkMatch(gameMode: string, maxPlayers: number): Promise<string | null> {
    return this.db.transaction(async (tx) => {
      // 查詢該模式下按加入時間排序的前 N 個玩家，並加行鎖防止並發配對
      const candidates: QueueRecord[] = await tx
        .select()
        .from(monopolyMatchQueue)
        .where(
          and(
            eq(monopolyMatchQueue.gameMode, gameMode),
            eq(monopolyMatchQueue.maxPlayers, maxPlayers),
          ),
        )
        .orderBy(asc(monopolyMatchQueue.joinedAt))
        .limit(maxPlayers)
        .for('update');

      if (candidates.length < maxPlayers) {
        return null;
      }

      const matched = candidates.slice(0, maxPlayers);
      const playerIds = matched.map((p: QueueRecord) => p.id);
      const hostPlayer = matched[0];

      let roomCode: string | null = null;
      const joinedPlayers: number[] = [];

      try {
        // 建立房間（第一個玩家為房主）
        const room = await this.monopolyService.createRoom({
          hostName: hostPlayer.nickname,
          gameMode: gameMode as GameMode,
          maxPlayers,
        });
        roomCode = room.roomCode;
        joinedPlayers.push(0);

        // 讓其他玩家加入房間，逐個驗證
        for (let i = 1; i < matched.length; i++) {
          try {
            await this.monopolyService.joinRoom(
              room.roomCode,
              matched[i].nickname,
            );
            joinedPlayers.push(i);
          } catch (joinErr) {
            throw new Error(
              `玩家 ${matched[i].nickname} 加入房間失敗：${String(joinErr)}`,
            );
          }
        }

        // 校驗：所有玩家都成功加入後才開始遊戲
        if (joinedPlayers.length !== playerIds.length) {
          throw new Error('部分玩家加入失敗，取消配對');
        }

        // 房主自動開始遊戲
        await this.monopolyService.startGame(
          room.roomCode,
          0,
          gameMode as GameMode,
        );

        // 從佇列中刪除這些玩家
        await tx
          .delete(monopolyMatchQueue)
          .where(inArray(monopolyMatchQueue.id, playerIds));

        // 把房間碼寫入 pendingMatches，供 getQueueStatus 輪詢獲取
        for (const p of matched) {
          pendingMatches.set(p.visitorId, room.roomCode);
        }

        return room.roomCode;
      } catch (err) {
        // 補償：關閉已建立的髒房間
        if (roomCode) {
          try {
            await this.monopolyService.closeRoom(roomCode);
          } catch {
            // 忽略清理失敗
          }
        }
        // 補償：把已配對的玩家重新放回佇列
        try {
          const requeueValues = matched.map((p: QueueRecord) => ({
            visitorId: p.visitorId,
            nickname: p.nickname,
            gameMode: p.gameMode,
            maxPlayers: p.maxPlayers,
            joinedAt: new Date(),
          }));
          await tx
            .insert(monopolyMatchQueue)
            .values(requeueValues)
            .onConflictDoNothing();
        } catch {
          // 忽略重新入隊失敗
        }
        throw err;
      }
    });
  }

  /**
   * 離開配對佇列
   */
  async leaveQueue(visitorId: string): Promise<boolean> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }

    const result = await this.db
      .delete(monopolyMatchQueue)
      .where(eq(monopolyMatchQueue.visitorId, visitorId.trim()))
      .returning({ id: monopolyMatchQueue.id });

    return result.length > 0;
  }

  /**
   * 獲取當前玩家的配對狀態
   */
  async getQueueStatus(visitorId: string): Promise<MatchStatusResponse> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }

    const cleanId = visitorId.trim();
    const record = await this.db
      .select()
      .from(monopolyMatchQueue)
      .where(eq(monopolyMatchQueue.visitorId, cleanId))
      .limit(1);

    if (record.length === 0) {
      return {
        inQueue: false,
        position: -1,
        waitedSeconds: 0,
        matchedRoomCode: null,
        playerIndex: null,
        gameMode: null,
        maxPlayers: null,
      };
    }

    const player = record[0] as QueueRecord;
    const { position, waitedSeconds } = await this.getQueuePosition(
      cleanId,
      player.gameMode,
      player.maxPlayers,
    );

    // 如果該玩家已配對成功，返回一次性房間碼並清除
    const matchedRoomCode = pendingMatches.get(cleanId);
    if (matchedRoomCode) {
      pendingMatches.delete(cleanId);
      return {
        inQueue: false,
        position: -1,
        waitedSeconds,
        matchedRoomCode,
        playerIndex: null,
        gameMode: player.gameMode,
        maxPlayers: player.maxPlayers,
      };
    }

    return {
      inQueue: true,
      position,
      waitedSeconds,
      matchedRoomCode: null,
      playerIndex: null,
      gameMode: player.gameMode,
      maxPlayers: player.maxPlayers,
    };
  }

  /**
   * 清理超時的配對請求
   */
  async cleanupExpired(timeoutSeconds: number): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutSeconds * 1000);
    const result = await this.db
      .delete(monopolyMatchQueue)
      .where(lt(monopolyMatchQueue.joinedAt, cutoff))
      .returning({ id: monopolyMatchQueue.id });

    return result.length;
  }

  /**
   * 獲取玩家在同模式同人數佇列中的位置（從0開始）
   */
  private async getQueuePosition(
    visitorId: string,
    gameMode: string,
    maxPlayers: number,
  ): Promise<{ position: number; waitedSeconds: number }> {
    const records = await this.db
      .select({ visitorId: monopolyMatchQueue.visitorId, joinedAt: monopolyMatchQueue.joinedAt })
      .from(monopolyMatchQueue)
      .where(
        and(
          eq(monopolyMatchQueue.gameMode, gameMode),
          eq(monopolyMatchQueue.maxPlayers, maxPlayers),
        ),
      )
      .orderBy(asc(monopolyMatchQueue.joinedAt));

    let position = -1;
    let waitedSeconds = 0;
    const now = Date.now();

    for (let i = 0; i < records.length; i++) {
      if (records[i].visitorId === visitorId) {
        position = i;
        const joinedAt = records[i].joinedAt as Date;
        waitedSeconds = Math.floor((now - joinedAt.getTime()) / 1000);
        break;
      }
    }

    return { position, waitedSeconds };
  }

  /**
   * 查詢所有佇列統計（用於監控）
   */
  async getQueueStats(): Promise<Array<{ gameMode: string; maxPlayers: number; count: number }>> {
    const result = await this.db
      .select({
        gameMode: monopolyMatchQueue.gameMode,
        maxPlayers: monopolyMatchQueue.maxPlayers,
        count: sql<number>`count(*)`,
      })
      .from(monopolyMatchQueue)
      .groupBy(monopolyMatchQueue.gameMode, monopolyMatchQueue.maxPlayers);

    return result.map((row) => ({
      gameMode: row.gameMode,
      maxPlayers: row.maxPlayers,
      count: Number(row.count),
    }));
  }
}
