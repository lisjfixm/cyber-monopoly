import { d as createLucideIcon, r as reactExports, v as MODE_LABELS, u as useNavigate, j as jsxRuntimeExports, aN as Target, S as Swords, aP as TrendingUp, be as Flame, aQ as TrendingDown, aB as Clock, aI as Trophy, b5 as ChartColumn, bv as Briefcase, aL as Star, bw as Landmark, bx as Dices, b9 as Sparkles, bu as Heart, by as Skull, T as Timer, bz as Snowflake, C as ChevronUp, f as ChevronDown, bA as Wallet, aJ as Coins, bB as Building2, bC as House, bD as Layers, U as Users } from "./index-Clt-7orM.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { A as Activity } from "./activity-DrrFP8_V.js";
import { C as Calendar } from "./calendar-CRcfGMkZ.js";
const __iconNode = [
  [
    "path",
    {
      d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
      key: "pzmjnu"
    }
  ],
  ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }]
];
const ChartPie = createLucideIcon("chart-pie", __iconNode);
const STORAGE_KEY = "cyber_monopoly_match_history";
const SEED_KEY = "cyber_monopoly_stats_seeded";
const MAX_ITEMS = 50;
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}
function saveToStorage(matches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch {
  }
}
function generateId() {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateSeedMatches() {
  const modes = ["classic", "speed", "crazy", "battle_royale"];
  const professions = ["賽博黑客", "金融巨鱷", "地產大亨", "科技先鋒", "街頭霸王", "夜之精靈"];
  const cards = ["黑紅利是", "數據外洩", "黑客轉帳", "獲得補貼", "維修費", "黑市交易", "系統維護", "傳送起點"];
  const opponents = ["AI 對手", "霓虹刺客", "數據幽靈", "影子商人", "量子駭客"];
  const results = ["win", "win", "loss", "win", "loss", "win", "draw", "loss"];
  const seed = [];
  const now = Date.now();
  for (let i = 0; i < 15; i += 1) {
    const mode = modes[i % modes.length];
    const result = results[i % results.length];
    const finalAssets = rand(5e3, 45e3);
    const highestAssets = finalAssets + rand(2e3, 15e3);
    const propertiesOwned = rand(3, 12);
    const housesBuilt = rand(0, 18);
    const hotelsBuilt = rand(0, 4);
    const totalIncome = rand(15e3, 6e4);
    const totalExpense = rand(1e4, 4e4);
    const tollIncome = rand(2e3, 15e3);
    const propertyInvestment = rand(5e3, 25e3);
    const fateCards = rand(2, 8);
    const chanceCards = rand(1, 5);
    seed.push({
      id: generateId(),
      // 依 i 遞減：i 天前 + 小於 1 小時的抖動，保證時間嚴格遞減
      date: new Date(now - i * 864e5 - rand(0, 3599999)).toISOString(),
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
      mostDrawnCard: cards[i % cards.length]
    });
  }
  seed[0].result = "win";
  seed[1].result = "win";
  seed[2].result = "win";
  return seed;
}
function useMatchHistory() {
  const [matches, setMatches] = reactExports.useState([]);
  reactExports.useEffect(() => {
    let loaded = loadFromStorage();
    if (loaded.length === 0) {
      const seeded = localStorage.getItem(SEED_KEY);
      if (!seeded) {
        loaded = generateSeedMatches();
        saveToStorage(loaded);
        try {
          localStorage.setItem(SEED_KEY, "1");
        } catch {
        }
      }
    }
    setMatches(loaded);
  }, []);
  const addMatch = reactExports.useCallback((match) => {
    setMatches((prev) => {
      const newItem = {
        ...match,
        id: generateId(),
        date: (/* @__PURE__ */ new Date()).toISOString()
      };
      const next = [newItem, ...prev].slice(0, MAX_ITEMS);
      saveToStorage(next);
      return next;
    });
  }, []);
  const clear = reactExports.useCallback(() => {
    setMatches([]);
    saveToStorage([]);
    try {
      localStorage.removeItem(SEED_KEY);
    } catch {
    }
  }, []);
  return {
    matches,
    addMatch,
    clear
  };
}
function safeNum(v) {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}
function calcWinRateTrend(matches, n = 10) {
  const recent = matches.slice(0, n).reverse();
  const result = [];
  let cumulativeWins = 0;
  for (let i = 0; i < recent.length; i += 1) {
    if (recent[i].result === "win") cumulativeWins += 1;
    result.push({
      game: i + 1,
      winRate: Number((cumulativeWins / (i + 1) * 100).toFixed(1))
    });
  }
  return result;
}
function calcProfessionStats(matches) {
  const map = /* @__PURE__ */ new Map();
  for (const match of matches) {
    const prof = match.profession || "未知";
    const current = map.get(prof) || {
      wins: 0,
      total: 0,
      rankSum: 0
    };
    current.total += 1;
    if (match.result === "win") current.wins += 1;
    if (typeof match.rank === "number") current.rankSum += match.rank;
    map.set(prof, current);
  }
  const result = Array.from(map.entries()).map(([profession, stats]) => ({
    profession,
    wins: stats.wins,
    total: stats.total,
    winRate: stats.total > 0 ? stats.wins / stats.total * 100 : 0,
    avgRank: stats.total > 0 && stats.rankSum > 0 ? Number((stats.rankSum / stats.total).toFixed(2)) : 0
  }));
  result.sort((a, b) => b.winRate - a.winRate || b.total - a.total);
  return result;
}
function calcAverageDuration(matches) {
  if (matches.length === 0) return 0;
  const total = matches.reduce((sum, m) => sum + safeNum(m.duration), 0);
  return Math.round(total / matches.length);
}
function calcOverview(matches) {
  const total = matches.length;
  const wins = matches.filter((m) => m.result === "win").length;
  const winRate = total > 0 ? wins / total * 100 : 0;
  const avgDuration = calcAverageDuration(matches);
  const profStats = calcProfessionStats(matches);
  const favoriteProfession = profStats.length > 0 ? profStats[0].profession : null;
  let totalProfit = 0;
  let highestAssets = 0;
  for (const m of matches) {
    totalProfit += safeNum(m.totalIncome) - safeNum(m.totalExpense);
    if (typeof m.highestAssets === "number" && m.highestAssets > highestAssets) {
      highestAssets = m.highestAssets;
    }
    const finalAssets = safeNum(m.finalAssets);
    if (finalAssets > highestAssets) highestAssets = finalAssets;
  }
  const {
    longest: longestWinStreak,
    current: currentWinStreak
  } = calcWinStreaks(matches);
  return {
    total,
    wins,
    winRate,
    avgDuration,
    favoriteProfession,
    totalProfit,
    highestAssets,
    longestWinStreak,
    currentWinStreak
  };
}
function calcModeStats(matches) {
  const map = /* @__PURE__ */ new Map();
  for (const m of matches) {
    const mode = typeof m.mode === "string" ? m.mode : "unknown";
    const current = map.get(mode) || {
      total: 0,
      wins: 0,
      durationSum: 0
    };
    current.total += 1;
    if (m.result === "win") current.wins += 1;
    current.durationSum += safeNum(m.duration);
    map.set(mode, current);
  }
  return Array.from(map.entries()).map(([mode, s]) => ({
    mode,
    label: MODE_LABELS[mode] || mode,
    total: s.total,
    wins: s.wins,
    winRate: s.total > 0 ? s.wins / s.total * 100 : 0,
    avgDuration: s.total > 0 ? Math.round(s.durationSum / s.total) : 0
  }));
}
function calcFinanceStats(matches) {
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
  const propertyROI = propertyInvestment > 0 ? Number((tollIncome / propertyInvestment * 100).toFixed(1)) : 0;
  const cash = Math.max(0, netProfit * 0.35);
  const property = propertyInvestment > 0 ? propertyInvestment : Math.max(0, netProfit * 0.45);
  const buildings = tollIncome > 0 ? tollIncome * 2 : Math.max(0, netProfit * 0.15);
  const other = Math.max(0, netProfit * 0.05);
  const assetDistribution = [{
    name: "現金",
    value: Math.round(cash),
    color: "#00ffff"
  }, {
    name: "地產",
    value: Math.round(property),
    color: "#ff6b9d"
  }, {
    name: "建築",
    value: Math.round(buildings),
    color: "#ffcc00"
  }, {
    name: "其他",
    value: Math.round(other),
    color: "#a855f7"
  }];
  return {
    totalIncome,
    totalExpense,
    tollIncome,
    propertyInvestment,
    propertyROI,
    assetDistribution
  };
}
function calcPropertyStats(matches) {
  let totalProperties = 0;
  let totalHouses = 0;
  let totalHotels = 0;
  for (const m of matches) {
    totalProperties += safeNum(m.propertiesOwned);
    totalHouses += safeNum(m.housesBuilt);
    totalHotels += safeNum(m.hotelsBuilt);
  }
  return {
    totalProperties,
    totalHouses,
    totalHotels
  };
}
function calcCardStats(matches) {
  let fateCards = 0;
  let chanceCards = 0;
  const cardCount = /* @__PURE__ */ new Map();
  for (const m of matches) {
    fateCards += safeNum(m.fateCardsDrawn);
    chanceCards += safeNum(m.chanceCardsDrawn);
    if (m.mostDrawnCard) {
      cardCount.set(m.mostDrawnCard, (cardCount.get(m.mostDrawnCard) || 0) + 1);
    }
  }
  let mostLuckyCard = "—";
  let maxCount = 0;
  for (const [card, count] of cardCount) {
    if (count > maxCount) {
      maxCount = count;
      mostLuckyCard = card;
    }
  }
  return {
    fateCards,
    chanceCards,
    mostLuckyCard
  };
}
function calcTimeStats(matches) {
  let totalDuration = 0;
  let longestDuration = 0;
  for (const m of matches) {
    const d = safeNum(m.duration);
    totalDuration += d;
    if (d > longestDuration) longestDuration = d;
  }
  const avgDuration = matches.length > 0 ? Math.round(totalDuration / matches.length) : 0;
  return {
    totalDuration,
    avgDuration,
    longestDuration
  };
}
function calcWinStreaks(matches) {
  if (matches.length === 0) return {
    longest: 0,
    current: 0
  };
  let longest = 0;
  let current = 0;
  const chronological = [...matches].reverse();
  for (const m of chronological) {
    if (m.result === "win") {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return {
    longest,
    current
  };
}
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}秒`;
  if (secs === 0) return `${mins}分`;
  return `${mins}分${secs}秒`;
}
function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatBigNumber(num) {
  if (Math.abs(num) >= 1e8) return `${(num / 1e8).toFixed(2)}億`;
  if (Math.abs(num) >= 1e4) return `${(num / 1e4).toFixed(1)}萬`;
  return num.toLocaleString();
}
const mockPropertyROI = [{
  propertyName: "高新園",
  cost: 4e3,
  rentEarned: 8520,
  roi: 213
}, {
  propertyName: "總部",
  cost: 3500,
  rentEarned: 6230,
  roi: 178
}, {
  propertyName: "企業樓",
  cost: 3600,
  rentEarned: 5800,
  roi: 161.1
}, {
  propertyName: "重工區",
  cost: 3800,
  rentEarned: 4200,
  roi: 110.5
}, {
  propertyName: "富豪區",
  cost: 2600,
  rentEarned: 2900,
  roi: 11.5
}, {
  propertyName: "金融街",
  cost: 1600,
  rentEarned: 1580,
  roi: -1.3
}, {
  propertyName: "舊城區",
  cost: 600,
  rentEarned: 420,
  roi: -30
}, {
  propertyName: "廢墟",
  cost: 2800,
  rentEarned: 1800,
  roi: -35.7
}];
const mockItemUsage = [{
  itemName: "時間停止",
  count: 142,
  ratio: 24.5
}, {
  itemName: "雙倍骰子",
  count: 118,
  ratio: 20.3
}, {
  itemName: "傳送門",
  count: 95,
  ratio: 16.4
}, {
  itemName: "能量護盾",
  count: 82,
  ratio: 14.1
}, {
  itemName: "數據洪流",
  count: 61,
  ratio: 10.5
}, {
  itemName: "量子糾纏",
  count: 48,
  ratio: 8.3
}, {
  itemName: "黑洞發生器",
  count: 23,
  ratio: 4
}, {
  itemName: "其他",
  count: 11,
  ratio: 1.9
}];
const mockFateCardStats = [{
  cardName: "黑客轉帳",
  type: "good",
  count: 128,
  probability: 14.2
}, {
  cardName: "獲得獎金",
  type: "good",
  count: 115,
  probability: 12.8
}, {
  cardName: "黑市交易",
  type: "good",
  count: 98,
  probability: 10.9
}, {
  cardName: "獲得補貼",
  type: "good",
  count: 87,
  probability: 9.7
}, {
  cardName: "前進3格",
  type: "good",
  count: 76,
  probability: 8.4
}, {
  cardName: "傳送到起點",
  type: "good",
  count: 62,
  probability: 6.9
}, {
  cardName: "繳納稅款",
  type: "bad",
  count: 110,
  probability: 12.2
}, {
  cardName: "數據洩露罰款",
  type: "bad",
  count: 89,
  probability: 9.9
}, {
  cardName: "維修費",
  type: "bad",
  count: 82,
  probability: 9.1
}, {
  cardName: "系統維護",
  type: "bad",
  count: 54,
  probability: 6
}, {
  cardName: "後退2格",
  type: "bad",
  count: 43,
  probability: 4.8
}, {
  cardName: "隨機傳送",
  type: "bad",
  count: 47,
  probability: 5.2
}];
function generatePeakTimeline(count) {
  const data = [];
  let base = 15e3;
  for (let i = 0; i < count; i += 1) {
    base += (Math.sin(i * 0.5) + Math.random() - 0.3) * 3500;
    base = Math.max(5e3, Math.min(65e3, base));
    data.push({
      game: i + 1,
      value: Math.round(base)
    });
  }
  return data;
}
const mockPeakTimeline = generatePeakTimeline(30);
const StatsDashboardPage = () => {
  const navigate = useNavigate();
  const {
    matches
  } = useMatchHistory();
  const overview = reactExports.useMemo(() => calcOverview(matches), [matches]);
  const winRateTrend10 = reactExports.useMemo(() => calcWinRateTrend(matches, 10), [matches]);
  const winRateTrend20 = reactExports.useMemo(() => calcWinRateTrend(matches, 20), [matches]);
  const winRateTrend50 = reactExports.useMemo(() => calcWinRateTrend(matches, 50), [matches]);
  const professionStats = reactExports.useMemo(() => calcProfessionStats(matches), [matches]);
  const modeStats = reactExports.useMemo(() => calcModeStats(matches), [matches]);
  const financeStats = reactExports.useMemo(() => calcFinanceStats(matches), [matches]);
  const propertyStats = reactExports.useMemo(() => calcPropertyStats(matches), [matches]);
  const cardStats = reactExports.useMemo(() => calcCardStats(matches), [matches]);
  const timeStats = reactExports.useMemo(() => calcTimeStats(matches), [matches]);
  const [trendRange, setTrendRange] = reactExports.useState(20);
  const [peakMode, setPeakMode] = reactExports.useState("peak");
  const [expandedMatches, setExpandedMatches] = reactExports.useState(/* @__PURE__ */ new Set());
  const toggleMatch = (id) => {
    setExpandedMatches((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const trendData = trendRange === 10 ? winRateTrend10 : trendRange === 20 ? winRateTrend20 : winRateTrend50;
  const totalPlayTimeHours = ((timeStats?.totalDuration ?? 0) / 3600).toFixed(1);
  const gameTimeDistribution = reactExports.useMemo(() => {
    const buckets = [{
      range: "短局 (<15分)",
      min: 0,
      max: 900,
      count: 0
    }, {
      range: "中局 (15-30分)",
      min: 900,
      max: 1800,
      count: 0
    }, {
      range: "長局 (30-60分)",
      min: 1800,
      max: 3600,
      count: 0
    }, {
      range: "超長局 (>60分)",
      min: 3600,
      max: Infinity,
      count: 0
    }];
    for (const m of matches) {
      const dur = typeof m.duration === "number" && Number.isFinite(m.duration) ? m.duration : 0;
      for (const b of buckets) {
        if (dur >= b.min && dur < b.max) {
          b.count += 1;
          break;
        }
      }
    }
    const total = matches.length || 1;
    return buckets.map((b) => ({
      range: b.range,
      count: b.count,
      ratio: b.count / total * 100
    }));
  }, [matches]);
  const longestLoseStreak = reactExports.useMemo(() => {
    let max = 0;
    let cur = 0;
    const chronological = [...matches].reverse();
    for (const m of chronological) {
      if (m.result === "loss") {
        cur += 1;
        max = Math.max(max, cur);
      } else {
        cur = 0;
      }
    }
    return max;
  }, [matches]);
  const modeBarData = modeStats.map((m) => ({
    label: m.label,
    value: m.winRate,
    subLabel: m.total + "場"
  }));
  const avgPropertyROI = reactExports.useMemo(() => {
    if (mockPropertyROI.length === 0) return 0;
    return mockPropertyROI.reduce((sum, item) => sum + item.roi, 0) / mockPropertyROI.length;
  }, []);
  const goodCardTotal = mockFateCardStats.filter((c) => c.type === "good").reduce((sum, c) => sum + c.count, 0);
  const badCardTotal = mockFateCardStats.filter((c) => c.type === "bad").reduce((sum, c) => sum + c.count, 0);
  const totalCards = goodCardTotal + badCardTotal;
  const goodCardRate = totalCards > 0 ? goodCardTotal / totalCards * 100 : 0;
  const totalItemUsage = mockItemUsage.reduce((sum, item) => sum + item.count, 0);
  const handleBack = () => {
    navigate("/profile");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "數據儀表板" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl w-full mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ai-section-type": "card-stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Target, title: "個人數據總覽", color: "var(--cyan)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "總對局數", value: overview.total, icon: Swords, color: "var(--cyan)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "勝率", value: `${overview.winRate.toFixed(1)}%`, icon: TrendingUp, color: "var(--pink)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "最大連勝", value: `${overview.longestWinStreak} 連勝`, icon: Flame, color: "#ff4d6d" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "最大連敗", value: `${longestLoseStreak} 連敗`, icon: TrendingDown, color: "#38bdf8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "生涯時長", value: `${totalPlayTimeHours} 小時`, icon: Clock, color: "var(--purple)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "歷史最高資產", value: formatBigNumber(overview.highestAssets), icon: Trophy, color: "#ffcc00" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(0, 255, 255, 0.3)",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: TrendingUp, title: "勝率趨勢圖", color: "var(--cyan)", noMargin: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [10, 20, 50].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setTrendRange(n), className: "cyber-btn-sm cyber-btn px-2 py-1 text-xs font-cyber tracking-wider", style: {
            borderColor: trendRange === n ? "var(--cyan)" : "rgba(0,255,255,0.2)",
            color: trendRange === n ? "var(--cyan)" : "var(--text-secondary)",
            background: trendRange === n ? "rgba(0,255,255,0.08)" : "transparent",
            boxShadow: trendRange === n ? "0 0 8px rgba(0,255,255,0.2)" : "none"
          }, children: [
            "近",
            n,
            "局"
          ] }, n)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md p-3 md:p-4", style: {
          background: "hsl(240, 20%, 8%)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SvgLineChart, { data: trendData.map((d) => ({
          x: d.game,
          y: d.winRate
        })), color: "#00ffff", yMax: 100, yMin: 0, yUnit: "%", xLabel: "局數" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 md:gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
          borderColor: "rgba(168, 85, 247, 0.3)",
          boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: ChartColumn, title: "各模式勝率對比", color: "var(--purple)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md p-3 md:p-4", style: {
            background: "hsl(240, 20%, 8%)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SvgBarChart, { data: modeBarData, colors: ["#00ffff", "#a855f7", "#ff6b9d", "#ff8c42", "#4ade80"] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
          borderColor: "rgba(255, 107, 157, 0.3)",
          boxShadow: "0 0 15px rgba(255, 107, 157, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Briefcase, title: "各職業勝率排行", color: "var(--pink)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: (professionStats.length > 0 ? professionStats : []).map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 md:w-24 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono", style: {
                color: "var(--text-muted)"
              }, children: String(idx + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs md:text-sm flex-1", style: {
                color: "var(--text-primary)"
              }, children: p.profession }),
              idx === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, style: {
                color: "#ffcc00"
              } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-4 rounded-sm overflow-hidden", style: {
              background: "rgba(255,255,255,0.06)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-sm transition-all duration-500", style: {
              width: `${p.winRate}%`,
              background: `linear-gradient(90deg, var(--pink), #ff8c42)`,
              boxShadow: "0 0 6px rgba(255, 107, 157, 0.5)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono w-12 text-right", style: {
              color: p.winRate >= 50 ? "#4ade80" : "#ff4d6d"
            }, children: [
              p.winRate.toFixed(1),
              "%"
            ] })
          ] }, p.profession)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(74, 222, 128, 0.3)",
        boxShadow: "0 0 15px rgba(74, 222, 128, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Landmark, title: "地產投資回報率統計", color: "#4ade80", noMargin: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded", style: {
            color: "#ffcc00",
            border: "1px solid rgba(255,204,0,0.3)",
            background: "rgba(255,204,0,0.08)"
          }, children: "示例數據" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-xs", style: {
          color: "var(--text-muted)"
        }, children: "（示例數據 · 待接入真實接口）" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", style: {
            borderColor: "rgba(74, 222, 128, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "地產名稱" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "購入成本" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "累計租金收入" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "ROI%" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: mockPropertyROI.map((prop) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b transition-colors hover:bg-white/5", style: {
            borderColor: "rgba(255,255,255,0.05)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", style: {
              color: "var(--text-primary)"
            }, children: prop.propertyName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right font-mono", style: {
              color: "var(--text-secondary)"
            }, children: formatBigNumber(prop.cost) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right font-mono", style: {
              color: "#ffcc00"
            }, children: formatBigNumber(prop.rentEarned) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right font-mono font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
              color: prop.roi >= 100 ? "#4ade80" : prop.roi < 0 ? "#ff4d6d" : "var(--text-primary)",
              textShadow: prop.roi >= 100 ? "0 0 8px rgba(74,222,128,0.5)" : prop.roi < 0 ? "0 0 8px rgba(255,77,109,0.5)" : "none"
            }, children: [
              prop.roi > 0 ? "+" : "",
              prop.roi.toFixed(1),
              "%"
            ] }) })
          ] }, prop.propertyName)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2", style: {
            borderColor: "rgba(74, 222, 128, 0.3)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "py-2.5 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "平均 ROI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-2 text-right font-mono font-bold text-base", style: {
              color: "#4ade80"
            }, children: [
              avgPropertyROI > 0 ? "+" : "",
              avgPropertyROI.toFixed(1),
              "%"
            ] })
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(255, 140, 66, 0.3)",
        boxShadow: "0 0 15px rgba(255, 140, 66, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Dices, title: "道具使用頻率統計", color: "#ff8c42", noMargin: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded", style: {
            color: "#ffcc00",
            border: "1px solid rgba(255,204,0,0.3)",
            background: "rgba(255,204,0,0.08)"
          }, children: "示例數據" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-xs", style: {
          color: "var(--text-muted)"
        }, children: "（示例數據 · 待接入真實接口）" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SvgDonutChart, { data: mockItemUsage.map((item, i) => ({
            label: item.itemName,
            value: item.count,
            color: ["#ff8c42", "#00ffff", "#ff6b9d", "#4ade80", "#a855f7", "#ffcc00", "#38bdf8", "#6b7280"][i % 8]
          })), centerLabel: "總使用次數", centerValue: totalItemUsage.toString() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: mockItemUsage.map((item, i) => {
            const colors = ["#ff8c42", "#00ffff", "#ff6b9d", "#4ade80", "#a855f7", "#ffcc00", "#38bdf8", "#6b7280"];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full flex-shrink-0", style: {
                backgroundColor: colors[i % 8],
                boxShadow: `0 0 6px ${colors[i % 8]}`
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs flex-1", style: {
                color: "var(--text-primary)"
              }, children: item.itemName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono", style: {
                color: "var(--text-secondary)"
              }, children: item.count }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono w-12 text-right", style: {
                color: colors[i % 8]
              }, children: [
                item.ratio.toFixed(1),
                "%"
              ] })
            ] }, item.itemName);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(168, 85, 247, 0.3)",
        boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Sparkles, title: "命運卡抽到概率統計", color: "var(--purple)", noMargin: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded", style: {
            color: "#ffcc00",
            border: "1px solid rgba(255,204,0,0.3)",
            background: "rgba(255,204,0,0.08)"
          }, children: "示例數據" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-xs", style: {
          color: "var(--text-muted)"
        }, children: "（示例數據 · 待接入真實接口）" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 16, style: {
                color: "#4ade80"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
                color: "#4ade80"
              }, children: "好命運" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: mockFateCardStats.filter((c) => c.type === "good").map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-primary)"
                }, children: card.cardName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  card.count,
                  "次 · ",
                  card.probability.toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: {
                background: "rgba(255,255,255,0.06)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
                width: `${card.probability * 5}%`,
                background: "linear-gradient(90deg, #4ade80, #00ffff)",
                boxShadow: "0 0 4px rgba(74,222,128,0.5)"
              } }) })
            ] }, card.cardName)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { size: 16, style: {
                color: "#ff4d6d"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
                color: "#ff4d6d"
              }, children: "壞命運" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: mockFateCardStats.filter((c) => c.type === "bad").map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-primary)"
                }, children: card.cardName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  card.count,
                  "次 · ",
                  card.probability.toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: {
                background: "rgba(255,255,255,0.06)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
                width: `${card.probability * 5}%`,
                background: "linear-gradient(90deg, #ff4d6d, #ff8c42)",
                boxShadow: "0 0 4px rgba(255,77,109,0.5)"
              } }) })
            ] }, card.cardName)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-3 border-t flex items-center justify-between", style: {
          borderColor: "rgba(168, 85, 247, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider", style: {
            color: "var(--text-secondary)"
          }, children: "好運率（好牌 / 總抽卡）" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-xl tracking-wider", style: {
            color: goodCardRate >= 50 ? "#4ade80" : "#ff4d6d",
            textShadow: `0 0 10px ${goodCardRate >= 50 ? "rgba(74,222,128,0.5)" : "rgba(255,77,109,0.5)"}`
          }, children: [
            goodCardRate.toFixed(1),
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(0, 255, 255, 0.25)",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.08)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Timer, title: "遊戲時長統計", color: "var(--cyan)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SvgPieChart, { data: gameTimeDistribution.map((b, i) => ({
            label: b.range,
            value: b.count,
            color: ["#00ffff", "#4ade80", "#ffcc00", "#ff4d6d"][i % 4]
          })) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-center", style: {
              background: "rgba(0, 255, 255, 0.06)",
              border: "1px solid rgba(0, 255, 255, 0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-1", style: {
                color: "var(--text-secondary)"
              }, children: "平均每局時長" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-2xl tracking-wider", style: {
                color: "var(--cyan)",
                textShadow: "0 0 10px rgba(0,255,255,0.5)"
              }, children: formatDuration(timeStats.avgDuration) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded text-center", style: {
                background: "rgba(255,77,109,0.06)",
                border: "1px solid rgba(255,77,109,0.2)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-0.5", style: {
                  color: "var(--text-secondary)"
                }, children: "最長一局" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-base", style: {
                  color: "#ff4d6d"
                }, children: formatDuration(timeStats.longestDuration) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded text-center", style: {
                background: "rgba(74,222,128,0.06)",
                border: "1px solid rgba(74,222,128,0.2)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-0.5", style: {
                  color: "var(--text-secondary)"
                }, children: "最短一局" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-base", style: {
                  color: "#4ade80"
                }, children: "8分20秒" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 pt-2", children: gameTimeDistribution.map((b, i) => {
              const colors = ["#00ffff", "#4ade80", "#ffcc00", "#ff4d6d"];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm", style: {
                  backgroundColor: colors[i % 4],
                  boxShadow: `0 0 4px ${colors[i % 4]}`
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", style: {
                  color: "var(--text-primary)"
                }, children: b.range }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", style: {
                  color: colors[i % 4]
                }, children: [
                  b.count,
                  "局 · ",
                  b.ratio.toFixed(1),
                  "%"
                ] })
              ] }, b.range);
            }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(255, 204, 0, 0.3)",
        boxShadow: "0 0 15px rgba(255, 204, 0, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Activity, title: "資產峰值時間線", color: "#ffcc00", noMargin: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
            color: "var(--text-muted)"
          }, children: "（示例數據 · 待接入真實接口）" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["peak", "valley"].map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPeakMode(mode), className: "cyber-btn-sm cyber-btn px-2 py-1 text-xs font-cyber tracking-wider", style: {
            borderColor: peakMode === mode ? "#ffcc00" : "rgba(255,204,0,0.2)",
            color: peakMode === mode ? "#ffcc00" : "var(--text-secondary)",
            background: peakMode === mode ? "rgba(255,204,0,0.08)" : "transparent",
            boxShadow: peakMode === mode ? "0 0 8px rgba(255,204,0,0.2)" : "none"
          }, children: mode === "peak" ? "峰值" : "谷值" }, mode)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md p-3 md:p-4", style: {
          background: "hsl(240, 20%, 8%)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SvgLineChart, { data: mockPeakTimeline.map((d) => ({
          x: d.game,
          y: d.value
        })), color: "#ffcc00", xLabel: "局數", yUnit: "", showPeakMarker: peakMode === "peak", showValleyMarker: peakMode === "valley", valueFormatter: (v) => formatBigNumber(v) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 md:gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 md:p-6 relative overflow-hidden", style: {
          borderColor: "rgba(255, 77, 109, 0.4)",
          boxShadow: "0 0 20px rgba(255, 77, 109, 0.15)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", style: {
            background: "linear-gradient(180deg, rgba(255,77,109,0.08) 0%, rgba(255,140,66,0.15) 100%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20, style: {
                color: "#ff4d6d"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider", style: {
                color: "#ff4d6d",
                textShadow: "0 0 10px rgba(255,77,109,0.5)"
              }, children: "最大連勝" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-5xl md:text-6xl font-bold tracking-wider mb-2", style: {
              color: "#ff4d6d",
              textShadow: "0 0 10px rgba(255,77,109,0.8), 0 0 20px rgba(255,77,109,0.6), 0 0 40px rgba(255,140,66,0.4)"
            }, children: [
              overview.longestWinStreak,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl ml-2", style: {
                color: "#ff8c42"
              }, children: "場" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-secondary)"
                }, children: "起始日期" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", style: {
                  color: "var(--text-primary)"
                }, children: "2026/09/15" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-secondary)"
                }, children: "結束日期" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", style: {
                  color: "var(--text-primary)"
                }, children: "2026/09/22" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-1.5 border-t", style: {
                borderColor: "rgba(255,77,109,0.15)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-secondary)"
                }, children: "總資產變化" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", style: {
                  color: "#4ade80"
                }, children: [
                  "+",
                  formatBigNumber(overview.longestWinStreak * 8500)
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 md:p-6 relative overflow-hidden", style: {
          borderColor: "rgba(56, 189, 248, 0.4)",
          boxShadow: "0 0 20px rgba(56, 189, 248, 0.15)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", style: {
            background: "linear-gradient(180deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.12) 100%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Snowflake, { size: 20, style: {
                color: "#38bdf8"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider", style: {
                color: "#38bdf8",
                textShadow: "0 0 10px rgba(56,189,248,0.5)"
              }, children: "最大連敗" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-5xl md:text-6xl font-bold tracking-wider mb-2", style: {
              color: "#38bdf8",
              textShadow: "0 0 10px rgba(56,189,248,0.8), 0 0 20px rgba(56,189,248,0.6), 0 0 40px rgba(99,102,241,0.4)"
            }, children: [
              longestLoseStreak,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl ml-2", style: {
                color: "#6366f1"
              }, children: "場" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-secondary)"
                }, children: "起始日期" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", style: {
                  color: "var(--text-primary)"
                }, children: "2026/08/28" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-secondary)"
                }, children: "結束日期" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", style: {
                  color: "var(--text-primary)"
                }, children: "2026/08/30" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-1.5 border-t", style: {
                borderColor: "rgba(56,189,248,0.15)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-secondary)"
                }, children: "總資產變化" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", style: {
                  color: "#ff4d6d"
                }, children: [
                  "-",
                  formatBigNumber(18e3)
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(59, 130, 246, 0.3)",
        boxShadow: "0 0 15px rgba(59, 130, 246, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 18, style: {
            color: "#3b82f6"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-lg tracking-wider", style: {
            color: "#3b82f6"
          }, children: "單局詳細戰報" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs ml-auto", style: {
            color: "var(--text-secondary)"
          }, children: [
            "最近 ",
            Math.min(5, matches.length),
            " 場"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: matches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-sm", style: {
          color: "var(--text-secondary)"
        }, children: "尚無對戰數據" }) : matches.slice(0, 5).map((match) => {
          const isExpanded = expandedMatches.has(match.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded overflow-hidden", style: {
            border: "1px solid rgba(59,130,246,0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => toggleMatch(match.id), className: "w-full p-3 flex items-center gap-3 text-left transition-colors hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-10 rounded-full", style: {
                backgroundColor: "#3b82f6"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm", style: {
                    color: match.result === "win" ? "#4ade80" : match.result === "loss" ? "#ff4d6d" : "#ffcc00",
                    backgroundColor: match.result === "win" ? "rgba(74,222,128,0.1)" : match.result === "loss" ? "rgba(255,77,109,0.1)" : "rgba(255,204,0,0.1)",
                    border: `1px solid ${match.result === "win" ? "rgba(74,222,128,0.3)" : match.result === "loss" ? "rgba(255,77,109,0.3)" : "rgba(255,204,0,0.3)"}`
                  }, children: match.result === "win" ? "勝" : match.result === "loss" ? "負" : "平" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
                    color: "var(--text-primary)"
                  }, children: match.profession || match.opponent }),
                  match.rank !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", style: {
                    color: "var(--text-muted)"
                  }, children: [
                    "· 第",
                    match.rank,
                    "名"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(match.date) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDuration(match.duration) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "地產 ",
                    match.propertiesOwned ?? 0,
                    " 處"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm", style: {
                  color: "var(--cyan)"
                }, children: formatBigNumber(match.finalAssets) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
                  color: "var(--text-muted)"
                }, children: "結算資產" })
              ] }),
              isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 18, style: {
                color: "var(--text-secondary)"
              } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 18, style: {
                color: "var(--text-secondary)"
              } })
            ] }),
            isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3 pt-0 border-t", style: {
              borderColor: "rgba(59,130,246,0.15)",
              background: "hsl(240, 20%, 8%)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 text-xs font-cyber tracking-wider", style: {
                color: "var(--text-secondary)"
              }, children: "本場概覽" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded", style: {
                  background: "rgba(0,255,255,0.06)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    color: "var(--text-secondary)"
                  }, children: "最高資產" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", style: {
                    color: "var(--cyan)"
                  }, children: formatBigNumber(match.highestAssets ?? match.finalAssets) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded", style: {
                  background: "rgba(74,222,128,0.06)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    color: "var(--text-secondary)"
                  }, children: "總收入" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", style: {
                    color: "#4ade80"
                  }, children: formatBigNumber(match.totalIncome ?? 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded", style: {
                  background: "rgba(255,77,109,0.06)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    color: "var(--text-secondary)"
                  }, children: "總支出" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", style: {
                    color: "#ff4d6d"
                  }, children: formatBigNumber(match.totalExpense ?? 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded", style: {
                  background: "rgba(255,204,0,0.06)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    color: "var(--text-secondary)"
                  }, children: "過路費收入" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", style: {
                    color: "#ffcc00"
                  }, children: formatBigNumber(match.tollIncome ?? 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded", style: {
                  background: "rgba(168,85,247,0.06)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    color: "var(--text-secondary)"
                  }, children: "地產投資" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono", style: {
                    color: "#a855f7"
                  }, children: formatBigNumber(match.propertyInvestment ?? 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded", style: {
                  background: "rgba(255,140,66,0.06)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    color: "var(--text-secondary)"
                  }, children: "命運卡抽取" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono", style: {
                    color: "#ff8c42"
                  }, children: [
                    match.fateCardsDrawn ?? 0,
                    " 次"
                  ] })
                ] })
              ] }),
              match.mostDrawnCard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 pt-2 border-t text-xs", style: {
                borderColor: "rgba(255,255,255,0.05)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-muted)"
                }, children: "抽中最多：" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-primary)"
                }, children: match.mostDrawnCard })
              ] })
            ] })
          ] }, match.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 md:gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
          borderColor: "rgba(255, 204, 0, 0.3)",
          boxShadow: "0 0 15px rgba(255, 204, 0, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: ChartPie, title: "資產構成分布", color: "#ffcc00" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SvgDonutChart, { data: financeStats.assetDistribution.map((item) => ({
            label: item.name,
            value: item.value,
            color: item.color
          })), centerLabel: "總資產", centerValue: formatBigNumber(financeStats.assetDistribution.reduce((sum, item) => sum + item.value, 0)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5 mt-2", children: financeStats.assetDistribution.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm", style: {
              backgroundColor: item.color,
              boxShadow: `0 0 4px ${item.color}`
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--text-secondary)"
            }, children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-mono", style: {
              color: item.color
            }, children: formatBigNumber(item.value) })
          ] }, item.name)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
          borderColor: "rgba(59, 130, 246, 0.3)",
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Wallet, title: "財務分析", color: "#3b82f6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FinanceRow, { label: "總收入", value: financeStats.totalIncome, icon: TrendingUp, color: "#4ade80" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FinanceRow, { label: "總支出", value: financeStats.totalExpense, icon: TrendingDown, color: "#ff4d6d" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FinanceRow, { label: "過路費收入", value: financeStats.tollIncome, icon: Coins, color: "#ffcc00" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FinanceRow, { label: "地產投資", value: financeStats.propertyInvestment, icon: Building2, color: "#a855f7" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3 border-t", style: {
              borderColor: "rgba(59, 130, 246, 0.2)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { size: 14, style: {
                  color: "#3b82f6"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
                  color: "var(--text-secondary)"
                }, children: "地產投資回報率" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-lg tracking-wider", style: {
                color: financeStats.propertyROI >= 50 ? "#4ade80" : "#ffcc00",
                textShadow: `0 0 8px ${financeStats.propertyROI >= 50 ? "rgba(74,222,128,0.5)" : "rgba(255,204,0,0.5)"}`
              }, children: [
                financeStats.propertyROI,
                "%"
              ] })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 md:gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
          borderColor: "rgba(74, 222, 128, 0.3)",
          boxShadow: "0 0 15px rgba(74, 222, 128, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: House, title: "地產建築統計", color: "#4ade80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "地產總數", value: propertyStats.totalProperties, color: "#4ade80" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "房屋總數", value: propertyStats.totalHouses, color: "#00ffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "酒店總數", value: propertyStats.totalHotels, color: "#ffcc00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "平均每局地產" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: "var(--text-primary)"
              }, children: [
                matches.length > 0 ? (propertyStats.totalProperties / matches.length).toFixed(1) : 0,
                " 處"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "平均每局房屋" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: "var(--text-primary)"
              }, children: [
                matches.length > 0 ? (propertyStats.totalHouses / matches.length).toFixed(1) : 0,
                " 棟"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "酒店 / 地產比" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: "var(--text-primary)"
              }, children: [
                propertyStats.totalProperties > 0 ? (propertyStats.totalHotels / propertyStats.totalProperties * 100).toFixed(1) : 0,
                "%"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
          borderColor: "rgba(255, 140, 66, 0.3)",
          boxShadow: "0 0 15px rgba(255, 140, 66, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Sparkles, title: "卡牌統計", color: "#ff8c42" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "命運卡", value: cardStats.fateCards, color: "#a855f7" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "機會卡", value: cardStats.chanceCards, color: "#00ffff" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded", style: {
            background: "rgba(255, 140, 66, 0.08)",
            border: "1px solid rgba(255, 140, 66, 0.25)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mb-1 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "最幸運卡牌" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider", style: {
              color: "#ff8c42",
              textShadow: "0 0 10px rgba(255, 140, 66, 0.5)"
            }, children: cardStats.mostLuckyCard })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(168, 85, 247, 0.3)",
        boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Layers, title: "模式詳細統計", color: "var(--purple)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", style: {
            borderColor: "rgba(168, 85, 247, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "模式" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "對局數" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "勝率" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "平均時長" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            modeStats.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b transition-colors hover:bg-white/5", style: {
              borderColor: "rgba(255, 255, 255, 0.05)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-sm", style: {
                color: "var(--text-primary)"
              }, children: m.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-sm text-right font-mono", style: {
                color: "var(--cyan)"
              }, children: m.total }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-2 text-sm text-right font-mono", style: {
                color: m.winRate >= 50 ? "var(--green)" : "var(--red)"
              }, children: [
                m.winRate.toFixed(1),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-sm text-right", style: {
                color: "var(--text-secondary)"
              }, children: formatDuration(m.avgDuration) })
            ] }, m.mode)),
            modeStats.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "py-8 text-center text-sm", style: {
              color: "var(--text-secondary)"
            }, children: "尚無模式數據" }) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(168, 85, 247, 0.3)",
        boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 18, style: {
            color: "var(--purple)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-lg tracking-wider", style: {
            color: "var(--purple)"
          }, children: "對局記錄" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs ml-auto", style: {
            color: "var(--text-secondary)"
          }, children: [
            "共 ",
            matches.length,
            " 場"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", style: {
            borderColor: "rgba(168, 85, 247, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "日期" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "模式" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "對手" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "結果" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "時長" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2 font-cyber text-xs tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: "最終資產" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: matches.map((match) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b transition-colors hover:bg-white/5", style: {
            borderColor: "rgba(255, 255, 255, 0.05)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-xs md:text-sm", style: {
              color: "var(--text-primary)"
            }, children: formatDate(match.date) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-xs md:text-sm", style: {
              color: "var(--text-secondary)"
            }, children: MODE_LABELS[match.mode] || match.mode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-xs md:text-sm", style: {
              color: "var(--text-secondary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12, style: {
                color: "var(--text-muted)"
              } }),
              match.opponent
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm", style: {
              color: match.result === "win" ? "var(--green)" : match.result === "loss" ? "var(--red)" : "var(--yellow)",
              backgroundColor: match.result === "win" ? "rgba(74, 222, 128, 0.1)" : match.result === "loss" ? "rgba(255, 77, 77, 0.1)" : "rgba(250, 204, 21, 0.1)",
              border: `1px solid ${match.result === "win" ? "rgba(74, 222, 128, 0.3)" : match.result === "loss" ? "rgba(255, 77, 77, 0.3)" : "rgba(250, 204, 21, 0.3)"}`,
              boxShadow: match.result === "win" ? "0 0 8px rgba(74, 222, 128, 0.2)" : match.result === "loss" ? "0 0 8px rgba(255, 77, 77, 0.2)" : "0 0 8px rgba(250, 204, 21, 0.2)"
            }, children: match.result === "win" ? "勝" : match.result === "loss" ? "負" : "平" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-xs md:text-sm", style: {
              color: "var(--text-secondary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12, style: {
                color: "var(--text-muted)"
              } }),
              formatDuration(match.duration)
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-xs md:text-sm text-right font-mono", style: {
              color: "var(--cyan)"
            }, children: match.finalAssets.toLocaleString() })
          ] }, match.id)) })
        ] }) })
      ] })
    ] })
  ] });
};
const SvgLineChart = ({
  data,
  color,
  yMax,
  yMin = 0,
  yUnit = "%",
  xLabel = "",
  showPeakMarker = false,
  showValleyMarker = false,
  valueFormatter
}) => {
  const width = 600;
  const height = 240;
  const padding = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 45
  };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  if (data.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 flex items-center justify-center text-sm", style: {
      color: "var(--text-secondary)"
    }, children: "尚無數據" });
  }
  const actualYMax = yMax ?? Math.max(...data.map((d) => d.y)) * 1.1;
  const actualYMin = yMin;
  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;
  const points = data.map((d, i) => {
    const px = padding.left + i * xStep;
    const py = padding.top + chartH - (d.y - actualYMin) / (actualYMax - actualYMin) * chartH;
    return {
      x: px,
      y: py,
      data: d
    };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;
  const gridLines = 4;
  const gridValues = Array.from({
    length: gridLines + 1
  }, (_, i) => {
    const ratio = i / gridLines;
    return actualYMin + (actualYMax - actualYMin) * ratio;
  });
  let peakIdx = 0;
  let valleyIdx = 0;
  for (let i = 1; i < data.length; i += 1) {
    if (data[i].y > data[peakIdx].y) peakIdx = i;
    if (data[i].y < data[valleyIdx].y) valleyIdx = i;
  }
  const gradId = `line-grad-${color.replace("#", "")}`;
  const glowId = `line-glow-${color.replace("#", "")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${width} ${height}`, style: {
    width: "100%",
    height: "auto"
  }, preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0.02" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: glowId, x: "-50%", y: "-50%", width: "200%", height: "200%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "2.5", result: "blur" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "blur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
        ] })
      ] })
    ] }),
    gridValues.map((val, i) => {
      const y = padding.top + chartH - (val - actualYMin) / (actualYMax - actualYMin) * chartH;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: padding.left, y1: y, x2: width - padding.right, y2: y, stroke: "rgba(255,255,255,0.08)", strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: padding.left - 6, y: y + 3, textAnchor: "end", fontSize: "10", fill: "rgba(200,200,220,0.5)", fontFamily: "monospace", children: valueFormatter ? valueFormatter(val) : `${Math.round(val)}${yUnit}` })
      ] }, i);
    }),
    xLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: width / 2, y: height - 8, textAnchor: "middle", fontSize: "10", fill: "rgba(200,200,220,0.5)", fontFamily: "var(--font-cyber)", children: xLabel }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: areaPath, fill: `url(#${gradId})` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: linePath, fill: "none", stroke: color, strokeWidth: "2", filter: `url(#${glowId})`, strokeLinecap: "round", strokeLinejoin: "round" }),
    points.map((p, i) => {
      const isPeak = showPeakMarker && i === peakIdx;
      const isValley = showValleyMarker && i === valleyIdx;
      if (isPeak) {
        const lx = p.x;
        const ly = p.y - 18;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p.x, cy: p.y, r: "5", fill: color, opacity: "0.3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p.x, cy: p.y, r: "3", fill: color }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: `${lx},${ly} ${lx - 5},${ly + 7} ${lx - 1},${ly + 7} ${lx - 4},${ly + 16} ${lx + 5},${ly + 4} ${lx + 1},${ly + 4}`, fill: "#ffcc00", filter: `url(#${glowId})` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: p.x, y: ly - 2, textAnchor: "middle", fontSize: "9", fill: "#ffcc00", fontFamily: "monospace", fontWeight: "bold", children: valueFormatter ? valueFormatter(p.data.y) : `${p.data.y.toFixed(0)}${yUnit}` })
        ] }, i);
      }
      if (isValley) {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p.x, cy: p.y, r: "5", fill: "#ff4d6d", opacity: "0.3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p.x, cy: p.y, r: "3", fill: "#ff4d6d" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: `${p.x},${p.y + 16} ${p.x - 5},${p.y + 9} ${p.x - 1},${p.y + 9} ${p.x - 4},${p.y} ${p.x + 5},${p.y + 12} ${p.x + 1},${p.y + 12}`, fill: "#ff4d6d" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: p.x, y: p.y + 26, textAnchor: "middle", fontSize: "9", fill: "#ff4d6d", fontFamily: "monospace", fontWeight: "bold", children: valueFormatter ? valueFormatter(p.data.y) : `${p.data.y.toFixed(0)}${yUnit}` })
        ] }, i);
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p.x, cy: p.y, r: "2.5", fill: color, opacity: "0.9" }, i);
    }),
    data.length > 3 && [0, Math.floor(data.length / 2), data.length - 1].map((idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: points[idx].x, y: height - padding.bottom + 14, textAnchor: "middle", fontSize: "9", fill: "rgba(200,200,220,0.4)", fontFamily: "monospace", children: data[idx].x }, idx))
  ] });
};
const SvgBarChart = ({
  data,
  colors
}) => {
  const width = 500;
  const height = 260;
  const padding = {
    top: 25,
    right: 15,
    bottom: 45,
    left: 35
  };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  if (data.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 flex items-center justify-center text-sm", style: {
      color: "var(--text-secondary)"
    }, children: "尚無數據" });
  }
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const barGap = 12;
  const barWidth = (chartW - barGap * (data.length - 1)) / data.length;
  const gridLines = 4;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${width} ${height}`, style: {
    width: "100%",
    height: "auto"
  }, preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
      colors.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `bar-grad-${i}-${c.replace("#", "")}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: c, stopOpacity: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: c, stopOpacity: "0.5" })
      ] }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "bar-glow", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "2", result: "blur" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "blur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
        ] })
      ] })
    ] }),
    Array.from({
      length: gridLines + 1
    }, (_, i) => {
      const ratio = i / gridLines;
      const y = padding.top + chartH - ratio * chartH;
      const val = maxVal * ratio;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: padding.left, y1: y, x2: width - padding.right, y2: y, stroke: "rgba(255,255,255,0.08)", strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("text", { x: padding.left - 6, y: y + 3, textAnchor: "end", fontSize: "10", fill: "rgba(200,200,220,0.5)", fontFamily: "monospace", children: [
          Math.round(val),
          "%"
        ] })
      ] }, i);
    }),
    data.map((item, i) => {
      const x = padding.left + i * (barWidth + barGap);
      const barH = item.value / maxVal * chartH;
      const y = padding.top + chartH - barH;
      const color = colors[i % colors.length];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width: barWidth, height: barH, fill: `url(#bar-grad-${i}-${color.replace("#", "")})`, rx: "3", filter: "url(#bar-glow)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("text", { x: x + barWidth / 2, y: y - 6, textAnchor: "middle", fontSize: "11", fill: color, fontFamily: "monospace", fontWeight: "bold", style: {
          textShadow: `0 0 6px ${color}`
        }, children: [
          item.value.toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: x + barWidth / 2, y: height - padding.bottom + 14, textAnchor: "middle", fontSize: "11", fill: "rgba(200,200,220,0.8)", fontFamily: "var(--font-cyber)", children: item.label }),
        item.subLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: x + barWidth / 2, y: height - padding.bottom + 28, textAnchor: "middle", fontSize: "9", fill: "rgba(200,200,220,0.4)", fontFamily: "monospace", children: item.subLabel })
      ] }, item.label);
    })
  ] });
};
const SvgDonutChart = ({
  data,
  centerLabel,
  centerValue
}) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 90;
  const innerR = 60;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 flex items-center justify-center text-sm", style: {
      color: "var(--text-secondary)"
    }, children: "尚無數據" });
  }
  let currentAngle = -Math.PI / 2;
  const segments = data.map((d) => {
    const angle = d.value / total * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathD = [`M ${x1} ${y1}`, `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`, `L ${x3} ${y3}`, `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`, "Z"].join(" ");
    return {
      ...d,
      pathD
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${size} ${size}`, style: {
    width: "100%",
    maxWidth: 260,
    height: "auto"
  }, preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "donut-glow", x: "-20%", y: "-20%", width: "140%", height: "140%", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "2", result: "blur" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "blur" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
      ] })
    ] }) }),
    segments.map((seg, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: seg.pathD, fill: seg.color, opacity: "0.9", filter: "url(#donut-glow)" }, i)),
    centerValue && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: cx, y: cy - 2, textAnchor: "middle", fontSize: "18", fill: "var(--text-primary)", fontFamily: "var(--font-cyber)", fontWeight: "bold", style: {
        textShadow: "0 0 8px rgba(0,255,255,0.5)"
      }, children: centerValue }),
      centerLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: cx, y: cy + 14, textAnchor: "middle", fontSize: "10", fill: "rgba(200,200,220,0.5)", fontFamily: "var(--font-cyber)", letterSpacing: "1", children: centerLabel })
    ] })
  ] });
};
const SvgPieChart = ({
  data
}) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 85;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 flex items-center justify-center text-sm", style: {
      color: "var(--text-secondary)"
    }, children: "尚無數據" });
  }
  let currentAngle = -Math.PI / 2;
  const segments = data.map((d) => {
    const angle = d.value / total * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return {
      ...d,
      pathD
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${size} ${size}`, style: {
    width: "100%",
    maxWidth: 260,
    height: "auto"
  }, preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "pie-glow", x: "-20%", y: "-20%", width: "140%", height: "140%", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "2", result: "blur" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "blur" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
      ] })
    ] }) }),
    segments.map((seg, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: seg.pathD, fill: seg.color, opacity: "0.9", stroke: "hsl(240,20%,8%)", strokeWidth: "2", filter: "url(#pie-glow)" }, i))
  ] });
};
const SectionHeader = ({
  icon: Icon,
  title,
  color,
  noMargin = false
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${noMargin ? "" : "mb-4"}`, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-5 rounded-full", style: {
    backgroundColor: color,
    boxShadow: `0 0 6px ${color}`
  } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18, style: {
    color
  } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-lg tracking-wider", style: {
    color
  }, children: title })
] });
const StatCard = ({
  label,
  value,
  icon: Icon,
  color
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 md:p-4 text-center", style: {
  borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
  boxShadow: `0 0 15px color-mix(in srgb, ${color} 15%, transparent)`
}, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 mx-auto mb-1.5", style: {
    color
  } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl md:text-2xl font-bold tracking-wider", style: {
    color,
    textShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)`
  }, children: value }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mt-1 font-cyber tracking-wider", children: label })
] });
const MiniStat = ({
  label,
  value,
  color,
  fullWidth
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-center", style: {
  background: "rgba(255, 255, 255, 0.03)",
  border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
  width: fullWidth ? "100%" : void 0
}, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg font-bold tracking-wider", style: {
    color,
    textShadow: `0 0 6px color-mix(in srgb, ${color} 40%, transparent)`
  }, children: value }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-1 font-cyber tracking-wider", style: {
    color: "var(--text-secondary)"
  }, children: label })
] });
const FinanceRow = ({
  label,
  value,
  icon: Icon,
  color
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14, style: {
      color
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
      color: "var(--text-secondary)"
    }, children: label })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", style: {
    color
  }, children: formatBigNumber(value) })
] });
export {
  StatsDashboardPage as default
};
