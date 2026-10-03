import { u as useNavigate, r as reactExports, j as jsxRuntimeExports, aI as Trophy, aP as TrendingUp, Z as Zap, be as Flame, aK as Award } from "./index-ymfxQ6bv.js";
import { g as getRankedState, a as getTierProgress, b as applyMatchResult, s as saveRankedState, R as RANK_TIERS } from "./ranked-C4YlVYfA.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
const SEASON_REWARDS = [{
  tier: "黃金",
  reward: "黃金段位頭像框",
  type: "avatarFrame"
}, {
  tier: "鉑金",
  reward: "霓虹擊敗特效",
  type: "effect"
}, {
  tier: "鑽石",
  reward: "鑽石骰子皮膚",
  type: "skin"
}, {
  tier: "大師",
  reward: "大師稱號",
  type: "title"
}, {
  tier: "王者",
  reward: "王者傳說皮膚",
  type: "skin"
}];
function getSeasonDaysLeft() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth();
  const quarterEndMonth = Math.ceil((month + 1) / 3) * 3 - 1;
  const lastDay = new Date(now.getFullYear(), quarterEndMonth + 1, 0);
  const diff = lastDay.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diff / (1e3 * 60 * 60 * 24)));
}
const RankedSeasonPage = () => {
  const navigate = useNavigate();
  const [state, setState] = reactExports.useState(() => getRankedState());
  const [, setTick] = reactExports.useState(0);
  const progress = reactExports.useMemo(() => getTierProgress(state.elo), [state.elo]);
  reactExports.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 6e4);
    return () => clearInterval(timer);
  }, []);
  const handleBack = reactExports.useCallback(() => {
    navigate("/");
  }, [navigate]);
  const handleSimulateWin = reactExports.useCallback(() => {
    const opponentElo = state.elo + Math.floor(Math.random() * 100) - 50;
    const newState = applyMatchResult(state, true, opponentElo);
    saveRankedState(newState);
    setState(newState);
  }, [state]);
  const handleSimulateLoss = reactExports.useCallback(() => {
    const opponentElo = state.elo + Math.floor(Math.random() * 100) - 50;
    const newState = applyMatchResult(state, false, opponentElo);
    saveRankedState(newState);
    setState(newState);
  }, [state]);
  const seasonNum = state.currentSeason;
  const daysLeft = getSeasonDaysLeft();
  const totalGames = state.wins + state.losses;
  const winRate = totalGames > 0 ? Math.round(state.wins / totalGames * 100) : 0;
  const currentTierConfig = progress.currentTier;
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl tracking-wider", style: {
          color: currentTierConfig.color,
          textShadow: `0 0 15px ${currentTierConfig.glowColor}60`
        }, children: "排位賽季" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1", children: [
          seasonNum,
          " · 剩餘 ",
          daysLeft,
          " 天"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl w-full mx-auto space-y-6 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-5 relative overflow-hidden", style: {
        borderColor: currentTierConfig.color,
        boxShadow: `0 0 25px ${currentTierConfig.glowColor}30, inset 0 0 20px ${currentTierConfig.glowColor}10`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center flex-shrink-0", style: {
          border: `3px solid ${currentTierConfig.color}`,
          backgroundColor: `${currentTierConfig.color}15`,
          boxShadow: `0 0 20px ${currentTierConfig.glowColor}60, inset 0 0 15px ${currentTierConfig.glowColor}30`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-5xl md:text-6xl font-bold", style: {
          color: currentTierConfig.color,
          textShadow: `0 0 15px ${currentTierConfig.glowColor}`
        }, children: currentTierConfig.iconLetter }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center md:text-left w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: "當前段位" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-3xl md:text-4xl font-bold tracking-wider", style: {
            color: currentTierConfig.color,
            textShadow: `0 0 10px ${currentTierConfig.glowColor}`
          }, children: currentTierConfig.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-secondary)] mt-1", children: currentTierConfig.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentTierConfig.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                state.elo,
                " / ",
                progress.nextTier ? progress.maxElo : "MAX",
                " ELO"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: progress.nextTier ? progress.nextTier.name : "最高段位" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 rounded-sm bg-[var(--bg-mid)] border relative overflow-hidden", style: {
              borderColor: `${currentTierConfig.color}40`
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all duration-700", style: {
              width: `${progress.progress}%`,
              background: `linear-gradient(90deg, ${currentTierConfig.color}40, ${currentTierConfig.color})`,
              boxShadow: `0 0 10px ${currentTierConfig.glowColor}`
            } }) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 18 }), label: "ELO 分數", value: String(state.elo), color: "var(--yellow)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18 }), label: "勝場", value: String(state.wins), color: "var(--green)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 18 }), label: "敗場", value: String(state.losses), color: "var(--red)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 18 }), label: "連勝", value: `${state.winStreak} 連勝`, color: "var(--pink)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: "rgba(0, 255, 255, 0.2)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--text-secondary)]", children: "賽季戰績" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: "總對局" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-2xl font-bold text-[var(--text-primary)]", children: totalGames })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: "勝率" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-2xl font-bold", style: {
              color: "var(--green)"
            }, children: [
              winRate,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: "最高連勝" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-2xl font-bold", style: {
              color: "var(--yellow)"
            }, children: state.bestWinStreak ?? 0 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: "rgba(168, 85, 247, 0.25)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3", children: "段位一覽" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-2", children: RANK_TIERS.map((tier) => {
          const isCurrent = tier.tier === state.tier;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 p-2 rounded-sm transition-all", style: {
            border: `1px solid ${isCurrent ? tier.color : "rgba(255,255,255,0.1)"}`,
            backgroundColor: isCurrent ? `${tier.color}15` : "transparent",
            boxShadow: isCurrent ? `0 0 10px ${tier.glowColor}40` : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center font-cyber font-bold text-lg", style: {
              color: tier.color,
              border: `1.5px solid ${tier.color}`,
              textShadow: `0 0 6px ${tier.glowColor}`,
              opacity: isCurrent ? 1 : 0.7
            }, children: tier.iconLetter }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-cyber tracking-wider text-center", style: {
              color: isCurrent ? tier.color : "var(--text-secondary)"
            }, children: tier.name })
          ] }, tier.tier);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: "rgba(0, 255, 255, 0.2)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3", children: "升降段規則" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-[var(--text-secondary)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--green)"
            }, children: "▲" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "勝場獲得 15-30 ELO 分，連勝 3 場以上額外加成" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--red)"
            }, children: "▼" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "敗場扣除 10-20 ELO 分，ELO 歸零不再扣除" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--cyan)"
            }, children: "◆" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "達到下一段位最低 ELO 門檻即自動升段" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "var(--yellow)"
            }, children: "星" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "賽季結算後段位軟重置，保留 70% 基礎分數" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
        borderColor: "rgba(255, 200, 0, 0.25)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 16, style: {
            color: "var(--yellow)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider", style: {
            color: "var(--yellow)"
          }, children: "賽季結算獎勵" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: SEASON_REWARDS.map((reward) => {
          const tierConfig = RANK_TIERS.find((t) => t.name === reward.tier);
          const achieved = tierConfig ? state.elo >= tierConfig.minElo : false;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2.5 rounded-sm", style: {
            border: `1px solid ${achieved ? "var(--green)" : "rgba(255,255,255,0.1)"}`,
            backgroundColor: achieved ? "rgba(0, 255, 128, 0.05)" : "transparent",
            opacity: achieved ? 1 : 0.6
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center font-cyber font-bold text-sm flex-shrink-0", style: {
              color: tierConfig?.color ?? "var(--text-secondary)",
              border: `1.5px solid ${tierConfig?.color ?? "var(--text-muted)"}`
            }, children: tierConfig?.iconLetter ?? "?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber tracking-wider", style: {
                color: tierConfig?.color
              }, children: [
                reward.tier,
                "段位"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-[var(--text-primary)] truncate", children: reward.reward })
            ] }),
            achieved ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber px-2 py-0.5 rounded-sm", style: {
              color: "var(--green)",
              border: "1px solid var(--green)"
            }, children: "已達成" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber px-2 py-0.5 rounded-sm", style: {
              color: "var(--text-muted)",
              border: "1px solid var(--text-muted)"
            }, children: "未達成" })
          ] }, reward.tier);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSimulateWin, className: "cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: "var(--green)",
          color: "var(--green)",
          background: "rgba(0, 255, 128, 0.08)",
          boxShadow: "0 0 12px rgba(0, 255, 128, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 16 }),
          "模擬獲勝"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSimulateLoss, className: "cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          background: "rgba(255, 59, 59, 0.08)",
          boxShadow: "0 0 12px rgba(255, 59, 59, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16 }),
          "模擬落敗"
        ] })
      ] })
    ] })
  ] });
};
const StatCard = ({
  icon,
  label,
  value,
  color
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 text-center", style: {
    borderColor: `${color}30`,
    backgroundColor: `${color}05`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 mb-1", style: {
      color
    }, children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl font-bold", style: {
      color,
      textShadow: `0 0 8px ${color}60`
    }, children: value })
  ] });
};
export {
  RankedSeasonPage as default
};
