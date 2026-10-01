export type OnlineStatus = 'online' | 'offline' | 'in_game' | 'away';
export type GameMode = 'classic' | 'quick' | 'crazy' | 'ranked' | 'tournament';

export interface FriendInfo {
  userId: string;
  nickname: string;
  avatarSeed?: string;
  status: 'accepted' | 'pending' | 'pending_outgoing';
  onlineStatus: OnlineStatus;
  currentMode?: GameMode | string;
  level?: number;
  rank?: string;
  remark?: string;
  addedAt: string;
  lastSeen?: string;
}

export interface RecentPlayer {
  userId: string;
  nickname: string;
  avatarSeed?: string;
  rank?: string;
  lastPlayedAt: string;
  playedCount: number;
  isFriend: boolean;
}

export interface FriendActivity {
  id: string;
  userId: string;
  userName: string;
  type: 'achievement' | 'rank_up' | 'new_title' | 'win_streak';
  content: string;
  detail?: string;
  timestamp: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromNickname: string;
  toUserId: string;
  toNickname: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface SpectateRoom {
  id: string;
  roomCode: string;
  gameMode: GameMode | string;
  modeLabel: string;
  players: SpectatePlayer[];
  spectatorCount: number;
  isRanked: boolean;
  isMentorRoom: boolean;
  mentorId?: string;
  mentorName?: string;
  mentorTitle?: string;
  turnCount: number;
  currentTurnIndex: number;
  startedAt: string;
}

export interface SpectatePlayer {
  id: string;
  name: string;
  avatarSeed?: string;
  color: string;
  cash: number;
  propertyValue: number;
  propertyCount: number;
  position: number;
  items: number;
  rank?: string;
}

export interface MentorTip {
  id: string;
  mentorId: string;
  mentorName: string;
  content: string;
  timestamp: string;
  type: 'tip' | 'warning' | 'info';
}

export interface SpectateChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export const GAME_MODE_LABELS: Record<string, string> = {
  classic: '經典模式',
  quick: '快速模式',
  crazy: '瘋狂模式',
  ranked: '排位賽',
  tournament: '錦標賽',
};
