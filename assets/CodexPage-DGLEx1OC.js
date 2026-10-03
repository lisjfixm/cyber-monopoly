import { r as reactExports, x as CELLS, cG as PETS, cH as PROFESSIONS, aS as PAWN_SKINS, aT as DICE_SKINS, cI as MINIGAME_TYPES, cJ as THEMES, cK as ITEM_TYPES, aF as safeGetJSON, aG as safeSetJSON, cL as FATE_CARDS, cM as CHANCE_CARDS, u as useNavigate, j as jsxRuntimeExports, bZ as Map, S as Swords, bo as Package, Z as Zap, bv as Briefcase, b7 as Palette, cN as Shirt, bt as Gamepad2, bf as Gift, aI as Trophy, L as Lock, bb as CircleCheckBig, cO as MINIGAME_NAMES, cP as ITEMS } from "./index-Clt-7orM.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { P as PawPrint } from "./paw-print-DWASDpiw.js";
const STORAGE_KEY = "cyber_monopoly_codex";
function readFromStorage(playerKey) {
  const fullKey = `${STORAGE_KEY}_${playerKey}`;
  const data = safeGetJSON(fullKey, {});
  return {
    properties: data.properties ?? [],
    cards: data.cards ?? [],
    items: data.items ?? [],
    pets: data.pets ?? [],
    mounts: data.mounts ?? [],
    professions: data.professions ?? [],
    themes: data.themes ?? ["cyberpunk"],
    skins: data.skins ?? [],
    minigames: data.minigames ?? [],
    minigameScores: data.minigameScores ?? {}
  };
}
function writeToStorage(playerKey, data) {
  const fullKey = `${STORAGE_KEY}_${playerKey}`;
  safeSetJSON(fullKey, data);
}
function useCodex(playerKey = "default") {
  const [data, setData] = reactExports.useState(() => readFromStorage(playerKey));
  reactExports.useEffect(() => {
    setData(readFromStorage(playerKey));
  }, [playerKey]);
  reactExports.useEffect(() => {
    writeToStorage(playerKey, data);
  }, [playerKey, data]);
  const unlockFromGameState = reactExports.useCallback((codex) => {
    if (!codex) return;
    setData((prev) => {
      const newProps = [...prev.properties];
      for (const p of codex.properties) {
        if (!newProps.includes(p)) newProps.push(p);
      }
      const newCards = [...prev.cards];
      for (const c of codex.cards) {
        if (!newCards.includes(c)) newCards.push(c);
      }
      const newItems = [...prev.items];
      for (const i of codex.items) {
        if (!newItems.includes(i)) newItems.push(i);
      }
      const newPets = [...prev.pets];
      for (const p of codex.pets) {
        if (!newPets.includes(p)) newPets.push(p);
      }
      const newMounts = [...prev.mounts];
      for (const m of codex.mounts) {
        if (!newMounts.includes(m)) newMounts.push(m);
      }
      return {
        ...prev,
        properties: newProps,
        cards: newCards,
        items: newItems,
        pets: newPets,
        mounts: newMounts
      };
    });
  }, []);
  const unlockProfession = reactExports.useCallback((professionId) => {
    setData((prev) => {
      if (prev.professions.includes(professionId)) return prev;
      return {
        ...prev,
        professions: [...prev.professions, professionId]
      };
    });
  }, []);
  const unlockTheme = reactExports.useCallback((themeId) => {
    setData((prev) => {
      if (prev.themes.includes(themeId)) return prev;
      return {
        ...prev,
        themes: [...prev.themes, themeId]
      };
    });
  }, []);
  const unlockSkin = reactExports.useCallback((skinId) => {
    setData((prev) => {
      if (prev.skins.includes(skinId)) return prev;
      return {
        ...prev,
        skins: [...prev.skins, skinId]
      };
    });
  }, []);
  const recordMinigame = reactExports.useCallback((minigameId, score) => {
    setData((prev) => {
      const newMinigames = prev.minigames.includes(minigameId) ? prev.minigames : [...prev.minigames, minigameId];
      const prevScore = prev.minigameScores[minigameId] ?? 0;
      const newScores = {
        ...prev.minigameScores,
        [minigameId]: Math.max(prevScore, score)
      };
      return {
        ...prev,
        minigames: newMinigames,
        minigameScores: newScores
      };
    });
  }, []);
  const isPropertyUnlocked = reactExports.useCallback((cellId) => {
    return data.properties.includes(cellId);
  }, [data.properties]);
  const isCardUnlocked = reactExports.useCallback((cardId) => {
    return data.cards.includes(cardId);
  }, [data.cards]);
  const isItemUnlocked = reactExports.useCallback((itemType) => {
    return data.items.includes(itemType);
  }, [data.items]);
  const isPetUnlocked = reactExports.useCallback((petType) => {
    return data.pets.includes(petType);
  }, [data.pets]);
  const isMountUnlocked = reactExports.useCallback((mountType) => {
    return data.mounts.includes(mountType);
  }, [data.mounts]);
  const isProfessionUnlocked = reactExports.useCallback((profId) => {
    return data.professions.includes(profId);
  }, [data.professions]);
  const isThemeUnlocked = reactExports.useCallback((themeId) => {
    return data.themes.includes(themeId);
  }, [data.themes]);
  const isSkinUnlocked = reactExports.useCallback((skinId) => {
    return data.skins.includes(skinId);
  }, [data.skins]);
  const isMinigameUnlocked = reactExports.useCallback((mgId) => {
    return data.minigames.includes(mgId);
  }, [data.minigames]);
  const getMinigameHighScore = reactExports.useCallback((mgId) => {
    return data.minigameScores[mgId] ?? 0;
  }, [data.minigameScores]);
  const getProgress = reactExports.useCallback(() => {
    const totalProperties = CELLS.length;
    const totalCards = FATE_CARDS.length + CHANCE_CARDS.length;
    const totalItems = ITEM_TYPES.length;
    const totalPets = Object.keys(PETS).length;
    const totalMounts = 3;
    const totalProfessions = Object.keys(PROFESSIONS).length;
    const totalThemes = THEMES.length;
    const totalSkins = Object.keys(PAWN_SKINS).length + Object.keys(DICE_SKINS).length;
    const totalMinigames = MINIGAME_TYPES.length;
    const totalAll = totalProperties + totalCards + totalItems + totalPets + totalMounts + totalProfessions + totalThemes + totalSkins + totalMinigames;
    const unlockedAll = data.properties.length + data.cards.length + data.items.length + data.pets.length + data.mounts.length + data.professions.length + data.themes.length + data.skins.length + data.minigames.length;
    return {
      properties: {
        unlocked: data.properties.length,
        total: totalProperties
      },
      cards: {
        unlocked: data.cards.length,
        total: totalCards
      },
      items: {
        unlocked: data.items.length,
        total: totalItems
      },
      pets: {
        unlocked: data.pets.length,
        total: totalPets
      },
      mounts: {
        unlocked: data.mounts.length,
        total: totalMounts
      },
      professions: {
        unlocked: data.professions.length,
        total: totalProfessions
      },
      themes: {
        unlocked: data.themes.length,
        total: totalThemes
      },
      skins: {
        unlocked: data.skins.length,
        total: totalSkins
      },
      minigames: {
        unlocked: data.minigames.length,
        total: totalMinigames
      },
      total: {
        unlocked: unlockedAll,
        total: totalAll,
        percent: totalAll > 0 ? Math.floor(unlockedAll / totalAll * 100) : 0
      }
    };
  }, [data]);
  const getCollectionRewards = reactExports.useCallback(() => {
    const p = getProgress();
    const percent = p.total.percent;
    return [{
      id: "r1",
      name: "新手收藏家",
      threshold: 20,
      unlocked: percent >= 20,
      reward: "頭像框：銅框"
    }, {
      id: "r2",
      name: "資深收藏家",
      threshold: 50,
      unlocked: percent >= 50,
      reward: "稱號：收藏達人"
    }, {
      id: "r3",
      name: "大收藏家",
      threshold: 80,
      unlocked: percent >= 80,
      reward: "頭像框：金框"
    }, {
      id: "r4",
      name: "傳奇收藏家",
      threshold: 100,
      unlocked: percent >= 100,
      reward: "稱號：圖鑑大師 + 限定皮膚"
    }];
  }, [getProgress]);
  return {
    data,
    unlockFromGameState,
    unlockProfession,
    unlockTheme,
    unlockSkin,
    recordMinigame,
    isPropertyUnlocked,
    isCardUnlocked,
    isItemUnlocked,
    isPetUnlocked,
    isMountUnlocked,
    isProfessionUnlocked,
    isThemeUnlocked,
    isSkinUnlocked,
    isMinigameUnlocked,
    getMinigameHighScore,
    getProgress,
    getCollectionRewards
  };
}
const MOUNT_NAMES = {
  flyer: {
    name: "飛行器",
    icon: "飛行器"
  },
  diver: {
    name: "潛水艇",
    icon: "潛水艇"
  },
  rocket: {
    name: "火箭",
    icon: "火箭"
  },
  hoverboard: {
    name: "懸浮滑板",
    icon: "懸浮滑板"
  }
};
const MOUNT_ORDER = Object.keys(MOUNT_NAMES);
const CodexPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("properties");
  const {
    getProgress,
    getCollectionRewards,
    isPropertyUnlocked,
    isCardUnlocked,
    isItemUnlocked,
    isPetUnlocked,
    isMountUnlocked,
    isProfessionUnlocked,
    isThemeUnlocked,
    isSkinUnlocked,
    isMinigameUnlocked,
    getMinigameHighScore
  } = useCodex("default");
  const progress = getProgress();
  const rewards = getCollectionRewards();
  const safeTotal = progress?.total ?? {
    percent: 0,
    unlocked: 0,
    total: 0
  };
  const totalPercent = Number.isFinite(safeTotal.percent) ? safeTotal.percent : 0;
  const tabs = [{
    id: "properties",
    label: "地塊",
    icon: Map
  }, {
    id: "cards",
    label: "卡牌",
    icon: Swords
  }, {
    id: "items",
    label: "道具",
    icon: Package
  }, {
    id: "pets",
    label: "寵物",
    icon: PawPrint
  }, {
    id: "mounts",
    label: "坐騎",
    icon: Zap
  }, {
    id: "professions",
    label: "職業",
    icon: Briefcase
  }, {
    id: "themes",
    label: "主題",
    icon: Palette
  }, {
    id: "skins",
    label: "皮膚",
    icon: Shirt
  }, {
    id: "minigames",
    label: "迷你遊戲",
    icon: Gamepad2
  }, {
    id: "rewards",
    label: "收集獎勵",
    icon: Gift
  }];
  const renderProperties = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2", children: CELLS.map((cell) => {
    const unlocked = isPropertyUnlocked(cell.id);
    const color = cell.color ?? "rgba(255,255,255,0.2)";
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-md border flex flex-col items-center justify-center text-center p-1 text-[10px] md:text-xs transition-all", style: {
      borderColor: unlocked ? color : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? `${color}15` : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? `0 0 6px ${color}66` : "none",
      color: unlocked ? "var(--text-primary)" : "var(--text-secondary)"
    }, title: unlocked ? cell.name : "未解鎖", children: unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1.5 rounded-sm mb-1", style: {
        backgroundColor: color
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate w-full", children: cell.name })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 16, className: "opacity-40" }) }, cell.id);
  }) });
  const renderCards = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: [...FATE_CARDS.map((c) => ({
    id: `fate_${c.id}`,
    name: c.name,
    type: "命運卡",
    color: "#ff4dff"
  })), ...CHANCE_CARDS.map((c) => ({
    id: `chance_${c.id}`,
    name: c.name,
    type: "機會卡",
    color: "#6366f1"
  }))].map((card) => {
    const unlocked = isCardUnlocked(card.id);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 transition-all", style: {
      borderColor: unlocked ? card.color : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? `${card.color}10` : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? `0 0 8px ${card.color}44` : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mb-1", style: {
        color: card.color
      }, children: card.type }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
        color: unlocked ? "var(--text-primary)" : "var(--text-secondary)"
      }, children: unlocked ? card.name : "??? 未解鎖" })
    ] }, card.id);
  }) });
  const renderItems = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: ITEM_TYPES.map((itemType) => {
    const unlocked = isItemUnlocked(itemType);
    const itemConfig = Object.values(ITEMS).find((i) => i.type === itemType);
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border p-3 transition-all", style: {
      borderColor: unlocked ? "var(--green)" : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? "rgba(0, 255, 128, 0.05)" : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? "0 0 8px rgba(0, 255, 128, 0.2)" : "none"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
      color: unlocked ? "var(--text-primary)" : "var(--text-secondary)"
    }, children: unlocked ? itemConfig?.name ?? itemType : "??? 未解鎖" }) }, itemType);
  }) });
  const renderPets = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: Object.keys(PETS).map((petType) => {
    const pet = PETS[petType];
    const unlocked = isPetUnlocked(petType);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 text-center transition-all", style: {
      borderColor: unlocked ? pet.color : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? `${pet.color}10` : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? `0 0 12px ${pet.color}44` : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: unlocked ? pet.icon : "鎖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mb-1", style: {
        color: unlocked ? pet.color : "var(--text-secondary)"
      }, children: unlocked ? pet.name : "未解鎖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: unlocked ? pet.description : "在遊戲中獲得以解鎖" })
    ] }, petType);
  }) });
  const renderMounts = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: MOUNT_ORDER.map((m) => {
    const mount = MOUNT_NAMES[m] ?? {
      name: m,
      icon: m
    };
    const unlocked = isMountUnlocked(m);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 text-center transition-all", style: {
      borderColor: unlocked ? "var(--purple)" : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? "rgba(168, 85, 247, 0.1)" : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? "0 0 12px rgba(168, 85, 247, 0.3)" : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: unlocked ? mount.icon : "鎖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mb-1", style: {
        color: unlocked ? "var(--purple)" : "var(--text-secondary)"
      }, children: unlocked ? mount.name : "未解鎖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: unlocked ? "已解鎖此坐騎" : "在遊戲中獲得以解鎖" })
    ] }, m);
  }) });
  const renderProfessions = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3", children: Object.keys(PROFESSIONS).map((profId) => {
    const prof = PROFESSIONS[profId];
    const unlocked = isProfessionUnlocked(profId);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 transition-all", style: {
      borderColor: unlocked ? prof.color : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? `${prof.color}10` : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? `0 0 8px ${prof.color}33` : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded flex items-center justify-center", style: {
          backgroundColor: `${prof.color}20`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 16, style: {
          color: prof.color
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber font-bold text-sm", style: {
          color: unlocked ? prof.color : "var(--text-secondary)"
        }, children: unlocked ? prof.name : "???" })
      ] }),
      unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mb-2", style: {
          color: "var(--text-secondary)"
        }, children: prof.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs space-y-0.5", children: (prof.skills ?? []).map((skill, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: prof.color
          }, children: "▸" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--text-primary)"
          }, children: skill })
        ] }, idx)) })
      ] }),
      !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: "在遊戲中使用此職業以解鎖" })
    ] }, profId);
  }) });
  const renderThemes = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: THEMES.map((theme) => {
    const unlocked = isThemeUnlocked(theme.id);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 transition-all", style: {
      borderColor: unlocked ? "var(--cyan)" : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? "rgba(0, 255, 255, 0.05)" : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? "0 0 8px rgba(0, 255, 255, 0.2)" : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mb-2", children: (theme.previewColors ?? []).map((color, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-6 rounded-sm", style: {
        backgroundColor: unlocked ? color : "rgba(255,255,255,0.1)",
        opacity: unlocked ? 1 : 0.3
      } }, idx)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
        color: unlocked ? "var(--text-primary)" : "var(--text-secondary)"
      }, children: unlocked ? theme.name : "??? 未解鎖" }),
      unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-1", style: {
        color: "var(--text-secondary)"
      }, children: theme.description })
    ] }, theme.id);
  }) });
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "#9ca3af";
      case "rare":
        return "#22d3ee";
      case "epic":
        return "#a855f7";
      case "legendary":
        return "#facc15";
      default:
        return "#9ca3af";
    }
  };
  const renderSkins = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider mb-3", style: {
        color: "var(--cyan)"
      }, children: "棋子皮膚" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: Object.entries(PAWN_SKINS).map(([id, skin]) => {
        const unlocked = isSkinUnlocked(`pawn_${id}`);
        const color = getRarityColor(skin.rarity);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-center transition-all", style: {
          borderColor: unlocked ? color : "rgba(255,255,255,0.1)",
          backgroundColor: unlocked ? `${color}10` : "rgba(255,255,255,0.03)",
          boxShadow: unlocked ? `0 0 8px ${color}44` : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 mx-auto rounded-full mb-2", style: {
            backgroundColor: unlocked ? color : "rgba(255,255,255,0.1)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
            color: unlocked ? color : "var(--text-secondary)"
          }, children: unlocked ? skin.name : "???" }),
          unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-1", style: {
            color: "var(--text-secondary)"
          }, children: skin.rarity === "legendary" ? "傳說" : skin.rarity === "epic" ? "史詩" : skin.rarity === "rare" ? "稀有" : "普通" })
        ] }, `pawn_${id}`);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider mb-3", style: {
        color: "var(--pink)"
      }, children: "骰子皮膚" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: Object.entries(DICE_SKINS).map(([id, skin]) => {
        const unlocked = isSkinUnlocked(`dice_${id}`);
        const color = getRarityColor(skin.rarity);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-center transition-all", style: {
          borderColor: unlocked ? color : "rgba(255,255,255,0.1)",
          backgroundColor: unlocked ? `${color}10` : "rgba(255,255,255,0.03)",
          boxShadow: unlocked ? `0 0 8px ${color}44` : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 mx-auto rounded-md mb-2", style: {
            backgroundColor: unlocked ? color : "rgba(255,255,255,0.1)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
            color: unlocked ? color : "var(--text-secondary)"
          }, children: unlocked ? skin.name : "???" }),
          unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-1", style: {
            color: "var(--text-secondary)"
          }, children: skin.rarity === "legendary" ? "傳說" : skin.rarity === "epic" ? "史詩" : skin.rarity === "rare" ? "稀有" : "普通" })
        ] }, `dice_${id}`);
      }) })
    ] })
  ] });
  const renderMinigames = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: MINIGAME_TYPES.map((mgType) => {
    const unlocked = isMinigameUnlocked(mgType);
    const highScore = getMinigameHighScore(mgType);
    const name = MINIGAME_NAMES[mgType] ?? mgType;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 transition-all", style: {
      borderColor: unlocked ? "var(--pink)" : "rgba(255,255,255,0.1)",
      backgroundColor: unlocked ? "rgba(255, 107, 157, 0.05)" : "rgba(255,255,255,0.03)",
      boxShadow: unlocked ? "0 0 8px rgba(255, 107, 157, 0.2)" : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { size: 18, style: {
          color: unlocked ? "var(--pink)" : "var(--text-secondary)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
          color: unlocked ? "var(--text-primary)" : "var(--text-secondary)"
        }, children: unlocked ? name : "??? 未解鎖" })
      ] }),
      unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
        color: "#facc15"
      }, children: [
        "最高分：",
        highScore
      ] }) }),
      !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: {
        color: "var(--text-secondary)"
      }, children: "在遊戲中參與以解鎖" })
    ] }, mgType);
  }) });
  const renderRewards = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mb-4", style: {
      color: "var(--text-secondary)"
    }, children: "達到指定收集度即可解鎖對應獎勵" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: rewards.map((reward) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 flex items-center gap-4 transition-all", style: {
      borderColor: reward.unlocked ? "rgba(250, 204, 21, 0.4)" : "rgba(255,255,255,0.1)",
      backgroundColor: reward.unlocked ? "rgba(250, 204, 21, 0.08)" : "rgba(255,255,255,0.03)",
      boxShadow: reward.unlocked ? "0 0 12px rgba(250, 204, 21, 0.15)" : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", style: {
        backgroundColor: reward.unlocked ? "rgba(250, 204, 21, 0.2)" : "rgba(255,255,255,0.05)",
        border: `2px solid ${reward.unlocked ? "rgba(250, 204, 21, 0.5)" : "rgba(255,255,255,0.1)"}`
      }, children: reward.unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 22, style: {
        color: "#facc15"
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 22, style: {
        color: "var(--text-secondary)"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg font-bold", style: {
          color: reward.unlocked ? "#facc15" : "var(--text-secondary)"
        }, children: reward.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-0.5", style: {
          color: "var(--text-secondary)"
        }, children: [
          "收集度達成：",
          reward.threshold,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-1", style: {
          color: reward.unlocked ? "#4ade80" : "var(--text-muted)"
        }, children: [
          "獎勵：",
          reward.reward
        ] })
      ] }),
      reward.unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs font-cyber", style: {
        color: "#4ade80"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16 }),
        "已領取"
      ] })
    ] }, reward.id)) })
  ] });
  const renderTabContent = () => {
    switch (activeTab) {
      case "properties":
        return renderProperties();
      case "cards":
        return renderCards();
      case "items":
        return renderItems();
      case "pets":
        return renderPets();
      case "mounts":
        return renderMounts();
      case "professions":
        return renderProfessions();
      case "themes":
        return renderThemes();
      case "skins":
        return renderSkins();
      case "minigames":
        return renderMinigames();
      case "rewards":
        return renderRewards();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/profile"), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider", children: "收藏圖鑑" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl w-full mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cyber-card p-4 md:p-6 mb-6", style: {
        borderColor: "rgba(168, 85, 247, 0.3)",
        boxShadow: "0 0 15px rgba(168, 85, 247, 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-cyber tracking-wider", style: {
            color: "var(--text-secondary)"
          }, children: "總收集進度" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-cyber font-bold", style: {
            color: "#a855f7",
            textShadow: "0 0 10px rgba(168, 85, 247, 0.5)"
          }, children: [
            totalPercent,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-3 rounded-full bg-bg-mid overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
          width: `${totalPercent}%`,
          background: "linear-gradient(90deg, #a855f7, #ff6b9d, #facc15)",
          boxShadow: "0 0 8px rgba(168, 85, 247, 0.5)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs", style: {
          color: "var(--text-secondary)"
        }, children: [
          "已解鎖 ",
          safeTotal.unlocked,
          " / ",
          safeTotal.total,
          " 項"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 overflow-x-auto pb-2", children: tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const p = progress[tab.id];
        const count = typeof p === "object" && "unlocked" in p ? `${p.unlocked}/${p.total}` : "";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.id), className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap", style: {
          borderColor: isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
          color: isActive ? "var(--cyan)" : "var(--text-secondary)",
          backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "transparent",
          boxShadow: isActive ? "0 0 10px rgba(0, 255, 255, 0.3)" : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
          tab.label,
          count && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs opacity-70", children: count })
        ] }, tab.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-white/10 bg-bg-dark/50 p-4 md:p-6", children: renderTabContent() })
    ] })
  ] });
};
export {
  CodexPage as default
};
