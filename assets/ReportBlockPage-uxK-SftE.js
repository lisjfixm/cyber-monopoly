import { u as useNavigate, m as useAudio, r as reactExports, j as jsxRuntimeExports, ay as Flag, $ as TriangleAlert } from "./index-ymfxQ6bv.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DL0hf68k.js";
import { g as getReportList, a as getBlockList, c as getStatusLabel, f as formatTime, u as unblockPlayer } from "./report-block-iWBcCh-Q.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { U as UserX } from "./user-x-5nUNi9e4.js";
import "./index-5Ybd9Wcr.js";
const ReportBlockPage = () => {
  const navigate = useNavigate();
  const {
    playSfx
  } = useAudio();
  const [reports, setReports] = reactExports.useState(getReportList());
  const [blocks, setBlocks] = reactExports.useState(getBlockList());
  const handleUnblock = (id) => {
    playSfx("click");
    unblockPlayer(id);
    setBlocks(getBlockList());
  };
  const handleBack = () => {
    playSfx("click");
    navigate("/");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBack, className: "cyber-btn p-2", style: {
          borderColor: "rgba(0, 255, 255, 0.3)",
          color: "var(--text-secondary)"
        }, title: "返回", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider pulse-glow", children: "舉報與黑名單" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] font-cyber tracking-wider mt-1", children: "REPORT · BLACKLIST" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "reports", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-2 mb-6 bg-[var(--bg-dark)] p-1 rounded", style: {
          border: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "reports", className: "font-cyber tracking-wider text-sm py-2 data-[state=active]:text-neon-cyan", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { size: 14, className: "inline mr-1.5" }),
            "舉報記錄"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "blocks", className: "font-cyber tracking-wider text-sm py-2 data-[state=active]:text-neon-pink", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 14, className: "inline mr-1.5" }),
            "黑名單管理"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "reports", className: "space-y-3 mt-4", children: reports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { size: 48, className: "mx-auto mb-4 opacity-30", style: {
            color: "var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--text-secondary)] font-cyber tracking-wider text-sm", children: "暫無舉報記錄" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-muted)] mt-2", children: "如遇不當行為，可在對局或匹配頁面提交舉報" })
        ] }) : reports.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 space-y-2", style: {
          borderColor: "rgba(0, 255, 255, 0.15)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: {
                color: "var(--yellow)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-wider text-[var(--text-primary)]", children: r.targetNickname })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber px-2 py-0.5 rounded", style: {
              color: r.status === "action_taken" ? "var(--green)" : r.status === "reviewed" ? "var(--cyan)" : "var(--yellow)",
              border: `1px solid ${r.status === "action_taken" ? "var(--green)" : r.status === "reviewed" ? "var(--cyan)" : "var(--yellow)"}`,
              backgroundColor: r.status === "action_taken" ? "rgba(0, 255, 128, 0.1)" : r.status === "reviewed" ? "rgba(0, 255, 255, 0.1)" : "rgba(250, 204, 21, 0.1)"
            }, children: getStatusLabel(r.status) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[var(--text-secondary)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-muted)]", children: "原因：" }),
            r.reason
          ] }),
          r.detail && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[var(--text-secondary)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-muted)]", children: "補充：" }),
            r.detail
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider", children: formatTime(r.createdAt) })
        ] }, r.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "blocks", className: "space-y-3 mt-4", children: blocks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 48, className: "mx-auto mb-4 opacity-30", style: {
            color: "var(--pink)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--text-secondary)] font-cyber tracking-wider text-sm", children: "黑名單為空" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-muted)] mt-2", children: "拉黑的玩家將無法與你匹配" })
        ] }) : blocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex items-center justify-between", style: {
          borderColor: "rgba(255, 107, 157, 0.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 16, style: {
                color: "var(--pink)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-wider text-[var(--text-primary)]", children: b.targetNickname })
            ] }),
            b.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-muted)]", children: "原因：" }),
              b.reason
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] font-cyber tracking-wider", children: formatTime(b.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleUnblock(b.id), className: "cyber-btn px-3 py-1.5 text-xs", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)"
          }, children: "移除" })
        ] }, b.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-[var(--text-muted)] text-xs font-cyber tracking-wider", children: "v1.0 · CYBER MONOPOLY" })
  ] });
};
export {
  ReportBlockPage as default
};
