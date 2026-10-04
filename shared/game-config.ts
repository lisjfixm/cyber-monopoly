import type {
  CellConfig,
  GameModeConfig,
  FateCard,
  ChanceCard,
  ProfessionConfig,
  Profession,
  StockSymbol,
  StockConfig,
  GlobalEventType,
  GlobalEvent,
  AchievementId,
  Achievement,
  CustomGameRules,
  PlayerColor,
  ItemType,
  ItemConfig,
  WeatherType,
  WeatherConfig,
  MiniGameType,
  TeamId,
  PropertyUpgradePath,
  PropertyUpgradePathConfig,
  BuildingLevel,
  BoardSide,
  DailyChallenge,
  BattlePassReward,
  Mod,
  SkillId,
  SkillConfig,
  Mission,
  MissionType,
  SpecialBuildingType,
  SpecialBuildingConfig,
  TemporaryEffectType,
  TemporaryCellEffect,
  NpcType,
  SeasonType,
  DisasterType,
  StoryLevelConfig,
  StoryLevelId,
  TournamentSize,
  TournamentMatch,
  TournamentStanding,
  TournamentState,
  TournamentPhase,
  MatchStatus,
  CustomMapData,
  MapEditorTool,
  PawnSkinType,
  DiceSkinType,
  SkinConfig,
  TitleConfig,
  TitleId,
  AvatarFrameConfig,
  PetType,
  PetConfig,
} from "@shared/api.interface";

export const CELL_COUNT = 36;

export const TURN_TIME_OPTIONS = [
  { value: 0, label: '無限制' },
  { value: 30, label: '30 秒' },
  { value: 60, label: '60 秒' },
];

export interface SetConfig {
  id: string;
  name: string;
  color: string;
  cells: number[];
}

export const CELLS: CellConfig[] = [
  { id: 0, name: "起点", type: "start", basePrice: 0, color: "#00ff88" },
  // 系列1 青蓝
  { id: 1, name: "霓虹区", type: "property", basePrice: 600, color: "#00e5ff", setId: "set1" },
  { id: 2, name: "旧城区", type: "property", basePrice: 600, color: "#00e5ff", setId: "set1" },
  { id: 3, name: "能源站", type: "property", basePrice: 1000, color: "#00e5ff", setId: "set1" },
  // 系列2 粉色
  { id: 4, name: "数据塔", type: "property", basePrice: 1000, color: "#ff6b9d", setId: "set2" },
  { id: 5, name: "游戏区", type: "minigame", basePrice: 0, color: "#facc15" },
  { id: 6, name: "核心区", type: "property", basePrice: 1400, color: "#ff6b9d", setId: "set2" },
  // 系列3 绿色
  { id: 7, name: "深海港", type: "property", basePrice: 1400, color: "#4ade80", setId: "set3" },
  { id: 8, name: "金融街", type: "property", basePrice: 1600, color: "#4ade80", setId: "set3" },
  { id: 9, name: "地下街", type: "property", basePrice: 1800, color: "#4ade80", setId: "set3" },
  // 禁闭区
  { id: 10, name: "禁闭区", type: "detention", basePrice: 0, color: "#a855f7" },
  // 系列4 黄色
  { id: 11, name: "中央塔", type: "property", basePrice: 2000, color: "#facc15", setId: "set4" },
  { id: 12, name: "废料场", type: "property", basePrice: 1800, color: "#facc15", setId: "set4" },
  { id: 13, name: "摩天楼", type: "property", basePrice: 2000, color: "#facc15", setId: "set4" },
  // 系列5 红色
  { id: 14, name: "空港", type: "property", basePrice: 2200, color: "#ff4d6d", setId: "set5" },
  { id: 15, name: "卫星城", type: "property", basePrice: 2200, color: "#ff4d6d", setId: "set5" },
  { id: 16, name: "工业区", type: "property", basePrice: 2400, color: "#ff4d6d", setId: "set5" },
  // 系列6 橙色
  { id: 17, name: "富豪区", type: "property", basePrice: 2600, color: "#ff8c42", setId: "set6" },
  { id: 18, name: "后街", type: "property", basePrice: 2800, color: "#ff8c42", setId: "set6" },
  { id: 19, name: "科技城", type: "property", basePrice: 3000, color: "#ff8c42", setId: "set6" },
  // 命运区
  { id: 20, name: "命运区", type: "fate", basePrice: 0, color: "#ff4dff" },
  // 系列7 蓝色
  { id: 21, name: "贸易区", type: "property", basePrice: 2600, color: "#3b82f6", setId: "set7" },
  { id: 22, name: "星光道", type: "property", basePrice: 2800, color: "#3b82f6", setId: "set7" },
  { id: 23, name: "游戏区", type: "minigame", basePrice: 0, color: "#facc15" },
  // 系列8 紫色
  { id: 24, name: "外城区", type: "property", basePrice: 2600, color: "#a855f7", setId: "set8" },
  { id: 25, name: "总部", type: "property", basePrice: 3500, color: "#a855f7", setId: "set8" },
  { id: 26, name: "废墟", type: "property", basePrice: 2800, color: "#a855f7", setId: "set8" },
  // 机会区
  { id: 27, name: "机会区", type: "chance", basePrice: 0, color: "#6366f1" },
  // 系列9 棕色
  { id: 28, name: "主塔", type: "property", basePrice: 3200, color: "#b45309", setId: "set9" },
  { id: 29, name: "中转站", type: "property", basePrice: 3000, color: "#b45309", setId: "set9" },
  { id: 30, name: "新城区", type: "property", basePrice: 3400, color: "#b45309", setId: "set9" },
  // 系列10 灰色
  { id: 31, name: "小街区", type: "property", basePrice: 2800, color: "#9ca3af", setId: "set10" },
  { id: 32, name: "企业楼", type: "property", basePrice: 3600, color: "#9ca3af", setId: "set10" },
  { id: 33, name: "补给站", type: "property", basePrice: 3000, color: "#9ca3af", setId: "set10" },
  // 命运区
  { id: 34, name: "命运区", type: "fate", basePrice: 0, color: "#ff4dff" },
  // 机会区
  { id: 35, name: "机会区", type: "chance", basePrice: 0, color: "#6366f1" },
];

export const SETS: SetConfig[] = [
  { id: "set1", name: "青蓝", color: "#00e5ff", cells: [1, 2, 3] },
  { id: "set2", name: "粉色", color: "#ff6b9d", cells: [4, 6] },
  { id: "set3", name: "绿色", color: "#4ade80", cells: [7, 8, 9] },
  { id: "set4", name: "黄色", color: "#facc15", cells: [11, 12, 13] },
  { id: "set5", name: "红色", color: "#ff4d6d", cells: [14, 15, 16] },
  { id: "set6", name: "橙色", color: "#ff8c42", cells: [17, 18, 19] },
  { id: "set7", name: "蓝色", color: "#3b82f6", cells: [21, 22] },
  { id: "set8", name: "紫色", color: "#a855f7", cells: [24, 25, 26] },
  { id: "set9", name: "棕色", color: "#b45309", cells: [28, 29, 30] },
  { id: "set10", name: "灰色", color: "#9ca3af", cells: [31, 32, 33] },
];

// ========== 隨機地圖生成 ==========

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function (): number {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RANDOM_SET_COLORS = [
  "#00e5ff", // 青藍
  "#ff6b9d", // 粉色
  "#4ade80", // 綠色
  "#facc15", // 黃色
  "#ff4d6d", // 紅色
  "#ff8c42", // 橙色
  "#3b82f6", // 藍色
  "#a855f7", // 紫色
];

const RANDOM_PROPERTY_NAMES = [
  "霓虹區", "舊城區", "能源站", "數據塔", "核心區", "深海港",
  "金融街", "地下街", "中央塔", "廢料場", "摩天大樓", "空港",
  "衛星城", "工業區", "富豪區", "後街", "科技城", "貿易區",
  "星光道", "貧民區", "外城區", "總部", "廢墟", "主塔",
  "中轉站", "新城區", "小街區", "企業樓", "補給站", "重工區",
  "高新園", "電子城", "基因園", "量子港", "暗網區", "記憶宮",
];

export function generateRandomBoard(seed?: number): {
  cells: CellConfig[];
  seed: number;
} {
  const boardSeed = seed ?? Math.floor(Math.random() * 1_000_000_000);
  const rand = mulberry32(boardSeed);

  const cells: CellConfig[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push({ id: i, name: "", type: "property", basePrice: 0, color: "" });
  }

  // 位置 0 一定是起點
  cells[0] = { id: 0, name: "起點", type: "start", basePrice: 0, color: "#00ff88" };

  // 隨機選一個位置（5-28 範圍內，避開起點附近）作為禁閉區
  const detentionPos = 5 + Math.floor(rand() * 24);
  cells[detentionPos] = {
    id: detentionPos,
    name: "禁閉區",
    type: "detention",
    basePrice: 0,
    color: "#a855f7",
  };

  // 收集可用的地產位置（排除 start / detention）
  const availablePositions: number[] = [];
  for (let i = 1; i < CELL_COUNT; i++) {
    if (i !== detentionPos) {
      availablePositions.push(i);
    }
  }

  // Fisher-Yates 打亂
  for (let i = availablePositions.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [availablePositions[i], availablePositions[j]] = [
      availablePositions[j],
      availablePositions[i],
    ];
  }

  // 前 2 個放命運區
  const fatePositions = availablePositions.slice(0, 2);
  for (const pos of fatePositions) {
    cells[pos] = {
      id: pos,
      name: "命運區",
      type: "fate",
      basePrice: 0,
      color: "#ff4dff",
    };
  }

  // 接下來 2 個放機會區
  const chancePositions = availablePositions.slice(2, 4);
  for (const pos of chancePositions) {
    cells[pos] = {
      id: pos,
      name: "機會區",
      type: "chance",
      basePrice: 0,
      color: "#6366f1",
    };
  }

  // 剩餘位置為地產，按位置順序排序（方便按漲價順序分配）
  const propertyPositions = availablePositions.slice(4).sort((a, b) => a - b);
  const propertyCount = propertyPositions.length;

  // 6-8 個套裝，每套 3-5 塊地
  const setCount = 6 + Math.floor(rand() * 3); // 6,7,8
  const sets: { id: string; color: string; size: number }[] = [];

  // 先給每套分配基礎大小
  const minPerSet = Math.max(3, Math.floor(propertyCount / setCount) - 1);
  let remaining = propertyCount;
  for (let i = 0; i < setCount; i++) {
    let size = minPerSet;
    if (i === setCount - 1) {
      size = remaining;
    } else {
      // 加隨機 0-2
      const extra = Math.floor(rand() * 3);
      size = Math.min(minPerSet + extra, remaining - (setCount - i - 1) * minPerSet);
      size = Math.max(minPerSet, size);
    }
    remaining -= size;
    sets.push({
      id: `rand_set_${i + 1}`,
      color: RANDOM_SET_COLORS[i % RANDOM_SET_COLORS.length],
      size,
    });
  }

  // 按順序給地產分配套裝（按位置順序排列地產，順序分配套裝）
  // 地價從 600-4000 線性遞增，同套裝地價接近
  const namePool = [...RANDOM_PROPERTY_NAMES];
  // Fisher-Yates 名字池
  for (let i = namePool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [namePool[i], namePool[j]] = [namePool[j], namePool[i]];
  }
  let nameIdx = 0;

  let propIdx = 0;
  for (const set of sets) {
    // 套裝基礎地價：按套裝索引在 600-4000 範圍內線性分布
    const setIndex = sets.indexOf(set);
    const baseSetPrice = 600 + (3400 * setIndex) / (sets.length - 1 || 1);

    for (let j = 0; j < set.size; j++) {
      const pos = propertyPositions[propIdx];
      // 同套裝內地價略有差異（套內位置偏移）
      const intraSetVariation = (j - (set.size - 1) / 2) * 100;
      let price = baseSetPrice + intraSetVariation;
      // ±30% 隨機浮動
      const variation = 0.7 + rand() * 0.6;
      price = Math.round(price * variation / 100) * 100; // 取整到百位
      price = Math.max(600, Math.min(4000, price));

      cells[pos] = {
        id: pos,
        name: namePool[nameIdx % namePool.length] + (nameIdx >= namePool.length ? ` ${Math.floor(nameIdx / namePool.length) + 1}` : ""),
        type: "property",
        basePrice: price,
        color: set.color,
        setId: set.id,
      };
      nameIdx++;
      propIdx++;
    }
  }

  return { cells, seed: boardSeed };
}

export const GAME_MODES: Record<string, GameModeConfig> = {
  classic: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  fast: {
    initialMoney: 8000,
    priceMultiplier: 0.6,
    tollRate: 0.4,
    startReward: 1000,
    fateMoneyMultiplier: 1.0,
  },
  crazy: {
    initialMoney: 20000,
    priceMultiplier: 1.0,
    tollRate: 0.5,
    startReward: 3000,
    fateMoneyMultiplier: 2.0,
  },
  custom: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  coop2v2: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  battle_royale: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  race: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  survival: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  coop_boss: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  treasure: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  emperor: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  dark: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  lightning: {
    initialMoney: 30000,
    priceMultiplier: 1.0,
    tollRate: 0.375,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
    buildingCostMultiplier: 0.5,
    maxTurns: 50,
  },
  resource: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
    maxTurns: 30,
  },
  team_deathmatch: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  darknet: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
    itemEffectMultiplier: 1.5,
    darknetFeeRate: 0.1,
  },
  casino: {
    initialMoney: 12000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.2,
    itemEffectMultiplier: 1.2,
  },
  dynasty: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
  // ===== v3.0 新增模式 =====
  // 股市狂潮：股票波動加劇，回合上限後「股票持倉總值」最高者獲勝
  stock_frenzy: {
    initialMoney: 12000,
    priceMultiplier: 0.8,
    tollRate: 0.2,
    startReward: 1200,
    fateMoneyMultiplier: 1.0,
    maxTurns: 40,
  },
  // 黑市軍火賽：黑市拍賣更頻繁，回合上限後「道具資產總值」最高者獲勝
  black_market_race: {
    initialMoney: 12000,
    priceMultiplier: 0.9,
    tollRate: 0.22,
    startReward: 1200,
    fateMoneyMultiplier: 1.0,
    maxTurns: 40,
    itemEffectMultiplier: 1.3,
    darknetFeeRate: 0.05,
  },
  // 雙子星陣營戰：2v2 共享金庫，以隊伍總資產對決（閉環測試用）
  twin_strike: {
    initialMoney: 15000,
    priceMultiplier: 1.0,
    tollRate: 0.25,
    startReward: 1500,
    fateMoneyMultiplier: 1.0,
  },
};

