import { r as reactExports, b_ as replayStateFromLog, l as logger, j as jsxRuntimeExports, bE as ChevronLeft, v as MODE_LABELS, aB as Clock, b$ as formatDuration, aI as Trophy, P as PLAYER_COLOR_HEX, bs as Eye, at as Check, s as Copy, Z as Zap, B as Board, z as PlayerList, bK as Play, b4 as ChevronRight, b2 as RotateCcw, c0 as Info, u as useNavigate, i as useSearchParams, c1 as loadReplays, c2 as getReplayFromUrl, c3 as getReplayByShareId, c4 as saveReplays, c5 as MAX_REPLAYS, c6 as ReplayList } from "./index-ymfxQ6bv.js";
import { S as SkipBack, P as Pause, a as SkipForward } from "./skip-forward-BTElO9Va.js";
import { F as FastForward } from "./fast-forward-D7uCiBoS.js";
const SAMPLE_REPLAY_TURNS = [{
  turn: 1,
  summary: "霓虹行者擲骰子，購買霓虹區",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者擲出 3 點，移動至霓虹區"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買霓虹區",
    propertyName: "霓虹區",
    amount: -600
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客擲出 2 點，移動至舊城區"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買舊城區",
    propertyName: "舊城區",
    amount: -600
  }]
}, {
  turn: 2,
  summary: "暗影黑客繞過能源站，霓虹行者買下數據塔",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者擲出 5 點，移動至數據塔"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買數據塔",
    propertyName: "數據塔",
    amount: -1e3
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客擲出 4 點，路過能源站"
  }, {
    action: "pass",
    playerIndex: 1,
    description: "暗影黑客跳過購買能源站"
  }]
}, {
  turn: 3,
  summary: "霓虹行者購買核心區，資產領先",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者擲出 4 點，移動至核心區"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買核心區",
    propertyName: "核心區",
    amount: -1400
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客擲出 6 點，移動至中央塔"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買中央塔",
    propertyName: "中央塔",
    amount: -2e3
  }]
}, {
  turn: 4,
  summary: "暗影黑客抽取命運卡，獲得獎金",
  events: [{
    action: "draw_fate",
    playerIndex: 0,
    description: "霓虹行者抽取命運卡：繳納稅款",
    amount: -1500
  }, {
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至金融街"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買金融街",
    propertyName: "金融街",
    amount: -1600
  }, {
    action: "draw_fate",
    playerIndex: 1,
    description: "暗影黑客抽取命運卡：獲得獎金",
    amount: 1e3
  }]
}, {
  turn: 5,
  summary: "霓虹行者進入禁閉區，暗影黑客買下富豪區",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者擲出 2 點，進入禁閉區"
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客擲出 5 點，移動至富豪區"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買富豪區",
    propertyName: "富豪區",
    amount: -2600
  }]
}, {
  turn: 6,
  summary: "霓虹行者出獄，付過路費",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者出獄，移動至地下街"
  }, {
    action: "pay_toll",
    playerIndex: 0,
    description: "支付過路費予暗影黑客",
    amount: -450
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客擲出 3 點，移動至後街"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買後街",
    propertyName: "後街",
    amount: -2800
  }]
}, {
  turn: 7,
  summary: "暗影黑客建造房屋，強化套裝",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至科技城"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買科技城",
    propertyName: "科技城",
    amount: -3e3
  }, {
    action: "build",
    playerIndex: 1,
    description: "暗影黑客在中央塔建造 2 級房屋",
    propertyName: "中央塔",
    amount: -800
  }]
}, {
  turn: 8,
  summary: "霓虹行者路過中央塔，慘付高額過路費",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至中央塔"
  }, {
    action: "pay_toll",
    playerIndex: 0,
    description: "支付高額過路費（套裝加成）",
    amount: -1800
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至命運區"
  }, {
    action: "draw_fate",
    playerIndex: 1,
    description: "抽取命運卡：黑客轉帳",
    amount: 2e3
  }]
}, {
  turn: 9,
  summary: "霓虹行者反擊，買下星光道",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至星光道"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買星光道",
    propertyName: "星光道",
    amount: -2800
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至貿易區"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買貿易區",
    propertyName: "貿易區",
    amount: -2600
  }]
}, {
  turn: 10,
  summary: "雙方通過起點，獲得獎勵",
  events: [{
    action: "go_to_start",
    playerIndex: 0,
    description: "霓虹行者通過起點",
    amount: 1500
  }, {
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至能源站"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買能源站",
    propertyName: "能源站",
    amount: -1e3
  }, {
    action: "go_to_start",
    playerIndex: 1,
    description: "暗影黑客通過起點",
    amount: 1500
  }]
}, {
  turn: 11,
  summary: "霓虹行者建造房屋，開始收租",
  events: [{
    action: "build",
    playerIndex: 0,
    description: "霓虹行者在霓虹區建造 1 級房屋",
    propertyName: "霓虹區",
    amount: -300
  }, {
    action: "build",
    playerIndex: 0,
    description: "霓虹行者在數據塔建造 1 級房屋",
    propertyName: "數據塔",
    amount: -400
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至貧民區"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買貧民區",
    propertyName: "貧民區",
    amount: -2400
  }]
}, {
  turn: 12,
  summary: "暗影黑客支付霓虹區過路費",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至維修區"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買維修區",
    propertyName: "維修區",
    amount: -1200
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至霓虹區"
  }, {
    action: "pay_toll",
    playerIndex: 1,
    description: "支付霓虹區過路費",
    amount: -350
  }]
}, {
  turn: 13,
  summary: "命運卡發威，暗影黑客被罰款",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至深海港"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買深海港",
    propertyName: "深海港",
    amount: -1400
  }, {
    action: "draw_fate",
    playerIndex: 1,
    description: "暗影黑客抽取命運卡：數據洩露罰款",
    amount: -500
  }]
}, {
  turn: 14,
  summary: "霓虹行者升級酒店，戰略升級",
  events: [{
    action: "build",
    playerIndex: 0,
    description: "霓虹行者升級核心區至酒店級",
    propertyName: "核心區",
    amount: -2e3
  }, {
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至命運區"
  }, {
    action: "draw_fate",
    playerIndex: 0,
    description: "抽取命運卡：獲得補貼",
    amount: 800
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至總部"
  }, {
    action: "buy",
    playerIndex: 1,
    description: "購買總部",
    propertyName: "總部",
    amount: -3500
  }]
}, {
  turn: 15,
  summary: "暗影黑客踩到核心區酒店，大失血",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至外城區"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買外城區",
    propertyName: "外城區",
    amount: -2600
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至核心區"
  }, {
    action: "pay_toll",
    playerIndex: 1,
    description: "支付核心區酒店級過路費",
    amount: -3200
  }]
}, {
  turn: 16,
  summary: "暗影黑客變賣資產籌現金",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至主塔"
  }, {
    action: "pay_toll",
    playerIndex: 0,
    description: "支付主塔過路費",
    amount: -800
  }, {
    action: "demolish",
    playerIndex: 1,
    description: "暗影黑客拆除中央塔房屋套現",
    propertyName: "中央塔",
    amount: 400
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至中轉站"
  }]
}, {
  turn: 17,
  summary: "霓虹行者繼續擴張，買下重工區",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至重工區"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買重工區",
    propertyName: "重工區",
    amount: -3800
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至企業樓"
  }, {
    action: "pass",
    playerIndex: 1,
    description: "暗影黑客現金不足，跳過購買"
  }]
}, {
  turn: 18,
  summary: "暗影黑客宣告破產，霓虹行者獲勝",
  events: [{
    action: "roll",
    playerIndex: 0,
    description: "霓虹行者移動至高新園"
  }, {
    action: "buy",
    playerIndex: 0,
    description: "購買高新園",
    propertyName: "高新園",
    amount: -4e3
  }, {
    action: "roll",
    playerIndex: 1,
    description: "暗影黑客移動至核心區"
  }, {
    action: "pay_toll",
    playerIndex: 1,
    description: "再次支付核心區酒店費，現金見底",
    amount: -3200
  }, {
    action: "bankruptcy",
    playerIndex: 1,
    description: "暗影黑客宣告破產"
  }, {
    action: "game_end",
    playerIndex: 0,
    description: "遊戲結束，霓虹行者獲勝"
  }]
}];
const SAMPLE_PLAYERS = [{
  name: "霓虹行者",
  color: "cyan"
}, {
  name: "暗影黑客",
  color: "pink"
}];
const ACTION_LABELS = {
  roll: "擲骰子",
  buy: "購買地產",
  pass: "跳過",
  build: "建造房屋",
  demolish: "拆除建築",
  pay_toll: "支付過路費",
  draw_fate: "抽取命運卡",
  draw_chance: "抽取機會卡",
  go_to_start: "傳送至起點",
  auction_start: "開始拍賣",
  auction_bid: "出價",
  auction_end: "拍賣結束",
  trade_propose: "提議交易",
  trade_accept: "接受交易",
  trade_reject: "拒絕交易",
  use_item: "使用道具",
  buy_item: "購買道具",
  force_acquire: "強制收購",
  bribe: "賄賂",
  bankruptcy: "破產",
  game_end: "遊戲結束",
  stock_buy: "買入股票",
  stock_sell: "賣出股票",
  season_change: "季節變化",
  disaster: "災難",
  turn_end: "回合結束"
};
const ACTION_COLORS = {
  roll: "var(--cyan)",
  buy: "var(--green)",
  pass: "var(--text-secondary)",
  build: "var(--green)",
  demolish: "var(--red)",
  pay_toll: "var(--yellow)",
  draw_fate: "var(--purple)",
  draw_chance: "hsl(240, 80%, 70%)",
  auction_start: "var(--yellow)",
  auction_bid: "var(--yellow)",
  auction_end: "var(--yellow)",
  trade_propose: "var(--cyan)",
  trade_accept: "var(--green)",
  trade_reject: "var(--red)",
  bankruptcy: "var(--red)",
  game_end: "var(--pink)",
  stock_buy: "var(--green)",
  stock_sell: "var(--red)",
  disaster: "var(--red)",
  season_change: "var(--cyan)",
  turn_end: "var(--text-secondary)"
};
const PLAYBACK_SPEEDS = [0.5, 1, 2, 4];
const ReplayPlayer = ({
  replay,
  onBack
}) => {
  const [currentStep, setCurrentStep] = reactExports.useState(0);
  const [isPlaying, setIsPlaying] = reactExports.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = reactExports.useState(1);
  const [copied, setCopied] = reactExports.useState(false);
  const [viewMode, setViewMode] = reactExports.useState("global");
  const [jumpTurn, setJumpTurn] = reactExports.useState(1);
  const playTimerRef = reactExports.useRef(null);
  const logContainerRef = reactExports.useRef(null);
  const timelineRef = reactExports.useRef(null);
  const useSampleData = replay.log.length < 5;
  const sampleTurns = SAMPLE_REPLAY_TURNS;
  const currentTurn = reactExports.useMemo(() => {
    if (useSampleData) {
      return sampleTurns[Math.min(currentStep, sampleTurns.length - 1)]?.turn ?? 1;
    }
    const entry = replay.log[currentStep];
    return entry?.turn ?? 1;
  }, [useSampleData, currentStep, sampleTurns, replay.log]);
  const totalTurns = useSampleData ? sampleTurns.length : replay.totalTurns;
  const totalSteps = useSampleData ? sampleTurns.length : replay.log.length;
  const displayPlayers = useSampleData ? SAMPLE_PLAYERS : replay.players;
  const replayResult = reactExports.useMemo(() => {
    if (useSampleData) return null;
    try {
      return replayStateFromLog(replay.log, currentStep);
    } catch {
      return null;
    }
  }, [replay, currentStep, useSampleData]);
  reactExports.useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }
    const step = () => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    };
    const delay = 1e3 / playbackSpeed;
    playTimerRef.current = setTimeout(step, delay);
    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, currentStep, totalSteps, playbackSpeed]);
  reactExports.useEffect(() => {
    if (timelineRef.current) {
      const activeEl = timelineRef.current.querySelector(`[data-turn-idx="${currentStep}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    }
  }, [currentStep]);
  const handlePlayPause = reactExports.useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentStep, totalSteps]);
  const handlePrevStep = reactExports.useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);
  const handleNextStep = reactExports.useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps]);
  const handleSkipStart = reactExports.useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);
  const handleSkipEnd = reactExports.useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(totalSteps - 1);
  }, [totalSteps]);
  const handleSeek = reactExports.useCallback((e) => {
    setIsPlaying(false);
    const value = parseInt(e.target.value, 10);
    setCurrentStep(value);
  }, []);
  const handleJumpToTurn = reactExports.useCallback((idx) => {
    setIsPlaying(false);
    setCurrentStep(Math.max(0, Math.min(idx, totalSteps - 1)));
  }, [totalSteps]);
  const handleJumpSelect = reactExports.useCallback((e) => {
    const val = parseInt(e.target.value, 10);
    if (!Number.isNaN(val)) {
      handleJumpToTurn(val - 1);
      setJumpTurn(val);
    }
  }, [handleJumpToTurn]);
  const handleExportCode = reactExports.useCallback(() => {
    try {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(replay))));
      navigator.clipboard.writeText(code).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (err) {
      logger.error("Export failed:", err instanceof Error ? err.message : String(err));
    }
  }, [replay]);
  const gameState = replayResult?.state ?? null;
  const currentEntry = replayResult?.entry ?? null;
  const propertyCounts = reactExports.useMemo(() => {
    if (!gameState) return {};
    const counts = {};
    for (const prop of Object.values(gameState.properties)) {
      counts[prop.owner] = (counts[prop.owner] ?? 0) + 1;
    }
    return counts;
  }, [gameState]);
  const currentTurnEvents = reactExports.useMemo(() => {
    if (!useSampleData) return [];
    return sampleTurns[currentStep]?.events ?? [];
  }, [useSampleData, currentStep, sampleTurns]);
  const currentTurnSummary = reactExports.useMemo(() => {
    if (!useSampleData) {
      const entry = replay.log[currentStep];
      if (!entry) return "";
      const player = replay.players[entry.playerIndex];
      const label = ACTION_LABELS[entry.action] || entry.action;
      return `${player?.name || "系統"}：${label}`;
    }
    return sampleTurns[currentStep]?.summary ?? "";
  }, [useSampleData, currentStep, sampleTurns, replay]);
  const handleToggleView = reactExports.useCallback(() => {
    setViewMode((prev) => prev === "follow" ? "global" : "follow");
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col scanlines bg-[var(--bg-deep)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b", style: {
      borderColor: "var(--border-neon)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "列表" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg tracking-wider truncate", style: {
            color: "var(--cyan)",
            textShadow: "0 0 8px var(--cyan)"
          }, children: MODE_LABELS[replay.gameMode] || replay.gameMode }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1", style: {
            color: "var(--text-muted)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
            formatDuration(replay.duration)
          ] }),
          replay.winner && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1", style: {
            color: "var(--yellow)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 12 }),
            replay.winner
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
          color: "var(--text-secondary)"
        }, children: [
          displayPlayers.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 mr-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full inline-block", style: {
              background: PLAYER_COLOR_HEX[p.color] || (p.color === "cyan" ? "var(--cyan)" : "var(--pink)")
            } }),
            p.name
          ] }, i)),
          " · ",
          totalTurns,
          " 回合"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleToggleView, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: viewMode === "follow" ? "var(--pink)" : "var(--purple)",
        color: viewMode === "follow" ? "var(--pink)" : "var(--purple)"
      }, title: viewMode === "follow" ? "跟隨視角" : "全局視角", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider hidden md:inline", children: viewMode === "follow" ? "跟隨" : "全局" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleExportCode, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--pink)",
        color: "var(--pink)"
      }, children: [
        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider hidden md:inline", children: copied ? "已複製" : "回放碼" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col lg:flex-row overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-64 xl:w-72 border-t lg:border-t-0 lg:border-r flex flex-col order-2 lg:order-1", style: {
        borderColor: "var(--border-neon)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b flex items-center gap-2", style: {
          borderColor: "var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14, style: {
            color: "var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
            color: "var(--cyan)"
          }, children: "回合時間線" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: timelineRef, className: "flex-1 overflow-y-auto px-2 py-2 space-y-1.5", children: sampleTurns.map((turn, idx) => {
          const isActive = idx === currentStep;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", "data-turn-idx": idx, onClick: () => handleJumpToTurn(idx), className: "w-full text-left px-3 py-2 rounded cursor-pointer text-xs transition-all", style: {
            border: isActive ? "1px solid var(--cyan)" : "1px solid transparent",
            backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
            boxShadow: isActive ? "0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber tracking-wide text-[10px] px-1.5 py-0.5 rounded", style: {
                backgroundColor: isActive ? "rgba(0, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
                color: isActive ? "var(--cyan)" : "var(--text-secondary)"
              }, children: [
                "第 ",
                turn.turn,
                " 回合"
              ] }),
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber", style: {
                color: "var(--pink)",
                textShadow: "0 0 6px var(--pink)"
              }, children: "▶ 播放中" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs leading-snug", style: {
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)"
            }, children: turn.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1", children: [
              turn.events.slice(0, 3).map((evt, ei) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1 py-0.5 rounded font-cyber", style: {
                backgroundColor: `${ACTION_COLORS[evt.action] || "var(--text-secondary)"}20`,
                color: ACTION_COLORS[evt.action] || "var(--text-secondary)"
              }, children: ACTION_LABELS[evt.action] || evt.action }, ei)),
              turn.events.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px]", style: {
                color: "var(--text-muted)"
              }, children: [
                "+",
                turn.events.length - 3
              ] })
            ] })
          ] }, turn.turn);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-start p-3 md:p-4 overflow-auto min-h-0 order-1 lg:order-2", children: [
        gameState ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[600px] aspect-square", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Board, { gameState, boardCells: gameState.boardCells, cellEffects: gameState.cellEffects, disaster: gameState.disaster }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[600px] aspect-square flex items-center justify-center cyber-card", style: {
          borderColor: "var(--border-neon-cyan)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 48, style: {
            color: "var(--cyan)",
            margin: "0 auto 12px"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider mb-2", style: {
            color: "var(--cyan)",
            textShadow: "0 0 8px var(--cyan)"
          }, children: "回放模式" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
            color: "var(--text-secondary)"
          }, children: "當前為樣本回放演示" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-2 font-cyber", style: {
            color: "var(--pink)"
          }, children: [
            "第 ",
            currentTurn,
            " / ",
            totalTurns,
            " 回合"
          ] })
        ] }) }),
        gameState && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[600px] mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerList, { players: gameState.players, currentPlayerIndex: gameState.currentPlayerIndex, propertyCounts }) }),
        useSampleData && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[600px] mt-4 grid grid-cols-2 gap-3", children: displayPlayers.map((p, idx) => {
          const progress = currentStep / Math.max(1, totalSteps - 1);
          const baseMoney = 15e3;
          const props = idx === 0 ? Math.min(10, Math.floor(progress * 10 + 1)) : Math.min(8, Math.floor(progress * 7 + 1));
          const money = idx === 0 ? Math.max(500, baseMoney - props * 1800 + currentStep * 200) : Math.max(200, baseMoney - props * 2e3 - currentStep * 100);
          const pColor = idx === 0 ? "var(--cyan)" : "var(--pink)";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3", style: {
            borderColor: `${pColor}40`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full", style: {
                backgroundColor: pColor,
                boxShadow: `0 0 8px ${pColor}`
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-wider", style: {
                color: pColor
              }, children: p.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1", style: {
              color: "var(--text-secondary)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "現金" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                  color: "var(--green)"
                }, children: [
                  "$",
                  money.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "地產" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                  color: "var(--cyan)"
                }, children: [
                  props,
                  " 塊"
                ] })
              ] })
            ] })
          ] }, idx);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[600px] mt-4 cyber-card p-3 md:p-4", style: {
          borderColor: "rgba(255, 107, 157, 0.3)",
          boxShadow: "0 0 15px rgba(255, 107, 157, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono w-12 text-right font-cyber", style: {
              color: "var(--cyan)"
            }, children: [
              "第 ",
              currentTurn,
              " 回"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: Math.max(0, totalSteps - 1), value: currentStep, onChange: handleSeek, className: "flex-1 h-2 rounded-full", style: {
              accentColor: "var(--pink)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono w-12 font-cyber", style: {
              color: "var(--text-secondary)"
            }, children: [
              "第 ",
              totalTurns,
              " 回"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 md:gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSkipStart, className: "cyber-btn p-2", style: {
              borderColor: "var(--text-secondary)",
              color: "var(--text-secondary)"
            }, "aria-label": "跳到開頭", title: "跳到開頭", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handlePrevStep, className: "cyber-btn p-2 md:p-3", style: {
              borderColor: "var(--cyan)",
              color: "var(--cyan)"
            }, "aria-label": "上一回合", title: "上一回合", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handlePlayPause, className: "cyber-btn cyber-btn-pink w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center", style: {
              boxShadow: "0 0 20px rgba(255, 107, 157, 0.5), inset 0 0 15px rgba(255, 107, 157, 0.2)"
            }, "aria-label": isPlaying ? "暫停" : "播放", children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 26 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 26, className: "ml-1" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleNextStep, className: "cyber-btn p-2 md:p-3", style: {
              borderColor: "var(--cyan)",
              color: "var(--cyan)"
            }, "aria-label": "下一回合", title: "下一回合", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSkipEnd, className: "cyber-btn p-2", style: {
              borderColor: "var(--text-secondary)",
              color: "var(--text-secondary)"
            }, "aria-label": "跳到結尾", title: "跳到結尾", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 mx-1 md:mx-2", style: {
              background: "var(--border-neon)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSkipStart, className: "cyber-btn p-2", style: {
              borderColor: "var(--purple)",
              color: "var(--purple)"
            }, "aria-label": "重新播放", title: "重新播放", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 18 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mt-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FastForward, { size: 14, style: {
                color: "var(--text-secondary)"
              } }),
              PLAYBACK_SPEEDS.map((speed) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setPlaybackSpeed(speed), className: `cyber-btn px-2 py-1 text-[10px] font-cyber tracking-wide ${playbackSpeed === speed ? "" : "opacity-60"}`, style: {
                borderColor: playbackSpeed === speed ? "var(--cyan)" : "var(--border-neon)",
                color: playbackSpeed === speed ? "var(--cyan)" : "var(--text-secondary)"
              }, children: [
                speed,
                "x"
              ] }, speed))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber tracking-wide", style: {
                color: "var(--text-secondary)"
              }, children: "跳至回合" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: currentTurn, onChange: handleJumpSelect, className: "cyber-input px-2 py-1 text-xs font-cyber", style: {
                borderColor: "var(--pink)",
                color: "var(--pink)",
                backgroundColor: "var(--bg-dark)",
                cursor: "pointer"
              }, children: sampleTurns.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t.turn, children: [
                "第 ",
                t.turn,
                " 回合"
              ] }, t.turn)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mt-3 pt-3 border-t text-xs", style: {
            borderColor: "var(--border-neon)",
            color: "var(--text-muted)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber tracking-wide", style: {
              color: "var(--cyan)"
            }, children: [
              "第 ",
              currentTurn,
              " 回合"
            ] }),
            " · ",
            currentTurnSummary || "—"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l flex flex-col order-3", style: {
        borderColor: "var(--border-neon)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b flex items-center gap-2", style: {
          borderColor: "var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14, style: {
            color: "var(--pink)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
            color: "var(--pink)"
          }, children: "回合詳情" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: logContainerRef, className: "flex-1 overflow-y-auto px-3 py-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3", style: {
            borderColor: "var(--cyan)",
            boxShadow: "0 0 12px rgba(0, 255, 255, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14, style: {
                color: "var(--cyan)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-sm tracking-wider", style: {
                color: "var(--cyan)"
              }, children: [
                "第 ",
                currentTurn,
                " 回合"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: {
              color: "var(--text-primary)"
            }, children: currentTurnSummary })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber tracking-wider mb-2 px-1", style: {
              color: "var(--text-secondary)"
            }, children: "事件明細" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: currentTurnEvents.length > 0 ? currentTurnEvents.map((evt, idx) => {
              const color = ACTION_COLORS[evt.action] || "var(--text-secondary)";
              const label = ACTION_LABELS[evt.action] || evt.action;
              const isKey = ["buy", "build", "pay_toll", "bankruptcy", "game_end"].includes(evt.action);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 rounded text-xs", style: {
                borderLeft: `2px solid ${color}`,
                backgroundColor: isKey ? `${color}10` : "rgba(255, 255, 255, 0.03)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-[10px] tracking-wide", style: {
                    color
                  }, children: label }),
                  isKey && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1 py-0.5 rounded font-cyber", style: {
                    backgroundColor: "var(--yellow)20",
                    color: "var(--yellow)"
                  }, children: "關鍵" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  color: "var(--text-secondary)"
                }, children: evt.description }),
                evt.amount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] font-cyber", style: {
                  color: evt.amount >= 0 ? "var(--green)" : "var(--red)"
                }, children: [
                  evt.amount >= 0 ? "+" : "",
                  "$",
                  evt.amount.toLocaleString()
                ] })
              ] }, idx);
            }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-xs rounded", style: {
              color: "var(--text-muted)"
            }, children: currentEntry ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                color: ACTION_COLORS[currentEntry.action] || "var(--cyan)"
              }, children: ACTION_LABELS[currentEntry.action] || currentEntry.action }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: replay.players[currentEntry.playerIndex]?.name || "系統" })
            ] }) : "暫無事件細節" }) })
          ] }),
          useSampleData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber tracking-wider mb-2 px-1", style: {
              color: "var(--text-secondary)"
            }, children: "資產變化" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-3 space-y-2", style: {
              borderColor: "var(--border-neon-cyan)"
            }, children: displayPlayers.map((p, idx) => {
              const progress = currentStep / Math.max(1, totalSteps - 1);
              const props = idx === 0 ? Math.min(10, Math.floor(progress * 10 + 1)) : Math.min(8, Math.floor(progress * 7 + 1));
              const money = idx === 0 ? Math.max(500, 15e3 - props * 1800 + currentStep * 200) : Math.max(200, 15e3 - props * 2e3 - currentStep * 100);
              const pColor = idx === 0 ? "var(--cyan)" : "var(--pink)";
              const totalAssets = money + props * 1200;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full", style: {
                      backgroundColor: pColor
                    } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
                      color: pColor
                    }, children: p.name })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-cyber", style: {
                    color: "var(--text-secondary)"
                  }, children: [
                    "$",
                    totalAssets.toLocaleString()
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1 rounded-full bg-[var(--bg-mid)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
                  width: `${Math.min(100, totalAssets / 3e4 * 100)}%`,
                  backgroundColor: pColor,
                  boxShadow: `0 0 6px ${pColor}`
                } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-1 text-[10px]", style: {
                  color: "var(--text-muted)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "現金 $",
                    money.toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    props,
                    " 塊地"
                  ] })
                ] })
              ] }, idx);
            }) })
          ] }),
          useSampleData && currentTurnEvents.some((e) => ["buy", "build", "pay_toll", "bankruptcy"].includes(e.action)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber tracking-wider mb-2 px-1", style: {
              color: "var(--text-secondary)"
            }, children: "關鍵決策" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-3", style: {
              borderColor: "var(--purple)",
              boxShadow: "0 0 10px rgba(155, 89, 255, 0.15)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, style: {
                color: "var(--purple)",
                marginTop: 2
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs leading-relaxed", style: {
                color: "var(--text-secondary)"
              }, children: getTurnAnalysis(currentTurn) })
            ] }) })
          ] })
        ] })
      ] })
    ] }),
    !useSampleData && gameState && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t px-4 py-3", style: {
      borderColor: "var(--border-neon)",
      background: "var(--bg-dark)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono w-12 text-right", style: {
          color: "var(--text-muted)"
        }, children: currentStep + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: Math.max(0, totalSteps - 1), value: currentStep, onChange: handleSeek, className: "flex-1 h-1", style: {
          accentColor: "var(--cyan)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono w-12", style: {
          color: "var(--text-muted)"
        }, children: totalSteps })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSkipStart, className: "cyber-btn p-2", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)"
        }, "aria-label": "跳到開頭", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handlePrevStep, className: "cyber-btn p-2", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, "aria-label": "上一步", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handlePlayPause, className: "cyber-btn p-3", style: {
          borderColor: "var(--pink)",
          color: "var(--pink)",
          boxShadow: "0 0 15px color-mix(in srgb, var(--pink) 40%, transparent)"
        }, "aria-label": isPlaying ? "暫停" : "播放", children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleNextStep, className: "cyber-btn p-2", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, "aria-label": "下一步", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSkipEnd, className: "cyber-btn p-2", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)"
        }, "aria-label": "跳到結尾", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 mx-2", style: {
          background: "var(--border-neon)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FastForward, { size: 16, style: {
            color: "var(--text-secondary)"
          } }),
          [1, 2, 4].map((speed) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setPlaybackSpeed(speed), className: `cyber-btn px-2 py-1 text-xs font-cyber ${playbackSpeed === speed ? "" : "opacity-50"}`, style: {
            borderColor: playbackSpeed === speed ? "var(--cyan)" : "var(--border-neon)",
            color: playbackSpeed === speed ? "var(--cyan)" : "var(--text-secondary)"
          }, children: [
            speed,
            "x"
          ] }, speed))
        ] })
      ] }),
      currentEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mt-2 text-xs", style: {
        color: "var(--text-muted)"
      }, children: [
        "第 ",
        currentEntry.turn,
        " 回合 ·",
        " ",
        replay.players[currentEntry.playerIndex]?.name || "系統",
        " ·",
        " ",
        ACTION_LABELS[currentEntry.action] || currentEntry.action,
        !replayResult?.isExact && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", style: {
          color: "var(--yellow)"
        }, children: "(近似)" })
      ] })
    ] })
  ] });
};
function getTurnAnalysis(turn) {
  const analyses = {
    1: "雙方開局穩健，各自購買起點附近地產，奠定基礎。",
    2: "暗影黑客跳過能源站，顯示其傾向高價值核心地產的策略。",
    3: "核心區與中央塔的爭奪揭開序幕，這兩塊是中期關鍵資產。",
    4: "命運卡帶來隨機波動，霓虹行者繳稅導致現金暫時緊張。",
    5: "霓虹行者進入禁閉區，錯過寶貴的購地機會，節奏被打斷。",
    6: "暗影黑客利用對方入獄期間加速擴張，購入後街增強套裝潛力。",
    7: "暗影黑客率先升級建築，開始建立收租優勢。",
    8: "關鍵轉折！霓虹行者踩中央塔付出高額過路費，現金大幅縮水。",
    9: "霓虹行者反擊，購入星光道佈局頂級資產線。",
    10: "雙方雙雙通過起點，獲得營運資金補血。",
    11: "霓虹行者開始建房，雙方進入收租對壘階段。",
    12: "暗影黑客首次支付霓虹區過路費，金額雖小但預示反撲開始。",
    13: "命運卡罰款進一步打擊暗影黑客的現金流。",
    14: "霓虹行者升級核心區至酒店級，釋放強烈進攻信號。",
    15: "致命一擊！暗影黑客踩到核心區酒店，現金幾乎見底。",
    16: "暗影黑客被迫拆房套現，進入被動防守狀態。",
    17: "霓虹行者持續擴張版圖，勝利天平傾斜。",
    18: "暗影黑客破產，霓虹行者以壓倒性資產優勢獲勝。"
  };
  return analyses[turn] || "雙方繼續佈局，積累資產優勢。";
}
const ReplayPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const replayIdParam = searchParams.get("id");
  const [replays, setReplays] = reactExports.useState([]);
  const [selectedReplay, setSelectedReplay] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const list = loadReplays();
    setReplays(list);
    const shareId = getReplayFromUrl();
    if (shareId) {
      const sharedReplay = getReplayByShareId(shareId);
      if (sharedReplay) {
        setSelectedReplay(sharedReplay);
        return;
      }
    }
    if (replayIdParam) {
      const found = list.find((r) => r.id === replayIdParam);
      if (found) {
        setSelectedReplay(found);
      }
    }
  }, [replayIdParam]);
  const handleSelectReplay = reactExports.useCallback((replay) => {
    setSelectedReplay(replay);
  }, []);
  const handleBackToList = reactExports.useCallback(() => {
    setSelectedReplay(null);
  }, []);
  const handleBack = reactExports.useCallback(() => {
    navigate("/profile");
  }, [navigate]);
  const handleDeleteReplay = reactExports.useCallback((id) => {
    const updated = replays.filter((r) => r.id !== id);
    setReplays(updated);
    saveReplays(updated);
    if (selectedReplay?.id === id) {
      setSelectedReplay(null);
    }
  }, [replays, selectedReplay]);
  const handleImportReplay = reactExports.useCallback((replay) => {
    const existing = loadReplays();
    const updated = [replay, ...existing].slice(0, MAX_REPLAYS);
    saveReplays(updated);
    setReplays(updated);
    setSelectedReplay(replay);
  }, []);
  if (selectedReplay) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayPlayer, { replay: selectedReplay, onBack: handleBackToList });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "回放紀錄" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ReplayList, { replays, onSelect: handleSelectReplay, onDelete: handleDeleteReplay, onImport: handleImportReplay })
  ] });
};
export {
  ReplayPage as default
};
