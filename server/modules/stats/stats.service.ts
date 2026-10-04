import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { desc, eq, and, sql } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';

import { monopolyGameRecord } from '@server/database/schema';
import { ReportGameDto } from './dto/report-game.dto';

const MAX_RECENT_LIMIT = 50;
const DEFAULT_RECENT_LIMIT = 20;
const SEASON_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface GameRecordItem {
  id: string;
  season: string;
  isWin: boolean;
  myRank: number;
  totalTurns: number;
  myAssets: number;
  opponentIds: string[];
  createdAt: string;
}

export interface PlayerStatsSummary {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // 0-1，保留三位小數
  avgTurns: number;
  bestAssets: number;
  season: string;
  seasonGames: number;
  seasonWins: number;
}

function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

@Injectable()
export class StatsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  // ====== 回報一場完賽結果 ======

  async reportGame(dto: ReportGameDto): Promise<{ record: GameRecordItem }> {
    const visitorId = dto.visitorId.trim();
    const winnerId = dto.winnerVisitorId.trim();

    const season = dto.season && SEASON_PATTERN.test(dto.season)
      ? dto.season
      : getCurrentSeason();

    // 對手名單清洗：去空白、去重、剔除自己與空字串，並限制長度
    const opponentIds = Array.from(
      new Set(
        (dto.opponentIds ?? [])
          .map((id) => String(id).trim())
          .filter((id) => id.length > 0 && id !== visitorId && id.length <= 64),
      ),
    ).slice(0, 8);

    const inserted = await this.db
      .insert(monopolyGameRecord)
      .values({
        visitorId,
        season,
        opponentIds,
        winnerVisitorId: winnerId,
        myRank: dto.myRank,
        totalTurns: dto.totalTurns,
        myAssets: dto.myAssets ?? 0,
      })
      .returning();

    const row = inserted[0];
    return {
      record: this.toItem({
        ...row,
        opponentIds: (row.opponentIds ?? []) as string[],
      }),
    };
  }

  // ====== 個人戰績統計（含本賽季）======

  async getMyStats(visitorId: string, season?: string): Promise<{
    summary: PlayerStatsSummary;
    recent: GameRecordItem[];
  }> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    const cleanId = visitorId.trim();
    const currentSeason = season && SEASON_PATTERN.test(season)
      ? season
      : getCurrentSeason();

    const [totalRow] = await this.db
      .select({
        totalGames: sql<number>`count(*)`,
        wins: sql<number>`count(*) filter (where ${monopolyGameRecord.visitorId} = ${monopolyGameRecord.winnerVisitorId})`,
        avgTurns: sql<number>`coalesce(avg(${monopolyGameRecord.totalTurns}), 0)`,
        bestAssets: sql<number>`coalesce(max(${monopolyGameRecord.myAssets}), 0)`,
      })
      .from(monopolyGameRecord)
      .where(eq(monopolyGameRecord.visitorId, cleanId));

    const [seasonRow] = await this.db
      .select({
        seasonGames: sql<number>`count(*)`,
        seasonWins: sql<number>`count(*) filter (where ${monopolyGameRecord.visitorId} = ${monopolyGameRecord.winnerVisitorId})`,
      })
      .from(monopolyGameRecord)
      .where(
        and(
          eq(monopolyGameRecord.visitorId, cleanId),
          eq(monopolyGameRecord.season, currentSeason),
        ),
      );

    const totalGames = Number(totalRow?.totalGames ?? 0);
    const wins = Number(totalRow?.wins ?? 0);
    const losses = totalGames - wins;
    const winRate = totalGames === 0 ? 0 : Math.round((wins / totalGames) * 1000) / 1000;

    const recentRows = await this.db
      .select()
      .from(monopolyGameRecord)
      .where(eq(monopolyGameRecord.visitorId, cleanId))
      .orderBy(desc(monopolyGameRecord.createdAt))
      .limit(DEFAULT_RECENT_LIMIT);

    return {
      summary: {
        totalGames,
        wins,
        losses,
        winRate,
        avgTurns: Math.round(Number(totalRow?.avgTurns ?? 0)),
        bestAssets: Number(totalRow?.bestAssets ?? 0),
        season: currentSeason,
        seasonGames: Number(seasonRow?.seasonGames ?? 0),
        seasonWins: Number(seasonRow?.seasonWins ?? 0),
      },
      recent: recentRows.map((row) =>
        this.toItem({ ...row, opponentIds: (row.opponentIds ?? []) as string[] }),
      ),
    };
  }

  // ====== 近期戰報列表 ======

  async getRecent(visitorId: string, limit?: number): Promise<{ items: GameRecordItem[] }> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    const cleanId = visitorId.trim();
    const actualLimit = Math.min(
      Number.isFinite(limit) && (limit as number) > 0 ? (limit as number) : DEFAULT_RECENT_LIMIT,
      MAX_RECENT_LIMIT,
    );

    const rows = await this.db
      .select()
      .from(monopolyGameRecord)
      .where(eq(monopolyGameRecord.visitorId, cleanId))
      .orderBy(desc(monopolyGameRecord.createdAt))
      .limit(actualLimit);

    return {
      items: rows.map((row) =>
        this.toItem({ ...row, opponentIds: (row.opponentIds ?? []) as string[] }),
      ),
    };
  }

  // ====== 輔助 ======

  private toItem(row: typeof monopolyGameRecord.$inferSelect): GameRecordItem {
    return {
      id: row.id,
      season: row.season,
      isWin: row.visitorId === row.winnerVisitorId,
      myRank: row.myRank,
      totalTurns: row.totalTurns,
      myAssets: row.myAssets,
      opponentIds: (row.opponentIds as string[]) ?? [],
      createdAt: row.createdAt.toISOString(),
    };
  }
}
