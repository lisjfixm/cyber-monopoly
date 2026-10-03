import { r as reactExports, j as jsxRuntimeExports, b9 as Sparkles, aJ as Coins, by as Skull, aN as Target, aB as Clock, bq as Download, aL as Star, u as useNavigate, bE as ChevronLeft, Z as Zap, bV as Save, bW as Upload, br as Trash2 } from "./index-ymfxQ6bv.js";
import { g as getLocalScenarios, a as getCommunityScenarios, l as likeScenario, i as installScenario, s as saveLocalScenario, p as publishScenario, d as deleteLocalScenario } from "./customScenarios-DAdS9UmQ.js";
import { g as getReviews, a as getAverageRating, b as getTotalReviews, c as submitRating, d as addReview, l as likeReview, s as sortByFeatured } from "./reviewStorage-B6nD4ZW8.js";
import { T as ThumbsUp, R as RatingReviewSection } from "./RatingReviewSection-DqDlMebf.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
const DIFFICULTY_LABELS$1 = {
  easy: "簡單",
  normal: "普通",
  hard: "困難",
  extreme: "極限"
};
function victoryDescription$1(condition, param) {
  switch (condition) {
    case "reach_money":
      return `資產達到 $${param.toLocaleString()}`;
    case "own_properties":
      return `擁有 ${param} 個地產`;
    case "eliminate_all":
      return "淘汰所有對手";
    default:
      return "未知";
  }
}
const ScenarioDetailView = ({
  scenario,
  onBack,
  onInstall,
  onLike,
  showToast
}) => {
  const [reviews, setReviews] = reactExports.useState(() => getReviews("scenario", scenario.id).reviews);
  const [avgRating, setAvgRating] = reactExports.useState(() => getAverageRating("scenario", scenario.id));
  const [totalReviews, setTotalReviews] = reactExports.useState(() => getTotalReviews("scenario", scenario.id));
  const loadReviews = reactExports.useCallback(() => {
    const data = getReviews("scenario", scenario.id);
    setReviews(data.reviews);
    setAvgRating(getAverageRating("scenario", scenario.id));
    setTotalReviews(getTotalReviews("scenario", scenario.id));
  }, [scenario.id]);
  const handleRate = reactExports.useCallback((score) => {
    submitRating("scenario", scenario.id, "local_user", score);
    loadReviews();
    showToast("評分成功！");
  }, [scenario.id, loadReviews, showToast]);
  const handleAddReview = reactExports.useCallback((text) => {
    const newReview = {
      id: `review_${Date.now()}`,
      author: "我",
      authorScore: 200,
      content: text,
      score: 5,
      likes: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    addReview("scenario", scenario.id, newReview);
    loadReviews();
  }, [scenario.id, loadReviews]);
  const handleLikeReview = reactExports.useCallback((reviewId) => {
    likeReview("scenario", scenario.id, reviewId);
    loadReviews();
  }, [scenario.id, loadReviews]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full px-4 py-6 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--pink)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回列表" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5", style: {
            borderColor: scenario.isFeatured ? "var(--yellow, #facc15)" : "rgba(0, 255, 255, 0.25)",
            boxShadow: scenario.isFeatured ? "0 0 20px rgba(250, 204, 21, 0.2)" : "none"
          }, children: [
            scenario.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-3 text-sm font-cyber tracking-wider", style: {
              color: "var(--yellow)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
              " 精選劇本"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl text-neon-cyan tracking-wider mb-2", children: scenario.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[var(--text-secondary)] mb-4", children: [
              "by ",
              scenario.author
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-primary)] mb-4", children: scenario.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 14 }),
                  " 初始資金"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-neon-cyan", children: [
                  "$",
                  scenario.startingMoney.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { size: 14 }),
                  " AI 對手"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber", children: [
                  scenario.aiCount,
                  " 個 · ",
                  DIFFICULTY_LABELS$1[scenario.aiDifficulty] ?? "未知"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 14 }),
                  " 勝利條件"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", style: {
                  color: "var(--green)"
                }, children: victoryDescription$1(scenario.victoryCondition, scenario.victoryParam) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14 }),
                  " 回合上限"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", children: scenario.maxTurns > 0 ? `${scenario.maxTurns} 回合` : "無限制" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-around mt-4 pt-4 border-t border-[rgba(255_255_255_0.1)] text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", style: {
                color: "var(--pink)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 14 }),
                " ",
                scenario.likes
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", style: {
                color: "var(--cyan)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                " ",
                scenario.downloads
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", style: {
                color: "var(--yellow)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 14, fill: "currentColor" }),
                " ",
                (scenario.rating ?? 0).toFixed(1)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onInstall(scenario.id), className: "cyber-btn flex-1 py-3 font-cyber tracking-wider", style: {
              borderColor: "var(--green)",
              color: "var(--green)",
              backgroundColor: "rgba(0, 255, 128, 0.08)"
            }, children: "一鍵安裝" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onLike(scenario.id), className: "cyber-btn flex-1 py-3 font-cyber tracking-wider", style: {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              backgroundColor: "rgba(255, 107, 157, 0.08)"
            }, children: "點讚" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RatingReviewSection, { contentType: "scenario", contentId: scenario.id, averageRating: avgRating || scenario.rating, ratingCount: totalReviews || scenario.ratings, reviews, onRate: handleRate, onAddReview: handleAddReview, onLikeReview: handleLikeReview }) })
      ] })
    ] })
  ] });
};
const DIFFICULTY_LABELS = {
  easy: "簡單",
  normal: "普通",
  hard: "困難",
  extreme: "極限"
};
const VICTORY_LABELS = {
  reach_money: "達到指定金額",
  own_properties: "擁有指定數量地產",
  eliminate_all: "淘汰所有對手"
};
function victoryDescription(condition, param) {
  switch (condition) {
    case "reach_money":
      return `資產達到 $${param.toLocaleString()}`;
    case "own_properties":
      return `擁有 ${param} 個地產`;
    case "eliminate_all":
      return "淘汰所有對手";
    default:
      return "未知";
  }
}
const ScenarioEditorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("editor");
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [startingMoney, setStartingMoney] = reactExports.useState(15e3);
  const [aiCount, setAiCount] = reactExports.useState(1);
  const [aiDifficulty, setAiDifficulty] = reactExports.useState("normal");
  const [victoryCondition, setVictoryCondition] = reactExports.useState("eliminate_all");
  const [victoryParam, setVictoryParam] = reactExports.useState(1e5);
  const [maxTurns, setMaxTurns] = reactExports.useState(0);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [localScenarios, setLocalScenarios] = reactExports.useState([]);
  const [communityScenarios, setCommunityScenarios] = reactExports.useState([]);
  const [selectedScenario, setSelectedScenario] = reactExports.useState(null);
  const [toast, setToast] = reactExports.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = reactExports.useState(false);
  const showToast = reactExports.useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2e3);
  }, []);
  const refreshLocal = reactExports.useCallback(() => {
    setLocalScenarios(getLocalScenarios());
  }, []);
  const refreshCommunity = reactExports.useCallback(() => {
    setCommunityScenarios(getCommunityScenarios());
  }, []);
  reactExports.useEffect(() => {
    refreshLocal();
  }, [refreshLocal]);
  reactExports.useEffect(() => {
    refreshCommunity();
  }, [refreshCommunity]);
  const handleVictoryConditionChange = (value) => {
    setVictoryCondition(value);
    if (value !== "reach_money" && value !== "own_properties") {
      setVictoryParam(0);
    }
  };
  const resetForm = () => {
    setName("");
    setDescription("");
    setStartingMoney(15e3);
    setAiCount(1);
    setAiDifficulty("normal");
    setVictoryCondition("eliminate_all");
    setVictoryParam(1e5);
    setMaxTurns(0);
    setEditingId(null);
  };
  const handleSave = () => {
    if (!name.trim()) {
      showToast("請輸入劇本名稱");
      return;
    }
    if (!Number.isInteger(startingMoney) || startingMoney < 1e3 || startingMoney > 5e5) {
      showToast("初始資金必須為 1000 ~ 500000 的整數");
      return;
    }
    if (!Number.isInteger(maxTurns) || maxTurns < 0) {
      showToast("回合上限必須為 >= 0 的整數");
      return;
    }
    if (!Number.isInteger(aiCount) || aiCount < 1 || aiCount > 3) {
      showToast("AI 對手數量必須為 1 ~ 3");
      return;
    }
    if ((victoryCondition === "reach_money" || victoryCondition === "own_properties") && (!Number.isInteger(victoryParam) || victoryParam <= 0)) {
      showToast("勝利條件參數必須為正整數");
      return;
    }
    const existing = editingId ? localScenarios.find((s) => s.id === editingId) : null;
    const scenario = {
      id: editingId || `scenario_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      author: "我",
      startingMoney,
      aiCount,
      aiDifficulty,
      victoryCondition,
      victoryParam,
      maxTurns,
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      authorScore: 100,
      isFeatured: false,
      createdAt: existing?.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      saveLocalScenario(scenario);
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        showToast("儲存失敗：儲存空間已滿");
        return;
      }
      showToast("儲存失敗");
      return;
    }
    refreshLocal();
    showToast("儲存成功！");
  };
  const handleEdit = (scenario) => {
    setEditingId(scenario.id);
    setName(scenario.name);
    setDescription(scenario.description);
    setStartingMoney(scenario.startingMoney);
    setAiCount(scenario.aiCount);
    const validDifficulties = ["easy", "normal", "hard", "extreme"];
    if (validDifficulties.includes(scenario.aiDifficulty)) {
      setAiDifficulty(scenario.aiDifficulty);
    } else {
      setAiDifficulty("normal");
      showToast("數據格式已升級");
    }
    const validVictory = ["reach_money", "own_properties", "eliminate_all"];
    if (validVictory.includes(scenario.victoryCondition)) {
      setVictoryCondition(scenario.victoryCondition);
    } else {
      setVictoryCondition("eliminate_all");
      showToast("數據格式已升級");
    }
    setVictoryParam(scenario.victoryParam);
    setMaxTurns(scenario.maxTurns);
    setActiveTab("editor");
  };
  const handleDelete = () => {
    if (!editingId) return;
    deleteLocalScenario(editingId);
    refreshLocal();
    resetForm();
    setShowDeleteConfirm(false);
    showToast("已刪除");
  };
  const handlePublish = () => {
    if (!name.trim()) {
      showToast("請輸入劇本名稱");
      return;
    }
    const scenario = {
      id: "",
      name: name.trim(),
      description: description.trim(),
      author: "我",
      startingMoney,
      aiCount,
      aiDifficulty,
      victoryCondition,
      victoryParam,
      maxTurns,
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      authorScore: 100,
      isFeatured: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    publishScenario(scenario, "我");
    refreshCommunity();
    showToast("已發布到社區！");
  };
  const handleInstall = (id) => {
    const success = installScenario(id);
    refreshCommunity();
    if (success) showToast("安裝成功！");
    else showToast("安裝失敗或已存在");
  };
  const handleLike = (id) => {
    likeScenario(id);
    refreshCommunity();
    const updated = getCommunityScenarios().find((s) => s.id === id);
    if (updated && selectedScenario?.id === id) setSelectedScenario(updated);
    showToast("已點讚");
  };
  const handleSelect = (scenario) => {
    setSelectedScenario(scenario);
  };
  if (activeTab === "community" && selectedScenario) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScenarioDetailView, { scenario: selectedScenario, onBack: () => setSelectedScenario(null), onInstall: handleInstall, onLike: handleLike, showToast }),
      toast && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider", style: {
        background: "var(--bg-dark)",
        border: "1px solid var(--cyan)",
        color: "var(--cyan)",
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)"
      }, children: toast })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full px-4 py-6 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--pink)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/"), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "劇本製作器" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 max-w-xl", children: [{
        key: "editor",
        label: "劇本編輯",
        icon: Zap
      }, {
        key: "community",
        label: "社區劇本",
        icon: Sparkles
      }].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
          color: isActive ? "var(--cyan)" : "var(--text-secondary)",
          backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "transparent"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
          tab.label
        ] }, tab.key);
      }) }),
      activeTab === "editor" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4", style: {
            borderColor: "rgba(0, 255, 255, 0.2)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "劇本名稱" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "輸入劇本名稱", className: "cyber-input w-full text-sm" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "劇本描述" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "描述劇本背景與特色", rows: 3, className: "cyber-input w-full text-sm resize-none" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "初始資金" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: startingMoney, onChange: (e) => setStartingMoney(Number(e.target.value)), className: "cyber-input w-full text-sm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "對手人數" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: aiCount, onChange: (e) => setAiCount(Number(e.target.value)), className: "cyber-input w-full text-sm", style: {
                  appearance: "none"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 1, children: "1 個 AI" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 2, children: "2 個 AI" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 3, children: "3 個 AI" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "AI 難度" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: aiDifficulty, onChange: (e) => setAiDifficulty(e.target.value), className: "cyber-input w-full text-sm", style: {
                appearance: "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "easy", children: "簡單" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "normal", children: "普通" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hard", children: "困難" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "extreme", children: "極限" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "勝利條件" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: victoryCondition, onChange: (e) => handleVictoryConditionChange(e.target.value), className: "cyber-input w-full text-sm", style: {
                appearance: "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reach_money", children: "達到指定金額" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "own_properties", children: "擁有指定數量地產" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "eliminate_all", children: "淘汰所有對手" })
              ] })
            ] }),
            (victoryCondition === "reach_money" || victoryCondition === "own_properties") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: victoryCondition === "reach_money" ? "目標金額" : "目標地產數量" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: victoryParam, onChange: (e) => setVictoryParam(Number(e.target.value)), className: "cyber-input w-full text-sm" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "回合上限（0 表示無限制）" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: maxTurns, onChange: (e) => setMaxTurns(Number(e.target.value)), className: "cyber-input w-full text-sm", min: 0 })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
            borderColor: "var(--green)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-3", children: "劇本預覽" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-cyan tracking-wider mb-2", children: name || "劇本名稱" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mb-3 min-h-[32px]", children: description || "劇本描述" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "初始資金" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-neon-cyan", children: [
                  "$",
                  startingMoney.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "AI 對手" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber", children: [
                  aiCount,
                  " 個 · ",
                  DIFFICULTY_LABELS[aiDifficulty]
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "勝利條件" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", style: {
                  color: "var(--green)"
                }, children: victoryDescription(victoryCondition, victoryParam) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "回合上限" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", children: maxTurns > 0 ? `${maxTurns} 回合` : "無限制" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSave, className: "cyber-btn flex-1 py-2.5 font-cyber tracking-wider flex items-center justify-center gap-2", style: {
              borderColor: "var(--cyan)",
              color: "var(--cyan)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 16 }),
              editingId ? "更新" : "保存到本地"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handlePublish, className: "cyber-btn flex-1 py-2.5 font-cyber tracking-wider flex items-center justify-center gap-2", style: {
              borderColor: "var(--green)",
              color: "var(--green)",
              backgroundColor: "rgba(0, 255, 128, 0.08)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
              "上傳分享"
            ] }),
            editingId && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowDeleteConfirm(true), className: "cyber-btn py-2.5 px-4 font-cyber tracking-wider flex items-center justify-center gap-2", style: {
              borderColor: "var(--red)",
              color: "var(--red)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }),
              "刪除"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: [
            "本地劇本 (",
            localScenarios.length,
            ")"
          ] }),
          localScenarios.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 text-center text-sm", style: {
            color: "var(--text-secondary)"
          }, children: "尚無自製劇本" }) : localScenarios.map((scenario) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleEdit(scenario), className: "cyber-card w-full p-3 text-left hover:scale-[1.01]", style: {
            borderColor: editingId === scenario.id ? "var(--pink)" : "rgba(0, 255, 255, 0.15)",
            boxShadow: editingId === scenario.id ? "0 0 10px rgba(255, 107, 157, 0.2)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider text-[var(--text-primary)] truncate", children: scenario.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] line-clamp-2", children: scenario.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--cyan)] mt-1", children: [
              "$",
              (Number(scenario.startingMoney) || 0).toLocaleString(),
              " · ",
              scenario.aiCount,
              "AI · ",
              DIFFICULTY_LABELS[scenario.aiDifficulty] ?? "未知"
            ] })
          ] }, scenario.id))
        ] })
      ] }),
      activeTab === "community" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
        sortByFeatured(communityScenarios, "scenario").map((scenario) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelect(scenario), className: "cyber-card p-4 text-left hover:scale-[1.02] transition-transform", style: {
          borderColor: scenario.isFeatured ? "var(--yellow, #facc15)" : "rgba(0, 255, 255, 0.2)",
          boxShadow: scenario.isFeatured ? "0 0 15px rgba(250, 204, 21, 0.25)" : "none"
        }, children: [
          scenario.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-2 text-xs font-cyber tracking-wider", style: {
            color: "var(--yellow)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
            " 精選"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base tracking-wider text-neon-cyan truncate mb-1", children: scenario.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] line-clamp-2 mb-2 min-h-[32px]", children: scenario.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "初始資金" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-neon-cyan", children: [
                "$",
                (Number(scenario.startingMoney) || 0).toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "AI" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber", children: [
                scenario.aiCount,
                " 個 · ",
                DIFFICULTY_LABELS[scenario.aiDifficulty] ?? "未知"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "勝利" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", style: {
                color: "var(--green)"
              }, children: VICTORY_LABELS[scenario.victoryCondition] ?? "未知" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--text-secondary)] mt-3 pt-2 border-t border-[rgba(255_255_255_0.08)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "by ",
              scenario.author
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 12 }),
                scenario.likes
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", style: {
                color: "var(--yellow)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, fill: "currentColor" }),
                (scenario.rating ?? 0).toFixed(1)
              ] })
            ] })
          ] })
        ] }, scenario.id)),
        communityScenarios.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-8 text-center col-span-full text-sm", style: {
          color: "var(--text-secondary)"
        }, children: "社區尚未有劇本，來建立第一個吧！" })
      ] })
    ] }),
    toast && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider", style: {
      background: "var(--bg-dark)",
      border: "1px solid var(--cyan)",
      color: "var(--cyan)",
      boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)"
    }, children: toast }),
    showDeleteConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5", style: {
      borderColor: "var(--red)",
      background: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider mb-3", style: {
        color: "var(--red)"
      }, children: "確認刪除" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mb-5", style: {
        color: "var(--text-secondary)"
      }, children: [
        "確定要刪除劇本「",
        name,
        "」嗎？此操作無法復原。"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowDeleteConfirm(false), className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleDelete, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          background: "rgba(255, 77, 77, 0.08)"
        }, children: "確認刪除" })
      ] })
    ] }) })
  ] });
};
export {
  ScenarioEditorPage as default
};
