import { useState, useEffect, useCallback } from 'react';
import type { AchievementId, PawnSkinType } from '@shared/api.interface';
import { AVATAR_FRAMES } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_avatar_frame';

interface AvatarFrameStorageData {
  equipped: string;
  unlocked: string[];
}

const DEFAULT_DATA: AvatarFrameStorageData = {
  equipped: 'default_frame',
  unlocked: ['default_frame'],
};

function readFromStorage(): AvatarFrameStorageData {
  try {
    const raw = safeGetJSON<Partial<AvatarFrameStorageData> | null>(STORAGE_KEY, null);
    if (!raw) return { ...DEFAULT_DATA };
    return {
      equipped: raw.equipped ?? 'default_frame',
      unlocked: raw.unlocked ?? ['default_frame'],
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeToStorage(data: AvatarFrameStorageData): void {
  try {
    safeSetJSON(STORAGE_KEY, data);
  } catch {
    // ignore
  }
}

export function useAvatarFrame() {
  const [data, setData] = useState<AvatarFrameStorageData>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(data);
  }, [data]);

  const equipFrame = useCallback((id: string) => {
    setData((prev: AvatarFrameStorageData) => {
      if (!prev.unlocked.includes(id)) return prev;
      return { ...prev, equipped: id };
    });
  }, []);

  const unlockFrame = useCallback((id: string): boolean => {
    let isNew = false;
    setData((prev: AvatarFrameStorageData) => {
      if (prev.unlocked.includes(id)) return prev;
      isNew = true;
      return { ...prev, unlocked: [...prev.unlocked, id] };
    });
    return isNew;
  }, []);

  const checkAndUnlockFrames = useCallback((params: {
    unlockedAchievements: Set<AchievementId> | AchievementId[];
    battlePassLevel?: number;
    isPremium?: boolean;
    totalAssets?: number;
    unlockedPawnSkins?: PawnSkinType[];
  }): string[] => {
    const achievementSet = Array.isArray(params.unlockedAchievements)
      ? new Set(params.unlockedAchievements)
      : params.unlockedAchievements;
    let newlyUnlocked: string[] = [];

    setData((prev: AvatarFrameStorageData) => {
      const nextUnlocked = [...prev.unlocked];
      const localNewly: string[] = [];

      for (const frame of AVATAR_FRAMES) {
        if (nextUnlocked.includes(frame.id)) continue;

        let shouldUnlock = false;
        switch (frame.unlockType) {
          case 'default':
            shouldUnlock = true;
            break;
          case 'achievement':
            shouldUnlock = achievementSet.has(frame.unlockValue as AchievementId);
            break;
          case 'battlepass': {
            if (params.isPremium && params.battlePassLevel !== undefined) {
              const lvStr = String(frame.unlockValue);
              const level = parseInt(lvStr.split('_')[0], 10);
              shouldUnlock = params.battlePassLevel >= level;
            }
            break;
          }
          case 'assets':
            shouldUnlock = (params.totalAssets ?? 0) >= (frame.unlockValue as number);
            break;
          case 'achievements_count':
            shouldUnlock = achievementSet.size >= (frame.unlockValue as number);
            break;
          case 'all_pawn_skins':
            shouldUnlock = (params.unlockedPawnSkins?.length ?? 0) >= 4;
            break;
          case 'achievements_combo': {
            const ids = String(frame.unlockValue).split('+');
            shouldUnlock = ids.every((id: string) => achievementSet.has(id as AchievementId));
            break;
          }
        }

        if (shouldUnlock) {
          nextUnlocked.push(frame.id);
          localNewly.push(frame.id);
        }
      }

      if (localNewly.length === 0) return prev;
      newlyUnlocked = localNewly;
      return { ...prev, unlocked: nextUnlocked };
    });

    return newlyUnlocked;
  }, []);

  return {
    equippedFrame: data.equipped,
    unlockedFrames: data.unlocked,
    equipFrame,
    unlockFrame,
    checkAndUnlockFrames,
  };
}
