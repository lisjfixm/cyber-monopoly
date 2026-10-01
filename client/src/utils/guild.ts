import type {
  Guild,
  GuildState,
  GuildMember,
  GuildJoinRequest,
  GuildTask,
  GuildRankingItem,
  BadgeIcon,
  OnlineStatus,
} from './social.types';

const STORAGE_KEY = 'monopoly_guild_state';

const DEFAULT_RANKINGS: GuildRankingItem[] = [
  { id: 'r1', name: '泰坦財團', color: '#ffd700', badgeIcon: 'crown', score: 98520, members: 18, level: 12 },
  { id: 'r2', name: '霓虹之夜', color: '#00ffff', badgeIcon: 'bolt', score: 76430, members: 15, level: 9 },
  { id: 'r3', name: '賽博軍團', color: '#ff00ff', badgeIcon: 'shield', score: 71200, members: 14, level: 9 },
  { id: 'r4', name: '幻影兵團', color: '#a855f7', badgeIcon: 'skull', score: 52180, members: 11, level: 7 },
  { id: 'r5', name: '電流脈衝', color: '#00ff80', badgeIcon: 'flame', score: 44890, members: 9, level: 6 },
  { id: 'r6', name: '赤焰先鋒', color: '#ff4444', badgeIcon: 'flame', score: 38650, members: 8, level: 5 },
  { id: 'r7', name: '數碼幽靈', color: '#06b6d4', badgeIcon: 'skull', score: 31240, members: 7, level: 5 },
  { id: 'r8', name: '量子浪潮', color: '#8b5cf6', badgeIcon: 'chip', score: 27800, members: 6, level: 4 },
];

function makeDefaultTasks(): GuildTask[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 't_daily_1',
      name: '每日集訓',
      description: '戰隊成員累計完成 10 局對戰',
      target: 10,
      progress: 4,
      reward: { coins: 500 },
      claimed: false,
      daily: true,
      resetDate: today,
    },
    {
      id: 't_daily_2',
      name: '勝利之路',
      description: '累計獲得 5 次第一名',
      target: 5,
      progress: 2,
      reward: { coins: 1000, item: '幸運卡' },
      claimed: false,
      daily: true,
      resetDate: today,
    },
    {
      id: 't_weekly_1',
      name: '稱霸賽季',
      description: '戰隊總積分達到 10000',
      target: 10000,
      progress: 0,
      reward: { coins: 3000, item: '黃金頭像框' },
      claimed: false,
      daily: false,
    },
  ];
}

function makeMockMembers(seed: string, count: number): GuildMember[] {
  const names = [
    '霓虹死神', '電流公主', '影子跑者', '數據殭屍', '光纖貓',
    '鐵血副官', '機械先鋒', '電馭叛客', '量子駭客', '夜之城守',
    '虛擬幽靈', '暗夜行者', '黃金算盤', '地產大亨', '現金流水',
  ];
  const statuses: OnlineStatus[] = ['online', 'offline', 'in_game', 'away', 'online', 'offline', 'online'];
  const roles: Array<'隊長' | '副隊長' | '成員'> = ['隊長', '副隊長', '成員', '成員', '成員'];
  const ranks = ['青銅', '白銀', '黃金', '鑽石', '宗師'];
  const members: GuildMember[] = [];
  for (let i = 0; i < count; i++) {
    const name = names[(i + seed.length) % names.length] + (i > 5 ? `${i}` : '');
    members.push({
      id: `${seed}_m${i}`,
      nickname: name,
      role: roles[i % roles.length],
      online: statuses[i % statuses.length] === 'online' || statuses[i % statuses.length] === 'in_game',
      onlineStatus: statuses[i % statuses.length],
      avatarSeed: `${seed}_avatar_${i}`,
      rank: ranks[i % ranks.length],
      contribution: Math.floor(Math.random() * 500) + 50,
      joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });
  }
  return members;
}

const DEFAULT_AVAILABLE_GUILDS: Guild[] = [
  {
    id: 'guild_neon',
    name: '霓虹之夜',
    tag: 'NEON',
    description: '城市燈火下的掠奪者，精通地產炒作。',
    color: '#00ffff',
    badgeIcon: 'bolt',
    level: 7,
    score: 76430,
    createdAt: '2087-03-12',
    members: makeMockMembers('neon', 6),
    joinRequests: [],
    tasks: makeDefaultTasks(),
    announcement: '今晚 8 點公會戰，全員集合！',
  },
  {
    id: 'guild_cyber',
    name: '賽博軍團',
    tag: 'CYBR',
    description: '鋼鐵與代碼的結合，無人能擋的戰隊。',
    color: '#ff00ff',
    badgeIcon: 'shield',
    level: 9,
    score: 71200,
    createdAt: '2086-11-05',
    members: makeMockMembers('cyber', 8),
    joinRequests: [],
    tasks: makeDefaultTasks(),
  },
  {
    id: 'guild_phantom',
    name: '幻影兵團',
    tag: 'PHNT',
    description: '來去無蹤的神秘組織，專營暗網交易。',
    color: '#a855f7',
    badgeIcon: 'skull',
    level: 5,
    score: 52180,
    createdAt: '2088-01-20',
    members: makeMockMembers('phantom', 5),
    joinRequests: [],
    tasks: makeDefaultTasks(),
  },
  {
    id: 'guild_titan',
    name: '泰坦財團',
    tag: 'TITN',
    description: '掌控城市經濟的巨頭，金錢即力量。',
    color: '#ffd700',
    badgeIcon: 'crown',
    level: 12,
    score: 98520,
    createdAt: '2085-06-18',
    members: makeMockMembers('titan', 10),
    joinRequests: [],
    tasks: makeDefaultTasks(),
  },
];

