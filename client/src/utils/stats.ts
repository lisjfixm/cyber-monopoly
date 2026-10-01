import type { MatchHistoryItem } from '@shared/api.interface';
import { CELLS, MODE_LABELS } from '@shared/game-config';

function safeNum(v: number | undefined): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

// 計算勝率（返回百分比 0-100）
export function calcWinRate(matches: MatchHistoryItem[]): number {
  if (matches.length === 0) return 0;
  const wins = matches.filter((m: MatchHistoryItem) => m.result === 'win').length;
  return (wins / matches.length) * 100;
}

// 最近N局勝率走勢（返回數組，每局累計勝率）
export function calcWinRateTrend(
  matches: MatchHistoryItem[],
  n: number = 10,
): { game: number; winRate: number }[] {
  const recent = matches.slice(0, n).reverse();
  const result: { game: number; winRate: number }[] = [];
  let cumulativeWins = 0;
  for (let i = 0; i < recent.length; i += 1) {
    if (recent[i].result === 'win') cumulativeWins += 1;
    result.push({
      game: i + 1,
      winRate: Number(((cumulativeWins / (i + 1)) * 100).toFixed(1)),
    });
  }
  return result;
}

// 各職業勝率排行
export function calcProfessionStats(
  matches: MatchHistoryItem[],
): { profession: string; wins: number; total: number; winRate: number; avgRank: number }[] {
  const map = new Map<string, { wins: number; total: number; rankSum: number }>();
  for (const match of matches) {
    const prof = match.profession || '未知';
    const current = map.get(prof) || { wins: 0, total: 0, rankSum: 0 };
    current.total += 1;
    if (match.result === 'win') current.wins += 1;
    if (typeof match.rank === 'number') current.rankSum += match.rank;
    map.set(prof, current);
  }
  const result = Array.from(map.entries()).map(([profession, stats]) => ({
    profession,
    wins: stats.wins,
    total: stats.total,
    winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
    avgRank: stats.total > 0 && stats.rankSum > 0 ? Number((stats.rankSum / stats.total).toFixed(2)) : 0,
  }));
  result.sort((a, b) => b.winRate - a.winRate || b.total - a.total);
  return result;
}

// 最愛地塊（根據對局數模擬代表性地塊購買次數）
export function calcFavoriteProperties(
  matches: MatchHistoryItem[],
): { name: string; count: number }[] {
  if (matches.length === 0) return [];
  const propertyCells = CELLS.filter((c) => c.type === 'property');
  const selected = propertyCells.slice(0, 8);
  const baseCount = matches.length * 2;
  return selected.map((cell, index: number) => ({
    name: cell.name,
    count: Math.max(1, Math.round(baseCount * (1 - index * 0.1) * (0.7 + Math.random() * 0.6))),
  }));
}

// 平均遊戲時長（秒）
export function calcAverageDuration(matches: MatchHistoryItem[]): number {
  if (matches.length === 0) return 0;
  const total = matches.reduce((sum: number, m: MatchHistoryItem) => sum + m.duration, 0);
  return Math.round(total / matches.length);
}

// 總對局數、總勝場等概覽
export function calcOverview(matches: MatchHistoryItem[]): {
  total: number;
  wins: number;
  winRate: number;
  avgDuration: number;
  favoriteProfession: string | null;
  totalProfit: number;
  highestAssets: number;
  longestWinStreak: number;
  currentWinStreak: number;
} {
  const total = matches.length;
  const wins = matches.filter((m: MatchHistoryItem) => m.result === 'win').length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const avgDuration = calcAverageDuration(matches);

  const profStats = calcProfessionStats(matches);
  const favoriteProfession = profStats.length > 0 ? profStats[0].profession : null;

  let totalProfit = 0;
  let highestAssets = 0;
  for (const m of matches) {
    totalProfit += safeNum(m.totalIncome) - safeNum(m.totalExpense);
    if (typeof m.highestAssets === 'number' && m.highestAssets > highestAssets) {
      highestAssets = m.highestAssets;
    }
    if (m.finalAssets > highestAssets) highestAssets = m.finalAssets;
  }

  const { longest: longestWinStreak, current: currentWinStreak } = calcWinStreaks(matches);

  return {
    total,
    wins,
    winRate,
    avgDuration,
    favoriteProfession,
    totalProfit,
    highestAssets,
    longestWinStreak,
    currentWinStreak,
  };
}

// 模式統計
export function calcModeStats(
  matches: MatchHistoryItem[],
): { mode: string; label: string; total: number; wins: number; winRate: number; avgDuration: number }[] {
  const map = new Map<string, { total: number; wins: number; durationSum: number }>();
  for (const m of matches) {
    const current = map.get(m.mode) || { total: 0, wins: 0, durationSum: 0 };
    current.total += 1;
    if (m.result === 'win') current.wins += 1;
    current.durationSum += m.duration;
    map.set(m.mode, current);
  }
  return Array.from(map.entries()).map(([mode, s]) => ({
    mode,
    label: (MODE_LABELS as Record<string, string>)[mode] || mode,
    total: s.total,
    wins: s.wins,
    winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    avgDuration: s.total > 0 ? Math.round(s.durationSum / s.total) : 0,
  }));
}

