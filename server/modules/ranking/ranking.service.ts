import { Inject, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { eq, desc, sql, count, inArray, and, ne } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import { monopolyPlayer } from '@server/database/schema';
import type {
  PlayerProfile,
  LeaderboardItem,
  LeaderboardType,
  PlayerRankInfo,
} from '@shared/api.interface';

const ELO_K_FACTOR = 32;
const DEFAULT_ELO = 1000;
const MAX_LEADERBOARD_LIMIT = 50;
const DEFAULT_LEADERBOARD_LIMIT = 50;
const MIN_NICKNAME_LENGTH = 1;
const MAX_NICKNAME_LENGTH = 20;

function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 1000) / 1000;
}

function calculateEloChange(
  winnerElo: number,
  loserElo: number,
): { winnerGain: number; loserLoss: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const winnerGain = Math.round(ELO_K_FACTOR * (1 - expectedWinner));
  const loserLoss = Math.round(ELO_K_FACTOR * (0 - expectedLoser));

  return { winnerGain, loserLoss: Math.abs(loserLoss) };
}

function determineTitle(wins: number, elo: number): string {
  if (elo >= 2000 || wins >= 500) return '传奇霸主';
  if (elo >= 1800 || wins >= 200) return '赛博大亨';
  if (elo >= 1600 || wins >= 100) return '地产巨头';
  if (elo >= 1400 || wins >= 50) return '商界精英';
  if (elo >= 1200 || wins >= 20) return '新锐玩家';
  if (wins >= 5) return '初露头角';
  return '新手玩家';
}

type MonopolyPlayerRow = typeof monopolyPlayer.$inferSelect;

function rowToProfile(row: MonopolyPlayerRow): PlayerProfile {
  return {
    visitorId: row.visitorId,
    nickname: row.nickname,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    totalTurns: row.totalTurns,
    highestAssets: row.highestAssets,
    seasonWins: row.seasonWins,
    seasonElo: row.seasonElo,
    currentSeason: row.currentSeason,
    title: row.title,
    winRate: calculateWinRate(row.wins, row.losses),
  };
}

