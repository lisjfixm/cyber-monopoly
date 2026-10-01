import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  DailyTask,
  WeeklyTask,
  CheckInDay,
  ActivityEvent,
  LimitedMode,
  TaskStatus,
} from '@shared/api.interface';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

export interface TaskReward {
  coins?: number;
  exp?: number;
  item?: string;
  title?: string;
  skin?: string;
}

export interface ClaimedReward {
  taskId: string;
  taskName: string;
  reward: TaskReward;
  timestamp: number;
}

const lastClaimed: ClaimedReward[] = [];

const DAILY_KEY = 'cyber_monopoly_daily_tasks';
const WEEKLY_KEY = 'cyber_monopoly_weekly_tasks';
const CHECKIN_KEY = 'cyber_monopoly_checkin';

function getDateKey(): string {
  const d = new Date();
  const utcYear = d.getUTCFullYear();
  const utcMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
  const utcDate = String(d.getUTCDate()).padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDate}`;
}

function getYesterdayKey(): string {
  const d = new Date(Date.now() - 86400000);
  const utcYear = d.getUTCFullYear();
  const utcMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
  const utcDate = String(d.getUTCDate()).padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDate}`;
}

function getWeekKey(): string {
  const d = new Date();
  const utcDay = d.getUTCDay() || 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - utcDay + 1));
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const day = String(monday.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAILY_TASK_DEFS = [
  { id: 'daily_play', name: '完成一局', description: '完成任意模式一局對戰', target: 1, reward: { coins: 500, exp: 100 } },
  { id: 'daily_win', name: '贏得一局', description: '在任意模式中獲勝一局', target: 1, reward: { coins: 1000, exp: 200 } },
  { id: 'daily_buy_property', name: '地產大亨', description: '單局購買 3 塊地產', target: 3, reward: { coins: 800, exp: 150 } },
];

const WEEKLY_TASK_DEFS = [
  { id: 'weekly_play_5', name: '勤奮玩家', description: '本週完成 5 局對戰', target: 5, reward: { coins: 3000, exp: 500, item: '幸運卡' } },
  { id: 'weekly_win_3', name: '連勝達人', description: '本週獲勝 3 局', target: 3, reward: { coins: 5000, exp: 800, item: '雙倍骰子' } },
  { id: 'weekly_ranked_10', name: '排位高手', description: '本週完成 10 局排位賽', target: 10, reward: { coins: 8000, exp: 1200, item: '傳說碎片' } },
];

const CHECKIN_REWARDS: Array<{ reward: string; rewardType: 'coins' | 'item' | 'title' | 'skin'; value: number }> = [
  { reward: '200 金幣', rewardType: 'coins', value: 200 },
  { reward: '300 金幣', rewardType: 'coins', value: 300 },
  { reward: '500 金幣', rewardType: 'coins', value: 500 },
  { reward: '幸運卡 x1', rewardType: 'item', value: 1 },
  { reward: '800 金幣', rewardType: 'coins', value: 800 },
  { reward: '雙倍骰子 x1', rewardType: 'item', value: 1 },
  { reward: '稀有稱號「週冠軍」', rewardType: 'title', value: 1 },
];

const ACTIVITIES: ActivityEvent[] = [
  {
    id: 'neon_carnival',
    name: '霓虹狂歡節',
    description: '活動期間過路費 +20%，金幣獎勵翻倍',
    startDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    status: 'ongoing',
    color: 'var(--pink)',
  },
  {
    id: 'double_weekend',
    name: '雙倍週末',
    description: '每週末兩天，排位賽積分雙倍',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    status: 'upcoming',
    color: 'var(--yellow)',
  },
  {
    id: 'cyber_games',
    name: '賽博運動會',
    description: '限時模式開放，專屬皮膚等你拿',
    startDate: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 10),
    status: 'upcoming',
    color: 'var(--cyan)',
  },
];

const LIMITED_MODES: LimitedMode[] = [
  {
    id: 'neon_rain',
    name: '霓虹雨',
    description: '每回合隨機天降金幣，金額 100~2000 不等',
    weekLabel: '本週限時模式',
    modifier: 'gold_rain',
    color: 'var(--cyan)',
    startDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
  },
];

interface TaskStore {
  date: string;
  tasks: Record<string, { progress: number; status: TaskStatus }>;
}

function readDailyStore(): TaskStore {
  const today = getDateKey();
  const raw = safeGetJSON<TaskStore | null>(DAILY_KEY, null);
  if (raw && raw.date === today) return raw;
  const tasks: Record<string, { progress: number; status: TaskStatus }> = {};
  DAILY_TASK_DEFS.forEach((t) => { tasks[t.id] = { progress: 0, status: 'incomplete' }; });
  return { date: today, tasks };
}

