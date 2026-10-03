import { a5 as axiosForBackend, l as logger, r as reactExports, j as jsxRuntimeExports } from "./index-Clt-7orM.js";
const GM_TOKEN_KEY = "cyber_monopoly_gm_token";
function getGmToken() {
  return localStorage.getItem(GM_TOKEN_KEY);
}
function setGmToken(token) {
  localStorage.setItem(GM_TOKEN_KEY, token);
}
function clearGmToken() {
  localStorage.removeItem(GM_TOKEN_KEY);
}
function hasGmToken() {
  return !!getGmToken();
}
async function gmRequest(url, method, data, params) {
  const token = getGmToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.append(key, String(value));
    }
    fullUrl = `${url}?${query.toString()}`;
  }
  try {
    const response = await axiosForBackend({
      url: fullUrl,
      method,
      data,
      headers
    });
    const result = response.data;
    if (result.code !== 0) {
      throw new Error(result.message || "請求失敗");
    }
    return result.data;
  } catch (err) {
    logger.error({
      level: "error",
      args: [`GM API 請求失敗: ${url}`, err instanceof Error ? err.message : String(err)]
    });
    throw err;
  }
}
const gmApi = {
  // ===== 認證 =====
  login: (password) => gmRequest("/api/gm/login", "POST", {
    password
  }),
  // ===== 使用者管理 =====
  searchUsers: (keyword) => gmRequest(`/api/gm/users`, "GET", void 0, {
    keyword
  }),
  getUserDetail: (userId) => gmRequest(`/api/gm/users/${encodeURIComponent(userId)}`, "GET"),
  updateUser: (userId, data) => gmRequest(`/api/gm/users/${encodeURIComponent(userId)}`, "PATCH", data),
  sendReward: (userId, data) => gmRequest(`/api/gm/users/${encodeURIComponent(userId)}/reward`, "POST", data),
  resetUser: (userId) => gmRequest(`/api/gm/users/${encodeURIComponent(userId)}/reset`, "POST"),
  // ===== 公告管理 =====
  getAnnouncements: () => gmRequest("/api/gm/announcements", "GET"),
  createAnnouncement: (data) => gmRequest("/api/gm/announcements", "POST", data),
  updateAnnouncement: (id, data) => gmRequest(`/api/gm/announcements/${encodeURIComponent(id)}`, "PATCH", data),
  deleteAnnouncement: (id) => gmRequest(`/api/gm/announcements/${encodeURIComponent(id)}`, "DELETE"),
  // ===== 活動管理 =====
  getEvents: () => gmRequest("/api/gm/events", "GET"),
  createEvent: (data) => gmRequest("/api/gm/events", "POST", data),
  updateEvent: (id, data) => gmRequest(`/api/gm/events/${encodeURIComponent(id)}`, "PATCH", data),
  deleteEvent: (id) => gmRequest(`/api/gm/events/${encodeURIComponent(id)}`, "DELETE"),
  // ===== 在線使用者 =====
  getOnlineUsers: () => gmRequest("/api/gm/online-users", "GET")
};
function isNetworkError(err) {
  if (err && typeof err === "object") {
    const e = err;
    if (e.isAxiosError && !e.response) return true;
    const msg = String(e.message ?? "").toLowerCase();
    return msg.includes("network") || msg.includes("failed to fetch") || msg.includes("timeout") || msg.includes("連接") || msg.includes("連線") || msg.includes("跨網域") || msg.includes("err_connection");
  }
  return false;
}
function errMsg(err, fallback) {
  if (isNetworkError(err)) {
    return "GM 後端於靜態版不可用，部署後端後即可使用主控台。";
  }
  return err instanceof Error ? err.message : fallback;
}
const PROVIDER_STYLES = {
  google: {
    color: "hsl(210, 100%, 65%)",
    bg: "rgba(66, 133, 244, 0.08)",
    glow: "rgba(66, 133, 244, 0.4)",
    label: "Google"
  },
  apple: {
    color: "hsl(0, 0%, 85%)",
    bg: "rgba(0, 0, 0, 0.4)",
    glow: "rgba(200, 200, 200, 0.3)",
    label: "Apple"
  },
  github: {
    color: "hsl(220, 20%, 80%)",
    bg: "rgba(30, 30, 40, 0.5)",
    glow: "rgba(140, 150, 180, 0.3)",
    label: "GitHub"
  }
};
function providerStyle(provider) {
  return PROVIDER_STYLES[provider] ?? PROVIDER_STYLES.google;
}
function providerLabel(provider) {
  return PROVIDER_STYLES[provider]?.label ?? provider;
}
const GM_MENU_ITEMS = [{
  key: "users",
  label: "使用者管理",
  icon: "用戶"
}, {
  key: "announcements",
  label: "公告管理",
  icon: "公告"
}, {
  key: "events",
  label: "活動管理",
  icon: "活動"
}, {
  key: "online",
  label: "在線使用者",
  icon: "在線"
}];
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "確認",
  cancelText = "取消",
  onConfirm,
  onCancel,
  danger = false
}) => {
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[90%] max-w-md p-6 rounded-lg", style: {
    background: "hsl(0, 30%, 8%)",
    border: "1px solid hsl(0, 100%, 60%)",
    boxShadow: "0 0 20px hsl(0, 100%, 50%, 0.5), inset 0 0 10px hsl(0, 100%, 50%, 0.2)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold mb-3 tracking-wider", style: {
      color: "hsl(0, 100%, 70%)",
      textShadow: "0 0 10px hsl(0, 100%, 60%)"
    }, children: [
      "警告 ",
      title
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-6", style: {
      color: "hsl(0, 20%, 80%)"
    }, children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "px-4 py-2 text-sm rounded transition-all", style: {
        border: "1px solid hsl(0, 50%, 40%)",
        color: "hsl(0, 20%, 70%)",
        background: "transparent"
      }, children: cancelText }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onConfirm, className: "px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
        background: danger ? "hsl(0, 100%, 45%)" : "hsl(0, 100%, 60%)",
        color: "white",
        boxShadow: "0 0 15px hsl(0, 100%, 60%, 0.6)"
      }, children: confirmText })
    ] })
  ] }) });
};
const GmInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea = false,
  rows = 3
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold tracking-wider", style: {
    color: "hsl(0, 80%, 75%)"
  }, children: label }),
  textarea ? /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value, onChange: (e) => onChange(e.target.value), placeholder, rows, className: "w-full px-3 py-2 text-sm rounded outline-none resize-y", style: {
    background: "hsl(0, 30%, 5%)",
    border: "1px solid hsl(0, 60%, 40%)",
    color: "hsl(0, 20%, 90%)",
    caretColor: "hsl(0, 100%, 60%)"
  } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, className: "w-full px-3 py-2 text-sm rounded outline-none", style: {
    background: "hsl(0, 30%, 5%)",
    border: "1px solid hsl(0, 60%, 40%)",
    color: "hsl(0, 20%, 90%)",
    caretColor: "hsl(0, 100%, 60%)"
  } })
] });
const GmSwitch = ({
  label,
  checked,
  onChange
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", style: {
    color: "hsl(0, 20%, 80%)"
  }, children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onChange(!checked), className: "relative w-12 h-6 rounded-full transition-all", style: {
    background: checked ? "hsl(0, 100%, 60%)" : "hsl(0, 20%, 20%)",
    boxShadow: checked ? "0 0 10px hsl(0, 100%, 60%, 0.6)" : "none"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", style: {
    left: checked ? "26px" : "2px"
  } }) })
] });
const GmLoginView = ({
  onSuccess
}) => {
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [shake, setShake] = reactExports.useState(false);
  const handleSubmit = reactExports.useCallback(async () => {
    if (!password.trim()) {
      setError("請輸入密碼");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await gmApi.login(password);
      setGmToken(result.token);
      logger.info({
        level: "info",
        args: ["GM 登入成功"]
      });
      onSuccess();
    } catch (err) {
      setError(errMsg(err, "密碼錯誤"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      logger.error({
        level: "error",
        args: ["GM 登入失敗", errMsg(err, "密碼錯誤")]
      });
    } finally {
      setLoading(false);
    }
  }, [password, onSuccess]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-4", style: {
    background: "hsl(0, 30%, 5%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-0 left-0 right-0 py-2 text-center text-sm font-bold tracking-widest", style: {
      background: "hsl(0, 100%, 20%)",
      color: "hsl(0, 100%, 80%)",
      textShadow: "0 0 5px hsl(0, 100%, 60%)",
      borderBottom: "1px solid hsl(0, 100%, 50%)",
      boxShadow: "0 2px 20px hsl(0, 100%, 50%, 0.3)"
    }, children: "警告 GM 控制台 - 僅限授權人員使用 警告" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full max-w-md p-8 rounded-lg ${shake ? "animate-pulse" : ""}`, style: {
      background: "hsl(0, 30%, 8%)",
      border: "2px solid hsl(0, 100%, 60%)",
      boxShadow: "0 0 30px hsl(0, 100%, 50%, 0.4), inset 0 0 30px hsl(0, 100%, 50%, 0.1)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-4", style: {
          textShadow: "0 0 20px hsl(0, 100%, 60%)"
        }, children: "管理" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-widest mb-2", style: {
          color: "hsl(0, 100%, 60%)",
          textShadow: "0 0 15px hsl(0, 100%, 60%), 0 0 30px hsl(0, 100%, 60%)"
        }, children: "GM 控制台" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm tracking-wide", style: {
          color: "hsl(0, 30%, 60%)"
        }, children: "CYBER MONOPOLY ADMINISTRATION" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold mb-2 tracking-wider", style: {
            color: "hsl(0, 80%, 75%)"
          }, children: "請輸入管理員密碼" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleSubmit(), placeholder: "GM PASSWORD", className: "w-full px-4 py-3 text-lg rounded outline-none tracking-widest", style: {
            background: "hsl(0, 30%, 5%)",
            border: "2px solid hsl(0, 80%, 50%)",
            color: "hsl(0, 100%, 70%)",
            caretColor: "hsl(0, 100%, 60%)",
            boxShadow: "inset 0 0 10px hsl(0, 100%, 50%, 0.2)"
          }, autoFocus: true })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-2 px-4 rounded text-sm font-bold animate-pulse", style: {
          background: "hsl(0, 100%, 20%, 0.5)",
          color: "hsl(0, 100%, 80%)",
          border: "1px solid hsl(0, 100%, 50%)"
        }, children: [
          "錯誤 ",
          error
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSubmit, disabled: loading, className: "w-full py-3 text-lg font-bold rounded tracking-widest transition-all hover:scale-[1.02] disabled:opacity-50", style: {
          background: "linear-gradient(135deg, hsl(0, 100%, 50%), hsl(0, 100%, 30%))",
          color: "white",
          boxShadow: "0 0 20px hsl(0, 100%, 60%, 0.6)",
          border: "1px solid hsl(0, 100%, 70%)"
        }, children: loading ? "驗證中..." : "進 入" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 pt-4 text-center text-xs tracking-wider", style: {
        color: "hsl(0, 50%, 40%)",
        borderTop: "1px dashed hsl(0, 50%, 30%)"
      }, children: [
        "警告 未經授權存取將被記錄 警告",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "UNAUTHORIZED ACCESS WILL BE TRACED"
      ] })
    ] })
  ] });
};
const UsersSection = () => {
  const [keyword, setKeyword] = reactExports.useState("");
  const [users, setUsers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [editingUser, setEditingUser] = reactExports.useState(null);
  const [editForm, setEditForm] = reactExports.useState({});
  const [skinText, setSkinText] = reactExports.useState("");
  const [titleText, setTitleText] = reactExports.useState("");
  const [showReward, setShowReward] = reactExports.useState(false);
  const [rewardCoins, setRewardCoins] = reactExports.useState("");
  const [rewardItems, setRewardItems] = reactExports.useState("");
  const [rewardSkins, setRewardSkins] = reactExports.useState("");
  const [rewardReason, setRewardReason] = reactExports.useState("");
  const [confirmReset, setConfirmReset] = reactExports.useState(null);
  const [successMsg, setSuccessMsg] = reactExports.useState("");
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2e3);
  };
  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("請輸入關鍵字");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await gmApi.searchUsers(keyword);
      setUsers(result);
    } catch (err) {
      const msg = errMsg(err, "搜尋失敗");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      coins: user.coins,
      level: user.level,
      isBanned: user.isBanned,
      banReason: "",
      unlockedSkins: [],
      unlockedTitles: []
    });
    setSkinText("");
    setTitleText("");
    setShowReward(false);
  };
  const handleSave = async () => {
    if (!editingUser) return;
    const patch = {};
    if (editForm.elo !== void 0) patch.elo = Number(editForm.elo);
    if (editForm.wins !== void 0) patch.wins = Number(editForm.wins);
    if (editForm.losses !== void 0) patch.losses = Number(editForm.losses);
    if (editForm.coins !== void 0) patch.coins = Number(editForm.coins);
    if (editForm.level !== void 0) patch.level = Number(editForm.level);
    if (editForm.isBanned !== void 0) patch.isBanned = editForm.isBanned;
    if (editForm.isBanned && editForm.banReason) patch.banReason = editForm.banReason;
    if (skinText.trim()) {
      patch.unlockedSkins = skinText.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (titleText.trim()) {
      patch.unlockedTitles = titleText.split(",").map((s) => s.trim()).filter(Boolean);
    }
    try {
      const updated = await gmApi.updateUser(editingUser.id, patch);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      setEditingUser(null);
      showSuccess("使用者資料已更新");
    } catch (err) {
      const msg = errMsg(err, "更新失敗");
      setError(msg);
    }
  };
  const handleSendReward = async () => {
    if (!editingUser) return;
    if (!rewardCoins.trim() && !rewardItems.trim() && !rewardSkins.trim()) {
      setError("請至少填寫一項獎勵內容");
      return;
    }
    const data = {};
    if (rewardCoins.trim()) {
      const coins = Number(rewardCoins);
      if (!Number.isFinite(coins)) {
        setError("金幣數量必須是有效數字");
        return;
      }
      data.coins = coins;
    }
    if (rewardItems.trim()) {
      const items = {};
      rewardItems.split(",").forEach((pair) => {
        const [k, v] = pair.split(":").map((s) => s.trim());
        if (k && v) items[k] = Number(v);
      });
      if (Object.keys(items).length > 0) data.items = items;
    }
    if (rewardSkins.trim()) {
      data.skins = rewardSkins.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (rewardReason.trim()) data.reason = rewardReason;
    try {
      await gmApi.sendReward(editingUser.id, data);
      setShowReward(false);
      setRewardCoins("");
      setRewardItems("");
      setRewardSkins("");
      setRewardReason("");
      showSuccess("獎勵已發放");
    } catch (err) {
      const msg = errMsg(err, "發放失敗");
      setError(msg);
    }
  };
  const handleReset = async () => {
    if (!confirmReset) return;
    try {
      await gmApi.resetUser(confirmReset);
      setUsers((prev) => prev.filter((u) => u.id !== confirmReset));
      setConfirmReset(null);
      setEditingUser(null);
      showSuccess("使用者數據已重置");
    } catch (err) {
      const msg = errMsg(err, "重置失敗");
      setError(msg);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    successMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm font-bold text-center", style: {
      background: "hsl(140, 50%, 15%)",
      color: "hsl(140, 80%, 70%)",
      border: "1px solid hsl(140, 60%, 40%)"
    }, children: [
      "成功 ",
      successMsg
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm text-center", style: {
      background: "hsl(0, 60%, 15%)",
      color: "hsl(0, 80%, 70%)",
      border: "1px solid hsl(0, 60%, 40%)"
    }, children: [
      "錯誤 ",
      error
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: keyword, onChange: (e) => setKeyword(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleSearch(), placeholder: "輸入暱稱或帳號搜尋...", className: "flex-1 px-4 py-2 rounded outline-none", style: {
        background: "hsl(0, 30%, 5%)",
        border: "1px solid hsl(0, 60%, 40%)",
        color: "hsl(0, 20%, 90%)",
        caretColor: "hsl(0, 100%, 60%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSearch, disabled: loading, className: "px-6 py-2 font-bold rounded transition-all hover:scale-105 disabled:opacity-50", style: {
        background: "hsl(0, 100%, 50%)",
        color: "white",
        boxShadow: "0 0 10px hsl(0, 100%, 60%, 0.5)"
      }, children: loading ? "搜尋中..." : "搜尋" })
    ] }),
    users.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded", style: {
      border: "1px solid hsl(0, 50%, 30%)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: {
        background: "hsl(0, 40%, 12%)"
      }, children: ["ID", "暱稱", "第三方登入", "ELO", "勝場", "等級", "註冊時間", "狀態", "操作"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-bold tracking-wider", style: {
        color: "hsl(0, 80%, 70%)"
      }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", style: {
        borderColor: "hsl(0, 30%, 20%)",
        background: "hsl(0, 20%, 6%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", style: {
          color: "hsl(0, 20%, 60%)"
        }, children: [
          user.id.slice(0, 8),
          "..."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-bold", style: {
          color: "hsl(0, 20%, 90%)"
        }, children: user.nickname }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: user.oauthBindings && user.oauthBindings.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: user.oauthBindings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded text-xs font-bold", style: {
          border: `1px solid ${providerStyle(b.provider).color}`,
          color: providerStyle(b.provider).color,
          background: providerStyle(b.provider).bg,
          boxShadow: `0 0 6px ${providerStyle(b.provider).glow}`
        }, children: providerLabel(b.provider) }, b.provider)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
          color: "hsl(0, 20%, 45%)"
        }, children: "無" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", style: {
          color: "hsl(0, 20%, 80%)"
        }, children: user.elo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", style: {
          color: "hsl(0, 20%, 80%)"
        }, children: user.wins }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", style: {
          color: "hsl(0, 20%, 80%)"
        }, children: [
          "Lv.",
          user.level
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", style: {
          color: "hsl(0, 20%, 60%)"
        }, children: new Date(user.createdAt).toLocaleDateString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded text-xs font-bold", style: {
          background: user.isBanned ? "hsl(0, 80%, 20%)" : "hsl(140, 50%, 15%)",
          color: user.isBanned ? "hsl(0, 100%, 70%)" : "hsl(140, 80%, 60%)"
        }, children: user.isBanned ? "已封禁" : "正常" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(user), className: "px-3 py-1 text-xs rounded transition-all hover:scale-105", style: {
          border: "1px solid hsl(0, 60%, 50%)",
          color: "hsl(0, 100%, 70%)",
          background: "transparent"
        }, children: "編輯" }) })
      ] }, user.id)) })
    ] }) }),
    editingUser && !showReward && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-lg", style: {
      background: "hsl(0, 30%, 8%)",
      border: "2px solid hsl(0, 100%, 60%)",
      boxShadow: "0 0 30px hsl(0, 100%, 50%, 0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold mb-4 tracking-wider", style: {
        color: "hsl(0, 100%, 70%)",
        textShadow: "0 0 10px hsl(0, 100%, 60%)"
      }, children: [
        "編輯使用者 - ",
        editingUser.nickname
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "ELO 評分", type: "number", value: editForm.elo ?? 0, onChange: (v) => setEditForm({
          ...editForm,
          elo: Number(v)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "勝場", type: "number", value: editForm.wins ?? 0, onChange: (v) => setEditForm({
          ...editForm,
          wins: Number(v)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "負場", type: "number", value: editForm.losses ?? 0, onChange: (v) => setEditForm({
          ...editForm,
          losses: Number(v)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "金幣", type: "number", value: editForm.coins ?? 0, onChange: (v) => setEditForm({
          ...editForm,
          coins: Number(v)
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "等級", type: "number", value: editForm.level ?? 1, onChange: (v) => setEditForm({
          ...editForm,
          level: Number(v)
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "已解鎖皮膚（逗號分隔）", value: skinText, onChange: setSkinText, placeholder: "例如: mecha,ufo,dragon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "已解鎖稱號（逗號分隔）", value: titleText, onChange: setTitleText, placeholder: "例如: tycoon,champion" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 rounded", style: {
        border: "1px solid hsl(270, 60%, 40%)",
        background: "hsl(270, 30%, 8%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold mb-2 tracking-wider", style: {
          color: "hsl(270, 90%, 75%)",
          textShadow: "0 0 6px hsl(270, 80%, 60%)"
        }, children: "第三方登入綁定" }),
        editingUser.oauthBindings && editingUser.oauthBindings.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: editingUser.oauthBindings.map((b) => {
          const style = providerStyle(b.provider);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 rounded", style: {
            border: `1px solid ${style.color}`,
            background: style.bg,
            boxShadow: `0 0 8px ${style.glow}`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
                color: style.color,
                textShadow: `0 0 4px ${style.glow}`
              }, children: providerLabel(b.provider) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
                color: "hsl(0, 20%, 70%)"
              }, children: b.displayName || b.email || b.providerUserId })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
                color: "hsl(0, 20%, 50%)"
              }, children: "綁定時間" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono", style: {
                color: "hsl(0, 20%, 70%)"
              }, children: new Date(b.boundAt).toLocaleString("zh-TW") })
            ] })
          ] }, b.provider);
        }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
          color: "hsl(0, 20%, 50%)"
        }, children: "此使用者未綁定任何第三方帳號" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6 p-3 rounded", style: {
        border: "1px solid hsl(0, 60%, 30%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmSwitch, { label: "封禁狀態", checked: !!editForm.isBanned, onChange: (v) => setEditForm({
          ...editForm,
          isBanned: v
        }) }),
        editForm.isBanned && /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "封禁原因", value: editForm.banReason ?? "", onChange: (v) => setEditForm({
          ...editForm,
          banReason: v
        }), placeholder: "請輸入封禁原因" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowReward(true), className: "px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
          background: "hsl(40, 80%, 45%)",
          color: "white",
          boxShadow: "0 0 10px hsl(40, 80%, 50%, 0.5)"
        }, children: "發放獎勵" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmReset(editingUser.id), className: "px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
          background: "hsl(0, 80%, 30%)",
          color: "white",
          border: "1px solid hsl(0, 100%, 60%)"
        }, children: "警告 重置數據" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditingUser(null), className: "px-4 py-2 text-sm rounded", style: {
          border: "1px solid hsl(0, 50%, 40%)",
          color: "hsl(0, 20%, 70%)",
          background: "transparent"
        }, children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSave, className: "px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
          background: "hsl(0, 100%, 50%)",
          color: "white",
          boxShadow: "0 0 10px hsl(0, 100%, 60%, 0.5)"
        }, children: "保存" })
      ] })
    ] }) }),
    showReward && editingUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md p-6 rounded-lg", style: {
      background: "hsl(0, 30%, 8%)",
      border: "2px solid hsl(40, 80%, 50%)",
      boxShadow: "0 0 30px hsl(40, 80%, 50%, 0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold mb-4 tracking-wider", style: {
        color: "hsl(40, 100%, 70%)",
        textShadow: "0 0 10px hsl(40, 80%, 50%)"
      }, children: [
        "發放獎勵 - ",
        editingUser.nickname
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "金幣數量", type: "number", value: rewardCoins, onChange: setRewardCoins, placeholder: "例如: 1000" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "道具（格式: 道具ID:數量，逗號分隔）", value: rewardItems, onChange: setRewardItems, placeholder: "例如: double_dice:2,shield:1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "皮膚（逗號分隔）", value: rewardSkins, onChange: setRewardSkins, placeholder: "例如: mecha,gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "發放原因", value: rewardReason, onChange: setRewardReason, placeholder: "例如: 活動獎勵", textarea: true, rows: 2 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowReward(false), className: "px-4 py-2 text-sm rounded", style: {
          border: "1px solid hsl(0, 50%, 40%)",
          color: "hsl(0, 20%, 70%)",
          background: "transparent"
        }, children: "返回" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSendReward, className: "px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
          background: "hsl(40, 80%, 50%)",
          color: "white",
          boxShadow: "0 0 10px hsl(40, 80%, 60%, 0.5)"
        }, children: "確認發放" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirmReset, title: "確認重置？", message: "此操作將清空該使用者的所有遊戲數據（金幣、ELO、皮膚等），且無法恢復。", confirmText: "確認重置", danger: true, onConfirm: handleReset, onCancel: () => setConfirmReset(null) })
  ] });
};
const AnnouncementsSection = () => {
  const [list, setList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(null);
  const [isNew, setIsNew] = reactExports.useState(false);
  const [formTitle, setFormTitle] = reactExports.useState("");
  const [formContent, setFormContent] = reactExports.useState("");
  const [formPriority, setFormPriority] = reactExports.useState("0");
  const [formActive, setFormActive] = reactExports.useState(true);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [successMsg, setSuccessMsg] = reactExports.useState("");
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2e3);
  };
  const loadList = reactExports.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await gmApi.getAnnouncements();
      setList(data);
    } catch (err) {
      const msg = errMsg(err, "載入失敗");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadList();
  }, [loadList]);
  const openNew = () => {
    setIsNew(true);
    setEditing(null);
    setFormTitle("");
    setFormContent("");
    setFormPriority("0");
    setFormActive(true);
  };
  const openEdit = (a) => {
    setIsNew(false);
    setEditing(a);
    setFormTitle(a.title);
    setFormContent(a.content);
    setFormPriority(String(a.priority));
    setFormActive(a.isActive);
  };
  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      setError("標題和內容不能為空");
      return;
    }
    try {
      const payload = {
        title: formTitle,
        content: formContent,
        priority: Number(formPriority),
        isActive: formActive
      };
      if (isNew) {
        const created = await gmApi.createAnnouncement(payload);
        setList((prev) => [created, ...prev]);
      } else if (editing) {
        const updated = await gmApi.updateAnnouncement(editing.id, payload);
        setList((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      }
      setEditing(null);
      setIsNew(false);
      showSuccess("公告已保存");
    } catch (err) {
      const msg = errMsg(err, "保存失敗");
      setError(msg);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await gmApi.deleteAnnouncement(deleteId);
      setList((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      showSuccess("公告已刪除");
    } catch (err) {
      const msg = errMsg(err, "刪除失敗");
      setError(msg);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    successMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm font-bold text-center", style: {
      background: "hsl(140, 50%, 15%)",
      color: "hsl(140, 80%, 70%)",
      border: "1px solid hsl(140, 60%, 40%)"
    }, children: [
      "成功 ",
      successMsg
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm text-center", style: {
      background: "hsl(0, 60%, 15%)",
      color: "hsl(0, 80%, 70%)",
      border: "1px solid hsl(0, 60%, 40%)"
    }, children: [
      "錯誤 ",
      error,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        void loadList();
      }, className: "ml-3 underline underline-offset-2", children: "重試" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-wider", style: {
        color: "hsl(0, 100%, 70%)"
      }, children: "公告列表" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openNew, className: "px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
        background: "hsl(0, 100%, 50%)",
        color: "white",
        boxShadow: "0 0 10px hsl(0, 100%, 60%, 0.5)"
      }, children: "+ 新增公告" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", style: {
      color: "hsl(0, 30%, 60%)"
    }, children: "載入中..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      list.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", style: {
        color: "hsl(0, 30%, 60%)"
      }, children: "尚無公告" }),
      list.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", style: {
        background: "hsl(0, 20%, 6%)",
        border: "1px solid hsl(0, 40%, 25%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", style: {
              color: "hsl(0, 20%, 90%)"
            }, children: a.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded text-xs font-bold", style: {
              background: a.isActive ? "hsl(140, 50%, 15%)" : "hsl(0, 30%, 20%)",
              color: a.isActive ? "hsl(140, 80%, 60%)" : "hsl(0, 30%, 60%)"
            }, children: a.isActive ? "啟用" : "停用" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", style: {
              color: "hsl(0, 30%, 50%)"
            }, children: [
              "優先級: ",
              a.priority
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
            color: "hsl(0, 20%, 60%)"
          }, children: [
            "創建時間: ",
            new Date(a.createdAt).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(a), className: "px-3 py-1 text-xs rounded", style: {
            border: "1px solid hsl(0, 60%, 50%)",
            color: "hsl(0, 100%, 70%)",
            background: "transparent"
          }, children: "編輯" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(a.id), className: "px-3 py-1 text-xs rounded", style: {
            border: "1px solid hsl(0, 80%, 50%)",
            color: "hsl(0, 100%, 80%)",
            background: "hsl(0, 60%, 15%)"
          }, children: "刪除" })
        ] })
      ] }, a.id))
    ] }),
    (editing || isNew) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg p-6 rounded-lg", style: {
      background: "hsl(0, 30%, 8%)",
      border: "2px solid hsl(0, 100%, 60%)",
      boxShadow: "0 0 30px hsl(0, 100%, 50%, 0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold mb-4 tracking-wider", style: {
        color: "hsl(0, 100%, 70%)",
        textShadow: "0 0 10px hsl(0, 100%, 60%)"
      }, children: isNew ? "新增公告" : "編輯公告" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "標題", value: formTitle, onChange: setFormTitle, placeholder: "請輸入公告標題" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "內容", value: formContent, onChange: setFormContent, placeholder: "請輸入公告內容", textarea: true, rows: 5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "優先級", type: "number", value: formPriority, onChange: setFormPriority }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GmSwitch, { label: "啟用狀態", checked: formActive, onChange: setFormActive }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setEditing(null);
          setIsNew(false);
        }, className: "px-4 py-2 text-sm rounded", style: {
          border: "1px solid hsl(0, 50%, 40%)",
          color: "hsl(0, 20%, 70%)",
          background: "transparent"
        }, children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSave, className: "px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
          background: "hsl(0, 100%, 50%)",
          color: "white",
          boxShadow: "0 0 10px hsl(0, 100%, 60%, 0.5)"
        }, children: "保存" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!deleteId, title: "確認刪除？", message: "此公告將被永久刪除，無法恢復。", confirmText: "確認刪除", danger: true, onConfirm: handleDelete, onCancel: () => setDeleteId(null) })
  ] });
};
const EventsSection = () => {
  const [list, setList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(null);
  const [isNew, setIsNew] = reactExports.useState(false);
  const [formName, setFormName] = reactExports.useState("");
  const [formType, setFormType] = reactExports.useState("economic_crisis");
  const [formDesc, setFormDesc] = reactExports.useState("");
  const [formActive, setFormActive] = reactExports.useState(true);
  const [formStart, setFormStart] = reactExports.useState("");
  const [formEnd, setFormEnd] = reactExports.useState("");
  const [formConfig, setFormConfig] = reactExports.useState("{}");
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [successMsg, setSuccessMsg] = reactExports.useState("");
  const EVENT_TYPE_OPTIONS = [{
    value: "double_coins",
    label: "雙倍金幣"
  }, {
    value: "double_exp",
    label: "雙倍經驗"
  }, {
    value: "limited_item",
    label: "限時道具"
  }, {
    value: "economic_crisis",
    label: "經濟危機"
  }, {
    value: "tech_boom",
    label: "科技繁榮"
  }, {
    value: "neon_festival",
    label: "霓虹嘉年華"
  }];
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2e3);
  };
  const loadList = reactExports.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await gmApi.getEvents();
      setList(data);
    } catch (err) {
      const msg = errMsg(err, "載入失敗");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadList();
  }, [loadList]);
  const openNew = () => {
    setIsNew(true);
    setEditing(null);
    setFormName("");
    setFormType("economic_crisis");
    setFormDesc("");
    setFormActive(true);
    setFormStart("");
    setFormEnd("");
    setFormConfig("{}");
  };
  const openEdit = (e) => {
    setIsNew(false);
    setEditing(e);
    setFormName(e.name);
    setFormType(e.eventType);
    setFormDesc(e.description || "");
    setFormActive(e.isActive);
    setFormStart(e.startsAt ? e.startsAt.slice(0, 16) : "");
    setFormEnd(e.endsAt ? e.endsAt.slice(0, 16) : "");
    setFormConfig(JSON.stringify(e.config, null, 2));
  };
  const handleSave = async () => {
    if (!formName.trim()) {
      setError("活動名稱不能為空");
      return;
    }
    if (formStart && formEnd && new Date(formEnd).getTime() <= new Date(formStart).getTime()) {
      setError("結束時間必須晚於開始時間");
      return;
    }
    let config = {};
    try {
      config = JSON.parse(formConfig);
    } catch {
      setError("配置 JSON 格式錯誤");
      return;
    }
    if (typeof config !== "object" || config === null || Array.isArray(config)) {
      setError("配置 JSON 必須是物件（{}）");
      return;
    }
    try {
      const payload = {
        name: formName,
        eventType: formType,
        description: formDesc,
        isActive: formActive,
        startsAt: formStart || void 0,
        endsAt: formEnd || void 0,
        config
      };
      if (isNew) {
        const created = await gmApi.createEvent(payload);
        setList((prev) => [created, ...prev]);
      } else if (editing) {
        const updated = await gmApi.updateEvent(editing.id, payload);
        setList((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      }
      setEditing(null);
      setIsNew(false);
      showSuccess("活動已保存");
    } catch (err) {
      const msg = errMsg(err, "保存失敗");
      setError(msg);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await gmApi.deleteEvent(deleteId);
      setList((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      showSuccess("活動已刪除");
    } catch (err) {
      const msg = errMsg(err, "刪除失敗");
      setError(msg);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    successMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm font-bold text-center", style: {
      background: "hsl(140, 50%, 15%)",
      color: "hsl(140, 80%, 70%)",
      border: "1px solid hsl(140, 60%, 40%)"
    }, children: [
      "成功 ",
      successMsg
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm text-center", style: {
      background: "hsl(0, 60%, 15%)",
      color: "hsl(0, 80%, 70%)",
      border: "1px solid hsl(0, 60%, 40%)"
    }, children: [
      "錯誤 ",
      error,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        void loadList();
      }, className: "ml-3 underline underline-offset-2", children: "重試" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-wider", style: {
        color: "hsl(0, 100%, 70%)"
      }, children: "活動列表" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openNew, className: "px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
        background: "hsl(0, 100%, 50%)",
        color: "white",
        boxShadow: "0 0 10px hsl(0, 100%, 60%, 0.5)"
      }, children: "+ 新增活動" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", style: {
      color: "hsl(0, 30%, 60%)"
    }, children: "載入中..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      list.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", style: {
        color: "hsl(0, 30%, 60%)"
      }, children: "尚無活動" }),
      list.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", style: {
        background: "hsl(0, 20%, 6%)",
        border: "1px solid hsl(0, 40%, 25%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", style: {
              color: "hsl(0, 20%, 90%)"
            }, children: e.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded text-xs font-bold", style: {
              background: "hsl(270, 50%, 20%)",
              color: "hsl(270, 80%, 70%)"
            }, children: e.eventType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded text-xs font-bold", style: {
              background: e.isActive ? "hsl(140, 50%, 15%)" : "hsl(0, 30%, 20%)",
              color: e.isActive ? "hsl(140, 80%, 60%)" : "hsl(0, 30%, 60%)"
            }, children: e.isActive ? "啟用" : "停用" })
          ] }),
          e.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mb-1", style: {
            color: "hsl(0, 20%, 70%)"
          }, children: e.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
            color: "hsl(0, 20%, 60%)"
          }, children: [
            e.startsAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "開始: ",
              new Date(e.startsAt).toLocaleString()
            ] }),
            e.endsAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " 〜 結束: ",
              new Date(e.endsAt).toLocaleString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(e), className: "px-3 py-1 text-xs rounded", style: {
            border: "1px solid hsl(0, 60%, 50%)",
            color: "hsl(0, 100%, 70%)",
            background: "transparent"
          }, children: "編輯" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(e.id), className: "px-3 py-1 text-xs rounded", style: {
            border: "1px solid hsl(0, 80%, 50%)",
            color: "hsl(0, 100%, 80%)",
            background: "hsl(0, 60%, 15%)"
          }, children: "刪除" })
        ] })
      ] }, e.id))
    ] }),
    (editing || isNew) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-lg", style: {
      background: "hsl(0, 30%, 8%)",
      border: "2px solid hsl(0, 100%, 60%)",
      boxShadow: "0 0 30px hsl(0, 100%, 50%, 0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold mb-4 tracking-wider", style: {
        color: "hsl(0, 100%, 70%)",
        textShadow: "0 0 10px hsl(0, 100%, 60%)"
      }, children: isNew ? "新增活動" : "編輯活動" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "活動名稱", value: formName, onChange: setFormName, placeholder: "請輸入活動名稱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold tracking-wider", style: {
            color: "hsl(0, 80%, 75%)"
          }, children: "活動類型" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: formType, onChange: (e) => setFormType(e.target.value), className: "w-full px-3 py-2 text-sm rounded outline-none", style: {
            background: "hsl(0, 30%, 5%)",
            border: "1px solid hsl(0, 60%, 40%)",
            color: "hsl(0, 20%, 90%)"
          }, children: EVENT_TYPE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: opt.value, children: opt.label }, opt.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "描述", value: formDesc, onChange: setFormDesc, placeholder: "請輸入活動描述", textarea: true, rows: 2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmSwitch, { label: "啟用狀態", checked: formActive, onChange: setFormActive }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "開始時間", type: "datetime-local", value: formStart, onChange: setFormStart }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "結束時間", type: "datetime-local", value: formEnd, onChange: setFormEnd })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GmInput, { label: "配置（JSON）", value: formConfig, onChange: setFormConfig, placeholder: '{"multiplier": 2}', textarea: true, rows: 4 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setEditing(null);
          setIsNew(false);
        }, className: "px-4 py-2 text-sm rounded", style: {
          border: "1px solid hsl(0, 50%, 40%)",
          color: "hsl(0, 20%, 70%)",
          background: "transparent"
        }, children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSave, className: "px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
          background: "hsl(0, 100%, 50%)",
          color: "white",
          boxShadow: "0 0 10px hsl(0, 100%, 60%, 0.5)"
        }, children: "保存" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!deleteId, title: "確認刪除？", message: "此活動將被永久刪除，無法恢復。", confirmText: "確認刪除", danger: true, onConfirm: handleDelete, onCancel: () => setDeleteId(null) })
  ] });
};
const OnlineUsersSection = () => {
  const [list, setList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const loadList = reactExports.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await gmApi.getOnlineUsers();
      setList(data);
    } catch (err) {
      const msg = errMsg(err, "載入失敗");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadList();
  }, [loadList]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-wider", style: {
        color: "hsl(0, 100%, 70%)"
      }, children: "在線使用者" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadList, className: "px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105", style: {
        border: "1px solid hsl(0, 60%, 50%)",
        color: "hsl(0, 100%, 70%)",
        background: "transparent"
      }, children: "重新整理" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded text-sm text-center", style: {
      background: "hsl(0, 60%, 15%)",
      color: "hsl(0, 80%, 70%)",
      border: "1px solid hsl(0, 60%, 40%)"
    }, children: [
      "錯誤 ",
      error
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", style: {
      color: "hsl(0, 30%, 60%)"
    }, children: "載入中..." }) : list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", style: {
      color: "hsl(0, 30%, 60%)"
    }, children: "當無在線使用者" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded", style: {
      border: "1px solid hsl(0, 50%, 30%)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: {
        background: "hsl(0, 40%, 12%)"
      }, children: ["暱稱", "ELO", "等級", "最後活躍"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-bold tracking-wider", style: {
        color: "hsl(0, 80%, 70%)"
      }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: list.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", style: {
        borderColor: "hsl(0, 30%, 20%)",
        background: "hsl(0, 20%, 6%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-bold", style: {
          color: "hsl(0, 20%, 90%)"
        }, children: user.nickname }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", style: {
          color: "hsl(0, 20%, 80%)"
        }, children: user.elo }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", style: {
          color: "hsl(0, 20%, 80%)"
        }, children: [
          "Lv.",
          user.level
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", style: {
          color: "hsl(0, 20%, 60%)"
        }, children: new Date(user.lastActiveAt).toLocaleTimeString() })
      ] }, user.id)) })
    ] }) })
  ] });
};
const GmMainPanel = ({
  onLogout
}) => {
  const [activeMenu, setActiveMenu] = reactExports.useState("users");
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(false);
  const renderContent = () => {
    switch (activeMenu) {
      case "users":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(UsersSection, {});
      case "announcements":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AnnouncementsSection, {});
      case "events":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(EventsSection, {});
      case "online":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(OnlineUsersSection, {});
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col", style: {
    background: "hsl(0, 30%, 5%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex items-center justify-between px-4 py-3", style: {
      background: "hsl(0, 40%, 8%)",
      borderBottom: "2px solid hsl(0, 100%, 50%)",
      boxShadow: "0 2px 20px hsl(0, 100%, 50%, 0.3)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "md:hidden text-2xl", style: {
          color: "hsl(0, 100%, 70%)"
        }, children: "選單" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg md:text-xl font-bold tracking-widest", style: {
          color: "hsl(0, 100%, 60%)",
          textShadow: "0 0 10px hsl(0, 100%, 60%)"
        }, children: "GM 控制台" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLogout, className: "px-4 py-1.5 text-sm font-bold rounded transition-all hover:scale-105", style: {
        border: "1px solid hsl(0, 80%, 50%)",
        color: "hsl(0, 100%, 70%)",
        background: "transparent"
      }, children: "退出 GM" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: `${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-20 w-56 h-[calc(100vh-57px)] transition-transform flex flex-col`, style: {
        background: "hsl(0, 30%, 7%)",
        borderRight: "1px solid hsl(0, 50%, 30%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 py-4 px-2 space-y-1", children: GM_MENU_ITEMS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setActiveMenu(item.key);
          setSidebarOpen(false);
        }, className: "w-full flex items-center gap-3 px-4 py-3 text-left rounded transition-all", style: {
          background: activeMenu === item.key ? "hsl(0, 80%, 20%)" : "transparent",
          color: activeMenu === item.key ? "hsl(0, 100%, 90%)" : "hsl(0, 20%, 70%)",
          boxShadow: activeMenu === item.key ? "inset 0 0 10px hsl(0, 100%, 50%, 0.3)" : "none",
          borderLeft: activeMenu === item.key ? "3px solid hsl(0, 100%, 60%)" : "3px solid transparent"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: item.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tracking-wider text-sm", children: item.label })
        ] }, item.key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-xs text-center tracking-wider", style: {
          color: "hsl(0, 30%, 40%)",
          borderTop: "1px dashed hsl(0, 30%, 25%)"
        }, children: [
          "系統版本 v1.0.0",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "警告 所有操作均被記錄"
        ] })
      ] }),
      sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden fixed inset-0 z-10 bg-black/60", onClick: () => setSidebarOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-5xl mx-auto", children: renderContent() }) })
    ] })
  ] });
};
const GmPanelPage = () => {
  const [isLoggedIn, setIsLoggedIn] = reactExports.useState(() => hasGmToken());
  const handleLoginSuccess = reactExports.useCallback(() => {
    setIsLoggedIn(true);
  }, []);
  const handleLogout = reactExports.useCallback(() => {
    clearGmToken();
    setIsLoggedIn(false);
    logger.info({
      level: "info",
      args: ["GM 已登出"]
    });
  }, []);
  return isLoggedIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(GmMainPanel, { onLogout: handleLogout }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GmLoginView, { onSuccess: handleLoginSuccess });
};
export {
  GmPanelPage as default
};
