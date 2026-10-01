import { Inject, Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger, OnModuleDestroy, OnModuleInit, ConflictException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { Subject, type Observable } from 'rxjs';

import { monopolyRoom } from '@server/database/schema';
import { RankingService } from '../ranking/ranking.service';
import type {
  GameState,
  GameMode,
  RoomState,
  RoomPlayer,
  Profession,
  StockSymbol,
  ChatMessage,
  DisconnectStatus,
  PlayerColor,
  ItemType,
  Spectator,
   DanmakuMessage,
   DailyChallengeType,
   UserSaveData,
   SyncSaveResponse,
   CustomGameRules,
    PlayerConfig,
    PropertyUpgradePath,
  } from '@shared/api.interface';
import {
  createInitialState,
  rollDice,
  processMove,
  applyBuyDecision,
  applyFateCard,
  applyChanceCard,
  applyAIDecision,
  buildHouse as engineBuildHouse,
  demolishBuilding as engineDemolishBuilding,
  mortgageProperty as engineMortgageProperty,
  redeemProperty as engineRedeemProperty,
  proposeTrade as engineProposeTrade,
  acceptTrade as engineAcceptTrade,
  rejectTrade as engineRejectTrade,
  startAuction as engineStartAuction,
  placeBid as enginePlaceBid,
  passAuction as enginePassAuction,
  aiBuildDecision,
  aiMortgageDecision,
  aiProposeTrade,
  aiShouldAcceptTrade,
  aiAuctionDecision,
  buyStock as engineBuyStock,
  sellStock as engineSellStock,
  aiStockTrade,
  buyItem as engineBuyItem,
  applyItem as engineUseItem,
  startMiniGame as engineStartMiniGame,
  miniGameAction as engineMiniGameAction,
  aiResolveMiniGame,
  aiUseItemIfNeeded,
  aiBuyItemIfNeeded,
  resolveNpcInteraction,
  buyFromMerchant as engineBuyFromMerchant,
  hireHacker as engineHireHacker,
  closeNpcInteraction as engineCloseNpcInteraction,
  aiBlindBid,
  submitBlindBid as engineSubmitBlindBid,
  revealBlindBids as engineRevealBlindBids,
  takeLoan as engineTakeLoan,
  repayLoan as engineRepayLoan,
  buyInsurance as engineBuyInsurance,
  upgradeSkill as engineUpgradeSkill,
  buildSpecialBuilding as engineBuildSpecialBuilding,
  demolishSpecialBuilding as engineDemolishSpecialBuilding,
  issueBond as engineIssueBond,
  subscribeBond as engineSubscribeBond,
  forceAcquireProperty as engineForceAcquireProperty,
  callShareholderMeeting as engineCallShareholderMeeting,
  undergroundMarketBuy as engineUndergroundMarketBuy,
  bribeBank as engineBribeBank,
  payBailRelease as enginePayBailRelease,
  normalizeGameState,
  chooseUpgradePath as engineChooseUpgradePath,
  sendAllianceInvite as engineSendAllianceInvite,
  acceptAllianceInvite as engineAcceptAllianceInvite,
  rejectAllianceInvite as engineRejectAllianceInvite,
  breakAlliance as engineBreakAlliance,
  placeBlackMarketBid as enginePlaceBlackMarketBid,
  finalizeBlackMarketAuction as engineFinalizeBlackMarketAuction,
} from '@shared/game-engine';
import { GAME_MODES } from '@shared/game-config';

function generateRoomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const MAX_CHAT_MESSAGES = 50;
const DISCONNECT_THRESHOLD_MS = 30_000;
const FORFEIT_THRESHOLD_MS = 60_000;

// 观战配置
const MAX_SPECTATORS = 50;
const MAX_DANMAKU = 100;
const DANMAKU_MAX_LENGTH = 50;

// 新聊天/断线系统（独立列存储）
const MAX_MESSAGES = 100;
const DISCONNECT_THRESHOLD_SECONDS = 15; // 15秒未心跳判定断线
const HEARTBEAT_DISCONNECT_SECONDS = 10; // 心跳接口检测阈值10秒
const SURRENDER_THRESHOLD_SECONDS = 60;   // 60秒断线可判负

// 玩家颜色（按索引顺序分配，最多6人）
const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const VALID_MAX_PLAYERS = [2, 4, 6];

interface PlayerNameEntry {
  name: string;
  color: PlayerColor;
  ready: boolean;
  visitorId?: string;
}

interface GameStateWithMeta extends GameState {
  chatMessages: ChatMessage[];
  hostLastActiveAt: number;
  guestLastActiveAt: number;
  disconnectStatus: DisconnectStatus | null;
  // 语音聊天
  voiceActive: boolean;
  voiceParticipants: number[];
  // 观战模式
  spectators: Spectator[];
  danmaku: DanmakuMessage[];
}

function enrichGameState(state: GameState | null): GameStateWithMeta {
  if (!state) {
    return {
      ...{} as GameState,
      chatMessages: [],
      hostLastActiveAt: 0,
      guestLastActiveAt: 0,
      disconnectStatus: null,
      voiceActive: false,
      voiceParticipants: [],
      spectators: [],
      danmaku: [],
    } as unknown as GameStateWithMeta;
  }
  const s = state as GameStateWithMeta;
  return {
    ...s,
    chatMessages: s.chatMessages ?? [],
    hostLastActiveAt: s.hostLastActiveAt ?? 0,
    guestLastActiveAt: s.guestLastActiveAt ?? 0,
    disconnectStatus: s.disconnectStatus ?? null,
    voiceActive: s.voiceActive ?? false,
    voiceParticipants: s.voiceParticipants ?? [],
    spectators: s.spectators ?? [],
    danmaku: s.danmaku ?? [],
  };
}

function parsePlayerNames(raw: unknown): PlayerNameEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    const obj = item as Record<string, unknown>;
    return {
      name: String(obj?.name ?? ''),
      color: (obj?.color as PlayerColor) ?? 'red',
      ready: Boolean(obj?.ready),
      visitorId: obj?.visitorId ? String(obj.visitorId) : undefined,
    };
  });
}

function parsePlayerLastSeen(raw: unknown): (string | null)[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    if (item === null || item === undefined) return null;
    return String(item);
  });
}