export const FATE_CARDS: FateCard[] = [
  { id: 1, name: "奖金发放", description: "获得奖金 1000 元", effect: { type: "money", amount: 1000 } },
  { id: 2, name: "税务追缴", description: "缴纳税款 1500 元", effect: { type: "money", amount: -1500 } },
  { id: 3, name: "数据泄露", description: "数据泄露罚款 500 元", effect: { type: "money", amount: -500 } },
  { id: 4, name: "黑客转账", description: "黑客转账 +2000 元", effect: { type: "money", amount: 2000 } },
  { id: 5, name: "紧急召回", description: "被传送到起点", effect: { type: "teleport_start" } },
  { id: 6, name: "加速前进", description: "前进 3 格", effect: { type: "forward", steps: 3 } },
  { id: 7, name: "系统回退", description: "后退 2 格", effect: { type: "backward", steps: 2 } },
  { id: 8, name: "随机跃迁", description: "随机传送至任意地块", effect: { type: "random_teleport" } },
  { id: 9, name: "政府补贴", description: "获得补贴 800 元", effect: { type: "money", amount: 800 } },
  { id: 10, name: "设备维修", description: "维修费 1200 元", effect: { type: "money", amount: -1200 } },
  { id: 11, name: "黑市交易", description: "黑市交易 +1500 元", effect: { type: "money", amount: 1500 } },
  { id: 12, name: "系统维护", description: "系统维护费 600 元", effect: { type: "money", amount: -600 } },
  // 普通金钱/移动类
  { id: 13, name: "股市暴利", description: "股市暴涨，获得 2000 元", effect: { type: "money", amount: 2000 } },
  { id: 14, name: "系统故障", description: "系统故障，损失 800 元", effect: { type: "money", amount: -800 } },
  { id: 15, name: "纳税申报", description: "补缴税款 1000 元", effect: { type: "money", amount: -1000 } },
  { id: 16, name: "创业补助", description: "获得创业补助金 1200 元", effect: { type: "money", amount: 1200 } },
  { id: 17, name: "数字资产升值", description: "数字资产升值，获得 1800 元", effect: { type: "money", amount: 1800 } },
  { id: 18, name: "前进四格", description: "前进 4 格", effect: { type: "forward", steps: 4 } },
  { id: 19, name: "后退三格", description: "后退 3 格", effect: { type: "backward", steps: 3 } },
  { id: 20, name: "地产机遇", description: "前进到最近的地产", effect: { type: "forward_to_property" } },
  // 连锁事件卡
  { id: 21, name: "连锁反应", description: "连续触发 2 张命运卡！", effect: { type: "chain_draw", count: 2 }, isChain: true },
  { id: 22, name: "好运连连", description: "好运连连！连续触发 2 张命运卡", effect: { type: "chain_draw", count: 2 }, isChain: true },
  // 选择题卡
  {
    id: 23,
    name: "十字路口",
    description: "选择：前进 2 格 或 获得 500 元",
    effect: {
      type: "choice",
      options: [{ type: "forward", steps: 2 }, { type: "money", amount: 500 }],
      optionLabels: ["前进 2 格", "获得 500 元"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "前进 2 格", effect: { type: "forward", steps: 2 } },
      { label: "获得 500 元", effect: { type: "money", amount: 500 } },
    ],
  },
  {
    id: 24,
    name: "风险投资",
    description: "选择：失去 1000 元 或 获得 1500 元",
    effect: {
      type: "choice",
      options: [{ type: "money", amount: -1000 }, { type: "money", amount: 1500 }],
      optionLabels: ["失去 1000 元", "获得 1500 元"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "失去 1000 元", effect: { type: "money", amount: -1000 } },
      { label: "获得 1500 元", effect: { type: "money", amount: 1500 } },
    ],
  },
  {
    id: 25,
    name: "道德抉择",
    description: "选择：捐赠 800 元给对手 或 偷取对手 500 元",
    effect: {
      type: "choice",
      options: [{ type: "give_money", amount: 800 }, { type: "steal_money", amount: 500 }],
      optionLabels: ["捐赠 800 元", "偷取 500 元"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "捐赠 800 元", effect: { type: "give_money", amount: 800 } },
      { label: "偷取 500 元", effect: { type: "steal_money", amount: 500 } },
    ],
  },
  // 计时卡
  {
    id: 26,
    name: "加速 Buff",
    description: "移动 +1，持续 3 回合",
    effect: { type: "buff", buffType: "speed_boost", duration: 3, description: "移动 +1" },
    duration: 3,
    buffType: "speed_boost",
  },
  {
    id: 27,
    name: "保护罩",
    description: "3 回合内过路费减半",
    effect: { type: "buff", buffType: "shield", duration: 3, description: "过路费减半" },
    duration: 3,
    buffType: "shield",
  },
  {
    id: 28,
    name: "财运亨通",
    description: "3 回合内金钱卡效果 +50%",
    effect: { type: "buff", buffType: "wealth_luck", duration: 3, description: "金钱卡效果 +50%" },
    duration: 3,
    buffType: "wealth_luck",
  },
  // 特殊效果
  { id: 29, name: "地产升值", description: "随机一块自有地产地价 +20%", effect: { type: "property_appreciate", percent: 20 } },
  { id: 30, name: "破產保護", description: "獲得一次免破產機會（下次破產保留 2000 元）", effect: { type: "money", amount: 0 } },
  // 賽博龐克主題新卡
  { id: 31, name: "駭客入侵成功", description: "從銀行領取 800 元獎金", effect: { type: "money", amount: 800 } },
  { id: 32, name: "加密貨幣暴漲", description: "獲得 600 元現金紅利", effect: { type: "money", amount: 600 } },
  { id: 33, name: "AI 叛亂", description: "被系統判定為異常，送入監禁室", effect: { type: "go_to_detention" } },
  { id: 34, name: "太空電梯故障", description: "緊急退回起點", effect: { type: "teleport_start" } },
  { id: 35, name: "企業收購警告", description: "向其他每位玩家支付 200 元賠償金", effect: { type: "pay_to_all", amount: 200 } },
  { id: 36, name: "維修補給", description: "獲得一張免費出獄卡", effect: { type: "get_out_of_jail" } },
  // 第二波賽博龐克主題新卡
  { id: 37, name: "量子加密空投", description: "從銀行領取 1000 元獎金", effect: { type: "money", amount: 1000 } },
  { id: 38, name: "伺服器過載", description: "前進 2 格", effect: { type: "forward", steps: 2 } },
  { id: 39, name: "數位領主認證", description: "獲得一張免費出獄卡", effect: { type: "get_out_of_jail" } },
  { id: 40, name: "冷啟動重灌", description: "被系統強制重啟，送入監禁室", effect: { type: "go_to_detention" } },
  { id: 41, name: "帝國專利收費", description: "向其他每位玩家收取 250 元專利費", effect: { type: "collect_from_all", amount: 250 } },
  // 第三波：金錢類新卡
  { id: 42, name: "數位紅包雨", description: "從銀行領取 500 元現金紅包", effect: { type: "money", amount: 500 } },
  { id: 43, name: "駭客贓款", description: "隨機一名對手失去 300 元，你獲得其中 50%", effect: { type: "steal_money", amount: 300 } },
  { id: 44, name: "雲端稅單", description: "支付 600 元雲端稅金給銀行", effect: { type: "money", amount: -600 } },
  { id: 45, name: "ICO 暴漲", description: "現金立即翻倍（上限 +2000）", effect: { type: "money", amount: 2000 } },
  // 傳送類新卡
  { id: 46, name: "量子躍遷", description: "立即移動到起點並領取薪水", effect: { type: "teleport_start" } },
  { id: 47, name: "數據傳送", description: "移動到任意一塊你已擁有的地產", effect: { type: "teleport_to_owned" } },
  { id: 48, name: "空間錯位", description: "後退 6 步", effect: { type: "backward", steps: 6 } },
  // 連鎖類新卡
  { id: 49, name: "病毒擴散", description: "若你持有地產，隨機 1 塊地產等級 -1；否則支付 200 元", effect: { type: "property_downgrade" } },
  { id: 50, name: "連鎖反應", description: "再抽 1 張命運卡（最多連鎖 2 次）", effect: { type: "chain_draw", count: 1 }, isChain: true },
  { id: 51, name: "網路風暴", description: "所有其他玩家各支付 150 元給銀行", effect: { type: "others_pay_bank", amount: 150 } },
  // 選擇類新卡
  {
    id: 52,
    name: "命運抉擇",
    description: "二選一：A. 立即獲得 300 元；B. 獲得隨機 1 個道具",
    effect: {
      type: "choice",
      options: [{ type: "money", amount: 300 }, { type: "item_give" }],
      optionLabels: ["獲得 300 元", "獲得隨機道具"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "獲得 300 元", effect: { type: "money", amount: 300 } },
      { label: "獲得隨機道具", effect: { type: "item_give" } },
    ],
  },
  // Buff 類新卡
  {
    id: 53,
    name: "義體強化",
    description: "本回合你的過路費收入 +50%",
    effect: { type: "toll_boost_turn", percent: 50 },
  },
  {
    id: 54,
    name: "幸運模組",
    description: "下次擲骰你可選取較大的那次點數",
    effect: { type: "lucky_dice" },
  },
  {
    id: 55,
    name: "防火牆",
    description: "免疫下一次負面卡牌效果",
    effect: { type: "negative_immunity" },
  },
  // Debuff 類新卡
  {
    id: 56,
    name: "系統當機",
    description: "跳過下一回合",
    effect: { type: "skip_turn" },
  },
  {
    id: 57,
    name: "數據盜竊",
    description: "隨機失去 1 個道具，隨機其他玩家獲得該道具",
    effect: { type: "steal_item" },
  },
  {
    id: 58,
    name: "強制拍賣",
    description: "隨機將你一塊地產以市價 70% 強制賣給銀行",
    effect: { type: "force_sell_property" },
  },
  // 交易提案卡（特殊：以交換現金為主，作為選擇題呈現）
  {
    id: 59,
    name: "交易提案",
    description: "二選一：與隨機對手交換 500 元 / 什麼都不做",
    effect: {
      type: "choice",
      options: [{ type: "trade_exchange_money" }, { type: "money", amount: 0 }],
      optionLabels: ["交換 500 元", "作罷"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "與對手交換 500 元", effect: { type: "trade_exchange_money" } },
      { label: "什麼都不做", effect: { type: "money", amount: 0 } },
    ],
  },
  // 第四波：擴充命運卡（重用既有效果型別，僅增加抽卡池變化）
  {
    id: 60,
    name: "伺服器節點擴容",
    description: "移動力提升，2 回合內每次移動 +1 格",
    effect: { type: "buff", buffType: "speed_boost", duration: 2, description: "移動 +1（2 回合）" },
    duration: 2,
    buffType: "speed_boost",
  },
  {
    id: 61,
    name: "邊緣運算加成",
    description: "本回合你的過路費收入 +30%",
    effect: { type: "toll_boost_turn", percent: 30 },
  },
  // ===== v2.0 新增命運卡（含全新效果型別） =====
  { id: 62, name: "冷凍光束", description: "發射冷凍光束，隨機一名對手下回合跳過", effect: { type: "freeze_opponent", duration: 1 } },
  { id: 63, name: "空間互換", description: "與隨機一名對手互換當前位置", effect: { type: "swap_position" } },
  { id: 64, name: "數字彩票", description: "花 300 元買彩票：50% 中 1000 元，50% 落空", effect: { type: "lottery", cost: 300, prize: 1000 } },
  { id: 65, name: "勒索信", description: "向現金最多的對手勒索 400 元", effect: { type: "extort", amount: 400 } },
  { id: 66, name: "全民稅", description: "包含你在內，所有玩家繳納現金 10% 的社會稅", effect: { type: "universal_tax", percent: 10 } },
  { id: 67, name: "地下賭城豪客", description: "賭場大獎，獲得 1500 元", effect: { type: "money", amount: 1500 } },
  {
    id: 68,
    name: "量子糾纏",
    description: "二選一：凍結一名對手 / 自己獲得 800 元",
    effect: {
      type: "choice",
      options: [{ type: "freeze_opponent", duration: 1 }, { type: "money", amount: 800 }],
      optionLabels: ["凍結對手", "獲得 800 元"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "凍結一名對手", effect: { type: "freeze_opponent", duration: 1 } },
      { label: "獲得 800 元", effect: { type: "money", amount: 800 } },
    ],
  },
  { id: 69, name: "駭客外快", description: "從銀行獲得 700 元外快", effect: { type: "money", amount: 700 } },
  { id: 70, name: "系統冷卻", description: "後退 4 格", effect: { type: "backward", steps: 4 } },
  { id: 71, name: "幸運硬幣連擊", description: "獲得 500 元橫財", effect: { type: "money", amount: 500 } },
  { id: 72, name: "黑市拍賣通知", description: "隨機將一塊自有地產以 70% 價格強制賣出", effect: { type: "force_sell_property" } },
  { id: 73, name: "跨維度傳送", description: "隨機傳送到任意格子", effect: { type: "random_teleport" } },
  // ===== v3.0 新增命運卡 =====
  { id: 100, name: "挖礦獎勵空投", description: "獲得 800 元區塊鏈挖礦分紅", effect: { type: "money", amount: 800 } },
  { id: 101, name: "伺服器電費帳單", description: "支付 600 元雲端伺服器電費", effect: { type: "money", amount: -600 } },
  { id: 102, name: "快取溢出", description: "後退 5 格清理快取", effect: { type: "backward", steps: 5 } },
  { id: 103, name: "CDN 加速", description: "前進 4 格奔向最近的節點", effect: { type: "forward", steps: 4 } },
  { id: 104, name: "DDoS 攻擊受害者", description: "隨機一名對手從你這偷走 350 元", effect: { type: "give_money", amount: 350 } },
  { id: 105, name: "白帽駭客賞金", description: "從隨機對手處竊取 450 元漏洞獎金", effect: { type: "steal_money", amount: 450 } },
  { id: 106, name: "全員節能減排", description: "所有其他玩家各支付 180 元綠能稅給銀行", effect: { type: "others_pay_bank", amount: 180 } },
  { id: 107, name: "使用者紅包", description: "從每位存活對手處各收 200 元訂閱分潤", effect: { type: "collect_from_all", amount: 200 } },
  { id: 108, name: "量子纏結位移", description: "與隨機一名對手交換位置", effect: { type: "swap_position" } },
  { id: 109, name: "主幹線跳躍", description: "直接傳送回起點並領取獎勵", effect: { type: "teleport_start" } },
  { id: 110, name: "防火牆解禁", description: "獲得一張免費出獄卡", effect: { type: "get_out_of_jail" } },
  { id: 111, name: "非法挖礦查緝", description: "被送進監獄關押", effect: { type: "go_to_detention" } },
  { id: 112, name: "版本更新維護", description: "支付 500 元系統維備金", effect: { type: "money", amount: -500 } },
  { id: 113, name: "NFT 拍賣售出", description: "你的隨機一塊地產地價上漲 20%", effect: { type: "property_appreciate", percent: 20 } },
  { id: 114, name: "連鎖碼隨機跳轉", description: "再抽 1 張命運卡", effect: { type: "chain_draw", count: 1 }, isChain: true },
  { id: 115, name: "數位淘金熱", description: "獲得 1200 元熱門概念股分紅", effect: { type: "money", amount: 1200 } },
  { id: 116, name: "資安罰單", description: "繳納現金 6% 給銀行做個資罰鍰", effect: { type: "universal_tax", percent: 6 } },
  { id: 117, name: "暗網現金流", description: "花 400 元賭一把：50% 贏 1000，50% 賭注歸零", effect: { type: "lottery", cost: 400, prize: 1000 } },
];

