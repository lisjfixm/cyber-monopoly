import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  RoomState,
  GameMode,
  CreateRoomRequest,
  JoinRoomRequest,
  StartGameRequest,
  RollDiceRequest,
  BuyPropertyRequest,
  BuildHouseRequest,
  DemolishRequest,
  MortgageRequest,
  RedeemRequest,
  ProposeTradeRequest,
  TradeResponseRequest,
  SelectProfessionRequest,
  AuctionStartRequest,
  AuctionBidRequest,
  AuctionPassRequest,
  NpcBuyItemRequest,
  NpcHireHackerRequest,
  NpcCloseRequest,
  BlindBidRequest,
  RevealBlindBidsRequest,
  BuyStockRequest,
  SellStockRequest,
  ForceAcquireRequest,
  ShareholderMeetingRequest,
  UndergroundMarketBuyRequest,
  BribeBankRequest,
  StockSymbol,
  SendChatMessageRequest,
  MarkChatReadRequest,
  HeartbeatRequest,
  SurrenderDisconnectedRequest,
  SendChatResponse,
  MarkChatReadResponse,
  HeartbeatResponse,
  SurrenderDisconnectedResponse,
  ApiResponse,
  BuyItemRequest,
  UseItemRequest,
  MiniGameActionRequest,
  ItemType,
  VoiceToggleRequest,
  SpectatorJoinRequest,
  SpectatorLeaveRequest,
  SpectatorFollowRequest,
  DanmakuRequest,
  DailyChallengeType,
  Spectator,
  DanmakuMessage,
  UserSaveData,
  SyncSaveResponse,
  PayBailRequest,
  ChooseUpgradePathRequest,
  AllianceInviteRequest,
  AllianceActionRequest,
  BlackMarketBidRequest,
  BlackMarketFinalizeRequest,
  PropertyUpgradePath,
} from '@shared/api.interface';

async function request<T>(url: string, method: string, data?: unknown): Promise<T> {
  const response = await axiosForBackend({ url, method, data });
  const result = response.data as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }
  if (result.data === null || result.data === undefined) {
    throw new Error('伺服器返回空数据');
  }
  return result.data;
}

