import { useState, useEffect, useCallback, useRef } from 'react';
import type { AchievementId, AchievementRarity } from '@shared/api.interface';
import { ACHIEVEMENTS, ACHIEVEMENT_IDS } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'monopoly_achievements';
const PROGRESS_KEY = 'monopoly_achievement_progress';

interface AchievementStorage {
  unlocked: AchievementId[];
  progress: Record<string, number>;
}

function loadFromStorage(): AchievementStorage {
  try {
    const unlocked = safeGetJSON<AchievementId[]>(STORAGE_KEY, []);
    const progress = safeGetJSON<Record<string, number>>(PROGRESS_KEY, {});
    return { unlocked, progress };
  } catch {
    return { unlocked: [], progress: {} };
  }
}

function saveToStorage(data: AchievementStorage): void {
  try {
    safeSetJSON(STORAGE_KEY, data.unlocked);
    safeSetJSON(PROGRESS_KEY, data.progress);
  } catch {
    // ignore
  }
}

export interface UnlockResult {
  newlyUnlocked: AchievementId[];
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(() => {
    const stored = loadFromStorage();
    return new Set(stored.unlocked);
  });
  const [progress, setProgress] = useState<Record<string, number>>(() => {
    return loadFromStorage().progress;
  });
  const [pendingToasts, setPendingToasts] = useState<AchievementId[]>([]);
  const unlockedRef = useRef<Set<AchievementId>>(unlocked);
  const progressRef = useRef<Record<string, number>>(progress);

  useEffect(() => {
    unlockedRef.current = unlocked;
    progressRef.current = progress;
    saveToStorage({
      unlocked: Array.from(unlocked),
      progress,
    });
  }, [unlocked, progress]);

  const isUnlocked = useCallback((id: AchievementId): boolean => unlocked.has(id), [unlocked]);

  const getProgress = useCallback((id: AchievementId): number => progress[id] ?? 0, [progress]);

  const getTotalPoints = useCallback((): number => {
    let total = 0;
    for (const id of unlocked) {
      const ach = ACHIEVEMENTS[id];
      if (ach) total += ach.points;
    }
    return total;
  }, [unlocked]);

  const getRarityColor = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#22d3ee';
      case 'epic': return '#a855f7';
      case 'legendary': return '#facc15';
    }
  };

  const setProgressValue = useCallback((id: AchievementId, value: number): AchievementId | null => {
    const ach = ACHIEVEMENTS[id];
    if (!ach) return null;
    const prevProgress = progressRef.current;
    const prevUnlocked = unlockedRef.current;
    const target = ach.target ?? 1;
    const wasUnlocked = prevUnlocked.has(id);

    // 同步更新 ref：避免同一個事件迴圈內連續 increment 時讀到舊值（ref 預設在 effect 才同步）
    const nextProgress = { ...prevProgress, [id]: value };
    progressRef.current = nextProgress;
    setProgress(nextProgress);

    if (value >= target && !wasUnlocked) {
      const nextUnlocked = new Set(prevUnlocked);
      nextUnlocked.add(id);
      unlockedRef.current = nextUnlocked;
      setUnlocked(nextUnlocked);
      setPendingToasts((prev) => [...prev, id]);
      return id;
    }
    return null;
  }, []);

  const incrementProgress = useCallback((id: AchievementId, amount: number = 1): AchievementId | null => {
    const current = progressRef.current[id] ?? 0;
    return setProgressValue(id, current + amount);
  }, [setProgressValue]);

  const unlock = useCallback((id: AchievementId): boolean => {
    const ach = ACHIEVEMENTS[id];
    if (!ach) return false;
    if (unlockedRef.current.has(id)) return false;
    const target = ach.target ?? 1;
    setProgressValue(id, target);
    return true;
  }, [setProgressValue]);

  const unlockMany = useCallback((ids: AchievementId[]): AchievementId[] => {
    const newly: AchievementId[] = [];
    for (const id of ids) {
      if (unlock(id)) newly.push(id);
    }
    return newly;
  }, [unlock]);

  const dismissToast = useCallback((): void => {
    setPendingToasts((prev) => prev.slice(1));
  }, []);

  const reset = useCallback((): void => {
    // 同步清空 ref，避免後續 increment 讀到舊值
    const emptyProgress: Record<string, number> = {};
    const emptyUnlocked = new Set<AchievementId>();
    progressRef.current = emptyProgress;
    unlockedRef.current = emptyUnlocked;
    setUnlocked(emptyUnlocked);
    setProgress(emptyProgress);
    setPendingToasts([]);
    saveToStorage({ unlocked: [], progress: {} });
  }, []);

  const getByCategory = useCallback(() => {
    const groups: Record<string, AchievementId[]> = {};
    for (const id of ACHIEVEMENT_IDS) {
      const ach = ACHIEVEMENTS[id];
      if (!ach) continue;
      if (!groups[ach.category]) groups[ach.category] = [];
      groups[ach.category].push(id);
    }
    return groups;
  }, []);

  return {
    unlocked,
    progress,
    pendingToasts,
    isUnlocked,
    getProgress,
    getTotalPoints,
    getRarityColor,
    setProgressValue,
    incrementProgress,
    unlock,
    unlockMany,
    dismissToast,
    reset,
    getByCategory,
  };
}
