import { useState, useEffect, useCallback } from 'react';
import type { AchievementId, TitleId } from '@shared/api.interface';
import { TITLES } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_titles';

interface TitleStorageData {
  equipped: TitleId | null;
  unlocked: TitleId[];
}

const DEFAULT_DATA: TitleStorageData = {
  equipped: null,
  unlocked: [],
};

function readFromStorage(): TitleStorageData {
  try {
    const raw = safeGetJSON<Partial<TitleStorageData> | null>(STORAGE_KEY, null);
    if (!raw) return { ...DEFAULT_DATA };
    return {
      equipped: (raw.equipped as TitleId | null) ?? null,
      unlocked: (raw.unlocked as TitleId[]) ?? [],
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeToStorage(data: TitleStorageData): void {
  try {
    safeSetJSON(STORAGE_KEY, data);
  } catch {
    // ignore
  }
}

export function useTitles() {
  const [data, setData] = useState<TitleStorageData>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(data);
  }, [data]);

  const equipTitle = useCallback((id: TitleId) => {
    setData((prev: TitleStorageData) => {
      if (!prev.unlocked.includes(id)) return prev;
      return { ...prev, equipped: id };
    });
  }, []);

  const checkAndUnlockTitles = useCallback(
    (unlockedAchievements: Set<AchievementId> | AchievementId[]): TitleId[] => {
      const achievementSet = Array.isArray(unlockedAchievements)
        ? new Set(unlockedAchievements)
        : unlockedAchievements;

      let newlyUnlocked: TitleId[] = [];

      setData((prev: TitleStorageData) => {
        const nextUnlocked: TitleId[] = [...prev.unlocked];
        const localNewly: TitleId[] = [];
        for (const title of Object.values(TITLES)) {
          if (nextUnlocked.includes(title.id)) continue;
          if (achievementSet.has(title.unlockValue as AchievementId)) {
            nextUnlocked.push(title.id);
            localNewly.push(title.id);
          }
        }
        if (localNewly.length === 0) return prev;
        newlyUnlocked = localNewly;
        return { ...prev, unlocked: nextUnlocked };
      });

      return newlyUnlocked;
    },
    [],
  );

  return {
    equippedTitle: data.equipped,
    unlockedTitles: data.unlocked,
    equipTitle,
    checkAndUnlockTitles,
  };
}
