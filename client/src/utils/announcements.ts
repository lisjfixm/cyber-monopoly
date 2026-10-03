export type AnnouncementType = 'update' | 'event' | 'maintenance' | 'compensation';

export interface AnnouncementCompensationReward {
  type: 'coin' | 'item';
  name: string;
  amount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  createdAt: string;
  summary?: string;
  compensationReward?: AnnouncementCompensationReward;
  claimed?: boolean;
}

const READ_STORAGE_KEY = 'cyber_monopoly_announcements_read';

// 初始模擬公告數據
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_v2_0_0',
    title: '版本更新 v2.0.0：首頁重構與跨局系統上線',
    content:
      '賽博大富翁 v2.0.0 重磅更新！\n\n• 首頁全新分層資訊架構，四大玩法卡片一目了然\n• 新增「幸運轉盤」：每日免費轉盤，有機會獲得金幣、碎片與傳說寶箱\n• 新增「霓虹扭蛋」：消耗金幣或碎片抽取皮膚、寵物與稱號，重複自動轉換為碎片\n• 統一賽博霓虹視覺語言，手機觸控與安全區適配全面優化\n• 修復若干已知問題',
    type: 'update',
    summary: 'v2.0.0 首頁重構、幸運轉盤與霓虹扭蛋上線！',
    createdAt: '2026-10-03T10:00:00.000Z',
  },
  {
    id: 'ann_v1_3_0',
    title: '版本更新 v1.3.0：幫派系統上線',
    content:
      '本次更新帶來全新幫派系統，玩家可創建或加入幫派，參與幫派戰爭奪賽博都市控制權。\n\n• 新增幫派系統（創建 / 加入 / 管理）\n• 新增幫派戰爭玩法\n• 新增幫派專屬商店\n• 優化聯機同步延遲\n• 修復若干已知問題',
    type: 'update',
    summary: '全新幫派系統上線，爭奪賽博都市控制權！',
    createdAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'ann_neon_carnival',
    title: '活動開啟：霓虹狂歡節雙倍獎勵',
    content:
      '霓虹狂歡節來襲！活動期間完成對局可獲得雙倍經驗值與金幣獎勵，累計勝場更可解鎖限定頭像框「霓虹之王」。\n\n活動時間：2026/09/20 - 2026/10/10\n參與方式：完成任意對局即可累計進度\n快來參加吧！',
    type: 'event',
    summary: '雙倍獎勵進行中，限定頭像框等你解鎖！',
    createdAt: '2026-09-25T08:00:00.000Z',
  },
  {
    id: 'ann_comp_database',
    title: '補償發放：數據庫異常補償',
    content:
      '由於 9 月 24 日凌晨數據庫臨時異常，導致部分玩家聯機記錄丟失。我們深表歉意，並為全體玩家發放補償獎勵。\n\n補償內容：\n• 金幣 × 5000\n• 體力藥水 × 5\n\n請點擊下方按鈕領取，補償領取截止至 2026/10/05。',
    type: 'compensation',
    summary: '全員補償 5000 金幣 + 體力藥水，點擊領取！',
    compensationReward: { type: 'coin', name: '金幣', amount: 5000 },
    createdAt: '2026-09-24T14:00:00.000Z',
  },
  {
    id: 'ann_maintenance_0922',
    title: '維護通知：9月22日服務器優化',
    content:
      '為提供更穩定的遊戲體驗，我們將於 2026 年 9 月 22 日 03:00 - 05:00 進行服務器優化維護。\n\n維護內容：\n• 數據庫性能優化\n• 聯機匹配系統升級\n• 安全補丁更新\n\n維護期間將無法進行聯機對局，本地單機模式不受影響。',
    type: 'maintenance',
    summary: '9月22日凌晨3-5點服務器維護，聯機模式暫停。',
    createdAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'ann_v1_2_5',
    title: '版本更新 v1.2.5：新地圖「深海港」',
    content:
      '本次更新新增遊戲地圖「深海港」，帶來全新海底賽博都市視覺體驗。\n\n• 新增地圖：深海港（12 塊全新地產）\n• 新增命運卡：潮汐之祝福\n• 新增皮膚：深海潛水員\n• 優化 AI 購地決策算法',
    type: 'update',
    summary: '新地圖深海港上線，探索海底賽博都市！',
    createdAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'ann_comp_vip',
    title: '補償發放：VIP 會員異常補償',
    content:
      '9 月 18 日 VIP 特權系統出現臨時異常，導致部分 VIP 玩家無法正常領取每日獎勵。我們已修復該問題，併為受影響的 VIP 玩家發放補償。\n\n補償內容：\n• VIP 專屬頭像框「星辰」\n• 鑽石 × 200\n\n感謝您的理解與支持。',
    type: 'compensation',
    summary: 'VIP 補償來襲：專屬頭像框 + 200 鑽石！',
    compensationReward: { type: 'item', name: '鑽石', amount: 200 },
    createdAt: '2026-09-19T16:00:00.000Z',
  },
  {
    id: 'ann_rank_season',
    title: '活動：排位賽新賽季即將開啟',
    content:
      '賽博大富翁第一屆排位賽將於 10 月 1 日正式開啟！\n\n賽季時間：2026/10/01 - 2026/12/31\n段位獎勵：\n• 青銅：頭像框×1\n• 白銀：專屬稱號\n• 黃金：限定皮膚\n• 鉑金：實體獎品抽獎資格\n• 鑽石：賽博都市命名權\n\n準備好迎接挑戰了嗎？',
    type: 'event',
    summary: '首屆排位賽 10/1 開啟，鑽石段位可獲命名權！',
    createdAt: '2026-09-12T09:00:00.000Z',
  },
];

function getReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]): void {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/**
 * 獲取公告列表（按建立時間降序）
 */
export function getAnnouncements(): Announcement[] {
  return [...INITIAL_ANNOUNCEMENTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * 獲取未讀公告
 */
export function getUnreadAnnouncements(): Announcement[] {
  const readIds = getReadIds();
  return getAnnouncements().filter((a) => !readIds.includes(a.id));
}

/**
 * 標記單條公告為已讀
 */
export function markAsRead(id: string): void {
  const readIds = getReadIds();
  if (!readIds.includes(id)) {
    readIds.push(id);
    saveReadIds(readIds);
  }
}

/**
 * 全部標記為已讀
 */
export function markAllAsRead(): void {
  const allIds = getAnnouncements().map((a) => a.id);
  saveReadIds(allIds);
}

const CLAIMED_STORAGE_KEY = 'cyber_monopoly_announcements_claimed';

function getClaimedIds(): string[] {
  try {
    const raw = localStorage.getItem(CLAIMED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveClaimedIds(ids: string[]): void {
  try {
    localStorage.setItem(CLAIMED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/**
 * 檢查公告補償是否已領取
 */
export function isCompensationClaimed(id: string): boolean {
  return getClaimedIds().includes(id);
}

/**
 * 標記公告補償為已領取
 */
export function markCompensationClaimed(id: string): void {
  const claimedIds = getClaimedIds();
  if (!claimedIds.includes(id)) {
    claimedIds.push(id);
    saveClaimedIds(claimedIds);
  }
}

/**
 * 檢查公告是否已讀
 */
export function isAnnouncementRead(id: string): boolean {
  return getReadIds().includes(id);
}
