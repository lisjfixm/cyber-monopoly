import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
  monopolyCheckin,
  monopolyAccountTable,
} from '@server/database/schema';
import type {
  CheckinStatusResponse,
  CheckinPerformResponse,
  CheckinWeeklyReward,
} from '@shared/api.interface';

const WEEKLY_REWARDS: CheckinWeeklyReward[] = [
  { day: 1, coins: 100 },
  { day: 2, coins: 200 },
  { day: 3, coins: 300 },
  { day: 4, coins: 400 },
  { day: 5, coins: 500 },
  { day: 6, coins: 600 },
  { day: 7, coins: 2000, isGrandPrize: true, bonus: 'coin', bonusName: '稀有頭像框' },
];

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getStatus(accountId: string): Promise<CheckinStatusResponse> {
    const [account] = await this.db
      .select({ coins: monopolyAccountTable.coins })
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.id, accountId))
      .limit(1);

    if (!account) {
      throw new BadRequestException('账号不存在');
    }

    const recent = await this.db
      .select({
        checkinDate: monopolyCheckin.checkinDate,
        streakDays: monopolyCheckin.streakDays,
      })
      .from(monopolyCheckin)
      .where(eq(monopolyCheckin.accountId, accountId))
      .orderBy(desc(monopolyCheckin.checkinDate))
      .limit(2);

    const todayStr = this.getTodayStr();
    const latest = recent[0];
    const yesterdayStr = this.getYesterdayStr();

    const lastCheckinDate = latest ? String(latest.checkinDate) : '';
    const canCheckin = lastCheckinDate !== todayStr;

    let streak: number;
    if (!latest) {
      streak = 0;
    } else if (lastCheckinDate === todayStr) {
      streak = latest.streakDays;
    } else if (lastCheckinDate === yesterdayStr) {
      streak = latest.streakDays;
    } else {
      streak = 0;
    }

    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(monopolyCheckin)
      .where(eq(monopolyCheckin.accountId, accountId));
    const totalDays = Number(totalResult[0]?.count ?? 0);

    let currentDay: number;
    if (canCheckin) {
      if (lastCheckinDate === yesterdayStr) {
        currentDay = ((streak) % 7) + 1;
      } else {
        currentDay = 1;
      }
    } else {
      currentDay = ((streak - 1) % 7) + 1;
    }

    return {
      canCheckin,
      streak,
      totalDays,
      currentDay,
      coins: account.coins,
      lastCheckinDate,
      weeklyRewards: WEEKLY_REWARDS,
    };
  }

  async performCheckin(accountId: string): Promise<CheckinPerformResponse> {
    const status = await this.getStatus(accountId);

    if (!status.canCheckin) {
      const streakDay = ((status.streak - 1) % 7) + 1;
      const reward = WEEKLY_REWARDS[streakDay - 1];
      return {
        success: false,
        alreadyChecked: true,
        reward,
        isGrandPrize: reward.isGrandPrize ?? false,
        streak: status.streak,
        streakDay,
        totalDays: status.totalDays,
        coins: status.coins,
        newCoins: status.coins,
      };
    }

    const yesterdayStr = this.getYesterdayStr();
    const lastWasYesterday = status.lastCheckinDate === yesterdayStr;
    const newStreak = lastWasYesterday ? status.streak + 1 : 1;
    const newTotal = status.totalDays + 1;
    const streakDay = ((newStreak - 1) % 7) + 1;
    const reward = WEEKLY_REWARDS[streakDay - 1];
    const isGrandPrize = reward.isGrandPrize ?? false;

    const todayStr = this.getTodayStr();

    const newCoins = status.coins + reward.coins;

    try {
      await this.db.transaction(async (tx) => {
        await tx.insert(monopolyCheckin).values({
          accountId,
          checkinDate: todayStr,
          streakDays: newStreak,
          totalDays: newTotal,
          rewardCoins: reward.coins,
        });

        await tx
          .update(monopolyAccountTable)
          .set({ coins: newCoins })
          .where(eq(monopolyAccountTable.id, accountId));
      });
    } catch (err) {
      // 並發重複簽入時，唯一索引 (account_id, checkin_date) 會拋 23505；
      // 此時回傳「今日已簽到」語義，而不是 500。
      if (this.isUniqueViolation(err)) {
        this.logger.warn(`重複簽入被唯一索引阻擋: account=${accountId}`);
        const refreshed = await this.getStatus(accountId);
        const streakDayNow = ((refreshed.streak - 1) % 7) + 1;
        const rewardNow = WEEKLY_REWARDS[streakDayNow - 1];
        return {
          success: false,
          alreadyChecked: true,
          reward: rewardNow,
          isGrandPrize: rewardNow.isGrandPrize ?? false,
          streak: refreshed.streak,
          streakDay: streakDayNow,
          totalDays: refreshed.totalDays,
          coins: refreshed.coins,
          newCoins: refreshed.coins,
        };
      }
      throw err;
    }

    return {
      success: true,
      alreadyChecked: false,
      reward,
      isGrandPrize,
      streak: newStreak,
      streakDay,
      totalDays: newTotal,
      coins: status.coins,
      newCoins,
    };
  }

  // 遞迴剝離 drizzle/postgres 的錯誤包裝，取出 Postgres 原生 code
  private isUniqueViolation(error: unknown): boolean {
    let current: unknown = error;
    for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
      const { code, cause } = current as { code?: unknown; cause?: unknown };
      if (code === '23505') return true;
      current = cause;
    }
    return false;
  }

  private getTodayStr(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getYesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private dateToString(d: string): string {
    return d;
  }
}