export const CHANCE_CARDS: ChanceCard[] = [
  { id: 1, name: "移动到起点", description: "直接传送到起点，获得起点奖励", effect: { type: "teleport_start" } },
  { id: 2, name: "被通缉！", description: "被系统通缉，直接关进禁闭区", effect: { type: "go_to_detention" } },
  { id: 3, name: "时空倒流", description: "后退 3 格", effect: { type: "backward", steps: 3 } },
  { id: 4, name: "收取保护费", description: "从对手那里收取 500 元保护费", effect: { type: "steal_money", amount: 500 } },
  { id: 5, name: "公益捐款", description: "向对手捐赠 500 元公益款", effect: { type: "give_money", amount: 500 } },
  { id: 6, name: "免费出狱卡", description: "获得一张免费出狱卡", effect: { type: "get_out_of_jail" } },
  { id: 7, name: "命运指引", description: "前进到最近的命运区", effect: { type: "forward_to_fate" } },
  { id: 8, name: "银行分红", description: "获得银行分红 1000 元", effect: { type: "money", amount: 1000 } },
  { id: 9, name: "维修费", description: "每处房产支付 100 元维修费", effect: { type: "repair_fee", perProperty: 100 } },
  { id: 10, name: "前进 5 格", description: "加速器启动，前进 5 格", effect: { type: "forward", steps: 5 } },
  { id: 11, name: "时空回溯", description: "后退到上一次经过的格子（后退 4 格）", effect: { type: "backward", steps: 4 } },
  { id: 12, name: "幸运星", description: "幸运之星降临！获得 1500 元奖金", effect: { type: "lucky_star", amount: 1500 } },
  // 普通类
  { id: 13, name: "地产猎手", description: "前进到最近的地产并购买", effect: { type: "forward_to_property" } },
  { id: 14, name: "命运回溯", description: "后退到最近的命运区", effect: { type: "backward_to_fate" } },
  { id: 15, name: "收取红利", description: "从所有玩家处各获得 200 元", effect: { type: "collect_from_all", amount: 200 } },
  { id: 16, name: "分红派息", description: "向所有玩家各支付 300 元", effect: { type: "pay_to_all", amount: 300 } },
  { id: 17, name: "股票分红", description: "获得股票分红 1200 元", effect: { type: "money", amount: 1200 } },
  { id: 18, name: "税务审计", description: "税务审计，罚款 1500 元", effect: { type: "money", amount: -1500 } },
  { id: 19, name: "前进六格", description: "加速器启动，前进 6 格", effect: { type: "forward", steps: 6 } },
  { id: 20, name: "后退五格", description: "时空回溯，后退 5 格", effect: { type: "backward", steps: 5 } },
  // 连锁事件卡
  { id: 21, name: "连锁机会", description: "连续抽 2 张机会卡！", effect: { type: "chain_draw", count: 2 }, isChain: true },
  { id: 22, name: "厄运连锁", description: "厄运连锁！连续抽 2 张机会卡", effect: { type: "chain_draw", count: 2 }, isChain: true },
  // 选择题卡
  {
    id: 23,
    name: "两难选择",
    description: "选择：获得免狱卡 或 失去 1000 元",
    effect: {
      type: "choice",
      options: [{ type: "get_out_of_jail" }, { type: "money", amount: -1000 }],
      optionLabels: ["获得免狱卡", "失去 1000 元"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "获得免狱卡", effect: { type: "get_out_of_jail" } },
      { label: "失去 1000 元", effect: { type: "money", amount: -1000 } },
    ],
  },
  {
    id: 24,
    name: "投机选择",
    description: "选择：花 2000 元买随机地产 或 什么都不做",
    effect: {
      type: "choice",
      options: [{ type: "money", amount: -2000 }, { type: "money", amount: 0 }],
      optionLabels: ["花 2000 元", "什么都不做"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "花 2000 元", effect: { type: "money", amount: -2000 } },
      { label: "什么都不做", effect: { type: "money", amount: 0 } },
    ],
  },
  {
    id: 25,
    name: "对赌选择",
    description: "选择：和对手对赌 1000 元 50%赢50%输",
    effect: {
      type: "choice",
      options: [{ type: "steal_money", amount: 1000 }, { type: "give_money", amount: 1000 }],
      optionLabels: ["赌赢 +1000", "赌输 -1000"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "赌赢 +1000", effect: { type: "steal_money", amount: 1000 } },
      { label: "赌输 -1000", effect: { type: "give_money", amount: 1000 } },
    ],
  },
  // 计时卡
  {
    id: 26,
    name: "地产增值",
    description: "所有地产过路费 +20%，持续 3 回合",
    effect: { type: "buff", buffType: "toll_boost", duration: 3, description: "过路费 +20%" },
    duration: 3,
    buffType: "toll_boost",
  },
  {
    id: 27,
    name: "节税优惠",
    description: "3 回合内所有金钱损失 -30%",
    effect: { type: "buff", buffType: "tax_relief", duration: 3, description: "金钱损失 -30%" },
    duration: 3,
    buffType: "tax_relief",
  },
  {
    id: 28,
    name: "超速行驶",
    description: "移动翻倍，持续 2 回合",
    effect: { type: "buff", buffType: "double_move", duration: 2, description: "移动翻倍" },
    duration: 2,
    buffType: "double_move",
  },
  // 特殊效果
  { id: 29, name: "建筑奖励", description: "每处房产获得 200 元奖励", effect: { type: "repair_fee", perProperty: -200 } },
  { id: 30, name: "地產交易所", description: "隨機與對手交換一塊地產", effect: { type: "money", amount: 0 } },
  // 賽博龐克主題新卡
  { id: 31, name: "地下賭場贏錢", description: "從地下賭場贏得 500 元", effect: { type: "money", amount: 500 } },
  { id: 32, name: "網絡追蹤", description: "隨機傳送到任意地塊", effect: { type: "random_teleport" } },
  { id: 33, name: "數據竊取", description: "從隨機一位對手處偷取 300 元", effect: { type: "steal_money", amount: 300 } },
  { id: 34, name: "合規審查罰款", description: "向銀行支付 400 元違規罰款", effect: { type: "money", amount: -400 } },
  { id: 35, name: "合作夥伴分紅", description: "其他每位玩家給你 150 元分紅", effect: { type: "collect_from_all", amount: 150 } },
  { id: 36, name: "緊急系統重啟", description: "前進 3 格", effect: { type: "forward", steps: 3 } },
  // 第二波賽博龐克主題新卡
  { id: 37, name: "閃提優惠", description: "從銀行領取 300 元現金", effect: { type: "money", amount: 300 } },
  { id: 38, name: "資料外洩賠償", description: "向銀行支付 500 元賠償金", effect: { type: "money", amount: -500 } },
  { id: 39, name: "分身帳號登錄", description: "隨機傳送到任意地塊", effect: { type: "random_teleport" } },
  { id: 40, name: "礦池獎勵結算", description: "獲得 700 元礦池分紅", effect: { type: "money", amount: 700 } },
  { id: 41, name: "駭客勒索信", description: "從隨機對手處偷取 400 元", effect: { type: "steal_money", amount: 400 } },
  // 第三波：賽博龐克主題新卡（機會卡）
  { id: 42, name: "地下錢莊放款", description: "從銀行貸得 1000 元（無息）", effect: { type: "money", amount: 1000 } },
  { id: 43, name: "伺服器被駭", description: "隨機一名對手從你這偷取 300 元", effect: { type: "give_money", amount: 300 } },
  { id: 44, name: "數位資產凍結", description: "支付 800 元解凍費", effect: { type: "money", amount: -800 } },
  { id: 45, name: "風投鉅額回報", description: "獲得 1500 元風投資金", effect: { type: "money", amount: 1500 } },
  { id: 46, name: "躍遷到起點", description: "直接傳送到起點，獲得起點獎勵", effect: { type: "teleport_start" } },
  { id: 47, name: "瞬移自有地產", description: "移動到任意一塊你已擁有的地產", effect: { type: "teleport_to_owned" } },
  { id: 48, name: "系統回退 6 格", description: "被強制回退 6 格", effect: { type: "backward", steps: 6 } },
  { id: 49, name: "資產貶值", description: "隨機 1 塊自有地產降級 1 級", effect: { type: "property_downgrade" } },
  { id: 50, name: "連鎖機會", description: "再抽 1 張機會卡", effect: { type: "chain_draw", count: 1 }, isChain: true },
  { id: 51, name: "全網打擊", description: "所有其他玩家各支付 200 元罰金給銀行", effect: { type: "others_pay_bank", amount: 200 } },
  {
    id: 52,
    name: "風險兩難",
    description: "二選一：獲得 500 元 / 獲得隨機道具",
    effect: {
      type: "choice",
      options: [{ type: "money", amount: 500 }, { type: "item_give" }],
      optionLabels: ["獲得 500 元", "獲得隨機道具"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "獲得 500 元", effect: { type: "money", amount: 500 } },
      { label: "獲得隨機道具", effect: { type: "item_give" } },
    ],
  },
  {
    id: 53,
    name: "收割模式",
    description: "本回合過路費收入 +50%",
    effect: { type: "toll_boost_turn", percent: 50 },
  },
  {
    id: 54,
    name: "幸運骰子",
    description: "下次擲骰取較大值",
    effect: { type: "lucky_dice" },
  },
  {
    id: 55,
    name: "防火牆升級",
    description: "免疫下一次負面效果",
    effect: { type: "negative_immunity" },
  },
  {
    id: 56,
    name: "系統當機",
    description: "跳過下一回合",
    effect: { type: "skip_turn" },
  },
  {
    id: 57,
    name: "道具失竊",
    description: "隨機失去 1 個道具",
    effect: { type: "steal_item" },
  },
  {
    id: 58,
    name: "資產清算",
    description: "隨機 1 塊地產以市價 70% 賣給銀行",
    effect: { type: "force_sell_property" },
  },
  {
    id: 59,
    name: "現金交換",
    description: "二選一：與隨機對手交換 500 元 / 作罷",
    effect: {
      type: "choice",
      options: [{ type: "trade_exchange_money" }, { type: "money", amount: 0 }],
      optionLabels: ["交換 500 元", "作罷"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "與對手交換 500 元", effect: { type: "trade_exchange_money" } },
      { label: "什麼都不做", effect: { type: "money", amount: 0 } },
    ],
  },
  // ===== v2.0 新增加會卡 =====
  { id: 60, name: "冰凍詭計", description: "冷凍隨機一名對手，使其下回合跳過", effect: { type: "freeze_opponent", duration: 1 } },
  { id: 61, name: "位置交換", description: "與現金最多的對手互換位置", effect: { type: "swap_position" } },
  { id: 62, name: "賭場對賭", description: "花 500 元賭一把：50% 贏 1200，50% 輸光賭注", effect: { type: "lottery", cost: 500, prize: 1200 } },
  { id: 63, name: "勒索軟體", description: "向最富有的對手索要 500 元保護費", effect: { type: "extort", amount: 500 } },
  { id: 64, name: "資本利得稅", description: "全體玩家繳納現金 8% 給銀行（你也在內）", effect: { type: "universal_tax", percent: 8 } },
  { id: 65, name: "廣告分紅", description: "媒體時段收益，獲得 600 元", effect: { type: "money", amount: 600 } },
  {
    id: 66,
    name: "豪賭時刻",
    description: "二選一：花 400 元博 1000 元彩票 / 穩拿 300 元",
    effect: {
      type: "choice",
      options: [{ type: "lottery", cost: 400, prize: 1000 }, { type: "money", amount: 300 }],
      optionLabels: ["博彩票", "穩拿 300"],
    },
    isChoice: true,
    choiceOptions: [
      { label: "花 400 博 1000", effect: { type: "lottery", cost: 400, prize: 1000 } },
      { label: "穩拿 300 元", effect: { type: "money", amount: 300 } },
    ],
  },
  { id: 67, name: "數位冷凍", description: "隨機一名對手下回合跳過", effect: { type: "freeze_opponent", duration: 1 } },
  { id: 68, name: "黑市匯款", description: "獲得 900 元黑市匯款", effect: { type: "money", amount: 900 } },
  { id: 69, name: "位置錯亂", description: "與隨機對手交換位置", effect: { type: "swap_position" } },
  { id: 70, name: "全民補貼", description: "從每位存活對手處各收 150 元", effect: { type: "collect_from_all", amount: 150 } },
  { id: 71, name: "強制清算", description: "隨機一塊自有地產以市價 70% 賣出", effect: { type: "force_sell_property" } },
  // ===== v3.0 新增機會卡 =====
  { id: 100, name: "漏洞賞金計畫", description: "從銀行領取 650 元除蟲獎金", effect: { type: "money", amount: 650 } },
  { id: 101, name: "頻寬超載罰款", description: "支付 550 元ISP超頻罰款", effect: { type: "money", amount: -550 } },
  { id: 102, name: "邊緣運算節點", description: "前進 5 格部署邊緣節點", effect: { type: "forward", steps: 5 } },
  { id: 103, name: "迴歸測試失敗", description: "後退 3 格修復 bug", effect: { type: "backward", steps: 3 } },
  { id: 104, name: "供應鏈勒索", description: "向現金最多的對手索要 480 元保護費", effect: { type: "extort", amount: 480 } },
  { id: 105, name: "資料外洩賠償", description: "隨機一名對手從你這拿取 320 元", effect: { type: "give_money", amount: 320 } },
  { id: 106, name: "全員資安健檢", description: "每位玩家各繳現金 5% 給銀行", effect: { type: "universal_tax", percent: 5 } },
  { id: 107, name: "病毒擴散", description: "隨機一名對手下回合跳過", effect: { type: "freeze_opponent", duration: 1 } },
  { id: 108, name: "租戶暴漲租金", description: "你的隨機一塊地產地價上漲 15%", effect: { type: "property_appreciate", percent: 15 } },
  { id: 109, name: "衛星鏈路上線", description: "獲得 1100 元星鏈服務費", effect: { type: "money", amount: 1100 } },
  { id: 110, name: "反向代理錯位", description: "與隨機對手交換位置", effect: { type: "swap_position" } },
  { id: 111, name: "伺服器熔毀", description: "所有其他玩家各付 220 元電力分攤", effect: { type: "others_pay_bank", amount: 220 } },
  { id: 112, name: "Beta 版機會", description: "再抽 1 張機會卡", effect: { type: "chain_draw", count: 1 }, isChain: true },
  { id: 113, name: "駭客拋售持股", description: "隨機一塊自有地產以 70% 價格賣出換現", effect: { type: "force_sell_property" } },
  { id: 114, name: "凌晨緊急維運", description: "被強制送進監獄關押一回合", effect: { type: "go_to_detention" } },
];

export const MODE_LABELS: Record<string, string> = {
  classic: "经典模式",
  fast: "快速模式",
  crazy: "疯狂模式",
  custom: "自定义模式",
  coop2v2: "合作模式 2v2",
  battle_royale: "大逃杀模式",
  race: "竞速模式",
  survival: "生存模式",
  coop_boss: "合作打Boss",
  treasure: "夺宝模式",
  emperor: "皇帝模式",
  dark: "黑暗模式",
  lightning: "闪电战",
  resource: "资源争夺",
  team_deathmatch: "团队死斗",
  darknet: "暗网",
  casino: "霓虹賭城",
  dynasty: "金融王朝",
};

export const DEFAULT_CUSTOM_RULES: CustomGameRules = {
  initialMoney: 15000,
  tollPercent: 0.25,
  goBonus: 1500,
  fateMoneyMultiplier: 1.0,
  enableFateCards: true,
  enableChanceCards: true,
  enableStockMarket: true,
  enableGlobalEvents: true,
  buildingTollMode: "standard",
  bankruptcyLine: 0,
  enablePropertyFutures: true,
  enableOptionsTrading: true,
  enableWarSystem: true,
  enableSpySystem: true,
  enableRobotProxy: true,
  enableTimeTravel: true,
  enableParallelWorld: true,
  enableCardCombo: true,
  enablePropertyEvolution: true,
  enableMountSystem: true,
  enablePetSystem: true,
  enableCodex: true,
};

export const PROFESSIONS: Record<Profession, ProfessionConfig> = {
  engineer: {
    id: "engineer",
    name: "工程师",
    icon: "Wrench",
    color: "#00e5ff",
    description: "建造大师，精于工程成本控制",
    skills: [
      "建造房屋/酒店费用打7折",
      "拆除建筑返还70%（默认50%）",
    ],
  },
  banker: {
    id: "banker",
    name: "银行家",
    icon: "Landmark",
    color: "#facc15",
    description: "金融巨鳄，操纵资金流转",
    skills: [
      "抵押赎回利息降为5%（默认10%）",
      "起点奖励+500元",
    ],
  },
  speculator: {
    id: "speculator",
    name: "投机者",
    icon: "TrendingUp",
    color: "#ff6b9d",
    description: "风险偏好，高风险高回报",
    skills: [
      "命运卡/机会卡金钱效果×2",
      "抽卡时有30%概率重抽一次",
    ],
  },
  tycoon: {
    id: "tycoon",
    name: "地产大亨",
    icon: "Building2",
    color: "#4ade80",
    description: "房产专家，低买高卖",
    skills: [
      "购买地块价格打9折",
      "过路费收入+20%",
    ],
  },
  hacker: {
    id: "hacker",
    name: "黑客",
    icon: "Cpu",
    color: "#a855f7",
    description: "系统入侵，总能找到漏洞",
    skills: [
      "进入禁闭区50%概率直接逃脱",
      "踩对手地块20%概率免过路费",
    ],
  },
  doctor: {
    id: "doctor",
    name: "医生",
    icon: "Heart",
    color: "#ff4d6d",
    description: "生命守护者，绝境逢生",
    skills: [
      "每回合开始恢复200元",
      "破产时可复活一次（保留1000元，地产归银行）",
    ],
  },
  lawyer: {
    id: "lawyer",
    name: "律師",
    icon: "Scale",
    color: "#38bdf8",
    description: "訴訟高手，精通規則漏洞",
    skills: [
      "每局可免費偷取對手一塊無建築地產",
      "進入法庭/罰款時30%概率豁免",
    ],
  },
  journalist: {
    id: "journalist",
    name: "記者",
    icon: "Newspaper",
    color: "#f97316",
    description: "情報專家，洞悉對手一舉一動",
    skills: [
      "可查看對手道具欄和股票持倉",
      "踩命運/機會區時40%概率查看內容後選擇是否觸發",
    ],
  },
  gambler: {
    id: "gambler",
    name: "賭徒",
    icon: "Dices",
    color: "#ec4899",
    description: "風險至上，輸贏一念之間",
    skills: [
      "迷你遊戲獎勵翻倍",
      "擲出雙倍骰時金額獎勵+50%",
    ],
  },
  artist: {
    id: "artist",
    name: "藝術家",
    icon: "Palette",
    color: "#a78bfa",
    description: "創造大師，點石成金",
    skills: [
      "建房後地塊價值+10%（額外提升地價）",
      "起點獎勵+300元",
    ],
  },
  scientist: {
    id: "scientist",
    name: "科學家",
    icon: "FlaskConical",
    color: "#22d3ee",
    description: "科技先鋒，實驗改變世界",
    skills: [
      "實驗室（特殊建築）效果翻倍",
      "買道具打8折",
    ],
  },
  traveler: {
    id: "traveler",
    name: "旅行家",
    icon: "Compass",
    color: "#facc15",
    description: "環球旅人，足跡遍布各處",
    skills: [
      "移動時10%概率多走1步",
      "過路費收入+10%（每經過一塊自己的地）",
    ],
  },
  cyber_hacker: {
    id: "cyber_hacker",
    name: "駭客",
    icon: "Cpu",
    color: "#a855f7",
    description: "系統入侵，操控對手地產",
    skills: [
      "主動：入侵對手一塊地產，使其過路費減半 3 回合",
      "每局限 3 次入侵機會",
    ],
  },
  quantum_physicist: {
    id: "quantum_physicist",
    name: "量子物理學家",
    icon: "Atom",
    color: "#06b6d4",
    description: "操控空間，瞬間轉移",
    skills: [
      "主動：量子跳躍，傳送到任意格子",
      "冷卻時間 5 回合",
    ],
  },
  influencer: {
    id: "influencer",
    name: "網紅",
    icon: "Crown",
    color: "#ec4899",
    description: "流量變現，粉絲經濟",
    skills: [
      "被動：經過起點額外獲得「持有地產數 × 10」元",
      "粉絲數隨地產增加而上升",
    ],
  },
  black_market_dealer: {
    id: "black_market_dealer",
    name: "黑市商人",
    icon: "ShoppingBag",
    color: "#f59e0b",
    description: "地下管道，道具交易",
    skills: [
      "被動：道具商店購買打 8 折",
      "主動：可將道具賣給其他玩家（每局限 3 次）",
    ],
  },
  cyberborg: {
    id: "cyberborg",
    name: "賽博改造人",
    icon: "Bot",
    color: "#10b981",
    description: "機械身軀，精準控制",
    skills: [
      "主動：每回合 1 次，擲骰結果可 +1 或 -1 微調",
      "調整後按新步數執行移動",
    ],
  },
  blockchain_miner: {
    id: "blockchain_miner",
    name: "區塊鏈礦工",
    icon: "Pickaxe",
    color: "#fbbf24",
    description: "算力為王，被動收益",
    skills: [
      "被動：每回合開始按持有地產數獲得收益",
      "每塊地產 +20 元/回合（單回合最多 +200）",
    ],
  },
  cyber_daoist: {
    id: "cyber_daoist",
    name: "賽博道士",
    icon: "Sparkles",
    color: "#a78bfa",
    description: "陰陽調和，福禍相依",
    skills: [
      "抽到命運卡時，正面金錢/道具效果 +50%",
      "負面效果 -30%（最低為原額的 50%）",
    ],
  },
  data_priest: {
    id: "data_priest",
    name: "數據牧師",
    icon: "Zap",
    color: "#fde047",
    description: "數據即信仰，獻祭換奇蹟",
    skills: [
      "主動（每局限 1 次）：支付當前現金 20% 進行獻祭",
      "隨機獲得一個 buff：過路費翻倍 1 回合 / 免疫 1 次負面 / 下次擲骰必出 7",
    ],
  },
  mechanical_alchemist: {
    id: "mechanical_alchemist",
    name: "機械煉金術士",
    icon: "Flame",
    color: "#fb923c",
    description: "煉金之術，點石成金",
    skills: [
      "升級建築成本 -30%",
      "地產過路費 +20%（因煉金加成）",
    ],
  },
  shadow_broker: {
    id: "shadow_broker",
    name: "影子經紀人",
    icon: "HandCoins",
    color: "#2dd4bf",
    description: "幕後推手，交易抽成",
    skills: [
      "被動：任何玩家間交易（買賣地產、道具），你抽取成交額 10% 佣金",
      "若你不在交易中，則自動從成交金額中收取",
    ],
  },
  time_watcher: {
    id: "time_watcher",
    name: "時間守望者",
    icon: "Clock",
    color: "#60a5fa",
    description: "時鐘守護，操控時間流",
    skills: [
      "主動（每局限 1 次）：自己回合結束後立即獲得一個額外回合",
      "時間回溯時可額外保留 1 塊地產不被重置",
    ],
  },
  net_ninja: {
    id: "net_ninja",
    name: "網路忍者",
    icon: "Shield",
    color: "#34d399",
    description: "影忍身法，反擊盜竊",
    skills: [
      "每局首次被負面卡牌/道具影響時，免疫該次效果",
      "並額外獲得 1 個隨機道具",
    ],
  },
  drone_pilot: {
    id: "drone_pilot",
    name: "無人機操縱師",
    icon: "Plane",
    color: "#38bdf8",
    description: "空中之眼，全域偵察",
    skills: [
      "被動：每回合開始時有 30% 概率獲得 150 元偵察津貼",
      "主動（每局限 3 次）：部署偵察機，立即獲得 300 元並使下次買地 9 折",
    ],
  },
  auctioneer: {
    id: "auctioneer",
    name: "拍賣師",
    icon: "Gavel",
    color: "#f59e0b",
    description: "槌聲一响，利益我有",
    skills: [
      "被動：競標時出價永久 95 折（少付 5%）",
      "主動（每局限 2 次）：壓價拍賣，指定一塊對手地產過路費減半 2 回合",
    ],
  },
  bounty_hunter: {
    id: "bounty_hunter",
    name: "賞金獵人",
    icon: "Crosshair",
    color: "#ef4444",
    description: "拿人錢財，替人消災",
    skills: [
      "被動：每成功從對手處收取過路費，額外獲得 10% 賞金",
      "主動：對傷害過自己最多次的對手索取 500 元賞金",
    ],
  },
  street_racer: {
    id: "street_racer",
    name: "街頭賽車手",
    icon: "Flag",
    color: "#f97316",
    description: "地板油門，絕不放慢",
    skills: [
      "被動：擲出 3 或更低時，本回合移動 +1 格",
      "主動（每局限 2 次）：氮氣加速，本回合立即額外前進 3 格",
    ],
  },
  media_mogul: {
    id: "media_mogul",
    name: "媒體巨頭",
    icon: "Radio",
    color: "#a855f7",
    description: "流量即權力，聲量變現",
    skills: [
      "被動：每擁有 1 塊地產獲得 1 粉絲，每粉絲每回合 +2 元被動廣告收入",
      "主動：投放廣告，所有對手各支付 100 元宣傳費給你",
    ],
  },
  cyber_sniper: {
    id: "cyber_sniper",
    name: "網路狙擊手",
    icon: "Crosshair",
    color: "#0ea5e9",
    description: "一擊必殺，遠距離精準打擊",
    skills: [
      "被動：攻擊類道具（炸彈/勒索病毒）效果 +50%",
      "主動（每局限 1 次）：狙擊，直接將一名對手送入監禁室",
    ],
  },
  // ===== v3.0 新增職業 =====
  netrunner: {
    id: "netrunner",
    name: "網路行者",
    icon: "Terminal",
    color: "#22d3ee",
    description: "潛入數位深網，掠奪對手資金",
    skills: [
      "主動（每局限 2 次）：數位掠襲，從現金最多的對手處盜取 400 元",
      "被動：使用掠奪類道具時效果 +20%",
    ],
  },
  cyber_medic: {
    id: "cyber_medic",
    name: "賽博醫護",
    icon: "Stethoscope",
    color: "#f472b6",
    description: "奈米醫護，绝境回血，戰鬥續航",
    skills: [
      "主動（每局限 2 次）：奈米修復，生存模式回血 30，其他模式變現 800 元",
      "被動：起點額外回復 100 元醫療補貼",
    ],
  },
  stock_broker: {
    id: "stock_broker",
    name: "操盤手",
    icon: "LineChart",
    color: "#fbbf24",
    description: "低吸高拋，操縱股市節奏",
    skills: [
      "主動（每局限 2 次）：低吸高拋，立即獲得 600 元股市操作盈餘",
      "被動：股票買賣手續費減免",
    ],
  },
};

