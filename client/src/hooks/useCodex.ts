import { useState, useEffect, useCallback } from 'react';
import type { CodexState } from '@shared/api.interface';
import { CELLS, FATE_CARDS, CHANCE_CARDS, ITEM_TYPES, PETS, PROFESSIONS, PAWN_SKINS, DICE_SKINS, MINIGAME_TYPES, MINIGAME_NAMES } from '@shared/game-config';
import { THEMES } from '@client/src/contexts/ThemeContext';
import type { ThemeId } from '@client/src/contexts/ThemeContext';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_codex';

interface CodexStorageData {
  properties: number[];
  cards: string[];
  items: string[];
  pets: string[];
  mounts: string[];
  professions: string[];
  themes: string[];
  skins: string[];
  minigames: string[];
  minigameScores: Record<string, number>;
}

const DEFAULT_DATA: CodexStorageData = {
  properties: [],
  cards: [],
  items: [],
  pets: [],
  mounts: [],
  professions: [],
  themes: ['cyberpunk'],
  skins: [],
  minigames: [],
  minigameScores: {},
};

function readFromStorage(playerKey: string): CodexStorageData {
  const fullKey = `${STORAGE_KEY}_${playerKey}`;
  const data = safeGetJSON<Partial<CodexStorageData>>(fullKey, {});
  return {
    properties: data.properties ?? [],
    cards: data.cards ?? [],
    items: data.items ?? [],
    pets: data.pets ?? [],
    mounts: data.mounts ?? [],
    professions: data.professions ?? [],
    themes: data.themes ?? ['cyberpunk'],
    skins: data.skins ?? [],
    minigames: data.minigames ?? [],
    minigameScores: data.minigameScores ?? {},
  };
}

function writeToStorage(playerKey: string, data: CodexStorageData): void {
  const fullKey = `${STORAGE_KEY}_${playerKey}`;
  safeSetJSON(fullKey, data);
}

export interface CodexProgress {
  properties: { unlocked: number; total: number };
  cards: { unlocked: number; total: number };
  items: { unlocked: number; total: number };
  pets: { unlocked: number; total: number };
  mounts: { unlocked: number; total: number };
  professions: { unlocked: number; total: number };
  themes: { unlocked: number; total: number };
  skins: { unlocked: number; total: number };
  minigames: { unlocked: number; total: number };
  total: { unlocked: number; total: number; percent: number };
}

