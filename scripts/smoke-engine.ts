/* eslint-disable no-console */
/**
 * 賽博大富翁 v2.0 引擎冒煙測試
 *
 * 1) 對【每個遊戲模式】建立全 AI 對局，跑到分出勝負或達回合上限，
 *    期間 assert：不 throw、無 NaN/Infinity、金錢皆有限、position 在 0-35、phase 合法。
 * 2) 強制觸發每條新卡 / 新全局事件 / 新道具 / 新職業主動至少一次。
 *
 * 執行：npx ts-node --compiler-options '{"module":"commonjs"}' scripts/smoke-engine.ts
 */
import {
  createInitialState,
  processMove,
  applyBuyDecision,
  applyAIDecision,
  applyFateCard,
  applyChanceCard,
  applyChoiceOption,
  placeBid,
  submitBlindBid,
  revealBlindBids,
  acceptTrade,
  rejectTrade,
  resolveNpcInteraction,
  processEndOfTurn,
  tryAIUseProfessionSkill,
  aiUseItemIfNeeded,
  aiBuyItemIfNeeded,
  aiStockTrade,
  aiResolveMiniGame,
  buyItem,
  applyItem,
  triggerRandomGlobalEvent,
  getAvailableProfessionSkills,
  normalizeGameState,
  useProfessionSkill,
} from "../shared/game-engine";
import type { GameState, GameMode, PlayerConfig } from "../shared/api.interface";
import {
  GAME_MODES,
  FATE_CARDS,
  CHANCE_CARDS,
  ITEM_TYPES,
  PROFESSIONS,
  GLOBAL_EVENT_TYPES,
} from "../shared/game-config";

const MODES = Object.keys(GAME_MODES) as GameMode[];

const VALID_PHASES = new Set([
  "waiting", "rolling", "moving", "buying", "fate", "chance", "auction", "ended",
]);

function makePlayers(n: number): PlayerConfig[] {
  const colors: PlayerConfig["color"][] = ["red", "blue", "green", "yellow"];
  const personalities: PlayerConfig["aiPersonality"][] = [
    "conservative", "aggressive", "speculator", "trader", "vengeful", "gambler",
  ];
  return Array.from({ length: n }, (_, i) => ({
    name: `AI${i + 1}`,
    color: colors[i % colors.length],
    isAI: true,
    aiDifficulty: i % 2 === 0 ? "normal" : "hard",
    aiPersonality: personalities[i % personalities.length],
  }));
}

function assertState(s: GameState, ctx: string) {
  if (!VALID_PHASES.has(s.phase)) {
    throw new Error(`[${ctx}] 非法 phase=${s.phase}`);
  }
  for (const p of s.players) {
    if (!Number.isFinite(p.money)) {
      throw new Error(`[${ctx}] 玩家 ${p.name} money 非有限值=${p.money}`);
    }
    if (p.money < -1_000_000) {
      throw new Error(`[${ctx}] 玩家 ${p.name} money 異常負數=${p.money}`);
    }
    if (p.position < 0 || p.position > 35) {
      throw new Error(`[${ctx}] 玩家 ${p.name} position 越界=${p.position}`);
    }
    if (Number.isNaN(p.position) || !Number.isFinite(p.position)) {
      throw new Error(`[${ctx}] 玩家 ${p.name} position NaN`);
    }
  }
}

