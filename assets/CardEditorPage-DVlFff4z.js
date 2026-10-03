import { r as reactExports, j as jsxRuntimeExports, bq as Download, aL as Star, u as useNavigate, bE as ChevronLeft, aD as Plus, b9 as Sparkles, bV as Save, bW as Upload, br as Trash2 } from "./index-Clt-7orM.js";
import { g as getReviews, a as getAverageRating, b as getTotalReviews, c as submitRating, d as addReview, l as likeReview, s as sortByFeatured } from "./reviewStorage-B6nD4ZW8.js";
import { T as ThumbsUp, R as RatingReviewSection } from "./RatingReviewSection-hvHbPznE.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
const LOCAL_KEY = "cyber_monopoly_custom_cards_local";
const COMMUNITY_KEY = "cyber_monopoly_community_cards";
function isCardLike(data) {
  if (typeof data !== "object" || data === null) return false;
  const c = data;
  return typeof c.id === "string" && typeof c.name === "string" && typeof c.description === "string";
}
function readCards(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isCardLike);
    }
  } catch {
  }
  return [];
}
function writeCards(key, cards) {
  try {
    localStorage.setItem(key, JSON.stringify(cards));
  } catch {
  }
}
function defaultCommunityCards() {
  return [{
    id: "card_hack",
    name: "駭客入侵",
    description: "你的系統被駭客入侵，損失 2000 元",
    cardType: "fate",
    effect: {
      type: "money",
      amount: -2e3
    },
    author: "駭客王者",
    likes: 156,
    downloads: 312,
    rating: 4.3,
    ratings: 45,
    isFeatured: false,
    createdAt: "2025-04-10T00:00:00.000Z"
  }, {
    id: "card_luckystar",
    name: "幸運星降臨",
    description: "幸運之星降臨，獲得 3000 元獎金",
    cardType: "fate",
    effect: {
      type: "money",
      amount: 3e3
    },
    author: "命運女神",
    likes: 234,
    downloads: 480,
    rating: 4.7,
    ratings: 89,
    isFeatured: true,
    createdAt: "2025-02-15T00:00:00.000Z"
  }, {
    id: "card_blackmarket",
    name: "黑市交易",
    description: "從黑市交易中偷取其他玩家 1500 元",
    cardType: "chance",
    effect: {
      type: "steal_money",
      amount: 1500
    },
    author: "商業大亨",
    likes: 89,
    downloads: 176,
    rating: 4.1,
    ratings: 28,
    isFeatured: false,
    createdAt: "2025-05-05T00:00:00.000Z"
  }, {
    id: "card_timerewind",
    name: "時光倒流",
    description: "時光逆流，後退 5 步",
    cardType: "chance",
    effect: {
      type: "backward",
      steps: 5
    },
    author: "科學家",
    likes: 67,
    downloads: 134,
    rating: 3.9,
    ratings: 19,
    isFeatured: false,
    createdAt: "2025-06-12T00:00:00.000Z"
  }];
}
function getLocalCustomCards(cardType) {
  const cards = readCards(LOCAL_KEY);
  return cards;
}
function saveLocalCard(card) {
  const cards = readCards(LOCAL_KEY);
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    cards[idx] = card;
  } else {
    cards.unshift(card);
  }
  writeCards(LOCAL_KEY, cards);
}
function deleteLocalCard(id) {
  const cards = readCards(LOCAL_KEY).filter((c) => c.id !== id);
  writeCards(LOCAL_KEY, cards);
}
function getCommunityCards(cardType) {
  let cards = readCards(COMMUNITY_KEY);
  if (cards.length === 0) {
    cards = defaultCommunityCards();
    writeCards(COMMUNITY_KEY, cards);
  }
  if (cardType) return cards.filter((c) => c.cardType === cardType);
  return cards;
}
function publishCard(card, author) {
  const cards = getCommunityCards();
  const newId = `card_pub_${Date.now()}`;
  const newCard = {
    ...card,
    id: newId,
    author,
    likes: 0,
    downloads: 0,
    rating: 0,
    ratings: 0,
    isFeatured: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  cards.unshift(newCard);
  writeCards(COMMUNITY_KEY, cards);
  return newId;
}
function installCard(id) {
  const communityCards = getCommunityCards();
  const card = communityCards.find((c) => c.id === id);
  if (!card) return false;
  const localCards = readCards(LOCAL_KEY);
  if (localCards.some((c) => c.id === card.id)) return false;
  localCards.unshift({
    ...card
  });
  writeCards(LOCAL_KEY, localCards);
  const target = communityCards.find((c) => c.id === id);
  if (target) {
    target.downloads += 1;
    writeCards(COMMUNITY_KEY, communityCards);
  }
  return true;
}
function likeCard(id) {
  const cards = getCommunityCards();
  const target = cards.find((c) => c.id === id);
  if (target) {
    target.likes += 1;
    writeCards(COMMUNITY_KEY, cards);
  }
}
function describeEffect$1(effect) {
  switch (effect.type) {
    case "money":
      return effect.amount >= 0 ? `獲得 $${effect.amount}` : `損失 $${Math.abs(effect.amount)}`;
    case "forward":
      return `前進 ${effect.steps} 步`;
    case "backward":
      return `後退 ${effect.steps} 步`;
    case "teleport_start":
      return "傳送到起點";
    case "go_to_detention":
      return "進入禁閉區";
    case "get_out_of_jail":
      return "免費越獄";
    case "random_teleport":
      return "隨機傳送";
    case "collect_from_all":
      return `向所有玩家收取 $${effect.amount}`;
    case "pay_to_all":
      return `向所有玩家支付 $${effect.amount}`;
    case "steal_money":
      return `偷取 $${effect.amount}`;
    case "chain_draw":
      return `連鎖抽卡 ${effect.count} 次`;
    default:
      return "未知效果";
  }
}
const CardDetailView = ({
  card,
  onBack,
  onInstall,
  onLike,
  showToast
}) => {
  const [reviews, setReviews] = reactExports.useState(() => getReviews("card", card.id).reviews);
  const [avgRating, setAvgRating] = reactExports.useState(() => getAverageRating("card", card.id));
  const [totalReviews, setTotalReviews] = reactExports.useState(() => getTotalReviews("card", card.id));
  const loadReviews = reactExports.useCallback(() => {
    const data = getReviews("card", card.id);
    setReviews(data.reviews);
    setAvgRating(getAverageRating("card", card.id));
    setTotalReviews(getTotalReviews("card", card.id));
  }, [card.id]);
  const handleRate = reactExports.useCallback((score) => {
    submitRating("card", card.id, "local_user", score);
    loadReviews();
    showToast("評分成功！");
  }, [card.id, loadReviews, showToast]);
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
    addReview("card", card.id, newReview);
    loadReviews();
  }, [card.id, loadReviews]);
  const handleLikeReview = reactExports.useCallback((reviewId) => {
    likeReview("card", card.id, reviewId);
    loadReviews();
  }, [card.id, loadReviews]);
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 text-center", style: {
            borderColor: card.cardType === "fate" ? "var(--purple)" : "var(--cyan)",
            background: `linear-gradient(135deg, ${card.cardType === "fate" ? "rgba(168, 85, 247, 0.1)" : "rgba(0, 255, 255, 0.08)"}, transparent)`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-2", style: {
              color: card.cardType === "fate" ? "var(--purple)" : "var(--cyan)"
            }, children: card.cardType === "fate" ? "命運卡" : "機會卡" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl tracking-wider mb-3", style: {
              color: "var(--text-primary)"
            }, children: card.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-4", children: card.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 px-4 rounded-sm font-cyber text-lg", style: {
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: card.cardType === "fate" ? "var(--purple)" : "var(--cyan)"
            }, children: describeEffect$1(card.effect) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-xs text-[var(--text-secondary)]", children: [
              "by ",
              card.author
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-around mt-4 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", style: {
                color: "var(--pink)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 14 }),
                " ",
                card.likes
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", style: {
                color: "var(--cyan)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                " ",
                card.downloads
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", style: {
                color: "var(--yellow)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 14, fill: "currentColor" }),
                " ",
                (card.rating ?? 0).toFixed(1)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onInstall(card.id), className: "cyber-btn flex-1 py-3 font-cyber tracking-wider", style: {
              borderColor: "var(--green)",
              color: "var(--green)",
              backgroundColor: "rgba(0, 255, 128, 0.08)"
            }, children: "一鍵安裝" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onLike(card.id), className: "cyber-btn flex-1 py-3 font-cyber tracking-wider", style: {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              backgroundColor: "rgba(255, 107, 157, 0.08)"
            }, children: "點讚" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RatingReviewSection, { contentType: "card", contentId: card.id, averageRating: avgRating || card.rating, ratingCount: totalReviews || card.ratings, reviews, onRate: handleRate, onAddReview: handleAddReview, onLikeReview: handleLikeReview }) })
      ] })
    ] })
  ] });
};
const EFFECT_TYPES = [{
  value: "money",
  label: "金額增減",
  hasAmount: true,
  amountLabel: "金額（正=獲得，負=扣除）"
}, {
  value: "forward",
  label: "前進 N 步",
  hasAmount: true,
  amountLabel: "步數"
}, {
  value: "backward",
  label: "後退 N 步",
  hasAmount: true,
  amountLabel: "步數"
}, {
  value: "teleport_start",
  label: "傳送到起點",
  hasAmount: false
}, {
  value: "go_to_detention",
  label: "進入禁閉區",
  hasAmount: false
}, {
  value: "get_out_of_jail",
  label: "免費越獄",
  hasAmount: false
}, {
  value: "random_teleport",
  label: "隨機傳送",
  hasAmount: false
}, {
  value: "collect_from_all",
  label: "向所有玩家收取金額",
  hasAmount: true,
  amountLabel: "金額"
}, {
  value: "pay_to_all",
  label: "向所有玩家支付金額",
  hasAmount: true,
  amountLabel: "金額"
}, {
  value: "steal_money",
  label: "偷取金額",
  hasAmount: true,
  amountLabel: "金額"
}, {
  value: "chain_draw",
  label: "連鎖抽卡",
  hasAmount: true,
  amountLabel: "抽卡次數"
}];
function buildEffect(type, amount) {
  switch (type) {
    case "money":
      return {
        type: "money",
        amount
      };
    case "forward":
      return {
        type: "forward",
        steps: Math.abs(amount)
      };
    case "backward":
      return {
        type: "backward",
        steps: Math.abs(amount)
      };
    case "teleport_start":
      return {
        type: "teleport_start"
      };
    case "go_to_detention":
      return {
        type: "go_to_detention"
      };
    case "get_out_of_jail":
      return {
        type: "get_out_of_jail"
      };
    case "random_teleport":
      return {
        type: "random_teleport"
      };
    case "collect_from_all":
      return {
        type: "collect_from_all",
        amount: Math.abs(amount)
      };
    case "pay_to_all":
      return {
        type: "pay_to_all",
        amount: Math.abs(amount)
      };
    case "steal_money":
      return {
        type: "steal_money",
        amount: Math.abs(amount)
      };
    case "chain_draw":
      return {
        type: "chain_draw",
        count: Math.max(1, Math.abs(Math.floor(amount)))
      };
    default:
      return null;
  }
}
function describeEffect(effect) {
  switch (effect.type) {
    case "money":
      return effect.amount >= 0 ? `獲得 $${effect.amount}` : `損失 $${Math.abs(effect.amount)}`;
    case "forward":
      return `前進 ${effect.steps} 步`;
    case "backward":
      return `後退 ${effect.steps} 步`;
    case "teleport_start":
      return "傳送到起點";
    case "go_to_detention":
      return "進入禁閉區";
    case "get_out_of_jail":
      return "免費越獄";
    case "random_teleport":
      return "隨機傳送";
    case "collect_from_all":
      return `向所有玩家收取 $${effect.amount}`;
    case "pay_to_all":
      return `向所有玩家支付 $${effect.amount}`;
    case "steal_money":
      return `偷取 $${effect.amount}`;
    case "chain_draw":
      return `連鎖抽卡 ${effect.count} 次`;
    default:
      return "未知效果";
  }
}
const CardEditorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("editor");
  const [cardType, setCardType] = reactExports.useState("fate");
  const [cardName, setCardName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [effectType, setEffectType] = reactExports.useState("money");
  const [effectAmount, setEffectAmount] = reactExports.useState(1e3);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [localCards, setLocalCards] = reactExports.useState([]);
  const [communityCards, setCommunityCards] = reactExports.useState([]);
  const [communityCardType, setCommunityCardType] = reactExports.useState("fate");
  const [selectedCommunityCard, setSelectedCommunityCard] = reactExports.useState(null);
  const [toast, setToast] = reactExports.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = reactExports.useState(false);
  const showToast = reactExports.useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2e3);
  }, []);
  const refreshLocal = reactExports.useCallback(() => {
    setLocalCards(getLocalCustomCards());
  }, []);
  const refreshCommunity = reactExports.useCallback(() => {
    setCommunityCards(getCommunityCards(communityCardType));
  }, [communityCardType]);
  reactExports.useEffect(() => {
    refreshLocal();
  }, [refreshLocal]);
  reactExports.useEffect(() => {
    refreshCommunity();
  }, [refreshCommunity]);
  const currentEffectConfig = EFFECT_TYPES.find((e) => e.value === effectType);
  const resetForm = () => {
    setCardName("");
    setDescription("");
    setEffectType("money");
    setEffectAmount(1e3);
    setEditingId(null);
  };
  const handleSave = () => {
    if (!cardName.trim()) {
      showToast("請輸入卡牌名稱");
      return;
    }
    const amount = Number(effectAmount);
    if (!Number.isFinite(amount)) {
      showToast("效果數值必須是數字");
      return;
    }
    const effect = buildEffect(effectType, amount);
    if (!effect) {
      showToast("不支援的效果類型，無法儲存");
      return;
    }
    const existing = editingId ? localCards.find((c) => c.id === editingId) : null;
    const card = {
      id: editingId || `custom_card_${Date.now()}`,
      name: cardName.trim(),
      description: description.trim() || describeEffect(effect),
      cardType,
      effect,
      author: "我",
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      isFeatured: false,
      createdAt: existing?.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    saveLocalCard(card);
    refreshLocal();
    showToast("儲存成功！");
  };
  const handleEdit = (card) => {
    setEditingId(card.id);
    setCardType(card.cardType);
    setCardName(card.name);
    setDescription(card.description);
    const eff = card.effect ?? {
      type: "money",
      amount: 0
    };
    const knownType = EFFECT_TYPES.some((e) => e.value === eff.type);
    if (!knownType) {
      setEffectType(eff.type);
      setEffectAmount(0);
    } else if ("amount" in eff) {
      setEffectAmount(eff.amount);
    } else if ("steps" in eff) {
      setEffectAmount(eff.steps);
    } else if ("count" in eff) {
      setEffectAmount(eff.count);
    } else {
      setEffectAmount(0);
    }
    setActiveTab("editor");
  };
  const handleDelete = () => {
    if (!editingId) return;
    deleteLocalCard(editingId);
    refreshLocal();
    resetForm();
    setShowDeleteConfirm(false);
    showToast("已刪除");
  };
  const handlePublish = () => {
    if (!cardName.trim()) {
      showToast("請輸入卡牌名稱");
      return;
    }
    const amount = Number(effectAmount);
    if (!Number.isFinite(amount)) {
      showToast("效果數值必須是數字");
      return;
    }
    const effect = buildEffect(effectType, amount);
    if (!effect) {
      showToast("不支援的效果類型，無法發布");
      return;
    }
    const card = {
      id: "",
      name: cardName.trim(),
      description: description.trim() || describeEffect(effect),
      cardType,
      effect,
      author: "我",
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      isFeatured: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    publishCard(card, "我");
    refreshCommunity();
    showToast("已發布到社區！");
  };
  const handleInstall = (id) => {
    const success = installCard(id);
    refreshCommunity();
    if (success) showToast("安裝成功！");
    else showToast("安裝失敗或已存在");
  };
  const handleLikeCommunity = (id) => {
    likeCard(id);
    refreshCommunity();
    const updated = getCommunityCards().find((c) => c.id === id);
    if (updated && selectedCommunityCard?.id === id) setSelectedCommunityCard(updated);
    showToast("已點讚");
  };
  const handleSelectCommunity = (card) => {
    setSelectedCommunityCard(card);
  };
  const previewEffect = buildEffect(effectType, effectAmount);
  const filteredCommunity = sortByFeatured(communityCards.filter((c) => c.cardType === communityCardType), "card");
  if (activeTab === "community" && selectedCommunityCard) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDetailView, { card: selectedCommunityCard, onBack: () => setSelectedCommunityCard(null), onInstall: handleInstall, onLike: handleLikeCommunity, showToast }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "自製卡牌" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 max-w-xl", children: [{
        key: "editor",
        label: "卡牌編輯器",
        icon: Plus
      }, {
        key: "community",
        label: "社區卡牌",
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
            borderColor: "rgba(0, 255, 255, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-3", children: "卡牌類型" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4", children: [{
              value: "fate",
              label: "命運卡",
              color: "var(--purple)"
            }, {
              value: "chance",
              label: "機會卡",
              color: "var(--cyan)"
            }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCardType(t.value), className: "cyber-btn cyber-btn-sm flex-1 font-cyber tracking-wider", style: {
              borderColor: cardType === t.value ? t.color : "rgba(255, 255, 255, 0.1)",
              color: cardType === t.value ? t.color : "var(--text-secondary)",
              backgroundColor: cardType === t.value ? `${t.color}15` : "transparent"
            }, children: t.label }, t.value)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "卡牌名稱" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: cardName, onChange: (e) => setCardName(e.target.value), placeholder: "輸入卡牌名稱", className: "cyber-input w-full text-sm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "卡牌描述" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "輸入卡牌描述", rows: 2, className: "cyber-input w-full text-sm resize-none" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: "效果類型" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: effectType, onChange: (e) => setEffectType(e.target.value), className: "cyber-input w-full text-sm", style: {
                  appearance: "none"
                }, children: EFFECT_TYPES.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: e.value, children: e.label }, e.value)) })
              ] }),
              currentEffectConfig?.hasAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1", children: currentEffectConfig.amountLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: effectAmount, onChange: (e) => setEffectAmount(Number(e.target.value)), className: "cyber-input w-full text-sm" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
            borderColor: cardType === "fate" ? "var(--purple)" : "var(--cyan)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-3", children: "卡牌預覽" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xs p-5 rounded text-center", style: {
              border: `2px solid ${cardType === "fate" ? "var(--purple)" : "var(--cyan)"}`,
              background: `linear-gradient(135deg, ${cardType === "fate" ? "rgba(168, 85, 247, 0.15)" : "rgba(0, 255, 255, 0.1)"}, transparent)`,
              boxShadow: `0 0 20px ${cardType === "fate" ? "rgba(168, 85, 247, 0.3)" : "rgba(0, 255, 255, 0.2)"}`
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-2", style: {
                color: cardType === "fate" ? "var(--purple)" : "var(--cyan)"
              }, children: cardType === "fate" ? "命運卡" : "機會卡" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl tracking-wider mb-2 text-[var(--text-primary)]", children: cardName || "卡牌名稱" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-secondary)] mb-3 min-h-[40px]", children: description || "卡牌描述" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 px-3 rounded-sm font-cyber text-sm", style: {
                background: "rgba(0, 0, 0, 0.4)",
                color: cardType === "fate" ? "var(--purple)" : "var(--cyan)"
              }, children: describeEffect(previewEffect ?? {
                type: "money",
                amount: 0
              }) })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCardType("fate"), className: "cyber-btn cyber-btn-sm flex-1 font-cyber tracking-wider text-xs", style: {
              borderColor: cardType === "fate" ? "var(--purple)" : "rgba(255, 255, 255, 0.1)",
              color: cardType === "fate" ? "var(--purple)" : "var(--text-secondary)"
            }, children: "命運卡" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCardType("chance"), className: "cyber-btn cyber-btn-sm flex-1 font-cyber tracking-wider text-xs", style: {
              borderColor: cardType === "chance" ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
              color: cardType === "chance" ? "var(--cyan)" : "var(--text-secondary)"
            }, children: "機會卡" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1", children: localCards.filter((c) => c.cardType === cardType).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 text-center text-sm", style: {
            color: "var(--text-secondary)"
          }, children: "尚無自製卡牌" }) : localCards.filter((c) => c.cardType === cardType).map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleEdit(card), className: "cyber-card w-full p-3 text-left hover:scale-[1.01]", style: {
            borderColor: editingId === card.id ? "var(--pink)" : "rgba(0, 255, 255, 0.15)",
            boxShadow: editingId === card.id ? "0 0 10px rgba(255, 107, 157, 0.2)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider text-[var(--text-primary)] truncate", children: card.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] truncate", children: describeEffect(card.effect ?? {
              type: "money",
              amount: 0
            }) })
          ] }, card.id)) })
        ] })
      ] }),
      activeTab === "community" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCommunityCardType("fate"), className: "cyber-btn cyber-btn-sm px-4 font-cyber tracking-wider", style: {
            borderColor: communityCardType === "fate" ? "var(--purple)" : "rgba(255, 255, 255, 0.1)",
            color: communityCardType === "fate" ? "var(--purple)" : "var(--text-secondary)"
          }, children: "命運卡" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCommunityCardType("chance"), className: "cyber-btn cyber-btn-sm px-4 font-cyber tracking-wider", style: {
            borderColor: communityCardType === "chance" ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
            color: communityCardType === "chance" ? "var(--cyan)" : "var(--text-secondary)"
          }, children: "機會卡" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
          filteredCommunity.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelectCommunity(card), className: "cyber-card p-4 text-left hover:scale-[1.02] transition-transform", style: {
            borderColor: card.isFeatured ? "var(--yellow, #facc15)" : card.cardType === "fate" ? "rgba(168, 85, 247, 0.3)" : "rgba(0, 255, 255, 0.2)",
            boxShadow: card.isFeatured ? "0 0 15px rgba(250, 204, 21, 0.25)" : "none"
          }, children: [
            card.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-2 text-xs font-cyber tracking-wider", style: {
              color: "var(--yellow)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
              "精選"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-1", style: {
              color: card.cardType === "fate" ? "var(--purple)" : "var(--cyan)"
            }, children: card.cardType === "fate" ? "命運卡" : "機會卡" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base tracking-wider text-[var(--text-primary)] truncate mb-1", children: card.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] line-clamp-2 mb-2 min-h-[32px]", children: card.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber mb-2", style: {
              color: card.cardType === "fate" ? "var(--purple)" : "var(--cyan)"
            }, children: describeEffect(card.effect ?? {
              type: "money",
              amount: 0
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--text-secondary)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "by ",
                card.author
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 12 }),
                  card.likes
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", style: {
                  color: "var(--yellow)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, fill: "currentColor" }),
                  (card.rating ?? 0).toFixed(1)
                ] })
              ] })
            ] })
          ] }, card.id)),
          filteredCommunity.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-8 text-center col-span-full text-sm", style: {
            color: "var(--text-secondary)"
          }, children: "社區尚未有這類型的卡牌，來發布第一張吧！" })
        ] })
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
        "確定要刪除卡牌「",
        cardName,
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
  CardEditorPage as default
};
