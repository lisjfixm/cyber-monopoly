import { useMemo } from 'react';
import type {
  LeaderboardItem,
  LeaderboardType,
  LeaderboardScope,
  LeaderboardRegion,
  WeeklyReward,
  LeaderboardRule,
  SeasonCountdown,
} from '@shared/api.interface';
import { usePlayerIdentity } from './usePlayerIdentity';
import { useTitleProgress } from './useTitleProgress';
import { useAchievements } from './useAchievements';
import { getRankedState, RANK_TIERS } from '@client/src/utils/ranked';

const MOCK_NAMES = [
  '霓虹霸主', '賽博王者', '暗影獵手', '數據幽靈', '量子駭客',
  '電馭叛客', '星海旅人', '機甲騎士', '基因改造者', '記憶裁縫',
  '駭客帝國', '光速先鋒', '暗夜行者', '數碼修復師', '電流女王',
  '終端守護者', '虛擬武士', '電路師匠', '數據風暴', '霓虹舞者',
  '暗網潛伏者', '量子跳躍', '機械心臟', '義體強化', '賽博詩人',
  '電漿風暴', '神經漫遊者', '暗影仲裁者', '脈衝使者', '零點能量',
  '數據走私販', '霓虹修女', '鐵血判官', '混沌工程師', '時空獵人',
  '賽博修道士', '記憶駭客', '虛空行者', '電子幽靈', '磁場操控者',
  '暗物質', '光子劍士', '生物機械', '程式碼亡靈', '量子糾纏',
  '納米醫生', '反重力', '光纖舞者', '電路板農夫', '駭客教主',
  '機甲女王', '深潛者', '星際流浪者', '數據牧師', '影子經紀人',
  '時間守望者', '網路忍者', '合成人', '義體醫生', '記憶裁縫師',
  '霓虹遊俠', '鐵拳無敵', '毒牙', '疾速', '冷靜殺手',
  '爆破專家', '潛行大師', '駭入天才', '格鬥冠軍', '談判專家',
  '黑市商人', '情報販子', '賞金獵人', '企業間諜', '街頭領袖',
  '地下拳王', '賽車之神', '賭場霸主', '股票之神', '地產大亨',
  '金融寡頭', '科技新貴', '藝術家', '詩人', '哲學家',
  '革命家', '獨裁者', '救世主', '毀滅者', '創世神',
  '混沌使者', '秩序守護', '平衡維持', '毀滅君王', '永恆守護',
];

const GUILD_NAMES = [
  '霓虹騎士團', '暗影議會', '數據公會', '電流聯盟', '星海艦隊',
  '量子幫派', '機械聖殿', '基因實驗室', '駭客帝國', '電路王朝',
];

const TIERS = ['青銅', '白銀', '黃金', '鉑金', '鑽石', '大師', '王者'];

const REGIONS: LeaderboardRegion[] = ['asia', 'north-america', 'europe'];

function seededRand(seed: number): number {
  let h = 2166136261 ^ seed;
  h = Math.imul(h, 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

function getTierByRank(rank: number): string {
  if (rank <= 1) return TIERS[6];
  if (rank <= 3) return TIERS[5];
  if (rank <= 10) return TIERS[4];
  if (rank <= 30) return TIERS[3];
  if (rank <= 60) return TIERS[2];
  if (rank <= 85) return TIERS[1];
  return TIERS[0];
}

function generateMockItems(
  type: LeaderboardType,
  scope: LeaderboardScope,
  count: number,
): LeaderboardItem[] {
  const items: LeaderboardItem[] = [];
  const scopeKey = scope === 'global' ? 0 : scope === 'regional' ? 1 : 2;
  const scopeOffset = scopeKey * 100;

  for (let i = 0; i < count; i += 1) {
    const seed = i * 7919 + type.length * 31 + scopeOffset;
    const nameIdx = Math.floor(seededRand(seed) * MOCK_NAMES.length);
    const baseElo = 2600 - i * 20 + Math.floor(seededRand(seed + 1) * 15);
    const wins = 500 - i * 5 + Math.floor(seededRand(seed + 2) * 15);
    const losses = 200 + i * 3 + Math.floor(seededRand(seed + 3) * 10);
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const guildIdx = Math.floor(seededRand(seed + 4) * GUILD_NAMES.length);
    const regionIdx = Math.floor(seededRand(seed + 5) * REGIONS.length);

    let rankChange = Math.floor(seededRand(seed + 6) * 11) - 5;
    const isNew = i > count - 5 && seededRand(seed + 7) > 0.5;
    if (isNew) rankChange = 0;

    const totalAssets = 2000000 - i * 18000 + Math.floor(seededRand(seed + 8) * 10000);
    const peakAssets = 3000000 - i * 25000 + Math.floor(seededRand(seed + 9) * 15000);
    const fastestWin = 8 + i * 0.5 + seededRand(seed + 10) * 3;
    const achievementPoints = 8000 - i * 70 + Math.floor(seededRand(seed + 11) * 50);
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
      guildName: i < 20 ? GUILD_NAMES[guildIdx] : undefined,
      rankChange,
      isNew,
      tier: getTierByRank(i + 1),
      region: REGIONS[regionIdx],
    });
  }
  return items;
}

