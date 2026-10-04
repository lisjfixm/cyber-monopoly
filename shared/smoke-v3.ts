/* eslint-disable no-console */
/**
 * 賽博大富翁 v3.0.0 引擎冒煙測試
 * 執行方式：npx tsx shared/smoke-v3.ts
 *
 * 對「所有模式」各跑多場全 AI 對局，驅動器涵蓋所有 pending 狀態：
 * 買地 / 命運卡 / 機會卡 / 選擇卡 / 交易 / 聯盟邀請 / NPC / 迷你遊戲 /
 * 公開拍賣 / 暗拍 / 黑市拍賣 / 股票 / 道具 / 職業技能。
 * 以 watchdog 檢查回合數封頂與「無進度」軟鎖；任何例外、NaN、無人可動即失敗。
 */
import {
  createInitialState,
  processMove,
  rollDice,
  applyAIDecision,
  applyBuyDecision,
  applyFateCard,
  applyChanceCard,
  applyChoiceOption,
  applyItem,
  aiShouldAcceptTrade,
  acceptTrade,
  rejectTrade,
  aiResolveMiniGame,
  aiBuyItemIfNeeded,
  aiUseItemIfNeeded,
  aiStockTrade,
  tryAIUseProfessionSkill,
  aiAuctionDecision,
  placeBid,
  passAuction,
  aiBlindBid,
  submitBlindBid,
  revealBlindBids,
  resolveNpcInteraction,
  acceptAllianceInvite,
  rejectAllianceInvite,
  placeBlackMarketBid,
  finalizeBlackMarketAuction,
  closeBlackMarketAuction,
  normalizeGameState,
} from './game-engine';
import { GAME_MODES } from './game-config';
import type { GameState, GameMode, PlayerConfig, PlayerColor } from './api.interface';

const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const DIFFS: Array<'easy' | 'normal' | 'hard' | 'hell'> = ['easy', 'normal', 'hard', 'hell'];
const PERSONAS: Array<'conservative' | 'aggressive' | 'speculator' | 'trader' | 'vengeful' | 'gambler'> = [
  'conservative', 'aggressive', 'speculator', 'trader', 'vengeful', 'gambler',
];

function playerCountForMode(mode: GameMode): number {
  if (mode === 'coop2v2' || mode === 'team_deathmatch') return 4;
  if (mode === 'coop_boss') return 4; // 3 heroes + boss(last)
  return 4;
}

