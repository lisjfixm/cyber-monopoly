// ========== 任務系統 ==========

export type MissionType =
  | 'buy_properties'
  | 'complete_set'
  | 'go_to_jail'
  | 'build_houses'
  | 'stock_profit'
  | 'win_minigame'
  | 'pay_toll'
  | 'pass_start';

export interface Mission {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed?: boolean;
  completedBy?: number;
}

export type GameMode = "classic" | "fast" | "crazy" | "custom" | "coop2v2" | "battle_royale"
  | "race" | "survival" | "coop_boss" | "treasure" | "emperor" | "dark"
  | "lightning" | "resource" | "team_deathmatch" | "darknet"
  | "casino" | "dynasty"
  | "stock_frenzy" | "black_market_race" | "twin_strike";

// ========== 劇情模式 ==========

export type StoryLevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface StoryLevelConfig {
  id: StoryLevelId;
  name: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  startingMoney: number;
  aiCount: number;
  aiAggression: number;
  specialRule?: string;
  reward: string;
  gameMode: GameMode;
}

// ========== 錦標賽 ==========

export type TournamentSize = 8 | 16 | 32;
export type TournamentPhase = 'group' | 'knockout' | 'final' | 'finished';
export type MatchStatus = 'pending' | 'in_progress' | 'finished';

export interface TournamentMatch {
  id: string;
  player1: string;
  player2: string;
  winner?: string;
  status: MatchStatus;
  group?: string;
  round?: number;
}

export interface TournamentStanding {
  player: string;
  points: number;
  wins: number;
  losses: number;
}

export interface TournamentState {
  id: string;
  size: TournamentSize;
  phase: TournamentPhase;
  players: string[];
  matches: TournamentMatch[];
  standings: TournamentStanding[];
  groups?: Record<string, string[]>;
  champion?: string;
  createdAt: string;
}

// 賽程樹對局
export interface BracketMatch {
  round: number;
  matchNumber: number;
  player1: { name: string; avatar: string; won: boolean };
  player2: { name: string; avatar: string; won: boolean };
  winner?: string;
  isLive: boolean;
}

