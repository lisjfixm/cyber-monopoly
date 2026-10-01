import { useState, useEffect, useCallback } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { checkinApi } from '@client/src/api/checkin';
import { getToken } from '@client/src/api/account';
import type {
  CheckinStatusResponse,
  CheckinWeeklyReward,
} from '@shared/api.interface';

const STORAGE_KEY = 'cyber_monopoly_checkin';
const COINS_KEY = 'cyber_monopoly_coins';

export interface WeeklyReward {
  day: number;
  coins: number;
  isGrandPrize?: boolean;
  bonus?: string;
  bonusName?: string;
}

export const WEEKLY_REWARDS: WeeklyReward[] = [
  { day: 1, coins: 100 },
  { day: 2, coins: 200 },
  { day: 3, coins: 300 },
  { day: 4, coins: 400 },
  { day: 5, coins: 500 },
  { day: 6, coins: 600 },
  { day: 7, coins: 2000, isGrandPrize: true, bonus: 'coin', bonusName: '稀有頭像框' },
];

interface CheckinData {
  lastCheckinDate: string;
  streak: number;
  totalDays: number;
  history: string[];
}

const DEFAULT_DATA: CheckinData = {
  lastCheckinDate: '',
  streak: 0,
  totalDays: 0,
  history: [],
};

function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.getFullYear();
  const m = String(yesterday.getMonth() + 1).padStart(2, '0');
  const d = String(yesterday.getDate()).padStart(2, '0');
  return dateStr === `${y}-${m}-${d}`;
}

function readCheckinData(): CheckinData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<CheckinData>;
    return {
      lastCheckinDate: parsed.lastCheckinDate ?? '',
      streak: parsed.streak ?? 0,
      totalDays: parsed.totalDays ?? 0,
      history: parsed.history ?? [],
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function writeCheckinData(data: CheckinData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getCoins(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(COINS_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function addCoins(amount: number): number {
  if (typeof window === 'undefined') return 0;
  const current = getCoins();
  const next = Math.max(0, current + amount);
  try {
    localStorage.setItem(COINS_KEY, String(next));
  } catch {
    // ignore
  }
  return next;
}

interface CheckinResult {
  reward: WeeklyReward;
  isGrandPrize: boolean;
  streak: number;
  streakDay: number;
  newCoins: number;
}

export function useDailyCheckin() {
  const [data, setData] = useState<CheckinData>(() => readCheckinData());
  const [coins, setCoinsState] = useState<number>(() => getCoins());
  const [serverStatus, setServerStatus] = useState<CheckinStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const today = getTodayStr();
  const canCheckin = isLoggedIn
    ? serverStatus?.canCheckin ?? true
    : data.lastCheckinDate !== today;

  useEffect(() => {
    const token = getToken();
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      setIsLoading(true);
      checkinApi.getStatus()
        .then((status: CheckinStatusResponse) => {
          setServerStatus(status);
          setCoinsState(status.coins);
        })
        .catch((err: unknown) => {
          logger.error('[CheckIn] 取得簽到狀態失敗', { error: err });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      writeCheckinData(data);
    }
  }, [data, isLoggedIn]);

  const checkin = useCallback((): CheckinResult => {
    const todayStr = getTodayStr();

    // 今天已簽到：直接返回目前狀態，不重複發放獎勵
    if (data.lastCheckinDate === todayStr) {
      const streakDay = ((data.streak - 1) % 7) + 1;
      const reward = WEEKLY_REWARDS[streakDay - 1];
      return {
        reward,
        isGrandPrize: reward.isGrandPrize ?? false,
        streak: data.streak,
        streakDay,
        newCoins: getCoins(),
      };
    }

    if (isLoggedIn && serverStatus) {
      logger.warn('[CheckIn] 登入狀態下不應呼叫本機 checkin，請使用 performServerCheckin');
    }

    const newStreak = isYesterday(data.lastCheckinDate) ? data.streak + 1 : 1;
    const newTotal = data.totalDays + 1;
    const newHistory = [...data.history, todayStr];
    const next: CheckinData = {
      lastCheckinDate: todayStr,
      streak: newStreak,
      totalDays: newTotal,
      history: newHistory,
    };
    setData(next);

    const streakDay = ((newStreak - 1) % 7) + 1;
    const reward = WEEKLY_REWARDS[streakDay - 1];
    const isGrandPrizeDay = reward.isGrandPrize ?? false;

    const newCoins = addCoins(reward.coins);
    setCoinsState(newCoins);

    return {
      reward,
      isGrandPrize: isGrandPrizeDay,
      streak: newStreak,
      streakDay,
      newCoins,
    };
  }, [data, isLoggedIn, serverStatus]);

  const performServerCheckin = useCallback(async (): Promise<CheckinResult> => {
    const result = await checkinApi.performCheckin();
    setServerStatus((prev: CheckinStatusResponse | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        canCheckin: false,
        streak: result.streak,
        totalDays: result.totalDays,
        currentDay: result.streakDay,
        coins: result.newCoins,
        lastCheckinDate: getTodayStr(),
      };
    });
    setCoinsState(result.newCoins);
    return {
      reward: result.reward as CheckinWeeklyReward as WeeklyReward,
      isGrandPrize: result.isGrandPrize,
      streak: result.streak,
      streakDay: result.streakDay,
      newCoins: result.newCoins,
    };
  }, []);

  const currentDay = isLoggedIn
    ? serverStatus?.currentDay ?? 1
    : canCheckin
      ? (isYesterday(data.lastCheckinDate) ? (data.streak % 7) + 1 : 1)
      : ((data.streak - 1) % 7) + 1;

  const streak = isLoggedIn ? serverStatus?.streak ?? data.streak : data.streak;
  const totalDays = isLoggedIn ? serverStatus?.totalDays ?? data.totalDays : data.totalDays;

  return {
    canCheckin,
    streak,
    totalDays,
    currentDay,
    coins,
    weeklyRewards: WEEKLY_REWARDS,
    checkin,
    performServerCheckin,
    isLoggedIn,
    isLoading,
  };
}
