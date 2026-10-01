// 後端接入點：在 game-engine.ts 的過路費收取邏輯前增加結盟判斷
// if (isAllied(currentPlayer, propertyOwner) { skipRent(); return; }
// 這裡的 isAllied 函數邏輯應與前端一致
//
// 後端接入點（聲望扣減）：背叛時應調用
//   changeReputation(betrayerIndex, -10, 'betrayal')
// 與既有偷地 -10、黑市 -5 等規則同級處理

export interface Alliance {
  playerIndexA: number;
  playerIndexB: number;
  createdAt: number;
}

export interface AllianceInvite {
  from: number;
  to: number;
  timestamp: number;
}

export interface AllianceState {
  alliances: Alliance[];
  invites: AllianceInvite[];
}

const STORAGE_KEY = 'monopoly_alliance_state';
const REPUTATION_OVERRIDE_KEY = 'monopoly_reputation_override';

const EMPTY_STATE: AllianceState = {
  alliances: [],
  invites: [],
};

function normalizeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function getAllianceState(): AllianceState {
  if (typeof window === 'undefined') return { ...EMPTY_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as AllianceState;
    if (!parsed.alliances || !parsed.invites) return { ...EMPTY_STATE };
    return parsed;
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveAllianceState(state: AllianceState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function isAllied(
  state: AllianceState,
  playerA: number,
  playerB: number,
): boolean {
  if (playerA === playerB) return false;
  const key = normalizeKey(playerA, playerB);
  return state.alliances.some(
    (a) => normalizeKey(a.playerIndexA, a.playerIndexB) === key,
  );
}

function findAlliance(
  state: AllianceState,
  playerA: number,
  playerB: number,
): Alliance | undefined {
  const key = normalizeKey(playerA, playerB);
  return state.alliances.find(
    (a) => normalizeKey(a.playerIndexA, a.playerIndexB) === key,
  );
}

export function sendInvite(
  state: AllianceState,
  from: number,
  to: number,
): AllianceState {
  if (from === to) return state;
  if (isAllied(state, from, to)) return state;
  // 避免重複邀請
  const existing = state.invites.find((i) => i.from === from && i.to === to);
  if (existing) return state;
  // 對方已發來邀請，直接接受
  const reverse = state.invites.find((i) => i.from === to && i.to === from);
  if (reverse) {
    return acceptInvite(state, to, from);
  }
  const newInvite: AllianceInvite = {
    from,
    to,
    timestamp: Date.now(),
  };
  const next: AllianceState = {
    alliances: state.alliances,
    invites: [...state.invites, newInvite],
  };
  saveAllianceState(next);
  return next;
}

export function acceptInvite(
  state: AllianceState,
  from: number,
  to: number,
): AllianceState {
  const inviteIndex = state.invites.findIndex(
    (i) => i.from === from && i.to === to,
  );
  if (inviteIndex === -1) return state;
  if (isAllied(state, from, to)) {
    // 已經結盟，清除邀請
    const next: AllianceState = {
      alliances: state.alliances,
      invites: state.invites.filter((_, i) => i !== inviteIndex),
    };
    saveAllianceState(next);
    return next;
  }
  const newAlliance: Alliance = {
    playerIndexA: from,
    playerIndexB: to,
    createdAt: Date.now(),
  };
  const next: AllianceState = {
    alliances: [...state.alliances, newAlliance],
    invites: state.invites.filter(
      (i) => !(i.from === from && i.to === to) && !(i.from === to && i.to === from),
    ),
  };
  saveAllianceState(next);
  return next;
}

export function rejectInvite(
  state: AllianceState,
  from: number,
  to: number,
): AllianceState {
  const next: AllianceState = {
    alliances: state.alliances,
    invites: state.invites.filter((i) => !(i.from === from && i.to === to)),
  };
  saveAllianceState(next);
  return next;
}

export function betray(
  state: AllianceState,
  betrayer: number,
  ally: number,
): AllianceState {
  const alliance = findAlliance(state, betrayer, ally);
  if (!alliance) return state;
  const key = normalizeKey(betrayer, ally);
  const next: AllianceState = {
    alliances: state.alliances.filter(
      (a) => normalizeKey(a.playerIndexA, a.playerIndexB) !== key,
    ),
    invites: state.invites,
  };
  saveAllianceState(next);
  return next;
}

// 聲望本地覆蓋（前端模擬，不影響後端真實數據）
export interface ReputationOverride {
  [playerIndex: number]: number; // delta 值，正負皆可
}

export function getReputationOverride(): ReputationOverride {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(REPUTATION_OVERRIDE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReputationOverride;
  } catch {
    return {};
  }
}

export function saveReputationOverride(override: ReputationOverride): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REPUTATION_OVERRIDE_KEY, JSON.stringify(override));
  } catch {
    // ignore
  }
}

export function applyReputationDelta(
  playerIndex: number,
  delta: number,
): ReputationOverride {
  const current = getReputationOverride();
  const existing = current[playerIndex] ?? 0;
  const next: ReputationOverride = {
    ...current,
    [playerIndex]: existing + delta,
  };
  saveReputationOverride(next);
  return next;
}

export function getEffectiveReputation(
  baseReputation: number | undefined,
  playerIndex: number,
): number {
  const override = getReputationOverride();
  const delta = override[playerIndex] ?? 0;
  const base = baseReputation ?? 50;
  return Math.max(0, Math.min(100, base + delta));
}
