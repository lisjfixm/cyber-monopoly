import { d as createLucideIcon, u as useNavigate, r as reactExports, bg as loadInstalledMods, bh as loadEnabledModIds, bi as saveInstalledMods, bj as saveEnabledModIds, bk as decodeModFromCode, bl as isValidMod, bm as encodeModToCode, bn as BUILTIN_MODS, j as jsxRuntimeExports, bo as Package, b9 as Sparkles, aD as Plus, bp as Search, $ as TriangleAlert, bq as Download, at as Check, s as Copy, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, az as DialogDescription, aA as DialogFooter, aL as Star, g as CircleAlert, br as Trash2, bs as Eye, bt as Gamepad2, aP as TrendingUp, t as Crown, aJ as Coins, bf as Gift, bu as Heart, Z as Zap } from "./index-ymfxQ6bv.js";
import { R as RatingReviewSection } from "./RatingReviewSection-DqDlMebf.js";
import { s as sortByFeatured, g as getReviews, a as getAverageRating, b as getTotalReviews, c as submitRating, d as addReview, l as likeReview, e as getAuthorScore } from "./reviewStorage-B6nD4ZW8.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { G as Grid3x3 } from "./grid-3x3-Du20R1QB.js";
import { F as FastForward } from "./fast-forward-D7uCiBoS.js";
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M8 12h8", key: "1wcyev" }]
];
const CircleMinus = createLucideIcon("circle-minus", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", key: "1pljnt" }],
  ["path", { d: "M16 14v6", key: "1j4efv" }],
  ["path", { d: "M8 14v6", key: "17c4r9" }],
  ["path", { d: "M12 16v6", key: "c8a4gj" }]
];
const CloudRain = createLucideIcon("cloud-rain", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 18 6-6-6-6", key: "eg8j8" }],
  ["path", { d: "m8 6-6 6 6 6", key: "ppft3o" }]
];
const Code = createLucideIcon("code", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode);
const BUILTIN_GAMEPLAY_MODS = [{
  id: "builtin_quick_mode",
  name: "快速模式",
  description: "回合時間限制30秒，遊戲節奏加快",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "Zap",
  conflictsWith: ["builtin_time_accel"],
  rules: {}
}, {
  id: "builtin_infinite_fate",
  name: "無限命運",
  description: "每輪都抽取命運卡",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "Sparkles"
}, {
  id: "builtin_crazy_prices",
  name: "瘋狂地價",
  description: "地產價格×2，租金×3",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "TrendingUp",
  rules: {
    rentMultiplier: 3
  }
}, {
  id: "builtin_pacifist",
  name: "和平主義",
  description: "取消所有負面事件，只有好事件",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "Heart",
  conflictsWith: ["builtin_random_surprise"]
}, {
  id: "builtin_random_surprise",
  name: "隨機驚喜",
  description: "每回合隨機觸發一個特殊效果",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "Gift",
  conflictsWith: ["builtin_pacifist"]
}, {
  id: "builtin_underdog",
  name: "窮人逆襲",
  description: "初始資產低的玩家每回合額外補貼",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "Coins"
}, {
  id: "builtin_monopoly",
  name: "資本壟斷",
  description: "同一顏色地產租金翻倍效果×2",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "Crown"
}, {
  id: "builtin_time_accel",
  name: "時間加速",
  description: "骰子移動力+2",
  version: "1.0.0",
  author: "內建",
  category: "gameplay",
  isBuiltin: true,
  iconKey: "FastForward",
  conflictsWith: ["builtin_quick_mode"]
}];
const BUILTIN_VISUAL_MODS = [{
  id: "builtin_retro_pixel",
  name: "懷舊像素風",
  description: "復古像素畫質",
  version: "1.0.0",
  author: "內建",
  category: "visual",
  isBuiltin: true,
  iconKey: "Grid3X3"
}, {
  id: "builtin_minimal",
  name: "極簡模式",
  description: "關閉所有特效，提升性能",
  version: "1.0.0",
  author: "內建",
  category: "visual",
  isBuiltin: true,
  iconKey: "MinusCircle"
}, {
  id: "builtin_rainy",
  name: "雨天效果",
  description: "背景下雨動畫",
  version: "1.0.0",
  author: "內建",
  category: "visual",
  isBuiltin: true,
  iconKey: "CloudRain"
}, {
  id: "builtin_starry_night",
  name: "星空夜晚",
  description: "背景星空+流星",
  version: "1.0.0",
  author: "內建",
  category: "visual",
  isBuiltin: true,
  iconKey: "Stars"
}];
const ALL_BUILTIN_MODS = [...BUILTIN_GAMEPLAY_MODS, ...BUILTIN_VISUAL_MODS];
const iconMap = {
  Zap,
  Sparkles,
  Heart,
  Gift,
  Coins,
  Crown,
  FastForward,
  TrendingUp,
  Grid3X3: Grid3x3,
  MinusCircle: CircleMinus,
  CloudRain,
  Stars: Sparkles,
  Package,
  Gamepad2,
  Eye
};
function getModIcon(mod) {
  if (mod.iconKey && iconMap[mod.iconKey]) return iconMap[mod.iconKey];
  return Package;
}
const COMMUNITY_MODS = [{
  id: "neon_bloom",
  name: "霓虹綻放",
  description: "增加霓虹節日事件觸發機率，起點獎勵提升50%",
  version: "1.2.0",
  author: "NeonHacker",
  rules: {
    passStartBonus: 2250
  }
}, {
  id: "cyberpunk_story",
  name: "賽博龐克劇情",
  description: "新增10張命運卡，講述一個賽博朋克世界的故事",
  version: "2.0.1",
  author: "StoryWeaver",
  cards: [{
    id: "cs1",
    type: "fate",
    name: "覺醒",
    description: "你發現了真相，獲得勇氣 +2000元",
    effect: {
      type: "money",
      value: 2e3
    }
  }, {
    id: "cs2",
    type: "fate",
    name: "追捕",
    description: "被企業獵人追捕，損失1000元",
    effect: {
      type: "money",
      value: -1e3
    }
  }, {
    id: "cs3",
    type: "fate",
    name: "義體升級",
    description: "你的義體獲得升級",
    effect: {
      type: "move",
      value: 2
    }
  }]
}, {
  id: "property_king",
  name: "地產之王",
  description: "所有地塊價格降低20%，建造費用減半",
  version: "1.0.0",
  author: "TycoonPro",
  rules: {
    rentMultiplier: 0.8
  }
}, {
  id: "speed_demon",
  name: "極速惡魔",
  description: "遊戲節奏加快，起始金錢減半但過路費翻倍",
  version: "1.1.0",
  author: "SpeedRunner",
  rules: {
    startMoney: 7500,
    rentMultiplier: 2
  }
}];
const SAMPLE_MOD_TEMPLATE = `{
  "id": "my_custom_mod",
  "name": "我的自訂模組",
  "description": "這是一個範例模組，你可以自由修改",
  "version": "1.0.0",
  "author": "你的名字",
  "rules": {
    "startMoney": 20000,
    "rentMultiplier": 1.5
  },
  "cards": [
    {
      "id": "my_card_1",
      "type": "fate",
      "name": "神秘獎勵",
      "description": "獲得一筆神秘獎金",
      "effect": { "type": "money", "value": 1500 }
    }
  ]
}`;
function ModCardComponent({
  mod,
  isInstalled,
  isEnabled,
  onToggle,
  onDelete,
  onEdit,
  onInstall,
  showInstallButton = false,
  downloadCount,
  rating,
  isFeatured = false,
  conflictWithName
}) {
  const Icon = getModIcon(mod);
  const borderColor = isFeatured ? "var(--yellow, #facc15)" : isEnabled ? "color-mix(in srgb, var(--green) 40%, transparent)" : "color-mix(in srgb, var(--cyan) 20%, transparent)";
  const boxShadow = isFeatured ? "0 0 18px rgba(250, 204, 21, 0.3)" : isEnabled ? "0 0 12px rgba(0, 255, 128, 0.2)" : "none";
  const categoryLabel = mod.category === "gameplay" ? "遊戲規則" : mod.category === "visual" ? "視覺美化" : null;
  const categoryColor = mod.category === "gameplay" ? "var(--cyan)" : mod.category === "visual" ? "var(--pink)" : "var(--text-secondary)";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex flex-col gap-3", style: {
    borderColor,
    boxShadow
  }, children: [
    isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs font-cyber tracking-wider", style: {
      color: "var(--yellow, #facc15)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
      "置頂精選"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm", style: {
          border: `1px solid ${mod.isBuiltin ? "var(--purple)" : "var(--cyan)"}`,
          color: mod.isBuiltin ? "var(--purple)" : "var(--cyan)",
          backgroundColor: mod.isBuiltin ? "rgba(168, 85, 247, 0.1)" : "rgba(0, 255, 255, 0.08)",
          boxShadow: `0 0 8px ${mod.isBuiltin ? "rgba(168, 85, 247, 0.3)" : "rgba(0, 255, 255, 0.2)"}`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base text-neon-cyan tracking-wider truncate", children: mod.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] mt-0.5", children: [
            "v",
            mod.version,
            " · ",
            mod.author
          ] })
        ] })
      ] }),
      isEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 font-cyber tracking-wider rounded-sm flex-shrink-0", style: {
        color: "var(--green)",
        border: "1px solid var(--green)",
        backgroundColor: "rgba(0, 255, 128, 0.1)"
      }, children: "啟用中" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-primary)] line-clamp-2", children: mod.description }),
    mod.cards && mod.cards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)]", children: [
      "自訂卡：",
      mod.cards.length,
      " 張"
    ] }),
    mod.rules && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "自訂規則" }),
    mod.properties && mod.properties.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)]", children: [
      "自訂地塊：",
      mod.properties.length,
      " 個"
    ] }),
    downloadCount !== void 0 && rating !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-[var(--text-secondary)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 12 }),
        downloadCount.toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", style: {
        color: "var(--yellow)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, fill: "currentColor" }),
        rating.toFixed(1)
      ] })
    ] }),
    conflictWithName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm", style: {
      color: "var(--red)",
      border: "1px solid var(--red)",
      backgroundColor: "rgba(255, 77, 77, 0.08)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 12 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "與「",
        conflictWithName,
        "」不相容"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-auto pt-2", children: [
      categoryLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 font-cyber tracking-wider rounded-sm", style: {
        color: categoryColor,
        border: `1px solid ${categoryColor}`,
        backgroundColor: `${categoryColor}10`
      }, children: categoryLabel }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      showInstallButton ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onInstall, disabled: isInstalled, className: "cyber-btn flex-1 py-1.5 text-sm font-cyber tracking-wider", style: {
        borderColor: isInstalled ? "var(--text-muted)" : "var(--green)",
        color: isInstalled ? "var(--text-muted)" : "var(--green)",
        backgroundColor: isInstalled ? "transparent" : "rgba(0, 255, 128, 0.08)",
        cursor: isInstalled ? "not-allowed" : "pointer"
      }, children: isInstalled ? "已安裝" : "安裝" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onToggle, className: "relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0", style: {
          backgroundColor: isEnabled ? "rgba(0, 255, 128, 0.2)" : "rgba(255, 255, 255, 0.08)",
          border: `1px solid ${isEnabled ? "var(--green)" : "rgba(255, 255, 255, 0.15)"}`,
          boxShadow: isEnabled ? "0 0 10px rgba(0, 255, 128, 0.5), inset 0 0 5px rgba(0, 255, 128, 0.3)" : "none"
        }, "aria-label": isEnabled ? "停用" : "啟用", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300", style: {
          left: isEnabled ? "calc(100% - 20px)" : "2px",
          backgroundColor: isEnabled ? "var(--green)" : "var(--text-secondary)",
          boxShadow: isEnabled ? "0 0 8px var(--green), 0 0 16px var(--green)" : "none"
        } }) }),
        onEdit && !mod.isBuiltin && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onEdit, className: "cyber-btn p-1.5", style: {
          borderColor: "var(--yellow)",
          color: "var(--yellow)"
        }, "aria-label": "編輯", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 14 }) }),
        onDelete && !mod.isBuiltin && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onDelete, className: "cyber-btn p-1.5", style: {
          borderColor: "var(--red)",
          color: "var(--red)"
        }, "aria-label": "刪除", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
      ] })
    ] })
  ] });
}
const ModManagerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("installed");
  const [installedMods, setInstalledMods] = reactExports.useState([]);
  const [enabledIds, setEnabledIds] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const [showImport, setShowImport] = reactExports.useState(false);
  const [importCode, setImportCode] = reactExports.useState("");
  const [importError, setImportError] = reactExports.useState("");
  const [editorText, setEditorText] = reactExports.useState(SAMPLE_MOD_TEMPLATE);
  const [parseError, setParseError] = reactExports.useState("");
  const [parsedMod, setParsedMod] = reactExports.useState(null);
  const [generatedCode, setGeneratedCode] = reactExports.useState("");
  const [copied, setCopied] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [selectedMod, setSelectedMod] = reactExports.useState(null);
  const [modReviews, setModReviews] = reactExports.useState([]);
  const [modAvgRating, setModAvgRating] = reactExports.useState(0);
  const [modTotalReviews, setModTotalReviews] = reactExports.useState(0);
  reactExports.useEffect(() => {
    setInstalledMods(loadInstalledMods());
    setEnabledIds(loadEnabledModIds());
  }, []);
  const persistMods = reactExports.useCallback((mods) => {
    setInstalledMods(mods);
    saveInstalledMods(mods);
  }, []);
  reactExports.useCallback((ids) => {
    setEnabledIds(ids);
    saveEnabledModIds(ids);
  }, []);
  const getAllInstalledModsRef = reactExports.useRef([]);
  const toggleMod = reactExports.useCallback((modId) => {
    setEnabledIds((prev) => {
      const isCurrentlyEnabled = prev.includes(modId);
      let next;
      if (isCurrentlyEnabled) {
        next = prev.filter((id) => id !== modId);
      } else {
        const allMods = getAllInstalledModsRef.current ?? [];
        const targetMod = allMods.find((m) => m.id === modId);
        const conflicts = targetMod?.conflictsWith ?? [];
        const filtered = prev.filter((id) => !conflicts.includes(id));
        next = [...filtered, modId];
      }
      saveEnabledModIds(next);
      return next;
    });
  }, []);
  const deleteMod = reactExports.useCallback((modId) => {
    setInstalledMods((prev) => {
      const next = prev.filter((m) => m.id !== modId);
      saveInstalledMods(next);
      return next;
    });
    setEnabledIds((prev) => {
      const next = prev.filter((id) => id !== modId);
      saveEnabledModIds(next);
      return next;
    });
  }, []);
  const installMod = reactExports.useCallback((mod) => {
    setInstalledMods((prev) => {
      if (prev.some((m) => m.id === mod.id)) return prev;
      const next = [...prev, mod];
      saveInstalledMods(next);
      return next;
    });
  }, []);
  const handleImport = reactExports.useCallback(() => {
    setImportError("");
    const mod = decodeModFromCode(importCode);
    if (!mod) {
      setImportError("無效的模組碼，請檢查格式");
      return;
    }
    if (installedMods.some((m) => m.id === mod.id)) {
      setImportError("已存在相同ID的模組");
      return;
    }
    persistMods([...installedMods, mod]);
    setImportCode("");
    setShowImport(false);
  }, [importCode, installedMods, persistMods]);
  reactExports.useEffect(() => {
    try {
      const parsed = JSON.parse(editorText);
      if (isValidMod(parsed)) {
        setParsedMod(parsed);
        setParseError("");
      } else {
        setParsedMod(null);
        setParseError("模組格式不正確，請檢查必填欄位");
      }
    } catch (err) {
      setParsedMod(null);
      const message = err instanceof Error ? err.message : "語法錯誤";
      setParseError(message);
    }
  }, [editorText]);
  const handleGenerateCode = reactExports.useCallback(() => {
    if (!parsedMod) return;
    const code = encodeModToCode(parsedMod);
    setGeneratedCode(code);
  }, [parsedMod]);
  const handleCopyCode = reactExports.useCallback(async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
    }
  }, [generatedCode]);
  const handleSaveLocal = reactExports.useCallback(() => {
    if (!parsedMod) return;
    const exists = installedMods.some((m) => m.id === parsedMod.id);
    if (exists) {
      const next = installedMods.map((m) => m.id === parsedMod.id ? parsedMod : m);
      persistMods(next);
    } else {
      persistMods([...installedMods, parsedMod]);
    }
  }, [parsedMod, installedMods, persistMods]);
  const loadTemplate = reactExports.useCallback(() => {
    setEditorText(SAMPLE_MOD_TEMPLATE);
  }, []);
  const handleEditorChange = (e) => {
    setEditorText(e.target.value);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleBack = () => {
    navigate("/");
  };
  const allMarketMods = reactExports.useMemo(() => {
    return [...BUILTIN_MODS, ...COMMUNITY_MODS];
  }, []);
  const filteredMarketMods = reactExports.useMemo(() => {
    const filtered = searchQuery.trim() ? allMarketMods.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.author.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase())) : allMarketMods;
    return sortByFeatured(filtered, "mod");
  }, [allMarketMods, searchQuery]);
  const installedIds = reactExports.useMemo(() => new Set(installedMods.map((m) => m.id)), [installedMods]);
  const enableMarketMods = reactExports.useMemo(() => new Set(enabledIds), [enabledIds]);
  const getConflictName = reactExports.useCallback((mod, enabled) => {
    if (!mod.conflictsWith || mod.conflictsWith.length === 0) return null;
    const allMods = [...BUILTIN_GAMEPLAY_MODS, ...BUILTIN_VISUAL_MODS, ...installedMods];
    for (const cid of mod.conflictsWith) {
      if (enabled.has(cid)) {
        const conflictMod = allMods.find((m) => m.id === cid);
        if (conflictMod) return conflictMod.name;
      }
    }
    return null;
  }, [installedMods]);
  const loadModReviews = reactExports.useCallback((modId) => {
    const data = getReviews("mod", modId);
    setModReviews(data.reviews);
    setModAvgRating(getAverageRating("mod", modId));
    setModTotalReviews(getTotalReviews("mod", modId));
  }, []);
  const handleModRate = reactExports.useCallback((score) => {
    if (!selectedMod) return;
    submitRating("mod", selectedMod.id, "local_user", score);
    loadModReviews(selectedMod.id);
  }, [selectedMod, loadModReviews]);
  const handleModAddReview = reactExports.useCallback((text) => {
    if (!selectedMod) return;
    const newReview = {
      id: `review_${Date.now()}`,
      author: "我",
      authorScore: 200,
      content: text,
      score: 5,
      likes: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    addReview("mod", selectedMod.id, newReview);
    loadModReviews(selectedMod.id);
  }, [selectedMod, loadModReviews]);
  const handleModLikeReview = reactExports.useCallback((reviewId) => {
    if (!selectedMod) return;
    likeReview("mod", selectedMod.id, reviewId);
    loadModReviews(selectedMod.id);
  }, [selectedMod, loadModReviews]);
  const openModDetail = reactExports.useCallback((mod) => {
    setSelectedMod(mod);
    loadModReviews(mod.id);
  }, [loadModReviews]);
  const getMarketStats = (modId) => {
    const hash = modId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return {
      downloads: 1e3 + hash * 37 % 5e4,
      rating: 3.5 + hash % 15 / 10
    };
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "模組管理" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 max-w-2xl w-full mx-auto", children: [{
      key: "installed",
      label: "已安裝",
      icon: Package
    }, {
      key: "market",
      label: "模組市集",
      icon: Sparkles
    }, {
      key: "create",
      label: "建立模組",
      icon: Code
    }].map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.key;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
        borderColor: isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
        color: isActive ? "var(--cyan)" : "var(--text-secondary)",
        backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "transparent",
        boxShadow: isActive ? "0 0 12px rgba(0, 255, 255, 0.3)" : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: tab.label })
      ] }, tab.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl w-full mx-auto pb-8", children: [
      activeTab === "installed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap justify-center", children: [{
          key: "all",
          label: "全部",
          color: "var(--cyan)"
        }, {
          key: "gameplay",
          label: "遊戲規則",
          color: "var(--cyan)"
        }, {
          key: "visual",
          label: "視覺美化",
          color: "var(--pink)"
        }].map((cat) => {
          const isActive = categoryFilter === cat.key;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCategoryFilter(cat.key), className: "cyber-btn cyber-btn-sm px-4 py-1.5 text-xs font-cyber tracking-wider", style: {
            borderColor: isActive ? cat.color : "rgba(255, 255, 255, 0.1)",
            color: isActive ? cat.color : "var(--text-secondary)",
            backgroundColor: isActive ? `${cat.color}15` : "transparent",
            boxShadow: isActive ? `0 0 10px ${cat.color}40` : "none"
          }, children: cat.label }, cat.key);
        }) }),
        (() => {
          const allMods = [...ALL_BUILTIN_MODS, ...installedMods];
          const filtered = categoryFilter === "all" ? allMods : allMods.filter((m) => m.category === categoryFilter);
          const enabled = new Set(enabledIds);
          getAllInstalledModsRef.current = allMods;
          if (filtered.length === 0) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center", style: {
              borderColor: "color-mix(in srgb, var(--cyan) 20%, transparent)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 48, className: "mx-auto mb-3", style: {
                color: "var(--text-secondary)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] font-cyber tracking-wider mb-4", children: "此分類暫無模組" })
            ] });
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filtered.map((mod) => /* @__PURE__ */ jsxRuntimeExports.jsx(ModCardComponent, { mod, isInstalled: true, isEnabled: enabled.has(mod.id), onToggle: () => toggleMod(mod.id), onDelete: mod.isBuiltin ? void 0 : () => setDeleteTarget(mod), conflictWithName: getConflictName(mod, enabled) }, mod.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-muted)] text-center mt-2", children: [
              "已啟用 ",
              enabledIds.length,
              " / ",
              allMods.length,
              " 個模組"
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowImport(true), className: "cyber-btn w-full py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: "var(--purple)",
          color: "var(--purple)",
          backgroundColor: "rgba(168, 85, 247, 0.08)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          "匯入模組碼"
        ] })
      ] }),
      activeTab === "market" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2", style: {
            color: "var(--text-secondary)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: searchQuery, onChange: handleSearchChange, placeholder: "搜尋模組名稱、作者...", className: "cyber-input w-full pl-10", style: {
            borderColor: "color-mix(in srgb, var(--cyan) 30%, transparent)"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredMarketMods.map((mod) => {
          const stats = getMarketStats(mod.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ModCardComponent, { mod, isInstalled: installedIds.has(mod.id), isEnabled: enableMarketMods.has(mod.id), onInstall: () => installMod(mod), showInstallButton: true, downloadCount: stats.downloads, rating: stats.rating, isFeatured: mod.isFeatured }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => openModDetail(mod), className: "cyber-btn cyber-btn-sm text-xs font-cyber tracking-wider w-full", style: {
              borderColor: "var(--purple)",
              color: "var(--purple)",
              backgroundColor: "rgba(168, 85, 247, 0.08)"
            }, children: "查看詳情" })
          ] }, mod.id);
        }) }),
        filteredMarketMods.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center", style: {
          borderColor: "color-mix(in srgb, var(--cyan) 20%, transparent)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 40, className: "mx-auto mb-3", style: {
            color: "var(--text-secondary)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] font-cyber tracking-wider", children: "找不到符合條件的模組" })
        ] })
      ] }),
      activeTab === "create" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider text-[var(--text-secondary)]", children: "JSON 編輯器" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: loadTemplate, className: "cyber-btn px-3 py-1 text-xs font-cyber tracking-wider", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)"
          }, children: "載入範本" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: editorText, onChange: handleEditorChange, spellCheck: false, className: "w-full h-80 p-3 font-mono text-xs md:text-sm resize-none cyber-input", style: {
          borderColor: parseError ? "color-mix(in srgb, var(--red) 50%, transparent)" : "color-mix(in srgb, var(--cyan) 30%, transparent)",
          backgroundColor: "hsl(240, 20%, 8%)",
          color: parseError ? "var(--red)" : "var(--text-primary)"
        } }),
        parseError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 text-sm", style: {
          color: "var(--red)",
          border: "1px solid var(--red)",
          backgroundColor: "rgba(255, 77, 77, 0.08)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: "flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parseError })
        ] }),
        parsedMod && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "color-mix(in srgb, var(--green) 30%, transparent)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider text-neon-green mb-2", children: "模組預覽" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "名稱：" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-cyan", children: parsedMod.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "作者：" }),
              parsedMod.author
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "版本：" }),
              "v",
              parsedMod.version
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "描述：" }),
              parsedMod.description
            ] }),
            parsedMod.cards && parsedMod.cards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "自訂卡：" }),
              parsedMod.cards.length,
              " 張"
            ] }),
            parsedMod.properties && parsedMod.properties.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "自訂地塊：" }),
              parsedMod.properties.length,
              " 個"
            ] }),
            parsedMod.rules && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "自訂規則：" }),
              "已設定"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSaveLocal, disabled: !parsedMod, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
            borderColor: parsedMod ? "var(--green)" : "var(--text-muted)",
            color: parsedMod ? "var(--green)" : "var(--text-muted)",
            backgroundColor: parsedMod ? "rgba(0, 255, 128, 0.08)" : "transparent",
            cursor: parsedMod ? "pointer" : "not-allowed"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
            "保存到本地"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleGenerateCode, disabled: !parsedMod, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
            borderColor: parsedMod ? "var(--purple)" : "var(--text-muted)",
            color: parsedMod ? "var(--purple)" : "var(--text-muted)",
            backgroundColor: parsedMod ? "rgba(168, 85, 247, 0.08)" : "transparent",
            cursor: parsedMod ? "pointer" : "not-allowed"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { size: 16 }),
            "生成模組碼"
          ] })
        ] }),
        generatedCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider", style: {
              color: "var(--purple)"
            }, children: "模組碼" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleCopyCode, className: "cyber-btn px-2 py-1 text-xs font-cyber tracking-wider flex items-center gap-1", style: {
              borderColor: copied ? "var(--green)" : "var(--cyan)",
              color: copied ? "var(--green)" : "var(--cyan)"
            }, children: [
              copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 }),
              copied ? "已複製" : "複製"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-xs font-mono break-all max-h-32 overflow-y-auto", style: {
            backgroundColor: "hsl(240, 20%, 8%)",
            border: "1px solid color-mix(in srgb, var(--purple) 20%, transparent)",
            color: "var(--text-secondary)"
          }, children: generatedCode })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showImport, onOpenChange: setShowImport, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "cyber-card max-w-md", style: {
      borderColor: "var(--purple)",
      boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--purple)",
          textShadow: "0 0 10px rgba(168, 85, 247, 0.5)"
        }, children: "匯入模組碼" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-sm text-[var(--text-secondary)]", children: "貼上 base64 編碼的模組碼以安裝新模組" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: importCode, onChange: (e) => setImportCode(e.target.value), placeholder: "貼上模組碼...", spellCheck: false, className: "w-full h-32 p-3 font-mono text-xs resize-none cyber-input", style: {
        borderColor: importError ? "color-mix(in srgb, var(--red) 50%, transparent)" : "color-mix(in srgb, var(--purple) 30%, transparent)",
        backgroundColor: "hsl(240, 20%, 8%)",
        color: importError ? "var(--red)" : "var(--text-primary)"
      } }),
      importError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", style: {
        color: "var(--red)"
      }, children: importError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setShowImport(false);
          setImportCode("");
          setImportError("");
        }, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleImport, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
          borderColor: "var(--purple)",
          color: "var(--purple)",
          backgroundColor: "rgba(168, 85, 247, 0.08)"
        }, children: "匯入" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!selectedMod, onOpenChange: (open) => !open && setSelectedMod(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "cyber-card max-w-2xl max-h-[85vh] overflow-y-auto", style: {
      borderColor: "var(--purple)",
      boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: selectedMod && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--purple)",
          textShadow: "0 0 10px rgba(168, 85, 247, 0.5)"
        }, children: selectedMod.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-sm text-[var(--text-secondary)]", children: [
          "v",
          selectedMod.version,
          " · by ",
          selectedMod.author,
          " ·",
          " ",
          getAuthorScore(selectedMod.author, allMarketMods.map((m) => ({
            author: m.author,
            likes: getMarketStats(m.id).downloads,
            downloads: getMarketStats(m.id).downloads
          }))),
          " 積分"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-primary)] leading-relaxed", children: selectedMod.description }),
        selectedMod.cards && selectedMod.cards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)]", children: [
          "自訂卡：",
          selectedMod.cards.length,
          " 張"
        ] }),
        selectedMod.rules && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "自訂規則：已設定" }),
        selectedMod.properties && selectedMod.properties.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)]", children: [
          "自訂地塊：",
          selectedMod.properties.length,
          " 個"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          installMod(selectedMod);
        }, disabled: installedIds.has(selectedMod.id), className: "cyber-btn w-full py-2.5 text-sm font-cyber tracking-wider", style: {
          borderColor: installedIds.has(selectedMod.id) ? "var(--text-muted)" : "var(--green)",
          color: installedIds.has(selectedMod.id) ? "var(--text-muted)" : "var(--green)",
          backgroundColor: installedIds.has(selectedMod.id) ? "transparent" : "rgba(0, 255, 128, 0.08)",
          cursor: installedIds.has(selectedMod.id) ? "not-allowed" : "pointer"
        }, children: installedIds.has(selectedMod.id) ? "已安裝" : "安裝模組" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t", style: {
          borderColor: "rgba(168, 85, 247, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider mb-3", style: {
            color: "var(--purple)"
          }, children: "評分與評論" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RatingReviewSection, { contentType: "mod", contentId: selectedMod.id, averageRating: modAvgRating || getMarketStats(selectedMod.id).rating, ratingCount: modTotalReviews || Math.floor(getMarketStats(selectedMod.id).downloads / 50), reviews: modReviews, onRate: handleModRate, onAddReview: handleModAddReview, onLikeReview: handleModLikeReview })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: (open) => !open && setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "cyber-card max-w-sm", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 30px rgba(255, 77, 77, 0.3)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--red)",
          textShadow: "0 0 10px rgba(255, 77, 77, 0.5)"
        }, children: "確認刪除" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-sm text-[var(--text-secondary)]", children: [
          "確定要刪除模組「",
          deleteTarget?.name,
          "」嗎？此操作無法復原。"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteTarget(null), className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          if (deleteTarget) deleteMod(deleteTarget.id);
          setDeleteTarget(null);
        }, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          backgroundColor: "rgba(255, 77, 77, 0.08)"
        }, children: "刪除" })
      ] })
    ] }) })
  ] });
};
export {
  ModManagerPage as default
};
