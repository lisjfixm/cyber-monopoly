import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  Sse,
  type MessageEvent,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';

import { MonopolyService } from './monopoly.service';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  TransferHostRequest,
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
  ChooseUpgradePathRequest,
  AllianceInviteRequest,
  AllianceActionRequest,
  BlackMarketBidRequest,
  BlackMarketFinalizeRequest,
  BribeBankRequest,
  BuyItemRequest,
  UseItemRequest,
  PayBailRequest,
  MiniGameActionRequest,
  SendChatMessageRequest,
  MarkChatReadRequest,
  HeartbeatRequest,
  SurrenderDisconnectedRequest,
  TakeLoanRequest,
  RepayLoanRequest,
  BuyInsuranceRequest,
  IssueBondRequest,
  SubscribeBondRequest,
  UpgradeSkillRequest,
  BuildSpecialBuildingRequest,
  DemolishSpecialBuildingRequest,
  VoiceToggleRequest,
  SpectatorJoinRequest,
  SpectatorLeaveRequest,
  SpectatorFollowRequest,
  DanmakuRequest,
  ApiResponse,
  RoomState,
  SendChatResponse,
  MarkChatReadResponse,
  HeartbeatResponse,
  SurrenderDisconnectedResponse,
  UserSaveData,
  SyncSaveRequest,
  SyncSaveResponse,
} from '@shared/api.interface';

@Controller('api/monopoly')
export class MonopolyController {
  constructor(private readonly monopolyService: MonopolyService) {}

