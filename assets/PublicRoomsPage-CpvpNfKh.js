import { r as reactExports, j as jsxRuntimeExports, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, L as Lock, aA as DialogFooter, u as useNavigate, a as usePlayerIdentity, aC as RefreshCw, U as Users, Z as Zap, S as Swords, aD as Plus, c as rankingApi } from "./index-ymfxQ6bv.js";
import { m as monopolyApi } from "./monopoly-1z6oaVCn.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
const PasswordModal = ({
  open,
  roomName,
  onClose,
  onConfirm,
  error
}) => {
  const [password, setPassword] = reactExports.useState("");
  const inputRef = reactExports.useRef(null);
  const PASSWORD_LEN = 4;
  reactExports.useEffect(() => {
    if (open) {
      setPassword("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, PASSWORD_LEN);
    setPassword(value);
  };
  const handleConfirm = () => {
    if (password.length === PASSWORD_LEN) {
      onConfirm(password);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && password.length === PASSWORD_LEN) {
      handleConfirm();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (open2) => {
    if (!open2) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "cyber-card max-w-sm", style: {
    borderColor: "var(--purple)",
    boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
    backgroundColor: "hsl(240, 18%, 10%)"
  }, showCloseButton: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-cyber text-2xl tracking-wider text-center flex items-center justify-center gap-2", style: {
        color: "var(--purple)",
        textShadow: "0 0 10px rgba(168, 85, 247, 0.5)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 20 }),
        "輸入房間密碼"
      ] }),
      roomName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[var(--text-secondary)] text-sm font-cyber tracking-wider", children: roomName })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: inputRef, type: "password", value: password, onChange: handleChange, onKeyDown: handleKeyDown, maxLength: PASSWORD_LEN, inputMode: "numeric", className: "cyber-input text-center font-cyber text-3xl", style: {
        width: "180px",
        letterSpacing: "0.5em",
        paddingLeft: "0.75em",
        borderColor: error ? "var(--red)" : "rgba(168, 85, 247, 0.5)",
        boxShadow: error ? "0 0 12px rgba(255, 77, 77, 0.4)" : "0 0 8px rgba(168, 85, 247, 0.3)",
        color: error ? "var(--red)" : "var(--cyan)"
      }, placeholder: "••••" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-xs text-[var(--text-muted)] font-cyber tracking-wider", children: [
        password.length,
        "/",
        PASSWORD_LEN
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-center font-cyber tracking-wider", style: {
        color: "var(--red)",
        textShadow: "0 0 8px rgba(255, 77, 77, 0.5)"
      }, children: error })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: "var(--text-secondary)"
      }, children: "取消" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleConfirm, disabled: password.length !== PASSWORD_LEN, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
        borderColor: "var(--purple)",
        color: "var(--purple)",
        background: "rgba(168, 85, 247, 0.1)",
        boxShadow: "0 0 12px rgba(168, 85, 247, 0.3)"
      }, children: "確認" })
    ] })
  ] }) });
};
const MODE_OPTIONS = [{
  value: "all",
  label: "全部",
  icon: null
}, {
  value: "classic",
  label: "經典",
  icon: Users
}, {
  value: "fast",
  label: "快速",
  icon: Zap
}, {
  value: "crazy",
  label: "瘋狂",
  icon: Swords
}];
const PLAYER_OPTIONS = [{
  value: "all",
  label: "全部"
}, {
  value: 2,
  label: "2人"
}, {
  value: 4,
  label: "4人"
}, {
  value: 6,
  label: "6人"
}];
const STATUS_OPTIONS = [{
  value: "all",
  label: "全部",
  color: "var(--text-secondary)"
}, {
  value: "waiting",
  label: "等待中",
  color: "var(--green)"
}, {
  value: "playing",
  label: "遊戲中",
  color: "hsl(35, 100%, 60%)"
}, {
  value: "ended",
  label: "已結束",
  color: "var(--text-muted)"
}];
const MODE_COLORS = {
  classic: "var(--cyan)",
  fast: "var(--green)",
  crazy: "var(--pink)",
  custom: "var(--purple)",
  coop2v2: "var(--blue)",
  battle_royale: "hsl(35, 100%, 60%)",
  race: "hsl(160, 100%, 50%)",
  survival: "var(--red)",
  coop_boss: "hsl(0, 80%, 50%)",
  treasure: "hsl(45, 100%, 55%)",
  emperor: "hsl(45, 100%, 50%)",
  dark: "hsl(270, 80%, 50%)",
  lightning: "hsl(45, 100%, 60%)",
  resource: "hsl(140, 100%, 55%)",
  team_deathmatch: "hsl(0, 100%, 60%)",
  darknet: "hsl(270, 80%, 55%)",
  casino: "hsl(45, 100%, 55%)",
  dynasty: "hsl(20, 90%, 55%)"
};
const MODE_LABELS = {
  classic: "經典",
  fast: "快速",
  crazy: "瘋狂",
  custom: "自訂",
  coop2v2: "合作",
  battle_royale: "大逃殺",
  race: "競速",
  survival: "生存",
  coop_boss: "Boss戰",
  treasure: "奪寶",
  emperor: "皇帝",
  dark: "黑暗",
  lightning: "閃電戰",
  resource: "資源爭奪",
  team_deathmatch: "團隊死鬥",
  darknet: "暗網",
  casino: "賭場",
  dynasty: "王朝"
};
const STATUS_COLORS = {
  waiting: "var(--green)",
  playing: "hsl(35, 100%, 60%)",
  ended: "var(--text-muted)"
};
const STATUS_LABELS = {
  waiting: "等待中",
  playing: "遊戲中",
  ended: "已結束"
};
const PublicRoomsPage = () => {
  const navigate = useNavigate();
  const {
    visitorId,
    nickname
  } = usePlayerIdentity();
  const [rooms, setRooms] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [modeFilter, setModeFilter] = reactExports.useState("all");
  const [playerFilter, setPlayerFilter] = reactExports.useState("all");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [passwordModalOpen, setPasswordModalOpen] = reactExports.useState(false);
  const [selectedRoom, setSelectedRoom] = reactExports.useState(null);
  const [passwordError, setPasswordError] = reactExports.useState("");
  const [passwordLoading, setPasswordLoading] = reactExports.useState(false);
  const [nicknameModalOpen, setNicknameModalOpen] = reactExports.useState(false);
  const [pendingRoom, setPendingRoom] = reactExports.useState(null);
  const [joinNickname, setJoinNickname] = reactExports.useState("");
  const [joinError, setJoinError] = reactExports.useState("");
  const [joinLoading, setJoinLoading] = reactExports.useState(false);
  const mountedRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const loadRooms = reactExports.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filter = {};
      if (modeFilter !== "all") filter.gameMode = modeFilter;
      if (playerFilter !== "all") filter.maxPlayers = playerFilter;
      if (statusFilter !== "all") filter.status = statusFilter;
      const data = await monopolyApi.getPublicRooms(filter);
      if (!mountedRef.current) return;
      setRooms(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : "載入房間列表失敗";
      setError(message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [modeFilter, playerFilter, statusFilter]);
  reactExports.useEffect(() => {
    void loadRooms();
  }, [loadRooms]);
  const handleJoin = (room) => {
    if (!nickname) {
      setPendingRoom(room);
      setJoinNickname("");
      setJoinError("");
      setNicknameModalOpen(true);
      return;
    }
    if (room.hasPassword) {
      setSelectedRoom(room);
      setPasswordError("");
      setPasswordModalOpen(true);
    } else {
      void doJoin(room, "");
    }
  };
  const doJoin = async (room, password, playerName) => {
    const name = playerName || nickname;
    if (!name) return;
    setPasswordLoading(true);
    setJoinLoading(true);
    setPasswordError("");
    setJoinError("");
    try {
      if (visitorId && name) {
        try {
          await rankingApi.getOrCreatePlayer(visitorId, name);
        } catch {
        }
      }
      const result = await monopolyApi.joinRoom(room.roomCode, name, visitorId, password || void 0);
      setPasswordModalOpen(false);
      setNicknameModalOpen(false);
      navigate(`/online/room/${result.room.roomCode}?player=${result.playerIndex}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加入房間失敗";
      if (passwordModalOpen) {
        setPasswordError(message);
      } else {
        setJoinError(message);
      }
    } finally {
      setPasswordLoading(false);
      setJoinLoading(false);
    }
  };
  const handlePasswordConfirm = (password) => {
    if (selectedRoom) {
      void doJoin(selectedRoom, password);
    }
  };
  const handleNicknameConfirm = () => {
    const name = joinNickname.trim();
    if (!name) {
      setJoinError("請輸入你的暱稱");
      return;
    }
    if (!pendingRoom) return;
    if (pendingRoom.hasPassword) {
      setNicknameModalOpen(false);
      setSelectedRoom(pendingRoom);
      setPasswordError("");
      void (async () => {
        setTimeout(() => {
          setPasswordModalOpen(true);
        }, 100);
      })();
    } else {
      void doJoin(pendingRoom, "", name);
    }
  };
  const handlePasswordConfirmWithNickname = (password) => {
    if (selectedRoom) {
      const name = joinNickname.trim() || nickname;
      void doJoin(selectedRoom, password, name);
    }
  };
  const isRoomJoinable = (room) => {
    return room.status === "waiting" && room.players.length < room.maxPlayers;
  };
  const isRoomFull = (room) => {
    return room.players.length >= room.maxPlayers;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-sm", style: {
      borderColor: "var(--border-neon)",
      backgroundColor: "rgba(10, 10, 18, 0.85)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate("/"), className: "cyber-btn p-2 flex items-center", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, title: "返回", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-xl md:text-2xl tracking-widest", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px rgba(0, 255, 255, 0.5)"
      }, children: "公開房間" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        void loadRooms();
      }, disabled: loading, className: "cyber-btn p-2 flex items-center", style: {
        borderColor: "var(--green)",
        color: "var(--green)"
      }, title: "刷新", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 18, className: loading ? "animate-spin" : "" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex flex-wrap gap-2 md:gap-3 items-center border-b", style: {
      borderColor: "rgba(0, 255, 255, 0.1)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mr-1", children: "模式" }),
        MODE_OPTIONS.map((opt) => {
          const active = modeFilter === opt.value;
          const IconComp = opt.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setModeFilter(opt.value), className: "cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider flex items-center gap-1", style: {
            borderColor: active ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
            color: active ? "var(--cyan)" : "var(--text-secondary)",
            background: active ? "rgba(0, 255, 255, 0.1)" : "transparent",
            boxShadow: active ? "0 0 10px rgba(0, 255, 255, 0.2)" : "none"
          }, children: [
            IconComp && /* @__PURE__ */ jsxRuntimeExports.jsx(IconComp, { size: 12 }),
            opt.label
          ] }, String(opt.value));
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-px bg-[var(--border-neon)] hidden md:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mr-1", children: "人數" }),
        PLAYER_OPTIONS.map((opt) => {
          const active = playerFilter === opt.value;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPlayerFilter(opt.value), className: "cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider", style: {
            borderColor: active ? "var(--pink)" : "rgba(255, 107, 157, 0.2)",
            color: active ? "var(--pink)" : "var(--text-secondary)",
            background: active ? "rgba(255, 107, 157, 0.1)" : "transparent",
            boxShadow: active ? "0 0 10px rgba(255, 107, 157, 0.2)" : "none"
          }, children: opt.label }, String(opt.value));
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-px bg-[var(--border-neon)] hidden md:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mr-1", children: "狀態" }),
        STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setStatusFilter(opt.value), className: "cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider", style: {
            borderColor: active ? opt.color : `${opt.color}33`,
            color: active ? opt.color : "var(--text-secondary)",
            background: active ? `${opt.color}15` : "transparent",
            boxShadow: active ? `0 0 10px ${opt.color}33` : "none"
          }, children: opt.label }, String(opt.value));
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 px-4 py-4 overflow-auto", children: [
      error && rooms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 mb-4 text-sm text-center font-cyber tracking-wider", style: {
        color: "var(--red)",
        borderColor: "var(--red)"
      }, children: [
        error,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          void loadRooms();
        }, className: "ml-3 underline underline-offset-2", style: {
          color: "var(--green)"
        }, children: "重試" })
      ] }),
      loading && rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20 text-[var(--text-secondary)] font-cyber tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 32, className: "mx-auto mb-3 animate-spin", style: {
          color: "var(--cyan)"
        } }),
        "載入中..."
      ] }) : rooms.length === 0 ? (
        /* 空狀態：依是否出錯區分「載入失敗」與「真實無房間」 */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full flex items-center justify-center mb-4", style: {
            border: `1px solid ${error ? "var(--red)" : "var(--border-neon)"}`,
            boxShadow: error ? "0 0 20px rgba(255, 0, 0, 0.15)" : "0 0 20px rgba(0, 255, 255, 0.15)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 32, style: {
            color: error ? "var(--red)" : "var(--cyan)"
          } }) }),
          error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber text-lg tracking-wider text-[var(--text-primary)] mb-2", children: "無法載入房間列表" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-1", children: "聯機功能於靜態版不可用，部署後端後即可查看公開房間。" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-muted)] mb-6", children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              void loadRooms();
            }, disabled: loading, className: "cyber-btn px-6 py-2.5 text-sm font-cyber tracking-wider flex items-center gap-2", style: {
              borderColor: "var(--green)",
              color: "var(--green)",
              background: "rgba(0, 255, 128, 0.1)",
              boxShadow: "0 0 12px rgba(0, 255, 128, 0.3)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16, className: loading ? "animate-spin" : "" }),
              "重試"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber text-lg tracking-wider text-[var(--text-primary)] mb-2", children: "暫無公開房間" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-6", children: "建立第一個公開房間吧！" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/online/create"), className: "cyber-btn px-6 py-2.5 text-sm font-cyber tracking-wider flex items-center gap-2", style: {
              borderColor: "var(--green)",
              color: "var(--green)",
              background: "rgba(0, 255, 128, 0.1)",
              boxShadow: "0 0 12px rgba(0, 255, 128, 0.3)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              "建立房間"
            ] })
          ] })
        ] })
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4", children: rooms.map((room) => {
        const joinable = isRoomJoinable(room);
        const full = isRoomFull(room);
        const modeColor = MODE_COLORS[room.gameMode] || "var(--cyan)";
        const statusColor = STATUS_COLORS[room.status] || "var(--text-secondary)";
        const hostName = room.players[room.hostIndex]?.name || room.hostName;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex flex-col gap-3 transition-all hover:scale-[1.02]", style: {
          borderColor: `${modeColor}44`,
          boxShadow: `0 0 15px ${modeColor}22`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            room.hasPassword && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14, style: {
              color: "var(--yellow)",
              flexShrink: 0
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-cyber text-base md:text-lg tracking-wider truncate", style: {
              color: modeColor,
              textShadow: `0 0 8px ${modeColor}66`
            }, title: `${hostName}的房間`, children: [
              hostName,
              "的房間"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono tracking-[0.2em] text-[var(--text-muted)]", children: [
            "#",
            room.roomCode
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm", style: {
              color: modeColor,
              border: `1px solid ${modeColor}66`,
              backgroundColor: `${modeColor}15`
            }, children: MODE_LABELS[room.gameMode] || room.gameMode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm", style: {
              color: statusColor,
              border: `1px solid ${statusColor}66`,
              backgroundColor: `${statusColor}15`
            }, children: full ? "已滿" : STATUS_LABELS[room.status] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-auto pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm", style: {
              color: "var(--text-secondary)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber tracking-wider", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: full ? "var(--red)" : "var(--text-primary)"
                }, children: room.players.length }),
                " / ",
                room.maxPlayers,
                " 人"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleJoin(room), disabled: !joinable, className: "cyber-btn px-4 py-1.5 text-xs font-cyber tracking-wider", style: {
              borderColor: joinable ? "var(--green)" : "rgba(255, 255, 255, 0.1)",
              color: joinable ? "var(--green)" : "rgba(255, 255, 255, 0.3)",
              background: joinable ? "rgba(0, 255, 128, 0.1)" : "transparent",
              boxShadow: joinable ? "0 0 10px rgba(0, 255, 128, 0.3)" : "none",
              cursor: joinable ? "pointer" : "not-allowed"
            }, children: room.status === "playing" ? "觀戰" : full ? "已滿" : "加入" })
          ] })
        ] }, room.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordModal, { open: passwordModalOpen, roomName: selectedRoom ? `${selectedRoom.players[selectedRoom.hostIndex]?.name || selectedRoom.hostName}的房間` : void 0, onClose: () => {
      if (!passwordLoading) {
        setPasswordModalOpen(false);
        setSelectedRoom(null);
        setPasswordError("");
      }
    }, onConfirm: joinNickname ? handlePasswordConfirmWithNickname : handlePasswordConfirm, error: passwordError || (passwordLoading ? "驗證中..." : void 0) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: nicknameModalOpen, onOpenChange: (open) => {
      if (!open && !joinLoading) setNicknameModalOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "cyber-card max-w-sm", style: {
      borderColor: "var(--cyan)",
      boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, showCloseButton: false, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber text-xl tracking-wider text-center", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px rgba(0, 255, 255, 0.5)"
      }, children: "輸入你的暱稱" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: joinNickname, onChange: (e) => {
          setJoinNickname(e.target.value.slice(0, 10));
          setJoinError("");
        }, maxLength: 10, placeholder: "你的暱稱", className: "cyber-input w-full", style: {
          borderColor: "rgba(0, 255, 255, 0.4)",
          boxShadow: "0 0 8px rgba(0, 255, 255, 0.2)"
        }, autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-[var(--text-muted)]", children: [
          joinNickname.length,
          "/10"
        ] }),
        joinError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-center", style: {
          color: "var(--red)"
        }, children: joinError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setNicknameModalOpen(false), disabled: joinLoading, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
          borderColor: "rgba(255, 255, 255, 0.2)",
          color: "var(--text-secondary)"
        }, children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleNicknameConfirm, disabled: joinLoading || !joinNickname.trim(), className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)",
          background: "rgba(0, 255, 255, 0.1)",
          boxShadow: "0 0 12px rgba(0, 255, 255, 0.3)"
        }, children: joinLoading ? "加入中..." : "確認" })
      ] })
    ] }) })
  ] });
};
export {
  PublicRoomsPage as default
};