export const PLAYER_COLORS: PlayerColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
];

export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  red: "#ff3333",
  blue: "#3399ff",
  green: "#33ff33",
  yellow: "#ffcc00",
  purple: "#cc33ff",
  orange: "#ff8800",
};

export const DEFAULT_PLAYER_NAMES = [
  "玩家1",
  "玩家2",
  "玩家3",
  "玩家4",
  "玩家5",
  "玩家6",
];

export type AIDifficultyKey = 'easy' | 'normal' | 'hard' | 'hell';

export const AI_DIFFICULTY_CONFIG: Record<AIDifficultyKey, {
  buyProbabilityMultiplier: number;
  buildProbabilityMultiplier: number;
  tradeAggression: number;
  safetyPadRatio: number;
  preciseTollCalc: boolean;
  targetWeakestPlayer: boolean;
  assetEstimation: boolean;
}> = {
  easy: { buyProbabilityMultiplier: 0.35, buildProbabilityMultiplier: 0.45, tradeAggression: 0.35, safetyPadRatio: 1.3, preciseTollCalc: false, targetWeakestPlayer: false, assetEstimation: false },
  normal: { buyProbabilityMultiplier: 1.0, buildProbabilityMultiplier: 1.0, tradeAggression: 1.0, safetyPadRatio: 1.0, preciseTollCalc: false, targetWeakestPlayer: false, assetEstimation: false },
  hard: { buyProbabilityMultiplier: 1.35, buildProbabilityMultiplier: 1.6, tradeAggression: 1.6, safetyPadRatio: 0.75, preciseTollCalc: false, targetWeakestPlayer: false, assetEstimation: false },
  hell: { buyProbabilityMultiplier: 1.65, buildProbabilityMultiplier: 2.2, tradeAggression: 2.3, safetyPadRatio: 0.35, preciseTollCalc: true, targetWeakestPlayer: true, assetEstimation: true },
};

export type AIPersonalityKey = 'conservative' | 'aggressive' | 'speculator' | 'trader' | 'vengeful' | 'gambler';

export interface AIPersonalityConfig {
  name: string;
  description: string;
  color: string;
  buyBias: number;
  buildBias: number;
  tradeBias: number;
  stockBias: number;
  auctionBias: number;
  preferHighValue: boolean;
  preferSetComplete: boolean;
}

export const AI_PERSONALITY_CONFIG: Record<AIPersonalityKey, AIPersonalityConfig> = {
  conservative: {
    name: '保守派',
    description: '穩健經營，優先保本，謹慎購地與建房',
    color: 'var(--cyan)',
    buyBias: 0.7,
    buildBias: 0.8,
    tradeBias: 0.6,
    stockBias: 0.3,
    auctionBias: 0.5,
    preferHighValue: false,
    preferSetComplete: true,
  },
  aggressive: {
    name: '激進派',
    description: '瘋狂擴張，高風險高回報，全力搶地建房',
    color: 'var(--red)',
    buyBias: 1.4,
    buildBias: 1.4,
    tradeBias: 1.3,
    stockBias: 1.3,
    auctionBias: 1.4,
    preferHighValue: true,
    preferSetComplete: true,
  },
  speculator: {
    name: '投機派',
    description: '熱衷股票拍賣，低買高賣，追求短線暴利',
    color: 'var(--yellow)',
    buyBias: 1.0,
    buildBias: 0.9,
    tradeBias: 1.1,
    stockBias: 1.8,
    auctionBias: 1.6,
    preferHighValue: true,
    preferSetComplete: false,
  },
  trader: {
    name: '貿易派',
    description: '精通談判交易，四兩撥千斤，以地易地湊套裝',
    color: 'var(--green)',
    buyBias: 0.9,
    buildBias: 1.0,
    tradeBias: 1.8,
    stockBias: 0.7,
    auctionBias: 0.8,
    preferHighValue: false,
    preferSetComplete: true,
  },
  vengeful: {
    name: '復仇者',
    description: '記恨在心，專門針對傷害過自己的玩家，攻擊性道具偏好極高',
    color: 'var(--red)',
    buyBias: 1.1,
    buildBias: 1.0,
    tradeBias: 0.7,
    stockBias: 0.9,
    auctionBias: 1.1,
    preferHighValue: false,
    preferSetComplete: false,
  },
  gambler: {
    name: '賭徒',
    description: '一擲千金，熱衷高風險高回報，股票/賭博/彩票偏好極高，保守意願低',
    color: 'var(--yellow)',
    buyBias: 1.2,
    buildBias: 0.8,
    tradeBias: 1.0,
    stockBias: 2.2,
    auctionBias: 1.7,
    preferHighValue: true,
    preferSetComplete: false,
  },
};

const AI_PERSONALITY_KEYS: AIPersonalityKey[] = ['conservative', 'aggressive', 'speculator', 'trader', 'vengeful', 'gambler'];

export function getRandomAIPersonality(): AIPersonalityKey {
  return AI_PERSONALITY_KEYS[Math.floor(Math.random() * AI_PERSONALITY_KEYS.length)];
}

// ========== 內建模組 ==========

export const BUILTIN_MODS: Mod[] = [
  {
    id: 'classic_plus',
    name: '經典加強版',
    description: '增加更多命運卡，提升遊戲變化性',
    version: '1.0.0',
    author: '官方',
    cards: [
      { id: 'mc1', type: 'fate', name: '數幣暴漲', description: '你的加密貨幣投資大賺一筆', effect: { type: 'money', value: 2000 } },
      { id: 'mc2', type: 'fate', name: 'AI 取代', description: '你的工作被 AI 取代，支付失業救濟金', effect: { type: 'money', value: -1500 } },
    ],
  },
  {
    id: 'fast_rich',
    name: '快速致富',
    description: '起始金錢翻倍，過路費更高',
    version: '1.0.0',
    author: '官方',
    rules: {
      startMoney: 30000,
      rentMultiplier: 2.0,
    },
  },
  // ===== 內建遊戲規則模組 =====
  {
    id: 'builtin_quick_mode',
    name: '快速模式',
    description: '回合時間限制30秒，遊戲節奏加快',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'Zap',
    conflictsWith: ['builtin_time_accel'],
    rules: { maxTurns: 999 },
  },
  {
    id: 'builtin_infinite_fate',
    name: '無限命運',
    description: '每輪都抽取命運卡',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'Sparkles',
  },
  {
    id: 'builtin_crazy_prices',
    name: '瘋狂地價',
    description: '地產價格×2，租金×3',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'TrendingUp',
    rules: { rentMultiplier: 3.0 },
  },
  {
    id: 'builtin_pacifist',
    name: '和平主義',
    description: '取消所有負面事件，只有好事件',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'Heart',
    conflictsWith: ['builtin_random_surprise'],
  },
  {
    id: 'builtin_random_surprise',
    name: '隨機驚喜',
    description: '每回合隨機觸發一個特殊效果',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'Gift',
    conflictsWith: ['builtin_pacifist'],
  },
  {
    id: 'builtin_underdog',
    name: '窮人逆襲',
    description: '初始資產低的玩家每回合額外補貼',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'Coins',
  },
  {
    id: 'builtin_monopoly',
    name: '資本壟斷',
    description: '同一顏色地產租金翻倍效果×2',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'Crown',
  },
  {
    id: 'builtin_time_accel',
    name: '時間加速',
    description: '骰子移動力+2',
    version: '1.0.0',
    author: '內建',
    category: 'gameplay',
    isBuiltin: true,
    iconKey: 'FastForward',
    conflictsWith: ['builtin_quick_mode'],
  },
  // ===== 內建視覺美化模組 =====
  {
    id: 'builtin_retro_pixel',
    name: '懷舊像素風',
    description: '復古像素畫質',
    version: '1.0.0',
    author: '內建',
    category: 'visual',
    isBuiltin: true,
    iconKey: 'Grid3X3',
  },
  {
    id: 'builtin_minimal',
    name: '極簡模式',
    description: '關閉所有特效，提升性能',
    version: '1.0.0',
    author: '內建',
    category: 'visual',
    isBuiltin: true,
    iconKey: 'MinusCircle',
  },
  {
    id: 'builtin_rainy',
    name: '雨天效果',
    description: '背景下雨動畫',
    version: '1.0.0',
    author: '內建',
    category: 'visual',
    isBuiltin: true,
    iconKey: 'CloudRain',
  },
  {
    id: 'builtin_starry_night',
    name: '星空夜晚',
    description: '背景星空+流星',
    version: '1.0.0',
    author: '內建',
    category: 'visual',
    isBuiltin: true,
    iconKey: 'Stars',
  },
];

// ========== 语音聊天配置 ==========

export const VOICE_ENABLED = true;     // 语音功能开关

// ========== 語音包配置 ==========

export type VoicePackType = 'robot' | 'mature' | 'uncle' | 'moe';

export interface VoicePackConfig {
  id: VoicePackType;
  name: string;
  description: string;
  pitch: number;
  rate: number;
  volume: number;
}

export const VOICE_PACKS: Record<VoicePackType, VoicePackConfig> = {
  robot: {
    id: 'robot',
    name: '機器人',
    description: '冷靜機械語調，電子感十足',
    pitch: 0.5,
    rate: 0.9,
    volume: 1,
  },
  mature: {
    id: 'mature',
    name: '御姐',
    description: '成熟溫柔女聲，從容優雅',
    pitch: 0.9,
    rate: 1.0,
    volume: 1,
  },
  uncle: {
    id: 'uncle',
    name: '大叔',
    description: '低沉磁性男聲，穩重可靠',
    pitch: 0.3,
    rate: 0.95,
    volume: 1,
  },
  moe: {
    id: 'moe',
    name: '萌妹',
    description: '元氣可愛少女聲，元氣滿滿',
    pitch: 1.8,
    rate: 1.2,
    volume: 1,
  },
};

// ========== 观战模式配置 ==========

export const MAX_SPECTATORS = 50;      // 最大观战人数
export const DANMAKU_MAX_LENGTH = 50;  // 弹幕最大长度
export const MAX_DANMAKU = 100;        // 弹幕最大保留条数

export function getCellSet(cellId: number): string | null {
  const cell = CELLS[cellId];
  return cell?.setId ?? null;
}

export function forwardToNearestFate(fromPos: number): number {
  const fatePositions = CELLS
    .filter((c) => c.type === "fate")
    .map((c) => c.id)
    .sort((a, b) => a - b);
  for (const pos of fatePositions) {
    if (pos > fromPos) return pos;
  }
  // 绕一圈回到第一个命运区
  return fatePositions[0] + CELL_COUNT;
}

// ========== 股票配置 ==========

export const STOCKS: Record<StockSymbol, StockConfig> = {
  NEON: { symbol: "NEON", name: "霓虹科技", initialPrice: 100, volatility: "high", color: "#00e5ff", linkedSetIds: ["set1", "set3"] },
  QNTM: { symbol: "QNTM", name: "量子能源", initialPrice: 80, volatility: "medium", color: "#4ade80", linkedSetIds: ["set5", "set6"] },
  DATA: { symbol: "DATA", name: "数据集团", initialPrice: 120, volatility: "low", color: "#a855f7", linkedSetIds: ["set2", "set8"] },
  CYBR: { symbol: "CYBR", name: "赛博医药", initialPrice: 90, volatility: "medium", color: "#ff6b9d", linkedSetIds: ["set4", "set7"] },
};

export const STOCK_PRICE_MIN = 10;
export const STOCK_PRICE_MAX = 500;
export const STOCK_TOTAL_SHARES = 100; // 每支股票總流通股數

export const STOCK_SYMBOLS: StockSymbol[] = ["NEON", "QNTM", "DATA", "CYBR"];

// ========== 全局事件配置 ==========