// 錦標賽獎勵
export interface TournamentReward {
  position: string;
  currency: number;
  reward: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

// 歷史記錄
export interface TournamentHistory {
  id: string;
  date: string;
  format: 8 | 16 | 32;
  myRank: number;
  rewards: string;
}

// 進行中的錦標賽（官方賽事模擬數據）
export interface LiveTournament {
  id: string;
  format: 8 | 16 | 32;
  status: 'registration' | 'in-progress' | 'completed';
  currentRound: number;
  remainingPlayers: number;
  nextRoundAt: string;
  myPosition?: number;
  bracket: BracketMatch[][];
}

// ========== 地圖編輯器 ==========

export interface CustomMapData {
  id: string;
  name: string;
  cells: CellConfig[];
  createdAt: string;
}

export type MapEditorTool = 'select' | 'paint' | 'erase';

// ========== 每日挑战 ==========

export type DailyChallengeType =
  | 'fate_only'
  | 'double_move'
  | 'slums'
  | 'double_rent'
  | 'no_building'
  | 'speed_15'
  | 'all_random';

export interface DailyChallenge {
  id: string;
  type: DailyChallengeType;
  name: string;
  description: string;
  rules: string[];
  reward: { exp: number; coins: number; item?: string };
}

// ========== 赛季通行证 ==========

export interface BattlePassReward {
  level: number;
  free: BattlePassRewardItem;
  premium: BattlePassRewardItem;
}

export interface BattlePassRewardItem {
  type: 'coin' | 'ticket' | 'item' | 'skin' | 'pawnSkin' | 'diceSkin' | 'avatarFrame' | 'effect' | 'profession' | 'title' | 'collectible';
  value: string | number;
  name: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  amount?: number;
}

export type QuestRefreshType = 'daily' | 'weekly' | 'season';

export interface BattlePassQuest {
  id: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  claimed: boolean;
  refreshType: QuestRefreshType;
}

export interface BattlePassState {
  seasonName: string;
  seasonEndsAt: string;
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  premiumPurchased: boolean;
  tiers: BattlePassTier[];
  dailyQuests: BattlePassQuest[];
  weeklyQuests: BattlePassQuest[];
  seasonQuests: BattlePassQuest[];
}

export interface BattlePassTier {
  level: number;
  freeReward: BattlePassRewardItem;
  premiumReward: BattlePassRewardItem;
  claimed: { free: boolean; premium: boolean };
}

export type BoardSide = 'top' | 'bottom' | 'left' | 'right';

export interface DestroyedZone {
  side: BoardSide;
  turnDestroyed: number;
}

export type TeamId = 'red' | 'blue';

export interface TeamState {
  teamId: TeamId;
  name: string;
  money: number;
  totalAssets: number;
  playerIndices: number[];
  items: ItemState[];
  stocks: PlayerStock[];
  stockBoughtTotal: number;
  stockSoldTotal: number;
  loan?: number;
  // 存款系統
  savings?: number;
}
export type PlayMode = "local" | "ai" | "online";
export type CellType = "start" | "property" | "detention" | "fate" | "chance" | "minigame" | "parking" | "jail" | "event" | "teleport";
export type PlayerColor = "red" | "blue" | "green" | "yellow" | "purple" | "orange";

// ========== 股票系统 ==========

export type StockSymbol = "NEON" | "QNTM" | "DATA" | "CYBR";

export type StockVolatility = "high" | "medium" | "low";

export interface StockConfig {
  symbol: StockSymbol;
  name: string;
  initialPrice: number;
  volatility: StockVolatility;
  color: string;
  linkedSetIds?: string[];
}

export interface StockState {
  symbol: StockSymbol;
  price: number;
  previousPrice: number;
  controllingPlayer?: number | null;
  shareholderMeetingUsed?: boolean;
  shareholderMeetingCooldown?: number;
}

export interface PlayerStock {
  symbol: StockSymbol;
  quantity: number;
}

// ========== 全局事件 ==========

export type GlobalEventType =
  | "economic_crisis"
  | "tech_boom"
  | "neon_festival"
  | "hacker_attack"
  | "real_estate_bubble"
  | "energy_shortage"
  | "data_dividend"
  | "urban_reconstruction"
  | "space_immigration"
  | "ai_rebellion"
  | "investment_hint"
  | "bank_crisis"
  | "quantum_storm"
  | "stock_circuit_breaker"
  | "foreign_inflow"
  | "ad_storm"
  | "subsidy_carnival"
  | "black_market_crackdown"
  // v3.0 新增全局事件
  | "satellite_airdrop"
  | "data_thunder"
  | "chip_boom"
  | "mega_subsidy";

export interface GlobalEvent {
  type: GlobalEventType;
  name: string;
  description: string;
  icon: string;
}

export interface GlobalEventMultipliers {
  tollMultiplier?: number;
  propertyPriceMultiplier?: number;
  cardMoneyMultiplier?: number;
  incomeMultiplier?: number;
  stockPriceMultiplier?: number;
}

// ========== 道具系统 ==========

export type ItemType =
  | 'double_dice'
  | 'teleport'
  | 'steal_property'
  | 'shield'
  | 'free_pass'
  | 'remote_dice'
  | 'bomb'
  | 'invisibility'
  | 'time_machine'
  | 'money_tree'
  | 'x_ray'
  | 'clone_dice'
  | 'time_travel'
  | 'hacker_backdoor'
  | 'emp_pulse'
  | 'stealth_cloak'
  | 'drone_scout'
  | 'quantum_portal'
  | 'credit_voucher'
  | 'time_pocket_watch'
  | 'electronic_contract'
  | 'energy_shield'
  | 'data_courier'
  | 'fake_id'
  | 'freeze_ray'
  | 'swap_portal'
  | 'golden_passport'
  | 'data_backup'
  | 'loaded_dice'
  | 'ransomware'
  | 'toll_magnet'
  | 'lucky_coin'
  // v3.0 新增道具
  | 'overclock_shield'
  | 'cash_injection'
  | 'emp_gun'
  | 'land_bomb'
  | 'money_tree_plus'
  | 'ghost_protocol'
  | 'buy_coupon'
  | 'loot_drone'
  | 'warp_token'
  | 'heal_synth';

export type MountType = 'flyer' | 'diver' | 'rocket' | 'hoverboard' | 'drone_mount' | 'hover_car';

export interface MountState {
  flyerUses: number;
  diverUses: number;
  rocketUses: number;
  hoverboardUses?: number;
  droneMountUses?: number;
  hoverCarUses?: number;
}

export type EvolutionLevel = 0 | 1 | 2;

export interface ItemConfig {
  type: ItemType;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export interface ItemState {
  type: ItemType;
  id: number;
}

// ========== 季節系統 ==========

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonState {
  type: SeasonType;
  turn: number;  // 當季節已過回合數
}

// ========== 災難系統 ==========

export type DisasterType = 'earthquake' | 'fire' | 'flood';

export interface DisasterState {
  type: DisasterType;
  affectedCells: number[];  // 受影響的格子
  duration: number;  // 剩餘持續回合數（洪水3回合，地震/火災即時）
  active: boolean;
}

// ========== 天气系统 ==========

export type WeatherType = 'sunny' | 'rain' | 'fog' | 'em_storm' | 'neon_night' | 'space_calm';

export interface WeatherConfig {
  type: WeatherType;
  name: string;
  icon: string;
  description: string;
}

export interface WeatherMultipliers {
  incomeMultiplier?: number;
  tollMultiplier?: number;
  moveReduction?: number;
  cardMoneyMultiplier?: number;
  propertyPriceDiscount?: number;
  freePassThisTurn?: boolean;
  moveMultiplier?: number;
  spaceCalmBonus?: number;
}

// ========== 迷你游戏系统 ==========

export type MiniGameType = 'slot_machine' | 'blackjack' | 'guess_number' | 'memory_match' | 'rhythm_master' | 'shooting_challenge' | 'data_miner' | 'firewall_breach' | 'cyber_racer' | 'auction_master';

export interface MiniGameState {
  type: MiniGameType;
  playerIndex: number;
  reels?: [number, number, number];
  spinning?: boolean;
  playerCards?: number[];
  dealerCards?: number[];
  diceResult?: number;
  // 记忆翻牌
  memoryCards?: number[];
  memoryFlipped?: number[];
  memoryMatched?: number[];
  memoryTimeLeft?: number;
  memoryMoves?: number;
  // 节奏大师
  rhythmNotes?: Array<{ id: number; time: number; lane: number; hit: boolean }>;
  rhythmScore?: number;
  rhythmHitCount?: number;
  rhythmTotalNotes?: number;
  rhythmPlaying?: boolean;
  // 射击挑战
  shootingTargets?: Array<{ id: number; x: number; y: number; speed: number; hit: boolean }>;
  shootingBullets?: number;
  shootingScore?: number;
  // 數據挖掘
  minerScore?: number;
  minerCombo?: number;
  minerTimeLeft?: number;
  minerPlaying?: boolean;
  // 防火牆突破
  firewallRound?: number;
  firewallLives?: number;
  firewallShowing?: boolean;
  firewallSequence?: number[];
  firewallPlayerInput?: number[];
  // 賽博賽車
  racerLane?: number;
  racerTimeLeft?: number;
  racerPlaying?: boolean;
  racerObstacles?: Array<{ id: number; lane: number; y: number }>;
  racerSpeed?: number;
  // 拍賣大師
  auctionItems?: Array<{ id: number; name: string; minBid: number; value: number; icon: string; won?: boolean; bidAmount?: number }>;
  auctionCurrentItem?: number;
  auctionAiBid?: number;
  auctionAiThinking?: boolean;
  auctionPlayerPassed?: boolean;
  reward: number;
  finished: boolean;
}

// ========== 成就系统 ==========

export type AchievementId =
  | "first_win"
  | "property_tycoon"
  | "building_magnate"
  | "hotel_king"
  | "set_collector"
  | "stock_sniper"
  | "jailbird"
  | "fate_favorite"
  | "trade_master"
  | "auction_hunter"
  | "rags_to_riches"
  | "perfect_victory"
  | "beginner"
  | "item_collector"
  | "gambler"
  | "chosen_one"
  | "battle_royale_champion"
  | "shrink_survivor"
  | "asset_millionaire"
  | "asset_100k"
  | "first_match"
  | "first_property"
  | "first_building"
  | "first_card_draw"
  | "wealth_10k"
  | "wealth_50k"
  | "wealth_100k_single"
  | "profit_per_match_10k"
  | "win_streak_3"
  | "win_streak_5"
  | "win_streak_10"
  | "win_streak_20"
  | "mode_classic_win"
  | "mode_speed_win"
  | "mode_crazy_win"
  | "mode_battle_royale_win"
  | "mode_all_master"
  | "profession_all_used"
  | "profession_each_win"
  | "collect_all_cards"
  | "collect_all_items"
  | "collect_all_themes"
  | "collect_all_skins"
  | "friend_10"
  | "create_guild"
  | "guild_quest_complete"
  | "bankruptcy_comeback"
  | "zero_property_win"
  | "triple_double_jail"
  | "freeze_master"
  | "lottery_winner"
  | "item_tycoon"
  | "dynasty_builder"
  | "casino_highroller"
  | "sniper_pro"
  | "bounty_hunter"
  | "card_combo_master"
  | "global_event_survivor"
  | "set_duke"
  | "penny_pincher"
  | "swap_artist"
  | "quantum_wanderer"
  // v3.0 新增成就
  | "stock_frenzy_champion"
  | "black_market_tycoon"
  | "twin_strike_veteran"
  | "item_armory"
  | "netrunner_legend"
  | "medic_angel"
  | "broker_pro"
  | "airdrop_grateful"
  | "chip_mogul"
  | "survival_master"
  | "emperor_crowned"
  | "race_finisher";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  target?: number;
}

export type AchievementCategory =
  | 'beginner'
  | 'wealth'
  | 'streak'
  | 'mode'
  | 'profession'
  | 'collection'
  | 'social'
  | 'special';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Profession =
  | "engineer"
  | "banker"
  | "speculator"
  | "tycoon"
  | "hacker"
  | "doctor"
  | "lawyer"
  | "journalist"
  | "gambler"
  | "artist"
  | "scientist"
  | "traveler"
  | "cyber_hacker"
  | "quantum_physicist"
  | "influencer"
  | "black_market_dealer"
  | "cyberborg"
  | "blockchain_miner"
  | "cyber_daoist"
  | "data_priest"
  | "mechanical_alchemist"
  | "shadow_broker"
  | "time_watcher"
  | "net_ninja"
  | "drone_pilot"
  | "auctioneer"
  | "bounty_hunter"
  | "street_racer"
  | "media_mogul"
  | "cyber_sniper"
  // v3.0 新增職業
  | "netrunner"
  | "cyber_medic"
  | "stock_broker";

export type GamePhase =
  | "waiting"
  | "rolling"
  | "moving"
  | "buying"
  | "fate"
  | "chance"
  | "auction"
  | "ended";
export type RoomStatus = "waiting" | "playing" | "ended";

export type CardEffect =
  | { type: "money"; amount: number }
  | { type: "teleport_start" }
  | { type: "go_to_detention" }
  | { type: "forward"; steps: number }
  | { type: "backward"; steps: number }
  | { type: "steal_money"; amount: number }
  | { type: "give_money"; amount: number }
  | { type: "get_out_of_jail" }
  | { type: "forward_to_fate" }
  | { type: "repair_fee"; perProperty: number }
  | { type: "lucky_star"; amount: number }
  | { type: "random_teleport" }
  | { type: "chain_draw"; count: number }
  | { type: "choice"; options: [CardEffect, CardEffect]; optionLabels: [string, string] }
  | { type: "buff"; buffType: string; duration: number; description: string }
  | { type: "forward_to_property" }
  | { type: "backward_to_fate" }
  | { type: "collect_from_all"; amount: number }
  | { type: "pay_to_all"; amount: number }
  | { type: "property_appreciate"; percent: number }
  | { type: "item_give"; itemId?: string | null }
  | { type: "skip_turn" }
  | { type: "steal_item" }
  | { type: "force_sell_property" }
  | { type: "toll_boost_turn"; percent: number }
  | { type: "lucky_dice" }
  | { type: "negative_immunity" }
  | { type: "teleport_to_owned" }
  | { type: "property_downgrade" }
  | { type: "others_pay_bank"; amount: number }
  | { type: "trade_exchange_money"; amount?: number }
  | { type: "freeze_opponent"; duration: number }
  | { type: "swap_position" }
  | { type: "lottery"; cost: number; prize: number }
  | { type: "extort"; amount: number }
  | { type: "universal_tax"; percent: number };

export type SpecialBuildingType = "mall" | "factory" | "lab";

export interface SpecialBuildingConfig {
  type: SpecialBuildingType;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export type TemporaryEffectType = 'fate_zone' | 'price_up' | 'price_down' | 'ruins' | 'investment_preview';

export interface TemporaryCellEffect {
  type: TemporaryEffectType;
  duration: number;
  expireTurn: number;
  value?: number;
}

export interface CellConfig {
  id: number;
  name: string;
  type: CellType;
  basePrice: number;
  color: string;
  setId?: string;
  rent?: number;
  specialBuilding?: SpecialBuildingType | null;
  temporaryEffect?: TemporaryCellEffect | null;
}

export interface GameModeConfig {
  initialMoney: number;
  priceMultiplier: number;
  tollRate: number;
  startReward: number;
  fateMoneyMultiplier: number;
  buildingCostMultiplier?: number;
  maxTurns?: number;
  itemEffectMultiplier?: number;
  darknetFeeRate?: number;
}

export interface CustomGameRules {
  initialMoney: number;
  tollPercent: number;
  goBonus: number;
  fateMoneyMultiplier: number;
  enableFateCards: boolean;
  enableChanceCards: boolean;
  enableStockMarket: boolean;
  enableGlobalEvents: boolean;
  buildingTollMode: "standard" | "aggressive";
  bankruptcyLine: number;
  randomBoard?: boolean;
  defaultAuctionMode?: 'open' | 'blind';
  // 地產期貨
  enablePropertyFutures?: boolean;
  // 期權交易
  enableOptionsTrading?: boolean;
  // 戰爭系統
  enableWarSystem?: boolean;
  // 間諜系統
  enableSpySystem?: boolean;
  // 機器人代打
  enableRobotProxy?: boolean;
  // 時間旅行道具
  enableTimeTravel?: boolean;
  // 平行世界
  enableParallelWorld?: boolean;
  // 卡牌連鎖
  enableCardCombo?: boolean;
  // 地產進化
  enablePropertyEvolution?: boolean;
  // 坐騎系統
  enableMountSystem?: boolean;
  // 寵物系統
  enablePetSystem?: boolean;
  // 收藏圖鑑
  enableCodex?: boolean;
}

// 建築等級：0=空地，1-4=房屋數，5=酒店
export type BuildingLevel = 0 | 1 | 2 | 3 | 4 | 5;

// 地產升級路線（3級後可選）
export type PropertyUpgradePath = 'attack' | 'defense' | 'tech';

export interface PropertyUpgradePathConfig {
  id: PropertyUpgradePath;
  name: string;
  description: string;
  color: string;
  tollBonus: number;
  buildingCostMultiplier: number;
  passiveIncomePerPass?: number;
  infectionChance?: number;
}

export interface PropertyState {
  owner: number;            // 所有者（玩家索引）
  ownerTeam?: TeamId;       // 所有隊伍（合作模式下用）
  buildings: BuildingLevel; // 建築等級
  isMortgaged: boolean;     // 是否抵押
  insured?: boolean;        // 是否已保險
  specialBuilding?: SpecialBuildingType | null; // 特殊建築
  upgradePath?: PropertyUpgradePath | null; // 升級路線
  evolutionLevel?: EvolutionLevel; // 地產進化等級 0=住宅 1=商業 2=地標
  hackedUntilTurn?: number; // 駭客入侵：過路費減半持續到第幾回合（絕對回合數）
  hackedByPlayer?: number; // 入侵的駭客玩家索引
}

// 交易提议
export interface TradeOffer {
  id: number;
  fromPlayer: number;          // 发起方（玩家索引）
  toPlayer: number;            // 接收方（玩家索引）
  givenProperties: number[];   // 发起方给出的地块ID列表
  receivedProperties: number[];// 发起方想要的地块ID列表
  moneyAmount: number;         // 发起方给出的金额（正数=给钱，负数=收钱）
}

export interface ProfessionConfig {
  id: Profession;
  name: string;
  icon: string;
  color: string;
  description: string;
  skills: string[];
}

export interface AuctionState {
  cellId: number;
  currentBid: number;
  currentBidder: number;       // 当前最高出价者（玩家索引）
  activeBidders: number[];     // 仍在参与竞价的玩家索引数组
  activeBidderIndex: number;   // 当前轮到行动的玩家在 activeBidders 中的索引
  active: boolean;
  startingPrice: number;
  minIncrement: number;
  // 暗拍模式字段
  isBlind?: boolean;           // 是否暗拍模式
  blindBids?: Record<number, number | null>;  // 玩家索引 -> 出价（null=未出价）
  blindDeadline?: string;      // 暗拍截止时间（联机模式用）
  revealed?: boolean;          // 是否已揭曉
}

// ========== 聯盟系統 ==========

export interface AllianceState {
  members: [number, number];   // 兩個聯盟玩家的索引
  formedAtTurn: number;        // 結盟回合
  breaker?: number;            // 毀約者索引
  brokenAtTurn?: number;       // 毀約回合
}

export interface AllianceInvite {
  fromPlayer: number;
  toPlayer: number;
  createdAtTurn: number;
}

// ========== 黑市拍賣 ==========

export type BlackMarketAuctionPhase = 'countdown' | 'bidding' | 'reveal' | 'finished';

export interface BlackMarketAuctionItem {
  itemType: ItemType;
  startingPrice: number;
  bids: Record<number, number | null>;  // playerIndex -> bid amount (null=未出价)
  winner?: number | null;
  finalPrice?: number;
}

export interface BlackMarketAuctionState {
  phase: BlackMarketAuctionPhase;
  items: BlackMarketAuctionItem[];
  currentItemIndex: number;
  timeLeft: number;            // 剩余秒数（倒计时用）
  turnTriggered: number;       // 触发的回合数
}

// ========== 皮膚系統 ==========

export type PawnSkinType = 'default' | 'mecha' | 'ufo' | 'dragon' | 'neon_cat' | 'holo_knight';
export type DiceSkinType = 'default' | 'gold' | 'neon' | 'pixel' | 'blood' | 'cosmic';

export interface SkinConfig {
  id: string;
  name: string;
  type: 'pawn' | 'dice';
  unlockCondition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ========== 寵物系統 ==========

export type PetType = 'mechDog' | 'ufo' | 'dragon' | 'neon_cat' | 'ghost_hacker'
  | 'cyber_bunny' | 'data_fairy';

export interface PetConfig {
  id: PetType;
  name: string;
  description: string;
  passiveEffect: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic';
  icon: string;
}

// ========== 稱號系統 ==========

export type TitleId =
  | 'tycoon'
  | 'gambler'
  | 'jailbreak'
  | 'trader'
  | 'champion'
  | 'stock_guru'
  | 'hotel_king'
  | 'newbie'
  | 'fate_favorite'
  | 'property_newbie'
  | 'undefeated'
  | 'real_estate_god'
  | 'billionaire'
  | 'codex_master'
  | 'quantum_lord'
  | 'shadow_tycoon'
  | 'card_legend'
  | 'dynasty_founder';

export type TitleEffectType =
  | 'flame'
  | 'ice'
  | 'neon'
  | 'gold'
  | 'purple'
  | 'rainbow'
  | 'glitch'
  | 'pulse'
  | null;

export interface TitleConfig {
  id: TitleId;
  name: string;
  description: string;
  unlockCondition: string;
  unlockValue: string; // 對應的成就ID或其他解鎖條件值
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  effect: TitleEffectType;
}

// ========== 頭像框系統 ==========

export type AvatarFrameUnlockType =
  | 'default'
  | 'battlepass'
  | 'achievement'
  | 'assets'
  | 'achievements_count'
  | 'all_pawn_skins'
  | 'achievements_combo';

export interface AvatarFrameConfig {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  unlockType: AvatarFrameUnlockType;
  unlockValue: string | number;
  borderStyle: string; // CSS 樣式描述
  glowColor?: string;
}

export interface PlayerState {
  name: string;
  playerNumber: number;        // 玩家编号（1-based，显示用）
  playerIndex: number;         // 玩家索引 0~5（数组中自证身份）
  money: number;
  pawnSkin?: PawnSkinType;     // 棋子皮膚
  diceSkin?: DiceSkinType;     // 骰子皮膚
  position: number;
  isInDetention: boolean;
  detentionTurns: number;
  hasGetOutOfJailCard: boolean;
  completeSets: number;
  totalHouses: number;
  totalHotels: number;
  totalAssets: number;
  color: PlayerColor;          // 玩家颜色标识
  isAI: boolean;               // 是否是AI
  aiDifficulty?: "easy" | "normal" | "hard" | "hell";
  aiPersonality?: "conservative" | "aggressive" | "speculator" | "trader" | "vengeful" | "gambler";
  isBankrupt: boolean;         // 是否已破产
  health?: number | null;      // 生存模式生命值
  teamId?: TeamId;             // 所属队伍（仅合作模式有值）
  profession?: Profession;
  hasUsedRevival?: boolean;
  // 股票系统
  stocks: PlayerStock[];
  stockBoughtTotal: number;
  stockSoldTotal: number;
  // 过路费统计
  tollPaid: number;
  tollEarned: number;
  tollIncome: number;
  tollExpense: number;
  // 抽卡统计
  fateCardDraws: number;
  chanceCardDraws: number;
  // 成就追踪
  detentionCount: number;
  cardDrawCount: number;
  tradeCount: number;
  auctionWins: number;
  hasBeenPoor: boolean;
  unlockedAchievements: AchievementId[];
  // 道具系统
  items: ItemState[];
  shieldCharges: number;
  freePassRemaining: number;
  doubleDiceActive: boolean;
  remoteDiceActive: boolean;
  remoteDiceValues?: [number, number];
  // 新道具状态
  invisibilityTurns?: number;
  moneyTreeTurns?: number;
  xRayActive?: boolean;
  cloneDiceActive?: boolean;
  lastDiceValues?: [number, number];
  previousPosition?: number;
  lawyerStealUsed?: boolean;
  // 新道具：駭客後門/電磁脈衝/隱形光學迷彩
  nextBuyDiscount?: number;
  skipNextTurn?: boolean;
  stealthCloakTurns?: number;
  // 迷你游戏
  minigameWins: number;
  // 道具追踪（成就用）
  itemsUsedThisGame: number;
  // 天气追踪（成就用）
  sunnyWeatherCount: number;
  // 贷款系统
  loan?: number;
  // 存款系統
  savings?: number;
  // 技能树系统
  skillTree?: SkillTreeState;
  skillPoints?: number;
  // 卡牌 buff 系统
  cardBuffs?: CardBuff[];
  // 地下市场 / 声望系统（可选，默认100）
  reputation?: number;
  // 坐騎系統
  mounts?: MountState | null;
  // 時間旅行使用次數（每局每人限1次）
  timeTravelUsed?: boolean;
  // 資源爭奪模式：數據資源點數
  resources?: number;
  // 資源兌換效果：下次過路費減免比例（0-1）
  nextTollDiscount?: number;
  // 資源兌換效果：下次買地折扣比例（0-1）
  nextBuyDiscountResource?: number;
  // 電磁脈衝：疊加的額外跳過回合（暗網模式增強時使用）
  empExtraSkip?: boolean;
  // 偽身份證：下次進入監禁時自動豁免（一次性）
  fakeIdActive?: boolean;
  // 建材數量（地產進化用）
  buildingMaterials?: number;
  // 寵物系統：裝備的寵物
  equippedPet?: PetType | null;
  // 稱號系統：裝備的稱號
  equippedTitle?: TitleId | null;
  // 皮膚碎片數量
  skinFragments?: number;
  // 連續雙倍骰次數（用於連三雙進監禁）
  consecutiveDoubles?: number;
  // 量子物理學家：上次量子跳躍的回合（絕對回合數），用於冷卻判斷
  lastQuantumJumpTurn?: number;
  // 賽博改造人：本回合是否已用過機械強化
  diceAdjustedThisTurn?: boolean;
  // 駭客：剩餘入侵次數（每局限 3 次）
  hackUsesRemaining?: number;
  // 黑市商人：已出售道具次數（每局限 3 次）
  itemSellCount?: number;
  // 賽博道士：本次負面卡減免已觸發標記（每回合重置）
  daoistDebuffReduced?: boolean;
  // 數據牧師：本局是否已用過「獻祭」主動
  priestSacrificeUsed?: boolean;
  // 時間守望者：本局是否已用過額外回合主動
  timeWatcherExtraTurnUsed?: boolean;
  // 網路忍者：本次被動免疫是否已消耗
  ninjaImmunityUsed?: boolean;
  // 額外回合標記（時間守望者發動時設為 true，執行完後設回 false）
  extraTurnActive?: boolean;
  // 負面免疫護盾（防火牆類 buff，持續到被觸發）
  negativeImmunityShield?: boolean;
  // 幸運模組：下次擲骰取較大值
  luckyDiceActive?: boolean;
  // 本回合過路费加成（百分比，0.5 = +50%）
  tollBoostThisTurn?: number;
  // 數據牧師獻祭獲得的必出 7 狀態（下次擲骰時生效）
  sacrificeLuckySeven?: boolean;
  // 聯盟系統：本局是否已毀約（毀約後不能再結盟）
  hasBrokenAlliance?: boolean;
  // 聯盟系統：收到的結盟邀請來源玩家索引
  allianceInviteFrom?: number | null;
  // ===== v2.0 新增 =====
  // 被凍結回合數（冰凍射線/卡牌）：>0 時下回合跳過
  frozenTurns?: number;
  // 數據備份：抵消下一次負面金錢效果（一次性）
  dataBackupActive?: boolean;
  // 過路費磁吸：下次過路費收入翻倍
  tollMagnetActive?: boolean;
  // 灌鉛骰子：下次擲骰指定總點數（0=未設定）
  loadedDiceValue?: number;
  // 賭場模式：本局賭博累計淨盈虧
  casinoNetWin?: number;
  // 金融王朝：本回合被動股息已發放標記
  dynastyDividendPaid?: boolean;
  // 無人機操縱師：剩餘偵察次數
  droneScoutUses?: number;
  // 拍賣師：本局已使用壓價主動次數
  auctioneerUnderUsed?: number;
  // 賞金獵人：上一個傷害過自己的玩家（用於復仇）
  lastHarmedBy?: number | null;
  // 街頭賽車手：本局已觸發衝刺次數
  streetRacerDashUsed?: number;
  // 媒體巨頭：粉絲數（影響廣告收入）
  mediaFans?: number;
  // 網路狙擊手：本局已擊殺（強制送監禁）次數
  cyberSniperShotUsed?: number;
  // 成就追蹤：本局購買道具數
  itemsBoughtThisGame?: number;
  // 成就追蹤：本局被動收入總額
  passiveIncomeEarned?: number;
  // 成就追蹤：本局強制拍賣/賣出地產數
  forcedSalesMade?: number;
  // 成就追蹤：本局面對手造成的跳過回合數
  freezesApplied?: number;
  // v3.0 新職業：剩餘主動技能次數
  netrunnerRaidUses?: number;
  cyberMedicRepairUses?: number;
  stockBrokerPlayUses?: number;
  // v3.0 成就追蹤：領取衛星空投次數
  airdropReceived?: number;
}

// ========== 技能树系统 ==========

export type SkillId =
  | 'buy_discount'       // 買地折扣
  | 'toll_bonus'         // 過路費加成
  | 'lucky_draw'         // 抽卡幸運
  | 'jail_master'        // 越獄大師
  | 'build_master'       // 建房達人
  | 'wealth_sense';      // 財富嗅覺

export interface SkillLevelEffect {
  level: number;
  value: number;
  description: string;
}

export interface SkillConfig {
  id: SkillId;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  effects: SkillLevelEffect[];
}

export type SkillTreeState = Record<SkillId, number>;

export interface LogEntry {
  id: number;
  type:
    | "player1"
    | "player2"
    | "fate"
    | "chance"
    | "system"
    | "trade"
    | "auction"
    | "stock"
    | "global_event"
     | "item"
       | "weather"
       | "minigame"
       | "team"
        | "zone_destroy"
       | "loan"
        | "insurance"
         | "bond"
         | "bank"
         | "voice"
        | "mission"
         | "dynamic_board"
         | "npc"
         | "force_acquire"
         | "chain_bankruptcy"
         | "stock_control"
         | "shareholder_meeting"
         | "underground_market"
         | "reputation"
         | "bribery"
         | "season"
         | "disaster"
          | "war"
          | "spy"
          | "robot"
           | "time_travel"
           | "parallel"
           | "combo"
           | "evolution"
           | "mount"
           | "pet"
           | "codex";
    text: string;
  }

export interface GameState {
  mode: GameMode;
  playerCount: number;          // 实际玩家数
  players: PlayerState[];
  currentPlayerIndex: number;
  roundStartPlayer: number;     // 当前轮的起始玩家索引
  playersActedThisRound: boolean[]; // 当前轮已行动过的玩家标记
  bankruptPlayers: number[];    // 破产玩家索引列表
  phase: GamePhase;
  diceValues: [number, number];
  lastDiceValues: [number, number];
  ownedProperties: Record<number, number>; // 向后兼容（存玩家索引）
  properties: Record<number, PropertyState>;
  pendingTrade?: TradeOffer | null;
  auction?: AuctionState | null;
  logs: LogEntry[];
  winner: number | null;
  moveAnimationStep: number;
  pendingFateCard?: FateCard | null;
  pendingChanceCard?: ChanceCard | null;
  pendingChoiceCard?: {
    cardId: number;
    cardType: 'fate' | 'chance';
    options: Array<{ label: string; effect: CardEffect }>;
  } | null;
  // 股票系统
  stocks: Record<StockSymbol, number>;
  stockStates?: Record<StockSymbol, StockState>;
  // 全局事件系统
  globalEventTurnCounter: number;
  currentGlobalEvent: GlobalEventType | null;
  globalEventMultipliers: GlobalEventMultipliers;
  // 自定义规则（custom 模式使用）
  customRules?: CustomGameRules;
  // 游戏统计
  totalTurns: number;
  // 天气系统
  currentWeather: WeatherType;
  weatherMultipliers: WeatherMultipliers;
  // 道具商店
  shopItems: ItemType[];
  shopRefreshTurn: number;
  // 迷你游戏
  pendingMiniGame: MiniGameState | null;
  // 合作模式
  isCoopMode?: boolean;
  teams?: Record<TeamId, TeamState>;
  // 大逃杀模式
  isBattleRoyale?: boolean;
  destroyedCells?: number[];
  destroyedSides?: BoardSide[];
  shrinkTurnCountdown?: number;
  finalBattle?: boolean;
  alivePlayersCount?: number;
  // 通货膨胀系统
  inflationRate?: number;
  // 债券系统
  bonds?: Bond[];
  // 每日挑战
  challengeType?: DailyChallengeType;
  maxTurns?: number;
  // 模組（啟用的模組ID列表）
  mods?: string[];
  // 任務系統
  missions?: Mission[];
  // 隨機地圖
  isRandomBoard?: boolean;
  boardSeed?: number;
  boardCells?: CellConfig[];
  // 動態棋盤
  cellEffects?: Record<number, TemporaryCellEffect>;
  // NPC 系統
  npcs?: NpcEntity[];
  pendingNpcInteraction?: NpcInteractionState | null;
  // 連鎖破產：本局破產玩家索引列表（按破產順序）
  bankruptcyList?: number[];
  // 地下市場贓物池
  stolenProperties?: StolenProperty[];
  // 腐敗系統：本局已賄賂次數
  bribeCount?: number;
  // 季節系統
  season?: SeasonState;
  // 災難系統
  disaster?: DisasterState;
  // 撤銷操作：最近一次可撤銷的操作（買地/建房，5秒內可撤）
  lastAction?: {
    type: 'buy' | 'build' | 'sell_building';
    playerIndex: number;
    cellId: number;
    timestamp: number;
    data?: Record<string, unknown>;
  };
  // 投降玩家索引列表（自願投降，區別於被動破產）
  surrenderedPlayers?: number[];
  // 劇情模式關卡
  storyLevel?: StoryLevelId;
  // 自訂地圖（base64 編碼）
  customMap?: string;
  // 回合倒計時
  turnStartTime?: number;  // 當前回合開始時間戳（ms）
  turnTimeLimit?: number;  // 當前遊戲的回合時間限制（秒），0 或 undefined 表示無限
  // 投資預告：即將漲價的地塊與剩餘回合數
  investmentPreview?: { cellId: number; turnsUntilHike: number };
  // 地產期貨（cellIndex -> 預定資訊）
  propertyFutures?: Record<number, PropertyFuture>;
  // 期權合約列表
  optionContracts?: OptionContract[];
  stockDerivatives?: StockDerivativeContract[];
  // 戰爭列表
  wars?: WarState[];
  // 間諜列表
  spies?: SpyState[];
  // 機器人代打（playerIndex -> 剩餘回合數）
  robotProxy?: Record<number, number>;
  // 時間旅行快照（playerIndex -> {position, money, turn}）
  timeTravelSnapshots?: Record<number, TimeTravelSnapshot>;
  // 平行世界狀態
  parallelWorld?: ParallelWorldState | null;
  // 卡牌連鎖（playerIndex -> combo狀態）
  cardCombo?: Record<number, CardComboState>;
  // 地產進化建材（playerIndex -> 建材數量）
  buildingMaterials?: Record<number, number>;
  // 命運卡/機會卡牌堆（索引數組，抽完自動重洗）
  fateDeck?: number[];
  fateDeckIndex?: number;
  chanceDeck?: number[];
  chanceDeckIndex?: number;
  // 收藏圖鑑解鎖狀態
  codexUnlocked?: CodexState;
  // 競速模式
  raceMode?: RaceModeState | null;
  // 生存模式
  survivalMode?: boolean;
  // 合作打Boss模式
  coopBossMode?: CoopBossModeState | null;
  // 奪寶模式
  treasureMode?: TreasureModeState | null;
  // 皇帝模式
  emperorMode?: EmperorModeState | null;
  // 黑暗模式（霧戰）
  darkMode?: boolean;
  // 閃電戰模式
  lightningMode?: { maxTurns: number };
  // 資源爭奪模式
  resourceMode?: {
    dataCoreCellId: number;
    collectAmount: number;
    stealAmount: number;
    targetResources: number;
  };
  // 團隊死鬥模式（復用合作隊伍機制）
  teamDeathmatchMode?: boolean;
  // 暗網模式
  darknetMode?: { feeRate: number };
  // 聯盟系統：活躍的聯盟列表
  alliances?: AllianceState[];
  // 聯盟邀請：toPlayer -> fromPlayer
  pendingAllianceInvites?: Record<number, number>;
  // 黑市拍賣狀態
  blackMarketAuction?: BlackMarketAuctionState | null;
  // 黑市拍賣下次觸發的回合數（絕對回合）
  nextBlackMarketTurn?: number;
  // 霓虹賭城模式
  casinoMode?: CasinoModeState | null;
  // 金融王朝模式
  dynastyMode?: DynastyModeState | null;
}

export interface CodexState {
  properties: number[];
  cards: string[];
  items: string[];
  pets: string[];
  mounts: string[];
}

// ========== 霓虹賭城模式 ==========

export interface CasinoModeState {
  // 每次賭博事件（每輪自動觸發一次小賭局）的進行次數
  gambleCount: number;
  // 賭場倍率：過路費與賭博獎勵的波動倍數
  volatility: number;
}

// ========== 金融王朝模式 ==========

export interface DynastyModeState {
  // 每個成套地產每回合被動股息倍率（相對於該組地產 basePrice 之和）
  dividendRate: number;
  // 併購強化：成套數量提供的全局過路費加成
  acquisitionBonus: number;
}

// ========== 競速模式 ==========

export interface RaceModeState {
  lapsCompleted: number[];  // playerIndex -> 已完成圈數
  requiredLaps: number;
}

// ========== 合作打Boss模式 ==========

export interface CoopBossModeState {
  bossIndex: number;
  bossMoneyMultiplier: number;
}

// ========== 奪寶模式 ==========

export interface TreasureModeState {
  treasurePosition: number;
  treasureCarrier: number | null;
  treasureDropPosition: number | null;
}

// ========== 皇帝模式 ==========

export interface EmperorModeState {
  emperorIndex: number | null;
  emperorBuff: string | null;
  emperorBuffTurns: number;
}

// ========== 地產期貨 ==========

export interface PropertyFuture {
  playerIndex: number;
  deposit: number;
  expiresTurn: number;
}

// ========== 期權交易 ==========

export type OptionType = 'call' | 'put';

export interface OptionContract {
  id: number;
  type: OptionType;
  buyerIndex: number;
  sellerIndex: number;
  cellIndex: number;
  strikePrice: number;
  premium: number;
  expiresTurn: number;
  exercised: boolean;
}

// ========== 股票期貨期權 ==========

export type StockDerivativeKind = 'futures' | 'call' | 'put';

export interface StockDerivativeContract {
  id: number;
  kind: StockDerivativeKind;
  symbol: StockSymbol;
  playerIndex: number;
  strikePrice: number;
  cost: number;
  expiresTurn: number;
  settled: boolean;
  quantity: number;
}

// ========== 戰爭系統 ==========

export interface WarState {
  attackerIndex: number;
  defenderIndex: number;
  remainingTurns: number;
}

// ========== 時間旅行系統 ==========

export interface TimeTravelSnapshot {
  position: number;
  money: number;
  turn: number;
}

// ========== 平行世界系統 ==========

export interface ParallelWorldState {
  active: boolean;
  affectedPlayerIndex: number;
  remainingTurns: number;
  parallelCells: Record<number, ParallelCellState>;
  originalPosition: number;
}

export interface ParallelCellState {
  owner: number; // -1 = 無主
  price: number;
  ownedByAffectedPlayer?: boolean;
}

// ========== 卡牌連鎖系統 ==========

export type CardStreakType = 'gain' | 'lose' | 'neutral';

export interface CardComboState {
  lastCardType: CardStreakType | null;
  streak: number;
  streakType: CardStreakType | null;
  badLuckInsurance: boolean;
  freeNextDraw: boolean;
}

// ========== 地產進化系統 ==========
// （EvolutionLevel 已在上方道具區定義）

// ========== 間諜系統 ==========

export interface SpyState {
  spyIndex: number;
  targetIndex: number;
  remainingTurns: number;
}

// ========== 地下市场 ==========

export interface StolenProperty {
  cellId: number;
  stolenFrom: number;  // 原主人索引
  stolenBy: number;    // 偷走的玩家索引（不一定在售）
  forSale: boolean;    // 是否在地下市场出售
  price: number;       // 售价（市价的 discount 比例）
  discount?: number;   // 折扣比例（0~1），默認 0.4
}

// ========== 债券系统 ==========

export interface Bond {
  id: string;
  issuerId: number;          // 发行者玩家索引
  holderId: number | null;   // 持有者（认购者），null=未被认购
  amount: number;            // 债券面额（本金）
  interestRate: number;      // 利息率（如 0.2 表示 20%）
  turnsRemaining: number;    // 剩余回合数（到期时为0触发偿还）
  active: boolean;           // 是否有效（已偿还则为false）
  status: 'issued' | 'subscribed' | 'matured' | 'defaulted' | 'repaid';
}

export interface CardBuff {
  type: string;
  duration: number;
  description: string;
}

export interface FateCard {
  id: number;
  name: string;
  description: string;
  effect: CardEffect;
  isChain?: boolean;
  isChoice?: boolean;
  choiceOptions?: [
    { label: string; effect: CardEffect },
    { label: string; effect: CardEffect },
  ];
  duration?: number;
  buffType?: string;
}

export interface ChanceCard {
  id: number;
  name: string;
  description: string;
  effect: CardEffect;
  isChain?: boolean;
  isChoice?: boolean;
  choiceOptions?: [
    { label: string; effect: CardEffect },
    { label: string; effect: CardEffect },
  ];
  duration?: number;
  buffType?: string;
}

export interface ChatMessage {
  id: number;          // 自增id
  sender: -1 | number; // -1=系统, 其余为玩家索引
  senderName: string;
  content: string;
  type: "player" | "system" | "voice"; // 玩家消息/系统消息/語音轉文字
  timestamp: string;   // ISO string
}

// ========== 语音聊天 ==========

export interface VoiceToggleRequest {
  roomCode: string;
  playerIndex: number;
  muted: boolean;
}

// ========== 观战模式 ==========

export interface Spectator {
  id: string;          // 观战者ID（visitorId）
  nickname: string;    // 昵称
  following?: number;  // 跟随的玩家索引，undefined=自由视角
}

export interface DanmakuMessage {
  id: number;
  sender: string;      // visitorId
  senderName: string;  // 昵称
  content: string;
  color?: string;      // 霓虹顏色
  timestamp: string;   // ISO string
}

export interface SpectatorJoinRequest {
  roomCode: string;
  visitorId: string;
  nickname: string;
}

export interface SpectatorLeaveRequest {
  roomCode: string;
  visitorId: string;
}

export interface SpectatorFollowRequest {
  roomCode: string;
  visitorId: string;
  followPlayer: number | null;
}

export interface DanmakuRequest {
  roomCode: string;
  visitorId: string;
  nickname: string;
  content: string;
  color?: string;
}

export interface DisconnectStatus {
  disconnectedPlayer: number | null;
  disconnectedAt: number;
  result: "waiting" | "forfeit" | null;
}

export interface SendChatResponse {
  success: boolean;
  messageId: number;
}

export interface MarkChatReadRequest {
  roomCode: string;
  playerIndex: number;
}

export interface MarkChatReadResponse {
  success: boolean;
}

export interface HeartbeatRequest {
  roomCode: string;
  playerIndex: number;
}

export interface HeartbeatResponse {
  success: boolean;
  disconnectedPlayers: number[];
  /** @deprecated 向后兼容 */
  disconnectedPlayer: number | null;
}

export interface SurrenderDisconnectedRequest {
  roomCode: string;
  playerIndex: number;
}

export interface SurrenderDisconnectedResponse {
  success: boolean;
  reason: string;
}

export interface RoomPlayer {
  name: string;
  color: PlayerColor;
  ready: boolean;
  isOnline: boolean;
  visitorId?: string;
}

export interface RoomState {
  id: string;
  roomCode: string;
  gameMode: GameMode;
  maxPlayers: number; // 2/4/6
  players: RoomPlayer[]; // 玩家列表
  hostIndex: number; // 房主索引
  status: RoomStatus;
  gameState: GameState | null;
  myPlayerIndex?: number; // 请求者的索引（返回时填充）
  // 聊天相关
  messages: ChatMessage[];
  unreadCount: number; // 请求者的未读数
  // 语音相关
  voiceActive?: boolean;           // 是否开启语音
  voiceParticipants?: number[];    // 当前开麦的玩家索引列表
  // 观战相关
  spectators?: Spectator[];        // 观战者列表
  danmaku?: DanmakuMessage[];      // 弹幕列表
  // 断线相关
  disconnectedPlayers: number[]; // 断线的玩家索引列表
  // 房间公开与密码
  isPublic?: boolean;            // 是否公开房间，默认 true
  hasPassword?: boolean;         // 是否有密码（列表对外暴露用）
  // ===== 向后兼容字段（旧客户端） =====
  hostName: string;
  guestName: string | null;
  unreadHost: number;
  unreadGuest: number;
  hostLastSeen: string | null;
  guestLastSeen: string | null;
  disconnectedPlayer: number | null;
  chatMessages: ChatMessage[];
  hostLastActiveAt: number;
  guestLastActiveAt: number;
  disconnectStatus: DisconnectStatus | null;
}

export interface CreateRoomRequest {
  hostName: string;
  gameMode?: GameMode;
  maxPlayers?: number; // 默认 2，支持 2/4/6
  visitorId?: string;
  password?: string;   // 4位数字密码（可选，空表示无密码）
  isPublic?: boolean;  // 是否公开房间，默认 true
  defaultAuctionMode?: 'open' | 'blind';  // 默认拍卖模式
  turnTimeLimit?: number;  // 回合時間限制（秒），0 或 undefined 表示無限
}

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
  /** @deprecated 向后兼容，等同于 playerName */
  guestName?: string;
  visitorId?: string;
  password?: string;   // 房间密码（有密码的房间需提供）
}

export interface LeaveRoomRequest {
  roomCode: string;
  visitorId?: string;
}

export interface TransferHostRequest {
  fromVisitorId: string;
  toPlayerIndex: number;
}

export interface StartGameRequest {
  roomCode: string;
  gameMode: GameMode;
  playerIndex: number; // 必须等于 hostIndex 才能开始
  challenge?: DailyChallengeType;
}

export interface RollDiceRequest {
  roomCode: string;
  playerIndex: number;
}

export interface BuyPropertyRequest {
  roomCode: string;
  playerIndex: number;
  buy: boolean;
}

export interface BuildHouseRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface DemolishRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface ChooseUpgradePathRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
  path: PropertyUpgradePath;
}

export interface AllianceInviteRequest {
  roomCode: string;
  playerIndex: number;
  targetPlayerIndex: number;
}

export interface AllianceActionRequest {
  roomCode: string;
  playerIndex: number;
}

export interface BlackMarketBidRequest {
  roomCode: string;
  playerIndex: number;
  itemIndex: number;
  bidAmount: number;
}

export interface BlackMarketFinalizeRequest {
  roomCode: string;
  playerIndex: number;
}

export interface MortgageRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface RedeemRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface ProposeTradeRequest {
  roomCode: string;
  playerIndex: number;
  targetPlayerIndex: number;
  givenProperties: number[];
  receivedProperties: number[];
  moneyAmount: number;
}

export interface TradeResponseRequest {
  roomCode: string;
  playerIndex: number;
  accept: boolean;
}

export interface AuctionBidRequest {
  roomCode: string;
  playerIndex: number;
  bidAmount: number;
}

export interface AuctionPassRequest {
  roomCode: string;
  playerIndex: number;
}

export interface SelectProfessionRequest {
  roomCode: string;
  playerIndex: number;
  profession: Profession;
}

export interface BuyStockRequest {
  roomCode: string;
  playerIndex: number;
  symbol: StockSymbol;
  quantity: number;
}

export interface SellStockRequest {
  roomCode: string;
  playerIndex: number;
  symbol: StockSymbol;
  quantity: number;
}

export interface ForceAcquireRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface ShareholderMeetingRequest {
  roomCode: string;
  playerIndex: number;
  symbol: StockSymbol;
  direction: 'up' | 'down';
}

export interface UndergroundMarketBuyRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface BribeBankRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface BuyItemRequest {
  roomCode: string;
  playerIndex: number;
  itemType: ItemType;
}

export interface UseItemRequest {
  roomCode: string;
  playerIndex: number;
  itemId: number;
  targetCellId?: number;
  remoteDiceValues?: [number, number];
}

export interface PayBailRequest {
  roomCode: string;
  playerIndex: number;
}

export interface MiniGameActionRequest {
  roomCode: string;
  playerIndex: number;
  action: 'start' | 'spin_slots' | 'blackjack_hit' | 'blackjack_stand' | 'guess_big' | 'guess_small' | 'guess_leopard' | 'finish';
  data?: unknown;
}

export interface TakeLoanRequest {
  roomCode: string;
  playerIndex: number;
  amount: number;
}

export interface RepayLoanRequest {
  roomCode: string;
  playerIndex: number;
  amount: number;
}

export interface BuyInsuranceRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface UpgradeSkillRequest {
  roomCode: string;
  playerIndex: number;
  skillId: string;
}

export interface BuildSpecialBuildingRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
  buildingType: string;
}

