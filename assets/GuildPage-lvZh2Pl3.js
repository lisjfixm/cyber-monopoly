import { d as createLucideIcon, j as jsxRuntimeExports, cl as Cpu, by as Skull, be as Flame, Z as Zap, bH as Shield, t as Crown, u as useNavigate, a as usePlayerIdentity, r as reactExports, cm as getGuildMessages, bY as toast, cn as sendGuildMessage, co as STICKER_LIST, cp as addReport, aD as Plus, aL as Star, U as Users, aI as Trophy, X, cg as Megaphone, cq as MessageSquare, cr as Settings, br as Trash2, $ as TriangleAlert, cs as CyberSticker, e as Send, aJ as Coins, bf as Gift, at as Check, w as LogOut } from "./index-Clt-7orM.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { U as UserCheck } from "./user-check-CgBcnc0q.js";
const __iconNode$2 = [
  ["path", { d: "M13 5h8", key: "a7qcls" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 19h8", key: "c3s6r1" }],
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["rect", { x: "3", y: "4", width: "6", height: "6", rx: "1", key: "cif1o7" }]
];
const ListTodo = createLucideIcon("list-todo", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M13 21h8", key: "1jsn5i" }],
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const PenLine = createLucideIcon("pen-line", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
      key: "1dfntj"
    }
  ],
  ["path", { d: "M15 3v5a1 1 0 0 0 1 1h5", key: "6s6qgf" }],
  ["path", { d: "M8 13h.01", key: "1sbv64" }],
  ["path", { d: "M16 13h.01", key: "wip0gl" }],
  ["path", { d: "M10 16s.8 1 2 1c1.3 0 2-1 2-1", key: "1vvgv3" }]
];
const Sticker = createLucideIcon("sticker", __iconNode);
const STORAGE_KEY = "monopoly_guild_state";
const DEFAULT_RANKINGS = [{
  id: "r1",
  name: "泰坦財團",
  color: "#ffd700",
  badgeIcon: "crown",
  score: 98520,
  members: 18,
  level: 12
}, {
  id: "r2",
  name: "霓虹之夜",
  color: "#00ffff",
  badgeIcon: "bolt",
  score: 76430,
  members: 15,
  level: 9
}, {
  id: "r3",
  name: "賽博軍團",
  color: "#ff00ff",
  badgeIcon: "shield",
  score: 71200,
  members: 14,
  level: 9
}, {
  id: "r4",
  name: "幻影兵團",
  color: "#a855f7",
  badgeIcon: "skull",
  score: 52180,
  members: 11,
  level: 7
}, {
  id: "r5",
  name: "電流脈衝",
  color: "#00ff80",
  badgeIcon: "flame",
  score: 44890,
  members: 9,
  level: 6
}, {
  id: "r6",
  name: "赤焰先鋒",
  color: "#ff4444",
  badgeIcon: "flame",
  score: 38650,
  members: 8,
  level: 5
}, {
  id: "r7",
  name: "數碼幽靈",
  color: "#06b6d4",
  badgeIcon: "skull",
  score: 31240,
  members: 7,
  level: 5
}, {
  id: "r8",
  name: "量子浪潮",
  color: "#8b5cf6",
  badgeIcon: "chip",
  score: 27800,
  members: 6,
  level: 4
}];
function makeDefaultTasks() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return [{
    id: "t_daily_1",
    name: "每日集訓",
    description: "戰隊成員累計完成 10 局對戰",
    target: 10,
    progress: 4,
    reward: {
      coins: 500
    },
    claimed: false,
    daily: true,
    resetDate: today
  }, {
    id: "t_daily_2",
    name: "勝利之路",
    description: "累計獲得 5 次第一名",
    target: 5,
    progress: 2,
    reward: {
      coins: 1e3,
      item: "幸運卡"
    },
    claimed: false,
    daily: true,
    resetDate: today
  }, {
    id: "t_weekly_1",
    name: "稱霸賽季",
    description: "戰隊總積分達到 10000",
    target: 1e4,
    progress: 0,
    reward: {
      coins: 3e3,
      item: "黃金頭像框"
    },
    claimed: false,
    daily: false
  }];
}
function makeMockMembers(seed, count) {
  const names = ["霓虹死神", "電流公主", "影子跑者", "數據殭屍", "光纖貓", "鐵血副官", "機械先鋒", "電馭叛客", "量子駭客", "夜之城守", "虛擬幽靈", "暗夜行者", "黃金算盤", "地產大亨", "現金流水"];
  const statuses = ["online", "offline", "in_game", "away", "online", "offline", "online"];
  const roles = ["隊長", "副隊長", "成員", "成員", "成員"];
  const ranks = ["青銅", "白銀", "黃金", "鑽石", "宗師"];
  const members = [];
  for (let i = 0; i < count; i++) {
    const name = names[(i + seed.length) % names.length] + (i > 5 ? `${i}` : "");
    members.push({
      id: `${seed}_m${i}`,
      nickname: name,
      role: roles[i % roles.length],
      online: statuses[i % statuses.length] === "online" || statuses[i % statuses.length] === "in_game",
      onlineStatus: statuses[i % statuses.length],
      avatarSeed: `${seed}_avatar_${i}`,
      rank: ranks[i % ranks.length],
      contribution: Math.floor(Math.random() * 500) + 50,
      joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1e3).toISOString().split("T")[0]
    });
  }
  return members;
}
const DEFAULT_AVAILABLE_GUILDS = [{
  id: "guild_neon",
  name: "霓虹之夜",
  tag: "NEON",
  description: "城市燈火下的掠奪者，精通地產炒作。",
  color: "#00ffff",
  badgeIcon: "bolt",
  level: 7,
  score: 76430,
  createdAt: "2087-03-12",
  members: makeMockMembers("neon", 6),
  joinRequests: [],
  tasks: makeDefaultTasks(),
  announcement: "今晚 8 點公會戰，全員集合！"
}, {
  id: "guild_cyber",
  name: "賽博軍團",
  tag: "CYBR",
  description: "鋼鐵與代碼的結合，無人能擋的戰隊。",
  color: "#ff00ff",
  badgeIcon: "shield",
  level: 9,
  score: 71200,
  createdAt: "2086-11-05",
  members: makeMockMembers("cyber", 8),
  joinRequests: [],
  tasks: makeDefaultTasks()
}, {
  id: "guild_phantom",
  name: "幻影兵團",
  tag: "PHNT",
  description: "來去無蹤的神秘組織，專營暗網交易。",
  color: "#a855f7",
  badgeIcon: "skull",
  level: 5,
  score: 52180,
  createdAt: "2088-01-20",
  members: makeMockMembers("phantom", 5),
  joinRequests: [],
  tasks: makeDefaultTasks()
}, {
  id: "guild_titan",
  name: "泰坦財團",
  tag: "TITN",
  description: "掌控城市經濟的巨頭，金錢即力量。",
  color: "#ffd700",
  badgeIcon: "crown",
  level: 12,
  score: 98520,
  createdAt: "2085-06-18",
  members: makeMockMembers("titan", 10),
  joinRequests: [],
  tasks: makeDefaultTasks()
}];
function getDefaultState() {
  return {
    currentGuild: null,
    availableGuilds: [...DEFAULT_AVAILABLE_GUILDS],
    rankings: DEFAULT_RANKINGS
  };
}
function getGuildState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.availableGuilds)) {
        return parsed;
      }
    }
  } catch {
  }
  const defaultState = getDefaultState();
  saveGuildState(defaultState);
  return defaultState;
}
function saveGuildState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}
function createGuild(name, tag, description, color, badgeIcon, userId, nickname) {
  const state = getGuildState();
  const newGuild = {
    id: `guild_${Date.now()}`,
    name,
    tag: tag.toUpperCase(),
    description,
    color,
    badgeIcon,
    level: 1,
    score: 1e3,
    createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    members: [{
      id: userId,
      nickname,
      role: "隊長",
      online: true,
      onlineStatus: "online",
      avatarSeed: `${userId}_avatar`,
      rank: "新手",
      contribution: 0,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    }],
    joinRequests: [],
    tasks: makeDefaultTasks()
  };
  state.currentGuild = newGuild;
  state.availableGuilds = state.availableGuilds.filter((g) => g.id !== newGuild.id);
  saveGuildState(state);
  return newGuild;
}
function requestJoinGuild(guildId, userId, nickname, message) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId);
  if (!guild) return false;
  if (guild.joinRequests.some((r) => r.userId === userId)) return false;
  guild.joinRequests.push({
    id: `req_${Date.now()}`,
    userId,
    nickname,
    requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
    message
  });
  saveGuildState(state);
  return true;
}
function approveJoinRequest(guildId, requestId) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId);
  if (!guild) return false;
  const req = guild.joinRequests.find((r) => r.id === requestId);
  if (!req) return false;
  const newMember = {
    id: req.userId,
    nickname: req.nickname,
    role: "成員",
    online: true,
    onlineStatus: "online",
    avatarSeed: `${req.userId}_avatar`,
    rank: "新手",
    contribution: 0,
    joinedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  guild.members.push(newMember);
  guild.joinRequests = guild.joinRequests.filter((r) => r.id !== requestId);
  saveGuildState(state);
  return true;
}
function rejectJoinRequest(guildId, requestId) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId);
  if (!guild) return false;
  guild.joinRequests = guild.joinRequests.filter((r) => r.id !== requestId);
  saveGuildState(state);
  return true;
}
function kickMember(guildId, memberId) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId);
  if (!guild) return false;
  if (guild.members.length <= 1) return false;
  guild.members = guild.members.filter((m) => m.id !== memberId);
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return true;
}
function transferLeadership(guildId, fromId, toId) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId);
  if (!guild) return false;
  const fromMember = guild.members.find((m) => m.id === fromId);
  const toMember = guild.members.find((m) => m.id === toId);
  if (!fromMember || !toMember || fromMember.role !== "隊長") return false;
  fromMember.role = "成員";
  toMember.role = "隊長";
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return true;
}
function leaveGuild() {
  const state = getGuildState();
  state.currentGuild = null;
  saveGuildState(state);
}
function disbandGuild() {
  leaveGuild();
}
function claimTaskReward(guildId, taskId) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId) ?? state.currentGuild;
  if (!guild) return null;
  const task = guild.tasks.find((t) => t.id === taskId);
  if (!task || task.claimed || task.progress < task.target) return null;
  task.claimed = true;
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return task.reward;
}
function updateGuildAnnouncement(guildId, announcement) {
  const state = getGuildState();
  const guild = state.availableGuilds.find((g) => g.id === guildId) ?? state.currentGuild;
  if (!guild) return false;
  guild.announcement = announcement;
  if (state.currentGuild?.id === guildId) {
    state.currentGuild = guild;
  }
  saveGuildState(state);
  return true;
}
function getGuildRankings() {
  const state = getGuildState();
  return state.rankings;
}
const ICON_MAP = {
  crown: Crown,
  shield: Shield,
  bolt: Zap,
  flame: Flame,
  skull: Skull,
  chip: Cpu
};
const GuildBadge = ({
  icon,
  color,
  size = 40,
  className
}) => {
  const Icon = ICON_MAP[icon] ?? Shield;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center justify-center rounded-lg ${className ?? ""}`, style: {
    width: size,
    height: size,
    backgroundColor: `${color}15`,
    border: `2px solid ${color}`,
    boxShadow: `0 0 12px ${color}80, inset 0 0 8px ${color}40`
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: size * 0.55, style: {
    color,
    filter: `drop-shadow(0 0 4px ${color})`
  } }) });
};
const BADGE_ICONS = [{
  id: "crown",
  name: "王冠"
}, {
  id: "shield",
  name: "盾牌"
}, {
  id: "bolt",
  name: "閃電"
}, {
  id: "flame",
  name: "火焰"
}, {
  id: "skull",
  name: "骷髏"
}, {
  id: "chip",
  name: "晶片"
}];
const COLOR_OPTIONS = [{
  value: "#00ffff",
  label: "霓虹青"
}, {
  value: "#ff00ff",
  label: "霓虹粉"
}, {
  value: "#a855f7",
  label: "紫羅蘭"
}, {
  value: "#00ff80",
  label: "電子綠"
}, {
  value: "#ffd700",
  label: "黃金"
}, {
  value: "#ff4444",
  label: "赤焰紅"
}];
const REPORT_REASONS = ["騷擾或辱罵", "不當言論", "廣告或垃圾訊息", "詐騙或釣魚", "其他"];
function hashStringToColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
function getStatusInfo(status) {
  switch (status) {
    case "online":
      return {
        label: "線上",
        color: "var(--green)"
      };
    case "in_game":
      return {
        label: "遊戲中",
        color: "#ffd700"
      };
    case "away":
      return {
        label: "離開",
        color: "#ff9f43"
      };
    case "offline":
    default:
      return {
        label: "離線",
        color: "var(--text-secondary)"
      };
  }
}
function formatTime(iso) {
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}
function formatDate(iso) {
  try {
    return iso.split("T")[0];
  } catch {
    return iso;
  }
}
const GuildPage = () => {
  const navigate = useNavigate();
  const {
    visitorId,
    nickname
  } = usePlayerIdentity();
  const [guildState, setGuildState] = reactExports.useState({
    currentGuild: null,
    availableGuilds: [],
    rankings: []
  });
  const [exploreTab, setExploreTab] = reactExports.useState("join");
  const [guildTab, setGuildTab] = reactExports.useState("members");
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [formName, setFormName] = reactExports.useState("");
  const [formTag, setFormTag] = reactExports.useState("");
  const [formDesc, setFormDesc] = reactExports.useState("");
  const [formColor, setFormColor] = reactExports.useState("#00ffff");
  const [formBadge, setFormBadge] = reactExports.useState("shield");
  const [joinRequestGuild, setJoinRequestGuild] = reactExports.useState(null);
  const [joinMessage, setJoinMessage] = reactExports.useState("");
  const [chatMessages, setChatMessages] = reactExports.useState([]);
  const [chatInput, setChatInput] = reactExports.useState("");
  const [showStickerPicker, setShowStickerPicker] = reactExports.useState(false);
  const chatEndRef = reactExports.useRef(null);
  const [reportMsg, setReportMsg] = reactExports.useState(null);
  const [reportReason, setReportReason] = reactExports.useState("");
  const [memberToKick, setMemberToKick] = reactExports.useState(null);
  const [memberToTransfer, setMemberToTransfer] = reactExports.useState(null);
  const [showDisbandDialog, setShowDisbandDialog] = reactExports.useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = reactExports.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = reactExports.useState(false);
  const [announcementText, setAnnouncementText] = reactExports.useState("");
  reactExports.useEffect(() => {
    const state = getGuildState();
    if (state.rankings.length === 0) {
      state.rankings = getGuildRankings();
      saveGuildState(state);
    }
    setGuildState(state);
  }, []);
  reactExports.useEffect(() => {
    if (guildState.currentGuild && guildTab === "chat") {
      setChatMessages(getGuildMessages(guildState.currentGuild.id));
    }
  }, [guildState.currentGuild?.id, guildTab]);
  reactExports.useEffect(() => {
    if (guildState.currentGuild) {
      setAnnouncementText(guildState.currentGuild.announcement || "");
    }
  }, [guildState.currentGuild?.id, guildState.currentGuild?.announcement]);
  reactExports.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [chatMessages]);
  const refreshState = reactExports.useCallback(() => {
    const s = getGuildState();
    setGuildState(s);
    saveGuildState(s);
  }, []);
  const currentMember = guildState.currentGuild?.members.find((m) => m.id === visitorId);
  const isLeader = currentMember?.role === "隊長";
  const isOfficer = currentMember?.role === "隊長" || currentMember?.role === "副隊長";
  const handleCreate = reactExports.useCallback(() => {
    const name = formName.trim();
    const tag = formTag.trim().toUpperCase();
    if (!name) {
      toast.error("請輸入戰隊名稱");
      return;
    }
    if (name.length > 12) {
      toast.error("戰隊名稱不得超過 12 個字");
      return;
    }
    if (!tag) {
      toast.error("請輸入戰隊標籤");
      return;
    }
    if (tag.length > 5) {
      toast.error("標籤不得超過 5 個字元");
      return;
    }
    const newGuild = createGuild(name, tag, formDesc.trim(), formColor, formBadge, visitorId || "local_user", nickname || "匿名玩家");
    refreshState();
    setShowCreate(false);
    setFormName("");
    setFormTag("");
    setFormDesc("");
    setFormColor("#00ffff");
    setFormBadge("shield");
    toast.success(`戰隊「${newGuild.name}」已創建！`);
  }, [formName, formTag, formDesc, formColor, formBadge, visitorId, nickname, refreshState]);
  const handleRequestJoin = reactExports.useCallback(() => {
    if (!joinRequestGuild) return;
    const ok = requestJoinGuild(joinRequestGuild.id, visitorId || "local_user", nickname || "匿名玩家", joinMessage.trim() || void 0);
    if (ok) {
      toast.success("申請已發送，等待隊長審批");
      setJoinRequestGuild(null);
      setJoinMessage("");
    } else {
      toast.error("申請失敗，可能已在審批中");
    }
  }, [joinRequestGuild, visitorId, nickname, joinMessage]);
  const handleApprove = reactExports.useCallback((req) => {
    if (!guildState.currentGuild) return;
    const ok = approveJoinRequest(guildState.currentGuild.id, req.id);
    if (ok) {
      refreshState();
      toast.success(`已通過 ${req.nickname} 的申請`);
    }
  }, [guildState.currentGuild, refreshState]);
  const handleReject = reactExports.useCallback((req) => {
    if (!guildState.currentGuild) return;
    const ok = rejectJoinRequest(guildState.currentGuild.id, req.id);
    if (ok) {
      refreshState();
      toast.info(`已拒絕 ${req.nickname} 的申請`);
    }
  }, [guildState.currentGuild, refreshState]);
  const handleKick = reactExports.useCallback(() => {
    if (!guildState.currentGuild || !memberToKick) return;
    const ok = kickMember(guildState.currentGuild.id, memberToKick.id);
    if (ok) {
      refreshState();
      toast.info(`已將 ${memberToKick.nickname} 移出戰隊`);
      setMemberToKick(null);
    }
  }, [guildState.currentGuild, memberToKick, refreshState]);
  const handleTransfer = reactExports.useCallback(() => {
    if (!guildState.currentGuild || !memberToTransfer || !currentMember) return;
    const ok = transferLeadership(guildState.currentGuild.id, currentMember.id, memberToTransfer.id);
    if (ok) {
      refreshState();
      toast.success(`已轉讓隊長給 ${memberToTransfer.nickname}`);
      setMemberToTransfer(null);
    }
  }, [guildState.currentGuild, memberToTransfer, currentMember, refreshState]);
  const handleLeave = reactExports.useCallback(() => {
    if (!guildState.currentGuild) return;
    const name = guildState.currentGuild.name;
    leaveGuild();
    refreshState();
    setShowLeaveDialog(false);
    toast.info(`已退出戰隊「${name}」`);
  }, [guildState.currentGuild, refreshState]);
  const handleDisband = reactExports.useCallback(() => {
    if (!guildState.currentGuild) return;
    const name = guildState.currentGuild.name;
    disbandGuild();
    refreshState();
    setShowDisbandDialog(false);
    toast.info(`戰隊「${name}」已解散`);
  }, [guildState.currentGuild, refreshState]);
  const handleClaim = reactExports.useCallback((task) => {
    if (!guildState.currentGuild) return;
    const reward = claimTaskReward(guildState.currentGuild.id, task.id);
    if (reward) {
      refreshState();
      const rewardText = reward.item ? `${reward.coins} 金幣 + ${reward.item}` : `${reward.coins} 金幣`;
      toast.success(`獎勵已領取：${rewardText}`);
    } else {
      toast.error("領取失敗");
    }
  }, [guildState.currentGuild, refreshState]);
  const startEditAnnouncement = reactExports.useCallback(() => {
    if (!guildState.currentGuild) return;
    setAnnouncementText(guildState.currentGuild.announcement || "");
    setEditingAnnouncement(true);
  }, [guildState.currentGuild]);
  const saveAnnouncement = reactExports.useCallback(() => {
    if (!guildState.currentGuild) return;
    const ok = updateGuildAnnouncement(guildState.currentGuild.id, announcementText.trim());
    if (ok) {
      refreshState();
      setEditingAnnouncement(false);
      toast.success("公告已更新");
    }
  }, [guildState.currentGuild, announcementText, refreshState]);
  const handleSendMessage = reactExports.useCallback(() => {
    if (!guildState.currentGuild) return;
    const text = chatInput.trim();
    if (!text) return;
    const newMsg = sendGuildMessage(guildState.currentGuild.id, {
      senderId: visitorId || "local_user",
      senderName: nickname || "匿名玩家",
      senderGuildTag: guildState.currentGuild.tag,
      content: text,
      type: "text"
    });
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  }, [guildState.currentGuild, visitorId, nickname, chatInput]);
  const handleSendSticker = reactExports.useCallback((stickerId) => {
    if (!guildState.currentGuild) return;
    const stickerInfo = STICKER_LIST.find((s) => s.id === stickerId);
    const newMsg = sendGuildMessage(guildState.currentGuild.id, {
      senderId: visitorId || "local_user",
      senderName: nickname || "匿名玩家",
      senderGuildTag: guildState.currentGuild.tag,
      content: stickerInfo?.name || "",
      type: "sticker",
      stickerId
    });
    setChatMessages((prev) => [...prev, newMsg]);
    setShowStickerPicker(false);
  }, [guildState.currentGuild, visitorId, nickname]);
  const handleReport = reactExports.useCallback(() => {
    if (!reportMsg || !reportReason) return;
    addReport({
      targetUserId: reportMsg.senderId,
      targetUserName: reportMsg.senderName,
      reason: reportReason,
      messageContent: reportMsg.content
    });
    toast.success("檢舉已提交，管理員將儘快處理");
    setReportMsg(null);
    setReportReason("");
  }, [reportMsg, reportReason]);
  const guild = guildState.currentGuild;
  if (!guild) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center px-4 py-6 scanlines", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate(-1), className: "cyber-btn p-2", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-cyber text-2xl md:text-3xl font-bold tracking-wider flex-1 flex items-center gap-2", style: {
          color: "var(--cyan)",
          textShadow: "0 0 10px var(--cyan), 0 0 20px var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 28 }),
          "戰隊中心"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowCreate(true), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
          borderColor: "var(--green)",
          color: "var(--green)",
          background: "rgba(0,255,128,0.1)",
          boxShadow: "0 0 10px rgba(0,255,128,0.25)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          "創建戰隊"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl flex gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setExploreTab("join"), className: `flex-1 py-2 text-sm font-cyber tracking-wider rounded-t border-b-2 transition-all ${exploreTab === "join" ? "" : "opacity-60"}`, style: {
          borderColor: exploreTab === "join" ? "var(--cyan)" : "transparent",
          color: exploreTab === "join" ? "var(--cyan)" : "var(--text-secondary)",
          textShadow: exploreTab === "join" ? "0 0 8px var(--cyan)" : "none"
        }, children: "可加入戰隊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setExploreTab("ranking"), className: `flex-1 py-2 text-sm font-cyber tracking-wider rounded-t border-b-2 transition-all ${exploreTab === "ranking" ? "" : "opacity-60"}`, style: {
          borderColor: exploreTab === "ranking" ? "#ffd700" : "transparent",
          color: exploreTab === "ranking" ? "#ffd700" : "var(--text-secondary)",
          textShadow: exploreTab === "ranking" ? "0 0 8px #ffd700" : "none"
        }, children: "戰隊排行榜" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl space-y-3", children: [
        exploreTab === "join" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          guildState.availableGuilds.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex items-center gap-4", style: {
            borderColor: `${g.color}60`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GuildBadge, { icon: g.badgeIcon, color: g.color, size: 56 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber font-bold text-base truncate", style: {
                  color: g.color,
                  textShadow: `0 0 6px ${g.color}80`
                }, children: g.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-1.5 py-0.5 rounded font-mono", style: {
                  backgroundColor: `${g.color}22`,
                  color: g.color
                }, children: [
                  "[",
                  g.tag,
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mt-1 truncate", children: g.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 10, style: {
                    color: g.color
                  } }),
                  "Lv.",
                  g.level
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 10 }),
                  g.members.length,
                  " 人"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10, style: {
                    color: "#ffd700"
                  } }),
                  g.score.toLocaleString()
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setJoinRequestGuild(g), className: "cyber-btn px-3 py-2 text-sm shrink-0", style: {
              borderColor: g.color,
              color: g.color,
              background: `${g.color}15`
            }, children: "申請加入" })
          ] }, g.id)),
          guildState.availableGuilds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-8 text-center text-[var(--text-secondary)]", children: "暫無可加入的戰隊" })
        ] }),
        exploreTab === "ranking" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "#ffd70060"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 20, style: {
              color: "#ffd700"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", style: {
              color: "#ffd700",
              textShadow: "0 0 8px #ffd70080"
            }, children: "戰隊積分榜" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: guildState.rankings.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2 rounded bg-[var(--bg-mid)]/50 border border-[var(--border-neon)]/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center font-cyber font-bold text-lg", style: {
              color: idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : idx === 2 ? "#cd7f32" : "var(--text-secondary)",
              textShadow: idx < 3 ? `0 0 6px ${idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : "#cd7f32"}` : "none"
            }, children: idx + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(GuildBadge, { icon: r.badgeIcon, color: r.color, size: 36 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm truncate block", style: {
                color: r.color
              }, children: r.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)]", children: [
                "Lv.",
                r.level,
                " · ",
                r.members,
                " 人"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-cyber", style: {
              color: "#ffd700"
            }, children: r.score.toLocaleString() })
          ] }, r.id)) })
        ] })
      ] }),
      showCreate && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-md p-6 relative", style: {
        borderColor: "var(--green)",
        boxShadow: "0 0 30px rgba(0,255,128,0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowCreate(false), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-cyber text-xl tracking-wider mb-5 flex items-center gap-2", style: {
          color: "var(--green)",
          textShadow: "0 0 8px var(--green)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 22 }),
          "創建戰隊"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-1", children: "戰隊名稱" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: formName, onChange: (e) => setFormName(e.target.value), maxLength: 12, placeholder: "最多 12 字", className: "w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-1", children: "戰隊標籤 (TAG)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: formTag, onChange: (e) => setFormTag(e.target.value.toUpperCase()), maxLength: 5, placeholder: "最多 5 字元，如 NEON", className: "w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)] font-mono uppercase" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-1", children: "戰隊簡介" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: formDesc, onChange: (e) => setFormDesc(e.target.value), maxLength: 50, rows: 2, placeholder: "一句話描述你的戰隊（最多 50 字）", className: "w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)] resize-none" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-2", children: "標誌顏色" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: COLOR_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFormColor(c.value), className: `w-10 h-10 rounded-full border-2 transition-all ${formColor === c.value ? "scale-110" : ""}`, style: {
              backgroundColor: c.value,
              borderColor: formColor === c.value ? "#fff" : "transparent",
              boxShadow: formColor === c.value ? `0 0 15px ${c.value}` : "none"
            }, title: c.label }, c.value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-2", children: "徽章圖標" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: BADGE_ICONS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFormBadge(b.id), className: `p-2 rounded-lg border-2 transition-all ${formBadge === b.id ? "scale-105" : ""}`, style: {
              backgroundColor: `${formColor}15`,
              borderColor: formBadge === b.id ? formColor : "transparent",
              boxShadow: formBadge === b.id ? `0 0 10px ${formColor}80` : "none"
            }, title: b.name, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GuildBadge, { icon: b.id, color: formColor, size: 32 }) }, b.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleCreate, className: "cyber-btn w-full py-3 font-cyber tracking-wider mt-2", style: {
            borderColor: "var(--green)",
            color: "var(--green)",
            background: "rgba(0,255,128,0.12)",
            boxShadow: "0 0 15px rgba(0,255,128,0.3)"
          }, children: "確認創建" })
        ] })
      ] }) }),
      joinRequestGuild && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-md p-6 relative", style: {
        borderColor: joinRequestGuild.color,
        boxShadow: `0 0 30px ${joinRequestGuild.color}40`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setJoinRequestGuild(null), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GuildBadge, { icon: joinRequestGuild.badgeIcon, color: joinRequestGuild.color, size: 48 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-cyber text-lg tracking-wider", style: {
              color: joinRequestGuild.color,
              textShadow: `0 0 8px ${joinRequestGuild.color}`
            }, children: [
              "申請加入 ",
              joinRequestGuild.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--text-secondary)]", children: [
              "[",
              joinRequestGuild.tag,
              "] Lv.",
              joinRequestGuild.level
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-1", children: "申請留言（選填）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: joinMessage, onChange: (e) => setJoinMessage(e.target.value), maxLength: 50, rows: 3, placeholder: "介紹一下自己吧...", className: "w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan)] resize-none" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleRequestJoin, className: "cyber-btn w-full py-3 font-cyber tracking-wider", style: {
            borderColor: joinRequestGuild.color,
            color: joinRequestGuild.color,
            background: `${joinRequestGuild.color}15`,
            boxShadow: `0 0 15px ${joinRequestGuild.color}40`
          }, children: "發送申請" })
        ] })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center px-4 py-6 scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate(-1), className: "cyber-btn p-2", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-cyber text-2xl md:text-3xl font-bold tracking-wider flex-1 flex items-center gap-2", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px var(--cyan), 0 0 20px var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 28 }),
        "戰隊中心"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-2xl mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 relative overflow-hidden", style: {
      borderColor: guild.color,
      boxShadow: `0 0 20px ${guild.color}40`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-48 h-48 opacity-10 blur-3xl rounded-full", style: {
        backgroundColor: guild.color
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GuildBadge, { icon: guild.badgeIcon, color: guild.color, size: 64 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl md:text-2xl font-bold tracking-wider", style: {
              color: guild.color,
              textShadow: `0 0 10px ${guild.color}`
            }, children: guild.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded font-mono tracking-wider", style: {
              backgroundColor: `${guild.color}22`,
              color: guild.color,
              border: `1px solid ${guild.color}60`
            }, children: [
              "[",
              guild.tag,
              "]"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded font-cyber tracking-wider", style: {
              backgroundColor: `${guild.color}22`,
              color: guild.color,
              border: `1px solid ${guild.color}60`
            }, children: [
              "Lv.",
              guild.level
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12 }),
              guild.members.length,
              " 位成員"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, style: {
                color: "#ffd700"
              } }),
              guild.score.toLocaleString(),
              " 積分"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-4 pt-4 border-t border-[var(--border-neon)]/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { size: 14, style: {
          color: guild.color
        }, className: "shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: editingAnnouncement && isLeader ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: announcementText, onChange: (e) => setAnnouncementText(e.target.value), maxLength: 100, rows: 2, placeholder: "輸入公告內容...", className: "w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--cyan)] resize-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setEditingAnnouncement(false), className: "px-3 py-1 text-xs text-[var(--text-secondary)] border border-[var(--border-neon)] rounded hover:text-[var(--text-primary)]", children: "取消" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: saveAnnouncement, className: "px-3 py-1 text-xs rounded", style: {
              border: `1px solid ${guild.color}`,
              color: guild.color,
              backgroundColor: `${guild.color}15`
            }, children: "保存" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-primary)]", children: guild.announcement || "暫無公告" }),
          isLeader && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: startEditAnnouncement, className: "text-[var(--text-secondary)] hover:text-[var(--cyan)] shrink-0", title: "編輯公告", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 14 }) })
        ] }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-2xl flex gap-1 mb-4 overflow-x-auto pb-1", children: [{
      key: "members",
      label: "成員",
      icon: Users,
      color: "var(--cyan)"
    }, {
      key: "chat",
      label: "聊天",
      icon: MessageSquare,
      color: "var(--pink)"
    }, {
      key: "tasks",
      label: "任務",
      icon: ListTodo,
      color: "var(--green)"
    }, ...isOfficer ? [{
      key: "approval",
      label: "審批",
      icon: UserCheck,
      color: "#ffd700"
    }] : [], ...isLeader ? [{
      key: "manage",
      label: "管理",
      icon: Settings,
      color: "var(--red)"
    }] : []].map((tab) => {
      const Icon = tab.icon;
      const active = guildTab === tab.key;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setGuildTab(tab.key), className: `flex items-center gap-1.5 px-3 py-2 text-sm font-cyber tracking-wider rounded-t border-b-2 transition-all whitespace-nowrap ${active ? "" : "opacity-60"}`, style: {
        borderColor: active ? tab.color : "transparent",
        color: active ? tab.color : "var(--text-secondary)",
        textShadow: active ? `0 0 6px ${tab.color}` : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14 }),
        tab.label,
        tab.key === "approval" && guild.joinRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full", style: {
          backgroundColor: "#ffd700",
          color: "#000"
        }, children: guild.joinRequests.length })
      ] }, tab.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl", children: [
      guildTab === "members" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: guild.members.map((member) => {
        const status = getStatusInfo(member.onlineStatus);
        const avatarColor = hashStringToColor(member.avatarSeed || member.id);
        const initial = member.nickname.charAt(0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3", style: {
          borderColor: "var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", style: {
              background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)`,
              boxShadow: `0 0 8px ${avatarColor}60`,
              color: "#fff"
            }, children: initial }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-dark)]", style: {
              backgroundColor: status.color
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-[var(--text-primary)] font-medium truncate", children: member.nickname }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider", style: {
                backgroundColor: member.role === "隊長" ? "rgba(255,215,0,0.15)" : member.role === "副隊長" ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.05)",
                color: member.role === "隊長" ? "#ffd700" : member.role === "副隊長" ? "var(--cyan)" : "var(--text-secondary)",
                border: `1px solid ${member.role === "隊長" ? "#ffd70060" : member.role === "副隊長" ? "var(--cyan)60" : "transparent"}`
              }, children: [
                member.role === "隊長" && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 10, className: "inline mr-0.5" }),
                member.role === "副隊長" && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 10, className: "inline mr-0.5" }),
                member.role
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: status.color
              }, children: [
                "● ",
                status.label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "段位：",
                member.rank || "—"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "貢獻：",
                member.contribution ?? 0
              ] })
            ] })
          ] }),
          isLeader && member.id !== visitorId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMemberToTransfer(member), className: "p-1.5 rounded hover:bg-[var(--bg-mid)]", style: {
              color: "#ffd700"
            }, title: "轉讓隊長", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMemberToKick(member), className: "p-1.5 rounded hover:bg-[var(--bg-mid)]", style: {
              color: "var(--red)"
            }, title: "踢出戰隊", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }, member.id);
      }) }),
      guildTab === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card flex flex-col", style: {
        borderColor: "var(--pink)80",
        height: "60vh",
        minHeight: 400
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-3 space-y-3", children: [
          chatMessages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[var(--text-secondary)] text-sm py-8", children: "還沒有訊息，快說點什麼吧！" }),
          chatMessages.map((msg) => {
            const isSelf = msg.senderId === visitorId;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex gap-2 ${isSelf ? "flex-row-reverse" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex-1 min-w-0 ${isSelf ? "text-right" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-[var(--text-secondary)]", children: [
                !isSelf && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: msg.senderName }),
                msg.senderGuildTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono opacity-70", children: [
                  "[",
                  msg.senderGuildTag,
                  "]"
                ] }),
                isSelf && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: msg.senderName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: formatTime(msg.timestamp) }),
                !isSelf && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setReportMsg(msg);
                  setReportReason("");
                }, className: "opacity-50 hover:opacity-100 hover:text-[var(--red)]", title: "舉報", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 12 }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `inline-block mt-1 px-3 py-2 rounded-lg text-sm max-w-[80%] text-left ${isSelf ? "" : ""}`, style: {
                backgroundColor: isSelf ? "rgba(255,0,255,0.12)" : "rgba(0,255,255,0.08)",
                border: `1px solid ${isSelf ? "rgba(255,0,255,0.4)" : "rgba(0,255,255,0.3)"}`,
                color: "var(--text-primary)"
              }, children: msg.type === "sticker" && msg.stickerId ? /* @__PURE__ */ jsxRuntimeExports.jsx(CyberSticker, { id: msg.stickerId, size: 72 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap break-words", children: msg.content }) })
            ] }) }, msg.id);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: chatEndRef })
        ] }),
        showStickerPicker && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-[var(--border-neon)]/30 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)]", children: "選擇貼圖" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowStickerPicker(false), className: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-2", children: STICKER_LIST.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleSendSticker(s.id), className: "p-2 rounded hover:bg-[var(--bg-mid)] flex items-center justify-center transition-colors", title: s.name, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CyberSticker, { id: s.id, size: 36 }) }, s.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-[var(--border-neon)]/30 p-2 flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowStickerPicker((p) => !p), className: "p-2 rounded cyber-btn shrink-0", style: {
            borderColor: "var(--pink)",
            color: "var(--pink)",
            background: "rgba(255,0,255,0.08)"
          }, title: "貼圖", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sticker, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }, placeholder: "輸入訊息...", className: "flex-1 px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--pink)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSendMessage, disabled: !chatInput.trim(), className: "cyber-btn p-2 shrink-0", style: {
            borderColor: "var(--pink)",
            color: "var(--pink)",
            background: "rgba(255,0,255,0.1)",
            opacity: chatInput.trim() ? 1 : 0.4
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 18 }) })
        ] })
      ] }),
      guildTab === "tasks" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: guild.tasks.map((task) => {
        const progress = task.target > 0 ? Math.min(100, task.progress / task.target * 100) : 0;
        const completed = task.progress >= task.target;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: completed && !task.claimed ? "var(--green)" : "var(--border-neon)",
          boxShadow: completed && !task.claimed ? "0 0 15px rgba(0,255,128,0.3)" : void 0
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider text-[var(--text-primary)]", children: task.name }),
                task.daily && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded", style: {
                  backgroundColor: "rgba(0,255,255,0.12)",
                  color: "var(--cyan)",
                  border: "1px solid var(--border-neon)"
                }, children: "每日" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mt-1", children: task.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-[var(--text-primary)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 14, style: {
                  color: "#ffd700"
                } }),
                task.reward.coins
              ] }),
              task.reward.item && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] flex items-center gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 12 }),
                task.reward.item
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "進度" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                task.progress,
                " / ",
                task.target
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full overflow-hidden", style: {
              backgroundColor: "var(--bg-mid)",
              border: "1px solid var(--border-neon)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
              width: `${progress}%`,
              background: completed ? "linear-gradient(90deg, var(--green), #00ff80)" : `linear-gradient(90deg, var(--cyan), var(--pink))`,
              boxShadow: completed ? "0 0 8px var(--green)" : "0 0 8px var(--cyan)"
            } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleClaim(task), disabled: !completed || task.claimed, className: "cyber-btn px-4 py-1.5 text-sm font-cyber tracking-wider", style: {
            borderColor: task.claimed ? "var(--text-secondary)" : completed ? "var(--green)" : "var(--text-secondary)",
            color: task.claimed ? "var(--text-secondary)" : completed ? "var(--green)" : "var(--text-secondary)",
            background: completed && !task.claimed ? "rgba(0,255,128,0.12)" : "transparent",
            boxShadow: completed && !task.claimed ? "0 0 10px rgba(0,255,128,0.3)" : "none",
            opacity: !completed || task.claimed ? 0.6 : 1
          }, children: task.claimed ? "已領取" : completed ? "領取獎勵" : "未達成" }) })
        ] }, task.id);
      }) }),
      guildTab === "approval" && isOfficer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        guild.joinRequests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-8 text-center text-[var(--text-secondary)]", children: "暫無待審批的申請" }),
        guild.joinRequests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "#ffd70060"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm", style: {
                background: `linear-gradient(135deg, ${hashStringToColor(req.userId)}, ${hashStringToColor(req.userId)}88)`,
                color: "#fff"
              }, children: req.nickname.charAt(0) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-[var(--text-primary)] font-medium", children: req.nickname }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--text-secondary)]", children: [
                  "申請時間：",
                  formatDate(req.requestedAt)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleReject(req), className: "cyber-btn p-2", style: {
                borderColor: "var(--red)",
                color: "var(--red)",
                background: "rgba(255,68,68,0.1)"
              }, title: "拒絕", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleApprove(req), className: "cyber-btn p-2", style: {
                borderColor: "var(--green)",
                color: "var(--green)",
                background: "rgba(0,255,128,0.1)"
              }, title: "通過", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) })
            ] })
          ] }),
          req.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] pl-11", children: [
            "留言：",
            req.message
          ] })
        ] }, req.id))
      ] }),
      guildTab === "manage" && isLeader && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "var(--cyan)60"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-sm tracking-wider text-[var(--cyan)] mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { size: 16 }),
            "編輯公告"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: announcementText, onChange: (e) => setAnnouncementText(e.target.value), maxLength: 100, rows: 3, placeholder: "輸入公告內容（最多 100 字）", className: "w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--cyan)] resize-none mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: saveAnnouncement, className: "cyber-btn px-4 py-1.5 text-sm font-cyber tracking-wider", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)",
            background: "rgba(0,255,255,0.1)"
          }, children: "保存公告" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "var(--red)60"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-sm tracking-wider text-[var(--red)] mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }),
            "解散戰隊"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mb-3", children: "解散後所有成員將被移除，資料無法恢復。" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowDisbandDialog(true), className: "cyber-btn w-full py-2 text-sm font-cyber tracking-wider", style: {
            borderColor: "var(--red)",
            color: "var(--red)",
            background: "rgba(255,68,68,0.08)",
            boxShadow: "0 0 10px rgba(255,68,68,0.2)"
          }, children: "解散戰隊" })
        ] })
      ] }),
      !isLeader && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowLeaveDialog(true), className: "cyber-btn w-full py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
        borderColor: "var(--text-secondary)",
        color: "var(--text-secondary)",
        background: "rgba(255,255,255,0.04)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 16 }),
        "退出戰隊"
      ] }) })
    ] }),
    reportMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5 relative", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 20px rgba(255,68,68,0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setReportMsg(null), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-base tracking-wider text-[var(--red)] mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
        "舉報訊息"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[var(--bg-mid)] p-3 rounded border border-[var(--border-neon)] mb-4 text-sm text-[var(--text-primary)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] mb-1", children: [
          reportMsg.senderName,
          " 的訊息："
        ] }),
        reportMsg.type === "sticker" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
          "【貼圖】",
          reportMsg.content
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-words", children: reportMsg.content })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] mb-1", children: "請選擇原因" }),
        REPORT_REASONS.map((reason) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setReportReason(reason), className: `w-full text-left px-3 py-2 rounded text-sm border transition-all ${reportReason === reason ? "" : "border-[var(--border-neon)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`, style: reportReason === reason ? {
          borderColor: "var(--red)",
          color: "var(--red)",
          backgroundColor: "rgba(255,68,68,0.1)"
        } : {}, children: reason }, reason))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleReport, disabled: !reportReason, className: "cyber-btn w-full py-2 text-sm font-cyber tracking-wider", style: {
        borderColor: "var(--red)",
        color: "var(--red)",
        background: "rgba(255,68,68,0.1)",
        opacity: reportReason ? 1 : 0.5
      }, children: "提交舉報" })
    ] }) }),
    memberToKick && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5 relative", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 20px rgba(255,68,68,0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMemberToKick(null), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-base tracking-wider text-[var(--red)] mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 18 }),
        "確認踢出"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[var(--text-primary)] mb-4", children: [
        "確定要將 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: memberToKick.nickname }),
        " 移出戰隊嗎？"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMemberToKick(null), className: "flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleKick, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          background: "rgba(255,68,68,0.1)"
        }, children: "確認踢出" })
      ] })
    ] }) }),
    memberToTransfer && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5 relative", style: {
      borderColor: "#ffd700",
      boxShadow: "0 0 20px rgba(255,215,0,0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMemberToTransfer(null), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-base tracking-wider mb-3 flex items-center gap-2", style: {
        color: "#ffd700"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 18 }),
        "轉讓隊長"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[var(--text-primary)] mb-4", children: [
        "確定要將隊長職位轉讓給 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: memberToTransfer.nickname }),
        " 嗎？",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)]", children: "轉讓後你將變為普通成員，此操作無法撤銷。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMemberToTransfer(null), className: "flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleTransfer, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "#ffd700",
          color: "#ffd700",
          background: "rgba(255,215,0,0.1)"
        }, children: "確認轉讓" })
      ] })
    ] }) }),
    showDisbandDialog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5 relative", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 25px rgba(255,68,68,0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowDisbandDialog(false), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-base tracking-wider text-[var(--red)] mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
        "解散戰隊"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[var(--text-primary)] mb-4", children: [
        "確定要解散 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: guild.name }),
        " 嗎？",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)]", children: "所有成員將被移除，資料將被清除，此操作無法撤銷。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowDisbandDialog(false), className: "flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleDisband, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          background: "rgba(255,68,68,0.15)",
          boxShadow: "0 0 10px rgba(255,68,68,0.3)"
        }, children: "確認解散" })
      ] })
    ] }) }),
    showLeaveDialog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5 relative", style: {
      borderColor: "var(--text-secondary)",
      boxShadow: "0 0 20px rgba(255,255,255,0.1)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowLeaveDialog(false), className: "absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-base tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 }),
        "退出戰隊"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[var(--text-primary)] mb-4", children: [
        "確定要退出 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: guild.name }),
        " 嗎？"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowLeaveDialog(false), className: "flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleLeave, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)",
          background: "rgba(255,255,255,0.05)"
        }, children: "確認退出" })
      ] })
    ] }) })
  ] });
};
export {
  GuildPage as default
};
