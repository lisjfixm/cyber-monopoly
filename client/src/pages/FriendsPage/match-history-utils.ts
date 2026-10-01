// 對戰記錄 localStorage 工具函式
// localStorage key: monopoly_friend_match_history

export type GameMode = 'classic' | 'quick' | 'crazy';
export type MatchResult = 'win' | 'lose';

export interface MatchRecord {
  id: string;
  friendUserId: string;
  friendNickname: string;
  mode: GameMode;
  result: MatchResult;
  duration: number; // 秒
  playedAt: string; // ISO string
}

export interface FriendStat {
  userId: string;
  nickname: string;
  totalMatches: number;
  myWins: number;
  friendWins: number;
  myWinRate: number; // 0~1
  relation: 'proud' | 'grudge' | 'even';
}

const STORAGE_KEY = 'monopoly_friend_match_history';

const MODE_LABELS: Record<GameMode, string> = {
  classic: '經典',
  quick: '快速',
  crazy: '瘋狂',
};

const MOCK_FRIENDS = [
  { userId: 'mock_friend_01', nickname: '霓虹獵人' },
  { userId: 'mock_friend_02', nickname: '數據遊俠' },
  { userId: 'mock_friend_03', nickname: '暗影駭客' },
  { userId: 'mock_friend_04', nickname: '電馭祭司' },
  { userId: 'mock_friend_05', nickname: '賽博忍者' },
];

function generateMockData(): MatchRecord[] {
  const records: MatchRecord[] = [];
  const modes: GameMode[] = ['classic', 'quick', 'crazy'];
  const now = Date.now();

  MOCK_FRIENDS.forEach((friend, friendIdx) => {
    // 每位好友 3~8 場
    const matchCount = 3 + (friendIdx % 6);
    for (let i = 0; i < matchCount; i++) {
      const daysAgo = friendIdx * 5 + i * 2 + Math.floor(Math.random() * 3);
      const hoursAgo = Math.floor(Math.random() * 20);
      const playedAt = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000);
      const result: MatchResult = Math.random() > 0.5 ? 'win' : 'lose';
      const mode = modes[Math.floor(Math.random() * modes.length)];
      const duration = 300 + Math.floor(Math.random() * 1500); // 5~30 分鐘

      records.push({
        id: `match_${friend.userId}_${i}_${playedAt.getTime()}`,
        friendUserId: friend.userId,
        friendNickname: friend.nickname,
        mode,
        result,
        duration,
        playedAt: playedAt.toISOString(),
      });
    }
  });

  // 按時間倒序
  return records.sort((a, b) =>
    new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
  );
}

function readStorage(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const mock = generateMockData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      return mock;
    }
    const parsed = JSON.parse(raw) as MatchRecord[];
    if (!Array.isArray(parsed)) {
      const mock = generateMockData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      return mock;
    }
    return parsed;
  } catch {
    const mock = generateMockData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    } catch {
      // ignore
    }
    return mock;
  }
}

function writeStorage(records: MatchRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore quota errors
  }
}

// === 導出工具函式 ===

export function getFriendMatchHistory(friendUserId?: string): MatchRecord[] {
  const all = readStorage();
  if (!friendUserId) return all;
  return all.filter((r: MatchRecord) => r.friendUserId === friendUserId);
}

export function addFriendMatch(record: Omit<MatchRecord, 'id'>): MatchRecord {
  const all = readStorage();
  const newRecord: MatchRecord = {
    ...record,
    id: `match_${record.friendUserId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  all.unshift(newRecord);
  writeStorage(all);
  return newRecord;
}

export function getFriendStats(): FriendStat[] {
  const records = readStorage();
  const statMap = new Map<string, FriendStat>();

  // 先收集所有出現過的好友
  for (const rec of records) {
    if (!statMap.has(rec.friendUserId)) {
      statMap.set(rec.friendUserId, {
        userId: rec.friendUserId,
        nickname: rec.friendNickname,
        totalMatches: 0,
        myWins: 0,
        friendWins: 0,
        myWinRate: 0,
        relation: 'even',
      });
    }
    const stat = statMap.get(rec.friendUserId)!;
    stat.totalMatches += 1;
    if (rec.result === 'win') {
      stat.myWins += 1;
    } else {
      stat.friendWins += 1;
    }
  }

  // 計算勝率與關係
  const stats: FriendStat[] = [];
  for (const stat of statMap.values()) {
    stat.myWinRate = stat.totalMatches > 0 ? stat.myWins / stat.totalMatches : 0;
    if (stat.myWins > stat.friendWins) {
      stat.relation = 'proud';
    } else if (stat.friendWins > stat.myWins) {
      stat.relation = 'grudge';
    } else {
      stat.relation = 'even';
    }
    stats.push(stat);
  }

  // 按對戰次數倒序
  return stats.sort((a, b) => b.totalMatches - a.totalMatches);
}

export function getModeLabel(mode: GameMode): string {
  return MODE_LABELS[mode];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} 秒`;
  if (secs === 0) return `${mins} 分鐘`;
  return `${mins} 分 ${secs} 秒`;
}

export function formatPlayedAt(iso: string): string {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${hh}:${mm}`;
}