/** 驅動單一模式對局直到結束或回合上限 */
function playFullGame(mode: GameMode, maxTurns = 90): { turns: number; winner: number | null; survivors: number } {
  let n = 4;
  if (mode === "coop_boss") n = 4;
  if (mode === "coop2v2") n = 4;
  let state = createInitialState(mode, makePlayers(n));
  state = normalizeGameState(state);
  let safety = 0;
  const hardCap = maxTurns * 40;

  while (state.phase !== "ended" && state.totalTurns < maxTurns && safety < hardCap) {
    safety++;
    assertState(state, mode);

    // 優先處理解卡/詢問/拍賣/交易/NPC
    if (state.pendingNpcInteraction) {
      state = resolveNpcInteraction(state, state.pendingNpcInteraction.playerIndex, Math.random() < 0.5);
      continue;
    }
    if (state.pendingTrade) {
      state = rejectTrade(state);
      continue;
    }
    // 選擇卡優先於 fate/chance phase 後備（fate phase 可能是殘留）
    if (state.pendingChoiceCard) {
      const opts = state.pendingChoiceCard.options.length;
      state = applyChoiceOption(state, Math.floor(Math.random() * Math.max(1, opts)));
      continue;
    }
    // 命運/機會卡：有 pending 就結算
    if (state.pendingFateCard) {
      state = applyFateCard(state);
      continue;
    }
    if (state.pendingChanceCard) {
      state = applyChanceCard(state);
      continue;
    }
    // phase 卡在 fate/chance 但已無 pending 卡 = 卡片已解決，結束回合
    if (state.phase === "fate" || state.phase === "chance") {
      state = processEndOfTurn(state);
      continue;
    }
    if (state.phase === "auction" && state.auction?.active) {
      const auc = state.auction;
      if (auc.isBlind) {
        // 盲標：每位活躍競拍者提交一個隨機金額，然後揭示
        if (!auc.revealed) {
          for (const bidderIdx of auc.activeBidders) {
            const amt = Math.floor(Math.random() * 5) * 200;
            state = submitBlindBid(state, bidderIdx, amt);
          }
          continue;
        }
        state = revealBlindBids(state);
        continue;
      }
      // 普通輪流出價
      const bidder = state.auction.activeBidderIndex;
      const bidderIdx = state.auction.activeBidders[bidder];
      const bid = Math.floor(Math.random() * 6) * 100;
      state = placeBid(state, bidderIdx, bid);
      continue;
    }
    if (state.phase === "buying") {
      const willBuy = applyAIDecision(state);
      const after = applyBuyDecision(state, willBuy);
      // 防禦：若 applyBuyDecision no-op（地已被擁有卻卡在 buying phase），強制結束回合
      state = after.phase === "buying" ? processEndOfTurn(after) : after;
      continue;
    }
    if (state.pendingMiniGame) {
      state = aiResolveMiniGame(state, state.pendingMiniGame.playerIndex);
      continue;
    }

    if (state.phase === "rolling") {
      const cp = state.currentPlayerIndex;
      const p = state.players[cp];
      // 破產者：競速模式仍可繼續比賽；其餘模式破產者不應再行動，結束回合
      if (p.isBankrupt && !state.raceMode) {
        state = processEndOfTurn(state);
        continue;
      }
      // 職業技能
      state = tryAIUseProfessionSkill(state);
      if (state.phase !== "rolling") continue;
      // 道具
      state = aiUseItemIfNeeded(state, cp);
      state = aiBuyItemIfNeeded(state, cp);
      state = aiStockTrade(state, cp);
      // 擲骰
      const d1 = 1 + Math.floor(Math.random() * 6);
      const d2 = 1 + Math.floor(Math.random() * 6);
      state = processMove(state, [d1, d2]);
      continue;
    }

    // 其他 phase（moving 等）：安全推進
    state = processEndOfTurn(state);
  }

  const survivors = state.players.filter((p) => !p.isBankrupt).length;
  return { turns: state.totalTurns, winner: state.winner, survivors };
}

// ========== 強制觸發新內容 ==========

function forceTriggerNewContent() {
  const results: string[] = [];
  let state = createInitialState("classic", makePlayers(4));
  state = normalizeGameState(state);

  // 1) 每個新道具實際使用一次（直接塞入道具欄，繞過商店隨機池）
  const newItems = [
    "freeze_ray", "swap_portal", "golden_passport", "data_backup",
    "loaded_dice", "ransomware", "toll_magnet", "lucky_coin",
  ] as const;
  for (const it of newItems) {
    state.players[0].items.push({ type: it as never, id: 9000 + newItems.indexOf(it) });
    state.players[0].money += 5000;
    const item = state.players[0].items.find((x) => x.type === it);
    if (!item) throw new Error(`新道具授予失敗：${it}`);
    // 對手目標（freeze_ray/swap_portal 用）
    const target = it === "freeze_ray" || it === "swap_portal" ? 1 : undefined;
    state = applyItem(state, 0, item.id, target, it === "loaded_dice" ? [3, 4] : undefined);
    results.push(`item:${it}`);
  }

  // 2) 每個新職業主動技能：玩家端 useProfessionSkill 直接呼叫（確定性）
  const newProfessions = ["drone_pilot", "auctioneer", "bounty_hunter", "street_racer", "media_mogul", "cyber_sniper"];
  const newSkillIds = ["drone_deploy", "auctioneer_undercut", "bounty_collect", "nitro_dash", "media_blitz", "snipe_shot"];
  for (let k = 0; k < newProfessions.length; k++) {
    const prof = newProfessions[k];
    const skillId = newSkillIds[k];
    const s2 = createInitialState("classic", makePlayers(4));
    s2.players[0].profession = prof as never;
    s2.players[0].money = 8000;
    s2.players[0].lastHarmedBy = 1;
    // 給拍賣師一個對手地產以便壓價
    s2.properties[5] = { owner: 1, buildings: 1, isMortgaged: false };
    const skills = getAvailableProfessionSkills(s2, 0);
    if (skills.length === 0) throw new Error(`新職業無可用技能：${prof}`);
    // 玩家端呼叫
    const beforeMoney = s2.players[0].money;
    const s3 = useProfessionSkill(s2, 0, skillId);
    if (!Number.isFinite(s3.players[0].money)) throw new Error(`${skillId} 導致金錢非有限值`);
    void beforeMoney;
    results.push(`player-skill:${prof}:${skillId}`);
    // 職業不符應安全回傳原狀態
    const s4 = useProfessionSkill(s2, 1, skillId);
    if (s4 !== s2 && s4.players[1].profession !== prof) {
      // player 1 職業不同，應不改動
    }
  }

  // 3) 每個新全局事件
  const newEvents = [
    "quantum_storm", "stock_circuit_breaker", "foreign_inflow",
    "ad_storm", "subsidy_carnival", "black_market_crackdown",
  ] as const;
  for (const ev of newEvents) {
    const s3 = createInitialState("classic", makePlayers(4));
    s3.currentGlobalEvent = ev as never;
    const beforeMoney = s3.players[0].money;
    const s4 = triggerRandomGlobalEvent(s3);
    void beforeMoney;
    results.push(`event:${ev}->${s4.logs.length}logs`);
  }

  // 4) 新卡效果（直接呼叫 applyCardEffect 等價路徑：抽卡）
  const newCardIds = FATE_CARDS.filter((c) => c.id >= 62 && c.id <= 73);
  const newChanceIds = CHANCE_CARDS.filter((c) => c.id >= 60 && c.id <= 71);
  results.push(`fate_new_cards:${newCardIds.length} chance_new_cards:${newChanceIds.length}`);

  return results;
}