export interface DemolishSpecialBuildingRequest {
  roomCode: string;
  playerIndex: number;
  cellId: number;
}

export interface IssueBondRequest {
  roomCode: string;
  playerIndex: number;
  amount: number;
  interestRate: number;
  turns: number;
}

export interface SubscribeBondRequest {
  roomCode: string;
  playerIndex: number;
  bondId: string;
}

export interface SendChatMessageRequest {
  roomCode: string;
  playerIndex: number;
  content: string;
  type?: "player" | "voice";
}

export interface AuctionStartRequest {
  roomCode: string;
  playerIndex: number;
}

export interface PlayerStats {
  name: string;
  finalMoney: number;
  propertyCount: number;
  totalBuildings: number;
  totalHouses: number;
  totalHotels: number;
  tollIncome: number;
  tollExpense: number;
  stockProfit: number;
  stockValue: number;
  fateCardDraws: number;
  chanceCardDraws: number;
  detentionCount: number;
  tradeCount: number;
  auctionWins: number;
  completeSets: number;
  totalAssets: number;
}

export interface GameStats {
  totalTurns: number;
  winner: number | null;
  winReason: "bankruptcy" | "surrender" | null;
  players: PlayerStats[];
}

export interface PlayerConfig {
  name: string;
  color: PlayerColor;
  isAI: boolean;
  aiDifficulty?: "easy" | "normal" | "hard" | "hell";
  aiPersonality?: "conservative" | "aggressive" | "speculator" | "trader" | "vengeful" | "gambler";
}