function sortByType(items: LeaderboardItem[], type: LeaderboardType): LeaderboardItem[] {
  const sorted = [...items].sort((a: LeaderboardItem, b: LeaderboardItem) => {
    switch (type) {
      case 'elo':
        return b.elo - a.elo;
      case 'wins':
        return b.wins - a.wins;
      case 'season':
        return b.seasonWins - a.seasonWins;
      case 'total-networth':
        return (b.totalAssets || 0) - (a.totalAssets || 0);
      case 'peak-networth':
        return (b.peakAssets || 0) - (a.peakAssets || 0);
      case 'fastest-win':
        return (a.fastestWinMinutes || 999) - (b.fastestWinMinutes || 999);
      case 'achievement-points':
        return (b.achievementPoints || 0) - (a.achievementPoints || 0);
      case 'collection-completion':
        return (b.collectionCompletion || 0) - (a.collectionCompletion || 0);
      default:
        return b.elo - a.elo;
    }
  });
  return sorted.map((item: LeaderboardItem, idx: number) => ({ ...item, rank: idx + 1 }));
}

const WEEKLY_REWARDS: WeeklyReward[] = [
  { rank: '第 1 名', reward: '傳說頭像框', rewardType: 'skin', value: 1 },
  { rank: '第 2-3 名', reward: '史詩稱號', rewardType: 'title', value: 1 },
  { rank: '第 4-10 名', reward: '2000 金幣', rewardType: 'coins', value: 2000 },
];

const MONTHLY_REWARDS: WeeklyReward[] = [
  { rank: '第 1 名', reward: '限定皮膚', rewardType: 'skin', value: 1 },
  { rank: '第 2-3 名', reward: '傳說頭像框', rewardType: 'skin', value: 1 },
  { rank: '第 4-10 名', reward: '5000 金幣', rewardType: 'coins', value: 5000 },
  { rank: '第 11-50 名', reward: '稀有道具包', rewardType: 'item', value: 1 },
];

const LEADERBOARD_RULES: LeaderboardRule[] = [
  {
    type: 'elo',
    name: 'ELO積分排行',
    calculationRule: '根據對戰勝負與對手積分計算ELO變動，取勝提升、戰敗下降。初始積分1000，最高無上限。',
    updateFrequency: '每場對戰結束後即時更新',
    rewards: [
      '第1名：王者稱號 + 限定皮膚',
      '第2-3名：大師稱號 + 史詩頭像框',
      '第4-10名：鑽石稱號 + 2000金幣',
      '第11-50名：鉑金稱號 + 500金幣',
      '第51-100名：黃金稱號 + 200金幣',
    ],
  },
  {
    type: 'wins',
    name: '勝場排行',
    calculationRule: '累計獲勝場次，不計算失敗。同勝場時按ELO積分排序。',
    updateFrequency: '每場對戰結束後即時更新',
    rewards: [
      '第1名：百勝將軍稱號',
      '第2-3名：戰神稱號',
      '第4-10名：常勝軍稱號',
    ],
  },
  {
    type: 'season',
    name: '賽季排行',
    calculationRule: '當前賽季的獲勝場次排名。賽季結束後重置。',
    updateFrequency: '每場對戰結束後即時更新',
    rewards: [
      '第1名：賽季王者限定皮膚',
      '第2-3名：賽季大師頭像框',
      '第4-10名：賽季鑽石邊框',
      '第11-100名：賽季參與獎',
    ],
  },
  {
    type: 'total-networth',
    name: '總資產排行',
    calculationRule: '生涯累計總資產峰值，包含現金、地產、建築、道具的總價值。',
    updateFrequency: '每場對戰結束後更新',
    rewards: [
      '第1名：資本家稱號',
      '第2-3名：金融巨頭稱號',
      '第4-10名：百萬富翁稱號',
    ],
  },
  {
    type: 'peak-networth',
    name: '單局最高資產排行',
    calculationRule: '單局遊戲中達到過的最高資產峰值記錄。',
    updateFrequency: '每場對戰結束後更新',
    rewards: [
      '第1名：巔峰傳說稱號',
      '第2-3名：巔峰大師稱號',
      '第4-10名：巔峰達人稱號',
    ],
  },
  {
    type: 'fastest-win',
    name: '最快勝利排行',
    calculationRule: '從遊戲開始到對手破產的最短時間，按分鐘數由短到長排序。',
    updateFrequency: '每場對戰結束後更新',
    rewards: [
      '第1名：閃電戰神稱號',
      '第2-3名：速通達人稱號',
      '第4-10名：高效玩家稱號',
    ],
  },
  {
    type: 'achievement-points',
    name: '成就點數排行',
    calculationRule: '已解鎖成就的總點數，傳奇成就點數最高。',
    updateFrequency: '每日凌晨更新',
    rewards: [
      '第1名：成就獵人稱號',
      '第2-3名：探索者稱號',
      '第4-10名：收藏達人稱號',
    ],
  },
  {
    type: 'collection-completion',
    name: '收藏品完成度排行',
    calculationRule: '圖鑑與收藏品的完成度百分比，涵蓋地產/道具/寵物/坐騎等所有收藏品。',
    updateFrequency: '每日凌晨更新',
    rewards: [
      '第1名：收藏家稱號 + 限定展示櫃',
      '第2-3名：鑑賞家稱號',
      '第4-10名：愛好者稱號',
    ],
  },
];

