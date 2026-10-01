export type RankTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'king';

export interface RankTierConfig {
  tier: RankTier;
  name: string;
  color: string;
  glowColor: string;
  minElo: number;
  maxElo: number;
  description: string;
  iconLetter: string;
}

export interface RankedState {
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  currentSeason: string;
  tier: RankTier;
}

export const RANK_TIERS: RankTierConfig[] = [
  {
    tier: 'bronze',
    name: '青銅',
    color: 'hsl(30, 60%, 45%)',
    glowColor: 'hsl(30, 80%, 55%)',
    minElo: 0,
    maxElo: 799,
    description: '新手入門，累積實戰經驗',
    iconLetter: 'B',
  },
  {
    tier: 'silver',
    name: '白銀',
    color: 'hsl(210, 15%, 70%)',
    glowColor: 'hsl(210, 30%, 80%)',
    minElo: 800,
    maxElo: 1199,
    description: '嶄露頭角，磨練基礎技巧',
    iconLetter: 'S',
  },
  {
    tier: 'gold',
    name: '黃金',
    color: 'hsl(45, 90%, 55%)',
    glowColor: 'hsl(45, 100%, 65%)',
    minElo: 1200,
    maxElo: 1599,
    description: '中堅玩家，掌握戰略節奏',
    iconLetter: 'G',
  },
  {
    tier: 'platinum',
    name: '鉑金',
    color: 'hsl(180, 60%, 65%)',
    glowColor: 'hsl(180, 80%, 75%)',
    minElo: 1600,
    maxElo: 1999,
    description: '高手門檻，精通各種套路',
    iconLetter: 'P',
  },
  {
    tier: 'diamond',
    name: '鑽石',
    color: 'hsl(200, 90%, 65%)',
    glowColor: 'hsl(200, 100%, 75%)',
    minElo: 2000,
    maxElo: 2399,
    description: '頂尖玩家，隨心所欲運籌',
    iconLetter: 'D',
  },
  {
    tier: 'master',
    name: '大師',
    color: 'hsl(280, 80%, 65%)',
    glowColor: 'hsl(280, 90%, 75%)',
    minElo: 2400,
    maxElo: 2799,
    description: '宗師級別，引領賽局風向',
    iconLetter: 'M',
  },
  {
    tier: 'king',
    name: '王者',
    color: 'hsl(45, 100%, 60%)',
    glowColor: 'hsl(45, 100%, 70%)',
    minElo: 2800,
    maxElo: 9999,
    description: '賽博霸主，屹立財富之巔',
    iconLetter: 'K',
  },
];

const STORAGE_KEY = 'monopoly_ranked_state';

function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const seasonNum = Math.ceil(month / 3);
  return `${year}-S${seasonNum}`;
}

export function getInitialRankedState(): RankedState {
  return {
    elo: 1000,
    wins: 0,
    losses: 0,
    winStreak: 0,
    bestWinStreak: 0,
    currentSeason: getCurrentSeason(),
    tier: 'silver',
  };
}

export function getRankedState(): RankedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialRankedState();
      saveRankedState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as RankedState;
    const season = getCurrentSeason();
    if (parsed.currentSeason !== season) {
      const resetElo = Math.max(800, Math.floor(parsed.elo * 0.7));
      const resetState: RankedState = {
        elo: resetElo,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        currentSeason: season,
        tier: calculateTier(resetElo),
      };
      saveRankedState(resetState);
      return resetState;
    }
    if (!parsed.tier) {
      parsed.tier = calculateTier(parsed.elo);
      saveRankedState(parsed);
    }
    return parsed;
  } catch {
    const initial = getInitialRankedState();
    return initial;
  }
}

export function saveRankedState(state: RankedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function calculateTier(elo: number): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (elo >= RANK_TIERS[i].minElo) {
      return RANK_TIERS[i].tier;
    }
  }
  return 'bronze';
}

export function getTierProgress(elo: number): {
  currentTier: RankTierConfig;
  nextTier: RankTierConfig | null;
  progress: number;
  minElo: number;
  maxElo: number;
} {
  const tier = calculateTier(elo);
  const currentIndex = RANK_TIERS.findIndex((t) => t.tier === tier);
  const currentTier = RANK_TIERS[currentIndex];
  const nextTier = currentIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      minElo: currentTier.minElo,
      maxElo: currentTier.maxElo,
    };
  }

  const range = nextTier.minElo - currentTier.minElo;
  const current = elo - currentTier.minElo;
  const progress = Math.min(100, Math.max(0, (current / range) * 100));

  return {
    currentTier,
    nextTier,
    progress,
    minElo: currentTier.minElo,
    maxElo: nextTier.minElo,
  };
}

export function calculateEloChange(
  ranked: RankedState,
  won: boolean,
  opponentElo: number,
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - ranked.elo) / 400));
  const kFactor = 25;
  const baseChange = won
    ? Math.round(kFactor * (1 - expected))
    : -Math.round(kFactor * expected);

  let change = baseChange;

  if (won) {
    change = Math.max(15, Math.min(30, change));
    if (ranked.winStreak >= 3) {
      change += Math.min(10, ranked.winStreak * 2);
    }
  } else {
    change = Math.max(-20, Math.min(-10, change));
  }

  return change;
}

export function applyMatchResult(
  ranked: RankedState,
  won: boolean,
  opponentElo: number,
): RankedState {
  const eloChange = calculateEloChange(ranked, won, opponentElo);
  const newElo = Math.max(0, ranked.elo + eloChange);
  const newWinStreak = won ? ranked.winStreak + 1 : 0;
  const newBestWinStreak = won
    ? Math.max(ranked.bestWinStreak ?? 0, newWinStreak)
    : ranked.bestWinStreak;

  const newState: RankedState = {
    ...ranked,
    elo: newElo,
    wins: ranked.wins + (won ? 1 : 0),
    losses: ranked.losses + (won ? 0 : 1),
    winStreak: newWinStreak,
    bestWinStreak: newBestWinStreak,
    tier: calculateTier(newElo),
  };

  return newState;
}
