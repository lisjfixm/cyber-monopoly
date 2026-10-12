import { useCallback, useState } from 'react';
import {
  addAccountXp as addAccountXpUtil,
  getLevelInfo,
  resetAccountXp as resetAccountXpUtil,
  type LevelInfo,
} from '@client/src/utils/playerLevel';

/**
 * 帳號 XP / 玩家等級 React 繫結（v4.0.0 局外元系統）。
 * addXp 回傳是否升級，供 UI 彈升級提示。
 */
export function usePlayerLevel() {
  const [info, setInfo] = useState<LevelInfo>(() => getLevelInfo());

  const addXp = useCallback((amount: number): { leveledUp: boolean; from: number; to: number } => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { leveledUp: false, from: info.level, to: info.level };
    }
    const before = info.level;
    const next = addAccountXpUtil(amount);
    setInfo(next);
    return { leveledUp: next.level > before, from: before, to: next.level };
  }, [info.level]);

  const refresh = useCallback(() => {
    setInfo(getLevelInfo());
  }, []);

  const reset = useCallback(() => {
    setInfo(resetAccountXpUtil());
  }, []);

  return { levelInfo: info, addXp, refresh, reset };
}
