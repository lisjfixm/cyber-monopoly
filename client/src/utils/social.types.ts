export type BadgeIcon = 'skull' | 'shield' | 'bolt' | 'crown' | 'flame' | 'chip';

export type GuildRole = '隊長' | '副隊長' | '成員';
export type OnlineStatus = 'online' | 'offline' | 'in_game' | 'away';

export interface GuildMember {
  id: string;
  nickname: string;
  role: GuildRole;
  online: boolean;
  onlineStatus?: OnlineStatus;
  avatarSeed?: string;
  rank?: string;
  contribution?: number;
  joinedAt?: string;
}

export interface GuildJoinRequest {
  id: string;
  userId: string;
  nickname: string;
  requestedAt: string;
  message?: string;
}

export interface GuildTask {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: { coins: number; item?: string };
  claimed: boolean;
  daily: boolean;
  resetDate?: string;
}

export interface GuildRankingItem {
  id: string;
  name: string;
  color: string;
  badgeIcon: BadgeIcon;
  score: number;
  members: number;
  level: number;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  color: string;
  badgeIcon: BadgeIcon;
  members: GuildMember[];
  joinRequests: GuildJoinRequest[];
  level: number;
  score: number;
  createdAt: string;
  tasks: GuildTask[];
  announcement?: string;
}

export interface GuildState {
  currentGuild: Guild | null;
  availableGuilds: Guild[];
  rankings: GuildRankingItem[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderGuildTag?: string;
  content: string;
  type: 'text' | 'sticker';
  stickerId?: string;
  timestamp: string;
  channel?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'guild' | 'private';
  targetId?: string;
  unread: number;
}

export interface StickerPack {
  id: string;
  name: string;
  stickers: { id: string; name: string }[];
}

export interface ReportEntry {
  id: string;
  targetUserId: string;
  targetUserName: string;
  reason: string;
  messageContent?: string;
  reportedAt: string;
}

export type QuickPhraseKey = 'coop' | 'trade' | 'good' | 'wait' | 'gg';

export const QUICK_PHRASES: Record<QuickPhraseKey, string> = {
  coop: '合作嗎',
  trade: '交易嗎',
  good: '好棋',
  wait: '等等',
  gg: 'GG',
};
