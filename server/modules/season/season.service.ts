import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { monopolySeasonScore, monopolyAccount } from '../../database/schema';
import type { ReportSeasonScoreDto } from './dto';

export interface SeasonRankingEntry {
  accountId: string;
  nickname: string;
  score: number;
  gamesPlayed: number;
  wins: number;
  rank: number;
}

@Injectable()
export class SeasonService {
  private readonly logger = new Logger(SeasonService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async reportScore(accountId: string, dto: ReportSeasonScoreDto): Promise<{ success: boolean; score: number }> {
    if (dto.wins > dto.gamesPlayed) {
      throw new BadRequestException('勝場數不能大於對局數');
    }

    // Upsert：同 season + account 取最高分
    const existing = await this.db
      .select()
      .from(monopolySeasonScore)
      .where(and(
        eq(monopolySeasonScore.seasonId, dto.seasonId),
        eq(monopolySeasonScore.accountId, accountId),
      ))
      .limit(1);

    if (existing.length > 0) {
      const prev = existing[0];
      if (dto.score <= prev.score) {
        return { success: true, score: prev.score };
      }
      await this.db
        .update(monopolySeasonScore)
        .set({
          score: dto.score,
          gamesPlayed: dto.gamesPlayed,
          wins: dto.wins,
        })
        .where(eq(monopolySeasonScore.id, prev.id))
        .execute();
      return { success: true, score: dto.score };
    }

    await this.db
      .insert(monopolySeasonScore)
      .values({
        seasonId: dto.seasonId,
        accountId,
        score: dto.score,
        gamesPlayed: dto.gamesPlayed,
        wins: dto.wins,
      })
      .execute();

    return { success: true, score: dto.score };
  }

  async getRanking(seasonId: string, limit = 50): Promise<SeasonRankingEntry[]> {
    const clamped = Math.min(Math.max(1, limit), 100);
    const rows = await this.db
      .select({
        accountId: monopolySeasonScore.accountId,
        nickname: monopolyAccount.nickname,
        score: monopolySeasonScore.score,
        gamesPlayed: monopolySeasonScore.gamesPlayed,
        wins: monopolySeasonScore.wins,
      })
      .from(monopolySeasonScore)
      .leftJoin(monopolyAccount, eq(monopolySeasonScore.accountId, monopolyAccount.id))
      .where(eq(monopolySeasonScore.seasonId, seasonId))
      .orderBy(desc(monopolySeasonScore.score))
      .limit(clamped);

    return rows.map((r: any, i: number) => ({
      accountId: r.accountId,
      nickname: r.nickname ?? '未知',
      score: Number(r.score ?? 0),
      gamesPlayed: Number(r.gamesPlayed ?? 0),
      wins: Number(r.wins ?? 0),
      rank: i + 1,
    }));
  }

  async getMyRank(accountId: string, seasonId: string): Promise<{ rank: number; score: number }> {
    const rows = await this.db
      .select({
        rank: sql<number>`(
          SELECT COUNT(*) + 1 FROM monopoly_season_score s2
          WHERE s2.season_id = ${seasonId} AND s2.score > monopoly_season_score.score
        )`,
        score: monopolySeasonScore.score,
      })
      .from(monopolySeasonScore)
      .where(and(
        eq(monopolySeasonScore.seasonId, seasonId),
        eq(monopolySeasonScore.accountId, accountId),
      ))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('本賽季尚無排名記錄');
    }
    return { rank: Number(rows[0].rank), score: Number(rows[0].score ?? 0) };
  }
}
