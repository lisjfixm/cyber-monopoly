import { TOURNAMENT_CONFIG } from '@shared/game-config';
import type {
  TournamentState,
  TournamentMatch,
  TournamentStanding,
  TournamentSize,
} from '@shared/api.interface';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateGroupMatches(
  groupName: string,
  players: string[],
): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `${groupName}-${i}-${j}`,
        player1: players[i],
        player2: players[j],
        status: 'pending',
        group: groupName,
        round: 0,
      });
    }
  }
  return matches;
}

export function createTournamentState(
  size: TournamentSize,
  playerName: string,
): TournamentState {
  const players: string[] = [playerName];
  for (let i = 1; i < size; i++) {
    players.push(`AI-${i}`);
  }
  const shuffled = shuffle(players);
  const groupCount = size === 8 ? 2 : size === 16 ? 4 : 8;
  const groupSize = size / groupCount;
  const groups: Record<string, string[]> = {};
  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let allMatches: TournamentMatch[] = [];

  for (let g = 0; g < groupCount; g++) {
    const groupPlayers = shuffled.slice(g * groupSize, (g + 1) * groupSize);
    groups[groupNames[g]] = groupPlayers;
    allMatches = [...allMatches, ...generateGroupMatches(groupNames[g], groupPlayers)];
  }

  const standings: TournamentStanding[] = shuffled.map((p: string) => ({
    player: p,
    points: 0,
    wins: 0,
    losses: 0,
  }));

  return {
    id: `t-${Date.now()}`,
    size,
    phase: 'group',
    players: shuffled,
    matches: allMatches,
    standings,
    groups,
    createdAt: new Date().toISOString(),
  };
}

export function simulateMatches(matches: TournamentMatch[]): {
  updatedMatches: TournamentMatch[];
  winners: string[];
} {
  const updatedMatches: TournamentMatch[] = matches.map((m: TournamentMatch) => {
    if (m.status !== 'pending') return m;
    const winner = Math.random() < 0.5 ? m.player1 : m.player2;
    return { ...m, status: 'finished', winner };
  });
  const winners = updatedMatches
    .filter((m: TournamentMatch) => m.status === 'finished' && m.winner)
    .map((m: TournamentMatch) => m.winner!);
  return { updatedMatches, winners };
}

export function computeStandings(
  standings: TournamentStanding[],
  matches: TournamentMatch[],
): TournamentStanding[] {
  const map = new Map<string, TournamentStanding>();
  standings.forEach((s: TournamentStanding) => {
    map.set(s.player, { ...s, points: 0, wins: 0, losses: 0 });
  });
  matches.forEach((m: TournamentMatch) => {
    if (m.status !== 'finished' || !m.winner) return;
    const loser = m.winner === m.player1 ? m.player2 : m.player1;
    const w = map.get(m.winner);
    const l = map.get(loser);
    if (w) {
      w.wins += 1;
      w.points += TOURNAMENT_CONFIG.pointsPerWin;
    }
    if (l) {
      l.losses += 1;
      l.points += TOURNAMENT_CONFIG.pointsPerLoss;
    }
  });
  return Array.from(map.values()).sort(
    (a: TournamentStanding, b: TournamentStanding) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    },
  );
}

export function getGroupAdvancers(
  groupName: string,
  groups: Record<string, string[]>,
  standings: TournamentStanding[],
): string[] {
  const groupPlayers = groups[groupName] ?? [];
  return standings
    .filter((s: TournamentStanding) => groupPlayers.includes(s.player))
    .slice(0, 2)
    .map((s: TournamentStanding) => s.player);
}

export function generateKnockoutBracket(advancers: string[]): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  const totalRounds = Math.log2(advancers.length);
  let roundSize = advancers.length / 2;
  let playerIdx = 0;

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches: TournamentMatch[] = [];
    if (r === 0) {
      for (let i = 0; i < roundSize; i++) {
        roundMatches.push({
          id: `ko-r${r}-m${i}`,
          player1: advancers[playerIdx++],
          player2: advancers[playerIdx++],
          status: 'pending',
          round: r,
        });
      }
    } else {
      for (let i = 0; i < roundSize; i++) {
        roundMatches.push({
          id: `ko-r${r}-m${i}`,
          player1: '',
          player2: '',
          status: 'pending',
          round: r,
        });
      }
    }
    matches.push(...roundMatches);
    roundSize = roundSize / 2;
  }
  return matches;
}

export function advanceKnockoutWinners(
  matches: TournamentMatch[],
): TournamentMatch[] {
  const updated = [...matches];
  const totalRounds = Math.max(
    ...matches.map((m: TournamentMatch) => m.round ?? 0),
  );

  for (let r = 0; r < totalRounds; r++) {
    const currentRound = updated.filter(
      (m: TournamentMatch) =>
        m.round === r && m.status === 'finished' && m.winner,
    );
    const nextRound = updated.filter(
      (m: TournamentMatch) => m.round === r + 1,
    );
    if (currentRound.length !== nextRound.length * 2) break;

    for (let i = 0; i < nextRound.length; i++) {
      const idx = updated.findIndex(
        (m: TournamentMatch) => m.id === nextRound[i].id,
      );
      if (idx === -1) continue;
      const w1 = currentRound[i * 2].winner;
      const w2 = currentRound[i * 2 + 1].winner;
      if (w1 && w2) {
        updated[idx] = {
          ...updated[idx],
          player1: w1,
          player2: w2,
          status: 'pending',
        };
      }
    }
  }
  return updated;
}