function getDefaultState(): GuildState {
  return {
    currentGuild: null,
    availableGuilds: [...DEFAULT_AVAILABLE_GUILDS],
    rankings: DEFAULT_RANKINGS,
  };
}

export function getGuildState(): GuildState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuildState;
      if (parsed && Array.isArray(parsed.availableGuilds)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const defaultState = getDefaultState();
  saveGuildState(defaultState);
  return defaultState;
}

export function saveGuildState(state: GuildState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function createGuild(
  name: string,
  tag: string,
  description: string,
  color: string,
  badgeIcon: BadgeIcon,
  userId: string,
  nickname: string,
): Guild {
  const state = getGuildState();
  const newGuild: Guild = {
    id: `guild_${Date.now()}`,
    name,
    tag: tag.toUpperCase(),
    description,
    color,
    badgeIcon,
    level: 1,
    score: 1000,
    createdAt: new Date().toISOString().split('T')[0],
    members: [
      {
        id: userId,
        nickname,
        role: '隊長',
        online: true,
        onlineStatus: 'online',
        avatarSeed: `${userId}_avatar`,
        rank: '新手',
        contribution: 0,
        joinedAt: new Date().toISOString().split('T')[0],
      },
    ],
    joinRequests: [],
    tasks: makeDefaultTasks(),
  };
  state.currentGuild = newGuild;
  state.availableGuilds = state.availableGuilds.filter((g: Guild) => g.id !== newGuild.id);
  saveGuildState(state);
  return newGuild;
}

export function requestJoinGuild(
  guildId: string,
  userId: string,
  nickname: string,
  message?: string,
): boolean {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId);
  if (!guild) return false;
  if (guild.joinRequests.some((r: GuildJoinRequest) => r.userId === userId)) return false;
  guild.joinRequests.push({
    id: `req_${Date.now()}`,
    userId,
    nickname,
    requestedAt: new Date().toISOString(),
    message,
  });
  saveGuildState(state);
  return true;
}

export function approveJoinRequest(guildId: string, requestId: string): boolean {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId);
  if (!guild) return false;
  const req = guild.joinRequests.find((r: GuildJoinRequest) => r.id === requestId);
  if (!req) return false;
  const newMember: GuildMember = {
    id: req.userId,
    nickname: req.nickname,
    role: '成員',
    online: true,
    onlineStatus: 'online',
    avatarSeed: `${req.userId}_avatar`,
    rank: '新手',
    contribution: 0,
    joinedAt: new Date().toISOString().split('T')[0],
  };
  guild.members.push(newMember);
  guild.joinRequests = guild.joinRequests.filter((r: GuildJoinRequest) => r.id !== requestId);
  saveGuildState(state);
  return true;
}

export function rejectJoinRequest(guildId: string, requestId: string): boolean {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId);
  if (!guild) return false;
  guild.joinRequests = guild.joinRequests.filter((r: GuildJoinRequest) => r.id !== requestId);
  saveGuildState(state);
  return true;
}

export function kickMember(guildId: string, memberId: string): boolean {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId);
  if (!guild) return false;
  if (guild.members.length <= 1) return false;
  guild.members = guild.members.filter((m: GuildMember) => m.id !== memberId);
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return true;
}

export function transferLeadership(guildId: string, fromId: string, toId: string): boolean {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId);
  if (!guild) return false;
  const fromMember = guild.members.find((m: GuildMember) => m.id === fromId);
  const toMember = guild.members.find((m: GuildMember) => m.id === toId);
  if (!fromMember || !toMember || fromMember.role !== '隊長') return false;
  fromMember.role = '成員';
  toMember.role = '隊長';
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return true;
}

export function joinGuild(guildId: string, userId: string, nickname: string): Guild | null {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId);
  if (!guild) return null;
  const newMember: GuildMember = {
    id: userId,
    nickname,
    role: '成員',
    online: true,
    onlineStatus: 'online',
    avatarSeed: `${userId}_avatar`,
    rank: '新手',
    contribution: 0,
    joinedAt: new Date().toISOString().split('T')[0],
  };
  const updatedGuild: Guild = {
    ...guild,
    members: [...guild.members, newMember],
  };
  state.currentGuild = updatedGuild;
  saveGuildState(state);
  return updatedGuild;
}

export function leaveGuild(): void {
  const state = getGuildState();
  state.currentGuild = null;
  saveGuildState(state);
}

export function disbandGuild(): void {
  leaveGuild();
}

export function claimTaskReward(guildId: string, taskId: string): { coins: number; item?: string } | null {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId) ?? state.currentGuild;
  if (!guild) return null;
  const task = guild.tasks.find((t: GuildTask) => t.id === taskId);
  if (!task || task.claimed || task.progress < task.target) return null;
  task.claimed = true;
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return task.reward;
}

export function updateGuildAnnouncement(guildId: string, announcement: string): boolean {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g: Guild) => g.id === guildId) ?? state.currentGuild;
  if (!guild) return false;
  guild.announcement = announcement;
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return true;
}

export function getGuildRankings(): GuildRankingItem[] {
  const state = getGuildState();
  return state.rankings;
}
