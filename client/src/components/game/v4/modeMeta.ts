import type { GameMode } from '@shared/api.interface';

// ===== v4.0「量子超躍」新模式中繼資料（僅前端展示用，引擎已穩定）=====
// heist 數位劫案 / bounty_hunt 賞金獵殺 / gold_rush 淘金熱 /
// cyber_olympics 賽博奧運 / rogue_ai 叛逆AI / time_loop 時間迴圈

export type V4ModeId =
  | 'heist'
  | 'bounty_hunt'
  | 'gold_rush'
  | 'cyber_olympics'
  | 'rogue_ai'
  | 'time_loop';

export interface V4ModeMeta {
  id: V4ModeId;
  /** 繁中顯示名稱 */
  label: string;
  /** 一句話描述 */
  tagline: string;
  /** 主題色（用既有 CSS 變數或合法色值） */
  color: string;
  /** 難度標籤 */
  difficulty: string;
  /** 需要的玩家數（undefined 代表 2-6 自由） */
  requiredPlayers?: number;
  /** 是否為非對稱陣營對抗 */
  isTeamBased: boolean;
  /** 對局提示（setup / 選擇時顯示） */
  setupHint: string;
  /** 角色說明（陣營分配） */
  rolesHint?: string;
  /** 取勝條件說明（規則彈窗） */
  winCondition: string;
  /** 額外規則備註 */
  notes: string[];
}

export const V4_MODES: Record<V4ModeId, V4ModeMeta> = {
  heist: {
    id: 'heist',
    label: '數位劫案',
    tagline: '2 劫匪潛行奪核心 vs 2 保全攔截封鎖',
    color: 'var(--orange)',
    difficulty: '地獄',
    requiredPlayers: 4,
    isTeamBased: true,
    setupHint: '非對稱 2v2：劫匪收集 2 個資料核心並抵達逃生點（cell 35）即勝；保全淘汰所有劫匪則保全方勝。',
    rolesHint: '玩家 1、2 為劫匪（潛行奪核心）；玩家 3、4 為保全（攔截、封鎖逃生點）。',
    winCondition:
      '劫匪成功收集 2 個資料核心並有劫匪抵達逃生點即獲勝；保全在逃生點被開啟前淘汰全部劫匪則獲勝。',
    notes: [
      '必須剛好 4 人開局（人機模式為你 + 3 位 AI 分屬兩陣營）。',
      '角色由引擎依 playerIndex 自動分配，落地事件自動結算。',
    ],
  },
  bounty_hunt: {
    id: 'bounty_hunt',
    label: '賞金獵殺',
    tagline: '隨機玩家頭上懸賞，踩中目標得賞金',
    color: 'var(--red)',
    difficulty: '困難',
    requiredPlayers: 4,
    isTeamBased: false,
    setupHint: '每 5 回合輪換懸賞目標，踩中/擊倒目標得賞金；40 回合後累計賞金＋總資產最高者勝。',
    winCondition:
      '對局進行至第 40 回合結束時，以「累計賞金收入 + 總資產」排序，最高分者獲勝。',
    notes: [
      '懸賞目標每 5 回合自動輪換，頭上會顯示當前賞金。',
      '中途破產者淘汰，不參與最終排名。',
    ],
  },
  gold_rush: {
    id: 'gold_rush',
    label: '淘金熱',
    tagline: '資料礦點隨機出現並枯竭，先到先得',
    color: 'var(--yellow)',
    difficulty: '普通',
    requiredPlayers: 4,
    isTeamBased: false,
    setupHint: '金礦格隨機生成、會枯竭；踩中金礦格自動開採。40 回合後開採金礦數×1000＋總資產最高者勝。',
    winCondition:
      '對局進行至第 40 回合結束時，以「開採金礦數 × 1000 + 總資產」排序，最高分者獲勝。',
    notes: [
      '金礦先到先得、可佔礦與跳礦，枯竭後不再產出。',
      '中途破產者淘汰，不參與最終排名。',
    ],
  },
  cyber_olympics: {
    id: 'cyber_olympics',
    label: '賽博奧運',
    tagline: '連串迷你競賽，以獎牌總分決勝',
    color: 'var(--blue)',
    difficulty: '普通',
    requiredPlayers: 4,
    isTeamBased: false,
    setupHint: '一連串迷你遊戲，依金/銀/銅獎牌計分。30 回合或 10 場比賽後，獎牌分數最高者勝。',
    winCondition:
      '對局進行至第 30 回合或完成 10 場比賽後，依獎牌點數（金>銀>銅）排序，最高分者獲勝。',
    notes: [
      '獎牌點數即時顯示在記分板。',
      '中途破產者淘汰，不參與最終排名。',
    ],
  },
  rogue_ai: {
    id: 'rogue_ai',
    label: '叛逆AI',
    tagline: '1 名失控AI放災難，追獵者關閉核心',
    color: 'var(--purple)',
    difficulty: '地獄',
    requiredPlayers: 4,
    isTeamBased: true,
    setupHint: '最後一名玩家扮演叛逆AI（可放災難/陷阱），其餘為追獵者。核心生命值 100，每回合自動受損 5。',
    rolesHint: '玩家 4（最後一名）為叛逆AI；玩家 1~3 為追獵者。核心歸零則追獵者勝，40 回合後核心仍存活則叛逆AI勝。',
    winCondition:
      '核心生命值歸零則追獵者獲勝；第 40 回合結束時核心仍存活則叛逆AI獲勝。',
    notes: [
      '必須剛好 4 人開局，叛逆AI角色自動由末位玩家擔任。',
      '叛逆AI可主動施放災難與陷阱幹擾追獵者。',
    ],
  },
  time_loop: {
    id: 'time_loop',
    label: '時間迴圈',
    tagline: '每 8 回合棋盤重置，保留養成累積破環',
    color: 'var(--cyan)',
    difficulty: '困難',
    requiredPlayers: 4,
    isTeamBased: false,
    setupHint: '每 8 回合位置重置但保留養成；累積分數達 5000 者打破迴圈獲勝，否則 60 回合後分數＋總資產最高者勝。',
    winCondition:
      '任一玩家累積分數達 5000 即打破迴圈獲勝；第 60 回合結束仍無人破環，則以「分數 + 總資產」最高者獲勝。',
    notes: [
      '迴圈重置位置但保留金錢、地產與道具養成。',
      '中途破產者淘汰，不參與最終排名。',
    ],
  },
};

export const V4_MODE_IDS: V4ModeId[] = [
  'heist',
  'bounty_hunt',
  'gold_rush',
  'cyber_olympics',
  'rogue_ai',
  'time_loop',
];

export function isV4Mode(mode: GameMode): mode is V4ModeId {
  return V4_MODE_IDS.includes(mode as V4ModeId);
}

/** v4 模式的繁中標籤（補 MODE_LABELS 缺漏，避免顯示 undefined） */
export function getV4ModeLabel(mode: GameMode): string | undefined {
  if (isV4Mode(mode)) return V4_MODES[mode].label;
  return undefined;
}

/** v4 模式是否需要剛好 N 人 */
export function getV4RequiredPlayers(mode: GameMode): number | undefined {
  if (isV4Mode(mode)) return V4_MODES[mode].requiredPlayers;
  return undefined;
}
