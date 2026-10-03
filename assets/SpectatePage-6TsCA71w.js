import { d as createLucideIcon, r as reactExports, bY as toast, j as jsxRuntimeExports, bs as Eye, t as Crown, U as Users, X, cb as Lightbulb, cq as MessageSquare, bE as ChevronLeft, b4 as ChevronRight, bA as Wallet, bB as Building2, bC as House, bo as Package, aI as Trophy, $ as TriangleAlert, c0 as Info, e as Send, u as useNavigate, a as usePlayerIdentity, bp as Search, aB as Clock, Z as Zap, S as Swords } from "./index-ymfxQ6bv.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
const __iconNode = [
  [
    "path",
    {
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
      key: "sc7q7i"
    }
  ]
];
const Funnel = createLucideIcon("funnel", __iconNode);
const SPECTATE_KEY = "monopoly_spectate_rooms";
const SPECTATE_CHAT_KEY = "monopoly_spectate_chat_";
const MENTOR_TIPS_KEY = "monopoly_spectate_tips_";
const PLAYER_COLORS = ["#00ffff", "#ff00aa", "#ffff00", "#00ff88"];
const MOCK_ROOMS = [{
  id: "room1",
  roomCode: "A1B2C3",
  gameMode: "ranked",
  modeLabel: "排位賽",
  players: [{
    id: "p1",
    name: "霓虹夜行者",
    color: PLAYER_COLORS[0],
    cash: 12500,
    propertyValue: 28e3,
    propertyCount: 7,
    position: 15,
    items: 3,
    rank: "鑽石III"
  }, {
    id: "p2",
    name: "量子駭客",
    color: PLAYER_COLORS[1],
    cash: 8200,
    propertyValue: 31500,
    propertyCount: 8,
    position: 22,
    items: 2,
    rank: "大師II"
  }],
  spectatorCount: 12,
  isRanked: true,
  isMentorRoom: true,
  mentorId: "mentor_1",
  mentorName: "導師·影子",
  mentorTitle: "賽博導師·宗師級",
  turnCount: 24,
  currentTurnIndex: 0,
  startedAt: "2088-09-28T22:00:00Z"
}, {
  id: "room2",
  roomCode: "X7Y8Z9",
  gameMode: "classic",
  modeLabel: "經典模式",
  players: [{
    id: "p3",
    name: "數據殭屍",
    color: PLAYER_COLORS[0],
    cash: 15e3,
    propertyValue: 18e3,
    propertyCount: 5,
    position: 8,
    items: 1,
    rank: "宗師I"
  }, {
    id: "p4",
    name: "光纖貓",
    color: PLAYER_COLORS[1],
    cash: 13800,
    propertyValue: 15500,
    propertyCount: 4,
    position: 19,
    items: 2,
    rank: "白金IV"
  }],
  spectatorCount: 5,
  isRanked: false,
  isMentorRoom: false,
  turnCount: 15,
  currentTurnIndex: 1,
  startedAt: "2088-09-28T22:15:00Z"
}, {
  id: "room3",
  roomCode: "M4N5P6",
  gameMode: "crazy",
  modeLabel: "瘋狂模式",
  players: [{
    id: "p5",
    name: "電流公主",
    color: PLAYER_COLORS[0],
    cash: 25e3,
    propertyValue: 42e3,
    propertyCount: 9,
    position: 30,
    items: 5,
    rank: "白銀III"
  }, {
    id: "p6",
    name: "影子跑者",
    color: PLAYER_COLORS[1],
    cash: 18500,
    propertyValue: 36e3,
    propertyCount: 8,
    position: 12,
    items: 3,
    rank: "黃金V"
  }],
  spectatorCount: 8,
  isRanked: false,
  isMentorRoom: false,
  turnCount: 31,
  currentTurnIndex: 1,
  startedAt: "2088-09-28T21:50:00Z"
}, {
  id: "room4",
  roomCode: "Q3W4E5",
  gameMode: "tournament",
  modeLabel: "錦標賽",
  players: [{
    id: "p7",
    name: "賽博帝王",
    color: PLAYER_COLORS[0],
    cash: 9800,
    propertyValue: 55e3,
    propertyCount: 11,
    position: 25,
    items: 4,
    rank: "王者"
  }, {
    id: "p8",
    name: "霓虹女皇",
    color: PLAYER_COLORS[1],
    cash: 12200,
    propertyValue: 48e3,
    propertyCount: 10,
    position: 7,
    items: 3,
    rank: "王者"
  }, {
    id: "p9",
    name: "地產霸主",
    color: PLAYER_COLORS[2],
    cash: 7500,
    propertyValue: 38e3,
    propertyCount: 8,
    position: 18,
    items: 2,
    rank: "宗師II"
  }, {
    id: "p10",
    name: "金融教父",
    color: PLAYER_COLORS[3],
    cash: 11e3,
    propertyValue: 45e3,
    propertyCount: 9,
    position: 33,
    items: 4,
    rank: "宗師I"
  }],
  spectatorCount: 47,
  isRanked: true,
  isMentorRoom: true,
  mentorId: "mentor_2",
  mentorName: "導師·星塵",
  mentorTitle: "頂尖導師·王者級",
  turnCount: 42,
  currentTurnIndex: 2,
  startedAt: "2088-09-28T20:30:00Z"
}, {
  id: "room5",
  roomCode: "R6T7Y8",
  gameMode: "quick",
  modeLabel: "快速模式",
  players: [{
    id: "p11",
    name: "街頭藝人",
    color: PLAYER_COLORS[0],
    cash: 5200,
    propertyValue: 12e3,
    propertyCount: 3,
    position: 14,
    items: 1,
    rank: "黃金II"
  }, {
    id: "p12",
    name: "黑市商人",
    color: PLAYER_COLORS[1],
    cash: 6800,
    propertyValue: 9500,
    propertyCount: 2,
    position: 28,
    items: 2,
    rank: "白金III"
  }],
  spectatorCount: 3,
  isRanked: false,
  isMentorRoom: false,
  turnCount: 18,
  currentTurnIndex: 0,
  startedAt: "2088-09-28T22:20:00Z"
}];
function getSpectateRooms() {
  try {
    const raw = localStorage.getItem(SPECTATE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {
  }
  try {
    localStorage.setItem(SPECTATE_KEY, JSON.stringify(MOCK_ROOMS));
  } catch {
  }
  return MOCK_ROOMS;
}
function incrementSpectatorCount(roomId, delta) {
  const rooms = getSpectateRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    room.spectatorCount = Math.max(0, room.spectatorCount + delta);
    try {
      localStorage.setItem(SPECTATE_KEY, JSON.stringify(rooms));
    } catch {
    }
  }
}
const DEFAULT_TIPS_MAP = {
  room1: [{
    id: "tip1",
    mentorId: "mentor_1",
    mentorName: "導師·影子",
    content: "此時玩家1 應優先集資建房，金融街和中央塔相鄰有連動加成。",
    timestamp: "2088-09-28T22:10:00Z",
    type: "tip"
  }, {
    id: "tip2",
    mentorId: "mentor_1",
    mentorName: "導師·影子",
    content: "注意！玩家2 現金不足 10000，若走到玩家1 的地產可能直接破產。",
    timestamp: "2088-09-28T22:12:30Z",
    type: "warning"
  }, {
    id: "tip3",
    mentorId: "mentor_1",
    mentorName: "導師·影子",
    content: "命運區抽到傳送卡的概率是 1/6，兩人都在命運區附近要小心。",
    timestamp: "2088-09-28T22:15:00Z",
    type: "info"
  }],
  room4: [{
    id: "tip4",
    mentorId: "mentor_2",
    mentorName: "導師·星塵",
    content: "四人局優先搶佔稀有地產，總部和主塔是必爭之地。",
    timestamp: "2088-09-28T21:00:00Z",
    type: "tip"
  }, {
    id: "tip5",
    mentorId: "mentor_2",
    mentorName: "導師·星塵",
    content: "賽博帝王目前資產領先 20%，其他三人需聯合才能翻盤。",
    timestamp: "2088-09-28T21:30:00Z",
    type: "info"
  }]
};
function getMentorTips(roomId) {
  const key = `${MENTOR_TIPS_KEY}${roomId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
  }
  const def = DEFAULT_TIPS_MAP[roomId] || [];
  try {
    localStorage.setItem(key, JSON.stringify(def));
  } catch {
  }
  return def;
}
function getSpectateChatMessages(roomId) {
  const key = `${SPECTATE_CHAT_KEY}${roomId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
  }
  const defaultMsgs = [{
    id: "sc1",
    senderId: "viewer_1",
    senderName: "霓虹粉絲",
    content: "哇這局精彩！",
    timestamp: "2088-09-28T22:16:00Z"
  }, {
    id: "sc2",
    senderId: "viewer_2",
    senderName: "數據分析師",
    content: "玩家1 地產組合更合理，看好他贏",
    timestamp: "2088-09-28T22:17:20Z"
  }, {
    id: "sc3",
    senderId: "viewer_3",
    senderName: "路過的萌新",
    content: "請問導師 新手應該先買哪塊地？",
    timestamp: "2088-09-28T22:18:05Z"
  }];
  try {
    localStorage.setItem(key, JSON.stringify(defaultMsgs));
  } catch {
  }
  return defaultMsgs;
}
function sendSpectateChatMessage(roomId, senderId, senderName, content) {
  const key = `${SPECTATE_CHAT_KEY}${roomId}`;
  const msgs = getSpectateChatMessages(roomId);
  const newMsg = {
    id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    senderId,
    senderName,
    content,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  msgs.push(newMsg);
  try {
    localStorage.setItem(key, JSON.stringify(msgs));
  } catch {
  }
  return newMsg;
}
const SpectateViewPanel = ({
  open,
  onClose,
  room,
  currentViewerId,
  currentViewerName
}) => {
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [viewPlayerIndex, setViewPlayerIndex] = reactExports.useState(0);
  const [tips, setTips] = reactExports.useState([]);
  const [chatMessages, setChatMessages] = reactExports.useState([]);
  const [chatInput, setChatInput] = reactExports.useState("");
  const chatEndRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (open && room) {
      setTips(getMentorTips(room.id));
      setChatMessages(getSpectateChatMessages(room.id));
      setViewPlayerIndex(0);
      setActiveTab("overview");
    }
  }, [open, room?.id]);
  reactExports.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [chatMessages.length, activeTab]);
  const currentPlayer = reactExports.useMemo(() => room.players[viewPlayerIndex], [room, viewPlayerIndex]);
  const handlePrevPlayer = reactExports.useCallback(() => {
    setViewPlayerIndex((prev) => prev > 0 ? prev - 1 : room.players.length - 1);
  }, [room.players.length]);
  const handleNextPlayer = reactExports.useCallback(() => {
    setViewPlayerIndex((prev) => prev < room.players.length - 1 ? prev + 1 : 0);
  }, [room.players.length]);
  const handleSendChat = reactExports.useCallback(() => {
    if (!chatInput.trim()) return;
    const msg = sendSpectateChatMessage(room.id, currentViewerId, currentViewerName, chatInput.trim());
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
  }, [chatInput, room.id, currentViewerId, currentViewerName]);
  const handleCopyRoomCode = reactExports.useCallback(() => {
    navigator.clipboard?.writeText(room.roomCode).catch(() => {
    });
    toast.success("已複製房號");
  }, [room.roomCode]);
  if (!open) return null;
  const totalAssets = (p) => p.cash + p.propertyValue;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4", style: {
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(4px)"
  }, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-5xl max-h-[90vh] flex flex-col rounded-lg overflow-hidden", style: {
    background: "linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(20,10,40,0.98) 100%)",
    border: "1px solid var(--cyan)",
    boxShadow: "0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.05)"
  }, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b", style: {
      borderColor: "rgba(0,255,255,0.2)",
      background: "rgba(0, 255, 255, 0.05)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 20, style: {
        color: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold tracking-wider text-lg", style: {
            color: "var(--cyan)",
            textShadow: "0 0 10px var(--cyan)"
          }, children: [
            "觀戰中 · ",
            room.roomCode
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded font-bold", style: {
            background: "rgba(0, 255, 255, 0.1)",
            border: "1px solid var(--cyan)",
            color: "var(--cyan)"
          }, children: room.modeLabel }),
          room.isMentorRoom && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1", style: {
            background: "rgba(255, 0, 170, 0.15)",
            border: "1px solid var(--pink)",
            color: "var(--pink)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12 }),
            room.mentorName
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
          color: "var(--text-secondary)"
        }, children: [
          "第 ",
          room.turnCount,
          " 回合 · 當前回合：",
          room.players[room.currentTurnIndex]?.name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs px-2 py-1 rounded", style: {
          background: "rgba(0, 255, 128, 0.1)",
          border: "1px solid var(--green)",
          color: "var(--green)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12 }),
          room.spectatorCount,
          " 觀眾"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "cyber-btn p-1.5", style: {
          borderColor: "var(--red)",
          color: "var(--red)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 px-4 py-2 border-b", style: {
      borderColor: "rgba(255,255,255,0.08)"
    }, children: [{
      key: "overview",
      label: "實況總覽",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }),
      color: "var(--cyan)"
    }, {
      key: "tips",
      label: "導師提示",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 14 }),
      color: "var(--pink)"
    }, {
      key: "chat",
      label: "觀眾聊天",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14 }),
      color: "var(--green)"
    }].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "cyber-btn cyber-btn-sm px-3 py-1.5 text-xs flex items-center gap-1.5", style: {
      borderColor: activeTab === tab.key ? tab.color : "rgba(255,255,255,0.1)",
      color: activeTab === tab.key ? tab.color : "var(--text-secondary)",
      background: activeTab === tab.key ? `${tab.color}15` : "transparent"
    }, children: [
      tab.icon,
      tab.label
    ] }, tab.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4", children: [
      activeTab === "overview" && currentPlayer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: currentPlayer.color
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handlePrevPlayer, className: "cyber-btn p-1.5", style: {
              borderColor: "rgba(255,255,255,0.2)",
              color: "var(--text-secondary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex-1 px-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold", style: {
                  background: `${currentPlayer.color}20`,
                  border: `2px solid ${currentPlayer.color}`,
                  color: currentPlayer.color,
                  boxShadow: `0 0 15px ${currentPlayer.color}40`
                }, children: currentPlayer.name.slice(0, 1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold tracking-wide", style: {
                    color: currentPlayer.color,
                    textShadow: `0 0 8px ${currentPlayer.color}60`
                  }, children: currentPlayer.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
                    color: "var(--text-secondary)"
                  }, children: [
                    currentPlayer.rank,
                    " · 位置 #",
                    currentPlayer.position
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-2", style: {
                color: "var(--text-secondary)"
              }, children: [
                "視角 ",
                viewPlayerIndex + 1,
                " / ",
                room.players.length
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleNextPlayer, className: "cyber-btn p-1.5", style: {
              borderColor: "rgba(255,255,255,0.2)",
              color: "var(--text-secondary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-center", style: {
              background: "rgba(0,255,128,0.05)",
              border: "1px solid rgba(0,255,128,0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-xs mb-1", style: {
                color: "var(--green)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { size: 12 }),
                "現金"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold", style: {
                color: "var(--green)"
              }, children: [
                "$",
                currentPlayer.cash.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-center", style: {
              background: "rgba(0,200,255,0.05)",
              border: "1px solid rgba(0,200,255,0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-xs mb-1", style: {
                color: "var(--cyan)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 12 }),
                "地產總值"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold", style: {
                color: "var(--cyan)"
              }, children: [
                "$",
                currentPlayer.propertyValue.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-center", style: {
              background: "rgba(255,215,0,0.05)",
              border: "1px solid rgba(255,215,0,0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-xs mb-1", style: {
                color: "#ffd700"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 12 }),
                "地產數量"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", style: {
                color: "#ffd700"
              }, children: currentPlayer.propertyCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-center", style: {
              background: "rgba(168,85,247,0.05)",
              border: "1px solid rgba(168,85,247,0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 text-xs mb-1", style: {
                color: "var(--purple, #a855f7)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 12 }),
                "道具"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", style: {
                color: "var(--purple, #a855f7)"
              }, children: currentPlayer.items })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-white/10 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
              color: "var(--text-secondary)"
            }, children: "總資產：" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-bold ml-1", style: {
              color: currentPlayer.color,
              textShadow: `0 0 6px ${currentPlayer.color}60`
            }, children: [
              "$",
              totalAssets(currentPlayer).toLocaleString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold mb-3 flex items-center gap-2", style: {
            color: "var(--text-primary)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 16, style: {
              color: "#ffd700"
            } }),
            "資產排行"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [...room.players].sort((a, b) => totalAssets(b) - totalAssets(a)).map((p, idx) => {
            const pct = totalAssets(p) / totalAssets(room.players[0]) * 100;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", onClick: () => {
              const realIdx = room.players.findIndex((rp) => rp.id === p.id);
              if (realIdx >= 0) setViewPlayerIndex(realIdx);
            }, style: {
              cursor: "pointer"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-xs font-bold", style: {
                color: idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : idx === 2 ? "#cd7f32" : "var(--text-secondary)"
              }, children: idx + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", style: {
                background: `${p.color}20`,
                border: `1px solid ${p.color}`,
                color: p.color
              }, children: p.name.slice(0, 1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold truncate", style: {
                    color: p.color
                  }, children: p.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: [
                    "$",
                    totalAssets(p).toLocaleString()
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: {
                  background: "rgba(255,255,255,0.1)"
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
                  width: `${pct}%`,
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}`
                } }) })
              ] })
            ] }, p.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-2", style: {
            color: "var(--text-primary)"
          }, children: "房間資訊" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "房號：" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleCopyRoomCode, className: "font-bold hover:underline", style: {
                color: "var(--cyan)"
              }, children: room.roomCode })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "模式：" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-primary)"
              }, children: room.modeLabel })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "玩家數：" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-primary)"
              }, children: room.players.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "回數：" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-primary)"
              }, children: room.turnCount })
            ] })
          ] })
        ] })
      ] }),
      activeTab === "tips" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        !room.isMentorRoom && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded text-center", style: {
          background: "rgba(255, 215, 0, 0.05)",
          border: "1px solid rgba(255, 215, 0, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 24, style: {
            color: "#ffd700"
          }, className: "mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: {
            color: "#ffd700"
          }, children: "本局暫無導師觀戰" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", style: {
            color: "var(--text-secondary)"
          }, children: "選擇帶有「導師」標籤的房間即可觀看導師實時講解" })
        ] }),
        room.isMentorRoom && tips.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm py-8", style: {
          color: "var(--text-secondary)"
        }, children: "導師暫未發布提示" }),
        tips.map((tip) => {
          const icon = tip.type === "tip" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 16, style: {
            color: "var(--pink)"
          } }) : tip.type === "warning" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: {
            color: "#ffd700"
          } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, style: {
            color: "var(--cyan)"
          } });
          const borderColor = tip.type === "tip" ? "var(--pink)" : tip.type === "warning" ? "#ffd700" : "var(--cyan)";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3", style: {
            borderColor
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              icon,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold", style: {
                color: borderColor
              }, children: tip.mentorName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs", style: {
                color: "var(--text-secondary)"
              }, children: new Date(tip.timestamp).toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit"
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: {
              color: "var(--text-primary)"
            }, children: tip.content })
          ] }, tip.id);
        })
      ] }),
      activeTab === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full gap-2", style: {
        minHeight: "300px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-center", style: {
          color: "var(--text-secondary)"
        }, children: "觀眾聊天頻道 · 僅觀眾可見，不干擾遊戲玩家" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-2 pr-1", style: {
          maxHeight: "40vh"
        }, children: [
          chatMessages.map((msg) => {
            const isMine = msg.senderId === currentViewerId;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-2 ${isMine ? "flex-row-reverse" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold", style: {
                background: "rgba(0, 255, 255, 0.1)",
                border: "1px solid var(--cyan)",
                color: "var(--cyan)"
              }, children: msg.senderName.slice(0, 1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[75%] ${isMine ? "text-right" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mb-1", style: {
                  color: "var(--text-secondary)"
                }, children: msg.senderName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block px-3 py-1.5 rounded-lg text-sm", style: {
                  background: isMine ? "rgba(0, 255, 255, 0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isMine ? "var(--cyan)" : "rgba(255,255,255,0.1)"}`,
                  color: "var(--text-primary)"
                }, children: msg.content })
              ] })
            ] }, msg.id);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: chatEndRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleSendChat(), placeholder: "輸入訊息...", className: "flex-1 px-3 py-2 text-sm rounded-md outline-none", style: {
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--text-primary)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSendChat, className: "cyber-btn cyber-btn-sm px-4", style: {
            borderColor: "var(--green)",
            color: "var(--green)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 16 }) })
        ] })
      ] })
    ] })
  ] }) });
};
const SpectatePage = () => {
  const navigate = useNavigate();
  const {
    visitorId,
    nickname
  } = usePlayerIdentity();
  const [rooms, setRooms] = reactExports.useState([]);
  const [filter, setFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [selectedRoom, setSelectedRoom] = reactExports.useState(null);
  const [viewOpen, setViewOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setRooms(getSpectateRooms());
  }, []);
  const filteredRooms = reactExports.useMemo(() => {
    return rooms.filter((r) => {
      if (filter === "ranked" && !r.isRanked) return false;
      if (filter === "mentor" && !r.isMentorRoom) return false;
      if (filter === "classic" && r.gameMode !== "classic" && r.gameMode !== "quick" && r.gameMode !== "crazy") return false;
      if (filter === "tournament" && r.gameMode !== "tournament") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.roomCode.toLowerCase().includes(q) && !r.players.some((p) => p.name.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, filter, search]);
  const openRoomIdRef = reactExports.useRef(null);
  const handleEnterSpectate = reactExports.useCallback((room) => {
    incrementSpectatorCount(room.id, 1);
    openRoomIdRef.current = room.id;
    setRooms(getSpectateRooms());
    setSelectedRoom(room);
    setViewOpen(true);
    toast.success(`已進入觀戰：${room.roomCode}`);
  }, []);
  const handleCloseView = reactExports.useCallback(() => {
    if (selectedRoom) {
      incrementSpectatorCount(selectedRoom.id, -1);
      openRoomIdRef.current = null;
      setRooms(getSpectateRooms());
    }
    setViewOpen(false);
    setSelectedRoom(null);
  }, [selectedRoom]);
  reactExports.useEffect(() => {
    return () => {
      if (openRoomIdRef.current) {
        incrementSpectatorCount(openRoomIdRef.current, -1);
        openRoomIdRef.current = null;
      }
    };
  }, []);
  const filterOptions = [{
    key: "all",
    label: "全部",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }),
    color: "var(--cyan)"
  }, {
    key: "ranked",
    label: "排位賽",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 14 }),
    color: "#ffd700"
  }, {
    key: "mentor",
    label: "導師觀戰",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14 }),
    color: "var(--pink)"
  }, {
    key: "classic",
    label: "休閒模式",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14 }),
    color: "var(--green)"
  }, {
    key: "tournament",
    label: "錦標賽",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 14 }),
    color: "var(--purple, #a855f7)"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-5xl flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate("/social"), className: "cyber-btn p-2", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-bold tracking-wider", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px var(--cyan), 0 0 20px var(--cyan)"
      }, children: "觀戰大廳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card px-3 py-1.5 text-xs flex items-center gap-2", style: {
        borderColor: "var(--green)",
        color: "var(--green)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          rooms.reduce((sum, r) => sum + r.spectatorCount, 0),
          " 人在線觀戰"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-5xl cyber-card p-4 mb-4", style: {
      borderColor: "var(--border-neon)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3 md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 16, style: {
          color: "var(--text-secondary)"
        }, className: "mr-1 my-auto" }),
        filterOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setFilter(opt.key), className: "cyber-btn cyber-btn-sm px-3 py-1.5 text-xs flex items-center gap-1.5", style: {
          borderColor: filter === opt.key ? opt.color : "rgba(255,255,255,0.15)",
          color: filter === opt.key ? opt.color : "var(--text-secondary)",
          background: filter === opt.key ? `${opt.color}15` : "transparent",
          boxShadow: filter === opt.key ? `0 0 8px ${opt.color}40` : "none"
        }, children: [
          opt.icon,
          opt.label
        ] }, opt.key))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full md:w-64", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, style: {
          color: "var(--text-secondary)"
        }, className: "absolute left-3 top-1/2 -translate-y-1/2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "搜尋房號或玩家...", className: "w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none", style: {
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "var(--text-primary)"
        } })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      filteredRooms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full cyber-card p-10 text-center", style: {
        borderColor: "var(--border-neon)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 40, style: {
          color: "var(--text-secondary)"
        }, className: "mx-auto mb-3 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
          color: "var(--text-secondary)"
        }, children: "暫無符合條件的房間" })
      ] }),
      filteredRooms.map((room) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex flex-col gap-3 hover:scale-[1.01] transition-transform", style: {
        borderColor: room.isMentorRoom ? "var(--pink)" : "var(--border-neon)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold tracking-wider", style: {
                color: room.isMentorRoom ? "var(--pink)" : "var(--cyan)"
              }, children: room.roomCode }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded font-bold", style: {
                background: "rgba(0, 255, 255, 0.1)",
                border: "1px solid var(--cyan)",
                color: "var(--cyan)"
              }, children: room.modeLabel }),
              room.isRanked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded font-bold", style: {
                background: "rgba(255, 215, 0, 0.1)",
                border: "1px solid #ffd700",
                color: "#ffd700"
              }, children: "排位" }),
              room.isMentorRoom && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1", style: {
                background: "rgba(255, 0, 170, 0.1)",
                border: "1px solid var(--pink)",
                color: "var(--pink)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12 }),
                "導師"
              ] })
            ] }),
            room.isMentorRoom && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", style: {
              color: "var(--pink)"
            }, children: [
              "導師：",
              room.mentorName,
              " · ",
              room.mentorTitle
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold flex items-center gap-1", style: {
              color: "var(--green)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }),
              room.spectatorCount
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
              color: "var(--text-secondary)"
            }, children: "觀眾" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: room.players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2 py-1.5 rounded text-xs", style: {
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${p.color}40`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", style: {
            background: `${p.color}20`,
            color: p.color,
            border: `1px solid ${p.color}`
          }, children: p.name.slice(0, 1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", style: {
              color: p.color
            }, children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              color: "var(--text-secondary)"
            }, children: p.rank })
          ] })
        ] }, p.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs", style: {
            color: "var(--text-secondary)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
              "第 ",
              room.turnCount,
              " 回合"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12 }),
              room.players.length,
              " 人"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleEnterSpectate(room), className: "cyber-btn cyber-btn-sm px-4 py-1.5 text-xs flex items-center gap-1.5", style: {
            borderColor: "var(--green)",
            color: "var(--green)",
            background: "rgba(0, 255, 128, 0.1)"
          }, children: [
            "進入觀戰",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
          ] })
        ] })
      ] }, room.id))
    ] }),
    selectedRoom && /* @__PURE__ */ jsxRuntimeExports.jsx(SpectateViewPanel, { open: viewOpen, onClose: handleCloseView, room: selectedRoom, currentViewerId: visitorId || "local_viewer", currentViewerName: nickname || "旁觀者" })
  ] });
};
export {
  SpectatePage as default
};
