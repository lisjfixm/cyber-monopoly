import { safeGetJSON, safeSetJSON } from './safeStorage';

/**
 * 帳號 XP / 玩家等級（局外元系統，v4.0.0 新增）
 * 純前端閉環：經驗值累計於 localStorage，與對局勝負、任務、每日簽到等局外行為掛鉤。
 * 不依賴後端 API，離線亦可累積。
 */

const STORAGE_KEY = 'cyber_monopoly_account_xp';
const SCHEMA_VERSION = 1;

interface XpStore {
  version: number;
  totalXp: number;
}

/** 從等級 L 升到 L+1 所需經驗（等級越高越難） */
export function xpPerLevel(level: number): number {
  const lvl = Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  return 200 * lvl;
}

/** 達到第 level 級所需的累計經驗（級別從 1 開始，1 級需 0） */
export function cumulativeXpForLevel(level: number): number {
  const lvl = Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  // sum_{k=1}^{lvl-1} 200*k = 100 * lvl*(lvl-1)
  return 100 * lvl * (lvl - 1);
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  /** 目前等級內已累積經驗 */
  currentLevelXp: number;
  /** 升下一級所需經驗 */
  xpToNextLevel: number;
  /** 0~1，目前等級升級進度 */
  progress: number;
  tierName: string;
  tierColor: string;
}

export function tierForLevel(level: number): { name: string; color: string } {
  if (level >= 31) return { name: '量子先知', color: 'var(--purple)' };
  if (level >= 21) return { name: '賽博傳奇', color: 'var(--yellow)' };
  if (level >= 16) return { name: '網域使者', color: 'var(--pink)' };
  if (level >= 11) return { name: '數位傭兵', color: 'var(--cyan)' };
  if (level >= 6) return { name: '邊緣行者', color: 'var(--green)' };
  return { name: '新手駭客', color: 'var(--text-secondary)' };
}

export function levelFromXp(totalXp: number): LevelInfo {
  const safeXp = Number.isFinite(totalXp) && totalXp > 0 ? Math.floor(totalXp) : 0;
  // 解 100*L*(L-1) <= X 的最大整數 L
  // L = (1 + sqrt(1 + 4*X/100)) / 2
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + safeXp / 25)) / 2));
  const base = cumulativeXpForLevel(level);
  const next = cumulativeXpForLevel(level + 1);
  const currentLevelXp = safeXp - base;
  const xpToNextLevel = Math.max(1, next - base);
  const progress = Math.min(1, Math.max(0, currentLevelXp / xpToNextLevel));
  const tier = tierForLevel(level);
  return {
    level,
    totalXp: safeXp,
    currentLevelXp,
    xpToNextLevel,
    progress,
    tierName: tier.name,
    tierColor: tier.color,
  };
}

export function getAccountXp(): number {
  const store = safeGetJSON<XpStore | null>(STORAGE_KEY, null);
  if (!store || typeof store.totalXp !== 'number') return 0;
  return Number.isFinite(store.totalXp) && store.totalXp > 0 ? Math.floor(store.totalXp) : 0;
}

export function getLevelInfo(): LevelInfo {
  return levelFromXp(getAccountXp());
}

/**
 * 增加經驗值，回傳最新等級資訊。重複加時以本地既有值為基準累加。
 */
export function addAccountXp(amount: number): LevelInfo {
  if (!Number.isFinite(amount) || amount <= 0) return getLevelInfo();
  const next = getAccountXp() + Math.floor(amount);
  safeSetJSON(STORAGE_KEY, { version: SCHEMA_VERSION, totalXp: next } satisfies XpStore);
  return levelFromXp(next);
}

/** 供測試 / 除錯用：重設經驗 */
export function resetAccountXp(): LevelInfo {
  safeSetJSON(STORAGE_KEY, { version: SCHEMA_VERSION, totalXp: 0 } satisfies XpStore);
  return levelFromXp(0);
}
