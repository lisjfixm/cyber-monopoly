import { aF as safeGetJSON, bc as BATTLE_PASS_MAX_LEVEL, cB as BATTLE_PASS_EXP_PER_LEVEL, aG as safeSetJSON, bd as BATTLE_PASS_SEASON_NAME, cC as SEASON_QUESTS, cD as WEEKLY_QUEST_POOL, cE as BATTLE_PASS_REWARDS, cF as DAILY_QUEST_POOL } from "./index-ymfxQ6bv.js";
const STORAGE_KEY = "cyber_monopoly_battlepass_v2";
function getSeasonEndsAt() {
  const now = /* @__PURE__ */ new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay.toISOString();
}
function generateDailyQuests() {
  const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((q) => ({
    ...q,
    progress: 0,
    claimed: false,
    refreshType: "daily"
  }));
}
function generateWeeklyQuests() {
  return WEEKLY_QUEST_POOL.slice(0, 5).map((q) => ({
    ...q,
    progress: 0,
    claimed: false,
    refreshType: "weekly"
  }));
}
function generateSeasonQuests() {
  return SEASON_QUESTS.map((q) => ({
    ...q,
    progress: 0,
    claimed: false,
    refreshType: "season"
  }));
}
function buildTiers() {
  return BATTLE_PASS_REWARDS.map((reward) => ({
    level: reward.level,
    freeReward: reward.free,
    premiumReward: reward.premium,
    claimed: {
      free: false,
      premium: false
    }
  }));
}
function createInitialState() {
  const startLevel = 28;
  const startXP = 1250;
  return {
    seasonName: BATTLE_PASS_SEASON_NAME,
    seasonEndsAt: getSeasonEndsAt(),
    currentLevel: startLevel,
    currentXP: startXP,
    xpToNextLevel: BATTLE_PASS_EXP_PER_LEVEL,
    totalXP: (startLevel - 1) * BATTLE_PASS_EXP_PER_LEVEL + startXP,
    premiumPurchased: false,
    tiers: buildTiers(),
    dailyQuests: generateDailyQuests(),
    weeklyQuests: generateWeeklyQuests(),
    seasonQuests: generateSeasonQuests()
  };
}
function getBattlePassState() {
  const fallback = createInitialState();
  let state = null;
  try {
    state = safeGetJSON(STORAGE_KEY, null);
  } catch {
    state = null;
  }
  if (!state || typeof state !== "object") return fallback;
  const sanitized = {
    ...fallback,
    ...state,
    tiers: Array.isArray(state.tiers) && state.tiers.length > 0 ? state.tiers : fallback.tiers,
    dailyQuests: Array.isArray(state.dailyQuests) && state.dailyQuests.length > 0 ? state.dailyQuests : fallback.dailyQuests,
    weeklyQuests: Array.isArray(state.weeklyQuests) && state.weeklyQuests.length > 0 ? state.weeklyQuests : fallback.weeklyQuests,
    seasonQuests: Array.isArray(state.seasonQuests) && state.seasonQuests.length > 0 ? state.seasonQuests : fallback.seasonQuests,
    currentLevel: typeof state.currentLevel === "number" && !Number.isNaN(state.currentLevel) ? Math.max(1, Math.min(BATTLE_PASS_MAX_LEVEL, Math.floor(state.currentLevel))) : fallback.currentLevel,
    currentXP: typeof state.currentXP === "number" && !Number.isNaN(state.currentXP) ? Math.max(0, state.currentXP) : fallback.currentXP,
    totalXP: typeof state.totalXP === "number" && !Number.isNaN(state.totalXP) ? Math.max(0, state.totalXP) : fallback.totalXP,
    premiumPurchased: state.premiumPurchased === true
  };
  saveBattlePassState(sanitized);
  return sanitized;
}
function saveBattlePassState(state) {
  safeSetJSON(STORAGE_KEY, state);
}
function addExp(state, exp) {
  const newTotal = Math.min(state.totalXP + exp, BATTLE_PASS_MAX_LEVEL * BATTLE_PASS_EXP_PER_LEVEL);
  const newLevel = Math.min(Math.floor(newTotal / BATTLE_PASS_EXP_PER_LEVEL) + 1, BATTLE_PASS_MAX_LEVEL);
  const newXP = newTotal % BATTLE_PASS_EXP_PER_LEVEL;
  return {
    ...state,
    totalXP: newTotal,
    currentLevel: newLevel,
    currentXP: newXP,
    xpToNextLevel: BATTLE_PASS_EXP_PER_LEVEL
  };
}
function canClaimTierReward(state, level, isPremium) {
  if (level > state.currentLevel) return false;
  if (isPremium && !state.premiumPurchased) return false;
  const tier = state.tiers.find((t) => t.level === level);
  if (!tier) return false;
  return isPremium ? !tier.claimed.premium : !tier.claimed.free;
}
function claimTierReward(state, level, isPremium) {
  if (!canClaimTierReward(state, level, isPremium)) return state;
  const newTiers = state.tiers.map((tier) => {
    if (tier.level !== level) return tier;
    return {
      ...tier,
      claimed: {
        ...tier.claimed,
        [isPremium ? "premium" : "free"]: true
      }
    };
  });
  return {
    ...state,
    tiers: newTiers
  };
}
function canClaimQuest(quest) {
  if (!quest || typeof quest.target !== "number" || quest.target <= 0) return false;
  return quest.progress >= quest.target && !quest.claimed;
}
function claimQuest(state, questId) {
  let xpGained = 0;
  let targetQuest;
  let questType = "daily";
  for (const q of state.dailyQuests) {
    if (q.id === questId) {
      targetQuest = q;
      questType = "daily";
      break;
    }
  }
  if (!targetQuest) {
    for (const q of state.weeklyQuests) {
      if (q.id === questId) {
        targetQuest = q;
        questType = "weekly";
        break;
      }
    }
  }
  if (!targetQuest) {
    for (const q of state.seasonQuests) {
      if (q.id === questId) {
        targetQuest = q;
        questType = "season";
        break;
      }
    }
  }
  if (!targetQuest || !canClaimQuest(targetQuest)) {
    return {
      state,
      xpGained: 0
    };
  }
  xpGained = targetQuest.xpReward;
  const updateQuests = (quests) => quests.map((q) => q.id === questId ? {
    ...q,
    claimed: true
  } : q);
  const newState = {
    ...state,
    dailyQuests: questType === "daily" ? updateQuests(state.dailyQuests) : state.dailyQuests,
    weeklyQuests: questType === "weekly" ? updateQuests(state.weeklyQuests) : state.weeklyQuests,
    seasonQuests: questType === "season" ? updateQuests(state.seasonQuests) : state.seasonQuests
  };
  return {
    state: addExp(newState, xpGained),
    xpGained
  };
}
function purchasePremium(state) {
  return {
    ...state,
    premiumPurchased: true
  };
}
function getSeasonRewardsPreview(state) {
  return [{
    levelThreshold: 10,
    name: "賽季參與獎章",
    rarity: "rare",
    type: "collectible"
  }, {
    levelThreshold: 30,
    name: "賽季先鋒稱號",
    rarity: "epic",
    type: "title"
  }, {
    levelThreshold: 50,
    name: "霓虹王者頭像框",
    rarity: "legendary",
    type: "avatarFrame"
  }];
}
export {
  getSeasonRewardsPreview as a,
  addExp as b,
  claimTierReward as c,
  claimQuest as d,
  canClaimTierReward as e,
  canClaimQuest as f,
  getBattlePassState as g,
  purchasePremium as p,
  saveBattlePassState as s
};