@Injectable()
export class MonopolyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonopolyService.name);

  // SSE 房间状态流：key=roomCode, value=Subject<RoomState>
  private readonly roomStreams = new Map<string, Subject<RoomState>>();
  private disconnectScanTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly rankingService: RankingService,
  ) {}

  onModuleInit(): void {
    this.disconnectScanTimer = setInterval(() => {
      this.scanWaitingRoomsForDisconnects().catch(() => {});
    }, 15000);
  }

  onModuleDestroy(): void {
    if (this.disconnectScanTimer) {
      clearInterval(this.disconnectScanTimer);
      this.disconnectScanTimer = null;
    }
    for (const subject of this.roomStreams.values()) {
      subject.complete();
    }
    this.roomStreams.clear();
  }

  // ========== SSE 实时推送 ==========

  /**
   * 取得使用者存檔資料（跨平台同步用）。
   * 若表不存在或無記錄則返回 null。
   */
  async getSaveData(visitorId: string): Promise<UserSaveData | null> {
    if (!visitorId) return null;
    try {
      const result = await this.db.execute(sql`
        SELECT save_data AS "saveData", _updated_at AS "updatedAt"
        FROM monopoly_user_saves
        WHERE visitor_id = ${visitorId}
        LIMIT 1
      `);
      const rows = result as unknown as Array<{ saveData: unknown; updatedAt: string }>;
      if (rows.length === 0) return null;
      const row = rows[0];
      const saveData = typeof row.saveData === 'string'
        ? JSON.parse(row.saveData)
        : row.saveData;
      return {
        ...(saveData as UserSaveData),
        updatedAt: new Date(row.updatedAt).toISOString(),
      };
    } catch (err) {
      // 表可能尚未建立，返回 null 而不報錯
      this.logger.warn(`getSaveData failed for visitor ${visitorId}: ${JSON.stringify(err)}`);
      return null;
    }
  }

  /**
   * 上傳/同步使用者存檔資料。
   * - 若客戶端更新時間 >= 服務端：直接覆蓋，返回最新資料
   * - 若服務端更新：返回衝突標記與服務端資料
   */
  async uploadSaveData(
    visitorId: string,
    saveData: UserSaveData,
    clientUpdatedAt: string,
  ): Promise<SyncSaveResponse> {
    const now = new Date();
    const nowIso = now.toISOString();

    // 嘗試查詢現有記錄
    const existing = await this.getSaveDataRaw(visitorId);

    if (!existing) {
      // 無現存記錄，直接插入
      try {
        const payload = { ...saveData, updatedAt: nowIso };
        const payloadJson = JSON.stringify(payload);
        await this.db.execute(sql`
          INSERT INTO monopoly_user_saves (visitor_id, save_data, _updated_at)
          VALUES (${visitorId}, ${payloadJson}::jsonb, ${nowIso}::timestamptz)
          ON CONFLICT (visitor_id) DO UPDATE
          SET save_data = EXCLUDED.save_data,
              _updated_at = EXCLUDED._updated_at
        `);
        return {
          saveData: payload,
          updatedAt: nowIso,
          serverUpdatedAt: nowIso,
          conflict: false,
        };
      } catch (err) {
        this.logger.warn(`uploadSaveData insert failed for visitor ${visitorId}: ${JSON.stringify(err)}`);
        // 失敗時仍返回客戶端資料（本地存檔優先）
        return {
          saveData: { ...saveData, updatedAt: clientUpdatedAt },
          updatedAt: clientUpdatedAt,
          serverUpdatedAt: clientUpdatedAt,
          conflict: false,
        };
      }
    }

    const serverTime = new Date(existing.updatedAt).getTime();
    const clientTime = new Date(clientUpdatedAt).getTime();

    // 客戶端更新或時間相同 → 覆蓋
    if (clientTime >= serverTime) {
      try {
        const payload = { ...saveData, updatedAt: nowIso };
        const payloadJson = JSON.stringify(payload);
        await this.db.execute(sql`
          UPDATE monopoly_user_saves
          SET save_data = ${payloadJson}::jsonb,
              _updated_at = ${nowIso}::timestamptz
          WHERE visitor_id = ${visitorId}
        `);
        return {
          saveData: payload,
          updatedAt: nowIso,
          serverUpdatedAt: nowIso,
          conflict: false,
        };
      } catch (err) {
        this.logger.warn(`uploadSaveData update failed for visitor ${visitorId}: ${JSON.stringify(err)}`);
        return {
          saveData: { ...saveData, updatedAt: clientUpdatedAt },
          updatedAt: clientUpdatedAt,
          serverUpdatedAt: existing.updatedAt,
          conflict: false,
        };
      }
    }

    // 服務端更新 → 衝突，返回服務端資料
    return {
      saveData: existing.saveData,
      updatedAt: existing.updatedAt,
      serverUpdatedAt: existing.updatedAt,
      conflict: true,
    };
  }

  /**
   * 內部：原始查詢存檔（返回原始行資料）。
   */
  private async getSaveDataRaw(
    visitorId: string,
  ): Promise<{ saveData: UserSaveData; updatedAt: string } | null> {
    if (!visitorId) return null;
    try {
      const result = await this.db.execute(sql`
        SELECT save_data AS "saveData", _updated_at AS "updatedAt"
        FROM monopoly_user_saves
        WHERE visitor_id = ${visitorId}
        LIMIT 1
      `);
      const rows = result as unknown as Array<{ saveData: unknown; updatedAt: string }>;
      if (rows.length === 0) return null;
      const row = rows[0];
      const saveData = typeof row.saveData === 'string'
        ? JSON.parse(row.saveData)
        : row.saveData;
      return {
        saveData: saveData as UserSaveData,
        updatedAt: new Date(row.updatedAt).toISOString(),
      };
    } catch {
      return null;
    }
  }

  /**

  /**
   * 获取房间状态的 Observable，用于 SSE 推送。
   * 房间不存在时返回 null。
   * 注意：Subject 是懒创建的，第一个订阅者到来时才建立。
   * 调用方应先确认房间存在（如调用 getRoom）。
   */
  getRoomStream(roomCode: string): Observable<RoomState> {
    if (!this.roomStreams.has(roomCode)) {
      this.roomStreams.set(roomCode, new Subject<RoomState>());
    }
    return this.roomStreams.get(roomCode)!.asObservable();
  }

  /**
   * 向所有订阅该房间的 SSE 客户端推送最新状态。
   */
  private notifyRoomUpdate(roomCode: string, roomState: RoomState): void {
    const subject = this.roomStreams.get(roomCode);
    if (subject) {
      subject.next(roomState);
    }
  }

  // ========== 房间管理 ==========

  async createRoom(params: {
    hostName: string;
    gameMode?: GameMode;
    maxPlayers?: number;
    visitorId?: string;
    password?: string;
    isPublic?: boolean;
    defaultAuctionMode?: 'open' | 'blind';
    turnTimeLimit?: number;
  }): Promise<RoomState> {
    const {
      hostName,
      gameMode = 'classic',
      maxPlayers: rawMax = 2,
      visitorId,
      password,
      isPublic = true,
      defaultAuctionMode,
      turnTimeLimit,
    } = params;
    // 合作模式 / 合作打Boss 强制4人
    const forcedMax = (gameMode === 'coop2v2' || gameMode === 'coop_boss') ? 4 : rawMax;
    const maxPlayers = VALID_MAX_PLAYERS.includes(forcedMax) ? forcedMax : 2;

    const roomCode = generateRoomCode();
    const now = new Date();
    const nowIso = now.toISOString();

    const playerNames: PlayerNameEntry[] = [
      { name: hostName, color: PLAYER_COLORS[0], ready: false, visitorId },
    ];
    const playerLastSeen: (string | null)[] = [nowIso];

    const initialMeta: Partial<GameStateWithMeta> & { _roomMeta?: { password?: string; isPublic: boolean; defaultAuctionMode?: 'open' | 'blind'; turnTimeLimit?: number } } = {
      chatMessages: [],
      hostLastActiveAt: now.getTime(),
      guestLastActiveAt: 0,
      disconnectStatus: null,
      _roomMeta: {
        password: password && password.length > 0 ? password : undefined,
        isPublic,
        defaultAuctionMode,
        turnTimeLimit,
      },
    };

    const result = await this.db
      .insert(monopolyRoom)
      .values({
        roomCode,
        hostName,
        gameMode,
        status: 'waiting',
        gameState: JSON.stringify(initialMeta) as unknown as Record<string, unknown>,
        messages: '[]' as unknown as Record<string, unknown>,
        unreadHost: 0,
        unreadGuest: 0,
        hostLastSeen: now,
        // 新字段（多人）
        maxPlayers,
        playerNames: JSON.stringify(playerNames) as unknown as Record<string, unknown>,
        hostIndex: 0,
        playerLastSeen: JSON.stringify(playerLastSeen) as unknown as Record<string, unknown>,
      } as unknown as typeof monopolyRoom.$inferInsert)
      .returning();

    const roomState = this.toRoomState(result[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  async closeRoom(roomCode: string): Promise<boolean> {
    const result = await this.db
      .update(monopolyRoom)
      .set({ status: 'closed' })
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning({ roomCode: monopolyRoom.roomCode });
    return result.length > 0;
  }

  async joinRoom(
    roomCode: string,
    playerName: string,
    visitorId?: string,
    password?: string,
  ): Promise<{ room: RoomState; playerIndex: number }> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'waiting') throw new BadRequestException('房间已开始游戏');

    const roomMeta = this.getRoomMeta(room);
    if (roomMeta.password && roomMeta.password.length > 0) {
      if (!password || password !== roomMeta.password) {
        throw new BadRequestException('房間密碼錯誤');
      }
    }

    const maxPlayers = this.getMaxPlayers(room);
    const playerNames = this.getPlayerNames(room);

    const existingIdx = playerNames.findIndex(p => p.visitorId === visitorId);
    if (existingIdx >= 0) {
      return { room: this.toRoomState(room), playerIndex: existingIdx };
    }

    if (playerNames.length >= maxPlayers) {
      throw new BadRequestException('房间已满');
    }

    const playerIndex = playerNames.length;
    const color = PLAYER_COLORS[playerIndex] ?? 'orange';

    const newPlayerNames: PlayerNameEntry[] = [
      ...playerNames,
      { name: playerName, color, ready: false, visitorId },
    ];

    const playerLastSeen = this.getPlayerLastSeen(room);
    const now = new Date();
    const nowIso = now.toISOString();
    const newLastSeen: (string | null)[] = [...playerLastSeen, nowIso];

    const guestPatch = playerIndex === 1
      ? { guestName: playerName, guestLastSeen: now }
      : {};

    // 條件更新：jsonb_array_length(player_names) < max_players 時才更新，避免並發滿員競態
    const updated = await this.db
      .update(monopolyRoom)
      .set({
        playerNames: JSON.stringify(newPlayerNames) as unknown as Record<string, unknown>,
        playerLastSeen: JSON.stringify(newLastSeen) as unknown as Record<string, unknown>,
        ...guestPatch,
      } as unknown as Record<string, unknown>)
      .where(and(
        eq(monopolyRoom.roomCode, roomCode),
        sql`jsonb_array_length(${monopolyRoom.playerNames}) < ${monopolyRoom.maxPlayers}`,
      ))
      .returning();

    if (updated.length === 0) {
      throw new BadRequestException('房间已满');
    }

    await this.addSystemMessageToColumn(roomCode, `玩家 ${playerName} 加入了房间`);

    const roomState = this.toRoomState(updated[0], playerIndex);
    this.notifyRoomUpdate(roomCode, roomState);

    return {
      room: roomState,
      playerIndex,
    };
  }

  async leaveRoom(
    roomCode: string,
    visitorId?: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');

    const playerNames = this.getPlayerNames(room);
    const playerLastSeen = this.getPlayerLastSeen(room);
    const hostIndex = this.getHostIndex(room);

    const idx = playerNames.findIndex((p: PlayerNameEntry) => p.visitorId === visitorId);
    if (idx < 0) {
      return this.toRoomState(room);
    }

    const newPlayerNames: PlayerNameEntry[] = [...playerNames];
    const removedName = newPlayerNames[idx].name;
    newPlayerNames.splice(idx, 1);

    const newLastSeen: (string | null)[] = [...playerLastSeen];
    newLastSeen.splice(idx, 1);

    let newStatus = room.status;
    let newHostIndex = hostIndex;

    if (newPlayerNames.length === 0) {
      newStatus = 'closed';
    } else if (idx === hostIndex) {
      newHostIndex = 0;
    }

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        playerNames: JSON.stringify(newPlayerNames) as unknown as Record<string, unknown>,
        playerLastSeen: JSON.stringify(newLastSeen) as unknown as Record<string, unknown>,
        status: newStatus,
        hostIndex: newHostIndex,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    await this.addSystemMessageToColumn(roomCode, `玩家 ${removedName} 离开了房间`);

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);

    return roomState;
  }

  async transferHost(
    roomCode: string,
    fromVisitorId: string,
    toPlayerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');

    const playerNames = this.getPlayerNames(room);
    const hostIndex = this.getHostIndex(room);

    const hostPlayer = playerNames[hostIndex];
    if (!hostPlayer || hostPlayer.visitorId !== fromVisitorId) {
      throw new ForbiddenException('只有房主能轉移房主');
    }

    if (toPlayerIndex < 0 || toPlayerIndex >= playerNames.length) {
      throw new BadRequestException('目標玩家索引無效');
    }

    if (toPlayerIndex === hostIndex) {
      return this.toRoomState(room);
    }

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        hostIndex: toPlayerIndex,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const newHostName = playerNames[toPlayerIndex].name;
    await this.addSystemMessageToColumn(roomCode, `房主已轉移給 ${newHostName}`);

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);

    return roomState;
  }

  async startGame(
    roomCode: string,
    hostIndex: number,
    gameMode: GameMode,
    challenge?: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status === 'playing') throw new BadRequestException('游戏已开始');
    if (room.status === 'ended') throw new BadRequestException('游戏已结束');

    const actualHostIndex = this.getHostIndex(room);
    if (hostIndex !== actualHostIndex) {
      throw new BadRequestException('只有房主可以开始游戏');
    }

    const playerNames = this.getPlayerNames(room);
    if (playerNames.length < 2) {
      throw new BadRequestException('至少需要2名玩家才能开始游戏');
    }
    // 合作模式强制4人
    if (gameMode === 'coop2v2' && playerNames.length !== 4) {
      throw new BadRequestException('合作模式 2v2 需要4名玩家');
    }
    // 大逃杀模式 4-6 人
    if (gameMode === 'battle_royale') {
      if (playerNames.length < 4 || playerNames.length > 6) {
        throw new BadRequestException('大逃杀模式需要4-6名玩家');
      }
    }
    // 合作打Boss模式：4名人类玩家 + 1名Boss AI（Boss不计入房间人数上限）
    if (gameMode === 'coop_boss' && playerNames.length !== 4) {
      throw new BadRequestException('合作打Boss模式需要4名玩家');
    }

    const playerConfigs: PlayerConfig[] = playerNames.map((p: PlayerNameEntry, i: number) => ({
      name: p.name,
      color: p.color,
      isAI: false,
    }));

    // 合作打Boss模式：在末尾注入 Boss AI 玩家
    if (gameMode === 'coop_boss') {
      playerConfigs.push({
        name: '終極Boss',
        color: PLAYER_COLORS[4] ?? 'purple',
        isAI: true,
        aiDifficulty: 'hell',
        aiPersonality: 'aggressive',
      });
    }
    const challengeType = (challenge as DailyChallengeType | undefined);
    const gsRaw = room.gameState as unknown as Record<string, unknown> | null;
    const roomMeta = gsRaw?._roomMeta as Record<string, unknown> | undefined;
    const auctionMode = roomMeta?.defaultAuctionMode as 'open' | 'blind' | undefined;
    const turnTimeLimitVal = roomMeta?.turnTimeLimit as number | undefined;
    const customRules: CustomGameRules | undefined = auctionMode
      ? {
          initialMoney: GAME_MODES[gameMode]?.initialMoney ?? 15000,
          tollPercent: GAME_MODES[gameMode]?.tollRate ?? 0.25,
          goBonus: GAME_MODES[gameMode]?.startReward ?? 1500,
          fateMoneyMultiplier: GAME_MODES[gameMode]?.fateMoneyMultiplier ?? 1.0,
          enableFateCards: true,
          enableChanceCards: true,
          enableStockMarket: true,
          enableGlobalEvents: true,
          buildingTollMode: 'standard',
          bankruptcyLine: 0,
          defaultAuctionMode: auctionMode,
        }
      : undefined;
    const gameState = createInitialState(gameMode, playerConfigs, customRules, challengeType);

    // 設置回合時間限制
    if (turnTimeLimitVal && turnTimeLimitVal > 0) {
      gameState.turnTimeLimit = turnTimeLimitVal;
      gameState.turnStartTime = Date.now();
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const fullState: GameStateWithMeta = {
      ...gameState,
      chatMessages: [],
      hostLastActiveAt: now.getTime(),
      guestLastActiveAt: now.getTime(),
      disconnectStatus: null,
      voiceActive: false,
      voiceParticipants: [],
      spectators: [],
      danmaku: [],
    };

    // 初始化所有玩家的 lastSeen
    const playerLastSeen: (string | null)[] = playerNames.map(() => nowIso);

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        status: 'playing',
        gameMode,
        gameState: JSON.stringify(fullState) as unknown as Record<string, unknown>,
        hostLastSeen: now,
        guestLastSeen: playerNames.length > 1 ? now : null,
        playerLastSeen: JSON.stringify(playerLastSeen) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    await this.addSystemMessageToColumn(roomCode, '游戏开始！');

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  async getPublicRooms(filter?: {
    gameMode?: string;
    maxPlayers?: number;
    status?: string;
  }): Promise<RoomState[]> {
    const { gameMode, maxPlayers, status } = filter ?? {};

    const conditions = [];
    // 公开房间：gameState->_roomMeta->isPublic 为 true 或不存在（默认公开）
    conditions.push(
      sql`coalesce((${monopolyRoom.gameState}->'_roomMeta'->'isPublic')::boolean, true) = true`,
    );
    if (gameMode) {
      conditions.push(eq(monopolyRoom.gameMode, gameMode));
    }
    if (maxPlayers !== undefined) {
      conditions.push(eq(monopolyRoom.maxPlayers, maxPlayers));
    }
    if (status) {
      conditions.push(eq(monopolyRoom.status, status));
    }

    const rows = await this.db
      .select()
      .from(monopolyRoom)
      .where(and(...conditions))
      .orderBy(desc(monopolyRoom.createdAt))
      .limit(50);

    // 列表返回时去除 password，仅保留 hasPassword 标记
    return rows.map((row: typeof monopolyRoom.$inferSelect) => {
      const state = this.toRoomState(row);
      const meta = this.getRoomMeta(row);
      return {
        ...state,
        isPublic: meta.isPublic,
        hasPassword: Boolean(meta.password && meta.password.length > 0),
      };
    });
  }

  async getRoom(roomCode: string, playerIndex?: number): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');

    // 心跳更新：僅當距上次 lastSeen 超過 10 秒才寫入，降低寫庫壓力
    if (playerIndex !== undefined && playerIndex >= 0) {
      const lastSeenList = room.playerLastSeen as unknown as (string | null)[];
      const lastSeenStr = lastSeenList?.[playerIndex];
      const shouldUpdate = !lastSeenStr
        || (Date.now() - new Date(lastSeenStr).getTime() > 10_000);
      if (shouldUpdate) {
        return this.heartbeat(roomCode, playerIndex);
      }
    }

    // 懒检测：游戏中时检查断线
    if (room.status === 'playing' && room.gameState) {
      const state = enrichGameState(room.gameState as unknown as GameState);
      const playerNames = this.getPlayerNames(room);
      const checked = this.checkDisconnection(state, playerNames);
      if (checked) {
        const updated = await this.db
          .update(monopolyRoom)
          .set({
            status: checked.status,
            gameState: JSON.stringify(checked.gameState) as unknown as Record<string, unknown>,
          })
          .where(eq(monopolyRoom.roomCode, roomCode))
          .returning();

        if (checked.status === 'ended') {
          const finalState = checked.gameState as unknown as GameState;
          void this.tryRecordGameResult(room, finalState);
        }

        const roomState = this.toRoomState(updated[0]);
        this.notifyRoomUpdate(roomCode, roomState);
        return roomState;
      }
    }

    const state = this.toRoomState(room);
    // getRoom 返回时去除实际密码，仅保留 hasPassword 标记
    const meta = this.getRoomMeta(room);
    return {
      ...state,
      isPublic: meta.isPublic,
      hasPassword: Boolean(meta.password && meta.password.length > 0),
    };
  }

  // ========== 游戏操作 ==========

  async rollDice(roomCode: string, playerIndex: number): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      const dice = rollDice();
      return processMove(state, dice);
    });
  }

  async buyProperty(
    roomCode: string,
    playerIndex: number,
    buy: boolean,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'buying', (state) => {
      return applyBuyDecision(state, buy);
    });
  }

  async buildHouse(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      return engineBuildHouse(state, playerIndex, cellId);
    });
  }

  async demolishBuilding(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      return engineDemolishBuilding(state, playerIndex, cellId);
    });
  }

  async mortgageProperty(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      return engineMortgageProperty(state, playerIndex, cellId);
    });
  }

  async redeemProperty(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      return engineRedeemProperty(state, playerIndex, cellId);
    });
  }

  async chooseUpgradePath(
    roomCode: string,
    playerIndex: number,
    cellId: number,
    path: PropertyUpgradePath,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      return engineChooseUpgradePath(state, playerIndex, cellId, path);
    });
  }

  async sendAllianceInvite(
    roomCode: string,
    playerIndex: number,
    targetPlayerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    const newState = engineSendAllianceInvite(normalizedState, playerIndex, targetPlayerIndex);
    return this.saveGameState(roomCode, newState, room);
  }

  async acceptAllianceInvite(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    const newState = engineAcceptAllianceInvite(normalizedState, playerIndex);
    return this.saveGameState(roomCode, newState, room);
  }

  async rejectAllianceInvite(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    const newState = engineRejectAllianceInvite(normalizedState, playerIndex);
    return this.saveGameState(roomCode, newState, room);
  }

  async breakAlliance(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    const newState = engineBreakAlliance(normalizedState, playerIndex);
    return this.saveGameState(roomCode, newState, room);
  }

  async placeBlackMarketBid(
    roomCode: string,
    playerIndex: number,
    itemIndex: number,
    bidAmount: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    const newState = enginePlaceBlackMarketBid(normalizedState, playerIndex, itemIndex, bidAmount);
    return this.saveGameState(roomCode, newState, room);
  }

  async finalizeBlackMarketAuction(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    const newState = engineFinalizeBlackMarketAuction(normalizedState);
    return this.saveGameState(roomCode, newState, room);
  }

  async proposeTrade(
    roomCode: string,
    playerIndex: number,
    givenProperties: number[],
    receivedProperties: number[],
    moneyAmount: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (state.phase !== 'rolling') throw new BadRequestException('当前不能发起交易');
    if (state.currentPlayerIndex !== playerIndex) {
      throw new BadRequestException('不是你的回合');
    }
    if (state.pendingTrade) throw new BadRequestException('已有待处理的交易');

    // 确定交易对手：默认为下一个玩家（简单起见，双人模式就是 1 - playerIndex）
    // 多人模式下找一个有地产的对手；这里简化为下一个未破产玩家
    let toPlayer = -1;
    for (let i = 1; i < state.players.length; i++) {
      const idx = (playerIndex + i) % state.players.length;
      if (!state.players[idx]?.isBankrupt) {
        toPlayer = idx;
        break;
      }
    }
    if (toPlayer < 0) {
      throw new BadRequestException('没有可交易的对手');
    }

    let newState = engineProposeTrade(state, playerIndex, toPlayer, {
      givenProperties,
      receivedProperties,
      moneyAmount,
    });

    // 如果接收方是AI，自动判断是否接受
    if (newState.pendingTrade && newState.players[newState.pendingTrade.toPlayer].isAI) {
      if (aiShouldAcceptTrade(newState, newState.pendingTrade)) {
        newState = engineAcceptTrade(newState);
      } else {
        newState = engineRejectTrade(newState);
      }
    }

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex].isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async respondTrade(
    roomCode: string,
    playerIndex: number,
    accept: boolean,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (!state.pendingTrade) throw new BadRequestException('没有待处理的交易');
    if (state.pendingTrade.toPlayer !== playerIndex) {
      throw new BadRequestException('你不是交易接收方');
    }

    let newState = accept
      ? engineAcceptTrade(state)
      : engineRejectTrade(state);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex].isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async selectProfession(
    roomCode: string,
    playerIndex: number,
    profession: Profession,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
    if (state.players[playerIndex]?.profession) {
      throw new BadRequestException('职业已选择');
    }

    const newState = {
      ...state,
      players: state.players.map((p) => ({ ...p })),
    };
    newState.players[playerIndex].profession = profession;

    const logType = playerIndex === 0 ? 'player1' : 'player2';
    newState.logs = [...state.logs, {
      id: state.logs.length > 0 ? state.logs[state.logs.length - 1].id + 1 : 1,
      type: logType,
      text: `${newState.players[playerIndex].name} 选择了职业：${profession}`,
    }];

    // 如果有AI玩家还没选职业，为它们随机选
    const aiProfessions: Profession[] = ['engineer', 'banker', 'speculator', 'tycoon', 'hacker', 'doctor'];
    for (let i = 0; i < newState.players.length; i++) {
      if (newState.players[i].isAI && !newState.players[i].profession) {
        const aiProfession = aiProfessions[Math.floor(Math.random() * aiProfessions.length)];
        newState.players[i].profession = aiProfession;
        const aiLogType = i === 0 ? 'player1' : 'player2';
        newState.logs.push({
          id: newState.logs[newState.logs.length - 1].id + 1,
          type: aiLogType,
          text: `${newState.players[i].name} 选择了职业：${aiProfession}`,
        });
      }
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async startAuction(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'buying', (state) => {
      const cellId = state.players[playerIndex].position;
      let newState = engineStartAuction(state, cellId);
      newState = this.runAIAuctionTurn(newState);
      return newState;
    });
  }

  async auctionBid(
    roomCode: string,
    playerIndex: number,
    bidAmount: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (state.phase !== 'auction') throw new BadRequestException('不是拍卖阶段');
    if (!state.auction || !state.auction.active) {
      throw new BadRequestException('没有进行中的拍卖');
    }

    const activeBidderIndex = state.auction.activeBidderIndex;
    const currentBidder = state.auction.activeBidders[activeBidderIndex];
    if (currentBidder !== playerIndex) {
      throw new BadRequestException('还没轮到你出价');
    }

    if (bidAmount < state.auction.minIncrement) {
      throw new BadRequestException(`加价不能低于 ${state.auction.minIncrement} 元`);
    }

    let newState = enginePlaceBid(state, playerIndex, bidAmount);
    newState = this.runAIAuctionTurn(newState);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex].isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async auctionPass(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (state.phase !== 'auction') throw new BadRequestException('不是拍卖阶段');
    if (!state.auction || !state.auction.active) {
      throw new BadRequestException('没有进行中的拍卖');
    }

    const activeBidderIndex = state.auction.activeBidderIndex;
    const currentBidder = state.auction.activeBidders[activeBidderIndex];
    if (currentBidder !== playerIndex) {
      throw new BadRequestException('还没轮到你出价');
    }

    let newState = enginePassAuction(state, playerIndex);
    newState = this.runAIAuctionTurn(newState);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex].isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  // ========== NPC 系统 ==========

  async npcBuyItem(
    roomCode: string,
    playerIndex: number,
    itemType: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (!state.pendingNpcInteraction) {
      throw new BadRequestException('没有进行中的NPC交互');
    }
    if (state.pendingNpcInteraction.playerIndex !== playerIndex) {
      throw new BadRequestException('不是你的NPC交互');
    }

    let newState = engineBuyFromMerchant(state, playerIndex, itemType as ItemType);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async npcHireHacker(
    roomCode: string,
    playerIndex: number,
    targetPlayerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);
    this.validatePlayerIndex(room, targetPlayerIndex);

    const state = room.gameState as unknown as GameState;
    if (!state.pendingNpcInteraction) {
      throw new BadRequestException('没有进行中的NPC交互');
    }
    if (state.pendingNpcInteraction.playerIndex !== playerIndex) {
      throw new BadRequestException('不是你的NPC交互');
    }

    let newState = engineHireHacker(state, playerIndex, targetPlayerIndex);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async npcClose(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (!state.pendingNpcInteraction) {
      throw new BadRequestException('没有进行中的NPC交互');
    }

    let newState = engineCloseNpcInteraction(state, playerIndex);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  // ========== 暗拍系统 ==========

  async submitBlindBid(
    roomCode: string,
    playerIndex: number,
    bidAmount: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    if (state.phase !== 'auction') throw new BadRequestException('不是拍卖阶段');
    if (!state.auction || !state.auction.active) {
      throw new BadRequestException('没有进行中的拍卖');
    }
    if (!state.auction.isBlind) {
      throw new BadRequestException('当前不是暗拍模式');
    }
    if (state.auction.revealed) {
      throw new BadRequestException('暗拍已揭晓');
    }

    if (bidAmount <= 0) throw new BadRequestException('出价必须大于0');

    let newState = engineSubmitBlindBid(state, playerIndex, bidAmount);
    newState = this.runAIAuctionTurn(newState);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async revealBlindBids(
    roomCode: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }

    const state = room.gameState as unknown as GameState;
    if (state.phase !== 'auction') throw new BadRequestException('不是拍卖阶段');
    if (!state.auction || !state.auction.active) {
      throw new BadRequestException('没有进行中的拍卖');
    }
    if (!state.auction.isBlind) {
      throw new BadRequestException('当前不是暗拍模式');
    }
    if (state.auction.revealed) {
      throw new BadRequestException('暗拍已揭晓');
    }

    let newState = engineRevealBlindBids(state);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async buyStock(
    roomCode: string,
    playerIndex: number,
    symbol: string,
    quantity: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (quantity <= 0) throw new BadRequestException('数量必须大于0');
      return engineBuyStock(state, playerIndex, symbol as StockSymbol, quantity);
    });
  }

  async sellStock(
    roomCode: string,
    playerIndex: number,
    symbol: string,
    quantity: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (quantity <= 0) throw new BadRequestException('数量必须大于0');
      return engineSellStock(state, playerIndex, symbol as StockSymbol, quantity);
    });
  }

  // ========== 強制收購系統 ==========

  async forceAcquireProperty(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (cellId < 0 || cellId > 35) throw new BadRequestException('无效的地块ID');
      return engineForceAcquireProperty(state, playerIndex, cellId);
    });
  }

  // ========== 賄賂銀行系統 ==========

  async bribeBank(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (cellId < 0 || cellId > 35) throw new BadRequestException('无效的地块ID');
      return engineBribeBank(state, playerIndex, cellId);
    });
  }

  // ========== 股東大會系統 ==========

  async callShareholderMeeting(
    roomCode: string,
    playerIndex: number,
    symbol: string,
    direction: 'up' | 'down',
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      const validSymbols = ['NEON', 'QNTM', 'DATA', 'CYBR'];
      if (!validSymbols.includes(symbol)) throw new BadRequestException('无效的股票代码');
      if (direction !== 'up' && direction !== 'down') throw new BadRequestException('无效的方向');
      return engineCallShareholderMeeting(state, playerIndex, symbol as StockSymbol, direction);
    });
  }

  // ========== 地下市場系統 ==========

  async undergroundMarketBuy(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (cellId < 0 || cellId > 35) throw new BadRequestException('无效的地块ID');
      return engineUndergroundMarketBuy(state, playerIndex, cellId);
    });
  }

  // ========== 道具系统 ==========

  async buyItem(
    roomCode: string,
    playerIndex: number,
    itemType: ItemType,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      return engineBuyItem(state, playerIndex, itemType);
    });
  }

  // ========== 付錢保釋 ==========

  async payBail(roomCode: string, playerIndex: number): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      const player = state.players[playerIndex];
      if (!player?.isInDetention) throw new BadRequestException('玩家不在監禁中');
      return enginePayBailRelease(state, playerIndex);
    });
  }

  async useItem(
    roomCode: string,
    playerIndex: number,
    itemId: number,
    targetCellId?: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      return engineUseItem(state, playerIndex, itemId, targetCellId);
    });
  }

  // ========== 迷你游戏系统 ==========

  async startMiniGame(
    roomCode: string,
    playerIndex: number,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    if (normalizedState.phase === 'ended') throw new BadRequestException('游戏已结束');
    if (!normalizedState.pendingMiniGame || normalizedState.pendingMiniGame.playerIndex !== playerIndex) {
      throw new BadRequestException('没有进行中的迷你游戏');
    }

    let newState = engineStartMiniGame(normalizedState, playerIndex);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async miniGameAction(
    roomCode: string,
    playerIndex: number,
    action: string,
    data?: unknown,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    if (normalizedState.phase === 'ended') throw new BadRequestException('游戏已结束');
    if (!normalizedState.pendingMiniGame || normalizedState.pendingMiniGame.playerIndex !== playerIndex) {
      throw new BadRequestException('没有进行中的迷你游戏');
    }

    let newState = engineMiniGameAction(normalizedState, playerIndex, action, data);

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    return this.saveGameState(roomCode, newState, room);
  }

  async takeLoan(
    roomCode: string,
    playerIndex: number,
    amount: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      return engineTakeLoan(state, playerIndex, amount);
    });
  }

  async repayLoan(
    roomCode: string,
    playerIndex: number,
    amount: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      return engineRepayLoan(state, playerIndex, amount);
    });
  }

  // ========== 保险系统 ==========

  async buyInsurance(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (cellId < 0 || cellId > 35) throw new BadRequestException('地块ID无效');
      return engineBuyInsurance(state, playerIndex, cellId);
    });
  }

  // ========== 债券系统 ==========

  async upgradeSkill(
    roomCode: string,
    playerIndex: number,
    skillId: string,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      return engineUpgradeSkill(state, playerIndex, skillId as import('@shared/api.interface').SkillId);
    });
  }

  async buildSpecialBuilding(
    roomCode: string,
    playerIndex: number,
    cellId: number,
    buildingType: string,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (cellId < 0 || cellId > 35) throw new BadRequestException('地块ID无效');
      return engineBuildSpecialBuilding(
        state,
        playerIndex,
        cellId,
        buildingType as import('@shared/api.interface').SpecialBuildingType,
      );
    });
  }

  async demolishSpecialBuilding(
    roomCode: string,
    playerIndex: number,
    cellId: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, 'rolling', (state) => {
      if (cellId < 0 || cellId > 35) throw new BadRequestException('地块ID无效');
      return engineDemolishSpecialBuilding(state, playerIndex, cellId);
    });
  }

  // ========== 债券系统 ==========

  async issueBond(
    roomCode: string,
    playerIndex: number,
    amount: number,
    interestRate: number,
    turns: number,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      return engineIssueBond(state, playerIndex, amount, interestRate, turns);
    });
  }

  async subscribeBond(
    roomCode: string,
    playerIndex: number,
    bondId: string,
  ): Promise<RoomState> {
    return this.withTurnValidation(roomCode, playerIndex, null, (state) => {
      if (state.phase === 'ended') throw new BadRequestException('游戏已结束');
      if (!bondId) throw new BadRequestException('债券ID不能为空');
      return engineSubscribeBond(state, playerIndex, bondId);
    });
  }

  // ========== 聊天系统 ==========

  async sendChatMessage(
    roomCode: string,
    playerIndex: number,
    content: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');

    const trimmed = content.trim();
    if (!trimmed) throw new BadRequestException('消息内容不能为空');
    if (trimmed.length > 200) throw new BadRequestException('消息长度不能超过200字');

    this.validatePlayerIndex(room, playerIndex);

    const meta = enrichGameState(
      room.gameState && typeof room.gameState === 'object'
        ? (room.gameState as unknown as GameState)
        : null,
    );

    const playerNames = this.getPlayerNames(room);
    const playerName = playerNames[playerIndex]?.name ?? '玩家';

    const message: ChatMessage = {
      id: meta.chatMessages.length > 0
        ? meta.chatMessages[meta.chatMessages.length - 1].id + 1
        : 1,
      type: 'player',
      sender: playerIndex,
      senderName: playerName,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    meta.chatMessages.push(message);
    if (meta.chatMessages.length > MAX_CHAT_MESSAGES) {
      meta.chatMessages.splice(0, meta.chatMessages.length - MAX_CHAT_MESSAGES);
    }

    this.updatePlayerActivity(meta, playerIndex);

    const baseState = (room.gameState && typeof room.gameState === 'object')
      ? (room.gameState as Record<string, unknown>)
      : {};
    const mergedState = { ...baseState, ...meta };

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(mergedState) as unknown as Record<string, unknown>,
      })
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0], playerIndex);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  async sendChat(
    roomCode: string,
    playerIndex: number,
    content: string,
    type: 'player' | 'voice' = 'player',
  ): Promise<{ success: boolean; messageId: number }> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');

    const trimmed = content.trim();
    if (!trimmed) throw new BadRequestException('消息内容不能为空');
    if (trimmed.length > 500) throw new BadRequestException('消息长度不能超过500字');

    this.validatePlayerIndex(room, playerIndex);

    const messages: ChatMessage[] = Array.isArray(room.messages)
      ? (room.messages as unknown as ChatMessage[])
      : [];

    const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1;
    const playerNames = this.getPlayerNames(room);
    const senderName = playerNames[playerIndex]?.name ?? '玩家';

    const message: ChatMessage = {
      id: nextId,
      sender: playerIndex,
      senderName,
      content: trimmed,
      type,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    // 更新 lastSeen
    const now = new Date();
    await this.updatePlayerLastSeenRaw(roomCode, playerIndex, now);

    await this.db
      .update(monopolyRoom)
      .set({
        messages: JSON.stringify(messages) as unknown as Record<string, unknown>,
      })
      .where(eq(monopolyRoom.roomCode, roomCode))
      .execute();

    // 聊天消息也推送给 SSE 订阅者
    const refreshed = await this.findByCode(roomCode);
    if (refreshed) {
      this.notifyRoomUpdate(roomCode, this.toRoomState(refreshed, playerIndex));
    }

    return { success: true, messageId: nextId };
  }

  async markChatRead(
    roomCode: string,
    playerIndex: number,
  ): Promise<{ success: boolean }> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    this.validatePlayerIndex(room, playerIndex);

    // 顺便更新 lastSeen
    const now = new Date();
    await this.updatePlayerLastSeenRaw(roomCode, playerIndex, now);

    return { success: true };
  }

  // ========== 语音聊天 ==========

  async toggleVoice(
    roomCode: string,
    playerIndex: number,
    muted: boolean,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房間不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('遊戲未開始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = enrichGameState(room.gameState as unknown as GameState);
    const playerNames = this.getPlayerNames(room);
    const playerName = playerNames[playerIndex]?.name ?? `玩家${playerIndex + 1}`;

    // 更新 voiceParticipants
    const hasIndex = state.voiceParticipants.includes(playerIndex);
    let newVoiceParticipants: number[];
    if (muted) {
      // 靜音 → 從開麥列表移除
      newVoiceParticipants = state.voiceParticipants.filter(
        (idx: number) => idx !== playerIndex,
      );
    } else {
      // 開麥 → 加入開麥列表
      newVoiceParticipants = hasIndex
        ? state.voiceParticipants
        : [...state.voiceParticipants, playerIndex];
    }

    state.voiceActive = newVoiceParticipants.length > 0;
    state.voiceParticipants = newVoiceParticipants;

    // 添加系統消息
    const action = muted ? '關閉了麥克風' : '開啟了麥克風';
    await this.addSystemMessageToColumn(roomCode, `${playerName} ${action}`);

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(state) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0], playerIndex);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  // ========== 觀戰模式 ==========

  async joinAsSpectator(
    roomCode: string,
    visitorId: string,
    nickname: string,
  ): Promise<{ room: RoomState; spectatorId: string }> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房間不存在');
    if (!visitorId?.trim()) throw new BadRequestException('觀戰者ID不能為空');
    const trimmedName = nickname.trim();
    if (!trimmedName) throw new BadRequestException('暱稱不能為空');

    const state = enrichGameState(
      room.gameState && typeof room.gameState === 'object'
        ? (room.gameState as unknown as GameState)
        : null,
    );

    // 檢查是否已在觀戰列表中
    const existing = state.spectators.find((s: Spectator) => s.id === visitorId);
    if (existing) {
      // 已在列表，更新暱稱即可
      existing.nickname = trimmedName;
    } else {
      if (state.spectators.length >= MAX_SPECTATORS) {
        throw new BadRequestException('觀戰人數已達上限');
      }
      state.spectators.push({
        id: visitorId,
        nickname: trimmedName,
      });
    }

    const baseState = (room.gameState && typeof room.gameState === 'object')
      ? (room.gameState as Record<string, unknown>)
      : {};
    const mergedState = { ...baseState, ...state };

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(mergedState) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);

    return {
      room: roomState,
      spectatorId: visitorId,
    };
  }

  async leaveAsSpectator(
    roomCode: string,
    visitorId: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房間不存在');

    const state = enrichGameState(
      room.gameState && typeof room.gameState === 'object'
        ? (room.gameState as unknown as GameState)
        : null,
    );

    const beforeLen = state.spectators.length;
    state.spectators = state.spectators.filter((s: Spectator) => s.id !== visitorId);

    if (state.spectators.length === beforeLen) {
      // 不在列表中，直接返回
      return this.toRoomState(room);
    }

    const baseState = (room.gameState && typeof room.gameState === 'object')
      ? (room.gameState as Record<string, unknown>)
      : {};
    const mergedState = { ...baseState, ...state };

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(mergedState) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  async spectatorFollow(
    roomCode: string,
    visitorId: string,
    followPlayer: number | null,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房間不存在');

    const state = enrichGameState(
      room.gameState && typeof room.gameState === 'object'
        ? (room.gameState as unknown as GameState)
        : null,
    );

    const spectator = state.spectators.find((s: Spectator) => s.id === visitorId);
    if (!spectator) {
      throw new BadRequestException('觀戰者不存在');
    }

    if (followPlayer === null) {
      spectator.following = undefined;
    } else {
      const playerNames = this.getPlayerNames(room);
      if (followPlayer < 0 || followPlayer >= playerNames.length) {
        throw new BadRequestException('無效的玩家索引');
      }
      spectator.following = followPlayer;
    }

    const baseState = (room.gameState && typeof room.gameState === 'object')
      ? (room.gameState as Record<string, unknown>)
      : {};
    const mergedState = { ...baseState, ...state };

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(mergedState) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  async sendDanmaku(
    roomCode: string,
    visitorId: string,
    nickname: string,
    content: string,
    color?: string,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房間不存在');

    const trimmed = content.trim();
    if (!trimmed) throw new BadRequestException('彈幕內容不能為空');
    if (trimmed.length > DANMAKU_MAX_LENGTH) {
      throw new BadRequestException(`彈幕長度不能超過${DANMAKU_MAX_LENGTH}字`);
    }

    const state = enrichGameState(
      room.gameState && typeof room.gameState === 'object'
        ? (room.gameState as unknown as GameState)
        : null,
    );

    // 驗證觀戰者存在
    const spectator = state.spectators.find((s: Spectator) => s.id === visitorId);
    if (!spectator) {
      throw new BadRequestException('請先加入觀戰');
    }

    const nextId = state.danmaku.length > 0
      ? state.danmaku[state.danmaku.length - 1].id + 1
      : 1;

    const msg: DanmakuMessage = {
      id: nextId,
      sender: visitorId,
      senderName: nickname.trim() || spectator.nickname,
      content: trimmed,
      color,
      timestamp: new Date().toISOString(),
    };

    state.danmaku.push(msg);
    if (state.danmaku.length > MAX_DANMAKU) {
      state.danmaku.splice(0, state.danmaku.length - MAX_DANMAKU);
    }

    const baseState = (room.gameState && typeof room.gameState === 'object')
      ? (room.gameState as Record<string, unknown>)
      : {};
    const mergedState = { ...baseState, ...state };

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(mergedState) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  // ========== 心跳与断线重连 ==========

  async playerHeartbeat(
    roomCode: string,
    playerIndex: number,
  ): Promise<{ success: boolean; disconnectedPlayers: number[]; disconnectedPlayer: number | null }> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    this.validatePlayerIndex(room, playerIndex);

    const now = new Date();
    const nowIso = now.toISOString();

    const lastSeen = this.getPlayerLastSeen(room);
    const playerNames = this.getPlayerNames(room);
    const hostIndex = this.getHostIndex(room);

    const newLastSeen: (string | null)[] = [...lastSeen];
    newLastSeen[playerIndex] = nowIso;

    // 找出超时断线的玩家（心跳发起者不算）
    const timedOutIndices: number[] = [];
    for (let i = 0; i < playerNames.length; i++) {
      if (i === playerIndex) continue;
      const seen = newLastSeen[i];
      if (!seen) continue;
      const idle = (now.getTime() - new Date(seen).getTime()) / 1000;
      if (idle > HEARTBEAT_DISCONNECT_SECONDS) {
        timedOutIndices.push(i);
      }
    }

    // 如果游戏未开始，超时玩家直接从房间移除；房主断线则转移房主
    if (room.status === 'waiting' && timedOutIndices.length > 0) {
      const newPlayerNames: PlayerNameEntry[] = [...playerNames];
      const nextLastSeen: (string | null)[] = [...newLastSeen];
      let newHostIndex = hostIndex;
      let newStatus = room.status;
      const messages: string[] = [];

      // 按索引从大到小删除，避免索引偏移
      const sortedToRemove = [...timedOutIndices].sort((a, b) => b - a);
      for (const idx of sortedToRemove) {
        const removedName = newPlayerNames[idx]?.name ?? `玩家${idx + 1}`;
        newPlayerNames.splice(idx, 1);
        nextLastSeen.splice(idx, 1);
        if (idx < newHostIndex) {
          newHostIndex -= 1;
        } else if (idx === newHostIndex) {
          newHostIndex = 0;
        }
        messages.push(`玩家 ${removedName} 因断线离开了房间`);
      }

      if (newPlayerNames.length === 0) {
        newStatus = 'closed';
      }

      // 兼容字段（host/guest name & lastSeen）
      const compat: Record<string, unknown> = {};
      if (newPlayerNames[0]) {
        compat.hostName = newPlayerNames[0].name;
        compat.hostLastSeen = nextLastSeen[0] ? new Date(nextLastSeen[0]) : null;
      } else {
        compat.hostName = null;
        compat.hostLastSeen = null;
      }
      if (newPlayerNames[1]) {
        compat.guestName = newPlayerNames[1].name;
        compat.guestLastSeen = nextLastSeen[1] ? new Date(nextLastSeen[1]) : null;
      } else {
        compat.guestName = null;
        compat.guestLastSeen = null;
      }

      const updated = await this.db
        .update(monopolyRoom)
        .set({
          playerNames: JSON.stringify(newPlayerNames) as unknown as Record<string, unknown>,
          playerLastSeen: JSON.stringify(nextLastSeen) as unknown as Record<string, unknown>,
          hostIndex: newHostIndex,
          status: newStatus,
          ...compat,
        } as unknown as Record<string, unknown>)
        .where(eq(monopolyRoom.roomCode, roomCode))
        .returning();

      for (const msg of messages) {
        void this.addSystemMessageToColumn(roomCode, msg);
      }

      const roomState = this.toRoomState(updated[0]);
      this.notifyRoomUpdate(roomCode, roomState);

      // 返回仍然断线的玩家（相对于当前剩余玩家列表）
      const remainingDisconnected: number[] = [];
      return { success: true, disconnectedPlayers: remainingDisconnected, disconnectedPlayer: null };
    }

    // 向后兼容旧字段
    const compatPatch = playerIndex === 0
      ? { hostLastSeen: now }
      : playerIndex === 1
      ? { guestLastSeen: now }
      : {};

    await this.db
      .update(monopolyRoom)
      .set({
        playerLastSeen: JSON.stringify(newLastSeen) as unknown as Record<string, unknown>,
        ...compatPatch,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .execute();

    // 计算断线玩家
    const disconnectedPlayers: number[] = [];
    for (let i = 0; i < playerNames.length; i++) {
      if (i === playerIndex) continue;
      const seen = newLastSeen[i];
      if (!seen) continue;
      const idle = (now.getTime() - new Date(seen).getTime()) / 1000;
      if (idle > HEARTBEAT_DISCONNECT_SECONDS) {
        disconnectedPlayers.push(i);
      }
    }

    const disconnectedPlayer = disconnectedPlayers.length > 0 ? disconnectedPlayers[0] : null;

    return { success: true, disconnectedPlayers, disconnectedPlayer };
  }

  private async scanWaitingRoomsForDisconnects(): Promise<void> {
    try {
      const rooms = await this.db
        .select()
        .from(monopolyRoom)
        .where(eq(monopolyRoom.status, 'waiting'));

      const now = Date.now();

      for (const room of rooms) {
        try {
          const playerNames = this.getPlayerNames(room);
          const lastSeen = this.getPlayerLastSeen(room);
          const hostIndex = this.getHostIndex(room);

          const timedOutIndices: number[] = [];
          for (let i = 0; i < playerNames.length; i++) {
            const seen = lastSeen[i];
            if (!seen) continue;
            const idleMs = now - new Date(seen).getTime();
            if (idleMs > 30000) {
              timedOutIndices.push(i);
            }
          }

          if (timedOutIndices.length === 0) continue;

          const newPlayerNames: PlayerNameEntry[] = [...playerNames];
          const newLastSeen: (string | null)[] = [...lastSeen];
          let newHostIndex = hostIndex;
          let newStatus = room.status;
          const messages: string[] = [];

          const sortedToRemove = [...timedOutIndices].sort((a, b) => b - a);
          for (const idx of sortedToRemove) {
            const removedName = newPlayerNames[idx]?.name ?? `玩家${idx + 1}`;
            newPlayerNames.splice(idx, 1);
            newLastSeen.splice(idx, 1);
            if (idx < newHostIndex) {
              newHostIndex -= 1;
            } else if (idx === newHostIndex) {
              newHostIndex = 0;
            }
            messages.push(`玩家 ${removedName} 因超時離開了房間`);
          }

          if (newPlayerNames.length === 0) {
            newStatus = 'closed';
          }

          const compat: Record<string, unknown> = {};
          if (newPlayerNames[0]) {
            compat.hostName = newPlayerNames[0].name;
            compat.hostLastSeen = newLastSeen[0] ? new Date(newLastSeen[0]) : null;
          } else {
            compat.hostName = null;
            compat.hostLastSeen = null;
          }
          if (newPlayerNames[1]) {
            compat.guestName = newPlayerNames[1].name;
            compat.guestLastSeen = newLastSeen[1] ? new Date(newLastSeen[1]) : null;
          } else {
            compat.guestName = null;
            compat.guestLastSeen = null;
          }

          const updated = await this.db
            .update(monopolyRoom)
            .set({
              playerNames: JSON.stringify(newPlayerNames) as unknown as Record<string, unknown>,
              playerLastSeen: JSON.stringify(newLastSeen) as unknown as Record<string, unknown>,
              hostIndex: newHostIndex,
              status: newStatus,
              ...compat,
            } as unknown as Record<string, unknown>)
            .where(eq(monopolyRoom.roomCode, room.roomCode))
            .returning();

          for (const msg of messages) {
            void this.addSystemMessageToColumn(room.roomCode, msg);
          }

          if (updated.length > 0) {
            const roomState = this.toRoomState(updated[0]);
            this.notifyRoomUpdate(room.roomCode, roomState);
          }
        } catch {
          // 单个房间处理失败不影响其他房间
        }
      }
    } catch {
      // 定时器整体异常吞掉，避免进程崩溃
    }
  }

  async surrenderDisconnected(
    roomCode: string,
    playerIndex: number,
  ): Promise<{ success: boolean; reason: string }> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing') {
      throw new BadRequestException('游戏未开始或已结束');
    }
    this.validatePlayerIndex(room, playerIndex);

    const lastSeen = this.getPlayerLastSeen(room);
    const playerNames = this.getPlayerNames(room);
    const now = new Date();

    // 检查是否所有其他玩家都断线超过60秒
    const allOthersDisconnected = playerNames.every((_p: PlayerNameEntry, i: number) => {
      if (i === playerIndex) return true;
      const seen = lastSeen[i];
      if (!seen) return false;
      const idle = (now.getTime() - new Date(seen).getTime()) / 1000;
      return idle >= SURRENDER_THRESHOLD_SECONDS;
    });

    if (!allOthersDisconnected) {
      // 找还在线的玩家中最短的剩余时间
      let minRemaining = Infinity;
      for (let i = 0; i < playerNames.length; i++) {
        if (i === playerIndex) continue;
        const seen = lastSeen[i];
        if (!seen) continue;
        const idle = (now.getTime() - new Date(seen).getTime()) / 1000;
        if (idle < SURRENDER_THRESHOLD_SECONDS) {
          minRemaining = Math.min(minRemaining, SURRENDER_THRESHOLD_SECONDS - idle);
        }
      }
      if (minRemaining < Infinity) {
        const remaining = Math.ceil(minRemaining);
        return { success: false, reason: `还有玩家未断线，请再等待 ${remaining} 秒` };
      }
      return { success: false, reason: '还有玩家在线' };
    }

    // 判负：所有其他玩家认输，当前玩家获胜
    if (!room.gameState || typeof room.gameState !== 'object') {
      throw new BadRequestException('游戏状态异常');
    }

    const state = room.gameState as unknown as GameState;
    const newState = { ...state, players: state.players.map((p) => ({ ...p })) };
    newState.phase = 'ended';
    newState.winner = playerIndex;

    // 添加系统消息
    const messages: ChatMessage[] = Array.isArray(room.messages)
      ? [...(room.messages as unknown as ChatMessage[])]
      : [];
    const winnerName = playerNames[playerIndex]?.name ?? '你';
    const sysMsg: ChatMessage = {
      id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 1,
      sender: -1,
      senderName: '系统',
      content: `${winnerName} 获胜！其他玩家因断线判负`,
      type: 'system',
      timestamp: now.toISOString(),
    };
    messages.push(sysMsg);
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        status: 'ended',
        gameState: JSON.stringify(newState) as unknown as Record<string, unknown>,
        messages: JSON.stringify(messages) as unknown as Record<string, unknown>,
      })
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    // 记录排行榜数据（异步 fire-and-forget）
    void this.tryRecordGameResult(room, newState);

    // 通知 SSE 订阅者
    if (updated.length > 0) {
      this.notifyRoomUpdate(roomCode, this.toRoomState(updated[0], playerIndex));
    }

    return { success: true, reason: '其他玩家断线超过60秒，判定对方认输' };
  }

  // ========== 私有辅助方法 ==========

  private async withTurnValidation(
    roomCode: string,
    playerIndex: number,
    expectedPhase: string | null,
    handler: (state: GameState) => GameState,
  ): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');
    if (room.status !== 'playing' || !room.gameState) {
      throw new BadRequestException('游戏未开始');
    }
    this.validatePlayerIndex(room, playerIndex);

    const state = room.gameState as unknown as GameState;
    const normalizedState = normalizeGameState(state);
    if (expectedPhase && normalizedState.phase !== expectedPhase) {
      throw new BadRequestException(`不是${this.phaseLabel(expectedPhase)}阶段`);
    }
    if (normalizedState.currentPlayerIndex !== playerIndex) {
      throw new BadRequestException('不是你的回合');
    }

    let newState = handler(normalizedState);

    // 命运/机会卡循环
    let cardLoop = 0;
    while ((newState.phase === 'fate' || newState.phase === 'chance') && cardLoop < 5) {
      if (newState.phase === 'fate') {
        newState = applyFateCard(newState);
      } else {
        newState = applyChanceCard(newState);
      }
      cardLoop += 1;
    }

    if (newState.phase === 'rolling' && newState.players[newState.currentPlayerIndex]?.isAI) {
      newState = this.runAITurn(newState);
    }

    // 回合切換時更新倒計時開始時間
    if (
      newState.turnTimeLimit &&
      newState.turnTimeLimit > 0 &&
      newState.phase === 'rolling' &&
      newState.currentPlayerIndex !== normalizedState.currentPlayerIndex
    ) {
      newState = { ...newState, turnStartTime: Date.now() };
    }

    return this.saveGameState(roomCode, newState, room);
  }

  private phaseLabel(phase: string): string {
    const labels: Record<string, string> = {
      rolling: '行动',
      buying: '购买',
      fate: '命运',
      chance: '机会',
      auction: '拍卖',
    };
    return labels[phase] ?? phase;
  }

  private async saveGameState(
    roomCode: string,
    newState: GameState,
    room: typeof monopolyRoom.$inferSelect,
  ): Promise<RoomState> {
    if (newState.phase === 'ended') {
      return this.finalizeEndedGame(roomCode, newState, room);
    }

    // 樂觀鎖：使用 updatedAt 作為版本號，防止並發覆蓋
    const expectedUpdatedAt = room.updatedAt;
    const updated = await this.db
      .update(monopolyRoom)
      .set({
        gameState: JSON.stringify(newState) as unknown as Record<string, unknown>,
      })
      .where(
        and(
          eq(monopolyRoom.roomCode, roomCode),
          eq(monopolyRoom.updatedAt, expectedUpdatedAt),
        ),
      )
      .returning();

    if (updated.length === 0) {
      // 版本不一致，重讀重算（最多重試 3 次）
      throw new ConflictException('狀態已過期，請重試');
    }

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  private validatePlayerIndex(
    room: typeof monopolyRoom.$inferSelect,
    playerIndex: number,
  ): void {
    const maxPlayers = this.getMaxPlayers(room);
    const playerNames = this.getPlayerNames(room);
    if (
      !Number.isInteger(playerIndex) ||
      playerIndex < 0 ||
      playerIndex >= playerNames.length ||
      playerIndex >= maxPlayers
    ) {
      throw new BadRequestException('无效的玩家索引');
    }
  }

  private getMaxPlayers(room: typeof monopolyRoom.$inferSelect): number {
    const n = room.maxPlayers;
    return VALID_MAX_PLAYERS.includes(n) ? n : 2;
  }

  private getHostIndex(room: typeof monopolyRoom.$inferSelect): number {
    const n = room.hostIndex;
    return Number.isInteger(n) && n >= 0 ? n : 0;
  }

  private getPlayerNames(room: typeof monopolyRoom.$inferSelect): PlayerNameEntry[] {
    const raw = room.playerNames;
    const parsed = parsePlayerNames(raw);
    if (parsed.length > 0) return parsed;
    // 向后兼容：从旧字段构造
    const names: PlayerNameEntry[] = [];
    if (room.hostName) {
      names.push({ name: room.hostName, color: PLAYER_COLORS[0], ready: false });
    }
    if (room.guestName) {
      names.push({ name: room.guestName, color: PLAYER_COLORS[1], ready: false });
    }
    return names;
  }

  private getRoomMeta(room: typeof monopolyRoom.$inferSelect): { password?: string; isPublic: boolean } {
    const gs = room.gameState;
    if (gs && typeof gs === 'object') {
      const obj = gs as Record<string, unknown>;
      const meta = obj._roomMeta as Record<string, unknown> | undefined;
      if (meta && typeof meta === 'object') {
        return {
          password: meta.password ? String(meta.password) : undefined,
          isPublic: meta.isPublic === false ? false : true,
        };
      }
    }
    return { password: undefined, isPublic: true };
  }

  private getPlayerLastSeen(room: typeof monopolyRoom.$inferSelect): (string | null)[] {
    const raw = room.playerLastSeen;
    const parsed = parsePlayerLastSeen(raw);
    if (parsed.length > 0) return parsed;
    // 向后兼容：从旧字段构造
    const result: (string | null)[] = [];
    if (room.hostName) {
      result.push(room.hostLastSeen ? new Date(room.hostLastSeen).toISOString() : null);
    }
    if (room.guestName) {
      result.push(room.guestLastSeen ? new Date(room.guestLastSeen).toISOString() : null);
    }
    return result;
  }

  private async updatePlayerLastSeenRaw(
    roomCode: string,
    playerIndex: number,
    now: Date,
  ): Promise<void> {
    // 用原生 SQL 更新 player_last_seen 数组的指定索引
    const nowIso = now.toISOString();
    await this.db.execute(sql`
      UPDATE monopoly_room
      SET player_last_seen = COALESCE(
        jsonb_set(
          player_last_seen,
          ${`{${playerIndex}}`}::text[],
          ${JSON.stringify(nowIso)}::jsonb
        ),
        jsonb_build_array(${nowIso}::text)::jsonb
      )
      WHERE room_code = ${roomCode}
    `);

    // 向后兼容
    if (playerIndex === 0) {
      await this.db.execute(sql`
        UPDATE monopoly_room SET host_last_seen = CURRENT_TIMESTAMP WHERE room_code = ${roomCode}
      `);
    } else if (playerIndex === 1) {
      await this.db.execute(sql`
        UPDATE monopoly_room SET guest_last_seen = CURRENT_TIMESTAMP WHERE room_code = ${roomCode}
      `);
    }
  }

  private async addSystemMessageToColumn(roomCode: string, content: string): Promise<void> {
    const result = await this.db.execute(sql<{ messages: string }>`
      SELECT messages::text as messages FROM monopoly_room WHERE room_code = ${roomCode}
    `);

    const row = result[0];
    if (!row) return;

    let messages: ChatMessage[] = [];
    try {
      messages = JSON.parse(String(row.messages)) as ChatMessage[];
    } catch {
      messages = [];
    }

    const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1;
    const msg: ChatMessage = {
      id: nextId,
      sender: -1,
      senderName: '系统',
      content,
      type: 'system',
      timestamp: new Date().toISOString(),
    };

    messages.push(msg);
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    await this.db.execute(sql`
      UPDATE monopoly_room SET messages = ${JSON.stringify(messages)}::jsonb WHERE room_code = ${roomCode}
    `);
  }

  private async finalizeEndedGame(
    roomCode: string,
    finalState: GameState,
    room: typeof monopolyRoom.$inferSelect,
  ): Promise<RoomState> {
    const winnerIdx = finalState.winner;
    const playerNames = this.getPlayerNames(room);
    const winnerName = winnerIdx !== null && winnerIdx !== undefined
      ? (playerNames[winnerIdx]?.name ?? '未知')
      : '未知';

    const msgResult = await this.db.execute(sql<{ messages: string }>`
      SELECT messages::text as messages FROM monopoly_room WHERE room_code = ${roomCode}
    `);

    let currentMessages: ChatMessage[] = [];
    try {
      if (msgResult[0]?.messages) {
        currentMessages = JSON.parse(String(msgResult[0].messages)) as ChatMessage[];
      }
    } catch {
      currentMessages = [];
    }

    const nextId = currentMessages.length > 0
      ? currentMessages[currentMessages.length - 1].id + 1
      : 1;
    const sysMsg: ChatMessage = {
      id: nextId,
      sender: -1,
      senderName: '系统',
      content: `游戏结束，${winnerName} 获胜！`,
      type: 'system',
      timestamp: new Date().toISOString(),
    };

    currentMessages.push(sysMsg);
    if (currentMessages.length > MAX_MESSAGES) {
      currentMessages.splice(0, currentMessages.length - MAX_MESSAGES);
    }

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        status: 'ended',
        gameState: JSON.stringify(finalState) as unknown as Record<string, unknown>,
        messages: JSON.stringify(currentMessages) as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    // 记录排行榜数据（异步 fire-and-forget，不阻塞响应）
    void this.tryRecordGameResult(room, finalState);

    const roomState = this.toRoomState(updated[0]);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  async heartbeat(roomCode: string, playerIndex: number): Promise<RoomState> {
    const room = await this.findByCode(roomCode);
    if (!room) throw new NotFoundException('房间不存在');

    const now = new Date();

    // 更新 player_last_seen 数组
    const lastSeen = this.getPlayerLastSeen(room);
    const playerNames = this.getPlayerNames(room);
    const newLastSeen: (string | null)[] = [...lastSeen];
    // 填充到玩家数量
    while (newLastSeen.length < playerNames.length) {
      newLastSeen.push(null);
    }
    newLastSeen[playerIndex] = now.toISOString();

    // 兼容旧字段
    const compatPatch = playerIndex === 0
      ? { hostLastSeen: now }
      : playerIndex === 1
      ? { guestLastSeen: now }
      : {};

    const meta = enrichGameState(
      room.gameState && typeof room.gameState === 'object'
        ? (room.gameState as unknown as GameState)
        : null,
    );

    this.updatePlayerActivity(meta, playerIndex);

    // 游戏中时顺便检查对方是否断线
    let newStatus = room.status;
    if (room.status === 'playing') {
      const checked = this.checkDisconnection(meta, playerNames);
      if (checked) {
        newStatus = checked.status;
        Object.assign(meta, checked.gameState);
      }
    }

    const baseState = (room.gameState && typeof room.gameState === 'object')
      ? (room.gameState as Record<string, unknown>)
      : {};
    const mergedState = { ...baseState, ...meta };

    const updated = await this.db
      .update(monopolyRoom)
      .set({
        status: newStatus,
        gameState: JSON.stringify(mergedState) as unknown as Record<string, unknown>,
        playerLastSeen: JSON.stringify(newLastSeen) as unknown as Record<string, unknown>,
        ...compatPatch,
      } as unknown as Record<string, unknown>)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .returning();

    const roomState = this.toRoomState(updated[0], playerIndex);
    this.notifyRoomUpdate(roomCode, roomState);
    return roomState;
  }

  private checkDisconnection(
    meta: GameStateWithMeta,
    playerNames: PlayerNameEntry[],
  ): { status: RoomState['status']; gameState: GameStateWithMeta } | null {
    const now = Date.now();
    const phase = (meta as unknown as GameState).phase;

    if (phase === 'ended') return null;

    // 旧版二元检测（基于 hostLastActiveAt/guestLastActiveAt）
    const hostIdle = now - meta.hostLastActiveAt;
    const guestIdle = now - meta.guestLastActiveAt;

    let disconnectedPlayer: 0 | 1 | null = null;
    if (meta.hostLastActiveAt > 0 && hostIdle > DISCONNECT_THRESHOLD_MS) {
      disconnectedPlayer = 0;
    }
    if (meta.guestLastActiveAt > 0 && guestIdle > DISCONNECT_THRESHOLD_MS) {
      if (disconnectedPlayer === null || guestIdle > hostIdle) {
        disconnectedPlayer = 1;
      }
    }

    if (disconnectedPlayer === null) {
      if (meta.disconnectStatus && meta.disconnectStatus.result === 'waiting') {
        meta.disconnectStatus = null;
        return { status: 'playing', gameState: meta };
      }
      return null;
    }

    const idleTime = disconnectedPlayer === 0 ? hostIdle : guestIdle;
    const disconnectedName = playerNames[disconnectedPlayer]?.name ?? `玩家${disconnectedPlayer + 1}`;

    // 超过60秒判负
    if (idleTime > FORFEIT_THRESHOLD_MS) {
      if (meta.disconnectStatus?.result === 'forfeit') return null;

      // 找胜者：第一个非断线且未破产的玩家
      const state = meta as unknown as GameState;
      let winner: number | null = null;
      for (let i = 0; i < state.players.length; i++) {
        if (i !== disconnectedPlayer && !state.players[i]?.isBankrupt) {
          winner = i;
          break;
        }
      }
      state.phase = 'ended';
      state.winner = winner;
      (state as GameStateWithMeta).disconnectStatus = {
        disconnectedPlayer,
        disconnectedAt: now - idleTime,
        result: 'forfeit',
      };

      this.addSystemMessage(meta, `${disconnectedName} 因断线判负`);
      return { status: 'ended', gameState: meta };
    }

    // 30-60秒之间：标记为等待重连
    if (!meta.disconnectStatus || meta.disconnectStatus.disconnectedPlayer !== disconnectedPlayer) {
      meta.disconnectStatus = {
        disconnectedPlayer,
        disconnectedAt: now - idleTime,
        result: 'waiting',
      };
      return { status: 'playing', gameState: meta };
    }

    return null;
  }

  private updatePlayerActivity(meta: GameStateWithMeta, playerIndex: number): void {
    const now = Date.now();
    if (playerIndex === 0) {
      meta.hostLastActiveAt = now;
    } else if (playerIndex === 1) {
      meta.guestLastActiveAt = now;
    }
  }

  private addSystemMessage(meta: GameStateWithMeta, content: string): void {
    const message: ChatMessage = {
      id: meta.chatMessages.length > 0
        ? meta.chatMessages[meta.chatMessages.length - 1].id + 1
        : 1,
      type: 'system',
      sender: -1,
      senderName: '系统',
      content,
      timestamp: new Date().toISOString(),
    };
    meta.chatMessages.push(message);
    if (meta.chatMessages.length > MAX_CHAT_MESSAGES) {
      meta.chatMessages.splice(0, meta.chatMessages.length - MAX_CHAT_MESSAGES);
    }
  }

  // ========== AI 逻辑 ==========

  private runAIAuctionTurn(state: GameState): GameState {
    let current = state;
    let step = 0;
    const maxSteps = 20;

    // 暗拍模式：所有 AI 玩家自動提交出價
    if (current.auction?.isBlind && current.auction.active) {
      for (const bidderIdx of current.auction.activeBidders) {
        if (!current.players[bidderIdx]?.isAI) continue;
        if (!current.auction?.blindBids || current.auction.blindBids[bidderIdx] !== null) continue;
        const bidAmount = aiBlindBid(current, bidderIdx);
        if (bidAmount > 0) {
          current = engineSubmitBlindBid(current, bidderIdx, bidAmount);
        } else {
          current = enginePassAuction(current, bidderIdx);
        }
        if (!current.auction?.active) break;
      }
      return current;
    }

    // 明拍模式：輪流出價
    while (
      current.phase === 'auction' &&
      current.auction &&
      current.auction.active &&
      !current.auction.isBlind &&
      step < maxSteps
    ) {
      const bidderIndex = current.auction.activeBidderIndex;
      const activeBidder = current.auction.activeBidders[bidderIndex];
      if (activeBidder === undefined || !current.players[activeBidder]?.isAI) break;

      const decision = aiAuctionDecision(current);
      if (decision.action === 'bid' && decision.bidAmount !== undefined) {
        current = enginePlaceBid(current, activeBidder, decision.bidAmount);
      } else {
        current = enginePassAuction(current, activeBidder);
      }
      step += 1;
    }

    return current;
  }

  private runAITurn(state: GameState): GameState {
    let current = state;
    const aiIndex = current.currentPlayerIndex;
    if (aiIndex === undefined || !current.players[aiIndex]?.isAI) return current;

    const maxSteps = 30;
    let step = 0;

    // AI回合开始时（rolling阶段），先尝试股票交易、建房、抵押、发起交易
    if (current.phase === 'rolling') {
      // 1. AI进行股票交易
      current = aiStockTrade(current, aiIndex);

      // 2. 尝试建房
      let buildLoop = 0;
      while (buildLoop < 10) {
        const decision = aiBuildDecision(current);
        if (!decision) break;
        current = engineBuildHouse(current, aiIndex, decision.cellId);
        buildLoop += 1;
      }

      // 3. 现金紧张时自动抵押地产
      const mortgageTargets = aiMortgageDecision(current);
      for (const cellId of mortgageTargets) {
        current = engineMortgageProperty(current, aiIndex, cellId);
      }

      // 4. 偶尔发起交易
      if (Math.random() < 0.3) {
        const tradeOffer = aiProposeTrade(current);
        if (tradeOffer) {
          // 找一个对手（AI模式下）
          let aiOpponent = -1;
          for (let j = 0; j < current.players.length; j++) {
            if (j !== aiIndex && current.players[j]?.isAI) {
              aiOpponent = j;
              break;
            }
          }
          if (aiOpponent < 0) {
            // 找任意非破产对手
            for (let j = 0; j < current.players.length; j++) {
              if (j !== aiIndex && !current.players[j]?.isBankrupt) {
                aiOpponent = j;
                break;
              }
            }
          }
          if (aiOpponent >= 0) {
            current = engineProposeTrade(current, aiIndex, aiOpponent, {
              givenProperties: tradeOffer.givenProperties,
              receivedProperties: tradeOffer.receivedProperties,
              moneyAmount: tradeOffer.moneyAmount,
            });
            // 如果对方也是AI，自动响应
            if (current.pendingTrade) {
              const toIdx = current.pendingTrade.toPlayer;
              if (current.players[toIdx]?.isAI) {
                if (aiShouldAcceptTrade(current, current.pendingTrade)) {
                  current = engineAcceptTrade(current);
                } else {
                  current = engineRejectTrade(current);
                }
              }
            }
          }
        }
      }

      // 5. AI 购买道具
      current = aiBuyItemIfNeeded(current, aiIndex);

      // 6. AI 使用道具
      current = aiUseItemIfNeeded(current, aiIndex);
    }

    while (
      current.players[current.currentPlayerIndex]?.isAI &&
      current.phase !== 'ended' &&
      step < maxSteps
    ) {
      step += 1;
      if (current.phase === 'rolling') {
        // 先處理 NPC 交互（如有）
        if (current.pendingNpcInteraction && current.pendingNpcInteraction.playerIndex === aiIndex) {
          const npcType = current.pendingNpcInteraction.npcType;
          let accept = false;
          if (npcType === 'wanderer') {
            // 流浪商人：50% 機率接受
            accept = Math.random() < 0.5;
          } else if (npcType === 'hacker') {
            // 駭客：現金 > 2000 則接受
            accept = current.players[aiIndex].money > 2000;
          }
          current = resolveNpcInteraction(current, aiIndex, accept);
          continue;
        }
        // 如果有待处理的迷你游戏，先结算
        if (current.pendingMiniGame && current.pendingMiniGame.playerIndex === aiIndex) {
          current = aiResolveMiniGame(current, aiIndex);
          continue;
        }
        const dice = rollDice();
        current = processMove(current, dice);
      } else if (current.phase === 'buying') {
        const buy = applyAIDecision(current);
        current = applyBuyDecision(current, buy);
      } else if (current.phase === 'fate') {
        current = applyFateCard(current);
      } else if (current.phase === 'chance') {
        current = applyChanceCard(current);
      } else if (current.phase === 'auction') {
        const auction = current.auction;
        if (auction && auction.active && !auction.isBlind) {
          const bidderIdx = auction.activeBidderIndex;
          const activeBidder = auction.activeBidders[bidderIdx];
          if (activeBidder !== undefined && current.players[activeBidder]?.isAI) {
            const decision = aiAuctionDecision(current);
            if (decision.action === 'bid' && decision.bidAmount !== undefined) {
              current = enginePlaceBid(current, activeBidder, decision.bidAmount);
            } else {
              current = enginePassAuction(current, activeBidder);
            }
            continue;
          }
        }
        break;
      } else {
        break;
      }
    }

    return current;
  }

  // ========== 排行榜集成 ==========

  private async tryRecordGameResult(
    room: typeof monopolyRoom.$inferSelect,
    finalState: GameState,
  ): Promise<void> {
    try {
      const playerNames = this.getPlayerNames(room);
      const visitorIds: string[] = playerNames
        .filter((p: PlayerNameEntry) => p.visitorId && p.visitorId.length > 0)
        .map((p: PlayerNameEntry) => p.visitorId!);

      // 至少需要2个有 visitorId 的玩家才记录排行榜
      if (visitorIds.length < 2) return;

      const winnerIdx = finalState.winner;
      if (winnerIdx === null || winnerIdx === undefined) return;

      const winnerEntry = playerNames[winnerIdx];
      if (!winnerEntry?.visitorId) return;

      // 计算每个玩家的总资产
      const highestAssetsPerPlayer: Record<string, number> = {};
      for (const entry of playerNames) {
        if (!entry.visitorId) continue;
        const idx = playerNames.findIndex(
          (p: PlayerNameEntry) => p.visitorId === entry.visitorId,
        );
        const playerState = finalState.players[idx];
        if (playerState) {
          highestAssetsPerPlayer[entry.visitorId] = playerState.totalAssets ?? playerState.money;
        }
      }

      await this.rankingService.recordGameResult(
        visitorIds,
        winnerEntry.visitorId,
        finalState.totalTurns ?? 0,
        highestAssetsPerPlayer,
      );
    } catch (err) {
      this.logger.error(`记录排行榜失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ========== 底层查询与映射 ==========

  private async findByCode(roomCode: string) {
    const rows = await this.db
      .select()
      .from(monopolyRoom)
      .where(eq(monopolyRoom.roomCode, roomCode))
      .limit(1);
    return rows[0] ?? null;
  }

  private toRoomState(
    row: typeof monopolyRoom.$inferSelect,
    myPlayerIndex?: number,
  ): RoomState {
    const hasState = row.gameState && typeof row.gameState === 'object';
    const gameStateRaw = hasState
      ? (row.gameState as unknown as GameState)
      : null;
    const meta = enrichGameState(gameStateRaw);

    let pureGameState: GameState | null = null;
    if (gameStateRaw && gameStateRaw.players) {
      pureGameState = gameStateRaw;
    }

    const messages: ChatMessage[] = Array.isArray(row.messages)
      ? (row.messages as unknown as ChatMessage[])
      : [];

    const maxPlayers = this.getMaxPlayers(row);
    const hostIndex = this.getHostIndex(row);
    const playerNames = this.getPlayerNames(row);
    const playerLastSeen = this.getPlayerLastSeen(row);

    // 计算断线玩家（基于 player_last_seen 数组）
    const now = new Date();
    const disconnectedPlayers: number[] = [];
    if (row.status === 'playing') {
      for (let i = 0; i < playerNames.length; i++) {
        const seen = playerLastSeen[i];
        if (!seen) continue;
        const idle = (now.getTime() - new Date(seen).getTime()) / 1000;
        if (idle > DISCONNECT_THRESHOLD_SECONDS) {
          disconnectedPlayers.push(i);
        }
      }
    }

    // 构造 players 数组
    const players: RoomPlayer[] = playerNames.map((p: PlayerNameEntry, i: number) => ({
      name: p.name,
      color: p.color,
      ready: p.ready,
      isOnline: !disconnectedPlayers.includes(i),
      visitorId: p.visitorId,
    }));

    // 向后兼容：unread 简化（不精确追踪每人，前端靠消息列表长度判断）
    const unreadCount = 0;

    // 兼容旧断线字段
    let disconnectedPlayer: number | null = null;
    if (row.disconnectedPlayer !== null && row.disconnectedPlayer !== undefined) {
      disconnectedPlayer = Number(row.disconnectedPlayer);
    } else if (disconnectedPlayers.length > 0) {
      disconnectedPlayer = disconnectedPlayers[0];
    }

    const roomMeta = this.getRoomMeta(row);

    return {
      id: row.id,
      roomCode: row.roomCode,
      gameMode: row.gameMode as GameMode,
      // 多人新字段
      maxPlayers,
      isPublic: roomMeta.isPublic,
      hasPassword: Boolean(roomMeta.password && roomMeta.password.length > 0),
      players,
      hostIndex,
      status: row.status as RoomState['status'],
      gameState: pureGameState,
      myPlayerIndex,
      messages,
      unreadCount,
      disconnectedPlayers,
      // 语音聊天
      voiceActive: meta.voiceActive,
      voiceParticipants: meta.voiceParticipants,
      // 观战模式
      spectators: meta.spectators,
      danmaku: meta.danmaku,
      // ===== 向后兼容字段 =====
      hostName: row.hostName,
      guestName: row.guestName,
      unreadHost: row.unreadHost ?? 0,
      unreadGuest: row.unreadGuest ?? 0,
      hostLastSeen: row.hostLastSeen ? new Date(row.hostLastSeen).toISOString() : null,
      guestLastSeen: row.guestLastSeen ? new Date(row.guestLastSeen).toISOString() : null,
      disconnectedPlayer,
      chatMessages: meta.chatMessages,
      hostLastActiveAt: meta.hostLastActiveAt,
      guestLastActiveAt: meta.guestLastActiveAt,
      disconnectStatus: meta.disconnectStatus,
    };
  }
}
