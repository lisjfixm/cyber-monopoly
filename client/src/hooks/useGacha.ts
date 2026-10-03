import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PawnSkinType, DiceSkinType, PetType, TitleId } from '@shared/api.interface';
import { PAWN_SKINS, DICE_SKINS, PETS, TITLES } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_gacha';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type GachaReward =
  | { kind: 'pawnSkin'; id: PawnSkinType; rarity: Rarity; name: string }
  | { kind: 'diceSkin'; id: DiceSkinType; rarity: Rarity; name: string }
  | { kind: 'pet'; id: PetType; rarity: Rarity; name: string }
  | { kind: 'title'; id: TitleId; rarity: Rarity; name: string };

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--text-secondary)',
  rare: 'var(--cyan)',
  epic: 'var(--purple)',
  legendary: 'var(--yellow)',
};

// 重複取得時自動轉換的碎片數
export const DUPLICATE_FRAGMENTS: Record<Rarity, number> = {
  common: 5,
  rare: 15,
  epic: 30,
  legendary: 80,
};

// 抽取代價
export const SINGLE_PULL_COST = { coins: 100, fragments: 10 };
export const TEN_PULL_COST = { coins: 900, fragments: 90 };
export const PITY_MAX = 90; // 90 抽保底傳說

// 獎池：只放入可透過扭蛋取得的項目（排除 default 初始項）
const PAWN_POOL: Array<{ id: PawnSkinType; rarity: Rarity }> = [
  { id: 'mecha', rarity: 'rare' },
  { id: 'ufo', rarity: 'epic' },
  { id: 'dragon', rarity: 'legendary' },
];

const DICE_POOL: Array<{ id: DiceSkinType; rarity: Rarity }> = [
  { id: 'gold', rarity: 'rare' },
  { id: 'neon', rarity: 'epic' },
  { id: 'pixel', rarity: 'legendary' },
];

const PET_POOL: Array<{ id: PetType; rarity: Rarity }> = [
  { id: 'mechDog', rarity: 'common' },
  { id: 'ufo', rarity: 'rare' },
  { id: 'dragon', rarity: 'epic' },
];

const TITLE_POOL: Array<{ id: TitleId; rarity: Rarity }> = [
  { id: 'newbie', rarity: 'common' },
  { id: 'fate_favorite', rarity: 'rare' },
  { id: 'jailbreak', rarity: 'rare' },
  { id: 'trader', rarity: 'rare' },
  { id: 'tycoon', rarity: 'epic' },
  { id: 'stock_guru', rarity: 'epic' },
  { id: 'hotel_king', rarity: 'epic' },
  { id: 'gambler', rarity: 'legendary' },
  { id: 'champion', rarity: 'legendary' },
];

// 稀有度權重（非保底時）
const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5,
};

interface DrawRecord {
  timestamp: number;
  reward: GachaReward;
  wasDuplicate: boolean;
  convertedFragments: number;
}

interface GachaData {
  totalPulls: number;
  pityCount: number;
  history: DrawRecord[];
}

const DEFAULT_DATA: GachaData = {
  totalPulls: 0,
  pityCount: 0,
  history: [],
};

function readData(): GachaData {
  const raw = safeGetJSON<Partial<GachaData>>(STORAGE_KEY, {});
  return {
    totalPulls: raw.totalPulls ?? 0,
    pityCount: raw.pityCount ?? 0,
    history: Array.isArray(raw.history) ? raw.history.slice(-50) : [],
  };
}

function pickRarity(pityTriggered: boolean): Rarity {
  if (pityTriggered) return 'legendary';
  const entries = Object.entries(RARITY_WEIGHTS) as Array<[Rarity, number]>;
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [rarity, w] of entries) {
    r -= w;
    if (r <= 0) return rarity;
  }
  return 'common';
}

function pickReward(rarity: Rarity): GachaReward {
  // 依稀有度過濾各池
  const candidates: GachaReward[] = [];
  for (const p of PAWN_POOL) {
    if (p.rarity === rarity) {
      candidates.push({ kind: 'pawnSkin', id: p.id, rarity, name: PAWN_SKINS[p.id].name });
    }
  }
  for (const d of DICE_POOL) {
    if (d.rarity === rarity) {
      candidates.push({ kind: 'diceSkin', id: d.id, rarity, name: DICE_SKINS[d.id].name });
    }
  }
  for (const pet of PET_POOL) {
    if (pet.rarity === rarity) {
      candidates.push({ kind: 'pet', id: pet.id, rarity, name: PETS[pet.id].name });
    }
  }
  for (const t of TITLE_POOL) {
    if (t.rarity === rarity) {
      candidates.push({ kind: 'title', id: t.id, rarity, name: TITLES[t.id].name });
    }
  }
  if (candidates.length === 0) {
    // fallback：退回 common
    return pickReward('common');
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export interface DrawOutcome {
  reward: GachaReward;
  pityTriggered: boolean;
}

export function useGacha() {
  const [data, setData] = useState<GachaData>(() => readData());

  useEffect(() => {
    safeSetJSON(STORAGE_KEY, data);
  }, [data]);

  const drawOnce = useCallback((): DrawOutcome => {
    const pityTriggered = data.pityCount + 1 >= PITY_MAX;
    const rarity = pickRarity(pityTriggered);
    const reward = pickReward(rarity);
    return { reward, pityTriggered };
  }, [data.pityCount]);

  const commitDraws = useCallback(
    (outcomes: DrawOutcome[]) => {
      setData((prev) => {
        let pity = prev.pityCount;
        const newHistory: DrawRecord[] = [];
        const now = Date.now();
        outcomes.forEach((o, i) => {
          if (o.reward.rarity === 'legendary') {
            pity = 0;
          } else {
            pity += 1;
          }
          newHistory.push({
            timestamp: now + i,
            reward: o.reward,
            wasDuplicate: false,
            convertedFragments: 0,
          });
        });
        return {
          totalPulls: prev.totalPulls + outcomes.length,
          pityCount: pity,
          history: [...prev.history, ...newHistory].slice(-50),
        };
      });
    },
    [],
  );

  const markDuplicate = useCallback((index: number, convertedFragments: number) => {
    setData((prev) => {
      const history = prev.history.slice();
      const target = history[history.length - 1 - index];
      if (target) {
        target.wasDuplicate = true;
        target.convertedFragments = convertedFragments;
      }
      return { ...prev, history };
    });
  }, []);

  const pityRemaining = useMemo(() => Math.max(0, PITY_MAX - data.pityCount), [data.pityCount]);

  return {
    totalPulls: data.totalPulls,
    pityCount: data.pityCount,
    pityRemaining,
    history: data.history,
    drawOnce,
    commitDraws,
    markDuplicate,
  };
}