export function useCodex(playerKey: string = 'default') {
  const [data, setData] = useState<CodexStorageData>(() => readFromStorage(playerKey));

  useEffect(() => {
    setData(readFromStorage(playerKey));
  }, [playerKey]);

  useEffect(() => {
    writeToStorage(playerKey, data);
  }, [playerKey, data]);

  const unlockFromGameState = useCallback((codex: CodexState | undefined) => {
    if (!codex) return;
    setData((prev: CodexStorageData) => {
      const newProps = [...prev.properties];
      for (const p of codex.properties) {
        if (!newProps.includes(p)) newProps.push(p);
      }
      const newCards = [...prev.cards];
      for (const c of codex.cards) {
        if (!newCards.includes(c)) newCards.push(c);
      }
      const newItems = [...prev.items];
      for (const i of codex.items) {
        if (!newItems.includes(i)) newItems.push(i);
      }
      const newPets = [...prev.pets];
      for (const p of codex.pets) {
        if (!newPets.includes(p)) newPets.push(p);
      }
      const newMounts = [...prev.mounts];
      for (const m of codex.mounts) {
        if (!newMounts.includes(m)) newMounts.push(m);
      }
      return {
        ...prev,
        properties: newProps,
        cards: newCards,
        items: newItems,
        pets: newPets,
        mounts: newMounts,
      };
    });
  }, []);

  const unlockProfession = useCallback((professionId: string) => {
    setData((prev) => {
      if (prev.professions.includes(professionId)) return prev;
      return { ...prev, professions: [...prev.professions, professionId] };
    });
  }, []);

  const unlockTheme = useCallback((themeId: string) => {
    setData((prev) => {
      if (prev.themes.includes(themeId)) return prev;
      return { ...prev, themes: [...prev.themes, themeId] };
    });
  }, []);

  const unlockSkin = useCallback((skinId: string) => {
    setData((prev) => {
      if (prev.skins.includes(skinId)) return prev;
      return { ...prev, skins: [...prev.skins, skinId] };
    });
  }, []);

  const recordMinigame = useCallback((minigameId: string, score: number) => {
    setData((prev) => {
      const newMinigames = prev.minigames.includes(minigameId)
        ? prev.minigames
        : [...prev.minigames, minigameId];
      const prevScore = prev.minigameScores[minigameId] ?? 0;
      const newScores = {
        ...prev.minigameScores,
        [minigameId]: Math.max(prevScore, score),
      };
      return { ...prev, minigames: newMinigames, minigameScores: newScores };
    });
  }, []);

  const isPropertyUnlocked = useCallback((cellId: number): boolean => {
    return data.properties.includes(cellId);
  }, [data.properties]);

  const isCardUnlocked = useCallback((cardId: string): boolean => {
    return data.cards.includes(cardId);
  }, [data.cards]);

  const isItemUnlocked = useCallback((itemType: string): boolean => {
    return data.items.includes(itemType);
  }, [data.items]);

  const isPetUnlocked = useCallback((petType: string): boolean => {
    return data.pets.includes(petType);
  }, [data.pets]);

  const isMountUnlocked = useCallback((mountType: string): boolean => {
    return data.mounts.includes(mountType);
  }, [data.mounts]);

  const isProfessionUnlocked = useCallback((profId: string): boolean => {
    return data.professions.includes(profId);
  }, [data.professions]);

  const isThemeUnlocked = useCallback((themeId: string): boolean => {
    return data.themes.includes(themeId);
  }, [data.themes]);

  const isSkinUnlocked = useCallback((skinId: string): boolean => {
    return data.skins.includes(skinId);
  }, [data.skins]);

  const isMinigameUnlocked = useCallback((mgId: string): boolean => {
    return data.minigames.includes(mgId);
  }, [data.minigames]);

  const getMinigameHighScore = useCallback((mgId: string): number => {
    return data.minigameScores[mgId] ?? 0;
  }, [data.minigameScores]);

  const getProgress = useCallback((): CodexProgress => {
    const totalProperties = CELLS.length;
    const totalCards = FATE_CARDS.length + CHANCE_CARDS.length;
    const totalItems = ITEM_TYPES.length;
    const totalPets = Object.keys(PETS).length;
    const totalMounts = 3;
    const totalProfessions = Object.keys(PROFESSIONS).length;
    const totalThemes = THEMES.length;
    const totalSkins = Object.keys(PAWN_SKINS).length + Object.keys(DICE_SKINS).length;
    const totalMinigames = MINIGAME_TYPES.length;
    const totalAll = totalProperties + totalCards + totalItems + totalPets + totalMounts
      + totalProfessions + totalThemes + totalSkins + totalMinigames;
    const unlockedAll = data.properties.length + data.cards.length + data.items.length
      + data.pets.length + data.mounts.length + data.professions.length + data.themes.length
      + data.skins.length + data.minigames.length;
    return {
      properties: { unlocked: data.properties.length, total: totalProperties },
      cards: { unlocked: data.cards.length, total: totalCards },
      items: { unlocked: data.items.length, total: totalItems },
      pets: { unlocked: data.pets.length, total: totalPets },
      mounts: { unlocked: data.mounts.length, total: totalMounts },
      professions: { unlocked: data.professions.length, total: totalProfessions },
      themes: { unlocked: data.themes.length, total: totalThemes },
      skins: { unlocked: data.skins.length, total: totalSkins },
      minigames: { unlocked: data.minigames.length, total: totalMinigames },
      total: { unlocked: unlockedAll, total: totalAll, percent: totalAll > 0 ? Math.floor((unlockedAll / totalAll) * 100) : 0 },
    };
  }, [data]);

  const getCollectionRewards = useCallback((): { id: string; name: string; threshold: number; unlocked: boolean; reward: string }[] => {
    const p = getProgress();
    const percent = p.total.percent;
    return [
      { id: 'r1', name: '新手收藏家', threshold: 20, unlocked: percent >= 20, reward: '頭像框：銅框' },
      { id: 'r2', name: '資深收藏家', threshold: 50, unlocked: percent >= 50, reward: '稱號：收藏達人' },
      { id: 'r3', name: '大收藏家', threshold: 80, unlocked: percent >= 80, reward: '頭像框：金框' },
      { id: 'r4', name: '傳奇收藏家', threshold: 100, unlocked: percent >= 100, reward: '稱號：圖鑑大師 + 限定皮膚' },
    ];
  }, [getProgress]);

  return {
    data,
    unlockFromGameState,
    unlockProfession,
    unlockTheme,
    unlockSkin,
    recordMinigame,
    isPropertyUnlocked,
    isCardUnlocked,
    isItemUnlocked,
    isPetUnlocked,
    isMountUnlocked,
    isProfessionUnlocked,
    isThemeUnlocked,
    isSkinUnlocked,
    isMinigameUnlocked,
    getMinigameHighScore,
    getProgress,
    getCollectionRewards,
  };
}
