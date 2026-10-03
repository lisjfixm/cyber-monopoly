import { u as useNavigate, a as usePlayerIdentity, r as reactExports, j as jsxRuntimeExports, L as Lock, c as rankingApi } from "./index-Clt-7orM.js";
import { m as monopolyApi } from "./monopoly-D9Pda8uf.js";
function isNetworkError(err) {
  if (err && typeof err === "object") {
    const e = err;
    if (e.isAxiosError && !e.response) return true;
    const msg = String(e.message ?? "").toLowerCase();
    return msg.includes("network") || msg.includes("failed to fetch") || msg.includes("timeout") || msg.includes("連接") || msg.includes("連線") || msg.includes("跨網域") || msg.includes("err_connection");
  }
  return false;
}
const OnlineJoinPage = () => {
  const navigate = useNavigate();
  const {
    visitorId
  } = usePlayerIdentity();
  const [roomCode, setRoomCode] = reactExports.useState("");
  const [playerName, setPlayerName] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const CODE_LEN = 6;
  const MAX_NAME_LEN = 10;
  const PWD_LEN = 4;
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, CODE_LEN);
    setRoomCode(value);
    setError("");
  };
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_NAME_LEN) return;
    setPlayerName(value);
    setError("");
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, PWD_LEN);
    setPassword(value);
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = playerName.trim();
    if (roomCode.length !== CODE_LEN) {
      setError("請輸入 6 位房間碼");
      return;
    }
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
      const pwd = password.length === PWD_LEN ? password : void 0;
      const result = await monopolyApi.joinRoom(roomCode, name, visitorId, pwd);
      navigate(`/online/room/${result.room.roomCode}?player=${result.playerIndex}`);
    } catch (err) {
      setLoading(false);
      setError(isNetworkError(err) ? "聯機功能於靜態版不可用，部署後端後即可加入房間。" : err instanceof Error ? err.message : "加入房間失敗");
      return;
    }
    setLoading(false);
  };
  const handleBack = () => {
    navigate("/");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md cyber-card p-6 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl md:text-3xl text-neon-pink text-center tracking-wider mb-2", children: "加入房間" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[var(--text-secondary)] text-sm mb-8 font-cyber tracking-wider", children: "輸入房間碼 · 加入戰局" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider text-neon-cyan", children: "房間碼" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: roomCode, onChange: handleCodeChange, placeholder: "請輸入 6 位數字房間碼", maxLength: CODE_LEN, inputMode: "numeric", className: "cyber-input text-center font-cyber text-2xl tracking-[0.3em]", style: {
          letterSpacing: "0.3em",
          borderColor: "rgba(0, 255, 255, 0.4)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-[var(--text-muted)]", children: [
          roomCode.length,
          "/",
          CODE_LEN
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-cyber text-sm tracking-wider", style: {
          color: "var(--blue)"
        }, children: "玩家暱稱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: playerName, onChange: handleNameChange, placeholder: "輸入你的暱稱", maxLength: MAX_NAME_LEN, className: "cyber-input", style: {
          borderColor: "rgba(77, 195, 255, 0.4)",
          boxShadow: "0 0 8px rgba(77, 195, 255, 0.2)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-[var(--text-muted)]", children: [
          playerName.length,
          "/",
          MAX_NAME_LEN
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-cyber text-sm tracking-wider flex items-center gap-2", style: {
          color: "var(--yellow)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14 }),
          "房間密碼（選填）"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: handlePasswordChange, placeholder: "如房間有密碼請輸入", maxLength: PWD_LEN, inputMode: "numeric", className: "cyber-input font-mono tracking-[0.3em] text-center", style: {
          borderColor: "rgba(255, 200, 0, 0.3)",
          boxShadow: password ? "0 0 8px rgba(255, 200, 0, 0.2)" : "none",
          color: "var(--yellow)",
          letterSpacing: "0.3em",
          paddingLeft: "0.75em"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-[var(--text-muted)]", children: [
          password.length,
          "/",
          PWD_LEN
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-center", style: {
        color: "var(--red)"
      }, children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "cyber-btn cyber-btn-pink w-full py-3 text-base", children: loading ? "加入中..." : "加入房間" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBack, className: "mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-pink transition-colors font-cyber tracking-wider", children: "← 返回主選單" })
  ] }) });
};
export {
  OnlineJoinPage as default
};
