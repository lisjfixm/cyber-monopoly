import { useState, useEffect, useCallback } from 'react';
import type { TitleId } from '@shared/api.interface';
import { TITLES } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_titles_progress';

interface TitleProgressData {
  equippedTitle: TitleId | null;
  unlockedTitles: TitleId[];
  buyPropertyCount: number;
  winStreak: number;
  maxWinStreak: number;
  totalWins: number;
  maxCompleteSets: number;
  maxAssets: number;
}

const DEFAULT_DATA: TitleProgressData = {
  equippedTitle: null,
  unlockedTitles: [],
  buyPropertyCount: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalWins: 0,
  maxCompleteSets: 0,
  maxAssets: 0,
};

function readFromStorage(): TitleProgressData {
  const data = safeGetJSON<Partial<TitleProgressData>>(STORAGE_KEY, {});
  return {
    ...DEFAULT_DATA,
    ...data,
  };
}

function writeToStorage(data: TitleProgressData): void {
  safeSetJSON(STORAGE_KEY, data);
}

function checkTitleUnlocks(data: TitleProgressData): TitleId[] {
  const newlyUnlocked: TitleId[] = [];
  if (!data.unlockedTitles.includes('property_newbie') && data.buyPropertyCount >= 10) {
    newlyUnlocked.push('property_newbie');
  }
  if (!data.unlockedTitles.includes('undefeated') && data.maxWinStreak >= 3) {
    newlyUnlocked.push('undefeated');
  }
  if (!data.unlockedTitles.includes('real_estate_god') && data.maxCompleteSets >= 5) {
    newlyUnlocked.push('real_estate_god');
  }
  if (!data.unlockedTitles.includes('billionaire') && data.maxAssets >= 50000) {
    newlyUnlocked.push('billionaire');
  }
  return newlyUnlocked;
}

export function useTitleProgress() {
  const [data, setData] = useState<TitleProgressData>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(data);
  }, [data]);

  const addBuyProperty = useCallback((count: number = 1) => {
    setData((prev: TitleProgressData) => {
      const newBuyCount = prev.buyPropertyCount + count;
      const newData = { ...prev, buyPropertyCount: newBuyCount };
      const newly = checkTitleUnlocks({ ...newData, unlockedTitles: prev.unlockedTitles });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);

  const recordWin = useCallback(() => {
    setData((prev: TitleProgressData) => {
      const newStreak = prev.winStreak + 1;
      const newMaxStreak = Math.max(prev.maxWinStreak, newStreak);
      const newData = {
        ...prev,
        winStreak: newStreak,
        maxWinStreak: newMaxStreak,
        totalWins: prev.totalWins + 1,
      };
      const newly = checkTitleUnlocks({ ...newData, unlockedTitles: prev.unlockedTitles });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);

  const recordLoss = useCallback(() => {
    setData((prev: TitleProgressData) => ({ ...prev, winStreak: 0 }));
  }, []);

  const updateMaxCompleteSets = useCallback((sets: number) => {
    setData((prev: TitleProgressData) => {
      if (sets <= prev.maxCompleteSets) return prev;
      const newData = { ...prev, maxCompleteSets: sets };
      const newly = checkTitleUnlocks({ ...newData, unlockedTitles: prev.unlockedTitles });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);

  const updateMaxAssets = useCallback((assets: number) => {
    setData((prev: TitleProgressData) => {
      if (assets <= prev.maxAssets) return prev;
      const newData = { ...prev, maxAssets: assets };
      const newly = checkTitleUnlocks({ ...newData, unlockedTitles: prev.unlockedTitles });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);

  const equipTitle = useCallback((titleId: TitleId | null) => {
    setData((prev: TitleProgressData) => {
      if (titleId && !prev.unlockedTitles.includes(titleId)) return prev;
      return { ...prev, equippedTitle: titleId };
    });
  }, []);

  const isTitleUnlocked = useCallback((titleId: TitleId): boolean => {
    return data.unlockedTitles.includes(titleId);
  }, [data.unlockedTitles]);

  const getTitleProgress = useCallback((titleId: TitleId): { current: number; target: number; label: string } => {
    switch (titleId) {
      case 'property_newbie':
        return { current: data.buyPropertyCount, target: 10, label: '已買地塊' };
      case 'undefeated':
        return { current: data.maxWinStreak, target: 3, label: '最高連勝' };
      case 'real_estate_god':
        return { current: data.maxCompleteSets, target: 5, label: '最多套裝數' };
      case 'billionaire':
        return { current: data.maxAssets, target: 50000, label: '最高資產' };
      default:
        return { current: 0, target: 1, label: TITLES[titleId]?.unlockCondition ?? '未解鎖' };
    }
  }, [data.buyPropertyCount, data.maxWinStreak, data.maxCompleteSets, data.maxAssets]);

  return {
    equippedTitle: data.equippedTitle,
    unlockedTitles: data.unlockedTitles,
    buyPropertyCount: data.buyPropertyCount,
    winStreak: data.winStreak,
    maxWinStreak: data.maxWinStreak,
    totalWins: data.totalWins,
    maxCompleteSets: data.maxCompleteSets,
    maxAssets: data.maxAssets,
    addBuyProperty,
    recordWin,
    recordLoss,
    updateMaxCompleteSets,
    updateMaxAssets,
    equipTitle,
    isTitleUnlocked,
    getTitleProgress,
  };
}