// 財務分析
export function calcFinanceStats(matches: MatchHistoryItem[]): {
  totalIncome: number;
  totalExpense: number;
  tollIncome: number;
  propertyInvestment: number;
  propertyROI: number;
  assetDistribution: { name: string; value: number; color: string }[];
} {
  let totalIncome = 0;
  let totalExpense = 0;
  let tollIncome = 0;
  let propertyInvestment = 0;

  for (const m of matches) {
    totalIncome += safeNum(m.totalIncome);
    totalExpense += safeNum(m.totalExpense);
    tollIncome += safeNum(m.tollIncome);
    propertyInvestment += safeNum(m.propertyInvestment);
  }

  const netProfit = totalIncome - totalExpense;
  const propertyROI = propertyInvestment > 0
    ? Number(((tollIncome / propertyInvestment) * 100).toFixed(1))
    : 0;

  const cash = Math.max(0, netProfit * 0.35);
  const property = propertyInvestment > 0 ? propertyInvestment : Math.max(0, netProfit * 0.45);
  const buildings = tollIncome > 0 ? tollIncome * 2 : Math.max(0, netProfit * 0.15);
  const other = Math.max(0, netProfit * 0.05);

  const assetDistribution = [
    { name: '現金', value: Math.round(cash), color: '#00ffff' },
    { name: '地產', value: Math.round(property), color: '#ff6b9d' },
    { name: '建築', value: Math.round(buildings), color: '#ffcc00' },
    { name: '其他', value: Math.round(other), color: '#a855f7' },
  ];

  return { totalIncome, totalExpense, tollIncome, propertyInvestment, propertyROI, assetDistribution };
}

// 地產統計
export function calcPropertyStats(matches: MatchHistoryItem[]): {
  totalProperties: number;
  totalHouses: number;
  totalHotels: number;
} {
  let totalProperties = 0;
  let totalHouses = 0;
  let totalHotels = 0;
  for (const m of matches) {
    totalProperties += safeNum(m.propertiesOwned);
    totalHouses += safeNum(m.housesBuilt);
    totalHotels += safeNum(m.hotelsBuilt);
  }
  return { totalProperties, totalHouses, totalHotels };
}

// 卡牌統計
export function calcCardStats(matches: MatchHistoryItem[]): {
  fateCards: number;
  chanceCards: number;
  mostLuckyCard: string;
} {
  let fateCards = 0;
  let chanceCards = 0;
  const cardCount = new Map<string, number>();
  for (const m of matches) {
    fateCards += safeNum(m.fateCardsDrawn);
    chanceCards += safeNum(m.chanceCardsDrawn);
    if (m.mostDrawnCard) {
      cardCount.set(m.mostDrawnCard, (cardCount.get(m.mostDrawnCard) || 0) + 1);
    }
  }
  let mostLuckyCard = '—';
  let maxCount = 0;
  for (const [card, count] of cardCount) {
    if (count > maxCount) {
      maxCount = count;
      mostLuckyCard = card;
    }
  }
  return { fateCards, chanceCards, mostLuckyCard };
}

// 時間統計
export function calcTimeStats(matches: MatchHistoryItem[]): {
  totalDuration: number;
  avgDuration: number;
  longestDuration: number;
} {
  let totalDuration = 0;
  let longestDuration = 0;
  for (const m of matches) {
    totalDuration += m.duration;
    if (m.duration > longestDuration) longestDuration = m.duration;
  }
  const avgDuration = matches.length > 0 ? Math.round(totalDuration / matches.length) : 0;
  return { totalDuration, avgDuration, longestDuration };
}

// 連勝統計
export function calcWinStreaks(matches: MatchHistoryItem[]): { longest: number; current: number } {
  if (matches.length === 0) return { longest: 0, current: 0 };
  let longest = 0;
  let current = 0;
  // 最新在前，從最舊往最新算當前連勝
  const chronological = [...matches].reverse();
  for (const m of chronological) {
    if (m.result === 'win') {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return { longest, current };
}

// 格式化時長（秒 → mm:ss 或 X分Y秒）
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}秒`;
  if (secs === 0) return `${mins}分`;
  return `${mins}分${secs}秒`;
}

// 格式化日期
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 大數字格式化（萬/億）
export function formatBigNumber(num: number): string {
  if (Math.abs(num) >= 100000000) return `${(num / 100000000).toFixed(2)}億`;
  if (Math.abs(num) >= 10000) return `${(num / 10000).toFixed(1)}萬`;
  return num.toLocaleString();
}
