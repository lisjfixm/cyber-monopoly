import type {
  FriendInfo,
  RecentPlayer,
  FriendActivity,
  FriendRequest,
  OnlineStatus,
} from './friends.types';

const FRIENDS_KEY = 'monopoly_friends_list';
const REQUESTS_KEY = 'monopoly_friends_requests';
const RECENT_KEY = 'monopoly_friends_recent';
const ACTIVITY_KEY = 'monopoly_friends_activity';

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

const DEFAULT_FRIENDS: FriendInfo[] = [
  {
    userId: 'f1',
    nickname: '霓虹夜行者',
    avatarSeed: 'f1_avatar',
    status: 'accepted',
    onlineStatus: 'online',
    currentMode: 'ranked',
    level: 28,
    rank: '鑽石III',
    addedAt: '2088-01-15T10:30:00Z',
    lastSeen: now(),
  },
  {
    userId: 'f2',
    nickname: '數據殭屍',
    avatarSeed: 'f2_avatar',
    status: 'accepted',
    onlineStatus: 'in_game',
    currentMode: 'classic',
    level: 35,
    rank: '宗師I',
    addedAt: '2087-12-20T08:15:00Z',
    lastSeen: now(),
  },
  {
    userId: 'f3',
    nickname: '影子跑者',
    avatarSeed: 'f3_avatar',
    status: 'accepted',
    onlineStatus: 'online',
    currentMode: '',
    level: 18,
    rank: '黃金V',
    addedAt: '2088-02-01T14:20:00Z',
    lastSeen: now(),
  },
  {
    userId: 'f4',
    nickname: '光纖貓',
    avatarSeed: 'f4_avatar',
    status: 'accepted',
    onlineStatus: 'away',
    currentMode: 'quick',
    level: 22,
    rank: '白金IV',
    addedAt: '2088-01-28T09:45:00Z',
    lastSeen: '2088-09-28T18:30:00Z',
  },
  {
    userId: 'f5',
    nickname: '量子駭客',
    avatarSeed: 'f5_avatar',
    status: 'accepted',
    onlineStatus: 'offline',
    currentMode: '',
    level: 42,
    rank: '大師II',
    addedAt: '2087-11-10T16:00:00Z',
    lastSeen: '2088-09-25T22:10:00Z',
  },
  {
    userId: 'f6',
    nickname: '電流公主',
    avatarSeed: 'f6_avatar',
    status: 'accepted',
    onlineStatus: 'offline',
    currentMode: '',
    level: 15,
    rank: '白銀III',
    addedAt: '2088-03-05T11:20:00Z',
    lastSeen: '2088-09-20T14:00:00Z',
  },
];

const DEFAULT_REQUESTS: FriendRequest[] = [
  {
    id: 'req1',
    fromUserId: 'r1',
    fromNickname: '賽博浪人',
    toUserId: 'self',
    toNickname: '我',
    message: '看你排行很高，想一起開黑！',
    status: 'pending',
    createdAt: '2088-09-28T20:15:00Z',
  },
  {
    id: 'req2',
    fromUserId: 'r2',
    fromNickname: '街頭藝人',
    toUserId: 'self',
    toNickname: '我',
    message: '上次對戰很精彩，加個好友吧',
    status: 'pending',
    createdAt: '2088-09-28T15:42:00Z',
  },
];

const DEFAULT_RECENT: RecentPlayer[] = [
  {
    userId: 'rp1',
    nickname: '地產大亨',
    avatarSeed: 'rp1_avatar',
    rank: '鑽石I',
    lastPlayedAt: '2088-09-28T22:00:00Z',
    playedCount: 3,
    isFriend: false,
  },
  {
    userId: 'rp2',
    nickname: '現金流水',
    avatarSeed: 'rp2_avatar',
    rank: '白金II',
    lastPlayedAt: '2088-09-28T19:30:00Z',
    playedCount: 1,
    isFriend: false,
  },
  {
    userId: 'rp3',
    nickname: '股市鯊魚',
    avatarSeed: 'rp3_avatar',
    rank: '黃金II',
    lastPlayedAt: '2088-09-27T23:10:00Z',
    playedCount: 2,
    isFriend: false,
  },
  {
    userId: 'f2',
    nickname: '數據殭屍',
    avatarSeed: 'f2_avatar',
    rank: '宗師I',
    lastPlayedAt: '2088-09-28T21:00:00Z',
    playedCount: 5,
    isFriend: true,
  },
];

const DEFAULT_ACTIVITY: FriendActivity[] = [
  {
    id: 'a1',
    userId: 'f2',
    userName: '數據殭屍',
    type: 'rank_up',
    content: '段位提升至 宗師 I',
    detail: '連勝 7 場達成晉級',
    timestamp: '2088-09-28T21:30:00Z',
  },
  {
    id: 'a2',
    userId: 'f1',
    userName: '霓虹夜行者',
    type: 'achievement',
    content: '解鎖成就「地產大亨」',
    detail: '同時擁有 10 處地產',
    timestamp: '2088-09-28T18:45:00Z',
  },
  {
    id: 'a3',
    userId: 'f5',
    userName: '量子駭客',
    type: 'win_streak',
    content: '達成 5 連勝',
    detail: '排位賽連勝紀錄',
    timestamp: '2088-09-27T14:20:00Z',
  },
  {
    id: 'a4',
    userId: 'f3',
    userName: '影子跑者',
    type: 'new_title',
    content: '獲得頭銜「暗夜行者」',
    detail: '連續 30 天登錄獎勵',
    timestamp: '2088-09-26T10:00:00Z',
  },
];

