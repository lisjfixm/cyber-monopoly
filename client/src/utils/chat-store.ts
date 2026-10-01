import type { ChatMessage, ReportEntry } from './social.types';

const GLOBAL_CHANNEL_KEY = 'monopoly_chat_global';
const PRIVATE_CHAT_PREFIX = 'monopoly_chat_priv_';
const GUILD_CHAT_KEY = 'monopoly_chat_guild_';
const REPORT_KEY = 'monopoly_chat_reports';

const SENSITIVE_WORDS = ['笨蛋', '白痴', '垃圾', '廢物', '幹你', '去死', '智障', '神經病', '滾'];

export function filterMessage(content: string): string {
  let result = content;
  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  }
  return result;
}

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ---------- Global Channel ----------

export function getGlobalMessages(limit = 200): ChatMessage[] {
  try {
    const raw = localStorage.getItem(GLOBAL_CHANNEL_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as ChatMessage[];
      return arr.slice(-limit);
    }
  } catch {
    // ignore
  }
  const seed: ChatMessage[] = [
    {
      id: uid(),
      senderId: 'bot_01',
      senderName: '霓虹夜行者',
      senderGuildTag: 'NEON',
      content: '今晚有人一起打排位嗎？鑽石以上來！',
      type: 'text',
      timestamp: now(),
      channel: 'global',
    },
    {
      id: uid(),
      senderId: 'bot_02',
      senderName: '數據殭屍',
      senderGuildTag: 'CYBR',
      content: '賽博軍團招生中，活躍玩家優先！',
      type: 'text',
      timestamp: now(),
      channel: 'global',
    },
    {
      id: uid(),
      senderId: 'bot_03',
      senderName: '影子跑者',
      content: '找個師父帶帶，我黃金段位。',
      type: 'text',
      timestamp: now(),
      channel: 'global',
    },
    {
      id: uid(),
      senderId: 'bot_04',
      senderName: '光纖貓',
      senderGuildTag: 'PHNT',
      content: '幻影兵團公會戰即將開始，大家準備好了嗎？',
      type: 'text',
      timestamp: now(),
      channel: 'global',
    },
  ];
  try {
    localStorage.setItem(GLOBAL_CHANNEL_KEY, JSON.stringify(seed));
  } catch {
    // ignore
  }
  return seed;
}

export function sendGlobalMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'channel'>): ChatMessage {
  const msgs = getGlobalMessages(500);
  const filtered = filterMessage(message.content);
  const newMsg: ChatMessage = {
    ...message,
    content: filtered,
    id: uid(),
    timestamp: now(),
    channel: 'global',
  };
  msgs.push(newMsg);
  try {
    localStorage.setItem(GLOBAL_CHANNEL_KEY, JSON.stringify(msgs.slice(-200)));
  } catch {
    // ignore
  }
  return newMsg;
}

// ---------- Private Chat ----------

function privateKey(userIdA: string, userIdB: string): string {
  const [a, b] = [userIdA, userIdB].sort();
  return `${PRIVATE_CHAT_PREFIX}${a}_${b}`;
}

export function getPrivateMessages(userIdA: string, userIdB: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(privateKey(userIdA, userIdB));
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {
    // ignore
  }
  const seed: ChatMessage[] = [
    {
      id: uid(),
      senderId: userIdB,
      senderName: '對方玩家',
      content: '嗨，最近怎麼樣？',
      type: 'text',
      timestamp: now(),
      channel: `private_${userIdB}`,
    },
  ];
  try {
    localStorage.setItem(privateKey(userIdA, userIdB), JSON.stringify(seed));
  } catch {
    // ignore
  }
  return seed;
}

export function sendPrivateMessage(
  fromId: string,
  fromName: string,
  toId: string,
  content: string,
  type: 'text' | 'sticker' = 'text',
  stickerId?: string,
): ChatMessage {
  const msgs = getPrivateMessages(fromId, toId);
  const filtered = filterMessage(content);
  const newMsg: ChatMessage = {
    id: uid(),
    senderId: fromId,
    senderName: fromName,
    content: filtered,
    type,
    stickerId,
    timestamp: now(),
    channel: `private_${toId}`,
  };
  msgs.push(newMsg);
  try {
    localStorage.setItem(privateKey(fromId, toId), JSON.stringify(msgs.slice(-100)));
  } catch {
    // ignore
  }
  return newMsg;
}

// ---------- Guild Chat ----------

export function getGuildMessages(guildId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${GUILD_CHAT_KEY}${guildId}`);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {
    // ignore
  }
  return [];
}

export function sendGuildMessage(
  guildId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp' | 'channel'>,
): ChatMessage {
  const msgs = getGuildMessages(guildId);
  const filtered = filterMessage(message.content);
  const newMsg: ChatMessage = {
    ...message,
    content: filtered,
    id: uid(),
    timestamp: now(),
    channel: `guild_${guildId}`,
  };
  msgs.push(newMsg);
  try {
    localStorage.setItem(`${GUILD_CHAT_KEY}${guildId}`, JSON.stringify(msgs.slice(-100)));
  } catch {
    // ignore
  }
  return newMsg;
}

// ---------- Report ----------

export function getReports(): ReportEntry[] {
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    if (raw) return JSON.parse(raw) as ReportEntry[];
  } catch {
    // ignore
  }
  return [];
}

export function addReport(entry: Omit<ReportEntry, 'id' | 'reportedAt'>): ReportEntry {
  const reports = getReports();
  const newEntry: ReportEntry = {
    ...entry,
    id: uid(),
    reportedAt: now(),
  };
  reports.push(newEntry);
  try {
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
  } catch {
    // ignore
  }
  return newEntry;
}