function rowToLeaderboardItem(row: MonopolyPlayerRow, rank: number): LeaderboardItem {
  return {
    visitorId: row.visitorId,
    rank,
    nickname: row.nickname,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    seasonWins: row.seasonWins,
    seasonElo: row.seasonElo,
    winRate: calculateWinRate(row.wins, row.losses),
    title: row.title,
    highestAssets: row.highestAssets,
    rankChange: 0,
    isNew: false,
  };
}

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  // ====== 赛季检查 ======

  private async checkSeasonResetForPlayer(visitorId: string): Promise<void> {
    const currentSeason = getCurrentSeason();
    const player = await this.findPlayerByVisitorId(visitorId);
    if (!player) return;

    if (player.currentSeason !== currentSeason) {
      await this.db
        .update(monopolyPlayer)
        .set({
          seasonWins: 0,
          seasonElo: player.elo,
          currentSeason,
        })
        .where(eq(monopolyPlayer.visitorId, visitorId))
        .execute();
    }
  }

  private async checkSeasonResetBatch(visitorIds: string[]): Promise<void> {
    if (visitorIds.length === 0) return;
    const currentSeason = getCurrentSeason();

    await this.db
      .update(monopolyPlayer)
      .set({
        seasonWins: 0,
        seasonElo: monopolyPlayer.elo,
        currentSeason,
      })
      .where(
        and(
          inArray(monopolyPlayer.visitorId, visitorIds),
          ne(monopolyPlayer.currentSeason, currentSeason),
        ),
      )
      .execute();
  }

  // ====== 玩家查询 ======

  private async findPlayerByVisitorId(
    visitorId: string,
  ): Promise<MonopolyPlayerRow | null> {
    const rows = await this.db
      .select()
      .from(monopolyPlayer)
      .where(eq(monopolyPlayer.visitorId, visitorId))
      .limit(1);
    return rows[0] ?? null;
  }

  // ====== 公开 API ======

  async getOrCreatePlayer(
    visitorId: string,
    nickname?: string,
  ): Promise<{ player: PlayerProfile; isNew: boolean }> {
    if (!visitorId || visitorId.length === 0) {
      throw new BadRequestException('访客ID不能为空');
    }
    if (visitorId.length > 64) {
      throw new BadRequestException('访客ID过长');
    }

    const cleanNickname = nickname?.trim();
    if (cleanNickname !== undefined && cleanNickname !== '') {
      if (cleanNickname.length < MIN_NICKNAME_LENGTH || cleanNickname.length > MAX_NICKNAME_LENGTH) {
        throw new BadRequestException(`昵称长度需在 ${MIN_NICKNAME_LENGTH}-${MAX_NICKNAME_LENGTH} 字符之间`);
      }
    }

    const existing = await this.findPlayerByVisitorId(visitorId);
    if (existing) {
      await this.checkSeasonResetForPlayer(visitorId);

      // 如果传了昵称且不同，更新昵称
      if (cleanNickname && cleanNickname !== existing.nickname) {
        await this.db
          .update(monopolyPlayer)
          .set({ nickname: cleanNickname })
          .where(eq(monopolyPlayer.visitorId, visitorId))
          .execute();
        const updated = await this.findPlayerByVisitorId(visitorId);
        return {
          player: rowToProfile(updated!),
          isNew: false,
        };
      }

      const refreshed = await this.findPlayerByVisitorId(visitorId);
      return {
        player: rowToProfile(refreshed!),
        isNew: false,
      };
    }

    // 创建新玩家
    const currentSeason = getCurrentSeason();
    const finalNickname = cleanNickname || '匿名玩家';
    const title = determineTitle(0, DEFAULT_ELO);

    const inserted = await this.db
      .insert(monopolyPlayer)
      .values({
        visitorId,
        nickname: finalNickname,
        elo: DEFAULT_ELO,
        wins: 0,
        losses: 0,
        totalTurns: 0,
        highestAssets: 0,
        seasonWins: 0,
        seasonElo: DEFAULT_ELO,
        currentSeason,
        title,
      })
      .onConflictDoUpdate({
        target: monopolyPlayer.visitorId,
        set: { nickname: finalNickname },
      })
      .returning();

    return {
      player: rowToProfile(inserted[0]),
      isNew: true,
    };
  }

  async updateNickname(
    visitorId: string,
    nickname: string,
  ): Promise<{ success: boolean; player: PlayerProfile }> {
    const cleanNickname = nickname?.trim();
    if (!cleanNickname) {
      throw new BadRequestException('昵称不能为空');
    }
    if (cleanNickname.length < MIN_NICKNAME_LENGTH || cleanNickname.length > MAX_NICKNAME_LENGTH) {
      throw new BadRequestException(`昵称长度需在 ${MIN_NICKNAME_LENGTH}-${MAX_NICKNAME_LENGTH} 字符之间`);
    }

    await this.checkSeasonResetForPlayer(visitorId);

    const updated = await this.db
      .update(monopolyPlayer)
      .set({ nickname: cleanNickname })
      .where(eq(monopolyPlayer.visitorId, visitorId))
      .returning();

    if (updated.length === 0) {
      throw new BadRequestException('玩家不存在');
    }

    return {
      success: true,
      player: rowToProfile(updated[0]),
    };
  }

  async getPlayer(visitorId: string): Promise<{
    player: PlayerProfile;
    ranks: PlayerRankInfo;
  }> {
    const player = await this.findPlayerByVisitorId(visitorId);
    if (!player) {
      throw new BadRequestException('玩家不存在');
    }

    await this.checkSeasonResetForPlayer(visitorId);
    const refreshed = await this.findPlayerByVisitorId(visitorId);

    const eloRank = await this.getPlayerRank(visitorId, 'elo');
    const winsRank = await this.getPlayerRank(visitorId, 'wins');
    const seasonRank = await this.getPlayerRank(visitorId, 'season');

    return {
      player: rowToProfile(refreshed!),
      ranks: {
        elo: eloRank,
        wins: winsRank,
        season: seasonRank,
      },
    };
  }

  async getLeaderboard(
    type: LeaderboardType,
    limit?: number,
  ): Promise<{ items: LeaderboardItem[]; type: string }> {
    const actualLimit = limit
      ? Math.min(limit, MAX_LEADERBOARD_LIMIT)
      : DEFAULT_LEADERBOARD_LIMIT;

    let orderColumn;
    switch (type) {
      case 'wins':
        orderColumn = desc(monopolyPlayer.wins);
        break;
      case 'season':
        orderColumn = desc(monopolyPlayer.seasonWins);
        break;
      case 'elo':
      default:
        orderColumn = desc(monopolyPlayer.elo);
        break;
    }

    const rows = await this.db
      .select()
      .from(monopolyPlayer)
      .orderBy(orderColumn, desc(monopolyPlayer.elo))
      .limit(actualLimit);

    const items: LeaderboardItem[] = rows.map((row: MonopolyPlayerRow, index: number) =>
      rowToLeaderboardItem(row, index + 1),
    );

    return { items, type };
  }

  async getPlayerRank(visitorId: string, type: LeaderboardType): Promise<number> {
    const player = await this.findPlayerByVisitorId(visitorId);
    if (!player) return 0;

    let aboveCount = 0;

    switch (type) {
      case 'wins': {
        const result = await this.db
          .select({ count: count() })
          .from(monopolyPlayer)
          .where(sql`${monopolyPlayer.wins} > ${player.wins}`);
        aboveCount = Number(result[0]?.count ?? 0);
        break;
      }
      case 'season': {
        const result = await this.db
          .select({ count: count() })
          .from(monopolyPlayer)
          .where(sql`${monopolyPlayer.seasonWins} > ${player.seasonWins}`);
        aboveCount = Number(result[0]?.count ?? 0);
        break;
      }
      case 'elo':
      default: {
        const result = await this.db
          .select({ count: count() })
          .from(monopolyPlayer)
          .where(sql`${monopolyPlayer.elo} > ${player.elo}`);
        aboveCount = Number(result[0]?.count ?? 0);
        break;
      }
    }
    return aboveCount + 1;
  }

  // ====== 游戏结果记录 ======

  async recordGameResult(
    visitorIds: string[],
    winnerVisitorId: string,
    totalTurns: number,
    highestAssetsPerPlayer: Record<string, number>,
  ): Promise<void> {
    if (visitorIds.length < 2) {
      this.logger.warn('recordGameResult called with less than 2 players');
      return;
    }
    if (!visitorIds.includes(winnerVisitorId)) {
      this.logger.warn('Winner not in visitorIds list');
      return;
    }

    // 先做赛季重置
    await this.checkSeasonResetBatch(visitorIds);

    // 批量获取所有玩家
    const players = await this.db
      .select()
      .from(monopolyPlayer)
      .where(inArray(monopolyPlayer.visitorId, visitorIds));

    if (players.length === 0) {
      this.logger.warn('No players found for game result recording');
      return;
    }

    const playerMap = new Map<string, MonopolyPlayerRow>();
    for (const p of players) {
      playerMap.set(p.visitorId, p);
    }

    const winner = playerMap.get(winnerVisitorId);
    if (!winner) {
      this.logger.warn('Winner player not found in database');
      return;
    }

    // 计算 ELO 变化
    // 简化处理：每个输家各与胜者比较一次
    let totalWinnerEloGain = 0;
    const loserEloLosses = new Map<string, number>();

    for (const vid of visitorIds) {
      if (vid === winnerVisitorId) continue;
      const loser = playerMap.get(vid);
      if (!loser) continue;

      const { winnerGain, loserLoss } = calculateEloChange(winner.elo + totalWinnerEloGain, loser.elo);
      totalWinnerEloGain += winnerGain;
      loserEloLosses.set(vid, loserLoss);
    }

    // 更新胜者
    const winnerHighestAssets = highestAssetsPerPlayer[winnerVisitorId] ?? 0;
    const winnerNewHighest = Math.max(winner.highestAssets, winnerHighestAssets);
    const winnerNewElo = winner.elo + totalWinnerEloGain;
    const winnerTitle = determineTitle(winner.wins + 1, winnerNewElo);

    await this.db
      .update(monopolyPlayer)
      .set({
        wins: winner.wins + 1,
        totalTurns: winner.totalTurns + totalTurns,
        highestAssets: winnerNewHighest,
        elo: winnerNewElo,
        seasonWins: winner.seasonWins + 1,
        seasonElo: winner.seasonElo + totalWinnerEloGain,
        title: winnerTitle,
      })
      .where(eq(monopolyPlayer.visitorId, winnerVisitorId))
      .execute();

    // 更新败者
    for (const vid of visitorIds) {
      if (vid === winnerVisitorId) continue;
      const loser = playerMap.get(vid);
      if (!loser) continue;

      const eloLoss = loserEloLosses.get(vid) ?? 0;
      const loserNewElo = Math.max(100, loser.elo - eloLoss);
      const loserHighest = highestAssetsPerPlayer[vid] ?? 0;
      const loserNewHighest = Math.max(loser.highestAssets, loserHighest);
      const loserTitle = determineTitle(loser.wins, loserNewElo);

      await this.db
        .update(monopolyPlayer)
        .set({
          losses: loser.losses + 1,
          totalTurns: loser.totalTurns + totalTurns,
          highestAssets: loserNewHighest,
          elo: loserNewElo,
          seasonElo: Math.max(100, loser.seasonElo - eloLoss),
          title: loserTitle,
        })
        .where(eq(monopolyPlayer.visitorId, vid))
        .execute();
    }

    this.logger.log(
      `Game result recorded: winner=${winnerVisitorId} +${totalWinnerEloGain} ELO, ` +
      `${visitorIds.length - 1} losers`,
    );
  }
}