export function getGroupMatches(
  tournament: TournamentState,
): Record<string, TournamentMatch[]> {
  if (!tournament.groups) return {};
  const result: Record<string, TournamentMatch[]> = {};
  Object.keys(tournament.groups).forEach((g: string) => {
    result[g] = tournament.matches.filter(
      (m: TournamentMatch) => m.group === g,
    );
  });
  return result;
}

export function getKnockoutRounds(tournament: TournamentState): TournamentMatch[][] {
  const koMatches = tournament.matches.filter(
    (m: TournamentMatch) => m.round !== undefined && !m.group,
  );
  if (koMatches.length === 0) return [];
  const maxRound = Math.max(
    ...koMatches.map((m: TournamentMatch) => m.round ?? 0),
  );
  const rounds: TournamentMatch[][] = [];
  for (let r = 0; r <= maxRound; r++) {
    rounds.push(koMatches.filter((m: TournamentMatch) => m.round === r));
  }
  return rounds;
}

export function getSortedStandings(
  tournament: TournamentState,
): TournamentStanding[] {
  return [...tournament.standings].sort(
    (a: TournamentStanding, b: TournamentStanding) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    },
  );
}

export function canSimulateNextRound(tournament: TournamentState | null): boolean {
  if (!tournament) return false;
  if (tournament.phase === 'finished') return false;
  if (tournament.phase === 'group') {
    return tournament.matches.some(
      (m: TournamentMatch) => m.status === 'pending' && m.group,
    );
  }
  if (tournament.phase === 'knockout') {
    return tournament.matches.some(
      (m: TournamentMatch) =>
        m.round !== undefined &&
        !m.group &&
        m.status === 'pending' &&
        m.player1 &&
        m.player2,
    );
  }
  return false;
}

export function simulateNextRound(
  tournament: TournamentState,
): TournamentState {
  if (tournament.phase === 'group') {
    const pendingMatches = tournament.matches.filter(
      (m: TournamentMatch) => m.status === 'pending' && m.group,
    );
    if (pendingMatches.length === 0) {
      // All group matches done → advance to knockout
      const standings = computeStandings(
        tournament.standings,
        tournament.matches,
      );
      const advancers: string[] = [];
      const groupNames = Object.keys(tournament.groups ?? {});
      groupNames.forEach((g: string) => {
        advancers.push(
          ...getGroupAdvancers(g, tournament.groups!, standings),
        );
      });
      const koMatches = generateKnockoutBracket(advancers);
      return {
        ...tournament,
        phase: 'knockout',
        matches: [...tournament.matches, ...koMatches],
        standings,
      };
    }
    // Simulate all pending group matches
    const { updatedMatches } = simulateMatches(tournament.matches);
    const standings = computeStandings(tournament.standings, updatedMatches);
    return { ...tournament, matches: updatedMatches, standings };
  }

  if (tournament.phase === 'knockout') {
    const koMatches = tournament.matches.filter(
      (m: TournamentMatch) => m.round !== undefined && !m.group,
    );
    const firstPendingRound = koMatches
      .filter(
        (m: TournamentMatch) =>
          m.status === 'pending' && m.player1 && m.player2,
      )
      .sort(
        (a: TournamentMatch, b: TournamentMatch) =>
          (a.round ?? 0) - (b.round ?? 0),
      )[0]?.round;

    if (firstPendingRound === undefined) {
      const finalMatch = koMatches.find(
        (m: TournamentMatch) =>
          m.round ===
          Math.max(
            ...koMatches.map((x: TournamentMatch) => x.round ?? 0),
          ),
      );
      if (finalMatch && finalMatch.status === 'finished' && finalMatch.winner) {
        return {
          ...tournament,
          phase: 'finished',
          champion: finalMatch.winner,
        };
      }
      return tournament;
    }

    const roundMatches = koMatches.filter(
      (m: TournamentMatch) =>
        m.round === firstPendingRound &&
        m.status === 'pending' &&
        m.player1 &&
        m.player2,
    );

    const otherMatches = tournament.matches.filter(
      (m: TournamentMatch) =>
        !roundMatches.find((rm: TournamentMatch) => rm.id === m.id),
    );
    const { updatedMatches: simulated } = simulateMatches(roundMatches);

    let allMatches = [...otherMatches, ...simulated];
    allMatches = advanceKnockoutWinners(allMatches);

    const totalRounds = Math.log2(tournament.size / 2);
    if (firstPendingRound >= totalRounds - 1) {
      const finalMatch = simulated.find(
        (m: TournamentMatch) => m.round === firstPendingRound,
      );
      if (finalMatch && finalMatch.winner) {
        const standings = computeStandings(
          tournament.standings,
          allMatches,
        );
        return {
          ...tournament,
          matches: allMatches,
          phase: 'finished',
          champion: finalMatch.winner,
          standings,
        };
      }
    }

    const standings = computeStandings(tournament.standings, allMatches);
    return { ...tournament, matches: allMatches, standings };
  }

  return tournament;
}
