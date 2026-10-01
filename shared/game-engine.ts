import {
  CELL_COUNT,
  CELLS,
  GAME_MODES,
  FATE_CARDS,
  CHANCE_CARDS,
  SETS,
  getCellSet,
  forwardToNearestFate,
  PROFESSIONS,
  STOCKS,
  STOCK_PRICE_MIN,
  STOCK_PRICE_MAX,
  STOCK_TOTAL_SHARES,
  STOCK_SYMBOLS,
  GLOBAL_EVENTS,
  GLOBAL_EVENT_TYPES,
  ACHIEVEMENTS,
  ACHIEVEMENT_IDS,
  DEFAULT_CUSTOM_RULES,
  PLAYER_COLORS,
  PLAYER_COLOR_HEX,
  DEFAULT_PLAYER_NAMES,
  AI_DIFFICULTY_CONFIG,
  AI_PERSONALITY_CONFIG,
  ITEMS,
  ITEM_TYPES,
  MAX_ITEMS,
  WEATHERS,
  WEATHER_TYPES,
  WEATHER_WEIGHTS,
  MINIGAME_TYPES,
  MINIGAME_NAMES,
  TEAM_CONFIGS,
  COOP_TEAM_ASSIGNMENT,
  BOARD_SIDES,
  BATTLE_ROYALE_SHRINK_INTERVAL,
  BATTLE_ROYALE_FINAL_BATTLE_CELLS,
  BATTLE_ROYALE_POISON_DAMAGE,
  BATTLE_ROYALE_TOLL_MULTIPLIER,
  LOAN_MAX,
  LOAN_INTEREST_RATE,
  SAVINGS_INTEREST_RATE,
  INFLATION_INITIAL_RATE,
  INFLATION_INTERVAL,
  INFLATION_STEP,
  INFLATION_MAX,
  INSURANCE_RATE,
  BOND_MIN_AMOUNT,
  BOND_MAX_AMOUNT,
  BOND_MIN_INTEREST,
  BOND_MAX_INTEREST,
  BOND_MIN_TURNS,
  BOND_MAX_TURNS,
  DAILY_CHALLENGES,
  BUILTIN_MODS,
  BATTLE_PASS_EXP_PER_LEVEL,
  BATTLE_PASS_MAX_LEVEL,
  SKILLS,
  SKILL_POINT_INTERVAL,
  getInitialSkillTree,
  getSkillValue,
  MISSION_POOL,
  MISSIONS_PER_GAME,
  generateRandomBoard,
  SPECIAL_BUILDINGS,
  NPC_CONFIG,
  NPC_MOVE_INTERVAL,
  SEASONS,
  SEASON_CHANGE_INTERVAL,
  SEASON_TYPES,
  DISASTERS,
  DISASTER_INTERVAL,
  DISASTER_PROBABILITY,
  DISASTER_TYPES,
  STORY_LEVELS,
  decodeMapFromBase64,
  encodeMapToBase64,
  PETS,
  BAIL_AMOUNT,
  PROPERTY_UPGRADE_PATHS,
  UPGRADE_PATH_UNLOCK_LEVEL,
  ALLIANCE_BREAK_PENALTY,
  BLACK_MARKET_INTERVAL,
  BLACK_MARKET_ITEM_COUNT,
  BLACK_MARKET_START_PRICE,
  BLACK_MARKET_ITEM_POOL,
  BLACK_MARKET_BID_DURATION,
} from "./game-config";
import type {
  GameState,
  GameMode,
  GameModeConfig,
  GamePhase,
  PlayerState,
  LogEntry,
  FateCard,
  ChanceCard,
  CardEffect,
  BuildingLevel,
  PropertyState,
  TradeOffer,
  Profession,
  AuctionState,
  StockSymbol,
  StockState,
  PlayerStock,
  GlobalEventType,
  GlobalEventMultipliers,
  AchievementId,
  CellConfig,
  CustomGameRules,
  PlayerStats,
  GameStats,
  PlayerConfig,
  ItemType,
  ItemState,
  CardBuff,
  WeatherType,
  WeatherMultipliers,
  MiniGameType,
  MiniGameState,
  TeamId,
  TeamState,
  BoardSide,
  Bond,
  DailyChallengeType,
  Mod,
  ModCard,
  SkillId,
  MissionType,
  Mission,
  SpecialBuildingType,
  TemporaryCellEffect,
  TemporaryEffectType,
  NpcType,
  NpcEntity,
  NpcInteractionState,
  StolenProperty,
  SeasonType,
  SeasonState,
   DisasterType,
   DisasterState,
   StoryLevelId,
   ReplayLogEntry,
    PropertyFuture,
    OptionContract,
    OptionType,
    WarState,
    SpyState,
    TimeTravelSnapshot,
    ParallelWorldState,
    ParallelCellState,
    CardStreakType,
    CardComboState,
    EvolutionLevel,
    MountType,
     MountState,
     PetType,
     TitleId,
     PropertyUpgradePath,
     AllianceState,
     BlackMarketAuctionState,
     BlackMarketAuctionItem,
     BlackMarketAuctionPhase,
    } from "@shared/api.interface";

let logCounter = 0;
let tradeCounter = 0;

// ========== 棋盤格子讀取輔助 ==========

export function getCellConfig(
  state: GameState | null | undefined,
  cellId: number,
): CellConfig {
  if (state?.boardCells && state.boardCells[cellId]) {
    return state.boardCells[cellId];
  }
  return CELLS[cellId];
}

function getCellSetFromState(
  state: GameState | null | undefined,
  cellId: number,
): string | null {
  const cell = getCellConfig(state, cellId);
  return cell?.setId ?? null;
}

const DYNAMIC_BOARD_INTERVAL = 5;
const DYNAMIC_BOARD_DURATION = 3;

// 地下市场
const UNDERGROUND_MARKET_PRICE_RATIO = 0.4; // 贓物售价 = 市价 × 40%
const UNDERGROUND_MARKET_REPUTATION_THRESHOLD = 50; // 声望低于此值解锁地下市场
const UNDERGROUND_MARKET_CONFISCATE_RATE = 0.3; // 30% 概率被警察没收
const REPUTATION_LOSS_STEAL = 10; // 偷地扣声望
const REPUTATION_LOSS_UNDERGROUND_BUY = 5; // 地下市场交易扣声望
const REPUTATION_GAIN_TRADE = 5; // 交易（買地）加声望
const REPUTATION_GAIN_BUILD = 3; // 建房加声望
const REPUTATION_GAIN_AUCTION = 2; // 拍賣成交加声望
const REPUTATION_GAIN_TOLL = 1; // 付過路費加声望
const REPUTATION_LOSS_FORCE_ACQUIRE = 5; // 強制收購扣声望
const REPUTATION_LOSS_BRIBE_CAUGHT = 20; // 賄賂被抓扣声望
const REPUTATION_LOSS_BRIBE_SUCCESS = 3; // 賄賂成功扣声望
const REPUTATION_INITIAL = 50; // 初始声望
const REPUTATION_HIGH_THRESHOLD = 70; // 高声望阈值（享受折扣）
const REPUTATION_LOW_THRESHOLD = 30; // 低声望阈值（价格上涨）
const REPUTATION_LOAN_THRESHOLD = 20; // 贷款声望门槛
const BRIBE_MAX_COUNT = 3; // 每局最大賄賂次數
const BRIBE_CATCH_RATE = 0.2; // 賄賂被抓概率
const BRIBE_FINE = 2000; // 賄賂被抓罰款
const BRIBE_PRICE_RATIO = 0.8; // 賄賂成功買地價格比例
const BRIBE_BRIBE_RATIO = 0.1; // 賄賂金比例
const DYNAMIC_EFFECT_TYPES: TemporaryEffectType[] = [
  "fate_zone",
  "price_up",
  "price_down",
  "ruins",
  "investment_preview",
];

const DYNAMIC_EFFECT_NAMES: Record<TemporaryEffectType, string> = {
  fate_zone: "命運漩渦",
  price_up: "地價飆漲",
  price_down: "地價暴跌",
  ruins: "頹垣廢墟",
  investment_preview: "投資預告",
};

function getSetCells(
  state: GameState | null | undefined,
  setId: string,
): number[] {
  if (state?.boardCells) {
    const result: number[] = [];
    for (const cell of state.boardCells) {
      if (cell.setId === setId) {
        result.push(cell.id);
      }
    }
    return result;
  }
  const setConfig = SETS.find((s) => s.id === setId);
  return setConfig?.cells ?? [];
}

function makeLog(
  type: LogEntry["type"],
  text: string,
): LogEntry {
  return { id: ++logCounter, type, text };
}

// ========== 声望系统辅助函数 ==========

function clampReputation(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function changeReputation(
  state: GameState,
  playerIndex: number,
  delta: number,
  reason: string,
): void {
  const player = state.players[playerIndex];
  if (!player) return;
  const oldValue = player.reputation ?? REPUTATION_INITIAL;
  const newValue = clampReputation(oldValue + delta);
  const actualDelta = newValue - oldValue;
  if (actualDelta === 0) return;
  player.reputation = newValue;
  if (Math.abs(actualDelta) >= 5) {
    state.logs.push(
      makeLog(
        "reputation",
        `${player.name} 聲望 ${actualDelta > 0 ? "上升" : "下降"} ${Math.abs(actualDelta)} 點（${reason}）`,
      ),
    );
  }
}

// ========== 合作模式辅助函数 ==========

function getPlayerTeam(state: GameState, playerIndex: number): TeamId | undefined {
  return state.players[playerIndex]?.teamId;
}

function getTeamState(state: GameState, teamId: TeamId): TeamState | undefined {
  return state.teams?.[teamId];
}

function syncCoopMoneyFromPlayer(state: GameState, playerIndex: number): void {
  if (!state.isCoopMode || !state.teams) return;
  const teamId = getPlayerTeam(state, playerIndex);
  if (!teamId) return;
  const team = state.teams[teamId];
  const player = state.players[playerIndex];
  team.money = player.money;
  team.loan = player.loan ?? 0;
  for (const idx of team.playerIndices) {
    state.players[idx].money = team.money;
    state.players[idx].loan = team.loan;
    state.players[idx].savings = team.savings ?? 0;
  }
}

function syncCoopMoneyFromTeam(state: GameState, teamId: TeamId): void {
  if (!state.isCoopMode || !state.teams) return;
  const team = state.teams[teamId];
  if (!team) return;
  for (const idx of team.playerIndices) {
    state.players[idx].money = team.money;
    state.players[idx].loan = team.loan ?? 0;
    state.players[idx].savings = team.savings ?? 0;
  }
}

function addCoopMoney(state: GameState, playerIndex: number, amount: number): number {
  if (!state.isCoopMode || !state.teams) {
    state.players[playerIndex].money += amount;
    return state.players[playerIndex].money;
  }
  const teamId = getPlayerTeam(state, playerIndex);
  if (!teamId) {
    state.players[playerIndex].money += amount;
    return state.players[playerIndex].money;
  }
  const team = state.teams[teamId];
  team.money += amount;
  syncCoopMoneyFromTeam(state, teamId);
  return team.money;
}

function subCoopMoney(state: GameState, playerIndex: number, amount: number): boolean {
  if (!state.isCoopMode || !state.teams) {
    if (state.players[playerIndex].money < amount) return false;
    state.players[playerIndex].money -= amount;
    return true;
  }
  const teamId = getPlayerTeam(state, playerIndex);
  if (!teamId) {
    if (state.players[playerIndex].money < amount) return false;
    state.players[playerIndex].money -= amount;
    return true;
  }
  const team = state.teams[teamId];
  if (team.money < amount) return false;
  team.money -= amount;
  syncCoopMoneyFromTeam(state, teamId);
  return true;
}

function getCoopMoney(state: GameState, playerIndex: number): number {
  if (!state.isCoopMode || !state.teams) {
    return state.players[playerIndex].money;
  }
  const teamId = getPlayerTeam(state, playerIndex);
  if (!teamId) return state.players[playerIndex].money;
  return state.teams[teamId].money;
}

function isSameTeam(state: GameState, playerA: number, playerB: number): boolean {
  if (!state.isCoopMode) return false;
  const teamA = getPlayerTeam(state, playerA);
  const teamB = getPlayerTeam(state, playerB);
  return teamA !== undefined && teamA === teamB;
}

function getTeamProperties(
  state: GameState,
  teamId: TeamId,
): Record<number, PropertyState> {
  const result: Record<number, PropertyState> = {};
  for (const [cellIdStr, prop] of Object.entries(state.properties)) {
    if (prop.ownerTeam === teamId) {
      result[Number(cellIdStr)] = prop;
    }
  }
  return result;
}

function checkTeamSetComplete(
  state: GameState,
  teamId: TeamId,
  setId: string,
): boolean {
  const setConfig = SETS.find((s) => s.id === setId);
  if (!setConfig) return false;
  return setConfig.cells.every(
    (cellId: number) => state.properties[cellId]?.ownerTeam === teamId,
  );
}

function getCoopItems(state: GameState, playerIndex: number): ItemState[] {
  if (!state.isCoopMode || !state.teams) {
    return state.players[playerIndex].items;
  }
  const teamId = getPlayerTeam(state, playerIndex);
  if (!teamId) return state.players[playerIndex].items;
  return state.teams[teamId].items;
}

function getCoopStocks(state: GameState, playerIndex: number): PlayerStock[] {
  if (!state.isCoopMode || !state.teams) {
    return state.players[playerIndex].stocks;
  }
  const teamId = getPlayerTeam(state, playerIndex);
  if (!teamId) return state.players[playerIndex].stocks;
  return state.teams[teamId].stocks;
}

function updateTeamPropertyOwner(
  state: GameState,
  cellId: number,
  playerIndex: number,
): void {
  const prop = state.properties[cellId];
  if (!prop) return;
  prop.owner = playerIndex;
  if (state.isCoopMode) {
    prop.ownerTeam = getPlayerTeam(state, playerIndex);
  }
}

function isTeamBankrupt(state: GameState, teamId: TeamId): boolean {
  if (!state.teams) return false;
  const team = state.teams[teamId];
  if (!team) return false;
  // 队伍所有玩家都破产
  const allPlayersBankrupt = team.playerIndices.every(
    (idx: number) => state.players[idx]?.isBankrupt,
  );
  if (allPlayersBankrupt) return true;
  // 队伍资金 <= 0 且无可抵押地产
  if (team.money <= 0) {
    const teamProps = getTeamProperties(state, teamId);
    const hasUnmortgagedProperty = Object.values(teamProps).some(
      (p: PropertyState) => !p.isMortgaged,
    );
    if (!hasUnmortgagedProperty) return true;
  }
  return false;
}

function checkCoopWinner(state: GameState): TeamId | null {
  if (!state.isCoopMode || !state.teams) return null;
  const teamIds: TeamId[] = Object.keys(state.teams) as TeamId[];
  const survivingTeams = teamIds.filter(
    (tid: TeamId) => !isTeamBankrupt(state, tid),
  );
  if (survivingTeams.length === 1) return survivingTeams[0];
  return null;
}

/**
 * 合作模式繼承系統：當玩家破產但隊友仍存活時，
 * 將破產玩家的所有資產轉移給隊友，遊戲繼續。
 * 僅在合作模式且有隊友存活時調用。
 */
export function transferOnBankrupt(
  state: GameState,
  bankruptIndex: number,
): GameState {
  // 僅合作模式生效
  if (!state.isCoopMode || !state.teams) return state;

  const bankruptPlayer = state.players[bankruptIndex];
  if (!bankruptPlayer || bankruptPlayer.isBankrupt) return state;

  const teamId = bankruptPlayer.teamId;
  if (!teamId) return state;

  const team = state.teams[teamId];
  if (!team) return state;

  // 找到未破產的隊友
  const teammateIdx = team.playerIndices.find(
    (idx: number) => idx !== bankruptIndex && !state.players[idx]?.isBankrupt,
  );

  // 標記破產玩家
  bankruptPlayer.isBankrupt = true;
  if (!state.bankruptPlayers.includes(bankruptIndex)) {
    state.bankruptPlayers.push(bankruptIndex);
  }
  if (!state.bankruptcyList) {
    state.bankruptcyList = [];
  }
  if (!state.bankruptcyList.includes(bankruptIndex)) {
    state.bankruptcyList.push(bankruptIndex);
  }

  if (teammateIdx !== undefined) {
    const teammate = state.players[teammateIdx];

    // 1. 地產所有權轉移給隊友（保留 ownerTeam）
    for (const cIdStr of Object.keys(state.properties)) {
      const cId = Number(cIdStr);
      const p = state.properties[cId];
      if (p && p.owner === bankruptIndex && p.ownerTeam === teamId) {
        p.owner = teammateIdx;
      }
    }

    // 2. 金錢：合作模式共用金庫，金錢留在隊伍中
    //    （玩家 money 與 team.money 同步，無需單獨轉移）

    // 3. 道具：合作模式共用道具，無需單獨轉移

    // 4. 技能點 / 股票等：合作模式隊伍共享，無需單獨轉移

    // 5. 更新所有權統計
    updateCompleteSets(state);
    updateBuildingCounts(state);
    updatePlayerAssets(state);

    // 6. 日誌
    state.logs.push(
      makeLog(
        "team",
        `玩家${bankruptPlayer.name} 破產，財產由隊友${teammate.name}繼承！`,
      ),
    );
  } else {
    // 隊友也已破產 → 整隊失敗
    // 將所有隊伍玩家標記為破產
    for (const idx of team.playerIndices) {
      state.players[idx].isBankrupt = true;
      state.players[idx].stocks = [];
      state.players[idx].stockBoughtTotal = 0;
      state.players[idx].stockSoldTotal = 0;
      state.players[idx].loan = 0;
      if (!state.bankruptPlayers.includes(idx)) {
        state.bankruptPlayers.push(idx);
      }
      if (!state.bankruptcyList) {
        state.bankruptcyList = [];
      }
      if (!state.bankruptcyList.includes(idx)) {
        state.bankruptcyList.push(idx);
      }
    }
    team.loan = 0;

    // 判定勝利者
    const winnerIdx = checkWinner(state);
    state.winner = winnerIdx;
    if (winnerIdx !== null) {
      state.phase = "ended";
      const winnerTeamId = getPlayerTeam(state, winnerIdx);
      const winnerTeamName = winnerTeamId && state.teams[winnerTeamId]
        ? state.teams[winnerTeamId].name
        : state.players[winnerIdx].name;
      state.logs.push(
        makeLog(
          "team",
          `${team.name} 全軍覆沒！${winnerTeamName} 獲勝！本局共有 ${state.bankruptcyList?.length ?? state.bankruptPlayers.length} 位玩家破產`,
        ),
      );
      checkAndUnlockAchievements(state, winnerIdx);
    }
  }

  return state;
}

function checkTeamSetCompleteGeneric(
  setId: string,
  teamId: TeamId,
  properties: Record<number, PropertyState>,
  boardCells?: CellConfig[],
): boolean {
  let setCells: number[];
  if (boardCells) {
    setCells = boardCells.filter((c) => c.setId === setId).map((c) => c.id);
  } else {
    const setConfig = SETS.find((s) => s.id === setId);
    if (!setConfig) return false;
    setCells = setConfig.cells;
  }
  if (setCells.length === 0) return false;
  return setCells.every(
    (cellId: number) => properties[cellId]?.ownerTeam === teamId,
  );
}

// ========== 大逃杀模式辅助函数 ==========

function isCellDestroyed(state: GameState, cellId: number): boolean {
  if (!state.destroyedCells || state.destroyedCells.length === 0) return false;
  return state.destroyedCells.includes(cellId);
}

function findNextSafeCell(state: GameState, fromCellId: number): number {
  let pos = clampPosition(fromCellId + 1);
  let safety = 0;
  while (isCellDestroyed(state, pos) && safety < CELL_COUNT) {
    pos = clampPosition(pos + 1);
    safety++;
  }
  return pos;
}

function getUndestroyedCellCount(state: GameState): number {
  let count = 0;
  for (let i = 0; i < CELL_COUNT; i++) {
    if (!isCellDestroyed(state, i)) count++;
  }
  return count;
}

function destroySide(state: GameState, side: BoardSide): void {
  const cells = BOARD_SIDES[side];
  const destroyedCells = state.destroyedCells ?? [];
  const newlyDestroyed: number[] = [];

  for (const cellId of cells) {
    // 起点永远不销毁
    if (cellId === 0) continue;
    if (destroyedCells.includes(cellId)) continue;
    destroyedCells.push(cellId);
    newlyDestroyed.push(cellId);

    // 地产归银行（清除所有权和建筑），先结算保险
    if (state.properties[cellId]) {
      // 灾难销毁：如果已保险，先赔付
      applyInsurancePayout(state, cellId);
      delete state.properties[cellId];
    }
    if (state.ownedProperties[cellId] !== undefined) {
      delete state.ownedProperties[cellId];
    }
  }

  state.destroyedCells = destroyedCells;

  // 记录已销毁的边
  if (!state.destroyedSides) {
    state.destroyedSides = [];
  }
  state.destroyedSides.push(side);

  // 如果有玩家站在被销毁的格子上，移动到最近的未销毁格子
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    if (player.isBankrupt) continue;
    if (newlyDestroyed.includes(player.position)) {
      player.position = findNextSafeCell(state, player.position);
      state.logs.push(
        makeLog(
          "zone_destroy",
          `【淘汰】 ${player.name} 所在区域被销毁，转移到 ${CELLS[player.position].name}`,
        ),
      );
    }
    // 禁闭区销毁后，在里面的玩家立即释放
    if (newlyDestroyed.includes(10) && player.isInDetention) {
      player.isInDetention = false;
      player.detentionTurns = 0;
      state.logs.push(
        makeLog(
          "zone_destroy",
          `【釋放】 禁闭区被摧毁，${player.name} 被释放`,
        ),
      );
    }
  }

  const sideNames: Record<BoardSide, string> = {
    bottom: "底边",
    right: "右边",
    top: "顶边",
    left: "左边",
  };
  state.logs.push(
    makeLog(
      "zone_destroy",
      `【縮圈】 缩圈！${sideNames[side]} ${newlyDestroyed.length} 个格子被摧毁`,
    ),
  );

  // 更新建筑计数和资产
  updateBuildingCounts(state);
  updateCompleteSets(state);
  updatePlayerAssets(state);
}

function pickRandomSideToDestroy(state: GameState): BoardSide | null {
  const destroyedSides = state.destroyedSides ?? [];
  const allSides: BoardSide[] = ['bottom', 'right', 'top', 'left'];
  const available = allSides.filter((s: BoardSide) => !destroyedSides.includes(s));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function applyBattleRoyalePoison(state: GameState): void {
  if (!state.finalBattle) return;
  const damage = BATTLE_ROYALE_POISON_DAMAGE;
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    if (player.isBankrupt) continue;
    player.money -= damage;
    state.logs.push(
      makeLog(
        "zone_destroy",
        `【毒氣】 毒气伤害：${player.name} 损失 ${damage} 元`,
      ),
    );
    if (player.money < 1000 && !player.hasBeenPoor) {
      player.hasBeenPoor = true;
    }
  }
  // 毒伤后检查破产
  for (let i = 0; i < state.players.length; i++) {
    if (state.players[i].money <= getBankruptcyLine(state) && (state.phase as GamePhase) !== "ended") {
      applyBankruptcyCheck(state, i);
      if ((state.phase as GamePhase) === "ended") break;
    }
  }
}

function updateAlivePlayersCount(state: GameState): void {
  const alive = state.players.filter((p: PlayerState) => !p.isBankrupt).length;
  state.alivePlayersCount = alive;
}

/**
 * 合併模組自定義卡牌到基礎卡堆。
 */
function mergeModCards(baseCards: FateCard[] | ChanceCard[], modCards: ModCard[], cardType: 'fate' | 'chance'): FateCard[] | ChanceCard[] {
  const filtered = modCards.filter((c: ModCard) => c.type === cardType);
  if (filtered.length === 0) return baseCards;
  let nextId = Math.max(...baseCards.map((c: FateCard | ChanceCard) => c.id)) + 1;
  const converted = filtered.map((mc: ModCard): FateCard | ChanceCard => {
    let effect: CardEffect;
    switch (mc.effect.type) {
      case 'money':
        effect = { type: 'money', amount: Number(mc.effect.value) };
        break;
      case 'teleport':
        effect = { type: 'teleport_start' };
        break;
      case 'move': {
        const val = Number(mc.effect.value);
        effect = val >= 0
          ? { type: 'forward', steps: val }
          : { type: 'backward', steps: Math.abs(val) };
        break;
      }
      case 'jail':
        effect = { type: 'go_to_detention' };
        break;
      case 'card':
        effect = { type: 'get_out_of_jail' };
        break;
      default:
        effect = { type: 'money', amount: 0 };
    }
    return {
      id: nextId++,
      name: mc.name,
      description: mc.description,
      effect,
    };
  });
  return [...baseCards, ...converted] as FateCard[] | ChanceCard[];
}

/**
 * 取得啟用的模組（根據模組 ID 從 BUILTIN_MODS 查詢）。
 */
export function resolveMods(modIds?: string[]): Mod[] {
  if (!modIds || modIds.length === 0) return [];
  return modIds
    .map((id: string) => BUILTIN_MODS.find((m: Mod) => m.id === id))
    .filter((m: Mod | undefined): m is Mod => m !== undefined);
}

/**
 * 應用模組規則到遊戲配置（返回調整後的配置對象）。
 */
export function applyModRules(
  baseConfig: GameModeConfig,
  mods: Mod[],
): GameModeConfig {
  const config = { ...baseConfig };
  for (const mod of mods) {
    if (!mod.rules) continue;
    if (mod.rules.startMoney !== undefined) {
      config.initialMoney = mod.rules.startMoney;
    }
    if (mod.rules.rentMultiplier !== undefined) {
      config.tollRate = baseConfig.tollRate * mod.rules.rentMultiplier;
    }
    if (mod.rules.passStartBonus !== undefined) {
      config.startReward = mod.rules.passStartBonus;
    }
  }
  return config;
}

export function normalizeGameState(state: GameState): GameState {
  const s = { ...state };
  s.weatherMultipliers = s.weatherMultipliers ?? {};
  s.currentWeather = s.currentWeather ?? "sunny";
  s.shopItems = s.shopItems ?? [];
  s.shopRefreshTurn = s.shopRefreshTurn ?? 0;
  s.pendingMiniGame = s.pendingMiniGame ?? null;
  s.isCoopMode = s.mode === "coop2v2" ? true : s.isCoopMode ?? false;
  s.isBattleRoyale = s.mode === "battle_royale" ? true : s.isBattleRoyale ?? false;
  s.destroyedCells = s.destroyedCells ?? [];
  s.destroyedSides = s.destroyedSides ?? [];
  s.shrinkTurnCountdown = s.shrinkTurnCountdown ?? BATTLE_ROYALE_SHRINK_INTERVAL;
  s.finalBattle = s.finalBattle ?? false;
  s.alivePlayersCount = s.alivePlayersCount ?? s.players.length;
  s.players = s.players.map((p: PlayerState) => ({
    ...p,
    items: p.items ?? [],
    shieldCharges: p.shieldCharges ?? 0,
    freePassRemaining: p.freePassRemaining ?? 0,
    doubleDiceActive: p.doubleDiceActive ?? false,
    remoteDiceActive: p.remoteDiceActive ?? false,
    remoteDiceValues: p.remoteDiceValues ?? undefined,
    minigameWins: p.minigameWins ?? 0,
    itemsUsedThisGame: p.itemsUsedThisGame ?? 0,
    sunnyWeatherCount: p.sunnyWeatherCount ?? 0,
     teamId: p.teamId ?? undefined,
     loan: p.loan ?? 0,
      skillTree: p.skillTree ?? getInitialSkillTree(),
      skillPoints: p.skillPoints ?? 0,
      reputation: p.reputation ?? REPUTATION_INITIAL,
    }));
  s.inflationRate = s.inflationRate ?? INFLATION_INITIAL_RATE;
  s.bonds = s.bonds ?? [];
  // 为所有 properties 补充 insured / specialBuilding 默认值
  for (const cellIdStr of Object.keys(s.properties)) {
    const prop = s.properties[Number(cellIdStr)];
    if (prop) {
      prop.insured = prop.insured ?? false;
      prop.specialBuilding = prop.specialBuilding ?? null;
    }
  }
  s.mods = s.mods ?? [];
  s.missions = s.missions ?? [];
  // 隨機地圖兜底
  s.isRandomBoard = s.isRandomBoard ?? false;
  s.cellEffects = s.cellEffects ?? {};
  s.npcs = s.npcs ?? [];
  s.pendingNpcInteraction = s.pendingNpcInteraction ?? null;
  s.bankruptcyList = s.bankruptcyList ?? [];
  s.stolenProperties = s.stolenProperties ?? [];
  s.bribeCount = s.bribeCount ?? 0;
  // 季節系統兜底
  s.season = s.season ?? { type: 'spring', turn: 0 };
  // 災難系統：undefined 表示無災難
  // 股票控股系統兜底
  if (!s.stockStates) {
    s.stockStates = {} as Record<StockSymbol, StockState>;
    for (const sym of STOCK_SYMBOLS) {
      s.stockStates[sym] = {
        symbol: sym,
        price: s.stocks[sym] ?? STOCKS[sym].initialPrice,
        previousPrice: s.stocks[sym] ?? STOCKS[sym].initialPrice,
        controllingPlayer: null,
        shareholderMeetingUsed: false,
        shareholderMeetingCooldown: 0,
      };
    }
  }
  // 向後兼容：合作模式但 teams 未初始化時不補（由 createInitialState 負責）
  return s;
}

export function createInitialState(
  mode: GameMode,
  playerConfigs: PlayerConfig[],
  customRules?: CustomGameRules,
  challenge?: DailyChallengeType,
  mods?: Mod[],
  storyLevel?: StoryLevelId,
  customMap?: CellConfig[],
): GameState {
  const enabledMods = mods ?? [];
  const baseConfig = GAME_MODES[mode];
  const modAdjustedConfig = applyModRules(baseConfig, enabledMods);
  const config = mode === "custom" && customRules
    ? {
        initialMoney: customRules.initialMoney,
        priceMultiplier: 1.0,
        tollRate: customRules.tollPercent,
        startReward: customRules.goBonus,
        fateMoneyMultiplier: customRules.fateMoneyMultiplier,
      }
    : modAdjustedConfig;

  // 合併模組自定義卡牌（提示：抽卡邏輯 drawFateCard/drawChanceCard 可調用 mergeModCards
  // 從 BUILTIN_MODS + state.mods 動態合併，此處不預先計算以保持函數純粹）
  logCounter = 0;
  tradeCounter = 0;
  nextItemId = 1; // 每次開局重置道具 ID 計數，避免多局累加

  const isCoop = mode === "coop2v2" || mode === "team_deathmatch";

  // 挑戰模式：貧民窟起始金錢 1000
  let initialMoney = config.initialMoney;
  if (challenge === "slums") {
    initialMoney = 1000;
  }

  // 劇情模式：從關卡配置取得起始金錢
  const storyConfig = storyLevel
    ? STORY_LEVELS.find((l) => l.id === storyLevel)
    : undefined;
  if (storyConfig) {
    initialMoney = storyConfig.startingMoney;
  }

  const players: PlayerState[] = playerConfigs.map((cfg: PlayerConfig, idx: number) => {
    const teamId = isCoop ? COOP_TEAM_ASSIGNMENT[idx] : undefined;
    return {
      name: cfg.name,
      playerNumber: idx + 1,
      playerIndex: idx,
      money: initialMoney,
      position: 0,
      isInDetention: false,
      detentionTurns: 0,
      hasGetOutOfJailCard: false,
      completeSets: 0,
      totalHouses: 0,
      totalHotels: 0,
      totalAssets: config.initialMoney,
      color: cfg.color || PLAYER_COLORS[idx % PLAYER_COLORS.length],
       isAI: cfg.isAI,
       aiDifficulty: cfg.aiDifficulty,
       aiPersonality: cfg.aiPersonality,
       isBankrupt: false,
      hasUsedRevival: false,
      stocks: [],
      stockBoughtTotal: 0,
      stockSoldTotal: 0,
      tollPaid: 0,
      tollEarned: 0,
      tollIncome: 0,
      tollExpense: 0,
      fateCardDraws: 0,
      chanceCardDraws: 0,
      detentionCount: 0,
      cardDrawCount: 0,
      tradeCount: 0,
      auctionWins: 0,
      hasBeenPoor: false,
      unlockedAchievements: [],
      // 道具系统
      items: [],
      shieldCharges: 0,
      freePassRemaining: 0,
      doubleDiceActive: false,
      remoteDiceActive: false,
      // 迷你游戏
      minigameWins: 0,
      // 道具追踪（成就用）
      itemsUsedThisGame: 0,
      // 天气追踪（成就用）
      sunnyWeatherCount: 0,
      // 队伍
      teamId,
       // 贷款系统
       loan: 0,
       // 技能树系统
       skillTree: getInitialSkillTree(),
       skillPoints: 0,
        // 声望系统
        reputation: REPUTATION_INITIAL,
        // 寵物系統
        equippedPet: null,
        // 稱號系統
        equippedTitle: null,
        // 皮膚碎片
        skinFragments: 0,
      };
  });

  // 合作模式：初始化队伍
  let teams: Record<TeamId, TeamState> | undefined;
  if (isCoop) {
    const redIndices = players
      .map((_p: PlayerState, i: number) => i)
      .filter((i: number) => players[i].teamId === "red");
    const blueIndices = players
      .map((_p: PlayerState, i: number) => i)
      .filter((i: number) => players[i].teamId === "blue");
      teams = {
      red: {
        teamId: "red",
        name: TEAM_CONFIGS.red.name,
        money: initialMoney,
        totalAssets: initialMoney,
        playerIndices: redIndices,
        items: [],
        stocks: [],
        stockBoughtTotal: 0,
        stockSoldTotal: 0,
        loan: 0,
      },
      blue: {
        teamId: "blue",
        name: TEAM_CONFIGS.blue.name,
        money: initialMoney,
        totalAssets: initialMoney,
        playerIndices: blueIndices,
        items: [],
        stocks: [],
        stockBoughtTotal: 0,
        stockSoldTotal: 0,
        loan: 0,
      },
    };
    // 同步玩家 money 为队伍 money（已在初始化时一致）
  }

  // 生存模式：初始化生命值
  if (mode === "survival") {
    for (const p of players) {
      p.health = 100;
    }
  }

  // 合作打Boss模式：最後一個玩家為 Boss
  if (mode === "coop_boss" && players.length > 0) {
    const bossIdx = players.length - 1;
    const boss = players[bossIdx];
    boss.money = initialMoney * 5;
    boss.totalAssets = initialMoney * 5;
    boss.isAI = true;
    boss.aiDifficulty = "hell";
    boss.aiPersonality = "aggressive";
    boss.health = null;
  }

  const playerNames = players.map((p: PlayerState) => p.name).join(" vs ");

  const state: GameState = {
    mode,
    playerCount: players.length,
    players,
    currentPlayerIndex: 0,
    roundStartPlayer: 0,
    playersActedThisRound: new Array(players.length).fill(false),
    bankruptPlayers: [],
    phase: "rolling",
    diceValues: [0, 0],
    lastDiceValues: [0, 0],
    ownedProperties: {},
    properties: {},
    pendingTrade: null,
    auction: null,
    logs: [makeLog("system", `游戏开始！${playerNames}`)],
    winner: null,
    moveAnimationStep: 0,
    pendingFateCard: null,
    pendingChanceCard: null,
    stocks: getStocksInitialState(),
    stockStates: getStockStatesInitial(),
    globalEventTurnCounter: 0,
    currentGlobalEvent: null,
    globalEventMultipliers: {},
    customRules,
    totalTurns: 0,
    // 天气系统
    currentWeather: pickRandomWeather(),
    weatherMultipliers: {},
    // 道具商店
    shopItems: pickRandomItems(4),
    shopRefreshTurn: 0,
    // 迷你游戏
    pendingMiniGame: null,
    // 合作模式
    isCoopMode: isCoop,
    teams,
    // 通货膨胀
    inflationRate: INFLATION_INITIAL_RATE,
    // 债券系统
    bonds: [],
    // 每日挑战
    challengeType: challenge,
    maxTurns: challenge === "speed_15" ? 15 : undefined,
    // 模組
    mods: enabledMods.map((m: Mod) => m.id),
    // 季節系統
    season: { type: 'spring' as SeasonType, turn: 0 },
    // 地產期貨
    propertyFutures: {},
    // 期權合約
    optionContracts: [],
    // 股票期貨期權
    stockDerivatives: [],
    // 戰爭
    wars: [],
    // 間諜
    spies: [],
    // 機器人代打
    robotProxy: {},
    // 時間旅行快照
    timeTravelSnapshots: {},
    // 平行世界
    parallelWorld: null,
    // 卡牌連鎖
    cardCombo: {},
    // 地產進化建材
    buildingMaterials: {},
    // 命運/機會卡牌堆（Fisher-Yates 洗牌）
    fateDeck: shuffleArray(FATE_CARDS.map((_c: FateCard, i: number) => i)),
    fateDeckIndex: 0,
    chanceDeck: shuffleArray(CHANCE_CARDS.map((_c: ChanceCard, i: number) => i)),
    chanceDeckIndex: 0,
    // 收藏圖鑑（本局解鎖進度）
    codexUnlocked: {
      properties: [],
      cards: [],
      items: [],
      pets: [],
      mounts: [],
    },
    // 競速模式
    raceMode: mode === "race" ? { lapsCompleted: new Array(playerConfigs.length).fill(0), requiredLaps: 3 } : null,
    // 生存模式
    survivalMode: mode === "survival",
    // 合作打Boss模式
    coopBossMode: mode === "coop_boss" ? { bossIndex: playerConfigs.length - 1, bossMoneyMultiplier: 5 } : null,
    // 奪寶模式
    treasureMode: mode === "treasure" ? { treasurePosition: 18, treasureCarrier: null, treasureDropPosition: null } : null,
    // 皇帝模式
    emperorMode: mode === "emperor" ? { emperorIndex: null, emperorBuff: null, emperorBuffTurns: 0 } : null,
    // 黑暗模式
    darkMode: mode === "dark",
    lightningMode: mode === "lightning"
      ? { maxTurns: GAME_MODES.lightning.maxTurns ?? 50 }
      : undefined,
    resourceMode: mode === "resource"
      ? { dataCoreCellId: 18, collectAmount: 5, stealAmount: 3, targetResources: 100 }
      : undefined,
    teamDeathmatchMode: mode === "team_deathmatch",
    darknetMode: mode === "darknet"
      ? { feeRate: GAME_MODES.darknet.darknetFeeRate ?? 0.1 }
      : undefined,
  };

  if (isCoop) {
    state.logs.push(
      makeLog("team", `合作模式 2v2：红队 vs 蓝队`),
    );
  }

  if (mode === "race") {
    state.logs.push(makeLog("system", `【競速】 競速模式：率先完成 3 圈者獲勝！`));
  }
  if (mode === "survival") {
    state.logs.push(makeLog("system", `【淘汰】 生存模式：血量歸零即淘汰，撐到最後者獲勝！`));
  }
  if (mode === "coop_boss") {
    const bossName = players[players.length - 1]?.name ?? "Boss";
    state.logs.push(makeLog("system", `【Boss】 合作打Boss模式：玩家聯手對抗 ${bossName}（資金 ×5）`));
  }
  if (mode === "treasure") {
    state.logs.push(makeLog("system", `【奪寶】 奪寶模式：搶奪寶藏並帶回起點者獲勝！`));
  }
  if (mode === "emperor") {
    state.logs.push(makeLog("system", `【皇帝】 皇帝模式：最後存活者登基稱帝！`));
  }
  if (mode === "dark") {
    state.logs.push(makeLog("system", `【黑暗】 黑暗模式：對手資訊隱藏，經典規則不變`));
  }
  if (mode === "lightning") {
    state.logs.push(makeLog("system", `【閃電】 閃電戰模式：${GAME_MODES.lightning.maxTurns ?? 50}回合後按總資產結算！`));
  }
  if (mode === "resource") {
    state.logs.push(makeLog("system", `【資源】 資源爭奪模式：爭奪數據核心，30回合後資源最多者獲勝！`));
    for (const p of state.players) {
      p.resources = 0;
    }
  }
  if (mode === "team_deathmatch") {
    state.logs.push(makeLog("system", `【戰爭】 團隊死鬥模式：消滅對方全隊即可獲勝！`));
  }
  if (mode === "darknet") {
    state.logs.push(makeLog("system", `【暗網】 暗網模式：匿名對局，交易抽成10%，道具效果增強！`));
  }

  // 隨機地圖
  if (customRules?.randomBoard) {
    const { cells, seed } = generateRandomBoard();
    state.isRandomBoard = true;
    state.boardSeed = seed;
    state.boardCells = cells;
    state.logs.push(
      makeLog("system", `【地圖】 隨機地圖已生成（種子：${seed}）`),
    );
  }

  // 自訂地圖
  if (customMap && customMap.length === CELL_COUNT) {
    state.boardCells = customMap;
    state.customMap = encodeMapToBase64(customMap);
    state.logs.push(
      makeLog("system", `【自訂】 自訂地圖已載入（${customMap.length} 格）`),
    );
  }

  // 劇情模式：設定關卡
  if (storyConfig) {
    state.storyLevel = storyConfig.id;
    state.logs.push(
      makeLog("system", `【劇情】 劇情模式：第 ${storyConfig.id} 關 - ${storyConfig.name}`),
    );
  }

  // 大逃杀模式初始化
  if (mode === "battle_royale") {
    state.isBattleRoyale = true;
    state.destroyedCells = [];
    state.destroyedSides = [];
    state.shrinkTurnCountdown = BATTLE_ROYALE_SHRINK_INTERVAL;
    state.finalBattle = false;
    state.alivePlayersCount = players.length;
    state.logs.push(
      makeLog("zone_destroy", `【淘汰】 大逃杀模式：${players.length} 人混战，每 ${BATTLE_ROYALE_SHRINK_INTERVAL} 回合缩圈`),
    );
  }

  // 任務系統：隨機抽取 MISSIONS_PER_GAME 個任務
  const shuffled = [...MISSION_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  state.missions = shuffled.slice(0, MISSIONS_PER_GAME).map((m: Omit<Mission, 'progress' | 'completed' | 'claimed' | 'id' | 'completedBy'>, idx: number) => ({
    id: `mission_${Date.now()}_${idx}`,
    type: m.type,
    name: m.name,
    description: m.description,
    target: m.target,
    progress: 0,
    reward: m.reward,
    completed: false,
    claimed: false,
  }));

  // NPC 系統：生成 2 個 NPC（流浪商人 + 駭客），隨機放在非 start/detention 的地產格上
  const npcTypes: NpcType[] = ['wanderer', 'hacker'];
  const npcCells: number[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = state.boardCells?.[i] ?? CELLS[i];
    if (cell.type === 'property') {
      npcCells.push(i);
    }
  }
  // Fisher-Yates shuffle
  for (let i = npcCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [npcCells[i], npcCells[j]] = [npcCells[j], npcCells[i]];
  }
  state.npcs = npcTypes.map((type: NpcType, idx: number) => ({
    id: `npc_${idx}`,
    type,
    cellId: npcCells[idx] ?? 1,
    name: NPC_CONFIG[type].name,
  }));
  state.pendingNpcInteraction = null;

  return state;
}

// ========== NPC 交互系統 ==========

/**
 * 向流浪商人購買道具（價格為原價的 1.5 倍）
 */
export function buyFromMerchant(
  state: GameState,
  playerIndex: number,
  itemType: ItemType,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);
  const config = ITEMS[itemType];

  // 檢查 NPC 交互狀態：必須是流浪商人
  if (!newState.pendingNpcInteraction || newState.pendingNpcInteraction.npcType !== 'wanderer') {
    newState.logs.push(makeLog(logType, `購買失敗：沒有流浪商人`));
    return newState;
  }
  if (newState.pendingNpcInteraction.playerIndex !== playerIndex) {
    return newState;
  }

  if (!config) {
    newState.logs.push(makeLog(logType, `購買失敗：未知道具類型`));
    return newState;
  }

  // 流浪商人價格 = 原價 × 1.5
  const merchantPrice = Math.ceil(config.price * 1.5);

  // 合作模式：隊伍共享道具欄
  const itemsArray = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].items
    : player.items;

  const itemCount = itemsArray.filter((it: ItemState) => it.type === itemType).length;
  if (itemCount >= MAX_ITEMS) {
    newState.logs.push(makeLog(logType, `購買失敗：${config.name} 已達上限（每種最多${MAX_ITEMS}個）`));
    return newState;
  }

  if (player.money < merchantPrice) {
    newState.logs.push(makeLog(logType, `購買失敗：資金不足（需要${merchantPrice}元）`));
    return newState;
  }

  player.money -= merchantPrice;
  itemsArray.push({
    type: itemType,
    id: nextItemId++,
  });

  const teamText = newState.isCoopMode ? "（隊伍共享）" : "";
  newState.logs.push(
    makeLog(
      "npc",
      `${player.name} 向流浪商人購買了 ${config.icon} ${config.name}${teamText}，花費 $${merchantPrice}`,
    ),
  );

  // 合作模式：同步隊伍金錢
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updatePlayerAssets(newState);
  return newState;
}

/**
 * 僱用駭客偷取對手隨機一張道具卡（花費 $1000）
 */
export function hireHacker(
  state: GameState,
  playerIndex: number,
  targetPlayerIndex: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const target = newState.players[targetPlayerIndex];
  const logType = getPlayerLogType(playerIndex);
  const HACKER_COST = 1000;

  // 檢查 NPC 交互狀態：必須是駭客
  if (!newState.pendingNpcInteraction || newState.pendingNpcInteraction.npcType !== 'hacker') {
    newState.logs.push(makeLog(logType, `失敗：沒有駭客`));
    return newState;
  }
  if (newState.pendingNpcInteraction.playerIndex !== playerIndex) {
    return newState;
  }

  // 不能偷自己
  if (playerIndex === targetPlayerIndex) {
    newState.logs.push(makeLog(logType, `失敗：不能偷自己`));
    return newState;
  }

  // 檢查資金
  if (player.money < HACKER_COST) {
    newState.logs.push(makeLog(logType, `失敗：資金不足（需要 $${HACKER_COST}）`));
    return newState;
  }

  // 合作模式：從目標隊伍道具欄偷取
  const targetItemsArray = newState.isCoopMode && newState.teams && target.teamId
    ? newState.teams[target.teamId].items
    : target.items;

  // 對方沒有道具 → 失敗不退錢
  if (targetItemsArray.length === 0) {
    player.money -= HACKER_COST;
    newState.logs.push(
      makeLog(
        "npc",
        `${player.name} 僱用駭客，但 ${target.name} 身上沒有道具！（-$${HACKER_COST}）`,
      ),
    );
    if (newState.isCoopMode) {
      syncCoopMoneyFromPlayer(newState, playerIndex);
    }
    updatePlayerAssets(newState);
    return newState;
  }

  // 隨機偷一張道具
  const stealIndex = Math.floor(Math.random() * targetItemsArray.length);
  const stolenItem = targetItemsArray[stealIndex];
  const stolenConfig = ITEMS[stolenItem.type];

  // 扣錢
  player.money -= HACKER_COST;

  // 從目標移除
  targetItemsArray.splice(stealIndex, 1);

  // 加到玩家道具欄（需檢查上限）
  const playerItemsArray = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].items
    : player.items;

  const sameTypeCount = playerItemsArray.filter((it: ItemState) => it.type === stolenItem.type).length;
  if (sameTypeCount >= MAX_ITEMS) {
    // 玩家該道具已達上限 → 丟棄被偷的道具
    newState.logs.push(
      makeLog(
        "npc",
        `${player.name} 僱用駭客偷走了 ${target.name} 的 ${stolenConfig?.name ?? stolenItem.type}，但自身已達上限，道具丟失！（-$${HACKER_COST}）`,
      ),
    );
  } else {
    playerItemsArray.push({ ...stolenItem, id: nextItemId++ });
    newState.logs.push(
      makeLog(
        "npc",
        `${player.name} 僱用駭客偷走了 ${target.name} 的 ${stolenConfig?.icon ?? ''} ${stolenConfig?.name ?? stolenItem.type}！（-$${HACKER_COST}）`,
      ),
    );
  }

  // 合作模式：同步雙方隊伍金錢
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updatePlayerAssets(newState);
  return newState;
}

/**
 * 關閉 NPC 交互彈窗
 */
export function closeNpcInteraction(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  if (!newState.pendingNpcInteraction) return newState;
  if (newState.pendingNpcInteraction.playerIndex !== playerIndex) return newState;

  newState.pendingNpcInteraction = null;
  return newState;
}

// ========== 多人通用辅助函数 ==========

function getNextPlayer(state: GameState, fromIndex: number): number {
  // 時間守望者：額外回合——剛剛結束回合的玩家再來一次
  const fromPlayer = state.players[fromIndex];
  if (fromPlayer && fromPlayer.extraTurnActive) {
    fromPlayer.extraTurnActive = false;
    return fromIndex;
  }
  const n = state.players.length;

  // 合作模式：交替回合（红→蓝→红→蓝），跳过破产者
  if (state.isCoopMode && state.teams) {
    let next = (fromIndex + 1) % n;
    while (next !== fromIndex) {
      const player = state.players[next];
      if (!player.isBankrupt) {
        // 检查队伍是否还有效（不全部破产）
        const teamId = player.teamId;
        if (teamId && state.teams[teamId]) {
          const team = state.teams[teamId];
          const hasTeammateAlive = team.playerIndices.some(
            (idx: number) => !state.players[idx].isBankrupt,
          );
          if (hasTeammateAlive) return next;
        } else {
          return next;
        }
      }
      next = (next + 1) % n;
    }
    return fromIndex;
  }

  let next = (fromIndex + 1) % n;
  while (next !== fromIndex) {
    // 競速模式：破產玩家仍可繼續比賽
    if (state.raceMode || !state.players[next].isBankrupt) return next;
    next = (next + 1) % n;
  }
  return fromIndex;
}

export { getNextPlayer as getNextAlivePlayer };

function getRandomOpponent(state: GameState, playerIdx: number): number {
  const opponents: number[] = state.players
    .map((_p: PlayerState, i: number) => i)
    .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
  if (opponents.length === 0) return -1;
  return opponents[Math.floor(Math.random() * opponents.length)];
}

function pickRandomItems(count: number): ItemType[] {
  const pool: ItemType[] = [...ITEM_TYPES];
  const result: ItemType[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

export function pickRandomWeather(): WeatherType {
  const entries: [WeatherType, number][] = WEATHER_TYPES.map(
    (w: WeatherType): [WeatherType, number] => [w, WEATHER_WEIGHTS[w]],
  );
  const total = entries.reduce((sum: number, [, weight]) => sum + weight, 0);
  let rand = Math.random() * total;
  for (const [weather, weight] of entries) {
    rand -= weight;
    if (rand <= 0) return weather;
  }
  return entries[0][0];
}

export function getWeatherMultipliers(weather: WeatherType): WeatherMultipliers {
  switch (weather) {
    case "sunny":
      return { incomeMultiplier: 1.2 };
    case "rain":
      return { tollMultiplier: 1.3 };
    case "fog":
      return { moveReduction: 1 };
    case "em_storm":
      return { cardMoneyMultiplier: 2, moveMultiplier: 2 };
    case "neon_night":
      return { propertyPriceDiscount: 0.2 };
    case "space_calm":
      return { spaceCalmBonus: 100 };
    default:
      return {};
  }
}

function setWeather(state: GameState, weather: WeatherType): void {
  state.currentWeather = weather;
  state.weatherMultipliers = getWeatherMultipliers(weather);
  const config = WEATHERS[weather];
  state.logs.push(
    makeLog(
      "weather",
      `【天气】${config.icon} ${config.name}：${config.description}`,
    ),
  );
  // 天选之人成就追踪
  if (weather === "sunny") {
    for (const p of state.players) {
      p.sunnyWeatherCount++;
    }
    for (let i = 0; i < state.players.length; i++) {
      checkAndUnlockAchievements(state, i);
    }
  }
}

export function refreshShop(state: GameState): void {
  state.shopItems = pickRandomItems(4);
  state.logs.push(makeLog("item", "【商店】 道具商店已刷新"));
}

function checkWinner(state: GameState): number | null {
  // 競速模式：率先達到所需圈數者獲勝
  if (state.raceMode && state.raceMode.lapsCompleted) {
    for (let i = 0; i < state.players.length; i++) {
      const laps = state.raceMode.lapsCompleted[i] ?? 0;
      if (laps >= state.raceMode.requiredLaps) {
        return i;
      }
    }
    return null;
  }

  // 生存模式：最後一名血量 > 0 的玩家獲勝
  if (state.survivalMode) {
    const alive = state.players.filter((p: PlayerState) => (p.health ?? 0) > 0);
    if (alive.length === 1) {
      return state.players.findIndex((p: PlayerState) => (p.health ?? 0) > 0);
    }
    return null;
  }

  // 合作打Boss模式：Boss破產則玩家方勝；任一非Boss玩家破產則Boss勝
  if (state.coopBossMode) {
    const bossIdx = state.coopBossMode.bossIndex;
    const boss = state.players[bossIdx];
    const nonBossIndices = state.players
      .map((_p: PlayerState, i: number) => i)
      .filter((i: number) => i !== bossIdx);
    if (boss && boss.isBankrupt) {
      // 玩家方獲勝，返回第一個非Boss玩家
      return nonBossIndices.find((i: number) => !state.players[i]?.isBankrupt) ?? nonBossIndices[0] ?? 0;
    }
    const allPlayersBankrupt = nonBossIndices.every((i: number) => state.players[i]?.isBankrupt);
    if (allPlayersBankrupt) {
      return bossIdx;
    }
    return null;
  }

  // 奪寶模式：攜帶寶藏的玩家踩到起點（position 為 0 且從高值繞回）即獲勝
  if (state.treasureMode && state.treasureMode.treasureCarrier !== null) {
    const carrierIdx = state.treasureMode.treasureCarrier;
    const carrier = state.players[carrierIdx];
    if (carrier && carrier.position === 0 && (carrier.previousPosition ?? 0) >= CELL_COUNT - 1) {
      return carrierIdx;
    }
    // 注意：移動後勝負判定主要在 processMove 內的經過起點檢查中觸發，此處作為後備
  }

  // 皇帝模式：普通破產判定基礎上，若只剩皇帝一人則皇帝勝
  if (state.emperorMode && state.emperorMode.emperorIndex !== null) {
    const emperorIdx = state.emperorMode.emperorIndex;
    const aliveCount = state.players.filter((p: PlayerState) => !p.isBankrupt).length;
    if (aliveCount === 1 && !state.players[emperorIdx]?.isBankrupt) {
      return emperorIdx;
    }
    // 皇帝已破產或還有多人存活：繼續走經典判定，不要提前 return null
  }

  // 黑暗模式：與經典模式邏輯一致，僅前端顯示不同，直接走後面的經典判定

  // 閃電戰模式：達到回合上限後按總資產排名，資產最高者獲勝
  if (state.lightningMode && state.totalTurns >= state.lightningMode.maxTurns) {
    let maxAssets = -1;
    let winnerIdx = 0;
    for (let i = 0; i < state.players.length; i++) {
      if (state.players[i].isBankrupt) continue;
      const assets = getTotalAssets(i, state);
      if (assets > maxAssets) {
        maxAssets = assets;
        winnerIdx = i;
      }
    }
    return winnerIdx;
  }

  // 資源爭奪模式：達到回合上限後按「資源點數 × 1000 + 總資產」綜合排名
  if (state.resourceMode && state.totalTurns >= (GAME_MODES.resource.maxTurns ?? 30)) {
    let maxScore = -1;
    let winnerIdx = 0;
    for (let i = 0; i < state.players.length; i++) {
      if (state.players[i].isBankrupt) continue;
      const res = state.players[i].resources ?? 0;
      const assets = getTotalAssets(i, state);
      const score = res * 1000 + assets;
      if (score > maxScore) {
        maxScore = score;
        winnerIdx = i;
      }
    }
    return winnerIdx;
  }

  // 合作模式：按队伍判定胜利
  if (state.isCoopMode && state.teams) {
    const winningTeam = checkCoopWinner(state);
    if (winningTeam && state.teams[winningTeam]) {
      // 返回队伍中第一个未破产的玩家索引作为胜者代表
      const team = state.teams[winningTeam];
      const aliveIdx = team.playerIndices.find(
        (idx: number) => !state.players[idx]?.isBankrupt,
      );
      return aliveIdx ?? team.playerIndices[0];
    }
    return null;
  }
  const aliveCount = state.players.filter((p: PlayerState) => !p.isBankrupt).length;
  if (aliveCount === 1) {
    return state.players.findIndex((p: PlayerState) => !p.isBankrupt);
  }
  return null;
}

export { checkWinner as checkGameOver, getRandomOpponent };

function getPlayerLogType(playerIndex: number): "player1" | "player2" | "system" {
  // 日志类型保持向后兼容，索引0/1保留原类型，其余用system
  if (playerIndex === 0) return "player1";
  if (playerIndex === 1) return "player2";
  return "system";
}

// ========== 存款系統 ==========

function getPlayerSavings(state: GameState, playerIndex: number): number {
  if (state.isCoopMode && state.teams) {
    const teamId = getPlayerTeam(state, playerIndex);
    if (teamId && state.teams[teamId]) {
      return state.teams[teamId].savings ?? 0;
    }
  }
  return state.players[playerIndex].savings ?? 0;
}

function setPlayerSavings(state: GameState, playerIndex: number, amount: number): void {
  if (state.isCoopMode && state.teams) {
    const teamId = getPlayerTeam(state, playerIndex);
    if (teamId && state.teams[teamId]) {
      state.teams[teamId].savings = amount;
      syncCoopMoneyFromTeam(state, teamId);
      return;
    }
  }
  state.players[playerIndex].savings = amount;
}

export function depositMoney(state: GameState, playerIndex: number, amount: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (amount <= 0) {
    newState.logs.push(makeLog("bank", `存款金額必須大於0`));
    return newState;
  }

  const currentMoney = getCoopMoney(newState, playerIndex);
  if (amount > currentMoney) {
    newState.logs.push(
      makeLog("bank", `${player.name} 現金不足，無法存入 ${amount} 元`),
    );
    return newState;
  }

  addCoopMoney(newState, playerIndex, -amount);
  const currentSavings = getPlayerSavings(newState, playerIndex);
  setPlayerSavings(newState, playerIndex, currentSavings + amount);

  newState.logs.push(
    makeLog("bank", `【銀行】 ${player.name} 存入銀行 $${amount}`),
  );

  updatePlayerAssets(newState);
  return newState;
}

export function withdrawMoney(state: GameState, playerIndex: number, amount: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (amount <= 0) {
    newState.logs.push(makeLog("bank", `提領金額必須大於0`));
    return newState;
  }

  const currentSavings = getPlayerSavings(newState, playerIndex);
  if (amount > currentSavings) {
    newState.logs.push(
      makeLog("bank", `${player.name} 存款不足，無法提領 ${amount} 元`),
    );
    return newState;
  }

  setPlayerSavings(newState, playerIndex, currentSavings - amount);
  addCoopMoney(newState, playerIndex, amount);

  newState.logs.push(
    makeLog("bank", `【提款】 ${player.name} 從銀行提領 $${amount}`),
  );

  updatePlayerAssets(newState);
  return newState;
}

// ========== 贷款系统 ==========

function getPlayerLoan(state: GameState, playerIndex: number): number {
  if (state.isCoopMode && state.teams) {
    const teamId = getPlayerTeam(state, playerIndex);
    if (teamId && state.teams[teamId]) {
      return state.teams[teamId].loan ?? 0;
    }
  }
  return state.players[playerIndex].loan ?? 0;
}

function setPlayerLoan(state: GameState, playerIndex: number, amount: number): void {
  if (state.isCoopMode && state.teams) {
    const teamId = getPlayerTeam(state, playerIndex);
    if (teamId && state.teams[teamId]) {
      state.teams[teamId].loan = amount;
      syncCoopMoneyFromTeam(state, teamId);
      return;
    }
  }
  state.players[playerIndex].loan = amount;
}

export function takeLoan(state: GameState, playerIndex: number, amount: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (amount <= 0) {
    newState.logs.push(makeLog("loan", `貸款金額必須大於0`));
    return newState;
  }

  const currentLoan = getPlayerLoan(newState, playerIndex);

  // 有未还清贷款时不能再借新的
  if (currentLoan > 0) {
    newState.logs.push(
      makeLog("loan", `${player.name} 尚有貸款未還清，無法再貸新的`),
    );
    return newState;
  }

  // 检查贷款上限
  if (amount > LOAN_MAX) {
    newState.logs.push(
      makeLog("loan", `${player.name} 貸款金額超過上限 ${LOAN_MAX} 元`),
    );
    return newState;
  }

  // 聲望檢查：聲望低於門檻則拒絕貸款
  const playerRep = player.reputation ?? REPUTATION_INITIAL;
  if (playerRep < REPUTATION_LOAN_THRESHOLD) {
    newState.logs.push(
      makeLog("loan", `${player.name} 聲望過低（${playerRep}），銀行拒絕貸款`),
    );
    return newState;
  }

  // 放款
  addCoopMoney(newState, playerIndex, amount);
  setPlayerLoan(newState, playerIndex, amount);

  newState.logs.push(
    makeLog("loan", `【貸款】 ${player.name} 向銀行貸款 $${amount}`),
  );

  return newState;
}

export function repayLoan(state: GameState, playerIndex: number, amount: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (amount <= 0) {
    newState.logs.push(makeLog("loan", `還款金額必須大於0`));
    return newState;
  }

  const currentLoan = getPlayerLoan(newState, playerIndex);

  if (currentLoan <= 0) {
    newState.logs.push(
      makeLog("loan", `${player.name} 沒有未償還的貸款`),
    );
    return newState;
  }

  const currentMoney = getCoopMoney(newState, playerIndex);

  // 检查现金是否足够
  if (amount > currentMoney) {
    newState.logs.push(
      makeLog("loan", `${player.name} 現金不足，無法償還 ${amount} 元`),
    );
    return newState;
  }

  // 不能多还
  const actualRepay = Math.min(amount, currentLoan);

  // 扣款
  subCoopMoney(newState, playerIndex, actualRepay);
  setPlayerLoan(newState, playerIndex, currentLoan - actualRepay);

  newState.logs.push(
    makeLog("loan", `【還款】 ${player.name} 償還貸款 $${actualRepay}`),
  );

  return newState;
}

// ========== 职业系统辅助函数 ==========

// ========== 保险系统 ==========

export function buyInsurance(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  // 校验：地块存在且为地产
  if (!prop || !cell || cell.type !== "property") {
    newState.logs.push(makeLog(logType, `保險購買失敗：${cell?.name ?? "無效地塊"} 不可保險`));
    return newState;
  }

  // 校验：是玩家所有（合作模式下同队也算）
  const isOwned = prop.owner === playerIndex;
  const isTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!isOwned && !isTeammateOwned) {
    newState.logs.push(makeLog(logType, `保險購買失敗：${cell.name} 不屬於你`));
    return newState;
  }

  // 校验：已保险
  if (prop.insured) {
    newState.logs.push(makeLog(logType, `保險購買失敗：${cell.name} 已保險`));
    return newState;
  }

  // 校验：已抵押不能买保险
  if (prop.isMortgaged) {
    newState.logs.push(makeLog(logType, `保險購買失敗：${cell.name} 已抵押`));
    return newState;
  }

  // 计算保费 = 地价 × 保费率
  const basePrice = getCellPrice(cellId, newState.mode, newState.customRules);
  const premium = Math.round(basePrice * INSURANCE_RATE);

  // 检查现金是否足够
  const currentMoney = getCoopMoney(newState, playerIndex);
  if (currentMoney < premium) {
    newState.logs.push(
      makeLog(logType, `保險購買失敗：資金不足（需要 $${premium}）`),
    );
    return newState;
  }

  // 扣钱
  subCoopMoney(newState, playerIndex, premium);
  prop.insured = true;

  const teamText = isTeammateOwned ? "（隊友地塊）" : "";
  newState.logs.push(
    makeLog(
      "insurance",
      `玩家${player.name} 為地塊【${cell.name}】購買保險${teamText}，保費 $${premium}`,
    ),
  );

  updatePlayerAssets(newState);
  return newState;
}

/**
 * 灾难时保险赔付：如果地块已保险，赔付当前总价值（地价+建筑），保险失效
 * 返回赔付金额（未保险返回 0）
 */
function applyInsurancePayout(
  state: GameState,
  cellId: number,
): number {
  const prop = state.properties[cellId];
  const cell = getCellConfig(state, cellId);
  if (!prop || !cell || cell.type !== "property") return 0;
  if (!prop.insured) return 0;

  const ownerIdx = prop.owner;
  const owner = state.players[ownerIdx];
  if (!owner) return 0;

  // 赔付金额 = 地价 + 已建建筑总价值
  const landPrice = getCellPrice(cellId, state.mode, state.customRules, state.boardCells);
  const buildingPrice = getBuildingPrice(cellId, state.mode);
  const buildingValue = prop.buildings === 5
    ? getHotelPrice(cellId, state.mode)
    : prop.buildings * buildingPrice;
  const payout = landPrice + buildingValue;

  // 赔付给玩家（合作模式进队伍金库）
  addCoopMoney(state, ownerIdx, payout);
  prop.insured = false;

  state.logs.push(
    makeLog(
      "insurance",
      `保險公司賠償玩家${owner.name} $${payout}（地塊【${cell.name}】受災全額賠付）`,
    ),
  );

  return payout;
}

// ========== 债券系统 ==========

let bondIdCounter = 0;

function generateBondId(): string {
  bondIdCounter += 1;
  return `bond_${Date.now()}_${bondIdCounter}`;
}

export function issueBond(
  state: GameState,
  playerIndex: number,
  amount: number,
  interestRate: number,
  turns: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  // 校验参数范围
  if (amount < BOND_MIN_AMOUNT || amount > BOND_MAX_AMOUNT) {
    newState.logs.push(
      makeLog(logType, `債券發行失敗：金額須在 $${BOND_MIN_AMOUNT} ~ $${BOND_MAX_AMOUNT} 之間`),
    );
    return newState;
  }
  if (interestRate < BOND_MIN_INTEREST || interestRate > BOND_MAX_INTEREST) {
    newState.logs.push(
      makeLog(
        logType,
        `債券發行失敗：利率須在 ${Math.round(BOND_MIN_INTEREST * 100)}% ~ ${Math.round(BOND_MAX_INTEREST * 100)}% 之間`,
      ),
    );
    return newState;
  }
  if (turns < BOND_MIN_TURNS || turns > BOND_MAX_TURNS) {
    newState.logs.push(
      makeLog(
        logType,
        `債券發行失敗：回合數須在 ${BOND_MIN_TURNS} ~ ${BOND_MAX_TURNS} 之間`,
      ),
    );
    return newState;
  }
  if (!Number.isInteger(turns)) {
    newState.logs.push(makeLog(logType, `債券發行失敗：回合數須為整數`));
    return newState;
  }

  // 创建债券
  const bond: Bond = {
    id: generateBondId(),
    issuerId: playerIndex,
    holderId: null,
    amount,
    interestRate,
    turnsRemaining: turns,
    active: true,
    status: "issued",
  };

  if (!newState.bonds) {
    newState.bonds = [];
  }
  newState.bonds.push(bond);

  const interestPercent = Math.round(interestRate * 100);
  newState.logs.push(
    makeLog(
      "bond",
      `玩家${player.name} 發行債券 $${amount}，利率 ${interestPercent}%，${turns} 回合後到期`,
    ),
  );

  updatePlayerAssets(newState);
  return newState;
}

export function subscribeBond(
  state: GameState,
  playerIndex: number,
  bondId: string,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (!newState.bonds) {
    newState.logs.push(makeLog(logType, `認購失敗：沒有可認購的債券`));
    return newState;
  }

  const bond = newState.bonds.find((b: Bond) => b.id === bondId);
  if (!bond) {
    newState.logs.push(makeLog(logType, `認購失敗：債券不存在`));
    return newState;
  }

  // 必须是 issued 状态且 holderId 为 null
  if (bond.status !== "issued" || bond.holderId !== null) {
    newState.logs.push(makeLog(logType, `認購失敗：該債券已被認購或已到期`));
    return newState;
  }

  // 不能认购自己发行的债券
  if (bond.issuerId === playerIndex) {
    newState.logs.push(makeLog(logType, `認購失敗：不能認購自己發行的債券`));
    return newState;
  }

  // 合作模式：同队不能认购
  if (newState.isCoopMode && isSameTeam(newState, bond.issuerId, playerIndex)) {
    newState.logs.push(makeLog(logType, `認購失敗：不能認購同隊玩家發行的債券`));
    return newState;
  }

  const issuer = newState.players[bond.issuerId];

  // 检查认购者现金
  const subscriberMoney = getCoopMoney(newState, playerIndex);
  if (subscriberMoney < bond.amount) {
    newState.logs.push(
      makeLog(logType, `認購失敗：資金不足（需要 $${bond.amount}）`),
    );
    return newState;
  }

  // 扣除认购者现金，给发行者
  subCoopMoney(newState, playerIndex, bond.amount);
  addCoopMoney(newState, bond.issuerId, bond.amount);

  bond.holderId = playerIndex;
  bond.status = "subscribed";

  newState.logs.push(
    makeLog(
      "bond",
      `玩家${player.name} 認購了玩家${issuer.name} 發行的債券 $${bond.amount}`,
    ),
  );

  // 认购后检查发行者是否会破产（不应该，刚收到钱）
  // 检查认购者是否破产
  if (getCoopMoney(newState, playerIndex) <= getBankruptcyLine(newState)) {
    applyBankruptcyCheck(newState, playerIndex);
  }

  updatePlayerAssets(newState);
  return newState;
}

/**
 * 处理债券到期偿还
 */
function handleBondMaturity(state: GameState, bond: Bond): void {
  if (!bond.active || bond.holderId === null) return;

  const issuer = state.players[bond.issuerId];
  const holder = bond.holderId !== null ? state.players[bond.holderId] : null;
  if (!issuer || !holder) return;

  const repayment = Math.round(bond.amount * (1 + bond.interestRate));
  const issuerMoney = getCoopMoney(state, bond.issuerId);

  if (issuerMoney >= repayment) {
    // 正常偿还
    subCoopMoney(state, bond.issuerId, repayment);
    addCoopMoney(state, bond.holderId, repayment);
    bond.status = "repaid";
    bond.active = false;

    state.logs.push(
      makeLog(
        "bond",
        `債券到期，玩家${issuer.name} 償還 $${repayment} 給玩家${holder.name}`,
      ),
    );
  } else {
    // 违约：先扣光现金，再用地产抵债
    const cashPaid = issuerMoney;
    if (cashPaid > 0) {
      subCoopMoney(state, bond.issuerId, cashPaid);
      addCoopMoney(state, bond.holderId, cashPaid);
    }

    const shortfall = repayment - cashPaid;
    let remainingDebt = shortfall;
    let seizedCount = 0;

    // 收集发行者的地产，按地价从低到高排序抵债
    const issuerProps: Array<{ cellId: number; value: number }> = [];
    for (const cIdStr of Object.keys(state.properties)) {
      const cId = Number(cIdStr);
      const p = state.properties[cId];
      if (!p) continue;
      const isIssuerOwned = state.isCoopMode
        ? p.ownerTeam === getPlayerTeam(state, bond.issuerId)
        : p.owner === bond.issuerId;
      if (isIssuerOwned && !p.isMortgaged) {
        const value = getCellPrice(cId, state.mode, state.customRules);
        issuerProps.push({ cellId: cId, value });
      }
    }
    issuerProps.sort((a, b) => a.value - b.value);

    for (const { cellId, value } of issuerProps) {
      if (remainingDebt <= 0) break;
      const prop = state.properties[cellId];
      if (!prop) continue;

      // 转移地产所有权给持有者
      if (state.isCoopMode && state.teams) {
        const holderTeamId = getPlayerTeam(state, bond.holderId);
        if (holderTeamId) {
          prop.ownerTeam = holderTeamId;
        }
        prop.owner = bond.holderId;
      } else {
        prop.owner = bond.holderId;
        prop.ownerTeam = undefined;
      }
      // 保险随地产转移（保险是跟地产走的）

      remainingDebt -= value;
      seizedCount += 1;
    }

    bond.status = "defaulted";
    bond.active = false;

    if (seizedCount > 0) {
      state.logs.push(
        makeLog(
          "bond",
          `債券違約！玩家${issuer.name} 無力償還，以 ${seizedCount} 塊地產抵債（剩餘欠款 $${Math.max(0, remainingDebt)}）`,
        ),
      );
    } else {
      state.logs.push(
        makeLog(
          "bond",
          `債券違約！玩家${issuer.name} 無力償還且無可抵押地產`,
        ),
      );
    }

    // 如果仍有欠款，发行者破产
    if (remainingDebt > 0) {
      applyBankruptcyCheck(state, bond.issuerId);
    }

    updateCompleteSets(state);
    updateBuildingCounts(state);
  }
}

/**
 * 回合结束时触发实验室效果
 * 每个拥有实验室的玩家每回合触发 1 次（随机三选一）
 */
function processLabRoundEnd(state: GameState): void {
  const labOwners = new Set<number>();
  for (const prop of Object.values(state.properties)) {
    if (prop.specialBuilding === "lab" && prop.owner !== undefined) {
      labOwners.add(prop.owner);
    }
  }
  for (const playerIdx of labOwners) {
    const player = state.players[playerIdx];
    if (!player || player.isBankrupt) continue;

    // 科學家：實驗室效果翻倍
    const isScientist = player.profession === "scientist";
    const mult = isScientist ? 2 : 1;

    const roll = Math.random();
    if (roll < 1 / 3) {
      // 獲得 500
      const gain = 500 * mult;
      addCoopMoney(state, playerIdx, gain);
      state.logs.push(
        makeLog("system", `【實驗室】 【實驗室】${player.name} 的實驗室研發成功，獲得 $${gain}${isScientist ? '【科學家】×2' : ''}`),
      );
    } else if (roll < 2 / 3) {
      // 失去 300
      const loss = 300 * mult;
      subCoopMoney(state, playerIdx, loss);
      state.logs.push(
        makeLog("system", `【實驗室】 【實驗室】${player.name} 的實驗室實驗失敗，損失 $${loss}${isScientist ? '【科學家】×2' : ''}`),
      );
      // 检查破产
      if (getCoopMoney(state, playerIdx) <= getBankruptcyLine(state)) {
        applyBankruptcyCheck(state, playerIdx);
        if ((state.phase as GamePhase) === "ended") return;
      }
    } else {
      // 隨機傳送
      const targetCell = Math.floor(Math.random() * CELL_COUNT);
      player.position = targetCell;
      state.logs.push(
        makeLog("system", `【實驗室】 【實驗室】${player.name} 的實驗室發生空間扭曲，被傳送到 ${CELLS[targetCell].name}`),
      );
    }
  }
}

function processBondsRoundEnd(state: GameState): void {
  if (!state.bonds || state.bonds.length === 0) return;

  for (const bond of state.bonds) {
    if (!bond.active) continue;
    if (bond.status !== "subscribed") continue;
    if (bond.holderId === null) continue;

    // 跳过已破产玩家的债券（发行者或持有者都破产则债券失效）
    const issuerBankrupt = state.players[bond.issuerId]?.isBankrupt;
    const holderBankrupt = bond.holderId !== null
      ? state.players[bond.holderId]?.isBankrupt
      : false;
    if (issuerBankrupt || holderBankrupt) continue;

    bond.turnsRemaining -= 1;

    if (bond.turnsRemaining <= 0) {
      handleBondMaturity(state, bond);
      if (state.phase === "ended") return;
    }
  }
}

// ========== 职业辅助函数 ==========

export function getProfession(player: PlayerState): Profession | undefined {
  return player.profession;
}

export function getBuildingCost(
  cellId: number,
  mode: GameMode,
  isHotel: boolean,
  playerProfession?: Profession,
  properties?: Record<number, PropertyState>,
): number {
  const baseCost = isHotel
    ? getHotelPrice(cellId, mode)
    : getBuildingPrice(cellId, mode);
  let cost = baseCost;
  if (mode === "lightning" && GAME_MODES.lightning.buildingCostMultiplier) {
    cost = Math.round(cost * GAME_MODES.lightning.buildingCostMultiplier);
  }
  if (playerProfession === "engineer") {
    return Math.round(cost * 0.7);
  }
  if (playerProfession === "mechanical_alchemist") {
    return Math.round(cost * 0.7);
  }
  // 地產升級路線：攻擊路線建築成本+20%
  if (properties) {
    const prop = properties[cellId];
    if (prop?.upgradePath && prop.buildings >= UPGRADE_PATH_UNLOCK_LEVEL) {
      const pathConfig = PROPERTY_UPGRADE_PATHS[prop.upgradePath];
      if (pathConfig && pathConfig.buildingCostMultiplier !== 1) {
        cost = Math.round(cost * pathConfig.buildingCostMultiplier);
      }
    }
  }
  return cost;
}

export function getDemolitionRefund(
  baseCost: number,
  playerProfession?: Profession,
): number {
  const ratio = playerProfession === "engineer" ? 0.7 : 0.5;
  return Math.round(baseCost * ratio);
}

export function getRedeemInterest(
  baseMortgageValue: number,
  playerProfession?: Profession,
): number {
  const interestRate = playerProfession === "banker" ? 0.05 : 0.1;
  return Math.round(baseMortgageValue * interestRate);
}

export function getCardMoneyMultiplier(
  playerProfession?: Profession,
): number {
  if (playerProfession === "speculator") return 2;
  if (playerProfession === "cyber_daoist") return 1.5;
  return 1;
}

export function getBuyPriceDiscount(
  price: number,
  playerProfession?: Profession,
): number {
  if (playerProfession === "tycoon") {
    return Math.round(price * 0.9);
  }
  return price;
}

export function getTollIncomeMultiplier(
  playerProfession?: Profession,
): number {
  if (playerProfession === "tycoon") return 1.2;
  if (playerProfession === "traveler") return 1.1;
  if (playerProfession === "mechanical_alchemist") return 1.2;
  return 1;
}

export function getStartBonus(
  mode: GameMode,
  playerProfession?: Profession,
  customRules?: CustomGameRules,
  inflationRate?: number,
): number {
  const baseReward = customRules !== undefined ? customRules.goBonus : GAME_MODES[mode].startReward;
  const infMult = inflationRate ?? 1;
  let reward = Math.round(baseReward * infMult);
  if (playerProfession === "banker") {
    return reward + 500;
  }
  if (playerProfession === "artist") {
    return reward + 300;
  }
  return reward;
}

export function getCellPrice(
  cellId: number,
  mode: GameMode,
  customRules?: CustomGameRules,
  boardCells?: CellConfig[],
): number {
  const cell = boardCells?.[cellId] ?? CELLS[cellId];
  if (!cell || cell.type !== "property") return 0;
  const multiplier = customRules !== undefined ? 1.0 : GAME_MODES[mode].priceMultiplier;
  return Math.round(cell.basePrice * multiplier);
}

export function getBuildingPrice(
  cellId: number,
  mode: GameMode,
): number {
  const price = getCellPrice(cellId, mode);
  // 每栋房屋价格 = 地价 × 0.5
  return Math.round(price * 0.5);
}

export function getHotelPrice(
  cellId: number,
  mode: GameMode,
): number {
  // 酒店价格 = 地价 × 0.5 × 4（即4栋房屋的价格）
  return getBuildingPrice(cellId, mode) * 4;
}

export function getMortgageValue(
  cellId: number,
  mode: GameMode,
): number {
  // 抵押价 = 地价 × 0.5
  return Math.round(getCellPrice(cellId, mode) * 0.5);
}

export function getRedeemValue(
  cellId: number,
  mode: GameMode,
): number {
  // 赎回价 = 地价 × 0.55
  return Math.round(getCellPrice(cellId, mode) * 0.55);
}

export function getPropertyValue(
  cellId: number,
  mode: GameMode,
  buildings: BuildingLevel,
  isMortgaged: boolean,
): number {
  // 已抵押：价值为0
  if (isMortgaged) return 0;
  const landPrice = getCellPrice(cellId, mode);
  const buildingPrice = getBuildingPrice(cellId, mode);
  if (buildings === 5) {
    // 酒店：地价 + 酒店价（酒店=4栋房屋升级，不再重复计算4栋房屋）
    return landPrice + getHotelPrice(cellId, mode);
  }
  // 空地或房屋：地价 + 房屋数 × 单栋房屋价
  return landPrice + buildings * buildingPrice;
}

export function getTotalAssets(
  playerIndex: number,
  state: GameState,
): number {
  const player = state.players[playerIndex];
  let total = player.money;
  const ownerTeam = state.isCoopMode ? player.teamId : undefined;
  for (const [cellIdStr, prop] of Object.entries(state.properties)) {
    if (state.isCoopMode && ownerTeam) {
      if (prop.ownerTeam === ownerTeam) {
        total += getPropertyValue(
          Number(cellIdStr),
          state.mode,
          prop.buildings,
          prop.isMortgaged,
        );
      }
    } else if (prop.owner === playerIndex) {
      total += getPropertyValue(
        Number(cellIdStr),
        state.mode,
        prop.buildings,
        prop.isMortgaged,
      );
    }
  }
  // 加上股票价值
  total += getPlayerStockValue(player, state);
  // 减去贷款余额
  total -= getPlayerLoan(state, playerIndex);
  // 加上存款余额
  total += getPlayerSavings(state, playerIndex);
  return Math.max(0, total);
}

function updatePlayerAssets(state: GameState): void {
  for (let i = 0; i < state.players.length; i++) {
    state.players[i].totalAssets = getTotalAssets(i, state);
  }
}

// ========== 股票系统 ==========

export function getStocksInitialState(): Record<StockSymbol, number> {
  const result: Record<string, number> = {};
  for (const symbol of STOCK_SYMBOLS) {
    result[symbol] = STOCKS[symbol].initialPrice;
  }
  return result as Record<StockSymbol, number>;
}

function getStockStatesInitial(): Record<StockSymbol, StockState> {
  const result = {} as Record<StockSymbol, StockState>;
  for (const symbol of STOCK_SYMBOLS) {
    result[symbol] = {
      symbol,
      price: STOCKS[symbol].initialPrice,
      previousPrice: STOCKS[symbol].initialPrice,
      controllingPlayer: null,
      shareholderMeetingUsed: false,
      shareholderMeetingCooldown: 0,
    };
  }
  return result;
}

export function getStockPrice(
  state: GameState,
  symbol: StockSymbol,
): number {
  return state.stocks[symbol];
}

export function getPlayerStock(
  player: PlayerState,
  symbol: StockSymbol,
  state?: GameState,
): number {
  // 合作模式：从队伍股票中查找
  if (state?.isCoopMode && state.teams && player.teamId) {
    const team = state.teams[player.teamId];
    const holding = team.stocks.find((s: PlayerStock) => s.symbol === symbol);
    return holding?.quantity ?? 0;
  }
  const holding = player.stocks.find((s: PlayerStock) => s.symbol === symbol);
  return holding?.quantity ?? 0;
}

export function getPlayerStockValue(
  player: PlayerState,
  state: GameState,
): number {
  const stocks = state.isCoopMode && state.teams && player.teamId
    ? state.teams[player.teamId].stocks
    : player.stocks;
  let total = 0;
  for (const holding of stocks) {
    total += state.stocks[holding.symbol] * holding.quantity;
  }
  return total;
}

export function getPlayerStockProfit(
  player: PlayerState,
  state: GameState,
): number {
  const currentValue = getPlayerStockValue(player, state);
  const stocks = state.isCoopMode && state.teams && player.teamId
    ? state.teams[player.teamId]
    : player;
  return stocks.stockSoldTotal + currentValue - stocks.stockBoughtTotal;
}

export function updateStockPrices(state: GameState): GameState {
  const newState = cloneState(state);
  for (const symbol of STOCK_SYMBOLS) {
    const config = STOCKS[symbol];
    const currentPrice = newState.stocks[symbol];
    // 確保 stockStates 存在且含 trend 字段
    if (!newState.stockStates) {
      newState.stockStates = {} as Record<StockSymbol, StockState>;
    }
    if (!newState.stockStates[symbol]) {
      newState.stockStates[symbol] = {
        symbol,
        price: currentPrice,
        previousPrice: currentPrice,
        controllingPlayer: null,
        shareholderMeetingUsed: false,
        shareholderMeetingCooldown: 0,
      };
    }
    const ss = newState.stockStates[symbol] as StockState & { trend?: number };
    if (ss.trend === undefined) ss.trend = 0;

    // 價格變動 = 趨勢分量 + 隨機分量
    let randomRange: number;
    switch (config.volatility) {
      case "high":
        randomRange = 0.22; // ±11%
        break;
      case "medium":
        randomRange = 0.135; // ±6.75%
        break;
      case "low":
        randomRange = 0.07; // ±3.5%
        break;
    }
    const trendComponent = ss.trend * 0.06;
    const randomComponent = Math.random() * randomRange * 2 - randomRange;
    const changePercent = trendComponent + randomComponent;

    let newPrice = Math.round(currentPrice * (1 + changePercent));
    newPrice = Math.max(STOCK_PRICE_MIN, Math.min(STOCK_PRICE_MAX, newPrice));
    newState.stocks[symbol] = newPrice;

    // 更新趨勢：指數平滑 + 隨機擾動，clamp 到 [-1, 1]
    ss.trend = ss.trend * 0.7 + (Math.random() * 0.6 - 0.3);
    ss.trend = Math.max(-1, Math.min(1, ss.trend));

    // 同步到 stockStates
    ss.previousPrice = currentPrice;
    ss.price = newPrice;
  }
  return newState;
}

// ========== 股票控股系統 ==========

/**
 * 更新指定股票的控股狀態。
 * 計算每位玩家的持股比例，若某玩家持股≥50%則設為控股玩家。
 * 僅當控股玩家發生變化時寫入日誌。
 */
function updateStockControl(state: GameState, symbol: StockSymbol): GameState {
  const stockEnabled = state.mode !== "custom" || state.customRules?.enableStockMarket !== false;
  if (!stockEnabled) return state;

  const newState = cloneState(state);

  // 確保 stockStates 存在
  if (!newState.stockStates) {
    newState.stockStates = {} as Record<StockSymbol, StockState>;
  }
  if (!newState.stockStates[symbol]) {
    newState.stockStates[symbol] = {
      symbol,
      price: newState.stocks[symbol],
      previousPrice: newState.stocks[symbol],
      controllingPlayer: null,
      shareholderMeetingUsed: false,
      shareholderMeetingCooldown: 0,
    };
  }

  const stockState = newState.stockStates[symbol];
  const prevController = stockState.controllingPlayer ?? null;

  // 計算每位玩家的持股數
  const holdings: number[] = newState.players.map(() => 0);
  let totalShares = 0;

  for (let i = 0; i < newState.players.length; i++) {
    const player = newState.players[i];
    if (player.isBankrupt) continue;
    // 合作模式：從隊伍股票計算
    if (newState.isCoopMode && newState.teams && player.teamId) {
      const team = newState.teams[player.teamId];
      const holding = team.stocks.find((s: PlayerStock) => s.symbol === symbol);
      const qty = holding?.quantity ?? 0;
      // 合作模式中，整支隊伍的持股同時計入隊內每位玩家（控股以隊伍為單位）
      holdings[i] = qty;
    } else {
      const holding = player.stocks.find((s: PlayerStock) => s.symbol === symbol);
      const qty = holding?.quantity ?? 0;
      holdings[i] = qty;
    }
    totalShares += holdings[i];
  }

  // 無人持股 → 無控股玩家
  if (totalShares === 0) {
    stockState.controllingPlayer = null;
    if (prevController !== null) {
      newState.logs.push(
        makeLog(
          "stock_control",
          `【控股變動】${STOCKS[symbol].name} 不再有控股玩家`,
        ),
      );
    }
    return newState;
  }

  // 尋找持股≥STOCK_TOTAL_SHARES 50% 的玩家（絕對控股）
  let newController: number | null = null;
  const controlThreshold = STOCK_TOTAL_SHARES * 0.5;
  for (let i = 0; i < holdings.length; i++) {
    if (holdings[i] >= controlThreshold) {
      newController = i;
      break;
    }
  }

  stockState.controllingPlayer = newController;

  // 控股變動時寫日誌
  if (newController !== prevController) {
    if (newController !== null) {
      const controllerName = newState.players[newController].name;
      const pct = Math.round((holdings[newController] / STOCK_TOTAL_SHARES) * 100);
      newState.logs.push(
        makeLog(
          "stock_control",
          `【控股變動】${controllerName} 取得 ${STOCKS[symbol].name} 控股權（持股 ${pct}%）！`,
        ),
      );
    } else if (prevController !== null) {
      newState.logs.push(
        makeLog(
          "stock_control",
          `【控股變動】${STOCKS[symbol].name} 不再有控股玩家`,
        ),
      );
    }
  }

  return newState;
}

/**
 * 控股玩家召開股東大會，使股價漲跌 50%。
 * 每局限 1 次，使用後進入 3 回合冷卻。
 */
export function callShareholderMeeting(
  state: GameState,
  playerIndex: number,
  symbol: StockSymbol,
  direction: "up" | "down",
): GameState {
  const newState = cloneState(state);

  // 校驗：遊戲進行中
  if (newState.phase === "ended") return newState;
  // 校驗：是玩家回合
  if (newState.currentPlayerIndex !== playerIndex) return newState;
  // 校驗：股票市場已啟用
  const stockEnabled = newState.mode !== "custom" || newState.customRules?.enableStockMarket !== false;
  if (!stockEnabled) return newState;

  const player = newState.players[playerIndex];

  // 確保 stockStates 存在
  if (!newState.stockStates || !newState.stockStates[symbol]) {
    return newState;
  }

  const stockState = newState.stockStates[symbol];

  // 校驗：玩家是否為控股玩家
  if (stockState.controllingPlayer !== playerIndex) {
    newState.logs.push(
      makeLog(
        "shareholder_meeting",
        `${player.name} 召開股東大會失敗：未持有 ${STOCKS[symbol].name} 控股權`,
      ),
    );
    return newState;
  }

  // 校驗：本局限是否已用過
  if (stockState.shareholderMeetingUsed) {
    newState.logs.push(
      makeLog(
        "shareholder_meeting",
        `${player.name} 召開股東大會失敗：本局已使用過`,
      ),
    );
    return newState;
  }

  // 校驗：冷卻是否結束
  if ((stockState.shareholderMeetingCooldown ?? 0) > 0) {
    newState.logs.push(
      makeLog(
        "shareholder_meeting",
        `${player.name} 召開股東大會失敗：冷卻中（剩餘 ${stockState.shareholderMeetingCooldown} 回合）`,
      ),
    );
    return newState;
  }

  // 股價變動 ±50%
  const currentPrice = newState.stocks[symbol];
  const changeMultiplier = direction === "up" ? 1.5 : 0.5;
  let newPrice = Math.round(currentPrice * changeMultiplier);
  newPrice = Math.max(STOCK_PRICE_MIN, Math.min(STOCK_PRICE_MAX, newPrice));
  newState.stocks[symbol] = newPrice;

  // 更新 stockStates 中的價格
  stockState.previousPrice = stockState.price;
  stockState.price = newPrice;

  // 標記已使用 & 設冷卻
  stockState.shareholderMeetingUsed = true;
  stockState.shareholderMeetingCooldown = 3;

  const actionText = direction === "up" ? "上漲" : "下跌";
  newState.logs.push(
    makeLog(
      "shareholder_meeting",
      `【股東大會】${player.name} 召開股東大會，${STOCKS[symbol].name} 股價${actionText} 50%！（${currentPrice} → ${newPrice}元）`,
    ),
  );

  updatePlayerAssets(newState);
  return newState;
}

export function buyStock(
  state: GameState,
  playerIndex: number,
  symbol: StockSymbol,
  quantity: number,
): GameState {
  const newState = cloneState(state);

  // 校验：游戏进行中
  if (newState.phase === "ended") return newState;
  // 校验：是玩家回合
  if (newState.currentPlayerIndex !== playerIndex) return newState;
  // 校验：数量合法
  if (quantity <= 0) return newState;
  // 校验：股票市场已启用
  const stockEnabled = newState.mode !== "custom" || newState.customRules?.enableStockMarket !== false;
  if (!stockEnabled) return newState;

  const player = newState.players[playerIndex];
  const price = newState.stocks[symbol];
  const totalCost = price * quantity;
  const logType = getPlayerLogType(playerIndex);

  // 校验：资金足够（合作模式走队伍资金）
  if (getCoopMoney(newState, playerIndex) < totalCost) {
    newState.logs.push(
      makeLog(
        "stock",
        `${player.name} 購買 ${STOCKS[symbol].name} 失敗：資金不足`,
      ),
    );
    return newState;
  }

  // 扣錢（合作模式同步隊伍資金）
  subCoopMoney(newState, playerIndex, totalCost);

  // 合作模式：队伍共享股票
  const stocksArray = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].stocks
    : player.stocks;
  const boughtTotalRef = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId]
    : player;
  boughtTotalRef.stockBoughtTotal += totalCost;

  // 增加持有数量
  const existing = stocksArray.find((s: PlayerStock) => s.symbol === symbol);
  if (existing) {
    existing.quantity += quantity;
  } else {
    stocksArray.push({ symbol, quantity });
  }

  newState.logs.push(
    makeLog(
      "stock",
      `${player.name} 买入 ${STOCKS[symbol].name} ×${quantity}，单价 ${price} 元（-${totalCost}元）`,
    ),
  );

  updatePlayerAssets(newState);

  // 更新控股狀態
  const afterControl = updateStockControl(newState, symbol);

  return afterControl;
}

export function sellStock(
  state: GameState,
  playerIndex: number,
  symbol: StockSymbol,
  quantity: number,
): GameState {
  const newState = cloneState(state);

  // 校验：游戏进行中
  if (newState.phase === "ended") return newState;
  // 校验：是玩家回合
  if (newState.currentPlayerIndex !== playerIndex) return newState;
  // 校验：数量合法
  if (quantity <= 0) return newState;
  // 校验：股票市场已启用
  const stockEnabled = newState.mode !== "custom" || newState.customRules?.enableStockMarket !== false;
  if (!stockEnabled) return newState;

  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  // 合作模式：队伍共享股票
  const stocksArray = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].stocks
    : player.stocks;
  const soldTotalRef = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId]
    : player;

  const holding = stocksArray.find((s: PlayerStock) => s.symbol === symbol);

  // 校验：持有数量足够
  if (!holding || holding.quantity < quantity) {
    newState.logs.push(
      makeLog(
        "stock",
        `${player.name} 卖出 ${STOCKS[symbol].name} 失败：持有不足`,
      ),
    );
    return newState;
  }

  const price = newState.stocks[symbol];
  const totalIncome = price * quantity;

   // 加錢（合作模式同步隊伍資金）
   addCoopMoney(newState, playerIndex, totalIncome);
   soldTotalRef.stockSoldTotal += totalIncome;

  // 减少持有数量
  holding.quantity -= quantity;
  if (holding.quantity <= 0) {
    const idx = stocksArray.findIndex((s: PlayerStock) => s.symbol === symbol);
    if (idx >= 0) stocksArray.splice(idx, 1);
  }

  newState.logs.push(
    makeLog(
      "stock",
      `${player.name} 卖出 ${STOCKS[symbol].name} ×${quantity}，单价 ${price} 元（+${totalIncome}元）`,
    ),
  );

  updatePlayerAssets(newState);
  // 任務：股票盈利（計算賣出後當前總盈利，取與進度的差值）
  if (newState.missions && newState.missions.length > 0) {
    const profit = getPlayerStockProfit(player, newState);
    const stockMission = newState.missions.find(
      (m: Mission) => m.type === "stock_profit" && !m.completed,
    );
    if (stockMission && profit > stockMission.progress) {
      updateMissionProgress(newState, "stock_profit", profit - stockMission.progress, playerIndex);
    }
  }

  // 更新控股狀態
  const afterSellControl = updateStockControl(newState, symbol);

  return afterSellControl;
}

function updateBuildingCounts(state: GameState): void {
  const counts: Array<{ houses: number; hotels: number }> =
    state.players.map(() => ({ houses: 0, hotels: 0 }));
  for (const prop of Object.values(state.properties)) {
    const idx = prop.owner;
    if (idx < 0 || idx >= counts.length) continue;
    if (prop.buildings === 5) {
      counts[idx].hotels++;
    } else {
      counts[idx].houses += prop.buildings;
    }
    // 合作模式：同步给队友（owner 对应的玩家显示的是整个队伍的建筑数）
    if (state.isCoopMode && state.teams && prop.ownerTeam) {
      const team = state.teams[prop.ownerTeam];
      if (team) {
        for (const pIdx of team.playerIndices) {
          if (pIdx !== idx) {
            if (prop.buildings === 5) {
              counts[pIdx].hotels++;
            } else {
              counts[pIdx].houses += prop.buildings;
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < state.players.length; i++) {
    state.players[i].totalHouses = counts[i].houses;
    state.players[i].totalHotels = counts[i].hotels;
  }
}

export function checkSetComplete(
  ownerIndex: number,
  setId: string,
  ownedProperties: Record<number, number>,
): boolean {
  const setConfig = SETS.find((s) => s.id === setId);
  if (!setConfig) return false;
  return setConfig.cells.every((cellId) => ownedProperties[cellId] === ownerIndex);
}

export function checkSetCompleteFromProperties(
  ownerIndex: number,
  setId: string,
  properties: Record<number, PropertyState>,
  isCoopMode?: boolean,
  ownerTeam?: TeamId,
  boardCells?: CellConfig[],
): boolean {
  let setCells: number[];
  if (boardCells) {
    setCells = boardCells.filter((c) => c.setId === setId).map((c) => c.id);
  } else {
    const setConfig = SETS.find((s) => s.id === setId);
    if (!setConfig) return false;
    setCells = setConfig.cells;
  }
  if (setCells.length === 0) return false;
  if (isCoopMode && ownerTeam) {
    return setCells.every(
      (cellId: number) => properties[cellId]?.ownerTeam === ownerTeam,
    );
  }
  return setCells.every(
    (cellId: number) => properties[cellId]?.owner === ownerIndex,
  );
}

export function updateCompleteSets(state: GameState): void {
  // 收集所有套裝 ID（隨機地圖從 boardCells 取，否則用預設 SETS）
  const setIds: string[] = [];
  if (state.boardCells) {
    const seen = new Set<string>();
    for (const cell of state.boardCells) {
      if (cell.setId && !seen.has(cell.setId)) {
        seen.add(cell.setId);
        setIds.push(cell.setId);
      }
    }
  } else {
    for (const setConfig of SETS) {
      setIds.push(setConfig.id);
    }
  }
  for (let i = 0; i < state.players.length; i++) {
    let count = 0;
    for (const setId of setIds) {
      if (state.isCoopMode && state.players[i].teamId) {
        if (checkTeamSetComplete(state, state.players[i].teamId!, setId)) {
          count++;
        }
      } else if (checkSetCompleteFromProperties(i, setId, state.properties, false, undefined, state.boardCells)) {
        count++;
      }
    }
    state.players[i].completeSets = count;
  }
  // 合作模式：同步队伍 totalAssets
  if (state.isCoopMode && state.teams) {
    for (const teamId of Object.keys(state.teams) as TeamId[]) {
      const team = state.teams[teamId];
      let teamAssets = team.money;
      for (const [cellIdStr, prop] of Object.entries(state.properties)) {
        if (prop.ownerTeam === teamId) {
          teamAssets += getPropertyValue(
            Number(cellIdStr),
            state.mode,
            prop.buildings,
            prop.isMortgaged,
          );
        }
      }
      // 加上股票价值
      for (const holding of team.stocks) {
        teamAssets += state.stocks[holding.symbol] * holding.quantity;
      }
      team.totalAssets = teamAssets;
    }
  }
}

// ========== 強制收購 ==========

export function forceAcquireProperty(
  state: GameState,
  buyerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const buyer = newState.players[buyerIndex];
  const prop = newState.properties[cellId];

  // 校驗：地塊存在且有所有者
  if (!prop || prop.owner === undefined || prop.owner === null) {
    newState.logs.push(
      makeLog("force_acquire", `強制收購失敗：該地塊無所有者`),
    );
    return newState;
  }

  const sellerIndex = prop.owner;

  // 校驗：買家不能是賣家自己
  if (sellerIndex === buyerIndex) {
    newState.logs.push(
      makeLog("force_acquire", `強制收購失敗：不能收購自己的地產`),
    );
    return newState;
  }

  // 校驗：合作模式不能收購隊友的地
  if (newState.isCoopMode && isSameTeam(newState, buyerIndex, sellerIndex)) {
    newState.logs.push(
      makeLog("force_acquire", `強制收購失敗：不能收購隊友的地產`),
    );
    return newState;
  }

  // 校驗：地塊不能有建築
  if (prop.buildings > 0) {
    newState.logs.push(
      makeLog("force_acquire", `強制收購失敗：只能收購無建築的地產`),
    );
    return newState;
  }

  // 校驗：不能是已抵押地產
  if (prop.isMortgaged) {
    newState.logs.push(
      makeLog("force_acquire", `強制收購失敗：不能收購已抵押的地產`),
    );
    return newState;
  }

  // 計算市價
  const marketValue = getPropertyValue(
    cellId,
    newState.mode,
    prop.buildings,
    prop.isMortgaged,
  );

  // 校驗：買家現金 ≥ 市價 × 3（3倍市價門檻）
  const threshold = marketValue * 3;
  if (buyer.money < threshold) {
    newState.logs.push(
      makeLog(
        "force_acquire",
        `強制收購失敗：現金不足（需達到市價3倍 $${threshold}）`,
      ),
    );
    return newState;
  }

  // 收購價 = 市價 × 1.5
  const acquirePrice = Math.round(marketValue * 1.5);

  const seller = newState.players[sellerIndex];
  const cellConfig = newState.boardCells?.[cellId] ?? CELLS[cellId];
  const cellName = cellConfig.name;

  // 買家扣錢
  buyer.money -= acquirePrice;
  // 賣家加錢
  seller.money += acquirePrice;

  // 所有權轉移
  prop.owner = buyerIndex;
  if (newState.isCoopMode) {
    prop.ownerTeam = getPlayerTeam(newState, buyerIndex);
  }
  newState.ownedProperties[cellId] = buyerIndex;

  // 寫日誌
  newState.logs.push(
    makeLog(
      "force_acquire",
      `【強制收購】 ${buyer.name} 以 $${acquirePrice} 強行收購了 ${seller.name} 的 ${cellName}！`,
    ),
  );

  // 檢查是否完成新套裝
  updateCompleteSets(newState);
  updateBuildingCounts(newState);
  updatePlayerAssets(newState);

  // 檢查賣家是否破產
  applyBankruptcyCheck(newState, sellerIndex);

  // 聲望：強制收購 -5
  changeReputation(newState, buyerIndex, -REPUTATION_LOSS_FORCE_ACQUIRE, "強制收購");

  return newState;
}

// ========== 區域霸權檢測 ==========
// 判斷某玩家是否在某地塊所屬的一邊持有超過50%的地產
function checkRegionalHegemony(
  playerIndex: number,
  cellId: number,
  properties: Record<number, PropertyState>,
  boardCells?: CellConfig[],
  isCoopMode?: boolean,
  ownerTeam?: TeamId,
): boolean {
  // 找到 cellId 所屬的邊
  let targetSide: BoardSide | null = null;
  for (const side of Object.keys(BOARD_SIDES) as BoardSide[]) {
    if (BOARD_SIDES[side].includes(cellId)) {
      targetSide = side;
      break;
    }
  }
  if (!targetSide) return false;

  // 統計該邊的地產總數與該玩家/隊伍持有的數量
  const sideCells = BOARD_SIDES[targetSide];
  let totalProperties = 0;
  let ownedProperties = 0;
  for (const cid of sideCells) {
    const cell = boardCells?.[cid] ?? CELLS[cid];
    if (cell.type !== "property") continue;
    totalProperties += 1;
    const prop = properties[cid];
    if (!prop || prop.isMortgaged) continue;
    if (isCoopMode && ownerTeam) {
      if (prop.ownerTeam === ownerTeam) ownedProperties += 1;
    } else {
      if (prop.owner === playerIndex) ownedProperties += 1;
    }
  }
  if (totalProperties === 0) return false;
  return ownedProperties / totalProperties > 0.5;
}

export function getToll(
  cellId: number,
  mode: GameMode,
  ownerIndex: number,
  properties: Record<number, PropertyState>,
  multipliers?: GlobalEventMultipliers,
  customRules?: CustomGameRules,
  weatherMultipliers?: WeatherMultipliers,
  isCoopMode?: boolean,
  ownerTeam?: TeamId,
  ownerTollBonus: number = 0,
  boardCells?: CellConfig[],
  cellEffects?: Record<number, TemporaryCellEffect>,
  stockStates?: Record<StockSymbol, StockState>,
   season?: SeasonState,
   disaster?: DisasterState,
   currentTurn: number = 0,
): number {
  const prop = properties[cellId];
  // 已抵押的地产：过路费=0
  if (!prop || prop.isMortgaged) return 0;

  // 洪水災難：受影響地塊過路費為 0
  if (disaster?.active && disaster.type === 'flood' && disaster.affectedCells.includes(cellId)) {
    return 0;
  }

  const price = getCellPrice(cellId, mode, customRules, boardCells);
  const tollRate = customRules !== undefined ? customRules.tollPercent : GAME_MODES[mode].tollRate;
  let toll = Math.round(price * tollRate);

  // 動態棋盤效果：廢墟 → 過路費為 0
  const cellEffect = cellEffects?.[cellId];
  if (cellEffect?.type === "ruins") return 0;

  // 建筑倍率
  const buildingMode = customRules?.buildingTollMode ?? "standard";
  let buildingMultipliers: Record<BuildingLevel, number>;
  if (buildingMode === "aggressive") {
    // 激进模式：建筑过路费加成更高（标准基础上×1.5）
    buildingMultipliers = {
      0: 1,
      1: 3,
      2: 4.5,
      3: 6,
      4: 7.5,
      5: 12,
    };
  } else {
    // 标准模式：空地×1，1栋×2，2栋×3，3栋×4，4栋×5，酒店×8
    buildingMultipliers = {
      0: 1,
      1: 2,
      2: 3,
      3: 4,
      4: 5,
      5: 8,
    };
  }
  toll *= buildingMultipliers[prop.buildings];

  // 套裝加成在此基礎上×3
  const setId = boardCells?.[cellId]?.setId ?? getCellSet(cellId);
  if (setId) {
    const hasSetBonus = isCoopMode && ownerTeam
      ? checkTeamSetCompleteGeneric(setId, ownerTeam, properties, boardCells)
      : checkSetCompleteFromProperties(ownerIndex, setId, properties, undefined, undefined, boardCells);
    if (hasSetBonus) {
      toll *= 3;
    }
  }

  // 區域霸權：單邊持有超過50%地塊，過路費+25%
  if (checkRegionalHegemony(ownerIndex, cellId, properties, boardCells, isCoopMode, ownerTeam)) {
    toll = Math.round(toll * 1.25);
  }

  // 全局事件倍率 + 天气倍率 + 夏季倍率（疊乘）
  let combinedTollMultiplier = 1;
  if (multipliers?.tollMultiplier) {
    combinedTollMultiplier *= multipliers.tollMultiplier;
  }
  if (weatherMultipliers?.tollMultiplier) {
    combinedTollMultiplier *= weatherMultipliers.tollMultiplier;
  }
  // 夏季：路費 +20%
  if (season?.type === 'summer') {
    combinedTollMultiplier *= 1.2;
  }
   if (combinedTollMultiplier !== 1) {
     toll = Math.round(toll * combinedTollMultiplier);
   }

   // 地主技能：過路費加成
   if (ownerTollBonus > 0) {
     toll = Math.round(toll * (1 + ownerTollBonus));
   }

   // 特殊建築：商場加成 +50%
   if (prop.specialBuilding === "mall") {
     toll = Math.round(toll * 1.5);
   }

   // 特殊建築：工廠減益 -20%（可疊加，最多 -50%）
   const factoryPenalty = getFactoryPenalty(cellId, properties);
   if (factoryPenalty > 0) {
     toll = Math.round(toll * (1 - factoryPenalty));
   }

   // 動態棋盤效果：price_up / price_down
    if (cellEffect?.type === "price_up") {
      toll = Math.round(toll * 1.3);
    } else if (cellEffect?.type === "price_down") {
      toll = Math.round(toll * 0.7);
    }

    // 股票控股加成：若地塊所屬套裝關聯的股票有控股玩家，且控股玩家即為地主，過路費 +30%
    if (stockStates && setId) {
      let hasStockControlBonus = false;
      for (const sym of STOCK_SYMBOLS) {
        const config = STOCKS[sym];
        if (config.linkedSetIds && config.linkedSetIds.includes(setId)) {
          const ss = stockStates[sym];
          if (ss && ss.controllingPlayer !== null && ss.controllingPlayer === ownerIndex) {
            hasStockControlBonus = true;
            break;
          }
        }
      }
      if (hasStockControlBonus) {
        toll = Math.round(toll * 1.3);
      }
    }

    // 駭客入侵：過路費減半（直到絕對回合 hackedUntilTurn，當回合數未達到期時生效）
    if (prop?.hackedUntilTurn && prop.hackedUntilTurn > currentTurn) {
      toll = Math.round(toll * 0.5);
    }

    // 地產升級路線：過路費加成（3級後選定路線生效）
    if (prop.buildings >= UPGRADE_PATH_UNLOCK_LEVEL && prop.upgradePath) {
      const pathConfig = PROPERTY_UPGRADE_PATHS[prop.upgradePath];
      if (pathConfig && pathConfig.tollBonus > 0) {
        toll = Math.round(toll * (1 + pathConfig.tollBonus));
      }
    }

    return Math.max(0, toll);
  }

export function getTollLegacy(
  cellId: number,
  mode: GameMode,
  ownerIndex: number,
  ownedProperties: Record<number, number>,
): number {
  const price = getCellPrice(cellId, mode);
  let toll = Math.round(price * GAME_MODES[mode].tollRate);
  const setId = getCellSet(cellId);
  if (setId && checkSetComplete(ownerIndex, setId, ownedProperties)) {
    toll *= 2;
  }
  return toll;
}

function clampPosition(pos: number): number {
  return ((pos % CELL_COUNT) + CELL_COUNT) % CELL_COUNT;
}

/**
 * 計算某格受到的工廠減益比例（每個工廠 -20%，最多 -50% 封頂）
 */
export function getFactoryPenalty(
  cellId: number,
  properties: Record<number, PropertyState>,
): number {
  const RANGE = 2;
  const PENALTY_PER_FACTORY = 0.2;
  const MAX_PENALTY = 0.5;
  let factoryCount = 0;
  for (let offset = 1; offset <= RANGE; offset++) {
    const forwardId = ((cellId + offset) % CELL_COUNT + CELL_COUNT) % CELL_COUNT;
    const backwardId = ((cellId - offset) % CELL_COUNT + CELL_COUNT) % CELL_COUNT;
    if (properties[forwardId]?.specialBuilding === "factory" && !properties[forwardId]?.isMortgaged) factoryCount++;
    if (properties[backwardId]?.specialBuilding === "factory" && !properties[backwardId]?.isMortgaged) factoryCount++;
  }
  return Math.min(factoryCount * PENALTY_PER_FACTORY, MAX_PENALTY);
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

export function drawFateCard(rerollChance: boolean = false): FateCard {
  const card = FATE_CARDS[Math.floor(Math.random() * FATE_CARDS.length)];
  if (rerollChance && Math.random() < 0.3) {
    return FATE_CARDS[Math.floor(Math.random() * FATE_CARDS.length)];
  }
  return card;
}

export function drawChanceCard(rerollChance: boolean = false): ChanceCard {
  const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
  if (rerollChance && Math.random() < 0.3) {
    return CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
  }
  return card;
}

export function drawFateCardFromDeck(state: GameState): FateCard {
  if (!state.fateDeck || state.fateDeck.length === 0) {
    return drawFateCard();
  }
  let idx = state.fateDeckIndex ?? 0;
  if (idx >= state.fateDeck.length) {
    state.fateDeck = shuffleArray(state.fateDeck);
    idx = 0;
  }
  const cardIndex = state.fateDeck[idx];
  state.fateDeckIndex = idx + 1;
  return FATE_CARDS[cardIndex];
}

export function drawChanceCardFromDeck(state: GameState): ChanceCard {
  if (!state.chanceDeck || state.chanceDeck.length === 0) {
    return drawChanceCard();
  }
  let idx = state.chanceDeckIndex ?? 0;
  if (idx >= state.chanceDeck.length) {
    state.chanceDeck = shuffleArray(state.chanceDeck);
    idx = 0;
  }
  const cardIndex = state.chanceDeck[idx];
  state.chanceDeckIndex = idx + 1;
  return CHANCE_CARDS[cardIndex];
}

// ========== AI 激進度輔助 ==========

function getAiDifficulty(state: GameState): keyof typeof AI_DIFFICULTY_CONFIG {
  const player = state.players[state.currentPlayerIndex];
  if (player?.aiDifficulty && player.aiDifficulty in AI_DIFFICULTY_CONFIG) {
    return player.aiDifficulty;
  }
  if (state.storyLevel !== undefined) {
    const level = STORY_LEVELS.find((l) => l.id === state.storyLevel);
    if (level && level.aiAggression >= 1.2) return 'hell';
    if (level && level.aiAggression >= 0.8) return 'hard';
    if (level && level.aiAggression >= 0.4) return 'normal';
  }
  return 'normal';
}

function getAiPersonality(state: GameState): keyof typeof AI_PERSONALITY_CONFIG {
  const player = state.players[state.currentPlayerIndex];
  if (player?.aiPersonality && player.aiPersonality in AI_PERSONALITY_CONFIG) {
    return player.aiPersonality;
  }
  return 'aggressive';
}

function getAiAggression(state: GameState): number {
  const diff = AI_DIFFICULTY_CONFIG[getAiDifficulty(state)];
  const personality = AI_PERSONALITY_CONFIG[getAiPersonality(state)];
  const baseAggression = 0.4 + (diff.buyProbabilityMultiplier - 0.5) * 0.6;
  const personalityMod = (personality.buyBias - 1.0) * 0.3;
  return Math.max(0.2, Math.min(1.4, baseAggression + personalityMod));
}

export function applyAIDecision(state: GameState): boolean {
  const player = state.players[state.currentPlayerIndex];
  const cellId = player.position;
  const price = getCellPrice(cellId, state.mode, state.customRules, state.boardCells);

  if (player.money < price) return false;

  const diffKey = getAiDifficulty(state);
  const diff = AI_DIFFICULTY_CONFIG[diffKey];
  const personality = AI_PERSONALITY_CONFIG[getAiPersonality(state)];

  let probability = 0.2;
  const ratio = player.money / price;
  if (ratio >= 3) probability = 0.8;
  else if (ratio >= 1.5) probability = 0.5;

  // 難度倍率
  probability *= diff.buyProbabilityMultiplier;

  // 個性偏好
  probability *= personality.buyBias;

  // 地獄級：精確計算過路費成本收益
  if (diff.preciseTollCalc) {
    const prop = state.properties[cellId];
    const toll = prop?.owner !== undefined
      ? getToll(cellId, state.mode, prop.owner, state.properties, undefined, undefined, undefined, undefined, undefined, 0, undefined, undefined, state.stockStates, state.season, undefined, state.totalTurns)
      : price * 0.25;
    const setId = getCellSet(cellId);
    let setBonusAvailable = false;
    if (setId) {
      const setConfig = SETS.find((s) => s.id === setId);
      if (setConfig) {
        const ownedInSet = setConfig.cells.filter(
          (cid: number) => state.properties[cid]?.owner === state.currentPlayerIndex,
        ).length;
        if (ownedInSet >= setConfig.cells.length - 1) {
          setBonusAvailable = true;
          probability *= 1.6;
        } else if (ownedInSet > 0) {
          probability *= 1.2;
        }
      }
    }
    // 高價值地塊回報更高，激進派更愛
    if (personality.preferHighValue && price > 2000) {
      probability *= 1.15;
    }
    // 套裝優先型
    if (personality.preferSetComplete && setBonusAvailable) {
      probability *= 1.1;
    }
  }

  // 地獄級：估算對手資產，針對最強玩家搶關鍵地
  if (diff.assetEstimation && diff.targetWeakestPlayer) {
    const opponents: { idx: number; assets: number }[] = [];
    for (let i = 0; i < state.players.length; i++) {
      if (i !== state.currentPlayerIndex && !state.players[i].isBankrupt) {
        opponents.push({ idx: i, assets: state.players[i].totalAssets });
      }
    }
    if (opponents.length > 0) {
      opponents.sort((a, b) => b.assets - a.assets);
      const topOpponent = opponents[0];
      const setId = getCellSet(cellId);
      if (setId) {
        const setConfig = SETS.find((s) => s.id === setId);
        if (setConfig) {
          const topOwnedInSet = setConfig.cells.filter(
            (cid: number) => state.properties[cid]?.owner === topOpponent.idx,
          ).length;
          // 如果這塊地是最強對手快要湊齊的，必須搶下來
          if (topOwnedInSet >= setConfig.cells.length - 1) {
            probability = Math.min(0.98, probability * 1.5);
          }
        }
      }
    }
  }

  probability = Math.min(0.98, probability);

  // 安全墊
  const baseSafetyPad = 1000 * diff.safetyPadRatio;
  const aggression = getAiAggression(state);
  const safetyPad = Math.max(200, baseSafetyPad * (1 - aggression * 0.7));
  if (player.money - price < safetyPad) probability *= 0.3;

  // 大逃杀模式：更激进买地，同时保留更高的现金安全垫
  if (state.isBattleRoyale) {
    probability = Math.min(0.95, probability * 1.3);
    const safetyPadBR = state.finalBattle ? 2000 : 1500;
    if (player.money - price < safetyPadBR) probability *= 0.2;
  }

  // 合作模式：如果队友已有该套装，提高购买概率
  if (state.isCoopMode && player.teamId && state.teams) {
    const setId = getCellSet(cellId);
    if (setId) {
      const hasTeammateInSet = checkTeamSetCompleteGeneric(
        setId,
        player.teamId,
        state.properties,
      );
      if (!hasTeammateInSet) {
        const setConfig = SETS.find((s) => s.id === setId);
        if (setConfig) {
          const ownedCount = setConfig.cells.filter(
            (cid) => state.properties[cid]?.ownerTeam === player.teamId,
          ).length;
          if (ownedCount > 0 && ownedCount >= setConfig.cells.length - 1) {
            probability = Math.min(0.95, probability * 1.5);
          } else if (ownedCount > 0) {
            probability = Math.min(0.9, probability * 1.2);
          }
        }
      }
    }
  }

  return Math.random() < probability;
}

/**
 * 处理玩家落到某格子后的事件
 */
function applyCellLanding(state: GameState): GameState {
  const playerIdx = state.currentPlayerIndex;
  const player = state.players[playerIdx];
  const cell = getCellConfig(state, player.position);
  const logType = getPlayerLogType(playerIdx);

  // 動態棋盤：fate_zone 效果 - 踩到地產格若有命運漩渦，先處理格子本身再抽命運卡（額外觸發）
  const cellEffect = state.cellEffects?.[player.position];
  const hasFateZone = cellEffect?.type === "fate_zone";

  // 資源爭奪模式：數據核心採集（路過/停留都可採集）
  if (state.resourceMode && player.position === state.resourceMode.dataCoreCellId) {
    const collect = state.resourceMode.collectAmount;
    player.resources = (player.resources ?? 0) + collect;
    state.logs.push(
      makeLog(logType, `【資源】 ${player.name} 從數據核心採集了 ${collect} 個數據資源`),
    );
    // 若對手也在同一格（經過時停滯），搶奪對手部分資源
    for (let i = 0; i < state.players.length; i++) {
      if (i === playerIdx || state.players[i].isBankrupt) continue;
      const other = state.players[i];
      if (other.position === state.resourceMode.dataCoreCellId && (other.resources ?? 0) > 0) {
        const steal = Math.min(state.resourceMode.stealAmount, other.resources ?? 0);
        other.resources = (other.resources ?? 0) - steal;
        player.resources = (player.resources ?? 0) + steal;
        state.logs.push(
          makeLog(logType, `【戰爭】 ${player.name} 從 ${other.name} 手中搶走了 ${steal} 個數據資源`),
        );
      }
    }
  }

  switch (cell.type) {
    case "start":
      state.phase = "rolling";
      state.currentPlayerIndex = getNextPlayer(state, playerIdx);
      break;

    case "property": {
      const prop = state.properties[player.position];
      // 正規化地主索引：prop.owner === -1 代表已賣回銀行（見 force_sell_property / applyBuyDecision），
      // 此時視為無主地，否則後續會用 state.players[-1] 讀取 skillTree/profession 而拋錯。
      const rawOwner = prop?.owner ?? state.ownedProperties[player.position];
      const owner = rawOwner !== undefined && rawOwner >= 0 ? rawOwner : undefined;
      // 奪寶模式：撿起寶藏
      if (state.treasureMode && state.treasureMode.treasureCarrier === null) {
        const tm = state.treasureMode;
        if (player.position === tm.treasurePosition || player.position === tm.treasureDropPosition) {
          tm.treasureCarrier = playerIdx;
          tm.treasureDropPosition = null;
          state.logs.push(
            makeLog("system", `【奪寶】 ${player.name} 撿到了寶藏！快帶回起點獲勝`),
          );
        }
      }
      const basePrice = getCellPrice(player.position, state.mode, state.customRules, state.boardCells);
      const eventMultiplier = state.globalEventMultipliers.propertyPriceMultiplier ?? 1;
      const weatherDiscount = state.weatherMultipliers.propertyPriceDiscount ?? 0;
      const inflationMult = state.inflationRate ?? 1;
      let eventPrice = Math.round(basePrice * eventMultiplier * inflationMult);
      // 挑戰模式：地價翻倍
      if (state.challengeType === "double_rent") {
        eventPrice = Math.round(eventPrice * 2);
      }
      const price = Math.round(getBuyPriceDiscount(eventPrice, player.profession) * (1 - weatherDiscount) * (1 - getSkillValue(player.skillTree, 'buy_discount')));
       // 春季：買地 -10%（顯示價格也要反映）
       const springMultiplier = state.season?.type === 'spring' ? 0.9 : 1;
       const displayPrice = Math.round(price * springMultiplier);
       let toll = getToll(
          player.position,
          state.mode,
          owner ?? 0,
          state.properties,
          state.globalEventMultipliers,
          state.customRules,
          state.weatherMultipliers,
          state.isCoopMode,
          state.properties[player.position]?.ownerTeam,
          owner !== undefined ? getSkillValue(state.players[owner].skillTree, 'toll_bonus') : 0,
           state.boardCells,
           state.cellEffects,
           state.stockStates,
           state.season,
           state.disaster,
         );
       // 大逃杀最终决战：过路费翻倍
       if (state.isBattleRoyale && state.finalBattle) {
         toll = Math.round(toll * BATTLE_ROYALE_TOLL_MULTIPLIER);
       }
       // 通货膨胀：过路费×通胀率
       if (state.inflationRate && state.inflationRate !== 1) {
         toll = Math.round(toll * state.inflationRate);
       }
       // 挑戰模式：地價翻倍 - 過路費翻倍
        if (state.challengeType === "double_rent") {
          toll = Math.round(toll * 2);
        }
        // 合作打Boss模式：Boss的過路費翻倍
        if (state.coopBossMode && owner === state.coopBossMode.bossIndex) {
          toll = Math.round(toll * 2);
        }
        // 皇帝模式：皇帝 toll_boost buff 時過路費 ×1.5
        if (state.emperorMode && state.emperorMode.emperorBuff === "toll_boost" && owner === state.emperorMode.emperorIndex) {
          toll = Math.round(toll * 1.5);
        }
        // 本回合過路費加成（卡牌/職業 buff，如義體強化、數據牧師獻祭）
        if (owner !== undefined && state.players[owner].tollBoostThisTurn) {
          toll = Math.round(toll * (1 + state.players[owner].tollBoostThisTurn!));
        }
       const setId = state.boardCells?.[player.position]?.setId ?? getCellSet(player.position);
       const hasSetBonus =
         setId !== null &&
         setId !== undefined &&
         owner !== undefined &&
         checkSetCompleteFromProperties(owner, setId, state.properties, false, undefined, state.boardCells);

      if (owner === undefined) {
        if (player.money >= displayPrice) {
          state.phase = "buying";
          const neonText = state.currentWeather === "neon_night" ? "【霓虹夜】8折" : "";
          const springText = state.season?.type === 'spring' ? "【春季】買地9折" : "";
          state.logs.push(
            makeLog(
              logType,
              `${player.name} 抵达 ${cell.name}，地价 ${displayPrice} 元${neonText}${springText}`,
            ),
          );
        } else {
          state.logs.push(
            makeLog(
              logType,
              `${player.name} 抵达 ${cell.name}，现金不足无法购买`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        }
      } else if (owner === playerIdx || (state.isCoopMode && isSameTeam(state, owner, playerIdx))) {
        const teamText = state.isCoopMode && owner !== playerIdx ? "（队友地产）" : "";
        state.logs.push(
          makeLog(logType, `${player.name} 抵达自家 ${cell.name}${teamText}`),
        );
        // 防禦路線：自己停留時獲得被動收入
        const selfProp = state.properties[player.position];
        if (
          selfProp?.upgradePath === 'defense' &&
          selfProp.buildings >= UPGRADE_PATH_UNLOCK_LEVEL &&
          owner === playerIdx
        ) {
          const passiveIncome = PROPERTY_UPGRADE_PATHS.defense.passiveIncomePerPass ?? 50;
          player.money += passiveIncome;
          state.logs.push(
            makeLog(logType, `【防禦路線】 ${cell.name} 產生被動收入 +${passiveIncome} 元`),
          );
        }
        state.phase = "rolling";
        state.currentPlayerIndex = getNextPlayer(state, playerIdx);
      } else {
        // 免费过路卡
        if (player.freePassRemaining > 0) {
          player.freePassRemaining--;
          state.logs.push(
            makeLog(
              "item",
              `${player.name} 使用免费过路卡，免除 ${cell.name} 过路费（剩余${player.freePassRemaining}次）`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          break;
        }
        // 护盾
        if (player.shieldCharges > 0) {
          player.shieldCharges -= 1;
          state.logs.push(
            makeLog(
              "item",
              `【護盾】 ${player.name} 的护盾抵挡了 ${cell.name} 过路费（剩余${player.shieldCharges}次）`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          break;
        }
        // 黑客：20%概率免过路费
        if (player.profession === "hacker" && Math.random() < 0.2) {
          state.logs.push(
            makeLog(
              logType,
              `【黑客】${player.name} 入侵系统，免除 ${cell.name} 过路费`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          break;
        }
        // 地產大亨：過路費收入+20%；旅行家：+10%；秋季：收益+15%
        const ownerPlayer = state.players[owner];
        const tycoonMultiplier = getTollIncomeMultiplier(ownerPlayer.profession);
        const autumnMultiplier = state.season?.type === 'autumn' ? 1.15 : 1;
        const tollIncomeMultiplier = tycoonMultiplier * autumnMultiplier;
        // 隱身藥水：不收也不付過路費
        if (player.invisibilityTurns && player.invisibilityTurns > 0) {
          state.logs.push(
            makeLog(
              logType,
              `【隱身】 ${player.name} 處於隱身狀態，免除 ${cell.name} 過路費`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          break;
        }
        if (ownerPlayer.invisibilityTurns && ownerPlayer.invisibilityTurns > 0) {
          state.logs.push(
            makeLog(
              logType,
              `【隱身】 ${ownerPlayer.name} 處於隱身狀態，無法收取 ${cell.name} 過路費`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          break;
        }
        // 隱形光學迷彩：經過對手地產不付過路費
        if (player.stealthCloakTurns && player.stealthCloakTurns > 0) {
          state.logs.push(
            makeLog(
              logType,
              `【光學迷彩】 ${player.name} 啟動隱形光學迷彩，免除 ${cell.name} 過路費`,
            ),
          );
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          break;
        }
        // 聯盟系統：結盟雙方互免過路費
        if (state.alliances && state.alliances.length > 0) {
          const isAllied = state.alliances.some(
            (a: AllianceState) =>
              (a.members[0] === playerIdx && a.members[1] === owner) ||
              (a.members[0] === owner && a.members[1] === playerIdx),
          );
          if (isAllied) {
            state.logs.push(
              makeLog(
                logType,
                `【聯盟】 ${player.name} 與 ${ownerPlayer.name} 結盟中，免除 ${cell.name} 過路費`,
              ),
            );
            state.phase = "rolling";
            state.currentPlayerIndex = getNextPlayer(state, playerIdx);
            break;
          }
        }
        // 戰爭系統：宣戰與被宣戰雙方互相收費翻倍
        let warMultiplier = 1;
        if (state.customRules?.enableWarSystem !== false && state.wars) {
          for (const war of state.wars) {
            if (
              (war.attackerIndex === playerIdx && war.defenderIndex === owner) ||
              (war.attackerIndex === owner && war.defenderIndex === playerIdx)
            ) {
              warMultiplier = 2;
              break;
            }
          }
        }
        // 寵物：機械狗 +5% 過路費收入
        let petMultiplier = 1;
        if (ownerPlayer.equippedPet === 'mechDog') {
          petMultiplier = 1.05;
        }
        // 稱號：常勝將軍 +10% 過路費
        let titleTollMultiplier = 1;
        if (ownerPlayer.equippedTitle === 'undefeated') {
          titleTollMultiplier = 1.1;
        }
        // 地產進化倍率
        let evolutionMultiplier = 1;
        if (state.customRules?.enablePropertyEvolution !== false) {
          const prop = state.properties[player.position];
          evolutionMultiplier = getEvolutionTollMultiplier(prop);
        }
        const tollWithMultiplier = Math.round(toll * tollIncomeMultiplier * warMultiplier * evolutionMultiplier * petMultiplier * titleTollMultiplier);
        // 資源兌換：下次過路費減免
        let resourceDiscount = 0;
        if (player.nextTollDiscount && player.nextTollDiscount > 0) {
          resourceDiscount = player.nextTollDiscount;
          player.nextTollDiscount = 0;
        }
        const actualToll = Math.max(0, Math.floor(tollWithMultiplier * (1 - resourceDiscount)));
        player.money = Math.max(0, player.money - actualToll);
        ownerPlayer.money = ownerPlayer.money + actualToll;
        player.tollPaid += actualToll;
        ownerPlayer.tollEarned += actualToll;
        player.tollExpense += actualToll;
        ownerPlayer.tollIncome += actualToll;
        // 合作模式：同步队伍金钱
        if (state.isCoopMode) {
          syncCoopMoneyFromPlayer(state, playerIdx);
          syncCoopMoneyFromPlayer(state, owner);
        }
        const bonusText = hasSetBonus ? "（套装加成×3）" : "";
        const tycoonText = ownerPlayer.profession === "tycoon" ? "【地产大亨】+20%" : "";
        const travelerText = ownerPlayer.profession === "traveler" ? "【旅行家】+10%" : "";
        const rainText = state.currentWeather === "rain" ? "【暴雨】×1.3" : "";
        const summerText = state.season?.type === 'summer' ? "【夏季】路費+20%" : "";
        const autumnText = state.season?.type === 'autumn' ? "【秋季】收益+15%" : "";
        const tollBonusSkill = getSkillValue(ownerPlayer.skillTree, 'toll_bonus');
        const skillText = tollBonusSkill > 0 ? `【技能】過路費+${Math.round(tollBonusSkill * 100)}%` : "";
        state.logs.push(
          makeLog(
            logType,
            `${player.name} 支付 ${actualToll} 元過路費${bonusText}${tycoonText}${travelerText}${rainText}${summerText}${autumnText}${skillText}給 ${ownerPlayer.name}`,
          ),
        );
        // 任務：累計支付過路費
        updateMissionProgress(state, "pay_toll", actualToll, playerIdx);
        // 聲望：付過路費 +1
        changeReputation(state, playerIdx, REPUTATION_GAIN_TOLL, "支付過路費");
        // 生存模式：收過路費的一方回復 15 點生命
        if (state.survivalMode) {
          ownerPlayer.health = Math.min(100, (ownerPlayer.health ?? 100) + 15);
          state.logs.push(
            makeLog(getPlayerLogType(owner), `【恢復】 【生存】${ownerPlayer.name} 收取過路費，恢復 15 點生命（當前 ${ownerPlayer.health}）`),
          );
        }
        // 奪寶模式：攜帶寶藏的玩家支付過路費時，寶藏掉落在當前位置
        if (state.treasureMode && state.treasureMode.treasureCarrier === playerIdx) {
          state.treasureMode.treasureDropPosition = player.position;
          state.treasureMode.treasureCarrier = null;
          state.logs.push(
            makeLog("system", `【奪寶】 寶藏掉落！${player.name} 在 ${getCellConfig(state, player.position).name} 失去了寶藏`),
          );
        }
        // 成就：资金低于1000标记
        if (player.money < 1000 && !player.hasBeenPoor) {
          player.hasBeenPoor = true;
        }
        // 科技路線：20% 概率感染對手，使其跳過下回合
        const propAfter = state.properties[player.position];
        if (
          propAfter?.upgradePath === 'tech' &&
          propAfter.buildings >= UPGRADE_PATH_UNLOCK_LEVEL &&
          player.money > 0 &&
          !player.negativeImmunityShield
        ) {
          const infectionChance = PROPERTY_UPGRADE_PATHS.tech.infectionChance ?? 0.2;
          if (Math.random() < infectionChance) {
            player.skipNextTurn = true;
            state.logs.push(
              makeLog(
                logType,
                `【數據感染】 ${player.name} 被 ${cell.name} 的數據病毒感染，跳過下一回合！`,
              ),
            );
          }
        }
        if (player.money <= 0) {
          const wentBankrupt = applyBankruptcyCheck(state, playerIdx);
          if (!wentBankrupt) {
            state.phase = "rolling";
            state.currentPlayerIndex = getNextPlayer(state, playerIdx);
          }
        } else {
          state.phase = "rolling";
          state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        }
      }
      break;
    }

    case "detention":
      // 偽身份證：一次性豁免進入監禁
      if (player.fakeIdActive) {
        player.fakeIdActive = false;
        state.logs.push(
          makeLog(
            logType,
            `【偽身份證】${player.name} 出示偽造證件，成功離開禁閉區！`,
          ),
        );
        state.phase = "rolling";
        state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        break;
      }
      // 黑客：50%概率直接逃脱
      if (player.profession === "hacker" && Math.random() < 0.5) {
        state.logs.push(
          makeLog(
            logType,
            `【黑客】${player.name} 入侵门禁系统，逃脱禁闭区`,
          ),
        );
        state.phase = "rolling";
        state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        break;
      }
      // 【技能】越獄大師：有概率直接越獄
      const jailBreakSkill = getSkillValue(player.skillTree, 'jail_master');
      if (jailBreakSkill > 0 && Math.random() < jailBreakSkill) {
        state.logs.push(
          makeLog(
            logType,
            `${player.name} 抵達禁閉區`,
          ),
        );
        state.logs.push(
          makeLog(
            logType,
            `【技能】越獄大師發動，成功越獄！`,
          ),
        );
        state.phase = "rolling";
        state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        break;
      }
      player.isInDetention = true;
      player.detentionTurns = 0;
      player.detentionCount++;
      state.logs.push(
        makeLog(
          logType,
          `${player.name} 被关进禁闭区`,
        ),
      );
      // 任務：進監獄
      updateMissionProgress(state, "go_to_jail", 1, playerIdx);
      state.phase = "rolling";
      state.currentPlayerIndex = getNextPlayer(state, playerIdx);
      break;

    case "fate": {
      const fateEnabled = state.mode !== "custom" || state.customRules?.enableFateCards !== false;
      if (!fateEnabled) {
        state.phase = "rolling";
        state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        break;
      }
      const isSpeculator = player.profession === "speculator";
      // 命运卡从牌堆抽一张（抽完自动重洗）
      let card: FateCard = drawFateCardFromDeck(state);
      // 【技能】抽卡幸運：有概率重抽，取較好結果（金錢效果取較高值）
      const luckyChance = getSkillValue(player.skillTree, 'lucky_draw');
      let luckyTriggered = false;
      if (luckyChance > 0 && Math.random() < luckyChance) {
        const secondCard: FateCard = drawFateCardFromDeck(state);
        // 金錢效果選較高值；其他效果保留第一張
        if (card.effect.type === 'money' && secondCard.effect.type === 'money') {
          card = secondCard.effect.amount >= card.effect.amount ? secondCard : card;
        }
        luckyTriggered = true;
      }
      player.cardDrawCount++;
      player.fateCardDraws++;
      state.pendingFateCard = card;
      state.phase = "fate";
      // 收藏圖鑑：解鎖命運卡
      if (state.codexUnlocked) {
        unlockCodexCard(state, `fate_${card.id}`);
      }
      if (isSpeculator) {
        state.logs.push(makeLog("fate", `【投机者】${player.name} 抽到命运卡：${card.name}`));
      } else {
        state.logs.push(makeLog("fate", `${player.name} 抽到命运卡：${card.name}`));
      }
      if (luckyTriggered) {
        state.logs.push(makeLog("fate", `【技能】抽卡幸運發動，獲得更好的結果`));
      }
      break;
    }

    case "chance": {
      const chanceEnabled = state.mode !== "custom" || state.customRules?.enableChanceCards !== false;
      if (!chanceEnabled) {
        state.phase = "rolling";
        state.currentPlayerIndex = getNextPlayer(state, playerIdx);
        break;
      }
      const isSpeculatorChance = player.profession === "speculator";
      // 机会卡从牌堆抽一张（抽完自动重洗）
      let chanceCard: ChanceCard = drawChanceCardFromDeck(state);
      // 【技能】抽卡幸運：有概率重抽，取較好結果（金錢效果取較高值）
      const luckyChanceCard = getSkillValue(player.skillTree, 'lucky_draw');
      let luckyChanceTriggered = false;
      if (luckyChanceCard > 0 && Math.random() < luckyChanceCard) {
        const secondChance: ChanceCard = drawChanceCardFromDeck(state);
        // 金錢效果選較高值；其他效果保留第一張
        if (chanceCard.effect.type === 'money' && secondChance.effect.type === 'money') {
          chanceCard = secondChance.effect.amount >= chanceCard.effect.amount ? secondChance : chanceCard;
        } else if (chanceCard.effect.type === 'lucky_star' && secondChance.effect.type === 'lucky_star') {
          chanceCard = secondChance.effect.amount >= chanceCard.effect.amount ? secondChance : chanceCard;
        }
        luckyChanceTriggered = true;
      }
      player.cardDrawCount++;
      player.chanceCardDraws++;
      state.pendingChanceCard = chanceCard;
      state.phase = "chance";
      // 收藏圖鑑：解鎖機會卡
      if (state.codexUnlocked) {
        unlockCodexCard(state, `chance_${chanceCard.id}`);
      }
      if (isSpeculatorChance) {
        state.logs.push(makeLog("chance", `【投机者】${player.name} 抽到机会卡：${chanceCard.name}`));
      } else {
        state.logs.push(makeLog("chance", `${player.name} 抽到机会卡：${chanceCard.name}`));
      }
      if (luckyChanceTriggered) {
        state.logs.push(makeLog("chance", `【技能】抽卡幸運發動，獲得更好的結果`));
      }
      break;
    }

    case "minigame": {
      const gameType = MINIGAME_TYPES[Math.floor(Math.random() * MINIGAME_TYPES.length)];
      state.pendingMiniGame = {
        type: gameType,
        playerIndex: playerIdx,
        reward: 0,
        finished: false,
      };
      state.logs.push(
        makeLog(
          "minigame",
          `【小遊戲】 ${player.name} 进入游戏区：${MINIGAME_NAMES[gameType]}`,
        ),
      );
      state.phase = "rolling";
      break;
    }
  }

  // 動態棋盤：命運漩渦 - 踩到的格子若有命運漩渦效果，額外抽一張命運卡
  if (hasFateZone && state.phase === "rolling" && cell.type === "property") {
    const fateEnabled = state.mode !== "custom" || state.customRules?.enableFateCards !== false;
    if (fateEnabled) {
      const isSpeculator = player.profession === "speculator";
      const card: FateCard = drawFateCard(isSpeculator);
      player.cardDrawCount++;
      player.fateCardDraws++;
      state.pendingFateCard = card;
      state.phase = "fate";
      state.logs.push(
        makeLog(
          "dynamic_board",
          `【漩渦】 ${cell.name} 觸發命運漩渦！抽到：${card.name}`,
        ),
      );
    }
  }

  // NPC 系統：檢查所在格子是否有 NPC
  if (state.npcs && state.npcs.length > 0) {
    const npcOnCell = state.npcs.find((n: NpcEntity) => n.cellId === player.position);
    if (npcOnCell) {
      state.pendingNpcInteraction = {
        npcId: npcOnCell.id,
        npcType: npcOnCell.type,
        playerIndex: playerIdx,
        cellId: player.position,
      };
      state.logs.push(
        makeLog(
          "npc",
          `${player.name} 遇見了 ${npcOnCell.name}！`,
        ),
      );
    }
  }

  return state;
}

export function processMove(state: GameState, dice: [number, number]): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const logType = getPlayerLogType(playerIdx);
  let d1 = dice[0];
  let d2 = dice[1];
  let sum = d1 + d2;

  // 克隆骰：複製上次擲骰點數（在所有加減步之前）
  if (player.cloneDiceActive && player.lastDiceValues) {
    d1 = player.lastDiceValues[0];
    d2 = player.lastDiceValues[1];
    sum = d1 + d2;
    player.cloneDiceActive = false;
    newState.logs.push(
      makeLog("item", `【道具】 克隆骰發動！複製上次點數 ${d1}+${d2} = ${sum}`),
    );
  }

  // 双倍骰：两个骰子都为最大值6
  if (player.doubleDiceActive) {
    player.doubleDiceActive = false;
    d1 = 6;
    d2 = 6;
    newState.logs.push(
      makeLog("item", `【地圖】 双倍骰发动！骰子结果为双6 ${d1}+${d2}`),
    );
  }

  // 遥控骰子：使用预设点数
  if (player.remoteDiceActive && player.remoteDiceValues) {
    player.remoteDiceActive = false;
    d1 = player.remoteDiceValues[0];
    d2 = player.remoteDiceValues[1];
    player.remoteDiceValues = undefined;
    newState.logs.push(
      makeLog("item", `【遙控】 遥控骰子发动！骰子结果为 ${d1}+${d2}`),
    );
  }

  // 數據牧師：獻祭獲得必出 7
  if (player.sacrificeLuckySeven) {
    player.sacrificeLuckySeven = false;
    d1 = 3;
    d2 = 4;
    sum = 7;
    newState.logs.push(
      makeLog("item", `【數據牧師】 神聖擲骰發動！必出 7（${d1}+${d2}）`),
    );
  }

  // 幸運模組：取較大的那次點數（重新 roll 一次，取較大總和）
  if (player.luckyDiceActive) {
    player.luckyDiceActive = false;
    const alt1 = Math.floor(Math.random() * 6) + 1;
    const alt2 = Math.floor(Math.random() * 6) + 1;
    const altSum = alt1 + alt2;
    if (altSum > sum) {
      d1 = alt1;
      d2 = alt2;
      sum = altSum;
    }
    newState.logs.push(
      makeLog("item", `【幸運模組】 兩次擲骰取大值：${sum}（${d1}+${d2}）`),
    );
  }

  // Buff 系统：回合开始时 buff 持续时间递减（但当前回合仍然有效）
  if (player.cardBuffs && player.cardBuffs.length > 0) {
    const expired: string[] = [];
    player.cardBuffs = player.cardBuffs.filter((b: { type: string; duration: number; description: string }) => {
      const remaining = b.duration - 1;
      if (remaining <= 0) {
        expired.push(b.description);
        return false;
      }
      b.duration = remaining;
      return true;
    });
    for (const desc of expired) {
      newState.logs.push(
        makeLog(logType, `⏱️ Buff 失效：${desc}`),
      );
    }
  }

  // Buff：speed_boost 移动+1
  const speedBuff = player.cardBuffs?.find((b: { type: string; duration: number; description: string }) => b.type === "speed_boost");
  if (speedBuff) {
    sum += 1;
    newState.logs.push(
      makeLog(logType, `【閃電】 加速 Buff 发动，移动 +1`),
    );
  }
  // Buff：double_move 移动翻倍
  const doubleMoveBuff = player.cardBuffs?.find((b: { type: string; duration: number; description: string }) => b.type === "double_move");
  if (doubleMoveBuff) {
    sum *= 2;
    newState.logs.push(
      makeLog(logType, `【火箭】 超速 Buff 发动，移动 ×2`),
    );
  }

  // 挑戰模式：命運輪盤 - 每回合強制抽一張命運卡（移動前發動）
  if (newState.challengeType === "fate_only") {
    const card = drawFateCard();
    newState.logs.push(
      makeLog(
        "fate",
        `【命運輪盤】 【命運輪盤】抽到：${card.name} - ${card.description}`,
      ),
    );
    applyCardEffect(newState, card.effect, card.name, card.description, "fate");
    player.fateCardDraws++;
    player.cardDrawCount++;
    // 檢查破產
    if (player.money <= getBankruptcyLine(newState)) {
      applyBankruptcyCheck(newState, playerIdx);
      if (newState.phase === "ended") return newState;
    }
  }

  // 挑戰模式：疾風奔馳 - 移動翻倍
  if (newState.challengeType === "double_move") {
    sum = sum * 2;
    newState.logs.push(
      makeLog("system", `【閃電】 【疾風奔馳】擲骰點數翻倍：${sum} 步`),
    );
  }

  // 雾霾：移动步数-1（最低1）
  if (newState.weatherMultipliers.moveReduction && newState.weatherMultipliers.moveReduction > 0) {
    const reduction = newState.weatherMultipliers.moveReduction;
    sum = Math.max(1, sum - reduction);
    newState.logs.push(
      makeLog("weather", `【霧霾】 雾霾影响，实际移动 ${sum} 步`),
    );
  }

  // 冬季：移動 -1 格（最低 1）
  if (newState.season?.type === 'winter') {
    const beforeWinter = sum;
    sum = Math.max(1, sum - 1);
    if (sum !== beforeWinter) {
      newState.logs.push(
        makeLog("season", `【凜冬】 凜冬將至，實際移動 ${sum} 步`),
      );
    }
  }

  // 寵物：飛碟每回合 +1 格
  if (player.equippedPet === 'ufo') {
    sum += 1;
    newState.logs.push(
      makeLog("pet", `【飛碟】 ${player.name} 的飛碟助力，額外 +1 格`),
    );
  }



  // 旅行家：10%概率多走1步
  if (player.profession === "traveler" && Math.random() < 0.1) {
    sum += 1;
    newState.logs.push(
      makeLog(logType, `【旅行家】${player.name} 發現捷徑，多走 1 步（共 ${sum} 步）`),
    );
  }

  newState.diceValues = [d1, d2];
  newState.lastDiceValues = [d1, d2];
  // 記錄玩家上次擲骰點數（用於克隆骰）
  player.lastDiceValues = [d1, d2];

  // 監禁中：跳過消耗型回合開始效果（被動收入、藥水倒數、生存扣血等）
  if (!player.isInDetention) {
    // 賽博改造人：重置本回合擲骰微調次數
    if (player.profession === "cyberborg") {
      player.diceAdjustedThisTurn = false;
    }

    // 医生：每回合开始恢复200元
    if (player.profession === "doctor") {
      player.money += 200;
      newState.logs.push(
        makeLog(logType, `【医生】${player.name} 被动收入 +200元`),
      );
      if (newState.isCoopMode) {
        syncCoopMoneyFromPlayer(newState, playerIdx);
      }
    }

    // 區塊鏈礦工：每回合開始按持有地產數被動收益（每塊+20，最多+200）
    if (player.profession === "blockchain_miner") {
      const holdings = Object.values(newState.properties).filter(
        (p: PropertyState) => p.owner === playerIdx && !p.isMortgaged,
      ).length;
      const income = Math.min(200, holdings * 20);
      if (income > 0) {
        player.money += income;
        newState.logs.push(
          makeLog(logType, `【礦工】 【礦工】${player.name} 挖礦收益 +${income}元（${holdings}塊地產）`),
        );
        if (newState.isCoopMode) {
          syncCoopMoneyFromPlayer(newState, playerIdx);
        }
      }
    }

    // 金錢樹：每回合+200元
    if (player.moneyTreeTurns && player.moneyTreeTurns > 0) {
      player.money += 200;
      player.moneyTreeTurns -= 1;
      newState.logs.push(
        makeLog(logType, `【金錢樹】 金錢樹產出 +200元（剩餘 ${player.moneyTreeTurns} 回合）`),
      );
      if (newState.isCoopMode) {
        syncCoopMoneyFromPlayer(newState, playerIdx);
      }
    }

    // 隱身藥水回合遞減（在玩家回合開始時）
    if (player.invisibilityTurns && player.invisibilityTurns > 0) {
      player.invisibilityTurns -= 1;
      if (player.invisibilityTurns === 0) {
        newState.logs.push(
          makeLog(logType, `【隱身】 ${player.name} 的隱身藥水效果已結束`),
        );
      }
    }

    // 隱形光學迷彩回合遞減
    if (player.stealthCloakTurns && player.stealthCloakTurns > 0) {
      player.stealthCloakTurns -= 1;
      if (player.stealthCloakTurns === 0) {
        newState.logs.push(
          makeLog(logType, `【光學迷彩】 ${player.name} 的隱形光學迷彩效果已結束`),
        );
      }
    }

    // 重置本回合過路費加成（義體強化 / 數據牧師buff 等，持續到下次回合開始前）
    if (player.tollBoostThisTurn && player.tollBoostThisTurn > 0) {
      player.tollBoostThisTurn = 0;
    }

    // 電磁脈衝：跳過本回合
    if (player.skipNextTurn) {
      player.skipNextTurn = false;
      if (player.empExtraSkip) {
        player.empExtraSkip = false;
        player.skipNextTurn = true;
      }
      newState.logs.push(
        makeLog(logType, `【閃電】 ${player.name} 受到電磁脈衝影響，本回合無法行動`),
      );
      newState.phase = "rolling";
      newState.currentPlayerIndex = getNextPlayer(newState, playerIdx);
      return newState;
    }

    // 生存模式：每回合開始扣血 5 點
    if (newState.survivalMode) {
      player.health = Math.max(0, (player.health ?? 100) - 5);
      newState.logs.push(
        makeLog(logType, `【淘汰】 【生存】${player.name} 扣除 5 點生命，剩餘 ${player.health} 點`),
      );
      if (player.health <= 0) {
        player.isBankrupt = true;
        if (!newState.bankruptPlayers.includes(playerIdx)) {
          newState.bankruptPlayers.push(playerIdx);
        }
        if (!newState.bankruptcyList) newState.bankruptcyList = [];
        if (!newState.bankruptcyList.includes(playerIdx)) {
          newState.bankruptcyList.push(playerIdx);
        }
        newState.logs.push(
          makeLog("system", `【淘汰】 ${player.name} 血量歸零，被淘汰出局！`),
        );
        newState.phase = "rolling";
        newState.currentPlayerIndex = getNextPlayer(newState, playerIdx);
        const winnerIdx = checkWinner(newState);
        if (winnerIdx !== null) {
          newState.winner = winnerIdx;
          newState.phase = "ended";
          checkAndUnlockAchievements(newState, winnerIdx);
        }
        return newState;
      }
    }
  }

  // 記錄移動前的位置（用於時光機）
  player.previousPosition = player.position;

  // 监禁状态处理
  if (player.isInDetention) {
    // 使用免费出狱卡
    if (player.hasGetOutOfJailCard) {
      player.hasGetOutOfJailCard = false;
      player.isInDetention = false;
      player.detentionTurns = 0;
      player.consecutiveDoubles = 0;
      newState.logs.push(
        makeLog(logType, `${player.name} 使用免费出狱卡，直接出狱，本回合可继续行动`),
      );
      // 出獄後繼續執行下方移動邏輯，保留本回合行動權
    }

    // 监禁摇骰
    player.detentionTurns++;
    const isDoubles = d1 === d2;

    if (isDoubles) {
      const currentTurn = player.detentionTurns;
      player.isInDetention = false;
      player.detentionTurns = 0;
      player.consecutiveDoubles = 0;
      newState.logs.push(
        makeLog(
          logType,
          `監禁第${currentTurn}回合，擲出${d1}+${d2}，相同→出獄，正常移動 ${sum} 步`,
        ),
      );
      // 出獄後按本次骰子點數正常移動，跳出監禁處理繼續執行下方移動邏輯
    } else if (player.detentionTurns < 3) {
      newState.logs.push(
        makeLog(
          logType,
          `監禁第${player.detentionTurns}回合，擲出${d1}+${d2}，不同→繼續監禁`,
        ),
      );
      newState.phase = "rolling";
      newState.currentPlayerIndex = getNextPlayer(newState, playerIdx);
      return newState;
    } else {
      // 已滿3回合，強制出獄
      const currentTurn = player.detentionTurns;
      player.isInDetention = false;
      player.detentionTurns = 0;
      player.consecutiveDoubles = 0;
      newState.logs.push(
        makeLog(
          logType,
          `監禁第${currentTurn}回合，擲出${d1}+${d2}，已滿3回合→強制出獄，正常移動 ${sum} 步`,
        ),
      );
      // 出獄後按本次骰子點數正常移動，跳出監禁處理繼續執行下方移動邏輯
    }
  }

  // 正常移动
  const oldPosition = player.position;
  let newPosition = clampPosition(oldPosition + sum);
  player.position = newPosition;

  newState.logs.push(
    makeLog(logType, `${player.name} 掷出 ${d1}+${d2}=${sum} 点`),
  );

  // 大逃杀模式：如果落到已销毁格子，继续前进到下一个安全格
  let passedStartFromDestroy = false;
  if (newState.isBattleRoyale && isCellDestroyed(newState, newPosition)) {
    const destroyedName = CELLS[newPosition].name;
    const safePos = findNextSafeCell(newState, newPosition);
    // 检查是否会经过起点
    if (safePos < newPosition || safePos === 0) {
      passedStartFromDestroy = true;
    }
    newPosition = safePos;
    player.position = newPosition;
    newState.logs.push(
      makeLog(
        "zone_destroy",
        `【廢墟】 ${destroyedName} 已是废墟，前进到 ${CELLS[newPosition].name}`,
      ),
    );
  }

  if (newPosition < oldPosition || passedStartFromDestroy) {
    const baseReward = getStartBonus(newState.mode, player.profession, newState.customRules, newState.inflationRate);
    const wealthBonus = getSkillValue(player.skillTree, 'wealth_sense');
    const reward = newState.weatherMultipliers.incomeMultiplier
      ? Math.round(baseReward * newState.weatherMultipliers.incomeMultiplier) + wealthBonus
      : baseReward + wealthBonus;
    player.money += reward;
    const bankerText = player.profession === "banker" ? "【银行家】+500" : "";
    const sunnyText = newState.currentWeather === "sunny" ? "【晴天】×1.2" : "";
    const skillText = wealthBonus > 0 ? `【技能】財富嗅覺，額外獲得 $${wealthBonus}` : "";
    newState.logs.push(
      makeLog(logType, `${player.name} 经过起点，获得 ${reward} 元奖励${bankerText}${sunnyText}${skillText}`),
    );
    // 任務：經過起點
    updateMissionProgress(newState, "pass_start", 1, playerIdx);
    // 合作模式：同步队伍金钱
    if (newState.isCoopMode) {
      syncCoopMoneyFromPlayer(newState, playerIdx);
    }
    // 網紅：流量變現，粉絲數（持有地產數）× 10 元額外獎勵
    if (player.profession === "influencer") {
      const followers = Object.values(newState.properties).filter(
        (p: PropertyState) => p.owner === playerIdx && !p.isMortgaged,
      ).length;
      const bonus = followers * 10;
      if (bonus > 0) {
        player.money += bonus;
        newState.logs.push(
          makeLog(logType, `【網紅】 【網紅】${player.name} 流量變現 +${bonus}元（${followers} 粉絲）`),
        );
        if (newState.isCoopMode) {
          syncCoopMoneyFromPlayer(newState, playerIdx);
        }
      }
    }
    // 競速模式：完成一圈，圈數 +1 並獎勵加速道具
    if (newState.raceMode && newState.raceMode.lapsCompleted) {
      newState.raceMode.lapsCompleted[playerIdx] = (newState.raceMode.lapsCompleted[playerIdx] ?? 0) + 1;
      const currentLap = newState.raceMode.lapsCompleted[playerIdx];
      // 獎勵：雙倍骰持續 2 回合（以 doubleDiceActive + 立即補充一個 double_dice 道具體現）
      if (player.items.length < MAX_ITEMS) {
        player.items.push({ type: "double_dice", id: nextItemId++ });
        newState.logs.push(
          makeLog("item", `【競速】 【競速】${player.name} 完成第 ${currentLap} 圈，獲得雙倍骰道具！`),
        );
      } else {
        player.doubleDiceActive = true;
        newState.logs.push(
          makeLog("item", `【競速】 【競速】${player.name} 完成第 ${currentLap} 圈，雙倍骰已激活！`),
        );
      }
    }
    // 奪寶模式：攜帶寶藏繞行起點 → 獲勝
    if (newState.treasureMode && newState.treasureMode.treasureCarrier === playerIdx) {
      const winnerIdx = checkWinner(newState);
      if (winnerIdx !== null) {
        newState.winner = winnerIdx;
        newState.phase = "ended";
        newState.logs.push(
          makeLog("system", `【奪寶】 ${player.name} 帶著寶藏返回起點，獲得勝利！`),
        );
        checkAndUnlockAchievements(newState, winnerIdx);
        return newState;
      }
    }
  }

  const landedState = applyCellLanding(newState);

  // 雙倍骰（d1 === d2）：連續累計，3 連雙直接進監禁並結束回合；未滿 3 次則保留回合繼續擲
  const isDoubles = d1 === d2;
  if (isDoubles && !landedState.players[playerIdx].isInDetention && landedState.phase !== "ended") {
    const afterPlayer = landedState.players[playerIdx];
    afterPlayer.consecutiveDoubles = (afterPlayer.consecutiveDoubles ?? 0) + 1;
    if (afterPlayer.consecutiveDoubles >= 3) {
      // 三連雙：直接進監禁，結束回合
      if (afterPlayer.fakeIdActive) {
        afterPlayer.fakeIdActive = false;
        afterPlayer.isInDetention = false;
        afterPlayer.detentionTurns = 0;
        afterPlayer.consecutiveDoubles = 0;
        landedState.logs.push(
          makeLog(
            logType,
            `${afterPlayer.name} 連續擲出三次雙倍，被關進監禁區！`,
          ),
        );
        landedState.logs.push(
          makeLog(
            logType,
            `【偽身份證】${afterPlayer.name} 出示偽造證件，當場獲釋！`,
          ),
        );
        landedState.phase = "rolling";
        landedState.currentPlayerIndex = getNextPlayer(landedState, playerIdx);
        return handleRoundEnd(landedState, playerIdx);
      }
      afterPlayer.isInDetention = true;
      afterPlayer.detentionTurns = 0;
      afterPlayer.detentionCount++;
      afterPlayer.consecutiveDoubles = 0;
      landedState.logs.push(
        makeLog(
          logType,
          `${afterPlayer.name} 連續擲出三次雙倍，被關進監禁區！`,
        ),
      );
      updateMissionProgress(landedState, "go_to_jail", 1, playerIdx);
      landedState.phase = "rolling";
      landedState.currentPlayerIndex = getNextPlayer(landedState, playerIdx);
      return handleRoundEnd(landedState, playerIdx);
    }
    // 未滿 3 連雙：保留當前玩家回合，進入 rolling phase 繼續擲骰
    landedState.logs.push(
      makeLog(
        logType,
        `${afterPlayer.name} 擲出雙倍（連續第 ${afterPlayer.consecutiveDoubles} 次），獲得額外行動機會`,
      ),
    );
    landedState.phase = "rolling";
    return landedState;
  }

  // 非雙倍或已進監禁/結束：清零連續計數，結束回合
  if (!isDoubles) {
    landedState.players[playerIdx].consecutiveDoubles = 0;
  }

  // 回合结束处理（仅在一轮结束时触发股票更新和全局事件）
  return handleRoundEnd(landedState, playerIdx);
}

export function applyBuyDecision(state: GameState, buy: boolean): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const cellId = player.position;
  const cell = getCellConfig(newState, cellId);
  const existingProp = newState.properties[cellId];
  if (existingProp && existingProp.owner !== undefined && existingProp.owner !== -1) {
    return newState;
  }
  const basePrice = getCellPrice(cellId, newState.mode, newState.customRules, newState.boardCells);
  const eventMultiplier = newState.globalEventMultipliers.propertyPriceMultiplier ?? 1;
  const weatherDiscount = newState.weatherMultipliers.propertyPriceDiscount ?? 0;
  const inflationMult = newState.inflationRate ?? 1;
  let eventPrice = Math.round(basePrice * eventMultiplier * inflationMult);
  // 挑戰模式：地價翻倍
  if (newState.challengeType === "double_rent") {
    eventPrice = Math.round(eventPrice * 2);
  }
  const buyDiscount = getSkillValue(player.skillTree, 'buy_discount');
  // 春季：買地 -10%（與聲望折扣取最大優惠，即最低價格）
  const springDiscount = newState.season?.type === 'spring' ? 0.10 : 0;
  let price = Math.round(getBuyPriceDiscount(eventPrice, player.profession) * (1 - weatherDiscount) * (1 - buyDiscount));
  // 先計算春季折扣價
  const springPrice = springDiscount > 0 ? Math.round(price * (1 - springDiscount)) : price;
  // 聲望效果：>70 打9折，<30 漲1.5倍
  const playerRep = player.reputation ?? REPUTATION_INITIAL;
  let repText = "";
  let repPrice = price;
  if (playerRep > REPUTATION_HIGH_THRESHOLD) {
    repPrice = Math.round(price * 0.9);
    repText = "【高聲望】9折";
  } else if (playerRep < REPUTATION_LOW_THRESHOLD) {
    repPrice = Math.round(price * 1.5);
    repText = "【低聲望】溢價50%";
  }
  // 春季折扣與聲望折扣取最大優惠（最低價格）
  price = Math.floor(Math.min(repPrice, springPrice));
  const springText = springDiscount > 0 && price === springPrice ? "【春季】買地9折" : "";
  // 如果春季折扣生效了，調整 repText 顯示（聲望漲價與春季折扣可能同時作用）
  if (springDiscount > 0 && price === springPrice && playerRep < REPUTATION_LOW_THRESHOLD) {
    repText = "【低聲望】溢價50%（春季折扣抵消部分）";
  }
  const logType = getPlayerLogType(playerIdx);

  // 皇帝模式：皇帝的 buy_discount buff，買地價格 ×0.9
  let emperorDiscountText = "";
  if (newState.emperorMode && newState.emperorMode.emperorIndex === playerIdx && newState.emperorMode.emperorBuff === "buy_discount") {
    const oldPrice = price;
    price = Math.round(price * 0.9);
    emperorDiscountText = `【皇帝】買地9折（節省 ${oldPrice - price} 元）`;
  }

  // 駭客後門：買地 8 折
  let backdoorText = "";
  if (buy && player.nextBuyDiscount && player.nextBuyDiscount > 0) {
    const oldPrice = price;
    price = Math.round(price * (1 - player.nextBuyDiscount));
    backdoorText = `【駭客後門】${Math.round(player.nextBuyDiscount * 10)}折（節省 ${oldPrice - price} 元）`;
    player.nextBuyDiscount = 0;
  }
  // 資源兌換：下次買地折扣
  let resourceBuyText = "";
  if (buy && player.nextBuyDiscountResource && player.nextBuyDiscountResource > 0) {
    const oldPrice = price;
    price = Math.round(price * (1 - player.nextBuyDiscountResource));
    resourceBuyText = `【資源兌換】${Math.round((1 - player.nextBuyDiscountResource) * 10)}折（節省 ${oldPrice - price} 元）`;
    player.nextBuyDiscountResource = 0;
  }

  if (buy && player.money >= price) {
    player.money = Math.max(0, player.money - Math.floor(price));
    newState.ownedProperties[cellId] = playerIdx;
    newState.properties[cellId] = {
      owner: playerIdx,
      ownerTeam: newState.isCoopMode ? getPlayerTeam(newState, playerIdx) : undefined,
      buildings: 0,
      isMortgaged: false,
      insured: false,
    };
    const discountText = player.profession === "tycoon" ? "【地产大亨】9折" : "";
    const skillSaving = buyDiscount > 0 ? Math.round(eventPrice * buyDiscount) : 0;
    const skillText = buyDiscount > 0 ? `【技能】買地折扣，節省 $${skillSaving}` : "";
    newState.logs.push(
      makeLog(logType, `${player.name} ${discountText}${repText}${springText}${emperorDiscountText}${backdoorText}${resourceBuyText}購買了 ${cell.name}（-${price}元）${skillText}`),
    );
    // 聲望：買地 +5
    changeReputation(newState, playerIdx, REPUTATION_GAIN_TRADE, "買地交易");
    // 生存模式：買地成功回復 10 點生命
    if (newState.survivalMode) {
      player.health = Math.min(100, (player.health ?? 100) + 10);
      newState.logs.push(
        makeLog(logType, `【恢復】 【生存】${player.name} 買地成功，恢復 10 點生命（當前 ${player.health}）`),
      );
    }
    // 合作模式：同步队伍金钱
    if (newState.isCoopMode) {
      syncCoopMoneyFromPlayer(newState, playerIdx);
    }
    updateCompleteSets(newState);
    updateBuildingCounts(newState);
    updatePlayerAssets(newState);
    // 收藏圖鑑：解鎖地塊
    if (newState.codexUnlocked) {
      unlockCodexProperty(newState, cellId);
    }
    // 任務：買地
    updateMissionProgress(newState, "buy_properties", 1, playerIdx);
    // 任務：套裝完成（檢查買地後是否新湊齊了一套）
    if (player.completeSets > 0) {
      const cellSetId = getCellSet(cellId);
      if (cellSetId && checkSetCompleteFromProperties(
        playerIdx,
        cellSetId,
        newState.properties,
        newState.isCoopMode,
        newState.isCoopMode ? getPlayerTeam(newState, playerIdx) : undefined,
      )) {
        updateMissionProgress(newState, "complete_set", 1, playerIdx);
      }
    }
    // 設置可撤銷操作（買地）
    newState.lastAction = {
      type: 'buy',
      playerIndex: playerIdx,
      cellId,
      timestamp: Date.now(),
      data: { price },
    };
  } else if (buy) {
    newState.logs.push(
      makeLog(logType, `${player.name} 现金不足，无法购买 ${cell.name}`),
    );
  } else {
    newState.logs.push(makeLog(logType, `${player.name} 放弃购买 ${cell.name}`));
  }

  newState.phase = "rolling";
  newState.currentPlayerIndex = getNextPlayer(newState, playerIdx);
  return handleRoundEnd(newState, playerIdx);
}

function getBankruptcyLine(state: GameState): number {
  if (state.mode === "custom" && state.customRules) {
    return state.customRules.bankruptcyLine;
  }
  return 0;
}

function applyBankruptcyCheck(
  state: GameState,
  playerIdx: number,
  creditorIdx?: number,
  depth: number = 0,
): boolean {
  const player = state.players[playerIdx];
  const bankruptcyLine = getBankruptcyLine(state);

  // 已經破產的玩家不再處理
  if (player.isBankrupt) return false;

  // 生存模式：金錢歸零不導致破產，只有血量歸零才淘汰
  if (state.survivalMode) {
    // 金錢可以為負（欠債），不標記破產
    return false;
  }

  // 競速模式：破產只是標記，不立即淘汰，仍可繼續移動
  if (state.raceMode) {
    // 標記破產但不處理資產清算，玩家仍可繼續繞圈
    player.isBankrupt = true;
    if (!state.bankruptPlayers.includes(playerIdx)) {
      state.bankruptPlayers.push(playerIdx);
    }
    if (!state.bankruptcyList) state.bankruptcyList = [];
    if (!state.bankruptcyList.includes(playerIdx)) {
      state.bankruptcyList.push(playerIdx);
    }
    state.logs.push(
      makeLog("system", `【競速】 【競速】${player.name} 資金見底，但比賽繼續！`),
    );
    return true;
  }

  // 連鎖破產深度限制（最多3次連鎖）
  if (depth > 3) return false;

  // 合作模式：判断队伍破产
  if (state.isCoopMode && state.teams && player.teamId) {
    const teamId = player.teamId;
    const team = state.teams[teamId];
    const teamMoney = team.money;

    if (teamMoney <= bankruptcyLine) {
      // 检查队伍是否还有可抵押地产
      const teamProps = getTeamProperties(state, teamId);
      const hasUnmortgaged = Object.values(teamProps).some(
        (p: PropertyState) => !p.isMortgaged && p.buildings === 0,
      );
      if (hasUnmortgaged) {
        // 还有可抵押的，先不判定整个队伍破产，只标记当前玩家破产
        // 合作模式继承系统：破产玩家的资产由队友继承（扣除50%葬礼费）
        player.isBankrupt = true;
        if (!state.bankruptPlayers.includes(playerIdx)) {
          state.bankruptPlayers.push(playerIdx);
        }
        if (!state.bankruptcyList) {
          state.bankruptcyList = [];
        }
        if (!state.bankruptcyList.includes(playerIdx)) {
          state.bankruptcyList.push(playerIdx);
        }

        // 找到未破产的队友
        const teammateIdx = team.playerIndices.find(
          (idx: number) => idx !== playerIdx && !state.players[idx]?.isBankrupt,
        );

        if (teammateIdx !== undefined) {
          // 继承逻辑：资产留在队伍（合作模式共享），地产 owner 改为队友索引（保留 ownerTeam）
          for (const cIdStr of Object.keys(state.properties)) {
            const cId = Number(cIdStr);
            const p = state.properties[cId];
            if (p && p.owner === playerIdx && p.ownerTeam === teamId) {
              p.owner = teammateIdx;
            }
          }

          const teammateName = state.players[teammateIdx].name;
          state.logs.push(
            makeLog(
              "team",
              `玩家${player.name} 破產，資產由隊友${teammateName}繼承`,
            ),
          );
        } else {
          state.logs.push(
            makeLog(
              "team",
              `${player.name} 破产！${team.name} 继续由队友支撑`,
            ),
          );
        }

        // 检查队伍是否全灭
        const allBankrupt = team.playerIndices.every(
          (idx: number) => state.players[idx]?.isBankrupt,
        );
        if (allBankrupt) {
          // 整个队伍破产
          const winnerIdx = checkWinner(state);
          state.winner = winnerIdx;
          if (winnerIdx !== null) {
            state.phase = "ended";
            const winnerTeamId = getPlayerTeam(state, winnerIdx);
            const winnerTeamName = winnerTeamId && state.teams[winnerTeamId]
              ? state.teams[winnerTeamId].name
              : state.players[winnerIdx].name;
             state.logs.push(
               makeLog(
                 "team",
                 `${team.name} 全軍覆沒！${winnerTeamName} 獲勝！本局共有 ${state.bankruptcyList?.length ?? state.bankruptPlayers.length} 位玩家破產`,
               ),
             );
             checkAndUnlockAchievements(state, winnerIdx);
           }
           return true;
        }
        return false;
      }
      // 无可抵押 → 整个队伍破产
       for (const idx of team.playerIndices) {
         state.players[idx].isBankrupt = true;
         state.players[idx].stocks = [];
         state.players[idx].stockBoughtTotal = 0;
         state.players[idx].stockSoldTotal = 0;
         state.players[idx].loan = 0;
         if (!state.bankruptPlayers.includes(idx)) {
           state.bankruptPlayers.push(idx);
         }
         if (!state.bankruptcyList) {
           state.bankruptcyList = [];
         }
         if (!state.bankruptcyList.includes(idx)) {
           state.bankruptcyList.push(idx);
         }
       }
      team.loan = 0;
      const winnerIdx = checkWinner(state);
      state.winner = winnerIdx;
      if (winnerIdx !== null) {
        state.phase = "ended";
        const winnerTeamId = getPlayerTeam(state, winnerIdx);
        const winnerTeamName = winnerTeamId && state.teams[winnerTeamId]
          ? state.teams[winnerTeamId].name
          : state.players[winnerIdx].name;
        state.logs.push(
          makeLog(
            "team",
            `${team.name} 破產！${winnerTeamName} 獲勝！本局共有 ${state.bankruptcyList?.length ?? state.bankruptPlayers.length} 位玩家破產`,
          ),
        );
        checkAndUnlockAchievements(state, winnerIdx);
      }
      return true;
    }
    // 队伍还有钱，但玩家个人？不，合作模式共用金库，玩家 money 同步
    // 只有当队伍资金不足时才破产
    return false;
  }

  if (player.money <= bankruptcyLine) {
    // 医生复活技能
    if (player.profession === "doctor" && !player.hasUsedRevival) {
      player.hasUsedRevival = true;
      // 先償還債務：有債主時將剩餘資產轉給債主
      if (creditorIdx !== undefined && depth < 3 && !state.isCoopMode) {
        const creditor = state.players[creditorIdx];
        if (creditor && !creditor.isBankrupt) {
          // 將所有現金（僅正數部分）給債主
          if (player.money > 0) {
            creditor.money += player.money;
          }
          // 將所有地產過戶給債主
          for (const cIdStr of Object.keys(state.properties)) {
            const cId = Number(cIdStr);
            const p = state.properties[cId];
            if (p && p.owner === playerIdx) {
              p.owner = creditorIdx;
              state.ownedProperties[cId] = creditorIdx;
            }
          }
          // 將道具轉移給債主
          if (player.items && player.items.length > 0) {
            creditor.items = [...creditor.items, ...player.items];
            player.items = [];
          }
          updateCompleteSets(state);
          updateBuildingCounts(state);
          updatePlayerAssets(state);
        }
      } else {
        // 無債主：地產充公（銀行）
        for (const cIdStr of Object.keys(state.properties)) {
          const cId = Number(cIdStr);
          const p = state.properties[cId];
          if (p && p.owner === playerIdx) {
            delete state.properties[cId];
            delete state.ownedProperties[cId];
          }
        }
        updateCompleteSets(state);
        updateBuildingCounts(state);
        updatePlayerAssets(state);
      }
      // 復活後保留 1000 元
      player.money = 1000;
      if (state.isCoopMode) {
        syncCoopMoneyFromPlayer(state, playerIdx);
      }
      state.logs.push(
        makeLog(
          "system",
          `【医生】${player.name} 触发复活！償還債務後保留1000元`,
        ),
      );
      return false;
    }
    // 破产时股票归零
    player.stocks = [];
    player.stockBoughtTotal = 0;
    player.stockSoldTotal = 0;
    // 破产时贷款核销（银行承担损失）
    player.loan = 0;
    player.isBankrupt = true;
    if (!state.bankruptPlayers.includes(playerIdx)) {
      state.bankruptPlayers.push(playerIdx);
    }
    // 加入破產順序列表
    if (!state.bankruptcyList) {
      state.bankruptcyList = [];
    }
    if (!state.bankruptcyList.includes(playerIdx)) {
      state.bankruptcyList.push(playerIdx);
    }

    // 連鎖破產：如果有債主，將剩餘資產轉移給債主並檢查債主是否也破產
    if (creditorIdx !== undefined && depth < 3 && !state.isCoopMode) {
      const creditor = state.players[creditorIdx];
      if (creditor && !creditor.isBankrupt) {
        // 轉移破產玩家的所有現金給債主（雖然可能是負數）
        if (player.money > 0) {
          creditor.money += player.money;
        }
        // 轉移所有地產給債主
        for (const cIdStr of Object.keys(state.properties)) {
          const cId = Number(cIdStr);
          const p = state.properties[cId];
          if (p && p.owner === playerIdx) {
            p.owner = creditorIdx;
            state.ownedProperties[cId] = creditorIdx;
          }
        }
        // 轉移道具
        if (player.items && player.items.length > 0) {
          creditor.items = [...creditor.items, ...player.items];
          player.items = [];
        }

        updateCompleteSets(state);
        updateBuildingCounts(state);
        updatePlayerAssets(state);

        // 檢查債主是否也破產（連鎖反應）
        if (creditor.money <= bankruptcyLine) {
          state.logs.push(
            makeLog(
              "chain_bankruptcy",
              `【連鎖破產】 ${creditor.name} 因連鎖反應宣告破產！`,
            ),
          );
          applyBankruptcyCheck(state, creditorIdx, undefined, depth + 1);
        }
      }
    }

    const winnerIdx = checkWinner(state);
    state.winner = winnerIdx;
    if (winnerIdx !== null) {
      state.phase = "ended";
      // 遊戲結束時，將所有破產玩家按順序記錄
      if (!state.bankruptcyList) {
        state.bankruptcyList = [...state.bankruptPlayers];
      }
      const bankruptCount = state.bankruptcyList.length;
      state.logs.push(
        makeLog(
          "system",
          `${player.name} 破產！${state.players[winnerIdx].name} 獲勝！本局共有 ${bankruptCount} 位玩家破產`,
        ),
      );
      // 胜利时检查成就
      checkAndUnlockAchievements(state, winnerIdx);
    } else if (depth > 0) {
      // 連鎖破產的非首輪不重複寫一般破產日誌
      state.logs.push(
        makeLog(
          "system",
          `剩餘 ${state.players.length - state.bankruptPlayers.length} 位玩家繼續`,
        ),
      );
    } else {
      state.logs.push(
        makeLog(
          "system",
          `${player.name} 破產！剩餘 ${state.players.length - state.bankruptPlayers.length} 位玩家繼續`,
        ),
      );
    }
    return true;
  }
  return false;
}

/**
 * 处理卡牌移动/传送后的落地事件
 */
function handleCardMoveLanding(state: GameState, playerIdx: number): void {
  const position = state.players[playerIdx].position;
  const cellAfter = getCellConfig(state, position);

  if (cellAfter.type === "fate") {
    const fateCard = drawFateCardFromDeck(state);
    state.pendingFateCard = fateCard;
    state.phase = "fate";
  } else if (cellAfter.type === "chance") {
    const chanceCard = drawChanceCardFromDeck(state);
    state.pendingChanceCard = chanceCard;
    state.phase = "chance";
  } else if (cellAfter.type === "start") {
    const reward = getStartBonus(state.mode, state.players[playerIdx].profession, state.customRules, state.inflationRate);
    state.players[playerIdx].money += reward;
    state.logs.push(
      makeLog("system", `${state.players[playerIdx].name} 經過起點，獲得 ${reward} 元`),
    );
    state.phase = "rolling";
    state.currentPlayerIndex = getNextPlayer(state, playerIdx);
  } else {
    applyCellLanding(state);
  }
}

function applyCardEffect(
  state: GameState,
  effect: CardEffect,
  cardName: string,
  cardDescription: string,
  logType: "fate" | "chance",
): void {
  const playerIdx = state.currentPlayerIndex;
  const player = state.players[playerIdx];
  const baseConfig = GAME_MODES[state.mode];
  const config = state.mode === "custom" && state.customRules
    ? {
        fateMoneyMultiplier: state.customRules.fateMoneyMultiplier,
        startReward: state.customRules.goBonus,
      }
    : baseConfig;
  const oldPosition = player.position;
  let passedStart = false;

  switch (effect.type) {
    case "money": {
      const professionMult = getCardMoneyMultiplier(player.profession);
      const weatherMult = state.weatherMultipliers.cardMoneyMultiplier ?? 1;
      let amount = Math.round(effect.amount * config.fateMoneyMultiplier * professionMult * weatherMult);
      // Buff：wealth_luck 金钱卡效果 +50%
      const wealthBuff = player.cardBuffs?.find((b: { type: string; duration: number; description: string }) => b.type === "wealth_luck");
      if (wealthBuff && amount > 0) {
        amount = Math.round(amount * 1.5);
      }
      // Buff：tax_relief 金钱损失 -30%
      const taxBuff = player.cardBuffs?.find((b: { type: string; duration: number; description: string }) => b.type === "tax_relief");
      if (taxBuff && amount < 0) {
        amount = Math.round(amount * 0.7);
      }
      // 律師：罰款30%概率豁免
      if (amount < 0 && player.profession === "lawyer" && Math.random() < 0.3) {
        amount = 0;
        state.logs.push(
          makeLog(
            logType,
            `【律師】${player.name} 辯護成功，罰款豁免！`,
          ),
        );
      }
      // 賽博道士：負面效果 -30%（最低為原額的 50%）
      if (amount < 0 && player.profession === "cyber_daoist") {
        const reduced = Math.round(amount * 0.7);
        const originalAbs = Math.abs(amount);
        const minAmount = -Math.round(originalAbs * 0.5);
        amount = Math.max(reduced, minAmount);
        state.logs.push(
          makeLog(
            logType,
            `【賽博道士】${player.name} 減輕了負面效果！`,
          ),
        );
      }
      // 厄運保險：負面金錢效果減半（一次性）
      if (amount < 0 && consumeBadLuckInsurance(state, playerIdx)) {
        const originalLoss = Math.abs(amount);
        amount = -Math.ceil(originalLoss / 2);
        state.logs.push(
          makeLog(
            'insurance',
            `【厄運保險】 玩家${player.name} 的損失由保險減半，實際損失 $${Math.abs(amount)}`,
          ),
        );
      }
      if (amount !== 0) {
        player.money += amount;
      }
      const specText = player.profession === "speculator" ? "【投机者】×2" : "";
      const stormText = state.currentWeather === "em_storm" ? "【电磁风暴】×2" : "";
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}${specText}${stormText}（${amount >= 0 ? "+" : ""}${amount}元）`,
        ),
      );
      if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      break;
    }
    case "lucky_star": {
      const professionMult = getCardMoneyMultiplier(player.profession);
      const amount = Math.round(effect.amount * config.fateMoneyMultiplier * professionMult);
      player.money += amount;
      const specText = player.profession === "speculator" ? "【投机者】×2" : "";
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}${specText}（+${amount}元）`,
        ),
      );
      if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      break;
    }
    case "teleport_start": {
      player.position = 0;
      const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
      player.money += reward;
      passedStart = true;
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}，获得起点奖励 ${reward} 元`,
        ),
      );
      if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      break;
    }
    case "go_to_detention": {
      player.position = 10;
      // 偽身份證：一次性豁免進入監禁
      if (player.fakeIdActive) {
        player.fakeIdActive = false;
        player.isInDetention = false;
        player.detentionTurns = 0;
        state.logs.push(
          makeLog(logType, `${cardDescription}`),
        );
        state.logs.push(
          makeLog(logType, `【偽身份證】${player.name} 順利矇混過關，免於監禁！`),
        );
        break;
      }
      // 律師：30%概率豁免進入監禁
      if (player.profession === "lawyer" && Math.random() < 0.3) {
        player.isInDetention = false;
        player.detentionTurns = 0;
        state.logs.push(
          makeLog(logType, `${cardDescription}`),
        );
        state.logs.push(
          makeLog(logType, `【律師】${player.name} 辯護成功，免於監禁！`),
        );
        break;
      }
      // 【技能】越獄大師：有概率直接越獄，不進入監禁
      const jailBreakChance = getSkillValue(player.skillTree, 'jail_master');
      if (jailBreakChance > 0 && Math.random() < jailBreakChance) {
        player.isInDetention = false;
        player.detentionTurns = 0;
        state.logs.push(
          makeLog(logType, `${cardDescription}`),
        );
        state.logs.push(
          makeLog(logType, `【技能】越獄大師發動，成功越獄！`),
        );
        break;
      }
      player.isInDetention = true;
      player.detentionTurns = 0;
      player.detentionCount++;
      state.logs.push(
        makeLog(logType, `${cardDescription}`),
      );
      // 任務：進監獄（機會卡/命運卡觸發）
      updateMissionProgress(state, "go_to_jail", 1, playerIdx);
      break;
    }
    case "forward": {
      const moveMult = state.weatherMultipliers.moveMultiplier ?? 1;
      const forwardSteps = effect.steps * moveMult;
      player.position = clampPosition(player.position + forwardSteps);
      const pos = player.position;
      if (pos < oldPosition || pos === 0) {
        const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
        player.money += reward;
        passedStart = true;
        const stormText = moveMult > 1 ? `【电磁风暴】移动×${moveMult}` : "";
        state.logs.push(
          makeLog(
            logType,
            `${cardDescription}${stormText}，经过起点获得 ${reward} 元`,
          ),
        );
        if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      } else {
        const stormText = moveMult > 1 ? `【电磁风暴】移动×${moveMult}` : "";
        state.logs.push(makeLog(logType, `${cardDescription}${stormText}`));
      }
      break;
    }
    case "backward": {
      const moveMultBack = state.weatherMultipliers.moveMultiplier ?? 1;
      const backwardSteps = effect.steps * moveMultBack;
      const newPos = clampPosition(player.position - backwardSteps);
      player.position = newPos;
      const stormBackText = moveMultBack > 1 ? `【電磁風暴】移動×${moveMultBack}` : "";
      // 後退穿過起點（從低位繞到高位）
      if (newPos > oldPosition) {
        const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
        player.money += reward;
        passedStart = true;
        state.logs.push(
          makeLog(
            logType,
            `${cardDescription}${stormBackText}，經過起點獲得 ${reward} 元`,
          ),
        );
        if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}${stormBackText}`));
      }
      break;
    }
    case "steal_money": {
      const opponentIdx = getRandomOpponent(state, playerIdx);
      // getRandomOpponent 在無可用對手時回傳 -1
      if (opponentIdx < 0) {
        state.logs.push(
          makeLog(
            logType,
            `${cardDescription}（無可用對象，效果跳過）`,
          ),
        );
        break;
      }
      const stealOpponent = state.players[opponentIdx];
      const amount = Math.min(effect.amount, stealOpponent.money);
      stealOpponent.money -= amount;
      player.money += amount;
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}（从 ${stealOpponent.name} 处获得 ${amount} 元）`,
        ),
      );
      if (state.isCoopMode) {
        syncCoopMoneyFromPlayer(state, playerIdx);
        syncCoopMoneyFromPlayer(state, opponentIdx);
      }
      break;
    }
    case "give_money": {
      // 向所有未破产的对手支付
      const opponents: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
      const perPerson = Math.min(effect.amount, Math.floor(player.money / Math.max(opponents.length, 1)));
      let totalGiven = 0;
      for (const oppIdx of opponents) {
        state.players[oppIdx].money += perPerson;
        totalGiven += perPerson;
      }
      player.money -= totalGiven;
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}（向 ${opponents.length} 位对手各支付 ${perPerson} 元，共 ${totalGiven} 元）`,
        ),
      );
      if (state.isCoopMode) {
        syncCoopMoneyFromPlayer(state, playerIdx);
        for (const oppIdx of opponents) {
          syncCoopMoneyFromPlayer(state, oppIdx);
        }
      }
      break;
    }
    case "get_out_of_jail": {
      player.hasGetOutOfJailCard = true;
      state.logs.push(makeLog(logType, cardDescription));
      break;
    }
    case "forward_to_fate": {
      const targetRaw = forwardToNearestFate(oldPosition);
      const target = clampPosition(targetRaw);
      player.position = target;
      if (targetRaw >= CELL_COUNT) {
        const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
        player.money += reward;
        passedStart = true;
        state.logs.push(
          makeLog(
            logType,
            `${cardDescription}（${CELLS[target].name}），经过起点获得 ${reward} 元`,
          ),
        );
      } else {
        state.logs.push(
          makeLog(logType, `${cardDescription}（${CELLS[target].name}）`),
        );
      }
       // 触发命运卡（从牌堆抽取）
       let fateCard: FateCard = drawFateCardFromDeck(state);
       // 【技能】抽卡幸運：有概率重抽，取較好結果
       const luckyForwardToFate = getSkillValue(player.skillTree, 'lucky_draw');
       let luckyForwardTriggered = false;
       if (luckyForwardToFate > 0 && Math.random() < luckyForwardToFate) {
         const secondFate: FateCard = drawFateCardFromDeck(state);
         if (fateCard.effect.type === 'money' && secondFate.effect.type === 'money') {
           fateCard = secondFate.effect.amount >= fateCard.effect.amount ? secondFate : fateCard;
         }
         luckyForwardTriggered = true;
       }
       state.pendingFateCard = fateCard;
       state.phase = "fate";
       state.logs.push(
         makeLog("fate", `${player.name} 抽到命运卡：${fateCard.name}`),
       );
       if (luckyForwardTriggered) {
         state.logs.push(makeLog("fate", `【技能】抽卡幸運發動，獲得更好的結果`));
       }
      return; // 提前返回，不进入通用收尾
    }
    case "repair_fee": {
      const ownedCount = Object.values(state.properties).filter(
        (prop) => prop.owner === playerIdx && !prop.isMortgaged,
      ).length;
      const totalFee = ownedCount * effect.perProperty;
      player.money -= totalFee;
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}（共 ${ownedCount} 处房产，-${totalFee}元）`,
        ),
      );
      if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      break;
    }
    case "random_teleport": {
      const target = Math.floor(Math.random() * CELL_COUNT);
      player.position = target;
      if (target < oldPosition || target === 0) {
        const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
        player.money += reward;
        passedStart = true;
        state.logs.push(
          makeLog(
            logType,
            `传送到 ${CELLS[target].name}，经过起点获得 ${reward} 元`,
          ),
        );
        if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      } else {
        state.logs.push(
          makeLog(logType, `传送到 ${CELLS[target].name}`),
        );
      }
      break;
    }
    case "forward_to_property": {
      const boardCells = state.boardCells ?? CELLS;
      let steps = 1;
      let found = -1;
      while (steps <= CELL_COUNT) {
        const checkPos = clampPosition(oldPosition + steps);
        if (boardCells[checkPos].type === "property") {
          found = checkPos;
          break;
        }
        steps++;
      }
      if (found >= 0) {
        player.position = found;
        if (found < oldPosition || found === 0) {
          const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
          player.money += reward;
          passedStart = true;
          state.logs.push(
            makeLog(
              logType,
              `${cardDescription}（${boardCells[found].name}），经过起点获得 ${reward} 元`,
            ),
          );
        } else {
          state.logs.push(
            makeLog(logType, `${cardDescription}（${boardCells[found].name}）`),
          );
        }
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}（未找到地产）`));
      }
      if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      break;
    }
    case "backward_to_fate": {
      const boardCells = state.boardCells ?? CELLS;
      let steps = 1;
      let found = -1;
      while (steps <= CELL_COUNT) {
        const checkPos = clampPosition(oldPosition - steps);
        if (boardCells[checkPos].type === "fate") {
          found = checkPos;
          break;
        }
        steps++;
      }
      if (found >= 0) {
        player.position = found;
        state.logs.push(
          makeLog(logType, `${cardDescription}（${boardCells[found].name}）`),
        );
         // 触发命运卡（从牌堆抽取）
         let fateCard: FateCard = drawFateCardFromDeck(state);
         state.pendingFateCard = fateCard;
        state.phase = "fate";
        state.logs.push(
          makeLog("fate", `${player.name} 抽到命运卡：${fateCard.name}`),
        );
        return; // 提前返回，不进入通用收尾
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}（未找到命运区）`));
      }
      break;
    }
    case "collect_from_all": {
      const opponents: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
      let totalCollected = 0;
      for (const oppIdx of opponents) {
        const take = Math.min(effect.amount, state.players[oppIdx].money);
        state.players[oppIdx].money -= take;
        totalCollected += take;
      }
      player.money += totalCollected;
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}（从 ${opponents.length} 位对手各获得 ${effect.amount} 元，共 +${totalCollected} 元）`,
        ),
      );
      if (state.isCoopMode) {
        syncCoopMoneyFromPlayer(state, playerIdx);
        for (const oppIdx of opponents) {
          syncCoopMoneyFromPlayer(state, oppIdx);
        }
      }
      break;
    }
    case "pay_to_all": {
      const opponents: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
      const perPerson = Math.min(effect.amount, Math.floor(player.money / Math.max(opponents.length, 1)));
      let totalPaid = 0;
      for (const oppIdx of opponents) {
        state.players[oppIdx].money += perPerson;
        totalPaid += perPerson;
      }
      player.money -= totalPaid;
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}（向 ${opponents.length} 位对手各支付 ${perPerson} 元，共 -${totalPaid} 元）`,
        ),
      );
      if (state.isCoopMode) {
        syncCoopMoneyFromPlayer(state, playerIdx);
        for (const oppIdx of opponents) {
          syncCoopMoneyFromPlayer(state, oppIdx);
        }
      }
      break;
    }
    case "property_appreciate": {
      const ownedProps: number[] = Object.keys(state.properties)
        .map((k: string) => Number(k))
        .filter((id: number) => state.properties[id].owner === playerIdx);
      if (ownedProps.length > 0) {
        const targetId = ownedProps[Math.floor(Math.random() * ownedProps.length)];
        const boardCells = state.boardCells ?? CELLS;
        const cell = boardCells[targetId];
        const increase = Math.round(cell.basePrice * (effect.percent / 100));
        // 确保 state.boardCells 存在（修改会反映在状态中）
        if (!state.boardCells) {
          state.boardCells = [...CELLS];
        }
        state.boardCells[targetId] = {
          ...state.boardCells[targetId],
          basePrice: cell.basePrice + increase,
        };
        state.logs.push(
          makeLog(
            logType,
            `${cardDescription}（${cell.name} 地价 +${increase} 元）`,
          ),
        );
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}（暂无自有地产）`));
      }
      break;
    }
    case "property_downgrade": {
      const ownedProps: number[] = Object.keys(state.properties)
        .map((k: string) => Number(k))
        .filter((id: number) => state.properties[id].owner === playerIdx
          && state.properties[id].buildings > 0);
      if (ownedProps.length > 0) {
        const targetId = ownedProps[Math.floor(Math.random() * ownedProps.length)];
        const prop = state.properties[targetId];
        const boardCells = state.boardCells ?? CELLS;
        const cell = boardCells[targetId];
        prop.buildings = Math.max(0, prop.buildings - 1) as BuildingLevel;
        state.logs.push(
          makeLog(logType, `${cardDescription}（${cell.name} 等級 -1）`),
        );
      } else {
        const cost = 200;
        player.money -= cost;
        state.logs.push(
          makeLog(logType, `${cardDescription}（無地產可降級，支付 ${cost} 元罰金）`),
        );
      }
      break;
    }
    case "skip_turn": {
      // 網路忍者被動：首次負面免疫
      if (player.profession === "net_ninja" && !player.ninjaImmunityUsed) {
        player.ninjaImmunityUsed = true;
        // 額外獲得 1 個隨機道具
        const randomItemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        if (!player.items) player.items = [];
        player.items.push({ type: randomItemType, id: nextItemId++ });
        state.logs.push(
          makeLog(logType, `【網路忍者】${player.name} 免疫了負面效果，並獲得一個隨機道具！`),
        );
      } else if (player.negativeImmunityShield) {
        player.negativeImmunityShield = false;
        state.logs.push(
          makeLog(logType, `【防火牆】${player.name} 抵擋了負面效果！`),
        );
      } else {
        player.skipNextTurn = true;
        state.logs.push(
          makeLog(logType, `${cardDescription}（下回合跳過）`),
        );
      }
      break;
    }
    case "steal_item": {
      const opponentIndices: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
      const opponentsWithItems = opponentIndices.filter(
        (i: number) => state.players[i].items && state.players[i].items!.length > 0,
      );
      if (opponentsWithItems.length === 0) {
        state.logs.push(
          makeLog(logType, `${cardDescription}（沒有對手擁有道具）`),
        );
        break;
      }
      const victimIdx = opponentsWithItems[Math.floor(Math.random() * opponentsWithItems.length)];
      const victim = state.players[victimIdx];
      if (victim.profession === "net_ninja" && !victim.ninjaImmunityUsed) {
        victim.ninjaImmunityUsed = true;
        const randomItemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        if (!victim.items) victim.items = [];
        victim.items.push({ type: randomItemType, id: nextItemId++ });
        state.logs.push(
          makeLog(logType, `【網路忍者】${victim.name} 免疫了道具失竊，並反獲一個道具！`),
        );
      } else if (victim.negativeImmunityShield) {
        victim.negativeImmunityShield = false;
        state.logs.push(
          makeLog(logType, `【防火牆】${victim.name} 抵擋了道具失竊！`),
        );
      } else {
        const stealIdx = Math.floor(Math.random() * victim.items!.length);
        const stolenItem = victim.items!.splice(stealIdx, 1)[0];
        if (!player.items) player.items = [];
        player.items.push({ ...stolenItem, id: nextItemId++ });
        state.logs.push(
          makeLog(logType, `${cardDescription}（從 ${victim.name} 處獲得 ${stolenItem.type}）`),
        );
      }
      break;
    }
    case "force_sell_property": {
      const ownedProps: number[] = Object.keys(state.properties)
        .map((k: string) => Number(k))
        .filter((id: number) => state.properties[id].owner === playerIdx);
      if (ownedProps.length > 0) {
        if (player.profession === "net_ninja" && !player.ninjaImmunityUsed) {
          player.ninjaImmunityUsed = true;
          const randomItemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
          if (!player.items) player.items = [];
          player.items.push({ type: randomItemType, id: nextItemId++ });
          state.logs.push(
            makeLog(logType, `【網路忍者】${player.name} 免疫了強制拍賣！`),
          );
        } else if (player.negativeImmunityShield) {
          player.negativeImmunityShield = false;
          state.logs.push(
            makeLog(logType, `【防火牆】${player.name} 抵擋了強制拍賣！`),
          );
        } else {
          const targetId = ownedProps[Math.floor(Math.random() * ownedProps.length)];
          const boardCells = state.boardCells ?? CELLS;
          const cell = boardCells[targetId];
          const sellPrice = Math.round(cell.basePrice * 0.7);
          state.properties[targetId].owner = -1;
          state.properties[targetId].buildings = 0;
          state.properties[targetId].isMortgaged = false;
          player.money += sellPrice;
          state.logs.push(
            makeLog(logType, `${cardDescription}（${cell.name} 以 ${sellPrice} 元賣給銀行）`),
          );
          if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
        }
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}（你暫無地產）`));
      }
      break;
    }
    case "toll_boost_turn": {
      player.tollBoostThisTurn = (player.tollBoostThisTurn ?? 0) + effect.percent / 100;
      state.logs.push(
        makeLog(logType, `${cardDescription}（本回合過路費 +${effect.percent}%）`),
      );
      break;
    }
    case "lucky_dice": {
      player.luckyDiceActive = true;
      state.logs.push(
        makeLog(logType, `${cardDescription}（下次擲骰取較大值）`),
      );
      break;
    }
    case "negative_immunity": {
      player.negativeImmunityShield = true;
      state.logs.push(
        makeLog(logType, `${cardDescription}（護盾已激活）`),
      );
      break;
    }
    case "item_give": {
      const randomItemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      if (!player.items) player.items = [];
      player.items.push({ type: randomItemType, id: nextItemId++ });
      let itemCount = 1;
      // 賽博道士：道具效果 +50%（50% 概率多一個道具）
      if (player.profession === "cyber_daoist" && Math.random() < 0.5) {
        const bonusItem = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        player.items.push({ type: bonusItem, id: nextItemId++ });
        itemCount = 2;
        state.logs.push(
          makeLog(logType, `【賽博道士】${player.name} 獲得額外道具！`),
        );
      }
      state.logs.push(
        makeLog(logType, `${cardDescription}（獲得 ${itemCount} 個道具）`),
      );
      break;
    }
    case "teleport_to_owned": {
      const ownedProps: number[] = Object.keys(state.properties)
        .map((k: string) => Number(k))
        .filter((id: number) => state.properties[id].owner === playerIdx);
      if (ownedProps.length > 0) {
        const targetId = ownedProps[Math.floor(Math.random() * ownedProps.length)];
        const boardCells = state.boardCells ?? CELLS;
        player.position = targetId;
        state.logs.push(
          makeLog(logType, `${cardDescription}（傳送到 ${boardCells[targetId].name}）`),
        );
        // 移動類效果，走通用收尾的落地處理
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}（你暫無地產，改為獲得 500 元補償）`));
        player.money += 500;
        if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIdx);
      }
      break;
    }
    case "others_pay_bank": {
      const opponents: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
      for (const oppIdx of opponents) {
        const take = Math.min(effect.amount, state.players[oppIdx].money);
        state.players[oppIdx].money -= take;
      }
      state.logs.push(
        makeLog(
          logType,
          `${cardDescription}（${opponents.length} 位對手各支付 ${effect.amount} 元給銀行）`,
        ),
      );
      if (state.isCoopMode) {
        for (const oppIdx of opponents) {
          syncCoopMoneyFromPlayer(state, oppIdx);
        }
      }
      break;
    }
    case "trade_exchange_money": {
      const exchangeAmount = effect.amount ?? 500;
      const opponents: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => i !== playerIdx && !state.players[i].isBankrupt);
      if (opponents.length > 0) {
        const targetIdx = opponents[Math.floor(Math.random() * opponents.length)];
        const target = state.players[targetIdx];
        const playerMoneyBefore = player.money;
        const targetMoneyBefore = target.money;
        const playerGives = Math.min(exchangeAmount, targetMoneyBefore);
        const targetGives = Math.min(exchangeAmount, playerMoneyBefore);
        player.money = playerMoneyBefore - playerGives + targetGives;
        target.money = targetMoneyBefore - targetGives + playerGives;
        state.logs.push(makeLog(logType, `${cardDescription}（雙方交換資金）`));
        if (state.isCoopMode) {
          syncCoopMoneyFromPlayer(state, playerIdx);
          syncCoopMoneyFromPlayer(state, targetIdx);
        }
      } else {
        state.logs.push(makeLog(logType, `${cardDescription}（無對手可交易）`));
      }
      break;
    }
    case "chain_draw": {
      // 连锁抽卡由 applyFateCard / applyChanceCard 处理
      state.logs.push(
        makeLog(logType, `${cardDescription}（连锁抽 ${effect.count} 张）`),
      );
      break;
    }
    case "choice": {
      // 选择题：设置 pendingChoiceCard，等玩家选择后再应用
      state.pendingChoiceCard = {
        cardId: 0,
        cardType: logType,
        options: [
          { label: effect.optionLabels[0], effect: effect.options[0] },
          { label: effect.optionLabels[1], effect: effect.options[1] },
        ],
      };
      state.logs.push(
        makeLog(logType, `${cardDescription}（请做出选择）`),
      );
      return; // 提前返回，不进入通用收尾，等待玩家选择
    }
    case "buff": {
      if (!player.cardBuffs) player.cardBuffs = [];
      // 同类型 buff 刷新持续时间
      const existing = player.cardBuffs.find((b: { type: string; duration: number; description: string }) => b.type === effect.buffType);
      if (existing) {
        existing.duration = effect.duration;
      } else {
        player.cardBuffs.push({
          type: effect.buffType,
          duration: effect.duration,
          description: effect.description,
        });
      }
      state.logs.push(
        makeLog(logType, `${cardDescription}（持续 ${effect.duration} 回合）`),
      );
      break;
    }
  }

  // 成就：资金低于1000标记（检查所有未破产玩家）
  for (const p of state.players) {
    if (!p.isBankrupt && p.money < 1000 && !p.hasBeenPoor) {
      p.hasBeenPoor = true;
    }
  }

  // 通用收尾：破产检查 + 落地处理
  if (applyBankruptcyCheck(state, playerIdx)) return;

  // 如果是 go_to_detention，直接切回合
  if (effect.type === "go_to_detention") {
    state.phase = "rolling";
    state.currentPlayerIndex = getNextPlayer(state, playerIdx);
    handleRoundEndInPlace(state, playerIdx);
    return;
  }

  // 如果从命运卡获得出狱卡等非移动效果，位置不变，切回合
  if (
    effect.type === "money" ||
    effect.type === "lucky_star" ||
    effect.type === "steal_money" ||
    effect.type === "give_money" ||
    effect.type === "get_out_of_jail" ||
    effect.type === "repair_fee" ||
    effect.type === "collect_from_all" ||
    effect.type === "pay_to_all" ||
    effect.type === "property_appreciate" ||
    effect.type === "property_downgrade" ||
    effect.type === "skip_turn" ||
    effect.type === "steal_item" ||
    effect.type === "force_sell_property" ||
    effect.type === "toll_boost_turn" ||
    effect.type === "lucky_dice" ||
    effect.type === "negative_immunity" ||
    effect.type === "item_give" ||
    effect.type === "others_pay_bank" ||
    effect.type === "trade_exchange_money" ||
    effect.type === "buff"
  ) {
    state.phase = "rolling";
    state.currentPlayerIndex = getNextPlayer(state, playerIdx);
    handleRoundEndInPlace(state, playerIdx);
    return;
  }

  // 移动类效果：处理落地事件
  handleCardMoveLanding(state, playerIdx);
  // handleCardMoveLanding 内部已切换玩家，这里检查是否一轮结束
  handleRoundEndInPlace(state, playerIdx);
  // handleCardMoveLanding 内部已设置 phase 和 currentPlayerIndex
  // 但要注意 passedStart 可能需要补起点奖励
  if (!passedStart && player.position === 0 && effect.type !== "teleport_start") {
    const infMult = state.inflationRate ?? 1;
    const startReward = Math.round(config.startReward * infMult);
    player.money += startReward;
    state.logs.push(
      makeLog(logType, `落到起点，额外获得 ${startReward} 元`),
    );
  }
  // 任務：經過起點（卡牌效果觸發）
  if (passedStart) {
    updateMissionProgress(state, "pass_start", 1, playerIdx);
  }
}

export function applyFateCard(state: GameState): GameState {
  const newState = cloneState(state);
  const card = newState.pendingFateCard;
  if (!card) return newState;

  newState.pendingFateCard = null;

  // 选择题卡：设置 pendingChoiceCard 并暂停
  if (card.isChoice && card.choiceOptions) {
    newState.pendingChoiceCard = {
      cardId: card.id,
      cardType: "fate",
      options: card.choiceOptions as Array<{ label: string; effect: CardEffect }>,
    };
    newState.phase = "fate";
    return newState;
  }

  applyCardEffect(newState, card.effect, card.name, card.description, "fate");

  // 卡牌連鎖檢測
  if (newState.customRules?.enableCardCombo !== false) {
    const playerIdx = newState.currentPlayerIndex;
    const { comboTriggered } = updateCardCombo(newState, playerIdx, card.effect);
    if (comboTriggered) {
      applyCardComboEffect(newState, playerIdx, comboTriggered);
    }
  }

  // 连锁抽卡：再抽一张命运卡
  if (card.effect.type === "chain_draw" && !newState.pendingChoiceCard) {
    const count = card.effect.count;
    const playerIdx = newState.currentPlayerIndex;
    const player = newState.players[playerIdx];
    const isSpeculator = player.profession === "speculator";
    // 只设置下一张，等玩家确认后继续连锁
    if (count > 0) {
      const nextCard = drawFateCard(isSpeculator);
      // 简化：下一张如果也是 chain_draw，则再抽，避免无限连锁——这里用计数器限制
      newState.pendingFateCard = nextCard;
      newState.phase = "fate";
      newState.logs.push(
        makeLog("fate", `连锁抽卡：${player.name} 抽到命运卡：${nextCard.name}`),
      );
    }
  }

  return newState;
}

export function applyChanceCard(state: GameState): GameState {
  const newState = cloneState(state);
  const card = newState.pendingChanceCard;
  if (!card) return newState;

  newState.pendingChanceCard = null;

  // 选择题卡：设置 pendingChoiceCard 并暂停
  if (card.isChoice && card.choiceOptions) {
    newState.pendingChoiceCard = {
      cardId: card.id,
      cardType: "chance",
      options: card.choiceOptions as Array<{ label: string; effect: CardEffect }>,
    };
    newState.phase = "chance";
    return newState;
  }

  applyCardEffect(newState, card.effect, card.name, card.description, "chance");

  // 卡牌連鎖檢測
  if (newState.customRules?.enableCardCombo !== false) {
    const playerIdx = newState.currentPlayerIndex;
    const { comboTriggered } = updateCardCombo(newState, playerIdx, card.effect);
    if (comboTriggered) {
      applyCardComboEffect(newState, playerIdx, comboTriggered);
    }
  }

  // 连锁抽卡：再抽一张机会卡
  if (card.effect.type === "chain_draw" && !newState.pendingChoiceCard) {
    const count = card.effect.count;
    const playerIdx = newState.currentPlayerIndex;
    const player = newState.players[playerIdx];
    const isSpeculator = player.profession === "speculator";
    if (count > 0) {
      const nextCard = drawChanceCard(isSpeculator);
      newState.pendingChanceCard = nextCard;
      newState.phase = "chance";
      newState.logs.push(
        makeLog("chance", `连锁抽卡：${player.name} 抽到机会卡：${nextCard.name}`),
      );
    }
  }

  return newState;
}

// 应用选择题卡的选项
export function applyChoiceOption(state: GameState, optionIndex: number): GameState {
  const newState = cloneState(state);
  const pending = newState.pendingChoiceCard;
  if (!pending) return newState;

  const option = pending.options[optionIndex];
  if (!option) return newState;

  const cardType = pending.cardType;
  newState.pendingChoiceCard = null;

  // 应用所选效果
  applyCardEffect(newState, option.effect, `选择：${option.label}`, option.label, cardType);

  return newState;
}

// ========== 技能树系统 ==========

export function upgradeSkill(
  state: GameState,
  playerIndex: number,
  skillId: SkillId,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (!player.skillTree) {
    player.skillTree = getInitialSkillTree();
  }
  const currentLevel = player.skillTree[skillId] ?? 0;
  const skillConfig = SKILLS[skillId];
  const currentPoints = player.skillPoints ?? 0;

  // 校验：有技能点
  if (currentPoints <= 0) {
    newState.logs.push(
      makeLog(logType, `升級失敗：沒有技能點`),
    );
    return newState;
  }
  // 校验：未達最高等級
  if (currentLevel >= skillConfig.maxLevel) {
    newState.logs.push(
      makeLog(logType, `升級失敗：${skillConfig.name} 已達最高等級`),
    );
    return newState;
  }

  // 消耗技能點並升級
  player.skillPoints = currentPoints - 1;
  player.skillTree[skillId] = currentLevel + 1;

  const nextEffect = skillConfig.effects.find(
    (e: { level: number; value: number; description: string }) => e.level === currentLevel + 1,
  );
  newState.logs.push(
    makeLog(
      logType,
      `【技能】${player.name} 升級了 ${skillConfig.name}（Lv.${currentLevel + 1}：${nextEffect?.description ?? ''}）`,
    ),
  );

  return newState;
}

function cloneState(state: GameState): GameState {
  const propertiesClone: Record<number, PropertyState> = {};
  for (const [k, v] of Object.entries(state.properties)) {
    propertiesClone[Number(k)] = { ...v };
  }
  return {
    ...state,
     players: state.players.map((p) => ({
       ...p,
       stocks: p.stocks ? p.stocks.map((s: PlayerStock) => ({ ...s })) : [],
       unlockedAchievements: p.unlockedAchievements
         ? [...p.unlockedAchievements]
         : [],
       items: p.items ? p.items.map((it: ItemState) => ({ ...it })) : [],
       cardBuffs: p.cardBuffs ? p.cardBuffs.map((b: CardBuff) => ({ ...b })) : undefined,
       skillTree: p.skillTree ? { ...p.skillTree } : getInitialSkillTree(),
     })),
    ownedProperties: { ...state.ownedProperties },
    properties: propertiesClone,
    bankruptPlayers: [...state.bankruptPlayers],
    bankruptcyList: state.bankruptcyList ? [...state.bankruptcyList] : undefined,
    pendingTrade: state.pendingTrade ? { ...state.pendingTrade } : null,
    auction: state.auction ? {
      ...state.auction,
      activeBidders: [...state.auction.activeBidders],
      blindBids: state.auction.blindBids ? { ...state.auction.blindBids } : undefined,
    } : null,
    logs: [...state.logs],
    pendingFateCard: state.pendingFateCard ? { ...state.pendingFateCard } : null,
    pendingChanceCard: state.pendingChanceCard
      ? { ...state.pendingChanceCard }
      : null,
    stocks: state.stocks && Object.keys(state.stocks).length > 0
      ? { ...state.stocks }
      : getStocksInitialState(),
    globalEventMultipliers: { ...state.globalEventMultipliers },
    customRules: state.customRules ? { ...state.customRules } : undefined,
    totalTurns: state.totalTurns,
    playersActedThisRound: [...state.playersActedThisRound],
    missions: state.missions ? state.missions.map((m: Mission) => ({ ...m })) : [],
    npcs: state.npcs ? state.npcs.map((n: NpcEntity) => ({ ...n })) : [],
    pendingNpcInteraction: state.pendingNpcInteraction
      ? { ...state.pendingNpcInteraction }
      : null,
    // 季節系統
    season: state.season ? { ...state.season } : undefined,
    // 災難系統
    disaster: state.disaster
      ? { ...state.disaster, affectedCells: [...state.disaster.affectedCells] }
      : undefined,
  };
}

// ========== 任務系統 ==========

function updateMissionProgress(
  state: GameState,
  type: MissionType,
  delta: number,
  playerIndex: number,
): GameState {
  if (!state.missions || state.missions.length === 0) return state;

  const missions = state.missions;
  let updated = false;

  for (let i = 0; i < missions.length; i++) {
    const mission = missions[i];
    if (mission.type !== type || mission.completed) continue;

    const newProgress = mission.progress + delta;
    if (newProgress >= mission.target) {
      // 完成任務：觸發者獲得獎勵
      mission.progress = mission.target;
      mission.completed = true;
      mission.claimed = true;
      mission.completedBy = playerIndex;
      const player = state.players[playerIndex];
      if (player) {
        player.money += mission.reward;
        if (state.isCoopMode) {
          syncCoopMoneyFromPlayer(state, playerIndex);
        }
      }
      state.logs.push(
        makeLog(
          "mission",
          `[任務] ${player?.name ?? ''} 完成「${mission.name}」，獲得獎勵 $${mission.reward}！`,
        ),
      );
    } else {
      mission.progress = newProgress;
    }
    updated = true;
    break;
  }

  return updated ? state : state;
}

// ========== 建造系統 ==========

export function buildHouse(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  // 校验：是玩家所有（合作模式下队友的也可以）
  if (!prop) {
    newState.logs.push(makeLog(logType, `建造失敗：${cell.name} 無主`));
    return newState;
  }
  const isOwned = prop.owner === playerIndex;
  const isTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!isOwned && !isTeammateOwned) {
    newState.logs.push(makeLog(logType, `建造失敗：${cell.name} 不屬於你`));
    return newState;
  }
  // 校验：套裝完整性（必須擁有整套才能建房）
  const setId = cell.setId;
  if (setId) {
    const setComplete = newState.isCoopMode && player.teamId
      ? checkTeamSetCompleteGeneric(setId, player.teamId, newState.properties, newState.boardCells)
      : checkSetCompleteFromProperties(playerIndex, setId, newState.properties, false, undefined, newState.boardCells);
    if (!setComplete) {
      newState.logs.push(makeLog(logType, `建造失敗：必須擁有 ${cell.name} 所屬整套地產才能建房`));
      return newState;
    }
  }
  // 挑戰模式：無建築時代 - 禁止建造
  if (newState.challengeType === "no_building") {
    newState.logs.push(makeLog(logType, `建造失敗：【無建築時代】禁止建造房屋/酒店`));
    return newState;
  }
  // 校验：未抵押
  if (prop.isMortgaged) {
    newState.logs.push(makeLog(logType, `建造失败：${cell.name} 已抵押`));
    return newState;
  }
  // 校验：当前等级<5
  if (prop.buildings >= 5) {
    newState.logs.push(makeLog(logType, `建造失败：${cell.name} 已达最高等级`));
    return newState;
  }
  // 校验：该地块没有特殊建筑（房屋与特殊建筑互斥）
  if (prop.specialBuilding) {
    newState.logs.push(
      makeLog(logType, `建造失败：${cell.name} 已有特殊建築 ${SPECIAL_BUILDINGS[prop.specialBuilding].name}`),
    );
    return newState;
  }

  // 计算建造费用
  const isHotel = prop.buildings === 4; // 4→5 建酒店
  const baseCost = getBuildingCost(cellId, newState.mode, isHotel, player.profession, newState.properties);
  const weatherDiscount = newState.weatherMultipliers.propertyPriceDiscount ?? 0;
  const buildSkillDiscount = getSkillValue(player.skillTree, 'build_master');
  // 冬季：建房 +20%
  const winterMultiplier = newState.season?.type === 'winter' ? 1.2 : 1;
  const cost = Math.round(baseCost * winterMultiplier * (1 - weatherDiscount) * (1 - buildSkillDiscount));

  // 校验：资金足够
  if (player.money < cost) {
    newState.logs.push(
      makeLog(logType, `建造失败：${cell.name} 资金不足（需要${cost}元）`),
    );
    return newState;
  }

  // 扣钱
  player.money -= cost;
  // 更新建筑等级
  prop.buildings = (prop.buildings + 1) as BuildingLevel;

  // 藝術家：建房後地塊價值+10%（透過 boardCells 動態調整）
  if (player.profession === "artist") {
    const baseCellPrice = getCellPrice(cellId, newState.mode, newState.customRules, newState.boardCells);
    const bonus = Math.round(baseCellPrice * 0.1);
    if (!newState.boardCells) {
      newState.boardCells = [...CELLS];
    }
    const currentCell = newState.boardCells[cellId] ?? CELLS[cellId];
    newState.boardCells[cellId] = {
      ...currentCell,
      basePrice: currentCell.basePrice + bonus,
    };
    newState.logs.push(
      makeLog(logType, `【藝術家】${player.name} 的創意讓 ${cell.name} 價值提升 +${bonus} 元`),
    );
  }

  const buildingText = isHotel ? "酒店" : `第${prop.buildings}栋房屋`;
  const engineerText = player.profession === "engineer" ? "【工程师】7折" : "";
  const neonText = newState.currentWeather === "neon_night" ? "【霓虹夜】8折" : "";
  const winterText = newState.season?.type === 'winter' ? "【冬季】建房+20%" : "";
  const teamText = isTeammateOwned ? "（队友地块）" : "";
  const skillSaving = buildSkillDiscount > 0 ? Math.round(baseCost * buildSkillDiscount) : 0;
  const skillText = buildSkillDiscount > 0 ? `【技能】建房達人，節省 $${skillSaving}` : "";
  newState.logs.push(
    makeLog(logType, `${player.name} 在 ${cell.name} 建造了${buildingText}${engineerText}${neonText}${winterText}${teamText}（-${cost}元）${skillText}`),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updateBuildingCounts(newState);
  updatePlayerAssets(newState);
  // 任務：建造房屋
  updateMissionProgress(newState, "build_houses", 1, playerIndex);
  // 聲望：建房 +3
  changeReputation(newState, playerIndex, REPUTATION_GAIN_BUILD, "建造房屋");
  // 設置可撤銷操作（建房）
  newState.lastAction = {
    type: 'build',
    playerIndex,
    cellId,
    timestamp: Date.now(),
    data: { cost },
  };
  return newState;
}

// ========== 特殊建築系統 ==========

export function buildSpecialBuilding(
  state: GameState,
  playerIndex: number,
  cellId: number,
  buildingType: SpecialBuildingType,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);
  const config = SPECIAL_BUILDINGS[buildingType];

  // 校验：是玩家所有（合作模式下队友的也可以）
  if (!prop) {
    newState.logs.push(makeLog(logType, `建造失敗：${cell.name} 無主`));
    return newState;
  }
  const isOwned = prop.owner === playerIndex;
  const isTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!isOwned && !isTeammateOwned) {
    newState.logs.push(makeLog(logType, `建造失败：${cell.name} 不属于你`));
    return newState;
  }
  // 校验：未抵押
  if (prop.isMortgaged) {
    newState.logs.push(makeLog(logType, `建造失败：${cell.name} 已抵押`));
    return newState;
  }
  // 校验：该地块没有房屋/酒店（特殊建筑与房屋酒店互斥）
  if (prop.buildings > 0) {
    newState.logs.push(
      makeLog(logType, `建造失败：${cell.name} 已有建築，無法建造特殊建築`),
    );
    return newState;
  }
  // 校验：该地块没有特殊建筑
  if (prop.specialBuilding) {
    newState.logs.push(
      makeLog(logType, `建造失败：${cell.name} 已有特殊建築 ${SPECIAL_BUILDINGS[prop.specialBuilding].name}`),
    );
    return newState;
  }
  // 校验：资金足够
  if (player.money < config.cost) {
    newState.logs.push(
      makeLog(logType, `建造失败：${cell.name} 资金不足（需要${config.cost}元）`),
    );
    return newState;
  }

  // 扣钱
  player.money -= config.cost;
  // 设置特殊建筑
  prop.specialBuilding = buildingType;

  newState.logs.push(
    makeLog(logType, `${player.name} 在 ${cell.name} 建造了${config.name}（-${config.cost}元）`),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updatePlayerAssets(newState);
  return newState;
}

export function demolishSpecialBuilding(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  // 校验：是玩家所有
  if (!prop) {
    newState.logs.push(makeLog(logType, `拆除失敗：${cell.name} 無主`));
    return newState;
  }
  const isOwned = prop.owner === playerIndex;
  const isTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!isOwned && !isTeammateOwned) {
    newState.logs.push(makeLog(logType, `拆除失敗：${cell.name} 不屬於你`));
    return newState;
  }
  // 校验：有特殊建筑可拆
  if (!prop.specialBuilding) {
    newState.logs.push(makeLog(logType, `拆除失败：${cell.name} 没有特殊建筑`));
    return newState;
  }

  const config = SPECIAL_BUILDINGS[prop.specialBuilding];
  // 退还 50% 费用
  const refund = Math.round(config.cost * 0.5);
  player.money += refund;
  prop.specialBuilding = null;

  newState.logs.push(
    makeLog(logType, `${player.name} 在 ${cell.name} 拆除了${config.name}（退還 ${refund} 元）`),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updatePlayerAssets(newState);
  return newState;
}

// ========== 地產升級路線 ==========

export function chooseUpgradePath(
  state: GameState,
  playerIndex: number,
  cellId: number,
  path: PropertyUpgradePath,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  if (!prop) {
    newState.logs.push(makeLog(logType, `升級路線選擇失敗：${cell.name} 不存在`));
    return newState;
  }
  if (prop.owner !== playerIndex) {
    newState.logs.push(makeLog(logType, `升級路線選擇失敗：${cell.name} 不屬於你`));
    return newState;
  }
  if (prop.buildings < UPGRADE_PATH_UNLOCK_LEVEL) {
    newState.logs.push(
      makeLog(logType, `升級路線選擇失敗：${cell.name} 需達到 ${UPGRADE_PATH_UNLOCK_LEVEL} 級才能選擇路線`),
    );
    return newState;
  }
  if (prop.upgradePath) {
    newState.logs.push(
      makeLog(logType, `升級路線選擇失敗：${cell.name} 已選擇 ${PROPERTY_UPGRADE_PATHS[prop.upgradePath].name}，不可更改`),
    );
    return newState;
  }
  const pathConfig = PROPERTY_UPGRADE_PATHS[path];
  if (!pathConfig) {
    newState.logs.push(makeLog(logType, `升級路線選擇失敗：未知路線 ${path}`));
    return newState;
  }

  prop.upgradePath = path;
  newState.logs.push(
    makeLog(logType, `【升級路線】 ${cell.name} 選擇了 ${pathConfig.name}！${pathConfig.description}`),
  );
  return newState;
}

export function demolishBuilding(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  // 校验：是玩家所有（合作模式下队友的也可以）
  if (!prop) {
    newState.logs.push(makeLog(logType, `拆除失敗：${cell.name} 無主`));
    return newState;
  }
  const isOwned = prop.owner === playerIndex;
  const isTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!isOwned && !isTeammateOwned) {
    newState.logs.push(makeLog(logType, `拆除失敗：${cell.name} 不屬於你`));
    return newState;
  }
  // 校验：有建筑可拆
  if (prop.buildings <= 0) {
    newState.logs.push(makeLog(logType, `拆除失败：${cell.name} 没有建筑`));
    return newState;
  }

  // 计算返还费用（默认50%，工程师70%）
  const isHotel = prop.buildings === 5;
  const fullCost = isHotel
    ? getHotelPrice(cellId, newState.mode)
    : getBuildingPrice(cellId, newState.mode);
  const refund = Math.floor(getDemolitionRefund(fullCost, player.profession));

  // 降级
  prop.buildings = (prop.buildings - 1) as BuildingLevel;
  // 加钱
  player.money = player.money + refund;

  const buildingText = isHotel ? "酒店（退化为4栋房屋）" : `1栋房屋`;
  const engineerText = player.profession === "engineer" ? "【工程师】70%返还" : "";
  const teamText = isTeammateOwned ? "（队友地块）" : "";
  newState.logs.push(
    makeLog(logType, `${player.name} 拆除了 ${cell.name} 的${buildingText}${engineerText}${teamText}（+${refund}元）`),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);

  updateBuildingCounts(newState);
  updatePlayerAssets(newState);
  // 設置可撤銷操作（賣建築）
  newState.lastAction = {
    type: 'sell_building',
    playerIndex,
    cellId,
    timestamp: Date.now(),
    data: { refund, wasHotel: isHotel },
  };
  return newState;
}

// ========== 抵押系统 ==========

export function mortgageProperty(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  // 校验：是玩家所有（合作模式下队友的也可以）
  if (!prop) {
    newState.logs.push(makeLog(logType, `抵押失敗：${cell.name} 無主`));
    return newState;
  }
  const mortgageIsOwned = prop.owner === playerIndex;
  const mortgageIsTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!mortgageIsOwned && !mortgageIsTeammateOwned) {
    newState.logs.push(makeLog(logType, `抵押失败：${cell.name} 不属于你`));
    return newState;
  }
  // 校验：未抵押
  if (prop.isMortgaged) {
    newState.logs.push(makeLog(logType, `抵押失败：${cell.name} 已抵押`));
    return newState;
  }
  // 校验：没有建筑
  if (prop.buildings !== 0) {
    newState.logs.push(makeLog(logType, `抵押失败：${cell.name} 有建筑，需先拆除`));
    return newState;
  }
  // 校验：没有特殊建筑
  if (prop.specialBuilding) {
    newState.logs.push(makeLog(logType, `抵押失败：${cell.name} 有特殊建筑，需先收回`));
    return newState;
  }

  const mortgageValue = Math.floor(getMortgageValue(cellId, newState.mode));
  player.money = Math.max(0, player.money + mortgageValue);
  prop.isMortgaged = true;

  const teamMortgageText = mortgageIsTeammateOwned ? "（队友地块）" : "";
  newState.logs.push(
    makeLog(logType, `${player.name} 抵押了 ${cell.name}${teamMortgageText}（+${mortgageValue}元）`),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);

  updatePlayerAssets(newState);
  return newState;
}

export function redeemProperty(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const logType = getPlayerLogType(playerIndex);

  // 校验：是玩家所有（合作模式下队友的也可以）
  if (!prop) {
    newState.logs.push(makeLog(logType, `贖回失敗：${cell.name} 無主`));
    return newState;
  }
  const redeemIsOwned = prop.owner === playerIndex;
  const redeemIsTeammateOwned = newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex);
  if (!redeemIsOwned && !redeemIsTeammateOwned) {
    newState.logs.push(makeLog(logType, `赎回失败：${cell.name} 不属于你`));
    return newState;
  }
  // 校验：已抵押
  if (!prop.isMortgaged) {
    newState.logs.push(makeLog(logType, `赎回失败：${cell.name} 未抵押`));
    return newState;
  }

  const redeemValue = getRedeemValue(cellId, newState.mode);
  // 校验：资金足够
  if (player.money < redeemValue) {
    newState.logs.push(
      makeLog(logType, `赎回失败：${cell.name} 资金不足（需要${redeemValue}元）`),
    );
    return newState;
  }

  player.money = Math.max(0, player.money - redeemValue);
  prop.isMortgaged = false;

  const bankerText = player.profession === "banker" ? "【银行家】利息5%" : "";
  const redeemTeamText = redeemIsTeammateOwned ? "（队友地块）" : "";
  newState.logs.push(
    makeLog(logType, `${player.name} 赎回了 ${cell.name}${bankerText}${redeemTeamText}（-${redeemValue}元）`),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);

  updatePlayerAssets(newState);
  return newState;
}

// ========== 撤銷操作 ==========

export function undoAction(state: GameState): GameState {
  const newState = cloneState(state);
  const lastAction = newState.lastAction;

  if (!lastAction) {
    return newState;
  }

  const playerIndex = lastAction.playerIndex;
  const logType = getPlayerLogType(playerIndex);

  const now = Date.now();
  if (now - lastAction.timestamp > 5000) {
    newState.lastAction = undefined;
    return newState;
  }

  const player = newState.players[playerIndex];
  const cellId = lastAction.cellId;
  const prop = newState.properties[cellId];
  const cell = getCellConfig(newState, cellId);
  const data = lastAction.data ?? {};

  switch (lastAction.type) {
    case 'buy': {
      const price = Number(data.price) || 0;
      if (!prop || prop.owner !== playerIndex) {
        newState.logs.push(makeLog(logType, '撤銷失敗：地產所有權已變更'));
        newState.lastAction = undefined;
        return newState;
      }
      // 退還金錢
      player.money += price;
      // 歸還銀行
      delete newState.properties[cellId];
      delete newState.ownedProperties[cellId];
      newState.logs.push(
        makeLog(logType, `撤銷操作成功：退還 ${cell.name}，返還 ${price} 元`),
      );
      // 恢復為剛買地的玩家回合（撤銷買地回到買地前狀態）
      newState.currentPlayerIndex = playerIndex;
      newState.phase = 'rolling';
      updateCompleteSets(newState);
      updateBuildingCounts(newState);
      updatePlayerAssets(newState);
      break;
    }
    case 'build': {
      const cost = Number(data.cost) || 0;
      if (!prop || prop.owner !== playerIndex || prop.buildings <= 0) {
        newState.logs.push(makeLog(logType, '撤銷失敗：建築狀態已變更'));
        newState.lastAction = undefined;
        return newState;
      }
      // 退還金錢
      player.money += cost;
      // 拆除建築
      prop.buildings = (prop.buildings - 1) as BuildingLevel;
      newState.logs.push(
        makeLog(logType, `撤銷操作成功：拆除 ${cell.name} 建築，返還 ${cost} 元`),
      );
      updateBuildingCounts(newState);
      updatePlayerAssets(newState);
      break;
    }
    case 'sell_building': {
      const refund = Number(data.refund) || 0;
      const wasHotel = data.wasHotel === true;
      if (!prop || prop.owner !== playerIndex || (wasHotel ? prop.buildings !== 4 : prop.buildings >= 5)) {
        newState.logs.push(makeLog(logType, '撤銷失敗：建築狀態已變更'));
        newState.lastAction = undefined;
        return newState;
      }
      // 扣除退款金額
      if (player.money < refund) {
        newState.logs.push(makeLog(logType, '撤銷失敗：資金不足'));
        newState.lastAction = undefined;
        return newState;
      }
      player.money -= refund;
      // 重新建回
      prop.buildings = (prop.buildings + 1) as BuildingLevel;
      newState.logs.push(
        makeLog(logType, `撤銷操作成功：恢復 ${cell.name} 建築，扣除 ${refund} 元`),
      );
      updateBuildingCounts(newState);
      updatePlayerAssets(newState);
      break;
    }
    default:
      newState.logs.push(makeLog(logType, '撤銷失敗：未知操作類型'));
      newState.lastAction = undefined;
      return newState;
  }

  // 合作模式：同步隊伍金錢
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);

  // 清空 lastAction
  newState.lastAction = undefined;
  return newState;
}

// ========== 快捷操作（批量） ==========

function getPlayerOwnedCellIds(state: GameState, playerIndex: number): number[] {
  const result: number[] = [];
  for (const [cellIdStr, prop] of Object.entries(state.properties)) {
    const cellId = Number(cellIdStr);
    if (prop.owner === playerIndex) {
      result.push(cellId);
    }
    if (state.isCoopMode && isSameTeam(state, prop.owner, playerIndex)) {
      result.push(cellId);
    }
  }
  return result;
}

export function batchBuildSelected(
  state: GameState,
  playerIndex: number,
  cellIds: number[],
): { state: GameState; totalCost: number; builtCount: number } {
  let current = state;
  let totalCost = 0;
  let builtCount = 0;
  for (const cellId of cellIds) {
    const before = current.players[playerIndex]?.money ?? 0;
    const next = buildHouse(current, playerIndex, cellId);
    const after = next.players[playerIndex]?.money ?? 0;
    if (after !== before || next.properties[cellId]?.buildings !== current.properties[cellId]?.buildings) {
      totalCost += before - after;
      builtCount += 1;
    }
    current = next;
  }
  return { state: current, totalCost, builtCount };
}

export function batchMortgageSelected(
  state: GameState,
  playerIndex: number,
  cellIds: number[],
): { state: GameState; totalValue: number; count: number } {
  let current = state;
  let totalValue = 0;
  let count = 0;
  for (const cellId of cellIds) {
    const before = current.players[playerIndex]?.money ?? 0;
    const next = mortgageProperty(current, playerIndex, cellId);
    const after = next.players[playerIndex]?.money ?? 0;
    if (after > before) {
      totalValue += after - before;
      count += 1;
    }
    current = next;
  }
  return { state: current, totalValue, count };
}

export function batchRedeemSelected(
  state: GameState,
  playerIndex: number,
  cellIds: number[],
): { state: GameState; totalCost: number; count: number } {
  let current = state;
  let totalCost = 0;
  let count = 0;
  for (const cellId of cellIds) {
    const before = current.players[playerIndex]?.money ?? 0;
    const next = redeemProperty(current, playerIndex, cellId);
    const after = next.players[playerIndex]?.money ?? 0;
    if (before > after) {
      totalCost += before - after;
      count += 1;
    }
    current = next;
  }
  return { state: current, totalCost, count };
}

export function batchBuild(
  state: GameState,
  playerIndex: number,
): { state: GameState; totalCost: number; builtCount: number } {
  let currentState = cloneState(state);
  let totalCost = 0;
  let builtCount = 0;
  const logType = getPlayerLogType(playerIndex);

  // 收集玩家擁有的所有地套
  const setIds: string[] = [];
  if (currentState.boardCells) {
    const seen = new Set<string>();
    for (const c of currentState.boardCells) {
      if (c.setId && !seen.has(c.setId)) {
        seen.add(c.setId);
        setIds.push(c.setId);
      }
    }
  } else {
    for (const setConfig of SETS) {
      setIds.push(setConfig.id);
    }
  }

  const ownerTeam = currentState.isCoopMode
    ? getPlayerTeam(currentState, playerIndex)
    : undefined;

  // 找出玩家已擁有全套的地產組
  const ownedSetIds: string[] = setIds.filter((setId) =>
    checkSetCompleteFromProperties(
      playerIndex,
      setId,
      currentState.properties,
      currentState.isCoopMode,
      ownerTeam,
      currentState.boardCells,
    ),
  );

  if (ownedSetIds.length === 0) {
    currentState.logs.push(makeLog(logType, '批量建造失敗：沒有已擁有的全套地產'));
    return { state: currentState, totalCost: 0, builtCount: 0 };
  }

  // 逐級建造，遵守均勻建房規則
  let builtSomething = true;
  while (builtSomething) {
    builtSomething = false;
    for (const setId of ownedSetIds) {
      // 獲取該套地塊列表
      let setCells: number[];
      if (currentState.boardCells) {
        setCells = currentState.boardCells.filter((c) => c.setId === setId).map((c) => c.id);
      } else {
        const setConfig = SETS.find((s) => s.id === setId);
        setCells = setConfig ? setConfig.cells : [];
      }

      // 找出建築最少的那幾塊（遵守均勻規則：只能在最少的那級上加建）
      let minBuildings = 5;
      for (const cid of setCells) {
        const p = currentState.properties[cid];
        if (p && !p.isMortgaged && !p.specialBuilding) {
          minBuildings = Math.min(minBuildings, p.buildings);
        }
      }

      if (minBuildings >= 5) continue; // 已滿

      // 在每塊建築最少的地塊上建一棟
      const targetCells = setCells.filter((cid) => {
        const p = currentState.properties[cid];
        return p && p.buildings === minBuildings && !p.isMortgaged && !p.specialBuilding;
      });

      for (const cid of targetCells) {
        const player = currentState.players[playerIndex];
        const isHotel = minBuildings === 4;
        const baseCost = getBuildingCost(cid, currentState.mode, isHotel, player.profession, currentState.properties);
        const weatherDiscount = currentState.weatherMultipliers.propertyPriceDiscount ?? 0;
        const buildSkillDiscount = getSkillValue(player.skillTree, 'build_master');
        const winterMultiplier = currentState.season?.type === 'winter' ? 1.2 : 1;
        const cost = Math.round(
          baseCost * winterMultiplier * (1 - weatherDiscount) * (1 - buildSkillDiscount),
        );

        if (player.money - totalCost < cost) {
          // 錢不夠了，停止
          break;
        }

        currentState = buildHouse(currentState, playerIndex, cid);
        // buildHouse 內部已經扣錢、加建築、寫日誌
        totalCost += cost;
        builtCount += 1;
        builtSomething = true;
      }
    }
  }

  currentState.logs.push(
    makeLog(logType, `【閃電】 快捷操作：批量建造完成，共建 ${builtCount} 棟，花費 ${totalCost} 元`),
  );

  return { state: currentState, totalCost, builtCount };
}

export function batchMortgage(
  state: GameState,
  playerIndex: number,
): { state: GameState; totalValue: number; count: number } {
  let currentState = cloneState(state);
  let totalValue = 0;
  let count = 0;
  const logType = getPlayerLogType(playerIndex);

  const ownedIds = getPlayerOwnedCellIds(currentState, playerIndex);

  for (const cellId of ownedIds) {
    const prop = currentState.properties[cellId];
    if (!prop || prop.isMortgaged || prop.buildings !== 0) continue;
    // 保險的地塊也可以抵押（保險不影響抵押）
    currentState = mortgageProperty(currentState, playerIndex, cellId);
    const value = getMortgageValue(cellId, currentState.mode);
    totalValue += value;
    count += 1;
  }

  currentState.logs.push(
    makeLog(logType, `【閃電】 快捷操作：批量抵押完成，共 ${count} 塊，獲得 ${totalValue} 元`),
  );

  return { state: currentState, totalValue, count };
}

export function batchRedeem(
  state: GameState,
  playerIndex: number,
): { state: GameState; totalCost: number; count: number } {
  let currentState = cloneState(state);
  let totalCost = 0;
  let count = 0;
  const logType = getPlayerLogType(playerIndex);

  const ownedIds = getPlayerOwnedCellIds(currentState, playerIndex);

  for (const cellId of ownedIds) {
    const prop = currentState.properties[cellId];
    if (!prop || !prop.isMortgaged) continue;

    const mortgageValue = getMortgageValue(cellId, currentState.mode);
    const player = currentState.players[playerIndex];
    const redeemInterest = getRedeemInterest(mortgageValue, player.profession);
    const redeemValue = mortgageValue + redeemInterest;

    if (player.money - totalCost < redeemValue) {
      // 錢不夠，跳過這塊（繼續嘗試更便宜的）
      continue;
    }

    currentState = redeemProperty(currentState, playerIndex, cellId);
    totalCost += redeemValue;
    count += 1;
  }

  currentState.logs.push(
    makeLog(logType, `【閃電】 快捷操作：批量贖回完成，共 ${count} 塊，花費 ${totalCost} 元`),
  );

  return { state: currentState, totalCost, count };
}

// ========== 投降 ==========

export function surrender(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (newState.phase === 'ended') {
    newState.logs.push(makeLog(logType, '投降失敗：遊戲已結束'));
    return newState;
  }

  // 合作模式：一人投降 = 整隊投降
  if (newState.isCoopMode && newState.teams) {
    const teamId = getPlayerTeam(newState, playerIndex);
    if (teamId) {
      const team = newState.teams[teamId];
      if (team) {
        // 整隊所有玩家都設為破產/投降
        for (const idx of team.playerIndices) {
          newState.players[idx].isBankrupt = true;
          if (!newState.bankruptPlayers.includes(idx)) {
            newState.bankruptPlayers.push(idx);
          }
          if (!newState.bankruptcyList) {
            newState.bankruptcyList = [];
          }
          if (!newState.bankruptcyList.includes(idx)) {
            newState.bankruptcyList.push(idx);
          }
        }
        // 記錄投降玩家
        if (!newState.surrenderedPlayers) {
          newState.surrenderedPlayers = [];
        }
        for (const idx of team.playerIndices) {
          if (!newState.surrenderedPlayers.includes(idx)) {
            newState.surrenderedPlayers.push(idx);
          }
        }
        // 隊伍地產歸銀行
        for (const [cellIdStr, prop] of Object.entries(newState.properties)) {
          const cid = Number(cellIdStr);
          if (prop.ownerTeam === teamId) {
            delete newState.properties[cid];
            delete newState.ownedProperties[cid];
          }
        }

        // 找出勝利隊伍
        const winnerIdx = checkWinner(newState);
        newState.winner = winnerIdx;
        if (winnerIdx !== null) {
          newState.phase = 'ended';
          const winnerTeamId = getPlayerTeam(newState, winnerIdx);
          const winnerTeamName = winnerTeamId && newState.teams[winnerTeamId]
            ? newState.teams[winnerTeamId].name
            : newState.players[winnerIdx].name;
          newState.logs.push(
            makeLog(
              'system',
              `${player.name} 投降！${team.name} 全軍覆沒！${winnerTeamName} 獲勝！`,
            ),
          );
          checkAndUnlockAchievements(newState, winnerIdx);
        }
        return newState;
      }
    }
  }

  // 大逃殺模式：投降 = 直接淘汰，其他人繼續
  if (newState.isBattleRoyale) {
    player.isBankrupt = true;
    if (!newState.bankruptPlayers.includes(playerIndex)) {
      newState.bankruptPlayers.push(playerIndex);
    }
    if (!newState.bankruptcyList) {
      newState.bankruptcyList = [];
    }
    if (!newState.bankruptcyList.includes(playerIndex)) {
      newState.bankruptcyList.push(playerIndex);
    }
    // 記錄投降玩家
    if (!newState.surrenderedPlayers) {
      newState.surrenderedPlayers = [];
    }
    if (!newState.surrenderedPlayers.includes(playerIndex)) {
      newState.surrenderedPlayers.push(playerIndex);
    }
    // 地產歸銀行
    for (const [cellIdStr, prop] of Object.entries(newState.properties)) {
      const cid = Number(cellIdStr);
      if (prop.owner === playerIndex) {
        delete newState.properties[cid];
        delete newState.ownedProperties[cid];
      }
    }

    const aliveCount = newState.players.filter((p: PlayerState) => !p.isBankrupt).length;
    if (aliveCount <= 1) {
      const winnerIdx = newState.players.findIndex((p: PlayerState) => !p.isBankrupt);
      newState.winner = winnerIdx >= 0 ? winnerIdx : null;
      if (newState.winner !== null) {
        newState.phase = 'ended';
        newState.logs.push(
          makeLog(
            'system',
            `${player.name} 投降！${newState.players[newState.winner].name} 獲勝！`,
          ),
        );
        checkAndUnlockAchievements(newState, newState.winner);
      }
    } else {
      newState.logs.push(
        makeLog(logType, `${player.name} 投降，退出遊戲。剩餘 ${aliveCount} 位玩家繼續。`),
      );
    }
    updateBuildingCounts(newState);
    updatePlayerAssets(newState);
    return newState;
  }

  // 普通模式（雙人對戰等）：設為破產，直接結束遊戲
  player.isBankrupt = true;
  if (!newState.bankruptPlayers.includes(playerIndex)) {
    newState.bankruptPlayers.push(playerIndex);
  }
  if (!newState.bankruptcyList) {
    newState.bankruptcyList = [];
  }
  if (!newState.bankruptcyList.includes(playerIndex)) {
    newState.bankruptcyList.push(playerIndex);
  }
  // 記錄投降玩家
  if (!newState.surrenderedPlayers) {
    newState.surrenderedPlayers = [];
  }
  if (!newState.surrenderedPlayers.includes(playerIndex)) {
    newState.surrenderedPlayers.push(playerIndex);
  }

  // 所有地產歸銀行
  for (const [cellIdStr, prop] of Object.entries(newState.properties)) {
    const cid = Number(cellIdStr);
    if (prop.owner === playerIndex) {
      delete newState.properties[cid];
      delete newState.ownedProperties[cid];
    }
  }

  const winnerIdx = checkWinner(newState);
  newState.winner = winnerIdx;
  if (winnerIdx !== null) {
    newState.phase = 'ended';
    newState.logs.push(
      makeLog(
        'system',
        `${player.name} 投降，${newState.players[winnerIdx].name} 獲勝！`,
      ),
    );
    checkAndUnlockAchievements(newState, winnerIdx);
  }

  updateBuildingCounts(newState);
  updatePlayerAssets(newState);
  return newState;
}

// ========== 交易系统 ==========

export function proposeTrade(
  state: GameState,
  fromPlayer: number,
  toPlayer: number,
  offerData: {
    givenProperties: number[];
    receivedProperties: number[];
    moneyAmount: number;
  },
): GameState {
  const newState = cloneState(state);
  const { givenProperties, receivedProperties, moneyAmount } = offerData;
  const fromLogType = getPlayerLogType(fromPlayer);

  // 戰爭期間禁止交易
  if (newState.customRules?.enableWarSystem !== false && newState.wars) {
    for (const war of newState.wars) {
      if (
        (war.attackerIndex === fromPlayer && war.defenderIndex === toPlayer) ||
        (war.attackerIndex === toPlayer && war.defenderIndex === fromPlayer)
      ) {
        newState.logs.push(makeLog(fromLogType, `交易失敗：戰爭期間無法與敵對玩家交易`));
        return newState;
      }
    }
  }

  // 校验：发起方确实拥有给出的地块且未抵押
  for (const cellId of givenProperties) {
    const prop = newState.properties[cellId];
    if (!prop || prop.owner !== fromPlayer) {
      newState.logs.push(
        makeLog(fromLogType, `交易失敗：${getCellConfig(newState, cellId).name} 不屬於你`),
      );
      return newState;
    }
    if (prop.isMortgaged) {
      newState.logs.push(
        makeLog(fromLogType, `交易失敗：${getCellConfig(newState, cellId).name} 已抵押，不能交易`),
      );
      return newState;
    }
  }

  // 校验：接收方确实拥有请求的地块
  for (const cellId of receivedProperties) {
    const prop = newState.properties[cellId];
    if (!prop || prop.owner !== toPlayer) {
      newState.logs.push(
        makeLog(fromLogType, `交易失敗：${getCellConfig(newState, cellId).name} 不屬於對方`),
      );
      return newState;
    }
  }

  // 校验：发起方有足够的钱（如果 moneyAmount > 0，发起方付钱）
  if (moneyAmount > 0 && newState.players[fromPlayer].money < moneyAmount) {
    newState.logs.push(makeLog(fromLogType, `交易失敗：現金不足`));
    return newState;
  }
  // 校验：接收方有足够的钱（如果 moneyAmount < 0，接收方付钱给发起方）
  if (moneyAmount < 0 && newState.players[toPlayer].money < Math.abs(moneyAmount)) {
    newState.logs.push(makeLog(fromLogType, `交易失敗：對方現金不足`));
    return newState;
  }

  const tradeOffer: TradeOffer = {
    id: ++tradeCounter,
    fromPlayer,
    toPlayer,
    givenProperties: [...givenProperties],
    receivedProperties: [...receivedProperties],
    moneyAmount,
  };

  newState.pendingTrade = tradeOffer;

  const givenNames = givenProperties.map((id) => getCellConfig(newState, id).name).join("、") || "無";
  const receivedNames = receivedProperties.map((id) => getCellConfig(newState, id).name).join("、") || "無";
  const moneyText = moneyAmount > 0
    ? `+${moneyAmount}元`
    : moneyAmount < 0
      ? `${moneyAmount}元`
      : "0元";

  newState.logs.push(
    makeLog(
      "trade",
      `${newState.players[fromPlayer].name} 发起交易：给出【${givenNames}】${moneyText}，换取【${receivedNames}】`,
    ),
  );

  return newState;
}

export function acceptTrade(state: GameState): GameState {
  const newState = cloneState(state);
  const trade = newState.pendingTrade;
  if (!trade) return newState;

  const { fromPlayer, toPlayer, givenProperties, receivedProperties, moneyAmount } = trade;

  // 重新校驗：戰爭期間禁止交易
  if (newState.customRules?.enableWarSystem !== false && newState.wars) {
    for (const war of newState.wars) {
      if (
        (war.attackerIndex === fromPlayer && war.defenderIndex === toPlayer) ||
        (war.attackerIndex === toPlayer && war.defenderIndex === fromPlayer)
      ) {
        newState.logs.push(makeLog("trade", `交易失敗：戰爭期間無法交易`));
        newState.pendingTrade = null;
        return newState;
      }
    }
  }

  // 重新校驗：發起方仍然擁有給出的地塊且未抵押
  for (const cellId of givenProperties) {
    const prop = newState.properties[cellId];
    if (!prop || prop.owner !== fromPlayer) {
      newState.logs.push(makeLog("trade", `交易失敗：${getCellConfig(newState, cellId).name} 已不屬於對方`));
      newState.pendingTrade = null;
      return newState;
    }
    if (prop.isMortgaged) {
      newState.logs.push(makeLog("trade", `交易失敗：${getCellConfig(newState, cellId).name} 已抵押，不能交易`));
      newState.pendingTrade = null;
      return newState;
    }
  }

  // 重新校驗：接收方仍然擁有請求的地塊且未抵押
  for (const cellId of receivedProperties) {
    const prop = newState.properties[cellId];
    if (!prop || prop.owner !== toPlayer) {
      newState.logs.push(makeLog("trade", `交易失敗：${getCellConfig(newState, cellId).name} 已不屬於你`));
      newState.pendingTrade = null;
      return newState;
    }
    if (prop.isMortgaged) {
      newState.logs.push(makeLog("trade", `交易失敗：${getCellConfig(newState, cellId).name} 已抵押，不能交易`));
      newState.pendingTrade = null;
      return newState;
    }
  }

  // 重新校驗：雙方金錢仍然充足
  if (moneyAmount > 0 && newState.players[fromPlayer].money < moneyAmount) {
    newState.logs.push(makeLog("trade", `交易失敗：對方現金不足`));
    newState.pendingTrade = null;
    return newState;
  }
  if (moneyAmount < 0 && newState.players[toPlayer].money < Math.abs(moneyAmount)) {
    newState.logs.push(makeLog("trade", `交易失敗：現金不足`));
    newState.pendingTrade = null;
    return newState;
  }

  // 执行所有权转移（给出的地块：fromPlayer → toPlayer）
  for (const cellId of givenProperties) {
    const prop = newState.properties[cellId];
    if (prop) {
      prop.owner = toPlayer;
      if (newState.isCoopMode) {
        prop.ownerTeam = getPlayerTeam(newState, toPlayer);
      }
      newState.ownedProperties[cellId] = toPlayer;
    }
  }

  // 执行所有权转移（接收的地块：toPlayer → fromPlayer）
  for (const cellId of receivedProperties) {
    const prop = newState.properties[cellId];
    if (prop) {
      prop.owner = fromPlayer;
      if (newState.isCoopMode) {
        prop.ownerTeam = getPlayerTeam(newState, fromPlayer);
      }
      newState.ownedProperties[cellId] = fromPlayer;
    }
  }

  // 执行金钱转移
  // moneyAmount > 0：fromPlayer 给 toPlayer 钱
  // moneyAmount < 0：fromPlayer 收 toPlayer 钱（即 toPlayer 给 fromPlayer 钱）
  if (moneyAmount > 0) {
    newState.players[fromPlayer].money -= moneyAmount;
    newState.players[toPlayer].money += moneyAmount;
  } else if (moneyAmount < 0) {
    const absAmount = Math.abs(moneyAmount);
    newState.players[toPlayer].money -= absAmount;
    newState.players[fromPlayer].money += absAmount;
  }

  // 影子經紀人：抽取成交額 10% 佣金（僅限金錢交易部分）
  const tradeMoneyVolume = Math.abs(moneyAmount);
  if (tradeMoneyVolume > 0) {
    for (let i = 0; i < newState.players.length; i++) {
      const p = newState.players[i];
      if (p.profession === "shadow_broker" && i !== fromPlayer && i !== toPlayer && !p.isBankrupt) {
        const commission = Math.round(tradeMoneyVolume * 0.1);
        p.money += commission;
        newState.logs.push(
          makeLog("trade", `【影子經紀人】${p.name} 從交易中抽取 ${commission} 元佣金`),
        );
        if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, i);
      }
    }
  }

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, fromPlayer);
    syncCoopMoneyFromPlayer(newState, toPlayer);
  }

  // 清空 pendingTrade
  newState.pendingTrade = null;

  // 更新 completeSets
  updateCompleteSets(newState);
  updateBuildingCounts(newState);
  updatePlayerAssets(newState);

  // 成就：交易次数
  newState.players[fromPlayer].tradeCount++;
  newState.players[toPlayer].tradeCount++;

  newState.logs.push(
    makeLog(
      "trade",
      `${newState.players[toPlayer].name} 接受了交易`,
    ),
  );

  return newState;
}

export function rejectTrade(state: GameState): GameState {
  const newState = cloneState(state);
  const trade = newState.pendingTrade;
  if (!trade) return newState;

  const toPlayer = trade.toPlayer;
  newState.pendingTrade = null;

  newState.logs.push(
    makeLog(
      "trade",
      `${newState.players[toPlayer].name} 拒绝了交易`,
    ),
  );

  return newState;
}

// ========== AI 扩展决策 ==========

export function aiBuildDecision(
  state: GameState,
): { cellId: number; action: "build" } | null {
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  const teamId = state.isCoopMode ? player.teamId : undefined;

  // 找到所有玩家（合作模式下是队伍）所有的、未抵押、可建造的地块
  const buildableCells: number[] = [];
  for (const [cellIdStr, prop] of Object.entries(state.properties)) {
    const cellId = Number(cellIdStr);
    const isOwned = state.isCoopMode && teamId
      ? prop.ownerTeam === teamId
      : prop.owner === playerIndex;
    if (isOwned && !prop.isMortgaged && prop.buildings < 5) {
      buildableCells.push(cellId);
    }
  }

  if (buildableCells.length === 0) return null;

  const diff = AI_DIFFICULTY_CONFIG[getAiDifficulty(state)];
  const personality = AI_PERSONALITY_CONFIG[getAiPersonality(state)];

  // 优先在已集齐系列的地块上建房
  const completeSetCells: number[] = [];
  const otherCells: number[] = [];

  for (const cellId of buildableCells) {
    const setId = getCellSet(cellId);
    const hasSet = setId && (
      state.isCoopMode && teamId
        ? checkTeamSetCompleteGeneric(setId, teamId, state.properties)
        : checkSetCompleteFromProperties(playerIndex, setId, state.properties)
    );
    if (hasSet) {
      completeSetCells.push(cellId);
    } else {
      otherCells.push(cellId);
    }
  }

  let candidates = completeSetCells.length > 0 ? completeSetCells : otherCells;

  // 個性：投機派不喜歡建房，貿易派優先套裝
  if (personality.preferSetComplete && completeSetCells.length > 0) {
    candidates = completeSetCells;
  }

  // 激進度 + 難度 + 個性：調整建房門檻
  const aggression = getAiAggression(state);
  const baseThreshold = 3 - aggression * 1.5;
  const priceThreshold = baseThreshold / (diff.buildProbabilityMultiplier * personality.buildBias);

  // 资金充足（>地价×門檻）时建造，选最贵的地块建
  const affordableCandidates = candidates.filter((cellId) => {
    const prop = state.properties[cellId];
    const isHotel = prop.buildings === 4;
    const cost = isHotel
      ? getHotelPrice(cellId, state.mode)
      : getBuildingPrice(cellId, state.mode);
    const landPrice = getCellPrice(cellId, state.mode, state.customRules, state.boardCells);
    return player.money > landPrice * priceThreshold && player.money >= cost;
  });

  if (affordableCandidates.length === 0) return null;

  // 選地價最高的地塊建（投資回報高）
  affordableCandidates.sort((a, b) => getCellPrice(b, state.mode, state.customRules, state.boardCells) - getCellPrice(a, state.mode, state.customRules, state.boardCells));

  // 激進度 + 難度 + 個性 影響最終建房概率
  const baseBuildProb = 0.5 + aggression * 0.5;
  const buildProbability = Math.min(0.98, baseBuildProb * diff.buildProbabilityMultiplier * personality.buildBias);
  if (Math.random() > buildProbability) return null;

  return { cellId: affordableCandidates[0], action: "build" };
}

export function aiMortgageDecision(state: GameState): number[] {
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  const teamId = state.isCoopMode ? player.teamId : undefined;

  // 当现金 < 2000 时考虑抵押
  if (player.money >= 2000) return [];

  // 找未抵押、无建筑的地产
  const mortgageableCells: number[] = [];
  for (const [cellIdStr, prop] of Object.entries(state.properties)) {
    const cellId = Number(cellIdStr);
    const isOwned = state.isCoopMode && teamId
      ? prop.ownerTeam === teamId
      : prop.owner === playerIndex;
    if (isOwned && !prop.isMortgaged && prop.buildings === 0) {
      // 不抵押集齐系列的地块（避免失去套装加成）
      const setId = getCellSet(cellId);
      const hasSet = setId && (
        state.isCoopMode && teamId
          ? checkTeamSetCompleteGeneric(setId, teamId, state.properties)
          : checkSetCompleteFromProperties(playerIndex, setId, state.properties)
      );
      if (hasSet) continue;
      mortgageableCells.push(cellId);
    }
  }

  if (mortgageableCells.length === 0) return [];

  // 抵押最便宜的地块（保留高价值地块）
  mortgageableCells.sort(
    (a, b) => getCellPrice(a, state.mode) - getCellPrice(b, state.mode),
  );

  // 计算需要多少钱到2000
  const needed = 2000 - player.money;
  const result: number[] = [];
  let accumulated = 0;
  for (const cellId of mortgageableCells) {
    if (accumulated >= needed) break;
    result.push(cellId);
    accumulated += getMortgageValue(cellId, state.mode);
  }

  return result;
}

export function aiEvaluateTrade(
  state: GameState,
  trade: TradeOffer,
): number {
  // 评估值 = (获得的地产价值 + 获得的钱) - (给出的地产价值 + 给出的钱)
  const evaluatorIndex = trade.toPlayer;

  // 对方给出的 = 我方获得的
  let gainedValue = 0;
  for (const cellId of trade.givenProperties) {
    const prop = state.properties[cellId];
    if (prop) {
      gainedValue += getPropertyValue(cellId, state.mode, prop.buildings, prop.isMortgaged);
    }
  }

  // 对方请求的 = 我方给出的
  let givenValue = 0;
  for (const cellId of trade.receivedProperties) {
    const prop = state.properties[cellId];
    if (prop) {
      givenValue += getPropertyValue(cellId, state.mode, prop.buildings, prop.isMortgaged);
    }
  }

  // 金钱部分：moneyAmount > 0 表示 fromPlayer 给 toPlayer 钱
  // 所以 toPlayer（评估方）获得 moneyAmount
  const moneyGained = trade.moneyAmount;

  return gainedValue + moneyGained - givenValue;
}

export function aiShouldAcceptTrade(
  state: GameState,
  trade: TradeOffer,
): boolean {
  const evaluation = aiEvaluateTrade(state, trade);
  const diff = AI_DIFFICULTY_CONFIG[getAiDifficulty(state)];
  const personality = AI_PERSONALITY_CONFIG[getAiPersonality(state)];

  let totalLandValue = 0;
  let landCount = 0;
  for (const [cellIdStr, prop] of Object.entries(state.properties)) {
    if (prop.owner === trade.toPlayer) {
      totalLandValue += getCellPrice(Number(cellIdStr), state.mode);
      landCount++;
    }
  }
  const avgLandValue = landCount > 0 ? totalLandValue / landCount : 1000;

  // 難度/個性影響接受門檻：貿易派更容易接受交易
  const thresholdMultiplier = 1 / (diff.tradeAggression * personality.tradeBias);
  const threshold = avgLandValue * 0.2 * Math.max(0.3, thresholdMultiplier);
  return evaluation > threshold;
}

export function aiProposeTrade(state: GameState): TradeOffer | null {
  const aiIndex = state.currentPlayerIndex;
  // 找下一个未破产的对手作为交易目标
  const opponentIndex = getNextPlayer(state, aiIndex);
  if (opponentIndex === aiIndex) return null; // 只剩自己
  const aiPlayer = state.players[aiIndex];

  // 简单策略：找对方拥有的、能帮AI凑齐系列的关键地块
  const aiProps = Object.entries(state.properties).filter(
    ([, p]) => p.owner === aiIndex,
  );
  const opponentProps = Object.entries(state.properties).filter(
    ([, p]) => p.owner === opponentIndex && !p.isMortgaged,
  );

  if (opponentProps.length === 0) return null;

  // 找出AI几乎凑齐但差1块的系列
  let targetCellId: number | null = null;
  let bestSetGain = 0;

  for (const setConfig of SETS) {
    const aiOwnedInSet = setConfig.cells.filter(
      (cellId) => state.properties[cellId]?.owner === aiIndex,
    ).length;
    const opponentOwnedInSet = setConfig.cells.filter(
      (cellId) => state.properties[cellId]?.owner === opponentIndex,
    );

    // AI已有2块、对方有1块的系列 → 目标
    if (aiOwnedInSet === setConfig.cells.length - 1 && opponentOwnedInSet.length === 1) {
      const targetCell = opponentOwnedInSet[0];
      const setValue = setConfig.cells.reduce(
        (sum, cid) => sum + getCellPrice(cid, state.mode),
        0,
      );
      if (setValue > bestSetGain) {
        bestSetGain = setValue;
        targetCellId = targetCell;
      }
    }
  }

  if (targetCellId === null) return null;

  // 找AI多余的、对方可能感兴趣的地块（不在对方想凑的系列里，简化：随便找一个AI拥有的非集齐系列的地块）
  let offeredCellId: number | null = null;
  for (const [cellIdStr, prop] of aiProps) {
    const cellId = Number(cellIdStr);
    if (prop.isMortgaged) continue;
    const setId = getCellSet(cellId);
    // 不给出已集齐系列的地块
    if (setId && checkSetCompleteFromProperties(aiIndex, setId, state.properties)) {
      continue;
    }
    // 选一个价格相近的
    const targetPrice = getCellPrice(targetCellId, state.mode);
    const offerPrice = getCellPrice(cellId, state.mode);
    if (Math.abs(targetPrice - offerPrice) < targetPrice * 0.5) {
      offeredCellId = cellId;
      break;
    }
  }

  const givenProperties: number[] = [];
  const receivedProperties = [targetCellId];
  let moneyAmount = 0;

  const targetPrice = getCellPrice(targetCellId, state.mode);

  if (offeredCellId !== null) {
    givenProperties.push(offeredCellId);
    const offerPrice = getCellPrice(offeredCellId, state.mode);
    // 如果AI的地块便宜，补差价；如果贵，让对方补（即moneyAmount为负）
    const diff = targetPrice - offerPrice;
    // AI愿意多付50%溢价来凑齐系列
    const premium = Math.round(targetPrice * 0.5);
    moneyAmount = Math.max(0, diff + premium);
  } else {
    // 没有合适地块可交换，直接用钱买
    moneyAmount = Math.round(targetPrice * 1.5);
  }

  // AI必须有足够的钱
  if (moneyAmount > 0 && aiPlayer.money < moneyAmount) {
    // 钱不够，尝试减少金额或放弃
    if (aiPlayer.money > targetPrice) {
      moneyAmount = aiPlayer.money;
    } else {
      return null;
    }
  }

  // 至少要有意义（不是纯亏钱的离谱交易）
  if (moneyAmount > targetPrice * 2) return null;

  return {
    id: ++tradeCounter,
    fromPlayer: aiIndex,
    toPlayer: opponentIndex,
    givenProperties,
    receivedProperties,
    moneyAmount,
  };
}

// ========== NPC 互動系統 ==========

export function resolveNpcInteraction(
  state: GameState,
  playerIndex: number,
  accept: boolean,
): GameState {
  const newState = cloneState(state);
  const interaction = newState.pendingNpcInteraction;
  if (!interaction || interaction.playerIndex !== playerIndex) {
    return newState;
  }

  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);
  const npcType = interaction.npcType;

  if (!accept) {
    newState.logs.push(
      makeLog(
        "npc",
        `${player.name} 拒絕了 ${NPC_CONFIG[npcType].name}`,
      ),
    );
    newState.pendingNpcInteraction = null;
    return newState;
  }

  switch (npcType) {
    case 'wanderer': {
      // 流浪商人：1.5 倍價格購買稀有道具（固定 $1500）
      const price = 1500;
      // 檢查道具上限
      const playerItems = newState.isCoopMode && newState.teams && player.teamId
        ? newState.teams[player.teamId].items
        : player.items;
      if (playerItems.length >= MAX_ITEMS) {
        newState.logs.push(
          makeLog(
            "npc",
            `${player.name} 道具已滿，無法向流浪商人購買`,
          ),
        );
        newState.pendingNpcInteraction = null;
        return newState;
      }
      if (player.money < price) {
        newState.logs.push(
          makeLog(
            "npc",
            `${player.name} 現金不足，無法向流浪商人購買道具`,
          ),
        );
        newState.pendingNpcInteraction = null;
        return newState;
      }
      // 隨機選擇一個道具
      const randomItem = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      const itemConfig = ITEMS[randomItem];
      player.money -= price;
      playerItems.push({
        type: randomItem,
        id: Date.now() + Math.floor(Math.random() * 10000),
      });
      newState.logs.push(
        makeLog(
          "npc",
          `${player.name} 向流浪商人購買了 ${itemConfig.name}，花費 $${price}`,
        ),
      );
      break;
    }
    case 'hacker': {
      // 駭客：花 $1000 查看對手情報
      const cost = 1000;
      if (player.money < cost) {
        newState.logs.push(
          makeLog(
            "npc",
            `${player.name} 現金不足，無法聘請駭客`,
          ),
        );
        newState.pendingNpcInteraction = null;
        return newState;
      }
      player.money -= cost;
      // 找對手（第一個非自己的存活玩家）
      let opponentIndex = -1;
      for (let i = 0; i < newState.players.length; i++) {
        if (i !== playerIndex && !newState.players[i].isBankrupt) {
          opponentIndex = i;
          break;
        }
      }
      if (opponentIndex >= 0) {
        const opponent = newState.players[opponentIndex];
        const opponentAssets = getTotalAssets(opponentIndex, newState);
        newState.logs.push(
          makeLog(
            "npc",
            `[駭客] 花費 $${cost}，獲取對手情報：${opponent.name} 現金 $${opponent.money}，資產 $${opponentAssets}`,
          ),
        );
      }
      break;
    }
  }

  newState.pendingNpcInteraction = null;
  return newState;
}

// ========== 拍卖系统 ==========

export function startAuction(state: GameState, cellId: number, isBlind?: boolean): GameState {
  const newState = cloneState(state);
  const landPrice = getCellPrice(cellId, newState.mode);
  const startingPrice = Math.ceil(landPrice * 0.2);

  // 判斷是否為暗拍模式：顯式參數優先，其次 customRules 預設
  const useBlind = isBlind ?? newState.customRules?.defaultAuctionMode === 'blind';
  const minIncrement = useBlind ? 100 : Math.ceil(startingPrice * 0.1);

  // 所有存活玩家参与拍卖，landing player 也是普通竞拍者，從 landingPlayer 的下一位開始輪流出價
  const landingPlayer = newState.currentPlayerIndex;
  const allAlive: number[] = newState.players
    .map((_p: PlayerState, i: number) => i)
    .filter((i: number) => !newState.players[i].isBankrupt);

  // activeBidders 按从 landingPlayer 的下一位开始排列，完整循环一轮
  const landingIdxInAlive = allAlive.indexOf(landingPlayer);
  const activeBidders: number[] = [
    ...allAlive.slice(landingIdxInAlive + 1),
    ...allAlive.slice(0, landingIdxInAlive + 1),
  ];

  const auction: AuctionState = {
    cellId,
    currentBid: startingPrice,
    currentBidder: -1, // -1 表示還沒有人真正出價，起拍價僅為底價
    activeBidders,
    activeBidderIndex: 0, // 從第一位競拍者開始行動
    active: true,
    startingPrice,
    minIncrement,
  };

  // 暗拍模式初始化
  if (useBlind) {
    auction.isBlind = true;
    auction.blindBids = {};
    for (const idx of activeBidders) {
      auction.blindBids[idx] = null;
    }
    auction.revealed = false;
  }

  newState.auction = auction;
  newState.phase = "auction";

  const cell = getCellConfig(newState, cellId);
  if (useBlind) {
    newState.logs.push(
      makeLog(
        "auction",
        `【暗拍】拍賣開始：${cell.name}，底價 ${startingPrice} 元，最低加價 ${minIncrement} 元`,
      ),
    );
  } else {
    newState.logs.push(
      makeLog(
        "auction",
        `拍卖开始：${cell.name}，起拍价 ${startingPrice} 元，最低加价 ${minIncrement} 元`,
      ),
    );
    const firstBidder = activeBidders[0];
    newState.logs.push(
      makeLog(
        "auction",
        `轮到 ${newState.players[firstBidder].name} 出价`,
      ),
    );
  }

  return newState;
}

function getAuctionActiveBidder(auction: AuctionState): number {
  // 当前轮到 activeBidders[activeBidderIndex] 行动
  return auction.activeBidders[auction.activeBidderIndex];
}

export function placeBid(
  state: GameState,
  playerIndex: number,
  bidAmount: number,
): GameState {
  const newState = cloneState(state);
  const auction = newState.auction;
  if (!auction || !auction.active || newState.phase !== "auction") {
    return newState;
  }

  // 暗拍模式：不使用輪流出價，請用 submitBlindBid
  if (auction.isBlind) {
    return newState;
  }

  const activeBidder = getAuctionActiveBidder(auction);
  if (activeBidder !== playerIndex) {
    return newState;
  }

  const player = newState.players[playerIndex];
  const newTotal = auction.currentBid + bidAmount;

  // 校验加价幅度
  if (bidAmount < auction.minIncrement) {
    newState.logs.push(
      makeLog("auction", `加价不足，最低加价 ${auction.minIncrement} 元`),
    );
    return newState;
  }

  // 校验资金
  if (player.money < newTotal) {
    newState.logs.push(
      makeLog("auction", `${player.name} 资金不足，无法出价`),
    );
    return newState;
  }

  auction.currentBid = newTotal;
  auction.currentBidder = playerIndex;

  newState.logs.push(
    makeLog(
      "auction",
      `${player.name} 出价 ${newTotal} 元（加价 ${bidAmount} 元）`,
    ),
  );

  // 轮到下一位活跃竞拍者
  auction.activeBidderIndex = (auction.activeBidderIndex + 1) % auction.activeBidders.length;
  const nextBidder = getAuctionActiveBidder(auction);
  newState.logs.push(
    makeLog("auction", `轮到 ${newState.players[nextBidder].name} 出价`),
  );

  return newState;
}

export function passAuction(
  state: GameState,
  playerIndex: number,
): GameState {
  const newState = cloneState(state);
  const auction = newState.auction;
  if (!auction || !auction.active || newState.phase !== "auction") {
    return newState;
  }

  // 暗拍模式：pass 表示放棄出價（等價於出價 0）
  if (auction.isBlind && auction.blindBids) {
    if (!(playerIndex in auction.blindBids)) {
      return newState;
    }
    auction.blindBids[playerIndex] = 0;
    const player = newState.players[playerIndex];
    newState.logs.push(
      makeLog("auction", `${player.name} 放棄出價`),
    );
    // 檢查是否所有活躍競拍者都已出價
    const allBid = auction.activeBidders.every(
      (idx: number) => auction.blindBids?.[idx] !== null && auction.blindBids?.[idx] !== undefined,
    );
    if (allBid) {
      return revealBlindAuction(newState);
    }
    return newState;
  }

  const activeBidder = getAuctionActiveBidder(auction);
  if (activeBidder !== playerIndex) {
    return newState;
  }

  const player = newState.players[playerIndex];

  newState.logs.push(
    makeLog("auction", `${player.name} 放弃出价`),
  );

  // 从 activeBidders 中移除当前 pass 的玩家
  const passIdx = auction.activeBidderIndex;
  auction.activeBidders.splice(passIdx, 1);

  if (auction.activeBidders.length === 0) {
    // 所有人都放棄且無人出價 → 流拍
    const cell = CELLS[auction.cellId];
    newState.logs.push(
      makeLog("auction", `流拍：${cell.name} 无人出价，保持无主`),
    );
    newState.auction = null;
    newState.phase = "rolling";
    const prevIdx = auction.currentBidder >= 0 ? auction.currentBidder : newState.currentPlayerIndex;
    newState.currentPlayerIndex = getNextPlayer(newState, prevIdx);
    return handleRoundEnd(newState, prevIdx);
  }

  if (auction.activeBidders.length === 1) {
    // 只剩一個人：若他出過價則成交，否則流拍
    const remainingBidder = auction.activeBidders[0];
    if (auction.currentBidder === remainingBidder && auction.currentBid > auction.startingPrice) {
      // 正常成交
      const winner = remainingBidder;
      const winnerPlayer = newState.players[winner];
      const cell = CELLS[auction.cellId];
      const price = getBuyPriceDiscount(auction.currentBid, winnerPlayer.profession);

      if (winnerPlayer.money < price) {
        // 資金不足以支付成交價 → 流拍
        newState.logs.push(
          makeLog("auction", `流拍：${winnerPlayer.name} 資金不足，無法支付 ${price} 元`),
        );
        newState.auction = null;
        newState.phase = "rolling";
        newState.currentPlayerIndex = getNextPlayer(newState, winner);
        return handleRoundEnd(newState, winner);
      }

      winnerPlayer.money -= price;
      newState.ownedProperties[auction.cellId] = winner;
      newState.properties[auction.cellId] = {
        owner: winner,
        ownerTeam: newState.isCoopMode ? getPlayerTeam(newState, winner) : undefined,
        buildings: 0,
        isMortgaged: false,
        insured: false,
      };

      const discountText = winnerPlayer.profession === "tycoon" ? "【地产大亨】9折" : "";
      winnerPlayer.auctionWins++;
      newState.logs.push(
        makeLog(
          "auction",
          `拍卖成交：${winnerPlayer.name} 以 ${price} 元${discountText}购得 ${cell.name}`,
        ),
      );

      // 聲望：拍得地產 +2
      changeReputation(newState, winner, REPUTATION_GAIN_AUCTION, "拍賣購得");

      // 合作模式：同步队伍金钱
      if (newState.isCoopMode) {
        syncCoopMoneyFromPlayer(newState, winner);
      }

      updateCompleteSets(newState);
      updateBuildingCounts(newState);
      updatePlayerAssets(newState);

      newState.auction = null;
      newState.phase = "rolling";
      newState.currentPlayerIndex = getNextPlayer(newState, winner);
      return handleRoundEnd(newState, winner);
    } else {
      // 只剩一人但他沒出過價（或價格仍為底價）→ 流拍
      const cell = CELLS[auction.cellId];
      newState.logs.push(
        makeLog("auction", `流拍：${cell.name} 无人出价，保持无主`),
      );
      newState.auction = null;
      newState.phase = "rolling";
      const prevIdx = auction.currentBidder >= 0 ? auction.currentBidder : newState.currentPlayerIndex;
      newState.currentPlayerIndex = getNextPlayer(newState, prevIdx);
      return handleRoundEnd(newState, prevIdx);
    }
  } else {
    // 继续拍卖，activeBidderIndex 保持指向刚才 pass 位置（现在是下一个玩家）
    // 但如果 pass 的是最后一个元素，需要回到 0
    if (auction.activeBidderIndex >= auction.activeBidders.length) {
      auction.activeBidderIndex = 0;
    }
    const nextBidder = getAuctionActiveBidder(auction);
    newState.logs.push(
      makeLog("auction", `轮到 ${newState.players[nextBidder].name} 出价`),
    );
  }

  return newState;
}

// ========== AI 拍卖决策 ==========

export function aiAuctionDecision(
  state: GameState,
): { action: "bid" | "pass"; bidAmount?: number } {
  const auction = state.auction;
  if (!auction || !auction.active) return { action: "pass" };

  const aiIndex = getAuctionActiveBidder(auction);
  const aiPlayer = state.players[aiIndex];
  const landPrice = getCellPrice(auction.cellId, state.mode);
  const diff = AI_DIFFICULTY_CONFIG[getAiDifficulty(state)];
  const personality = AI_PERSONALITY_CONFIG[getAiPersonality(state)];

  // AI 出价上限受難度和個性影響：投機派出價更激進
  const baseMaxRatio = 0.9 * diff.buyProbabilityMultiplier * personality.auctionBias;
  const maxBid = Math.round(landPrice * Math.min(1.8, Math.max(0.5, baseMaxRatio)));

  // 如果当前价格已达上限，放弃
  if (auction.currentBid >= maxBid) {
    return { action: "pass" };
  }

  // 计算剩余空间
  const remaining = maxBid - auction.currentBid;
  // 越接近上限，出价概率越低
  const ratio = auction.currentBid / maxBid;
  let bidProbability = 1 - ratio * 0.8;

  // 投機派更願意出價
  bidProbability = Math.min(0.98, bidProbability * personality.auctionBias);

  // 资金检查
  const minNextBid = auction.currentBid + auction.minIncrement;
  if (aiPlayer.money < minNextBid) {
    return { action: "pass" };
  }

  if (Math.random() > bidProbability) {
    return { action: "pass" };
  }

  // 决定加价幅度：激進派加價更大
  let bidAmount: number;
  if (remaining > auction.minIncrement * 5) {
    const maxMultiplier = Math.max(1, Math.round(3 * personality.auctionBias));
    const multiplier = 1 + Math.floor(Math.random() * maxMultiplier);
    bidAmount = auction.minIncrement * multiplier;
  } else {
    bidAmount = auction.minIncrement;
  }

  // 确保不超过上限且资金足够
  const totalAfterBid = auction.currentBid + bidAmount;
  if (totalAfterBid > maxBid || totalAfterBid > aiPlayer.money) {
    bidAmount = Math.min(maxBid - auction.currentBid, aiPlayer.money - auction.currentBid);
    if (bidAmount < auction.minIncrement) {
      return { action: "pass" };
    }
  }

  return { action: "bid", bidAmount };
}

// ========== 暗拍系統 ==========

export function submitBlindBid(
  state: GameState,
  playerIndex: number,
  amount: number,
): GameState {
  const newState = cloneState(state);
  const auction = newState.auction;
  if (!auction || !auction.active || !auction.isBlind || auction.revealed) {
    return newState;
  }

  // 檢查玩家是否為活躍競拍者
  if (!auction.activeBidders.includes(playerIndex)) {
    return newState;
  }

  const player = newState.players[playerIndex];

  // 校驗資金
  if (amount > player.money) {
    newState.logs.push(
      makeLog("auction", `${player.name} 資金不足，無法出價 $${amount}`),
    );
    return newState;
  }

  // 校驗最低加價幅度（暗拍底價為 startingPrice）
  if (amount < auction.startingPrice) {
    newState.logs.push(
      makeLog("auction", `${player.name} 出價低於底價，無效`),
    );
    return newState;
  }

  if (!auction.blindBids) {
    auction.blindBids = {};
  }
  auction.blindBids[playerIndex] = amount;

  newState.logs.push(
    makeLog("auction", `${player.name} 已提交暗拍出價`),
  );

  // 檢查是否所有活躍競拍者都已出價
  const allBid = auction.activeBidders.every(
    (idx: number) => auction.blindBids?.[idx] !== null && auction.blindBids?.[idx] !== undefined,
  );

  if (allBid) {
    return revealBlindAuction(newState);
  }

  return newState;
}

function revealBlindAuction(state: GameState): GameState {
  const newState = cloneState(state);
  const auction = newState.auction;
  if (!auction || !auction.isBlind || !auction.blindBids) {
    return newState;
  }

  const cell = getCellConfig(newState, auction.cellId);

  // 找出最高出價者
  let highestBid = 0;
  let highestBidders: number[] = [];

  for (const idx of auction.activeBidders) {
    const bid = auction.blindBids[idx] ?? 0;
    if (bid > highestBid) {
      highestBid = bid;
      highestBidders = [idx];
    } else if (bid === highestBid && bid > 0) {
      highestBidders.push(idx);
    }
  }

  auction.revealed = true;

  if (highestBid === 0 || highestBidders.length === 0) {
    // 流拍：所有人都沒出價或出價為 0
    newState.logs.push(
      makeLog("auction", `【暗拍】流拍：${cell.name} 無人有效出價，保持無主`),
    );
    newState.auction = null;
    newState.phase = "rolling";
    newState.currentPlayerIndex = getNextPlayer(newState, auction.currentBidder);
    return handleRoundEnd(newState, auction.currentBidder);
  }

  // 平手時隨機決定
      const winner = highestBidders.length === 1
    ? highestBidders[0]
    : highestBidders[Math.floor(Math.random() * highestBidders.length)];

  const winnerPlayer = newState.players[winner];
  const price = getBuyPriceDiscount(highestBid, winnerPlayer.profession);

  if (winnerPlayer.money < price) {
    // 資金不足以支付成交價 → 流拍
    newState.logs.push(
      makeLog("auction", `【暗拍】流拍：${winnerPlayer.name} 資金不足，無法支付 ${price} 元`),
    );
    newState.auction = null;
    newState.phase = "rolling";
    newState.currentPlayerIndex = getNextPlayer(newState, winner);
    return handleRoundEnd(newState, winner);
  }

  winnerPlayer.money -= price;
  newState.ownedProperties[auction.cellId] = winner;
  newState.properties[auction.cellId] = {
    owner: winner,
    ownerTeam: newState.isCoopMode ? getPlayerTeam(newState, winner) : undefined,
    buildings: 0,
    isMortgaged: false,
    insured: false,
  };

  const discountText = winnerPlayer.profession === "tycoon" ? "【地產大亨】9折" : "";
  winnerPlayer.auctionWins++;

  // 聲望：暗拍拍得地產 +2
  changeReputation(newState, winner, REPUTATION_GAIN_AUCTION, "拍賣購得");

  if (highestBidders.length > 1) {
    newState.logs.push(
      makeLog(
        "auction",
      `【暗拍】揭曉！${winnerPlayer.name} 以 $${price}${discountText} 拍得 ${cell.name}（平手隨機決定）`,
        ),
      );
    } else {
      newState.logs.push(
        makeLog(
          "auction",
          `【暗拍】揭曉！${winnerPlayer.name} 以 $${price}${discountText} 拍得 ${cell.name}`,
        ),
      );
  }

  // 合作模式：同步隊伍金錢
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, winner);
  }

  updateCompleteSets(newState);
  updateBuildingCounts(newState);
  updatePlayerAssets(newState);

  newState.auction = null;
  newState.phase = "rolling";
  newState.currentPlayerIndex = getNextPlayer(newState, winner);
  return handleRoundEnd(newState, winner);
}

export function aiBlindBid(state: GameState, playerIndex: number): number {
  const auction = state.auction;
  if (!auction || !auction.isBlind) return 0;

  const aiPlayer = state.players[playerIndex];
  const landPrice = getCellPrice(auction.cellId, state.mode);

  // AI 暗拍出價：地價的 0.8x ~ 1.2x 之間隨機
  const ratio = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2
  let bid = Math.round(landPrice * ratio);

  // 對齊到最低加價幅度的整數倍
  bid = Math.floor(bid / auction.minIncrement) * auction.minIncrement;

  // 不低於底價
  bid = Math.max(bid, auction.startingPrice);

  // 不超過現金
  bid = Math.min(bid, aiPlayer.money);

  // 保留至少 1000 現金安全墊（如果可能）
  const safetyMargin = 1000;
  if (bid > aiPlayer.money - safetyMargin && aiPlayer.money > safetyMargin) {
    bid = aiPlayer.money - safetyMargin;
    bid = Math.floor(bid / auction.minIncrement) * auction.minIncrement;
    bid = Math.max(bid, auction.startingPrice);
  }

  return Math.max(0, bid);
}

/**
 * 暗拍模式：揭曉出價（導出別名）
 */
export function revealBlindBids(state: GameState): GameState {
  return revealBlindAuction(state);
}

// ========== 全局事件系统 ==========

export function shouldTriggerGlobalEvent(state: GameState): boolean {
  return (
    state.globalEventTurnCounter > 0 && state.globalEventTurnCounter % 5 === 0
  );
}

export function triggerRandomGlobalEvent(state: GameState): GameState {
  let newState = cloneState(state);
  const eventType = GLOBAL_EVENT_TYPES[
    Math.floor(Math.random() * GLOBAL_EVENT_TYPES.length)
  ];
  const event = GLOBAL_EVENTS[eventType];

  newState.currentGlobalEvent = eventType;
  // 先重置倍率，再根据事件设置
  newState.globalEventMultipliers = {};

  switch (eventType) {
    case "economic_crisis": {
      // 所有玩家现金-15%
      for (let i = 0; i < newState.players.length; i++) {
        const player = newState.players[i];
        player.money = Math.round(player.money * 0.85);
        if (player.money < 1000 && !player.hasBeenPoor) {
          player.hasBeenPoor = true;
        }
      }
      // 股票价格-20%
      for (const symbol of STOCK_SYMBOLS) {
        const currentPrice = newState.stocks[symbol];
        const newPrice = Math.max(
          STOCK_PRICE_MIN,
          Math.round(currentPrice * 0.8),
        );
        newState.stocks[symbol] = newPrice;
        // 同步到 stockStates
        if (newState.stockStates && newState.stockStates[symbol]) {
          newState.stockStates[symbol].previousPrice = currentPrice;
          newState.stockStates[symbol].price = newPrice;
        }
      }
      break;
    }

    case "tech_boom": {
      // 过路费本回合+50%
      newState.globalEventMultipliers.tollMultiplier = 1.5;
      // 股票价格+15%
      for (const symbol of STOCK_SYMBOLS) {
        const currentPrice = newState.stocks[symbol];
        const newPrice = Math.min(
          STOCK_PRICE_MAX,
          Math.round(currentPrice * 1.15),
        );
        newState.stocks[symbol] = newPrice;
        // 同步到 stockStates
        if (newState.stockStates && newState.stockStates[symbol]) {
          newState.stockStates[symbol].previousPrice = currentPrice;
          newState.stockStates[symbol].price = newPrice;
        }
      }
      break;
    }

    case "neon_festival": {
      // 所有玩家现金+1000
      for (let i = 0; i < newState.players.length; i++) {
        newState.players[i].money += 1000;
      }
      break;
    }

    case "hacker_attack": {
      // 随机一位存活玩家现金-2000
      const aliveIndices: number[] = newState.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => !newState.players[i].isBankrupt);
      if (aliveIndices.length > 0) {
        const target = aliveIndices[Math.floor(Math.random() * aliveIndices.length)];
        const player = newState.players[target];
        player.money = Math.max(0, player.money - 2000);
        if (player.money < 1000 && !player.hasBeenPoor) {
          player.hasBeenPoor = true;
        }
      }
      break;
    }

    case "real_estate_bubble": {
      // 地块价格临时+30%（持续到下次事件）
      newState.globalEventMultipliers.propertyPriceMultiplier = 1.3;
      break;
    }

    case "energy_shortage": {
      // 有建筑的玩家每栋房屋100元，酒店500元
      for (let i = 0; i < newState.players.length; i++) {
        const player = newState.players[i];
        if (player.isBankrupt) continue;
        const fee = player.totalHouses * 100 + player.totalHotels * 500;
        if (fee > 0) {
          player.money -= fee;
          if (player.money < 1000 && !player.hasBeenPoor) {
            player.hasBeenPoor = true;
          }
        }
      }
      break;
    }

    case "data_dividend": {
      // 持有股票总市值最高的存活玩家获得2000
      let bestIdx = -1;
      let bestValue = 0;
      for (let i = 0; i < newState.players.length; i++) {
        if (newState.players[i].isBankrupt) continue;
        const val = getPlayerStockValue(newState.players[i], newState);
        if (val > bestValue) {
          bestIdx = i;
          bestValue = val;
        }
      }
      if (bestIdx >= 0 && bestValue > 0) {
        newState.players[bestIdx].money += 2000;
      }
      break;
    }

    case "urban_reconstruction": {
      // 所有抵押的地产自动解除抵押（免费）
      for (const prop of Object.values(newState.properties)) {
        if (prop.isMortgaged) {
          prop.isMortgaged = false;
        }
      }
      break;
    }

    case "space_immigration": {
      // 所有玩家前进3格（不触发格子事件）
      for (let i = 0; i < newState.players.length; i++) {
        const player = newState.players[i];
        if (player.isBankrupt) continue;
        const oldPos = player.position;
        player.position = clampPosition(oldPos + 3);
        // 经过起点获得奖励
        if (player.position < oldPos || player.position === 0) {
          const reward = getStartBonus(newState.mode, player.profession, newState.customRules, newState.inflationRate);
          player.money += reward;
        }
      }
      break;
    }

    case "ai_rebellion": {
      // 随机选一个没有出狱卡的存活玩家，给一张出狱卡
      const candidates: number[] = [];
      for (let i = 0; i < newState.players.length; i++) {
        if (!newState.players[i].isBankrupt && !newState.players[i].hasGetOutOfJailCard) {
          candidates.push(i);
        }
      }
      if (candidates.length > 0) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        newState.players[target].hasGetOutOfJailCard = true;
      }
      break;
    }

    case "investment_hint": {
      // 隨機選一塊未被抵押的地產，標註投資預告（3回合後地價飆漲）
      const candidates: number[] = [];
      for (let i = 0; i < CELL_COUNT; i++) {
        const cell = getCellConfig(newState, i);
        if (cell.type !== "property") continue;
        const prop = newState.properties[i];
        if (prop && prop.isMortgaged) continue;
        if (newState.cellEffects?.[i]) continue;
        candidates.push(i);
      }
      if (candidates.length > 0) {
        const targetCellId = candidates[Math.floor(Math.random() * candidates.length)];
        const cellName = getCellConfig(newState, targetCellId).name;
        if (!newState.cellEffects) newState.cellEffects = {};
        newState.cellEffects[targetCellId] = {
          type: "investment_preview",
          duration: 3,
          expireTurn: newState.totalTurns + 3,
          value: 1.5,
        };
        newState.investmentPreview = { cellId: targetCellId, turnsUntilHike: 3 };
        newState.logs.push(
          makeLog("global_event", `【投資預告】${cellName} 即將迎來地價飆漲！`),
        );
      }
      break;
    }

    case "bank_crisis": {
      // 銀行倒閉！所有玩家貸款一筆勾銷，無需償還
      for (let i = 0; i < newState.players.length; i++) {
        const playerLoan = getPlayerLoan(newState, i);
        if (playerLoan > 0) {
          const player = newState.players[i];
          setPlayerLoan(newState, i, 0);
          newState.logs.push(
            makeLog("loan", `【銀行】 ${player.name} 的貸款 ${playerLoan} 元因銀行危機一筆勾銷！`),
          );
        }
      }
      // 合作模式：同步隊伍貸款
      if (newState.isCoopMode && newState.teams) {
        for (const teamId of Object.keys(newState.teams) as TeamId[]) {
          newState.teams[teamId].loan = 0;
        }
      }
      // 存款損失 50%
      for (let i = 0; i < newState.players.length; i++) {
        const playerSavings = getPlayerSavings(newState, i);
        if (playerSavings > 0) {
          const player = newState.players[i];
          const lost = Math.round(playerSavings * 0.5);
          setPlayerSavings(newState, i, playerSavings - lost);
          newState.logs.push(
            makeLog("bank", `【銀行】 ${player.name} 的存款 ${playerSavings} 元蒸發了 ${lost} 元！`),
          );
        }
      }
      // 合作模式：同步隊伍存款
      if (newState.isCoopMode && newState.teams) {
        for (const teamId of Object.keys(newState.teams) as TeamId[]) {
          const teamSavings = newState.teams[teamId].savings ?? 0;
          if (teamSavings > 0) {
            newState.teams[teamId].savings = Math.round(teamSavings * 0.5);
          }
        }
      }
      break;
    }
  }

  newState.logs.push(
    makeLog(
      "global_event",
      `【全球事件】${event.name}：${event.description}`,
    ),
  );

  // 事件后检查破产
  for (let i = 0; i < newState.players.length; i++) {
    if (newState.players[i].money <= getBankruptcyLine(newState) && newState.phase !== "ended") {
      applyBankruptcyCheck(newState, i);
    }
  }

  // 合作模式：同步所有队伍金钱
  if (newState.isCoopMode && newState.teams) {
    for (const teamId of Object.keys(newState.teams) as TeamId[]) {
      const team = newState.teams[teamId];
      // 找到该队第一个未破产玩家作为基准同步
      const refPlayerIdx = team.playerIndices.find(
        (idx: number) => !newState.players[idx].isBankrupt,
      );
      if (refPlayerIdx !== undefined) {
        syncCoopMoneyFromPlayer(newState, refPlayerIdx);
      }
    }
  }

  updatePlayerAssets(newState);
  return newState;
}

// ========== 災難系統 helper ==========

function triggerRandomDisaster(state: GameState): void {
  const disasterType = DISASTER_TYPES[Math.floor(Math.random() * DISASTER_TYPES.length)];
  switch (disasterType) {
    case 'earthquake':
      triggerEarthquake(state);
      break;
    case 'fire':
      triggerFire(state);
      break;
    case 'flood':
      triggerFlood(state);
      break;
  }
}

function getOwnedPropertyCellsWithBuildings(state: GameState): number[] {
  const result: number[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    const prop = state.properties[i];
    if (prop && prop.buildings > 0 && !prop.isMortgaged) {
      result.push(i);
    }
  }
  return result;
}

function triggerEarthquake(state: GameState): void {
  const candidates = getOwnedPropertyCellsWithBuildings(state);
  if (candidates.length === 0) {
    state.logs.push(makeLog("disaster", `[災難] 地震來襲！但無建築受損`));
    return;
  }
  // 隨機選 2 塊不同的地（若只有 1 塊則只拆 1 塊）
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const targetCells = shuffled.slice(0, Math.min(2, shuffled.length));
  const cellNames = targetCells.map((id: number) => getCellConfig(state, id).name);

  for (const cellId of targetCells) {
    const prop = state.properties[cellId];
    if (prop && prop.buildings > 0) {
      prop.buildings = (prop.buildings - 1) as BuildingLevel;
    }
  }
  updateBuildingCounts(state);
  updatePlayerAssets(state);

  state.logs.push(
    makeLog(
      "disaster",
      `[災難] 地震來襲！${cellNames.join(' 和 ')} 的建築受損！`,
    ),
  );
}

function triggerFire(state: GameState): void {
  const candidates = getOwnedPropertyCellsWithBuildings(state);
  if (candidates.length === 0) {
    state.logs.push(makeLog("disaster", `[災難] 火災！但無建築可燒`));
    return;
  }
  const targetCellId = candidates[Math.floor(Math.random() * candidates.length)];
  const prop = state.properties[targetCellId];
  const cellName = getCellConfig(state, targetCellId).name;
  if (prop) {
    prop.buildings = 0;
  }
  updateBuildingCounts(state);
  updatePlayerAssets(state);

  state.logs.push(
    makeLog(
      "disaster",
      `[災難] 火災！${cellName} 的建築全數燒毀！`,
    ),
  );
}

function triggerFlood(state: GameState): void {
  const sides: BoardSide[] = ['bottom', 'right', 'top', 'left'];
  const side = sides[Math.floor(Math.random() * sides.length)];
  const sideCells = BOARD_SIDES[side];
  // 只選該排上的地產格
  const affectedCells = sideCells.filter((id: number) => {
    const cell = getCellConfig(state, id);
    return cell.type === 'property';
  });
  const sideNames: Record<BoardSide, string> = {
    bottom: '南邊街道',
    right: '東邊街道',
    top: '北邊街道',
    left: '西邊街道',
  };

  state.disaster = {
    type: 'flood',
    affectedCells,
    duration: 3,
    active: true,
  };

  state.logs.push(
    makeLog(
      "disaster",
      `[災難] 洪水氾濫！${sideNames[side]} 被淹沒，3 回合內無法收費！`,
    ),
  );
}

// ========== 回合结束处理（股票更新 + 全局事件） ==========

function handleRoundEndInPlace(state: GameState, endedPlayerIndex: number): void {
  // 标记该玩家本回合已行动
  state.playersActedThisRound[endedPlayerIndex] = true;

  // 检查所有存活玩家是否都已行动过（一轮结束）
  const aliveIndices: number[] = state.players
    .map((_p: PlayerState, i: number) => i)
    .filter((i: number) => !state.players[i].isBankrupt);
  const allActed = aliveIndices.every((i: number) => state.playersActedThisRound[i]);
  if (!allActed) return;

  const stockEnabled = state.mode !== "custom" || state.customRules?.enableStockMarket !== false;
  const eventsEnabled = state.mode !== "custom" || state.customRules?.enableGlobalEvents !== false;

  // 1. 更新股票价格（原地修改，因为是在已克隆的 state 上）
  if (stockEnabled) {
    for (const symbol of STOCK_SYMBOLS) {
    const config = STOCKS[symbol];
    const currentPrice = state.stocks[symbol];
    // 確保 stockStates 存在且含 trend 字段
    if (!state.stockStates) {
      state.stockStates = {} as Record<StockSymbol, StockState>;
    }
    if (!state.stockStates[symbol]) {
      state.stockStates[symbol] = {
        symbol,
        price: currentPrice,
        previousPrice: currentPrice,
        controllingPlayer: null,
        shareholderMeetingUsed: false,
        shareholderMeetingCooldown: 0,
      };
    }
    const ss = state.stockStates[symbol] as StockState & { trend?: number };
    if (ss.trend === undefined) ss.trend = 0;

    // 價格變動 = 趨勢分量 + 隨機分量
    let randomRange: number;
    switch (config.volatility) {
      case "high":
        randomRange = 0.22; // ±11%
        break;
      case "medium":
        randomRange = 0.135; // ±6.75%
        break;
      case "low":
        randomRange = 0.07; // ±3.5%
        break;
    }
    const trendComponent = ss.trend * 0.06;
    const randomComponent = Math.random() * randomRange * 2 - randomRange;
    const changePercent = trendComponent + randomComponent;

    let newPrice = Math.round(currentPrice * (1 + changePercent));
    newPrice = Math.max(STOCK_PRICE_MIN, Math.min(STOCK_PRICE_MAX, newPrice));
    state.stocks[symbol] = newPrice;

    // 更新趨勢：指數平滑 + 隨機擾動，clamp 到 [-1, 1]
    ss.trend = ss.trend * 0.7 + (Math.random() * 0.6 - 0.3);
    ss.trend = Math.max(-1, Math.min(1, ss.trend));

    // 同步到 stockStates
    ss.previousPrice = currentPrice;
    ss.price = newPrice;
  }
  }

  // 1a. 股票控股冷卻遞減
  if (stockEnabled && state.stockStates) {
    for (const symbol of STOCK_SYMBOLS) {
      const ss = state.stockStates[symbol];
      if (ss && (ss.shareholderMeetingCooldown ?? 0) > 0) {
        ss.shareholderMeetingCooldown = (ss.shareholderMeetingCooldown ?? 0) - 1;
      }
    }
  }

  // 2. 递增回合数和全局事件回合计数器
  state.totalTurns++;
  state.globalEventTurnCounter++;

  // 2a. 每 5 回合：所有存活玩家獲得 1 技能點
  if (state.totalTurns > 0 && state.totalTurns % SKILL_POINT_INTERVAL === 0) {
    for (const p of state.players) {
      if (!p.isBankrupt) {
        p.skillPoints = (p.skillPoints ?? 0) + 1;
      }
    }
    state.logs.push(
      makeLog("system", `【技能】 每 ${SKILL_POINT_INTERVAL} 回合到來，所有玩家獲得 1 技能點！`),
    );
  }

  // 2b. 更新天气（每回合加权随机变化）
  const newWeather = pickRandomWeather();
  setWeather(state, newWeather);

  // 2b1. 太空宁静：所有玩家每回合+100元
  if (state.weatherMultipliers.spaceCalmBonus && state.weatherMultipliers.spaceCalmBonus > 0) {
    const bonus = state.weatherMultipliers.spaceCalmBonus;
    for (const p of state.players) {
      if (!p.isBankrupt) {
        p.money += bonus;
      }
    }
    state.logs.push(
      makeLog("weather", `【寧靜】 太空宁静：所有玩家恢复 ${bonus} 元`),
    );
    // 合作模式：同步队伍金钱
    if (state.isCoopMode && state.teams) {
      for (const teamId of Object.keys(state.teams) as TeamId[]) {
        syncCoopMoneyFromTeam(state, teamId);
      }
    }
  }

  // 2b2. 季節遞進
  if (state.season) {
    state.season.turn += 1;
    if (state.season.turn >= SEASON_CHANGE_INTERVAL) {
      const currentIdx = SEASON_TYPES.indexOf(state.season.type);
      const nextIdx = (currentIdx + 1) % SEASON_TYPES.length;
      const nextType = SEASON_TYPES[nextIdx];
      const nextConfig = SEASONS[nextType];
      state.season.type = nextType;
      state.season.turn = 0;
      state.logs.push(
        makeLog(
          "season",
          `季節變換：進入 ${nextConfig.name}！${nextConfig.description}`,
        ),
      );
    }
  }

  // 2b3. 洪水災難持續與結算
  if (state.disaster?.active && state.disaster.type === 'flood') {
    state.disaster.duration -= 1;
    if (state.disaster.duration <= 0) {
      const cellNames = state.disaster.affectedCells
        .map((id: number) => getCellConfig(state, id).name)
        .join('、');
      state.disaster.active = false;
      state.disaster.affectedCells = [];
      state.logs.push(
        makeLog("disaster", `洪水退去，${cellNames} 恢復正常`),
      );
    }
  }

  // 2b4. 每 10 回合災難判定
  if (state.totalTurns > 0 && state.totalTurns % DISASTER_INTERVAL === 0) {
    if (Math.random() < DISASTER_PROBABILITY) {
      triggerRandomDisaster(state);
    }
  }

  // 2b5. 股票分紅：每 5 回合發放股息（股價 × 2% × 持股數）
  if (stockEnabled && state.totalTurns > 0 && state.totalTurns % 5 === 0) {
    for (let i = 0; i < state.players.length; i++) {
      const player = state.players[i];
      if (player.isBankrupt) continue;
      let totalDividend = 0;
      if (state.isCoopMode && state.teams && player.teamId) {
        const team = state.teams[player.teamId];
        for (const s of team.stocks) {
          const price = state.stocks[s.symbol] ?? 0;
          totalDividend += Math.round(price * 0.02 * s.quantity);
        }
      } else {
        for (const s of player.stocks) {
          const price = state.stocks[s.symbol] ?? 0;
          totalDividend += Math.round(price * 0.02 * s.quantity);
        }
      }
      if (totalDividend > 0) {
        addCoopMoney(state, i, totalDividend);
        state.logs.push(
          makeLog(
            'stock',
            `【分紅】 第${state.totalTurns}回合股息發放：玩家${player.name} 獲得 $${totalDividend}`,
          ),
        );
      }
    }
  }

  // 2c. 贷款利息结算：每个有贷款的玩家支付5%利息
  for (let i = 0; i < state.players.length; i++) {
    if (state.players[i].isBankrupt) continue;
    const pLoan = state.players[i].loan ?? 0;
    if (pLoan > 0) {
      const interest = Math.round(pLoan * LOAN_INTEREST_RATE);
      const player = state.players[i];
      const currentMoney = getCoopMoney(state, i);
      const actualInterest = Math.min(interest, currentMoney);
      if (actualInterest > 0) {
        subCoopMoney(state, i, actualInterest);
      }
      // 现金不足部分：利息滚入贷款余额（利滚利），但上限為 LOAN_MAX × 2
      const shortfall = interest - actualInterest;
      if (shortfall > 0) {
        let newLoan = pLoan + shortfall;
        const loanCap = LOAN_MAX * 2;
        if (newLoan > loanCap) {
          const overflow = newLoan - loanCap;
          newLoan = loanCap;
          state.logs.push(
            makeLog(
              "loan",
              `【上限】 ${player.name} 貸款餘額已達上限 $${loanCap}，超出的 $${overflow} 予以豁免`,
            ),
          );
        }
        setPlayerLoan(state, i, newLoan);
        state.logs.push(
          makeLog(
            "loan",
            `【注意】 ${player.name} 現金不足，利息 ${shortfall} 元滾入貸款餘額`,
          ),
        );
      }
      state.logs.push(
        makeLog(
          "loan",
          `【利息】 ${player.name} 支付貸款利息 $${actualInterest}`,
        ),
      );
      // 利息导致破产检查
      if (getCoopMoney(state, i) <= getBankruptcyLine(state)) {
        applyBankruptcyCheck(state, i);
        if ((state.phase as GamePhase) === "ended") return;
      }
    }
  }

  // 2c1. 存款利息結算：有存款的玩家每回合獲得 2% 利息
  for (let i = 0; i < state.players.length; i++) {
    if (state.players[i].isBankrupt) continue;
    const savings = getPlayerSavings(state, i);
    if (savings > 0) {
      const interest = Math.round(savings * SAVINGS_INTEREST_RATE);
      if (interest > 0) {
        setPlayerSavings(state, i, savings + interest);
        const player = state.players[i];
        state.logs.push(
          makeLog(
            'bank',
            `【存款利息】 玩家${player.name} 獲得存款利息 $${interest}`,
          ),
        );
      }
    }
  }

  // 2d. 每3回合刷新道具商店
  if (state.totalTurns > 0 && state.totalTurns % 3 === 0) {
    refreshShop(state);
  }

  // 2e. 通货膨胀：每10回合上涨10%，上限 INFLATION_MAX
  if (state.totalTurns > 0 && state.totalTurns % INFLATION_INTERVAL === 0) {
    const oldRate = state.inflationRate ?? INFLATION_INITIAL_RATE;
    let newRate = Math.round((oldRate * (1 + INFLATION_STEP)) * 100) / 100;
    if (newRate > INFLATION_MAX) {
      newRate = INFLATION_MAX;
      state.logs.push(
        makeLog(
          'system',
          `【通脹】 通貨膨脹已達上限 ${Math.round(INFLATION_MAX * 100)}%`,
        ),
      );
    }
    state.inflationRate = newRate;
    state.logs.push(
      makeLog(
        "system",
        `【通膨】 通貨膨脹來襲！地價與過路費上漲${Math.round(INFLATION_STEP * 100)}%，當前倍率 x${newRate.toFixed(2)}`,
      ),
    );
  }

  // 2f. 動態棋盤：遞減並清理過期效果
  if (state.cellEffects && Object.keys(state.cellEffects).length > 0) {
    const expired: number[] = [];
    for (const cellIdStr of Object.keys(state.cellEffects)) {
      const cellId = Number(cellIdStr);
      const effect = state.cellEffects[cellId];
      if (effect) {
        effect.duration -= 1;
        if (effect.duration <= 0) {
          expired.push(cellId);
        }
      }
    }
    for (const cellId of expired) {
      const cellName = getCellConfig(state, cellId).name;
      const effect = state.cellEffects[cellId];
      if (effect?.type === "investment_preview") {
        // 投資預告到期 → 轉為地價飆漲效果（持續3回合，地價×1.5）
        const hikeValue = effect.value ?? 1.5;
        state.cellEffects[cellId] = {
          type: "price_up",
          duration: 3,
          expireTurn: state.totalTurns + 3,
          value: hikeValue,
        };
        state.logs.push(
          makeLog(
            "dynamic_board",
            `【地價】 ${cellName} 地價飆漲！投資預告應驗！`,
          ),
        );
        // 清除投資預告狀態
        if (state.investmentPreview?.cellId === cellId) {
          state.investmentPreview = undefined;
        }
      } else {
        delete state.cellEffects[cellId];
        if (effect) {
          state.logs.push(
            makeLog(
              "dynamic_board",
              `【霧霾】 ${cellName} 的${DYNAMIC_EFFECT_NAMES[effect.type]}效果已消失`,
            ),
          );
        }
      }
    }
  }

  // 2g. 動態棋盤：每 5 回合隨機一個地產格獲得隨機效果
  if (
    state.totalTurns > 0 &&
    state.totalTurns % DYNAMIC_BOARD_INTERVAL === 0
  ) {
    const propertyCells: number[] = [];
    for (let i = 0; i < CELL_COUNT; i++) {
      const cell = getCellConfig(state, i);
      if (cell.type === "property" && !state.cellEffects?.[i]) {
        propertyCells.push(i);
      }
    }
    if (propertyCells.length > 0) {
      const targetCellId = propertyCells[Math.floor(Math.random() * propertyCells.length)];
      const effectType = DYNAMIC_EFFECT_TYPES[Math.floor(Math.random() * DYNAMIC_EFFECT_TYPES.length)];
      const cellName = getCellConfig(state, targetCellId).name;
      if (!state.cellEffects) state.cellEffects = {};
      state.cellEffects[targetCellId] = {
        type: effectType,
        duration: DYNAMIC_BOARD_DURATION,
        expireTurn: state.totalTurns + DYNAMIC_BOARD_DURATION,
      };
      state.logs.push(
        makeLog(
          "dynamic_board",
          `【閃電】 【動態棋盤】${cellName} 出現了 ${DYNAMIC_EFFECT_NAMES[effectType]} 效果，持續 ${DYNAMIC_BOARD_DURATION} 回合`,
        ),
      );
    }
  }

  // 2h. NPC 系統：每 NPC_MOVE_INTERVAL 回合 NPC 隨機移動到新的地產格
  if (state.totalTurns > 0 && state.totalTurns % NPC_MOVE_INTERVAL === 0 && state.npcs && state.npcs.length > 0) {
    const propertyCells: number[] = [];
    for (let i = 0; i < CELL_COUNT; i++) {
      const cell = getCellConfig(state, i);
      if (cell.type === 'property') {
        propertyCells.push(i);
      }
    }
    for (const npc of state.npcs) {
      // 選擇一個不同於當前位置的新格子
      let newCellId: number = npc.cellId;
      let attempts = 0;
      while (newCellId === npc.cellId && attempts < 10) {
        newCellId = propertyCells[Math.floor(Math.random() * propertyCells.length)];
        attempts++;
      }
      npc.cellId = newCellId;
      const cellName = getCellConfig(state, newCellId).name;
      state.logs.push(
        makeLog(
          "npc",
          `[NPC] ${npc.name} 移動到了 ${cellName}`,
        ),
      );
    }
  }

  // 3. 科技爆发只持续一回合
  if (state.currentGlobalEvent === "tech_boom") {
    state.globalEventMultipliers.tollMultiplier = undefined;
  }

  // 4. 检查并触发全局事件
  if (
    eventsEnabled &&
    state.globalEventTurnCounter > 0 &&
    state.globalEventTurnCounter % 5 === 0
  ) {
    const eventType = GLOBAL_EVENT_TYPES[
      Math.floor(Math.random() * GLOBAL_EVENT_TYPES.length)
    ];
    const event = GLOBAL_EVENTS[eventType];
    state.currentGlobalEvent = eventType;
    state.globalEventMultipliers = {};

    applyGlobalEventInPlace(state, eventType);

    state.logs.push(
      makeLog(
        "global_event",
        `【全球事件】${event.name}：${event.description}`,
      ),
    );

    // 事件后检查破产
    for (let i = 0; i < state.players.length; i++) {
      if (state.players[i].money <= getBankruptcyLine(state) && state.phase !== ("ended" as GamePhase)) {
        applyBankruptcyCheck(state, i);
        if ((state.phase as GamePhase) === "ended") break;
      }
    }

    // 合作模式：同步所有队伍金钱
    if (state.isCoopMode && state.teams) {
      for (const tid of Object.keys(state.teams) as TeamId[]) {
        syncCoopMoneyFromTeam(state, tid);
      }
    }
  }

  // 5. 大逃杀模式：缩圈处理
  if (state.isBattleRoyale && !state.finalBattle) {
    state.shrinkTurnCountdown = (state.shrinkTurnCountdown ?? BATTLE_ROYALE_SHRINK_INTERVAL) - 1;
    if (state.shrinkTurnCountdown <= 0) {
      const side = pickRandomSideToDestroy(state);
      if (side) {
        destroySide(state, side);
      }
      state.shrinkTurnCountdown = BATTLE_ROYALE_SHRINK_INTERVAL;

      // 检查剩余格子数，进入最终决战
      const remainingCells = getUndestroyedCellCount(state);
      if (remainingCells <= BATTLE_ROYALE_FINAL_BATTLE_CELLS) {
        state.finalBattle = true;
        state.logs.push(
          makeLog(
            "zone_destroy",
            `【戰爭】 最终决战开始！仅剩 ${remainingCells} 个安全格，过路费翻倍，每回合毒气伤害 ${BATTLE_ROYALE_POISON_DAMAGE} 元`,
          ),
        );
        // 进入最终决战的玩家解锁成就
        for (let i = 0; i < state.players.length; i++) {
          if (!state.players[i].isBankrupt) {
            checkAndUnlockAchievements(state, i);
          }
        }
      }
    }
  }

  // 5b. 最终决战：毒气伤害
  if (state.isBattleRoyale && state.finalBattle && (state.phase as GamePhase) !== "ended") {
    applyBattleRoyalePoison(state);
  }

  // 5c. 更新存活人数
  if (state.isBattleRoyale) {
    updateAlivePlayersCount(state);
  }

  // 5d. 债券回合结算
  processBondsRoundEnd(state);
  if ((state.phase as GamePhase) === "ended") return;

  // 5e. 實驗室回合效果（每個擁有實驗室的玩家每回合觸發 1 次）
  processLabRoundEnd(state);
  if ((state.phase as GamePhase) === "ended") return;

  // 5f. 挑戰模式：閃電對決 - 15回合定勝負，資產最多者獲勝
  if (state.challengeType === "speed_15" && state.totalTurns >= 15) {
    updatePlayerAssets(state);
    const alivePlayers = state.players
      .map((p: PlayerState, idx: number) => ({ idx, assets: p.totalAssets }))
      .filter((item) => !state.players[item.idx].isBankrupt);
    if (alivePlayers.length > 0) {
      alivePlayers.sort((a, b) => b.assets - a.assets);
      const winnerIdx = alivePlayers[0].idx;
      state.winner = winnerIdx;
      state.phase = "ended";
      state.logs.push(
        makeLog(
          "system",
          `【閃電】 【閃電對決】15回合結束！${state.players[winnerIdx].name} 以 ${alivePlayers[0].assets} 元資產獲勝`,
        ),
      );
      return;
    }
  }

  // 6. 重置本回合行动标记
  state.playersActedThisRound = new Array(state.players.length).fill(false);

  updatePlayerAssets(state);
}

function applyGlobalEventInPlace(
  state: GameState,
  eventType: GlobalEventType,
): void {
  switch (eventType) {
    case "economic_crisis": {
      for (let i = 0; i < state.players.length; i++) {
        const player = state.players[i];
        if (player.isBankrupt) continue;
        player.money = Math.round(player.money * 0.85);
        if (player.money < 1000 && !player.hasBeenPoor) {
          player.hasBeenPoor = true;
        }
      }
      for (const symbol of STOCK_SYMBOLS) {
        const newPrice = Math.max(
          STOCK_PRICE_MIN,
          Math.round(state.stocks[symbol] * 0.8),
        );
        state.stocks[symbol] = newPrice;
      }
      break;
    }

    case "tech_boom": {
      state.globalEventMultipliers.tollMultiplier = 1.5;
      for (const symbol of STOCK_SYMBOLS) {
        const newPrice = Math.min(
          STOCK_PRICE_MAX,
          Math.round(state.stocks[symbol] * 1.15),
        );
        state.stocks[symbol] = newPrice;
      }
      break;
    }

    case "neon_festival": {
      for (let i = 0; i < state.players.length; i++) {
        if (state.players[i].isBankrupt) continue;
        state.players[i].money += 1000;
      }
      break;
    }

    case "hacker_attack": {
      const aliveIdx: number[] = state.players
        .map((_p: PlayerState, i: number) => i)
        .filter((i: number) => !state.players[i].isBankrupt);
      if (aliveIdx.length > 0) {
        const target = aliveIdx[Math.floor(Math.random() * aliveIdx.length)];
        const player = state.players[target];
        player.money = Math.max(0, player.money - 2000);
        if (player.money < 1000 && !player.hasBeenPoor) {
          player.hasBeenPoor = true;
        }
      }
      break;
    }

    case "real_estate_bubble": {
      state.globalEventMultipliers.propertyPriceMultiplier = 1.3;
      break;
    }

    case "energy_shortage": {
      for (let i = 0; i < state.players.length; i++) {
        const player = state.players[i];
        if (player.isBankrupt) continue;
        const fee = player.totalHouses * 100 + player.totalHotels * 500;
        if (fee > 0) {
          player.money -= fee;
          if (player.money < 1000 && !player.hasBeenPoor) {
            player.hasBeenPoor = true;
          }
        }
      }
      break;
    }

    case "data_dividend": {
      let bestIdx = -1;
      let bestValue = 0;
      for (let i = 0; i < state.players.length; i++) {
        if (state.players[i].isBankrupt) continue;
        const val = getPlayerStockValue(state.players[i], state);
        if (val > bestValue) {
          bestIdx = i;
          bestValue = val;
        }
      }
      if (bestIdx >= 0 && bestValue > 0) {
        state.players[bestIdx].money += 2000;
      }
      break;
    }

    case "urban_reconstruction": {
      for (const prop of Object.values(state.properties)) {
        if (prop.isMortgaged) {
          prop.isMortgaged = false;
        }
      }
      break;
    }

    case "space_immigration": {
      for (let i = 0; i < state.players.length; i++) {
        const player = state.players[i];
        if (player.isBankrupt) continue;
        const oldPos = player.position;
        player.position = clampPosition(oldPos + 3);
        if (player.position < oldPos || player.position === 0) {
          const reward = getStartBonus(state.mode, player.profession, state.customRules, state.inflationRate);
          player.money += reward;
        }
      }
      break;
    }

    case "ai_rebellion": {
      const candidates: number[] = [];
      for (let i = 0; i < state.players.length; i++) {
        if (!state.players[i].isBankrupt && !state.players[i].hasGetOutOfJailCard) {
          candidates.push(i);
        }
      }
      if (candidates.length > 0) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        state.players[target].hasGetOutOfJailCard = true;
      }
      break;
    }
  }
}

function handleRoundEnd(
  state: GameState,
  endedPlayerIndex: number,
): GameState {
  const newState = cloneState(state);
  handleRoundEndInPlace(newState, endedPlayerIndex);
  return newState;
}

export function processEndOfTurn(state: GameState): GameState {
  let newState = cloneState(state);
  const prevPlayer = newState.currentPlayerIndex;
  const nextPlayer = getNextPlayer(newState, prevPlayer);

  // 检查是否一轮结束（下一个玩家回到 roundStartPlayer 或所有存活玩家都已行动）
  const aliveCount = newState.players.filter((p: PlayerState) => !p.isBankrupt).length;
  // 競速模式：破產玩家仍在行動，按全部玩家計算回合
  const roundPlayerCount = newState.raceMode ? newState.players.length : aliveCount;
  const actedAlive = newState.players.filter((p: PlayerState, i: number) =>
    (newState.raceMode || !p.isBankrupt) && newState.playersActedThisRound[i]
  ).length;

  if (actedAlive >= roundPlayerCount - 1) {
    // 一轮结束
    // 1. 更新股票价格
    const stockEnabled = newState.mode !== "custom" || newState.customRules?.enableStockMarket !== false;
    if (stockEnabled) {
      newState = updateStockPrices(newState);
    }
     // 2. 递增回合数和全局事件回合计数器
     newState.totalTurns++;
     newState.globalEventTurnCounter++;

     // 2a. 每 5 回合：所有存活玩家獲得 1 技能點
     if (newState.totalTurns > 0 && newState.totalTurns % SKILL_POINT_INTERVAL === 0) {
       for (const p of newState.players) {
         if (!p.isBankrupt) {
           p.skillPoints = (p.skillPoints ?? 0) + 1;
         }
       }
       newState.logs.push(
         makeLog("system", `【技能】 每 ${SKILL_POINT_INTERVAL} 回合到來，所有玩家獲得 1 技能點！`),
       );
     }

     // 3. 更新天气（加权随机）
    const newWeather = pickRandomWeather();
    setWeather(newState, newWeather);

    // 3b. 太空宁静：所有玩家每回合+100元
    if (newState.weatherMultipliers.spaceCalmBonus && newState.weatherMultipliers.spaceCalmBonus > 0) {
      const bonus = newState.weatherMultipliers.spaceCalmBonus;
      for (const p of newState.players) {
        if (!p.isBankrupt) {
          p.money += bonus;
        }
      }
      newState.logs.push(
        makeLog("weather", `【寧靜】 太空宁静：所有玩家恢复 ${bonus} 元`),
      );
    }

    // 3c. 季節遞進
    if (newState.season) {
      newState.season.turn += 1;
      if (newState.season.turn >= SEASON_CHANGE_INTERVAL) {
        const currentIdx = SEASON_TYPES.indexOf(newState.season.type);
        const nextIdx = (currentIdx + 1) % SEASON_TYPES.length;
        const nextType = SEASON_TYPES[nextIdx];
        const nextConfig = SEASONS[nextType];
        newState.season.type = nextType;
        newState.season.turn = 0;
        newState.logs.push(
          makeLog(
            "season",
            `季節變換：進入 ${nextConfig.name}！${nextConfig.description}`,
          ),
        );
      }
    }

    // 3d. 洪水災難持續與結算
    if (newState.disaster?.active && newState.disaster.type === 'flood') {
      newState.disaster.duration -= 1;
      if (newState.disaster.duration <= 0) {
        const cellNames = newState.disaster.affectedCells
          .map((id: number) => getCellConfig(newState, id).name)
          .join('、');
        newState.disaster.active = false;
        newState.disaster.affectedCells = [];
        newState.logs.push(
          makeLog("disaster", `洪水退去，${cellNames} 恢復正常`),
        );
      }
    }

    // 3e. 每 10 回合災難判定
    if (newState.totalTurns > 0 && newState.totalTurns % DISASTER_INTERVAL === 0) {
      if (Math.random() < DISASTER_PROBABILITY) {
        triggerRandomDisaster(newState);
      }
    }

    // 3f. 每 10 回合黑市拍賣
    if (
      newState.totalTurns > 0 &&
      newState.totalTurns % BLACK_MARKET_INTERVAL === 0 &&
      newState.mode !== 'coop2v2' &&
      newState.mode !== 'team_deathmatch'
    ) {
      triggerBlackMarketAuction(newState);
    }

    // 4. 每3回合刷新道具商店
    if (newState.totalTurns > 0 && newState.totalTurns % 3 === 0) {
      refreshShop(newState);
    }

    // 4b. 贷款利息结算
    for (let i = 0; i < newState.players.length; i++) {
      if (newState.players[i].isBankrupt) continue;
      const pLoan = newState.players[i].loan ?? 0;
      if (pLoan > 0) {
        const interest = Math.round(pLoan * LOAN_INTEREST_RATE);
        const player = newState.players[i];
        const currentMoney = getCoopMoney(newState, i);
        const actualInterest = Math.min(interest, currentMoney);
        if (actualInterest > 0) {
          subCoopMoney(newState, i, actualInterest);
        }
        const shortfall = interest - actualInterest;
        if (shortfall > 0) {
          const newLoan = pLoan + shortfall;
          setPlayerLoan(newState, i, newLoan);
          newState.logs.push(
            makeLog(
              "loan",
              `【注意】 ${player.name} 現金不足，利息 ${shortfall} 元滾入貸款餘額`,
            ),
          );
        }
        newState.logs.push(
          makeLog(
            "loan",
            `【利息】 ${player.name} 支付貸款利息 $${actualInterest}`,
          ),
        );
        if (getCoopMoney(newState, i) <= getBankruptcyLine(newState)) {
          applyBankruptcyCheck(newState, i);
          if (newState.phase === "ended") return newState;
        }
      }
    }

    // 4c. 通货膨胀：每10回合上涨10%
    if (newState.totalTurns > 0 && newState.totalTurns % INFLATION_INTERVAL === 0) {
      const oldRate = newState.inflationRate ?? INFLATION_INITIAL_RATE;
      const newRate = Math.round((oldRate * (1 + INFLATION_STEP)) * 100) / 100;
      newState.inflationRate = newRate;
      newState.logs.push(
        makeLog(
          "system",
          `【通膨】 通貨膨脹來襲！地價與過路費上漲${Math.round(INFLATION_STEP * 100)}%，當前倍率 x${newRate.toFixed(2)}`,
        ),
      );
    }

    // 4d. 動態棋盤：遞減並清理過期效果
    if (newState.cellEffects && Object.keys(newState.cellEffects).length > 0) {
      const expired: number[] = [];
      for (const cellIdStr of Object.keys(newState.cellEffects)) {
        const cellId = Number(cellIdStr);
        const effect = newState.cellEffects[cellId];
        if (effect) {
          effect.duration -= 1;
          if (effect.duration <= 0) {
            expired.push(cellId);
          }
        }
      }
      for (const cellId of expired) {
        const cellName = getCellConfig(newState, cellId).name;
        const effect = newState.cellEffects[cellId];
        delete newState.cellEffects[cellId];
        if (effect) {
          newState.logs.push(
            makeLog(
              "dynamic_board",
              `【霧霾】 ${cellName} 的${DYNAMIC_EFFECT_NAMES[effect.type]}效果已消失`,
            ),
          );
        }
      }
    }

    // 4e. 動態棋盤：每 5 回合隨機一個地產格獲得隨機效果
    if (
      newState.totalTurns > 0 &&
      newState.totalTurns % DYNAMIC_BOARD_INTERVAL === 0
    ) {
      const propertyCells: number[] = [];
      for (let i = 0; i < CELL_COUNT; i++) {
        const cell = getCellConfig(newState, i);
        if (cell.type === "property" && !newState.cellEffects?.[i]) {
          propertyCells.push(i);
        }
      }
      if (propertyCells.length > 0) {
        const targetCellId = propertyCells[Math.floor(Math.random() * propertyCells.length)];
        const effectType = DYNAMIC_EFFECT_TYPES[Math.floor(Math.random() * DYNAMIC_EFFECT_TYPES.length)];
        const cellName = getCellConfig(newState, targetCellId).name;
        if (!newState.cellEffects) newState.cellEffects = {};
        newState.cellEffects[targetCellId] = {
          type: effectType,
          duration: DYNAMIC_BOARD_DURATION,
          expireTurn: newState.totalTurns + DYNAMIC_BOARD_DURATION,
        };
        newState.logs.push(
          makeLog(
            "dynamic_board",
            `【閃電】 【動態棋盤】${cellName} 出現了 ${DYNAMIC_EFFECT_NAMES[effectType]} 效果，持續 ${DYNAMIC_BOARD_DURATION} 回合`,
          ),
        );
      }
    }

    // 4f. NPC 系統：每 3 回合 NPC 隨機移動到新的地產格
    if (newState.totalTurns > 0 && newState.totalTurns % 3 === 0 && newState.npcs && newState.npcs.length > 0) {
      const propertyCells: number[] = [];
      for (let i = 0; i < CELL_COUNT; i++) {
        const cell = getCellConfig(newState, i);
        if (cell.type === 'property') {
          propertyCells.push(i);
        }
      }
      for (const npc of newState.npcs) {
        let newCellId: number = npc.cellId;
        let attempts = 0;
        while (newCellId === npc.cellId && attempts < 10) {
          newCellId = propertyCells[Math.floor(Math.random() * propertyCells.length)];
          attempts++;
        }
        npc.cellId = newCellId;
        const cellName = getCellConfig(newState, newCellId).name;
        newState.logs.push(
          makeLog(
            "npc",
            `[NPC] ${npc.name} 移動到了 ${cellName}`,
          ),
        );
      }
    }

    // 5. 检查并触发全局事件
    if (shouldTriggerGlobalEvent(newState)) {
      const eventsEnabled = newState.mode !== "custom" || newState.customRules?.enableGlobalEvents !== false;
      if (eventsEnabled) {
        newState = triggerRandomGlobalEvent(newState);
      }
    }
    // 6. 大逃杀模式：缩圈处理
    if (newState.isBattleRoyale && !newState.finalBattle) {
      newState.shrinkTurnCountdown = (newState.shrinkTurnCountdown ?? BATTLE_ROYALE_SHRINK_INTERVAL) - 1;
      if (newState.shrinkTurnCountdown <= 0) {
        const side = pickRandomSideToDestroy(newState);
        if (side) {
          destroySide(newState, side);
        }
        newState.shrinkTurnCountdown = BATTLE_ROYALE_SHRINK_INTERVAL;

        const remainingCells = getUndestroyedCellCount(newState);
        if (remainingCells <= BATTLE_ROYALE_FINAL_BATTLE_CELLS) {
          newState.finalBattle = true;
          newState.logs.push(
            makeLog(
              "zone_destroy",
              `【戰爭】 最终决战开始！仅剩 ${remainingCells} 个安全格，过路费翻倍，每回合毒气伤害 ${BATTLE_ROYALE_POISON_DAMAGE} 元`,
            ),
          );
          for (let i = 0; i < newState.players.length; i++) {
            if (!newState.players[i].isBankrupt) {
              checkAndUnlockAchievements(newState, i);
            }
          }
        }
      }
    }

    // 6b. 最终决战：毒气伤害
    if (newState.isBattleRoyale && newState.finalBattle && newState.phase !== "ended") {
      applyBattleRoyalePoison(newState);
    }

    // 6c. 更新存活人数
    if (newState.isBattleRoyale) {
      updateAlivePlayersCount(newState);
    }

    // 6d. 债券回合结算
    processBondsRoundEnd(newState);

    // 6e. 地產期貨：到期強制購買，失敗則沒收定金
    if (newState.customRules?.enablePropertyFutures !== false && newState.propertyFutures) {
      const expiredCells: number[] = [];
      for (const cellIdStr of Object.keys(newState.propertyFutures)) {
        const cellId = Number(cellIdStr);
        const future = newState.propertyFutures[cellId];
        if (future && newState.totalTurns >= future.expiresTurn) {
          expiredCells.push(cellId);
        }
      }
      for (const cellId of expiredCells) {
        const future = newState.propertyFutures[cellId]!;
        const price = getCellPrice(cellId, newState.mode, newState.customRules, newState.boardCells);
        const remaining = price - future.deposit;
        const player = newState.players[future.playerIndex];
        if (player && !player.isBankrupt && getCoopMoney(newState, future.playerIndex) >= remaining) {
          subCoopMoney(newState, future.playerIndex, remaining);
          newState.properties[cellId] = {
            owner: future.playerIndex,
            buildings: 0,
            isMortgaged: false,
          };
          newState.logs.push(makeLog(
            getPlayerLogType(future.playerIndex),
            `【期貨】 ${player.name} 預定地產 ${getCellConfig(newState, cellId).name} 到期，補齊 ${remaining} 元完成購買`,
          ));
        } else if (player) {
          newState.logs.push(makeLog(
            getPlayerLogType(future.playerIndex),
            `【沒收】 ${player.name} 預定地產 ${getCellConfig(newState, cellId).name} 到期，資金不足，定金 ${future.deposit} 元沒收`,
          ));
        }
        delete newState.propertyFutures[cellId];
      }
    }

    // 6f. 期權到期結算
    if (newState.customRules?.enableOptionsTrading !== false && newState.optionContracts) {
      const expired: OptionContract[] = [];
      newState.optionContracts = newState.optionContracts.filter((c: OptionContract) => {
        if (newState.totalTurns >= c.expiresTurn && !c.exercised) {
          expired.push(c);
          return false;
        }
        return true;
      });
      for (const contract of expired) {
        const buyer = newState.players[contract.buyerIndex];
        const seller = newState.players[contract.sellerIndex];
        if (!buyer || !seller || buyer.isBankrupt || seller.isBankrupt) continue;
        const cell = getCellConfig(newState, contract.cellIndex);
        const prop = newState.properties[contract.cellIndex];
        const currentPrice = getCellPrice(contract.cellIndex, newState.mode, newState.customRules, newState.boardCells);
        if (contract.type === 'call') {
          if (prop && prop.owner === contract.sellerIndex && currentPrice > contract.strikePrice) {
            const diff = currentPrice - contract.strikePrice;
            newState.logs.push(makeLog(
              'system',
              `【期權】 看漲期權到期：${buyer.name} 對 ${cell.name} 行使權利，${seller.name} 補償 ${diff} 元差價`,
            ));
            if (getCoopMoney(newState, contract.sellerIndex) >= diff) {
              subCoopMoney(newState, contract.sellerIndex, diff);
              addCoopMoney(newState, contract.buyerIndex, diff);
            } else {
              applyBankruptcyCheck(newState, contract.sellerIndex);
            }
          } else {
            newState.logs.push(makeLog(
              'system',
              `【期權】 看漲期權到期：${cell.name} 未達行權條件，${buyer.name} 放棄行使`,
            ));
          }
        } else {
          if (prop && prop.owner === contract.sellerIndex && currentPrice < contract.strikePrice) {
            const diff = contract.strikePrice - currentPrice;
            newState.logs.push(makeLog(
              'system',
              `【期權】 看跌期權到期：${buyer.name} 對 ${cell.name} 行使權利，${seller.name} 補償 ${diff} 元差價`,
            ));
            if (getCoopMoney(newState, contract.sellerIndex) >= diff) {
              subCoopMoney(newState, contract.sellerIndex, diff);
              addCoopMoney(newState, contract.buyerIndex, diff);
            } else {
              applyBankruptcyCheck(newState, contract.sellerIndex);
            }
          } else {
            newState.logs.push(makeLog(
              'system',
              `【期權】 看跌期權到期：${cell.name} 未達行權條件，${buyer.name} 放棄行使`,
            ));
          }
        }
      }
    }

    // 6g. 戰爭系統：回合遞減，歸零停戰
    if (newState.customRules?.enableWarSystem !== false && newState.wars && newState.wars.length > 0) {
      newState.wars = newState.wars.filter((w: WarState) => {
        const attacker = newState.players[w.attackerIndex];
        const defender = newState.players[w.defenderIndex];
        if (!attacker || !defender || attacker.isBankrupt || defender.isBankrupt) {
          newState.logs.push(makeLog('war', `【戰爭】 戰爭因一方破產自動結束`));
          return false;
        }
        w.remainingTurns -= 1;
        if (w.remainingTurns <= 0) {
          newState.logs.push(makeLog('war', `【停戰】 ${attacker.name} 與 ${defender.name} 的戰爭結束，雙方停戰`));
          return false;
        }
        return true;
      });
    }

    // 6h. 間諜系統：回合遞減
    if (newState.customRules?.enableSpySystem !== false && newState.spies && newState.spies.length > 0) {
      newState.spies = newState.spies.filter((s: SpyState) => {
        const spy = newState.players[s.spyIndex];
        const target = newState.players[s.targetIndex];
        if (!spy || !target || spy.isBankrupt || target.isBankrupt) return false;
        s.remainingTurns -= 1;
        if (s.remainingTurns <= 0) {
          newState.logs.push(makeLog('spy', `【間諜】 ${spy.name} 派往 ${target.name} 的間諜任務結束`));
          return false;
        }
        return true;
      });
    }

    // 6i. 機器人代打：回合遞減
    if (newState.customRules?.enableRobotProxy !== false && newState.robotProxy) {
      for (const idxStr of Object.keys(newState.robotProxy)) {
        const idx = Number(idxStr);
        const player = newState.players[idx];
        if (!player || player.isBankrupt) {
          delete newState.robotProxy[idx];
          continue;
        }
        newState.robotProxy[idx] -= 1;
        if (newState.robotProxy[idx] <= 0) {
          delete newState.robotProxy[idx];
          newState.logs.push(makeLog('robot', `【AI代打】 ${player.name} 的 AI 代打服務結束，控制權交還`));
        }
      }
    }

    // 6j. 平行世界：回合遞減與返回
    if (newState.customRules?.enableParallelWorld !== false && newState.parallelWorld?.active) {
      newState.parallelWorld.remainingTurns -= 1;
      if (newState.parallelWorld.remainingTurns <= 0) {
        const pw = newState.parallelWorld;
        const affectedPlayer = newState.players[pw.affectedPlayerIndex];
        if (affectedPlayer && !affectedPlayer.isBankrupt) {
          const acquiredCells: number[] = [];
          for (const cellIdStr of Object.keys(pw.parallelCells)) {
            const cellId = Number(cellIdStr);
            const pc = pw.parallelCells[cellId];
            if (pc.ownedByAffectedPlayer && !newState.properties[cellId]) {
              newState.properties[cellId] = {
                owner: pw.affectedPlayerIndex,
                buildings: 0,
                isMortgaged: false,
              };
              newState.ownedProperties[cellId] = pw.affectedPlayerIndex;
              acquiredCells.push(cellId);
            }
          }
          affectedPlayer.position = pw.originalPosition;
          newState.logs.push(makeLog(
            'parallel',
            `【平行世界】 ${affectedPlayer.name} 從平行世界返回${acquiredCells.length > 0 ? `，帶回 ${acquiredCells.length} 塊地` : ''}`,
          ));
          updateCompleteSets(newState);
          updatePlayerAssets(newState);
        }
        newState.parallelWorld = null;
      }
    }

    // 6k. 時間旅行：為下一位行動玩家儲存快照（回合開始時）
    if (newState.customRules?.enableTimeTravel !== false) {
      const nextPlayerIdx = nextPlayer;
      const nextPlayerState = newState.players[nextPlayerIdx];
      if (nextPlayerState && !nextPlayerState.isBankrupt && !nextPlayerState.timeTravelUsed) {
        if (!newState.timeTravelSnapshots) newState.timeTravelSnapshots = {};
        newState.timeTravelSnapshots[nextPlayerIdx] = {
          position: nextPlayerState.position,
          money: nextPlayerState.money,
          turn: newState.totalTurns + 1,
        };
      }
    }

    // 寵物系統：20% 概率給下一位玩家隨機獲得一隻寵物（僅在沒有裝備寵物時）
    if (state.customRules?.enablePetSystem !== false) {
      const np = newState.players[nextPlayer];
      if (np && !np.equippedPet && !np.isBankrupt) {
        if (Math.random() < 0.2) {
          tryObtainPet(newState, nextPlayer);
        }
      }
    }

    // 6l. 皇帝模式：回合結算
    if (newState.emperorMode) {
      const em = newState.emperorMode;
      const alivePlayers = newState.players.filter((p: PlayerState) => !p.isBankrupt);
      // 皇帝誕生：只剩 1 個未破產玩家且尚無皇帝
      if (em.emperorIndex === null && alivePlayers.length === 1) {
        const emperorIdx = newState.players.findIndex((p: PlayerState) => !p.isBankrupt);
        if (emperorIdx >= 0) {
          em.emperorIndex = emperorIdx;
          newState.logs.push(
            makeLog("system", `【皇帝】 皇帝誕生！${newState.players[emperorIdx].name} 登基稱帝！`),
          );
        }
      }
      // 皇帝已在位：納稅 + buff
      if (em.emperorIndex !== null) {
        const emperor = newState.players[em.emperorIndex];
        if (emperor && !emperor.isBankrupt) {
          // 其他存活玩家每回合繳納 5% 現金給皇帝
          let totalTax = 0;
          for (let i = 0; i < newState.players.length; i++) {
            if (i === em.emperorIndex) continue;
            const p = newState.players[i];
            if (p.isBankrupt) continue;
            const tax = Math.floor(p.money * 0.05);
            if (tax > 0) {
              p.money -= tax;
              totalTax += tax;
            }
          }
          if (totalTax > 0) {
            emperor.money += totalTax;
            newState.logs.push(
              makeLog("system", `【皇帝】 【皇帝】${emperor.name} 收取貢金 $${totalTax}`),
            );
          }
          // buff 回合遞減與刷新
          if (em.emperorBuffTurns > 0) {
            em.emperorBuffTurns -= 1;
            if (em.emperorBuffTurns <= 0) {
              newState.logs.push(
                makeLog("system", `【皇帝】 【皇帝】${emperor.name} 的強化效果已消散`),
              );
            }
          }
          // 每回合自動獲得一個隨機 buff（持續 1 回合）
          if (em.emperorBuffTurns <= 0) {
            const buffs = ["toll_boost", "buy_discount"];
            const newBuff = buffs[Math.floor(Math.random() * buffs.length)];
            em.emperorBuff = newBuff;
            em.emperorBuffTurns = 1;
            const buffName = newBuff === "toll_boost" ? "過路費 +50%" : "買地 9 折";
            newState.logs.push(
              makeLog("system", `【皇帝】 【皇帝】${emperor.name} 獲得強化：${buffName}`),
            );
          }
          // 合作模式同步金錢
          if (newState.isCoopMode) {
            syncCoopMoneyFromPlayer(newState, em.emperorIndex);
          }
        }
      }
    }

    // 7. 重置行动标记
    newState.playersActedThisRound = new Array(newState.players.length).fill(false);
    // 8. 更新 roundStartPlayer 为下一位存活玩家（从下一轮开始）
    newState.roundStartPlayer = nextPlayer;
  }

  return newState;
}

// ========== 道具系统 ==========

let nextItemId = 1;

export function buyItem(
  state: GameState,
  playerIndex: number,
  itemType: ItemType,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);
  const config = ITEMS[itemType];

  if (!config) {
    newState.logs.push(makeLog(logType, `购买失败：未知道具类型`));
    return newState;
  }

  if (!newState.shopItems.includes(itemType)) {
    newState.logs.push(makeLog(logType, `购买失败：商店无此道具`));
    return newState;
  }

  // 合作模式：队伍共享道具栏
  const itemsArray = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].items
    : player.items;

  const itemCount = itemsArray.filter((it: ItemState) => it.type === itemType).length;
  if (itemCount >= MAX_ITEMS) {
    newState.logs.push(makeLog(logType, `购买失败：${config.name} 已达上限（每种最多${MAX_ITEMS}个）`));
    return newState;
  }

  // 科學家：買道具打8折；黑市商人：買道具打8折
  const isScientist = player.profession === "scientist";
  const isBlackMarketDealer = player.profession === "black_market_dealer";
  const finalPrice = isScientist || isBlackMarketDealer
    ? Math.round(config.price * 0.8)
    : config.price;

  if (player.money < finalPrice) {
    newState.logs.push(makeLog(logType, `购买失败：资金不足（需要${finalPrice}元）`));
    return newState;
  }

  player.money -= finalPrice;
  itemsArray.push({
    type: itemType,
    id: nextItemId++,
  });

  const teamText = newState.isCoopMode ? "（队伍共享）" : "";
  newState.logs.push(
    makeLog(
      "item",
      `${player.name} 购买了 ${config.icon} ${config.name}${teamText}（-${finalPrice}元）${isScientist ? '【科學家】8折' : ''}`,
    ),
  );

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updatePlayerAssets(newState);
  return newState;
}

export function applyItem(
  state: GameState,
  playerIndex: number,
  itemId: number,
  targetCellId?: number,
  remoteDiceValues?: [number, number],
): GameState {
  let newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  // 合作模式：从队伍道具栏查找
  const itemsArray = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].items
    : player.items;

  const itemIndex = itemsArray.findIndex((it: ItemState) => it.id === itemId);
  if (itemIndex < 0) {
    newState.logs.push(makeLog(logType, `使用失败：道具不存在`));
    return newState;
  }

  const item = itemsArray[itemIndex];
  const config = ITEMS[item.type];

  // 暗網模式：道具效果增強
  const darknetMult = newState.darknetMode
    ? (GAME_MODES.darknet.itemEffectMultiplier ?? 1.5)
    : 1;

  switch (item.type) {
    case "double_dice": {
      player.doubleDiceActive = true;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 双倍骰，下次掷骰为双6`),
      );
      break;
    }

    case "teleport": {
      if (targetCellId === undefined || targetCellId < 0 || targetCellId >= CELL_COUNT) {
        newState.logs.push(makeLog(logType, `使用失败：请指定传送目标`));
        return newState;
      }
      if (newState.isBattleRoyale && isCellDestroyed(newState, targetCellId)) {
        newState.logs.push(makeLog(logType, `使用失败：目标位置已被摧毁`));
        return newState;
      }
      const oldPos = player.position;
      player.position = targetCellId;
      newState.logs.push(
        makeLog(
          "item",
          `${player.name} 使用了 ${config.icon} 传送卡，传送到 ${CELLS[targetCellId].name}（不触发落地事件）`,
        ),
      );
      // 检查是否过起点（给起点奖励）
      if (targetCellId < oldPos) {
        const baseReward = getStartBonus(newState.mode, player.profession, newState.customRules, newState.inflationRate);
        const reward = newState.weatherMultipliers.incomeMultiplier
          ? Math.round(baseReward * newState.weatherMultipliers.incomeMultiplier)
          : baseReward;
        player.money += reward;
        newState.logs.push(
          makeLog(logType, `${player.name} 经过起点，获得 ${reward} 元奖励`),
        );
      }
      break;
    }

    case "steal_property": {
      if (targetCellId === undefined) {
        newState.logs.push(makeLog(logType, `使用失败：请指定目标地产`));
        return newState;
      }
      const prop = newState.properties[targetCellId];
      if (!prop || prop.owner === undefined || prop.owner < 0 || prop.owner === playerIndex) {
        newState.logs.push(makeLog(logType, `使用失败：该地块不是对手所有`));
        return newState;
      }
      // 合作模式：不能偷队友的
      if (newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex)) {
        newState.logs.push(makeLog(logType, `使用失败：不能对队友地产使用掠夺卡`));
        return newState;
      }
      if (prop.buildings > 0) {
        newState.logs.push(makeLog(logType, `使用失败：只能偷取无建筑的地产`));
        return newState;
      }
      // 检查地价不超过2000（以當前棋盤格為準，相容自訂/隨機地圖與漲價）
      const targetCell = getCellConfig(newState, targetCellId);
      const cellBasePrice = targetCell.basePrice;
      if (cellBasePrice > 2000) {
        newState.logs.push(
          makeLog(logType, `使用失败：该地块地价超过2000元，无法偷取`),
        );
        return newState;
      }
      const originalOwner = prop.owner;
      // 地产进入贓物池，不直接归小偷所有
      // 从 properties / ownedProperties 移除（偷地只作用于无建筑地块，无需保留建筑状态）
      delete newState.properties[targetCellId];
      delete newState.ownedProperties[targetCellId];
      const cell = getCellConfig(newState, targetCellId);
      const marketPrice = getCellPrice(
        targetCellId,
        newState.mode,
        newState.customRules,
        newState.boardCells,
      );
      const stolen: StolenProperty = {
        cellId: targetCellId,
        stolenFrom: originalOwner,
        stolenBy: playerIndex,
        forSale: true,
        price: Math.round(marketPrice * UNDERGROUND_MARKET_PRICE_RATIO),
      };
      if (!newState.stolenProperties) {
        newState.stolenProperties = [];
      }
      newState.stolenProperties.push(stolen);
      // 声望系统：偷地扣10声望
      changeReputation(newState, playerIndex, -REPUTATION_LOSS_STEAL, "偷竊地產");
      // 匿名日志：不透露小偷身份
      newState.logs.push(
        makeLog(
          "underground_market",
          `一塊地產被偷走，流入地下市場...（${cell.name}）`,
        ),
      );
      updateBuildingCounts(newState);
      break;
    }

    case "shield": {
      const layers = darknetMult > 1 ? 5 : 3;
      player.shieldCharges = layers;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 护盾（${layers}次过路费免疫）`),
      );
      break;
    }

    case "free_pass": {
      player.freePassRemaining = 1;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 免费过路卡（1次）`),
      );
      break;
    }

    case "remote_dice": {
      // 遥控骰子需要传入两个骰子的值
      if (!remoteDiceValues || remoteDiceValues.length !== 2) {
        newState.logs.push(makeLog(logType, `使用失败：请指定两个骰子的点数`));
        return newState;
      }
      const [d1, d2] = remoteDiceValues;
      if (
        !Number.isInteger(d1) || !Number.isInteger(d2) ||
        d1 < 1 || d1 > 6 || d2 < 1 || d2 > 6
      ) {
        newState.logs.push(makeLog(logType, `使用失败：骰子点数必须在1-6之间`));
        return newState;
      }
      player.remoteDiceActive = true;
      player.remoteDiceValues = [d1, d2];
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 遥控骰子，下次掷骰为 ${d1}+${d2}`),
      );
      break;
    }

    case "bomb": {
      if (targetCellId === undefined) {
        newState.logs.push(makeLog(logType, `使用失败：请指定目标地产`));
        return newState;
      }
      const prop = newState.properties[targetCellId];
      if (!prop || prop.owner === undefined || prop.owner < 0 || prop.owner === playerIndex) {
        newState.logs.push(makeLog(logType, `使用失败：该地块不是对手所有`));
        return newState;
      }
      if (newState.isCoopMode && isSameTeam(newState, prop.owner, playerIndex)) {
        newState.logs.push(makeLog(logType, `使用失败：不能对队友地产使用炸彈`));
        return newState;
      }
      if (prop.buildings === 0) {
        newState.logs.push(makeLog(logType, `使用失败：该地块没有建筑`));
        return newState;
      }
      const bombCell = getCellConfig(newState, targetCellId);
      const targetOwner = newState.players[prop.owner];
      prop.buildings = (prop.buildings - 1) as BuildingLevel;
      newState.logs.push(
        makeLog(
          "item",
          `${player.name} 使用了 ${config.icon} 炸彈，摧毀了 ${targetOwner.name} 在 ${bombCell.name} 的一棟建築`,
        ),
      );
      updateBuildingCounts(newState);
      break;
    }

    case "invisibility": {
      const turns = darknetMult > 1 ? 5 : 3;
      player.invisibilityTurns = turns;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 隱身藥水，${turns}回合內不收也不付過路費`),
      );
      break;
    }

    case "time_machine": {
      if (player.previousPosition === undefined) {
        newState.logs.push(makeLog(logType, `使用失敗：沒有上回合位置記錄`));
        return newState;
      }
      const prevPos = player.previousPosition;
      player.position = prevPos;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 時光機，回到上回合位置 ${CELLS[prevPos].name}（不觸發落地事件）`),
      );
      break;
    }

    case "money_tree": {
      const turns = darknetMult > 1 ? 8 : 5;
      player.moneyTreeTurns = turns;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 金錢樹，未來${turns}回合每回合+200元`),
      );
      break;
    }

    case "x_ray": {
      player.xRayActive = true;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 透視鏡，下次抽卡前可預覽內容`),
      );
      break;
    }

    case "clone_dice": {
      if (!player.lastDiceValues) {
        newState.logs.push(makeLog(logType, `使用失敗：尚無上次擲骰記錄`));
        return newState;
      }
      player.cloneDiceActive = true;
      newState.logs.push(
        makeLog("item", `${player.name} 使用了 ${config.icon} 克隆骰，下次擲骰複製上次點數`),
      );
      break;
    }

    case "time_travel": {
      if (newState.customRules?.enableTimeTravel === false) {
        newState.logs.push(makeLog(logType, `使用失敗：時間旅行功能未開啟`));
        return newState;
      }
      if (player.timeTravelUsed) {
        newState.logs.push(makeLog(logType, `使用失敗：每局限用1次時間旅行`));
        return newState;
      }
      const snapshot = newState.timeTravelSnapshots?.[playerIndex];
      if (!snapshot) {
        newState.logs.push(makeLog(logType, `使用失敗：尚無時間旅行快照`));
        return newState;
      }
      player.position = snapshot.position;
      player.money = snapshot.money;
      player.timeTravelUsed = true;
      newState.logs.push(makeLog(
        "item",
        `【漩渦】 ${player.name} 使用了時間旅行，回到第 ${snapshot.turn} 回合的位置與金錢狀態（地產保留）`,
      ));
      break;
    }

    case "hacker_backdoor": {
      player.nextBuyDiscount = 0.2;
      newState.logs.push(
        makeLog(
          "item",
          `【後門】 ${player.name} 使用了駭客後門，下次購買地產享 8 折優惠`,
        ),
      );
      break;
    }

    case "emp_pulse": {
      if (targetCellId === undefined) {
        newState.logs.push(makeLog(logType, `使用失敗：請指定對手`));
        return newState;
      }
      const targetPlayer = newState.players[targetCellId];
      if (!targetPlayer || targetPlayer.isBankrupt) {
        newState.logs.push(makeLog(logType, `使用失敗：目標玩家不存在`));
        return newState;
      }
      if (targetCellId === playerIndex) {
        newState.logs.push(makeLog(logType, `使用失敗：不能對自己使用`));
        return newState;
      }
      targetPlayer.skipNextTurn = true;
      const extraTurn = darknetMult > 1;
      if (extraTurn) {
        targetPlayer.empExtraSkip = true;
      }
      newState.logs.push(
        makeLog(
          "item",
          `【閃電】 ${player.name} 對 ${targetPlayer.name} 使用了電磁脈衝，對方${extraTurn ? '下2回合' : '下回合'}無法行動`,
        ),
      );
      break;
    }

    case "stealth_cloak": {
      const turns = darknetMult > 1 ? 5 : 3;
      player.stealthCloakTurns = turns;
      newState.logs.push(
        makeLog(
          "item",
          `【光學迷彩】 ${player.name} 使用了隱形光學迷彩，${turns} 回合內經過對手地產不付過路費`,
        ),
      );
      break;
    }

    case "drone_scout": {
      player.money += 200;
      newState.logs.push(
        makeLog(
          "item",
          `【偵察】 ${player.name} 使用了無人機偵察，獲得 200 元情報津貼`,
        ),
      );
      break;
    }

    case "quantum_portal": {
      if (targetCellId === undefined || targetCellId < 0 || targetCellId >= CELL_COUNT) {
        newState.logs.push(makeLog(logType, `使用失敗：請指定傳送目標`));
        return newState;
      }
      if (newState.isBattleRoyale && isCellDestroyed(newState, targetCellId)) {
        newState.logs.push(makeLog(logType, `使用失敗：目標位置已被摧毀`));
        return newState;
      }
      const oldPos = player.position;
      player.position = targetCellId;
      newState.logs.push(
        makeLog(
          "item",
          `【漩渦】 ${player.name} 使用了量子傳送門，傳送到 ${CELLS[targetCellId].name}（不觸發落地事件）`,
        ),
      );
      if (targetCellId < oldPos) {
        const baseReward = getStartBonus(newState.mode, player.profession, newState.customRules, newState.inflationRate);
        const reward = newState.weatherMultipliers.incomeMultiplier
          ? Math.round(baseReward * newState.weatherMultipliers.incomeMultiplier)
          : baseReward;
        player.money += reward;
        newState.logs.push(
          makeLog(logType, `${player.name} 經過起點，獲得 ${reward} 元獎勵`),
        );
      }
      break;
    }

    case "credit_voucher": {
      const amount = darknetMult > 1 ? 1500 : 1000;
      player.money += amount;
      newState.logs.push(
        makeLog(
          "item",
          `【還款】 ${player.name} 使用了信用點券，獲得 ${amount} 元現金`,
        ),
      );
      break;
    }

    case "time_pocket_watch": {
      const newDice = rollDice();
      player.doubleDiceActive = false;
      player.remoteDiceActive = false;
      player.cloneDiceActive = false;
      player.remoteDiceValues = undefined;
      newState.logs.push(
        makeLog(
          "item",
          `⏱ ${player.name} 使用了時光懷錶，重擲點數為 ${newDice[0]}+${newDice[1]}，本回合立即生效`,
        ),
      );
      itemsArray.splice(itemIndex, 1);
      player.itemsUsedThisGame++;
      newState = processMove(newState, newDice);
      return newState;
    }

    case "electronic_contract": {
      const contractDiscount = 0.3;
      if (player.nextBuyDiscount && player.nextBuyDiscount > contractDiscount) {
        newState.logs.push(
          makeLog(
            "item",
            `【契約】 ${player.name} 使用了電子契約，但已有更低折扣，維持不變`,
          ),
        );
      } else {
        player.nextBuyDiscount = contractDiscount;
        newState.logs.push(
          makeLog(
            "item",
            `【契約】 ${player.name} 使用了電子契約，下次購買地產享 7 折優惠`,
          ),
        );
      }
      break;
    }

    case "energy_shield": {
      player.shieldCharges += 1;
      newState.logs.push(
        makeLog(
          "item",
          `【護盾】 ${player.name} 使用了能量護盾，抵擋下一次過路費`,
        ),
      );
      break;
    }

    case "data_courier": {
      const courierAmount = Math.round(500 * darknetMult);
      player.money += courierAmount;
      newState.logs.push(
        makeLog(
          "item",
          `【快遞】 ${player.name} 使用了數據快遞，獲得 ${courierAmount} 元現金`,
        ),
      );
      break;
    }

    case "fake_id": {
      player.fakeIdActive = true;
      newState.logs.push(
        makeLog(
          "item",
          `【偽證】 ${player.name} 使用了偽身份證，下次進入監禁時自動豁免`,
        ),
      );
      break;
    }
  }

  // 移除道具
  itemsArray.splice(itemIndex, 1);
  player.itemsUsedThisGame++;

  // 成就检查
  checkAndUnlockAchievements(newState, playerIndex);
  updatePlayerAssets(newState);
  return newState;
}

// ========== 付錢保釋 ==========

export function payBailRelease(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (!player || !player.isInDetention) {
    newState.logs.push(makeLog(logType, `保釋失敗：玩家不在監禁中`));
    return newState;
  }
  if (player.money < BAIL_AMOUNT) {
    newState.logs.push(makeLog(logType, `保釋失敗：現金不足（需要 ${BAIL_AMOUNT} 元）`));
    return newState;
  }

  player.money -= BAIL_AMOUNT;
  player.isInDetention = false;
  player.detentionTurns = 0;
  player.consecutiveDoubles = 0;
  newState.phase = "rolling";

  newState.logs.push(
    makeLog(
      logType,
      `${player.name} 支付 ${BAIL_AMOUNT} 元保釋金，當即獲釋，本回合可繼續行動`,
    ),
  );

  return newState;
}

// ========== 地下市场系统 ==========

export function undergroundMarketBuy(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];

  if (!player || player.isBankrupt) return newState;

  // 声望检查：不存在或 >=50 则不允许进入地下市场
  if (player.reputation === undefined || player.reputation >= UNDERGROUND_MARKET_REPUTATION_THRESHOLD) {
    return newState;
  }

  const pool = newState.stolenProperties ?? [];
  const idx = pool.findIndex((s: StolenProperty) => s.cellId === cellId && s.forSale);
  if (idx < 0) return newState;

  const stolen = pool[idx];
  const cell = getCellConfig(newState, cellId);

  if (player.money < stolen.price) return newState;

  // 扣钱
  player.money -= stolen.price;

  // 声望：扣5
  changeReputation(newState, playerIndex, -REPUTATION_LOSS_UNDERGROUND_BUY, "地下市場交易");

  // 30% 概率被警察没收
  const confiscated = Math.random() < UNDERGROUND_MARKET_CONFISCATE_RATE;
  if (confiscated) {
    // 钱被扣，地没拿到
    // 地产从贓物池移除，归还给原主人（如果原主人还在游戏中且未破产），否则归银行（不进properties）
    pool.splice(idx, 1);
    const originalOwner = newState.players[stolen.stolenFrom];
    if (originalOwner && !originalOwner.isBankrupt && stolen.stolenFrom !== playerIndex) {
      newState.properties[cellId] = {
        owner: stolen.stolenFrom,
        ownerTeam: newState.isCoopMode ? getPlayerTeam(newState, stolen.stolenFrom) : undefined,
        buildings: 0,
        isMortgaged: false,
        insured: false,
      };
      newState.ownedProperties[cellId] = stolen.stolenFrom;
    }
    newState.logs.push(
      makeLog(
        "underground_market",
        `[地下市場] 交易被警察查獲，貨物被沒收！`,
      ),
    );
  } else {
    // 70% 概率成功：获得地产，从贓物池移除
    pool.splice(idx, 1);
    newState.properties[cellId] = {
      owner: playerIndex,
      ownerTeam: newState.isCoopMode ? getPlayerTeam(newState, playerIndex) : undefined,
      buildings: 0,
      isMortgaged: false,
      insured: false,
    };
    newState.ownedProperties[cellId] = playerIndex;
    newState.logs.push(
      makeLog(
        "underground_market",
        `[地下市場] 一筆交易完成，某塊地產易主`,
      ),
    );
  }

  // 合作模式：同步队伍金钱
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updateBuildingCounts(newState);
  updatePlayerAssets(newState);
  return newState;
}

// ========== 腐敗系統（賄賂銀行） ==========

export function bribeBank(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (!player || player.isBankrupt) return newState;

  const cell = getCellConfig(newState, cellId);
  if (!cell || cell.type !== "property") {
    newState.logs.push(
      makeLog(logType, `賄賂失敗：目標不是地產`),
    );
    return newState;
  }

  // 校驗：地塊屬於銀行（無主地）
  const prop = newState.properties[cellId];
  const existingOwner = prop?.owner ?? newState.ownedProperties[cellId];
  if (existingOwner !== undefined && existingOwner !== null) {
    newState.logs.push(
      makeLog(logType, `賄賂失敗：${cell.name} 已有所有者`),
    );
    return newState;
  }

  // 校驗：賄賂次數上限
  const currentBribeCount = newState.bribeCount ?? 0;
  if (currentBribeCount >= BRIBE_MAX_COUNT) {
    newState.logs.push(
      makeLog(logType, `賄賂失敗：本局賄賂次數已達上限`),
    );
    return newState;
  }

  // 計算費用
  const basePrice = getCellPrice(cellId, newState.mode, newState.customRules, newState.boardCells);
  const bribeCost = Math.round(basePrice * BRIBE_BRIBE_RATIO);
  const buyCost = Math.round(basePrice * BRIBE_PRICE_RATIO);
  const totalSuccessCost = bribeCost + buyCost;

  // 校驗：現金至少需要支付成功情況的總花費
  if (player.money < totalSuccessCost) {
    newState.logs.push(
      makeLog(logType, `賄賂失敗：現金不足（需要 $${totalSuccessCost}）`),
    );
    return newState;
  }

  // 賄賂次數 +1（無論成敗都算一次）
  newState.bribeCount = currentBribeCount + 1;

  // 判定：20% 概率被抓
  const caught = Math.random() < BRIBE_CATCH_RATE;
  if (caught) {
    // 被抓：扣賄賂金 + 罰款，聲望 -20
    const totalLoss = bribeCost + BRIBE_FINE;
    player.money -= totalLoss;
    changeReputation(newState, playerIndex, -REPUTATION_LOSS_BRIBE_CAUGHT, "賄賂被抓");
    newState.logs.push(
      makeLog(
        "bribery",
        `有人賄賂銀行被抓，罰款 $${BRIBE_FINE}！`,
      ),
    );
    // 合作模式：同步隊伍金錢
    if (newState.isCoopMode) {
      syncCoopMoneyFromPlayer(newState, playerIndex);
    }
    updatePlayerAssets(newState);
    // 檢查是否破產
    applyBankruptcyCheck(newState, playerIndex);
    return newState;
  }

  // 成功：扣錢，獲得地產，聲望 -3
  player.money -= totalSuccessCost;
  newState.ownedProperties[cellId] = playerIndex;
  newState.properties[cellId] = {
    owner: playerIndex,
    ownerTeam: newState.isCoopMode ? getPlayerTeam(newState, playerIndex) : undefined,
    buildings: 0,
    isMortgaged: false,
    insured: false,
  };
  changeReputation(newState, playerIndex, -REPUTATION_LOSS_BRIBE_SUCCESS, "賄賂銀行");
  newState.logs.push(
    makeLog(
      "bribery",
      `一筆灰色交易悄悄達成...`,
    ),
  );

  // 合作模式：同步隊伍金錢
  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, playerIndex);
  }

  updateCompleteSets(newState);
  updateBuildingCounts(newState);
  updatePlayerAssets(newState);

  return newState;
}

// ========== 迷你游戏系统 ==========

export function startMiniGame(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const game = newState.pendingMiniGame;

  if (!game || game.playerIndex !== playerIndex || game.finished) {
    return newState;
  }

  switch (game.type) {
    case "slot_machine": {
      const r1 = Math.floor(Math.random() * 7) + 1;
      const r2 = Math.floor(Math.random() * 7) + 1;
      const r3 = Math.floor(Math.random() * 7) + 1;
      game.reels = [r1, r2, r3];
      let reward = 0;
      if (r1 === r2 && r2 === r3) {
        reward = 3000;
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        reward = 500;
      }
      game.reward = reward;
      game.finished = true;
      break;
    }

    case "guess_number": {
      game.diceResult = 1 + Math.floor(Math.random() * 6);
      game.reward = 0;
      // 玩家需要后续调用 guessBigSmall 来判胜负
      break;
    }

    case "blackjack": {
      game.playerCards = [drawBlackjackCard(), drawBlackjackCard()];
      game.dealerCards = [drawBlackjackCard()];
      game.reward = 0;
      break;
    }

    case "memory_match": {
      // 生成 6 对图案（12 张卡片），随机打乱
      const pairs: number[] = [];
      for (let i = 0; i < 6; i++) {
        pairs.push(i, i);
      }
      // Fisher-Yates 洗牌
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      game.memoryCards = pairs;
      game.memoryFlipped = [];
      game.memoryMatched = [];
      game.memoryTimeLeft = 30;
      game.memoryMoves = 0;
      game.reward = 0;
      break;
    }

    case "rhythm_master": {
      // 生成 10 个音符，随机分布在 3 条轨道
      const notes: Array<{ id: number; time: number; lane: number; hit: boolean }> = [];
      for (let i = 0; i < 10; i++) {
        notes.push({
          id: i,
          time: 1000 + i * 800 + Math.floor(Math.random() * 300),
          lane: Math.floor(Math.random() * 3),
          hit: false,
        });
      }
      game.rhythmNotes = notes;
      game.rhythmScore = 0;
      game.rhythmHitCount = 0;
      game.rhythmTotalNotes = 10;
      game.rhythmPlaying = false;
      game.reward = 0;
      break;
    }

    case "shooting_challenge": {
      // 生成 5 个移动靶标（3 发子弹，目标移动）
      const targets: Array<{ id: number; x: number; y: number; speed: number; hit: boolean }> = [];
      for (let i = 0; i < 5; i++) {
        targets.push({
          id: i,
          x: -10 - i * 20,
          y: 10 + Math.floor(Math.random() * 80),
          speed: 0.8 + Math.random() * 0.8 + i * 0.15,
          hit: false,
        });
      }
      game.shootingTargets = targets;
      game.shootingBullets = 3;
      game.shootingScore = 0;
      game.reward = 0;
      break;
    }
  }

  return newState;
}

function drawBlackjackCard(): number {
  const v = Math.floor(Math.random() * 13) + 1;
  if (v > 10) return 10; // J/Q/K = 10
  return v;
}

export function miniGameAction(
  state: GameState,
  playerIndex: number,
  action: string,
  data?: unknown,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const game = newState.pendingMiniGame;

  if (!game || game.playerIndex !== playerIndex) return newState;

  switch (action) {
    case "spin_slots":
    case "finish": {
      if (!game.finished) return newState;
      resolveMiniGame(newState, playerIndex);
      break;
    }

    case "guess_big":
    case "guess_small":
    case "guess_leopard": {
      if (game.type !== "guess_number") return newState;
      if (game.diceResult === undefined) {
        game.diceResult = 1 + Math.floor(Math.random() * 6);
      }
      if (action === "guess_leopard") {
        // 豹子：猜具体点数，从 data 中获取目标点数
        const targetNum = typeof data === "number" ? data : (data as { target?: number })?.target;
        if (targetNum === undefined || targetNum < 1 || targetNum > 6) {
          newState.logs.push(makeLog("minigame", `猜豹子失败：请指定1-6的点数`));
          return newState;
        }
        const leopardWin = game.diceResult === targetNum;
        game.reward = leopardWin ? 3000 : 0;
        game.finished = true;
        resolveMiniGame(newState, playerIndex);
        break;
      }
      const isBig = game.diceResult >= 4;
      const playerBetBig = action === "guess_big";
      const win = isBig === playerBetBig;
      game.reward = win ? 800 : 0;
      game.finished = true;
      resolveMiniGame(newState, playerIndex);
      break;
    }

    case "blackjack_hit": {
      if (game.type !== "blackjack") return newState;
      if (!game.playerCards) game.playerCards = [];
      game.playerCards.push(drawBlackjackCard());
      // 爆牌检查
      const playerSum = blackjackSum(game.playerCards);
      if (playerSum > 21) {
        game.reward = 0;
        game.finished = true;
        resolveMiniGame(newState, playerIndex);
      }
      break;
    }

    case "blackjack_stand": {
      if (game.type !== "blackjack") return newState;
      if (!game.playerCards) game.playerCards = [];
      if (!game.dealerCards) game.dealerCards = [];
      // 庄家补牌到17点以上
      while (blackjackSum(game.dealerCards) < 17) {
        game.dealerCards.push(drawBlackjackCard());
      }
      const playerSum = blackjackSum(game.playerCards);
      const dealerSum = blackjackSum(game.dealerCards);
      let win = false;
      if (playerSum > 21) {
        win = false;
      } else if (dealerSum > 21) {
        win = true;
      } else {
        win = playerSum > dealerSum;
      }
      game.reward = win ? 1000 : 0;
      game.finished = true;
      resolveMiniGame(newState, playerIndex);
      break;
    }

    case "memory_flip": {
      if (game.type !== "memory_match") return newState;
      const cardIdx = typeof data === "number" ? data : (data as { index?: number })?.index;
      if (cardIdx === undefined || cardIdx < 0 || cardIdx >= 12) return newState;
      if (!game.memoryFlipped) game.memoryFlipped = [];
      if (!game.memoryMatched) game.memoryMatched = [];
      if (game.memoryFlipped.length >= 2) return newState;
      if (game.memoryFlipped.includes(cardIdx)) return newState;
      if (game.memoryMatched.includes(cardIdx)) return newState;
      game.memoryFlipped.push(cardIdx);
      if (game.memoryMoves !== undefined) game.memoryMoves += 0.5;
      break;
    }

    case "memory_check_match": {
      if (game.type !== "memory_match") return newState;
      if (!game.memoryFlipped || game.memoryFlipped.length !== 2) return newState;
      if (!game.memoryCards) return newState;
      const [a, b] = game.memoryFlipped;
      if (game.memoryCards[a] === game.memoryCards[b]) {
        if (!game.memoryMatched) game.memoryMatched = [];
        game.memoryMatched.push(a, b);
        // 检查是否全部匹配完成
        if (game.memoryMatched.length >= 12) {
          game.reward = 1000;
          game.finished = true;
          resolveMiniGame(newState, playerIndex);
        }
      }
      game.memoryFlipped = [];
      break;
    }

    case "memory_finish": {
      if (game.type !== "memory_match") return newState;
      const matchedCount = game.memoryMatched ? game.memoryMatched.length / 2 : 0;
      if (matchedCount >= 6) {
        game.reward = 1000;
      } else if (matchedCount >= 4) {
        game.reward = 500;
      } else if (matchedCount >= 2) {
        game.reward = 200;
      } else {
        game.reward = 0;
      }
      game.finished = true;
      resolveMiniGame(newState, playerIndex);
      break;
    }

    case "rhythm_start": {
      if (game.type !== "rhythm_master") return newState;
      game.rhythmPlaying = true;
      break;
    }

    case "rhythm_finish": {
      if (game.type !== "rhythm_master") return newState;
      const hitCount = game.rhythmHitCount ?? 0;
      const totalNotes = game.rhythmTotalNotes ?? 10;
      const hitRate = totalNotes > 0 ? hitCount / totalNotes : 0;
      if (hitRate >= 0.9) {
        game.reward = 1500;
      } else if (hitRate >= 0.7) {
        game.reward = 800;
      } else if (hitRate >= 0.5) {
        game.reward = 300;
      } else {
        game.reward = 0;
      }
      game.rhythmPlaying = false;
      game.finished = true;
      resolveMiniGame(newState, playerIndex);
      break;
    }

    case "rhythm_hit": {
      if (game.type !== "rhythm_master") return newState;
      if (game.rhythmHitCount === undefined) game.rhythmHitCount = 0;
      game.rhythmHitCount += 1;
      if (game.rhythmScore === undefined) game.rhythmScore = 0;
      game.rhythmScore += 100;
      break;
    }

    case "shooting_shoot": {
      if (game.type !== "shooting_challenge") return newState;
      if (game.shootingBullets === undefined) return newState;
      if (game.shootingBullets <= 0) return newState;
      const targetId = typeof data === "number" ? data : (data as { targetId?: number })?.targetId;
      game.shootingBullets -= 1;
      if (targetId !== undefined && game.shootingTargets) {
        const target = game.shootingTargets.find((t) => t.id === targetId);
        if (target && !target.hit) {
          target.hit = true;
          if (game.shootingScore === undefined) game.shootingScore = 0;
          game.shootingScore += 1;
        }
      }
      // 子弹用完自动结算
      if (game.shootingBullets <= 0) {
        const hitCount = game.shootingTargets
          ? game.shootingTargets.filter((t) => t.hit).length
          : 0;
        if (hitCount >= 3) {
          game.reward = 1200;
        } else if (hitCount >= 2) {
          game.reward = 600;
        } else if (hitCount >= 1) {
          game.reward = 200;
        } else {
          game.reward = 0;
        }
        game.finished = true;
        resolveMiniGame(newState, playerIndex);
      }
      break;
    }

    case "shooting_finish": {
      if (game.type !== "shooting_challenge") return newState;
      const hitCount = game.shootingTargets
        ? game.shootingTargets.filter((t) => t.hit).length
        : 0;
      if (hitCount >= 3) {
        game.reward = 1200;
      } else if (hitCount >= 2) {
        game.reward = 600;
      } else if (hitCount >= 1) {
        game.reward = 200;
      } else {
        game.reward = 0;
      }
      game.finished = true;
      resolveMiniGame(newState, playerIndex);
      break;
    }
  }

  return newState;
}

function blackjackSum(cards: number[]): number {
  let sum = 0;
  let aces = 0;
  for (const card of cards) {
    if (card === 1) {
      aces++;
      sum += 11;
    } else {
      sum += card;
    }
  }
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

function resolveMiniGame(state: GameState, playerIndex: number): void {
  const game = state.pendingMiniGame;
  if (!game || !game.finished) return;
  const player = state.players[playerIndex];
  const gameName = MINIGAME_NAMES[game.type];

  if (game.reward > 0) {
    // 賭徒：迷你遊戲獎勵翻倍
    const isGambler = player.profession === "gambler";
    const finalReward = isGambler ? game.reward * 2 : game.reward;
    player.money += finalReward;
    player.minigameWins++;
    state.logs.push(
      makeLog(
        "minigame",
        `【小遊戲】 ${player.name} 在${gameName}中获胜！獲得 ${finalReward} 元${isGambler ? '【賭徒】×2' : ''}`,
      ),
    );
    // 任務：贏得迷你遊戲
    updateMissionProgress(state, "win_minigame", 1, playerIndex);
    // 合作模式：同步队伍金钱
    if (state.isCoopMode) syncCoopMoneyFromPlayer(state, playerIndex);
  } else {
    state.logs.push(
      makeLog("minigame", `【小遊戲】 ${player.name} 在${gameName}中未能中奖`),
    );
  }

  checkAndUnlockAchievements(state, playerIndex);
  state.pendingMiniGame = null;
  updatePlayerAssets(state);

  // 迷你游戏结束后，如果是当前玩家回合，继续等待玩家操作（rolling阶段）
  // 如果当前玩家回合已结束，切换到下一个玩家
  if (state.phase === "rolling" && state.currentPlayerIndex === playerIndex) {
    // 玩家还可以继续操作（如建房、交易、结束回合等）
    // 不切换回合
  }
}

// ========== AI 道具与迷你游戏逻辑 ==========

export function aiUseItemIfNeeded(state: GameState, playerIndex: number): GameState {
  let newState = state;
  const player = newState.players[playerIndex];
  // 合作模式：从队伍道具栏读取
  const items = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].items
    : player.items;
  if (items.length === 0) return newState;

  // 简单AI策略：现金紧张且有免费过路/护盾时优先保留
  // 有双倍骰且离优质地产近时使用
  // 有掠夺卡时偷最贵的空地
  for (const item of items) {
    if (item.type === "steal_property") {
      // 找对手最贵的空地
      let bestCellId = -1;
      let bestPrice = 0;
      for (let cid = 0; cid < CELLS.length; cid++) {
        const prop = newState.properties[cid];
        if (
          prop &&
          prop.owner !== undefined &&
          prop.owner !== playerIndex &&
          prop.buildings === 0 &&
          !prop.isMortgaged
        ) {
          const price = getCellPrice(cid, newState.mode, newState.customRules);
          if (price > bestPrice) {
            bestPrice = price;
            bestCellId = cid;
          }
        }
      }
      if (bestCellId >= 0 && player.money > 3000) {
        newState = applyItem(newState, playerIndex, item.id, bestCellId);
        return newState;
      }
    }

    if (item.type === "shield" && player.shieldCharges === 0 && player.money < 3000) {
      newState = applyItem(newState, playerIndex, item.id);
      return newState;
    }

    if (item.type === "double_dice" && !player.doubleDiceActive && !player.remoteDiceActive && Math.random() < 0.3) {
      newState = applyItem(newState, playerIndex, item.id);
      return newState;
    }

    if (item.type === "remote_dice" && !player.remoteDiceActive && !player.doubleDiceActive && Math.random() < 0.25) {
      // AI 简单使用：直接设为双6
      newState = applyItem(newState, playerIndex, item.id, undefined, [6, 6]);
      return newState;
    }
  }

  return newState;
}

export function aiBuyItemIfNeeded(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  if (player.money < 5000) return state;
  if (state.shopItems.length === 0) return state;
  if (Math.random() > 0.4) return state;

  // 合作模式：检查队伍道具栏
  const items = state.isCoopMode && state.teams && player.teamId
    ? state.teams[player.teamId].items
    : player.items;

  // 只买还有空位的道具类型（每种最多MAX_ITEMS个）
  const availableItems = state.shopItems.filter((t: ItemType) => {
    const count = items.filter((it: ItemState) => it.type === t).length;
    return count < MAX_ITEMS;
  });
  if (availableItems.length === 0) return state;

  const itemType = availableItems[Math.floor(Math.random() * availableItems.length)];
  return buyItem(state, playerIndex, itemType);
}

export function aiResolveMiniGame(state: GameState, playerIndex: number): GameState {
  let newState = cloneState(state);
  const game = newState.pendingMiniGame;
  if (!game || game.playerIndex !== playerIndex) return newState;

  // 初始化游戏
  newState = startMiniGame(newState, playerIndex);
  const currentGame = newState.pendingMiniGame;
  if (!currentGame) return newState;

  // 老虎机：直接结算
  if (currentGame.type === "slot_machine") {
    if (currentGame.finished) {
      newState = miniGameAction(newState, playerIndex, "finish");
    }
    return newState;
  }

  // 猜大小：85%概率猜大或小，15%概率赌豹子
  if (currentGame.type === "guess_number") {
    if (Math.random() < 0.15) {
      const target = 1 + Math.floor(Math.random() * 6);
      newState = miniGameAction(newState, playerIndex, "guess_leopard", { target });
    } else {
      const choice = Math.random() < 0.5 ? "guess_big" : "guess_small";
      newState = miniGameAction(newState, playerIndex, choice);
    }
    return newState;
  }

  // 21点：简单策略，点数<16就Hit
  if (currentGame.type === "blackjack") {
    let safety = 0;
    while (safety < 10) {
      safety++;
      const g = newState.pendingMiniGame;
      if (!g || g.finished) break;
      if (!g.playerCards) break;
      const sum = blackjackSum(g.playerCards);
      if (sum < 16) {
        newState = miniGameAction(newState, playerIndex, "blackjack_hit");
      } else {
        newState = miniGameAction(newState, playerIndex, "blackjack_stand");
        break;
      }
    }
    return newState;
  }

  // 记忆翻牌：AI 中等水平，匹配 2-4 对
  if (currentGame.type === "memory_match") {
    // 模拟 AI 表现：随机匹配 2-5 对
    const aiPairs = 2 + Math.floor(Math.random() * 4);
    const g = newState.pendingMiniGame;
    if (g) {
      g.memoryMatched = [];
      for (let i = 0; i < Math.min(aiPairs, 6); i++) {
        // 找到对应图案的两张卡片索引
        if (g.memoryCards) {
          const patternId = i;
          const indices: number[] = [];
          for (let ci = 0; ci < g.memoryCards.length && indices.length < 2; ci++) {
            if (g.memoryCards[ci] === patternId) indices.push(ci);
          }
          g.memoryMatched.push(...indices);
        }
      }
    }
    newState = miniGameAction(newState, playerIndex, "memory_finish");
    return newState;
  }

  // 节奏大师：AI 命中率约 60-85%
  if (currentGame.type === "rhythm_master") {
    const g = newState.pendingMiniGame;
    if (g) {
      const hitRate = 0.6 + Math.random() * 0.25;
      g.rhythmHitCount = Math.floor((g.rhythmTotalNotes ?? 10) * hitRate);
    }
    newState = miniGameAction(newState, playerIndex, "rhythm_finish");
    return newState;
  }

  // 射击挑战：AI 命中 1-3 个
  if (currentGame.type === "shooting_challenge") {
    const g = newState.pendingMiniGame;
    if (g && g.shootingTargets) {
      const aiHits = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < Math.min(aiHits, g.shootingTargets.length); i++) {
        g.shootingTargets[i].hit = true;
      }
      g.shootingBullets = Math.max(0, 3 - aiHits);
    }
    newState = miniGameAction(newState, playerIndex, "shooting_finish");
    return newState;
  }

  return newState;
}

// ========== 成就系统 ==========

export function checkAchievements(
  state: GameState,
  playerIndex: number,
): AchievementId[] {
  const player = state.players[playerIndex];
  const newlyUnlocked: AchievementId[] = [];
  const alreadyUnlocked = new Set(player.unlockedAchievements);

  function tryUnlock(id: AchievementId): void {
    if (!alreadyUnlocked.has(id)) {
      newlyUnlocked.push(id);
      alreadyUnlocked.add(id);
    }
  }

  // 1. first_win：胜利
  if (state.winner === playerIndex) {
    tryUnlock("first_win");
  }

  // 2. property_tycoon：拥有地块数 > 10
  const ownedCount = Object.values(state.properties).filter(
    (p) => p.owner === playerIndex,
  ).length;
  if (ownedCount > 10) {
    tryUnlock("property_tycoon");
  }

  // 3. building_magnate：总建筑数 >= 5（房屋+酒店）
  if (player.totalHouses + player.totalHotels >= 5) {
    tryUnlock("building_magnate");
  }

  // 4. hotel_king：至少1栋酒店
  if (player.totalHotels >= 1) {
    tryUnlock("hotel_king");
  }

  // 5. set_collector：集齐3个以上系列
  if (player.completeSets >= 3) {
    tryUnlock("set_collector");
  }

  // 6. stock_sniper：股票盈利超过3000
  if (getPlayerStockProfit(player, state) > 3000) {
    tryUnlock("stock_sniper");
  }

  // 7. jailbird：进入禁闭区 >= 3次
  if (player.detentionCount >= 3) {
    tryUnlock("jailbird");
  }

  // 8. fate_favorite：抽卡 >= 5次
  if (player.cardDrawCount >= 5) {
    tryUnlock("fate_favorite");
  }

  // 9. trade_master：交易 >= 3次
  if (player.tradeCount >= 3) {
    tryUnlock("trade_master");
  }

  // 10. auction_hunter：拍卖获得 >= 2块
  if (player.auctionWins >= 2) {
    tryUnlock("auction_hunter");
  }

  // 11. rags_to_riches：胜利且曾经资金低于1000
  if (state.winner === playerIndex && player.hasBeenPoor) {
    tryUnlock("rags_to_riches");
  }

  // 12. perfect_victory：胜利且自己资金 >= 20000
  if (state.winner === playerIndex && player.money >= 20000) {
    tryUnlock("perfect_victory");
  }

  // 12b. asset_millionaire：單局總資產 >= 50000（修復：之前只判斷 money，應判斷 totalAssets）
  if (player.totalAssets >= 50000) {
    tryUnlock("asset_millionaire");
  }

  // 12c. asset_100k：單局總資產 >= 100000
  if (player.totalAssets >= 100000) {
    tryUnlock("asset_100k");
  }

  // 13. item_collector：单局使用5个以上道具
  if (player.itemsUsedThisGame >= 5) {
    tryUnlock("item_collector");
  }

  // 14. gambler：迷你游戏获胜 >= 3次
  if (player.minigameWins >= 3) {
    tryUnlock("gambler");
  }

  // 15. chosen_one：单局遇到3次以上晴天
  if (player.sunnyWeatherCount >= 3) {
    tryUnlock("chosen_one");
  }

  // 16. battle_royale_champion：大逃杀冠军
  if (state.isBattleRoyale && state.winner === playerIndex) {
    tryUnlock("battle_royale_champion");
  }

  // 17. shrink_survivor：缩圈幸存者（进入最终决战）
  if (state.isBattleRoyale && state.finalBattle && !player.isBankrupt) {
    tryUnlock("shrink_survivor");
  }

  return newlyUnlocked;
}

export function checkAndUnlockAchievements(
  state: GameState,
  playerIndex: number,
): AchievementId[] {
  const newlyUnlocked = checkAchievements(state, playerIndex);
  const player = state.players[playerIndex];
  if (newlyUnlocked.length > 0) {
    player.unlockedAchievements = [...player.unlockedAchievements, ...newlyUnlocked];
    for (const id of newlyUnlocked) {
      const achievement = ACHIEVEMENTS[id];
      state.logs.push(
        makeLog(
          "system",
          `【成就】 ${player.name} 解锁成就：${achievement.name} - ${achievement.description}`,
        ),
      );
    }
  }
  return newlyUnlocked;
}

// ========== AI 股票交易 ==========

export function aiStockTrade(state: GameState, playerIndex: number): GameState {
  let newState = cloneState(state);
  const player = newState.players[playerIndex];
  // 合作模式：读取队伍股票
  const stocks = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].stocks
    : player.stocks;
  const stockBoughtTotal = newState.isCoopMode && newState.teams && player.teamId
    ? newState.teams[player.teamId].stockBoughtTotal
    : player.stockBoughtTotal;

  // 40% 概率进行股票操作
  if (Math.random() > 0.4) return newState;

  // 现金充裕时尝试买入
  if (player.money > 5000) {
    // 找低价股票（低于初始价80%）
    const cheapStocks: StockSymbol[] = [];
    for (const symbol of STOCK_SYMBOLS) {
      const initialPrice = STOCKS[symbol].initialPrice;
      if (newState.stocks[symbol] < initialPrice * 0.8) {
        cheapStocks.push(symbol);
      }
    }

    if (cheapStocks.length > 0) {
      const symbol = cheapStocks[Math.floor(Math.random() * cheapStocks.length)];
      const price = newState.stocks[symbol];
      const maxAffordable = Math.floor((player.money - 2000) / price);
      if (maxAffordable > 0) {
        const quantity = Math.min(maxAffordable, 1 + Math.floor(Math.random() * 5));
        if (quantity > 0) {
          newState = buyStock(newState, playerIndex, symbol, quantity);
          return newState;
        }
      }
    }
  }

  // 持有股票且盈利 > 30% 时卖出部分
  for (const holding of stocks) {
    const costBasis = stockBoughtTotal > 0
      ? (stockBoughtTotal / stocks.reduce((sum: number, s: PlayerStock) => sum + s.quantity, 0))
      : STOCKS[holding.symbol].initialPrice;
    const currentPrice = newState.stocks[holding.symbol];
    const profitRatio = (currentPrice - costBasis) / costBasis;

    if (profitRatio > 0.3 && holding.quantity > 0) {
      const sellQty = Math.min(holding.quantity, 1 + Math.floor(Math.random() * 3));
      if (sellQty > 0) {
        newState = sellStock(newState, playerIndex, holding.symbol, sellQty);
        return newState;
      }
    }

    // 亏损 > 20% 且现金紧张时割肉
    if (profitRatio < -0.2 && player.money < 2000 && holding.quantity > 0) {
      const sellQty = Math.ceil(holding.quantity / 2);
      newState = sellStock(newState, playerIndex, holding.symbol, sellQty);
      return newState;
    }
  }

  return newState;
}

// ========== 规则辅助函数 ==========

export interface GameRules {
  initialMoney: number;
  tollPercent: number;
  goBonus: number;
  fateMoneyMultiplier: number;
  buildingTollMode: "standard" | "aggressive";
  bankruptcyLine: number;
  propertyPriceMultiplier: number;
}

export function getGameRules(state: GameState): GameRules {
  if (state.mode === "custom" && state.customRules) {
    return {
      initialMoney: state.customRules.initialMoney,
      tollPercent: state.customRules.tollPercent,
      goBonus: state.customRules.goBonus,
      fateMoneyMultiplier: state.customRules.fateMoneyMultiplier,
      buildingTollMode: state.customRules.buildingTollMode,
      bankruptcyLine: state.customRules.bankruptcyLine,
      propertyPriceMultiplier: 1.0,
    };
  }
  const modeConfig = GAME_MODES[state.mode];
  return {
    initialMoney: modeConfig.initialMoney,
    tollPercent: modeConfig.tollRate,
    goBonus: modeConfig.startReward,
    fateMoneyMultiplier: modeConfig.fateMoneyMultiplier,
    buildingTollMode: "standard",
    bankruptcyLine: 0,
    propertyPriceMultiplier: modeConfig.priceMultiplier,
  };
}

// ========== 游戏统计 ==========

export function calculateGameStats(state: GameState): GameStats {
  const players: PlayerStats[] = state.players.map((_p: PlayerState, idx: number) => {
    const player = state.players[idx];
    const propertyCount = Object.values(state.properties).filter(
      (p) => p.owner === idx,
    ).length;
    const stockValue = getPlayerStockValue(player, state);
    const stockProfit = getPlayerStockProfit(player, state);
    const totalBuildings = player.totalHouses + player.totalHotels;

    return {
      name: player.name,
      finalMoney: player.money,
      propertyCount,
      totalBuildings,
      totalHouses: player.totalHouses,
      totalHotels: player.totalHotels,
      tollIncome: player.tollIncome ?? player.tollEarned,
      tollExpense: player.tollExpense ?? player.tollPaid,
      stockProfit,
      stockValue,
      fateCardDraws: player.fateCardDraws ?? 0,
      chanceCardDraws: player.chanceCardDraws ?? 0,
      detentionCount: player.detentionCount,
      tradeCount: player.tradeCount,
      auctionWins: player.auctionWins,
      completeSets: player.completeSets,
      totalAssets: getTotalAssets(idx, state),
    };
  });

  let winReason: "bankruptcy" | "surrender" | null = null;
  if (state.winner !== null) {
    // 檢查是否有投降玩家（優先判定為投降勝利）
    const hasSurrenderedLoser = (state.surrenderedPlayers?.length ?? 0) > 0;
    if (hasSurrenderedLoser) {
      winReason = "surrender";
    } else {
      // 檢查是否有破產玩家導致勝利
      const hasBankruptLoser = state.players.some(
        (p: PlayerState) => p.isBankrupt,
      );
      if (hasBankruptLoser) {
        winReason = "bankruptcy";
      }
    }
  }

  return {
    totalTurns: state.totalTurns,
    winner: state.winner,
    winReason,
    players,
  };
}

// ========== 回放引擎 ==========

export interface ReplayStateResult {
  state: GameState;
  isExact: boolean;
  entry: ReplayLogEntry;
}

export function replayStateFromLog(
  log: ReplayLogEntry[],
  stepIndex: number,
): ReplayStateResult {
  if (log.length === 0) {
    throw new Error("replay log is empty");
  }
  const clamped: number = Math.max(0, Math.min(stepIndex, log.length - 1));
  const entry: ReplayLogEntry = log[clamped];

  // 找最近的帶快照的條目
  let snapshotEntry: ReplayLogEntry | undefined;
  let idx: number = clamped;
  while (idx >= 0) {
    if (log[idx]?.stateSnapshot) {
      snapshotEntry = log[idx];
      break;
    }
    idx -= 1;
  }

  // 向後找（如果前面沒有，從第一個有快照的開始）
  if (!snapshotEntry) {
    for (let i: number = 0; i < log.length; i += 1) {
      if (log[i]?.stateSnapshot) {
        snapshotEntry = log[i];
        break;
      }
    }
  }

  if (!snapshotEntry || !snapshotEntry.stateSnapshot) {
    throw new Error("no state snapshot found in replay log");
  }

  return {
    state: snapshotEntry.stateSnapshot,
    isExact: entry.stateSnapshot !== undefined,
    entry,
  };
}

/**
 * 從回放日誌中取得所有帶有快照的步驟索引
 */
export function getSnapshotSteps(log: ReplayLogEntry[]): number[] {
  const steps: number[] = [];
  for (let i: number = 0; i < log.length; i += 1) {
    if (log[i]?.stateSnapshot) {
      steps.push(i);
    }
  }
  return steps;
}

/**
 * 取得指定索引的上一個/下一個快照步驟索引
 */
export function getPrevSnapshotStep(
  log: ReplayLogEntry[],
  currentIndex: number,
): number {
  for (let i: number = currentIndex - 1; i >= 0; i -= 1) {
    if (log[i]?.stateSnapshot) return i;
  }
  return 0;
}

export function getNextSnapshotStep(
  log: ReplayLogEntry[],
  currentIndex: number,
): number {
  for (let i: number = currentIndex + 1; i < log.length; i += 1) {
    if (log[i]?.stateSnapshot) return i;
  }
  return log.length - 1;
}

// ========== 地產期貨 ==========

export function reserveProperty(state: GameState, cellId: number): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const logType = getPlayerLogType(playerIdx);

  if (newState.customRules?.enablePropertyFutures === false) {
    newState.logs.push(makeLog(logType, `預定失敗：地產期貨系統未開啟`));
    return newState;
  }

  const prop = newState.properties[cellId];
  if (prop) {
    newState.logs.push(makeLog(logType, `預定失敗：此地塊已有所有者`));
    return newState;
  }
  if (newState.propertyFutures?.[cellId]) {
    newState.logs.push(makeLog(logType, `預定失敗：此地塊已被預定`));
    return newState;
  }

  const basePrice = getCellPrice(cellId, newState.mode, newState.customRules, newState.boardCells);
  const deposit = Math.floor(basePrice * 0.1);

  if (player.money < deposit) {
    newState.logs.push(makeLog(logType, `預定失敗：定金不足（需 ${deposit} 元）`));
    return newState;
  }

  player.money = Math.max(0, player.money - deposit);
  if (!newState.propertyFutures) newState.propertyFutures = {};
  newState.propertyFutures[cellId] = {
    playerIndex: playerIdx,
    deposit,
    expiresTurn: newState.totalTurns + 1,
  };

  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIdx);

  newState.logs.push(makeLog(
    logType,
    `【貸款】 ${player.name} 支付 ${deposit} 元定金預定 ${getCellConfig(newState, cellId).name}`,
  ));

  newState.phase = "rolling";
  newState.currentPlayerIndex = getNextPlayer(newState, playerIdx);
  return handleRoundEnd(newState, playerIdx);
}

// ========== 期權交易 ==========

let optionIdCounter = 0;

export function proposeOption(
  state: GameState,
  type: OptionType,
  counterpartyIndex: number,
  cellIndex: number,
  strikePrice: number,
  premium: number,
): GameState {
  const newState = cloneState(state);
  const buyerIdx = newState.currentPlayerIndex;
  const buyer = newState.players[buyerIdx];
  const seller = newState.players[counterpartyIndex];
  const logType = getPlayerLogType(buyerIdx);

  if (newState.customRules?.enableOptionsTrading === false) {
    newState.logs.push(makeLog(logType, `期權失敗：期權交易系統未開啟`));
    return newState;
  }
  if (buyerIdx === counterpartyIndex) {
    newState.logs.push(makeLog(logType, `期權失敗：不能與自己簽約`));
    return newState;
  }
  const prop = newState.properties[cellIndex];
  if (!prop || prop.owner !== counterpartyIndex) {
    newState.logs.push(makeLog(logType, `期權失敗：目標地塊不屬於對方`));
    return newState;
  }
  if (buyer.money < premium) {
    newState.logs.push(makeLog(logType, `期權失敗：期權費不足`));
    return newState;
  }

  buyer.money = Math.max(0, buyer.money - premium);
  seller.money = seller.money + premium;

  if (newState.isCoopMode) {
    syncCoopMoneyFromPlayer(newState, buyerIdx);
    syncCoopMoneyFromPlayer(newState, counterpartyIndex);
  }

  if (!newState.optionContracts) newState.optionContracts = [];
  newState.optionContracts.push({
    id: ++optionIdCounter,
    type,
    buyerIndex: buyerIdx,
    sellerIndex: counterpartyIndex,
    cellIndex,
    strikePrice: Math.floor(strikePrice),
    premium: Math.floor(premium),
    expiresTurn: newState.totalTurns + 3,
    exercised: false,
  });

  newState.logs.push(makeLog(
    'trade',
    `【期權】 ${buyer.name} 向 ${seller.name} 簽訂${type === 'call' ? '看漲' : '看跌'}期權：${getCellConfig(newState, cellIndex).name}，行權價 ${strikePrice}，期權費 ${premium}`,
  ));

  return newState;
}

export function exerciseOption(state: GameState, optionId: number): GameState {
  const newState = cloneState(state);
  const contract = newState.optionContracts?.find((c: OptionContract) => c.id === optionId);
  if (!contract) return state;

  const buyer = newState.players[contract.buyerIndex];
  const seller = newState.players[contract.sellerIndex];
  const cell = getCellConfig(newState, contract.cellIndex);
  const prop = newState.properties[contract.cellIndex];

  if (!buyer || !seller || buyer.isBankrupt || seller.isBankrupt) return state;
  if (!prop || prop.owner !== contract.sellerIndex) return state;

  const currentPrice = getCellPrice(contract.cellIndex, newState.mode, newState.customRules, newState.boardCells);

  if (contract.type === 'call') {
    if (currentPrice <= contract.strikePrice) return state;
    const diff = currentPrice - contract.strikePrice;
    if (getCoopMoney(newState, contract.sellerIndex) >= diff) {
      subCoopMoney(newState, contract.sellerIndex, diff);
      addCoopMoney(newState, contract.buyerIndex, diff);
    } else {
      applyBankruptcyCheck(newState, contract.sellerIndex);
    }
    newState.logs.push(makeLog('trade', `【通膨】 ${buyer.name} 行使看漲期權：${cell.name}，${seller.name} 支付差價 ${diff} 元`));
  } else {
    if (currentPrice >= contract.strikePrice) return state;
    const diff = contract.strikePrice - currentPrice;
    if (getCoopMoney(newState, contract.sellerIndex) >= diff) {
      subCoopMoney(newState, contract.sellerIndex, diff);
      addCoopMoney(newState, contract.buyerIndex, diff);
    } else {
      applyBankruptcyCheck(newState, contract.sellerIndex);
    }
    newState.logs.push(makeLog('trade', `【期權】 ${buyer.name} 行使看跌期權：${cell.name}，${seller.name} 支付差價 ${diff} 元`));
  }

  contract.exercised = true;
  newState.optionContracts = newState.optionContracts?.filter((c: OptionContract) => c.id !== optionId);
  return newState;
}

// ========== 股票期貨期權 ==========

let stockDerivativeIdCounter = 0;

export function buyStockDerivative(
  state: GameState,
  playerIndex: number,
  kind: 'futures' | 'call' | 'put',
  symbol: StockSymbol,
  quantity: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);
  if (!player || player.isBankrupt) return newState;
  if (quantity <= 0) return newState;

  const currentPrice = getStockPrice(newState, symbol);
  let unitCost = 0;
  if (kind === 'futures') {
    unitCost = Math.floor(currentPrice * 0.1);
  } else {
    const vol = STOCKS[symbol]?.volatility === 'high' ? 0.2 : STOCKS[symbol]?.volatility === 'medium' ? 0.15 : 0.1;
    unitCost = Math.floor(currentPrice * vol);
  }
  const totalCost = unitCost * quantity;

  if (player.money < totalCost) {
    newState.logs.push(makeLog(logType, `交易失敗：現金不足（需 ${totalCost} 元）`));
    return newState;
  }

  player.money -= totalCost;
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);

  if (!newState.stockDerivatives) newState.stockDerivatives = [];
  newState.stockDerivatives.push({
    id: ++stockDerivativeIdCounter,
    kind,
    symbol,
    playerIndex,
    strikePrice: Math.floor(currentPrice),
    cost: totalCost,
    expiresTurn: newState.totalTurns + 3,
    settled: false,
    quantity,
  });

  const kindLabel = kind === 'futures' ? '期貨合約' : kind === 'call' ? '看漲期權' : '看跌期權';
  newState.logs.push(makeLog(
    logType,
    `買入 ${STOCKS[symbol]?.name ?? symbol} ${kindLabel} × ${quantity}，花費 ${totalCost} 元`,
  ));

  return newState;
}

export function settleStockDerivative(state: GameState, contractId: number): GameState {
  const newState = cloneState(state);
  const contract = newState.stockDerivatives?.find((c) => c.id === contractId);
  if (!contract || contract.settled) return state;

  const player = newState.players[contract.playerIndex];
  if (!player) return state;
  const logType = getPlayerLogType(contract.playerIndex);

  const currentPrice = getStockPrice(newState, contract.symbol);
  let payout = 0;
  const diffPerUnit = currentPrice - contract.strikePrice;

  if (contract.kind === 'futures') {
    payout = diffPerUnit * contract.quantity;
  } else if (contract.kind === 'call') {
    payout = Math.max(0, diffPerUnit) * contract.quantity;
  } else {
    payout = Math.max(0, -diffPerUnit) * contract.quantity;
  }

  const netPnl = payout - contract.cost;
  player.money = Math.max(0, player.money + payout);
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, contract.playerIndex);

  contract.settled = true;
  newState.stockDerivatives = newState.stockDerivatives?.filter((c) => c.id !== contractId) ?? [];

  const kindLabel = contract.kind === 'futures' ? '期貨' : contract.kind === 'call' ? '看漲期權' : '看跌期權';
  const pnlText = netPnl >= 0 ? `盈利 ${netPnl} 元` : `虧損 ${-netPnl} 元`;
  newState.logs.push(makeLog(
    logType,
    `結算 ${STOCKS[contract.symbol]?.name ?? contract.symbol} ${kindLabel}：${pnlText}`,
  ));

  if (player.money <= 0) applyBankruptcyCheck(newState, contract.playerIndex);
  return newState;
}

export function getStockDerivativePnl(state: GameState, contract: { kind: 'futures' | 'call' | 'put'; symbol: StockSymbol; strikePrice: number; cost: number; quantity: number }): number {
  const currentPrice = getStockPrice(state, contract.symbol);
  const diffPerUnit = currentPrice - contract.strikePrice;
  let payout = 0;
  if (contract.kind === 'futures') {
    payout = diffPerUnit * contract.quantity;
  } else if (contract.kind === 'call') {
    payout = Math.max(0, diffPerUnit) * contract.quantity;
  } else {
    payout = Math.max(0, -diffPerUnit) * contract.quantity;
  }
  return payout - contract.cost;
}

// ========== 戰爭系統 ==========

const WAR_COST = 500;
const WAR_DURATION = 5;

export function declareWar(state: GameState, targetIndex: number): GameState {
  const newState = cloneState(state);
  const attackerIdx = newState.currentPlayerIndex;
  const attacker = newState.players[attackerIdx];
  const defender = newState.players[targetIndex];
  const logType = getPlayerLogType(attackerIdx);

  if (newState.customRules?.enableWarSystem === false) {
    newState.logs.push(makeLog(logType, `宣戰失敗：戰爭系統未開啟`));
    return newState;
  }
  if (attackerIdx === targetIndex) {
    newState.logs.push(makeLog(logType, `宣戰失敗：不能向自己宣戰`));
    return newState;
  }
  if (!defender || defender.isBankrupt) {
    newState.logs.push(makeLog(logType, `宣戰失敗：目標玩家已破產`));
    return newState;
  }
  if (attacker.money < WAR_COST) {
    newState.logs.push(makeLog(logType, `宣戰失敗：資金不足（需 ${WAR_COST} 元）`));
    return newState;
  }
  if (newState.wars?.some((w: WarState) =>
    (w.attackerIndex === attackerIdx && w.defenderIndex === targetIndex) ||
    (w.attackerIndex === targetIndex && w.defenderIndex === attackerIdx)
  )) {
    newState.logs.push(makeLog(logType, `宣戰失敗：雙方已處於戰爭狀態`));
    return newState;
  }

  attacker.money = Math.max(0, attacker.money - WAR_COST);
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, attackerIdx);

  if (!newState.wars) newState.wars = [];
  newState.wars.push({
    attackerIndex: attackerIdx,
    defenderIndex: targetIndex,
    remainingTurns: WAR_DURATION,
  });

  newState.logs.push(makeLog(
    'war',
    `【戰爭】 ${attacker.name} 向 ${defender.name} 宣戰！戰爭持續 ${WAR_DURATION} 回合，雙方過路費翻倍`,
  ));

  return newState;
}

export function makePeace(state: GameState, targetIndex: number): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const target = newState.players[targetIndex];
  const logType = getPlayerLogType(playerIdx);

  if (!newState.wars || newState.wars.length === 0) {
    newState.logs.push(makeLog(logType, '停戰失敗：當前沒有戰爭'));
    return newState;
  }
  const warIndex = newState.wars.findIndex((w: WarState) =>
    (w.attackerIndex === playerIdx && w.defenderIndex === targetIndex) ||
    (w.attackerIndex === targetIndex && w.defenderIndex === playerIdx)
  );
  if (warIndex === -1) {
    newState.logs.push(makeLog(logType, '停戰失敗：與該玩家無戰爭狀態'));
    return newState;
  }
  newState.wars.splice(warIndex, 1);
  newState.logs.push(makeLog(
    'war',
    `【停戰】 ${player.name} 與 ${target.name} 達成停戰協議，過路費恢復正常`,
  ));
  return newState;
}

// ========== 間諜系統 ==========

const SPY_COST = 500;
const SPY_DURATION = 3;

export function sendSpy(state: GameState, targetIndex: number): GameState {
  const newState = cloneState(state);
  const spyIdx = newState.currentPlayerIndex;
  const spy = newState.players[spyIdx];
  const target = newState.players[targetIndex];
  const logType = getPlayerLogType(spyIdx);

  if (newState.customRules?.enableSpySystem === false) {
    newState.logs.push(makeLog(logType, `間諜失敗：間諜系統未開啟`));
    return newState;
  }
  if (spyIdx === targetIndex) {
    newState.logs.push(makeLog(logType, `間諜失敗：不能向自己派出間諜`));
    return newState;
  }
  if (!target || target.isBankrupt) {
    newState.logs.push(makeLog(logType, `間諜失敗：目標玩家已破產`));
    return newState;
  }
  if (spy.money < SPY_COST) {
    newState.logs.push(makeLog(logType, `間諜失敗：資金不足（需 ${SPY_COST} 元）`));
    return newState;
  }
  if (newState.spies?.some((s: SpyState) => s.spyIndex === spyIdx && s.targetIndex === targetIndex)) {
    newState.logs.push(makeLog(logType, `間諜失敗：已對該玩家派出間諜`));
    return newState;
  }

  spy.money = Math.max(0, spy.money - SPY_COST);
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, spyIdx);

  if (!newState.spies) newState.spies = [];
  newState.spies.push({
    spyIndex: spyIdx,
    targetIndex,
    remainingTurns: SPY_DURATION,
  });

  newState.logs.push(makeLog(
    'spy',
    `【間諜】 ${spy.name} 向 ${target.name} 派出間諜，持續 ${SPY_DURATION} 回合`,
  ));

  return newState;
}

export function gatherIntel(state: GameState, targetIndex: number): {
  money: number;
  propertyCount: number;
  itemCount: number;
} | null {
  const spyIdx = state.currentPlayerIndex;
  const spy = state.players[spyIdx];
  const target = state.players[targetIndex];
  if (!spy || !target) return null;
  const activeSpy = state.spies?.find((s: SpyState) =>
    s.spyIndex === spyIdx && s.targetIndex === targetIndex && s.remainingTurns <= 2
  );
  if (!activeSpy) return null;
  const propertyCount = Object.values(state.properties).filter(
    (p: { owner?: number | null }) => p.owner === targetIndex
  ).length;
  let itemCount = 0;
  const inv = (target as any).inventory;
  if (inv && typeof inv === 'object' && inv.items && typeof inv.items === 'object') {
    itemCount = (Object.values(inv.items) as number[]).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
  }
  return {
    money: target.money,
    propertyCount,
    itemCount,
  };
}

const COUNTER_SPY_COST = 300;

export function counterSpy(state: GameState): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const logType = getPlayerLogType(playerIdx);

  if (!newState.spies || newState.spies.length === 0) {
    newState.logs.push(makeLog(logType, '反間諜失敗：沒有發現間諜'));
    return newState;
  }
  const targetedBy = newState.spies.filter((s: SpyState) => s.targetIndex === playerIdx);
  if (targetedBy.length === 0) {
    newState.logs.push(makeLog(logType, '反間諜失敗：沒有針對你的間諜'));
    return newState;
  }
  if (player.money < COUNTER_SPY_COST) {
    newState.logs.push(makeLog(logType, `反間諜失敗：資金不足（需 ${COUNTER_SPY_COST} 元）`));
    return newState;
  }
  player.money = Math.max(0, player.money - COUNTER_SPY_COST);
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIdx);
  newState.spies = newState.spies.filter((s: SpyState) => s.targetIndex !== playerIdx);
  newState.logs.push(makeLog(
    'spy',
    `【護盾】 ${player.name} 發動反間諜，清除了 ${targetedBy.length} 名敵方間諜`,
  ));
  return newState;
}

// ========== 機器人代打 ==========

const ROBOT_COST = 2000;
const ROBOT_DURATION = 3;

export function hireRobotProxy(state: GameState): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const logType = getPlayerLogType(playerIdx);

  if (newState.customRules?.enableRobotProxy === false) {
    newState.logs.push(makeLog(logType, `代打失敗：機器人代打系統未開啟`));
    return newState;
  }
  if (player.money < ROBOT_COST) {
    newState.logs.push(makeLog(logType, `代打失敗：資金不足（需 ${ROBOT_COST} 元）`));
    return newState;
  }
  if (newState.robotProxy?.[playerIdx]) {
    newState.logs.push(makeLog(logType, `代打失敗：AI 代打服務已在進行中`));
    return newState;
  }

  player.money = Math.max(0, player.money - ROBOT_COST);
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIdx);

  if (!newState.robotProxy) newState.robotProxy = {};
  newState.robotProxy[playerIdx] = ROBOT_DURATION;

  newState.logs.push(makeLog(
    'robot',
    `【AI代打】 ${player.name} 僱傭 AI 代打，持續 ${ROBOT_DURATION} 回合`,
  ));

  return newState;
}

export function isPlayerRobotActive(state: GameState, playerIndex: number): boolean {
  return (state.robotProxy?.[playerIndex] ?? 0) > 0;
}

export function cancelRobotProxy(state: GameState): GameState {
  const newState = cloneState(state);
  const playerIdx = newState.currentPlayerIndex;
  const player = newState.players[playerIdx];
  const logType = getPlayerLogType(playerIdx);
  if (!newState.robotProxy?.[playerIdx]) {
    newState.logs.push(makeLog(logType, '收回控制失敗：當前沒有 AI 代打'));
    return newState;
  }
  delete newState.robotProxy[playerIdx];
  newState.logs.push(makeLog(
    'robot',
    `【小遊戲】 ${player.name} 收回控制權，AI 代打結束`,
  ));
  return newState;
}

// ========== 時間旅行系統 ==========

const TIME_TRAVEL_SNAPSHOT_KEY = 'timeTravelSnapshots';

export function saveTimeTravelSnapshot(state: GameState, playerIndex: number): GameState {
  if (state.customRules?.enableTimeTravel === false) return state;
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  if (!newState.timeTravelSnapshots) newState.timeTravelSnapshots = {};
  newState.timeTravelSnapshots[playerIndex] = {
    position: player.position,
    money: player.money,
    turn: newState.totalTurns,
  };
  return newState;
}

export function useTimeTravel(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  if (newState.customRules?.enableTimeTravel === false) {
    newState.logs.push(makeLog('time_travel', '【錯誤】 時間旅行功能未開啟'));
    return newState;
  }
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  if (player.timeTravelUsed) {
    newState.logs.push(makeLog('time_travel', '【錯誤】 每局限用1次時間旅行'));
    return newState;
  }
  const snapshot = newState.timeTravelSnapshots?.[playerIndex];
  if (!snapshot) {
    newState.logs.push(makeLog('time_travel', '【錯誤】 尚無時間旅行快照'));
    return newState;
  }
  player.position = snapshot.position;
  player.money = snapshot.money;
  player.timeTravelUsed = true;
  newState.logs.push(makeLog(
    'time_travel',
    `【漩渦】 ${player.name} 使用時間旅行，回到第 ${snapshot.turn} 回合的狀態（位置與金錢回滾，地產保留）`,
  ));
  updatePlayerAssets(newState);
  return newState;
}

// ========== 平行世界系統 ==========

const PARALLEL_DURATION = 3;

export function triggerParallelWorld(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  if (newState.customRules?.enableParallelWorld === false) return newState;
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  if (newState.parallelWorld?.active) return newState;

  const parallelCells: Record<number, ParallelCellState> = {};
  const seed = Date.now() + playerIndex;
  let seedVal = seed;
  const rand = (): number => {
    seedVal = (seedVal * 9301 + 49297) % 233280;
    return seedVal / 233280;
  };

  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = getCellConfig(newState, i);
    if (cell.type === 'property') {
      const basePrice = getCellPrice(i, newState.mode, newState.customRules, newState.boardCells);
      const priceMult = 0.6 + rand() * 0.8;
      const price = Math.floor(basePrice * priceMult);
      const ownerRand = rand();
      let owner = -1;
      if (ownerRand < 0.3) {
        owner = playerIndex;
      } else if (ownerRand < 0.5) {
        const others = newState.players
          .map((_p: PlayerState, idx: number) => idx)
          .filter((idx: number) => idx !== playerIndex && !newState.players[idx].isBankrupt);
        if (others.length > 0) {
          owner = others[Math.floor(rand() * others.length)];
        }
      }
      parallelCells[i] = { owner, price, ownedByAffectedPlayer: owner === playerIndex };
    }
  }

  newState.parallelWorld = {
    active: true,
    affectedPlayerIndex: playerIndex,
    remainingTurns: PARALLEL_DURATION,
    parallelCells,
    originalPosition: player.position,
  };

  newState.logs.push(makeLog(
    'parallel',
    `【平行世界】 ${player.name} 被傳送到平行世界！持續 ${PARALLEL_DURATION} 回合`,
  ));
  return newState;
}

export function isPlayerInParallelWorld(state: GameState, playerIndex: number): boolean {
  return state.parallelWorld?.active === true
    && state.parallelWorld.affectedPlayerIndex === playerIndex;
}

export function getParallelCellState(state: GameState, cellId: number): ParallelCellState | null {
  if (!state.parallelWorld?.active) return null;
  return state.parallelWorld.parallelCells[cellId] ?? null;
}

// ========== 卡牌連鎖系統 ==========

function getCardStreakType(effect: CardEffect): CardStreakType {
  if (effect.type === 'money') {
    return effect.amount > 0 ? 'gain' : effect.amount < 0 ? 'lose' : 'neutral';
  }
  if (effect.type === 'give_money' || effect.type === 'lucky_star' || effect.type === 'collect_from_all') {
    return 'gain';
  }
  if (effect.type === 'steal_money' || effect.type === 'repair_fee' || effect.type === 'pay_to_all') {
    return 'lose';
  }
  return 'neutral';
}

export function updateCardCombo(
  state: GameState,
  playerIndex: number,
  effect: CardEffect,
): { comboTriggered: string | null; modifiedAmount?: number } {
  if (state.customRules?.enableCardCombo === false) return { comboTriggered: null };
  const newState = state;
  if (!newState.cardCombo) newState.cardCombo = {};
  if (!newState.cardCombo[playerIndex]) {
    newState.cardCombo[playerIndex] = {
      lastCardType: null,
      streak: 0,
      streakType: null,
      badLuckInsurance: false,
      freeNextDraw: false,
    };
  }
  const combo = newState.cardCombo[playerIndex];
  const cardType = getCardStreakType(effect);
  let comboTriggered: string | null = null;

  if (cardType === combo.streakType && cardType !== 'neutral') {
    combo.streak += 1;
  } else if (cardType !== 'neutral') {
    combo.streak = 1;
    combo.streakType = cardType;
  } else {
    combo.streak = 0;
    combo.streakType = null;
  }
  combo.lastCardType = cardType;

  if (combo.streak >= 2 && combo.streakType === 'gain') {
    comboTriggered = 'lucky_star';
    combo.streak = 0;
  } else if (combo.streak >= 2 && combo.streakType === 'lose') {
    comboTriggered = 'bad_luck_insurance';
    combo.badLuckInsurance = true;
    combo.streak = 0;
  } else if (combo.streak >= 3) {
    comboTriggered = 'fate_resonance';
    combo.freeNextDraw = true;
    combo.streak = 0;
  }

  return { comboTriggered };
}

export function applyCardComboEffect(
  state: GameState,
  playerIndex: number,
  comboType: string,
): void {
  const player = state.players[playerIndex];
  if (!player) return;
  switch (comboType) {
    case 'lucky_star': {
      player.money += 500;
      state.logs.push(makeLog('combo', `【星】 幸運星！${player.name} 連續獲益，額外獲得 500 元`));
      break;
    }
    case 'bad_luck_insurance': {
      state.logs.push(makeLog('combo', `【護盾】 厄運保險啟動！${player.name} 下次損失卡牌金額減半`));
      break;
    }
    case 'fate_resonance': {
      state.logs.push(makeLog('combo', `【共鳴】 命運共鳴！${player.name} 下次抽卡免費`));
      break;
    }
  }
}

export function consumeBadLuckInsurance(state: GameState, playerIndex: number): boolean {
  if (!state.cardCombo?.[playerIndex]?.badLuckInsurance) return false;
  state.cardCombo[playerIndex].badLuckInsurance = false;
  return true;
}

export function hasFreeNextDraw(state: GameState, playerIndex: number): boolean {
  return state.cardCombo?.[playerIndex]?.freeNextDraw ?? false;
}

export function consumeFreeNextDraw(state: GameState, playerIndex: number): void {
  if (state.cardCombo?.[playerIndex]) {
    state.cardCombo[playerIndex].freeNextDraw = false;
  }
}

// ========== 地產進化系統 ==========

const EVOLUTION_COST = 3; // 每次進化需要的建材數量
const EVOLUTION_TOLL_MULTIPLIER = 1.5; // 每級 +50% 過路費

export function getEvolutionTollMultiplier(prop?: PropertyState): number {
  const level = prop?.evolutionLevel ?? 0;
  return Math.pow(EVOLUTION_TOLL_MULTIPLIER, level);
}

export function evolveProperty(
  state: GameState,
  playerIndex: number,
  cellId: number,
): GameState {
  const newState = cloneState(state);
  if (newState.customRules?.enablePropertyEvolution === false) return newState;
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  const prop = newState.properties[cellId];
  if (!prop || prop.owner !== playerIndex) {
    newState.logs.push(makeLog('evolution', '【錯誤】 不擁有此地塊，無法進化'));
    return newState;
  }
  const currentLevel = prop.evolutionLevel ?? 0;
  if (currentLevel >= 2) {
    newState.logs.push(makeLog('evolution', '【錯誤】 地塊已達最高進化等級'));
    return newState;
  }
  const materials = newState.buildingMaterials?.[playerIndex] ?? 0;
  if (materials < EVOLUTION_COST) {
    newState.logs.push(makeLog('evolution', `【錯誤】 建材不足（需要 ${EVOLUTION_COST}，當前 ${materials}）`));
    return newState;
  }
  if (!newState.buildingMaterials) newState.buildingMaterials = {};
  newState.buildingMaterials[playerIndex] = materials - EVOLUTION_COST;
  prop.evolutionLevel = (currentLevel + 1) as EvolutionLevel;
  const levelNames = ['住宅', '商業大樓', '地標'];
  newState.logs.push(makeLog(
    'evolution',
    `【進化】 ${player.name} 將 ${getCellConfig(newState, cellId).name} 進化為 ${levelNames[currentLevel + 1]}！過路費 +50%`,
  ));
  updatePlayerAssets(newState);
  return newState;
}

export function addBuildingMaterials(
  state: GameState,
  playerIndex: number,
  amount: number,
): GameState {
  const newState = cloneState(state);
  if (!newState.buildingMaterials) newState.buildingMaterials = {};
  const current = newState.buildingMaterials[playerIndex] ?? 0;
  newState.buildingMaterials[playerIndex] = current + amount;
  return newState;
}

export function getPlayerBuildingMaterials(state: GameState, playerIndex: number): number {
  return state.buildingMaterials?.[playerIndex] ?? 0;
}

// ========== 坐騎系統 ==========

const MOUNT_FLYER_USES = 3;
const MOUNT_DIVER_USES = 3;
const MOUNT_ROCKET_USES = 3;

export function unlockMount(state: GameState, playerIndex: number, mountType: MountType): GameState {
  const newState = cloneState(state);
  if (newState.customRules?.enableMountSystem === false) return newState;
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  if (!player.mounts) {
    player.mounts = { flyerUses: 0, diverUses: 0, rocketUses: 0 };
  }
  switch (mountType) {
    case 'flyer':
      player.mounts.flyerUses = MOUNT_FLYER_USES;
      break;
    case 'diver':
      player.mounts.diverUses = MOUNT_DIVER_USES;
      break;
    case 'rocket':
      player.mounts.rocketUses = MOUNT_ROCKET_USES;
      break;
  }
  const names: Record<MountType, string> = { flyer: '飛行器', diver: '潛水器', rocket: '火箭' };
  newState.logs.push(makeLog(
    'mount',
    `【坐騎】 ${player.name} 解鎖坐騎：${names[mountType]}（可使用 ${MOUNT_FLYER_USES} 次）`,
  ));
  return newState;
}

export function useFlyerMount(state: GameState, playerIndex: number, skipCellId: number): GameState {
  const newState = cloneState(state);
  if (newState.customRules?.enableMountSystem === false) return newState;
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  if (!player.mounts || player.mounts.flyerUses <= 0) {
    newState.logs.push(makeLog('mount', '【錯誤】 飛行器使用次數已用盡'));
    return newState;
  }
  const prop = newState.properties[skipCellId];
  const owner = prop?.owner ?? newState.ownedProperties[skipCellId];
  if (owner === undefined || owner === playerIndex) {
    newState.logs.push(makeLog('mount', '【錯誤】 只能跳過對方擁有的地塊'));
    return newState;
  }
  player.mounts.flyerUses -= 1;
  newState.logs.push(makeLog(
    'mount',
    `【飛行器】 ${player.name} 使用飛行器跳過 ${getCellConfig(newState, skipCellId).name}`,
  ));
  return newState;
}

export function useDiverMount(state: GameState, playerIndex: number): boolean {
  const player = state.players[playerIndex];
  if (!player?.mounts || player.mounts.diverUses <= 0) return false;
  player.mounts.diverUses -= 1;
  return true;
}

export function useRocketMount(state: GameState, playerIndex: number): number {
  const newState = state;
  const player = newState.players[playerIndex];
  if (!player?.mounts || player.mounts.rocketUses <= 0) return 0;
  player.mounts.rocketUses -= 1;
  const steps = 5 + Math.floor(Math.random() * 8); // 5-12
  newState.logs.push(makeLog(
    'mount',
    `【火箭】 ${player.name} 使用火箭，隨機移動 ${steps} 格`,
  ));
  return steps;
}

export function getPlayerMounts(state: GameState, playerIndex: number): MountState | null {
  return state.players[playerIndex]?.mounts ?? null;
}

// ========== 寵物系統 ==========

export function tryObtainPet(state: GameState, playerIndex: number): PetType | null {
  const player = state.players[playerIndex];
  if (!player || Math.random() > 0.2) return null;
  const petTypes: PetType[] = ['mechDog', 'ufo', 'dragon'];
  const weights = [0.6, 0.3, 0.1];
  const roll = Math.random();
  let cumulative = 0;
  let chosen: PetType = 'mechDog';
  for (let i = 0; i < petTypes.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) {
      chosen = petTypes[i];
      break;
    }
  }
  player.equippedPet = chosen;
  state.logs.push(makeLog('pet', `【寵物】 ${player.name} 獲得寵物：${PETS[chosen].name}`));
  if (state.codexUnlocked && !state.codexUnlocked.pets.includes(chosen)) {
    state.codexUnlocked.pets.push(chosen);
  }
  return chosen;
}

export function getPetTollMultiplier(player: PlayerState): number {
  if (player.equippedPet === 'mechDog') return 1.05;
  return 1;
}

export function getPetMoveBonus(player: PlayerState): number {
  if (player.equippedPet === 'ufo') return 1;
  return 0;
}

export function getPetCardLuckBonus(player: PlayerState): number {
  if (player.equippedPet === 'dragon') return 0.1;
  return 0;
}

export function equipPet(state: GameState, playerIndex: number, petType: PetType): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  if (!player || player.isBankrupt) return newState;
  if (newState.customRules?.enablePetSystem === false) return newState;
  const logType = getPlayerLogType(playerIndex);
  player.equippedPet = petType;
  if (newState.codexUnlocked && !newState.codexUnlocked.pets.includes(petType)) {
    newState.codexUnlocked.pets.push(petType);
  }
  newState.logs.push(makeLog(
    'pet',
    `【寵物】 ${player.name} 更換攜帶寵物為 ${PETS[petType].name}`,
  ));
  return newState;
}

const PET_UPGRADE_COST = 5000;

export function upgradePet(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);
  if (!player || player.isBankrupt) return newState;
  if (newState.customRules?.enablePetSystem === false) return newState;
  if (!player.equippedPet) {
    newState.logs.push(makeLog(logType, '升級失敗：未攜帶寵物'));
    return newState;
  }
  if (player.money < PET_UPGRADE_COST) {
    newState.logs.push(makeLog(logType, `升級失敗：資金不足（需 ${PET_UPGRADE_COST} 元）`));
    return newState;
  }
  player.money = Math.max(0, player.money - PET_UPGRADE_COST);
  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);
  const petName = PETS[player.equippedPet].name;
  newState.logs.push(makeLog(
    'pet',
    `⬆️ ${player.name} 將 ${petName} 升級，被動效果增強`,
  ));
  return newState;
}

// ========== 稱號效果 ==========

export function getTitleBuyDiscount(titleId: TitleId | null | undefined): number {
  if (titleId === 'property_newbie') return 0.05;
  if (titleId === 'real_estate_god') return 0.1;
  return 0;
}

export function getTitleTollMultiplier(titleId: TitleId | null | undefined): number {
  if (titleId === 'undefeated') return 1.1;
  return 1;
}

export function getTitleBuildDiscount(titleId: TitleId | null | undefined): number {
  if (titleId === 'real_estate_god') return 0.2;
  return 0;
}

export function getTitleBankInterestBonus(titleId: TitleId | null | undefined): number {
  if (titleId === 'billionaire') return 0.01;
  return 0;
}

// ========== 皮膚升級 ==========

export function addSkinFragments(state: GameState, playerIndex: number, amount: number): void {
  const player = state.players[playerIndex];
  if (!player) return;
  player.skinFragments = (player.skinFragments ?? 0) + amount;
  state.logs.push(makeLog('item', `【寧靜】 獲得 ${amount} 個皮膚碎片`));
}

// ========== 收藏圖鑑 ==========

export function unlockCodexProperty(state: GameState, cellId: number): void {
  if (!state.codexUnlocked) return;
  if (!state.codexUnlocked.properties.includes(cellId)) {
    state.codexUnlocked.properties.push(cellId);
  }
}

export function unlockCodexCard(state: GameState, cardId: string): void {
  if (!state.codexUnlocked) return;
  if (!state.codexUnlocked.cards.includes(cardId)) {
    state.codexUnlocked.cards.push(cardId);
  }
}

export function unlockCodexItem(state: GameState, itemType: string): void {
  if (!state.codexUnlocked) return;
  if (!state.codexUnlocked.items.includes(itemType)) {
    state.codexUnlocked.items.push(itemType);
  }
}

export function unlockCodexPet(state: GameState, petType: string): void {
  if (!state.codexUnlocked) return;
  if (!state.codexUnlocked.pets.includes(petType)) {
    state.codexUnlocked.pets.push(petType);
  }
}

export function unlockCodexMount(state: GameState, mountType: string): void {
  if (!state.codexUnlocked) return;
  if (!state.codexUnlocked.mounts.includes(mountType)) {
    state.codexUnlocked.mounts.push(mountType);
  }
}

export function getCodexProgress(state: GameState): { properties: number; cards: number; items: number; pets: number; mounts: number; total: number } {
  const u = state.codexUnlocked ?? { properties: [], cards: [], items: [], pets: [], mounts: [] };
  return {
    properties: u.properties.length,
    cards: u.cards.length,
    items: u.items.length,
    pets: u.pets.length,
    mounts: u.mounts.length,
    total: u.properties.length + u.cards.length + u.items.length + u.pets.length + u.mounts.length,
  };
}


// ========== 資源爭奪：資源兌換 ==========

export type ResourceExchangeType = "cash" | "toll_discount" | "buy_discount";

export const RESOURCE_EXCHANGE_CONFIG: Record<ResourceExchangeType, { cost: number; label: string }> = {
  cash: { cost: 5, label: "兌換現金 +2000" },
  toll_discount: { cost: 8, label: "下次過路費減免 50%" },
  buy_discount: { cost: 10, label: "下次買地折扣 30%" },
};

export function exchangeResource(
  state: GameState,
  playerIndex: number,
  exchangeType: ResourceExchangeType,
): GameState {
  const newState = cloneState(state);
  if (!newState.resourceMode) return newState;
  const player = newState.players[playerIndex];
  if (!player) return newState;
  const logType = getPlayerLogType(playerIndex);
  const cost = RESOURCE_EXCHANGE_CONFIG[exchangeType].cost;

  if ((player.resources ?? 0) < cost) {
    newState.logs.push(makeLog(logType, `資源不足，需要 ${cost} 個數據資源`));
    return newState;
  }

  player.resources = (player.resources ?? 0) - cost;

  switch (exchangeType) {
    case "cash":
      player.money += 2000;
      newState.logs.push(makeLog(logType, `【資源】 ${player.name} 兌換了 2000 元現金（消耗 ${cost} 資源）`));
      break;
    case "toll_discount":
      player.nextTollDiscount = 0.5;
      newState.logs.push(makeLog(logType, `【資源】 ${player.name} 獲得下次過路費減免 50%（消耗 ${cost} 資源）`));
      break;
    case "buy_discount":
      player.nextBuyDiscountResource = 0.3;
      newState.logs.push(makeLog(logType, `�� ${player.name} 獲得下次買地 7 折優惠（消耗 ${cost} 資源）`));
      break;
  }

  return newState;
}

// ========== 暗網交易 ==========

export function proposeDarknetTrade(
  state: GameState,
  fromPlayer: number,
  toPlayer: number,
  offerData: {
    givenProperties: number[];
    receivedProperties: number[];
    moneyAmount: number;
  },
): GameState {
  if (!state.darknetMode) return state;
  const feeRate = state.darknetMode.feeRate;
  const newOffer = { ...offerData };

  if (offerData.moneyAmount > 0) {
    const fee = Math.floor(offerData.moneyAmount * feeRate);
    newOffer.moneyAmount = offerData.moneyAmount + fee;
  } else if (offerData.moneyAmount < 0) {
    const fee = Math.floor(Math.abs(offerData.moneyAmount) * feeRate);
    newOffer.moneyAmount = offerData.moneyAmount - fee;
  }

  const result = proposeTrade(state, fromPlayer, toPlayer, newOffer);
  const lastLogIdx = result.logs.length - 1;
  if (offerData.moneyAmount !== 0) {
    const fee = Math.floor(Math.abs(offerData.moneyAmount) * feeRate);
    result.logs.splice(
      Math.max(0, lastLogIdx),
      0,
      makeLog(getPlayerLogType(fromPlayer), `【暗網】 暗網中介抽成 ${fee} 元`),
    );
  }
  return result;
}

// ========== 駭客：入侵系統 ==========

export function hackProperty(
  state: GameState,
  playerIndex: number,
  targetCellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (player.profession !== "cyber_hacker") {
    newState.logs.push(makeLog(logType, `入侵失敗：非駭客職業`));
    return newState;
  }

  const remaining = player.hackUsesRemaining ?? 3;
  if (remaining <= 0) {
    newState.logs.push(makeLog(logType, `入侵失敗：次數已用盡`));
    return newState;
  }

  const prop = newState.properties[targetCellId];
  if (!prop || prop.isMortgaged) {
    newState.logs.push(makeLog(logType, `入侵失敗：目標地產不存在或已抵押`));
    return newState;
  }
  if (prop.owner === playerIndex) {
    newState.logs.push(makeLog(logType, `入侵失敗：不能入侵自己的地產`));
    return newState;
  }

  const duration = 3;
  prop.hackedUntilTurn = newState.totalTurns + duration;
  prop.hackedByPlayer = playerIndex;
  player.hackUsesRemaining = remaining - 1;

  const cell = getCellConfig(newState, targetCellId);
  const ownerName = newState.players[prop.owner]?.name ?? "未知";
  newState.logs.push(
    makeLog(
      logType,
      `【駭客】 【駭客】${player.name} 入侵了 ${ownerName} 的 ${cell.name}，過路費減半 ${duration} 回合（剩餘 ${player.hackUsesRemaining} 次）`,
    ),
  );

  return newState;
}

// ========== 量子物理學家：量子跳躍 ==========

export function quantumJump(
  state: GameState,
  playerIndex: number,
  targetCellId: number,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (player.profession !== "quantum_physicist") {
    newState.logs.push(makeLog(logType, `跳躍失敗：非量子物理學家`));
    return newState;
  }

  const lastTurn = player.lastQuantumJumpTurn ?? -100;
  const cooldown = 5;
  if (newState.totalTurns - lastTurn < cooldown) {
    const remaining = cooldown - (newState.totalTurns - lastTurn);
    newState.logs.push(makeLog(logType, `跳躍失敗：冷卻中（剩餘 ${remaining} 回合）`));
    return newState;
  }

  if (targetCellId < 0 || targetCellId >= CELL_COUNT) {
    newState.logs.push(makeLog(logType, `跳躍失敗：無效目標`));
    return newState;
  }

  player.lastQuantumJumpTurn = newState.totalTurns;
  const oldPosition = player.position;
  player.position = targetCellId;
  const cell = getCellConfig(newState, targetCellId);
  newState.logs.push(
    makeLog(
      logType,
      `【量子跳躍】 【量子跳躍】${player.name} 從 ${CELLS[oldPosition].name} 跳躍到 ${cell.name}`,
    ),
  );

  // 落地觸發對應事件
  const afterLanding = applyCellLanding(newState);
  return afterLanding;
}

// ========== 黑市商人：出售道具給玩家 ==========

export function sellItemToPlayer(
  state: GameState,
  sellerIndex: number,
  buyerIndex: number,
  itemId: number,
  price: number,
): GameState {
  const newState = cloneState(state);
  const seller = newState.players[sellerIndex];
  const buyer = newState.players[buyerIndex];
  const logType = getPlayerLogType(sellerIndex);

  if (seller.profession !== "black_market_dealer") {
    newState.logs.push(makeLog(logType, `出售失敗：非黑市商人`));
    return newState;
  }
  if (sellerIndex === buyerIndex) {
    newState.logs.push(makeLog(logType, `出售失敗：不能賣給自己`));
    return newState;
  }
  if (buyer.isBankrupt) {
    newState.logs.push(makeLog(logType, `出售失敗：對方已破產`));
    return newState;
  }
  const sellCount = seller.itemSellCount ?? 0;
  const maxSells = 3;
  if (sellCount >= maxSells) {
    newState.logs.push(makeLog(logType, `出售失敗：本局限額已用盡（${maxSells}次）`));
    return newState;
  }
  if (price < 0 || price > 5000) {
    newState.logs.push(makeLog(logType, `出售失敗：價格不合理`));
    return newState;
  }

  const sellerItems = seller.items;
  const itemIdx = sellerItems.findIndex((it: ItemState) => it.id === itemId);
  if (itemIdx === -1) {
    newState.logs.push(makeLog(logType, `出售失敗：沒有這個道具`));
    return newState;
  }
  if (buyer.money < price) {
    newState.logs.push(makeLog(logType, `出售失敗：對方金錢不足`));
    return newState;
  }

  const buyerItems = buyer.items;
  const itemType = sellerItems[itemIdx].type;
  const sameTypeCount = buyerItems.filter((it: ItemState) => it.type === itemType).length;
  if (sameTypeCount >= MAX_ITEMS) {
    newState.logs.push(makeLog(logType, `出售失敗：對方 ${ITEMS[itemType].name} 已達上限`));
    return newState;
  }

  // 轉移道具與金錢
  const [item] = sellerItems.splice(itemIdx, 1);
  buyerItems.push(item);
  buyer.money -= price;
  seller.money += price;
  seller.itemSellCount = sellCount + 1;

  newState.logs.push(
    makeLog(
      logType,
      `【商店】 【黑市】${seller.name} 將 ${ITEMS[itemType].name} 賣給 ${buyer.name}，成交價 ${price} 元（剩餘 ${maxSells - sellCount - 1} 次）`,
    ),
  );

  updatePlayerAssets(newState);
  return newState;
}

// ========== 賽博改造人：機械強化（擲骰微調） ==========

export function adjustDiceResult(
  state: GameState,
  playerIndex: number,
  delta: 1 | -1,
): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (player.profession !== "cyberborg") {
    newState.logs.push(makeLog(logType, `強化失敗：非賽博改造人`));
    return newState;
  }
  if (player.diceAdjustedThisTurn) {
    newState.logs.push(makeLog(logType, `強化失敗：本回合已用過`));
    return newState;
  }
  if (newState.phase !== "rolling") {
    newState.logs.push(makeLog(logType, `強化失敗：僅擲骰後可使用`));
    return newState;
  }

  const [d1, d2] = newState.diceValues;
  if (d1 + d2 + delta < 2 || d1 + d2 + delta > 12) {
    newState.logs.push(makeLog(logType, `強化失敗：調整後點數超出範圍`));
    return newState;
  }

  // 調整 d1（第一顆骰子）
  const newD1 = Math.max(1, Math.min(6, d1 + delta));
  const newSum = newD1 + d2;
  newState.diceValues = [newD1, d2];
  player.lastDiceValues = [newD1, d2];
  player.diceAdjustedThisTurn = true;

  newState.logs.push(
    makeLog(
      logType,
      `【機械強化】 【機械強化】${player.name} 微調擲骰結果：${d1}+${d2} → ${newD1}+${d2} = ${newSum}`,
    ),
  );

  return newState;
}

// ========== 數據牧師：獻祭 ==========

export function priestSacrifice(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (player.profession !== "data_priest") {
    newState.logs.push(makeLog(logType, `獻祭失敗：非數據牧師職業`));
    return newState;
  }
  if (player.priestSacrificeUsed) {
    newState.logs.push(makeLog(logType, `獻祭失敗：本局已用過`));
    return newState;
  }
  if (player.money <= 0) {
    newState.logs.push(makeLog(logType, `獻祭失敗：沒有足夠現金`));
    return newState;
  }

  const cost = Math.round(player.money * 0.2);
  player.money -= cost;
  player.priestSacrificeUsed = true;

  const buffRoll = Math.random();
  let buffName = "";
  let buffDesc = "";
  if (buffRoll < 0.34) {
    player.tollBoostThisTurn = (player.tollBoostThisTurn ?? 0) + 1.0;
    buffName = "過路費翻倍";
    buffDesc = "本回合過路費 +100%";
  } else if (buffRoll < 0.67) {
    player.negativeImmunityShield = true;
    buffName = "負面免疫";
    buffDesc = "免疫下一次負面效果";
  } else {
    player.luckyDiceActive = true;
    // 標記為必出 7（用特殊狀態表示，擲骰階段檢查）
    player.sacrificeLuckySeven = true;
    buffName = "神聖擲骰";
    buffDesc = "下次擲骰必出 7";
  }

  newState.logs.push(
    makeLog(
      logType,
      `【數據牧師】${player.name} 獻祭了 ${cost} 元，獲得：${buffName}（${buffDesc}）`,
    ),
  );

  if (newState.isCoopMode) syncCoopMoneyFromPlayer(newState, playerIndex);
  return newState;
}

// ========== 時間守望者：額外回合 ==========

export function timeWatcherExtraTurn(state: GameState, playerIndex: number): GameState {
  const newState = cloneState(state);
  const player = newState.players[playerIndex];
  const logType = getPlayerLogType(playerIndex);

  if (player.profession !== "time_watcher") {
    newState.logs.push(makeLog(logType, `時間回溯失敗：非時間守望者職業`));
    return newState;
  }
  if (player.timeWatcherExtraTurnUsed) {
    newState.logs.push(makeLog(logType, `時間回溯失敗：本局已用過`));
    return newState;
  }
  if (state.phase !== "rolling" || state.currentPlayerIndex !== playerIndex) {
    newState.logs.push(makeLog(logType, `時間回溯失敗：僅限自己回合開始時使用`));
    return newState;
  }

  player.timeWatcherExtraTurnUsed = true;
  player.extraTurnActive = true;

  newState.logs.push(
    makeLog(
      logType,
      `【時間守望者】${player.name} 發動時間回溯，獲得一個額外回合！`,
    ),
  );

  return newState;
}

// ========== 工具：獲取玩家可用的主動職業技能 ==========

export function getAvailableProfessionSkills(state: GameState, playerIndex: number): Array<{
  id: string;
  name: string;
  description: string;
  ready: boolean;
  cooldownText?: string;
}> {
  const player = state.players[playerIndex];
  if (!player || !player.profession) return [];
  const result: Array<{
    id: string;
    name: string;
    description: string;
    ready: boolean;
    cooldownText?: string;
  }> = [];

  switch (player.profession) {
    case "cyber_hacker": {
      const remaining = player.hackUsesRemaining ?? 3;
      result.push({
        id: "hack_property",
        name: "入侵系統",
        description: "選擇對手一塊地產，使其過路費減半 3 回合",
        ready: remaining > 0,
        cooldownText: remaining > 0 ? `剩餘 ${remaining} 次` : "已用盡",
      });
      break;
    }
    case "quantum_physicist": {
      const lastTurn = player.lastQuantumJumpTurn ?? -100;
      const cooldown = 5;
      const ready = state.totalTurns - lastTurn >= cooldown;
      const remain = ready ? 0 : cooldown - (state.totalTurns - lastTurn);
      result.push({
        id: "quantum_jump",
        name: "量子跳躍",
        description: "傳送到任意指定格子",
        ready,
        cooldownText: ready ? "就緒" : `冷卻中 ${remain} 回合`,
      });
      break;
    }
    case "black_market_dealer": {
      const sellCount = player.itemSellCount ?? 0;
      result.push({
        id: "sell_item",
        name: "出售道具",
        description: "將一個道具賣給其他玩家",
        ready: sellCount < 3 && player.items.length > 0,
        cooldownText: `剩餘 ${3 - sellCount} 次`,
      });
      break;
    }
    case "cyberborg": {
      result.push({
        id: "dice_adjust",
        name: "機械強化",
        description: "擲骰結果 +1 或 -1（每回合 1 次）",
        ready: state.phase === "rolling" && !player.diceAdjustedThisTurn,
        cooldownText: player.diceAdjustedThisTurn ? "本回合已用" : "本回合可用",
      });
      break;
    }
    case "data_priest": {
      const used = player.priestSacrificeUsed;
      result.push({
        id: "priest_sacrifice",
        name: "數據獻祭",
        description: "支付當前現金 20%，隨機獲得一個強力 buff",
        ready: !used && player.money > 0,
        cooldownText: used ? "本局已用盡" : "就緒",
      });
      break;
    }
    case "time_watcher": {
      const used = player.timeWatcherExtraTurnUsed;
      result.push({
        id: "time_watcher_extra",
        name: "時間回溯",
        description: "回合結束後立即獲得一個額外回合（每局限 1 次）",
        ready: !used && state.phase === "rolling" && state.currentPlayerIndex === playerIndex,
        cooldownText: used ? "本局已用盡" : "就緒",
      });
      break;
    }
    case "influencer":
    case "blockchain_miner":
    default:
      break;
  }

  return result;
}

// ========== AI 職業技能自動使用 ==========

export function tryAIUseProfessionSkill(state: GameState): GameState {
  const playerIdx = state.currentPlayerIndex;
  const player = state.players[playerIdx];
  if (!player || !player.isAI || player.isBankrupt) return state;
  if (state.winner !== null) return state;

  const skills = getAvailableProfessionSkills(state, playerIdx);
  if (skills.length === 0) return state;

  let newState = state;

  for (const skill of skills) {
    if (!skill.ready) continue;

    switch (skill.id) {
      case "hack_property": {
        // AI 找最貴的對手地產入侵
        let bestCellId = -1;
        let bestToll = 0;
        for (let cid = 0; cid < CELL_COUNT; cid++) {
          const prop = newState.properties[cid];
          if (!prop || prop.isMortgaged) continue;
          if (prop.owner === playerIdx) continue;
          if (prop.hackedUntilTurn && prop.hackedUntilTurn > newState.totalTurns) continue;
          const toll = getToll(
            cid,
            newState.mode,
            prop.owner ?? 0,
            newState.properties,
            newState.globalEventMultipliers,
            newState.customRules,
            newState.weatherMultipliers,
            newState.isCoopMode,
            prop.ownerTeam,
            0,
            newState.boardCells,
            newState.cellEffects,
             newState.stockStates,
             newState.season,
             newState.disaster,
             newState.totalTurns,
           );
          if (toll > bestToll) {
            bestToll = toll;
            bestCellId = cid;
          }
        }
        if (bestCellId >= 0 && Math.random() < 0.7) {
          newState = hackProperty(newState, playerIdx, bestCellId);
        }
        break;
      }
      case "quantum_jump": {
        // AI 隨機傳送到一塊自己的地產或高價值地產
        const candidates: number[] = [];
        for (let cid = 0; cid < CELL_COUNT; cid++) {
          const prop = newState.properties[cid];
          if (prop && prop.owner === playerIdx && !prop.isMortgaged) {
            candidates.push(cid);
          }
        }
        // 也可以去命運區或起點
        for (let cid = 0; cid < CELL_COUNT; cid++) {
          const cell = getCellConfig(newState, cid);
          if (cell.type === "fate" || cell.type === "start") {
            candidates.push(cid);
          }
        }
        if (candidates.length > 0 && Math.random() < 0.5) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          newState = quantumJump(newState, playerIdx, target);
          // 跳躍後可能觸發落地 phase 變化，直接返回讓前端處理
          return newState;
        }
        break;
      }
      case "sell_item": {
        // AI 少用出售道具，隨機觸發
        if (player.items.length > 0 && Math.random() < 0.2) {
          const opponents: number[] = [];
          for (let i = 0; i < newState.players.length; i++) {
            if (i !== playerIdx && !newState.players[i].isBankrupt && newState.players[i].money > 500) {
              opponents.push(i);
            }
          }
          if (opponents.length > 0) {
            const targetIdx = opponents[Math.floor(Math.random() * opponents.length)];
            const item = player.items[Math.floor(Math.random() * player.items.length)];
            const price = 300 + Math.floor(Math.random() * 500);
            newState = sellItemToPlayer(newState, playerIdx, targetIdx, item.id, price);
          }
        }
        break;
      }
      case "dice_adjust": {
        // 擲骰後 AI 自動微調（前端在 rolling phase 調用即可，這裡留空）
        break;
      }
      case "priest_sacrifice": {
        // AI 數據牧師：現金充足且有地主優勢時，60% 概率獻祭
        const ownedProps = Object.keys(newState.properties)
          .map((k: string) => Number(k))
          .filter((id: number) => newState.properties[id].owner === playerIdx).length;
        if (player.money > 2000 && ownedProps >= 2 && Math.random() < 0.6) {
          newState = priestSacrifice(newState, playerIdx);
        }
        break;
      }
      case "time_watcher_extra": {
        // AI 時間守望者：有地產且落後時，70% 概率使用額外回合
        const ownProps2 = Object.keys(newState.properties)
          .map((k: string) => Number(k))
          .filter((id: number) => newState.properties[id].owner === playerIdx).length;
        if (ownProps2 >= 2 && Math.random() < 0.7) {
          newState = timeWatcherExtraTurn(newState, playerIdx);
        }
        break;
      }
      default:
        break;
    }
  }

  return newState;
}

// ========== 聯盟系統 ==========

export function sendAllianceInvite(
  state: GameState,
  fromPlayer: number,
  toPlayer: number,
): GameState {
  const newState = cloneState(state);
  const fromP = newState.players[fromPlayer];
  const toP = newState.players[toPlayer];

  if (!newState.pendingAllianceInvites) {
    newState.pendingAllianceInvites = {};
  }
  if (!newState.alliances) {
    newState.alliances = [];
  }

  if (fromPlayer === toPlayer) return newState;
  if (fromP.isBankrupt || toP.isBankrupt) return newState;
  if (fromP.hasBrokenAlliance || toP.hasBrokenAlliance) return newState;

  // 检查是否已经结盟
  const alreadyAllied = newState.alliances.some(
    (a: AllianceState) =>
      (a.members[0] === fromPlayer && a.members[1] === toPlayer) ||
      (a.members[0] === toPlayer && a.members[1] === fromPlayer),
  );
  if (alreadyAllied) return newState;

  newState.pendingAllianceInvites[toPlayer] = fromPlayer;
  newState.logs.push(
    makeLog(
      getPlayerLogType(fromPlayer),
      `【聯盟】 ${fromP.name} 向 ${toP.name} 發出結盟邀請`,
    ),
  );
  return newState;
}

export function acceptAllianceInvite(
  state: GameState,
  playerIndex: number,
): GameState {
  const newState = cloneState(state);
  if (!newState.pendingAllianceInvites) return newState;

  const fromPlayer = newState.pendingAllianceInvites[playerIndex];
  if (fromPlayer === undefined) return newState;

  if (!newState.alliances) {
    newState.alliances = [];
  }

  const newAlliance: AllianceState = {
    members: [fromPlayer, playerIndex] as [number, number],
    formedAtTurn: newState.totalTurns,
  };
  newState.alliances.push(newAlliance);
  delete newState.pendingAllianceInvites[playerIndex];

  newState.logs.push(
    makeLog(
      "system",
      `【聯盟】 ${newState.players[fromPlayer].name} 與 ${newState.players[playerIndex].name} 結為聯盟！雙方互免過路費`,
    ),
  );
  return newState;
}

export function rejectAllianceInvite(
  state: GameState,
  playerIndex: number,
): GameState {
  const newState = cloneState(state);
  if (!newState.pendingAllianceInvites) return newState;

  const fromPlayer = newState.pendingAllianceInvites[playerIndex];
  if (fromPlayer === undefined) return newState;

  delete newState.pendingAllianceInvites[playerIndex];
  newState.logs.push(
    makeLog(
      getPlayerLogType(playerIndex),
      `【聯盟】 ${newState.players[playerIndex].name} 拒絕了 ${newState.players[fromPlayer].name} 的結盟邀請`,
    ),
  );
  return newState;
}

export function breakAlliance(
  state: GameState,
  playerIndex: number,
): GameState {
  const newState = cloneState(state);
  if (!newState.alliances || newState.alliances.length === 0) return newState;

  const allianceIdx = newState.alliances.findIndex(
    (a: AllianceState) => a.members[0] === playerIndex || a.members[1] === playerIndex,
  );
  if (allianceIdx === -1) return newState;

  const alliance = newState.alliances[allianceIdx];
  const otherPlayer = alliance.members[0] === playerIndex ? alliance.members[1] : alliance.members[0];

  // 支付違約金
  const breaker = newState.players[playerIndex];
  const victim = newState.players[otherPlayer];
  const penalty = Math.min(ALLIANCE_BREAK_PENALTY, breaker.money);
  breaker.money -= penalty;
  victim.money += penalty;
  breaker.hasBrokenAlliance = true;

  alliance.breaker = playerIndex;
  alliance.brokenAtTurn = newState.totalTurns;
  newState.alliances.splice(allianceIdx, 1);

  newState.logs.push(
    makeLog(
      "system",
      `【聯盟破裂】 ${breaker.name} 撕毀合約，向 ${victim.name} 支付 ${penalty} 元違約金！本局 ${breaker.name} 無法再與任何人結盟`,
    ),
  );
  return newState;
}

export function isPlayerAllied(
  state: GameState,
  playerA: number,
  playerB: number,
): boolean {
  if (!state.alliances) return false;
  return state.alliances.some(
    (a: AllianceState) =>
      (a.members[0] === playerA && a.members[1] === playerB) ||
      (a.members[0] === playerB && a.members[1] === playerA),
  );
}

// ========== 黑市拍賣系統 ==========

export function triggerBlackMarketAuction(state: GameState): void {
  const alivePlayers = state.players.filter((p: PlayerState) => !p.isBankrupt);
  if (alivePlayers.length < 2) return;

  // 随机选择3件稀有道具
  const shuffled = [...BLACK_MARKET_ITEM_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, BLACK_MARKET_ITEM_COUNT);

  const items: BlackMarketAuctionItem[] = selected.map((itemType: ItemType) => {
    const bids: Record<number, number | null> = {};
    for (let i = 0; i < state.players.length; i++) {
      if (!state.players[i].isBankrupt) {
        bids[i] = null;
      }
    }
    return {
      itemType,
      startingPrice: BLACK_MARKET_START_PRICE,
      bids,
    };
  });

  state.blackMarketAuction = {
    phase: 'bidding',
    items,
    currentItemIndex: 0,
    timeLeft: BLACK_MARKET_BID_DURATION,
    turnTriggered: state.totalTurns,
  };

  state.logs.push(
    makeLog(
      "system",
      `【黑市拍賣】 黑市拍賣會開始！共 ${items.length} 件稀有道具，趕快出價！`,
    ),
  );
}

export function placeBlackMarketBid(
  state: GameState,
  playerIndex: number,
  itemIndex: number,
  bidAmount: number,
): GameState {
  const newState = cloneState(state);
  const auction = newState.blackMarketAuction;
  if (!auction || auction.phase !== 'bidding') return newState;
  if (itemIndex < 0 || itemIndex >= auction.items.length) return newState;

  const item = auction.items[itemIndex];
  const player = newState.players[playerIndex];

  if (player.isBankrupt) return newState;
  if (bidAmount < item.startingPrice) return newState;
  if (bidAmount > player.money) return newState;
  if (!(playerIndex in item.bids)) return newState;

  item.bids[playerIndex] = bidAmount;
  newState.logs.push(
    makeLog(
      getPlayerLogType(playerIndex),
      `【黑市拍賣】 ${player.name} 對 ${ITEMS[item.itemType].name} 出價`,
    ),
  );
  return newState;
}

export function finalizeBlackMarketAuction(state: GameState): GameState {
  const newState = cloneState(state);
  const auction = newState.blackMarketAuction;
  if (!auction || auction.phase !== 'bidding') return newState;

  auction.phase = 'reveal';

  for (const item of auction.items) {
    let winner: number | null = null;
    let highestBid = 0;

    for (const [pIdxStr, bid] of Object.entries(item.bids)) {
      const pIdx = Number(pIdxStr);
      if (bid !== null && bid > highestBid) {
        highestBid = bid;
        winner = pIdx;
      }
    }

    if (winner !== null) {
      const winnerPlayer = newState.players[winner];
      if (winnerPlayer.money >= highestBid) {
        winnerPlayer.money -= highestBid;
        if (winnerPlayer.items.length < MAX_ITEMS) {
          winnerPlayer.items.push({ type: item.itemType, id: nextItemId++ });
        }
        item.winner = winner;
        item.finalPrice = highestBid;
        newState.logs.push(
          makeLog(
            "system",
            `【黑市拍賣】 ${winnerPlayer.name} 以 ${highestBid} 元購得 ${ITEMS[item.itemType].name}！`,
          ),
        );
      }
    } else {
      newState.logs.push(
        makeLog(
          "system",
          `【黑市拍賣】 ${ITEMS[item.itemType].name} 無人出價，流拍`,
        ),
      );
    }
  }

  auction.phase = 'finished';
  return newState;
}

export function closeBlackMarketAuction(state: GameState): GameState {
  const newState = cloneState(state);
  newState.blackMarketAuction = null;
  return newState;
}

export function getBlackMarketWinner(item: BlackMarketAuctionItem): number | null {
  return item.winner ?? null;
}
