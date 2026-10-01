const MAIL_STATE_KEY = 'monopoly_mail_state';
const CLAIMED_COINS_KEY = 'monopoly_mail_claimed_coins';
const CLAIMED_ITEMS_KEY = 'monopoly_mail_claimed_items';

export interface MailAttachment {
  type: 'coins' | 'item' | 'title' | 'achievement';
  amount?: number;
  itemId?: string;
  itemName?: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Mail {
  id: string;
  from: string;
  title: string;
  content: string;
  type: 'system' | 'friend' | 'guild';
  isRead: boolean;
  hasAttachment: boolean;
  attachmentClaimed: boolean;
  attachment?: MailAttachment;
  createdAt: string;
}

export interface MailState {
  mails: Mail[];
}

function genId(): string {
  return `mail_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function createInitialState(): MailState {
  const system: Omit<Mail, 'id' | 'createdAt'>[] = [
    {
      from: '賽博系統', title: '歡迎來到賽博大富翁', type: 'system',
      isRead: false, hasAttachment: true, attachmentClaimed: false,
      attachment: { type: 'coins', amount: 2000 },
      content: '歡迎來到霓虹閃爍的賽博世界！\n\n在這裡，你將與對手在霓虹燈下展開一場智慧與運氣的較量。購買地產、收取過路費、巧用命運卡，成為這座城市的真正霸主。\n\n祝你好運，賽博旅人。',
    },
    {
      from: '營運團隊', title: '每日登入獎勵', type: 'system',
      isRead: false, hasAttachment: true, attachmentClaimed: false,
      attachment: { type: 'coins', amount: 500 },
      content: '感謝您今日登入賽博大富翁！\n\n這是您的每日獎勵，請查收附件。\n\n每日登入皆可獲得不同獎勵，連續登入獎勵更豐厚哦！',
    },
    {
      from: '賽博系統', title: '版本更新 v2.3.0', type: 'system',
      isRead: true, hasAttachment: false, attachmentClaimed: false,
      content: '本次更新內容：\n\n1. 新增「命運卡」系統，12 張全新卡牌等你體驗\n2. 新增多人聯機對戰模式\n3. 優化 AI 決策邏輯\n4. 修復若干已知問題\n\n更多精彩內容，敬請進入遊戲體驗！',
    },
     {
       from: '成就系統', title: '成就解鎖：百戰榮耀', type: 'system',
       isRead: false, hasAttachment: true, attachmentClaimed: false,
       attachment: { type: 'achievement', itemId: 'hundred_battles', itemName: '百戰榮耀徽章', amount: 1, rarity: 'legendary' },
       content: '恭喜您達成成就「百戰榮耀」！\n\n累計完成 100 場對局，這是屬於您的榮耀徽章。\n\n繼續挑戰更多成就吧！',
     },
  ];
   const guild: Omit<Mail, 'id' | 'createdAt'>[] = [
     {
       from: '霓虹騎士團', title: '戰隊邀請：加入我們！', type: 'guild',
       isRead: false, hasAttachment: false, attachmentClaimed: false,
       content: '指揮官您好！\n\n「霓虹騎士團」誠摯邀請您加入我們的戰隊。\n\n我們是由一群熱愛賽博大富翁的玩家組成，每週有固定戰隊賽和內部訓練，戰隊等級目前 LV.8。\n\n期待您的加入，一起稱霸賽博世界！\n\n—— 霓虹騎士團 團長 暗影領主',
     },
     {
       from: '戰隊系統', title: '戰隊賽獎勵發放', type: 'guild',
       isRead: false, hasAttachment: true, attachmentClaimed: false,
       attachment: { type: 'coins', amount: 3000, rarity: 'rare' },
       content: '恭喜！您所屬的戰隊在本週戰隊賽中獲得了第三名！\n\n獎勵已發放到您的郵箱，請查收附件。\n\n繼續加油，下週爭奪冠軍！',
     },
     {
       from: '戰隊管理員', title: '戰隊等級提升', type: 'guild',
       isRead: true, hasAttachment: true, attachmentClaimed: false,
       attachment: { type: 'title', itemId: 'guild_veteran', itemName: '戰隊老兵頭像框', amount: 1, rarity: 'epic' },
       content: '祝賀！您的戰隊已升級至 LV.10！\n\n作為戰隊資深成員，您獲得專屬獎勵：「戰隊老兵」頭像框。\n\n感謝您一直以來的貢獻！',
     },
   ];
  const friend: Omit<Mail, 'id' | 'createdAt'>[] = [
    {
      from: '暗影獵手', title: '來戰一場吧！', type: 'friend',
      isRead: false, hasAttachment: false, attachmentClaimed: false,
      content: '嘿，好久不見！\n\n聽說你最近戰績不錯，敢不敢跟我來一局？\n\n我在線上等你，輸的人要請喝霓虹可樂哦～',
    },
    {
      from: '數據幽靈', title: '送你一個小禮物', type: 'friend',
      isRead: false, hasAttachment: true, attachmentClaimed: false,
      attachment: { type: 'item', itemId: 'shield_token', itemName: '護身符', amount: 2 },
      content: '嗨！上次對戰輸得有點不甘心，這次給你準備了個小禮物。\n\n別誤會，只是不想贏得太無趣而已。\n\n記得下次全力以赴哦！',
    },
    {
      from: '霓虹浪人', title: '新地圖超好玩', type: 'friend',
      isRead: true, hasAttachment: false, attachmentClaimed: false,
      content: '兄弟，新出的「高科技園」地圖你玩了嗎？\n\n簡直太刺激了，地價漲到 4000 都有人搶著買！\n\n有空一起開黑啊～',
    },
  ];
   const mails: Mail[] = [
     ...system.map((m, i) => ({ ...m, id: genId(), createdAt: daysAgo(i) })),
     ...guild.map((m, i) => ({ ...m, id: genId(), createdAt: daysAgo(i + 2) })),
     ...friend.map((m, i) => ({ ...m, id: genId(), createdAt: daysAgo(i + 6) })),
   ];
  return { mails };
}

export function getMailState(): MailState {
  try {
    const raw = localStorage.getItem(MAIL_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MailState;
      if (parsed && Array.isArray(parsed.mails)) return parsed;
    }
  } catch { /* ignore */ }
  const initial = createInitialState();
  saveMailState(initial);
  return initial;
}

export function saveMailState(state: MailState): void {
  try { localStorage.setItem(MAIL_STATE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function markAsRead(mailId: string): MailState {
  const state = getMailState();
  const mails: Mail[] = state.mails.map((m: Mail) =>
    m.id === mailId ? { ...m, isRead: true } : m,
  );
  const next: MailState = { mails };
  saveMailState(next);
  return next;
}

export function claimAttachment(mailId: string): MailState {
  const state = getMailState();
  const mail = state.mails.find((m) => m.id === mailId);
  if (!mail || !mail.attachment || mail.attachmentClaimed) return state;

  // 真實後端對接時應調用既有加幣/加道具接口
  if (mail.attachment.type === 'coins' && mail.attachment.amount) {
    try {
      const existing = Number(localStorage.getItem(CLAIMED_COINS_KEY) || '0');
      localStorage.setItem(CLAIMED_COINS_KEY, String(existing + (mail.attachment.amount ?? 0)));
    } catch { /* ignore */ }
  } else if (mail.attachment.type === 'item' && mail.attachment.itemId) {
    try {
      const raw = localStorage.getItem(CLAIMED_ITEMS_KEY);
      const items = raw ? (JSON.parse(raw) as Record<string, { itemName: string; amount: number }>) : {};
      const key = mail.attachment.itemId;
      const prev = items[key]?.amount ?? 0;
      items[key] = {
        itemName: mail.attachment.itemName ?? key,
        amount: prev + (mail.attachment?.amount ?? 1),
      };
      localStorage.setItem(CLAIMED_ITEMS_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }

  const mails: Mail[] = state.mails.map((m: Mail) =>
    m.id === mailId ? { ...m, attachmentClaimed: true, isRead: true } : m,
  );
  const next: MailState = { mails };
  saveMailState(next);
  return next;
}

export function deleteMail(mailId: string): MailState {
  const state = getMailState();
  const mails: Mail[] = state.mails.filter((m: Mail) => m.id !== mailId);
  const next: MailState = { mails };
  saveMailState(next);
  return next;
}

export function getUnreadCount(type?: 'system' | 'friend' | 'guild'): number {
  const state = getMailState();
  return state.mails.filter(
    (m) => !m.isRead && (type === undefined || m.type === type),
  ).length;
}
