import { useCallback, useEffect, useState } from 'react';
import type { GameState } from '@shared/api.interface';
import { MODE_LABELS } from '@shared/game-config';

const SAVE_KEY_PREFIX = 'monopoly_save_';
const SAVE_VERSION = '1.0';
const SLOT_COUNT = 3;
const CONTINUE_KEY = 'monopoly_continue_save';

export interface SaveSlotInfo {
  slot: number;
  savedAt: string;
  gameMode: string;
  turnCount: number;
  player1Name: string;
  player1Money: number;
  player2Name: string;
  player2Money: number;
  isOnline: boolean;
  isAutoSave?: boolean;
}

interface SaveData {
  gameState: GameState;
  meta: SaveSlotInfo;
  version: string;
}

function getSlotKey(slot: number): string {
  return `${SAVE_KEY_PREFIX}${slot}`;
}

function computeTurnCount(state: GameState): number {
  const diceLogs = state.logs.filter(
    (l) => l.type === 'player1' || l.type === 'player2',
  ).filter((l) => l.text.includes('掷出')).length;
  return Math.ceil(diceLogs / 2);
}

function readSlot(slot: number): SaveSlotInfo | null {
  try {
    const raw = localStorage.getItem(getSlotKey(slot));
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data.meta;
  } catch {
    return null;
  }
}

function readAllSlots(): (SaveSlotInfo | null)[] {
  const result: (SaveSlotInfo | null)[] = [];
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    result.push(readSlot(i));
  }
  return result;
}

export function useSaveSlots(isOnline: boolean = false) {
  const [slots, setSlots] = useState<(SaveSlotInfo | null)[]>(() =>
    isOnline ? Array(SLOT_COUNT).fill(null) : readAllSlots(),
  );

  const refreshSlots = useCallback(() => {
    if (isOnline) return;
    setSlots(readAllSlots());
  }, [isOnline]);

  // isOnline 切換時同步槽位狀態：線上模式清空，本地模式重新讀取
  useEffect(() => {
    if (isOnline) {
      setSlots(Array(SLOT_COUNT).fill(null));
    } else {
      setSlots(readAllSlots());
    }
  }, [isOnline]);

  const hasAnySave = slots.some((s) => s !== null);

  const saveGame = useCallback(
    (
      slot: number,
      gameState: GameState,
      meta?: Partial<SaveSlotInfo>,
    ): boolean => {
      if (isOnline) return false;
      if (slot < 0 || slot >= SLOT_COUNT) return false;
      try {
        const info: SaveSlotInfo = {
          slot,
          savedAt: new Date().toISOString(),
          gameMode: gameState.mode,
          turnCount: computeTurnCount(gameState),
          player1Name: gameState.players[0]?.name ?? '',
          player1Money: gameState.players[0]?.money ?? 0,
          player2Name: gameState.players[1]?.name ?? '',
          player2Money: gameState.players[1]?.money ?? 0,
          isOnline: false,
          ...meta,
        };
        const data: SaveData = {
          gameState,
          meta: info,
          version: SAVE_VERSION,
        };
        localStorage.setItem(getSlotKey(slot), JSON.stringify(data));
        setSlots((prev) => {
          const next = [...prev];
          next[slot] = info;
          return next;
        });
        return true;
      } catch {
        return false;
      }
    },
    [isOnline],
  );

  const loadGame = useCallback(
    (slot: number): GameState | null => {
      if (isOnline) return null;
      try {
        const raw = localStorage.getItem(getSlotKey(slot));
        if (!raw) return null;
        const data = JSON.parse(raw) as SaveData;
        return data.gameState;
      } catch {
        return null;
      }
    },
    [isOnline],
  );

  const deleteSlot = useCallback(
    (slot: number): void => {
      if (isOnline) return;
      try {
        localStorage.removeItem(getSlotKey(slot));
        setSlots((prev) => {
          const next = [...prev];
          next[slot] = null;
          return next;
        });
      } catch {
        // ignore
      }
    },
    [isOnline],
  );

  return {
    slots,
    saveGame,
    loadGame,
    deleteSlot,
    hasAnySave,
    refreshSlots,
  };
}

// ---------- Continue game (sessionStorage bridge) ----------

export function setContinueSave(slot: number): void {
  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) return;
  try {
    sessionStorage.setItem(CONTINUE_KEY, String(slot));
  } catch {
    // ignore
  }
}

export function consumeContinueSave(): number | null {
  try {
    const raw = sessionStorage.getItem(CONTINUE_KEY);
    if (raw === null) return null;
    const slot = parseInt(raw, 10);
    sessionStorage.removeItem(CONTINUE_KEY);
    return Number.isFinite(slot) ? slot : null;
  } catch {
    return null;
  }
}

export function getModeLabel(mode: string): string {
  return MODE_LABELS[mode] || mode;
}