function getSeasonCountdown(): SeasonCountdown {
  const now = new Date();
  // 與 RankedSeasonPage 的賽季計算一致：以季度末為賽季結束
  const month = now.getMonth();
  const quarterEndMonth = Math.ceil((month + 1) / 3) * 3 - 1;
  const endOfQuarter = new Date(now.getFullYear(), quarterEndMonth + 1, 1);
  const diff = endOfQuarter.getTime() - now.getTime();
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    seasonName: '第7賽季：霓虹覺醒',
    endsAt: endOfQuarter.toISOString(),
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
  };
}

export function useLeaderboard() {
  const { visitorId, nickname } = usePlayerIdentity();
  const titleData = useTitleProgress();
  const achievements = useAchievements();
  const totalPoints = achievements.getTotalPoints();
  // 使用真實排位資料（ELO/勝/敗/勝率），取代假公式
  const rankedState = useMemo(() => getRankedState(), []);
  const rankedTotal = rankedState.wins + rankedState.losses;
  const rankedTierName = RANK_TIERS.find((t) => t.tier === rankedState.tier)?.name ?? '青銅';

  const myBase = useMemo<LeaderboardItem>(() => ({
    visitorId,
    rank: 0,
    nickname: nickname || '我',
    elo: rankedState.elo,
    wins: rankedState.wins,
    losses: rankedState.losses,
    seasonWins: rankedState.wins,
    seasonElo: rankedState.elo,
    winRate: rankedTotal > 0 ? Math.round((rankedState.wins / rankedTotal) * 100) : 0,
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
    region: 'asia',
  }), [visitorId, nickname, titleData, totalPoints, rankedState, rankedTotal, rankedTierName]);

  const globalItems = useMemo<LeaderboardItem[]>(
    () => generateMockItems('elo', 'global', 100),
    [],
  );

  const getItems = (
    type: LeaderboardType,
    scope: LeaderboardScope = 'global',
  ): LeaderboardItem[] => {
    let baseItems = globalItems;
    if (scope === 'regional') {
      baseItems = globalItems.filter((it: LeaderboardItem) => it.region === 'asia');
    } else if (scope === 'friends') {
      baseItems = globalItems.slice(0, 15);
    }
    const itemsWithPlayer = [...baseItems, myBase];
    return sortByType(itemsWithPlayer, type).slice(0, 100);
  };

  const getMyRank = (
    type: LeaderboardType,
    scope: LeaderboardScope = 'global',
  ): LeaderboardItem | null => {
    const items = getItems(type, scope);
    const me = items.find((item: LeaderboardItem) => item.visitorId === visitorId);
    return me || null;
  };

  const getRule = (type: LeaderboardType): LeaderboardRule | undefined => {
    return LEADERBOARD_RULES.find((r: LeaderboardRule) => r.type === type);
  };

  const getSeasonInfo = (): SeasonCountdown => getSeasonCountdown();

  return {
    getItems,
    getMyRank,
    myBase,
    weeklyRewards: WEEKLY_REWARDS,
    monthlyRewards: MONTHLY_REWARDS,
    rules: LEADERBOARD_RULES,
    getRule,
    getSeasonInfo,
  };
}