// ===== 快速匹配 =====

export interface MatchJoinRequest {
  visitorId: string;
  nickname: string;
  gameMode: GameMode;
  maxPlayers: number;
}

export interface MatchJoinResponse {
  inQueue: boolean;
  position: number;
  waitedSeconds: number;
}

export interface MatchStatusResponse {
  inQueue: boolean;
  position: number;
  waitedSeconds: number;
  matchedRoomCode: string | null;
  playerIndex: number | null;
  gameMode: string | null;
  maxPlayers: number | null;
}

export interface MatchLeaveRequest {
  visitorId: string;
}

export interface MatchLeaveResponse {
  success: boolean;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

// ========== 排行榜 & 玩家资料 ==========

export type LeaderboardType =
  | 'elo'
  | 'wins'
  | 'season'
  | 'total-networth'
  | 'peak-networth'
  | 'fastest-win'
  | 'achievement-points'
  | 'collection-completion';

export type LeaderboardScope = 'global' | 'regional' | 'friends';

export type LeaderboardRegion = 'asia' | 'north-america' | 'europe';

export interface PlayerProfile {
  visitorId: string;
  nickname: string;
  elo: number;
  wins: number;
  losses: number;
  totalTurns: number;
  highestAssets: number;
  seasonWins: number;
  seasonElo: number;
  currentSeason: string;
  title: string;
  winRate: number;
}

export interface LeaderboardItem {
  visitorId: string;
  rank: number;
  nickname: string;
  elo: number;
  wins: number;
  losses: number;
  seasonWins: number;
  seasonElo: number;
  winRate: number;
  title: string;
  highestAssets?: number;
  totalAssets?: number;
  peakAssets?: number;
  fastestWinMinutes?: number;
  achievementPoints?: number;
  collectionCompletion?: number;
  guildName?: string;
  avatar?: string;
  rankChange: number;
  isNew: boolean;
  tier?: string;
  region?: LeaderboardRegion;
}

export interface SeasonCountdown {
  seasonName: string;
  endsAt: string;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
}

export interface LeaderboardRule {
  type: LeaderboardType;
  name: string;
  calculationRule: string;
  updateFrequency: string;
  rewards: string[];
}

export interface WeeklyReward {
  rank: string;
  reward: string;
  rewardType: 'coins' | 'title' | 'item' | 'skin';
  value: number;
}

export type TaskStatus = 'incomplete' | 'completed' | 'claimed';

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: { coins?: number; exp?: number; item?: string };
  status: TaskStatus;
}