  @Post('room')
  async createRoom(@Body() dto: CreateRoomRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.hostName?.trim()) throw new BadRequestException('昵称不能为空');
    const room = await this.monopolyService.createRoom({
      hostName: dto.hostName.trim(),
      gameMode: dto.gameMode,
      maxPlayers: dto.maxPlayers,
      visitorId: dto.visitorId,
      password: dto.password,
      isPublic: dto.isPublic,
      defaultAuctionMode: dto.defaultAuctionMode,
      turnTimeLimit: dto.turnTimeLimit,
    });
    return { code: 0, message: 'ok', data: room };
  }

  @Post('room/join')
  async joinRoom(
    @Body() dto: JoinRoomRequest,
  ): Promise<ApiResponse<{ room: RoomState; playerIndex: number }>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    // 向后兼容：支持 guestName 字段
    const playerName = dto.playerName?.trim() || dto.guestName?.trim();
    if (!playerName) throw new BadRequestException('昵称不能为空');

    const result = await this.monopolyService.joinRoom(
      dto.roomCode,
      playerName,
      dto.visitorId,
      dto.password,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('room/:roomCode/leave')
  async leaveRoom(
    @Param('roomCode') roomCode: string,
    @Body() dto: LeaveRoomRequest,
  ): Promise<ApiResponse<RoomState>> {
    if (!roomCode || !/^\d{6}$/.test(roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }

    const room = await this.monopolyService.leaveRoom(
      roomCode,
      dto.visitorId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('room/:roomCode/transfer-host')
  async transferHost(
    @Param('roomCode') roomCode: string,
    @Body() dto: TransferHostRequest,
  ): Promise<ApiResponse<RoomState>> {
    if (!roomCode || !/^\d{6}$/.test(roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }

    const room = await this.monopolyService.transferHost(
      roomCode,
      dto.fromVisitorId,
      dto.toPlayerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('room/start')
  async startGame(@Body() dto: StartGameRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.startGame(
      dto.roomCode,
      dto.playerIndex,
      dto.gameMode,
      dto.challenge,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Get('rooms/public')
  async getPublicRooms(
    @Query('gameMode') gameMode?: string,
    @Query('maxPlayers') maxPlayers?: string,
    @Query('status') status?: string,
  ): Promise<ApiResponse<RoomState[]>> {
    const rooms = await this.monopolyService.getPublicRooms({
      gameMode,
      maxPlayers: maxPlayers !== undefined ? parseInt(maxPlayers, 10) : undefined,
      status,
    });
    return { code: 0, message: 'ok', data: rooms };
  }

  @Get('room/:code')
  async getRoom(
    @Param('code') code: string,
    @Query('playerIndex') playerIndex?: string,
  ): Promise<ApiResponse<RoomState>> {
    const idx = playerIndex !== undefined ? parseInt(playerIndex, 10) : undefined;
    const room = await this.monopolyService.getRoom(code, idx);
    return { code: 0, message: 'ok', data: room };
  }

  @Post('roll')
  async rollDice(@Body() dto: RollDiceRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.rollDice(dto.roomCode, dto.playerIndex);
    return { code: 0, message: 'ok', data: room };
  }

  @Post('buy')
  async buyProperty(@Body() dto: BuyPropertyRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.buyProperty(dto.roomCode, dto.playerIndex, dto.buy);
    return { code: 0, message: 'ok', data: room };
  }

  @Post('build')
  async buildHouse(@Body() dto: BuildHouseRequest): Promise<ApiResponse<RoomState>> {
    if (dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('地块ID无效');
    }
    const room = await this.monopolyService.buildHouse(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('demolish')
  async demolishBuilding(@Body() dto: DemolishRequest): Promise<ApiResponse<RoomState>> {
    if (dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('地块ID无效');
    }
    const room = await this.monopolyService.demolishBuilding(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('mortgage')
  async mortgageProperty(@Body() dto: MortgageRequest): Promise<ApiResponse<RoomState>> {
    if (dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('地块ID无效');
    }
    const room = await this.monopolyService.mortgageProperty(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('redeem')
  async redeemProperty(@Body() dto: RedeemRequest): Promise<ApiResponse<RoomState>> {
    if (dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('地块ID无效');
    }
    const room = await this.monopolyService.redeemProperty(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('trade/propose')
  async proposeTrade(@Body() dto: ProposeTradeRequest): Promise<ApiResponse<RoomState>> {
    if (dto.givenProperties.length === 0 && dto.receivedProperties.length === 0 && dto.moneyAmount === 0) {
      throw new BadRequestException('交易内容不能为空');
    }
    const room = await this.monopolyService.proposeTrade(
      dto.roomCode,
      dto.playerIndex,
      dto.givenProperties,
      dto.receivedProperties,
      dto.moneyAmount,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('trade/respond')
  async respondTrade(@Body() dto: TradeResponseRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.respondTrade(
      dto.roomCode,
      dto.playerIndex,
      dto.accept,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('select-profession')
  async selectProfession(@Body() dto: SelectProfessionRequest): Promise<ApiResponse<RoomState>> {
    const validProfessions = [
      'engineer', 'banker', 'speculator', 'tycoon', 'hacker', 'doctor',
      'lawyer', 'journalist', 'gambler', 'artist', 'scientist', 'traveler',
      'cyber_hacker', 'quantum_physicist', 'influencer', 'black_market_dealer', 'cyberborg', 'blockchain_miner',
    ];
    if (!validProfessions.includes(dto.profession)) {
      throw new BadRequestException('无效的职业');
    }
    const room = await this.monopolyService.selectProfession(
      dto.roomCode,
      dto.playerIndex,
      dto.profession,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('auction/start')
  async startAuction(@Body() dto: AuctionStartRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.startAuction(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('auction/bid')
  async auctionBid(@Body() dto: AuctionBidRequest): Promise<ApiResponse<RoomState>> {
    if (dto.bidAmount <= 0) throw new BadRequestException('出价金额必须大于0');
    const room = await this.monopolyService.auctionBid(
      dto.roomCode,
      dto.playerIndex,
      dto.bidAmount,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('auction/pass')
  async auctionPass(@Body() dto: AuctionPassRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.auctionPass(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== NPC 系统 ==========

  @Post('npc/buy-item')
  async npcBuyItem(@Body() dto: NpcBuyItemRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!dto.itemType) {
      throw new BadRequestException('道具类型不能为空');
    }
    const room = await this.monopolyService.npcBuyItem(
      dto.roomCode,
      dto.playerIndex,
      dto.itemType,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('npc/hire-hacker')
  async npcHireHacker(@Body() dto: NpcHireHackerRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.targetPlayerIndex) || dto.targetPlayerIndex < 0) {
      throw new BadRequestException('无效的目标玩家索引');
    }
    const room = await this.monopolyService.npcHireHacker(
      dto.roomCode,
      dto.playerIndex,
      dto.targetPlayerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('npc/close')
  async npcClose(@Body() dto: NpcCloseRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const room = await this.monopolyService.npcClose(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 暗拍系统 ==========

  @Post('auction/blind-bid')
  async submitBlindBid(@Body() dto: BlindBidRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.bidAmount) || dto.bidAmount <= 0) {
      throw new BadRequestException('出价必须为正整数');
    }
    const room = await this.monopolyService.submitBlindBid(
      dto.roomCode,
      dto.playerIndex,
      dto.bidAmount,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('auction/reveal')
  async revealBlindBids(@Body() dto: RevealBlindBidsRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    const room = await this.monopolyService.revealBlindBids(dto.roomCode);
    return { code: 0, message: 'ok', data: room };
  }

  @Post('stock/buy')
  async buyStock(@Body() dto: BuyStockRequest): Promise<ApiResponse<RoomState>> {
    if (dto.quantity <= 0) throw new BadRequestException('数量必须大于0');
    const validSymbols = ['NEON', 'QNTM', 'DATA', 'CYBR'];
    if (!validSymbols.includes(dto.symbol)) {
      throw new BadRequestException('无效的股票代码');
    }
    const room = await this.monopolyService.buyStock(
      dto.roomCode,
      dto.playerIndex,
      dto.symbol,
      dto.quantity,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('stock/sell')
  async sellStock(@Body() dto: SellStockRequest): Promise<ApiResponse<RoomState>> {
    if (dto.quantity <= 0) throw new BadRequestException('数量必须大于0');
    const validSymbols = ['NEON', 'QNTM', 'DATA', 'CYBR'];
    if (!validSymbols.includes(dto.symbol)) {
      throw new BadRequestException('无效的股票代码');
    }
    const room = await this.monopolyService.sellStock(
      dto.roomCode,
      dto.playerIndex,
      dto.symbol,
      dto.quantity,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 強制收購系統 ==========

  @Post('force-acquire')
  async forceAcquireProperty(@Body() dto: ForceAcquireRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    const room = await this.monopolyService.forceAcquireProperty(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 賄賂銀行系統 ==========

  @Post('bribe-bank')
  async bribeBank(@Body() dto: BribeBankRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    const room = await this.monopolyService.bribeBank(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 股東大會系統 ==========

  @Post('shareholder-meeting')
  async callShareholderMeeting(@Body() dto: ShareholderMeetingRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const validSymbols = ['NEON', 'QNTM', 'DATA', 'CYBR'];
    if (!validSymbols.includes(dto.symbol)) {
      throw new BadRequestException('无效的股票代码');
    }
    if (dto.direction !== 'up' && dto.direction !== 'down') {
      throw new BadRequestException('无效的方向');
    }
    const room = await this.monopolyService.callShareholderMeeting(
      dto.roomCode,
      dto.playerIndex,
      dto.symbol,
      dto.direction,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 地下市場系統 ==========

  @Post('underground-market/buy')
  async undergroundMarketBuy(@Body() dto: UndergroundMarketBuyRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    const room = await this.monopolyService.undergroundMarketBuy(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ===== 地產升級樹 =====

  @Post('upgrade-path')
  async chooseUpgradePath(@Body() dto: ChooseUpgradePathRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    if (!['attack', 'defense', 'tech'].includes(dto.path)) {
      throw new BadRequestException('无效的升级路线');
    }
    const room = await this.monopolyService.chooseUpgradePath(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
      dto.path,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ===== 聯盟系統 =====

  @Post('alliance/invite')
  async sendAllianceInvite(@Body() dto: AllianceInviteRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.targetPlayerIndex) || dto.targetPlayerIndex < 0) {
      throw new BadRequestException('无效的目标玩家索引');
    }
    const room = await this.monopolyService.sendAllianceInvite(
      dto.roomCode,
      dto.playerIndex,
      dto.targetPlayerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('alliance/accept')
  async acceptAllianceInvite(@Body() dto: AllianceActionRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const room = await this.monopolyService.acceptAllianceInvite(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('alliance/reject')
  async rejectAllianceInvite(@Body() dto: AllianceActionRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const room = await this.monopolyService.rejectAllianceInvite(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('alliance/break')
  async breakAlliance(@Body() dto: AllianceActionRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const room = await this.monopolyService.breakAlliance(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ===== 黑市拍賣 =====

  @Post('black-market/bid')
  async placeBlackMarketBid(@Body() dto: BlackMarketBidRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.itemIndex) || dto.itemIndex < 0) {
      throw new BadRequestException('无效的道具索引');
    }
    if (!Number.isInteger(dto.bidAmount) || dto.bidAmount < 300) {
      throw new BadRequestException('出价金额无效');
    }
    const room = await this.monopolyService.placeBlackMarketBid(
      dto.roomCode,
      dto.playerIndex,
      dto.itemIndex,
      dto.bidAmount,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('black-market/finalize')
  async finalizeBlackMarketAuction(@Body() dto: BlackMarketFinalizeRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const room = await this.monopolyService.finalizeBlackMarketAuction(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ===== 聊天系统新接口 =====

  @Post('chat')
  async sendChat(@Body() dto: SendChatMessageRequest): Promise<ApiResponse<SendChatResponse>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!dto.content?.trim()) throw new BadRequestException('消息内容不能为空');
    if (dto.content.trim().length > 500) {
      throw new BadRequestException('消息长度不能超过500字');
    }
    const result = await this.monopolyService.sendChat(
      dto.roomCode,
      dto.playerIndex,
      dto.content.trim(),
      dto.type === 'voice' ? 'voice' : 'player',
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('chat/read')
  async markChatRead(@Body() dto: MarkChatReadRequest): Promise<ApiResponse<MarkChatReadResponse>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const result = await this.monopolyService.markChatRead(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: result };
  }

  // ===== 心跳与断线重连 =====

  @Post('heartbeat')
  async heartbeat(@Body() dto: HeartbeatRequest): Promise<ApiResponse<HeartbeatResponse>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const result = await this.monopolyService.playerHeartbeat(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('surrender-disconnected')
  async surrenderDisconnected(
    @Body() dto: SurrenderDisconnectedRequest,
  ): Promise<ApiResponse<SurrenderDisconnectedResponse>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const result = await this.monopolyService.surrenderDisconnected(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: result };
  }

  // ========== 道具系统 ==========

  @Post('item/buy')
  async buyItem(@Body() dto: BuyItemRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!dto.itemType) {
      throw new BadRequestException('道具类型不能为空');
    }
    const result = await this.monopolyService.buyItem(
      dto.roomCode,
      dto.playerIndex,
      dto.itemType,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('item/use')
  async useItem(@Body() dto: UseItemRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.itemId) || dto.itemId < 0) {
      throw new BadRequestException('无效的道具ID');
    }
    const result = await this.monopolyService.useItem(
      dto.roomCode,
      dto.playerIndex,
      dto.itemId,
      dto.targetCellId,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('pay-bail')
  async payBail(@Body() dto: PayBailRequest): Promise<ApiResponse<RoomState>> {
    const room = await this.monopolyService.payBail(dto.roomCode, dto.playerIndex);
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 迷你游戏系统 ==========

  @Post('minigame/start')
  async startMiniGame(@Body() dto: { roomCode: string; playerIndex: number }): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    const result = await this.monopolyService.startMiniGame(
      dto.roomCode,
      dto.playerIndex,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('minigame/action')
  async miniGameAction(@Body() dto: MiniGameActionRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!dto.action) {
      throw new BadRequestException('操作类型不能为空');
    }
    const result = await this.monopolyService.miniGameAction(
      dto.roomCode,
      dto.playerIndex,
      dto.action,
      dto.data,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('loan/take')
  async takeLoan(@Body() dto: TakeLoanRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.amount) || dto.amount <= 0) {
      throw new BadRequestException('贷款金额必须为正整数');
    }
    const result = await this.monopolyService.takeLoan(
      dto.roomCode,
      dto.playerIndex,
      dto.amount,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('loan/repay')
  async repayLoan(@Body() dto: RepayLoanRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.amount) || dto.amount <= 0) {
      throw new BadRequestException('还款金额必须为正整数');
    }
    const result = await this.monopolyService.repayLoan(
      dto.roomCode,
      dto.playerIndex,
      dto.amount,
    );
    return { code: 0, message: 'ok', data: result };
  }

  // ========== 保险系统 ==========

  @Post('insurance/buy')
  async buyInsurance(@Body() dto: BuyInsuranceRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    const room = await this.monopolyService.buyInsurance(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('skill/upgrade')
  async upgradeSkill(@Body() dto: UpgradeSkillRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!dto.skillId || typeof dto.skillId !== 'string') {
      throw new BadRequestException('无效的技能ID');
    }
    const room = await this.monopolyService.upgradeSkill(
      dto.roomCode,
      dto.playerIndex,
      dto.skillId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('building/special')
  async buildSpecialBuilding(@Body() dto: BuildSpecialBuildingRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    if (!dto.buildingType || typeof dto.buildingType !== 'string') {
      throw new BadRequestException('无效的特殊建筑类型');
    }
    const room = await this.monopolyService.buildSpecialBuilding(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
      dto.buildingType,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('building/special-demolish')
  async demolishSpecialBuilding(@Body() dto: DemolishSpecialBuildingRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.cellId) || dto.cellId < 0 || dto.cellId > 35) {
      throw new BadRequestException('无效的地块ID');
    }
    const room = await this.monopolyService.demolishSpecialBuilding(
      dto.roomCode,
      dto.playerIndex,
      dto.cellId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 债券系统 ==========

  @Post('bond/issue')
  async issueBond(@Body() dto: IssueBondRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!Number.isInteger(dto.amount) || dto.amount <= 0) {
      throw new BadRequestException('债券金额必须为正整数');
    }
    if (typeof dto.interestRate !== 'number' || dto.interestRate < 0) {
      throw new BadRequestException('利率必须为非负数');
    }
    if (!Number.isInteger(dto.turns) || dto.turns <= 0) {
      throw new BadRequestException('回合数必须为正整数');
    }
    const room = await this.monopolyService.issueBond(
      dto.roomCode,
      dto.playerIndex,
      dto.amount,
      dto.interestRate,
      dto.turns,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('bond/subscribe')
  async subscribeBond(@Body() dto: SubscribeBondRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房间码格式错误');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('无效的玩家索引');
    }
    if (!dto.bondId || typeof dto.bondId !== 'string') {
      throw new BadRequestException('债券ID不能为空');
    }
    const room = await this.monopolyService.subscribeBond(
      dto.roomCode,
      dto.playerIndex,
      dto.bondId,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 語音聊天 ==========

  @Post('voice/toggle')
  async toggleVoice(@Body() dto: VoiceToggleRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房間碼格式錯誤');
    }
    if (!Number.isInteger(dto.playerIndex) || dto.playerIndex < 0) {
      throw new BadRequestException('無效的玩家索引');
    }
    if (typeof dto.muted !== 'boolean') {
      throw new BadRequestException('muted 參數必須為布林值');
    }
    const room = await this.monopolyService.toggleVoice(
      dto.roomCode,
      dto.playerIndex,
      dto.muted,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== 觀戰模式 ==========

  @Post('spectator/join')
  async spectatorJoin(@Body() dto: SpectatorJoinRequest): Promise<ApiResponse<{ room: RoomState; spectatorId: string }>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房間碼格式錯誤');
    }
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('觀戰者ID不能為空');
    }
    if (!dto.nickname?.trim()) {
      throw new BadRequestException('暱稱不能為空');
    }
    const result = await this.monopolyService.joinAsSpectator(
      dto.roomCode,
      dto.visitorId.trim(),
      dto.nickname.trim(),
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Post('spectator/leave')
  async spectatorLeave(@Body() dto: SpectatorLeaveRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房間碼格式錯誤');
    }
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('觀戰者ID不能為空');
    }
    const room = await this.monopolyService.leaveAsSpectator(
      dto.roomCode,
      dto.visitorId.trim(),
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('spectator/follow')
  async spectatorFollow(@Body() dto: SpectatorFollowRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房間碼格式錯誤');
    }
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('觀戰者ID不能為空');
    }
    if (dto.followPlayer !== null && (!Number.isInteger(dto.followPlayer) || dto.followPlayer < 0)) {
      throw new BadRequestException('無效的跟隨玩家索引');
    }
    const room = await this.monopolyService.spectatorFollow(
      dto.roomCode,
      dto.visitorId.trim(),
      dto.followPlayer,
    );
    return { code: 0, message: 'ok', data: room };
  }

  @Post('spectator/danmaku')
  async sendDanmaku(@Body() dto: DanmakuRequest): Promise<ApiResponse<RoomState>> {
    if (!dto.roomCode || !/^\d{6}$/.test(dto.roomCode)) {
      throw new BadRequestException('房間碼格式錯誤');
    }
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('觀戰者ID不能為空');
    }
    if (!dto.content?.trim()) {
      throw new BadRequestException('彈幕內容不能為空');
    }
    if (dto.content.trim().length > 50) {
      throw new BadRequestException('彈幕長度不能超過50字');
    }
    const room = await this.monopolyService.sendDanmaku(
      dto.roomCode,
      dto.visitorId.trim(),
      dto.nickname?.trim() || '匿名觀眾',
      dto.content.trim(),
      dto.color,
    );
    return { code: 0, message: 'ok', data: room };
  }

  // ========== SSE 实时推送 ==========

  // ========== 跨平台存檔同步 ==========

  @Get('save')
  async getSaveData(
    @Query('visitorId') visitorId?: string,
  ): Promise<ApiResponse<UserSaveData | null>> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    const result = await this.monopolyService.getSaveData(visitorId.trim());
    return { code: 0, message: 'ok', data: result };
  }

  @Post('save')
  async uploadSaveData(
    @Body() dto: SyncSaveRequest,
  ): Promise<ApiResponse<SyncSaveResponse>> {
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    if (!dto.saveData) {
      throw new BadRequestException('saveData 不能為空');
    }
    if (!dto.clientUpdatedAt) {
      throw new BadRequestException('clientUpdatedAt 不能為空');
    }
    const result = await this.monopolyService.uploadSaveData(
      dto.visitorId.trim(),
      dto.saveData,
      dto.clientUpdatedAt,
    );
    return { code: 0, message: 'ok', data: result };
  }

  // ========== SSE 实时推送 ==========

  @Sse('room/:code/stream')
  streamRoom(
    @Param('code') code: string,
    @Query('playerIndex') playerIndex?: string,
  ): Observable<MessageEvent> {
    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('房间码格式错误');
    }

    const idx = playerIndex !== undefined ? parseInt(playerIndex, 10) : undefined;

    // 获取房间的状态流（懒创建）
    const stateStream = this.monopolyService.getRoomStream(code);

    // 先查一次当前状态作为初始推送（同时验证房间存在），再订阅后续变更
    return from(this.monopolyService.getRoom(code, idx)).pipe(
      switchMap((initialRoom) => {
        return new Observable<MessageEvent>((subscriber) => {
          // 1. 立即推送当前状态
          subscriber.next({ type: 'state', data: initialRoom });

          // 2. 订阅后续状态变更
          const stateSub = stateStream.subscribe({
            next: (roomState) => subscriber.next({ type: 'state', data: roomState }),
            error: (err) => subscriber.error(err),
          });

          // 3. 每 15 秒发送 ping 保活
          const pingTimer = setInterval(() => {
            subscriber.next({
              type: 'ping',
              data: { timestamp: Date.now() },
            });
          }, 15_000);

          // 客户端断开时自动清理（NestJS SSE 会 unsubscribe）
          return () => {
            stateSub.unsubscribe();
            clearInterval(pingTimer);
          };
        });
      }),
    );
  }
}
