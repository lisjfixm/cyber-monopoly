import { r as reactExports, aG as safeSetJSON, aF as safeGetJSON, aS as PAWN_SKINS, aT as DICE_SKINS, cG as PETS, aE as TITLES, u as useNavigate, a$ as useTitles, c$ as getCoins, bY as toast, d1 as vibrate, d0 as addCoins, j as jsxRuntimeExports, aJ as Coins, b9 as Sparkles, bf as Gift, X, d2 as vibrationPatterns, aK as Award, aL as Star, t as Crown } from "./index-Clt-7orM.js";
import { u as useSkinStorage } from "./useSkinStorage-CRxQwXpG.js";
import { u as useSkinUpgrade, R as RotateCw } from "./useSkinUpgrade-CmAGW2rz.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { G as Gem } from "./gem-B3JQxhL_.js";
import { P as PawPrint } from "./paw-print-DWASDpiw.js";
const STORAGE_KEY$1 = "cyber_monopoly_gacha";
const RARITY_LABELS = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說"
};
const RARITY_COLORS = {
  common: "var(--text-secondary)",
  rare: "var(--cyan)",
  epic: "var(--purple)",
  legendary: "var(--yellow)"
};
const DUPLICATE_FRAGMENTS = {
  common: 5,
  rare: 15,
  epic: 30,
  legendary: 80
};
const SINGLE_PULL_COST = {
  coins: 100,
  fragments: 10
};
const TEN_PULL_COST = {
  coins: 900,
  fragments: 90
};
const PITY_MAX = 90;
const PAWN_POOL = [{
  id: "mecha",
  rarity: "rare"
}, {
  id: "ufo",
  rarity: "epic"
}, {
  id: "dragon",
  rarity: "legendary"
}];
const DICE_POOL = [{
  id: "gold",
  rarity: "rare"
}, {
  id: "neon",
  rarity: "epic"
}, {
  id: "pixel",
  rarity: "legendary"
}];
const PET_POOL = [{
  id: "mechDog",
  rarity: "common"
}, {
  id: "ufo",
  rarity: "rare"
}, {
  id: "dragon",
  rarity: "epic"
}];
const TITLE_POOL = [{
  id: "newbie",
  rarity: "common"
}, {
  id: "fate_favorite",
  rarity: "rare"
}, {
  id: "jailbreak",
  rarity: "rare"
}, {
  id: "trader",
  rarity: "rare"
}, {
  id: "tycoon",
  rarity: "epic"
}, {
  id: "stock_guru",
  rarity: "epic"
}, {
  id: "hotel_king",
  rarity: "epic"
}, {
  id: "gambler",
  rarity: "legendary"
}, {
  id: "champion",
  rarity: "legendary"
}];
const RARITY_WEIGHTS = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5
};
function readData() {
  const raw = safeGetJSON(STORAGE_KEY$1, {});
  return {
    totalPulls: raw.totalPulls ?? 0,
    pityCount: raw.pityCount ?? 0,
    history: Array.isArray(raw.history) ? raw.history.slice(-50) : []
  };
}
function pickRarity(pityTriggered) {
  if (pityTriggered) return "legendary";
  const entries = Object.entries(RARITY_WEIGHTS);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [rarity, w] of entries) {
    r -= w;
    if (r <= 0) return rarity;
  }
  return "common";
}
function pickReward(rarity) {
  const candidates = [];
  for (const p of PAWN_POOL) {
    if (p.rarity === rarity) {
      candidates.push({
        kind: "pawnSkin",
        id: p.id,
        rarity,
        name: PAWN_SKINS[p.id].name
      });
    }
  }
  for (const d of DICE_POOL) {
    if (d.rarity === rarity) {
      candidates.push({
        kind: "diceSkin",
        id: d.id,
        rarity,
        name: DICE_SKINS[d.id].name
      });
    }
  }
  for (const pet of PET_POOL) {
    if (pet.rarity === rarity) {
      candidates.push({
        kind: "pet",
        id: pet.id,
        rarity,
        name: PETS[pet.id].name
      });
    }
  }
  for (const t of TITLE_POOL) {
    if (t.rarity === rarity) {
      candidates.push({
        kind: "title",
        id: t.id,
        rarity,
        name: TITLES[t.id].name
      });
    }
  }
  if (candidates.length === 0) {
    return pickReward("common");
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}
function useGacha() {
  const [data, setData] = reactExports.useState(() => readData());
  reactExports.useEffect(() => {
    safeSetJSON(STORAGE_KEY$1, data);
  }, [data]);
  const drawOnce = reactExports.useCallback(() => {
    const pityTriggered = data.pityCount + 1 >= PITY_MAX;
    const rarity = pickRarity(pityTriggered);
    const reward = pickReward(rarity);
    return {
      reward,
      pityTriggered
    };
  }, [data.pityCount]);
  const commitDraws = reactExports.useCallback((outcomes) => {
    setData((prev) => {
      let pity = prev.pityCount;
      const newHistory = [];
      const now = Date.now();
      outcomes.forEach((o, i) => {
        if (o.reward.rarity === "legendary") {
          pity = 0;
        } else {
          pity += 1;
        }
        newHistory.push({
          timestamp: now + i,
          reward: o.reward,
          wasDuplicate: false,
          convertedFragments: 0
        });
      });
      return {
        totalPulls: prev.totalPulls + outcomes.length,
        pityCount: pity,
        history: [...prev.history, ...newHistory].slice(-50)
      };
    });
  }, []);
  const markDuplicate = reactExports.useCallback((index, convertedFragments) => {
    setData((prev) => {
      const history = prev.history.slice();
      const target = history[history.length - 1 - index];
      if (target) {
        target.wasDuplicate = true;
        target.convertedFragments = convertedFragments;
      }
      return {
        ...prev,
        history
      };
    });
  }, []);
  const pityRemaining = reactExports.useMemo(() => Math.max(0, PITY_MAX - data.pityCount), [data.pityCount]);
  return {
    totalPulls: data.totalPulls,
    pityCount: data.pityCount,
    pityRemaining,
    history: data.history,
    drawOnce,
    commitDraws,
    markDuplicate
  };
}
const STORAGE_KEY = "cyber_monopoly_pets";
function readFromStorage() {
  const data = safeGetJSON(STORAGE_KEY, {});
  return {
    unlockedPets: data.unlockedPets ?? [],
    equippedPet: data.equippedPet ?? null
  };
}
function writeToStorage(data) {
  safeSetJSON(STORAGE_KEY, data);
}
function usePetStorage() {
  const [data, setData] = reactExports.useState(() => readFromStorage());
  reactExports.useEffect(() => {
    writeToStorage(data);
  }, [data]);
  const unlockPet = reactExports.useCallback((pet) => {
    setData((prev) => {
      if (prev.unlockedPets.includes(pet)) return prev;
      return {
        ...prev,
        unlockedPets: [...prev.unlockedPets, pet]
      };
    });
  }, []);
  const equipPet = reactExports.useCallback((pet) => {
    setData((prev) => {
      if (pet && !prev.unlockedPets.includes(pet)) return prev;
      return {
        ...prev,
        equippedPet: pet
      };
    });
  }, []);
  const getEquippedPetName = reactExports.useCallback(() => {
    if (!data.equippedPet) return "無";
    return PETS[data.equippedPet]?.name ?? data.equippedPet;
  }, [data.equippedPet]);
  return {
    unlockedPets: data.unlockedPets,
    equippedPet: data.equippedPet,
    unlockPet,
    equipPet,
    getEquippedPetName
  };
}
const GachaPage = () => {
  const navigate = useNavigate();
  const gacha = useGacha();
  const skin = useSkinStorage();
  const pet = usePetStorage();
  const titles = useTitles();
  const skinUpgrade = useSkinUpgrade();
  const [coins, setCoins] = reactExports.useState(() => getCoins());
  const [pulling, setPulling] = reactExports.useState(false);
  const [results, setResults] = reactExports.useState(null);
  const fragments = skinUpgrade.fragments;
  const isOwned = reactExports.useCallback((reward) => {
    switch (reward.kind) {
      case "pawnSkin":
        return skin.unlockedPawnSkins.includes(reward.id);
      case "diceSkin":
        return skin.unlockedDiceSkins.includes(reward.id);
      case "pet":
        return pet.unlockedPets.includes(reward.id);
      case "title":
        return titles.unlockedTitles.includes(reward.id);
      default:
        return false;
    }
  }, [skin.unlockedPawnSkins, skin.unlockedDiceSkins, pet.unlockedPets, titles.unlockedTitles]);
  const grantReward = reactExports.useCallback((reward) => {
    if (isOwned(reward)) {
      const converted = DUPLICATE_FRAGMENTS[reward.rarity];
      skinUpgrade.addFragments(converted);
      return {
        isNew: false,
        convertedFragments: converted
      };
    }
    switch (reward.kind) {
      case "pawnSkin":
        skin.unlockPawnSkin(reward.id);
        break;
      case "diceSkin":
        skin.unlockDiceSkin(reward.id);
        break;
      case "pet":
        pet.unlockPet(reward.id);
        break;
      case "title":
        titles.unlockTitle(reward.id);
        break;
    }
    return {
      isNew: true,
      convertedFragments: 0
    };
  }, [isOwned, skin, pet, titles, skinUpgrade]);
  const doPull = reactExports.useCallback((times, currency) => {
    if (pulling) return;
    const cost = times === 1 ? SINGLE_PULL_COST : TEN_PULL_COST;
    if (currency === "coins") {
      if (coins < cost.coins) {
        toast.error("金幣不足");
        return;
      }
    } else {
      if (fragments < cost.fragments) {
        toast.error("碎片不足");
        return;
      }
    }
    setPulling(true);
    vibrate(vibrationPatterns.medium);
    if (currency === "coins") {
      addCoins(-cost.coins);
      setCoins(getCoins());
    } else {
      skinUpgrade.addFragments(-cost.fragments);
    }
    const outcomes = Array.from({
      length: times
    }, () => gacha.drawOnce());
    gacha.commitDraws(outcomes);
    const granted = outcomes.map((o) => {
      const g = grantReward(o.reward);
      return {
        reward: o.reward,
        isNew: g.isNew,
        convertedFragments: g.convertedFragments
      };
    });
    setTimeout(() => {
      setPulling(false);
      setResults(granted);
      const legendaryCount = granted.filter((g) => g.reward.rarity === "legendary").length;
      if (legendaryCount > 0) {
        vibrate(vibrationPatterns.win);
        toast.success(`恭喜獲得 ${legendaryCount} 項傳說獎勵！`);
      } else {
        vibrate(vibrationPatterns.light);
      }
    }, 800);
  }, [pulling, coins, fragments, gacha, grantReward, skinUpgrade]);
  const rarityIcon = (reward) => {
    switch (reward.kind) {
      case "pawnSkin":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 22 });
      case "diceSkin":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 22 });
      case "pet":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PawPrint, { size: 22 });
      case "title":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 22 });
    }
  };
  const costButtons = reactExports.useMemo(() => [{
    times: 1,
    label: "單抽",
    desc: `金幣 ${SINGLE_PULL_COST.coins}`,
    action: () => doPull(1, "coins"),
    disabled: coins < SINGLE_PULL_COST.coins,
    color: "var(--cyan)"
  }, {
    times: 10,
    label: "十連",
    desc: `金幣 ${TEN_PULL_COST.coins}`,
    action: () => doPull(10, "coins"),
    disabled: coins < TEN_PULL_COST.coins,
    color: "var(--pink)"
  }, {
    times: 1,
    label: "碎片單抽",
    desc: `碎片 ${SINGLE_PULL_COST.fragments}`,
    action: () => doPull(1, "fragments"),
    disabled: fragments < SINGLE_PULL_COST.fragments,
    color: "var(--purple)"
  }, {
    times: 10,
    label: "碎片十連",
    desc: `碎片 ${TEN_PULL_COST.fragments}`,
    action: () => doPull(10, "fragments"),
    disabled: fragments < TEN_PULL_COST.fragments,
    color: "var(--yellow)"
  }], [coins, fragments, doPull]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full px-4 pt-6 pb-24 md:pb-10 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate(-1), className: "cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center", "aria-label": "返回", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl tracking-wider", style: {
          color: "var(--pink)",
          textShadow: "0 0 12px var(--pink-glow)"
        }, children: "霓虹扭蛋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-cyber tracking-wider mt-1", style: {
          color: "var(--text-secondary)"
        }, children: "抽取皮膚 / 寵物 / 稱號 · v2.0.0" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 20, style: {
          color: "var(--yellow)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber", style: {
            color: "var(--text-secondary)"
          }, children: "金幣" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
            color: "var(--yellow)"
          }, children: coins })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, style: {
          color: "var(--purple)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber", style: {
            color: "var(--text-secondary)"
          }, children: "碎片" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
            color: "var(--purple)"
          }, children: fragments })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm", style: {
          color: "var(--text-secondary)"
        }, children: "傳說保底進度" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-sm", style: {
          color: "var(--yellow)"
        }, children: [
          gacha.pityCount,
          " / ",
          PITY_MAX
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 rounded-full overflow-hidden", style: {
        background: "rgba(255,255,255,0.08)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: {
        width: `${gacha.pityCount / PITY_MAX * 100}%`,
        background: "linear-gradient(90deg, var(--yellow), var(--pink))",
        boxShadow: "0 0 8px var(--pink-glow)",
        transition: "width 0.3s"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-cyber mt-2", style: {
        color: "var(--text-muted)"
      }, children: [
        "距離保底傳說還剩 ",
        gacha.pityRemaining,
        " 抽"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm mb-3", style: {
        color: "var(--cyan)"
      }, children: "獎池機率" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 text-xs font-cyber", children: ["common", "rare", "epic", "legendary"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1", style: {
        color: RARITY_COLORS[r],
        border: `1px solid ${RARITY_COLORS[r]}`,
        background: `${RARITY_COLORS[r]}15`
      }, children: [
        RARITY_LABELS[r],
        " ",
        r === "common" ? "50%" : r === "rare" ? "30%" : r === "epic" ? "15%" : "5%"
      ] }, r)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-cyber mt-3", style: {
        color: "var(--text-muted)"
      }, children: "重複取得會自動轉換為碎片（普通 5 / 稀有 15 / 史詩 30 / 傳說 80）" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 mb-6", children: costButtons.map((btn) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: btn.action, disabled: btn.disabled || pulling, className: "cyber-btn p-4 flex flex-col items-center gap-2 min-h-[88px]", style: {
      borderColor: btn.color,
      color: btn.color,
      background: `${btn.color}14`,
      boxShadow: `0 0 12px ${btn.color}33`,
      cursor: btn.disabled || pulling ? "not-allowed" : "pointer",
      opacity: btn.disabled || pulling ? 0.5 : 1
    }, children: [
      pulling ? /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 22, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 22 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: btn.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber", style: {
        color: "var(--text-secondary)"
      }, children: btn.desc })
    ] }, btn.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm font-cyber", style: {
      color: "var(--text-secondary)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 16 }),
      "累計抽取 ",
      gacha.totalPulls,
      " 次"
    ] }) }),
    results && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4", onClick: () => setResults(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg", style: {
          color: "var(--pink)",
          textShadow: "0 0 8px var(--pink-glow)"
        }, children: "抽取結果" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setResults(null), className: "p-1", style: {
          color: "var(--text-secondary)"
        }, "aria-label": "關閉", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid gap-2 ${results.length === 1 ? "grid-cols-1" : "grid-cols-2"}`, children: results.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 text-center", style: {
        border: `1px solid ${RARITY_COLORS[g.reward.rarity]}`,
        background: `${RARITY_COLORS[g.reward.rarity]}12`,
        boxShadow: `0 0 10px ${RARITY_COLORS[g.reward.rarity]}33`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-2", style: {
          color: RARITY_COLORS[g.reward.rarity]
        }, children: rarityIcon(g.reward) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xs mb-1", style: {
          color: RARITY_COLORS[g.reward.rarity]
        }, children: RARITY_LABELS[g.reward.rarity] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm mb-1", style: {
          color: "var(--text-primary)"
        }, children: g.reward.name }),
        g.isNew ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber", style: {
          color: "var(--green)"
        }, children: "新解放！" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber", style: {
          color: "var(--text-secondary)"
        }, children: [
          "重複 → 碎片 +",
          g.convertedFragments
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setResults(null), className: "cyber-btn w-full mt-4 py-2.5 text-sm", children: "確認" })
    ] }) })
  ] });
};
export {
  GachaPage as default
};