export interface WeeklyTask {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: { coins?: number; exp?: number; item?: string };
  status: TaskStatus;
}

export interface CheckInDay {
  day: number;
  reward: string;
  rewardType: 'coins' | 'item' | 'title' | 'skin';
  value: number;
  checked: boolean;
  isToday: boolean;
  canRetro: boolean;
}

export interface ActivityEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  color: string;
  banner?: string;
}

export interface LimitedMode {
  id: string;
  name: string;
  description: string;
  weekLabel: string;
  modifier: string;
  color: string;
  startDate: string;
  endDate: string;
}

export interface GetOrCreatePlayerRequest {
  visitorId: string;
  nickname?: string;
}

export interface UpdateNicknameRequest {
  visitorId: string;
  nickname: string;
}

export interface LeaderboardQuery {
  type: LeaderboardType;
  limit?: number;
}

export interface PlayerRankInfo {
  elo: number;
  wins: number;
  season: number;
}

export interface LeaderboardResponse {
  items: LeaderboardItem[];
  myRank: LeaderboardItem | null;
  total: number;
}

// ========== 跨平台存檔同步 ==========

export interface UserSettings {
  theme?: 'cyber' | string;
  fontSize?: 'normal' | 'large' | 'xlarge';
  colorblindMode?: boolean;
  voicePack?: string;
  soundVolume?: number;
  musicVolume?: number;
  danmakuEnabled?: boolean;
  danmakuSpeed?: number;
  danmakuOpacity?: number;
}

