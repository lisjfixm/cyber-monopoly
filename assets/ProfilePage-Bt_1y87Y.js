import { d as createLucideIcon, r as reactExports, j as jsxRuntimeExports, X, aS as PAWN_SKINS, aT as DICE_SKINS, aU as getOAuthLinkError, aV as getOAuthLinkSuccess, at as Check, $ as TriangleAlert, aW as LoaderCircle, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, az as DialogDescription, aX as CircleX, aA as DialogFooter, aY as getOAuthBindings, l as logger, aZ as getOAuthLinkUrl, a_ as unbindOAuthProvider, u as useNavigate, a as usePlayerIdentity, k as useAchievements, a$ as useTitles, b0 as useAvatarFrame, b1 as Image, b2 as RotateCcw, b3 as TitleEffect, t as Crown, aP as TrendingUp, aN as Target, aK as Award, Z as Zap, aJ as Coins, b4 as ChevronRight, b5 as ChartColumn, b6 as BookOpen, U as Users, b7 as Palette, b8 as TITLE_IDS, aE as TITLES, b9 as Sparkles, L as Lock, ba as AVATAR_FRAMES, aC as RefreshCw, bb as CircleCheckBig } from "./index-ymfxQ6bv.js";
import { m as monopolyApi } from "./monopoly-1z6oaVCn.js";
import { u as useSkinStorage } from "./useSkinStorage-BzYeq5R7.js";
import { g as getBattlePassState } from "./battlepass-CtvuemYg.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { C as Calendar } from "./calendar-DzeNaHko.js";
const __iconNode$4 = [
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193", key: "yfwify" }],
  [
    "path",
    { d: "M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07", key: "jlfiyv" }
  ]
];
const CloudOff = createLucideIcon("cloud-off", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
];
const Cloud = createLucideIcon("cloud", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
const Link2 = createLucideIcon("link-2", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
];
const Video = createLucideIcon("video", __iconNode);
const ENABLED_KEY = "cyber_cloud_save_enabled";
const LAST_SYNCED_KEY = "cyber_cloud_save_last_synced";
function readEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}
function writeEnabled(value) {
  try {
    localStorage.setItem(ENABLED_KEY, value ? "1" : "0");
  } catch {
  }
}
function readLastSynced() {
  try {
    return localStorage.getItem(LAST_SYNCED_KEY);
  } catch {
    return null;
  }
}
function writeLastSynced(iso) {
  try {
    localStorage.setItem(LAST_SYNCED_KEY, iso);
  } catch {
  }
}
function collectLocalSaveData() {
  const achievements = (() => {
    try {
      const raw = localStorage.getItem("monopoly_achievements");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
    }
    return [];
  })();
  const settings = (() => {
    try {
      const raw = localStorage.getItem("monopoly_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) return parsed;
      }
    } catch {
    }
    return {};
  })();
  const skins = (() => {
    try {
      const raw = localStorage.getItem("monopoly_skins");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) return parsed;
      }
    } catch {
    }
    return {};
  })();
  const battlePass = (() => {
    try {
      const raw = localStorage.getItem("monopoly_battlepass");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      }
    } catch {
    }
    return {
      level: 1,
      exp: 0,
      totalExp: 0,
      premium: false,
      claimedFree: [],
      claimedPremium: [],
      season: "s1"
    };
  })();
  const dailyChallenge = (() => {
    try {
      const raw = localStorage.getItem("monopoly_daily_challenge");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) return parsed;
      }
    } catch {
    }
    return {
      id: "",
      type: "fate_only",
      name: "",
      description: "",
      rules: [],
      reward: {
        exp: 0,
        coins: 0
      }
    };
  })();
  const matchHistory = (() => {
    try {
      const raw = localStorage.getItem("monopoly_match_history");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
    }
    return [];
  })();
  const localUpdated = readLastSynced() ?? (/* @__PURE__ */ new Date(0)).toISOString();
  return {
    achievements,
    settings,
    skins,
    battlePass,
    dailyChallenge,
    matchHistory,
    updatedAt: localUpdated
  };
}
function applySaveDataToLocal(save) {
  try {
    localStorage.setItem("monopoly_achievements", JSON.stringify(save.achievements));
  } catch {
  }
  try {
    localStorage.setItem("monopoly_settings", JSON.stringify(save.settings));
  } catch {
  }
  try {
    localStorage.setItem("monopoly_skins", JSON.stringify(save.skins));
  } catch {
  }
  try {
    localStorage.setItem("monopoly_battlepass", JSON.stringify(save.battlePass));
  } catch {
  }
  try {
    localStorage.setItem("monopoly_daily_challenge", JSON.stringify(save.dailyChallenge));
  } catch {
  }
  try {
    localStorage.setItem("monopoly_match_history", JSON.stringify(save.matchHistory));
  } catch {
  }
}
function useCloudSave(visitorId) {
  const [enabled, setEnabled] = reactExports.useState(() => readEnabled());
  const [syncStatus, setSyncStatus] = reactExports.useState("idle");
  const [lastSyncedAt, setLastSyncedAt] = reactExports.useState(() => readLastSynced());
  const [errorMessage, setErrorMessage] = reactExports.useState("");
  const conflictSaveRef = reactExports.useRef(null);
  const syncingRef = reactExports.useRef(false);
  const enableCloudSave = reactExports.useCallback(() => {
    writeEnabled(true);
    setEnabled(true);
    setErrorMessage("");
  }, []);
  const disableCloudSave = reactExports.useCallback(() => {
    writeEnabled(false);
    setEnabled(false);
    setSyncStatus("idle");
    setErrorMessage("");
    conflictSaveRef.current = null;
  }, []);
  const syncNow = reactExports.useCallback(async () => {
    if (!visitorId) return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncStatus("syncing");
    setErrorMessage("");
    try {
      const localSave = collectLocalSaveData();
      const cloudSave = await monopolyApi.getSaveData(visitorId);
      if (!cloudSave) {
        const response = await monopolyApi.uploadSaveData(visitorId, {
          ...localSave,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }, localSave.updatedAt);
        writeLastSynced(response.updatedAt);
        setLastSyncedAt(response.updatedAt);
        setSyncStatus("synced");
        return;
      }
      const localTime = new Date(localSave.updatedAt).getTime();
      const cloudTime = new Date(cloudSave.updatedAt).getTime();
      if (localTime > cloudTime) {
        const response = await monopolyApi.uploadSaveData(visitorId, {
          ...localSave,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }, cloudSave.updatedAt);
        if (response.conflict) {
          conflictSaveRef.current = response.saveData;
          setSyncStatus("conflict");
          return;
        }
        writeLastSynced(response.updatedAt);
        setLastSyncedAt(response.updatedAt);
        setSyncStatus("synced");
      } else if (cloudTime > localTime) {
        conflictSaveRef.current = cloudSave;
        setSyncStatus("conflict");
      } else {
        writeLastSynced(cloudSave.updatedAt);
        setLastSyncedAt(cloudSave.updatedAt);
        setSyncStatus("synced");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "同步失敗";
      setErrorMessage(message);
      setSyncStatus("error");
    } finally {
      syncingRef.current = false;
    }
  }, [visitorId]);
  const resolveConflict = reactExports.useCallback(async (choose) => {
    if (!visitorId) return;
    const conflictSave = conflictSaveRef.current;
    setSyncStatus("syncing");
    setErrorMessage("");
    try {
      if (choose === "local") {
        const localSave = collectLocalSaveData();
        const response = await monopolyApi.uploadSaveData(visitorId, {
          ...localSave,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }, conflictSave?.updatedAt ?? (/* @__PURE__ */ new Date(0)).toISOString());
        writeLastSynced(response.updatedAt);
        setLastSyncedAt(response.updatedAt);
      } else {
        if (conflictSave) {
          applySaveDataToLocal(conflictSave);
          writeLastSynced(conflictSave.updatedAt);
          setLastSyncedAt(conflictSave.updatedAt);
        }
      }
      conflictSaveRef.current = null;
      setSyncStatus("synced");
    } catch (err) {
      const message = err instanceof Error ? err.message : "同步失敗";
      setErrorMessage(message);
      setSyncStatus("error");
    }
  }, [visitorId]);
  reactExports.useEffect(() => {
    if (enabled && visitorId) {
      void syncNow();
    }
  }, [enabled, visitorId]);
  return {
    syncStatus,
    lastSyncedAt,
    enabled,
    enableCloudSave,
    disableCloudSave,
    syncNow,
    resolveConflict,
    errorMessage
  };
}
const RARITY_COLORS = {
  common: "var(--text-secondary)",
  rare: "var(--blue)",
  epic: "var(--purple)",
  legendary: "var(--yellow)"
};
const RARITY_LABELS = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說"
};
const PawnPreview = ({
  skin,
  unlocked
}) => {
  const baseColor = unlocked ? "var(--cyan)" : "var(--text-muted)";
  const glowColor = unlocked ? "0 0 10px var(--cyan-glow), 0 0 20px var(--cyan)" : "none";
  if (skin === "default") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center border-2", style: {
      backgroundColor: unlocked ? "var(--bg-mid)" : "transparent",
      borderColor: baseColor,
      boxShadow: glowColor
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold", style: {
      color: unlocked ? baseColor : "var(--text-muted)"
    }, children: "1" }) });
  }
  if (skin === "mecha") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-12 h-12 flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        background: unlocked ? "linear-gradient(135deg, #64748b, #1e293b, #475569)" : "var(--bg-mid)",
        border: `2px solid ${baseColor}`,
        boxShadow: glowColor
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-3 h-3 rounded-sm", style: {
        background: unlocked ? "var(--cyan)" : "var(--text-muted)",
        boxShadow: unlocked ? "0 0 6px var(--cyan-glow)" : "none"
      } })
    ] });
  }
  if (skin === "ufo") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-12 h-12 flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-0 w-12 h-4 rounded-full", style: {
        background: unlocked ? "linear-gradient(180deg, #94a3b8, #475569)" : "var(--bg-mid)",
        border: `1px solid ${baseColor}`,
        boxShadow: glowColor
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-full", style: {
        background: unlocked ? "linear-gradient(180deg, var(--cyan-glow), var(--cyan))" : "var(--bg-mid)",
        border: `1px solid ${baseColor}`,
        borderBottom: "none"
      } }),
      unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-7 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full", style: {
        background: "var(--pink)",
        boxShadow: "0 0 6px var(--pink-glow)"
      } })
    ] });
  }
  if (skin === "dragon") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-12 h-12 flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: {
        background: unlocked ? "radial-gradient(circle at 30% 30%, #fef3c7, #facc15, #ca8a04)" : "var(--bg-mid)",
        border: `2px solid ${baseColor}`,
        boxShadow: unlocked ? "0 0 12px var(--yellow), 0 0 24px rgba(250, 204, 21, 0.5)" : "none"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "relative w-5 h-5", viewBox: "0 0 24 24", fill: unlocked ? "#dc2626" : "var(--text-muted)", style: {
        filter: unlocked ? "drop-shadow(0 0 2px #fca5a5)" : "none"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) })
    ] });
  }
  return null;
};
const DicePreview = ({
  skin,
  unlocked
}) => {
  const dots = ["top-left", "center", "bottom-right"];
  const getDotClass = (pos) => {
    switch (pos) {
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "top-left":
        return "top-[20%] left-[20%]";
      case "bottom-right":
        return "bottom-[20%] right-[20%]";
      default:
        return "";
    }
  };
  const faceStyles = (() => {
    if (!unlocked) {
      return {
        background: "var(--bg-mid)",
        border: "1px solid var(--text-muted)",
        opacity: 0.5
      };
    }
    switch (skin) {
      case "gold":
        return {
          background: "linear-gradient(135deg, #fef3c7, #facc15, #d97706)",
          border: "2px solid #b45309",
          boxShadow: "0 0 10px rgba(250, 204, 21, 0.6)"
        };
      case "neon":
        return {
          background: "linear-gradient(135deg, var(--bg-dark), var(--bg-mid))",
          border: "2px solid var(--pink)",
          boxShadow: "0 0 12px var(--pink-glow), inset 0 0 8px rgba(255, 0, 180, 0.2)"
        };
      case "pixel":
        return {
          background: "#2d1b69",
          border: "3px solid #22c55e",
          imageRendering: "pixelated",
          boxShadow: "4px 4px 0 #166534",
          borderRadius: "2px"
        };
      default:
        return {
          background: "linear-gradient(135deg, var(--bg-dark), var(--bg-mid))",
          border: "2px solid var(--cyan)",
          boxShadow: "0 0 8px rgba(0, 255, 255, 0.4)"
        };
    }
  })();
  const dotStyles = (() => {
    if (!unlocked) {
      return {
        backgroundColor: "var(--text-muted)"
      };
    }
    switch (skin) {
      case "gold":
        return {
          backgroundColor: "#78350f",
          boxShadow: "inset 0 0 2px rgba(0,0,0,0.3)"
        };
      case "neon":
        return {
          backgroundColor: "var(--pink)",
          boxShadow: "0 0 6px var(--pink-glow), 0 0 12px var(--pink)"
        };
      case "pixel":
        return {
          backgroundColor: "#22c55e",
          borderRadius: "0",
          boxShadow: "none"
        };
      default:
        return {
          backgroundColor: "var(--cyan)",
          boxShadow: "0 0 4px var(--cyan-glow), 0 0 8px var(--cyan)"
        };
    }
  })();
  const dotSize = skin === "pixel" ? "w-2 h-2" : "w-2.5 h-2.5";
  const dotRadius = skin === "pixel" ? "rounded-none" : "rounded-full";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-12 h-12", style: {
    ...faceStyles,
    borderRadius: skin === "pixel" ? "2px" : "6px"
  }, children: dots.map((pos, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute ${dotSize} ${dotRadius} ${getDotClass(pos)}`, style: dotStyles }, i)) });
};
function SkinCard({
  config,
  isCurrent,
  unlocked,
  onSelect,
  preview,
  skinLevel = 1,
  upgradeCost = Infinity,
  canUpgrade = false,
  onUpgrade,
  fragments = 0
}) {
  const rarityColor = RARITY_COLORS[config.rarity];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex flex-col items-center gap-2 relative", style: {
    borderColor: unlocked ? `color-mix(in srgb, ${rarityColor} 30%, transparent)` : "color-mix(in srgb, var(--text-muted) 15%, transparent)",
    opacity: unlocked ? 1 : 0.6
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-1.5 text-[10px] font-cyber tracking-wider px-1.5 py-0.5", style: {
      color: rarityColor,
      border: `1px solid ${rarityColor}`,
      backgroundColor: `color-mix(in srgb, ${rarityColor} 10%, transparent)`
    }, children: RARITY_LABELS[config.rarity] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 flex items-center justify-center mt-2", children: preview }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider text-center", style: {
      color: unlocked ? "var(--text-primary)" : "var(--text-muted)"
    }, children: config.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto w-full", children: [
      !unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-center font-cyber tracking-wide py-1", style: {
        color: "var(--text-muted)"
      }, children: "未解锁" }) : isCurrent ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-center font-cyber tracking-wider py-1", style: {
        color: "var(--green)",
        border: "1px solid var(--green)",
        backgroundColor: "color-mix(in srgb, var(--green) 10%, transparent)"
      }, children: "使用中" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onSelect(config.id), className: "w-full cyber-btn py-1 text-xs font-cyber tracking-wider", style: {
        borderColor: rarityColor,
        color: rarityColor
      }, children: "使用" }),
      unlocked && upgradeCost !== Infinity && onUpgrade && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-center mb-1", style: {
          color: "var(--text-muted)"
        }, children: [
          "等級 ",
          skinLevel,
          " → ",
          skinLevel + 1,
          " · 碎片 ",
          fragments,
          "/",
          upgradeCost
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onUpgrade(config.id), disabled: !canUpgrade, className: "w-full cyber-btn py-1 text-xs font-cyber tracking-wider", style: {
          borderColor: canUpgrade ? "var(--yellow)" : "var(--text-muted)",
          color: canUpgrade ? "var(--yellow)" : "var(--text-muted)",
          opacity: canUpgrade ? 1 : 0.5
        }, children: skinLevel >= 3 ? "星 傳說 星" : "升級" })
      ] })
    ] }),
    !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-center", style: {
      color: "var(--text-muted)"
    }, children: config.unlockCondition })
  ] });
}
const SkinSelectModal = ({
  isOpen,
  onClose,
  currentPawnSkin,
  currentDiceSkin,
  unlockedPawnSkins,
  unlockedDiceSkins,
  onSelectPawn,
  onSelectDice,
  skinFragments = 0,
  skinLevels = {},
  onUpgradePawn
}) => {
  const [activeTab, setActiveTab] = reactExports.useState("pawn");
  if (!isOpen) return null;
  const pawnSkinIds = ["default", "mecha", "ufo", "dragon"];
  const diceSkinIds = ["default", "gold", "neon", "pixel"];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: {
    backgroundColor: "color-mix(in srgb, var(--bg-deep) 85%, transparent)",
    backdropFilter: "blur(4px)",
    animation: "fade-in 0.2s ease-out"
  }, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-md p-5 relative", style: {
    borderColor: "var(--pink)",
    boxShadow: "0 0 30px color-mix(in srgb, var(--pink) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--pink) 10%, transparent)",
    animation: "modal-pop 0.25s ease-out"
  }, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "absolute top-3 right-3 p-1.5 rounded transition-colors hover:bg-white/10", style: {
      color: "var(--text-secondary)"
    }, "aria-label": "關閉", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl text-center tracking-widest mb-2", style: {
      color: "var(--pink)",
      textShadow: "0 0 10px var(--pink-glow), 0 0 20px var(--pink-glow)"
    }, children: "皮膚倉庫" }),
    skinFragments > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm mb-4", style: {
      color: "var(--yellow)"
    }, children: [
      "星光 皮膚碎片：",
      skinFragments
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-5 p-1 rounded", style: {
      backgroundColor: "color-mix(in srgb, var(--bg-mid) 80%, transparent)",
      border: "1px solid var(--border-neon-cyan)"
    }, children: ["pawn", "dice"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveTab(tab), className: "flex-1 py-2 text-sm font-cyber tracking-wider transition-all", style: {
      color: activeTab === tab ? "var(--cyan)" : "var(--text-secondary)",
      backgroundColor: activeTab === tab ? "color-mix(in srgb, var(--cyan) 15%, transparent)" : "transparent",
      borderBottom: activeTab === tab ? "2px solid var(--cyan)" : "2px solid transparent",
      textShadow: activeTab === tab ? "0 0 6px var(--cyan-glow)" : "none"
    }, children: tab === "pawn" ? "棋子" : "骰子" }, tab)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1", children: [
      activeTab === "pawn" && pawnSkinIds.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkinCard, { config: PAWN_SKINS[id], isCurrent: currentPawnSkin === id, unlocked: unlockedPawnSkins.includes(id), onSelect: onSelectPawn, preview: /* @__PURE__ */ jsxRuntimeExports.jsx(PawnPreview, { skin: id, unlocked: unlockedPawnSkins.includes(id) }), skinLevel: skinLevels[id] ?? 1, upgradeCost: (skinLevels[id] ?? 1) >= 3 ? Infinity : skinLevels[id] === 2 ? 30 : 10, canUpgrade: (skinLevels[id] ?? 1) < 3 && skinFragments >= (skinLevels[id] === 2 ? 30 : 10), onUpgrade: onUpgradePawn, fragments: skinFragments }, id)),
      activeTab === "dice" && diceSkinIds.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkinCard, { config: DICE_SKINS[id], isCurrent: currentDiceSkin === id, unlocked: unlockedDiceSkins.includes(id), onSelect: onSelectDice, preview: /* @__PURE__ */ jsxRuntimeExports.jsx(DicePreview, { skin: id, unlocked: unlockedDiceSkins.includes(id) }) }, id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-[11px] text-center font-cyber tracking-wider", style: {
      color: "var(--text-muted)"
    }, children: "解鎖更多成就以獲取稀有皮膚" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none opacity-20 rounded", style: {
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, var(--pink) 3%, transparent) 2px, color-mix(in srgb, var(--pink) 3%, transparent) 4px)"
    } })
  ] }) });
};
const PROVIDER_CONFIGS = [{
  provider: "google",
  label: "Google",
  brandColor: "hsl(210, 100%, 60%)",
  glowColor: "rgba(66, 133, 244, 0.5)",
  bgColor: "rgba(255, 255, 255, 0.04)",
  textColor: "hsl(210, 20%, 95%)"
}, {
  provider: "apple",
  label: "Apple",
  brandColor: "hsl(0, 0%, 85%)",
  glowColor: "rgba(200, 200, 200, 0.4)",
  bgColor: "rgba(0, 0, 0, 0.5)",
  textColor: "hsl(0, 0%, 92%)"
}, {
  provider: "github",
  label: "GitHub",
  brandColor: "hsl(220, 15%, 70%)",
  glowColor: "rgba(140, 150, 180, 0.4)",
  bgColor: "rgba(30, 30, 40, 0.6)",
  textColor: "hsl(220, 20%, 92%)"
}];
function AccountBindingsSection({
  isLoggedIn
}) {
  const [loading, setLoading] = reactExports.useState(false);
  const [bindings, setBindings] = reactExports.useState([]);
  const [hasPassword, setHasPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [linkProvider, setLinkProvider] = reactExports.useState(null);
  const [unbindDialog, setUnbindDialog] = reactExports.useState(null);
  const [unbinding, setUnbinding] = reactExports.useState(false);
  const [unbindError, setUnbindError] = reactExports.useState("");
  const [linkSuccess, setLinkSuccess] = reactExports.useState("");
  const loadBindings = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    try {
      const result = await getOAuthBindings();
      setBindings(result.bindings);
      setHasPassword(result.hasPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入失敗";
      setError(message);
      logger.error("Failed to load OAuth bindings", {
        error: err
      });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (isLoggedIn) {
      void loadBindings();
    }
  }, [isLoggedIn]);
  reactExports.useEffect(() => {
    if (!isLoggedIn) return;
    const linkError = getOAuthLinkError();
    if (linkError) {
      setError(linkError);
    }
    if (getOAuthLinkSuccess()) {
      setLinkSuccess("第三方帳號綁定成功");
      setTimeout(() => setLinkSuccess(""), 5e3);
    }
  }, [isLoggedIn]);
  const handleLink = async (provider) => {
    if (linkProvider) return;
    setLinkProvider(provider);
    setError("");
    try {
      const url = await getOAuthLinkUrl(provider);
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "取得授權網址失敗";
      setError(message);
      logger.error("Failed to get OAuth link URL", {
        provider,
        error: err
      });
      setLinkProvider(null);
    }
  };
  const handleUnbindConfirm = async () => {
    if (!unbindDialog) return;
    setUnbinding(true);
    setUnbindError("");
    try {
      await unbindOAuthProvider(unbindDialog);
      setUnbindDialog(null);
      await loadBindings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "解除綁定失敗";
      setUnbindError(message);
      logger.error("Failed to unbind OAuth provider", {
        provider: unbindDialog,
        error: err
      });
    } finally {
      setUnbinding(false);
    }
  };
  const isProviderBound = (provider) => bindings.find((b) => b.provider === provider);
  if (!isLoggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
      opacity: 0.6
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 18, style: {
          color: "var(--text-secondary)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
          color: "var(--text-secondary)"
        }, children: "第三方帳號綁定" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: "請先登入後再進行第三方帳號綁定" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 18, style: {
          color: "var(--purple)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
          color: "var(--purple)"
        }, children: "第三方帳號綁定" })
      ] }),
      hasPassword && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber flex items-center gap-1", style: {
        color: "var(--green)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }),
        "密碼登入已啟用"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-2 text-xs font-cyber flex items-center gap-2", style: {
      border: "1px solid var(--red)",
      color: "var(--red)",
      background: "rgba(255, 0, 0, 0.08)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
      error
    ] }),
    linkSuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-2 text-xs font-cyber flex items-center gap-2", style: {
      border: "1px solid var(--green)",
      color: "var(--green)",
      background: "rgba(0, 255, 128, 0.08)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
      linkSuccess
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4 font-cyber text-xs", style: {
      color: "var(--text-secondary)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin inline mr-2" }),
      "載入中..."
    ] }),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: PROVIDER_CONFIGS.map((config) => {
      const bound = isProviderBound(config.provider);
      const isLinking = linkProvider === config.provider;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3", style: {
        border: `1px solid ${config.brandColor}`,
        backgroundColor: config.bgColor,
        boxShadow: `0 0 8px ${config.glowColor}`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-cyber tracking-wide", style: {
            color: config.textColor,
            textShadow: `0 0 6px ${config.glowColor}`
          }, children: config.label }),
          bound && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber flex items-center gap-1", style: {
            color: "var(--green)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }),
            bound.displayName || bound.email || "已綁定"
          ] })
        ] }),
        bound ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setUnbindDialog(config.provider);
          setUnbindError("");
        }, className: "px-3 py-1 text-xs font-cyber tracking-wider transition-all rounded-sm", style: {
          border: "1px solid var(--red)",
          color: "var(--red)",
          background: "rgba(255, 0, 0, 0.08)",
          cursor: "pointer"
        }, children: "解除綁定" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void handleLink(config.provider), disabled: isLinking, className: "px-3 py-1 text-xs font-cyber tracking-wider transition-all rounded-sm", style: {
          border: `1px solid ${config.brandColor}`,
          color: config.textColor,
          background: "transparent",
          cursor: isLinking ? "not-allowed" : "pointer",
          opacity: isLinking ? 0.6 : 1
        }, children: isLinking ? "跳轉中..." : "關聯" })
      ] }, config.provider);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs font-cyber text-center", style: {
      color: "var(--text-secondary)"
    }, children: "綁定後可用第三方帳號快速登入" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!unbindDialog, onOpenChange: (open) => {
      if (!open) setUnbindDialog(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "解除第三方綁定" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "確定要解除 ",
          unbindDialog ? PROVIDER_CONFIGS.find((c) => c.provider === unbindDialog)?.label : "",
          " 帳號的綁定嗎？ 解除後將無法再使用該第三方帳號登入。"
        ] })
      ] }),
      unbindError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 text-xs font-cyber flex items-center gap-2", style: {
        border: "1px solid var(--red)",
        color: "var(--red)",
        background: "rgba(255, 0, 0, 0.08)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 14 }),
        unbindError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setUnbindDialog(null), className: "px-4 py-2 text-sm font-cyber tracking-wider", style: {
          border: "1px solid var(--text-secondary)",
          color: "var(--text-secondary)",
          background: "transparent",
          cursor: "pointer"
        }, children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleUnbindConfirm, disabled: unbinding, className: "px-4 py-2 text-sm font-cyber tracking-wider", style: {
          border: "1px solid var(--red)",
          color: "var(--red)",
          background: "rgba(255, 0, 0, 0.1)",
          cursor: unbinding ? "not-allowed" : "pointer",
          opacity: unbinding ? 0.6 : 1,
          boxShadow: "0 0 10px rgba(255, 0, 0, 0.3)"
        }, children: unbinding ? "處理中..." : "確定解除" })
      ] })
    ] }) })
  ] });
}
const MAX_NICKNAME_LEN = 20;
function getRankTitle(elo) {
  if (elo >= 2e3) return {
    text: "王者",
    color: "var(--yellow)"
  };
  if (elo >= 1700) return {
    text: "大師",
    color: "var(--purple)"
  };
  if (elo >= 1400) return {
    text: "鑽石",
    color: "var(--cyan)"
  };
  if (elo >= 1100) return {
    text: "鉑金",
    color: "hsl(210, 50%, 70%)"
  };
  return {
    text: "青銅",
    color: "hsl(25, 60%, 50%)"
  };
}
const StatCard = ({
  label,
  value,
  icon: Icon,
  color
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 text-center", style: {
  borderColor: `color-mix(in srgb, ${color} 30%, transparent)`
}, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 mx-auto mb-1", style: {
    color
  } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-2xl md:text-3xl font-bold", style: {
    color,
    textShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)`
  }, children: value }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mt-1 font-cyber tracking-wider", children: label })
] });
const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    nickname,
    playerProfile,
    loading,
    setNickname,
    refreshProfile,
    visitorId
  } = usePlayerIdentity();
  const [editing, setEditing] = reactExports.useState(false);
  const [editValue, setEditValue] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const {
    syncStatus,
    lastSyncedAt,
    enabled,
    enableCloudSave,
    disableCloudSave,
    syncNow,
    resolveConflict,
    errorMessage: cloudError
  } = useCloudSave(visitorId);
  const {
    pawnSkin,
    diceSkin,
    unlockedPawnSkins,
    unlockedDiceSkins,
    setPawnSkin,
    setDiceSkin
  } = useSkinStorage();
  const [skinModalOpen, setSkinModalOpen] = reactExports.useState(false);
  const {
    unlocked: unlockedAchievements,
    getTotalPoints
  } = useAchievements();
  const totalAchievementPoints = getTotalPoints();
  const {
    equippedTitle,
    unlockedTitles,
    equipTitle,
    checkAndUnlockTitles
  } = useTitles();
  const {
    equippedFrame,
    unlockedFrames,
    equipFrame,
    checkAndUnlockFrames
  } = useAvatarFrame();
  const AVATAR_STORAGE_KEY = "cyber_monopoly_custom_avatar";
  const [customAvatar, setCustomAvatar] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    checkAndUnlockTitles(unlockedAchievements);
    const bpState = getBattlePassState();
    checkAndUnlockFrames({
      unlockedAchievements,
      battlePassLevel: bpState.currentLevel,
      isPremium: bpState.premiumPurchased,
      unlockedPawnSkins
    });
  }, [unlockedAchievements, checkAndUnlockTitles, checkAndUnlockFrames, unlockedPawnSkins]);
  reactExports.useEffect(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) setCustomAvatar(saved);
    } catch {
    }
  }, [AVATAR_STORAGE_KEY]);
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      setCustomAvatar(result);
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, result);
      } catch {
      }
    };
    reader.readAsDataURL(file);
  };
  const handleResetAvatar = () => {
    setCustomAvatar(null);
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
    } catch {
    }
  };
  const getFrameConfig = (frameId) => {
    return AVATAR_FRAMES.find((f) => f.id === frameId);
  };
  const getTitleConfig = (titleId) => {
    return titleId ? TITLES[titleId] : null;
  };
  const RARITY_COLORS2 = {
    common: "#9ca3af",
    rare: "#22d3ee",
    epic: "#a855f7",
    legendary: "#fbbf24"
  };
  const getFrameUnlockText = (frame) => {
    switch (frame.unlockType) {
      case "default":
        return "初始擁有";
      case "achievement":
        return `成就解鎖`;
      case "battlepass":
        return `通行證獎勵`;
      case "assets":
        return `資產達到 ${frame.unlockValue}`;
      case "achievements_count":
        return `收集 ${frame.unlockValue} 個成就`;
      case "all_pawn_skins":
        return "解鎖所有棋子皮膚";
      case "achievements_combo":
        return "組合成就解鎖";
      default:
        return "未知";
    }
  };
  const syncStatusInfo = (() => {
    switch (syncStatus) {
      case "syncing":
        return {
          label: "同步中",
          color: "var(--cyan)",
          icon: LoaderCircle
        };
      case "synced":
        return {
          label: "已同步",
          color: "var(--green)",
          icon: CircleCheckBig
        };
      case "conflict":
        return {
          label: "衝突",
          color: "var(--yellow)",
          icon: TriangleAlert
        };
      case "error":
        return {
          label: "同步失敗",
          color: "var(--red)",
          icon: X
        };
      default:
        return {
          label: "未同步",
          color: "var(--text-secondary)",
          icon: CloudOff
        };
    }
  })();
  const formatSyncTime = (iso) => {
    if (!iso) return "從未同步";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "從未同步";
    return date.toLocaleString("zh-TW", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const handleBack = () => {
    navigate("/");
  };
  const goToBattlePass = () => {
    navigate("/battlepass");
  };
  const goToStats = () => {
    navigate("/stats");
  };
  const handleStartEdit = () => {
    setEditValue(nickname);
    setError("");
    setEditing(true);
  };
  const handleCancelEdit = () => {
    setEditing(false);
    setError("");
  };
  const handleEditChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_NICKNAME_LEN) return;
    setEditValue(value);
    setError("");
  };
  const handleSaveNickname = async (e) => {
    e.preventDefault();
    const trimmed = editValue.trim();
    if (!trimmed) {
      setError("暱稱不能為空");
      return;
    }
    if (trimmed.length > MAX_NICKNAME_LEN) {
      setError(`暱稱不能超過 ${MAX_NICKNAME_LEN} 個字元`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await setNickname(trimmed);
      setEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "修改失敗";
      setError(message);
    } finally {
      setSaving(false);
    }
  };
  const elo = playerProfile?.elo ?? 1e3;
  const wins = playerProfile?.wins ?? 0;
  const losses = playerProfile?.losses ?? 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : "0.0";
  const totalTurns = playerProfile?.totalTurns ?? 0;
  const highestAssets = playerProfile?.highestAssets ?? 0;
  const seasonWins = playerProfile?.seasonWins ?? 0;
  const seasonElo = playerProfile?.seasonElo ?? 1e3;
  const title = getRankTitle(elo);
  const formatNumber = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e4) return (num / 1e4).toFixed(1) + "万";
    return num.toLocaleString();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "個人資料" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl w-full mx-auto space-y-6 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 text-center relative overflow-hidden", style: {
        borderColor: title?.color || "var(--cyan)",
        boxShadow: `0 0 20px color-mix(in srgb, ${title?.color || "var(--cyan)"} 30%, transparent)`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl", style: {
          background: title?.color || "var(--cyan)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden cursor-pointer relative group", onClick: handleAvatarClick, style: {
            border: equippedFrame ? getFrameConfig(equippedFrame)?.borderStyle ?? "solid 3px" : "solid 3px",
            borderColor: equippedFrame ? getFrameConfig(equippedFrame)?.color ?? "var(--cyan)" : "var(--cyan)",
            boxShadow: equippedFrame ? `0 0 20px ${getFrameConfig(equippedFrame)?.glowColor ?? getFrameConfig(equippedFrame)?.color ?? "var(--cyan)"}, inset 0 0 10px ${getFrameConfig(equippedFrame)?.glowColor ?? "transparent"}` : "0 0 10px rgba(0, 255, 255, 0.3)"
          }, children: [
            customAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { src: customAvatar, alt: "avatar", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 100 100", className: "w-full h-full", style: {
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "avatarGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#00ffff" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#ff00ff" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "38", r: "18", fill: "none", stroke: "url(#avatarGrad)", strokeWidth: "2.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 85 Q 50 55 80 85", fill: "none", stroke: "url(#avatarGrad)", strokeWidth: "2.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "45", fill: "none", stroke: "url(#avatarGrad)", strokeWidth: "0.5", opacity: "0.3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "40", fill: "none", stroke: "url(#avatarGrad)", strokeWidth: "0.5", opacity: "0.2" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 20, style: {
              color: "var(--cyan)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleAvatarFileChange })
          ] }),
          customAvatar && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleResetAvatar, className: "text-xs text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors flex items-center gap-1 mx-auto mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 12 }),
            "重置預設頭像"
          ] }),
          editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveNickname, className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: editValue, onChange: handleEditChange, maxLength: MAX_NICKNAME_LEN, autoFocus: true, className: "cyber-input text-center font-cyber text-xl md:text-2xl w-48 md:w-64", style: {
                borderColor: title?.color || "var(--cyan)",
                color: title?.color || "var(--cyan)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: saving, className: "cyber-btn p-2", style: {
                borderColor: "var(--green)",
                color: "var(--green)"
              }, "aria-label": "保存", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 18 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleCancelEdit, className: "cyber-btn p-2", style: {
                borderColor: "var(--red)",
                color: "var(--red)"
              }, "aria-label": "取消", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-2", style: {
              color: "var(--red)"
            }, children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-muted)] mt-2", children: [
              editValue.length,
              "/",
              MAX_NICKNAME_LEN
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-2 flex-wrap", children: [
            equippedTitle && getTitleConfig(equippedTitle) && /* @__PURE__ */ jsxRuntimeExports.jsx(TitleEffect, { effect: getTitleConfig(equippedTitle).effect, color: getTitleConfig(equippedTitle).color, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-lg md:text-xl font-bold", children: [
              "【",
              getTitleConfig(equippedTitle).name,
              "】"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl md:text-3xl font-bold", style: {
              color: title?.color || "var(--text-primary)",
              textShadow: `0 0 10px color-mix(in srgb, ${title?.color || "var(--cyan)"} 60%, transparent)`
            }, children: nickname || "匿名玩家" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleStartEdit, className: "p-1.5 rounded transition-colors hover:bg-white/10", style: {
              color: "var(--text-secondary)"
            }, "aria-label": "編輯暱稱", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 16 }) })
          ] }),
          title && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 18, style: {
              color: title.color
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 text-sm font-cyber tracking-widest rounded-sm", style: {
              color: title.color,
              border: `1px solid ${title.color}`,
              backgroundColor: `color-mix(in srgb, ${title.color} 10%, transparent)`,
              boxShadow: `0 0 8px color-mix(in srgb, ${title.color} 40%, transparent)`
            }, children: title.text })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-[0.3em] mb-1", children: "ELO 積分" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-5xl md:text-6xl font-bold tracking-wider", style: {
              color: title?.color || "var(--cyan)",
              textShadow: `0 0 15px color-mix(in srgb, ${title?.color || "var(--cyan)"} 70%, transparent), 0 0 30px color-mix(in srgb, ${title?.color || "var(--cyan)"} 40%, transparent)`
            }, children: Math.round(elo) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "總勝場", value: wins, icon: TrendingUp, color: "var(--green)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "總敗場", value: losses, icon: Target, color: "var(--red)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "勝率", value: `${winRate}%`, icon: Award, color: "var(--cyan)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "總回合", value: formatNumber(totalTurns), icon: Zap, color: "var(--yellow)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "最高資產", value: formatNumber(highestAssets), icon: Coins, color: "var(--pink)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "賽季勝場", value: seasonWins, icon: Calendar, color: "var(--purple)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4", style: {
        borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "賽季 ELO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-3xl font-bold", style: {
            color: "var(--purple)",
            textShadow: "0 0 10px rgba(168, 85, 247, 0.5)"
          }, children: Math.round(seasonElo) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-[var(--text-muted)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "當前賽季進行中" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
            "賽季勝場: ",
            seasonWins
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, var(--yellow) 30%, transparent)"
      }, onClick: goToBattlePass, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 22, style: {
            color: "var(--yellow)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "賽季通行證" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
              color: "var(--yellow)",
              textShadow: "0 0 8px rgba(255, 200, 0, 0.5)"
            }, children: "查看詳情" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20, style: {
          color: "var(--text-secondary)"
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, var(--cyan) 30%, transparent)"
      }, onClick: goToStats, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 22, style: {
            color: "var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "數據儀表板" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
              color: "var(--cyan)",
              textShadow: "0 0 8px rgba(0, 255, 255, 0.5)"
            }, children: "查看戰績" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20, style: {
          color: "var(--text-secondary)"
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, #facc15 30%, transparent)"
      }, onClick: () => navigate("/achievements"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 22, style: {
            color: "#facc15"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "成就殿堂" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-xl font-bold", style: {
              color: "#facc15",
              textShadow: "0 0 8px rgba(250, 204, 21, 0.5)"
            }, children: [
              totalAchievementPoints,
              " 點"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider", style: {
            color: "var(--text-secondary)"
          }, children: "已解鎖" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg", style: {
            color: "#facc15"
          }, children: [
            unlockedAchievements.size,
            "/49"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, #a855f7 30%, transparent)"
      }, onClick: () => navigate("/codex"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 22, style: {
            color: "#a855f7"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "收藏圖鑑" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
              color: "#a855f7",
              textShadow: "0 0 8px rgba(168, 85, 247, 0.5)"
            }, children: "圖鑑收藏" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20, style: {
          color: "var(--text-secondary)"
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, hsl(280, 100%, 60%) 30%, transparent)"
      }, onClick: () => navigate("/replay"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { size: 22, style: {
            color: "hsl(280, 100%, 60%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "回放紀錄" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
              color: "hsl(280, 100%, 70%)",
              textShadow: "0 0 8px rgba(168, 85, 247, 0.5)"
            }, children: "觀看回放" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20, style: {
          color: "var(--text-secondary)"
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, var(--cyan) 30%, transparent)"
      }, onClick: () => navigate("/friends"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 22, style: {
            color: "var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "好友中心" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
              color: "var(--cyan)",
              textShadow: "0 0 8px rgba(0, 255, 255, 0.5)"
            }, children: "管理好友" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20, style: {
          color: "var(--text-secondary)"
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform", style: {
        borderColor: "color-mix(in srgb, var(--pink) 30%, transparent)"
      }, onClick: () => setSkinModalOpen(true), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { size: 22, style: {
            color: "var(--pink)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1", children: "皮膚倉庫" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
              color: "var(--pink)",
              textShadow: "0 0 8px rgba(255, 0, 180, 0.5)"
            }, children: "個性化裝扮" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20, style: {
          color: "var(--text-secondary)"
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: "color-mix(in srgb, var(--yellow) 30%, transparent)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 18, style: {
            color: "var(--yellow)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
            color: "var(--yellow)"
          }, children: "稱號管理" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-muted)] ml-auto", children: [
            unlockedTitles.length,
            "/",
            TITLE_IDS.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: TITLE_IDS.map((titleId) => {
          const t = TITLES[titleId];
          const isUnlocked = unlockedTitles.includes(titleId);
          const isEquipped = equippedTitle === titleId;
          const rarityColor = RARITY_COLORS2[t.rarity];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: !isUnlocked, onClick: () => equipTitle(titleId), className: "p-2 text-left rounded transition-all", style: {
            border: `1px solid ${isUnlocked ? rarityColor : "rgba(255, 255, 255, 0.1)"}`,
            backgroundColor: isEquipped ? `${rarityColor}15` : "transparent",
            opacity: isUnlocked ? 1 : 0.4,
            cursor: isUnlocked ? "pointer" : "not-allowed"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: rarityColor
              }, children: t.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1", children: isUnlocked ? isEquipped ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10, style: {
                color: "var(--green)"
              } }),
              "已裝備"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 10 }),
              "點擊裝備"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 10 }),
              t.unlockCondition
            ] }) })
          ] }, titleId);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 18, style: {
            color: "var(--purple)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider", style: {
            color: "var(--purple)"
          }, children: "頭像框管理" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-muted)] ml-auto", children: [
            unlockedFrames.length,
            "/",
            AVATAR_FRAMES.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 gap-3", children: AVATAR_FRAMES.map((frame) => {
          const isUnlocked = unlockedFrames.includes(frame.id);
          const isEquipped = equippedFrame === frame.id;
          const rarityColor = RARITY_COLORS2[frame.rarity];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: !isUnlocked, onClick: () => equipFrame(frame.id), className: "flex flex-col items-center gap-1 p-2 rounded transition-all", style: {
            border: `1px solid ${isUnlocked ? rarityColor : "rgba(255, 255, 255, 0.1)"}`,
            backgroundColor: isEquipped ? `${rarityColor}15` : "transparent",
            opacity: isUnlocked ? 1 : 0.4,
            cursor: isUnlocked ? "pointer" : "not-allowed"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center", style: {
              border: frame.borderStyle,
              borderColor: isUnlocked ? frame.color : "#444",
              boxShadow: isUnlocked ? `0 0 8px ${frame.glowColor ?? frame.color}` : "none"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-cyber", style: {
              color: "var(--cyan)"
            }, children: "玩家" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber text-center", style: {
              color: rarityColor
            }, children: isUnlocked ? frame.name : "???" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-[var(--text-muted)] text-center", children: getFrameUnlockText(frame) })
          ] }, frame.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBindingsSection, { isLoggedIn: !!nickname && !loading }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: enabled ? "color-mix(in srgb, var(--cyan) 30%, transparent)" : "color-mix(in srgb, var(--text-muted) 20%, transparent)",
        boxShadow: enabled && syncStatus === "synced" ? "0 0 15px rgba(0, 255, 255, 0.2)" : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 18, style: {
              color: "var(--cyan)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider text-neon-cyan", children: "雲端同步" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-10 h-5 rounded-full cursor-pointer transition-colors", onClick: enabled ? disableCloudSave : enableCloudSave, style: {
            backgroundColor: enabled ? "var(--cyan)" : "rgba(255, 255, 255, 0.15)",
            boxShadow: enabled ? "0 0 8px rgba(0, 255, 255, 0.5)" : "none"
          }, role: "switch", "aria-checked": enabled, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0.5 w-4 h-4 rounded-full transition-all", style: {
            left: enabled ? "22px" : "2px",
            backgroundColor: "var(--bg-deep)",
            boxShadow: enabled ? "0 0 6px rgba(0, 255, 255, 0.8)" : "none"
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)]", children: "目前狀態" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber tracking-wider flex items-center gap-1", style: {
              color: syncStatusInfo.color
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(syncStatusInfo.icon, { size: 12, className: syncStatus === "syncing" ? "animate-spin" : "" }),
              syncStatusInfo.label
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)]", children: "上次同步" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-primary)] font-mono", children: formatSyncTime(lastSyncedAt) })
          ] }),
          cloudError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs p-2", style: {
            color: "var(--red)",
            backgroundColor: "rgba(255, 77, 77, 0.08)"
          }, children: cloudError }),
          syncStatus === "conflict" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3", style: {
            backgroundColor: "rgba(250, 204, 21, 0.08)",
            border: "1px solid color-mix(in srgb, var(--yellow) 30%, transparent)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-cyber tracking-wider", style: {
              color: "var(--yellow)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
              "衝突！選擇保留版本"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void resolveConflict("local"), className: "cyber-btn flex-1 py-1.5 text-xs font-cyber tracking-wider", style: {
                borderColor: "var(--cyan)",
                color: "var(--cyan)"
              }, children: "保留本地" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void resolveConflict("cloud"), className: "cyber-btn flex-1 py-1.5 text-xs font-cyber tracking-wider", style: {
                borderColor: "var(--purple)",
                color: "var(--purple)"
              }, children: "保留雲端" })
            ] })
          ] }),
          enabled && syncStatus !== "conflict" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void syncNow(), disabled: syncStatus === "syncing", className: "cyber-btn w-full py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)",
            backgroundColor: "rgba(0, 255, 255, 0.08)",
            opacity: syncStatus === "syncing" ? 0.6 : 1,
            cursor: syncStatus === "syncing" ? "not-allowed" : "pointer"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14, className: syncStatus === "syncing" ? "animate-spin" : "" }),
            "立即同步"
          ] }),
          !enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] text-center", children: "開啟後自動同步成就、設定與對局記錄" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3", children: "排名資訊" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "ELO 排名" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-cyan font-cyber", children: "--" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "勝場排名" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-green font-cyber", children: "--" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "賽季排名" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-purple font-cyber", children: "--" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mt-2 text-center", children: "參與更多線上對戰提升排名" })
        ] })
      ] }),
      loading && !playerProfile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[var(--text-secondary)] font-cyber tracking-wider", children: "載入中..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void refreshProfile(), className: "cyber-btn w-full py-2 text-sm font-cyber tracking-wider", style: {
        borderColor: "var(--text-muted)",
        color: "var(--text-secondary)"
      }, children: "刷新資料" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SkinSelectModal, { isOpen: skinModalOpen, onClose: () => setSkinModalOpen(false), currentPawnSkin: pawnSkin, currentDiceSkin: diceSkin, unlockedPawnSkins, unlockedDiceSkins, onSelectPawn: setPawnSkin, onSelectDice: setDiceSkin })
  ] });
};
export {
  ProfilePage as default
};