export const GLOBAL_EVENTS: Record<GlobalEventType, GlobalEvent> = {
  economic_crisis: { type: "economic_crisis", name: "经济危机", description: "所有玩家现金-15%，股票价格-20%", icon: "TrendingDown" },
  tech_boom: { type: "tech_boom", name: "科技爆发", description: "所有地块过路费本回合+50%，股票价格+15%", icon: "Zap" },
  neon_festival: { type: "neon_festival", name: "霓虹节日", description: "所有玩家现金+1000元", icon: "PartyPopper" },
  hacker_attack: { type: "hacker_attack", name: "黑客攻击", description: "随机一位玩家现金-2000元", icon: "Skull" },
  real_estate_bubble: { type: "real_estate_bubble", name: "地产泡沫", description: "所有地块价格临时+30%（持续到下次事件）", icon: "Building" },
  energy_shortage: { type: "energy_shortage", name: "能源短缺", description: "有建筑的玩家每栋房屋支付100元维护费，酒店500元", icon: "Battery" },
  data_dividend: { type: "data_dividend", name: "数据红利", description: "持有股票最多的玩家获得2000元", icon: "Gift" },
  urban_reconstruction: { type: "urban_reconstruction", name: "城市重建", description: "所有抵押的地产自动解除抵押（免费）", icon: "RefreshCw" },
  space_immigration: { type: "space_immigration", name: "太空移民", description: "所有玩家前进3格（不触发格子事件）", icon: "Rocket" },
  ai_rebellion: { type: "ai_rebellion", name: "AI叛乱", description: "随机一位玩家获得一张免费出狱卡", icon: "Bot" },
  investment_hint: { type: "investment_hint", name: "投資熱點", description: "神秘投資者預言某地塊即將漲價，把握良機！", icon: "TrendingUp" },
  bank_crisis: { type: "bank_crisis", name: "銀行危機", description: "銀行倒閉！存款半數蒸發、所有貸款一筆勾銷！", icon: "Landmark" },
  quantum_storm: { type: "quantum_storm", name: "量子風暴", description: "現實不穩！所有玩家隨機移動 1~4 格，金錢卡效果翻倍", icon: "Atom" },
  stock_circuit_breaker: { type: "stock_circuit_breaker", name: "股市熔斷", description: "股市熔斷！股價隨機暴跌後暫停波動，持有股票者暫時套牢", icon: "BarChart2" },
  foreign_inflow: { type: "foreign_inflow", name: "外資流入", description: "國際熱錢湧入！股價全線大漲 25%，持有股票者坐收增值", icon: "Globe" },
  ad_storm: { type: "ad_storm", name: "廣告風暴", description: "海量廣告轟炸！所有玩家本回合收入 ×1.5", icon: "Megaphone" },
  subsidy_carnival: { type: "subsidy_carnival", name: "補貼狂歡", description: "政府撒錢！每位存活玩家立即獲得 600 元補貼", icon: "PartyPopper" },
  black_market_crackdown: { type: "black_market_crackdown", name: "黑市取締", description: "警方突擊黑市！聲望最低者被罰款，交易型玩家受創", icon: "ShieldAlert" },
  // ===== v3.0 新增全局事件 =====
  satellite_airdrop: { type: "satellite_airdrop", name: "衛星空投", description: "低軌衛星拋下補給！每位存活玩家獲得 400 元", icon: "Satellite" },
  data_thunder: { type: "data_thunder", name: "數位雷擊", description: "隨機一位玩家被雷擊，現金 -800 元", icon: "Zap" },
  chip_boom: { type: "chip_boom", name: "晶片狂潮", description: "全球晶片缺貨！股價全線上漲 12%", icon: "Cpu" },
  mega_subsidy: { type: "mega_subsidy", name: "全民普發現金", description: "政府大撒幣！每位存活玩家立即獲得 500 元", icon: "Banknote" },
};

export const GLOBAL_EVENT_TYPES: GlobalEventType[] = [
  "economic_crisis",
  "tech_boom",
  "neon_festival",
  "hacker_attack",
  "real_estate_bubble",
  "energy_shortage",
  "data_dividend",
  "urban_reconstruction",
  "space_immigration",
  "ai_rebellion",
  "investment_hint",
  "bank_crisis",
  "quantum_storm",
  "stock_circuit_breaker",
  "foreign_inflow",
  "ad_storm",
  "subsidy_carnival",
  "black_market_crackdown",
  // v3.0 新增全局事件
  "satellite_airdrop",
  "data_thunder",
  "chip_boom",
  "mega_subsidy",
];

// ========== 成就配置 ==========

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_win: { id: "first_win", name: "首勝", description: "贏得一局遊戲", icon: "Trophy", category: "beginner", rarity: "common", points: 10 },
  property_tycoon: { id: "property_tycoon", name: "地產霸主", description: "單局擁有10塊以上地塊", icon: "Landmark", category: "wealth", rarity: "rare", points: 20, target: 10 },
  building_magnate: { id: "building_magnate", name: "建築大亨", description: "單局建造5棟以上房屋", icon: "Building2", category: "wealth", rarity: "rare", points: 20, target: 5 },
  hotel_king: { id: "hotel_king", name: "酒店之王", description: "擁有至少1棟酒店", icon: "Hotel", category: "wealth", rarity: "epic", points: 30, target: 1 },
  set_collector: { id: "set_collector", name: "套裝收藏家", description: "集齊3個以上系列", icon: "Layers", category: "collection", rarity: "rare", points: 20, target: 3 },
  stock_sniper: { id: "stock_sniper", name: "股市狙擊手", description: "單局股票盈利超過3000", icon: "TrendingUp", category: "wealth", rarity: "rare", points: 20 },
  jailbird: { id: "jailbird", name: "監獄常客", description: "單局進入禁閉區3次以上", icon: "Lock", category: "special", rarity: "common", points: 10, target: 3 },
  fate_favorite: { id: "fate_favorite", name: "命運寵兒", description: "單局抽到5張以上命運/機會卡", icon: "Sparkles", category: "beginner", rarity: "common", points: 10, target: 5 },
  trade_master: { id: "trade_master", name: "交易達人", description: "單局完成3次以上交易", icon: "Handshake", category: "wealth", rarity: "rare", points: 20, target: 3 },
  auction_hunter: { id: "auction_hunter", name: "拍賣獵手", description: "單局通過拍賣獲得2塊以上地塊", icon: "Gavel", category: "wealth", rarity: "rare", points: 20, target: 2 },
  rags_to_riches: { id: "rags_to_riches", name: "白手起家", description: "資金低於1000後最終獲勝", icon: "Coins", category: "special", rarity: "epic", points: 40 },
  perfect_victory: { id: "perfect_victory", name: "完美勝利", description: "對手破產時自己資金超過20000", icon: "Crown", category: "wealth", rarity: "epic", points: 30 },
  beginner: { id: "beginner", name: "初學者", description: "完成新手教學", icon: "GraduationCap", category: "beginner", rarity: "common", points: 5 },
  item_collector: { id: "item_collector", name: "道具收藏家", description: "單局使用5個以上道具", icon: "Backpack", category: "collection", rarity: "common", points: 10, target: 5 },
  gambler: { id: "gambler", name: "賭神", description: "迷你遊戲累計獲勝3次以上", icon: "Dices", category: "special", rarity: "rare", points: 20, target: 3 },
  chosen_one: { id: "chosen_one", name: "天選之人", description: "單局遇到3次以上晴天", icon: "Sun", category: "special", rarity: "rare", points: 20, target: 3 },
  battle_royale_champion: { id: "battle_royale_champion", name: "大逃殺冠軍", description: "贏一局大逃殺模式", icon: "Skull", category: "mode", rarity: "epic", points: 30 },
  shrink_survivor: { id: "shrink_survivor", name: "縮圈倖存者", description: "存活到最終決戰階段", icon: "Flame", category: "mode", rarity: "rare", points: 20 },
  asset_millionaire: { id: "asset_millionaire", name: "資產大亨", description: "單局總資產突破 50000", icon: "Coins", category: "wealth", rarity: "epic", points: 30 },
  asset_100k: { id: "asset_100k", name: "百萬富翁", description: "單局總資產突破 100000", icon: "Crown", category: "wealth", rarity: "legendary", points: 50 },
  first_match: { id: "first_match", name: "初入戰場", description: "完成第一局對戰", icon: "Swords", category: "beginner", rarity: "common", points: 5 },
  first_property: { id: "first_property", name: "第一塊地", description: "首次購買地產", icon: "Home", category: "beginner", rarity: "common", points: 5 },
  first_building: { id: "first_building", name: "動土儀式", description: "首次建造房屋", icon: "Hammer", category: "beginner", rarity: "common", points: 5 },
  first_card_draw: { id: "first_card_draw", name: "命運轉盤", description: "首次抽取命運/機會卡", icon: "Sparkles", category: "beginner", rarity: "common", points: 5 },
  wealth_10k: { id: "wealth_10k", name: "萬元戶", description: "總資產達到 10,000", icon: "Wallet", category: "wealth", rarity: "common", points: 10 },
  wealth_50k: { id: "wealth_50k", name: "五萬富翁", description: "總資產達到 50,000", icon: "Landmark", category: "wealth", rarity: "rare", points: 20 },
  wealth_100k_single: { id: "wealth_100k_single", name: "十萬俱樂部", description: "單局資產達到 100,000", icon: "Crown", category: "wealth", rarity: "epic", points: 30 },
  profit_per_match_10k: { id: "profit_per_match_10k", name: "單局盈利過萬", description: "單局淨盈利超過 10,000", icon: "TrendingUp", category: "wealth", rarity: "rare", points: 20 },
  win_streak_3: { id: "win_streak_3", name: "三連勝", description: "連續獲勝 3 局", icon: "Flame", category: "streak", rarity: "common", points: 15, target: 3 },
  win_streak_5: { id: "win_streak_5", name: "五連勝", description: "連續獲勝 5 局", icon: "Flame", category: "streak", rarity: "rare", points: 25, target: 5 },
  win_streak_10: { id: "win_streak_10", name: "十連勝", description: "連續獲勝 10 局", icon: "Flame", category: "streak", rarity: "epic", points: 40, target: 10 },
  win_streak_20: { id: "win_streak_20", name: "二十連勝", description: "連續獲勝 20 局", icon: "Zap", category: "streak", rarity: "legendary", points: 80, target: 20 },
  mode_classic_win: { id: "mode_classic_win", name: "經典王者", description: "贏一局經典模式", icon: "Target", category: "mode", rarity: "common", points: 10 },
  mode_speed_win: { id: "mode_speed_win", name: "閃電快手", description: "贏一局快速模式", icon: "Zap", category: "mode", rarity: "common", points: 10 },
  mode_crazy_win: { id: "mode_crazy_win", name: "瘋狂玩家", description: "贏一局瘋狂模式", icon: "Skull", category: "mode", rarity: "rare", points: 20 },
  mode_battle_royale_win: { id: "mode_battle_royale_win", name: "吃雞達人", description: "贏一局大逃殺模式", icon: "Crosshair", category: "mode", rarity: "epic", points: 30 },
  mode_all_master: { id: "mode_all_master", name: "全模式制霸", description: "在所有模式中各贏一局", icon: "Award", category: "mode", rarity: "legendary", points: 60 },
  profession_all_used: { id: "profession_all_used", name: "職業體驗家", description: "使用過全部職業", icon: "Briefcase", category: "profession", rarity: "epic", points: 30 },
  profession_each_win: { id: "profession_each_win", name: "行行出狀元", description: "每個職業各贏一局", icon: "Medal", category: "profession", rarity: "legendary", points: 50 },
  collect_all_cards: { id: "collect_all_cards", name: "卡牌大師", description: "收集全部卡牌", icon: "Swords", category: "collection", rarity: "epic", points: 30 },
  collect_all_items: { id: "collect_all_items", name: "道具大全", description: "收集全部道具", icon: "Package", category: "collection", rarity: "rare", points: 25 },
  collect_all_themes: { id: "collect_all_themes", name: "主題收藏家", description: "收集全部主題", icon: "Palette", category: "collection", rarity: "epic", points: 35 },
  collect_all_skins: { id: "collect_all_skins", name: "時尚達人", description: "收集全部皮膚", icon: "Shirt", category: "collection", rarity: "legendary", points: 50 },
  friend_10: { id: "friend_10", name: "交友廣闊", description: "添加 10 個好友", icon: "Users", category: "social", rarity: "rare", points: 20, target: 10 },
  create_guild: { id: "create_guild", name: "開山立派", description: "創建戰隊", icon: "Shield", category: "social", rarity: "epic", points: 30 },
  guild_quest_complete: { id: "guild_quest_complete", name: "戰隊先鋒", description: "完成一次戰隊任務", icon: "Flag", category: "social", rarity: "rare", points: 25 },
  bankruptcy_comeback: { id: "bankruptcy_comeback", name: "破產逆轉", description: "面臨破產後逆轉獲勝", icon: "RotateCcw", category: "special", rarity: "legendary", points: 60 },
  zero_property_win: { id: "zero_property_win", name: "零地產獲勝", description: "不擁有任何地產卻贏得比賽", icon: "XCircle", category: "special", rarity: "epic", points: 40 },
  triple_double_jail: { id: "triple_double_jail", name: "三連雙骰進監獄", description: "連續三次雙骰被送進禁閉區", icon: "Lock", category: "special", rarity: "rare", points: 20 },
  freeze_master: { id: "freeze_master", name: "寒冰指揮官", description: "單場冰凍對手 3 次以上", icon: "Snowflake", category: "special", rarity: "rare", points: 20, target: 3 },
  lottery_winner: { id: "lottery_winner", name: "幸運彩票王", description: "單場中彩票累計盈利 2000 元", icon: "Ticket", category: "wealth", rarity: "epic", points: 30, target: 2000 },
  item_tycoon: { id: "item_tycoon", name: "道具大亨", description: "單場購買 5 個以上道具", icon: "ShoppingBag", category: "collection", rarity: "rare", points: 20, target: 5 },
  dynasty_builder: { id: "dynasty_builder", name: "王朝締造者", description: "在金融王朝模式中贏得勝利", icon: "Crown", category: "mode", rarity: "legendary", points: 50 },
  casino_highroller: { id: "casino_highroller", name: "賭城豪客", description: "在霓虹賭城模式中賭場淨盈利超過 3000 元", icon: "Dices", category: "mode", rarity: "epic", points: 30, target: 3000 },
  sniper_pro: { id: "sniper_pro", name: "頂尖狙擊手", description: "單場以攻擊道具擊潰對手 3 次", icon: "Crosshair", category: "special", rarity: "epic", points: 30, target: 3 },
  bounty_hunter: { id: "bounty_hunter", name: "賞金獵人", description: "單場從對手收取過路費累計 5000 元", icon: "Target", category: "wealth", rarity: "rare", points: 25, target: 5000 },
  card_combo_master: { id: "card_combo_master", name: "卡牌連鎖大師", description: "單場觸發 3 次以上卡牌連鎖", icon: "Layers", category: "special", rarity: "rare", points: 20, target: 3 },
  global_event_survivor: { id: "global_event_survivor", name: "亂世倖存者", description: "在經歷 5 次以上全球事件後依然獲勝", icon: "Shield", category: "mode", rarity: "epic", points: 30 },
  set_duke: { id: "set_duke", name: "成套公爵", description: "單場集齊 5 個以上成套地產", icon: "Gem", category: "wealth", rarity: "epic", points: 30, target: 5 },
  penny_pincher: { id: "penny_pincher", name: "守財奴", description: "單場結束時持有現金超過 30000 元", icon: "PiggyBank", category: "wealth", rarity: "legendary", points: 40, target: 30000 },
  swap_artist: { id: "swap_artist", name: "交換大師", description: "單場交換位置或資金 3 次以上", icon: "Repeat", category: "special", rarity: "rare", points: 20, target: 3 },
  quantum_wanderer: { id: "quantum_wanderer", name: "量子漫遊者", description: "單場傳送/跳躍移動 10 次以上", icon: "Atom", category: "special", rarity: "epic", points: 30, target: 10 },
  // ===== v3.0 新增成就 =====
  stock_frenzy_champion: { id: "stock_frenzy_champion", name: "股市操盤王者", description: "贏一局股市狂潮模式", icon: "LineChart", category: "mode", rarity: "epic", points: 30 },
  black_market_tycoon: { id: "black_market_tycoon", name: "黑市軍火大王", description: "贏一局黑市軍火賽模式", icon: "Package", category: "mode", rarity: "epic", points: 30 },
  twin_strike_veteran: { id: "twin_strike_veteran", name: "雙子星老兵", description: "贏一局雙子星陣營戰", icon: "Users", category: "mode", rarity: "rare", points: 20 },
  item_armory: { id: "item_armory", name: "道具軍火庫", description: "單場持有過 8 個不同道具", icon: "Backpack", category: "collection", rarity: "epic", points: 30, target: 8 },
  netrunner_legend: { id: "netrunner_legend", name: "傳說網路行者", description: "以網路行者職業贏得一局", icon: "Terminal", category: "profession", rarity: "epic", points: 30 },
  medic_angel: { id: "medic_angel", name: "絕地醫護", description: "以賽博醫護職業在生存模式存活到最後", icon: "Stethoscope", category: "profession", rarity: "epic", points: 30 },
  broker_pro: { id: "broker_pro", name: "頂尖操盤手", description: "以操盤手職業單場股票盈利超過 4000", icon: "TrendingUp", category: "profession", rarity: "rare", points: 20, target: 4000 },
  airdrop_grateful: { id: "airdrop_grateful", name: "星空補給員", description: "單場領取 3 次以上衛星空投", icon: "Satellite", category: "special", rarity: "common", points: 15, target: 3 },
  chip_mogul: { id: "chip_mogul", name: "晶片巨頭", description: "單場股票總值突破 15000", icon: "Cpu", category: "wealth", rarity: "epic", points: 35, target: 15000 },
  survival_master: { id: "survival_master", name: "生存大師", description: "贏一局生存模式", icon: "HeartPulse", category: "mode", rarity: "legendary", points: 50 },
  emperor_crowned: { id: "emperor_crowned", name: "登基稱帝", description: "贏一局皇帝模式", icon: "Crown", category: "mode", rarity: "epic", points: 30 },
  race_finisher: { id: "race_finisher", name: "完賽選手", description: "贏一局競速模式", icon: "Flag", category: "mode", rarity: "rare", points: 20 },
};

