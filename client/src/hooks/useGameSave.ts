import { useCallback, useState, useEffect } from 'react';
import type { GameState, GameMode, CustomGameRules } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const SAVE_KEY = 'monopoly_save';
const SAVE_VERSION = '1.0';

export interface GameSaveData {
  gameState: GameState;
  mode: GameMode;
  savedAt: number;
  version: string;
  customRules?: CustomGameRules;
}

export function useGameSave(isOnline: boolean = false) {
  const [hasSaveState, setHasSaveState] = useState<boolean>(false);

  useEffect(() => {
    if (isOnline) return;
    setHasSaveState(checkHasSave());
  }, [isOnline]);

  const saveGame = useCallback((gameState: GameState, mode: GameMode, customRules?: CustomGameRules) => {
    if (isOnline) return;
    try {
      const data: GameSaveData = {
        gameState,
        mode,
        savedAt: Date.now(),
        version: SAVE_VERSION,
        customRules,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      setHasSaveState(true);
    } catch (err) {
      logger.error('Failed to save game:', String(err));
    }
  }, [isOnline]);

  const loadGame = useCallback((): GameSaveData | null => {
    if (isOnline) return null;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as GameSaveData;
      return data;
    } catch (err) {
      logger.error('Failed to load game:', String(err));
      return null;
    }
  }, [isOnline]);

  const clearSave = useCallback(() => {
    if (isOnline) return; // 線上模式不操作本地存檔
    try {
      localStorage.removeItem(SAVE_KEY);
      setHasSaveState(false);
    } catch (err) {
      logger.error('Failed to clear save:', String(err));
    }
  }, [isOnline]);

  const hasSave = useCallback((): boolean => {
    if (isOnline) return false;
    return checkHasSave();
  }, [isOnline]);

  return {
    saveGame,
    loadGame,
    clearSave,
    hasSave,
    hasSaveState,
    isOnline,
  };
}

function checkHasSave(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw !== null;
  } catch {
    return false;
  }
}
