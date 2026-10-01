import type { DailyChallenge, DailyChallengeType } from '@shared/api.interface';
import { DAILY_CHALLENGES } from '@shared/game-config';

const STORAGE_KEY = 'cyber_monopoly_daily_challenge';

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodaysChallenge(): DailyChallenge {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const index = dayOfYear % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

export interface DailyProgress {
  completed: boolean;
  score: number;
  date: string;
}

export function getDailyProgress(): DailyProgress {
  const todayStr = getDateString(new Date());
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { completed: false, score: 0, date: todayStr };
    }
    const progress = JSON.parse(raw) as DailyProgress;
    // 日期不同則重置
    if (progress.date !== todayStr) {
      const newProgress: DailyProgress = { completed: false, score: 0, date: todayStr };
      saveDailyProgress(false, 0);
      return newProgress;
    }
    return progress;
  } catch {
    return { completed: false, score: 0, date: todayStr };
  }
}

export function saveDailyProgress(completed: boolean, score: number): void {
  try {
    const todayStr = getDateString(new Date());
    const progress: DailyProgress = {
      completed,
      score,
      date: todayStr,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 存儲失敗時静默處理
  }
}

export function getAllChallenges(): DailyChallenge[] {
  return DAILY_CHALLENGES;
}

export function getChallengeById(id: string): DailyChallenge | undefined {
  return DAILY_CHALLENGES.find((c: DailyChallenge) => c.id === id);
}

export function getChallengeByType(type: DailyChallengeType): DailyChallenge | undefined {
  return DAILY_CHALLENGES.find((c: DailyChallenge) => c.type === type);
}