export function getFriends(): FriendInfo[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as FriendInfo[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(DEFAULT_FRIENDS));
  } catch {
    // ignore
  }
  return DEFAULT_FRIENDS;
}

export function saveFriends(friends: FriendInfo[]): void {
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  } catch {
    // ignore
  }
}

export function getFriendRequests(): FriendRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as FriendRequest[];
      if (Array.isArray(arr)) return arr.filter((r: FriendRequest) => r.status === 'pending');
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(DEFAULT_REQUESTS));
  } catch {
    // ignore
  }
  return DEFAULT_REQUESTS;
}

export function saveRequests(requests: FriendRequest[]): void {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    // ignore
  }
}

export function acceptRequest(requestId: string): FriendInfo | null {
  const requests = getFriendRequests();
  const req = requests.find((r: FriendRequest) => r.id === requestId);
  if (!req) return null;
  const newFriend: FriendInfo = {
    userId: req.fromUserId,
    nickname: req.fromNickname,
    avatarSeed: `${req.fromUserId}_avatar`,
    status: 'accepted',
    onlineStatus: 'online',
    level: 10,
    rank: '新手',
    addedAt: now(),
    lastSeen: now(),
  };
  const friends = getFriends();
  friends.push(newFriend);
  saveFriends(friends);
  req.status = 'accepted';
  saveRequests(requests.filter((r: FriendRequest) => r.status === 'pending'));
  updateRecentPlayerFriendship(req.fromUserId, true);
  window.dispatchEvent(new CustomEvent('friends-updated'));
  return newFriend;
}

export function rejectRequest(requestId: string): boolean {
  const requests = getFriendRequests();
  const req = requests.find((r: FriendRequest) => r.id === requestId);
  if (!req) return false;
  saveRequests(requests.filter((r: FriendRequest) => r.id !== requestId));
  window.dispatchEvent(new CustomEvent('friends-updated'));
  return true;
}

export function addFriend(userId: string, nickname: string, message?: string): boolean {
  const friends = getFriends();
  if (friends.some((f: FriendInfo) => f.userId === userId)) return false;
  const requests = getFriendRequests();
  if (requests.some(
    (r: FriendRequest) => r.toUserId === userId && r.status === 'pending' && r.fromUserId === 'self',
  )) return false;
  const newReq: FriendRequest = {
    id: uid(),
    fromUserId: 'self',
    fromNickname: '我',
    toUserId: userId,
    toNickname: nickname,
    message,
    status: 'pending',
    createdAt: now(),
  };
  requests.push(newReq);
  saveRequests(requests);
  window.dispatchEvent(new CustomEvent('friends-updated'));
  return true;
}

export function removeFriend(userId: string): boolean {
  const friends = getFriends();
  const filtered = friends.filter((f: FriendInfo) => f.userId !== userId);
  if (filtered.length === friends.length) return false;
  saveFriends(filtered);
  updateRecentPlayerFriendship(userId, false);
  return true;
}

export function getRecentPlayers(): RecentPlayer[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as RecentPlayer[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(DEFAULT_RECENT));
  } catch {
    // ignore
  }
  return DEFAULT_RECENT;
}

export function saveRecentPlayers(players: RecentPlayer[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(players));
  } catch {
    // ignore
  }
}

function updateRecentPlayerFriendship(userId: string, isFriend: boolean): void {
  const recent = getRecentPlayers();
  const p = recent.find((r: RecentPlayer) => r.userId === userId);
  if (p) {
    p.isFriend = isFriend;
    saveRecentPlayers(recent);
  }
}

export function getFriendActivities(): FriendActivity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as FriendActivity[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(DEFAULT_ACTIVITY));
  } catch {
    // ignore
  }
  return DEFAULT_ACTIVITY;
}

export function searchUsers(query: string): Array<{ userId: string; nickname: string; rank?: string; isFriend: boolean }> {
  const friends = getFriends();
  const friendIds = new Set(friends.map((f: FriendInfo) => f.userId));
  const all = [
    { userId: 'search_1', nickname: '霓虹刀客', rank: '黃金I' },
    { userId: 'search_2', nickname: '霓虹女神', rank: '鑽石V' },
    { userId: 'search_3', nickname: '賽博武士', rank: '白銀II' },
    { userId: 'search_4', nickname: '數據學徒', rank: '新手' },
    { userId: 'f1', nickname: '霓虹夜行者', rank: '鑽石III' },
    { userId: 'f2', nickname: '數據殭屍', rank: '宗師I' },
    { userId: 'rp1', nickname: '地產大亨', rank: '鑽石I' },
  ];
  return all
    .filter((u) => u.nickname.includes(query) || u.userId.includes(query))
    .map((u) => ({ ...u, isFriend: friendIds.has(u.userId) }))
    .slice(0, 10);
}

export function updateOnlineStatus(): void {
  const friends = getFriends();
  const statuses: OnlineStatus[] = ['online', 'offline', 'in_game', 'away', 'online', 'online'];
  friends.forEach((f: FriendInfo, i: number) => {
    if (Math.random() > 0.3) {
      f.onlineStatus = statuses[i % statuses.length];
    }
  });
  saveFriends(friends);
}