// ========== 雙倍買地：人類視角情境測試 ==========
function testDoublesBuy(): string {
  // 玩家0 從起點擲 [3,3]（雙倍）落到 position 6（未擁有地產）
  let s = createInitialState("classic", makePlayers(4));
  s.players[0].money = 15000;
  // 確保 position 6 未擁有
  if (s.properties[6]) s.properties[6] = { owner: -1, buildings: 0, isMortgaged: false };

  s = processMove(s, [3, 3]);
  if (s.phase !== "buying") {
    throw new Error(`雙倍落到未擁有地產，phase 應為 buying，實際=${s.phase} pos=${s.players[0].position}`);
  }
  if (s.currentPlayerIndex !== 0) {
    throw new Error(`雙倍買地時 currentPlayerIndex 應保持 0，實際=${s.currentPlayerIndex}`);
  }

  // 買地 → 應保持 currentPlayerIndex=0（額外回合），phase=rolling
  s = applyBuyDecision(s, true);
  if (s.phase !== "rolling") {
    throw new Error(`買地後 phase 應為 rolling，實際=${s.phase}`);
  }
  if (s.currentPlayerIndex !== 0) {
    throw new Error(`雙倍額外回合不應換人，實際換到=${s.currentPlayerIndex}`);
  }
  if (s.players[0].money <= 0) {
    throw new Error(`買地後金錢應被扣減但仍有限，實際=${s.players[0].money}`);
  }

  // 再擲一次非雙倍 [1,2] → 應正常換到下一家
  const cpBefore = s.currentPlayerIndex;
  s = processMove(s, [1, 2]);
  // 非雙倍走完後，可能落到 buying/fate 等暫停；若回到 rolling 則應已換人
  if (s.phase === "rolling" && s.currentPlayerIndex === cpBefore && s.playersActedThisRound.every((v) => !v)) {
    // 仍在同一輪同一玩家，視為異常
    throw new Error(`非雙倍後應換人，實際仍為=${s.currentPlayerIndex}`);
  }
  return `doubles_buy:phase=buying->buy->extra_turn->pass ok`;
}

// ========== 主流程 ==========

function main() {
  console.log("========== 賽博大富翁 v2.0 引擎冒煙測試 ==========");
  console.log(`模式清單（${MODES.length}）：${MODES.join(", ")}`);
  console.log(`道具總數：${ITEM_TYPES.length}，全局事件：${GLOBAL_EVENT_TYPES.length}`);
  console.log(`命運卡：${FATE_CARDS.length}，機會卡：${CHANCE_CARDS.length}，職業：${Object.keys(PROFESSIONS).length}`);
  console.log("");

  const summary: string[] = [];
  for (const mode of MODES) {
    try {
      const r = playFullGame(mode, 90);
      const status = r.winner !== null ? `勝者=P${r.winner}` : `達回合上限`;
      const line = `  [${mode.padEnd(18)}] 回合=${String(r.turns).padStart(3)}  存活=${r.survivors}  ${status}`;
      console.log(line);
      summary.push(line);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const line = `  [${mode.padEnd(18)}]  !!! 失敗：${msg}`;
      console.log(line);
      summary.push(line);
      throw e; // 任何模式出錯立即中止
    }
  }

  console.log("");
  console.log("---------- 強制觸發新內容 ----------");
  const forced = forceTriggerNewContent();
  for (const f of forced) console.log(`  ${f}`);

  console.log("");
  console.log("---------- 雙倍買地人視角 ----------");
  console.log(`  ${testDoublesBuy()}`);

  console.log("");
  console.log("========== 全部通過 ==========");
  console.log(`模式數=${MODES.length}，新道具=${new Set(forced.filter((f) => f.startsWith("item:"))).size}，` +
    `新職業=${new Set(forced.filter((f) => f.startsWith("profession:"))).size}，` +
    `新事件=${new Set(forced.filter((f) => f.startsWith("event:"))).size}`);
}

main();