export interface MatchHistoryItem {
  id: string;
  date: string;
  mode: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  duration: number;  // 秒
  finalAssets: number;
  profession?: string;
  rank?: number;           // 排名（多人模式）
  highestAssets?: number;  // 本局最高資產
  totalIncome?: number;    // 本局總收入
  totalExpense?: number;   // 本局總支出
  tollIncome?: number;     // 過路費收入
  propertyInvestment?: number; // 地產投資總額
  propertiesOwned?: number;    // 擁有過的地產數
  housesBuilt?: number;        // 建造房屋總數
  hotelsBuilt?: number;        // 建造酒店總數
  fateCardsDrawn?: number;     // 命運卡抽取次數
  chanceCardsDrawn?: number;   // 機會卡抽取次數
  mostDrawnCard?: string;      // 抽中最多的卡牌名
  currentStreak?: number;      // 結束時當前連勝
  isWinStreak?: boolean;       // 是否為勝利連勝狀態
}

export interface UserSaveData {
  achievements: string[];          // 已解鎖成就ID列表
  settings: UserSettings;          // 用戶設置
  skins: { pawn?: string; dice?: string }; // 皮膚選擇
  battlePass: BattlePassState;     // 通行證狀態
  dailyChallenge: DailyChallenge;  // 每日挑戰進度
  matchHistory: MatchHistoryItem[]; // 對局記錄
  updatedAt: string;               // 更新時間 ISO
}

