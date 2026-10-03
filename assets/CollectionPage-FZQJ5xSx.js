import { u as useNavigate, r as reactExports, k as useAchievements, a$ as useTitles, b0 as useAvatarFrame, aS as PAWN_SKINS, aT as DICE_SKINS, cz as ACHIEVEMENT_IDS, ba as AVATAR_FRAMES, b8 as TITLE_IDS, j as jsxRuntimeExports, t as Crown, aK as Award, b7 as Palette, aI as Trophy, aE as TITLES, b3 as TitleEffect, at as Check, b9 as Sparkles, L as Lock, cA as User, bx as Dices, F as ACHIEVEMENTS } from "./index-ymfxQ6bv.js";
import { u as useSkinStorage } from "./useSkinStorage-BzYeq5R7.js";
import { g as getBattlePassState } from "./battlepass-CtvuemYg.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
const RARITY_COLORS = {
  common: "#9ca3af",
  rare: "#22d3ee",
  epic: "#a855f7",
  legendary: "#fbbf24"
};
const RARITY_NAMES = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說"
};
const CollectionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("titles");
  const {
    unlocked: unlockedAchievements
  } = useAchievements();
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
  const {
    pawnSkin,
    diceSkin,
    unlockedPawnSkins,
    unlockedDiceSkins,
    setPawnSkin,
    setDiceSkin
  } = useSkinStorage();
  const [bpState, setBpState] = reactExports.useState(() => typeof window !== "undefined" ? getBattlePassState() : {
    seasonName: "",
    seasonEndsAt: "",
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    premiumPurchased: false,
    tiers: [],
    dailyQuests: [],
    weeklyQuests: [],
    seasonQuests: []
  });
  reactExports.useEffect(() => {
    setBpState(getBattlePassState());
  }, []);
  reactExports.useEffect(() => {
    checkAndUnlockTitles(unlockedAchievements);
    checkAndUnlockFrames({
      unlockedAchievements,
      battlePassLevel: bpState.currentLevel,
      isPremium: bpState.premiumPurchased,
      unlockedPawnSkins
    });
  }, [unlockedAchievements, checkAndUnlockTitles, checkAndUnlockFrames, bpState.currentLevel, bpState.premiumPurchased, unlockedPawnSkins]);
  const tabs = [{
    id: "titles",
    label: "稱號",
    icon: Crown
  }, {
    id: "frames",
    label: "頭像框",
    icon: Award
  }, {
    id: "skins",
    label: "皮膚",
    icon: Palette
  }, {
    id: "achievements",
    label: "成就",
    icon: Trophy
  }];
  const totalCounts = {
    titles: TITLE_IDS.length,
    frames: AVATAR_FRAMES.length,
    skins: Object.keys(PAWN_SKINS).length + Object.keys(DICE_SKINS).length,
    achievements: ACHIEVEMENT_IDS.length
  };
  const unlockedCounts = {
    titles: unlockedTitles.length,
    frames: unlockedFrames.length,
    skins: unlockedPawnSkins.length + unlockedDiceSkins.length,
    achievements: unlockedAchievements.size
  };
  const unlockedCount = Object.values(unlockedCounts).reduce((a, b) => a + b, 0);
  const totalCount = Object.values(totalCounts).reduce((a, b) => a + b, 0);
  const handleBack = () => {
    navigate("/");
  };
  const getUnlockText = (frame) => {
    switch (frame.unlockType) {
      case "default":
        return "初始擁有";
      case "achievement":
        return `成就：${ACHIEVEMENTS[frame.unlockValue]?.name ?? frame.unlockValue}`;
      case "battlepass": {
        const parts = String(frame.unlockValue).split("_");
        return `通行證 ${parts[0]} 級${parts[1] === "premium" ? "（高級）" : ""}`;
      }
      case "assets":
        return `資產達到 ${frame.unlockValue}`;
      case "achievements_count":
        return `收集 ${frame.unlockValue} 個成就`;
      case "all_pawn_skins":
        return "解鎖所有棋子皮膚";
      case "achievements_combo": {
        const ids = String(frame.unlockValue).split("+");
        return ids.map((id) => ACHIEVEMENTS[id]?.name ?? id).join(" + ");
      }
      default:
        return "未知";
    }
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "收藏櫃" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl w-full mx-auto pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 overflow-x-auto pb-2", children: tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.id), className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap", style: {
          borderColor: isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
          color: isActive ? "var(--cyan)" : "var(--text-secondary)",
          backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "transparent",
          boxShadow: isActive ? "0 0 10px rgba(0, 255, 255, 0.3)" : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
          tab.label,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-70", children: [
            unlockedCounts[tab.id],
            "/",
            totalCounts[tab.id]
          ] })
        ] }, tab.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider", children: "收藏進度" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-cyber", style: {
            color: "var(--cyan)"
          }, children: [
            unlockedCount,
            " / ",
            totalCount
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full overflow-hidden", style: {
          backgroundColor: "rgba(255, 255, 255, 0.1)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-500", style: {
          width: `${totalCount === 0 ? 0 : Math.min(100, Math.max(0, unlockedCount / totalCount * 100))}%`,
          background: "linear-gradient(90deg, var(--cyan), var(--pink))",
          boxShadow: "0 0 8px var(--cyan)"
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        activeTab === "titles" && TITLE_IDS.map((titleId) => {
          const title = TITLES[titleId];
          if (!title) return null;
          const isUnlocked = unlockedTitles.includes(titleId);
          const isEquipped = equippedTitle === titleId;
          const rarityColor = RARITY_COLORS[title.rarity] ?? "#9ca3af";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01]", style: {
            borderColor: isUnlocked ? rarityColor : "rgba(255, 255, 255, 0.1)",
            boxShadow: isUnlocked ? `0 0 10px ${rarityColor}40` : "none",
            opacity: isUnlocked ? 1 : 0.5
          }, onClick: () => {
            if (isUnlocked) equipTitle(titleId);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 24, style: {
              color: isUnlocked ? rarityColor : "var(--text-muted)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg flex items-center gap-2", children: [
                isUnlocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(TitleEffect, { effect: title.effect, color: rarityColor, children: [
                  "【",
                  title.name,
                  "】"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-muted)"
                }, children: "【???】" }),
                isEquipped && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded", style: {
                  backgroundColor: "rgba(0, 255, 255, 0.15)",
                  color: "var(--cyan)",
                  border: "1px solid var(--cyan)"
                }, children: "裝備中" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] mt-1", children: isUnlocked ? title.description : "未解鎖" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider", style: {
                  backgroundColor: `${rarityColor}20`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}50`
                }, children: RARITY_NAMES[title.rarity] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[var(--text-muted)]", children: title.unlockCondition })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: isUnlocked ? isEquipped ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 20, style: {
              color: "var(--green)"
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, style: {
              color: rarityColor
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 20, style: {
              color: "var(--text-muted)"
            } }) })
          ] }, titleId);
        }),
        activeTab === "frames" && AVATAR_FRAMES.map((frame) => {
          const isUnlocked = unlockedFrames.includes(frame.id);
          const isEquipped = equippedFrame === frame.id;
          const rarityColor = RARITY_COLORS[frame.rarity] ?? "#9ca3af";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01]", style: {
            borderColor: isUnlocked ? rarityColor : "rgba(255, 255, 255, 0.1)",
            boxShadow: isUnlocked ? `0 0 10px ${rarityColor}40` : "none",
            opacity: isUnlocked ? 1 : 0.5
          }, onClick: () => {
            if (isUnlocked) equipFrame(frame.id);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full flex items-center justify-center relative flex-shrink-0", style: {
              border: typeof frame.borderStyle === "string" ? frame.borderStyle.replace(/\d+px/, "3px") : "3px solid",
              borderColor: isUnlocked ? frame.color : "#444",
              boxShadow: isUnlocked ? `0 0 12px ${frame.glowColor ?? frame.color}` : "none",
              backgroundColor: "rgba(255, 255, 255, 0.05)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 24, style: {
              color: isUnlocked ? frame.color : "#444"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg", style: {
                color: isUnlocked ? rarityColor : "var(--text-muted)"
              }, children: [
                isUnlocked ? frame.name : "???",
                isEquipped && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs px-2 py-0.5 rounded", style: {
                  backgroundColor: "rgba(0, 255, 255, 0.15)",
                  color: "var(--cyan)",
                  border: "1px solid var(--cyan)"
                }, children: "裝備中" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider", style: {
                  backgroundColor: `${rarityColor}20`,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}50`
                }, children: RARITY_NAMES[frame.rarity] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[var(--text-muted)]", children: getUnlockText(frame) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: isUnlocked ? isEquipped ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 20, style: {
              color: "var(--green)"
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, style: {
              color: rarityColor
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 20, style: {
              color: "var(--text-muted)"
            } }) })
          ] }, frame.id);
        }),
        activeTab === "skins" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider text-[var(--text-secondary)] mb-2", children: "棋子皮膚" }),
          Object.values(PAWN_SKINS).map((skin) => {
            const isUnlocked = unlockedPawnSkins.includes(skin.id);
            const isEquipped = pawnSkin === skin.id;
            const rarityColor = RARITY_COLORS[skin.rarity] ?? "#9ca3af";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01]", style: {
              borderColor: isUnlocked ? rarityColor : "rgba(255, 255, 255, 0.1)",
              opacity: isUnlocked ? 1 : 0.5
            }, onClick: () => {
              if (isUnlocked) setPawnSkin(skin.id);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded flex items-center justify-center", style: {
                border: `1px solid ${isUnlocked ? rarityColor : "#444"}`,
                backgroundColor: `${rarityColor}10`
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dices, { size: 20, style: {
                color: isUnlocked ? rarityColor : "#666"
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-sm", style: {
                  color: isUnlocked ? rarityColor : "var(--text-muted)"
                }, children: [
                  skin.name,
                  isEquipped && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-[var(--green)]", children: "使用中" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)]", children: skin.unlockCondition })
              ] }),
              isUnlocked ? isEquipped ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, style: {
                color: "var(--green)"
              } }) : null : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 16, style: {
                color: "var(--text-muted)"
              } })
            ] }, skin.id);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider text-[var(--text-secondary)] mt-4 mb-2", children: "骰子皮膚" }),
          Object.values(DICE_SKINS).map((skin) => {
            const isUnlocked = unlockedDiceSkins.includes(skin.id);
            const isEquipped = diceSkin === skin.id;
            const rarityColor = RARITY_COLORS[skin.rarity] ?? "#9ca3af";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01]", style: {
              borderColor: isUnlocked ? rarityColor : "rgba(255, 255, 255, 0.1)",
              opacity: isUnlocked ? 1 : 0.5
            }, onClick: () => {
              if (isUnlocked) setDiceSkin(skin.id);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded flex items-center justify-center", style: {
                border: `1px solid ${isUnlocked ? rarityColor : "#444"}`,
                backgroundColor: `${rarityColor}10`
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dices, { size: 20, style: {
                color: isUnlocked ? rarityColor : "#666"
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-sm", style: {
                  color: isUnlocked ? rarityColor : "var(--text-muted)"
                }, children: [
                  skin.name,
                  isEquipped && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-[var(--green)]", children: "使用中" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)]", children: skin.unlockCondition })
              ] }),
              isUnlocked ? isEquipped ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, style: {
                color: "var(--green)"
              } }) : null : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 16, style: {
                color: "var(--text-muted)"
              } })
            ] }, skin.id);
          })
        ] }),
        activeTab === "achievements" && ACHIEVEMENT_IDS.map((achId) => {
          const ach = ACHIEVEMENTS[achId];
          if (!ach) return null;
          const isUnlocked = unlockedAchievements.has(achId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex items-center gap-4", style: {
            borderColor: isUnlocked ? "var(--yellow)" : "rgba(255, 255, 255, 0.1)",
            boxShadow: isUnlocked ? "0 0 10px rgba(250, 204, 21, 0.3)" : "none",
            opacity: isUnlocked ? 1 : 0.5
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded flex items-center justify-center text-2xl", style: {
              backgroundColor: isUnlocked ? "rgba(250, 204, 21, 0.1)" : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${isUnlocked ? "var(--yellow)" : "#444"}`
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 24, style: {
              color: isUnlocked ? "var(--yellow)" : "var(--text-muted)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base", style: {
                color: isUnlocked ? "var(--yellow)" : "var(--text-muted)"
              }, children: ach.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] mt-1", children: ach.description })
            ] }),
            isUnlocked && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 20, style: {
              color: "var(--green)"
            } })
          ] }, achId);
        })
      ] })
    ] })
  ] });
};
export {
  CollectionPage as default
};