export const ACHIEVEMENT_IDS: AchievementId[] = [
  "first_win",
  "property_tycoon",
  "building_magnate",
  "hotel_king",
  "set_collector",
  "stock_sniper",
  "jailbird",
  "fate_favorite",
  "trade_master",
  "auction_hunter",
  "rags_to_riches",
  "perfect_victory",
  "beginner",
  "item_collector",
  "gambler",
  "chosen_one",
  "battle_royale_champion",
  "shrink_survivor",
  "asset_millionaire",
  "asset_100k",
  "first_match",
  "first_property",
  "first_building",
  "first_card_draw",
  "wealth_10k",
  "wealth_50k",
  "wealth_100k_single",
  "profit_per_match_10k",
  "win_streak_3",
  "win_streak_5",
  "win_streak_10",
  "win_streak_20",
  "mode_classic_win",
  "mode_speed_win",
  "mode_crazy_win",
  "mode_battle_royale_win",
  "mode_all_master",
  "profession_all_used",
  "profession_each_win",
  "collect_all_cards",
  "collect_all_items",
  "collect_all_themes",
  "collect_all_skins",
  "friend_10",
  "create_guild",
  "guild_quest_complete",
  "bankruptcy_comeback",
  "zero_property_win",
  "triple_double_jail",
  // v3.0 新增成就
  "stock_frenzy_champion",
  "black_market_tycoon",
  "twin_strike_veteran",
  "item_armory",
  "netrunner_legend",
  "medic_angel",
  "broker_pro",
  "airdrop_grateful",
  "chip_mogul",
  "survival_master",
  "emperor_crowned",
  "race_finisher",
];

// ========== 道具配置 ==========

export const ITEMS: Record<ItemType, ItemConfig> = {
  double_dice: {
    type: "double_dice",
    name: "双倍骰",
    description: "下次掷骰时，两个骰子都为最大值6",
    price: 1500,
    icon: "骰子",
  },
  teleport: {
    type: "teleport",
    name: "传送卡",
    description: "传送到指定地块，不触发落地事件",
    price: 2000,
    icon: "星光",
  },
  steal_property: {
    type: "steal_property",
    name: "掠夺卡",
    description: "偷取对手一块地价不超过2000的无建筑地产",
    price: 3000,
    icon: "卡牌",
  },
  shield: {
    type: "shield",
    name: "护盾",
    description: "抵挡接下来3次过路费",
    price: 1200,
    icon: "護盾",
  },
  free_pass: {
    type: "free_pass",
    name: "免费过路卡",
    description: "接下来1次踩对手地块免过路费",
    price: 2500,
    icon: "門票",
  },
  remote_dice: {
    type: "remote_dice",
    name: "遥控骰子",
    description: "下一次掷骰子时，可以自己选择两个骰子的点数（2-12之间任意组合）",
    price: 1000,
    icon: "控制台",
  },
  bomb: {
    type: "bomb",
    name: "炸彈",
    description: "摧毀對手一棟建築（房屋降級）",
    price: 2500,
    icon: "炸彈",
  },
  invisibility: {
    type: "invisibility",
    name: "隱身藥水",
    description: "3回合內不收也不付過路費",
    price: 3000,
    icon: "幽靈",
  },
  time_machine: {
    type: "time_machine",
    name: "時光機",
    description: "回到上回合的位置（不觸發落地事件）",
    price: 2000,
    icon: "鬧鐘",
  },
  money_tree: {
    type: "money_tree",
    name: "金錢樹",
    description: "每回合+200元，持續5回合",
    price: 1500,
    icon: "錢樹",
  },
  x_ray: {
    type: "x_ray",
    name: "透視鏡",
    description: "查看下一張命運/機會卡",
    price: 800,
    icon: "水晶球",
  },
  clone_dice: {
    type: "clone_dice",
    name: "克隆骰",
    description: "複製上一次擲骰的點數",
    price: 1800,
    icon: "標靶",
  },
  time_travel: {
    type: "time_travel",
    name: "時間旅行",
    description: "回到上回合的位置與金錢狀態（地產變化保留），每局限用1次",
    price: 5000,
    icon: "漩渦",
  },
  hacker_backdoor: {
    type: "hacker_backdoor",
    name: "駭客後門",
    description: "下次購買地產享 8 折優惠",
    price: 1200,
    icon: "後門",
  },
  emp_pulse: {
    type: "emp_pulse",
    name: "電磁脈衝",
    description: "令指定對手下一回合無法行動",
    price: 2000,
    icon: "閃電",
  },
  stealth_cloak: {
    type: "stealth_cloak",
    name: "隱形光學迷彩",
    description: "3 回合內經過對手地產不付過路費",
    price: 2800,
    icon: "電子眼",
  },
  drone_scout: {
    type: "drone_scout",
    name: "無人機偵察",
    description: "立即獲得 200 元情報津貼",
    price: 500,
    icon: "衛星",
  },
  quantum_portal: {
    type: "quantum_portal",
    name: "量子傳送門",
    description: "傳送到指定地塊，不觸發落地事件",
    price: 2200,
    icon: "漩渦",
  },
  credit_voucher: {
    type: "credit_voucher",
    name: "信用點券",
    description: "立即獲得 1000 元現金",
    price: 800,
    icon: "信用卡",
  },
  time_pocket_watch: {
    type: "time_pocket_watch",
    name: "時光懷錶",
    description: "取消本回合剛擲出的結果並重擲一次",
    price: 1800,
    icon: "秒錶",
  },
  electronic_contract: {
    type: "electronic_contract",
    name: "電子契約",
    description: "下次購買地產享 7 折優惠（與駭客後門互斥，取最低折扣）",
    price: 1500,
    icon: "契約",
  },
  energy_shield: {
    type: "energy_shield",
    name: "能量護盾",
    description: "抵擋下一次應支付的過路費（一次性）",
    price: 1000,
    icon: "護盾",
  },
  data_courier: {
    type: "data_courier",
    name: "數據快遞",
    description: "立即從銀行獲得 500 元現金",
    price: 400,
    icon: "快遞",
  },
  fake_id: {
    type: "fake_id",
    name: "偽身份證",
    description: "下次應被送入監禁時自動豁免（一次性）",
    price: 1200,
    icon: "身份證",
  },
  freeze_ray: {
    type: "freeze_ray",
    name: "冰凍射線",
    description: "指定一名對手，使其下一回合無法行動",
    price: 1800,
    icon: "雪花",
  },
  swap_portal: {
    type: "swap_portal",
    name: "互換傳送門",
    description: "與指定對手交換當前所在位置",
    price: 1600,
    icon: "傳送門",
  },
  golden_passport: {
    type: "golden_passport",
    name: "金色護照",
    description: "立即免費出獄（若在監禁中），並清除一次監禁記錄",
    price: 1400,
    icon: "護照",
  },
  data_backup: {
    type: "data_backup",
    name: "數據備份",
    description: "自動抵消下一次負面金錢效果（一次性護盾）",
    price: 1500,
    icon: "備份",
  },
  loaded_dice: {
    type: "loaded_dice",
    name: "灌鉛骰子",
    description: "下次擲骰指定總點數（4~10 之間）",
    price: 1300,
    icon: "骰子",
  },
  ransomware: {
    type: "ransomware",
    name: "勒索病毒",
    description: "向最富有的對手勒索 800 元（若對手現金足夠）",
    price: 1700,
    icon: "病毒",
  },
  toll_magnet: {
    type: "toll_magnet",
    name: "過路費磁吸",
    description: "下次收取過路費時收入翻倍",
    price: 1900,
    icon: "磁鐵",
  },
  lucky_coin: {
    type: "lucky_coin",
    name: "幸運硬幣",
    description: "立即獲得一次 50/50 的賭局：50% 賺 1000，50% 賠 500",
    price: 900,
    icon: "硬幣",
  },
  // ===== v3.0 新增道具 =====
  overclock_shield: {
    type: "overclock_shield",
    name: "動能護盾",
    description: "疊加 5 層過路費免疫護盾（比一般護盾更厚）",
    price: 2000,
    icon: "護盾",
  },
  cash_injection: {
    type: "cash_injection",
    name: "現金注入",
    description: "銀行紧急注資，立即獲得 1500 元",
    price: 1200,
    icon: "鈔票",
  },
  emp_gun: {
    type: "emp_gun",
    name: "脈衝手槍",
    description: "指定一名對手，使其下回合跳過行動",
    price: 2200,
    icon: "電擊",
  },
  land_bomb: {
    type: "land_bomb",
    name: "離岸鑽彈",
    description: "摧毀對手一棟建築（可指定任意對手地塊）",
    price: 2800,
    icon: "炸彈",
  },
  money_tree_plus: {
    type: "money_tree_plus",
    name: "黃金錢樹",
    description: "未來 8 回合每回合 +200 元被動收入（更持久的金錢樹）",
    price: 2600,
    icon: "錢樹",
  },
  ghost_protocol: {
    type: "ghost_protocol",
    name: "鬼影協議",
    description: "5 回合內隱身，不收也不付過路費",
    price: 3600,
    icon: "幽靈",
  },
  buy_coupon: {
    type: "buy_coupon",
    name: "採購優惠券",
    description: "下次購買地產享 7 折優惠",
    price: 1800,
    icon: "票券",
  },
  loot_drone: {
    type: "loot_drone",
    name: "掠奪無人機",
    description: "從現金最多的對手處掠奪 500 元",
    price: 2400,
    icon: "無人機",
  },
  warp_token: {
    type: "warp_token",
    name: "躍遷幣",
    description: "向前躍遷 6 格，並觸發落地事件",
    price: 1600,
    icon: "星光",
  },
  heal_synth: {
    type: "heal_synth",
    name: "奈米修復倉",
    description: "生存模式回復 30 點生命；其他模式變現 900 元",
    price: 1500,
    icon: "醫療",
  },
};

export const ITEM_TYPES: ItemType[] = [
  "double_dice",
  "teleport",
  "steal_property",
  "shield",
  "free_pass",
  "remote_dice",
  "bomb",
  "invisibility",
  "time_machine",
  "money_tree",
  "x_ray",
  "clone_dice",
  "time_travel",
  "hacker_backdoor",
  "emp_pulse",
  "stealth_cloak",
  "drone_scout",
  "quantum_portal",
  "credit_voucher",
  "time_pocket_watch",
  "electronic_contract",
  "energy_shield",
  "data_courier",
  "fake_id",
  "freeze_ray",
  "swap_portal",
  "golden_passport",
  "data_backup",
  "loaded_dice",
  "ransomware",
  "toll_magnet",
  "lucky_coin",
  // v3.0 新增道具
  "overclock_shield",
  "cash_injection",
  "emp_gun",
  "land_bomb",
  "money_tree_plus",
  "ghost_protocol",
  "buy_coupon",
  "loot_drone",
  "warp_token",
  "heal_synth",
];

export const BAIL_AMOUNT = 500;

export const MAX_ITEMS = 3;

// ========== 地產升級路線配置 ==========

export const PROPERTY_UPGRADE_PATHS: Record<PropertyUpgradePath, PropertyUpgradePathConfig> = {
  attack: {
    id: 'attack',
    name: '攻擊路線',
    description: '強化收租火力，過路費大幅提升，但建築升級成本增加',
    color: 'hsl(0, 100%, 60%)',
    tollBonus: 0.5,
    buildingCostMultiplier: 1.2,
  },
  defense: {
    id: 'defense',
    name: '防禦路線',
    description: '穩健現金流，過路費溫和提升，自己經過時額外獲得被動收入',
    color: 'hsl(180, 100%, 50%)',
    tollBonus: 0.2,
    buildingCostMultiplier: 1.0,
    passiveIncomePerPass: 50,
  },
  tech: {
    id: 'tech',
    name: '科技路線',
    description: '數據感染，過路費中等提升，停留的對手有概率被感染跳過下回合',
    color: 'hsl(270, 80%, 60%)',
    tollBonus: 0.3,
    buildingCostMultiplier: 1.0,
    infectionChance: 0.2,
  },
};

export const UPGRADE_PATH_UNLOCK_LEVEL: BuildingLevel = 3;

// ========== 聯盟系統配置 ==========

export const ALLIANCE_BREAK_PENALTY = 500; // 違約金

// ========== 黑市拍賣配置 ==========

export const BLACK_MARKET_INTERVAL = 10; // 每10回合觸發
export const BLACK_MARKET_ITEM_COUNT = 3; // 每次拍賣3件道具
export const BLACK_MARKET_START_PRICE = 300; // 起拍價
export const BLACK_MARKET_BID_DURATION = 20; // 出價時長（秒）

// 黑市稀有道具池
export const BLACK_MARKET_ITEM_POOL: ItemType[] = [
  'quantum_portal',
  'time_travel',
  'steal_property',
  'money_tree',
  'clone_dice',
  'electronic_contract',
  'energy_shield',
  'hacker_backdoor',
  'emp_pulse',
];

// ========== NPC 配置 ==========

export const NPC_CONFIG: Record<NpcType, { name: string; description: string; icon: string }> = {
  wanderer: {
    name: '流浪商人',
    description: '以 1.5 倍價格購入稀有道具',
    icon: 'ShoppingBag',
  },
  hacker: {
    name: '駭客',
    description: '花 $1000 偷取對手情報（查看資產/現金）',
    icon: 'UserSearch',
  },
};

export const NPC_MOVE_INTERVAL = 3; // 每3回合 NPC 移動一次

// ========== 季節系統配置 ==========

export const SEASONS: Record<SeasonType, {
  name: string;
  description: string;
  color: string;  // 霓虹色
  icon: string;   // emoji 或圖示名
}> = {
  spring: { name: '春', description: '買地 -10%，萬物復甦', color: 'var(--green)', icon: '春' },
  summer: { name: '夏', description: '路費 +20%，酷暑難耐', color: 'var(--pink)', icon: '夏' },
  autumn: { name: '秋', description: '收益 +15%，收穫季節', color: 'hsl(30, 100%, 60%)', icon: '秋' },
  winter: { name: '冬', description: '移動 -1 格、建房 +20%', color: 'var(--cyan)', icon: '冬' },
};

export const SEASON_CHANGE_INTERVAL = 5; // 每5回合換季

export const SEASON_TYPES: SeasonType[] = ['spring', 'summer', 'autumn', 'winter'];

// ========== 災難系統配置 ==========

export const DISASTERS: Record<DisasterType, {
  name: string;
  description: string;
  color: string;
}> = {
  earthquake: { name: '地震', description: '隨機摧毀 2 棟建築', color: 'var(--orange)' },
  fire: { name: '火災', description: '單塊地建築全毀', color: 'var(--red)' },
  flood: { name: '洪水', description: '一整排地 3 回合不可收費', color: 'var(--blue)' },
};

export const DISASTER_INTERVAL = 10;  // 每10回合判定一次
export const DISASTER_PROBABILITY = 0.1;  // 10% 概率

export const DISASTER_TYPES: DisasterType[] = ['earthquake', 'fire', 'flood'];

// ========== 天气配置 ==========

export const WEATHERS: Record<WeatherType, WeatherConfig> = {
  sunny: {
    type: "sunny",
    name: "晴天",
    icon: "晴天",
    description: "阳光明媚，起点奖励+20%",
  },
  rain: {
    type: "rain",
    name: "暴雨",
    icon: "暴雨",
    description: "暴雨倾盆，所有过路费×1.3",
  },
  fog: {
    type: "fog",
    name: "雾霾",
    icon: "濃霧",
    description: "能见度低，移动步数-1（最低1步）",
  },
  em_storm: {
    type: "em_storm",
    name: "电磁风暴",
    icon: "閃電",
    description: "电磁干扰，命运/机会卡金钱效果×2，移动效果翻倍",
  },
  neon_night: {
    type: "neon_night",
    name: "霓虹夜",
    icon: "星夜",
    description: "夜色璀璨，买地/建房打8折",
  },
  space_calm: {
    type: "space_calm",
    name: "太空宁静",
    icon: "星光",
    description: "无特殊效果，所有玩家每回合恢复100元",
  },
};

export const WEATHER_TYPES: WeatherType[] = [
  "sunny",
  "rain",
  "fog",
  "em_storm",
  "neon_night",
  "space_calm",
];

export const WEATHER_WEIGHTS: Record<WeatherType, number> = {
  sunny: 25,
  rain: 20,
  fog: 15,
  em_storm: 15,
  neon_night: 15,
  space_calm: 10,
};

// ========== 迷你游戏配置 ==========

export const MINIGAME_TYPES: MiniGameType[] = [
  "slot_machine",
  "blackjack",
  "guess_number",
  "memory_match",
  "rhythm_master",
  "shooting_challenge",
  "data_miner",
  "firewall_breach",
  "cyber_racer",
  "auction_master",
];

export const MINIGAME_NAMES: Record<MiniGameType, string> = {
  slot_machine: "霓虹老虎机",
  blackjack: "赛博21点",
  guess_number: "猜大小",
  memory_match: "記憶翻牌",
  rhythm_master: "節奏大師",
  shooting_challenge: "射擊挑戰",
  data_miner: "數據挖掘",
  firewall_breach: "防火牆突破",
  cyber_racer: "賽博賽車",
  auction_master: "拍賣大師",
};

// ========== 合作模式队伍配置 ==========

export const TEAM_CONFIGS: Record<TeamId, { name: string; color: string }> = {
  red: { name: '红队', color: '#ff4757' },
  blue: { name: '蓝队', color: '#3742fa' },
};

export const COOP_TEAM_ASSIGNMENT: Record<number, TeamId> = {
  0: 'red',
  1: 'blue',
  2: 'red',
  3: 'blue',
};

// ========== 大逃杀模式配置 ==========

export const BOARD_SIDES: Record<BoardSide, number[]> = {
  bottom: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  right: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  top: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
  left: [27, 28, 29, 30, 31, 32, 33, 34, 35, 0],
};

export const BATTLE_ROYALE_SHRINK_INTERVAL = 3;
export const BATTLE_ROYALE_FINAL_BATTLE_CELLS = 4;
export const BATTLE_ROYALE_POISON_DAMAGE = 500;
export const BATTLE_ROYALE_TOLL_MULTIPLIER = 2;

