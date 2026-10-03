import { r as reactExports, bY as toast, j as jsxRuntimeExports, bW as Upload, X, bZ as Map, b9 as Sparkles, g as CircleAlert, u as useNavigate, bE as ChevronLeft, bu as Heart, bp as Search, bq as Download, aL as Star, bQ as CELL_COUNT } from "./index-ymfxQ6bv.js";
import { p as publishMap, M as MAP_TAGS, g as getCommunityMaps, a as getFavoriteMaps, l as likeMap, t as toggleFavorite, i as installMap } from "./communityMaps-BlnLIw6j.js";
import { g as getReviews, a as getAverageRating, b as getTotalReviews, c as submitRating, d as addReview, l as likeReview, s as sortByFeatured } from "./reviewStorage-B6nD4ZW8.js";
import { T as ThumbsUp, R as RatingReviewSection } from "./RatingReviewSection-DqDlMebf.js";
import { T as Tag } from "./tag-1R_UeV2d.js";
import { P as PullToRefresh } from "./PullToRefresh-akScp87q.js";
import { G as Grid3x3 } from "./grid-3x3-Du20R1QB.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
const UploadMapDialog = ({
  open,
  onClose,
  localMaps,
  authorName,
  onPublished
}) => {
  const [selectedMapId, setSelectedMapId] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [selectedTags, setSelectedTags] = reactExports.useState([]);
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      setSelectedMapId(localMaps[0]?.id ?? "");
      setName(localMaps[0]?.name ?? "");
      setDescription("");
      setSelectedTags([]);
      setSubmitting(false);
    }
  }, [open, localMaps]);
  const selectedMap = reactExports.useMemo(() => localMaps.find((m) => m.id === selectedMapId), [localMaps, selectedMapId]);
  const handleMapSelect = reactExports.useCallback((id) => {
    setSelectedMapId(id);
    const m = localMaps.find((map) => map.id === id);
    if (m) setName(m.name);
  }, [localMaps]);
  const toggleTag = reactExports.useCallback((tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 3));
  }, []);
  const handleSubmit = reactExports.useCallback(() => {
    if (!selectedMap) {
      toast.error("請選擇要上傳的地圖");
      return;
    }
    if (!name.trim()) {
      toast.error("請輸入地圖名稱");
      return;
    }
    if (selectedTags.length === 0) {
      toast.error("請至少選擇一個標籤");
      return;
    }
    setSubmitting(true);
    try {
      const mapToPublish = {
        ...selectedMap,
        name: name.trim()
      };
      const newId = publishMap(mapToPublish, authorName, description.trim(), selectedTags);
      toast.success("地圖已發布到社區！");
      onPublished?.(newId);
      onClose();
    } catch {
      toast.error("發布失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  }, [selectedMap, name, description, selectedTags, authorName, onPublished, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: {
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(4px)"
  }, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg overflow-hidden", style: {
    background: "linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(20,10,40,0.98) 100%)",
    border: "1px solid var(--pink)",
    boxShadow: "0 0 30px rgba(255, 0, 170, 0.3), inset 0 0 30px rgba(255, 0, 170, 0.05)"
  }, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b", style: {
      borderColor: "rgba(255, 0, 170, 0.2)",
      background: "rgba(255, 0, 170, 0.05)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 20, style: {
        color: "var(--pink)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-wider flex-1", style: {
        color: "var(--pink)",
        textShadow: "0 0 10px var(--pink)"
      }, children: "上傳地圖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "cyber-btn p-1.5", style: {
        borderColor: "var(--red)",
        color: "var(--red)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: localMaps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { size: 40, className: "mx-auto mb-3", style: {
        color: "var(--text-secondary)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: {
        color: "var(--text-secondary)"
      }, children: "暫無本地地圖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", style: {
        color: "var(--text-secondary)"
      }, children: "請先前往地圖編輯器創建並保存地圖" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold block mb-2", style: {
          color: "var(--text-primary)"
        }, children: "選擇本地地圖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-32 overflow-y-auto pr-1", children: localMaps.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleMapSelect(m.id), className: "w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 transition-all", style: {
          background: selectedMapId === m.id ? "rgba(255, 0, 170, 0.1)" : "rgba(0,0,0,0.3)",
          border: `1px solid ${selectedMapId === m.id ? "var(--pink)" : "rgba(255,255,255,0.1)"}`,
          color: selectedMapId === m.id ? "var(--pink)" : "var(--text-primary)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: m.name }),
          selectedMapId === m.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14, className: "ml-auto flex-shrink-0" })
        ] }, m.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold block mb-2", style: {
          color: "var(--text-primary)"
        }, children: "地圖名稱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "輸入地圖名稱", maxLength: 30, className: "w-full px-3 py-2 text-sm rounded-md outline-none", style: {
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "var(--text-primary)"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold block mb-2", style: {
          color: "var(--text-primary)"
        }, children: "地圖描述" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "簡單介紹你的地圖特色...", maxLength: 200, rows: 3, className: "w-full px-3 py-2 text-sm rounded-md outline-none resize-none", style: {
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "var(--text-primary)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs mt-1", style: {
          color: "var(--text-secondary)"
        }, children: [
          description.length,
          "/200"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold flex items-center gap-1", style: {
            color: "var(--text-primary)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 12 }),
            "選擇標籤（最多 3 個）"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", style: {
            color: "var(--text-secondary)"
          }, children: [
            selectedTags.length,
            "/3"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: MAP_TAGS.map((tag) => {
          const active = selectedTags.includes(tag);
          const disabled = !active && selectedTags.length >= 3;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => !disabled && toggleTag(tag), className: "px-2.5 py-1 text-xs rounded-full transition-all", style: {
            background: active ? "rgba(255, 0, 170, 0.15)" : "rgba(0,0,0,0.3)",
            border: `1px solid ${active ? "var(--pink)" : "rgba(255,255,255,0.1)"}`,
            color: active ? "var(--pink)" : disabled ? "var(--text-secondary)" : "var(--text-primary)",
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? "not-allowed" : "pointer"
          }, children: tag }, tag);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded flex gap-2 text-xs", style: {
        background: "rgba(255, 215, 0, 0.05)",
        border: "1px solid rgba(255, 215, 0, 0.2)",
        color: "var(--text-secondary)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14, className: "flex-shrink-0 mt-0.5", style: {
          color: "#ffd700"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "上傳即表示您同意社區公約，禁止發布含有違規內容的地圖。" })
      ] })
    ] }) }),
    localMaps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 px-4 py-3 border-t", style: {
      borderColor: "rgba(255,255,255,0.08)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "cyber-btn cyber-btn-sm flex-1 py-2 text-sm", style: {
        borderColor: "rgba(255,255,255,0.2)",
        color: "var(--text-secondary)"
      }, children: "取消" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleSubmit, disabled: submitting, className: "cyber-btn cyber-btn-sm flex-1 py-2 text-sm font-bold", style: {
        borderColor: "var(--pink)",
        color: "var(--pink)",
        background: "rgba(255, 0, 170, 0.1)"
      }, children: submitting ? "發布中..." : "確認發布" })
    ] })
  ] }) });
};
function MiniMapPreview({
  cells
}) {
  if (!cells || cells.length !== CELL_COUNT) return null;
  const sideLen = 10;
  const positions = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    let x = 0;
    let y = 0;
    if (i <= 9) {
      x = i;
      y = 9;
    } else if (i <= 17) {
      x = 9;
      y = 9 - (i - 9);
    } else if (i <= 26) {
      x = 9 - (i - 18);
      y = 0;
    } else {
      x = 0;
      y = i - 27;
    }
    positions.push({
      x,
      y,
      cell: cells[i]
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid w-full aspect-square gap-px p-1 rounded-sm", style: {
    gridTemplateColumns: `repeat(${sideLen}, 1fr)`,
    background: "rgba(0, 255, 255, 0.1)"
  }, children: positions.map((pos, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1px]", style: {
    backgroundColor: pos.cell.color || "#333"
  } }, idx)) });
}
const CELL_TYPE_COLORS = {
  property: "var(--cyan)",
  fate: "var(--purple)",
  start: "var(--green)",
  detention: "var(--red)",
  chance: "#fb923c",
  minigame: "#facc15",
  parking: "#64748b",
  jail: "#ef4444",
  event: "#a855f7",
  teleport: "#22d3ee"
};
function MapTypeGrid({
  cells
}) {
  const sideLen = 10;
  const displayCells = cells && cells.length === CELL_COUNT ? cells : Array.from({
    length: CELL_COUNT
  }, (_, i) => ({
    id: i,
    name: `格子${i}`,
    type: "property",
    basePrice: 0,
    color: "#333"
  }));
  const gridItems = [];
  let cellIdx = 0;
  for (let y = 0; y < sideLen; y++) {
    for (let x = 0; x < sideLen; x++) {
      const isEdge = y === 0 || y === sideLen - 1 || x === 0 || x === sideLen - 1;
      if (isEdge) {
        gridItems.push({
          idx: cellIdx,
          cell: displayCells[cellIdx] ?? null
        });
        cellIdx += 1;
      } else {
        gridItems.push({
          idx: -1,
          cell: null
        });
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid w-full aspect-square gap-px p-2 rounded-sm", style: {
    gridTemplateColumns: `repeat(${sideLen}, 1fr)`,
    background: "rgba(168, 85, 247, 0.15)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.1)"
  }, children: gridItems.map((item, i) => {
    if (!item.cell) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-transparent" }, i);
    }
    const bg = CELL_TYPE_COLORS[item.cell.type] ?? "#6b7280";
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1px]", style: {
      backgroundColor: bg,
      boxShadow: `0 0 4px ${bg}`,
      opacity: 0.85
    }, title: item.cell.name }, i);
  }) });
}
const CommunityMapsPage = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [sortType, setSortType] = reactExports.useState("hot");
  const [selectedMap, setSelectedMap] = reactExports.useState(null);
  const [toast2, setToast] = reactExports.useState("");
  const [reviews, setReviews] = reactExports.useState([]);
  const [avgRating, setAvgRating] = reactExports.useState(0);
  const [totalReviews, setTotalReviews] = reactExports.useState(0);
  const [viewType, setViewType] = reactExports.useState("all");
  const [activeTag, setActiveTag] = reactExports.useState(null);
  const [uploadOpen, setUploadOpen] = reactExports.useState(false);
  const [favorites, setFavorites] = reactExports.useState([]);
  const [localMaps, setLocalMaps] = reactExports.useState([]);
  const [favoriteStates, setFavoriteStates] = reactExports.useState({});
  const refreshMaps = reactExports.useCallback(() => {
    setMaps(getCommunityMaps());
    setFavorites(getFavoriteMaps());
    const favMap = {};
    getFavoriteMaps().forEach((id) => {
      favMap[id] = true;
    });
    setFavoriteStates(favMap);
  }, []);
  reactExports.useEffect(() => {
    refreshMaps();
    try {
      const raw = localStorage.getItem("cyber_monopoly_custom_maps");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLocalMaps(parsed);
      }
    } catch {
    }
  }, [refreshMaps]);
  const showToast = reactExports.useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2e3);
  }, []);
  const loadReviews = reactExports.useCallback((mapId) => {
    const data = getReviews("map", mapId);
    setReviews(data.reviews);
    setAvgRating(getAverageRating("map", mapId));
    setTotalReviews(getTotalReviews("map", mapId));
  }, []);
  const handleSelect = reactExports.useCallback((map) => {
    setSelectedMap(map);
    loadReviews(map.id);
  }, [loadReviews]);
  const handleLike = reactExports.useCallback((id) => {
    likeMap(id);
    refreshMaps();
    const updated = getCommunityMaps().find((m) => m.id === id);
    if (updated) setSelectedMap(updated);
    showToast("已點讚！");
  }, [refreshMaps, showToast]);
  const handleToggleFavorite = reactExports.useCallback((id) => {
    const isFav = toggleFavorite(id);
    setFavorites(getFavoriteMaps());
    setFavoriteStates((prev) => ({
      ...prev,
      [id]: isFav
    }));
    showToast(isFav ? "已加入收藏" : "已取消收藏");
    const updated = getCommunityMaps().find((m) => m.id === id);
    if (updated) setSelectedMap(updated);
  }, []);
  reactExports.useCallback((id) => {
    const success = installMap(id);
    refreshMaps();
    if (success) {
      showToast("安裝成功！已加入本地地圖庫");
    } else {
      showToast("安裝失敗：地圖已存在或格式錯誤");
    }
  }, [refreshMaps, showToast]);
  const handleRate = reactExports.useCallback((score) => {
    if (!selectedMap) return;
    submitRating("map", selectedMap.id, "local_user", score);
    loadReviews(selectedMap.id);
    showToast("評分成功！");
  }, [selectedMap, loadReviews, showToast]);
  const handleAddReview = reactExports.useCallback((text) => {
    if (!selectedMap) return;
    const newReview = {
      id: `review_${Date.now()}`,
      author: "我",
      authorScore: 200,
      content: text,
      score: 5,
      likes: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    addReview("map", selectedMap.id, newReview);
    loadReviews(selectedMap.id);
  }, [selectedMap, loadReviews]);
  const handleLikeReview = reactExports.useCallback((reviewId) => {
    if (!selectedMap) return;
    likeReview("map", selectedMap.id, reviewId);
    loadReviews(selectedMap.id);
  }, [selectedMap, loadReviews]);
  const filteredMaps = maps.filter((m) => {
    if (viewType === "favorites" && !favorites.includes(m.id)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.author.toLowerCase().includes(q);
  }).filter((m) => activeTag ? m.tags.includes(activeTag) : true).sort((a, b) => {
    if (sortType === "hot") return b.likes + b.downloads - (a.likes + a.downloads);
    if (sortType === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.rating - a.rating;
  });
  const featuredSortedMaps = sortByFeatured(filteredMaps, "map");
  if (!selectedMap) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full px-4 py-6 scanlines relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
          background: "var(--cyan)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
          background: "var(--pink)"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-5xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/"), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "社區地圖" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [{
            key: "all",
            label: "全部地圖",
            icon: Grid3x3
          }, {
            key: "favorites",
            label: "我的收藏",
            icon: Heart
          }].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setViewType(v.key), className: "cyber-btn cyber-btn-sm font-cyber tracking-wider flex items-center gap-1.5", style: {
            borderColor: viewType === v.key ? "var(--pink)" : "rgba(255, 255, 255, 0.1)",
            color: viewType === v.key ? "var(--pink)" : "var(--text-secondary)",
            backgroundColor: viewType === v.key ? "rgba(255, 0, 170, 0.08)" : "transparent"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(v.icon, { size: 14 }),
            v.label,
            v.key === "favorites" && favorites.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 rounded-full", style: {
              background: "var(--pink)",
              color: "#fff"
            }, children: favorites.length })
          ] }, v.key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setUploadOpen(true), className: "cyber-btn cyber-btn-sm font-cyber tracking-wider ml-auto flex items-center gap-1.5", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)",
            backgroundColor: "rgba(0, 255, 255, 0.08)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 14 }),
            "上傳地圖"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber flex items-center gap-1", style: {
            color: "var(--text-secondary)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 12 }),
            "標籤："
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveTag(null), className: "px-2.5 py-1 text-xs rounded-full transition-all", style: {
            background: !activeTag ? "rgba(0, 255, 255, 0.15)" : "rgba(0,0,0,0.3)",
            border: `1px solid ${!activeTag ? "var(--cyan)" : "rgba(255,255,255,0.1)"}`,
            color: !activeTag ? "var(--cyan)" : "var(--text-secondary)"
          }, children: "全部" }),
          MAP_TAGS.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveTag(activeTag === tag ? null : tag), className: "px-2.5 py-1 text-xs rounded-full transition-all", style: {
            background: activeTag === tag ? "rgba(255, 0, 170, 0.15)" : "rgba(0,0,0,0.3)",
            border: `1px solid ${activeTag === tag ? "var(--pink)" : "rgba(255,255,255,0.1)"}`,
            color: activeTag === tag ? "var(--pink)" : "var(--text-secondary)"
          }, children: tag }, tag))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2", style: {
              color: "var(--text-secondary)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "搜尋地圖名稱、作者...", className: "cyber-input w-full pl-10" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [{
            key: "hot",
            label: "熱度"
          }, {
            key: "newest",
            label: "最新"
          }, {
            key: "rating",
            label: "評分"
          }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSortType(s.key), className: "cyber-btn cyber-btn-sm font-cyber tracking-wider", style: {
            borderColor: sortType === s.key ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
            color: sortType === s.key ? "var(--cyan)" : "var(--text-secondary)",
            backgroundColor: sortType === s.key ? "rgba(0, 255, 255, 0.08)" : "transparent"
          }, children: s.label }, s.key)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PullToRefresh, { onRefresh: async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 800);
          });
          refreshMaps();
        }, className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scroll-container", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: featuredSortedMaps.map((map) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelect(map), className: "cyber-card p-4 text-left hover:scale-[1.02] transition-transform", style: {
            borderColor: map.isFeatured ? "var(--yellow, #facc15)" : "rgba(0, 255, 255, 0.2)",
            boxShadow: map.isFeatured ? "0 0 15px rgba(250, 204, 21, 0.25)" : "none"
          }, children: [
            map.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-2 text-xs font-cyber tracking-wider", style: {
              color: "var(--yellow)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
              "精選地圖"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MiniMapPreview, { cells: map.mapData }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base text-neon-cyan tracking-wider truncate", children: map.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] truncate", children: [
                  "by ",
                  map.author,
                  " · ",
                  map.authorScore,
                  " 積分"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 12 }),
                    map.likes
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 12 }),
                    map.downloads
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", style: {
                    color: "var(--yellow)"
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, fill: "currentColor" }),
                    (Number(map.rating) || 0).toFixed(1)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
                    e.stopPropagation();
                    handleToggleFavorite(map.id);
                  }, className: "ml-auto flex-shrink-0 p-1 rounded transition-all hover:scale-110", style: {
                    color: favoriteStates[map.id] ? "var(--red)" : "var(--text-secondary)"
                  }, title: favoriteStates[map.id] ? "取消收藏" : "收藏", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 14, fill: favoriteStates[map.id] ? "currentColor" : "none" }) })
                ] })
              ] })
            ] })
          ] }, map.id)) }),
          filteredMaps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center mt-4", style: {
            borderColor: "rgba(0, 255, 255, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 40, className: "mx-auto mb-3", style: {
              color: "var(--text-secondary)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] font-cyber tracking-wider", children: "找不到符合條件的地圖" })
          ] })
        ] }) })
      ] }),
      toast2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider", style: {
        background: "var(--bg-dark)",
        border: "1px solid var(--cyan)",
        color: "var(--cyan)",
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)"
      }, children: toast2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(UploadMapDialog, { open: uploadOpen, onClose: () => setUploadOpen(false), localMaps, authorName: "賽博玩家", onPublished: () => refreshMaps() })
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedMap(null), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回列表" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5", style: {
            borderColor: selectedMap.isFeatured ? "var(--yellow, #facc15)" : "rgba(0, 255, 255, 0.25)",
            boxShadow: selectedMap.isFeatured ? "0 0 20px rgba(250, 204, 21, 0.2)" : "none"
          }, children: [
            selectedMap.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-3 text-sm font-cyber tracking-wider", style: {
              color: "var(--yellow)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
              "精選地圖"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl text-neon-cyan tracking-wider mb-2", children: selectedMap.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[var(--text-secondary)] mb-3", children: [
              "by ",
              selectedMap.author,
              " · ",
              selectedMap.authorScore,
              " 積分"
            ] }),
            selectedMap.tags && selectedMap.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-3", children: selectedMap.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-[10px] rounded-full font-cyber tracking-wider", style: {
              background: "rgba(0, 255, 255, 0.1)",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              color: "var(--cyan)"
            }, children: tag }, tag)) }),
            selectedMap.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 rounded text-sm leading-relaxed", style: {
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "var(--text-primary)"
            }, children: selectedMap.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-2", style: {
                color: "var(--text-secondary)"
              }, children: "地圖預覽" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xs mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapTypeGrid, { cells: selectedMap.mapData }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center text-[10px] text-[var(--text-secondary)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm", style: {
                    background: "var(--cyan)"
                  } }),
                  "地產"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm", style: {
                    background: "var(--green)"
                  } }),
                  "起點"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm", style: {
                    background: "var(--red)"
                  } }),
                  "禁閉"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm", style: {
                    background: "var(--purple)"
                  } }),
                  "命運"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm", style: {
                    background: "#fb923c"
                  } }),
                  "機會"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm", style: {
                    background: "#facc15"
                  } }),
                  "小遊戲"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-around text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", style: {
                  color: "var(--pink)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 16 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg", children: selectedMap.likes })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "讚" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", style: {
                  color: "var(--cyan)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg", children: selectedMap.downloads })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "下載" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", style: {
                  color: "var(--yellow)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 16, fill: "currentColor" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg", children: (Number(selectedMap.rating) || 0).toFixed(1) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "評分" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleToggleFavorite(selectedMap.id), className: `cyber-btn flex-1 py-3 font-cyber tracking-wider flex items-center justify-center gap-2 ${favoriteStates[selectedMap.id] ? "flex-[0.8]" : ""}`, style: {
              borderColor: favoriteStates[selectedMap.id] ? "var(--red)" : "rgba(255,255,255,0.15)",
              color: favoriteStates[selectedMap.id] ? "var(--red)" : "var(--text-secondary)",
              backgroundColor: favoriteStates[selectedMap.id] ? "rgba(255, 0, 0, 0.08)" : "transparent"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 16, fill: favoriteStates[selectedMap.id] ? "currentColor" : "none" }),
              favoriteStates[selectedMap.id] ? "已收藏" : "收藏"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleLike(selectedMap.id), className: "cyber-btn flex-1 py-3 font-cyber tracking-wider", style: {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              backgroundColor: "rgba(255, 107, 157, 0.08)"
            }, children: "點讚" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RatingReviewSection, { contentType: "map", contentId: selectedMap.id, averageRating: avgRating || selectedMap.rating, ratingCount: totalReviews || selectedMap.ratings, reviews, onRate: handleRate, onAddReview: handleAddReview, onLikeReview: handleLikeReview }) })
      ] })
    ] }),
    toast2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider", style: {
      background: "var(--bg-dark)",
      border: "1px solid var(--cyan)",
      color: "var(--cyan)",
      boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)"
    }, children: toast2 })
  ] });
};
export {
  CommunityMapsPage as default
};