function readWeeklyStore(): TaskStore {
  const week = getWeekKey();
  const raw = safeGetJSON<TaskStore | null>(WEEKLY_KEY, null);
  if (raw && raw.date === week) return raw;
  const tasks: Record<string, { progress: number; status: TaskStatus }> = {};
  WEEKLY_TASK_DEFS.forEach((t) => { tasks[t.id] = { progress: 0, status: 'incomplete' }; });
  return { date: week, tasks };
}

interface CheckInStore {
  date: string;
  weekStart: string;
  checkedDays: number[];
  streak: number;
  lastCheckDate: string | null;
}

function readCheckInStore(): CheckInStore {
  const today = getDateKey();
  const weekStart = getWeekKey();
  const raw = safeGetJSON<CheckInStore | null>(CHECKIN_KEY, null);
  if (!raw) {
    return { date: today, weekStart, checkedDays: [], streak: 0, lastCheckDate: null };
  }
  if (raw.weekStart !== weekStart) {
    // 同步更新 date 欄位，避免保留舊週日期造成判斷不一致
    return { ...raw, date: today, weekStart, checkedDays: [] };
  }
  return raw;
}

export function useDailyChallenge() {
  const [dailyStore, setDailyStore] = useState<TaskStore>(() => readDailyStore());
  const [weeklyStore, setWeeklyStore] = useState<TaskStore>(() => readWeeklyStore());
  const [checkInStore, setCheckInStore] = useState<CheckInStore>(() => readCheckInStore());

  const today = getDateKey();

  useEffect(() => {
    const fresh = readDailyStore();
    if (fresh.date !== dailyStore.date) setDailyStore(fresh);
    const freshWeekly = readWeeklyStore();
    if (freshWeekly.date !== weeklyStore.date) setWeeklyStore(freshWeekly);
    const freshCheckin = readCheckInStore();
    if (freshCheckin.weekStart !== checkInStore.weekStart) setCheckInStore(freshCheckin);
  }, [dailyStore.date, weeklyStore.date, checkInStore.weekStart]);

  const dailyTasks = useMemo<DailyTask[]>(() => {
    return DAILY_TASK_DEFS.map((def) => {
      const s = dailyStore.tasks[def.id] || { progress: 0, status: 'incomplete' as TaskStatus };
      return { ...def, progress: s.progress, status: s.status };
    });
  }, [dailyStore]);

  const weeklyTasks = useMemo<WeeklyTask[]>(() => {
    return WEEKLY_TASK_DEFS.map((def) => {
      const s = weeklyStore.tasks[def.id] || { progress: 0, status: 'incomplete' as TaskStatus };
      return { ...def, progress: s.progress, status: s.status };
    });
  }, [weeklyStore]);

  const checkInDays = useMemo<CheckInDay[]>(() => {
    const days: CheckInDay[] = [];
    const d = new Date();
    const day = d.getUTCDay() || 7;
    const todayWeekday = day;
    for (let i = 1; i <= 7; i += 1) {
      const reward = CHECKIN_REWARDS[i - 1];
      if (!reward) continue;
      days.push({
        day: i,
        reward: reward.reward,
        rewardType: reward.rewardType,
        value: reward.value,
        checked: checkInStore.checkedDays.includes(i),
        isToday: i === todayWeekday,
        canRetro: i < todayWeekday && !checkInStore.checkedDays.includes(i),
      });
    }
    return days;
  }, [checkInStore.checkedDays]);

  const claimTask = useCallback((taskId: string, isDaily: boolean): boolean => {
    const defs = isDaily ? DAILY_TASK_DEFS : WEEKLY_TASK_DEFS;
    const def = defs.find((d) => d.id === taskId);
    if (!def) return false;

    let claimed = false;
    const reward = def.reward as TaskReward;

    try {
      if (isDaily) {
        setDailyStore((prev) => {
          const t = prev.tasks[taskId];
          if (!t || t.status !== 'completed') return prev;
          claimed = true;
          return {
            ...prev,
            tasks: { ...prev.tasks, [taskId]: { ...t, status: 'claimed' as TaskStatus } },
          };
        });
        if (claimed) {
          const store = safeGetJSON<TaskStore | null>(DAILY_KEY, null);
          if (store && store.tasks[taskId]) {
            safeSetJSON(DAILY_KEY, {
              ...store,
              tasks: { ...store.tasks, [taskId]: { ...store.tasks[taskId], status: 'claimed' as TaskStatus } },
            });
          }
        }
      } else {
        setWeeklyStore((prev) => {
          const t = prev.tasks[taskId];
          if (!t || t.status !== 'completed') return prev;
          claimed = true;
          return {
            ...prev,
            tasks: { ...prev.tasks, [taskId]: { ...t, status: 'claimed' as TaskStatus } },
          };
        });
        if (claimed) {
          const store = safeGetJSON<TaskStore | null>(WEEKLY_KEY, null);
          if (store && store.tasks[taskId]) {
            safeSetJSON(WEEKLY_KEY, {
              ...store,
              tasks: { ...store.tasks, [taskId]: { ...store.tasks[taskId], status: 'claimed' as TaskStatus } },
            });
          }
        }
      }
    } catch (err) {
      logger.error('[DailyChallenge] 領取獎勵失敗', taskId, err);
      return false;
    }

    if (claimed) {
      const entry: ClaimedReward = {
        taskId,
        taskName: def.name,
        reward,
        timestamp: Date.now(),
      };
      lastClaimed.unshift(entry);
      if (lastClaimed.length > 10) lastClaimed.length = 10;

      if (reward.coins) logger.info(`[Task] 領取金幣獎勵 +${reward.coins}`, { taskId });
      if (reward.exp) logger.info(`[Task] 領取經驗獎勵 +${reward.exp}`, { taskId });
      if (reward.item) logger.info(`[Task] 領取道具獎勵 ${reward.item}`, { taskId });
    }

    return claimed;
  }, []);

  const incrementDailyTask = useCallback((taskId: string, amount = 1) => {
    try {
      setDailyStore((prev) => {
        const t = prev.tasks[taskId];
        if (!t || t.status !== 'incomplete') return prev;
        const def = DAILY_TASK_DEFS.find((d) => d.id === taskId);
        if (!def) return prev;
        const newProgress = Math.min(t.progress + amount, def.target);
        const status: TaskStatus = newProgress >= def.target ? 'completed' : 'incomplete';
        return { ...prev, tasks: { ...prev.tasks, [taskId]: { progress: newProgress, status } } };
      });
      const store = safeGetJSON<TaskStore | null>(DAILY_KEY, null);
      if (store && store.tasks[taskId] && store.tasks[taskId].status === 'incomplete') {
        const def = DAILY_TASK_DEFS.find((d) => d.id === taskId);
        if (def) {
          const t = store.tasks[taskId];
          const newProgress = Math.min(t.progress + amount, def.target);
          const status: TaskStatus = newProgress >= def.target ? 'completed' : 'incomplete';
          safeSetJSON(DAILY_KEY, {
            ...store,
            tasks: { ...store.tasks, [taskId]: { progress: newProgress, status } },
          });
        }
      }
    } catch (err) {
      logger.warn('[DailyChallenge] 更新每日任務進度失敗', taskId, err);
    }
  }, []);

  const incrementWeeklyTask = useCallback((taskId: string, amount = 1) => {
    try {
      setWeeklyStore((prev) => {
        const t = prev.tasks[taskId];
        if (!t || t.status !== 'incomplete') return prev;
        const def = WEEKLY_TASK_DEFS.find((d) => d.id === taskId);
        if (!def) return prev;
        const newProgress = Math.min(t.progress + amount, def.target);
        const status: TaskStatus = newProgress >= def.target ? 'completed' : 'incomplete';
        return { ...prev, tasks: { ...prev.tasks, [taskId]: { progress: newProgress, status } } };
      });
      const store = safeGetJSON<TaskStore | null>(WEEKLY_KEY, null);
      if (store && store.tasks[taskId] && store.tasks[taskId].status === 'incomplete') {
        const def = WEEKLY_TASK_DEFS.find((d) => d.id === taskId);
        if (def) {
          const t = store.tasks[taskId];
          const newProgress = Math.min(t.progress + amount, def.target);
          const status: TaskStatus = newProgress >= def.target ? 'completed' : 'incomplete';
          safeSetJSON(WEEKLY_KEY, {
            ...store,
            tasks: { ...store.tasks, [taskId]: { progress: newProgress, status } },
          });
        }
      }
    } catch (err) {
      logger.warn('[DailyChallenge] 更新每週任務進度失敗', taskId, err);
    }
  }, []);

  const DAILY_TO_WEEKLY_MAP: Record<string, string> = {
    daily_play: 'weekly_play_5',
    daily_win: 'weekly_win_3',
  };

  const incrementTask = useCallback((taskId: string, amount = 1) => {
    if (taskId.startsWith('weekly_')) {
      incrementWeeklyTask(taskId, amount);
    } else {
      incrementDailyTask(taskId, amount);
      const weeklyId = DAILY_TO_WEEKLY_MAP[taskId];
      if (weeklyId) {
        incrementWeeklyTask(weeklyId, amount);
      }
    }
  }, [incrementDailyTask, incrementWeeklyTask]);

  const performCheckIn = useCallback((): { success: boolean; reward?: typeof CHECKIN_REWARDS[number] } => {
    const d = new Date();
    const weekday = d.getUTCDay() || 7;

    let performed = false;
    let reward: typeof CHECKIN_REWARDS[number] | undefined;

    try {
      setCheckInStore((prev) => {
        if (prev.checkedDays.includes(weekday)) return prev;
        const todayStr = getDateKey();
        const yesterdayStr = getYesterdayKey();
        const newStreak = prev.lastCheckDate === yesterdayStr ? prev.streak + 1 : 1;
        const next = {
          ...prev,
          checkedDays: [...prev.checkedDays, weekday].sort((a: number, b: number) => a - b),
          streak: newStreak,
          lastCheckDate: todayStr,
        };
        performed = true;
        reward = CHECKIN_REWARDS[weekday - 1];
        return next;
      });

      if (performed) {
        const store = safeGetJSON<CheckInStore | null>(CHECKIN_KEY, null);
        if (store) {
          safeSetJSON(CHECKIN_KEY, {
            ...store,
            checkedDays: store.checkedDays.includes(weekday)
              ? store.checkedDays
              : [...store.checkedDays, weekday].sort((a: number, b: number) => a - b),
            streak: store.lastCheckDate === getYesterdayKey() ? store.streak + 1 : 1,
            lastCheckDate: getDateKey(),
          });
        }
      }
    } catch (err) {
      logger.error('[DailyChallenge] 簽到失敗', err);
      return { success: false };
    }

    if (performed && reward) {
      logger.info(`[CheckIn] 第${weekday}天簽到獎勵：${reward.reward}`);
      return { success: true, reward };
    }
    return { success: false };
  }, []);

  const performRetroCheckIn = useCallback((day: number): { success: boolean; reward?: typeof CHECKIN_REWARDS[number] } => {
    if (day < 1 || day > 7) return { success: false };
    const d = new Date();
    const todayWeekday = d.getUTCDay() || 7;
    if (day >= todayWeekday) return { success: false };

    let performed = false;
    let reward: typeof CHECKIN_REWARDS[number] | undefined;

    try {
      setCheckInStore((prev) => {
        if (prev.checkedDays.includes(day)) return prev;
        const next = {
          ...prev,
          checkedDays: [...prev.checkedDays, day].sort((a: number, b: number) => a - b),
        };
        performed = true;
        reward = CHECKIN_REWARDS[day - 1];
        return next;
      });

      if (performed) {
        const store = safeGetJSON<CheckInStore | null>(CHECKIN_KEY, null);
        if (store) {
          safeSetJSON(CHECKIN_KEY, {
            ...store,
            checkedDays: store.checkedDays.includes(day)
              ? store.checkedDays
              : [...store.checkedDays, day].sort((a: number, b: number) => a - b),
          });
        }
      }
    } catch (err) {
      logger.error('[DailyChallenge] 補簽失敗', err);
      return { success: false };
    }

    if (performed && reward) {
      logger.info(`[CheckIn] 補簽第${day}天獎勵：${reward.reward}`);
      return { success: true, reward };
    }
    return { success: false };
  }, []);

  const popLastClaimed = useCallback((): ClaimedReward | null => {
    return lastClaimed.shift() ?? null;
  }, []);

  const streakMilestones = useMemo(() => [
    { days: 7, reward: '連續簽到 7 天：1000 金幣', reached: checkInStore.streak >= 7 },
    { days: 14, reward: '連續簽到 14 天：稀有頭像框', reached: checkInStore.streak >= 14 },
    { days: 30, reward: '連續簽到 30 天：史詩皮膚', reached: checkInStore.streak >= 30 },
  ], [checkInStore.streak]);

  return {
    dailyTasks,
    weeklyTasks,
    checkInDays,
    checkInStreak: checkInStore.streak,
    streakMilestones,
    activities: ACTIVITIES,
    limitedModes: LIMITED_MODES,
    today,
    claimTask,
    incrementTask,
    incrementDailyTask,
    incrementWeeklyTask,
    performCheckIn,
    performRetroCheckIn,
    popLastClaimed,
  };
}