// ========== 贷款系统配置 ==========

export const LOAN_MAX = 5000;      // 贷款上限
export const LOAN_INTEREST_RATE = 0.05; // 每回合利息率5%
export const SAVINGS_INTEREST_RATE = 0.02; // 存款每回合利息率2%

// ========== 通货膨胀系统配置 ==========

export const INFLATION_INITIAL_RATE = 1.0;
export const INFLATION_INTERVAL = 10;  // 每10回合涨一次
export const INFLATION_STEP = 0.1;     // 每次涨10%
export const INFLATION_MAX = 3.0;      // 通脹上限 300%

// ========== 保险系统配置 ==========

export const INSURANCE_RATE = 0.05; // 保费率 = 地价的 5%

// ========== 债券系统配置 ==========

export const BOND_MIN_AMOUNT = 1000;
export const BOND_MAX_AMOUNT = 5000;
export const BOND_MIN_INTEREST = 0.10;
export const BOND_MAX_INTEREST = 0.30;
export const BOND_MIN_TURNS = 5;
export const BOND_MAX_TURNS = 20;

// ========== 每日挑战配置 ==========

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'fate_only',
    type: 'fate_only',
    name: '命運輪盤',
    description: '每回合強制抽一張命運卡，未知與刺激並存',
    rules: ['每回合強制抽取命運卡', '過路費照常計算', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500, item: 'lucky_charm' },
  },
  {
    id: 'double_move',
    type: 'double_move',
    name: '疾風奔馳',
    description: '擲骰點數翻倍，節奏超快',
    rules: ['擲骰點數 × 2', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500 },
  },
  {
    id: 'slums',
    type: 'slums',
    name: '貧民窟',
    description: '起始金錢僅1000，考驗經營能力',
    rules: ['起始金錢 $1000', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500, item: 'money_bag' },
  },
  {
    id: 'double_rent',
    type: 'double_rent',
    name: '地價翻倍',
    description: '所有地價與過路費翻倍',
    rules: ['地價 × 2', '過路費 × 2', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500 },
  },
  {
    id: 'no_building',
    type: 'no_building',
    name: '無建築時代',
    description: '不能建造房屋與酒店，純靠地塊取勝',
    rules: ['禁止建造房屋/酒店', '過路費按基礎計算', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500, item: 'shield' },
  },
  {
    id: 'speed_15',
    type: 'speed_15',
    name: '閃電對決',
    description: '15回合定勝負，資產最多者獲勝',
    rules: ['僅有15回合', '回合結束後資產最多者獲勝', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500 },
  },
  {
    id: 'all_random',
    type: 'all_random',
    name: '混沌之地',
    description: '隨機地圖 + 隨機天氣 + 隨機事件',
    rules: ['隨機生成地圖', '每回合隨機天氣', '其他規則同經典模式'],
    reward: { exp: 100, coins: 500, item: 'mystery_box' },
  },
];

// ========== 賽季通行證配置 ==========

export const BATTLE_PASS_EXP_PER_LEVEL = 100;
export const BATTLE_PASS_MAX_LEVEL = 50;

// ========== 技能树系统 ==========

export const SKILL_IDS: SkillId[] = [
  'buy_discount',
  'toll_bonus',
  'lucky_draw',
  'jail_master',
  'build_master',
  'wealth_sense',
];

export const SKILLS: Record<SkillId, SkillConfig> = {
  buy_discount: {
    id: 'buy_discount',
    name: '買地折扣',
    description: '購買地產時享受折扣',
    icon: 'Landmark',
    maxLevel: 3,
    effects: [
      { level: 1, value: 0.05, description: '買地 -5%' },
      { level: 2, value: 0.10, description: '買地 -10%' },
      { level: 3, value: 0.15, description: '買地 -15%' },
    ],
  },
  toll_bonus: {
    id: 'toll_bonus',
    name: '過路費加成',
    description: '收取的過路費增加',
    icon: 'Coins',
    maxLevel: 3,
    effects: [
      { level: 1, value: 0.10, description: '過路費 +10%' },
      { level: 2, value: 0.20, description: '過路費 +20%' },
      { level: 3, value: 0.30, description: '過路費 +30%' },
    ],
  },
  lucky_draw: {
    id: 'lucky_draw',
    name: '抽卡幸運',
    description: '抽取命運/機會卡時有概率重抽，取較好結果',
    icon: 'Sparkles',
    maxLevel: 3,
    effects: [
      { level: 1, value: 0.10, description: '重抽概率 10%' },
      { level: 2, value: 0.20, description: '重抽概率 20%' },
      { level: 3, value: 0.30, description: '重抽概率 30%' },
    ],
  },
  jail_master: {
    id: 'jail_master',
    name: '越獄大師',
    description: '進入監獄時有概率直接越獄',
    icon: 'ShieldAlert',
    maxLevel: 3,
    effects: [
      { level: 1, value: 0.15, description: '越獄概率 15%' },
      { level: 2, value: 0.30, description: '越獄概率 30%' },
      { level: 3, value: 0.50, description: '越獄概率 50%' },
    ],
  },
  build_master: {
    id: 'build_master',
    name: '建房達人',
    description: '建造房屋/酒店享受折扣',
    icon: 'Hammer',
    maxLevel: 3,
    effects: [
      { level: 1, value: 0.10, description: '建房 -10%' },
      { level: 2, value: 0.20, description: '建房 -20%' },
      { level: 3, value: 0.30, description: '建房 -30%' },
    ],
  },
  wealth_sense: {
    id: 'wealth_sense',
    name: '財富嗅覺',
    description: '經過起點時獲得額外獎金',
    icon: 'Banknote',
    maxLevel: 3,
    effects: [
      { level: 1, value: 50, description: '起點獎勵 +$50' },
      { level: 2, value: 100, description: '起點獎勵 +$100' },
      { level: 3, value: 150, description: '起點獎勵 +$150' },
    ],
  },
};

export const SKILL_POINT_INTERVAL = 5; // 每5回合獲得1技能點

export function getInitialSkillTree(): Record<SkillId, number> {
  const tree: Record<string, number> = {};
  for (const id of SKILL_IDS) {
    tree[id] = 0;
  }
  return tree as Record<SkillId, number>;
}

export function getSkillValue(skillTree: Record<SkillId, number> | undefined, skillId: SkillId): number {
  if (!skillTree) return 0;
  const level = skillTree[skillId] ?? 0;
  if (level <= 0) return 0;
  const config = SKILLS[skillId];
  const effect = config.effects.find((e: { level: number }) => e.level === level);
  return effect?.value ?? 0;
}

// ========== 任務系統 ==========

export const MISSION_POOL: Omit<Mission, 'progress' | 'completed' | 'claimed' | 'id' | 'completedBy'>[] = [
  { type: 'buy_properties', name: '地產大亨', description: '購買 3 塊地產', target: 3, reward: 1000 },
  { type: 'complete_set', name: '套裝收藏家', description: '湊齊一套同色套裝', target: 1, reward: 2000 },
  { type: 'go_to_jail', name: '越獄專業戶', description: '進入監獄 2 次', target: 2, reward: 500 },
  { type: 'build_houses', name: '建築大亨', description: '建造 5 棟房屋', target: 5, reward: 1500 },
  { type: 'stock_profit', name: '股市獵人', description: '股票盈利累計達 2000', target: 2000, reward: 1000 },
  { type: 'win_minigame', name: '遊戲高手', description: '贏得 2 次迷你遊戲', target: 2, reward: 800 },
  { type: 'pay_toll', name: '過路達人', description: '累計支付過路費超 3000', target: 3000, reward: 600 },
  { type: 'pass_start', name: '馬拉松選手', description: '經過起點 5 次', target: 5, reward: 700 },
];

export const SPECIAL_BUILDINGS: Record<SpecialBuildingType, SpecialBuildingConfig> = {
  mall: {
    type: "mall",
    name: "商場",
    description: "過路費 +50%",
    cost: 5000,
    icon: "Building2",
  },
  factory: {
    type: "factory",
    name: "工廠",
    description: "周邊 2 格的過路費 -20%（影響所有玩家）",
    cost: 4000,
    icon: "Factory",
  },
  lab: {
    type: "lab",
    name: "實驗室",
    description: "每回合隨機觸發：獲得 500 / 失去 300 / 隨機傳送",
    cost: 6000,
    icon: "FlaskConical",
  },
};

export const MISSIONS_PER_GAME = 3;

export const BATTLE_PASS_SEASON_DAYS = 30;

export const BATTLE_PASS_SEASON_NAME = '霓虹覺醒';

function generateBattlePassRewards(): BattlePassReward[] {
  const rewards: BattlePassReward[] = [];

  const freePattern: Array<(level: number) => BattlePassReward['free']> = [
    (lvl) => ({ type: 'coin', value: 80 + lvl * 5, name: `遊戲幣 x${80 + lvl * 5}`, amount: 80 + lvl * 5, rarity: 'common' }),
    (lvl) => ({ type: 'item', value: 'lucky_card', name: '幸運卡 x1', amount: 1, rarity: 'common' }),
    (lvl) => ({ type: 'coin', value: 100 + lvl * 5, name: `遊戲幣 x${100 + lvl * 5}`, amount: 100 + lvl * 5, rarity: 'common' }),
    (lvl) => ({ type: 'collectible', value: `neon_chip_${lvl}`, name: '霓虹晶片', amount: 1, rarity: 'rare' }),
    (lvl) => ({ type: 'coin', value: 150 + lvl * 8, name: `遊戲幣 x${150 + lvl * 8}`, amount: 150 + lvl * 8, rarity: 'common' }),
  ];

  const premiumPattern: Array<(level: number) => BattlePassReward['premium']> = [
    (lvl) => ({ type: 'coin', value: 200 + lvl * 10, name: `遊戲幣 x${200 + lvl * 10}`, amount: 200 + lvl * 10, rarity: 'common' }),
    (lvl) => ({ type: 'item', value: 'double_dice', name: '雙倍骰 x1', amount: 1, rarity: 'rare' }),
    (lvl) => ({ type: 'collectible', value: `epic_core_${lvl}`, name: '史詩核心', amount: 1, rarity: 'epic' }),
    (lvl) => ({ type: 'coin', value: 250 + lvl * 12, name: `遊戲幣 x${250 + lvl * 12}`, amount: 250 + lvl * 12, rarity: 'common' }),
    (lvl) => ({ type: 'item', value: 'shield_card', name: '防護盾 x1', amount: 1, rarity: 'rare' }),
  ];

  for (let i = 1; i <= 50; i++) {
    const idx = (i - 1) % 5;
    rewards.push({
      level: i,
      free: freePattern[idx](i),
      premium: premiumPattern[idx](i),
    });
  }

  // 關鍵等級大獎
  const bigRewards: Array<{
    level: number;
    free: BattlePassReward['free'];
    premium: BattlePassReward['premium'];
  }> = [
    {
      level: 5,
      free: { type: 'item', value: 'steal_card', name: '偷地卡 x2', amount: 2, rarity: 'rare' },
      premium: { type: 'pawnSkin', value: 'mecha_pawn', name: '機甲棋子皮膚', rarity: 'epic' },
    },
    {
      level: 10,
      free: { type: 'avatarFrame', value: 'neon_frame', name: '霓虹頭像框', rarity: 'rare' },
      premium: { type: 'diceSkin', value: 'cyber_dice', name: '賽博骰子皮膚', rarity: 'epic' },
    },
    {
      level: 15,
      free: { type: 'collectible', value: 'rare_blueprint', name: '稀有藍圖', amount: 1, rarity: 'rare' },
      premium: { type: 'title', value: 'cyber_knight', name: '稱號：賽博騎士', rarity: 'epic' },
    },
    {
      level: 20,
      free: { type: 'effect', value: 'dice_trail', name: '骰子軌跡特效', rarity: 'epic' },
      premium: { type: 'pawnSkin', value: 'ufo_pawn', name: '幽浮棋子皮膚', rarity: 'epic' },
    },
    {
      level: 25,
      free: { type: 'ticket', value: 'premium_ticket', name: '高級抽獎券 x3', amount: 3, rarity: 'rare' },
      premium: { type: 'profession', value: 'cyber_hacker', name: '職業解鎖：駭客', rarity: 'epic' },
    },
    {
      level: 30,
      free: { type: 'avatarFrame', value: 'gold_frame', name: '黃金頭像框', rarity: 'epic' },
      premium: { type: 'diceSkin', value: 'golden_dice', name: '黃金骰子皮膚', rarity: 'legendary' },
    },
    {
      level: 35,
      free: { type: 'collectible', value: 'epic_chip', name: '史詩晶片', amount: 2, rarity: 'epic' },
      premium: { type: 'title', value: 'neon_lord', name: '稱號：霓虹霸主', rarity: 'legendary' },
    },
    {
      level: 40,
      free: { type: 'item', value: 'double_dice', name: '雙倍骰 x5', amount: 5, rarity: 'epic' },
      premium: { type: 'pawnSkin', value: 'dragon_pawn', name: '龍珠棋子皮膚', rarity: 'legendary' },
    },
    {
      level: 45,
      free: { type: 'ticket', value: 'legendary_ticket', name: '傳級抽獎券 x1', amount: 1, rarity: 'epic' },
      premium: { type: 'profession', value: 'time_watcher', name: '職業解鎖：時間守望者', rarity: 'legendary' },
    },
    {
      level: 50,
      free: { type: 'effect', value: 'victory_fireworks', name: '勝利煙花特效', rarity: 'legendary' },
      premium: { type: 'pawnSkin', value: 'golden_giant', name: '黃金巨人棋子皮膚', rarity: 'legendary' },
    },
  ];

  for (const reward of bigRewards) {
    rewards[reward.level - 1] = reward;
  }

  return rewards;
}

export const BATTLE_PASS_REWARDS = generateBattlePassRewards();

// ========== 賽季任務配置 ==========

export const DAILY_QUEST_POOL = [
  { id: 'daily_complete_match', description: '完成 1 場對局', xpReward: 100, target: 1 },
  { id: 'daily_win_match', description: '贏得 1 場對局', xpReward: 150, target: 1 },
  { id: 'daily_use_item', description: '使用道具 3 次', xpReward: 80, target: 3 },
  { id: 'daily_draw_fate', description: '抽到 5 張命運卡', xpReward: 80, target: 5 },
  { id: 'daily_buy_property', description: '購買 3 塊地產', xpReward: 100, target: 3 },
  { id: 'daily_build_house', description: '建造 5 座房屋', xpReward: 120, target: 5 },
  { id: 'daily_earn_toll', description: '收取過路費 5 次', xpReward: 100, target: 5 },
];

export const WEEKLY_QUEST_POOL = [
  { id: 'weekly_win_5', description: '累計贏得 5 場對局', xpReward: 500, target: 5 },
  { id: 'weekly_assets_1m', description: '累計獲得 100 萬資產', xpReward: 400, target: 1 },
  { id: 'weekly_tournament', description: '參加 1 次錦標賽', xpReward: 300, target: 1 },
  { id: 'weekly_collectible', description: '收集 1 件收藏品', xpReward: 300, target: 1 },
  { id: 'weekly_daily_challenge', description: '完成 3 次每日挑戰', xpReward: 400, target: 3 },
  { id: 'weekly_play_20', description: '完成 20 場對局', xpReward: 500, target: 20 },
  { id: 'weekly_reach_master', description: '達到大師段位', xpReward: 600, target: 1 },
];

export const SEASON_QUESTS = [
  { id: 'season_bp_50', description: '通行證達到 50 級', xpReward: 2000, target: 50 },
  { id: 'season_win_50', description: '累計贏得 50 場', xpReward: 1500, target: 50 },
  { id: 'season_diamond', description: '達到鑽石段位', xpReward: 2000, target: 1 },
  { id: 'season_codex_50', description: '圖鑑完成度 50%', xpReward: 1500, target: 50 },
  { id: 'season_tournament_10', description: '參加 10 次錦標賽', xpReward: 1500, target: 10 },
  { id: 'season_playtime_50h', description: '累計遊戲時長 50 小時', xpReward: 2000, target: 50 },
];

// ========== 劇情模式關卡 ==========

export const STORY_LEVELS: StoryLevelConfig[] = [
  { id: 1, name: '教學關', description: '初學者入門，學習基本操作', difficulty: 'easy', startingMoney: 20000, aiCount: 1, aiAggression: 0.3, reward: '新手稱號', gameMode: 'classic' },
  { id: 2, name: '街頭爭霸', description: '小規模地產爭奪戰', difficulty: 'easy', startingMoney: 18000, aiCount: 1, aiAggression: 0.5, reward: '街頭霸主', gameMode: 'classic' },
  { id: 3, name: '資本對決', description: '資本實力的較量', difficulty: 'normal', startingMoney: 25000, aiCount: 1, aiAggression: 0.6, reward: '資本家', gameMode: 'classic' },
  { id: 4, name: '命運輪盤', description: '命運卡效果翻倍', difficulty: 'normal', startingMoney: 15000, aiCount: 1, aiAggression: 0.5, specialRule: '命運卡金錢倍率×2', reward: '命運之子', gameMode: 'crazy' },
  { id: 5, name: '職業限制', description: '只能購買特定類型地產', difficulty: 'hard', startingMoney: 20000, aiCount: 2, aiAggression: 0.7, specialRule: '每個玩家只能買3種顏色套裝', reward: '職業玩家', gameMode: 'classic' },
  { id: 6, name: '地產大亨', description: '瘋狂建房，爭奪地產帝國', difficulty: 'hard', startingMoney: 30000, aiCount: 2, aiAggression: 0.8, specialRule: '建房成本-50%', reward: '地產大亨', gameMode: 'classic' },
  { id: 7, name: '大逃殺', description: '資源緊張，只有最後一人存活', difficulty: 'hard', startingMoney: 10000, aiCount: 3, aiAggression: 0.9, reward: '大逃殺冠軍', gameMode: 'battle_royale' },
  { id: 8, name: '經濟危機', description: '高通脹，物價飛漲', difficulty: 'extreme', startingMoney: 50000, aiCount: 2, aiAggression: 0.8, specialRule: '物價每回合+5%', reward: '危機倖存者', gameMode: 'crazy' },
  { id: 9, name: '三面楚歌', description: '以一敵三的終極挑戰', difficulty: 'extreme', startingMoney: 40000, aiCount: 3, aiAggression: 0.9, reward: '孤膽英雄', gameMode: 'classic' },
  { id: 10, name: '最終 Boss', description: '面對最強AI的終極對決', difficulty: 'extreme', startingMoney: 50000, aiCount: 1, aiAggression: 1.0, specialRule: 'Boss起始資金兩倍', reward: '賽博傳說', gameMode: 'classic' },
];

