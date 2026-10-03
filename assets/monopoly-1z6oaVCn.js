import { a5 as axiosForBackend } from "./index-ymfxQ6bv.js";
async function request(url, method, data) {
  const response = await axiosForBackend({
    url,
    method,
    data
  });
  const result = response.data;
  if (result.code !== 0) {
    throw new Error(result.message || "请求失败");
  }
  if (result.data === null || result.data === void 0) {
    throw new Error("伺服器返回空数据");
  }
  return result.data;
}
const monopolyApi = {
  createRoom: (hostName, maxPlayers = 2, gameMode, visitorId, password, isPublic, defaultAuctionMode, turnTimeLimit) => request("/api/monopoly/room", "POST", {
    hostName,
    maxPlayers,
    gameMode,
    visitorId,
    password,
    isPublic,
    defaultAuctionMode,
    turnTimeLimit
  }),
  joinRoom: (roomCode, playerName, visitorId, password) => request("/api/monopoly/room/join", "POST", {
    roomCode,
    playerName,
    visitorId,
    password
  }),
  startGame: (roomCode, playerIndex, gameMode, challenge) => request("/api/monopoly/room/start", "POST", {
    roomCode,
    playerIndex,
    gameMode,
    challenge
  }),
  getPublicRooms: (filter) => {
    const params = new URLSearchParams();
    if (filter?.gameMode) params.set("gameMode", filter.gameMode);
    if (filter?.maxPlayers !== void 0) params.set("maxPlayers", String(filter.maxPlayers));
    if (filter?.status) params.set("status", filter.status);
    return request(`/api/monopoly/rooms/public?${params.toString()}`, "GET");
  },
  getRoom: (roomCode, playerIndex) => request(`/api/monopoly/room/${roomCode}${playerIndex !== void 0 ? `?playerIndex=${playerIndex}` : ""}`, "GET"),
  leaveRoom: (roomCode, playerIndex) => request("/api/monopoly/room/leave", "POST", {
    roomCode,
    playerIndex
  }),
  rollDice: (roomCode, playerIndex) => request("/api/monopoly/roll", "POST", {
    roomCode,
    playerIndex
  }),
  buyProperty: (roomCode, playerIndex, buy) => request("/api/monopoly/buy", "POST", {
    roomCode,
    playerIndex,
    buy
  }),
  buildHouse: (roomCode, playerIndex, cellId) => request("/api/monopoly/build", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  demolishBuilding: (roomCode, playerIndex, cellId) => request("/api/monopoly/demolish", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  mortgageProperty: (roomCode, playerIndex, cellId) => request("/api/monopoly/mortgage", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  redeemProperty: (roomCode, playerIndex, cellId) => request("/api/monopoly/redeem", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  proposeTrade: (roomCode, playerIndex, targetPlayerIndex, givenProperties, receivedProperties, moneyAmount) => request("/api/monopoly/trade/propose", "POST", {
    roomCode,
    playerIndex,
    targetPlayerIndex,
    givenProperties,
    receivedProperties,
    moneyAmount
  }),
  respondTrade: (roomCode, playerIndex, accept) => request("/api/monopoly/trade/respond", "POST", {
    roomCode,
    playerIndex,
    accept
  }),
  selectProfession: (roomCode, playerIndex, profession) => request("/api/monopoly/select-profession", "POST", {
    roomCode,
    playerIndex,
    profession
  }),
  startAuction: (roomCode, playerIndex) => request("/api/monopoly/auction/start", "POST", {
    roomCode,
    playerIndex
  }),
  auctionBid: (roomCode, playerIndex, bidAmount) => request("/api/monopoly/auction/bid", "POST", {
    roomCode,
    playerIndex,
    bidAmount
  }),
  auctionPass: (roomCode, playerIndex) => request("/api/monopoly/auction/pass", "POST", {
    roomCode,
    playerIndex
  }),
  // ===== NPC 系统 =====
  npcBuyItem: (roomCode, playerIndex, itemType) => request("/api/monopoly/npc/buy-item", "POST", {
    roomCode,
    playerIndex,
    itemType
  }),
  npcHireHacker: (roomCode, playerIndex, targetPlayerIndex) => request("/api/monopoly/npc/hire-hacker", "POST", {
    roomCode,
    playerIndex,
    targetPlayerIndex
  }),
  npcClose: (roomCode, playerIndex) => request("/api/monopoly/npc/close", "POST", {
    roomCode,
    playerIndex
  }),
  // ===== 暗拍系统 =====
  submitBlindBid: (roomCode, playerIndex, bidAmount) => request("/api/monopoly/auction/blind-bid", "POST", {
    roomCode,
    playerIndex,
    bidAmount
  }),
  revealBlindBids: (roomCode) => request("/api/monopoly/auction/reveal", "POST", {
    roomCode
  }),
  buyStock: (roomCode, playerIndex, symbol, quantity) => request("/api/monopoly/stock/buy", "POST", {
    roomCode,
    playerIndex,
    symbol,
    quantity
  }),
  sellStock: (roomCode, playerIndex, symbol, quantity) => request("/api/monopoly/stock/sell", "POST", {
    roomCode,
    playerIndex,
    symbol,
    quantity
  }),
  // ===== 強制收購 =====
  forceAcquire: (roomCode, playerIndex, cellId) => request("/api/monopoly/force-acquire", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  // ===== 股東大會 =====
  callShareholderMeeting: (roomCode, playerIndex, symbol, direction) => request("/api/monopoly/shareholder-meeting", "POST", {
    roomCode,
    playerIndex,
    symbol,
    direction
  }),
  // ===== 地下市場 =====
  undergroundMarketBuy: (roomCode, playerIndex, cellId) => request("/api/monopoly/underground-market/buy", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  // ===== 地產升級樹 =====
  chooseUpgradePath: (roomCode, playerIndex, cellId, path) => request("/api/monopoly/upgrade-path", "POST", {
    roomCode,
    playerIndex,
    cellId,
    path
  }),
  // ===== 聯盟系統 =====
  sendAllianceInvite: (roomCode, playerIndex, targetPlayerIndex) => request("/api/monopoly/alliance/invite", "POST", {
    roomCode,
    playerIndex,
    targetPlayerIndex
  }),
  acceptAllianceInvite: (roomCode, playerIndex) => request("/api/monopoly/alliance/accept", "POST", {
    roomCode,
    playerIndex
  }),
  rejectAllianceInvite: (roomCode, playerIndex) => request("/api/monopoly/alliance/reject", "POST", {
    roomCode,
    playerIndex
  }),
  breakAlliance: (roomCode, playerIndex) => request("/api/monopoly/alliance/break", "POST", {
    roomCode,
    playerIndex
  }),
  // ===== 黑市拍賣 =====
  placeBlackMarketBid: (roomCode, playerIndex, itemIndex, bidAmount) => request("/api/monopoly/black-market/bid", "POST", {
    roomCode,
    playerIndex,
    itemIndex,
    bidAmount
  }),
  finalizeBlackMarketAuction: (roomCode, playerIndex) => request("/api/monopoly/black-market/finalize", "POST", {
    roomCode,
    playerIndex
  }),
  // ===== 賄賂銀行 =====
  bribeBank: (roomCode, playerIndex, cellId) => request("/api/monopoly/bribe-bank", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  sendChatMessage: (roomCode, playerIndex, content, type) => request("/api/monopoly/chat/send", "POST", {
    roomCode,
    playerIndex,
    content,
    type
  }),
  // 新聊天接口
  sendChat: (roomCode, playerIndex, content, type) => request("/api/monopoly/chat", "POST", {
    roomCode,
    playerIndex,
    content,
    type
  }),
  markChatRead: (roomCode, playerIndex) => request("/api/monopoly/chat/read", "POST", {
    roomCode,
    playerIndex
  }),
  // 心跳与断线
  sendHeartbeat: (roomCode, playerIndex) => request("/api/monopoly/heartbeat", "POST", {
    roomCode,
    playerIndex
  }),
  surrenderDisconnected: (roomCode, playerIndex) => request("/api/monopoly/surrender-disconnected", "POST", {
    roomCode,
    playerIndex
  }),
  // ===== 道具系统 =====
  buyItem: (roomCode, playerIndex, itemType) => request("/api/monopoly/item/buy", "POST", {
    roomCode,
    playerIndex,
    itemType
  }),
  useItem: (roomCode, playerIndex, itemId, targetCellId) => request("/api/monopoly/item/use", "POST", {
    roomCode,
    playerIndex,
    itemId,
    targetCellId
  }),
  payBail: (roomCode, playerIndex) => request("/api/monopoly/pay-bail", "POST", {
    roomCode,
    playerIndex
  }),
  // ===== 迷你游戏 =====
  startMiniGame: (roomCode, playerIndex) => request("/api/monopoly/minigame/start", "POST", {
    roomCode,
    playerIndex
  }),
  miniGameAction: (roomCode, playerIndex, action, data) => request("/api/monopoly/minigame/action", "POST", {
    roomCode,
    playerIndex,
    action,
    data
  }),
  // ===== 贷款系统 =====
  takeLoan: (roomCode, playerIndex, amount) => request("/api/monopoly/loan/take", "POST", {
    roomCode,
    playerIndex,
    amount
  }),
  repayLoan: (roomCode, playerIndex, amount) => request("/api/monopoly/loan/repay", "POST", {
    roomCode,
    playerIndex,
    amount
  }),
  // ===== 保险系统 =====
  buyInsurance: (roomCode, playerIndex, cellId) => request("/api/monopoly/insurance/buy", "POST", {
    roomCode,
    playerIndex,
    cellId
  }),
  // ===== 债券系统 =====
  issueBond: (roomCode, playerIndex, amount, interestRate, turns) => request("/api/monopoly/bond/issue", "POST", {
    roomCode,
    playerIndex,
    amount,
    interestRate,
    turns
  }),
  subscribeBond: (roomCode, playerIndex, bondId) => request("/api/monopoly/bond/subscribe", "POST", {
    roomCode,
    playerIndex,
    bondId
  }),
  // ===== 語音聊天 =====
  toggleVoice: (roomCode, playerIndex, muted) => request("/api/monopoly/voice/toggle", "POST", {
    roomCode,
    playerIndex,
    muted
  }),
  // ===== 觀戰模式 =====
  joinAsSpectator: (roomCode, visitorId, nickname) => request("/api/monopoly/spectator/join", "POST", {
    roomCode,
    visitorId,
    nickname
  }),
  leaveAsSpectator: (roomCode, visitorId) => request("/api/monopoly/spectator/leave", "POST", {
    roomCode,
    visitorId
  }),
  spectatorFollow: (roomCode, visitorId, followPlayer) => request("/api/monopoly/spectator/follow", "POST", {
    roomCode,
    visitorId,
    followPlayer
  }),
  sendDanmaku: (roomCode, visitorId, nickname, content, color) => request("/api/monopoly/spectator/danmaku", "POST", {
    roomCode,
    visitorId,
    nickname,
    content,
    color
  }),
  // ===== 跨平台存檔同步 =====
  getSaveData: (visitorId) => request(`/api/monopoly/save?visitorId=${encodeURIComponent(visitorId)}`, "GET"),
  uploadSaveData: (visitorId, saveData, clientUpdatedAt) => request("/api/monopoly/save", "POST", {
    visitorId,
    saveData,
    clientUpdatedAt
  }),
  // ===== 技能樹系統 =====
  upgradeSkill: (roomCode, playerIndex, skillId) => request("/api/monopoly/skill/upgrade", "POST", {
    roomCode,
    playerIndex,
    skillId
  }),
  // ===== 特殊建築系統 =====
  buildSpecialBuilding: (roomCode, playerIndex, cellId, buildingType) => request("/api/monopoly/building/special", "POST", {
    roomCode,
    playerIndex,
    cellId,
    buildingType
  }),
  demolishSpecialBuilding: (roomCode, playerIndex, cellId) => request("/api/monopoly/building/special-demolish", "POST", {
    roomCode,
    playerIndex,
    cellId
  })
};
export {
  monopolyApi as m
};