function makePlayers(mode: GameMode): PlayerConfig[] {
  const n = playerCountForMode(mode);
  const cfgs: PlayerConfig[] = [];
  for (let i = 0; i < n; i++) {
    cfgs.push({
      name: `AI-${mode}-${i}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      isAI: true,
      aiDifficulty: DIFFS[i % DIFFS.length],
      aiPersonality: PERSONAS[i % PERSONAS.length],
    });
  }
  return cfgs;
}

function assertFinite(state: GameState): void {
  for (let i = 0; i < state.players.length; i++) {
    const p = state.players[i];
    if (!Number.isFinite(p.money)) throw new Error(`玩家${i} money 非有限值: ${p.money}`);
    if (!Number.isFinite(p.totalAssets)) throw new Error(`玩家${i} totalAssets 非有限值`);
    if (p.health !== undefined && p.health !== null && !Number.isFinite(p.health)) {
      throw new Error(`玩家${i} health 非有限值`);
    }
  }
  for (const sym of Object.keys(state.stocks)) {
    if (!Number.isFinite(state.stocks[sym as keyof typeof state.stocks])) {
      throw new Error(`股價 ${sym} 非有限值`);
    }
  }
}

function signatureOf(state: GameState): string {
  // 用於偵測「連續多步無進度」的軟鎖
  return [
    state.currentPlayerIndex,
    state.phase,
    state.totalTurns,
    state.pendingTrade ? state.pendingTrade.id : '-',
    state.pendingChoiceCard ? state.pendingChoiceCard.cardId : '-',
    state.pendingNpcInteraction ? state.pendingNpcInteraction.playerIndex : '-',
    state.pendingMiniGame ? state.pendingMiniGame.type : '-',
    state.auction ? `${state.auction.activeBidderIndex}:${state.auction.currentBid}` : '-',
    state.blackMarketAuction ? state.blackMarketAuction.phase : '-',
    Object.keys(state.pendingAllianceInvites ?? {}).join(','),
  ].join('|');
}

/** 推進恰好「一步」AI 決策；若無任何可動作則拋出（軟鎖）。 */
function driveOneStep(state: GameState): GameState {
  if (state.phase === 'ended') return state;

  // 1. 交易回應
  if (state.pendingTrade) {
    const trade = state.pendingTrade;
    const receiver = state.players[trade.toPlayer];
    if (receiver && receiver.isAI) {
      const accept = aiShouldAcceptTrade(state, trade);
      return accept ? acceptTrade(state) : rejectTrade(state);
    }
    // 接收方非 AI（理論上全 AI 不會發生），直接拒絕以解鎖
    return rejectTrade(state);
  }

  // 2. 聯盟邀請
  const invites = state.pendingAllianceInvites ?? {};
  const inviteKeys = Object.keys(invites);
  if (inviteKeys.length > 0) {
    const toPlayer = Number(inviteKeys[0]);
    return Math.random() < 0.5 ? acceptAllianceInvite(state, toPlayer) : rejectAllianceInvite(state, toPlayer);
  }

  // 3. NPC 交互
  if (state.pendingNpcInteraction) {
    const npc = state.pendingNpcInteraction;
    const accept = state.players[npc.playerIndex].money > 2000;
    return resolveNpcInteraction(state, npc.playerIndex, accept);
  }

  // 4. 選擇型卡牌
  if (state.pendingChoiceCard) {
    const optCount = state.pendingChoiceCard.options.length;
    return applyChoiceOption(state, Math.floor(Math.random() * optCount));
  }

  // 4b. 孤兒卡牌兜底：已抽牌但階段已離開 fate/chance（防禦卡牌漏消）
  if (state.pendingFateCard) {
    return applyFateCard(state);
  }
  if (state.pendingChanceCard) {
    return applyChanceCard(state);
  }

  // 5. 迷你遊戲
  if (state.pendingMiniGame) {
    return aiResolveMiniGame(state, state.pendingMiniGame.playerIndex);
  }

  // 6. 黑市拍賣
  if (state.blackMarketAuction) {
    const bm = state.blackMarketAuction;
    if (bm.phase === 'bidding') {
      // 找一個還沒對所有物品出價的存活玩家
      const alive = state.players.map((p, i) => i).filter((i) => !state.players[i].isBankrupt);
      for (const pIdx of alive) {
        for (let itemIdx = 0; itemIdx < bm.items.length; itemIdx++) {
          const item = bm.items[itemIdx];
          if (item.bids[pIdx] === null || item.bids[pIdx] === undefined) {
            const price = item.startingPrice;
            const bid = Math.min(state.players[pIdx].money, price + Math.floor(Math.random() * price * 0.5));
            if (bid >= price) {
              return placeBlackMarketBid(state, pIdx, itemIdx, bid);
            }
          }
        }
      }
      // 全部出價完 → 結算
      return finalizeBlackMarketAuction(state);
    }
    if (bm.phase === 'finished' || bm.phase === 'reveal') {
      return closeBlackMarketAuction(state);
    }
    // countdown：直接進入 bidding 由後續觸發；此處保險地推 finalize
    return state;
  }

  // 7. 公開/暗拍
  if (state.auction && state.auction.active) {
    const auc = state.auction;
    if (auc.isBlind) {
      // 找一個還沒出價的 active bidder
      for (const pIdx of auc.activeBidders) {
        const existing = auc.blindBids?.[pIdx];
        if (existing === null || existing === undefined) {
          const bid = aiBlindBid(state, pIdx);
          if (bid > 0) {
            return submitBlindBid(state, pIdx, bid);
          }
        }
      }
      // 全部出價 → 揭曉
      return revealBlindBids(state);
    }
    // 公開拍賣：輪到 activeBidders[activeBidderIndex]
    const bidderIdx = auc.activeBidders[auc.activeBidderIndex];
    if (bidderIdx === undefined) return state;
    const decision = aiAuctionDecision(state);
    if (decision.action === 'bid' && decision.bidAmount !== undefined) {
      return placeBid(state, bidderIdx, decision.bidAmount);
    }
    return passAuction(state, bidderIdx);
  }

  // 8. 買地決策
  if (state.phase === 'buying') {
    const willBuy = applyAIDecision(state);
    return applyBuyDecision(state, willBuy);
  }

  // 9. 命運卡（含自癒：無 pending 卡時引擎會自行推進）
  if (state.phase === 'fate') {
    return applyFateCard(state);
  }

  // 10. 機會卡（含自癒）
  if (state.phase === 'chance') {
    return applyChanceCard(state);
  }

  // 11. 擲骰回合：先做回合前 AI 行為，再擲骰移動
  if (state.phase === 'rolling') {
    let s = state;
    s = tryAIUseProfessionSkill(s);
    const curIdx = s.currentPlayerIndex;
    const cur = s.players[curIdx];
    if (!cur.isBankrupt) {
      s = aiBuyItemIfNeeded(s, curIdx);
      s = aiUseItemIfNeeded(s, curIdx);
      s = aiStockTrade(s, curIdx);
    }
    const dice = rollDice();
    return processMove(s, dice);
  }

  // 未知狀態 → 軟鎖
  throw new Error(`軟鎖：無法推進，phase=${state.phase} current=${state.currentPlayerIndex}`);
}

interface GameResult {
  mode: GameMode;
  winner: number | null;
  turns: number;
  steps: number;
  reason: string;
  unlocked: string[];
}

function dumpState(state: GameState, label: string): string {
  const p = state.players[state.currentPlayerIndex];
  const tail = state.logs.slice(-6).map((l) => `    ${l.type}: ${l.text}`).join('\n');
  const players = state.players.map((pl, i) =>
    `    [${i}] ${pl.name} money=${Math.round(pl.money)} hp=${pl.health ?? '-'} bankrupt=${pl.isBankrupt} pos=${pl.position}`,
  ).join('\n');
  return [
    `[${label}] mode=${state.mode} phase=${state.phase} cur=${state.currentPlayerIndex} turns=${state.totalTurns}`,
    `    pendingFate=${state.pendingFateCard?.name ?? 'null'} pendingChance=${state.pendingChanceCard?.name ?? 'null'} pendingChoice=${state.pendingChoiceCard?.cardId ?? 'null'}`,
    `    curPlayer pos=${p?.position} money=${p?.money} bankrupt=${p?.isBankrupt}`,
    '    玩家狀態:',
    players,
    '    最近日誌:',
    tail,
  ].join('\n');
}

function playOneGame(mode: GameMode): GameResult {
  let state = createInitialState(mode, makePlayers(mode));
  state = normalizeGameState(state);

  // 隨機分配職業（含 v3 新職業），讓職業技能與職業成就路徑被實測
  const ALL_PROFESSIONS = ['engineer','banker','speculator','tycoon','hacker','doctor','lawyer','journalist','gambler','artist','scientist','traveler','cyberborg','blockchain_miner','bounty_hunter','street_racer','media_mogul','cyber_sniper','netrunner','cyber_medic','stock_broker'] as const;
  for (let i = 0; i < state.players.length; i++) {
    state.players[i].profession = ALL_PROFESSIONS[Math.floor(Math.random() * ALL_PROFESSIONS.length)];
  }

  const maxSteps = 6000;
  let steps = 0;
  let lastSig = '';
  let stuck = 0;
  let lastState = state;

  while (state.phase !== 'ended') {
    if (steps >= maxSteps) {
      throw new Error(`回合封頂未結束 mode=${mode} turns=${state.totalTurns}`);
    }
    state = driveOneStep(state);
    steps++;
    assertFinite(state);

    const sig = signatureOf(state);
    if (sig === lastSig) {
      stuck++;
      if (stuck > 40) {
        throw new Error(
          `軟鎖 mode=${mode} turns=${state.totalTurns} phase=${state.phase}\n${dumpState(state, '軟鎖')}`,
        );
      }
    } else {
      stuck = 0;
      lastSig = sig;
      lastState = state;
    }
  }

  return {
    mode,
    winner: state.winner,
    turns: state.totalTurns,
    steps,
    reason: state.winner !== null ? `玩家${state.winner} 獲勝` : '無勝者',
    unlocked: state.players.flatMap((p) => p.unlockedAchievements ?? []),
  };
}

function main(): void {
  const modes = Object.keys(GAME_MODES) as GameMode[];
  const GAMES_PER_MODE = 3;
  let failures = 0;
  const summary: string[] = [];
  const unlockedSet = new Set<string>();

  for (const mode of modes) {
    for (let g = 0; g < GAMES_PER_MODE; g++) {
      try {
        const r = playOneGame(mode);
        for (const id of r.unlocked) unlockedSet.add(id);
        summary.push(
          `  [OK] ${mode.padEnd(16)} 場${g + 1}  勝者=${String(r.winner).padStart(3)}  回合=${String(r.turns).padStart(4)}  步數=${r.steps}`,
        );
      } catch (err) {
        failures++;
        summary.push(`  [FAIL] ${mode.padEnd(16)} 場${g + 1}  ${(err as Error).message}`);
      }
    }
  }

  console.log('========== 賽博大富翁 v3.0 引擎冒煙結果 ==========');
  console.log(summary.join('\n'));
  console.log('==================================================');
  console.log(`模式數：${modes.length}，每模式 ${GAMES_PER_MODE} 場，總 ${modes.length * GAMES_PER_MODE} 場`);
  console.log(`失敗：${failures}`);
  const NEW_ACH = ['stock_frenzy_champion','black_market_tycoon','twin_strike_veteran','survival_master','emperor_crowned','race_finisher','netrunner_legend','medic_angel','broker_pro','item_armory','airdrop_grateful','chip_mogul'];
  const hit = NEW_ACH.filter((id) => unlockedSet.has(id));
  console.log(`解鎖成就種類數：${unlockedSet.size}；其中 v3 新成就命中 ${hit.length}/${NEW_ACH.length}：${hit.join(', ') || '（無）'}`);
  if (failures > 0) {
    process.exit(1);
  }
}

main();
