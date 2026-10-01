import type {
  BattlePassState,
  BattlePassTier,
  BattlePassQuest,
} from '@shared/api.interface';
import {
  BATTLE_PASS_EXP_PER_LEVEL,
  BATTLE_PASS_MAX_LEVEL,
  BATTLE_PASS_REWARDS,
  BATTLE_PASS_SEASON_NAME,
  DAILY_QUEST_POOL,
  WEEKLY_QUEST_POOL,
  SEASON_QUESTS,
} from '@shared/game-config';

const STORAGE_KEY = 'cyber_monopoly_battlepass_v2';

function getSeasonEndsAt(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay.toISOString();
}

function generateDailyQuests(): BattlePassQuest[] {
  const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((q) => ({
    ...q,
    progress: 0,
    claimed: false,
    refreshType: 'daily' as const,
  }));
}

function generateWeeklyQuests(): BattlePassQuest[] {
  return WEEKLY_QUEST_POOL.slice(0, 5).map((q) => ({
    ...q,
    progress: 0,
    claimed: false,
    refreshType: 'weekly' as const,
  }));
}

function generateSeasonQuests(): BattlePassQuest[] {
  return SEASON_QUESTS.map((q) => ({
    ...q,
    progress: 0,
    claimed: false,
    refreshType: 'season' as const,
  }));
}

function buildTiers(): BattlePassTier[] {
  return BATTLE_PASS_REWARDS.map((reward) => ({
    level: reward.level,
    freeReward: reward.free,
    premiumReward: reward.premium,
    claimed: { free: false, premium: false },
  }));
}

function createInitialState(): BattlePassState {
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
    seasonQuests: generateSeasonQuests(),
  };
}

export function getBattlePassState(): BattlePassState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const state = JSON.parse(raw) as BattlePassState;
    if (!state.tiers || state.tiers.length === 0) {
      const newState = createInitialState();
      saveBattlePassState(newState);
      return newState;
    }
    return state;
  } catch {
    return createInitialState();
  }
}

export function saveBattlePassState(state: BattlePassState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存儲失敗時静默處理
  }
}

export function addExp(state: BattlePassState, exp: number): BattlePassState {
  const newTotal = Math.min(
    state.totalXP + exp,
    BATTLE_PASS_MAX_LEVEL * BATTLE_PASS_EXP_PER_LEVEL,
  );
  const newLevel = Math.min(
    Math.floor(newTotal / BATTLE_PASS_EXP_PER_LEVEL) + 1,
    BATTLE_PASS_MAX_LEVEL,
  );
  const newXP = newTotal % BATTLE_PASS_EXP_PER_LEVEL;

  return {
    ...state,
    totalXP: newTotal,
    currentLevel: newLevel,
    currentXP: newXP,
    xpToNextLevel: BATTLE_PASS_EXP_PER_LEVEL,
  };
}

export function canClaimTierReward(
  state: BattlePassState,
  level: number,
  isPremium: boolean,
): boolean {
  if (level > state.currentLevel) return false;
  if (isPremium && !state.premiumPurchased) return false;
  const tier = state.tiers.find((t) => t.level === level);
  if (!tier) return false;
  return isPremium ? !tier.claimed.premium : !tier.claimed.free;
}

export function claimTierReward(
  state: BattlePassState,
  level: number,
  isPremium: boolean,
): BattlePassState {
  if (!canClaimTierReward(state, level, isPremium)) return state;
  const newTiers = state.tiers.map((tier) => {
    if (tier.level !== level) return tier;
    return {
      ...tier,
      claimed: {
        ...tier.claimed,
        [isPremium ? 'premium' : 'free']: true,
      },
    };
  });
  return { ...state, tiers: newTiers };
}

export function canClaimQuest(quest: BattlePassQuest): boolean {
  return quest.progress >= quest.target && !quest.claimed;
}

export function claimQuest(
  state: BattlePassState,
  questId: string,
): { state: BattlePassState; xpGained: number } {
  let xpGained = 0;
  let targetQuest: BattlePassQuest | undefined;
  let questType: 'daily' | 'weekly' | 'season' = 'daily';

  for (const q of state.dailyQuests) {
    if (q.id === questId) { targetQuest = q; questType = 'daily'; break; }
  }
  if (!targetQuest) {
    for (const q of state.weeklyQuests) {
      if (q.id === questId) { targetQuest = q; questType = 'weekly'; break; }
    }
  }
  if (!targetQuest) {
    for (const q of state.seasonQuests) {
      if (q.id === questId) { targetQuest = q; questType = 'season'; break; }
    }
  }

  if (!targetQuest || !canClaimQuest(targetQuest)) {
    return { state, xpGained: 0 };
  }

  xpGained = targetQuest.xpReward;

  const updateQuests = (quests: BattlePassQuest[]): BattlePassQuest[] =>
    quests.map((q) => q.id === questId ? { ...q, claimed: true } : q);

  const newState = {
    ...state,
    dailyQuests: questType === 'daily' ? updateQuests(state.dailyQuests) : state.dailyQuests,
    weeklyQuests: questType === 'weekly' ? updateQuests(state.weeklyQuests) : state.weeklyQuests,
    seasonQuests: questType === 'season' ? updateQuests(state.seasonQuests) : state.seasonQuests,
  };

  return { state: addExp(newState, xpGained), xpGained };
}

export function purchasePremium(state: BattlePassState): BattlePassState {
  return { ...state, premiumPurchased: true };
}

export function getSeasonRewardsPreview(state: BattlePassState): Array<{
  levelThreshold: number;
  name: string;
  rarity: string;
  type: string;
}> {
  return [
    { levelThreshold: 10, name: '賽季參與獎章', rarity: 'rare', type: 'collectible' },
    { levelThreshold: 30, name: '賽季先鋒稱號', rarity: 'epic', type: 'title' },
    { levelThreshold: 50, name: '霓虹王者頭像框', rarity: 'legendary', type: 'avatarFrame' },
  ];
}
