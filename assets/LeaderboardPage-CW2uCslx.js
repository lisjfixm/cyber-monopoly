import { r as reactExports, aE as TITLES, aF as safeGetJSON, aG as safeSetJSON, a as usePlayerIdentity, k as useAchievements, u as useNavigate, j as jsxRuntimeExports, aH as CircleQuestionMark, aI as Trophy, S as Swords, Z as Zap, aJ as Coins, aB as Clock, aK as Award, aL as Star, G as Globe, aM as MapPin, U as Users, aN as Target, f as ChevronDown, t as Crown, aO as Medal, aP as TrendingUp, aQ as TrendingDown, aR as Minus, X } from "./index-ymfxQ6bv.js";
import { g as getRankedState, R as RANK_TIERS } from "./ranked-C4YlVYfA.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { G as Gem } from "./gem-4YA6Ub_Y.js";
const STORAGE_KEY = "cyber_monopoly_titles_progress";
const DEFAULT_DATA = {
  equippedTitle: null,
  unlockedTitles: [],
  buyPropertyCount: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalWins: 0,
  maxCompleteSets: 0,
  maxAssets: 0
};
function readFromStorage() {
  const data = safeGetJSON(STORAGE_KEY, {});
  return {
    ...DEFAULT_DATA,
    ...data
  };
}
function writeToStorage(data) {
  safeSetJSON(STORAGE_KEY, data);
}
function checkTitleUnlocks(data) {
  const newlyUnlocked = [];
  if (!data.unlockedTitles.includes("property_newbie") && data.buyPropertyCount >= 10) {
    newlyUnlocked.push("property_newbie");
  }
  if (!data.unlockedTitles.includes("undefeated") && data.maxWinStreak >= 3) {
    newlyUnlocked.push("undefeated");
  }
  if (!data.unlockedTitles.includes("real_estate_god") && data.maxCompleteSets >= 5) {
    newlyUnlocked.push("real_estate_god");
  }
  if (!data.unlockedTitles.includes("billionaire") && data.maxAssets >= 5e4) {
    newlyUnlocked.push("billionaire");
  }
  return newlyUnlocked;
}
function useTitleProgress() {
  const [data, setData] = reactExports.useState(() => readFromStorage());
  reactExports.useEffect(() => {
    writeToStorage(data);
  }, [data]);
  const addBuyProperty = reactExports.useCallback((count = 1) => {
    setData((prev) => {
      const newBuyCount = prev.buyPropertyCount + count;
      const newData = {
        ...prev,
        buyPropertyCount: newBuyCount
      };
      const newly = checkTitleUnlocks({
        ...newData,
        unlockedTitles: prev.unlockedTitles
      });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);
  const recordWin = reactExports.useCallback(() => {
    setData((prev) => {
      const newStreak = prev.winStreak + 1;
      const newMaxStreak = Math.max(prev.maxWinStreak, newStreak);
      const newData = {
        ...prev,
        winStreak: newStreak,
        maxWinStreak: newMaxStreak,
        totalWins: prev.totalWins + 1
      };
      const newly = checkTitleUnlocks({
        ...newData,
        unlockedTitles: prev.unlockedTitles
      });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);
  const recordLoss = reactExports.useCallback(() => {
    setData((prev) => ({
      ...prev,
      winStreak: 0
    }));
  }, []);
  const updateMaxCompleteSets = reactExports.useCallback((sets) => {
    setData((prev) => {
      if (sets <= prev.maxCompleteSets) return prev;
      const newData = {
        ...prev,
        maxCompleteSets: sets
      };
      const newly = checkTitleUnlocks({
        ...newData,
        unlockedTitles: prev.unlockedTitles
      });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);
  const updateMaxAssets = reactExports.useCallback((assets) => {
    setData((prev) => {
      if (assets <= prev.maxAssets) return prev;
      const newData = {
        ...prev,
        maxAssets: assets
      };
      const newly = checkTitleUnlocks({
        ...newData,
        unlockedTitles: prev.unlockedTitles
      });
      if (newly.length > 0) {
        newData.unlockedTitles = [...prev.unlockedTitles, ...newly];
      }
      return newData;
    });
  }, []);
  const equipTitle = reactExports.useCallback((titleId) => {
    setData((prev) => {
      if (titleId && !prev.unlockedTitles.includes(titleId)) return prev;
      return {
        ...prev,
        equippedTitle: titleId
      };
    });
  }, []);
  const isTitleUnlocked = reactExports.useCallback((titleId) => {
    return data.unlockedTitles.includes(titleId);
  }, [data.unlockedTitles]);
  const getTitleProgress = reactExports.useCallback((titleId) => {
    switch (titleId) {
      case "property_newbie":
        return {
          current: data.buyPropertyCount,
          target: 10,
          label: "已買地塊"
        };
      case "undefeated":
        return {
          current: data.maxWinStreak,
          target: 3,
          label: "最高連勝"
        };
      case "real_estate_god":
        return {
          current: data.maxCompleteSets,
          target: 5,
          label: "最多套裝數"
        };
      case "billionaire":
        return {
          current: data.maxAssets,
          target: 5e4,
          label: "最高資產"
        };
      default:
        return {
          current: 0,
          target: 1,
          label: TITLES[titleId]?.unlockCondition ?? "未解鎖"
        };
    }
  }, [data.buyPropertyCount, data.maxWinStreak, data.maxCompleteSets, data.maxAssets]);
  return {
    equippedTitle: data.equippedTitle,
    unlockedTitles: data.unlockedTitles,
    buyPropertyCount: data.buyPropertyCount,
    winStreak: data.winStreak,
    maxWinStreak: data.maxWinStreak,
    totalWins: data.totalWins,
    maxCompleteSets: data.maxCompleteSets,
    maxAssets: data.maxAssets,
    addBuyProperty,
    recordWin,
    recordLoss,
    updateMaxCompleteSets,
    updateMaxAssets,
    equipTitle,
    isTitleUnlocked,
    getTitleProgress
  };
}
const MOCK_NAMES = ["霓虹霸主", "賽博王者", "暗影獵手", "數據幽靈", "量子駭客", "電馭叛客", "星海旅人", "機甲騎士", "基因改造者", "記憶裁縫", "駭客帝國", "光速先鋒", "暗夜行者", "數碼修復師", "電流女王", "終端守護者", "虛擬武士", "電路師匠", "數據風暴", "霓虹舞者", "暗網潛伏者", "量子跳躍", "機械心臟", "義體強化", "賽博詩人", "電漿風暴", "神經漫遊者", "暗影仲裁者", "脈衝使者", "零點能量", "數據走私販", "霓虹修女", "鐵血判官", "混沌工程師", "時空獵人", "賽博修道士", "記憶駭客", "虛空行者", "電子幽靈", "磁場操控者", "暗物質", "光子劍士", "生物機械", "程式碼亡靈", "量子糾纏", "納米醫生", "反重力", "光纖舞者", "電路板農夫", "駭客教主", "機甲女王", "深潛者", "星際流浪者", "數據牧師", "影子經紀人", "時間守望者", "網路忍者", "合成人", "義體醫生", "記憶裁縫師", "霓虹遊俠", "鐵拳無敵", "毒牙", "疾速", "冷靜殺手", "爆破專家", "潛行大師", "駭入天才", "格鬥冠軍", "談判專家", "黑市商人", "情報販子", "賞金獵人", "企業間諜", "街頭領袖", "地下拳王", "賽車之神", "賭場霸主", "股票之神", "地產大亨", "金融寡頭", "科技新貴", "藝術家", "詩人", "哲學家", "革命家", "獨裁者", "救世主", "毀滅者", "創世神", "混沌使者", "秩序守護", "平衡維持", "毀滅君王", "永恆守護"];
const GUILD_NAMES = ["霓虹騎士團", "暗影議會", "數據公會", "電流聯盟", "星海艦隊", "量子幫派", "機械聖殿", "基因實驗室", "駭客帝國", "電路王朝"];
const TIERS = ["青銅", "白銀", "黃金", "鉑金", "鑽石", "大師", "王者"];
const REGIONS = ["asia", "north-america", "europe"];
function seededRand(seed) {
  let h = 2166136261 ^ seed;
  h = Math.imul(h, 16777619);
  return (h >>> 0) % 1e4 / 1e4;
}
function getTierByRank(rank) {
  if (rank <= 1) return TIERS[6];
  if (rank <= 3) return TIERS[5];
  if (rank <= 10) return TIERS[4];
  if (rank <= 30) return TIERS[3];
  if (rank <= 60) return TIERS[2];
  if (rank <= 85) return TIERS[1];
  return TIERS[0];
}
function generateMockItems(type, scope, count) {
  const items = [];
  const scopeKey = 0;
  const scopeOffset = scopeKey * 100;
  for (let i = 0; i < count; i += 1) {
    const seed = i * 7919 + type.length * 31 + scopeOffset;
    const nameIdx = Math.floor(seededRand(seed) * MOCK_NAMES.length);
    const baseElo = 2600 - i * 20 + Math.floor(seededRand(seed + 1) * 15);
    const wins = 500 - i * 5 + Math.floor(seededRand(seed + 2) * 15);
    const losses = 200 + i * 3 + Math.floor(seededRand(seed + 3) * 10);
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? wins / totalGames * 100 : 0;
    const guildIdx = Math.floor(seededRand(seed + 4) * GUILD_NAMES.length);
    const regionIdx = Math.floor(seededRand(seed + 5) * REGIONS.length);
    let rankChange = Math.floor(seededRand(seed + 6) * 11) - 5;
    const isNew = i > count - 5 && seededRand(seed + 7) > 0.5;
    if (isNew) rankChange = 0;
    const totalAssets = 2e6 - i * 18e3 + Math.floor(seededRand(seed + 8) * 1e4);
    const peakAssets = 3e6 - i * 25e3 + Math.floor(seededRand(seed + 9) * 15e3);
    const fastestWin = 8 + i * 0.5 + seededRand(seed + 10) * 3;
    const achievementPoints = 8e3 - i * 70 + Math.floor(seededRand(seed + 11) * 50);
    const collectionCompletion = 100 - i * 0.8 + seededRand(seed + 12) * 5;
    items.push({
      visitorId: `mock_${type}_${scope}_${i}`,
      rank: i + 1,
      nickname: MOCK_NAMES[nameIdx] || `玩家${i + 1}`,
      elo: baseElo,
      wins,
      losses,
      seasonWins: Math.floor(wins * 0.4),
      seasonElo: baseElo - 80,
      winRate,
      title: getTierByRank(i + 1),
      highestAssets: peakAssets,
      totalAssets,
      peakAssets,
      fastestWinMinutes: Math.round(fastestWin * 10) / 10,
      achievementPoints,
      collectionCompletion: Math.max(5, Math.min(100, Math.round(collectionCompletion * 10) / 10)),
      guildName: i < 20 ? GUILD_NAMES[guildIdx] : void 0,
      rankChange,
      isNew,
      tier: getTierByRank(i + 1),
      region: REGIONS[regionIdx]
    });
  }
  return items;
}
function sortByType(items, type) {
  const sorted = [...items].sort((a, b) => {
    switch (type) {
      case "elo":
        return b.elo - a.elo;
      case "wins":
        return b.wins - a.wins;
      case "season":
        return b.seasonWins - a.seasonWins;
      case "total-networth":
        return (b.totalAssets || 0) - (a.totalAssets || 0);
      case "peak-networth":
        return (b.peakAssets || 0) - (a.peakAssets || 0);
      case "fastest-win":
        return (a.fastestWinMinutes || 999) - (b.fastestWinMinutes || 999);
      case "achievement-points":
        return (b.achievementPoints || 0) - (a.achievementPoints || 0);
      case "collection-completion":
        return (b.collectionCompletion || 0) - (a.collectionCompletion || 0);
      default:
        return b.elo - a.elo;
    }
  });
  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}
const WEEKLY_REWARDS = [{
  rank: "第 1 名",
  reward: "傳說頭像框",
  rewardType: "skin",
  value: 1
}, {
  rank: "第 2-3 名",
  reward: "史詩稱號",
  rewardType: "title",
  value: 1
}, {
  rank: "第 4-10 名",
  reward: "2000 金幣",
  rewardType: "coins",
  value: 2e3
}];
const MONTHLY_REWARDS = [{
  rank: "第 1 名",
  reward: "限定皮膚",
  rewardType: "skin",
  value: 1
}, {
  rank: "第 2-3 名",
  reward: "傳說頭像框",
  rewardType: "skin",
  value: 1
}, {
  rank: "第 4-10 名",
  reward: "5000 金幣",
  rewardType: "coins",
  value: 5e3
}, {
  rank: "第 11-50 名",
  reward: "稀有道具包",
  rewardType: "item",
  value: 1
}];
const LEADERBOARD_RULES = [{
  type: "elo",
  name: "ELO積分排行",
  calculationRule: "根據對戰勝負與對手積分計算ELO變動，取勝提升、戰敗下降。初始積分1000，最高無上限。",
  updateFrequency: "每場對戰結束後即時更新",
  rewards: ["第1名：王者稱號 + 限定皮膚", "第2-3名：大師稱號 + 史詩頭像框", "第4-10名：鑽石稱號 + 2000金幣", "第11-50名：鉑金稱號 + 500金幣", "第51-100名：黃金稱號 + 200金幣"]
}, {
  type: "wins",
  name: "勝場排行",
  calculationRule: "累計獲勝場次，不計算失敗。同勝場時按ELO積分排序。",
  updateFrequency: "每場對戰結束後即時更新",
  rewards: ["第1名：百勝將軍稱號", "第2-3名：戰神稱號", "第4-10名：常勝軍稱號"]
}, {
  type: "season",
  name: "賽季排行",
  calculationRule: "當前賽季的獲勝場次排名。賽季結束後重置。",
  updateFrequency: "每場對戰結束後即時更新",
  rewards: ["第1名：賽季王者限定皮膚", "第2-3名：賽季大師頭像框", "第4-10名：賽季鑽石邊框", "第11-100名：賽季參與獎"]
}, {
  type: "total-networth",
  name: "總資產排行",
  calculationRule: "生涯累計總資產峰值，包含現金、地產、建築、道具的總價值。",
  updateFrequency: "每場對戰結束後更新",
  rewards: ["第1名：資本家稱號", "第2-3名：金融巨頭稱號", "第4-10名：百萬富翁稱號"]
}, {
  type: "peak-networth",
  name: "單局最高資產排行",
  calculationRule: "單局遊戲中達到過的最高資產峰值記錄。",
  updateFrequency: "每場對戰結束後更新",
  rewards: ["第1名：巔峰傳說稱號", "第2-3名：巔峰大師稱號", "第4-10名：巔峰達人稱號"]
}, {
  type: "fastest-win",
  name: "最快勝利排行",
  calculationRule: "從遊戲開始到對手破產的最短時間，按分鐘數由短到長排序。",
  updateFrequency: "每場對戰結束後更新",
  rewards: ["第1名：閃電戰神稱號", "第2-3名：速通達人稱號", "第4-10名：高效玩家稱號"]
}, {
  type: "achievement-points",
  name: "成就點數排行",
  calculationRule: "已解鎖成就的總點數，傳奇成就點數最高。",
  updateFrequency: "每日凌晨更新",
  rewards: ["第1名：成就獵人稱號", "第2-3名：探索者稱號", "第4-10名：收藏達人稱號"]
}, {
  type: "collection-completion",
  name: "收藏品完成度排行",
  calculationRule: "圖鑑與收藏品的完成度百分比，涵蓋地產/道具/寵物/坐騎等所有收藏品。",
  updateFrequency: "每日凌晨更新",
  rewards: ["第1名：收藏家稱號 + 限定展示櫃", "第2-3名：鑑賞家稱號", "第4-10名：愛好者稱號"]
}];
function getSeasonCountdown() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth();
  const quarterEndMonth = Math.ceil((month + 1) / 3) * 3 - 1;
  const endOfQuarter = new Date(now.getFullYear(), quarterEndMonth + 1, 1);
  const diff = endOfQuarter.getTime() - now.getTime();
  const daysLeft = Math.floor(diff / (1e3 * 60 * 60 * 24));
  const hoursLeft = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
  const minutesLeft = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
  const secondsLeft = Math.floor(diff % (1e3 * 60) / 1e3);
  return {
    seasonName: "第7賽季：霓虹覺醒",
    endsAt: endOfQuarter.toISOString(),
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft
  };
}
function useLeaderboard() {
  const {
    visitorId,
    nickname
  } = usePlayerIdentity();
  const titleData = useTitleProgress();
  const achievements = useAchievements();
  const totalPoints = achievements.getTotalPoints();
  const rankedState = reactExports.useMemo(() => getRankedState(), []);
  const rankedTotal = rankedState.wins + rankedState.losses;
  const rankedTierName = RANK_TIERS.find((t) => t.tier === rankedState.tier)?.name ?? "青銅";
  const myBase = reactExports.useMemo(() => ({
    visitorId,
    rank: 0,
    nickname: nickname || "我",
    elo: rankedState.elo,
    wins: rankedState.wins,
    losses: rankedState.losses,
    seasonWins: rankedState.wins,
    seasonElo: rankedState.elo,
    winRate: rankedTotal > 0 ? Math.round(rankedState.wins / rankedTotal * 100) : 0,
    title: titleData.equippedTitle || rankedTierName,
    highestAssets: titleData.maxAssets,
    totalAssets: titleData.maxAssets,
    peakAssets: titleData.maxAssets,
    fastestWinMinutes: 15.5,
    achievementPoints: totalPoints,
    collectionCompletion: 35.2,
    rankChange: 2,
    isNew: false,
    tier: rankedTierName,
    region: "asia"
  }), [visitorId, nickname, titleData, totalPoints, rankedState, rankedTotal, rankedTierName]);
  const globalItems = reactExports.useMemo(() => generateMockItems("elo", "global", 100), []);
  const getItems = (type, scope = "global") => {
    let baseItems = globalItems;
    if (scope === "regional") {
      baseItems = globalItems.filter((it) => it.region === "asia");
    } else if (scope === "friends") {
      baseItems = globalItems.slice(0, 15);
    }
    const itemsWithPlayer = [...baseItems, myBase];
    return sortByType(itemsWithPlayer, type).slice(0, 100);
  };
  const getMyRank = (type, scope = "global") => {
    const items = getItems(type, scope);
    const me = items.find((item) => item.visitorId === visitorId);
    return me || null;
  };
  const getRule = (type) => {
    return LEADERBOARD_RULES.find((r) => r.type === type);
  };
  const getSeasonInfo = () => getSeasonCountdown();
  return {
    getItems,
    getMyRank,
    myBase,
    weeklyRewards: WEEKLY_REWARDS,
    monthlyRewards: MONTHLY_REWARDS,
    rules: LEADERBOARD_RULES,
    getRule,
    getSeasonInfo
  };
}
const TABS = [{
  key: "elo",
  label: "ELO積分",
  icon: Trophy,
  unit: "ELO"
}, {
  key: "wins",
  label: "勝場排行",
  icon: Swords,
  unit: "勝"
}, {
  key: "season",
  label: "賽季排行",
  icon: Zap,
  unit: "勝"
}, {
  key: "total-networth",
  label: "總資產",
  icon: Coins,
  unit: ""
}, {
  key: "peak-networth",
  label: "單局峰值",
  icon: Gem,
  unit: ""
}, {
  key: "fastest-win",
  label: "最快勝利",
  icon: Clock,
  unit: "分鐘"
}, {
  key: "achievement-points",
  label: "成就點數",
  icon: Award,
  unit: "點"
}, {
  key: "collection-completion",
  label: "收藏完成度",
  icon: Star,
  unit: "%"
}];
const SCOPES = [{
  key: "global",
  label: "全球",
  icon: Globe
}, {
  key: "regional",
  label: "區域",
  icon: MapPin
}, {
  key: "friends",
  label: "好友",
  icon: Users
}];
function formatValue(item, type) {
  switch (type) {
    case "elo":
      return item.elo.toFixed(0);
    case "wins":
      return item.wins.toString();
    case "season":
      return item.seasonWins.toString();
    case "total-networth":
      return (item.totalAssets || 0).toLocaleString();
    case "peak-networth":
      return (item.peakAssets || 0).toLocaleString();
    case "fastest-win":
      return `${item.fastestWinMinutes?.toFixed(1) || "--"}`;
    case "achievement-points":
      return (item.achievementPoints || 0).toLocaleString();
    case "collection-completion":
      return `${item.collectionCompletion?.toFixed(1) || 0}`;
    default:
      return item.elo.toFixed(0);
  }
}
function getValueLabel(type) {
  const tab = TABS.find((t) => t.key === type);
  return tab?.unit || "";
}
function getMedalColor(rank) {
  if (rank === 1) return "hsl(45, 100%, 55%)";
  if (rank === 2) return "hsl(210, 10%, 75%)";
  if (rank === 3) return "hsl(25, 80%, 55%)";
  return "var(--text-secondary)";
}
function RankChangeArrow({
  change,
  isNew
}) {
  if (isNew) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold px-1.5 py-0.5 rounded-sm blink-text", style: {
      color: "var(--blue)",
      backgroundColor: "rgba(0, 100, 255, 0.15)",
      border: "1px solid rgba(0, 100, 255, 0.4)",
      textShadow: "0 0 8px rgba(0, 100, 255, 0.8)"
    }, children: "NEW" });
  }
  if (change > 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-xs font-bold", style: {
      color: "var(--green)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14, style: {
        filter: "drop-shadow(0 0 4px var(--green))"
      } }),
      change
    ] });
  }
  if (change < 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-xs font-bold", style: {
      color: "var(--red)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { size: 14, style: {
        filter: "drop-shadow(0 0 4px var(--red))"
      } }),
      Math.abs(change)
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center text-xs", style: {
    color: "var(--text-secondary)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 14 }) });
}
function TopPodiumCard({
  item,
  type,
  position,
  onClick
}) {
  const color = getMedalColor(position);
  const sizeClass = position === 1 ? "md:scale-110 md:-translate-y-4" : "";
  const Icon = position === 1 ? Crown : Medal;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: `cyber-card relative flex flex-col items-center p-4 md:p-6 transition-all hover:scale-105 cursor-pointer ${sizeClass}`, style: {
    borderColor: color,
    boxShadow: `0 0 20px color-mix(in srgb, ${color} 50%, transparent), inset 0 0 20px color-mix(in srgb, ${color} 10%, transparent)`,
    background: `linear-gradient(180deg, color-mix(in srgb, ${color} 8%, transparent), var(--bg-card))`,
    minWidth: 0
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 font-cyber text-sm font-bold rounded-sm", style: {
      color,
      backgroundColor: "var(--bg-deep)",
      border: `2px solid ${color}`,
      boxShadow: `0 0 10px ${color}`
    }, children: [
      "#",
      position
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 mt-2", style: {
      border: `3px solid ${color}`,
      boxShadow: `0 0 15px ${color}, inset 0 0 10px color-mix(in srgb, ${color} 30%, transparent)`,
      background: `radial-gradient(circle, color-mix(in srgb, ${color} 20%, transparent), transparent)`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: position === 1 ? 32 : 24, style: {
      color,
      filter: `drop-shadow(0 0 6px ${color})`
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm md:text-base font-bold truncate w-full text-center", style: {
      color: "var(--text-primary)"
    }, children: item.nickname }),
    item.guildName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5 truncate w-full text-center", style: {
      color: "var(--cyan)"
    }, children: item.guildName }),
    item.tier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 mt-2 font-cyber tracking-wider rounded-sm", style: {
      color,
      border: `1px solid ${color}`,
      backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`
    }, children: item.tier }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl md:text-2xl font-bold", style: {
        color,
        textShadow: `0 0 10px ${color}`
      }, children: formatValue(item, type) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mt-0.5", children: getValueLabel(type) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankChangeArrow, { change: item.rankChange, isNew: item.isNew }) })
  ] });
}
function PlayerDetailModal({
  item,
  type,
  onClose
}) {
  const medalColor = item.rank <= 3 ? getMedalColor(item.rank) : "var(--cyan)";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(4px)"
  }, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 max-w-md w-full relative", style: {
    borderColor: medalColor,
    boxShadow: `0 0 30px color-mix(in srgb, ${medalColor} 40%, transparent)`
  }, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full flex items-center justify-center mb-3", style: {
        border: `3px solid ${medalColor}`,
        boxShadow: `0 0 20px ${medalColor}`,
        background: `radial-gradient(circle, color-mix(in srgb, ${medalColor} 20%, transparent), transparent)`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 36, style: {
        color: medalColor,
        filter: `drop-shadow(0 0 8px ${medalColor})`
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
        color: "var(--text-primary)"
      }, children: item.nickname }),
      item.guildName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm mt-1", style: {
        color: "var(--cyan)"
      }, children: [
        "公會：",
        item.guildName
      ] }),
      item.tier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-3 py-1 mt-2 font-cyber tracking-wider rounded-sm", style: {
        color: medalColor,
        border: `1px solid ${medalColor}`,
        backgroundColor: `color-mix(in srgb, ${medalColor} 10%, transparent)`
      }, children: [
        "段位：",
        item.tier
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full grid grid-cols-2 gap-3 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: "排名" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg font-bold text-neon-cyan", children: [
            "#",
            item.rank
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: TABS.find((t) => t.key === type)?.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg font-bold text-neon-pink", children: formatValue(item, type) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: "ELO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg font-bold", style: {
            color: "var(--yellow)"
          }, children: item.elo })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: "勝/負" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--green)"
            }, children: item.wins }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-muted)] mx-1", children: "/" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--red)"
            }, children: item.losses })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: "勝率" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg font-bold text-neon-cyan", children: [
            (item.winRate ?? 0).toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: "賽季勝場" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg font-bold text-neon-pink", children: item.seasonWins })
        ] })
      ] })
    ] })
  ] }) });
}
function RulesModal({
  type,
  rules,
  onClose
}) {
  const rule = rules.find((r) => r.type === type);
  if (!rule) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(4px)"
  }, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative", style: {
    borderColor: "var(--cyan)",
    boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)"
  }, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-cyber text-xl text-neon-cyan tracking-wider mb-4", children: [
      rule.name,
      " 規則說明"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-neon-pink mb-1 tracking-wider", children: "計算規則" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
          color: "var(--text-secondary)"
        }, children: rule.calculationRule })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-neon-pink mb-1 tracking-wider", children: "更新頻率" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
          color: "var(--text-secondary)"
        }, children: rule.updateFrequency })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-neon-pink mb-2 tracking-wider", children: "排行獎勵" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: rule.rewards.map((reward, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 p-2 rounded-sm", style: {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(0, 255, 255, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 14, className: "flex-shrink-0 mt-0.5", style: {
            color: "var(--yellow)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--text-primary)"
          }, children: reward })
        ] }, idx)) })
      ] })
    ] })
  ] }) });
}
function SeasonCountdownBar() {
  const {
    getSeasonInfo
  } = useLeaderboard();
  const seasonInfo = getSeasonInfo();
  const seasonName = seasonInfo.seasonName;
  const endsAt = reactExports.useMemo(() => new Date(seasonInfo.endsAt).getTime(), [seasonInfo.endsAt]);
  const calcRemaining = () => {
    const diff = Math.max(0, endsAt - Date.now());
    return {
      d: Math.floor(diff / (1e3 * 60 * 60 * 24)),
      h: Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)),
      m: Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60)),
      s: Math.floor(diff % (1e3 * 60) / 1e3),
      ended: diff <= 0
    };
  };
  const [timeLeft, setTimeLeft] = reactExports.useState(calcRemaining);
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcRemaining());
    }, 1e3);
    return () => clearInterval(timer);
  }, [endsAt]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card px-4 py-3 flex items-center justify-between gap-4 flex-wrap", style: {
    borderColor: "rgba(255, 200, 0, 0.3)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, style: {
        color: "var(--yellow)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-xs md:text-sm tracking-wider", style: {
        color: "var(--yellow)"
      }, children: [
        seasonName,
        " · ",
        timeLeft.ended ? "本賽季已結束" : "結束倒數"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 md:gap-2 font-mono", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeBlock, { value: timeLeft.d, label: "天", color: "var(--yellow)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold", style: {
        color: "var(--yellow)"
      }, children: ":" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeBlock, { value: timeLeft.h, label: "時", color: "var(--yellow)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold", style: {
        color: "var(--yellow)"
      }, children: ":" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeBlock, { value: timeLeft.m, label: "分", color: "var(--yellow)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold", style: {
        color: "var(--yellow)"
      }, children: ":" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeBlock, { value: timeLeft.s, label: "秒", color: "var(--yellow)", pulse: true })
    ] })
  ] });
}
function TimeBlock({
  value,
  label,
  color,
  pulse
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-cyber text-xl md:text-2xl font-bold min-w-[2ch] text-center ${pulse ? "blink-text" : ""}`, style: {
      color,
      textShadow: `0 0 10px ${color}`
    }, children: value.toString().padStart(2, "0") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber", style: {
      color: "var(--text-muted)"
    }, children: label })
  ] });
}
const LeaderboardPage = () => {
  const navigate = useNavigate();
  const {
    visitorId
  } = usePlayerIdentity();
  const [activeTab, setActiveTab] = reactExports.useState("elo");
  const [scope, setScope] = reactExports.useState("global");
  const [showRules, setShowRules] = reactExports.useState(false);
  const [selectedPlayer, setSelectedPlayer] = reactExports.useState(null);
  const {
    getItems,
    getMyRank,
    rules
  } = useLeaderboard();
  const listRef = reactExports.useRef(null);
  const myRowRef = reactExports.useRef(null);
  const items = reactExports.useMemo(() => getItems(activeTab, scope), [activeTab, scope, getItems]);
  const myRank = reactExports.useMemo(() => getMyRank(activeTab, scope), [activeTab, scope, getMyRank]);
  const top3 = items.slice(0, 3);
  const restItems = items.slice(3);
  const isMe = (item) => item.visitorId === visitorId;
  const showMyRankSeparately = myRank && !items.some((it) => isMe(it));
  const scrollToMyRank = () => {
    if (myRowRef.current) {
      myRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };
  const getNextRankDiff = () => {
    if (!myRank || myRank.rank <= 1) return "--";
    const itemsList = getItems(activeTab, scope);
    const prev = itemsList.find((it) => it.rank === myRank.rank - 1);
    if (!prev) return "--";
    switch (activeTab) {
      case "fastest-win":
        return `${((prev.fastestWinMinutes || 0) - (myRank.fastestWinMinutes || 0)).toFixed(1)} 分鐘`;
      case "collection-completion":
        return `${((prev.collectionCompletion || 0) - (myRank.collectionCompletion || 0)).toFixed(1)}%`;
      case "achievement-points":
        return `${(prev.achievementPoints || 0) - (myRank.achievementPoints || 0)} 點`;
      case "total-networth":
      case "peak-networth":
        return `${((prev.totalAssets || 0) - (myRank.totalAssets || 0)).toLocaleString()}`;
      default:
        return `${(prev.elo - myRank.elo).toFixed(0)} ELO`;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/"), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider flex-1", children: "排行榜" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowRules(true), className: "cyber-btn p-2", style: {
        borderColor: "var(--text-secondary)",
        color: "var(--text-secondary)"
      }, title: "規則說明", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl w-full mx-auto space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SeasonCountdownBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto pb-1 flex-1 max-w-xl", children: TABS.map((tab) => {
          const selected = activeTab === tab.key;
          const IconComp = tab.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "cyber-btn flex-shrink-0 px-2 md:px-3 py-1.5 md:py-2 text-xs font-cyber tracking-wider transition-all flex items-center gap-1", style: {
            borderColor: selected ? "var(--pink)" : "rgba(0, 255, 255, 0.2)",
            color: selected ? "var(--pink)" : "var(--text-secondary)",
            background: selected ? "rgba(255, 107, 157, 0.08)" : "transparent",
            boxShadow: selected ? "0 0 12px rgba(255, 107, 157, 0.3)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconComp, { size: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: tab.label })
          ] }, tab.key);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 flex-shrink-0", children: SCOPES.map((s) => {
          const selected = scope === s.key;
          const IconComp = s.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setScope(s.key), className: "cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider transition-all flex items-center gap-1", style: {
            borderColor: selected ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
            color: selected ? "var(--cyan)" : "var(--text-secondary)",
            background: selected ? "rgba(0, 255, 255, 0.08)" : "transparent",
            boxShadow: selected ? "0 0 8px rgba(0, 255, 255, 0.3)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconComp, { size: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: s.label })
          ] }, s.key);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 md:gap-4 mb-2 items-end", children: [
        top3[1] && /* @__PURE__ */ jsxRuntimeExports.jsx(TopPodiumCard, { item: top3[1], type: activeTab, position: 2, onClick: () => setSelectedPlayer(top3[1]) }),
        top3[0] && /* @__PURE__ */ jsxRuntimeExports.jsx(TopPodiumCard, { item: top3[0], type: activeTab, position: 1, onClick: () => setSelectedPlayer(top3[0]) }),
        top3[2] && /* @__PURE__ */ jsxRuntimeExports.jsx(TopPodiumCard, { item: top3[2], type: activeTab, position: 3, onClick: () => setSelectedPlayer(top3[2]) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: listRef, className: "flex-1 overflow-y-auto pb-32", children: [
        restItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center text-[var(--text-secondary)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-10 h-10 mx-auto mb-3", style: {
            color: "var(--purple)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber tracking-wider", children: "暫無排行數據" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: restItems.map((item) => {
          const medalColor = getMedalColor(item.rank);
          const mine = isMe(item);
          const inTop10 = item.rank <= 10;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: mine ? myRowRef : null, className: "cyber-card p-3 flex items-center gap-3 transition-all cursor-pointer", style: {
            borderColor: mine ? "var(--pink)" : inTop10 ? "rgba(0, 255, 255, 0.4)" : "color-mix(in srgb, var(--cyan) 15%, transparent)",
            boxShadow: mine ? "0 0 12px rgba(255, 107, 157, 0.3)" : inTop10 ? "0 0 8px rgba(0, 255, 255, 0.2)" : "none",
            background: mine ? "linear-gradient(135deg, rgba(255, 107, 157, 0.08), var(--bg-card))" : inTop10 ? "linear-gradient(135deg, rgba(0, 255, 255, 0.04), var(--bg-card))" : void 0
          }, onClick: () => setSelectedPlayer(item), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 md:w-10 text-center font-cyber text-lg md:text-xl font-bold flex items-center justify-center", style: {
              color: inTop10 ? "var(--cyan)" : medalColor
            }, children: item.rank }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0", style: {
              border: `2px solid ${mine ? "var(--pink)" : inTop10 ? "var(--cyan)" : "var(--border-neon)"}`,
              boxShadow: mine ? "0 0 8px var(--pink)" : "none"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 18, style: {
              color: mine ? "var(--pink)" : "var(--text-secondary)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-sm md:text-base truncate", style: {
                  color: mine ? "var(--pink)" : "var(--text-primary)"
                }, children: [
                  item.nickname || "匿名玩家",
                  mine && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs opacity-70", children: "(我)" })
                ] }),
                item.tier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 font-cyber tracking-wider rounded-sm", style: {
                  color: "var(--cyan)",
                  border: "1px solid rgba(0, 255, 255, 0.4)",
                  backgroundColor: "rgba(0, 255, 255, 0.06)"
                }, children: item.tier })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2 truncate", children: item.guildName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--cyan)"
              }, children: item.guildName }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 md:gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RankChangeArrow, { change: item.rankChange, isNew: item.isNew }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base md:text-lg font-bold", style: {
                  color: inTop10 ? "var(--cyan)" : "var(--text-primary)",
                  textShadow: inTop10 ? "0 0 6px rgba(0, 255, 255, 0.5)" : "none"
                }, children: formatValue(item, activeTab) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-muted)]", children: getValueLabel(activeTab) })
              ] })
            ] })
          ] }, item.visitorId);
        }) })
      ] })
    ] }),
    showMyRankSeparately && myRank && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 left-0 right-0 p-3 md:p-4 z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 md:p-4 flex items-center gap-3 cursor-pointer", style: {
      borderColor: "var(--pink)",
      boxShadow: "0 0 15px rgba(255, 107, 157, 0.4), 0 -5px 20px rgba(0, 0, 0, 0.5)",
      background: "linear-gradient(135deg, rgba(255, 107, 157, 0.12), var(--bg-card))"
    }, onClick: scrollToMyRank, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-10 md:w-12 text-center font-cyber text-xl md:text-2xl font-bold text-neon-pink", children: [
        "#",
        myRank.rank
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0", style: {
        border: "2px solid var(--pink)",
        boxShadow: "0 0 8px var(--pink)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 18, style: {
        color: "var(--pink)"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-base md:text-lg text-neon-pink truncate", children: [
          myRank.nickname || "匿名玩家",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs opacity-70", children: "(我的排名)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-muted)] mt-0.5", children: [
          "距上一名：",
          getNextRankDiff()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg md:text-xl font-bold text-neon-pink", children: formatValue(myRank, activeTab) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-muted)]", children: getValueLabel(activeTab) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20, className: "text-neon-pink animate-bounce" })
    ] }) }) }),
    showRules && /* @__PURE__ */ jsxRuntimeExports.jsx(RulesModal, { type: activeTab, rules, onClose: () => setShowRules(false) }),
    selectedPlayer && /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerDetailModal, { item: selectedPlayer, type: activeTab, onClose: () => setSelectedPlayer(null) })
  ] });
};
export {
  LeaderboardPage as default
};
