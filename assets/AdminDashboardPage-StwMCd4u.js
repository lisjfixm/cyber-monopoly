import { u as useNavigate, cc as useTranslation, r as reactExports, j as jsxRuntimeExports, L as Lock, $ as TriangleAlert, bE as ChevronLeft, bH as Shield, U as Users, bt as Gamepad2, aM as MapPin, aI as Trophy, cd as AntiCheatMonitor } from "./index-Clt-7orM.js";
const STORAGE_KEY = "cyber_monopoly_admin_logged_in";
const ADMIN_PASSWORD = "admin123";
const HOT_PROPERTIES = [{
  name: "高新園",
  visits: 15420
}, {
  name: "重工區",
  visits: 14280
}, {
  name: "企業樓",
  visits: 13150
}, {
  name: "新城市",
  visits: 12080
}, {
  name: "總部",
  visits: 11560
}, {
  name: "主塔",
  visits: 10890
}, {
  name: "富豪區",
  visits: 9720
}, {
  name: "科技城",
  visits: 8650
}, {
  name: "金融街",
  visits: 7580
}, {
  name: "星光道",
  visits: 6420
}];
const PROFESSION_STATS = [{
  name: "企業家",
  winRate: 58.2
}, {
  name: "駭客",
  winRate: 55.6
}, {
  name: "投資客",
  winRate: 53.8
}, {
  name: "工程師",
  winRate: 51.2
}, {
  name: "銀行家",
  winRate: 49.7
}, {
  name: "賭神",
  winRate: 48.5
}, {
  name: "律師",
  winRate: 47.3
}, {
  name: "醫生",
  winRate: 45.9
}, {
  name: "間諜",
  winRate: 44.2
}, {
  name: "藝術家",
  winRate: 42.8
}, {
  name: "科學家",
  winRate: 41.5
}, {
  name: "流浪漢",
  winRate: 38.9
}];
const LEVEL_COLORS = {
  warning: "var(--yellow)",
  severe: "var(--orange)",
  critical: "var(--red)"
};
const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [loggedIn, setLoggedIn] = reactExports.useState(false);
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [onlineCount, setOnlineCount] = reactExports.useState(1337);
  const [todayGames, setTodayGames] = reactExports.useState(3847);
  const [antiCheatLogs, setAntiCheatLogs] = reactExports.useState([]);
  reactExports.useEffect(() => {
    try {
      const flag = localStorage.getItem(STORAGE_KEY);
      if (flag === "true") {
        setLoggedIn(true);
      }
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (!loggedIn) return;
    const timer = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = Math.max(1200, Math.min(1500, prev + delta));
        return next;
      });
      setTodayGames((prev) => {
        const delta = Math.floor(Math.random() * 5);
        return prev + delta;
      });
    }, 5e3);
    return () => clearInterval(timer);
  }, [loggedIn]);
  reactExports.useEffect(() => {
    if (!loggedIn) return;
    const monitor = AntiCheatMonitor.getInstance();
    setAntiCheatLogs(monitor.getEvents());
    const timer = setInterval(() => {
      setAntiCheatLogs(monitor.getEvents());
    }, 3e3);
    return () => clearInterval(timer);
  }, [loggedIn]);
  const handleLogin = reactExports.useCallback(() => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setError("");
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
      }
    } else {
      setError(t("admin.wrongPassword"));
    }
  }, [password, t]);
  const maxVisits = reactExports.useMemo(() => Math.max(...HOT_PROPERTIES.map((p) => p.visits)), []);
  if (!loggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex items-center justify-center px-4 scanlines bg-[var(--bg-deep)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-md p-6 md:p-8 relative overflow-hidden", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 30px rgba(255, 0, 0, 0.2), inset 0 0 20px rgba(255, 0, 0, 0.05)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--red)] to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center", style: {
          background: "rgba(255, 0, 0, 0.1)",
          border: "2px solid var(--red)",
          boxShadow: "0 0 20px rgba(255, 0, 0, 0.4)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 28, style: {
          color: "var(--red)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl tracking-wider", style: {
          color: "var(--red)",
          textShadow: "0 0 10px rgba(255,0,0,0.5)"
        }, children: t("admin.title") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider mb-2", style: {
            color: "var(--text-secondary)"
          }, children: t("admin.password") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), onKeyDown: (e) => {
            if (e.key === "Enter") handleLogin();
          }, placeholder: t("admin.passwordPlaceholder"), className: "cyber-input w-full", style: {
            borderColor: error ? "var(--red)" : "var(--border-neon)",
            color: "var(--text-primary)"
          }, autoFocus: true }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs flex items-center gap-1", style: {
            color: "var(--red)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 12 }),
            error
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleLogin, className: "cyber-btn w-full py-3 font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          boxShadow: "0 0 10px rgba(255, 0, 0, 0.3)"
        }, children: t("admin.login") })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full scanlines bg-[var(--bg-deep)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b", style: {
      borderColor: "var(--border-neon)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/"), className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-cyber text-xl md:text-2xl tracking-wider", style: {
        color: "var(--red)",
        textShadow: "0 0 8px rgba(255,0,0,0.5)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 20, className: "inline mr-2" }),
        t("admin.title")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 relative overflow-hidden", style: {
          borderColor: "var(--cyan)",
          boxShadow: "0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.05)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 20, style: {
              color: "var(--cyan)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-base tracking-wider", style: {
              color: "var(--cyan)"
            }, children: t("admin.onlineUsers") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-4xl md:text-5xl tracking-widest pulse-glow", style: {
            color: "var(--cyan)",
            textShadow: "0 0 15px var(--cyan), 0 0 30px var(--cyan)"
          }, children: onlineCount.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full animate-pulse", style: {
            background: "var(--green)",
            boxShadow: "0 0 8px var(--green)"
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 relative overflow-hidden", style: {
          borderColor: "var(--pink)",
          boxShadow: "0 0 15px rgba(255, 0, 255, 0.2), inset 0 0 10px rgba(255, 0, 255, 0.05)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { size: 20, style: {
              color: "var(--pink)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-base tracking-wider", style: {
              color: "var(--pink)"
            }, children: t("admin.todayGames") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-4xl md:text-5xl tracking-widest", style: {
            color: "var(--pink)",
            textShadow: "0 0 15px var(--pink), 0 0 30px var(--pink)"
          }, children: todayGames.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5", style: {
          borderColor: "var(--yellow)",
          boxShadow: "0 0 15px rgba(255, 200, 0, 0.15), inset 0 0 10px rgba(255, 200, 0, 0.03)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 20, style: {
              color: "var(--yellow)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-base tracking-wider", style: {
              color: "var(--yellow)"
            }, children: t("admin.hotProperties") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: HOT_PROPERTIES.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-xs w-5 text-right", style: {
              color: i < 3 ? "var(--yellow)" : "var(--text-muted)"
            }, children: [
              "#",
              i + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs w-20 truncate", style: {
              color: "var(--text-primary)"
            }, children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 rounded-full overflow-hidden", style: {
              background: "var(--bg-mid)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
              width: `${p.visits / maxVisits * 100}%`,
              background: `linear-gradient(90deg, var(--yellow), var(--orange))`,
              boxShadow: "0 0 6px var(--yellow)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber w-12 text-right", style: {
              color: "var(--text-secondary)"
            }, children: p.visits.toLocaleString() })
          ] }, p.name)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5", style: {
          borderColor: "var(--green)",
          boxShadow: "0 0 15px rgba(0, 255, 128, 0.15), inset 0 0 10px rgba(0, 255, 128, 0.03)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 20, style: {
              color: "var(--green)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-base tracking-wider", style: {
              color: "var(--green)"
            }, children: t("admin.professionStats") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: PROFESSION_STATS.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-xs w-5 text-right", style: {
              color: i < 3 ? "var(--green)" : "var(--text-muted)"
            }, children: [
              "#",
              i + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs w-20 truncate", style: {
              color: "var(--text-primary)"
            }, children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 rounded-full overflow-hidden", style: {
              background: "var(--bg-mid)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
              width: `${p.winRate}%`,
              background: `linear-gradient(90deg, var(--green), var(--cyan))`,
              boxShadow: "0 0 6px var(--green)"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber w-12 text-right", style: {
              color: "var(--text-secondary)"
            }, children: [
              p.winRate.toFixed(1),
              "%"
            ] })
          ] }, p.name)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5", style: {
        borderColor: "var(--red)",
        boxShadow: "0 0 15px rgba(255, 0, 0, 0.15), inset 0 0 10px rgba(255, 0, 0, 0.03)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 20, style: {
            color: "var(--red)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-base tracking-wider", style: {
            color: "var(--red)"
          }, children: t("admin.antiCheatLogs") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber px-2 py-0.5 rounded", style: {
            background: "rgba(255, 0, 0, 0.1)",
            color: "var(--red)",
            border: "1px solid rgba(255, 0, 0, 0.3)"
          }, children: antiCheatLogs.length })
        ] }),
        antiCheatLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm", style: {
          color: "var(--text-muted)"
        }, children: t("admin.noRecords") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: {
            borderBottom: "1px solid var(--border)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: t("admin.time") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: t("admin.level") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: t("admin.type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: t("admin.details") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: antiCheatLogs.slice(0, 20).map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: {
            borderBottom: "1px solid rgba(255,255,255,0.05)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", style: {
              color: "var(--text-secondary)"
            }, children: new Date(log.timestamp).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2 py-0.5 rounded text-[10px] font-cyber tracking-wider", style: {
              backgroundColor: `${LEVEL_COLORS[log.level]}20`,
              color: LEVEL_COLORS[log.level],
              border: `1px solid ${LEVEL_COLORS[log.level]}40`
            }, children: t(`admin.${log.level}`) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", style: {
              color: "var(--text-primary)"
            }, children: log.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", style: {
              color: "var(--text-secondary)"
            }, children: log.details })
          ] }, log.id)) })
        ] }) })
      ] })
    ] })
  ] });
};
export {
  AdminDashboardPage as default
};
