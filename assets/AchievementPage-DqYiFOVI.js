import { d as createLucideIcon, u as useNavigate, r as reactExports, k as useAchievements, cz as ACHIEVEMENT_IDS, F as ACHIEVEMENTS, aL as Star, be as Flame, aN as Target, bv as Briefcase, bo as Package, U as Users, b9 as Sparkles, j as jsxRuntimeExports, t as Crown, aI as Trophy, aO as Medal, cQ as Crosshair, aX as CircleX, b2 as RotateCcw, ay as Flag, bH as Shield, cN as Shirt, b7 as Palette, aK as Award, Z as Zap, bA as Wallet, cR as Hammer, bC as House, S as Swords, by as Skull, cS as Sun, bx as Dices, cT as GraduationCap, aJ as Coins, cU as Gavel, cV as Handshake, L as Lock, aP as TrendingUp, bD as Layers, cW as Hotel, bB as Building2, bw as Landmark } from "./index-Clt-7orM.js";
import { G as Gem } from "./gem-B3JQxhL_.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
const __iconNode = [
  [
    "path",
    { d: "M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", key: "1ol0lm" }
  ],
  ["path", { d: "M8 10h8", key: "c7uz4u" }],
  ["path", { d: "M8 18h8", key: "1no2b1" }],
  ["path", { d: "M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6", key: "1fr6do" }],
  ["path", { d: "M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", key: "donm21" }]
];
const Backpack = createLucideIcon("backpack", __iconNode);
const CATEGORIES = [{
  id: "beginner",
  label: "新手",
  icon: Star
}, {
  id: "wealth",
  label: "財富",
  icon: Gem
}, {
  id: "streak",
  label: "連勝",
  icon: Flame
}, {
  id: "mode",
  label: "模式",
  icon: Target
}, {
  id: "profession",
  label: "職業",
  icon: Briefcase
}, {
  id: "collection",
  label: "收藏",
  icon: Package
}, {
  id: "social",
  label: "社交",
  icon: Users
}, {
  id: "special",
  label: "特殊",
  icon: Sparkles
}];
const RARITY_LABELS = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說"
};
const RARITY_COLORS = {
  common: "#9ca3af",
  rare: "#22d3ee",
  epic: "#a855f7",
  legendary: "#facc15"
};
const AchievementPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = reactExports.useState("all");
  const {
    isUnlocked,
    getProgress,
    getTotalPoints,
    unlocked
  } = useAchievements();
  const totalPoints = getTotalPoints();
  const totalAchievements = ACHIEVEMENT_IDS.length;
  const unlockedCount = unlocked.size;
  const overallPercent = totalAchievements > 0 ? Math.floor(unlockedCount / totalAchievements * 100) : 0;
  const filteredIds = reactExports.useMemo(() => {
    if (activeCategory === "all") return ACHIEVEMENT_IDS;
    return ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENTS[id]?.category === activeCategory);
  }, [activeCategory]);
  const categoryProgress = reactExports.useMemo(() => {
    const result = {
      all: {
        unlocked: unlockedCount,
        total: totalAchievements
      }
    };
    for (const cat of CATEGORIES) {
      const total = ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENTS[id]?.category === cat.id).length;
      const unlockedNum = ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENTS[id]?.category === cat.id && unlocked.has(id)).length;
      result[cat.id] = {
        unlocked: unlockedNum,
        total
      };
    }
    return result;
  }, [unlocked, unlockedCount, totalAchievements]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/profile"), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "成就殿堂" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl w-full mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6", style: {
        borderColor: "rgba(250, 204, 21, 0.3)",
        boxShadow: "0 0 15px rgba(250, 204, 21, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-center gap-4 md:gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center", style: {
            background: "radial-gradient(circle, rgba(250,204,21,0.15), transparent 70%)",
            border: "2px solid rgba(250, 204, 21, 0.4)",
            boxShadow: "0 0 30px rgba(250, 204, 21, 0.2)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 36, style: {
            color: "#facc15"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center md:text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-1", style: {
              color: "var(--text-secondary)"
            }, children: "總成就點數" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-3xl md:text-4xl font-bold tracking-wider", style: {
              color: "#facc15",
              textShadow: "0 0 15px rgba(250, 204, 21, 0.6)"
            }, children: totalPoints }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-1", style: {
              color: "var(--text-secondary)"
            }, children: [
              "已解鎖 ",
              unlockedCount,
              " / ",
              totalAchievements,
              " 個成就 (",
              overallPercent,
              "%)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 w-full h-2.5 rounded-full bg-bg-mid overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
          width: `${overallPercent}%`,
          background: "linear-gradient(90deg, #facc15, #ff6b9d, #a855f7)",
          boxShadow: "0 0 10px rgba(250, 204, 21, 0.5)"
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveCategory("all"), className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap", style: {
          borderColor: activeCategory === "all" ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
          color: activeCategory === "all" ? "var(--cyan)" : "var(--text-secondary)",
          backgroundColor: activeCategory === "all" ? "rgba(0, 255, 255, 0.08)" : "transparent",
          boxShadow: activeCategory === "all" ? "0 0 10px rgba(0, 255, 255, 0.3)" : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 16 }),
          "全部",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-70", children: [
            categoryProgress.all.unlocked,
            "/",
            categoryProgress.all.total
          ] })
        ] }),
        CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const p = categoryProgress[cat.id];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveCategory(cat.id), className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap", style: {
            borderColor: isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
            color: isActive ? "var(--cyan)" : "var(--text-secondary)",
            backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "transparent",
            boxShadow: isActive ? "0 0 10px rgba(0, 255, 255, 0.3)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
            cat.label,
            p && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-70", children: [
              p.unlocked,
              "/",
              p.total
            ] })
          ] }, cat.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4", children: filteredIds.map((id) => {
        const ach = ACHIEVEMENTS[id];
        if (!ach) return null;
        const achUnlocked = isUnlocked(id);
        const currentProgress = getProgress(id);
        const target = ach.target ?? 1;
        const progressPercent = Math.min(100, Math.floor(currentProgress / target * 100));
        const rarityColor = RARITY_COLORS[ach.rarity];
        const IconComponent = getAchievementIcon(ach.icon);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 transition-all", style: {
          borderColor: achUnlocked ? `${rarityColor}55` : "rgba(255, 255, 255, 0.08)",
          boxShadow: achUnlocked ? `0 0 15px ${rarityColor}33` : "none",
          opacity: achUnlocked ? 1 : 0.7
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0", style: {
              backgroundColor: achUnlocked ? `${rarityColor}20` : "rgba(255,255,255,0.03)",
              border: `1px solid ${achUnlocked ? `${rarityColor}55` : "rgba(255,255,255,0.1)"}`
            }, children: IconComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { size: 24, style: {
              color: achUnlocked ? rarityColor : "var(--text-secondary)",
              filter: achUnlocked ? `drop-shadow(0 0 6px ${rarityColor})` : "none"
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 24, style: {
              color: achUnlocked ? rarityColor : "var(--text-secondary)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider px-1.5 py-0.5 rounded-sm", style: {
                  color: rarityColor,
                  backgroundColor: `${rarityColor}15`,
                  border: `1px solid ${rarityColor}33`
                }, children: RARITY_LABELS[ach.rarity] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber tracking-wider", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  "+",
                  ach.points,
                  "點"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm font-bold truncate", style: {
                color: achUnlocked ? "var(--text-primary)" : "var(--text-secondary)"
              }, children: ach.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5 line-clamp-2", style: {
                color: "var(--text-muted)"
              }, children: ach.description })
            ] })
          ] }),
          ach.target && ach.target > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-secondary)"
              }, children: "進度" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                color: achUnlocked ? "#4ade80" : "var(--text-secondary)"
              }, children: [
                Math.min(currentProgress, target),
                " / ",
                target
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1.5 rounded-full bg-bg-mid overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
              width: `${progressPercent}%`,
              backgroundColor: achUnlocked ? "#4ade80" : rarityColor,
              boxShadow: achUnlocked ? "0 0 6px rgba(74, 222, 128, 0.5)" : `0 0 6px ${rarityColor}55`
            } }) })
          ] }),
          achUnlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1 text-xs font-cyber tracking-wider", style: {
            color: "#4ade80"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { size: 12 }),
            "已解鎖"
          ] })
        ] }, id);
      }) }),
      filteredIds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-8 text-center", style: {
        borderColor: "rgba(255,255,255,0.1)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", style: {
        color: "var(--text-secondary)"
      }, children: "此分類暫無成就" }) })
    ] })
  ] });
};
function getAchievementIcon(iconName) {
  const iconMap = {
    Trophy,
    Flame,
    Target,
    Briefcase,
    Package,
    Users,
    Sparkles,
    Star,
    Crown,
    Gem,
    Medal,
    Landmark,
    Building2,
    Hotel,
    Layers,
    TrendingUp,
    Lock,
    Handshake,
    Gavel,
    Coins,
    GraduationCap,
    Backpack,
    Dices,
    Sun,
    Skull,
    Swords,
    Home: House,
    Hammer,
    Wallet,
    Zap,
    Award,
    Palette,
    Shirt,
    Shield,
    Flag,
    RotateCcw,
    XCircle: CircleX,
    Crosshair
  };
  return iconMap[iconName] || Trophy;
}
export {
  AchievementPage as default
};
