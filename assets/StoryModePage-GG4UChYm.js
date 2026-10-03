import { u as useNavigate, r as reactExports, j as jsxRuntimeExports, bE as ChevronLeft, bF as STORY_LEVELS, at as Check, L as Lock, Z as Zap, bG as FilePen, aJ as Coins, by as Skull, aN as Target, aB as Clock, bH as Shield, aL as Star } from "./index-ymfxQ6bv.js";
import { g as getLocalScenarios } from "./customScenarios-DAdS9UmQ.js";
import "./reviewStorage-B6nD4ZW8.js";
const STORAGE_KEY = "cyber_monopoly_story_progress";
function useStoryProgress() {
  const [progress, setProgress] = reactExports.useState({
    completed: [],
    current: 1
  });
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.completed) && typeof parsed.current === "number") {
          setProgress(parsed);
        }
      }
    } catch {
    }
    setLoaded(true);
  }, []);
  const saveProgress = reactExports.useCallback((p) => {
    setProgress(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
    }
  }, []);
  const completeLevel = reactExports.useCallback((levelId) => {
    setProgress((prev) => {
      if (prev.completed.includes(levelId)) return prev;
      const newCompleted = [...prev.completed, levelId];
      const newCurrent = Math.min(10, levelId + 1);
      const next = {
        completed: newCompleted,
        current: newCurrent
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }, []);
  const isUnlocked = reactExports.useCallback((levelId) => {
    if (progress.completed.includes(levelId)) return true;
    if (levelId === 1) return true;
    return progress.completed.includes(levelId - 1);
  }, [progress.completed]);
  const isCompleted = reactExports.useCallback((levelId) => {
    return progress.completed.includes(levelId);
  }, [progress.completed]);
  return {
    progress,
    loaded,
    completeLevel,
    isUnlocked,
    isCompleted,
    saveProgress
  };
}
const difficultyConfig = {
  easy: {
    label: "簡單",
    color: "var(--green)",
    bg: "rgba(0, 255, 128, 0.12)"
  },
  normal: {
    label: "普通",
    color: "var(--yellow, #facc15)",
    bg: "rgba(250, 204, 21, 0.12)"
  },
  hard: {
    label: "困難",
    color: "var(--orange, #ff8c42)",
    bg: "rgba(255, 140, 66, 0.12)"
  },
  extreme: {
    label: "極限",
    color: "var(--red)",
    bg: "rgba(255, 77, 109, 0.12)"
  }
};
const getDifficultyIcon = (difficulty) => {
  switch (difficulty) {
    case "easy":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12 });
    case "normal":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12 });
    case "hard":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 12 });
    case "extreme":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { size: 12 });
    default:
      return null;
  }
};
const StoryModePage = () => {
  const navigate = useNavigate();
  const {
    progress,
    loaded,
    completeLevel,
    isUnlocked,
    isCompleted
  } = useStoryProgress();
  const [selectedLevel, setSelectedLevel] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("official");
  const [localScenarios, setLocalScenarios] = reactExports.useState([]);
  const [selectedScenario, setSelectedScenario] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const handler = (e) => {
      const detail = e.detail;
      if (detail && typeof detail.levelId === "number") {
        completeLevel(detail.levelId);
      }
    };
    window.addEventListener("story:complete-level", handler);
    return () => {
      window.removeEventListener("story:complete-level", handler);
    };
  }, [completeLevel]);
  reactExports.useEffect(() => {
    setLocalScenarios(getLocalScenarios());
  }, [activeTab]);
  const completedCount = progress.completed.length;
  const handleLevelClick = (level) => {
    if (!isUnlocked(level.id)) return;
    setSelectedLevel(level);
  };
  const handleStart = () => {
    if (!selectedLevel) return;
    navigate("/game", {
      state: {
        storyLevel: selectedLevel.id
      }
    });
  };
  const handleBack = () => {
    navigate("/");
  };
  if (!loaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex items-center justify-center scanlines", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-cyan font-cyber tracking-wider", children: "載入中..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full px-4 py-6 md:py-8 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--pink)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6 md:mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center flex-1 mx-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-4xl text-neon-cyan tracking-widest mb-1", children: "劇情模式" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs md:text-sm text-[var(--text-secondary)] font-cyber tracking-wider", children: "通關 10 大關卡，成為賽博傳說" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card px-3 py-2 text-center", style: {
          borderColor: "rgba(0, 255, 255, 0.3)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)]", children: "進度" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg md:text-xl text-neon-cyan", children: [
            completedCount,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-[var(--text-secondary)]", children: " / 10" })
          ] })
        ] })
      ] }),
      activeTab === "official" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 md:mb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full overflow-hidden", style: {
        background: "rgba(0, 255, 255, 0.1)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-700", style: {
        width: `${completedCount / 10 * 100}%`,
        background: "linear-gradient(90deg, var(--cyan), var(--pink))",
        boxShadow: "0 0 10px var(--cyan), 0 0 20px var(--pink)"
      } }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 max-w-md mx-auto", children: [{
        key: "official",
        label: "官方關卡"
      }, {
        key: "custom",
        label: "自製劇本"
      }].map((tab) => {
        const isActive = activeTab === tab.key;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setActiveTab(tab.key);
          setSelectedLevel(null);
          setSelectedScenario(null);
        }, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: isActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
          color: isActive ? "var(--cyan)" : "var(--text-secondary)",
          backgroundColor: isActive ? "rgba(0, 255, 255, 0.08)" : "transparent"
        }, children: tab.label }, tab.key);
      }) }),
      activeTab === "official" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 lg:max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-6 top-4 bottom-4 w-px", style: {
            background: "linear-gradient(180deg, var(--cyan) 0%, var(--pink) 50%, var(--purple) 100%)",
            opacity: 0.4,
            boxShadow: "0 0 6px var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: STORY_LEVELS.map((level) => {
            const unlocked = isUnlocked(level.id);
            const completed = isCompleted(level.id);
            const isCurrent = !completed && unlocked;
            const isSelected = selectedLevel?.id === level.id;
            const diffCfg = difficultyConfig[level.difficulty] ?? difficultyConfig.normal;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleLevelClick(level), disabled: !unlocked, className: `cyber-card w-full text-left p-3 pl-12 relative transition-all ${unlocked ? "hover:scale-[1.01] cursor-pointer" : "opacity-50 cursor-not-allowed"}`, style: {
              borderColor: completed ? "var(--green)" : isSelected ? "var(--pink)" : unlocked ? "rgba(0, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.08)",
              boxShadow: completed ? "0 0 15px rgba(0, 255, 128, 0.25), inset 0 0 10px rgba(0, 255, 128, 0.1)" : isCurrent ? "0 0 15px rgba(255, 107, 157, 0.25)" : void 0,
              animation: isCurrent ? "pulse-glow 2s ease-in-out infinite" : void 0
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-cyber text-sm font-bold", style: {
                background: completed ? "var(--green)" : unlocked ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)",
                color: completed || unlocked ? "#000" : "rgba(255, 255, 255, 0.3)",
                boxShadow: completed ? "0 0 12px var(--green)" : unlocked ? "0 0 12px var(--cyan)" : "none"
              }, children: completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, strokeWidth: 3 }) : unlocked ? level.id : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-base md:text-lg tracking-wider truncate", style: {
                    color: completed ? "var(--green)" : unlocked ? "var(--text-primary)" : "rgba(255, 255, 255, 0.3)"
                  }, children: level.name }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] line-clamp-1", children: level.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-cyber tracking-wider", style: {
                  color: diffCfg.color,
                  backgroundColor: diffCfg.bg,
                  border: `1px solid ${diffCfg.color}40`
                }, children: [
                  getDifficultyIcon(level.difficulty),
                  diffCfg.label
                ] })
              ] }),
              level.specialRule && unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-[10px] font-cyber tracking-wider", style: {
                color: "var(--purple)"
              }, children: [
                "閃電 ",
                level.specialRule
              ] })
            ] }, level.id);
          }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: selectedLevel ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 md:p-6 sticky top-4", style: {
          borderColor: "var(--pink)",
          boxShadow: "0 0 25px rgba(255, 107, 157, 0.2), inset 0 0 15px rgba(255, 107, 157, 0.08)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: [
                "第 ",
                selectedLevel.id,
                " 關"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl md:text-2xl tracking-wider", style: {
                color: "var(--pink)"
              }, children: selectedLevel.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 px-3 py-1 rounded-sm text-sm font-cyber tracking-wider", style: {
              color: difficultyConfig[selectedLevel.difficulty].color,
              backgroundColor: difficultyConfig[selectedLevel.difficulty].bg,
              border: `1px solid ${difficultyConfig[selectedLevel.difficulty].color}50`
            }, children: [
              getDifficultyIcon(selectedLevel.difficulty),
              difficultyConfig[selectedLevel.difficulty].label
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-5", children: selectedLevel.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "初始資金" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-neon-cyan", children: [
                "¥",
                selectedLevel.startingMoney.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "AI 數量" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-[var(--text-primary)]", children: [
                selectedLevel.aiCount,
                " 個"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "AI 攻擊性" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-[var(--text-primary)]", children: [
                Math.round(selectedLevel.aiAggression * 100),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-secondary)]", children: "遊戲模式" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-[var(--text-primary)]", children: selectedLevel.gameMode === "classic" ? "經典" : selectedLevel.gameMode === "crazy" ? "瘋狂" : selectedLevel.gameMode === "battle_royale" ? "大逃殺" : selectedLevel.gameMode })
            ] }),
            selectedLevel.specialRule && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-sm text-sm", style: {
              border: "1px solid var(--purple)",
              backgroundColor: "rgba(168, 85, 247, 0.08)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-1", style: {
                color: "var(--purple)"
              }, children: "特殊規則" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--text-primary)]", children: [
                "閃電 ",
                selectedLevel.specialRule
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-sm text-sm", style: {
              border: "1px solid var(--green)",
              backgroundColor: "rgba(0, 255, 128, 0.06)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider mb-1", style: {
                color: "var(--green)"
              }, children: "通關獎勵" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--text-primary)]", children: [
                "獎盃 ",
                selectedLevel.reward
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleStart, className: "cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest", children: "開始挑戰" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 md:p-10 text-center sticky top-4", style: {
          borderColor: "rgba(0, 255, 255, 0.15)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center", style: {
            border: "1px solid var(--cyan)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 28, style: {
            color: "var(--cyan)"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-cyan tracking-wider mb-2", children: "選擇關卡" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[var(--text-secondary)]", children: [
            "點擊左側已解鎖的關卡查看詳情",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "通關後自動解鎖下一關"
          ] })
        ] }) })
      ] }),
      activeTab === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[var(--text-secondary)]", children: [
            "本地劇本：",
            localScenarios.length,
            " 個"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/scenario-editor"), className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2", style: {
            borderColor: "var(--green)",
            color: "var(--green)",
            backgroundColor: "rgba(0, 255, 128, 0.08)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { size: 16 }),
            "劇本製作器"
          ] })
        ] }),
        localScenarios.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center", style: {
          borderColor: "rgba(0, 255, 255, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center", style: {
            border: "1px solid var(--cyan)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { size: 28, style: {
            color: "var(--cyan)"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-cyan tracking-wider mb-2", children: "尚無自製劇本" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-4", children: "使用劇本製作器創建專屬挑戰" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate("/scenario-editor"), className: "cyber-btn px-6 py-2 text-sm font-cyber tracking-wider", style: {
            borderColor: "var(--green)",
            color: "var(--green)"
          }, children: "前往製作器" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: localScenarios.map((scenario) => {
          const isSelected = selectedScenario?.id === scenario.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedScenario(scenario), className: "cyber-card p-4 text-left hover:scale-[1.02] transition-transform", style: {
            borderColor: isSelected ? "var(--pink)" : "rgba(0, 255, 255, 0.2)",
            boxShadow: isSelected ? "0 0 15px rgba(255, 107, 157, 0.3)" : "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-base tracking-wider text-neon-cyan truncate mb-1", children: scenario.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 min-h-[32px]", children: scenario.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 12 }),
                  " 初始資金"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-neon-cyan", children: [
                  "$",
                  scenario.startingMoney.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { size: 12 }),
                  " AI"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber", children: [
                  scenario.aiCount,
                  " 個"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 12 }),
                  " 勝利"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", style: {
                  color: "var(--green)"
                }, children: scenario.victoryCondition === "reach_money" ? "累積資產" : scenario.victoryCondition === "own_properties" ? "擁有地產" : "淘汰對手" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[var(--text-secondary)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
                  " 回合"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", children: scenario.maxTurns > 0 ? `${scenario.maxTurns}` : "無限制" })
              ] })
            ] })
          ] }, scenario.id);
        }) }),
        selectedScenario && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6", style: {
          borderColor: "var(--pink)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-xl text-neon-cyan tracking-wider mb-2", children: selectedScenario.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-4", children: selectedScenario.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] text-xs mb-1", children: "初始資金" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-neon-cyan", children: [
                "$",
                selectedScenario.startingMoney.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] text-xs mb-1", children: "AI 數量" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber", children: [
                selectedScenario.aiCount,
                " 個"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] text-xs mb-1", children: "AI 難度" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber", children: selectedScenario.aiDifficulty === "easy" ? "簡單" : selectedScenario.aiDifficulty === "normal" ? "普通" : selectedScenario.aiDifficulty === "hard" ? "困難" : "極限" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] text-xs mb-1", children: "回合上限" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber", children: selectedScenario.maxTurns > 0 ? `${selectedScenario.maxTurns} 回合` : "無限制" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] text-xs mb-1", children: "勝利條件" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
              color: "var(--green)"
            }, children: selectedScenario.victoryCondition === "reach_money" ? `資產達到 $${selectedScenario.victoryParam.toLocaleString()}` : selectedScenario.victoryCondition === "own_properties" ? `擁有 ${selectedScenario.victoryParam} 個地產` : "淘汰所有對手" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
            navigate("/game", {
              state: {
                customStoryScenario: selectedScenario
              }
            });
          }, className: "cyber-btn w-full py-3 text-base font-cyber tracking-wider", style: {
            borderColor: "var(--pink)",
            color: "var(--pink)",
            backgroundColor: "rgba(255, 107, 157, 0.1)",
            boxShadow: "0 0 15px rgba(255, 107, 157, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "inline mr-2", size: 18 }),
            "開始挑戰"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 107, 157, 0.25);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.2);
          }
        }
      ` })
  ] });
};
export {
  StoryModePage as default
};
