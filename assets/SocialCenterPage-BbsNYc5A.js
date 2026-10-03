import { u as useNavigate, a as usePlayerIdentity, r as reactExports, j as jsxRuntimeExports, U as Users, bH as Shield, bs as Eye, cq as MessageSquare, aI as Trophy, cy as Mail, bZ as Map, c_ as GlobalChatPanel } from "./index-Clt-7orM.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { U as UserPlus } from "./user-plus-D8x3bHlD.js";
const SocialCenterPage = () => {
  const navigate = useNavigate();
  const {
    visitorId,
    nickname
  } = usePlayerIdentity();
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const items = [{
    icon: Users,
    title: "好友中心",
    desc: "管理好友、查看上線狀態、發起私聊",
    color: "var(--cyan)",
    onClick: () => navigate("/friends")
  }, {
    icon: Shield,
    title: "戰隊公會",
    desc: "加入或創建戰隊，與隊友並肩作戰",
    color: "var(--pink)",
    onClick: () => navigate("/guild")
  }, {
    icon: Eye,
    title: "觀戰大廳",
    desc: "觀看頂尖對局，導師實時講解",
    color: "var(--green)",
    onClick: () => navigate("/spectate")
  }, {
    icon: MessageSquare,
    title: "全域聊天",
    desc: "與全城玩家交流，認識更多小夥伴",
    color: "var(--green)",
    onClick: () => setChatOpen(true)
  }, {
    icon: Trophy,
    title: "排行榜",
    desc: "查看個人、戰隊各項排名",
    color: "var(--yellow, #ffd700)",
    onClick: () => navigate("/leaderboard")
  }, {
    icon: UserPlus,
    title: "尋找玩家",
    desc: "搜尋並添加新的小夥伴",
    color: "var(--purple, #a855f7)",
    onClick: () => navigate("/friends")
  }, {
    icon: Mail,
    title: "遊戲郵箱",
    desc: "系統通知、獎勵領取、好友與戰隊郵件",
    color: "var(--cyan)",
    onClick: () => navigate("/mail")
  }, {
    icon: Map,
    title: "社區地圖",
    desc: "玩家創意地圖分享、評分與收藏",
    color: "var(--pink)",
    onClick: () => navigate("/community-maps")
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-3xl flex items-center gap-3 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate(-1), className: "cyber-btn p-2", style: {
        borderColor: "var(--cyan)",
        color: "var(--cyan)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-bold tracking-wider", style: {
        color: "var(--cyan)",
        textShadow: "0 0 10px var(--cyan), 0 0 20px var(--cyan)"
      }, children: "社交中心" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4", children: items.map((item) => {
      const Icon = item.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: item.onClick, className: "cyber-card p-5 text-left group hover:scale-[1.02] transition-transform", style: {
        borderColor: item.color
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center", style: {
          backgroundColor: `${item.color}20`,
          border: `1px solid ${item.color}`,
          boxShadow: `0 0 12px ${item.color}40`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 24, style: {
          color: item.color
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold mb-1 tracking-wide group-hover:translate-x-1 transition-transform", style: {
            color: item.color,
            textShadow: `0 0 8px ${item.color}60`
          }, children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: {
            color: "var(--text-secondary)"
          }, children: item.desc })
        ] })
      ] }) }, item.title);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-3xl mt-8 cyber-card p-5", style: {
      borderColor: "var(--border-neon)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-3 tracking-wide", style: {
        color: "var(--text-primary)"
      }, children: "快速操作" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setChatOpen(true), className: "cyber-btn cyber-btn-sm px-4 py-2 text-xs", style: {
          borderColor: "var(--green)",
          color: "var(--green)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14, className: "inline mr-1.5" }),
          "打開聊天"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/friends"), className: "cyber-btn cyber-btn-sm px-4 py-2 text-xs", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "inline mr-1.5" }),
          "好友列表"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate("/guild"), className: "cyber-btn cyber-btn-sm px-4 py-2 text-xs", style: {
          borderColor: "var(--pink)",
          color: "var(--pink)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 14, className: "inline mr-1.5" }),
          "我的戰隊"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate("/report-block"), className: "cyber-btn cyber-btn-sm px-4 py-2 text-xs", style: {
          borderColor: "var(--red)",
          color: "var(--red)"
        }, children: "舉報與封鎖" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalChatPanel, { open: chatOpen, onClose: () => setChatOpen(false), currentUserId: visitorId || "local_user", currentUserName: nickname || "匿名玩家", anchorSide: "right" })
  ] });
};
export {
  SocialCenterPage as default
};
