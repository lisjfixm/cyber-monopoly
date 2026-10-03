import type { DailyChallenge, DailyChallengeType } from '@shared/api.interface';
import { DAILY_CHALLENGES } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from './safeStorage';

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

export function getTodaysChallenge(): DailyChallenge | null {
  if (!Array.isArray(DAILY_CHALLENGES) || DAILY_CHALLENGES.length === 0) return null;
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const index = ((dayOfYear % DAILY_CHALLENGES.length) + DAILY_CHALLENGES.length) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index] ?? DAILY_CHALLENGES[0];
}

export interface DailyProgress {
  completed: boolean;
  score: number;
  date: string;
}

export function getDailyProgress(): DailyProgress {
  const todayStr = getDateString(new Date());
  try {
    const fallback: DailyProgress = { completed: false, score: 0, date: todayStr };
    const progress = safeGetJSON<DailyProgress>(STORAGE_KEY, fallback);
    if (!progress || typeof progress !== 'object') return fallback;
    // 日期不同則重置
    if (progress.date !== todayStr) {
      const newProgress: DailyProgress = { completed: false, score: 0, date: todayStr };
      saveDailyProgress(false, 0);
      return newProgress;
    }
    return {
      completed: progress.completed === true,
      score: typeof progress.score === 'number' && !Number.isNaN(progress.score) ? progress.score : 0,
      date: typeof progress.date === 'string' ? progress.date : todayStr,
    };
  } catch {
    return { completed: false, score: 0, date: todayStr };
  }
}

export function saveDailyProgress(completed: boolean, score: number): void {
  const todayStr = getDateString(new Date());
  const progress: DailyProgress = {
    completed: completed === true,
    score: Number.isFinite(score) ? score : 0,
    date: todayStr,
  };
  safeSetJSON(STORAGE_KEY, progress);
}

export function getAllChallenges(): DailyChallenge[] {
  return Array.isArray(DAILY_CHALLENGES) ? DAILY_CHALLENGES : [];
}

export function getChallengeById(id: string): DailyChallenge | undefined {
  return DAILY_CHALLENGES.find((c: DailyChallenge) => c.id === id);
}

export function getChallengeByType(type: DailyChallengeType): DailyChallenge | undefined {
  return DAILY_CHALLENGES.find((c: DailyChallenge) => c.type === type);
}