// ========== 錦標賽配置 ==========

export const TOURNAMENT_CONFIG = {
  pointsPerWin: 3,
  pointsPerLoss: 1,
  groupSize: 4,
  knockoutRounds8: 3,
  knockoutRounds16: 4,
  aiFillCount: 8,
};

// ========== 地圖編輯器工具函式 ==========

export function encodeMapToBase64(cells: CellConfig[]): string {
  return btoa(JSON.stringify(cells));
}

export function decodeMapFromBase64(base64: string): CellConfig[] {
  return JSON.parse(atob(base64));
}

export function validateMap(cells: CellConfig[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (cells.length !== CELL_COUNT) errors.push(`必須有 ${CELL_COUNT} 格`);
  const startCount = cells.filter((c: CellConfig) => c.type === 'start').length;
  if (startCount !== 1) errors.push(`必須有 1 個起點（當前 ${startCount} 個）`);
  const detentionCount = cells.filter((c: CellConfig) => c.type === 'detention').length;
  if (detentionCount !== 1) errors.push(`必須有 1 個禁閉區（當前 ${detentionCount} 個）`);
  const fateCount = cells.filter((c: CellConfig) => c.type === 'fate').length;
  if (fateCount < 2) errors.push(`至少有 2 個命運區（當前 ${fateCount} 個）`);
  const chanceCount = cells.filter((c: CellConfig) => c.type === 'chance').length;
  if (chanceCount < 2) errors.push(`至少有 2 個機會區（當前 ${chanceCount} 個）`);
  return { valid: errors.length === 0, errors };
}

export const MAX_CUSTOM_MAPS = 5;

// ========== 皮膚配置 ==========

export const PAWN_SKINS: Record<PawnSkinType, SkinConfig> = {
  default: { id: 'default', name: '預設棋子', type: 'pawn', unlockCondition: '初始擁有', rarity: 'common' },
  mecha: { id: 'mecha', name: '機甲棋子', type: 'pawn', unlockCondition: '完成10場對戰', rarity: 'rare' },
  ufo: { id: 'ufo', name: '幽浮棋子', type: 'pawn', unlockCondition: '通關劇情模式第5關', rarity: 'epic' },
  dragon: { id: 'dragon', name: '龍珠棋子', type: 'pawn', unlockCondition: '達到鑽石段位', rarity: 'legendary' },
  neon_cat: { id: 'neon_cat', name: '霓虹貓棋子', type: 'pawn', unlockCondition: '解鎖成就「寒冰指揮官」', rarity: 'rare' },
  holo_knight: { id: 'holo_knight', name: '光騎士棋子', type: 'pawn', unlockCondition: '金融王朝模式稱帝', rarity: 'epic' },
};

export const DICE_SKINS: Record<DiceSkinType, SkinConfig> = {
  default: { id: 'default', name: '預設骰子', type: 'dice', unlockCondition: '初始擁有', rarity: 'common' },
  gold: { id: 'gold', name: '黃金骰子', type: 'dice', unlockCondition: '累計獲勝20場', rarity: 'rare' },
  neon: { id: 'neon', name: '霓虹骰子', type: 'dice', unlockCondition: '通關劇情模式第3關', rarity: 'epic' },
  pixel: { id: 'pixel', name: '像素骰子', type: 'dice', unlockCondition: '擁有所有棋子皮膚', rarity: 'legendary' },
  blood: { id: 'blood', name: '赤紅骰子', type: 'dice', unlockCondition: '解鎖成就「賭城豪客」', rarity: 'epic' },
  cosmic: { id: 'cosmic', name: '星際骰子', type: 'dice', unlockCondition: '觸發量子風暴事件', rarity: 'legendary' },
};

// ========== 寵物配置 ==========

export const PETS: Record<PetType, PetConfig> = {
  mechDog: {
    id: 'mechDog',
    name: '機械狗',
    description: '收過路費時額外獲得 5% 加成',
    passiveEffect: 'toll_income_5pct',
    color: '#22d3ee',
    rarity: 'common',
    icon: '機械狗',
  },
  ufo: {
    id: 'ufo',
    name: '飛碟',
    description: '每回合移動額外 +1 格',
    passiveEffect: 'move_plus_1',
    color: '#a855f7',
    rarity: 'rare',
    icon: '飛碟',
  },
  dragon: {
    id: 'dragon',
    name: '小龍',
    description: '抽卡幸運 +10%，更容易抽到好卡',
    passiveEffect: 'card_luck_10pct',
    color: '#fbbf24',
    rarity: 'epic',
    icon: '龍',
  },
  neon_cat: {
    id: 'neon_cat',
    name: '霓虹貓',
    description: '每回合開始 20% 概率撿到 200 元',
    passiveEffect: 'coin_find_200',
    color: '#f472b6',
    rarity: 'rare',
    icon: '貓',
  },
  ghost_hacker: {
    id: 'ghost_hacker',
    name: '鬼魂駭客',
    description: '被罰款時 15% 概率無效（信用卡款）',
    passiveEffect: 'fine_immunity_15pct',
    color: '#818cf8',
    rarity: 'epic',
    icon: '鬼魂',
  },
  // ===== v3.0 新增寵物 =====
  cyber_bunny: {
    id: 'cyber_bunny',
    name: '賽博兔',
    description: '每回合開始 25% 概率撿到 200 元',
    passiveEffect: 'coin_find_200',
    color: '#fde047',
    rarity: 'rare',
    icon: '兔',
  },
  data_fairy: {
    id: 'data_fairy',
    name: '數位精靈',
    description: '抽卡幸運 +10%，更容易抽到好卡',
    passiveEffect: 'card_luck_10pct',
    color: '#34d399',
    rarity: 'epic',
    icon: '精靈',
  },
};

export const PET_TYPES: PetType[] = ['mechDog', 'ufo', 'dragon', 'neon_cat', 'ghost_hacker', 'cyber_bunny', 'data_fairy'];

// ========== 皮膚升級配置 ==========

export const SKIN_UPGRADE_FRAGMENTS = [0, 10, 30]; // 升到2級需10碎片，升到3級需30碎片（累計）

// ========== 稱號配置 ==========

export const TITLES: Record<TitleId, TitleConfig> = {
  tycoon: {
    id: 'tycoon',
    name: '地產大亨',
    description: '擁有大量地產的商界巨鱷',
    unlockCondition: '解鎖成就「地產霸主」',
    unlockValue: 'property_tycoon',
    icon: '地產大亨',
    rarity: 'epic',
    color: '#fbbf24',
    effect: 'gold',
  },
  gambler: {
    id: 'gambler',
    name: '賭神',
    description: '賭場之中無人能敵',
    unlockCondition: '解鎖成就「賭神」',
    unlockValue: 'gambler',
    icon: '賭徒',
    rarity: 'legendary',
    color: '#a855f7',
    effect: 'rainbow',
  },
  jailbreak: {
    id: 'jailbreak',
    name: '越獄王',
    description: '監禁只是暫住，自由才是常態',
    unlockCondition: '解鎖成就「監獄常客」',
    unlockValue: 'jailbird',
    icon: '監獄風雲',
    rarity: 'rare',
    color: '#fb923c',
    effect: 'flame',
  },
  trader: {
    id: 'trader',
    name: '交易達人',
    description: '精通談判，每筆交易都賺',
    unlockCondition: '解鎖成就「交易達人」',
    unlockValue: 'trade_master',
    icon: '談判專家',
    rarity: 'rare',
    color: '#22d3ee',
    effect: 'neon',
  },
  champion: {
    id: 'champion',
    name: '完勝王者',
    description: '以壓倒性優勢擊敗對手',
    unlockCondition: '解鎖成就「完美勝利」',
    unlockValue: 'perfect_victory',
    icon: '皇帝',
    rarity: 'legendary',
    color: '#ec4899',
    effect: 'pulse',
  },
  stock_guru: {
    id: 'stock_guru',
    name: '股市狙擊手',
    description: '在波動的市場中精準獵殺',
    unlockCondition: '解鎖成就「股市狙擊手」',
    unlockValue: 'stock_sniper',
    icon: '投資之神',
    rarity: 'epic',
    color: '#4ade80',
    effect: 'glitch',
  },
  hotel_king: {
    id: 'hotel_king',
    name: '酒店之王',
    description: '五星級帝國的締造者',
    unlockCondition: '解鎖成就「酒店之王」',
    unlockValue: 'hotel_king',
    icon: '酒店大亨',
    rarity: 'epic',
    color: '#facc15',
    effect: 'gold',
  },
  newbie: {
    id: 'newbie',
    name: '初入賽博',
    description: '剛踏入霓虹都市的新手',
    unlockCondition: '解鎖成就「初學者」',
    unlockValue: 'beginner',
    icon: '環保主義',
    rarity: 'common',
    color: '#9ca3af',
    effect: 'pulse',
  },
  fate_favorite: {
    id: 'fate_favorite',
    name: '命運寵兒',
    description: '受到命運女神眷顧的幸運兒',
    unlockCondition: '解鎖成就「命運寵兒」',
    unlockValue: 'fate_favorite',
    icon: '星光',
    rarity: 'rare',
    color: '#c084fc',
    effect: 'purple',
  },
  property_newbie: {
    id: 'property_newbie',
    name: '地產新手',
    description: '買過 10 塊地的入門投資者',
    unlockCondition: '累計購買 10 塊地',
    unlockValue: 'buy_10_properties',
    icon: '建築師',
    rarity: 'common',
    color: '#22d3ee',
    effect: 'neon',
  },
  undefeated: {
    id: 'undefeated',
    name: '常勝將軍',
    description: '連贏 3 局的戰場傳奇',
    unlockCondition: '連續獲勝 3 局',
    unlockValue: 'win_streak_3',
    icon: '戰爭狂熱',
    rarity: 'epic',
    color: '#f97316',
    effect: 'flame',
  },
  real_estate_god: {
    id: 'real_estate_god',
    name: '房地產之神',
    description: '集齊 5 套同色地塊的帝國締造者',
    unlockCondition: '單局集齊 5 套同色地塊',
    unlockValue: 'collect_5_sets',
    icon: '銀行家',
    rarity: 'legendary',
    color: '#fbbf24',
    effect: 'gold',
  },
  billionaire: {
    id: 'billionaire',
    name: '億萬富翁',
    description: '單局資產突破 50000 的金融巨鱷',
    unlockCondition: '單局總資產 >= 50000',
    unlockValue: 'assets_50000',
    icon: '資本家',
    rarity: 'legendary',
    color: '#06b6d4',
    effect: 'rainbow',
  },
  codex_master: {
    id: 'codex_master',
    name: '圖鑑大師',
    description: '集齊全部卡牌圖鑑的收藏家',
    unlockCondition: '集齊全部卡牌圖鑑',
    unlockValue: 'all_cards_codex',
    icon: '學者',
    rarity: 'epic',
    color: '#a855f7',
    effect: 'glitch',
  },
  quantum_lord: {
    id: 'quantum_lord',
    name: '量子之主',
    description: '穿越無數維度的空間支配者',
    unlockCondition: '解鎖成就「量子漫遊者」',
    unlockValue: 'quantum_wanderer',
    icon: '原子',
    rarity: 'legendary',
    color: '#0ea5e9',
    effect: 'pulse',
  },
  shadow_tycoon: {
    id: 'shadow_tycoon',
    name: '影子巨頭',
    description: '在暗網與黑市中游刃有餘的傳奇商人',
    unlockCondition: '單場黑市拍賣獲勝 2 次',
    unlockValue: 'black_market_wins_2',
    icon: '面具',
    rarity: 'epic',
    color: '#334155',
    effect: 'glitch',
  },
  card_legend: {
    id: 'card_legend',
    name: '卡牌傳說',
    description: '命運與機會之神眷顧的抽卡大師',
    unlockCondition: '解鎖成就「卡牌連鎖大師」',
    unlockValue: 'card_combo_master',
    icon: '卡牌',
    rarity: 'epic',
    color: '#ec4899',
    effect: 'rainbow',
  },
  dynasty_founder: {
    id: 'dynasty_founder',
    name: '王朝開創者',
    description: '建立金融王朝並稱霸的傳奇企業家',
    unlockCondition: '解鎖成就「王朝締造者」',
    unlockValue: 'dynasty_builder',
    icon: '皇冠',
    rarity: 'legendary',
    color: '#fbbf24',
    effect: 'gold',
  },
};

export const TITLE_IDS: TitleId[] = [
  'tycoon', 'gambler', 'jailbreak', 'trader', 'champion',
  'stock_guru', 'hotel_king', 'newbie', 'fate_favorite',
  'property_newbie', 'undefeated', 'real_estate_god', 'billionaire', 'codex_master',
  'quantum_lord', 'shadow_tycoon', 'card_legend', 'dynasty_founder',
];

// ========== 頭像框配置 ==========

export const AVATAR_FRAMES: AvatarFrameConfig[] = [
  {
    id: 'default_frame',
    name: '預設邊框',
    rarity: 'common',
    color: '#6b7280',
    unlockType: 'default',
    unlockValue: 'default',
    borderStyle: 'solid 2px',
    glowColor: 'rgba(107, 114, 128, 0.3)',
  },
  {
    id: 'neon_frame',
    name: '霓虹框',
    rarity: 'rare',
    color: '#00ffff',
    unlockType: 'battlepass',
    unlockValue: '10_premium',
    borderStyle: 'solid 2px',
    glowColor: 'rgba(0, 255, 255, 0.6)',
  },
  {
    id: 'gold_frame',
    name: '黃金框',
    rarity: 'epic',
    color: '#fbbf24',
    unlockType: 'battlepass',
    unlockValue: '30_premium',
    borderStyle: 'double 3px',
    glowColor: 'rgba(251, 191, 36, 0.6)',
  },
  {
    id: 'cyan_glow',
    name: '青色流光',
    rarity: 'rare',
    color: '#22d3ee',
    unlockType: 'achievement',
    unlockValue: 'property_tycoon',
    borderStyle: 'solid 2px',
    glowColor: 'rgba(34, 211, 238, 0.7)',
  },
  {
    id: 'pink_heart',
    name: '粉色心動',
    rarity: 'rare',
    color: '#ec4899',
    unlockType: 'achievement',
    unlockValue: 'fate_favorite',
    borderStyle: 'dashed 2px',
    glowColor: 'rgba(236, 72, 153, 0.6)',
  },
  {
    id: 'purple_storm',
    name: '紫色雷電',
    rarity: 'epic',
    color: '#a855f7',
    unlockType: 'achievement',
    unlockValue: 'stock_sniper',
    borderStyle: 'solid 3px',
    glowColor: 'rgba(168, 85, 247, 0.8)',
  },
  {
    id: 'flame',
    name: '地獄火焰',
    rarity: 'legendary',
    color: '#ef4444',
    unlockType: 'achievement',
    unlockValue: 'perfect_victory',
    borderStyle: 'ridge 4px',
    glowColor: 'rgba(239, 68, 68, 0.9)',
  },
  {
    id: 'ice',
    name: '冰霜結晶',
    rarity: 'rare',
    color: '#67e8f9',
    unlockType: 'achievement',
    unlockValue: 'jailbird',
    borderStyle: 'double 2px',
    glowColor: 'rgba(103, 232, 249, 0.7)',
  },
  {
    id: 'coin',
    name: '金幣滿滿',
    rarity: 'epic',
    color: '#facc15',
    unlockType: 'assets',
    unlockValue: 50000,
    borderStyle: 'groove 3px',
    glowColor: 'rgba(250, 204, 21, 0.7)',
  },
  {
    id: 'rainbow',
    name: '霓虹彩虹',
    rarity: 'legendary',
    color: '#f472b6',
    unlockType: 'achievements_count',
    unlockValue: 10,
    borderStyle: 'solid 3px',
    glowColor: 'rgba(244, 114, 182, 0.8)',
  },
  {
    id: 'pixel',
    name: '像素復古',
    rarity: 'rare',
    color: '#84cc16',
    unlockType: 'all_pawn_skins',
    unlockValue: 'all',
    borderStyle: 'dotted 3px',
    glowColor: 'rgba(132, 204, 22, 0.6)',
  },
  {
    id: 'hacker',
    name: '極客駭客',
    rarity: 'epic',
    color: '#10b981',
    unlockType: 'achievements_combo',
    unlockValue: 'beginner+trade_master',
    borderStyle: 'double 3px',
    glowColor: 'rgba(16, 185, 129, 0.7)',
  },
];