export const monopolyApi = {
  createRoom: (
    hostName: string,
    maxPlayers = 2,
    gameMode?: GameMode,
    visitorId?: string,
    password?: string,
    isPublic?: boolean,
    defaultAuctionMode?: 'open' | 'blind',
    turnTimeLimit?: number,
  ) =>
    request<RoomState>('/api/monopoly/room', 'POST', {
      hostName,
      maxPlayers,
      gameMode,
      visitorId,
      password,
      isPublic,
      defaultAuctionMode,
      turnTimeLimit,
    } as CreateRoomRequest),

  joinRoom: (roomCode: string, playerName: string, visitorId?: string, password?: string) =>
    request<{ room: RoomState; playerIndex: number }>('/api/monopoly/room/join', 'POST', {
      roomCode,
      playerName,
      visitorId,
      password,
    } as JoinRoomRequest),

  startGame: (roomCode: string, playerIndex: number, gameMode: GameMode, challenge?: DailyChallengeType) =>
    request<RoomState>('/api/monopoly/room/start', 'POST', {
      roomCode,
      playerIndex,
      gameMode,
      challenge,
    } as StartGameRequest),

  getPublicRooms: (filter?: { gameMode?: string; maxPlayers?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filter?.gameMode) params.set('gameMode', filter.gameMode);
    if (filter?.maxPlayers !== undefined) params.set('maxPlayers', String(filter.maxPlayers));
    if (filter?.status) params.set('status', filter.status);
    return request<RoomState[]>(`/api/monopoly/rooms/public?${params.toString()}`, 'GET');
  },

  getRoom: (roomCode: string, playerIndex?: number) =>
    request<RoomState>(
      `/api/monopoly/room/${roomCode}${playerIndex !== undefined ? `?playerIndex=${playerIndex}` : ''}`,
      'GET',
    ),

  leaveRoom: (roomCode: string, playerIndex: number) =>
    request<{ success: boolean }>('/api/monopoly/room/leave', 'POST', {
      roomCode,
      playerIndex,
    }),

  rollDice: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/roll', 'POST', {
      roomCode,
      playerIndex,
    } as RollDiceRequest),

  buyProperty: (roomCode: string, playerIndex: number, buy: boolean) =>
    request<RoomState>('/api/monopoly/buy', 'POST', {
      roomCode,
      playerIndex,
      buy,
    } as BuyPropertyRequest),

  buildHouse: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/build', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as BuildHouseRequest),

  demolishBuilding: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/demolish', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as DemolishRequest),

  mortgageProperty: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/mortgage', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as MortgageRequest),

  redeemProperty: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/redeem', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as RedeemRequest),

  proposeTrade: (
    roomCode: string,
    playerIndex: number,
    targetPlayerIndex: number,
    givenProperties: number[],
    receivedProperties: number[],
    moneyAmount: number,
  ) =>
    request<RoomState>('/api/monopoly/trade/propose', 'POST', {
      roomCode,
      playerIndex,
      targetPlayerIndex,
      givenProperties,
      receivedProperties,
      moneyAmount,
    } as ProposeTradeRequest),

  respondTrade: (roomCode: string, playerIndex: number, accept: boolean) =>
    request<RoomState>('/api/monopoly/trade/respond', 'POST', {
      roomCode,
      playerIndex,
      accept,
    } as TradeResponseRequest),

  selectProfession: (roomCode: string, playerIndex: number, profession: string) =>
    request<RoomState>('/api/monopoly/select-profession', 'POST', {
      roomCode,
      playerIndex,
      profession,
    } as SelectProfessionRequest),

  startAuction: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/auction/start', 'POST', {
      roomCode,
      playerIndex,
    } as AuctionStartRequest),

  auctionBid: (roomCode: string, playerIndex: number, bidAmount: number) =>
    request<RoomState>('/api/monopoly/auction/bid', 'POST', {
      roomCode,
      playerIndex,
      bidAmount,
    } as AuctionBidRequest),

  auctionPass: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/auction/pass', 'POST', {
      roomCode,
      playerIndex,
    } as AuctionPassRequest),

  // ===== NPC 系统 =====
  npcBuyItem: (roomCode: string, playerIndex: number, itemType: string) =>
    request<RoomState>('/api/monopoly/npc/buy-item', 'POST', {
      roomCode,
      playerIndex,
      itemType,
    } as NpcBuyItemRequest),

  npcHireHacker: (roomCode: string, playerIndex: number, targetPlayerIndex: number) =>
    request<RoomState>('/api/monopoly/npc/hire-hacker', 'POST', {
      roomCode,
      playerIndex,
      targetPlayerIndex,
    } as NpcHireHackerRequest),

  npcClose: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/npc/close', 'POST', {
      roomCode,
      playerIndex,
    } as NpcCloseRequest),

  // ===== 暗拍系统 =====
  submitBlindBid: (roomCode: string, playerIndex: number, bidAmount: number) =>
    request<RoomState>('/api/monopoly/auction/blind-bid', 'POST', {
      roomCode,
      playerIndex,
      bidAmount,
    } as BlindBidRequest),

  revealBlindBids: (roomCode: string) =>
    request<RoomState>('/api/monopoly/auction/reveal', 'POST', {
      roomCode,
    } as RevealBlindBidsRequest),

  buyStock: (roomCode: string, playerIndex: number, symbol: StockSymbol, quantity: number) =>
    request<RoomState>('/api/monopoly/stock/buy', 'POST', {
      roomCode,
      playerIndex,
      symbol,
      quantity,
    } as BuyStockRequest),

  sellStock: (roomCode: string, playerIndex: number, symbol: StockSymbol, quantity: number) =>
    request<RoomState>('/api/monopoly/stock/sell', 'POST', {
      roomCode,
      playerIndex,
      symbol,
      quantity,
    } as SellStockRequest),

  // ===== 強制收購 =====
  forceAcquire: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/force-acquire', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as ForceAcquireRequest),

  // ===== 股東大會 =====
  callShareholderMeeting: (roomCode: string, playerIndex: number, symbol: StockSymbol, direction: 'up' | 'down') =>
    request<RoomState>('/api/monopoly/shareholder-meeting', 'POST', {
      roomCode,
      playerIndex,
      symbol,
      direction,
    } as ShareholderMeetingRequest),

  // ===== 地下市場 =====
  undergroundMarketBuy: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/underground-market/buy', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as UndergroundMarketBuyRequest),

  // ===== 地產升級樹 =====
  chooseUpgradePath: (roomCode: string, playerIndex: number, cellId: number, path: PropertyUpgradePath) =>
    request<RoomState>('/api/monopoly/upgrade-path', 'POST', {
      roomCode,
      playerIndex,
      cellId,
      path,
    } as ChooseUpgradePathRequest),

  // ===== 聯盟系統 =====
  sendAllianceInvite: (roomCode: string, playerIndex: number, targetPlayerIndex: number) =>
    request<RoomState>('/api/monopoly/alliance/invite', 'POST', {
      roomCode,
      playerIndex,
      targetPlayerIndex,
    } as AllianceInviteRequest),
  acceptAllianceInvite: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/alliance/accept', 'POST', {
      roomCode,
      playerIndex,
    } as AllianceActionRequest),
  rejectAllianceInvite: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/alliance/reject', 'POST', {
      roomCode,
      playerIndex,
    } as AllianceActionRequest),
  breakAlliance: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/alliance/break', 'POST', {
      roomCode,
      playerIndex,
    } as AllianceActionRequest),

  // ===== 黑市拍賣 =====
  placeBlackMarketBid: (roomCode: string, playerIndex: number, itemIndex: number, bidAmount: number) =>
    request<RoomState>('/api/monopoly/black-market/bid', 'POST', {
      roomCode,
      playerIndex,
      itemIndex,
      bidAmount,
    } as BlackMarketBidRequest),
  finalizeBlackMarketAuction: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/black-market/finalize', 'POST', {
      roomCode,
      playerIndex,
    } as BlackMarketFinalizeRequest),

  // ===== 賄賂銀行 =====
  bribeBank: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/bribe-bank', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    } as BribeBankRequest),

  sendChatMessage: (roomCode: string, playerIndex: number, content: string, type?: 'player' | 'voice') =>
    request<RoomState>('/api/monopoly/chat/send', 'POST', {
      roomCode,
      playerIndex,
      content,
      type,
    } as SendChatMessageRequest),

  // 新聊天接口
  sendChat: (roomCode: string, playerIndex: number, content: string, type?: 'player' | 'voice') =>
    request<SendChatResponse>('/api/monopoly/chat', 'POST', {
      roomCode,
      playerIndex,
      content,
      type,
    } as SendChatMessageRequest),

  markChatRead: (roomCode: string, playerIndex: number) =>
    request<MarkChatReadResponse>('/api/monopoly/chat/read', 'POST', {
      roomCode,
      playerIndex,
    } as MarkChatReadRequest),

  // 心跳与断线
  sendHeartbeat: (roomCode: string, playerIndex: number) =>
    request<HeartbeatResponse>('/api/monopoly/heartbeat', 'POST', {
      roomCode,
      playerIndex,
    } as HeartbeatRequest),

  surrenderDisconnected: (roomCode: string, playerIndex: number) =>
    request<SurrenderDisconnectedResponse>('/api/monopoly/surrender-disconnected', 'POST', {
      roomCode,
      playerIndex,
    } as SurrenderDisconnectedRequest),

  // ===== 道具系统 =====
  buyItem: (roomCode: string, playerIndex: number, itemType: ItemType) =>
    request<RoomState>('/api/monopoly/item/buy', 'POST', {
      roomCode,
      playerIndex,
      itemType,
    } as BuyItemRequest),

  useItem: (roomCode: string, playerIndex: number, itemId: number, targetCellId?: number) =>
    request<RoomState>('/api/monopoly/item/use', 'POST', {
      roomCode,
      playerIndex,
      itemId,
      targetCellId,
    } as UseItemRequest),

  payBail: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/pay-bail', 'POST', {
      roomCode,
      playerIndex,
    } as PayBailRequest),

  // ===== 迷你游戏 =====
  startMiniGame: (roomCode: string, playerIndex: number) =>
    request<RoomState>('/api/monopoly/minigame/start', 'POST', {
      roomCode,
      playerIndex,
    }),

  miniGameAction: (roomCode: string, playerIndex: number, action: string, data?: unknown) =>
    request<RoomState>('/api/monopoly/minigame/action', 'POST', {
      roomCode,
      playerIndex,
      action,
      data,
    } as MiniGameActionRequest),

  // ===== 贷款系统 =====
  takeLoan: (roomCode: string, playerIndex: number, amount: number) =>
    request<RoomState>('/api/monopoly/loan/take', 'POST', {
      roomCode,
      playerIndex,
      amount,
    }),

  repayLoan: (roomCode: string, playerIndex: number, amount: number) =>
    request<RoomState>('/api/monopoly/loan/repay', 'POST', {
      roomCode,
      playerIndex,
      amount,
    }),

  // ===== 保险系统 =====
  buyInsurance: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/insurance/buy', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    }),

  // ===== 债券系统 =====
  issueBond: (
    roomCode: string,
    playerIndex: number,
    amount: number,
    interestRate: number,
    turns: number,
  ) =>
    request<RoomState>('/api/monopoly/bond/issue', 'POST', {
      roomCode,
      playerIndex,
      amount,
      interestRate,
      turns,
    }),

  subscribeBond: (roomCode: string, playerIndex: number, bondId: string) =>
    request<RoomState>('/api/monopoly/bond/subscribe', 'POST', {
      roomCode,
      playerIndex,
      bondId,
    }),

  // ===== 語音聊天 =====
  toggleVoice: (roomCode: string, playerIndex: number, muted: boolean) =>
    request<RoomState>('/api/monopoly/voice/toggle', 'POST', {
      roomCode,
      playerIndex,
      muted,
    } as VoiceToggleRequest),

  // ===== 觀戰模式 =====
  joinAsSpectator: (roomCode: string, visitorId: string, nickname: string) =>
    request<{ room: RoomState; spectatorId: string }>('/api/monopoly/spectator/join', 'POST', {
      roomCode,
      visitorId,
      nickname,
    } as SpectatorJoinRequest),

  leaveAsSpectator: (roomCode: string, visitorId: string) =>
    request<RoomState>('/api/monopoly/spectator/leave', 'POST', {
      roomCode,
      visitorId,
    } as SpectatorLeaveRequest),

  spectatorFollow: (roomCode: string, visitorId: string, followPlayer: number | null) =>
    request<RoomState>('/api/monopoly/spectator/follow', 'POST', {
      roomCode,
      visitorId,
      followPlayer,
    } as SpectatorFollowRequest),

  sendDanmaku: (roomCode: string, visitorId: string, nickname: string, content: string, color?: string) =>
    request<RoomState>('/api/monopoly/spectator/danmaku', 'POST', {
      roomCode,
      visitorId,
      nickname,
      content,
      color,
    } as DanmakuRequest),

  // ===== 跨平台存檔同步 =====
  getSaveData: (visitorId: string) =>
    request<UserSaveData | null>(`/api/monopoly/save?visitorId=${encodeURIComponent(visitorId)}`, 'GET'),

  uploadSaveData: (visitorId: string, saveData: UserSaveData, clientUpdatedAt: string) =>
    request<SyncSaveResponse>('/api/monopoly/save', 'POST', {
      visitorId,
      saveData,
      clientUpdatedAt,
    }),

  // ===== 技能樹系統 =====
  upgradeSkill: (roomCode: string, playerIndex: number, skillId: string) =>
    request<RoomState>('/api/monopoly/skill/upgrade', 'POST', {
      roomCode,
      playerIndex,
      skillId,
    }),

  // ===== 特殊建築系統 =====
  buildSpecialBuilding: (roomCode: string, playerIndex: number, cellId: number, buildingType: string) =>
    request<RoomState>('/api/monopoly/building/special', 'POST', {
      roomCode,
      playerIndex,
      cellId,
      buildingType,
    }),

  demolishSpecialBuilding: (roomCode: string, playerIndex: number, cellId: number) =>
    request<RoomState>('/api/monopoly/building/special-demolish', 'POST', {
      roomCode,
      playerIndex,
      cellId,
    }),
};
