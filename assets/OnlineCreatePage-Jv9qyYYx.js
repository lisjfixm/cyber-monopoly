import { u as useNavigate, a as usePlayerIdentity, r as reactExports, j as jsxRuntimeExports, U as Users, Z as Zap, S as Swords, G as Globe, T as Timer, b as TURN_TIME_OPTIONS, L as Lock, c as rankingApi } from "./index-Clt-7orM.js";
import { m as monopolyApi } from "./monopoly-D9Pda8uf.js";
const PLAYER_OPTIONS = [2, 4, 6];
function isNetworkError(err) {
  if (err && typeof err === "object") {
    const e = err;
    if (e.isAxiosError && !e.response) return true;
    const msg = String(e.message ?? "").toLowerCase();
    return msg.includes("network") || msg.includes("failed to fetch") || msg.includes("timeout") || msg.includes("連接") || msg.includes("連線") || msg.includes("跨網域") || msg.includes("err_connection");
  }
  return false;
}
const MODE_OPTIONS = [{
  value: "classic",
  label: "經典模式",
  desc: "標準大富翁規則",
  icon: Users
}, {
  value: "fast",
  label: "快速模式",
  desc: "低本金·高節奏",
  icon: Zap
}, {
  value: "crazy",
  label: "瘋狂模式",
  desc: "高風險·高回報",
  icon: Swords
}];
const OnlineCreatePage = () => {
  const navigate = useNavigate();
  const {
    visitorId
  } = usePlayerIdentity();
  const [hostName, setHostName] = reactExports.useState("");
  const [maxPlayers, setMaxPlayers] = reactExports.useState(2);
  const [gameMode, setGameMode] = reactExports.useState("classic");
  const [isPublic, setIsPublic] = reactExports.useState(true);
  const [blindAuction, setBlindAuction] = reactExports.useState(false);
  const [turnTimeLimit, setTurnTimeLimit] = reactExports.useState(0);
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const MAX_LEN = 10;
  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_LEN) return;
    setHostName(value);
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = hostName.trim();
    if (!name) {
      setError("請輸入你的暱稱");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (visitorId && name) {
        try {
          await rankingApi.getOrCreatePlayer(visitorId, name);
        } catch {
        }
      }
      const pwd = password.length === 4 ? password : void 0;
      const room = await monopolyApi.createRoom(name, maxPlayers, gameMode, visitorId, pwd, isPublic, blindAuction ? "blind" : void 0, turnTimeLimit > 0 ? turnTimeLimit : void 0);
      navigate(`/online/room/${room.roomCode}?player=0`);
    } catch (err) {
      setLoading(false);
      setError(isNetworkError(err) ? "聯機功能於靜態版不可用，部署後端後即可建立房間。" : err instanceof Error ? err.message : "建立房間失敗");
      return;
    }
    setLoading(false);
  };
  const handleBack = () => {
    navigate("/");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg cyber-card p-6 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl md:text-3xl text-neon-purple text-center tracking-wider mb-2", children: "建立房間" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[var(--text-secondary)] text-sm mb-8 font-cyber tracking-wider", children: "建立戰局 · 邀請對手" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider", style: {
          color: "var(--cyan)"
        }, children: "玩家人數" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 md:gap-3", children: PLAYER_OPTIONS.map((count) => {
          const selected = maxPlayers === count;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setMaxPlayers(count), className: "cyber-btn py-4 md:py-5 flex flex-col items-center gap-1 transition-all", style: {
            borderColor: selected ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
            color: selected ? "var(--cyan)" : "var(--text-secondary)",
            background: selected ? "rgba(0, 255, 255, 0.1)" : "transparent",
            boxShadow: selected ? "0 0 16px rgba(0, 255, 255, 0.3), inset 0 0 12px rgba(0, 255, 255, 0.1)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 md:w-6 md:h-6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-base md:text-lg tracking-wider", children: [
              count,
              "人"
            ] })
          ] }, count);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider", style: {
          color: "var(--pink)"
        }, children: "遊戲模式" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 md:gap-3", children: MODE_OPTIONS.map((mode) => {
          const selected = gameMode === mode.value;
          const IconComp = mode.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setGameMode(mode.value), className: "cyber-btn py-3 md:py-4 flex flex-col items-center gap-1 transition-all text-center px-1", style: {
            borderColor: selected ? "var(--pink)" : "rgba(255, 107, 157, 0.2)",
            color: selected ? "var(--pink)" : "var(--text-secondary)",
            background: selected ? "rgba(255, 107, 157, 0.08)" : "transparent",
            boxShadow: selected ? "0 0 16px rgba(255, 107, 157, 0.3), inset 0 0 12px rgba(255, 107, 157, 0.08)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconComp, { className: "w-5 h-5 md:w-6 md:h-6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-xs md:text-sm tracking-wider", children: mode.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] md:text-xs opacity-70 leading-tight", children: mode.desc })
          ] }, mode.value);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider", style: {
          color: "var(--purple)"
        }, children: "你的暱稱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: hostName, onChange: handleChange, placeholder: "輸入你的暱稱", maxLength: MAX_LEN, className: "cyber-input", style: {
          borderColor: "rgba(168, 85, 247, 0.4)",
          boxShadow: "0 0 8px rgba(168, 85, 247, 0.2)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-[var(--text-muted)]", children: [
          hostName.length,
          "/",
          MAX_LEN
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider", style: {
          color: "var(--cyan)"
        }, children: "公開房間" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setIsPublic((prev) => !prev), className: "cyber-btn w-full py-3 px-4 flex items-center justify-between text-sm font-cyber tracking-wider transition-all", style: {
          borderColor: isPublic ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
          color: isPublic ? "var(--cyan)" : "var(--text-secondary)",
          background: isPublic ? "rgba(0, 255, 255, 0.08)" : "transparent",
          boxShadow: isPublic ? "0 0 12px rgba(0, 255, 255, 0.2)" : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 16 }),
            isPublic ? "開啟（所有人可見）" : "關閉（僅邀請）"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-5 rounded-full relative transition-colors", style: {
            backgroundColor: isPublic ? "var(--cyan)" : "rgba(255, 255, 255, 0.15)",
            boxShadow: isPublic ? "0 0 8px rgba(0, 255, 255, 0.5)" : "none"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0.5 w-4 h-4 rounded-full transition-all", style: {
            backgroundColor: "var(--bg-deep)",
            left: isPublic ? "calc(100% - 18px)" : "2px"
          } }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider", style: {
          color: "var(--purple)"
        }, children: "暗拍模式" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setBlindAuction((prev) => !prev), className: "cyber-btn w-full py-3 px-4 flex items-center justify-between text-sm font-cyber tracking-wider transition-all", style: {
          borderColor: blindAuction ? "var(--purple)" : "rgba(168, 85, 247, 0.2)",
          color: blindAuction ? "var(--purple)" : "var(--text-secondary)",
          background: blindAuction ? "rgba(168, 85, 247, 0.08)" : "transparent",
          boxShadow: blindAuction ? "0 0 12px rgba(168, 85, 247, 0.3)" : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-cyber", style: {
              color: "var(--purple)"
            }, children: "匿名" }),
            blindAuction ? "開啟（秘密出價）" : "關閉（公開競標）"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-5 rounded-full relative transition-colors", style: {
            backgroundColor: blindAuction ? "var(--purple)" : "rgba(255, 255, 255, 0.15)",
            boxShadow: blindAuction ? "0 0 8px rgba(168, 85, 247, 0.5)" : "none"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0.5 w-4 h-4 rounded-full transition-all", style: {
            backgroundColor: "var(--bg-deep)",
            left: blindAuction ? "calc(100% - 18px)" : "2px"
          } }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-cyber text-sm tracking-wider flex items-center gap-2", style: {
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { size: 14 }),
          "回合倒計時"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 md:gap-3", children: TURN_TIME_OPTIONS.map((opt) => {
          const selected = turnTimeLimit === opt.value;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTurnTimeLimit(opt.value), className: "cyber-btn py-3 flex flex-col items-center gap-1 transition-all", style: {
            borderColor: selected ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
            color: selected ? "var(--cyan)" : "var(--text-secondary)",
            background: selected ? "rgba(0, 255, 255, 0.1)" : "transparent",
            boxShadow: selected ? "0 0 16px rgba(0, 255, 255, 0.3), inset 0 0 12px rgba(0, 255, 255, 0.1)" : "none"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-wider", children: opt.label }) }, opt.value);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)]", children: turnTimeLimit > 0 ? `倒計時結束將自動擲骰` : "無時間限制，玩家可慢慢思考" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-cyber text-sm tracking-wider flex items-center gap-2", style: {
          color: "var(--yellow)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14 }),
          "房間密碼（選填）"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
          setPassword(val);
          setError("");
        }, placeholder: "4 位數字密碼", maxLength: 4, inputMode: "numeric", className: "cyber-input font-mono tracking-[0.3em] text-center", style: {
          borderColor: "rgba(255, 200, 0, 0.3)",
          boxShadow: password ? "0 0 8px rgba(255, 200, 0, 0.2)" : "none",
          color: "var(--yellow)",
          letterSpacing: "0.3em",
          paddingLeft: "0.75em"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--text-muted)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "設定密碼後，其他人需要輸入密碼才能加入" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            password.length,
            "/4"
          ] })
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-center", style: {
        color: "var(--red)"
      }, children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "cyber-btn w-full py-3 text-base font-cyber tracking-wider", style: {
        borderColor: "var(--purple)",
        color: "var(--purple)",
        background: "rgba(168, 85, 247, 0.08)",
        boxShadow: "0 0 12px rgba(168, 85, 247, 0.3)"
      }, children: loading ? "建立中..." : "建立房間" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBack, className: "mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-purple transition-colors font-cyber tracking-wider", children: "← 返回主選單" })
  ] }) });
};
export {
  OnlineCreatePage as default
};