export interface SyncSaveRequest {
  saveData: UserSaveData;
  clientUpdatedAt: string;
  visitorId: string;
}

export interface SyncSaveResponse {
  saveData: UserSaveData;
  updatedAt: string;
  conflict?: boolean;  // 是否有衝突
  serverUpdatedAt: string;
}

// ========== 模組支持 ==========

export interface ModCardEffect {
  type: 'money' | 'teleport' | 'move' | 'jail' | 'card';
  value: number | string;
}

export interface ModCard {
  id: string;
  type: 'fate' | 'chance';
  name: string;
  description: string;
  effect: ModCardEffect;
}

export interface ModProperty {
  cellId: number;       // 替換哪個格子，或新增位置
  name: string;
  basePrice: number;
  type?: 'property' | 'fate' | 'chance' | 'start' | 'detention';
  colorSet?: string;
}

export interface ModRules {
  startMoney?: number;
  rentMultiplier?: number;
  passStartBonus?: number;
  maxTurns?: number;
  specialVictory?: 'assets' | 'properties' | 'money';
}

// ========== NPC 系統 ==========

export type NpcType = 'wanderer' | 'hacker';

export interface NpcEntity {
  id: string;
  type: NpcType;
  cellId: number;
  name: string;
}

export interface NpcInteractionState {
  npcId: string;
  npcType: NpcType;
  playerIndex: number;
  cellId: number;
}

