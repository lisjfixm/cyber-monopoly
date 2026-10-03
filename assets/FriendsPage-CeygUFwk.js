import { r as reactExports, j as jsxRuntimeExports, S as Swords, aI as Trophy, aB as Clock, u as useNavigate, bY as toast, bp as Search, aW as LoaderCircle, U as Users, X, Z as Zap, aL as Star, t as Crown, M as MessageCircle, g as CircleAlert } from "./index-ymfxQ6bv.js";
import { P as PullToRefresh } from "./PullToRefresh-akScp87q.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { U as UserPlus } from "./user-plus-D2AL3YZ6.js";
import { A as Activity } from "./activity-B7HNLSJK.js";
import { U as UserCheck } from "./user-check-YtSSjBii.js";
import { U as UserX } from "./user-x-5nUNi9e4.js";
const FRIENDS_KEY = "monopoly_friends_list";
const REQUESTS_KEY = "monopoly_friends_requests";
const RECENT_KEY = "monopoly_friends_recent";
const ACTIVITY_KEY = "monopoly_friends_activity";
function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
const DEFAULT_FRIENDS = [{
  userId: "f1",
  nickname: "霓虹夜行者",
  avatarSeed: "f1_avatar",
  status: "accepted",
  onlineStatus: "online",
  currentMode: "ranked",
  level: 28,
  rank: "鑽石III",
  addedAt: "2088-01-15T10:30:00Z",
  lastSeen: now()
}, {
  userId: "f2",
  nickname: "數據殭屍",
  avatarSeed: "f2_avatar",
  status: "accepted",
  onlineStatus: "in_game",
  currentMode: "classic",
  level: 35,
  rank: "宗師I",
  addedAt: "2087-12-20T08:15:00Z",
  lastSeen: now()
}, {
  userId: "f3",
  nickname: "影子跑者",
  avatarSeed: "f3_avatar",
  status: "accepted",
  onlineStatus: "online",
  currentMode: "",
  level: 18,
  rank: "黃金V",
  addedAt: "2088-02-01T14:20:00Z",
  lastSeen: now()
}, {
  userId: "f4",
  nickname: "光纖貓",
  avatarSeed: "f4_avatar",
  status: "accepted",
  onlineStatus: "away",
  currentMode: "quick",
  level: 22,
  rank: "白金IV",
  addedAt: "2088-01-28T09:45:00Z",
  lastSeen: "2088-09-28T18:30:00Z"
}, {
  userId: "f5",
  nickname: "量子駭客",
  avatarSeed: "f5_avatar",
  status: "accepted",
  onlineStatus: "offline",
  currentMode: "",
  level: 42,
  rank: "大師II",
  addedAt: "2087-11-10T16:00:00Z",
  lastSeen: "2088-09-25T22:10:00Z"
}, {
  userId: "f6",
  nickname: "電流公主",
  avatarSeed: "f6_avatar",
  status: "accepted",
  onlineStatus: "offline",
  currentMode: "",
  level: 15,
  rank: "白銀III",
  addedAt: "2088-03-05T11:20:00Z",
  lastSeen: "2088-09-20T14:00:00Z"
}];
const DEFAULT_REQUESTS = [{
  id: "req1",
  fromUserId: "r1",
  fromNickname: "賽博浪人",
  toUserId: "self",
  toNickname: "我",
  message: "看你排行很高，想一起開黑！",
  status: "pending",
  createdAt: "2088-09-28T20:15:00Z"
}, {
  id: "req2",
  fromUserId: "r2",
  fromNickname: "街頭藝人",
  toUserId: "self",
  toNickname: "我",
  message: "上次對戰很精彩，加個好友吧",
  status: "pending",
  createdAt: "2088-09-28T15:42:00Z"
}];
const DEFAULT_RECENT = [{
  userId: "rp1",
  nickname: "地產大亨",
  avatarSeed: "rp1_avatar",
  rank: "鑽石I",
  lastPlayedAt: "2088-09-28T22:00:00Z",
  playedCount: 3,
  isFriend: false
}, {
  userId: "rp2",
  nickname: "現金流水",
  avatarSeed: "rp2_avatar",
  rank: "白金II",
  lastPlayedAt: "2088-09-28T19:30:00Z",
  playedCount: 1,
  isFriend: false
}, {
  userId: "rp3",
  nickname: "股市鯊魚",
  avatarSeed: "rp3_avatar",
  rank: "黃金II",
  lastPlayedAt: "2088-09-27T23:10:00Z",
  playedCount: 2,
  isFriend: false
}, {
  userId: "f2",
  nickname: "數據殭屍",
  avatarSeed: "f2_avatar",
  rank: "宗師I",
  lastPlayedAt: "2088-09-28T21:00:00Z",
  playedCount: 5,
  isFriend: true
}];
const DEFAULT_ACTIVITY = [{
  id: "a1",
  userId: "f2",
  userName: "數據殭屍",
  type: "rank_up",
  content: "段位提升至 宗師 I",
  detail: "連勝 7 場達成晉級",
  timestamp: "2088-09-28T21:30:00Z"
}, {
  id: "a2",
  userId: "f1",
  userName: "霓虹夜行者",
  type: "achievement",
  content: "解鎖成就「地產大亨」",
  detail: "同時擁有 10 處地產",
  timestamp: "2088-09-28T18:45:00Z"
}, {
  id: "a3",
  userId: "f5",
  userName: "量子駭客",
  type: "win_streak",
  content: "達成 5 連勝",
  detail: "排位賽連勝紀錄",
  timestamp: "2088-09-27T14:20:00Z"
}, {
  id: "a4",
  userId: "f3",
  userName: "影子跑者",
  type: "new_title",
  content: "獲得頭銜「暗夜行者」",
  detail: "連續 30 天登錄獎勵",
  timestamp: "2088-09-26T10:00:00Z"
}];
function getFriends() {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
  }
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(DEFAULT_FRIENDS));
  } catch {
  }
  return DEFAULT_FRIENDS;
}
function saveFriends(friends) {
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  } catch {
  }
}
function getFriendRequests() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((r) => r.status === "pending");
    }
  } catch {
  }
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(DEFAULT_REQUESTS));
  } catch {
  }
  return DEFAULT_REQUESTS;
}
function saveRequests(requests) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch {
  }
}
function acceptRequest(requestId) {
  const requests = getFriendRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return null;
  const newFriend = {
    userId: req.fromUserId,
    nickname: req.fromNickname,
    avatarSeed: `${req.fromUserId}_avatar`,
    status: "accepted",
    onlineStatus: "online",
    level: 10,
    rank: "新手",
    addedAt: now(),
    lastSeen: now()
  };
  const friends = getFriends();
  friends.push(newFriend);
  saveFriends(friends);
  req.status = "accepted";
  saveRequests(requests.filter((r) => r.status === "pending"));
  updateRecentPlayerFriendship(req.fromUserId, true);
  window.dispatchEvent(new CustomEvent("friends-updated"));
  return newFriend;
}
function rejectRequest(requestId) {
  const requests = getFriendRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return false;
  saveRequests(requests.filter((r) => r.id !== requestId));
  window.dispatchEvent(new CustomEvent("friends-updated"));
  return true;
}
function addFriend(userId, nickname, message) {
  const friends = getFriends();
  if (friends.some((f) => f.userId === userId)) return false;
  const requests = getFriendRequests();
  if (requests.some((r) => r.toUserId === userId && r.status === "pending" && r.fromUserId === "self")) return false;
  const newReq = {
    id: uid(),
    fromUserId: "self",
    fromNickname: "我",
    toUserId: userId,
    toNickname: nickname,
    message,
    status: "pending",
    createdAt: now()
  };
  requests.push(newReq);
  saveRequests(requests);
  window.dispatchEvent(new CustomEvent("friends-updated"));
  return true;
}
function removeFriend(userId) {
  const friends = getFriends();
  const filtered = friends.filter((f) => f.userId !== userId);
  if (filtered.length === friends.length) return false;
  saveFriends(filtered);
  updateRecentPlayerFriendship(userId, false);
  return true;
}
function getRecentPlayers() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
  }
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(DEFAULT_RECENT));
  } catch {
  }
  return DEFAULT_RECENT;
}
function saveRecentPlayers(players) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(players));
  } catch {
  }
}
function updateRecentPlayerFriendship(userId, isFriend) {
  const recent = getRecentPlayers();
  const p = recent.find((r) => r.userId === userId);
  if (p) {
    p.isFriend = isFriend;
    saveRecentPlayers(recent);
  }
}
function getFriendActivities() {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
  }
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(DEFAULT_ACTIVITY));
  } catch {
  }
  return DEFAULT_ACTIVITY;
}
function searchUsers(query) {
  const friends = getFriends();
  const friendIds = new Set(friends.map((f) => f.userId));
  const all = [{
    userId: "search_1",
    nickname: "霓虹刀客",
    rank: "黃金I"
  }, {
    userId: "search_2",
    nickname: "霓虹女神",
    rank: "鑽石V"
  }, {
    userId: "search_3",
    nickname: "賽博武士",
    rank: "白銀II"
  }, {
    userId: "search_4",
    nickname: "數據學徒",
    rank: "新手"
  }, {
    userId: "f1",
    nickname: "霓虹夜行者",
    rank: "鑽石III"
  }, {
    userId: "f2",
    nickname: "數據殭屍",
    rank: "宗師I"
  }, {
    userId: "rp1",
    nickname: "地產大亨",
    rank: "鑽石I"
  }];
  return all.filter((u) => u.nickname.includes(query) || u.userId.includes(query)).map((u) => ({
    ...u,
    isFriend: friendIds.has(u.userId)
  })).slice(0, 10);
}
const STORAGE_KEY = "monopoly_friend_match_history";
const MODE_LABELS = {
  classic: "經典",
  quick: "快速",
  crazy: "瘋狂"
};
const MOCK_FRIENDS = [{
  userId: "mock_friend_01",
  nickname: "霓虹獵人"
}, {
  userId: "mock_friend_02",
  nickname: "數據遊俠"
}, {
  userId: "mock_friend_03",
  nickname: "暗影駭客"
}, {
  userId: "mock_friend_04",
  nickname: "電馭祭司"
}, {
  userId: "mock_friend_05",
  nickname: "賽博忍者"
}];
function generateMockData() {
  const records = [];
  const modes = ["classic", "quick", "crazy"];
  const now2 = Date.now();
  MOCK_FRIENDS.forEach((friend, friendIdx) => {
    const matchCount = 3 + friendIdx % 6;
    for (let i = 0; i < matchCount; i++) {
      const daysAgo = friendIdx * 5 + i * 2 + Math.floor(Math.random() * 3);
      const hoursAgo = Math.floor(Math.random() * 20);
      const playedAt = new Date(now2 - daysAgo * 864e5 - hoursAgo * 36e5);
      const result = Math.random() > 0.5 ? "win" : "lose";
      const mode = modes[Math.floor(Math.random() * modes.length)];
      const duration = 300 + Math.floor(Math.random() * 1500);
      records.push({
        id: `match_${friend.userId}_${i}_${playedAt.getTime()}`,
        friendUserId: friend.userId,
        friendNickname: friend.nickname,
        mode,
        result,
        duration,
        playedAt: playedAt.toISOString()
      });
    }
  });
  return records.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
}
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const mock = generateMockData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      return mock;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const mock = generateMockData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      return mock;
    }
    return parsed;
  } catch {
    const mock = generateMockData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    } catch {
    }
    return mock;
  }
}
function getFriendMatchHistory(friendUserId) {
  const all = readStorage();
  return all;
}
function getFriendStats() {
  const records = readStorage();
  const statMap = /* @__PURE__ */ new Map();
  for (const rec of records) {
    if (!statMap.has(rec.friendUserId)) {
      statMap.set(rec.friendUserId, {
        userId: rec.friendUserId,
        nickname: rec.friendNickname,
        totalMatches: 0,
        myWins: 0,
        friendWins: 0,
        myWinRate: 0,
        relation: "even"
      });
    }
    const stat = statMap.get(rec.friendUserId);
    stat.totalMatches += 1;
    if (rec.result === "win") {
      stat.myWins += 1;
    } else {
      stat.friendWins += 1;
    }
  }
  const stats = [];
  for (const stat of statMap.values()) {
    stat.myWinRate = stat.totalMatches > 0 ? stat.myWins / stat.totalMatches : 0;
    if (stat.myWins > stat.friendWins) {
      stat.relation = "proud";
    } else if (stat.friendWins > stat.myWins) {
      stat.relation = "grudge";
    } else {
      stat.relation = "even";
    }
    stats.push(stat);
  }
  return stats.sort((a, b) => b.totalMatches - a.totalMatches);
}
function getModeLabel(mode) {
  return MODE_LABELS[mode];
}
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} 秒`;
  if (secs === 0) return `${mins} 分鐘`;
  return `${mins} 分 ${secs} 秒`;
}
function formatPlayedAt(iso) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${hh}:${mm}`;
}
const RELATION_INFO = {
  proud: {
    label: "得意",
    color: "var(--green)",
    bg: "rgba(0, 255, 136, 0.15)"
  },
  grudge: {
    label: "恩怨",
    color: "var(--red)",
    bg: "rgba(255, 71, 87, 0.15)"
  },
  even: {
    label: "勢均力敵",
    color: "var(--yellow, #ffd93d)",
    bg: "rgba(255, 217, 61, 0.15)"
  }
};
const FriendMatchHistory = () => {
  const [selectedFriendId, setSelectedFriendId] = reactExports.useState("all");
  const stats = reactExports.useMemo(() => getFriendStats(), []);
  const allRecords = reactExports.useMemo(() => getFriendMatchHistory(), []);
  const filteredRecords = reactExports.useMemo(() => {
    if (selectedFriendId === "all") return allRecords;
    return allRecords.filter((r) => r.friendUserId === selectedFriendId);
  }, [allRecords, selectedFriendId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-h-0 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 py-4 border-b flex-shrink-0", style: {
      borderColor: "var(--border-neon)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 20, style: {
          color: "var(--cyan)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-lg tracking-wider text-neon-cyan", children: "對戰記錄" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: "與好友的所有對戰成績與勝負關係" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto min-h-0 p-4 md:p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider mb-3", style: {
          color: "var(--pink)"
        }, children: "好友勝負總覽" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 -mx-1 px-1", children: stats.map((stat) => {
          const relationInfo = RELATION_INFO[stat.relation];
          const myPercent = Math.round(stat.myWinRate * 100);
          const friendPercent = 100 - myPercent;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-48 p-3 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer", style: {
            background: "var(--bg-mid)",
            border: `1px solid var(--border-neon)`,
            boxShadow: "0 0 8px rgba(0, 255, 255, 0.1)"
          }, onClick: () => setSelectedFriendId(stat.userId), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full flex items-center justify-center font-cyber text-sm flex-shrink-0", style: {
                background: "linear-gradient(135deg, var(--cyan), var(--purple))",
                color: "var(--bg-deep)",
                border: "2px solid var(--cyan)",
                boxShadow: "0 0 6px var(--cyan)"
              }, children: stat.nickname.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", style: {
                  color: "var(--text-primary)"
                }, children: stat.nickname }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber tracking-wider px-1.5 py-0.5 rounded inline-block", style: {
                  color: relationInfo.color,
                  background: relationInfo.bg,
                  textShadow: `0 0 6px ${relationInfo.color}`
                }, children: relationInfo.label })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mb-2 text-center", style: {
              color: "var(--text-secondary)"
            }, children: [
              "對戰 ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--cyan)"
              }, children: stat.totalMatches }),
              " 場"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                  color: "var(--cyan)"
                }, children: [
                  "我 ",
                  myPercent,
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                  color: "var(--pink)"
                }, children: [
                  friendPercent,
                  "% 對方"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-2 rounded-full overflow-hidden flex", style: {
                background: "var(--bg-dark)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all", style: {
                  width: `${myPercent}%`,
                  background: "linear-gradient(90deg, var(--cyan), var(--cyan-glow))",
                  boxShadow: "0 0 6px var(--cyan)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all", style: {
                  width: `${friendPercent}%`,
                  background: "linear-gradient(90deg, var(--pink-glow), var(--pink))",
                  boxShadow: "0 0 6px var(--pink)"
                } })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-cyber", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: "var(--green)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 10, className: "inline mr-1" }),
                stat.myWins,
                " 勝"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: "var(--red)"
              }, children: [
                stat.friendWins,
                " 負"
              ] })
            ] })
          ] }, stat.userId);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
            color: "var(--pink)"
          }, children: "歷史對局" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedFriendId, onChange: (e) => setSelectedFriendId(e.target.value), className: "cyber-input text-xs py-1.5 pr-7 appearance-none cursor-pointer", style: {
              borderColor: "var(--border-neon)",
              color: "var(--text-primary)",
              background: "var(--bg-mid)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "全部好友" }),
              stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.userId, children: s.nickname }, s.userId))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none", style: {
              color: "var(--cyan)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 4l3 3 3-3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm", style: {
            color: "var(--text-secondary)"
          }, children: "尚無對戰記錄" }),
          filteredRecords.map((record) => {
            const isWin = record.result === "win";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg transition-colors", style: {
              background: "var(--bg-mid)",
              border: `1px solid ${isWin ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 71, 87, 0.3)"}`,
              boxShadow: isWin ? "0 0 8px rgba(0, 255, 136, 0.1)" : "0 0 8px rgba(255, 71, 87, 0.08)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", style: {
                background: isWin ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 71, 87, 0.15)",
                border: `1px solid ${isWin ? "var(--green)" : "var(--red)"}`
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm font-bold", style: {
                color: isWin ? "var(--green)" : "var(--red)",
                textShadow: `0 0 8px ${isWin ? "var(--green)" : "var(--red)"}`
              }, children: isWin ? "勝" : "負" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium truncate", style: {
                  color: "var(--text-primary)"
                }, children: [
                  "vs. ",
                  record.friendNickname
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber tracking-wider px-1.5 py-0.5 rounded", style: {
                    color: "var(--purple, #b388ff)",
                    background: "rgba(179, 136, 255, 0.15)"
                  }, children: getModeLabel(record.mode) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1", style: {
                    color: "var(--text-secondary)"
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                    formatDuration(record.duration)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-xs flex-shrink-0", style: {
                color: "var(--text-secondary)"
              }, children: formatPlayedAt(record.playedAt) })
            ] }, record.id);
          })
        ] })
      ] })
    ] })
  ] });
};
const STATUS_ORDER = {
  online: 0,
  in_game: 1,
  away: 2,
  offline: 3
};
const STATUS_INFO = {
  online: {
    label: "線上",
    color: "var(--green)"
  },
  in_game: {
    label: "遊戲中",
    color: "var(--red)"
  },
  away: {
    label: "暫離",
    color: "var(--yellow, #ffd93d)"
  },
  offline: {
    label: "離線",
    color: "var(--text-secondary)"
  }
};
const ACTIVITY_ICONS = {
  achievement: Trophy,
  rank_up: Crown,
  new_title: Star,
  win_streak: Zap
};
const ACTIVITY_COLORS = {
  achievement: "var(--yellow, #ffd93d)",
  rank_up: "var(--pink)",
  new_title: "var(--purple, #b388ff)",
  win_streak: "var(--green)"
};
function avatarColor(seed) {
  const colors = ["linear-gradient(135deg, var(--cyan), var(--purple))", "linear-gradient(135deg, var(--pink), var(--purple))", "linear-gradient(135deg, var(--cyan), var(--green))", "linear-gradient(135deg, var(--pink), var(--red))", "linear-gradient(135deg, var(--yellow, #ffd93d), var(--pink))", "linear-gradient(135deg, var(--purple, #b388ff), var(--blue))"];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = hash * 31 + seed.charCodeAt(i) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}
function formatRelativeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString("zh-TW");
}
const FriendsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("friends");
  const [friendsList, setFriendsList] = reactExports.useState([]);
  const [requests, setRequests] = reactExports.useState([]);
  const [recentPlayers, setRecentPlayers] = reactExports.useState([]);
  const [activities, setActivities] = reactExports.useState([]);
  const [selectedFriend, setSelectedFriend] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchInput, setSearchInput] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [isSearching, setIsSearching] = reactExports.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = reactExports.useState(false);
  const [friendToDelete, setFriendToDelete] = reactExports.useState(null);
  const [actionLoading, setActionLoading] = reactExports.useState(null);
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const loadAllData = reactExports.useCallback(() => {
    setFriendsList(getFriends());
    setRequests(getFriendRequests());
    setRecentPlayers(getRecentPlayers());
    setActivities(getFriendActivities());
  }, []);
  reactExports.useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  const handleRefresh = reactExports.useCallback(async () => {
    loadAllData();
    setRefreshKey((k) => k + 1);
  }, [loadAllData]);
  const sortedFriends = reactExports.useMemo(() => {
    return [...friendsList].sort((a, b) => STATUS_ORDER[a.onlineStatus] - STATUS_ORDER[b.onlineStatus]);
  }, [friendsList]);
  const incomingRequests = reactExports.useMemo(() => requests.filter((r) => r.toUserId === "self"), [requests]);
  const outgoingRequests = reactExports.useMemo(() => requests.filter((r) => r.fromUserId === "self"), [requests]);
  const onlineCount = reactExports.useMemo(() => friendsList.filter((f) => f.onlineStatus !== "offline").length, [friendsList]);
  const handleSearch = reactExports.useCallback(() => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = searchUsers(trimmed);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  }, [searchInput]);
  const handleSearchSubmit = reactExports.useCallback((e) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);
  const showSearchResults = searchQuery.length > 0 && activeTab !== "history";
  const handleSelectFriend = reactExports.useCallback((friend) => {
    setSelectedFriend(friend);
  }, []);
  const handleAddFriend = reactExports.useCallback((userId, nickname) => {
    setActionLoading(userId);
    try {
      const success = addFriend(userId, nickname, "一起來玩賽博大富翁吧！");
      if (success) {
        toast.success(`已向 ${nickname} 發送好友請求`);
        loadAllData();
        setSearchResults((prev) => prev.map((u) => u.userId === userId ? {
          ...u,
          isFriend: true
        } : u));
      } else {
        toast.error("發送失敗，可能已是好友");
      }
    } catch {
      toast.error("發送好友請求失敗");
    } finally {
      setActionLoading(null);
    }
  }, [loadAllData]);
  const handleAcceptRequest = reactExports.useCallback((requestId) => {
    setActionLoading(requestId);
    try {
      const newFriend = acceptRequest(requestId);
      if (newFriend) {
        toast.success(`已新增 ${newFriend.nickname} 為好友`);
        loadAllData();
      } else {
        toast.error("接受請求失敗");
      }
    } finally {
      setActionLoading(null);
    }
  }, [loadAllData]);
  const handleRejectRequest = reactExports.useCallback((requestId) => {
    setActionLoading(requestId);
    try {
      const success = rejectRequest(requestId);
      if (success) {
        toast.success("已拒絕好友請求");
        loadAllData();
      } else {
        toast.error("操作失敗");
      }
    } finally {
      setActionLoading(null);
    }
  }, [loadAllData]);
  const handleCancelRequest = reactExports.useCallback((requestId) => {
    setActionLoading(requestId);
    try {
      const all = getFriendRequests();
      const filtered = all.filter((r) => r.id !== requestId);
      try {
        localStorage.setItem("monopoly_friends_requests", JSON.stringify(filtered));
      } catch {
      }
      toast.success("已撤銷好友請求");
      loadAllData();
    } finally {
      setActionLoading(null);
    }
  }, [loadAllData]);
  const handleAddRecentFriend = reactExports.useCallback((player) => {
    setActionLoading(player.userId);
    try {
      const success = addFriend(player.userId, player.nickname, "上次對戰很精彩！");
      if (success) {
        toast.success(`已向 ${player.nickname} 發送好友請求`);
        loadAllData();
      } else {
        toast.error("發送失敗");
      }
    } finally {
      setActionLoading(null);
    }
  }, [loadAllData]);
  const handleInviteTeam = reactExports.useCallback((friend) => {
    toast.success(`已向 ${friend.nickname} 發出組隊邀請`);
  }, []);
  const handleDeleteClick = reactExports.useCallback((friend) => {
    setFriendToDelete(friend);
    setShowDeleteDialog(true);
  }, []);
  const confirmDelete = reactExports.useCallback(() => {
    if (!friendToDelete) return;
    const success = removeFriend(friendToDelete.userId);
    if (success) {
      toast.success(`已刪除好友 ${friendToDelete.nickname}`);
      if (selectedFriend?.userId === friendToDelete.userId) {
        setSelectedFriend(null);
      }
      loadAllData();
    } else {
      toast.error("刪除失敗");
    }
    setShowDeleteDialog(false);
    setFriendToDelete(null);
  }, [friendToDelete, selectedFriend, loadAllData]);
  const handleBack = () => {
    navigate("/");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "好友中心" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl w-full mx-auto flex-1 flex flex-col md:flex-row gap-4 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full md:w-80 lg:w-96 flex flex-col min-h-0 overflow-hidden", style: {
        borderColor: "var(--border-neon)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-b", style: {
          borderColor: "var(--border-neon)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSearchSubmit, className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", style: {
            color: "var(--text-secondary)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: searchInput, onChange: (e) => setSearchInput(e.target.value), placeholder: "搜尋玩家 ID / 暱稱", className: "cyber-input w-full pl-9 pr-20 text-sm", style: {
            borderColor: "var(--border-neon)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "absolute right-1.5 top-1/2 -translate-y-1/2 cyber-btn px-2.5 py-1 text-xs flex items-center gap-1", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)",
            background: "rgba(0, 255, 255, 0.08)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 12 }),
            "搜尋"
          ] }),
          isSearching && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "absolute right-16 top-1/2 -translate-y-1/2 animate-spin", style: {
            color: "var(--cyan)"
          } })
        ] }) }),
        !showSearchResults && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b overflow-x-auto", style: {
          borderColor: "var(--border-neon)"
        }, children: [{
          key: "friends",
          label: "好友",
          icon: Users,
          count: friendsList.length
        }, {
          key: "requests",
          label: "請求",
          icon: UserPlus,
          count: incomingRequests.length
        }, {
          key: "recent",
          label: "最近",
          icon: Clock,
          count: 0
        }, {
          key: "activity",
          label: "動態",
          icon: Activity,
          count: 0
        }, {
          key: "history",
          label: "對戰",
          icon: Swords,
          count: 0
        }].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const accentColor = tab.key === "requests" ? "var(--pink)" : tab.key === "recent" ? "var(--yellow, #ffd93d)" : tab.key === "activity" ? "var(--purple, #b388ff)" : tab.key === "history" ? "var(--red)" : "var(--cyan)";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "flex-1 min-w-fit py-2.5 px-2 text-xs font-cyber tracking-wider flex flex-col items-center justify-center gap-1 transition-colors flex-shrink-0", style: {
            color: isActive ? accentColor : "var(--text-secondary)",
            borderBottom: isActive ? `2px solid ${accentColor}` : "2px solid transparent"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              tab.label,
              tab.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1 rounded", style: {
                background: `${accentColor}22`,
                color: accentColor
              }, children: tab.count })
            ] })
          ] }, tab.key);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PullToRefresh, { onRefresh: handleRefresh, className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto min-h-0 h-full scroll-container", children: [
          showSearchResults && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs px-2 py-1 mb-2 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: [
              "搜尋結果 (",
              searchResults.length,
              ")"
            ] }),
            searchResults.length === 0 && !isSearching && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-[var(--text-secondary)]", children: "找不到符合的玩家" }),
            searchResults.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg mb-1", style: {
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid transparent"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm", style: {
                  background: avatarColor(user.userId),
                  color: "var(--bg-deep)"
                }, children: user.nickname.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-primary)] truncate", children: user.nickname }),
                  user.rank && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber tracking-wider", style: {
                    color: "var(--text-secondary)"
                  }, children: user.rank })
                ] })
              ] }),
              user.isFriend ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-1 rounded font-cyber tracking-wider flex items-center gap-1", style: {
                color: "var(--green)",
                border: "1px solid var(--green)",
                background: "rgba(0, 255, 128, 0.08)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 12 }),
                "已是好友"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleAddFriend(user.userId, user.nickname), disabled: actionLoading === user.userId, className: "cyber-btn px-2.5 py-1 text-xs flex items-center gap-1", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)",
                background: "rgba(0, 255, 255, 0.08)"
              }, children: [
                actionLoading === user.userId ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 14 }),
                "加好友"
              ] })
            ] }, user.userId))
          ] }),
          !showSearchResults && activeTab === "friends" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs px-2 py-1 mb-2 font-cyber tracking-wider flex items-center justify-between", style: {
              color: "var(--text-secondary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "線上 ",
              onlineCount,
              " / ",
              friendsList.length
            ] }) }),
            sortedFriends.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-[var(--text-secondary)]", children: "還沒有好友" }),
            sortedFriends.map((friend) => {
              const isSelected = selectedFriend?.userId === friend.userId;
              const statusInfo = STATUS_INFO[friend.onlineStatus];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelectFriend(friend), className: "w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all", style: {
                background: isSelected ? "rgba(0, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${isSelected ? "var(--cyan)" : "transparent"}`,
                boxShadow: isSelected ? "0 0 8px rgba(0, 255, 255, 0.15)" : "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm", style: {
                    background: avatarColor(friend.userId),
                    color: "var(--bg-deep)"
                  }, children: friend.nickname.charAt(0).toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2", style: {
                    backgroundColor: statusInfo.color,
                    borderColor: "var(--bg-dark)",
                    boxShadow: `0 0 4px ${statusInfo.color}`
                  } })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-[var(--text-primary)] truncate", children: friend.nickname }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber tracking-wider px-1.5 py-px rounded", style: {
                      background: "rgba(168, 85, 247, 0.15)",
                      color: "var(--purple, #b388ff)"
                    }, children: friend.rank || "新手" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
                      color: statusInfo.color
                    }, children: statusInfo.label })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: friend.onlineStatus === "online" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
                  e.stopPropagation();
                  handleInviteTeam(friend);
                }, className: "cyber-btn p-1.5", style: {
                  borderColor: "var(--green)",
                  color: "var(--green)",
                  background: "rgba(0, 255, 128, 0.08)"
                }, title: "邀請組隊", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 14 }) }) })
              ] }, friend.userId);
            })
          ] }),
          !showSearchResults && activeTab === "requests" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs px-2 py-1 mb-2 font-cyber tracking-wider", style: {
              color: "var(--pink)"
            }, children: [
              "收到的請求 (",
              incomingRequests.length,
              ")"
            ] }),
            incomingRequests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4 text-xs mb-2", style: {
              color: "var(--text-secondary)"
            }, children: "沒有待處理的請求" }),
            incomingRequests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg mb-2", style: {
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 107, 157, 0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm", style: {
                  background: "linear-gradient(135deg, var(--pink), var(--purple))",
                  color: "var(--bg-deep)"
                }, children: req.fromNickname.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-primary)] truncate", children: req.fromNickname }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px]", style: {
                    color: "var(--text-secondary)"
                  }, children: formatRelativeTime(req.createdAt) })
                ] })
              ] }),
              req.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mb-2 px-2 py-1.5 rounded", style: {
                background: "var(--bg-mid)",
                color: "var(--text-secondary)"
              }, children: [
                "「",
                req.message,
                "」"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleAcceptRequest(req.id), disabled: actionLoading === req.id, className: "cyber-btn flex-1 py-1.5 text-xs flex items-center justify-center gap-1", style: {
                  borderColor: "var(--green)",
                  color: "var(--green)",
                  background: "rgba(0, 255, 128, 0.08)"
                }, children: [
                  actionLoading === req.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 14 }),
                  "接受"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleRejectRequest(req.id), disabled: actionLoading === req.id, className: "cyber-btn flex-1 py-1.5 text-xs flex items-center justify-center gap-1", style: {
                  borderColor: "var(--red)",
                  color: "var(--red)",
                  background: "rgba(255, 0, 0, 0.08)"
                }, children: [
                  actionLoading === req.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 14 }),
                  "拒絕"
                ] })
              ] })
            ] }, req.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs px-2 py-1 mt-4 mb-2 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: [
              "發出的請求 (",
              outgoingRequests.length,
              ")"
            ] }),
            outgoingRequests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4 text-xs", style: {
              color: "var(--text-secondary)"
            }, children: "尚未發出任何請求" }),
            outgoingRequests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg mb-1", style: {
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid transparent"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm", style: {
                background: "linear-gradient(135deg, var(--cyan), var(--purple))",
                color: "var(--bg-deep)"
              }, children: req.toNickname.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-primary)] truncate", children: req.toNickname }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px]", style: {
                  color: "var(--text-secondary)"
                }, children: formatRelativeTime(req.createdAt) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber tracking-wider px-2 py-1 rounded", style: {
                  color: "var(--yellow, #ffd93d)",
                  border: "1px solid var(--yellow, #ffd93d)",
                  background: "rgba(255, 217, 61, 0.08)"
                }, children: "已發送" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleCancelRequest(req.id), disabled: actionLoading === req.id, className: "cyber-btn p-1.5", style: {
                  borderColor: "var(--text-secondary)",
                  color: "var(--text-secondary)"
                }, title: "撤銷", children: actionLoading === req.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
              ] })
            ] }, req.id))
          ] }),
          !showSearchResults && activeTab === "recent" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs px-2 py-1 mb-2 font-cyber tracking-wider", style: {
              color: "var(--yellow, #ffd93d)"
            }, children: "最近對戰玩家" }),
            recentPlayers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-[var(--text-secondary)]", children: "暫無最近玩家" }),
            recentPlayers.map((player) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg mb-1", style: {
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid transparent"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm", style: {
                background: avatarColor(player.userId),
                color: "var(--bg-deep)"
              }, children: player.nickname.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-primary)] truncate", children: player.nickname }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px]", children: [
                  player.rank && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider px-1.5 py-px rounded", style: {
                    background: "rgba(168, 85, 247, 0.15)",
                    color: "var(--purple, #b388ff)"
                  }, children: player.rank }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: [
                    "對戰 ",
                    player.playedCount,
                    " 次"
                  ] })
                ] })
              ] }),
              player.isFriend ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-1 rounded font-cyber tracking-wider", style: {
                color: "var(--green)",
                border: "1px solid var(--green)",
                background: "rgba(0, 255, 128, 0.08)"
              }, children: "已是好友" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleAddRecentFriend(player), disabled: actionLoading === player.userId, className: "cyber-btn px-2.5 py-1 text-xs flex items-center gap-1", style: {
                borderColor: "var(--yellow, #ffd93d)",
                color: "var(--yellow, #ffd93d)",
                background: "rgba(255, 217, 61, 0.08)"
              }, children: [
                actionLoading === player.userId ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 14 }),
                "加好友"
              ] })
            ] }, player.userId))
          ] }),
          !showSearchResults && activeTab === "activity" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs px-2 py-1 mb-2 font-cyber tracking-wider", style: {
              color: "var(--purple, #b388ff)"
            }, children: "好友動態" }),
            activities.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-[var(--text-secondary)]", children: "暫無動態" }),
            activities.map((activity) => {
              const IconComp = ACTIVITY_ICONS[activity.type];
              const color = ACTIVITY_COLORS[activity.type];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg mb-2", style: {
                background: "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${color}22`
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", style: {
                  background: `${color}15`,
                  border: `1px solid ${color}44`
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconComp, { size: 14, style: {
                  color
                } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[var(--text-primary)]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: activity.userName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                      color: "var(--text-secondary)"
                    }, children: " " }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                      color
                    }, children: activity.content })
                  ] }),
                  activity.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5", style: {
                    color: "var(--text-secondary)"
                  }, children: activity.detail }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] mt-1", style: {
                    color: "var(--text-secondary)"
                  }, children: formatRelativeTime(activity.timestamp) })
                ] })
              ] }, activity.id);
            })
          ] }),
          !showSearchResults && activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs px-2 py-1 mb-2 font-cyber tracking-wider", style: {
              color: "var(--red)"
            }, children: "對戰概覽" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg mb-2 text-center", style: {
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 71, 87, 0.2)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mb-2", style: {
                color: "var(--text-secondary)"
              }, children: "點擊右側面板查看詳細對戰記錄" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 32, className: "mx-auto mb-2", style: {
                color: "var(--cyan)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber tracking-wider text-sm", style: {
                color: "var(--cyan)"
              }, children: "對戰記錄" })
            ] })
          ] })
        ] }, refreshKey) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card flex-1 flex flex-col min-h-0 overflow-hidden", style: {
        borderColor: "var(--border-neon)"
      }, children: [
        activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(FriendMatchHistory, {}),
        activeTab !== "friends" && activeTab !== "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full flex items-center justify-center mb-4", style: {
            border: "1px solid var(--border-neon)",
            background: "rgba(0, 255, 255, 0.05)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 36, style: {
            color: "var(--cyan)"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider text-neon-cyan mb-2", children: "好友中心" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-secondary)]", children: "從左側「好友」分頁選擇一位好友查看詳情" })
        ] }),
        activeTab === "friends" && !selectedFriend && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full flex items-center justify-center mb-4", style: {
            border: "1px solid var(--border-neon)",
            background: "rgba(0, 255, 255, 0.05)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 36, style: {
            color: "var(--cyan)"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider text-neon-cyan mb-2", children: "選擇一位好友查看詳情" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-secondary)]", children: "從左側好友列表中選擇一位好友" })
        ] }),
        activeTab === "friends" && selectedFriend && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-h-0 overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b", style: {
            borderColor: "var(--border-neon)",
            background: "linear-gradient(180deg, rgba(0,255,255,0.04), transparent)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full flex items-center justify-center font-cyber text-3xl", style: {
                  background: avatarColor(selectedFriend.userId),
                  color: "var(--bg-deep)",
                  border: `3px solid ${STATUS_INFO[selectedFriend.onlineStatus].color}`,
                  boxShadow: `0 0 16px ${STATUS_INFO[selectedFriend.onlineStatus].color}55`
                }, children: selectedFriend.nickname.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 right-1 w-5 h-5 rounded-full border-2", style: {
                  backgroundColor: STATUS_INFO[selectedFriend.onlineStatus].color,
                  borderColor: "var(--bg-dark)",
                  boxShadow: `0 0 6px ${STATUS_INFO[selectedFriend.onlineStatus].color}`
                } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center sm:text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider text-neon-cyan mb-1", children: selectedFriend.nickname }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center sm:justify-start gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider px-2 py-0.5 rounded", style: {
                    background: "rgba(168, 85, 247, 0.15)",
                    color: "var(--purple, #b388ff)",
                    border: "1px solid rgba(168, 85, 247, 0.3)"
                  }, children: selectedFriend.rank || "新手" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
                    color: STATUS_INFO[selectedFriend.onlineStatus].color
                  }, children: STATUS_INFO[selectedFriend.onlineStatus].label })
                ] }),
                selectedFriend.level !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  "等級 Lv.",
                  selectedFriend.level
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 justify-center sm:justify-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleInviteTeam(selectedFriend), disabled: selectedFriend.onlineStatus === "offline", className: "cyber-btn px-4 py-2 text-sm flex items-center gap-2", style: {
                borderColor: selectedFriend.onlineStatus === "offline" ? "var(--text-secondary)" : "var(--green)",
                color: selectedFriend.onlineStatus === "offline" ? "var(--text-secondary)" : "var(--green)",
                background: selectedFriend.onlineStatus === "offline" ? "transparent" : "rgba(0, 255, 128, 0.08)",
                boxShadow: selectedFriend.onlineStatus === "offline" ? "none" : "0 0 8px rgba(0, 255, 128, 0.2)",
                cursor: selectedFriend.onlineStatus === "offline" ? "not-allowed" : "pointer"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "邀請組隊" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                toast.info("開啟聊天面板");
              }, className: "cyber-btn px-4 py-2 text-sm flex items-center gap-2", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)",
                background: "rgba(0, 255, 255, 0.08)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "私訊" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleDeleteClick(selectedFriend), className: "cyber-btn px-4 py-2 text-sm flex items-center gap-2", style: {
                borderColor: "var(--red)",
                color: "var(--red)",
                background: "rgba(255, 0, 0, 0.08)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "刪除好友" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 space-y-4 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg", style: {
              background: "var(--bg-mid)",
              border: "1px solid var(--border-neon)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider mb-3", style: {
                color: "var(--pink)"
              }, children: "好友資訊" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: "玩家 ID" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-primary)"
                  }, children: selectedFriend.userId })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: "段位" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--cyan)"
                  }, children: selectedFriend.rank || "新手" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: "等級" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                    color: "var(--text-primary)"
                  }, children: [
                    "Lv.",
                    selectedFriend.level ?? "-"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: "狀態" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: STATUS_INFO[selectedFriend.onlineStatus].color
                  }, children: STATUS_INFO[selectedFriend.onlineStatus].label })
                ] }),
                selectedFriend.addedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-secondary)"
                  }, children: "成為好友" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    color: "var(--text-primary)"
                  }, children: new Date(selectedFriend.addedAt).toLocaleDateString("zh-TW") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg", style: {
              background: "var(--bg-mid)",
              border: "1px solid var(--border-neon)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider mb-3", style: {
                color: "var(--purple, #b388ff)"
              }, children: "成就摘要" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
                    color: "var(--cyan)"
                  }, children: selectedFriend.level ?? 0 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
                    color: "var(--text-secondary)"
                  }, children: "等級" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
                    color: "var(--pink)"
                  }, children: Math.floor((selectedFriend.level ?? 0) * 12) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
                    color: "var(--text-secondary)"
                  }, children: "場次" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
                    color: "var(--green)"
                  }, children: Math.floor((selectedFriend.level ?? 0) * 6) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
                    color: "var(--text-secondary)"
                  }, children: "勝場" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    showDeleteDialog && friendToDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: {
      background: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(4px)"
    }, onClick: () => setShowDeleteDialog(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-6", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 20px rgba(255, 71, 87, 0.3)"
    }, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", style: {
          background: "rgba(255, 71, 87, 0.15)",
          border: "1px solid var(--red)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 20, style: {
          color: "var(--red)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider mb-1", style: {
            color: "var(--red)"
          }, children: "確認刪除好友" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", style: {
            color: "var(--text-secondary)"
          }, children: [
            "確定要將",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--text-primary)"
            }, children: friendToDelete.nickname }),
            " ",
            "從好友名單中刪除嗎？此操作無法復原。"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowDeleteDialog(false), className: "cyber-btn px-4 py-2 text-sm", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)"
        }, children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: confirmDelete, className: "cyber-btn px-4 py-2 text-sm", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          background: "rgba(255, 71, 87, 0.1)",
          boxShadow: "0 0 8px rgba(255, 71, 87, 0.3)"
        }, children: "確認刪除" })
      ] })
    ] }) })
  ] });
};
export {
  FriendsPage as default
};
