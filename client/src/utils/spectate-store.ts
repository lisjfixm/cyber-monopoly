import type {
  SpectateRoom,
  SpectatePlayer,
  MentorTip,
  SpectateChatMessage,
} from './friends.types';

const SPECTATE_KEY = 'monopoly_spectate_rooms';
const SPECTATE_CHAT_KEY = 'monopoly_spectate_chat_';
const MENTOR_TIPS_KEY = 'monopoly_spectate_tips_';

const PLAYER_COLORS = ['#00ffff', '#ff00aa', '#ffff00', '#00ff88'];

const MOCK_ROOMS: SpectateRoom[] = [
  {
    id: 'room1',
    roomCode: 'A1B2C3',
    gameMode: 'ranked',
    modeLabel: '排位賽',
    players: [
      { id: 'p1', name: '霓虹夜行者', color: PLAYER_COLORS[0], cash: 12500, propertyValue: 28000, propertyCount: 7, position: 15, items: 3, rank: '鑽石III' },
      { id: 'p2', name: '量子駭客', color: PLAYER_COLORS[1], cash: 8200, propertyValue: 31500, propertyCount: 8, position: 22, items: 2, rank: '大師II' },
    ],
    spectatorCount: 12,
    isRanked: true,
    isMentorRoom: true,
    mentorId: 'mentor_1',
    mentorName: '導師·影子',
    mentorTitle: '賽博導師·宗師級',
    turnCount: 24,
    currentTurnIndex: 0,
    startedAt: '2088-09-28T22:00:00Z',
  },
  {
    id: 'room2',
    roomCode: 'X7Y8Z9',
    gameMode: 'classic',
    modeLabel: '經典模式',
    players: [
      { id: 'p3', name: '數據殭屍', color: PLAYER_COLORS[0], cash: 15000, propertyValue: 18000, propertyCount: 5, position: 8, items: 1, rank: '宗師I' },
      { id: 'p4', name: '光纖貓', color: PLAYER_COLORS[1], cash: 13800, propertyValue: 15500, propertyCount: 4, position: 19, items: 2, rank: '白金IV' },
    ],
    spectatorCount: 5,
    isRanked: false,
    isMentorRoom: false,
    turnCount: 15,
    currentTurnIndex: 1,
    startedAt: '2088-09-28T22:15:00Z',
  },
  {
    id: 'room3',
    roomCode: 'M4N5P6',
    gameMode: 'crazy',
    modeLabel: '瘋狂模式',
    players: [
      { id: 'p5', name: '電流公主', color: PLAYER_COLORS[0], cash: 25000, propertyValue: 42000, propertyCount: 9, position: 30, items: 5, rank: '白銀III' },
      { id: 'p6', name: '影子跑者', color: PLAYER_COLORS[1], cash: 18500, propertyValue: 36000, propertyCount: 8, position: 12, items: 3, rank: '黃金V' },
    ],
    spectatorCount: 8,
    isRanked: false,
    isMentorRoom: false,
    turnCount: 31,
    currentTurnIndex: 1,
    startedAt: '2088-09-28T21:50:00Z',
  },
  {
    id: 'room4',
    roomCode: 'Q3W4E5',
    gameMode: 'tournament',
    modeLabel: '錦標賽',
    players: [
      { id: 'p7', name: '賽博帝王', color: PLAYER_COLORS[0], cash: 9800, propertyValue: 55000, propertyCount: 11, position: 25, items: 4, rank: '王者' },
      { id: 'p8', name: '霓虹女皇', color: PLAYER_COLORS[1], cash: 12200, propertyValue: 48000, propertyCount: 10, position: 7, items: 3, rank: '王者' },
      { id: 'p9', name: '地產霸主', color: PLAYER_COLORS[2], cash: 7500, propertyValue: 38000, propertyCount: 8, position: 18, items: 2, rank: '宗師II' },
      { id: 'p10', name: '金融教父', color: PLAYER_COLORS[3], cash: 11000, propertyValue: 45000, propertyCount: 9, position: 33, items: 4, rank: '宗師I' },
    ],
    spectatorCount: 47,
    isRanked: true,
    isMentorRoom: true,
    mentorId: 'mentor_2',
    mentorName: '導師·星塵',
    mentorTitle: '頂尖導師·王者級',
    turnCount: 42,
    currentTurnIndex: 2,
    startedAt: '2088-09-28T20:30:00Z',
  },
  {
    id: 'room5',
    roomCode: 'R6T7Y8',
    gameMode: 'quick',
    modeLabel: '快速模式',
    players: [
      { id: 'p11', name: '街頭藝人', color: PLAYER_COLORS[0], cash: 5200, propertyValue: 12000, propertyCount: 3, position: 14, items: 1, rank: '黃金II' },
      { id: 'p12', name: '黑市商人', color: PLAYER_COLORS[1], cash: 6800, propertyValue: 9500, propertyCount: 2, position: 28, items: 2, rank: '白金III' },
    ],
    spectatorCount: 3,
    isRanked: false,
    isMentorRoom: false,
    turnCount: 18,
    currentTurnIndex: 0,
    startedAt: '2088-09-28T22:20:00Z',
  },
];

