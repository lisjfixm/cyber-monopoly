import { d as createLucideIcon, u as useNavigate, r as reactExports, ct as getMailState, cu as getUnreadCount, cv as markAsRead, cw as claimAttachment, bY as toast, cx as deleteMail, j as jsxRuntimeExports, cy as Mail, bf as Gift, aJ as Coins, t as Crown, aI as Trophy, bo as Package, at as Check, br as Trash2 } from "./index-Clt-7orM.js";
import { P as PullToRefresh } from "./PullToRefresh-DPqbt2uS.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
const __iconNode = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = createLucideIcon("inbox", __iconNode);
const TAB_LABELS = {
  system: "系統郵件",
  friend: "好友郵件",
  guild: "戰隊郵件"
};
function formatDate(iso) {
  const d = new Date(iso);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - d.getTime();
  const dayMs = 864e5;
  if (diff < dayMs) return "今天";
  if (diff < dayMs * 2) return "昨天";
  if (diff < dayMs * 7) return `${Math.floor(diff / dayMs)} 天前`;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}
const MailPage = () => {
  const navigate = useNavigate();
  const [mails, setMails] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("system");
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const refresh = reactExports.useCallback(() => {
    const state = getMailState();
    setMails(state.mails);
  }, []);
  reactExports.useEffect(() => {
    refresh();
  }, [refresh]);
  const unreadCounts = reactExports.useMemo(() => ({
    system: getUnreadCount("system"),
    friend: getUnreadCount("friend"),
    guild: getUnreadCount("guild")
  }), [mails]);
  const filteredMails = reactExports.useMemo(() => {
    return mails.filter((m) => m.type === activeTab).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mails, activeTab]);
  const handleMailClick = reactExports.useCallback((mail) => {
    if (!mail.isRead) {
      const next = markAsRead(mail.id);
      setMails(next.mails);
    }
    setExpandedId((prev) => prev === mail.id ? null : mail.id);
  }, []);
  const handleClaim = reactExports.useCallback((mail) => {
    if (mail.attachmentClaimed || !mail.attachment) return;
    const next = claimAttachment(mail.id);
    setMails(next.mails);
    const att = mail.attachment;
    if (att.type === "coins") {
      toast.success(`領取成功！獲得 ${att.amount} 金幣`);
    } else if (att.type === "item") {
      toast.success(`領取成功！獲得 ${att.itemName} x${att.amount ?? 1}`);
    } else if (att.type === "title") {
      toast.success(`領取成功！獲得頭像框：${att.itemName}`);
    } else if (att.type === "achievement") {
      toast.success(`領取成功！解鎖成就：${att.itemName}`);
    }
  }, []);
  const handleDelete = reactExports.useCallback((mailId) => {
    const next = deleteMail(mailId);
    setMails(next.mails);
    if (expandedId === mailId) setExpandedId(null);
    toast.success("郵件已刪除");
  }, [expandedId]);
  const handleBack = reactExports.useCallback(() => {
    navigate("/");
  }, [navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-4 border-b", style: {
      borderColor: "var(--border-neon)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "flex items-center gap-2 text-sm transition-colors hover:opacity-80", style: {
        color: "var(--cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "返回" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl md:text-2xl font-bold tracking-widest flex items-center gap-2", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px currentColor, 0 0 20px currentColor"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 22 }),
        "郵件中心"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b", style: {
      borderColor: "var(--border-neon)"
    }, children: Object.keys(TAB_LABELS).map((tab) => {
      const active = activeTab === tab;
      const count = unreadCounts[tab];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab), className: `flex-1 py-3 text-sm md:text-base font-medium tracking-wider transition-all relative ${active ? "" : "opacity-60 hover:opacity-100"}`, style: {
        color: active ? "var(--pink)" : "var(--text-secondary)",
        borderBottom: active ? "2px solid var(--pink)" : "2px solid transparent",
        textShadow: active ? "0 0 8px currentColor" : "none"
      }, children: [
        TAB_LABELS[tab],
        count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full", style: {
          background: "var(--red)",
          color: "#fff",
          boxShadow: "0 0 8px var(--red)"
        }, children: count > 99 ? "99+" : count })
      ] }, tab);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PullToRefresh, { onRefresh: async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 800);
      });
      refresh();
    }, className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-3 md:px-6 py-4 scroll-container h-full", children: filteredMails.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-4", style: {
      color: "var(--text-secondary)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { size: 64, style: {
        opacity: 0.4
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg tracking-wider", children: "暫無郵件" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredMails.map((mail) => {
      const isExpanded = expandedId === mail.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg overflow-hidden transition-all", style: {
        border: `1px solid ${mail.isRead ? "var(--border-neon)" : "var(--cyan)"}`,
        background: mail.isRead ? "rgba(0, 255, 255, 0.02)" : "rgba(0, 255, 255, 0.06)",
        boxShadow: mail.isRead ? "none" : "0 0 15px rgba(0, 255, 255, 0.15), inset 0 0 10px rgba(0, 255, 255, 0.05)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleMailClick(mail), className: "w-full px-4 py-3 flex items-center gap-3 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 flex-shrink-0 flex justify-center", children: !mail.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full", style: {
            background: "var(--cyan)",
            boxShadow: "0 0 6px var(--cyan)"
          } }) }),
          mail.hasAttachment && /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 16, className: "flex-shrink-0", style: {
            color: mail.attachmentClaimed ? "var(--text-secondary)" : "hsl(45, 100%, 60%)",
            filter: mail.attachmentClaimed ? "none" : "drop-shadow(0 0 4px hsl(45, 100%, 60%))",
            opacity: mail.attachmentClaimed ? 0.5 : 1
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `truncate text-sm md:text-base ${mail.isRead ? "font-normal" : "font-bold"}`, style: {
                color: mail.isRead ? "var(--text-primary)" : "var(--cyan)"
              }, children: mail.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-xs", style: {
                color: "var(--text-secondary)"
              }, children: formatDate(mail.createdAt) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-1 truncate", style: {
              color: "var(--text-secondary)"
            }, children: [
              "來自：",
              mail.from
            ] })
          ] })
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 border-t", style: {
          borderColor: "var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4 text-sm leading-relaxed whitespace-pre-wrap", style: {
            color: "var(--text-primary)"
          }, children: mail.content }),
          mail.hasAttachment && mail.attachment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-4 rounded-lg flex items-center justify-between", style: {
            background: "rgba(255, 215, 0, 0.06)",
            border: "1px solid rgba(255, 215, 0, 0.3)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center", style: {
                background: mail.attachment.type === "coins" ? "rgba(255, 215, 0, 0.15)" : mail.attachment.type === "item" ? "rgba(255, 0, 255, 0.15)" : mail.attachment.type === "title" ? "rgba(168, 85, 247, 0.15)" : "rgba(0, 255, 128, 0.15)",
                color: mail.attachment.type === "coins" ? "hsl(45, 100%, 60%)" : mail.attachment.type === "item" ? "var(--pink)" : mail.attachment.type === "title" ? "var(--purple, #a855f7)" : "var(--green)"
              }, children: mail.attachment.type === "coins" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 20 }) : mail.attachment.type === "title" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20 }) : mail.attachment.type === "achievement" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 20 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
                  color: "hsl(45, 100%, 70%)"
                }, children: mail.attachment.type === "coins" ? `${mail.attachment.amount} 金幣` : mail.attachment.type === "title" ? `${mail.attachment.itemName}` : mail.attachment.type === "achievement" ? `${mail.attachment.itemName}` : `${mail.attachment.itemName} x${mail.attachment.amount ?? 1}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center gap-1", style: {
                  color: "var(--text-secondary)"
                }, children: [
                  mail.attachment.type === "coins" ? "金幣獎勵" : mail.attachment.type === "title" ? "專屬頭像框" : mail.attachment.type === "achievement" ? "成就徽章" : "附件道具",
                  mail.attachment.rarity && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider", style: {
                    background: mail.attachment.rarity === "legendary" ? "rgba(255, 215, 0, 0.2)" : mail.attachment.rarity === "epic" ? "rgba(168, 85, 247, 0.2)" : mail.attachment.rarity === "rare" ? "rgba(0, 200, 255, 0.2)" : "rgba(255,255,255,0.1)",
                    color: mail.attachment.rarity === "legendary" ? "#ffd700" : mail.attachment.rarity === "epic" ? "var(--purple, #a855f7)" : mail.attachment.rarity === "rare" ? "var(--cyan)" : "var(--text-secondary)",
                    border: `1px solid ${mail.attachment.rarity === "legendary" ? "#ffd700" : mail.attachment.rarity === "epic" ? "var(--purple, #a855f7)" : mail.attachment.rarity === "rare" ? "var(--cyan)" : "rgba(255,255,255,0.1)"}`
                  }, children: mail.attachment.rarity === "legendary" ? "傳說" : mail.attachment.rarity === "epic" ? "史詩" : mail.attachment.rarity === "rare" ? "稀有" : "普通" })
                ] })
              ] })
            ] }),
            mail.attachmentClaimed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded", style: {
              color: "var(--green)",
              border: "1px solid var(--green)",
              boxShadow: "0 0 8px rgba(0, 255, 128, 0.3)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
              "已領取"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleClaim(mail), className: "px-4 py-1.5 text-sm font-bold rounded tracking-wider transition-all hover:scale-105 active:scale-95", style: {
              color: "hsl(45, 100%, 20%)",
              background: "linear-gradient(135deg, hsl(45, 100%, 60%), hsl(35, 100%, 55%))",
              boxShadow: "0 0 10px hsl(45, 100%, 60%), 0 0 20px rgba(255, 215, 0, 0.4)"
            }, children: "領取" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleDelete(mail.id), className: "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-all hover:scale-105", style: {
            color: "var(--red)",
            border: "1px solid var(--red)",
            background: "rgba(255, 0, 0, 0.05)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
            "刪除"
          ] }) })
        ] })
      ] }, mail.id);
    }) }) }) })
  ] });
};
export {
  MailPage as default
};
