import { d as createLucideIcon, u as useNavigate, r as reactExports, bc as BATTLE_PASS_MAX_LEVEL, j as jsxRuntimeExports, bd as BATTLE_PASS_SEASON_NAME, t as Crown, aB as Clock, be as Flame, at as Check, L as Lock, aN as Target, aI as Trophy, aL as Star, Z as Zap, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, bf as Gift, S as Swords, b9 as Sparkles, aJ as Coins, b4 as ChevronRight } from "./index-Clt-7orM.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CZCw0Nea.js";
import { g as getBattlePassState, a as getSeasonRewardsPreview, b as addExp, s as saveBattlePassState, p as purchasePremium, c as claimTierReward, d as claimQuest, e as canClaimTierReward, f as canClaimQuest } from "./battlepass-DEXPG33C.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { C as Calendar } from "./calendar-CRcfGMkZ.js";
import { G as Gem } from "./gem-B3JQxhL_.js";
import "./index-rUpIA8Ly.js";
const __iconNode = [
  ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4", key: "zz82l3" }],
  [
    "path",
    {
      d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
      key: "1ph1d7"
    }
  ]
];
const Scroll = createLucideIcon("scroll", __iconNode);
const RARITY_COLORS = {
  common: "var(--text-secondary)",
  rare: "var(--cyan)",
  epic: "var(--purple)",
  legendary: "var(--yellow)"
};
const RARITY_LABELS = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說"
};
function getRewardIcon(type) {
  switch (type) {
    case "coin":
    case "ticket":
      return Coins;
    case "skin":
    case "pawnSkin":
      return Crown;
    case "avatarFrame":
      return Sparkles;
    case "diceSkin":
      return Star;
    case "effect":
      return Zap;
    case "item":
      return Gift;
    case "profession":
      return Swords;
    case "title":
      return Trophy;
    case "collectible":
      return Gem;
    default:
      return Gift;
  }
}
function useCountdown(targetIso) {
  const calc = () => {
    const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
    const days = Math.floor(diff / 864e5);
    const hours = Math.floor(diff % 864e5 / 36e5);
    const minutes = Math.floor(diff % 36e5 / 6e4);
    const seconds = Math.floor(diff % 6e4 / 1e3);
    return {
      days,
      hours,
      minutes,
      seconds
    };
  };
  const [time, setTime] = reactExports.useState(calc);
  reactExports.useEffect(() => {
    const timer = setInterval(() => setTime(calc()), 1e3);
    return () => clearInterval(timer);
  }, [targetIso]);
  return time;
}
function pad(n) {
  return String(n).padStart(2, "0");
}
const BattlePassPage = () => {
  const navigate = useNavigate();
  const [state, setState] = reactExports.useState(() => getBattlePassState());
  const [selectedLevel, setSelectedLevel] = reactExports.useState(null);
  const [questTab, setQuestTab] = reactExports.useState("daily");
  const trackRef = reactExports.useRef(null);
  const countdown = useCountdown(state.seasonEndsAt);
  const seasonRewardsPreview = reactExports.useMemo(() => getSeasonRewardsPreview(), [state]);
  reactExports.useEffect(() => {
    if (trackRef.current) {
      const levelIndex = state.currentLevel - 1;
      const total = trackRef.current.children.length;
      if (levelIndex >= 0 && levelIndex < total) {
        const node = trackRef.current.children[levelIndex];
        if (node) {
          trackRef.current.scrollLeft = node.offsetLeft - trackRef.current.clientWidth / 2 + node.clientWidth / 2;
        }
      }
    }
  }, [state.currentLevel]);
  const handleBack = reactExports.useCallback(() => {
    navigate("/");
  }, [navigate]);
  const handleAddExp = reactExports.useCallback(() => {
    const newState = addExp(state, 200);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);
  const handlePurchasePremium = reactExports.useCallback(() => {
    const newState = purchasePremium(state);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);
  const handleClaimTier = reactExports.useCallback((level, isPremium) => {
    const newState = claimTierReward(state, level, isPremium);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);
  const handleClaimQuest = reactExports.useCallback((questId) => {
    const {
      state: newState,
      xpGained
    } = claimQuest(state, questId);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);
  const selectedTier = reactExports.useMemo(() => {
    if (selectedLevel === null) return null;
    return state.tiers.find((t) => t.level === selectedLevel) ?? null;
  }, [selectedLevel, state.tiers]);
  const expPercent = reactExports.useMemo(() => {
    if (state.currentLevel >= BATTLE_PASS_MAX_LEVEL) return 100;
    const denom = state.xpToNextLevel;
    if (typeof denom !== "number" || denom <= 0) return 0;
    return Math.min(100, Math.max(0, state.currentXP / denom * 100));
  }, [state.currentLevel, state.currentXP, state.xpToNextLevel]);
  const activeQuests = reactExports.useMemo(() => {
    switch (questTab) {
      case "daily":
        return state.dailyQuests;
      case "weekly":
        return state.weeklyQuests;
      case "season":
        return state.seasonQuests;
    }
  }, [questTab, state.dailyQuests, state.weeklyQuests, state.seasonQuests]);
  const unclaimedTiersCount = reactExports.useMemo(() => {
    let count = 0;
    for (const tier of state.tiers) {
      if (tier.level > state.currentLevel) continue;
      if (!tier.claimed.free) count++;
      if (state.premiumPurchased && !tier.claimed.premium) count++;
    }
    return count;
  }, [state.tiers, state.currentLevel, state.premiumPurchased]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "賽季通行證" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1", children: [
          "第 3 賽季 · ",
          BATTLE_PASS_SEASON_NAME
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl w-full mx-auto space-y-6 pb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 md:p-6 relative overflow-hidden", style: {
        borderColor: state.premiumPurchased ? "var(--yellow)" : "var(--cyan)",
        boxShadow: state.premiumPurchased ? "0 0 25px rgba(255, 200, 0, 0.25), inset 0 0 20px rgba(255, 200, 0, 0.1)" : "0 0 20px rgba(0, 255, 255, 0.2)"
      }, children: [
        state.premiumPurchased && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-cyber tracking-wider", style: {
          color: "var(--yellow)",
          border: "1px solid var(--yellow)",
          backgroundColor: "rgba(255, 200, 0, 0.1)",
          boxShadow: "0 0 8px rgba(255, 200, 0, 0.4)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12 }),
          "豪華通行證"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, style: {
            color: "var(--pink)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: "賽季倒計時" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-sm md:text-base tracking-wider", style: {
            color: "var(--pink)",
            textShadow: "0 0 8px rgba(255, 105, 180, 0.6)"
          }, children: [
            countdown.days,
            "天 ",
            pad(countdown.hours),
            ":",
            pad(countdown.minutes),
            ":",
            pad(countdown.seconds)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: "當前等級" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-5xl md:text-6xl font-bold tracking-wider", style: {
              color: state.premiumPurchased ? "var(--yellow)" : "var(--cyan)",
              textShadow: state.premiumPurchased ? "0 0 15px rgba(255, 200, 0, 0.6)" : "0 0 15px rgba(0, 255, 255, 0.6)"
            }, children: [
              state.currentLevel,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl md:text-2xl text-[var(--text-secondary)] ml-1", children: [
                "/ ",
                BATTLE_PASS_MAX_LEVEL
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: "總經驗" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg text-[var(--text-primary)]", children: [
              state.totalXP,
              " EXP"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Lv.",
              state.currentLevel
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: state.currentLevel >= BATTLE_PASS_MAX_LEVEL ? "已滿級" : `${state.currentXP} / ${state.xpToNextLevel} EXP` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Lv.",
              Math.min(state.currentLevel + 1, BATTLE_PASS_MAX_LEVEL)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded-sm bg-[var(--bg-mid)] border relative overflow-hidden", style: {
            borderColor: state.premiumPurchased ? "rgba(255, 200, 0, 0.3)" : "var(--border-neon-cyan)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all duration-700 ease-out", style: {
            width: `${expPercent}%`,
            background: state.premiumPurchased ? "linear-gradient(90deg, rgba(255, 200, 0, 0.2), rgba(255, 107, 157, 0.7))" : "linear-gradient(90deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.85))",
            boxShadow: state.premiumPurchased ? "0 0 12px rgba(255, 200, 0, 0.6)" : "0 0 12px rgba(0, 255, 255, 0.6)"
          } }) }),
          state.currentLevel < BATTLE_PASS_MAX_LEVEL && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-right text-[var(--text-secondary)] font-cyber", children: [
            "距下一級還差 ",
            state.xpToNextLevel - state.currentXP,
            " EXP"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-5", style: {
        borderColor: "rgba(168, 85, 247, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-cyber text-base tracking-wider text-[var(--text-primary)] flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 18, style: {
              color: "var(--pink)"
            } }),
            "獎勵時線"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", style: {
              color: "var(--cyan)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full", style: {
                backgroundColor: "var(--cyan)",
                boxShadow: "0 0 6px var(--cyan)"
              } }),
              "免費"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", style: {
              color: "var(--yellow)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12 }),
              "豪華"
            ] }),
            unclaimedTiersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-full font-cyber text-xs", style: {
              color: "var(--green)",
              border: "1px solid var(--green)"
            }, children: [
              unclaimedTiersCount,
              " 項可領取"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: trackRef, className: "flex gap-3 overflow-x-auto pb-3 scrollbar-thin", style: {
          scrollbarWidth: "thin",
          scrollbarColor: "var(--cyan) transparent"
        }, children: state.tiers.map((tier) => {
          const isCurrent = tier.level === state.currentLevel;
          const isUnlocked = tier.level <= state.currentLevel;
          const freeReward = tier.freeReward ?? {
            type: "item",
            name: "???"
          };
          const freeClaimed = tier.claimed?.free === true;
          const premClaimed = tier.claimed?.premium === true;
          const isMilestone = tier.level % 5 === 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedLevel(tier.level), className: "flex-shrink-0 flex flex-col items-center gap-2 group relative w-20 md:w-24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] md:text-xs font-cyber", style: {
              color: isCurrent ? "var(--cyan)" : isUnlocked ? "var(--text-primary)" : "var(--text-muted)"
            }, children: [
              "Lv.",
              tier.level,
              isMilestone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", style: {
                color: "var(--yellow)",
                textShadow: "0 0 4px var(--yellow)"
              }, children: "★" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative transition-transform group-hover:scale-110", style: {
              border: `2px solid ${isUnlocked ? "var(--cyan)" : "var(--text-muted)"}`,
              backgroundColor: isUnlocked ? "rgba(0, 255, 255, 0.1)" : "rgba(0,0,0,0.3)",
              boxShadow: isCurrent ? "0 0 16px var(--cyan), 0 0 32px rgba(0, 255, 255, 0.4)" : isUnlocked ? "0 0 8px rgba(0, 255, 255, 0.4)" : "none",
              opacity: isUnlocked ? 1 : 0.5
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center", style: {
                border: `2px solid ${state.premiumPurchased ? "var(--yellow)" : "rgba(255, 200, 0, 0.3)"}`,
                backgroundColor: state.premiumPurchased ? "rgba(255, 200, 0, 0.15)" : "rgba(0,0,0,0.4)",
                boxShadow: state.premiumPurchased && isUnlocked ? "0 0 10px rgba(255, 200, 0, 0.5)" : "none"
              }, children: (() => {
                const Icon = getRewardIcon(freeReward.type);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16, style: {
                  color: isUnlocked ? "var(--cyan)" : "var(--text-muted)"
                } });
              })() }),
              freeClaimed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center", style: {
                backgroundColor: "var(--green)",
                boxShadow: "0 0 6px var(--green)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, color: "var(--bg-deep)", strokeWidth: 3 }) }),
              state.premiumPurchased && premClaimed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center", style: {
                backgroundColor: "var(--yellow)",
                boxShadow: "0 0 6px var(--yellow)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, color: "var(--bg-deep)", strokeWidth: 3 }) }),
              !state.premiumPurchased && isUnlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-dark)] flex items-center justify-center", style: {
                border: "1px solid var(--yellow)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 8, style: {
                color: "var(--yellow)"
              } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-center max-w-[80px] truncate", style: {
              color: "var(--text-secondary)"
            }, children: freeReward.name })
          ] }, tier.level);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-5", style: {
        borderColor: "rgba(0, 255, 255, 0.25)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-cyber text-base tracking-wider text-[var(--text-primary)] flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 18, style: {
              color: "var(--cyan)"
            } }),
            "賽季任務"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)] font-cyber", children: "完成任務獲取大量經驗" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: questTab, onValueChange: (v) => setQuestTab(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 mb-4", style: {
            backgroundColor: "var(--bg-mid)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "daily", className: "font-cyber text-xs md:text-sm tracking-wider data-[state=active]:text-cyan-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14, className: "inline mr-1" }),
              "每日任務"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "weekly", className: "font-cyber text-xs md:text-sm tracking-wider data-[state=active]:text-purple-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Scroll, { size: 14, className: "inline mr-1" }),
              "每週任務"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "season", className: "font-cyber text-xs md:text-sm tracking-wider data-[state=active]:text-yellow-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 14, className: "inline mr-1" }),
              "賽季任務"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: questTab, className: "mt-0 space-y-2", children: activeQuests.map((quest) => /* @__PURE__ */ jsxRuntimeExports.jsx(QuestRow, { quest, onClaim: () => handleClaimQuest(quest.id) }, quest.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-5", style: {
        borderColor: "rgba(255, 105, 180, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-cyber text-base tracking-wider text-[var(--text-primary)] flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 18, style: {
            color: "var(--pink)"
          } }),
          "賽季結算獎勵"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mb-4", children: "賽季結算時依據最終等級額外發放獎勵" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: seasonRewardsPreview.map((item) => {
          const unlocked = state.currentLevel >= item.levelThreshold;
          const Icon = getRewardIcon(item.type);
          const color = RARITY_COLORS[item.rarity] || "var(--text-secondary)";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center rounded-sm", style: {
            border: `1px solid ${unlocked ? color : "rgba(255,255,255,0.1)"}`,
            backgroundColor: unlocked ? `${color}10` : "rgba(0,0,0,0.2)",
            opacity: unlocked ? 1 : 0.5
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2", style: {
              border: `2px solid ${color}`,
              boxShadow: `0 0 8px ${color}40`
            }, children: unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18, style: {
              color
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14, style: {
              color
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber", style: {
              color
            }, children: [
              "Lv.",
              item.levelThreshold,
              "+"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] mt-1 text-[var(--text-secondary)]", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] mt-1 font-cyber tracking-wider", style: {
              color
            }, children: RARITY_LABELS[item.rarity] || "" })
          ] }, item.levelThreshold);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleAddExp, className: "cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: "var(--green)",
          color: "var(--green)",
          background: "rgba(0, 255, 128, 0.08)",
          boxShadow: "0 0 12px rgba(0, 255, 128, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16 }),
          "模擬獲得經驗 (+200)"
        ] }),
        !state.premiumPurchased ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handlePurchasePremium, className: "cyber-btn cyber-btn-pink flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 16 }),
          "解鎖豪華通行證 · NT$ 299"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: true, className: "cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: "var(--yellow)",
          color: "var(--yellow)",
          background: "rgba(255, 200, 0, 0.08)",
          boxShadow: "0 0 12px rgba(255, 200, 0, 0.2)",
          cursor: "default"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 16 }),
          "已解鎖豪華通行證"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: selectedLevel !== null, onOpenChange: (o) => !o && setSelectedLevel(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "cyber-card max-w-md", style: {
      borderColor: "var(--purple)",
      boxShadow: "0 0 30px rgba(168, 85, 247, 0.35)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: selectedTier && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-cyber text-xl tracking-wider text-center", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px rgba(0, 255, 255, 0.5)"
      }, children: [
        "第 ",
        selectedTier.level,
        " 級獎勵"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 my-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RewardDetailRow, { reward: selectedTier.freeReward ?? {
          type: "item",
          name: "???",
          value: ""
        }, label: "免費通行證", color: "var(--cyan)", claimed: selectedTier.claimed?.free === true, canClaim: canClaimTierReward(state, selectedTier.level, false), onClaim: () => handleClaimTier(selectedTier.level, false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RewardDetailRow, { reward: selectedTier.premiumReward ?? {
          type: "item",
          name: "???",
          value: ""
        }, label: "豪華通行證", color: "var(--yellow)", claimed: selectedTier.claimed?.premium === true, canClaim: canClaimTierReward(state, selectedTier.level, true), locked: !state.premiumPurchased, onClaim: () => handleClaimTier(selectedTier.level, true) })
      ] }),
      !state.premiumPurchased && selectedTier.level <= state.currentLevel && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handlePurchasePremium, className: "cyber-btn cyber-btn-pink w-full py-2.5 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14 }),
        "升級通行證解鎖豪華獎勵"
      ] })
    ] }) }) })
  ] });
};
const QuestRow = ({
  quest,
  onClaim
}) => {
  const progress = quest.target > 0 ? Math.min(100, quest.progress / quest.target * 100) : 0;
  const canClaim = canClaimQuest(quest);
  const tabColor = quest.refreshType === "daily" ? "var(--cyan)" : quest.refreshType === "weekly" ? "var(--purple)" : "var(--yellow)";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-sm", style: {
    border: `1px solid ${tabColor}30`,
    backgroundColor: `${tabColor}08`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", style: {
      border: `2px solid ${tabColor}`,
      backgroundColor: `${tabColor}15`,
      boxShadow: `0 0 8px ${tabColor}40`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 18, style: {
      color: tabColor
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber text-[var(--text-primary)] mb-1", children: quest.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1.5 rounded-full bg-[var(--bg-mid)] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all", style: {
          width: `${progress}%`,
          backgroundColor: tabColor,
          boxShadow: `0 0 6px ${tabColor}`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber", style: {
          color: tabColor,
          minWidth: "48px",
          textAlign: "right"
        }, children: [
          quest.progress,
          "/",
          quest.target
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber", style: {
        color: "var(--green)"
      }, children: [
        "+",
        quest.xpReward,
        " EXP"
      ] }),
      quest.claimed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-0.5 text-xs font-cyber flex items-center gap-1", style: {
        color: "var(--green)",
        border: "1px solid var(--green)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10 }),
        "已領取"
      ] }) : canClaim ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClaim, className: "cyber-btn cyber-btn-sm px-3 py-1 text-xs font-cyber", style: {
        borderColor: "var(--green)",
        color: "var(--green)"
      }, children: "領取" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[var(--text-muted)] font-cyber", children: "進行中" })
    ] })
  ] });
};
const RewardDetailRow = ({
  reward,
  label,
  color,
  claimed,
  canClaim,
  locked,
  onClaim
}) => {
  const Icon = getRewardIcon(reward.type);
  const rarityColor = reward.rarity ? RARITY_COLORS[reward.rarity] : color;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-sm", style: {
    border: `1px solid ${locked ? "rgba(255,255,255,0.1)" : `${color}40`}`,
    backgroundColor: locked ? "rgba(0,0,0,0.2)" : `${color}08`,
    opacity: locked ? 0.5 : 1
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", style: {
      border: `2px solid ${color}`,
      backgroundColor: `${color}15`,
      boxShadow: `0 0 10px ${color}40`
    }, children: locked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 18, color }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 20, style: {
      color
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base font-bold truncate", style: {
        color: rarityColor
      }, children: reward.name }),
      reward.rarity && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-cyber tracking-wider mt-0.5", style: {
        color: rarityColor
      }, children: RARITY_LABELS[reward.rarity] || "" })
    ] }),
    claimed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-1 text-xs font-cyber flex items-center gap-1", style: {
      color: "var(--green)",
      border: "1px solid var(--green)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }),
      "已領取"
    ] }) : canClaim ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClaim, className: "cyber-btn cyber-btn-sm px-3 py-1 text-xs font-cyber", style: {
      borderColor: color,
      color
    }, children: "領取" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18, color: "var(--text-muted)" })
  ] });
};
export {
  BattlePassPage as default
};