export function getSpectateRooms(): SpectateRoom[] {
  try {
    const raw = localStorage.getItem(SPECTATE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as SpectateRoom[];
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(SPECTATE_KEY, JSON.stringify(MOCK_ROOMS));
  } catch {
    // ignore
  }
  return MOCK_ROOMS;
}

export function getSpectateRoom(roomId: string): SpectateRoom | undefined {
  const rooms = getSpectateRooms();
  return rooms.find((r: SpectateRoom) => r.id === roomId);
}

export function incrementSpectatorCount(roomId: string, delta: number): void {
  const rooms = getSpectateRooms();
  const room = rooms.find((r: SpectateRoom) => r.id === roomId);
  if (room) {
    room.spectatorCount = Math.max(0, room.spectatorCount + delta);
    try {
      localStorage.setItem(SPECTATE_KEY, JSON.stringify(rooms));
    } catch {
      // ignore
    }
  }
}

const DEFAULT_TIPS_MAP: Record<string, MentorTip[]> = {
  room1: [
    {
      id: 'tip1',
      mentorId: 'mentor_1',
      mentorName: '導師·影子',
      content: '此時玩家1 應優先集資建房，金融街和中央塔相鄰有連動加成。',
      timestamp: '2088-09-28T22:10:00Z',
      type: 'tip',
    },
    {
      id: 'tip2',
      mentorId: 'mentor_1',
      mentorName: '導師·影子',
      content: '注意！玩家2 現金不足 10000，若走到玩家1 的地產可能直接破產。',
      timestamp: '2088-09-28T22:12:30Z',
      type: 'warning',
    },
    {
      id: 'tip3',
      mentorId: 'mentor_1',
      mentorName: '導師·影子',
      content: '命運區抽到傳送卡的概率是 1/6，兩人都在命運區附近要小心。',
      timestamp: '2088-09-28T22:15:00Z',
      type: 'info',
    },
  ],
  room4: [
    {
      id: 'tip4',
      mentorId: 'mentor_2',
      mentorName: '導師·星塵',
      content: '四人局優先搶佔稀有地產，總部和主塔是必爭之地。',
      timestamp: '2088-09-28T21:00:00Z',
      type: 'tip',
    },
    {
      id: 'tip5',
      mentorId: 'mentor_2',
      mentorName: '導師·星塵',
      content: '賽博帝王目前資產領先 20%，其他三人需聯合才能翻盤。',
      timestamp: '2088-09-28T21:30:00Z',
      type: 'info',
    },
  ],
};

export function getMentorTips(roomId: string): MentorTip[] {
  const key = `${MENTOR_TIPS_KEY}${roomId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw) as MentorTip[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  const def = DEFAULT_TIPS_MAP[roomId] || [];
  try {
    localStorage.setItem(key, JSON.stringify(def));
  } catch {
    // ignore
  }
  return def;
}

export function getSpectateChatMessages(roomId: string): SpectateChatMessage[] {
  const key = `${SPECTATE_CHAT_KEY}${roomId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw) as SpectateChatMessage[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  const defaultMsgs: SpectateChatMessage[] = [
    {
      id: 'sc1',
      senderId: 'viewer_1',
      senderName: '霓虹粉絲',
      content: '哇這局精彩！',
      timestamp: '2088-09-28T22:16:00Z',
    },
    {
      id: 'sc2',
      senderId: 'viewer_2',
      senderName: '數據分析師',
      content: '玩家1 地產組合更合理，看好他贏',
      timestamp: '2088-09-28T22:17:20Z',
    },
    {
      id: 'sc3',
      senderId: 'viewer_3',
      senderName: '路過的萌新',
      content: '請問導師 新手應該先買哪塊地？',
      timestamp: '2088-09-28T22:18:05Z',
    },
  ];
  try {
    localStorage.setItem(key, JSON.stringify(defaultMsgs));
  } catch {
    // ignore
  }
  return defaultMsgs;
}

export function sendSpectateChatMessage(roomId: string, senderId: string, senderName: string, content: string): SpectateChatMessage {
  const key = `${SPECTATE_CHAT_KEY}${roomId}`;
  const msgs = getSpectateChatMessages(roomId);
  const newMsg: SpectateChatMessage = {
    id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    senderId,
    senderName,
    content,
    timestamp: new Date().toISOString(),
  };
  msgs.push(newMsg);
  try {
    localStorage.setItem(key, JSON.stringify(msgs));
  } catch {
    // ignore
  }
  return newMsg;
}

export const PLAYER_COLOR_PALETTE = PLAYER_COLORS;
