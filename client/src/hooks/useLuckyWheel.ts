import { useCallback, useEffect, useMemo, useState } from 'react';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';
import { addCoins, getCoins } from '@client/src/hooks/useDailyCheckin';
import { useSkinUpgrade } from '@client/src/hooks/useSkinUpgrade';

const STORAGE_KEY = 'cyber_monopoly_lucky_wheel';

export type WheelRewardType =
  | 'coins'
  | 'fragments'
  | 'big_coins'
  | 'big_fragments'
  | 'jackpot'
  | 'nothing';

export interface WheelPrize {
  id: number;
  type: WheelRewardType;
  label: string;
  amount: number;
  weight: number;
  color: string;
  textColor: string;
}

// 8 等分獎盤（順時針，從正上方開始）
export const WHEEL_PRIZES: WheelPrize[] = [
  { id: 0, type: 'coins',       label: '金幣 ×100',  amount: 100, weight: 20, color: 'rgba(0,255,255,0.15)',  textColor: 'var(--cyan)' },
  { id: 1, type: 'fragments',  label: '碎片 ×5',    amount: 5,   weight: 18, color: 'rgba(168,85,247,0.15)',textColor: 'var(--purple)' },
  { id: 2, type: 'nothing',     label: '謝謝參與',   amount: 0,   weight: 16, color: 'rgba(255,255,255,0.05)',textColor: 'var(--text-secondary)' },
  { id: 3, type: 'big_coins',   label: '金幣 ×300',  amount: 300, weight: 14, color: 'rgba(255,200,0,0.15)', textColor: 'var(--yellow)' },
  { id: 4, type: 'fragments',  label: '碎片 ×5',    amount: 5,   weight: 12, color: 'rgba(168,85,247,0.15)',textColor: 'var(--purple)' },
  { id: 5, type: 'big_fragments', label: '碎片 ×15', amount: 15,  weight: 10, color: 'rgba(255,107,157,0.15)', textColor: 'var(--pink)' },
  { id: 6, type: 'big_coins',   label: '金幣 ×500',  amount: 500, weight: 7,  color: 'rgba(255,200,0,0.25)', textColor: 'var(--yellow)' },
  { id: 7, type: 'jackpot',    label: '傳說寶箱',   amount: 50,  weight: 3,  color: 'rgba(255,0,128,0.25)', textColor: 'var(--pink)' },
];

interface WheelData {
  lastSpinDate: string;
  totalSpins: number;
  history: Array<{ date: string; prizeId: number }>;
}

const DEFAULT_DATA: WheelData = {
  lastSpinDate: '',
  totalSpins: 0,
  history: [],
};

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readData(): WheelData {
  const raw = safeGetJSON<Partial<WheelData>>(STORAGE_KEY, {});
  return {
    lastSpinDate: raw.lastSpinDate ?? '',
    totalSpins: raw.totalSpins ?? 0,
    history: Array.isArray(raw.history) ? raw.history.slice(-30) : [],
  };
}

function pickPrizeIndex(): number {
  const total = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WHEEL_PRIZES.length; i += 1) {
    r -= WHEEL_PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

export interface SpinResult {
  prize: WheelPrize;
  coinDelta: number;
  fragmentDelta: number;
  isNew: boolean;
}

export function useLuckyWheel() {
  const [data, setData] = useState<WheelData>(() => readData());
  const { addFragments } = useSkinUpgrade();
  const [coins, setCoins] = useState<number>(() => getCoins());

  useEffect(() => {
    safeSetJSON(STORAGE_KEY, data);
  }, [data]);

  const canSpin = useMemo(() => data.lastSpinDate !== getTodayStr(), [data.lastSpinDate]);

  const spin = useCallback((): SpinResult => {
    if (!canSpin) {
      throw new Error('今日已轉過，請明日再來');
    }
    const idx = pickPrizeIndex();
    const prize = WHEEL_PRIZES[idx];

    let coinDelta = 0;
    let fragmentDelta = 0;

    if (prize.type === 'coins' || prize.type === 'big_coins') {
      coinDelta = prize.amount;
      addCoins(coinDelta);
      setCoins(getCoins());
    } else if (prize.type === 'fragments' || prize.type === 'big_fragments') {
      fragmentDelta = prize.amount;
      addFragments(fragmentDelta);
    } else if (prize.type === 'jackpot') {
      // 傳說寶箱：50 碎片
      fragmentDelta = prize.amount;
      addFragments(fragmentDelta);
    }

    const today = getTodayStr();
    setData((prev) => ({
      lastSpinDate: today,
      totalSpins: prev.totalSpins + 1,
      history: [...prev.history.slice(-29), { date: today, prizeId: prize.id }],
    }));

    return { prize, coinDelta, fragmentDelta, isNew: true };
  }, [canSpin, addFragments]);

  return {
    canSpin,
    totalSpins: data.totalSpins,
    history: data.history,
    coins,
    prizes: WHEEL_PRIZES,
    spin,
    // 供 UI 計算旋轉角度時使用（索引 → 最終角度）
    getPrizeIndex: pickPrizeIndex,
  };
}
