import { d as createLucideIcon, u as useNavigate, r as reactExports, c7 as createInitialState, c8 as PLAYER_COLORS, j as jsxRuntimeExports, bE as ChevronLeft, bs as Eye, B as Board, bK as Play, c0 as Info, Z as Zap, c9 as Brain, S as Swords, b9 as Sparkles, aI as Trophy, X, ca as GAME_MODES, by as Skull, bH as Shield, cb as Lightbulb, $ as TriangleAlert, aN as Target } from "./index-Clt-7orM.js";
import { S as SkipBack, P as Pause, a as SkipForward } from "./skip-forward-DI1a1mBg.js";
const __iconNode = [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
];
const Gauge = createLucideIcon("gauge", __iconNode);
const AI_DEMO_REPLAYS = [{
  id: "demo-001",
  title: "地獄級對決：套裝爭奪戰",
  description: "兩個地獄級AI的頂尖對局，全程圍繞核心區塊套裝展開攻防，示範精確計算與資產估算。",
  difficulty: "hell",
  playerNames: ["Alpha-01", "Omega-07"],
  totalTurns: 45,
  annotations: [{
    turn: 3,
    playerIndex: 0,
    title: "為何不買此塊地？",
    content: "Alpha-01路過舊城區（地價600）時選擇pass。看似保守，實則計算：此塊所屬系列僅2塊，套裝過路費加成效益低；且後續還有5塊更高價值地，保留現金等待更佳標的。",
    type: "strategy"
  }, {
    turn: 7,
    playerIndex: 1,
    title: "為何此塊必須搶？",
    content: "Omega-07以高於地價20%的價格在拍賣中搶下金融街。計算邏輯：金融街是中央塔/富豪區系列的關鍵一塊，Alpha-01已擁有中央塔，若讓其湊齊套裝，後續被動過路費損失預估超過3000/次，因此即使溢價購入也划算。",
    type: "analysis"
  }, {
    turn: 12,
    playerIndex: 0,
    title: "聯合針對最強玩家",
    content: "4人局中，Alpha-01與另一名AI暗中形成「弱勢聯盟」：雙方都優先購買Omega-07快要湊齊的系列地塊，阻止其達成套裝。這是地獄級AI的「聯合圍剿」策略——先幹掉最強對手，再內戰。",
    type: "strategy"
  }, {
    turn: 20,
    playerIndex: 1,
    title: "精確現金流管理",
    content: "Omega-07建房後現金剛好剩1200，恰好等於安全墊×1.2。地獄級AI會計算未來3回合內可能遇到的最高過路費，確保現金始終足以應對，避免被迫抵押套裝地產。",
    type: "tip"
  }, {
    turn: 30,
    playerIndex: 0,
    title: "交易談判的底線計算",
    content: "Alpha-07提議用「舊城區+2000元」換「數據塔」。底線邏輯：數據塔所屬系列若湊齊，套裝加成×3後過路費可達1800/次，預計5回合內回收成本；舊城區即使有套裝，過路費僅400/次，長期收益遠低。",
    type: "analysis"
  }, {
    turn: 42,
    playerIndex: 1,
    title: "致命一擊：何時升級酒店",
    content: "Omega-07在確認Alpha-01下回合必經過富豪區後，才連續升級3級建築到酒店。時機選擇：如果提前升級，Alpha-01可能改變路線（用道具/命運卡）；等到對方已經擲骰、位置確定後再建，確保投資立即見效。",
    type: "strategy"
  }]
}, {
  id: "demo-002",
  title: "困難級教學：新手常見錯誤",
  description: "對比人類新手常見決策與困難級AI的選擇，解釋為什麼某些看似合理的決定其實是敗筆。",
  difficulty: "hard",
  playerNames: ["新手", "困難AI"],
  totalTurns: 30,
  annotations: [{
    turn: 2,
    playerIndex: 1,
    title: "新手迷思：地價越便宜越賺？",
    content: "新手常見誤解：「便宜地先買，賺得快」。實際上，低價地的過路費也低，即使湊齊套裝也難以構成威脅。困難級AI優先攢錢買中高價位地，寧願錯過前幾塊便宜地，也要保證後續買得起核心區塊。",
    type: "tip"
  }, {
    turn: 8,
    playerIndex: 0,
    title: "新手常犯：有錢就建房？",
    content: "新手拿到套裝就立刻把所有地建滿。AI思路：先建1-2級觀望，確保對方還會經常路過此系列再升級；一次建滿會耗盡現金，後續遇到命運卡罰款就被迫賤賣地產。",
    type: "warning"
  }, {
    turn: 15,
    playerIndex: 1,
    title: "套裝優先於總數量",
    content: "AI有5塊散地 vs 人類有3塊但湊齊1套。看似人類地少，但套裝加成讓過路費×3，實際收益更高。原則：1套完整系列 > 4塊散地。",
    type: "strategy"
  }, {
    turn: 22,
    playerIndex: 0,
    title: "新手死穴：忽視現金安全墊",
    content: "新手把錢全部拿去買地建房，現金只剩幾百。一旦走到對方套裝地就直接破產。AI永遠保留至少1000-2000元安全墊，地獄級甚至會計算所有對手最貴地塊的過路費總和。",
    type: "warning"
  }]
}, {
  id: "demo-003",
  title: "投機派AI 經典逆轉",
  description: "投機派AI 前期落後，靠拍賣低買高賣+股票操作逆轉戰局，示範另類獲勝路徑。",
  difficulty: "hell",
  playerNames: ["激進派", "投機派"],
  totalTurns: 38,
  annotations: [{
    turn: 5,
    playerIndex: 1,
    title: "投機派為何也買地？",
    content: "投機派並非不買地，而是選擇性地買：只買即將進入拍賣流程、對方也想要的地。目的不是收租，而是等對方主動提議交易時高價賣出，賺取差價。",
    type: "strategy"
  }, {
    turn: 14,
    playerIndex: 1,
    title: "拍賣場上的心理戰",
    content: "投機派AI在拍賣前期故意出價很高，營造「我勢在必得」的假象，引誘對手跟進加價；在對方接近底線時突然放棄，讓對手以高於市場價的價格買入。",
    type: "analysis"
  }, {
    turn: 25,
    playerIndex: 1,
    title: "股票操作：別把雞蛋放一個籃子",
    content: "投機派AI分散買入3隻不同板塊的股票，而不是 all-in 一隻。原因：大富翁股市波動隨機，分散投資降低破產風險；長期來看，3隻股票的期望值等同但方差更小。",
    type: "tip"
  }, {
    turn: 35,
    playerIndex: 0,
    title: "激進派的盲點",
    content: "激進派AI擁有最多地產，但現金不足且分散在多個未湊齊的系列中。投機派此時發起交易：用少量現金+1塊散地，換取對方1塊關鍵套裝地。激進派因現金緊張被迫接受，從此走上下坡。",
    type: "analysis"
  }]
}];
const AI_DIFFICULTIES = [{
  id: "easy",
  name: "簡單 AI",
  description: "隨機決策，偶爾做出合理選擇，適合初次體驗的玩家。",
  recommendedFor: "新手入門 / 休閒玩家",
  power: 30,
  color: "var(--green)",
  icon: "brain",
  strategies: ["購買決策幾乎隨機，大約 30% 機率買下經過的地產", "不考慮套裝價值，見地就買是常態", "建房隨意，傾向有錢就升級", "幾乎不參與拍賣，錯過大量撿便宜機會", "安全墊觀念薄弱，容易現金斷鏈"]
}, {
  id: "normal",
  name: "普通 AI",
  description: "具備基本策略，懂得購買和建房，但風險意識不足。",
  recommendedFor: "有基礎經驗的玩家",
  power: 60,
  color: "var(--cyan)",
  icon: "shield",
  strategies: ["現金充足時優先購買地產，大約 60% 購買率", "懂得優先升級已擁有套裝的地產", "但分散投資，缺乏聚焦核心系列的概念", "命運卡隨機應對，沒有長期現金規劃", "安全墊約 500 元，容易被高額過路費擊潰"]
}, {
  id: "hard",
  name: "困難 AI",
  description: "會計算資產價值與風險，懂得套裝策略，具備交易判斷力。",
  recommendedFor: "資深玩家 / 想磨練技術",
  power: 85,
  color: "var(--pink)",
  icon: "zap",
  strategies: ["現金超過地價 3 倍時 80% 機率購買，緊張時降到 20%", "優先搶奪核心套裝系列（中央塔/富豪區/總部）", "建房前計算對方路過機率，優先升級高流量地", "參與拍賣並計算底線，超過市價 120% 果斷放棄", "永遠保留 1000-1500 元現金安全墊", "交易評估：只接受能幫助自己湊齊套裝的提議"]
}, {
  id: "hell",
  name: "地獄 AI",
  description: "接近人類頂尖水平，精確計算資產、風險、對手心理。",
  recommendedFor: "頂尖玩家 / 想被虐的挑戰者",
  power: 98,
  color: "var(--red)",
  icon: "skull",
  strategies: ["精確計算每塊地的 ROI（投資回報率）和路過機率", "模擬未來 5 回合現金流，提前調整資產結構", "聯合圍剿最強對手，形成弱勢者隱性聯盟", "拍賣場心理戰：前期高價營造氣勢，對方接近底線時瞬間撤離", "交易談判精確到 100 元以內的底線計算", "根據對手風格動態調整策略：保守型就高壓進攻，激進型就誘導超支", "酒店升級時機精準：確認對方下回合必經過才連續升級"]
}];
const AIDemoPage = () => {
  const navigate = useNavigate();
  const [selectedDemo, setSelectedDemo] = reactExports.useState(null);
  const [currentTurn, setCurrentTurn] = reactExports.useState(0);
  const [isPlaying, setIsPlaying] = reactExports.useState(false);
  const [showAnnotation, setShowAnnotation] = reactExports.useState(null);
  const [simulatedState, setSimulatedState] = reactExports.useState(null);
  const playIntervalRef = reactExports.useRef(null);
  const [aiBattleMode, setAiBattleMode] = reactExports.useState(false);
  const [aiBattleSpeed, setAiBattleSpeed] = reactExports.useState(1);
  const [battleAiLeft, setBattleAiLeft] = reactExports.useState("normal");
  const [battleAiRight, setBattleAiRight] = reactExports.useState("hard");
  const [battleTurn, setBattleTurn] = reactExports.useState(0);
  const [battleState, setBattleState] = reactExports.useState(null);
  const battleIntervalRef = reactExports.useRef(null);
  const BATTLE_TOTAL_TURNS = 50;
  const [strategyModal, setStrategyModal] = reactExports.useState(null);
  const generateSimulatedState = reactExports.useCallback((demo, turn) => {
    const state = createInitialState("classic", [{
      name: demo.playerNames[0],
      color: PLAYER_COLORS[0],
      isAI: true,
      aiDifficulty: demo.difficulty,
      aiPersonality: "aggressive"
    }, {
      name: demo.playerNames[1],
      color: PLAYER_COLORS[1],
      isAI: true,
      aiDifficulty: demo.difficulty,
      aiPersonality: "trader"
    }]);
    const progress = turn / demo.totalTurns;
    const p0Props = Math.floor(progress * 6 + 1);
    const p1Props = Math.floor(progress * 5 + 1);
    for (let i = 1; i <= p0Props && i <= 8; i += 1) {
      const cellId = i;
      state.properties[cellId] = {
        owner: 0,
        buildings: i % 3 === 0 ? i > 6 ? 4 : 2 : 1,
        isMortgaged: false
      };
    }
    for (let i = 0; i < p1Props && i < 7; i += 1) {
      const cellId = 11 + i * 2;
      if (cellId < 36) {
        state.properties[cellId] = {
          owner: 1,
          buildings: i % 2 === 0 ? 1 : 3,
          isMortgaged: false
        };
      }
    }
    const baseMoney = GAME_MODES.classic.initialMoney;
    state.players[0].money = Math.max(500, baseMoney - p0Props * 1500 + Math.floor(turn * 50));
    state.players[1].money = Math.max(500, baseMoney - p1Props * 1600 + Math.floor(turn * 45));
    state.players[0].position = Math.floor(1 + turn * 2) % 36;
    state.players[1].position = Math.floor(19 + turn * 1.7) % 36;
    state.players[0].totalAssets = state.players[0].money + p0Props * 1200;
    state.players[1].totalAssets = state.players[1].money + p1Props * 1300;
    state.currentPlayerIndex = turn % 2;
    return state;
  }, []);
  const generateBattleState = reactExports.useCallback((turn) => {
    const leftDiff = AI_DIFFICULTIES.find((d) => d.id === battleAiLeft);
    const rightDiff = AI_DIFFICULTIES.find((d) => d.id === battleAiRight);
    const state = createInitialState("classic", [{
      name: `${leftDiff?.name || "AI-A"} · 左`,
      color: PLAYER_COLORS[0],
      isAI: true,
      aiDifficulty: battleAiLeft,
      aiPersonality: "trader"
    }, {
      name: `${rightDiff?.name || "AI-B"} · 右`,
      color: PLAYER_COLORS[1],
      isAI: true,
      aiDifficulty: battleAiRight,
      aiPersonality: "aggressive"
    }]);
    const progress = turn / BATTLE_TOTAL_TURNS;
    const leftPower = leftDiff?.power ?? 60;
    const rightPower = rightDiff?.power ?? 60;
    const leftProps = Math.min(10, Math.floor(progress * (leftPower / 8) + 1));
    const rightProps = Math.min(10, Math.floor(progress * (rightPower / 8) + 1));
    for (let i = 1; i <= leftProps && i <= 8; i += 1) {
      const cellId = i;
      state.properties[cellId] = {
        owner: 0,
        buildings: i % 3 === 0 ? i > 6 ? 4 : 2 : 1,
        isMortgaged: false
      };
    }
    for (let i = 0; i < leftProps - 8; i += 1) {
      const cellId = 28 + i;
      if (cellId <= 35) {
        state.properties[cellId] = {
          owner: 0,
          buildings: 1,
          isMortgaged: false
        };
      }
    }
    for (let i = 0; i < rightProps && i < 8; i += 1) {
      const cellId = 11 + i * 2;
      if (cellId < 27) {
        state.properties[cellId] = {
          owner: 1,
          buildings: i % 2 === 0 ? 1 : 2,
          isMortgaged: false
        };
      }
    }
    for (let i = 0; i < rightProps - 8; i += 1) {
      const cellId = 19 + i;
      if (cellId < 27) {
        state.properties[cellId] = {
          owner: 1,
          buildings: 1,
          isMortgaged: false
        };
      }
    }
    const baseMoney = GAME_MODES.classic.initialMoney;
    state.players[0].money = Math.max(200, baseMoney - leftProps * 1400 + Math.floor(turn * (leftPower / 20)));
    state.players[1].money = Math.max(200, baseMoney - rightProps * 1500 + Math.floor(turn * (rightPower / 20)));
    state.players[0].position = Math.floor(1 + turn * 1.8) % 36;
    state.players[1].position = Math.floor(19 + turn * 1.5) % 36;
    state.players[0].totalAssets = state.players[0].money + leftProps * 1100;
    state.players[1].totalAssets = state.players[1].money + rightProps * 1200;
    state.currentPlayerIndex = turn % 2;
    return state;
  }, [battleAiLeft, battleAiRight]);
  const startAiBattle = reactExports.useCallback(() => {
    setAiBattleMode(true);
    setBattleTurn(0);
    setIsPlaying(false);
  }, []);
  const handleBattlePlayPause = reactExports.useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);
  const handleBattleStepForward = reactExports.useCallback(() => {
    setBattleTurn((prev) => Math.min(prev + 1, BATTLE_TOTAL_TURNS - 1));
  }, []);
  const handleBattleStepBack = reactExports.useCallback(() => {
    setBattleTurn((prev) => Math.max(0, prev - 1));
  }, []);
  const handleBattleSpeed = reactExports.useCallback((speed) => {
    setAiBattleSpeed(speed);
  }, []);
  const exitBattleMode = reactExports.useCallback(() => {
    setAiBattleMode(false);
    setBattleTurn(0);
    setIsPlaying(false);
    if (battleIntervalRef.current) {
      window.clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
  }, []);
  reactExports.useEffect(() => {
    if (!aiBattleMode) return;
    if (isPlaying) {
      const delay = 1200 / aiBattleSpeed;
      battleIntervalRef.current = window.setInterval(() => {
        setBattleTurn((prev) => {
          if (prev >= BATTLE_TOTAL_TURNS - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else if (battleIntervalRef.current) {
      window.clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    return () => {
      if (battleIntervalRef.current) {
        window.clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
    };
  }, [isPlaying, aiBattleMode, aiBattleSpeed]);
  reactExports.useEffect(() => {
    if (aiBattleMode) {
      const state = generateBattleState(battleTurn);
      setBattleState(state);
    }
  }, [aiBattleMode, battleTurn, generateBattleState]);
  const getAiDifficulty = reactExports.useCallback((id) => {
    return AI_DIFFICULTIES.find((d) => d.id === id);
  }, []);
  const renderAiIcon = (iconName, color, size = 20) => {
    const style = {
      color
    };
    switch (iconName) {
      case "brain":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size, style });
      case "shield":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size, style });
      case "zap":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size, style });
      case "skull":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { size, style });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size, style });
    }
  };
  reactExports.useEffect(() => {
    if (selectedDemo) {
      const state = generateSimulatedState(selectedDemo, currentTurn);
      setSimulatedState(state);
      const annotation = selectedDemo.annotations.find((a) => a.turn === currentTurn);
      if (annotation) {
        setShowAnnotation(annotation);
        if (isPlaying) {
          setIsPlaying(false);
        }
      } else {
        setShowAnnotation(null);
      }
    }
  }, [selectedDemo, currentTurn, generateSimulatedState, isPlaying]);
  reactExports.useEffect(() => {
    if (isPlaying && selectedDemo) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentTurn((prev) => {
          if (prev >= selectedDemo.totalTurns) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    } else if (playIntervalRef.current) {
      window.clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    return () => {
      if (playIntervalRef.current) {
        window.clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, selectedDemo]);
  const handleSelectDemo = (demo) => {
    setSelectedDemo(demo);
    setCurrentTurn(0);
    setIsPlaying(false);
    setShowAnnotation(null);
  };
  const handleBack = () => {
    if (aiBattleMode) {
      exitBattleMode();
    } else if (selectedDemo) {
      setSelectedDemo(null);
      setCurrentTurn(0);
      setIsPlaying(false);
    } else {
      navigate("/");
    }
  };
  const handleStepForward = () => {
    if (!selectedDemo) return;
    setCurrentTurn((prev) => Math.min(prev + 1, selectedDemo.totalTurns));
  };
  const handleStepBack = () => {
    setCurrentTurn((prev) => Math.max(0, prev - 1));
  };
  const handleJumpToAnnotation = (annotation) => {
    setCurrentTurn(annotation.turn);
    setShowAnnotation(annotation);
    setIsPlaying(false);
  };
  const getAnnotationIcon = (type) => {
    switch (type) {
      case "strategy":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 16 });
      case "warning":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16 });
      case "tip":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 16 });
      case "analysis":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 16 });
    }
  };
  const getAnnotationColor = (type) => {
    switch (type) {
      case "strategy":
        return "var(--cyan)";
      case "warning":
        return "var(--red)";
      case "tip":
        return "var(--yellow)";
      case "analysis":
        return "var(--pink)";
    }
  };
  if (aiBattleMode && battleState) {
    const leftDiff = getAiDifficulty(battleAiLeft);
    const rightDiff = getAiDifficulty(battleAiRight);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-3 py-4 md:px-6 md:py-6 scanlines", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-lg md:text-2xl text-neon-cyan tracking-wider truncate", children: "AI 對戰觀察室" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] truncate", children: "觀察不同難度 AI 之間的自動對局" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-1 rounded text-[10px] font-cyber tracking-wider flex items-center gap-1", style: {
          border: "1px solid var(--purple)",
          color: "var(--purple)",
          backgroundColor: "rgba(155, 89, 255, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 10 }),
          "觀察模式"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 text-center", style: {
          borderColor: `${leftDiff?.color || "var(--cyan)"}60`,
          boxShadow: `0 0 15px ${leftDiff?.color || "var(--cyan)"}20`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-2", children: renderAiIcon(leftDiff?.icon || "brain", leftDiff?.color || "var(--cyan)", 24) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider mb-1", style: {
            color: leftDiff?.color || "var(--cyan)"
          }, children: leftDiff?.name || "AI 左" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px]", style: {
            color: "var(--text-secondary)"
          }, children: [
            "戰鬥力 ",
            leftDiff?.power ?? 0
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 text-center", style: {
          borderColor: `${rightDiff?.color || "var(--pink)"}60`,
          boxShadow: `0 0 15px ${rightDiff?.color || "var(--pink)"}20`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-2", children: renderAiIcon(rightDiff?.icon || "zap", rightDiff?.color || "var(--pink)", 24) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider mb-1", style: {
            color: rightDiff?.color || "var(--pink)"
          }, children: rightDiff?.name || "AI 右" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px]", style: {
            color: "var(--text-secondary)"
          }, children: [
            "戰鬥力 ",
            rightDiff?.power ?? 0
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-4 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-3 md:p-4 mb-3 flex-shrink-0", style: {
            borderColor: "var(--border-neon-cyan)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Board, { gameState: battleState, onCellClick: () => {
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 md:p-4 flex flex-col gap-3", style: {
            borderColor: "rgba(255, 107, 157, 0.3)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber tracking-wider", style: {
                color: "var(--text-secondary)"
              }, children: [
                "回合 ",
                battleTurn + 1,
                " / ",
                BATTLE_TOTAL_TURNS
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber", style: {
                color: PLAYER_COLORS[battleState.currentPlayerIndex]
              }, children: [
                battleState.players[battleState.currentPlayerIndex].name,
                " 行動"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 rounded-full bg-[var(--bg-mid)] relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
              width: `${(battleTurn + 1) / BATTLE_TOTAL_TURNS * 100}%`,
              background: "linear-gradient(90deg, var(--cyan), var(--pink))",
              boxShadow: "0 0 8px var(--cyan)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBattleStepBack, className: "cyber-btn w-10 h-10 flex items-center justify-center", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { size: 18 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBattlePlayPause, className: "cyber-btn cyber-btn-pink w-14 h-14 rounded-full flex items-center justify-center", children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 22 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 22, className: "ml-1" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBattleStepForward, className: "cyber-btn w-10 h-10 flex items-center justify-center", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { size: 18 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { size: 14, style: {
                color: "var(--text-secondary)"
              } }),
              [0.5, 1, 2, 4].map((speed) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleBattleSpeed(speed), className: `cyber-btn px-2 py-1 text-[10px] font-cyber ${aiBattleSpeed === speed ? "" : "opacity-60"}`, style: {
                borderColor: aiBattleSpeed === speed ? "var(--cyan)" : "var(--border-neon)",
                color: aiBattleSpeed === speed ? "var(--cyan)" : "var(--text-secondary)"
              }, children: [
                speed,
                "x"
              ] }, speed))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:w-80 flex flex-col gap-3", children: [
          battleState.players.map((p, idx) => {
            const diff = idx === 0 ? leftDiff : rightDiff;
            const pColor = idx === 0 ? "var(--cyan)" : "var(--pink)";
            const props = Object.values(battleState.properties).filter((pr) => pr.owner === idx).length;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
              borderColor: idx === battleState.currentPlayerIndex ? pColor : "var(--border-neon-cyan)",
              boxShadow: idx === battleState.currentPlayerIndex ? `0 0 15px ${pColor}30` : "none"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                renderAiIcon(diff?.icon || "brain", pColor, 16),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-wider", style: {
                  color: pColor
                }, children: p.name }),
                idx === battleState.currentPlayerIndex && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[9px] font-cyber px-1.5 py-0.5 rounded", style: {
                  backgroundColor: `${pColor}22`,
                  color: pColor
                }, children: "行動中" })
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
                    p.money.toLocaleString()
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
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "總資產" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber", style: {
                    color: pColor
                  }, children: [
                    "$",
                    p.totalAssets?.toLocaleString() || 0
                  ] })
                ] })
              ] })
            ] }, idx);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3", style: {
            borderColor: "var(--border-neon-cyan)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[var(--text-secondary)] mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider", children: "對戰分析" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: {
              color: "var(--text-secondary)"
            }, children: getBattleAnalysis(battleTurn, leftDiff, rightDiff) })
          ] })
        ] })
      ] })
    ] });
  }
  if (selectedDemo && simulatedState) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-3 py-4 md:px-6 md:py-6 scanlines", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "列表" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-lg md:text-2xl text-neon-cyan tracking-wider truncate", children: selectedDemo.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] truncate", children: selectedDemo.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-1 rounded text-[10px] font-cyber tracking-wider flex items-center gap-1", style: {
          border: "1px solid var(--red)",
          color: "var(--red)",
          backgroundColor: "rgba(255, 77, 109, 0.1)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10 }),
          selectedDemo.difficulty === "hell" ? "地獄級" : "困難級"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-4 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-3 md:p-4 mb-3 flex-shrink-0", style: {
            borderColor: "var(--border-neon-cyan)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Board, { gameState: simulatedState, onCellClick: () => {
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 md:p-4 flex flex-col gap-3", style: {
            borderColor: "rgba(255, 107, 157, 0.3)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber tracking-wider", style: {
                color: "var(--text-secondary)"
              }, children: [
                "回合 ",
                currentTurn,
                " / ",
                selectedDemo.totalTurns
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber", style: {
                color: PLAYER_COLORS[simulatedState.currentPlayerIndex]
              }, children: [
                simulatedState.players[simulatedState.currentPlayerIndex].name,
                " 行動"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-2 rounded-full bg-[var(--bg-mid)] relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
                width: `${currentTurn / selectedDemo.totalTurns * 100}%`,
                background: "linear-gradient(90deg, var(--cyan), var(--pink))",
                boxShadow: "0 0 8px var(--cyan)"
              } }),
              selectedDemo.annotations.map((ann) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleJumpToAnnotation(ann), className: "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full -ml-1 hover:scale-150 transition-transform", style: {
                left: `${ann.turn / selectedDemo.totalTurns * 100}%`,
                backgroundColor: getAnnotationColor(ann.type),
                boxShadow: `0 0 6px ${getAnnotationColor(ann.type)}`
              }, title: `回合 ${ann.turn}: ${ann.title}` }, ann.turn))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleStepBack, className: "cyber-btn w-10 h-10 flex items-center justify-center", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { size: 18 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsPlaying((p) => !p), className: "cyber-btn cyber-btn-pink w-14 h-14 rounded-full flex items-center justify-center", children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 22 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 22, className: "ml-1" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleStepForward, className: "cyber-btn w-10 h-10 flex items-center justify-center", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { size: 18 }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:w-80 flex flex-col gap-3", children: [
          showAnnotation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 animate-fade-in", style: {
            borderColor: getAnnotationColor(showAnnotation.type),
            boxShadow: `0 0 15px ${getAnnotationColor(showAnnotation.type)}30`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full flex items-center justify-center", style: {
                backgroundColor: `${getAnnotationColor(showAnnotation.type)}20`,
                color: getAnnotationColor(showAnnotation.type)
              }, children: getAnnotationIcon(showAnnotation.type) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-cyber tracking-wider", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  "關鍵決策 · 回合 ",
                  showAnnotation.turn
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base tracking-wider", style: {
                  color: getAnnotationColor(showAnnotation.type)
                }, children: showAnnotation.title })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: {
              color: "var(--text-primary)"
            }, children: showAnnotation.content })
          ] }),
          !showAnnotation && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4", style: {
            borderColor: "var(--border-neon-cyan)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[var(--text-secondary)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider", children: "繼續播放以查看關鍵決策分析" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex-1 overflow-y-auto", style: {
            borderColor: "rgba(77, 195, 255, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber tracking-wider mb-3 flex items-center gap-2", style: {
              color: "var(--blue)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "關鍵決策點 (",
                selectedDemo.annotations.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedDemo.annotations.map((ann) => {
              const isActive = showAnnotation?.turn === ann.turn;
              const color = getAnnotationColor(ann.type);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleJumpToAnnotation(ann), className: "w-full text-left p-2 rounded transition-all", style: {
                border: `1px solid ${isActive ? color : `${color}30`}`,
                backgroundColor: isActive ? `${color}15` : "transparent",
                cursor: "pointer"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-cyber px-1.5 py-0.5 rounded", style: {
                    backgroundColor: `${color}22`,
                    color
                  }, children: [
                    "回合 ",
                    ann.turn
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wide", style: {
                    color
                  }, children: ann.title })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] line-clamp-2", style: {
                  color: "var(--text-secondary)"
                }, children: ann.content })
              ] }, ann.turn);
            }) })
          ] })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-4xl text-neon-cyan tracking-wider pulse-glow", children: "AI 示範棋譜" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] font-cyber tracking-wider mt-1", children: "頂級AI對局解構 · 關鍵決策深度分析" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 mb-6", style: {
        borderColor: "rgba(255, 107, 157, 0.3)",
        background: "rgba(255, 107, 157, 0.03)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "flex-shrink-0 mt-0.5", style: {
          color: "var(--pink)"
        }, size: 20 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-2", style: {
          color: "var(--text-secondary)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "觀摩頂級AI的對局過程，學習職業級策略思維。" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
            "每個示範棋譜包含多個",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--pink)"
            }, children: "關鍵決策點" }),
            "， 到達時自動暫停並顯示繁體中文註解，解讀AI背後的計算邏輯。"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { size: 20, style: {
            color: "var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider", style: {
            color: "var(--cyan)",
            textShadow: "0 0 8px var(--cyan)"
          }, children: "AI 難度等級" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: AI_DIFFICULTIES.map((diff) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 transition-all hover:scale-[1.01]", style: {
          borderColor: `${diff.color}60`,
          boxShadow: `0 0 12px ${diff.color}20`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center", style: {
                backgroundColor: `${diff.color}15`
              }, children: renderAiIcon(diff.icon, diff.color, 22) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-base tracking-wider", style: {
                  color: diff.color,
                  textShadow: `0 0 6px ${diff.color}`
                }, children: diff.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-0.5", style: {
                  color: "var(--text-secondary)"
                }, children: diff.recommendedFor })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg tracking-wider", style: {
              color: diff.color
            }, children: diff.power })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mb-3 leading-relaxed", style: {
            color: "var(--text-secondary)"
          }, children: diff.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 rounded-full bg-[var(--bg-mid)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
              width: `${diff.power}%`,
              backgroundColor: diff.color,
              boxShadow: `0 0 8px ${diff.color}`
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-1 text-[10px] font-cyber", style: {
              color: "var(--text-muted)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "戰鬥力" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: diff.color
              }, children: [
                diff.power,
                " / 100"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setStrategyModal(diff), className: "cyber-btn flex-1 px-3 py-1.5 text-xs font-cyber tracking-wide flex items-center justify-center gap-1", style: {
              borderColor: diff.color,
              color: diff.color
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 12 }),
              "策略說明"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              setBattleAiLeft(diff.id);
              setBattleAiRight(diff.id === "hell" ? "hard" : "hell");
              startAiBattle();
            }, className: "cyber-btn flex-1 px-3 py-1.5 text-xs font-cyber tracking-wide flex items-center justify-center gap-1", style: {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              backgroundColor: "rgba(255, 107, 157, 0.08)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 12 }),
              "觀看演示"
            ] })
          ] })
        ] }, diff.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-5 mb-8", style: {
        borderColor: "rgba(155, 89, 255, 0.4)",
        background: "linear-gradient(135deg, rgba(155, 89, 255, 0.05), rgba(255, 107, 157, 0.03))",
        boxShadow: "0 0 20px rgba(155, 89, 255, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center", style: {
            backgroundColor: "rgba(155, 89, 255, 0.15)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 22, style: {
            color: "var(--purple)"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider mb-1", style: {
              color: "var(--purple)",
              textShadow: "0 0 8px rgba(155, 89, 255, 0.5)"
            }, children: "觀察 AI 對戰" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
              color: "var(--text-secondary)"
            }, children: "選擇兩個不同難度的 AI 進行自動對戰演示，觀察不同策略的碰撞" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-cyber tracking-wide mb-1 block", style: {
              color: "var(--cyan)"
            }, children: "左側 AI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: battleAiLeft, onChange: (e) => setBattleAiLeft(e.target.value), className: "cyber-input w-full px-3 py-2 text-sm font-cyber", style: {
              borderColor: "var(--cyan)",
              color: "var(--cyan)",
              backgroundColor: "var(--bg-dark)"
            }, children: AI_DIFFICULTIES.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: d.id, children: [
              d.name,
              " · 戰力",
              d.power
            ] }, d.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 24, style: {
            color: "var(--pink)"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-cyber tracking-wide mb-1 block", style: {
              color: "var(--pink)"
            }, children: "右側 AI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: battleAiRight, onChange: (e) => setBattleAiRight(e.target.value), className: "cyber-input w-full px-3 py-2 text-sm font-cyber", style: {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              backgroundColor: "var(--bg-dark)"
            }, children: AI_DIFFICULTIES.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: d.id, children: [
              d.name,
              " · 戰力",
              d.power
            ] }, d.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: startAiBattle, className: "cyber-btn w-full mt-4 py-3 font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: "var(--purple)",
          color: "var(--purple)",
          backgroundColor: "rgba(155, 89, 255, 0.1)",
          boxShadow: "0 0 15px rgba(155, 89, 255, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 18 }),
          "開始觀察對戰"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: AI_DEMO_REPLAYS.map((demo) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelectDemo(demo), className: "w-full cyber-card p-4 md:p-5 text-left transition-all hover:scale-[1.01]", style: {
        borderColor: demo.difficulty === "hell" ? "rgba(255, 77, 109, 0.4)" : "rgba(77, 195, 255, 0.3)",
        boxShadow: demo.difficulty === "hell" ? "0 0 15px rgba(255, 77, 109, 0.15)" : "0 0 10px rgba(77, 195, 255, 0.1)",
        cursor: "pointer"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg md:text-xl tracking-wider", style: {
            color: demo.difficulty === "hell" ? "var(--red)" : "var(--cyan)",
            textShadow: `0 0 8px ${demo.difficulty === "hell" ? "var(--red)" : "var(--cyan-glow)"}`
          }, children: demo.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 px-2 py-1 rounded text-[10px] font-cyber tracking-wider flex items-center gap-1", style: {
            border: `1px solid ${demo.difficulty === "hell" ? "var(--red)" : "var(--pink)"}`,
            color: demo.difficulty === "hell" ? "var(--red)" : "var(--pink)",
            backgroundColor: "rgba(0,0,0,0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10 }),
            demo.difficulty === "hell" ? "地獄級" : "困難級"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-3", style: {
          color: "var(--text-secondary)"
        }, children: demo.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--text-secondary)"
          }, className: "font-cyber tracking-wide", children: demo.playerNames.join("  vs  ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--text-muted)"
          }, children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
            color: "var(--text-secondary)"
          }, className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 12 }),
            demo.totalTurns,
            " 回合"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--text-muted)"
          }, children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
            color: "var(--text-secondary)"
          }, className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 12 }),
            demo.annotations.length,
            " 個關鍵點"
          ] })
        ] }) })
      ] }, demo.id)) })
    ] }),
    strategyModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 md:p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto", style: {
      borderColor: strategyModal.color,
      boxShadow: `0 0 30px ${strategyModal.color}30`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center", style: {
            backgroundColor: `${strategyModal.color}20`
          }, children: renderAiIcon(strategyModal.icon, strategyModal.color, 28) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-xl tracking-wider", style: {
              color: strategyModal.color,
              textShadow: `0 0 8px ${strategyModal.color}`
            }, children: strategyModal.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-0.5", style: {
              color: "var(--text-secondary)"
            }, children: [
              "戰鬥力 ",
              strategyModal.power,
              " / 100"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setStrategyModal(null), className: "p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0", style: {
          color: "var(--text-secondary)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", style: {
          color: "var(--text-secondary)"
        }, children: strategyModal.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-2", style: {
          color: "var(--text-muted)"
        }, children: [
          "推薦對象：",
          strategyModal.recommendedFor
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-3 rounded-full bg-[var(--bg-mid)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
        width: `${strategyModal.power}%`,
        backgroundColor: strategyModal.color,
        boxShadow: `0 0 10px ${strategyModal.color}`
      } }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber tracking-wider mb-3 flex items-center gap-2", style: {
          color: strategyModal.color
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 14 }),
          "策略特點"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: strategyModal.strategies.map((strategy, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2 rounded", style: {
          backgroundColor: `${strategyModal.color}08`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-cyber mt-0.5", style: {
            backgroundColor: `${strategyModal.color}20`,
            color: strategyModal.color
          }, children: idx + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: {
            color: "var(--text-primary)"
          }, children: strategy })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
          setBattleAiLeft(strategyModal.id);
          setBattleAiRight(strategyModal.id === "hell" ? "hard" : "hell");
          setStrategyModal(null);
          startAiBattle();
        }, className: "cyber-btn flex-1 py-2 font-cyber tracking-wide text-sm flex items-center justify-center gap-2", style: {
          borderColor: strategyModal.color,
          color: strategyModal.color
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
          "觀看演示"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setStrategyModal(null), className: "cyber-btn px-4 py-2 font-cyber tracking-wide text-sm", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)"
        }, children: "關閉" })
      ] })
    ] }) })
  ] });
};
function getBattleAnalysis(turn, leftDiff, rightDiff) {
  const leftPower = leftDiff?.power ?? 50;
  const rightPower = rightDiff?.power ?? 50;
  const diff = leftPower - rightPower;
  if (turn < 5) {
    return "對局初期，雙方 AI 都在快速擴張地產版圖。低難度 AI 傾向見地就買，高難度 AI 則開始篩選核心區塊。";
  }
  if (turn < 15) {
    if (Math.abs(diff) > 20) {
      return `${diff > 0 ? leftDiff?.name : rightDiff?.name} 憑藉更優的決策品質，在土地 acquisition 階段明顯領先。套裝成型速度更快。`;
    }
    return "雙方勢均力敵，各自累積了數塊地產。接下來的套裝爭奪戰將成為勝負關鍵。";
  }
  if (turn < 30) {
    if (Math.abs(diff) > 20) {
      return "高難度 AI 開始利用資產優勢升級建築，過路費收入滾雪球式增長。低難度 AI 現金流壓力逐漸顯現。";
    }
    return "中期階段，雙方都開始升級建築並嘗試交易。地獄級 AI 在此階段會精準計算對方路過機率來決定建房時機。";
  }
  if (turn < 45) {
    if (Math.abs(diff) > 20) {
      return "戰局已基本明朗。高難度 AI 憑藉前期積累的資產優勢，正在逐步吞噬對手的現金儲備。";
    }
    return "後期鏖戰，雙方資產龐大，一次高額過路費就可能逆轉局勢。地獄級 AI 在此時會尋找致命一擊的機會。";
  }
  return "對局接近尾聲。最終勝負取決於誰的現金管理更為出色，以及誰能在對方踩中自己的高級建築時給予最後一擊。";
}
export {
  AIDemoPage as default
};