export interface NpcBuyItemRequest {
  roomCode: string;
  playerIndex: number;
  itemType: string;
}

export interface NpcHireHackerRequest {
  roomCode: string;
  playerIndex: number;
  targetPlayerIndex: number;
}

export interface NpcCloseRequest {
  roomCode: string;
  playerIndex: number;
}

export interface BlindBidRequest {
  roomCode: string;
  playerIndex: number;
  bidAmount: number;
}

export interface RevealBlindBidsRequest {
  roomCode: string;
}

export interface Mod {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  cards?: ModCard[];       // 自定義命運/機會卡
  properties?: ModProperty[]; // 自定義地塊（替換已有或新增）
  rules?: ModRules;        // 自定義規則
  category?: 'gameplay' | 'visual'; // 模組分類
  conflictsWith?: string[]; // 不相容的模組 ID 列表
  isBuiltin?: boolean;     // 是否為內建模組
  iconKey?: string;        // 圖示鍵名
  isFeatured?: boolean;    // 是否為精選模組
}

// ========== 回放系統 ==========

export type ReplayActionType =
  | 'roll'
  | 'buy'
  | 'pass'
  | 'build'
  | 'demolish'
  | 'pay_toll'
  | 'draw_fate'
  | 'draw_chance'
  | 'go_to_start'
  | 'auction_start'
  | 'auction_bid'
  | 'auction_end'
  | 'trade_propose'
  | 'trade_accept'
  | 'trade_reject'
  | 'use_item'
  | 'buy_item'
  | 'force_acquire'
  | 'bribe'
  | 'bankruptcy'
  | 'game_end'
  | 'stock_buy'
  | 'stock_sell'
  | 'season_change'
  | 'disaster'
  | 'turn_end';

export interface ReplayLogEntry {
  turn: number;
  playerIndex: number;
  action: ReplayActionType;
  payload?: Record<string, unknown>;
  stateSnapshot?: GameState;
  timestamp: number;
}

export interface ReplayData {
  id: string;
  gameMode: string;
  players: Array<{ name: string; color: string }>;
  log: ReplayLogEntry[];
  finalState: GameState;
  createdAt: string;
  duration: number;
  winner?: string;
  totalTurns: number;
}

// ========== 好友系統 ==========

export type FriendStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type OnlineStatus = 'online' | 'in_game' | 'away' | 'offline';

export interface FriendInfo {
  userId: string;
  nickname: string;
  avatar?: string;
  status: FriendStatus;
  onlineStatus: OnlineStatus;
  remark?: string;
  addedAt: string;
  unreadCount?: number;
}

export interface FriendMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: 'text' | 'emoji' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface SearchUserResult {
  userId: string;
  nickname: string;
  avatar?: string;
  isFriend: boolean;
}

export interface AddFriendRequest {
  targetUserId: string;
  remark?: string;
}

export interface FriendActionRequest {
  friendUserId: string;
  action: 'accept' | 'reject' | 'remove' | 'block';
}

export interface SendMessageRequest {
  toUserId: string;
  content: string;
}

export interface MarkMessagesReadRequest {
  fromUserId: string;
}

// ========== 帳號系統 ==========

export interface AccountProfile {
  id: string;
  username: string;
  nickname: string;
  avatarFrame: string;
  elo: number;
  wins: number;
  losses: number;
  coins: number;
  level: number;
  isBanned: boolean;
  banReason?: string;
  lastLoginAt?: string;
  unlockedSkins: string[];
  unlockedTitles: string[];
  unlockedAchievements: Record<string, boolean>;
  inventory: { coins: number; items: Record<string, number> };
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  account: AccountProfile;
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatarFrame?: string;
}

export type OAuthProvider = 'google' | 'apple' | 'github';

export interface OAuthUserInfo {
  provider: OAuthProvider;
  providerUserId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface OAuthAuthResponse extends AuthResponse {
  isNewUser: boolean;
  needsNicknameSetup: boolean;
}

export interface OAuthUrlResponse {
  authorizationUrl: string;
  provider: OAuthProvider;
}

export interface OAuthBinding {
  provider: OAuthProvider;
  displayName?: string;
  email?: string;
  boundAt: string;
}

export interface OAuthBindingsResponse {
  bindings: OAuthBinding[];
  hasPassword: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  elo: number;
  wins: number;
  isGuest: boolean;
  avatarFrame: string;
}

// ========== 公告與活動 ==========

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

// ========== 每日签到 ==========

export interface CheckinStatusResponse {
  canCheckin: boolean;
  streak: number;
  totalDays: number;
  currentDay: number;
  coins: number;
  lastCheckinDate: string;
  weeklyRewards: CheckinWeeklyReward[];
}

export interface CheckinWeeklyReward {
  day: number;
  coins: number;
  isGrandPrize?: boolean;
  bonus?: string;
  bonusName?: string;
}

export interface CheckinPerformResponse {
  success: boolean;
  alreadyChecked: boolean;
  reward: CheckinWeeklyReward;
  isGrandPrize: boolean;
  streak: number;
  streakDay: number;
  totalDays: number;
  coins: number;
  newCoins: number;
}

export interface GlobalEventConfig {
  id: string;
  eventType: string;
  name: string;
  description?: string;
  isActive: boolean;
  config: Record<string, unknown>;
  startsAt?: string;
  endsAt?: string;
}

// ========== GM 管理器 ==========

export interface GmLoginRequest {
  password: string;
}

export interface GmUserSearchResult {
  id: string;
  username: string;
  nickname: string;
  avatarFrame: string;
  elo: number;
  wins: number;
  losses: number;
  coins: number;
  level: number;
  isBanned: boolean;
  createdAt: string;
  oauthBindings: GmOAuthBinding[];
}

export interface GmOAuthBinding {
  provider: OAuthProvider;
  providerUserId: string;
  displayName?: string;
  email?: string;
  boundAt: string;
}

export interface GmUpdateUserRequest {
  elo?: number;
  wins?: number;
  losses?: number;
  coins?: number;
  level?: number;
  isBanned?: boolean;
  banReason?: string;
  unlockedSkins?: string[];
  unlockedTitles?: string[];
}

export interface GmSendRewardRequest {
  userId: string;
  coins?: number;
  items?: Record<string, number>;
  skins?: string[];
  reason?: string;
}

export interface GmCreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: number;
}

export interface GmToggleEventRequest {
  eventId: string;
  isActive: boolean;
}

export interface WinRateTrendPoint {
  gameIndex: number;
  cumulativeWinRate: number;
}

export interface ModeWinRateItem {
  mode: string;
  wins: number;
  total: number;
  winRate: number;
}

export interface ClassWinRateItem {
  className: string;
  wins: number;
  total: number;
  winRate: number;
  favorite: boolean;
}

export interface PropertyROIItem {
  propertyName: string;
  cost: number;
  rentEarned: number;
  roi: number;
}

export interface ItemUsageItem {
  itemName: string;
  count: number;
  ratio: number;
}

export interface FateCardStatItem {
  cardName: string;
  type: 'good' | 'bad';
  count: number;
  probability: number;
}

export interface GameTimeBucket {
  range: string;
  count: number;
  ratio: number;
}

export interface MatchTimelineEvent {
  turn: number;
  action: string;
  netWorthChange: number;
  event?: string;
}

export interface MatchReport {
  matchId: string;
  startTime: string;
  endTime: string;
  duration: number;
  result: 'win' | 'loss' | 'draw';
  finalNetWorth: number;
  rank: number;
  classUsed: string;
  itemsUsed: string[];
  timeline: MatchTimelineEvent[];
}

export interface StatsDashboard {
  totalMatches: number;
  totalWins: number;
  winRate: number;
  maxWinStreak: number;
  maxLoseStreak: number;
  totalPlayTimeHours: number;
  peakNetWorth: number;
  winRateTrend: WinRateTrendPoint[];
  modeWinRates: ModeWinRateItem[];
  classWinRates: ClassWinRateItem[];
  propertyROI: PropertyROIItem[];
  itemUsage: ItemUsageItem[];
  fateCardStats: FateCardStatItem[];
  gameTimeDistribution: GameTimeBucket[];
  recentMatches: MatchReport[];
}
