import { useState, useEffect, useCallback } from 'react';
import type { PawnSkinType } from '@shared/api.interface';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_skin_upgrade';

type SkinLevel = 1 | 2 | 3;

interface SkinUpgradeData {
  fragments: number;
  levels: Record<string, SkinLevel>;
}

const DEFAULT_DATA: SkinUpgradeData = {
  fragments: 0,
  levels: {},
};

const UPGRADE_COSTS: Record<SkinLevel, number> = {
  1: 10,
  2: 30,
  3: Infinity,
};

function readFromStorage(): SkinUpgradeData {
  const data = safeGetJSON<Partial<SkinUpgradeData>>(STORAGE_KEY, {});
  return {
    fragments: data.fragments ?? 0,
    levels: data.levels ?? {},
  };
}

function writeToStorage(data: SkinUpgradeData): void {
  safeSetJSON(STORAGE_KEY, data);
}

export function useSkinUpgrade() {
  const [data, setData] = useState<SkinUpgradeData>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(data);
  }, [data]);

  const addFragments = useCallback((amount: number) => {
    setData((prev: SkinUpgradeData) => ({
      ...prev,
      fragments: prev.fragments + amount,
    }));
  }, []);

  const getSkinLevel = useCallback((skinId: PawnSkinType): SkinLevel => {
    return (data.levels[skinId] as SkinLevel | undefined) ?? 1;
  }, [data.levels]);

  const getUpgradeCost = useCallback((skinId: PawnSkinType): number => {
    const currentLevel = getSkinLevel(skinId);
    if (currentLevel >= 3) return Infinity;
    return UPGRADE_COSTS[currentLevel];
  }, [getSkinLevel]);

  const canUpgrade = useCallback((skinId: PawnSkinType): boolean => {
    const cost = getUpgradeCost(skinId);
    return data.fragments >= cost && cost !== Infinity;
  }, [data.fragments, getUpgradeCost]);

  const upgradeSkin = useCallback((skinId: PawnSkinType): boolean => {
    let success = false;
    setData((prev: SkinUpgradeData) => {
      const currentLevel = (prev.levels?.[skinId] ?? 0) as SkinLevel;
      if (currentLevel >= 3) return prev;
      const cost = UPGRADE_COSTS[currentLevel];
      if (!cost || prev.fragments < cost) return prev;
      success = true;
      return {
        ...prev,
        fragments: prev.fragments - cost,
        levels: { ...prev.levels, [skinId]: (currentLevel + 1) as SkinLevel },
      };
    });
    return success;
  }, []);

  const isLegendary = useCallback((skinId: PawnSkinType): boolean => {
    return getSkinLevel(skinId) >= 3;
  }, [getSkinLevel]);

  return {
    fragments: data.fragments,
    levels: data.levels,
    addFragments,
    getSkinLevel,
    getUpgradeCost,
    canUpgrade,
    upgradeSkin,
    isLegendary,
  };
}
