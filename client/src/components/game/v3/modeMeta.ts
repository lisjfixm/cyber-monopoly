import type { GameMode } from '@shared/api.interface';

// ===== v3.0 新模式中繼資料（僅前端展示用，引擎已穩定）=====
// stock_frenzy 股市狂潮 / black_market_race 黑市軍火賽 / twin_strike 雙子星陣營戰

export type V3ModeId = 'stock_frenzy' | 'black_market_race' | 'twin_strike';

export interface V3ModeMeta {
  id: V3ModeId;
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
  /** 是否為 2v2 隊伍對抗 */
  isTeamBased: boolean;
  /** 對局提示（setup / 選擇時顯示） */
  setupHint: string;
  /** 取勝條件說明（規則彈窗） */
  winCondition: string;
  /** 計分說明（規則彈窗） */
  scoring: string;
  /** 額外規則備註 */
  notes: string[];
}

export const V3_MODES: Record<V3ModeId, V3ModeMeta> = {
  stock_frenzy: {
    id: 'stock_frenzy',
    label: '股市狂潮',
    tagline: '股票波動加劇，40 回合後持倉市值最高者勝',
    color: 'var(--green)',
    difficulty: '普通',
    isTeamBased: false,
    setupHint: '回合制：第 40 回合結束時，股票持倉總值（+現金 10%）最高者獲勝。',
    winCondition:
      '對局進行至第 40 回合（GAME_MODES.stock_frenzy.maxTurns）結束時，計算每位存活玩家的「股票持倉市值 + 現金 × 0.1」，最高分者獲勝。',
    scoring:
      '股潮分數 = Σ（持股數量 × 即時股價）+ 持有現金 × 0.1。現金僅作為平手時的加權分，鼓勵把資產壓進股票。',
    notes: [
      '股票波動比經典模式更劇烈，低買高賣是致勝關鍵。',
      '中途破產者直接淘汰，不參與最終排名。',
      '若 40 回合內已有玩家全數破產，則提前結束。',
    ],
  },
  black_market_race: {
    id: 'black_market_race',
    label: '黑市軍火賽',
    tagline: '黑市競標更頻繁，40 回合後資產＋道具總值最高者勝',
    color: 'var(--red)',
    difficulty: '困難',
    isTeamBased: false,
    setupHint: '回合制：第 40 回合結束時，總資產連同道具折價（每件 +800）最高者獲勝。',
    winCondition:
      '對局進行至第 40 回合結束時，計算每位存活玩家的「總資產 + 持有道具數量 × 800」，最高分者獲勝。',
    scoring:
      '軍火分數 = 總資產（現金＋地產＋股票等）+ 道具件數 × 800。囤積並競標稀有道具可大幅領先。',
    notes: [
      '道具效果增強（itemEffectMultiplier 1.3），黑市拍賣更頻繁。',
      '道具折價僅計數量，使用後道具消失會立刻反映在分數上。',
      '中途全數破產則提前結束。',
    ],
  },
  twin_strike: {
    id: 'twin_strike',
    label: '雙子星陣營戰',
    tagline: '2v2 共享金庫，與隊友協力殲滅對方全隊',
    color: 'var(--blue)',
    difficulty: '困難',
    requiredPlayers: 4,
    isTeamBased: true,
    setupHint:
      '2v2 合作對抗：玩家 1、3 為紅隊，玩家 2、4 為藍隊，兩隊共享金庫。殲滅對方全隊即獲勝。',
    winCondition:
      '紅隊與藍隊共享隊伍金庫，輪流行動。任一隊全員破產（隊伍金庫歸零且成員無法支付）即落敗，倖存隊獲勝。',
    scoring:
      '以隊伍為單位結算：成員破產由隊伍金庫共同分擔，隊伍全員倒地即輸。無回合上限，戰到最後一隊。',
    notes: [
      '陣營分配：紅隊 = 玩家 1、3；藍隊 = 玩家 2、4。',
      '必須剛好 4 人開局（人機模式為你 + 3 位 AI）。',
      '結算、成就與勝利提示均以「隊伍」呈現。',
    ],
  },
};

export const V3_MODE_IDS: V3ModeId[] = ['stock_frenzy', 'black_market_race', 'twin_strike'];

export function isV3Mode(mode: GameMode): mode is V3ModeId {
  return V3_MODE_IDS.includes(mode as V3ModeId);
}

/** v3 模式的繁中標籤（補 MODE_LABELS 缺漏，避免顯示 undefined） */
export function getV3ModeLabel(mode: GameMode): string | undefined {
  if (isV3Mode(mode)) return V3_MODES[mode].label;
  return undefined;
}

/** 模式是否需要剛好 4 人（2v2） */
export function getRequiredPlayers(mode: GameMode): number | undefined {
  if (isV3Mode(mode)) return V3_MODES[mode].requiredPlayers;
  return undefined;
}
