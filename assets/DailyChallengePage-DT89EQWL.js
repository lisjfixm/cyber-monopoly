import { r as reactExports, aF as safeGetJSON, aG as safeSetJSON, l as logger, u as useNavigate, a as usePlayerIdentity, j as jsxRuntimeExports, be as Flame, aN as Target, Z as Zap, aI as Trophy, at as Check, bf as Gift, aL as Star, aB as Clock, b4 as ChevronRight, aJ as Coins, b9 as Sparkles } from "./index-ymfxQ6bv.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { C as Calendar } from "./calendar-DzeNaHko.js";
const lastClaimed = [];
const DAILY_KEY = "cyber_monopoly_daily_tasks";
const WEEKLY_KEY = "cyber_monopoly_weekly_tasks";
const CHECKIN_KEY = "cyber_monopoly_checkin";
function getDateKey() {
  const d = /* @__PURE__ */ new Date();
  const utcYear = d.getUTCFullYear();
  const utcMonth = String(d.getUTCMonth() + 1).padStart(2, "0");
  const utcDate = String(d.getUTCDate()).padStart(2, "0");
  return `${utcYear}-${utcMonth}-${utcDate}`;
}
function getYesterdayKey() {
  const d = new Date(Date.now() - 864e5);
  const utcYear = d.getUTCFullYear();
  const utcMonth = String(d.getUTCMonth() + 1).padStart(2, "0");
  const utcDate = String(d.getUTCDate()).padStart(2, "0");
  return `${utcYear}-${utcMonth}-${utcDate}`;
}
function getWeekKey() {
  const d = /* @__PURE__ */ new Date();
  const utcDay = d.getUTCDay() || 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - utcDay + 1));
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const day = String(monday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const DAILY_TASK_DEFS = [{
  id: "daily_play",
  name: "完成一局",
  description: "完成任意模式一局對戰",
  target: 1,
  reward: {
    coins: 500,
    exp: 100
  }
}, {
  id: "daily_win",
  name: "贏得一局",
  description: "在任意模式中獲勝一局",
  target: 1,
  reward: {
    coins: 1e3,
    exp: 200
  }
}, {
  id: "daily_buy_property",
  name: "地產大亨",
  description: "單局購買 3 塊地產",
  target: 3,
  reward: {
    coins: 800,
    exp: 150
  }
}];
const WEEKLY_TASK_DEFS = [{
  id: "weekly_play_5",
  name: "勤奮玩家",
  description: "本週完成 5 局對戰",
  target: 5,
  reward: {
    coins: 3e3,
    exp: 500,
    item: "幸運卡"
  }
}, {
  id: "weekly_win_3",
  name: "連勝達人",
  description: "本週獲勝 3 局",
  target: 3,
  reward: {
    coins: 5e3,
    exp: 800,
    item: "雙倍骰子"
  }
}, {
  id: "weekly_ranked_10",
  name: "排位高手",
  description: "本週完成 10 局排位賽",
  target: 10,
  reward: {
    coins: 8e3,
    exp: 1200,
    item: "傳說碎片"
  }
}];
const CHECKIN_REWARDS = [{
  reward: "200 金幣",
  rewardType: "coins",
  value: 200
}, {
  reward: "300 金幣",
  rewardType: "coins",
  value: 300
}, {
  reward: "500 金幣",
  rewardType: "coins",
  value: 500
}, {
  reward: "幸運卡 x1",
  rewardType: "item",
  value: 1
}, {
  reward: "800 金幣",
  rewardType: "coins",
  value: 800
}, {
  reward: "雙倍骰子 x1",
  rewardType: "item",
  value: 1
}, {
  reward: "稀有稱號「週冠軍」",
  rewardType: "title",
  value: 1
}];
const ACTIVITIES = [{
  id: "neon_carnival",
  name: "霓虹狂歡節",
  description: "活動期間過路費 +20%，金幣獎勵翻倍",
  startDate: new Date(Date.now() - 864e5 * 2).toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 864e5 * 5).toISOString().slice(0, 10),
  status: "ongoing",
  color: "var(--pink)"
}, {
  id: "double_weekend",
  name: "雙倍週末",
  description: "每週末兩天，排位賽積分雙倍",
  startDate: new Date(Date.now() + 864e5 * 3).toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 864e5 * 5).toISOString().slice(0, 10),
  status: "upcoming",
  color: "var(--yellow)"
}, {
  id: "cyber_games",
  name: "賽博運動會",
  description: "限時模式開放，專屬皮膚等你拿",
  startDate: new Date(Date.now() + 864e5 * 10).toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 864e5 * 20).toISOString().slice(0, 10),
  status: "upcoming",
  color: "var(--cyan)"
}];
const LIMITED_MODES = [{
  id: "neon_rain",
  name: "霓虹雨",
  description: "每回合隨機天降金幣，金額 100~2000 不等",
  weekLabel: "本週限時模式",
  modifier: "gold_rain",
  color: "var(--cyan)",
  startDate: new Date(Date.now() - 864e5 * 2).toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 864e5 * 5).toISOString().slice(0, 10)
}];
function readDailyStore() {
  const today = getDateKey();
  const raw = safeGetJSON(DAILY_KEY, null);
  if (raw && raw.date === today) return raw;
  const tasks = {};
  DAILY_TASK_DEFS.forEach((t) => {
    tasks[t.id] = {
      progress: 0,
      status: "incomplete"
    };
  });
  return {
    date: today,
    tasks
  };
}
function readWeeklyStore() {
  const week = getWeekKey();
  const raw = safeGetJSON(WEEKLY_KEY, null);
  if (raw && raw.date === week) return raw;
  const tasks = {};
  WEEKLY_TASK_DEFS.forEach((t) => {
    tasks[t.id] = {
      progress: 0,
      status: "incomplete"
    };
  });
  return {
    date: week,
    tasks
  };
}
function readCheckInStore() {
  const today = getDateKey();
  const weekStart = getWeekKey();
  const raw = safeGetJSON(CHECKIN_KEY, null);
  if (!raw) {
    return {
      date: today,
      weekStart,
      checkedDays: [],
      streak: 0,
      lastCheckDate: null
    };
  }
  if (raw.weekStart !== weekStart) {
    return {
      ...raw,
      date: today,
      weekStart,
      checkedDays: []
    };
  }
  return raw;
}
function useDailyChallenge() {
  const [dailyStore, setDailyStore] = reactExports.useState(() => readDailyStore());
  const [weeklyStore, setWeeklyStore] = reactExports.useState(() => readWeeklyStore());
  const [checkInStore, setCheckInStore] = reactExports.useState(() => readCheckInStore());
  const today = getDateKey();
  reactExports.useEffect(() => {
    const fresh = readDailyStore();
    if (fresh.date !== dailyStore.date) setDailyStore(fresh);
    const freshWeekly = readWeeklyStore();
    if (freshWeekly.date !== weeklyStore.date) setWeeklyStore(freshWeekly);
    const freshCheckin = readCheckInStore();
    if (freshCheckin.weekStart !== checkInStore.weekStart) setCheckInStore(freshCheckin);
  }, [dailyStore.date, weeklyStore.date, checkInStore.weekStart]);
  const dailyTasks = reactExports.useMemo(() => {
    return DAILY_TASK_DEFS.map((def) => {
      const s = dailyStore.tasks[def.id] || {
        progress: 0,
        status: "incomplete"
      };
      return {
        ...def,
        progress: s.progress,
        status: s.status
      };
    });
  }, [dailyStore]);
  const weeklyTasks = reactExports.useMemo(() => {
    return WEEKLY_TASK_DEFS.map((def) => {
      const s = weeklyStore.tasks[def.id] || {
        progress: 0,
        status: "incomplete"
      };
      return {
        ...def,
        progress: s.progress,
        status: s.status
      };
    });
  }, [weeklyStore]);
  const checkInDays = reactExports.useMemo(() => {
    const days = [];
    const d = /* @__PURE__ */ new Date();
    const day = d.getUTCDay() || 7;
    const todayWeekday = day;
    for (let i = 1; i <= 7; i += 1) {
      const reward = CHECKIN_REWARDS[i - 1];
      if (!reward) continue;
      days.push({
        day: i,
        reward: reward.reward,
        rewardType: reward.rewardType,
        value: reward.value,
        checked: checkInStore.checkedDays.includes(i),
        isToday: i === todayWeekday,
        canRetro: i < todayWeekday && !checkInStore.checkedDays.includes(i)
      });
    }
    return days;
  }, [checkInStore.checkedDays]);
  const claimTask = reactExports.useCallback((taskId, isDaily) => {
    const defs = isDaily ? DAILY_TASK_DEFS : WEEKLY_TASK_DEFS;
    const def = defs.find((d) => d.id === taskId);
    if (!def) return false;
    let claimed = false;
    const reward = def.reward;
    try {
      if (isDaily) {
        setDailyStore((prev) => {
          const t = prev.tasks[taskId];
          if (!t || t.status !== "completed") return prev;
          claimed = true;
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [taskId]: {
                ...t,
                status: "claimed"
              }
            }
          };
        });
        if (claimed) {
          const store = safeGetJSON(DAILY_KEY, null);
          if (store && store.tasks[taskId]) {
            safeSetJSON(DAILY_KEY, {
              ...store,
              tasks: {
                ...store.tasks,
                [taskId]: {
                  ...store.tasks[taskId],
                  status: "claimed"
                }
              }
            });
          }
        }
      } else {
        setWeeklyStore((prev) => {
          const t = prev.tasks[taskId];
          if (!t || t.status !== "completed") return prev;
          claimed = true;
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [taskId]: {
                ...t,
                status: "claimed"
              }
            }
          };
        });
        if (claimed) {
          const store = safeGetJSON(WEEKLY_KEY, null);
          if (store && store.tasks[taskId]) {
            safeSetJSON(WEEKLY_KEY, {
              ...store,
              tasks: {
                ...store.tasks,
                [taskId]: {
                  ...store.tasks[taskId],
                  status: "claimed"
                }
              }
            });
          }
        }
      }
    } catch (err) {
      logger.error("[DailyChallenge] 領取獎勵失敗", taskId, err);
      return false;
    }
    if (claimed) {
      const entry = {
        taskId,
        taskName: def.name,
        reward,
        timestamp: Date.now()
      };
      lastClaimed.unshift(entry);
      if (lastClaimed.length > 10) lastClaimed.length = 10;
      if (reward.coins) logger.info(`[Task] 領取金幣獎勵 +${reward.coins}`, {
        taskId
      });
      if (reward.exp) logger.info(`[Task] 領取經驗獎勵 +${reward.exp}`, {
        taskId
      });
      if (reward.item) logger.info(`[Task] 領取道具獎勵 ${reward.item}`, {
        taskId
      });
    }
    return claimed;
  }, []);
  const incrementDailyTask = reactExports.useCallback((taskId, amount = 1) => {
    try {
      setDailyStore((prev) => {
        const t = prev.tasks[taskId];
        if (!t || t.status !== "incomplete") return prev;
        const def = DAILY_TASK_DEFS.find((d) => d.id === taskId);
        if (!def) return prev;
        const newProgress = Math.min(t.progress + amount, def.target);
        const status = newProgress >= def.target ? "completed" : "incomplete";
        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: {
              progress: newProgress,
              status
            }
          }
        };
      });
      const store = safeGetJSON(DAILY_KEY, null);
      if (store && store.tasks[taskId] && store.tasks[taskId].status === "incomplete") {
        const def = DAILY_TASK_DEFS.find((d) => d.id === taskId);
        if (def) {
          const t = store.tasks[taskId];
          const newProgress = Math.min(t.progress + amount, def.target);
          const status = newProgress >= def.target ? "completed" : "incomplete";
          safeSetJSON(DAILY_KEY, {
            ...store,
            tasks: {
              ...store.tasks,
              [taskId]: {
                progress: newProgress,
                status
              }
            }
          });
        }
      }
    } catch (err) {
      logger.warn("[DailyChallenge] 更新每日任務進度失敗", taskId, err);
    }
  }, []);
  const incrementWeeklyTask = reactExports.useCallback((taskId, amount = 1) => {
    try {
      setWeeklyStore((prev) => {
        const t = prev.tasks[taskId];
        if (!t || t.status !== "incomplete") return prev;
        const def = WEEKLY_TASK_DEFS.find((d) => d.id === taskId);
        if (!def) return prev;
        const newProgress = Math.min(t.progress + amount, def.target);
        const status = newProgress >= def.target ? "completed" : "incomplete";
        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [taskId]: {
              progress: newProgress,
              status
            }
          }
        };
      });
      const store = safeGetJSON(WEEKLY_KEY, null);
      if (store && store.tasks[taskId] && store.tasks[taskId].status === "incomplete") {
        const def = WEEKLY_TASK_DEFS.find((d) => d.id === taskId);
        if (def) {
          const t = store.tasks[taskId];
          const newProgress = Math.min(t.progress + amount, def.target);
          const status = newProgress >= def.target ? "completed" : "incomplete";
          safeSetJSON(WEEKLY_KEY, {
            ...store,
            tasks: {
              ...store.tasks,
              [taskId]: {
                progress: newProgress,
                status
              }
            }
          });
        }
      }
    } catch (err) {
      logger.warn("[DailyChallenge] 更新每週任務進度失敗", taskId, err);
    }
  }, []);
  const DAILY_TO_WEEKLY_MAP = {
    daily_play: "weekly_play_5",
    daily_win: "weekly_win_3"
  };
  const incrementTask = reactExports.useCallback((taskId, amount = 1) => {
    if (taskId.startsWith("weekly_")) {
      incrementWeeklyTask(taskId, amount);
    } else {
      incrementDailyTask(taskId, amount);
      const weeklyId = DAILY_TO_WEEKLY_MAP[taskId];
      if (weeklyId) {
        incrementWeeklyTask(weeklyId, amount);
      }
    }
  }, [incrementDailyTask, incrementWeeklyTask]);
  const performCheckIn = reactExports.useCallback(() => {
    const d = /* @__PURE__ */ new Date();
    const weekday = d.getUTCDay() || 7;
    let performed = false;
    let reward;
    try {
      setCheckInStore((prev) => {
        if (prev.checkedDays.includes(weekday)) return prev;
        const todayStr = getDateKey();
        const yesterdayStr = getYesterdayKey();
        const newStreak = prev.lastCheckDate === yesterdayStr ? prev.streak + 1 : 1;
        const next = {
          ...prev,
          checkedDays: [...prev.checkedDays, weekday].sort((a, b) => a - b),
          streak: newStreak,
          lastCheckDate: todayStr
        };
        performed = true;
        reward = CHECKIN_REWARDS[weekday - 1];
        return next;
      });
      if (performed) {
        const store = safeGetJSON(CHECKIN_KEY, null);
        if (store) {
          safeSetJSON(CHECKIN_KEY, {
            ...store,
            checkedDays: store.checkedDays.includes(weekday) ? store.checkedDays : [...store.checkedDays, weekday].sort((a, b) => a - b),
            streak: store.lastCheckDate === getYesterdayKey() ? store.streak + 1 : 1,
            lastCheckDate: getDateKey()
          });
        }
      }
    } catch (err) {
      logger.error("[DailyChallenge] 簽到失敗", err);
      return {
        success: false
      };
    }
    if (performed && reward) {
      logger.info(`[CheckIn] 第${weekday}天簽到獎勵：${reward.reward}`);
      return {
        success: true,
        reward
      };
    }
    return {
      success: false
    };
  }, []);
  const performRetroCheckIn = reactExports.useCallback((day) => {
    if (day < 1 || day > 7) return {
      success: false
    };
    const d = /* @__PURE__ */ new Date();
    const todayWeekday = d.getUTCDay() || 7;
    if (day >= todayWeekday) return {
      success: false
    };
    let performed = false;
    let reward;
    try {
      setCheckInStore((prev) => {
        if (prev.checkedDays.includes(day)) return prev;
        const next = {
          ...prev,
          checkedDays: [...prev.checkedDays, day].sort((a, b) => a - b)
        };
        performed = true;
        reward = CHECKIN_REWARDS[day - 1];
        return next;
      });
      if (performed) {
        const store = safeGetJSON(CHECKIN_KEY, null);
        if (store) {
          safeSetJSON(CHECKIN_KEY, {
            ...store,
            checkedDays: store.checkedDays.includes(day) ? store.checkedDays : [...store.checkedDays, day].sort((a, b) => a - b)
          });
        }
      }
    } catch (err) {
      logger.error("[DailyChallenge] 補簽失敗", err);
      return {
        success: false
      };
    }
    if (performed && reward) {
      logger.info(`[CheckIn] 補簽第${day}天獎勵：${reward.reward}`);
      return {
        success: true,
        reward
      };
    }
    return {
      success: false
    };
  }, []);
  const popLastClaimed = reactExports.useCallback(() => {
    return lastClaimed.shift() ?? null;
  }, []);
  const streakMilestones = reactExports.useMemo(() => [{
    days: 7,
    reward: "連續簽到 7 天：1000 金幣",
    reached: checkInStore.streak >= 7
  }, {
    days: 14,
    reward: "連續簽到 14 天：稀有頭像框",
    reached: checkInStore.streak >= 14
  }, {
    days: 30,
    reward: "連續簽到 30 天：史詩皮膚",
    reached: checkInStore.streak >= 30
  }], [checkInStore.streak]);
  return {
    dailyTasks,
    weeklyTasks,
    checkInDays,
    checkInStreak: checkInStore.streak,
    streakMilestones,
    activities: ACTIVITIES,
    limitedModes: LIMITED_MODES,
    today,
    claimTask,
    incrementTask,
    incrementDailyTask,
    incrementWeeklyTask,
    performCheckIn,
    performRetroCheckIn,
    popLastClaimed
  };
}
const TABS = [{
  key: "daily",
  label: "每日任務"
}, {
  key: "weekly",
  label: "每週任務"
}, {
  key: "checkin",
  label: "每日簽到"
}, {
  key: "event",
  label: "活動日曆"
}];
function getStatusStyle(status) {
  switch (status) {
    case "claimed":
      return {
        text: "已領取",
        color: "var(--green)",
        bg: "rgba(0, 255, 128, 0.08)"
      };
    case "completed":
      return {
        text: "可領取",
        color: "var(--yellow)",
        bg: "rgba(255, 200, 0, 0.1)"
      };
    default:
      return {
        text: "進行中",
        color: "var(--text-secondary)",
        bg: "rgba(255, 255, 255, 0.04)"
      };
  }
}
function TaskCard({
  task,
  onClaim,
  isDaily
}) {
  const statusStyle = getStatusStyle(task.status);
  const percent = task.target > 0 ? Math.min(100, task.progress / task.target * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
    borderColor: task.status === "completed" ? "var(--yellow)" : "rgba(0, 255, 255, 0.15)",
    boxShadow: task.status === "completed" ? "0 0 12px rgba(255, 200, 0, 0.2)" : "none"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-base tracking-wider text-[var(--text-primary)]", children: task.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mt-1", children: task.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-1 font-cyber tracking-wider rounded-sm flex-shrink-0", style: {
        color: statusStyle.color,
        border: `1px solid ${statusStyle.color}`,
        backgroundColor: statusStyle.bg
      }, children: statusStyle.text })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-muted)]", children: "進度" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--cyan)] font-cyber", children: [
          task.progress,
          "/",
          task.target
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 rounded-sm overflow-hidden", style: {
        backgroundColor: "rgba(255, 255, 255, 0.08)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all duration-500", style: {
        width: `${percent}%`,
        background: "linear-gradient(90deg, var(--cyan), var(--pink))",
        boxShadow: "0 0 8px var(--cyan)"
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        task.reward?.coins ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", style: {
          color: "var(--yellow)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 12 }),
          "+",
          task.reward.coins
        ] }) : null,
        task.reward?.exp ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", style: {
          color: "var(--green)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
          "+",
          task.reward.exp,
          " EXP"
        ] }) : null,
        task.reward?.item ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", style: {
          color: "var(--purple)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12 }),
          task.reward.item
        ] }) : null
      ] }),
      task.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClaim, className: "cyber-btn cyber-btn-pink px-4 py-1.5 text-xs font-cyber tracking-wider pulse-glow", style: {
        boxShadow: "0 0 10px rgba(255, 107, 157, 0.4)"
      }, children: "領取獎勵" }),
      task.status === "claimed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-[var(--green)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
        "已領取"
      ] })
    ] })
  ] });
}
const DailyChallengePage = () => {
  const navigate = useNavigate();
  const {
    nickname
  } = usePlayerIdentity();
  const [activeTab, setActiveTab] = reactExports.useState("daily");
  const {
    dailyTasks,
    weeklyTasks,
    checkInDays,
    checkInStreak,
    streakMilestones,
    activities,
    limitedModes,
    today,
    claimTask,
    performCheckIn
  } = useDailyChallenge();
  const handleBack = reactExports.useCallback(() => {
    navigate("/");
  }, [navigate]);
  const handleStartChallenge = reactExports.useCallback(() => {
    const params = new URLSearchParams();
    params.set("p1", encodeURIComponent(nickname || "玩家"));
    navigate(`/ai-setup?${params.toString()}`);
  }, [navigate, nickname]);
  const todayChecked = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    d.getDay() || 7;
    return checkInDays.some((day) => day.isToday && day.checked);
  }, [checkInDays]);
  const dailyDoneCount = dailyTasks.filter((t) => t.status !== "incomplete").length;
  const weeklyDoneCount = weeklyTasks.filter((t) => t.status !== "incomplete").length;
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-pink tracking-wider", children: "每日挑戰" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12 }),
          today
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 16, style: {
          color: "var(--yellow)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-[var(--yellow)]", children: [
          checkInStreak,
          "天"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4 max-w-2xl w-full mx-auto", children: TABS.map((tab) => {
      const selected = activeTab === tab.key;
      const badge = tab.key === "daily" ? dailyDoneCount : tab.key === "weekly" ? weeklyDoneCount : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "cyber-btn flex-1 py-2 text-xs md:text-sm font-cyber tracking-wider transition-all", style: {
        borderColor: selected ? "var(--pink)" : "rgba(0, 255, 255, 0.2)",
        color: selected ? "var(--pink)" : "var(--text-secondary)",
        background: selected ? "rgba(255, 107, 157, 0.08)" : "transparent",
        boxShadow: selected ? "0 0 12px rgba(255, 107, 157, 0.3)" : "none"
      }, children: [
        tab.label,
        badge > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] px-1.5 py-0.5 rounded-full", style: {
          backgroundColor: "var(--yellow)",
          color: "#000"
        }, children: badge })
      ] }, tab.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl w-full mx-auto space-y-4 pb-8", children: [
      activeTab === "daily" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 relative overflow-hidden", style: {
          borderColor: "var(--pink)",
          boxShadow: "0 0 20px rgba(255, 107, 157, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none", style: {
            background: "var(--pink)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-widest text-[var(--pink)] mb-1", children: "[ 今日挑戰 ]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl md:text-2xl text-neon-pink tracking-wider", children: "霓虹狂歡節" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mt-1", children: "挑戰專屬規則，通關獲得雙倍獎勵" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleStartChallenge, className: "cyber-btn cyber-btn-pink px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 16 }),
              "開始"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16, style: {
              color: "var(--yellow)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--yellow)]", children: "每日任務" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-muted)]", children: [
              dailyDoneCount,
              "/",
              dailyTasks.length
            ] })
          ] }),
          dailyTasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-[var(--text-muted)] py-8", children: "今日尚無任務，稍後再來看看" }),
          dailyTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { task, isDaily: true, onClaim: () => claimTask(task.id, true) }, task.id))
        ] }),
        false
      ] }),
      activeTab === "weekly" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 16, style: {
            color: "var(--yellow)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--yellow)]", children: "每週任務" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-muted)]", children: [
            weeklyDoneCount,
            "/",
            weeklyTasks.length
          ] })
        ] }),
        weeklyTasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-[var(--text-muted)] py-8", children: "本週尚無任務，稍後再來看看" }),
        weeklyTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { task, isDaily: false, onClaim: () => claimTask(task.id, false) }, task.id))
      ] }),
      activeTab === "checkin" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "rgba(255, 200, 0, 0.3)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-base tracking-wider text-[var(--yellow)]", children: [
                "連續簽到 ",
                checkInStreak,
                " 天"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-muted)] mt-1", children: "堅持每日簽到，累計里程碑獎勵" })
            ] }),
            todayChecked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[var(--green)] text-sm font-cyber", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }),
              "今日已簽"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: performCheckIn, className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider pulse-glow", style: {
              borderColor: "var(--yellow)",
              color: "var(--yellow)",
              boxShadow: "0 0 15px rgba(255, 200, 0, 0.4)",
              background: "rgba(255, 200, 0, 0.08)"
            }, children: "立即簽到" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1.5", children: checkInDays.map((day) => {
            const isRare = day.day === 7;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center p-2 rounded-sm", style: {
              border: `1px solid ${day.checked ? isRare ? "var(--purple)" : "var(--green)" : day.isToday ? "var(--yellow)" : "rgba(255, 255, 255, 0.1)"}`,
              backgroundColor: day.checked ? isRare ? "rgba(168, 85, 247, 0.1)" : "rgba(0, 255, 128, 0.08)" : day.isToday ? "rgba(255, 200, 0, 0.08)" : "rgba(0, 0, 0, 0.2)",
              boxShadow: day.checked ? `0 0 8px ${isRare ? "rgba(168, 85, 247, 0.3)" : "rgba(0, 255, 128, 0.25)"}` : day.isToday ? "0 0 8px rgba(255, 200, 0, 0.25)" : "none"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-cyber mb-1", style: {
                color: day.checked ? isRare ? "var(--purple)" : "var(--green)" : day.isToday ? "var(--yellow)" : "var(--text-muted)"
              }, children: [
                "第",
                day.day,
                "天"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 flex items-center justify-center", children: day.checked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 20, style: {
                color: isRare ? "var(--purple)" : "var(--green)",
                filter: `drop-shadow(0 0 4px ${isRare ? "var(--purple)" : "var(--green)"})`
              } }) : day.isToday ? /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 20, style: {
                color: "var(--yellow)"
              } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full", style: {
                border: "1px dashed var(--text-muted)"
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] mt-1 text-center truncate max-w-full px-0.5", style: {
                color: isRare ? "var(--purple)" : "var(--text-secondary)"
              }, title: day.reward, children: (day.reward || "").split(" ")[0] || "—" })
            ] }, day.day);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
          borderColor: "rgba(168, 85, 247, 0.25)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 16, style: {
              color: "var(--purple)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--purple)]", children: "連續簽到里程碑" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: streakMilestones.map((ms) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 rounded-sm", style: {
            border: `1px solid ${ms.reached ? "var(--green)" : "rgba(255,255,255,0.1)"}`,
            backgroundColor: ms.reached ? "rgba(0, 255, 128, 0.06)" : "rgba(0,0,0,0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", style: {
              color: ms.reached ? "var(--green)" : "var(--text-secondary)"
            }, children: ms.reward }),
            ms.reached ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, style: {
              color: "var(--green)"
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-muted)]", children: [
              checkInStreak,
              "/",
              ms.days,
              "天"
            ] })
          ] }, ms.days)) })
        ] })
      ] }),
      activeTab === "event" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        limitedModes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 relative overflow-hidden", style: {
          borderColor: limitedModes[0].color,
          boxShadow: `0 0 20px ${limitedModes[0].color}30`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none", style: {
            background: limitedModes[0].color
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 18, style: {
                color: limitedModes[0].color
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-widest", style: {
                color: limitedModes[0].color
              }, children: limitedModes[0].weekLabel })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl md:text-3xl font-bold tracking-wider mb-2", style: {
              color: limitedModes[0].color,
              textShadow: `0 0 10px ${limitedModes[0].color}`
            }, children: limitedModes[0].name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-4", children: limitedModes[0].description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-muted)] flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
                limitedModes[0].startDate,
                " ~ ",
                limitedModes[0].endDate
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleStartChallenge, className: "cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-1", style: {
                borderColor: limitedModes[0].color,
                color: limitedModes[0].color,
                boxShadow: `0 0 10px ${limitedModes[0].color}40`
              }, children: [
                "立即體驗",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 16, style: {
              color: "var(--cyan)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-sm tracking-wider text-[var(--cyan)]", children: "活動日曆" })
          ] }),
          activities.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-[var(--text-muted)] py-8", children: "近期沒有安排活動，敬請期待" }),
          activities.map((act) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex items-center gap-4", style: {
            borderColor: `${act.color}40`,
            borderLeftWidth: "4px",
            borderLeftColor: act.color
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-base tracking-wider", style: {
                  color: act.color
                }, children: act.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 font-cyber tracking-wider rounded-sm", style: {
                  color: act.status === "ongoing" ? "var(--green)" : act.status === "upcoming" ? "var(--yellow)" : "var(--text-muted)",
                  border: `1px solid ${act.status === "ongoing" ? "var(--green)" : act.status === "upcoming" ? "var(--yellow)" : "var(--text-muted)"}`,
                  backgroundColor: act.status === "ongoing" ? "rgba(0, 255, 128, 0.08)" : act.status === "upcoming" ? "rgba(255, 200, 0, 0.06)" : "rgba(255,255,255,0.04)"
                }, children: act.status === "ongoing" ? "進行中" : act.status === "upcoming" ? "即將開始" : "已結束" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mb-1", children: act.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-muted)] flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                act.startDate,
                " ~ ",
                act.endDate
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18, style: {
              color: "var(--text-muted)"
            } })
          ] }, act.id))
        ] })
      ] })
    ] })
  ] });
};
export {
  DailyChallengePage as default
};
