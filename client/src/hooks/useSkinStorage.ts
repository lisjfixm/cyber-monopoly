import { useState, useEffect, useCallback } from 'react';
import type { PawnSkinType, DiceSkinType } from '@shared/api.interface';

const STORAGE_KEY = 'cyber_monopoly_skins';

interface SkinStorageData {
  pawn: PawnSkinType;
  dice: DiceSkinType;
  unlockedPawn: PawnSkinType[];
  unlockedDice: DiceSkinType[];
}

const DEFAULT_DATA: SkinStorageData = {
  pawn: 'default',
  dice: 'default',
  unlockedPawn: ['default'],
  unlockedDice: ['default'],
};

function readFromStorage(): SkinStorageData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<SkinStorageData>;
    return {
      pawn: (parsed.pawn as PawnSkinType) ?? 'default',
      dice: (parsed.dice as DiceSkinType) ?? 'default',
      unlockedPawn: (parsed.unlockedPawn as PawnSkinType[]) ?? ['default'],
      unlockedDice: (parsed.unlockedDice as DiceSkinType[]) ?? ['default'],
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function writeToStorage(data: SkinStorageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function useSkinStorage() {
  const [data, setData] = useState<SkinStorageData>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(data);
  }, [data]);

  const setPawnSkin = useCallback((skin: PawnSkinType) => {
    setData((prev: SkinStorageData) => ({ ...prev, pawn: skin }));
  }, []);

  const setDiceSkin = useCallback((skin: DiceSkinType) => {
    setData((prev: SkinStorageData) => ({ ...prev, dice: skin }));
  }, []);

  const unlockPawnSkin = useCallback((skin: PawnSkinType) => {
    setData((prev: SkinStorageData) => {
      if (prev.unlockedPawn.includes(skin)) return prev;
      return { ...prev, unlockedPawn: [...prev.unlockedPawn, skin] };
    });
  }, []);

  const unlockDiceSkin = useCallback((skin: DiceSkinType) => {
    setData((prev: SkinStorageData) => {
      if (prev.unlockedDice.includes(skin)) return prev;
      return { ...prev, unlockedDice: [...prev.unlockedDice, skin] };
    });
  }, []);

  return {
    pawnSkin: data.pawn,
    diceSkin: data.dice,
    unlockedPawnSkins: data.unlockedPawn,
    unlockedDiceSkins: data.unlockedDice,
    setPawnSkin,
    setDiceSkin,
    unlockPawnSkin,
    unlockDiceSkin,
  };
}
