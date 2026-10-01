import { useCallback, useEffect, useState } from 'react';
import type { MatchHistoryItem } from '@shared/api.interface';

const STORAGE_KEY = 'cyber_monopoly_match_history';
const SEED_KEY = 'cyber_monopoly_stats_seeded';
const MAX_ITEMS = 50;

function loadFromStorage(): MatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as MatchHistoryItem[];
    }
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(matches: MatchHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch {
    // ignore
  }
}

function generateId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSeedMatches(): MatchHistoryItem[] {
  const modes = ['classic', 'speed', 'crazy', 'battle_royale'];
  const modeLabels: Record<string, string> = {
    classic: '經典模式',
    speed: '快速模式',
    crazy: '瘋狂模式',
    battle_royale: '大逃殺',
  };
  const professions = ['賽博黑客', '金融巨鱷', '地產大亨', '科技先鋒', '街頭霸王', '夜之精靈'];
  const cards = ['黑紅利是', '數據外洩', '黑客轉帳', '獲得補貼', '維修費', '黑市交易', '系統維護', '傳送起點'];
  const opponents = ['AI 對手', '霓虹刺客', '數據幽靈', '影子商人', '量子駭客'];
  const results: ('win' | 'loss' | 'draw')[] = ['win', 'win', 'loss', 'win', 'loss', 'win', 'draw', 'loss'];

  const seed: MatchHistoryItem[] = [];
  const now = Date.now();

  for (let i = 0; i < 15; i += 1) {
    const mode = modes[i % modes.length];
    const result = results[i % results.length];
    const finalAssets = rand(5000, 45000);
    const highestAssets = finalAssets + rand(2000, 15000);
    const propertiesOwned = rand(3, 12);
    const housesBuilt = rand(0, 18);
    const hotelsBuilt = rand(0, 4);
    const totalIncome = rand(15000, 60000);
    const totalExpense = rand(10000, 40000);
    const tollIncome = rand(2000, 15000);
    const propertyInvestment = rand(5000, 25000);
    const fateCards = rand(2, 8);
    const chanceCards = rand(1, 5);

    seed.push({
      id: generateId(),
      // 依 i 遞減：i 天前 + 小於 1 小時的抖動，保證時間嚴格遞減
      date: new Date(now - i * 86400000 - rand(0, 3599999)).toISOString(),
      mode,
      opponent: opponents[i % opponents.length],
      result,
      duration: rand(180, 900),
      finalAssets,
      profession: professions[i % professions.length],
      rank: rand(1, 4),
      highestAssets,
      totalIncome,
      totalExpense,
      tollIncome,
      propertyInvestment,
      propertiesOwned,
      housesBuilt,
      hotelsBuilt,
      fateCardsDrawn: fateCards,
      chanceCardsDrawn: chanceCards,
      mostDrawnCard: cards[i % cards.length],
    });
  }
  // 確保有幾場連勝在最前面（當前連勝視覺效果）
  seed[0].result = 'win';
  seed[1].result = 'win';
  seed[2].result = 'win';

  return seed;
}

export interface UseMatchHistoryReturn {
  matches: MatchHistoryItem[];
  addMatch: (match: Omit<MatchHistoryItem, 'id' | 'date'>) => void;
  clear: () => void;
}

export function useMatchHistory(): UseMatchHistoryReturn {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);

  useEffect(() => {
    let loaded = loadFromStorage();
    if (loaded.length === 0) {
      const seeded = localStorage.getItem(SEED_KEY);
      if (!seeded) {
        loaded = generateSeedMatches();
        saveToStorage(loaded);
        try {
          localStorage.setItem(SEED_KEY, '1');
        } catch {
          // ignore
        }
      }
    }
    setMatches(loaded);
  }, []);

  const addMatch = useCallback(
    (match: Omit<MatchHistoryItem, 'id' | 'date'>): void => {
      setMatches((prev) => {
        const newItem: MatchHistoryItem = {
          ...match,
          id: generateId(),
          date: new Date().toISOString(),
        };
        const next = [newItem, ...prev].slice(0, MAX_ITEMS);
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const clear = useCallback((): void => {
    setMatches([]);
    saveToStorage([]);
    // 一併清除 seed 標記，讓下次開啟能重新產生示範資料
    try {
      localStorage.removeItem(SEED_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { matches, addMatch, clear };
}
