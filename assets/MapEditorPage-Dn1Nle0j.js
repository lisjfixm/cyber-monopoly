import { d as createLucideIcon, j as jsxRuntimeExports, bx as Dices, bL as ArrowRightLeft, b9 as Sparkles, bM as ShieldAlert, bN as Car, bt as Gamepad2, Z as Zap, aH as CircleQuestionMark, L as Lock, ay as Flag, bB as Building2, bO as SETS, bD as Layers, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, az as DialogDescription, aA as DialogFooter, at as Check, s as Copy, $ as TriangleAlert, bP as MAX_CUSTOM_MAPS, X, u as useNavigate, r as reactExports, bQ as CELL_COUNT, bR as validateMap, bS as encodeMapToBase64, bT as decodeMapFromBase64, bE as ChevronLeft, bU as LayoutGrid, bV as Save, bq as Download, bW as Upload, bK as Play, bX as Share2 } from "./index-ymfxQ6bv.js";
import { p as publishMap } from "./communityMaps-BlnLIw6j.js";
import "./reviewStorage-B6nD4ZW8.js";
const __iconNode$4 = [
  [
    "path",
    {
      d: "M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21",
      key: "g5wo59"
    }
  ],
  ["path", { d: "m5.082 11.09 8.828 8.828", key: "1wx5vj" }]
];
const Eraser = createLucideIcon("eraser", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
      key: "edeuup"
    }
  ]
];
const MousePointer2 = createLucideIcon("mouse-pointer-2", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "m14.622 17.897-10.68-2.913", key: "vj2p1u" }],
  [
    "path",
    {
      d: "M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z",
      key: "18tc5c"
    }
  ],
  [
    "path",
    {
      d: "M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15",
      key: "ytzfxy"
    }
  ]
];
const Paintbrush = createLucideIcon("paintbrush", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m15 14 5-5-5-5", key: "12vg1m" }],
  ["path", { d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13", key: "6uklza" }]
];
const Redo2 = createLucideIcon("redo-2", __iconNode$1);
const __iconNode = [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
];
const Undo2 = createLucideIcon("undo-2", __iconNode);
function getCellPosition(id) {
  if (id >= 0 && id <= 9) return {
    row: 9,
    col: id
  };
  if (id >= 10 && id <= 18) return {
    row: 18 - id,
    col: 9
  };
  if (id >= 19 && id <= 27) return {
    row: 0,
    col: 27 - id
  };
  return {
    row: id - 27,
    col: 0
  };
}
const cellTypeIcons = {
  start: Flag,
  property: () => null,
  detention: Lock,
  fate: CircleQuestionMark,
  chance: Zap,
  minigame: Gamepad2,
  parking: Car,
  jail: ShieldAlert,
  event: Sparkles,
  teleport: ArrowRightLeft
};
const cellTypeColors = {
  start: {
    bg: "hsla(140, 100%, 55%, 0.2)",
    border: "hsla(140, 100%, 55%, 0.6)",
    text: "hsl(140, 100%, 65%)"
  },
  property: {
    bg: "hsl(240, 18%, 12%)",
    border: "hsla(180, 100%, 55%, 0.3)",
    text: "hsl(180, 15%, 92%)"
  },
  detention: {
    bg: "hsla(270, 80%, 65%, 0.2)",
    border: "hsla(270, 80%, 65%, 0.6)",
    text: "hsl(270, 80%, 75%)"
  },
  fate: {
    bg: "hsla(320, 100%, 60%, 0.15)",
    border: "hsla(320, 100%, 60%, 0.5)",
    text: "hsl(320, 100%, 70%)"
  },
  chance: {
    bg: "hsla(250, 90%, 60%, 0.15)",
    border: "hsla(250, 90%, 60%, 0.5)",
    text: "hsl(250, 90%, 70%)"
  },
  minigame: {
    bg: "hsla(280, 100%, 65%, 0.18)",
    border: "hsla(280, 100%, 65%, 0.6)",
    text: "hsl(280, 100%, 75%)"
  },
  parking: {
    bg: "hsla(200, 70%, 55%, 0.18)",
    border: "hsla(200, 70%, 55%, 0.5)",
    text: "hsl(200, 70%, 70%)"
  },
  jail: {
    bg: "hsla(15, 80%, 50%, 0.2)",
    border: "hsla(15, 80%, 50%, 0.6)",
    text: "hsl(15, 80%, 65%)"
  },
  event: {
    bg: "hsla(50, 100%, 55%, 0.15)",
    border: "hsla(50, 100%, 55%, 0.5)",
    text: "hsl(50, 100%, 70%)"
  },
  teleport: {
    bg: "hsla(160, 100%, 55%, 0.18)",
    border: "hsla(160, 100%, 55%, 0.6)",
    text: "hsl(160, 100%, 70%)"
  }
};
const EditorBoard = ({
  cells,
  selectedId,
  onCellClick,
  onCellContextMenu
}) => {
  const renderCell = (cell) => {
    const {
      row,
      col
    } = getCellPosition(cell.id);
    const colors = cellTypeColors[cell.type];
    const Icon = cellTypeIcons[cell.type];
    const isSelected = selectedId === cell.id;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onCellClick(cell.id), onContextMenu: (e) => {
      e.preventDefault();
      onCellContextMenu?.(cell.id);
    }, className: "relative flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-125 select-none", style: {
      gridRow: row + 1,
      gridColumn: col + 1,
      background: colors.bg,
      border: isSelected ? "2px solid var(--cyan)" : `1px solid ${colors.border}`,
      boxShadow: isSelected ? "0 0 12px var(--cyan), 0 0 24px var(--cyan), inset 0 0 8px var(--cyan)" : cell.type === "property" ? `inset 0 0 4px ${cell.color}30` : void 0
    }, children: [
      cell.type === "property" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-1", style: {
        backgroundColor: cell.color,
        boxShadow: `0 0 4px ${cell.color}`
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0.5 left-1 text-[8px] font-cyber opacity-60", style: {
        color: colors.text
      }, children: cell.id }),
      cell.type !== "property" && Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        color: colors.text
      }, className: "mb-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] md:text-[10px] font-cyber tracking-tight text-center leading-tight px-0.5 max-w-full truncate", style: {
        color: colors.text
      }, title: cell.name, children: cell.name || "—" }),
      cell.type === "property" && cell.basePrice > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] md:text-[9px] font-cyber mt-0.5 opacity-80", style: {
        color: cell.color
      }, children: [
        "¥",
        cell.basePrice
      ] })
    ] }, cell.id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full aspect-square max-w-[min(70vh,520px)] mx-auto p-3 md:p-4", style: {
    background: "linear-gradient(135deg, var(--board-frame-from), var(--board-frame-to))",
    border: "1px solid var(--board-frame-border)",
    boxShadow: "0 0 30px var(--board-frame-glow), inset 0 0 20px var(--board-frame-inner-shadow)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full grid gap-0.5", style: {
    gridTemplateColumns: "repeat(10, 1fr)",
    gridTemplateRows: "repeat(10, 1fr)"
  }, children: [
    cells.map((cell) => renderCell(cell)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", style: {
      gridRow: "2 / span 8",
      gridColumn: "2 / span 8",
      background: "linear-gradient(135deg, var(--board-center-from), var(--board-center-to))",
      border: "1px solid var(--board-center-border)",
      boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dices, { className: "mb-2 text-neon-cyan", size: 32 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg md:text-xl text-neon-cyan tracking-widest", children: "地圖編輯器" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1", children: "36 格 · 自訂你的賽博世界" })
    ] })
  ] }) });
};
const cellTypes = [{
  type: "start",
  label: "起點",
  icon: Flag,
  color: "var(--green)"
}, {
  type: "property",
  label: "地產",
  icon: Building2,
  color: "var(--cyan)"
}, {
  type: "detention",
  label: "禁閉",
  icon: Lock,
  color: "var(--purple)"
}, {
  type: "fate",
  label: "命運",
  icon: CircleQuestionMark,
  color: "var(--pink)"
}, {
  type: "chance",
  label: "機會",
  icon: Zap,
  color: "hsl(250, 90%, 70%)"
}, {
  type: "minigame",
  label: "遊戲",
  icon: Gamepad2,
  color: "hsl(280, 100%, 75%)"
}, {
  type: "parking",
  label: "停車場",
  icon: Car,
  color: "hsl(200, 70%, 60%)"
}, {
  type: "jail",
  label: "監獄",
  icon: ShieldAlert,
  color: "hsl(15, 80%, 55%)"
}, {
  type: "event",
  label: "奇遇",
  icon: Sparkles,
  color: "hsl(50, 100%, 60%)"
}, {
  type: "teleport",
  label: "傳送門",
  icon: ArrowRightLeft,
  color: "hsl(160, 100%, 60%)"
}];
const ToolPanel = ({
  tool,
  onToolChange,
  selectedType,
  onTypeChange
}) => {
  const tools = [{
    key: "select",
    label: "選擇",
    icon: MousePointer2
  }, {
    key: "paint",
    label: "畫筆",
    icon: Paintbrush
  }, {
    key: "erase",
    label: "清除",
    icon: Eraser
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 md:p-4 h-full flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider text-neon-cyan mb-2", children: "工具" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: tools.map((t) => {
        const Icon = t.icon;
        const active = tool === t.key;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onToolChange(t.key), className: "flex flex-col items-center gap-1 py-2 px-1 text-xs font-cyber tracking-wider transition-all", style: {
          border: `1px solid ${active ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)"}`,
          background: active ? "rgba(0, 255, 255, 0.12)" : "transparent",
          color: active ? "var(--cyan)" : "var(--text-secondary)",
          boxShadow: active ? "0 0 10px rgba(0, 255, 255, 0.3)" : void 0
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
          t.label
        ] }, t.key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider text-neon-cyan mb-2", children: "格子類型" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: cellTypes.map((ct) => {
        const Icon = ct.icon;
        const active = selectedType === ct.type;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onTypeChange(ct.type), className: "w-full flex items-center gap-2 px-2 py-1.5 text-xs font-cyber tracking-wide transition-all", style: {
          border: `1px solid ${active ? ct.color : "rgba(255, 255, 255, 0.08)"}`,
          background: active ? `${ct.color}15` : "transparent",
          color: active ? ct.color : "var(--text-secondary)",
          boxShadow: active ? `0 0 8px ${ct.color}40` : void 0
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ct.label })
        ] }, ct.type);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto text-[10px] text-[var(--text-muted)] font-cyber leading-relaxed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "提示 左鍵：應用工具" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "提示 右鍵：快速清除" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "提示 選擇模式下可編輯屬性" })
    ] })
  ] });
};
const PropertyPanel = ({
  cell,
  onUpdate,
  onApplyToSameColor,
  allCells
}) => {
  if (!cell) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-3 md:p-4 h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-[var(--text-secondary)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber tracking-wider text-sm mb-1", children: "未選中格子" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "點擊棋盤上的格子以編輯屬性" })
    ] }) });
  }
  const isProperty = cell.type === "property";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 md:p-4 h-full flex flex-col gap-3 overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-sm tracking-wider text-neon-pink", children: "屬性面板" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber text-[var(--text-secondary)]", children: [
        "格子 #",
        cell.id
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: [
      "類型：",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-neon-cyan ml-1", children: [
        cell.type === "start" && "起點",
        cell.type === "property" && "地產",
        cell.type === "detention" && "禁閉區",
        cell.type === "fate" && "命運區",
        cell.type === "chance" && "機會區",
        cell.type === "minigame" && "遊戲區",
        cell.type === "parking" && "停車場",
        cell.type === "jail" && "監獄/免費停車",
        cell.type === "event" && "奇遇事件",
        cell.type === "teleport" && "傳送門"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "名稱" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: cell.name, onChange: (e) => onUpdate({
        name: e.target.value
      }), className: "cyber-input text-sm py-1.5", placeholder: "輸入格子名稱" })
    ] }),
    isProperty && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "地價" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: cell.basePrice, onChange: (e) => onUpdate({
          basePrice: Math.max(0, parseInt(e.target.value, 10) || 0)
        }), className: "cyber-input text-sm py-1.5", min: 0, step: 100 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "租金" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: cell.rent ?? Math.round(cell.basePrice * 0.25), onChange: (e) => onUpdate({
          rent: Math.max(0, parseInt(e.target.value, 10) || 0)
        }), className: "cyber-input text-sm py-1.5", min: 0, step: 50 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "套裝 ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: cell.setId || "", onChange: (e) => onUpdate({
          setId: e.target.value || void 0
        }), className: "cyber-input text-sm py-1.5", placeholder: "如 set1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "顏色" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: cell.color || "#00e5ff", onChange: (e) => onUpdate({
            color: e.target.value
          }), className: "w-10 h-9 cursor-pointer rounded-sm border border-[rgba(0_255_255_0.3)] bg-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: cell.color, onChange: (e) => onUpdate({
            color: e.target.value
          }), className: "cyber-input text-sm py-1.5 flex-1 font-mono" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "預設套裝顏色" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-1.5", children: SETS.map((set) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onUpdate({
          color: set.color,
          setId: set.id
        }), className: "aspect-square rounded-sm transition-transform hover:scale-110", style: {
          backgroundColor: set.color,
          boxShadow: `0 0 6px ${set.color}80`,
          border: cell.setId === set.id ? "2px solid white" : "1px solid rgba(255,255,255,0.2)"
        }, title: `${set.name} (${set.id})` }, set.id)) })
      ] }),
      cell.setId && onApplyToSameColor && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onApplyToSameColor, className: "cyber-btn w-full py-1.5 text-xs font-cyber tracking-wider flex items-center justify-center gap-1.5", style: {
        borderColor: "var(--pink)",
        color: "var(--pink)",
        backgroundColor: "rgba(255, 77, 212, 0.08)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 12 }),
        "應用到所有同色地產"
      ] })
    ] }),
    !isProperty && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1", children: "顏色" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: cell.color || "#00ff88", onChange: (e) => onUpdate({
          color: e.target.value
        }), className: "w-10 h-9 cursor-pointer rounded-sm border border-[rgba(0_255_255_0.3)] bg-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: cell.color, onChange: (e) => onUpdate({
          color: e.target.value
        }), className: "cyber-input text-sm py-1.5 flex-1 font-mono" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto pt-3 border-t border-[rgba(0_255_255_0.1)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-[var(--text-muted)] font-cyber space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "ID：",
        cell.id
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "位置：",
        cell.id >= 0 && cell.id <= 9 ? "底邊" : cell.id >= 10 && cell.id <= 18 ? "右邊" : cell.id >= 19 && cell.id <= 27 ? "頂邊" : "左邊"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "類型：",
        cell.type
      ] }),
      isProperty && cell.setId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "套裝：",
        cell.setId
      ] }),
      allCells && isProperty && cell.setId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "同色地塊：",
        allCells.filter((c) => c.setId === cell.setId).length,
        " 塊"
      ] })
    ] }) })
  ] });
};
const EditorDialogs = ({
  showExport,
  onExportChange,
  exportText,
  copied,
  onCopy,
  showImport,
  onImportChange,
  importText,
  onImportTextChange,
  importError,
  onImport,
  showSaveList,
  onSaveListChange,
  saveMsg,
  savedMaps,
  onLoadMap,
  onDeleteMap,
  showErrors,
  onErrorsChange,
  errors
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showExport, onOpenChange: onExportChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber tracking-wider text-neon-cyan", children: "導出地圖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-[var(--text-secondary)]", children: "複製下方 base64 字串即可分享或備份你的地圖" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { readOnly: true, value: exportText, className: "w-full h-32 p-2 text-xs font-mono resize-none rounded-sm cyber-input" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onCopy, className: "cyber-btn cyber-btn-sm flex items-center gap-1", children: [
        copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
        copied ? "已複製" : "複製"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showImport, onOpenChange: onImportChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber tracking-wider text-neon-pink", children: "導入地圖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-[var(--text-secondary)]", children: "貼上 base64 格式的地圖資料" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: importText, onChange: (e) => onImportTextChange(e.target.value), placeholder: "貼上地圖 base64 字串...", className: "w-full h-32 p-2 text-xs font-mono resize-none rounded-sm cyber-input" }),
      importError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs px-2 py-1.5 rounded-sm flex items-center gap-1", style: {
        color: "var(--red)",
        background: "rgba(255, 77, 109, 0.1)",
        border: "1px solid rgba(255, 77, 109, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 12 }),
        importError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onImportChange(false), className: "cyber-btn cyber-btn-sm", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onImport, className: "cyber-btn cyber-btn-sm cyber-btn-pink", children: "導入" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showSaveList, onOpenChange: onSaveListChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-cyber tracking-wider text-neon-cyan", children: "已保存地圖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-[var(--text-secondary)]", children: [
          "最多 ",
          MAX_CUSTOM_MAPS,
          " 張"
        ] })
      ] }),
      saveMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs px-2 py-1.5 rounded-sm mb-2", style: {
        color: "var(--green)",
        background: "rgba(0, 255, 128, 0.1)",
        border: "1px solid rgba(0, 255, 128, 0.3)"
      }, children: saveMsg }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-h-80 overflow-y-auto", children: [
        savedMaps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[var(--text-secondary)] py-6 text-sm", children: "尚無保存的地圖" }),
        savedMaps.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wide truncate", children: m.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-muted)]", children: new Date(m.createdAt).toLocaleString("zh-TW") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onLoadMap(m), className: "cyber-btn cyber-btn-sm text-xs", children: "載入" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onDeleteMap(m.id), className: "p-1.5 rounded-sm transition-all hover:bg-red-500/20", style: {
              color: "var(--red)"
            }, title: "刪除", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] })
        ] }, m.id))
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showErrors, onOpenChange: onErrorsChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-cyber tracking-wider flex items-center gap-2", style: {
          color: "var(--red)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
          "地圖校驗失敗"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-[var(--text-secondary)]", children: "請修正以下問題後重試" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-sm space-y-1.5", style: {
        background: "rgba(255, 77, 109, 0.08)",
        border: "1px solid rgba(255, 77, 109, 0.3)",
        boxShadow: "0 0 15px rgba(255, 77, 109, 0.2)"
      }, children: errors.map((err, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", style: {
        color: "var(--red)"
      }, children: [
        "注意 ",
        err
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onErrorsChange(false), className: "cyber-btn cyber-btn-sm", children: "確定" }) })
    ] }) })
  ] });
};
const STORAGE_KEY = "cyber_monopoly_custom_maps";
function createDefaultCells() {
  const cells = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push({
      id: i,
      name: `格子${i}`,
      type: "property",
      basePrice: 1e3,
      color: "#00e5ff",
      setId: "set1",
      rent: 250
    });
  }
  cells[0] = {
    id: 0,
    name: "起點",
    type: "start",
    basePrice: 0,
    color: "#00ff88"
  };
  cells[10] = {
    id: 10,
    name: "禁閉區",
    type: "detention",
    basePrice: 0,
    color: "#a855f7"
  };
  cells[20] = {
    id: 20,
    name: "命運區",
    type: "fate",
    basePrice: 0,
    color: "#ff4dff"
  };
  cells[33] = {
    id: 33,
    name: "命運區",
    type: "fate",
    basePrice: 0,
    color: "#ff4dff"
  };
  cells[27] = {
    id: 27,
    name: "機會區",
    type: "chance",
    basePrice: 0,
    color: "#6366f1"
  };
  cells[35] = {
    id: 35,
    name: "機會區",
    type: "chance",
    basePrice: 0,
    color: "#6366f1"
  };
  return cells;
}
function isMapLike(data) {
  if (typeof data !== "object" || data === null) return false;
  const m = data;
  return typeof m.id === "string" && typeof m.name === "string" && Array.isArray(m.cells);
}
function loadSavedMaps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isMapLike);
  } catch {
  }
  return [];
}
function saveMapsToStorage(maps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      return false;
    }
    return false;
  }
}
const typeDefaults = {
  start: {
    name: "起點",
    basePrice: 0,
    color: "#00ff88",
    setId: void 0
  },
  property: {
    name: "新地產",
    basePrice: 1e3,
    color: "#00e5ff",
    setId: "set1",
    rent: 250
  },
  detention: {
    name: "禁閉區",
    basePrice: 0,
    color: "#a855f7",
    setId: void 0
  },
  fate: {
    name: "命運區",
    basePrice: 0,
    color: "#ff4dff",
    setId: void 0
  },
  chance: {
    name: "機會區",
    basePrice: 0,
    color: "#6366f1",
    setId: void 0
  },
  minigame: {
    name: "遊戲區",
    basePrice: 0,
    color: "#facc15",
    setId: void 0
  },
  parking: {
    name: "停車場",
    basePrice: 0,
    color: "#38bdf8",
    setId: void 0
  },
  jail: {
    name: "免費停車",
    basePrice: 0,
    color: "#f97316",
    setId: void 0
  },
  event: {
    name: "奇遇事件",
    basePrice: 0,
    color: "#facc15",
    setId: void 0
  },
  teleport: {
    name: "傳送門",
    basePrice: 0,
    color: "#2dd4bf",
    setId: void 0
  }
};
const PRESET_MAPS = [{
  id: "classic",
  name: "經典地圖",
  cellCount: CELL_COUNT,
  description: "標準 36 格賽博朋克地圖"
}, {
  id: "small",
  name: "小型地圖",
  cellCount: CELL_COUNT,
  description: "精簡 28 地產格，快速對戰"
}, {
  id: "large",
  name: "大型地圖",
  cellCount: CELL_COUNT,
  description: "48 區段，更多戰略選擇"
}];
function createPresetCells(presetId) {
  const cells = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push({
      id: i,
      name: `地塊${i}`,
      type: "property",
      basePrice: 1e3 + Math.floor(i / 4) * 400,
      color: "#00e5ff",
      setId: `set${Math.floor(i / 4) + 1}`,
      rent: Math.round((1e3 + Math.floor(i / 4) * 400) * 0.25)
    });
  }
  cells[0] = {
    id: 0,
    name: "起點",
    type: "start",
    basePrice: 0,
    color: "#00ff88"
  };
  cells[10] = {
    id: 10,
    name: "禁閉區",
    type: "detention",
    basePrice: 0,
    color: "#a855f7"
  };
  cells[20] = {
    id: 20,
    name: "命運區",
    type: "fate",
    basePrice: 0,
    color: "#ff4dff"
  };
  cells[33] = {
    id: 33,
    name: "命運區",
    type: "fate",
    basePrice: 0,
    color: "#ff4dff"
  };
  cells[27] = {
    id: 27,
    name: "機會區",
    type: "chance",
    basePrice: 0,
    color: "#6366f1"
  };
  cells[35] = {
    id: 35,
    name: "機會區",
    type: "chance",
    basePrice: 0,
    color: "#6366f1"
  };
  if (presetId === "classic") {
    cells[9] = {
      id: 9,
      name: "停車場",
      type: "parking",
      basePrice: 0,
      color: "#38bdf8"
    };
    cells[18] = {
      id: 18,
      name: "奇遇事件",
      type: "event",
      basePrice: 0,
      color: "#facc15"
    };
    const names = ["霓虹區", "舊城區", "能源站", "數據塔", "維修區", "核心區", "深海港", "金融街", "地下街"];
    const prices = [600, 600, 1e3, 1e3, 1200, 1400, 1400, 1600, 1800];
    for (let i = 1; i <= 8; i++) {
      cells[i] = {
        ...cells[i],
        name: names[i - 1],
        basePrice: prices[i - 1],
        rent: Math.round(prices[i - 1] * 0.25)
      };
    }
  } else if (presetId === "small") {
    cells[9] = {
      id: 9,
      name: "地產九",
      type: "property",
      basePrice: 2e3,
      color: "#00e5ff",
      setId: "set3",
      rent: 500
    };
    cells[18] = {
      id: 18,
      name: "地產十八",
      type: "property",
      basePrice: 2500,
      color: "#f472b6",
      setId: "set5",
      rent: 625
    };
  } else if (presetId === "large") {
    cells[9] = {
      id: 9,
      name: "停車場",
      type: "parking",
      basePrice: 0,
      color: "#38bdf8"
    };
    cells[18] = {
      id: 18,
      name: "奇遇事件",
      type: "event",
      basePrice: 0,
      color: "#facc15"
    };
    cells[4] = {
      id: 4,
      name: "傳送門",
      type: "teleport",
      basePrice: 0,
      color: "#2dd4bf"
    };
    cells[14] = {
      id: 14,
      name: "免費停車",
      type: "jail",
      basePrice: 0,
      color: "#f97316"
    };
    cells[24] = {
      id: 24,
      name: "傳送門",
      type: "teleport",
      basePrice: 0,
      color: "#2dd4bf"
    };
    cells[30] = {
      id: 30,
      name: "奇遇事件",
      type: "event",
      basePrice: 0,
      color: "#facc15"
    };
  }
  return cells;
}
const MapEditorPage = () => {
  const navigate = useNavigate();
  const [mapName, setMapName] = reactExports.useState("未命名地圖");
  const [cells, setCells] = reactExports.useState(createDefaultCells);
  const [selectedId, setSelectedId] = reactExports.useState(0);
  const [tool, setTool] = reactExports.useState("select");
  const [selectedType, setSelectedType] = reactExports.useState("property");
  const [showExport, setShowExport] = reactExports.useState(false);
  const [showImport, setShowImport] = reactExports.useState(false);
  const [showSaveList, setShowSaveList] = reactExports.useState(false);
  const [showErrors, setShowErrors] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState([]);
  const [exportText, setExportText] = reactExports.useState("");
  const [importText, setImportText] = reactExports.useState("");
  const [savedMaps, setSavedMaps] = reactExports.useState([]);
  const [copied, setCopied] = reactExports.useState(false);
  const [importError, setImportError] = reactExports.useState("");
  const [saveMsg, setSaveMsg] = reactExports.useState("");
  const [editingMapId, setEditingMapId] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState([]);
  const [historyIndex, setHistoryIndex] = reactExports.useState(-1);
  const [showPresets, setShowPresets] = reactExports.useState(false);
  const [showTestPreview, setShowTestPreview] = reactExports.useState(false);
  const [showClearConfirm, setShowClearConfirm] = reactExports.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setSavedMaps(loadSavedMaps());
  }, []);
  reactExports.useEffect(() => {
    setHistory([cells.map((c) => ({
      ...c
    }))]);
    setHistoryIndex(0);
  }, []);
  const pushHistory = reactExports.useCallback((nextCells) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, nextCells.map((c) => ({
        ...c
      }))];
      if (next.length > 100) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 99));
  }, [historyIndex]);
  const handleUndo = reactExports.useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    setHistoryIndex(prevIndex);
    setCells(history[prevIndex].map((c) => ({
      ...c
    })));
  }, [historyIndex, history]);
  const handleRedo = reactExports.useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setCells(history[nextIndex].map((c) => ({
      ...c
    })));
  }, [historyIndex, history]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.shiftKey && e.key === "z")) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);
  const selectedCell = selectedId !== null ? cells[selectedId] : null;
  const applyTool = reactExports.useCallback((id) => {
    if (tool === "select") {
      setSelectedId(id);
      return;
    }
    if (tool === "paint") {
      const next = cells.map((c) => ({
        ...c
      }));
      const defaults = typeDefaults[selectedType];
      next[id] = {
        ...next[id],
        ...defaults,
        id,
        type: selectedType
      };
      setCells(next);
      pushHistory(next);
      setSelectedId(id);
      return;
    }
    if (tool === "erase") {
      const next = cells.map((c) => ({
        ...c
      }));
      next[id] = {
        ...next[id],
        type: "property",
        name: "空地",
        basePrice: 0,
        color: "#444",
        setId: void 0,
        rent: 0
      };
      setCells(next);
      pushHistory(next);
    }
  }, [tool, selectedType, cells, pushHistory]);
  const handleContextMenu = reactExports.useCallback((id) => {
    const next = cells.map((c) => ({
      ...c
    }));
    next[id] = {
      ...next[id],
      type: "property",
      name: "空地",
      basePrice: 0,
      color: "#444",
      setId: void 0,
      rent: 0
    };
    setCells(next);
    pushHistory(next);
  }, [cells, pushHistory]);
  const updateCell = reactExports.useCallback((patch) => {
    if (selectedId === null) return;
    const next = cells.map((c) => ({
      ...c
    }));
    next[selectedId] = {
      ...next[selectedId],
      ...patch
    };
    setCells(next);
    pushHistory(next);
  }, [cells, selectedId, pushHistory]);
  const handleApplyToSameColor = reactExports.useCallback(() => {
    if (selectedId === null) return;
    const source = cells[selectedId];
    if (!source.setId) return;
    const next = cells.map((c) => {
      if (c.setId === source.setId && c.type === "property") {
        return {
          ...c,
          basePrice: source.basePrice,
          rent: source.rent,
          color: source.color
        };
      }
      return c;
    });
    setCells(next);
    pushHistory(next);
  }, [cells, selectedId, pushHistory]);
  const handleLoadPreset = reactExports.useCallback((presetId) => {
    const presetCells = createPresetCells(presetId);
    setCells(presetCells);
    setSelectedId(0);
    setMapName(PRESET_MAPS.find((p) => p.id === presetId)?.name ?? "");
    setShowPresets(false);
    setHistory([presetCells.map((c) => ({
      ...c
    }))]);
    setHistoryIndex(0);
  }, []);
  const handleClearMap = reactExports.useCallback(() => {
    const cleared = Array.from({
      length: CELL_COUNT
    }, (_, i) => ({
      id: i,
      name: `空地${i}`,
      type: "property",
      basePrice: 0,
      color: "#444",
      rent: 0
    }));
    cleared[0] = {
      id: 0,
      name: "起點",
      type: "start",
      basePrice: 0,
      color: "#00ff88"
    };
    setCells(cleared);
    setSelectedId(0);
    setEditingMapId(null);
    setShowClearConfirm(false);
    pushHistory(cleared);
  }, [pushHistory]);
  const runValidation = reactExports.useCallback(() => {
    const result = validateMap(cells);
    if (!result.valid) {
      setErrors(result.errors);
      setShowErrors(true);
      return false;
    }
    return true;
  }, [cells]);
  const handleSave = reactExports.useCallback(() => {
    if (!runValidation()) return;
    const current = loadSavedMaps();
    if (editingMapId) {
      const idx = current.findIndex((m) => m.id === editingMapId);
      if (idx >= 0) {
        const updated = {
          ...current[idx],
          name: mapName || "未命名地圖",
          cells: cells.map((c) => ({
            ...c
          }))
        };
        const next2 = [...current];
        next2[idx] = updated;
        const ok2 = saveMapsToStorage(next2);
        if (!ok2) {
          setSaveMsg("儲存失敗：儲存空間已滿，請刪除舊地圖");
          setShowSaveList(true);
          return;
        }
        setSavedMaps(next2);
        setSaveMsg("儲存成功！");
        setShowSaveList(true);
        return;
      }
    }
    if (current.length >= MAX_CUSTOM_MAPS) {
      setSaveMsg(`已達上限 ${MAX_CUSTOM_MAPS} 張，請先刪除舊地圖`);
      setShowSaveList(true);
      return;
    }
    const newMap = {
      id: `map_${Date.now()}`,
      name: mapName || "未命名地圖",
      cells: cells.map((c) => ({
        ...c
      })),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const next = [newMap, ...current].slice(0, MAX_CUSTOM_MAPS);
    const ok = saveMapsToStorage(next);
    if (!ok) {
      setSaveMsg("儲存失敗：儲存空間已滿，請刪除舊地圖");
      setShowSaveList(true);
      return;
    }
    setSavedMaps(next);
    setEditingMapId(newMap.id);
    setSaveMsg("儲存成功！");
    setShowSaveList(true);
  }, [cells, mapName, runValidation, editingMapId]);
  const handleDeleteMap = reactExports.useCallback((id) => {
    const current = loadSavedMaps();
    const next = current.filter((m) => m.id !== id);
    saveMapsToStorage(next);
    setSavedMaps(next);
    if (editingMapId === id) {
      setEditingMapId(null);
    }
    setPendingDeleteId(null);
  }, [editingMapId]);
  const requestDeleteMap = reactExports.useCallback((id) => {
    setPendingDeleteId(id);
  }, []);
  const handleLoadMap = reactExports.useCallback((map) => {
    if (map.cells && map.cells.length === CELL_COUNT) {
      setCells(map.cells.map((c) => ({
        ...c
      })));
      setMapName(map.name);
      setEditingMapId(map.id);
      setHistory([map.cells.map((c) => ({
        ...c
      }))]);
      setHistoryIndex(0);
      setShowSaveList(false);
    }
  }, []);
  const handleExport = reactExports.useCallback(() => {
    if (!runValidation()) return;
    const encoded = encodeMapToBase64(cells);
    setExportText(encoded);
    setShowExport(true);
  }, [cells, runValidation]);
  const handleCopyExport = reactExports.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  }, [exportText]);
  const handleImport = reactExports.useCallback(() => {
    setImportError("");
    try {
      const decoded = decodeMapFromBase64(importText.trim());
      if (!Array.isArray(decoded) || decoded.length !== CELL_COUNT) {
        setImportError("地圖格式錯誤：格子數量不符");
        return;
      }
      const validated = validateMap(decoded);
      if (!validated.valid) {
        setImportError(`地圖格式錯誤：${validated.errors[0] ?? "校驗失敗"}`);
        return;
      }
      const normalized = decoded.map((c, i) => {
        const defaults = typeDefaults[c.type] ?? {};
        return {
          ...defaults,
          ...c,
          id: i
        };
      });
      setCells(normalized);
      setEditingMapId(null);
      setHistory([normalized.map((c) => ({
        ...c
      }))]);
      setHistoryIndex(0);
      setShowImport(false);
      setImportText("");
    } catch {
      setImportError("解析失敗，請確認 base64 字串是否正確");
    }
  }, [importText]);
  const handleTest = reactExports.useCallback(() => {
    if (!runValidation()) return;
    setShowTestPreview(true);
  }, [runValidation]);
  const handleBack = reactExports.useCallback(() => {
    navigate("/");
  }, [navigate]);
  const handlePublish = reactExports.useCallback(() => {
    if (!runValidation()) return;
    const mapData = {
      name: mapName || "未命名地圖",
      cells,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    publishMap(mapData, "我");
    setSaveMsg("已發布到社區！");
    setTimeout(() => setSaveMsg(""), 2e3);
  }, [cells, mapName, runValidation]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--pink)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "relative z-10 p-3 md:p-4 border-b border-[rgba(0_255_255_0.15)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1400px] mx-auto flex items-center gap-2 md:gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn cyber-btn-sm flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14 }),
        "返回"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-[160px] max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: mapName, onChange: (e) => setMapName(e.target.value), className: "cyber-input text-sm py-1.5 font-cyber tracking-wider", placeholder: "地圖名稱" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleUndo, disabled: historyIndex <= 0, className: "cyber-btn cyber-btn-sm flex items-center gap-1", style: {
          opacity: historyIndex <= 0 ? 0.4 : 1,
          cursor: historyIndex <= 0 ? "not-allowed" : "pointer"
        }, title: "復原 (Ctrl+Z)", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "復原" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleRedo, disabled: historyIndex >= history.length - 1, className: "cyber-btn cyber-btn-sm flex items-center gap-1", style: {
          opacity: historyIndex >= history.length - 1 ? 0.4 : 1,
          cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer"
        }, title: "重做 (Ctrl+Y)", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Redo2, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "重做" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-[rgba(0_255_255_0.2)] mx-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowPresets(true), className: "cyber-btn cyber-btn-sm flex items-center gap-1", style: {
          borderColor: "var(--purple)",
          color: "var(--purple)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "模板" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowClearConfirm(true), className: "cyber-btn cyber-btn-sm flex items-center gap-1", style: {
          borderColor: "var(--red)",
          color: "var(--red)"
        }, title: "清空地圖", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "清空" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-[rgba(0_255_255_0.2)] mx-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSave, className: "cyber-btn cyber-btn-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14 }),
          "保存"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleExport, className: "cyber-btn cyber-btn-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
          "導出"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
          setShowImport(true);
          setImportError("");
        }, className: "cyber-btn cyber-btn-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 14 }),
          "導入"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleTest, className: "cyber-btn cyber-btn-sm cyber-btn-pink flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
          "測試"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handlePublish, className: "cyber-btn cyber-btn-sm flex items-center gap-1", style: {
          borderColor: "var(--green)",
          color: "var(--green)",
          backgroundColor: "rgba(0, 255, 128, 0.08)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14 }),
          "發布到社區"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "relative z-10 flex-1 p-3 md:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-3 md:gap-4 h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-2 lg:order-1 lg:h-[calc(100vh-120px)] lg:min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToolPanel, { tool, onToolChange: setTool, selectedType, onTypeChange: setSelectedType }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-1 lg:order-2 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditorBoard, { cells, selectedId, onCellClick: applyTool, onCellContextMenu: handleContextMenu }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-3 lg:h-[calc(100vh-120px)] lg:min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PropertyPanel, { cell: selectedCell, onUpdate: updateCell, onApplyToSameColor: handleApplyToSameColor, allCells: cells }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditorDialogs, { showExport, onExportChange: setShowExport, exportText, copied, onCopy: handleCopyExport, showImport, onImportChange: setShowImport, importText, onImportTextChange: setImportText, importError, onImport: handleImport, showSaveList, onSaveListChange: setShowSaveList, saveMsg, savedMaps, onLoadMap: handleLoadMap, onDeleteMap: requestDeleteMap, showErrors, onErrorsChange: setShowErrors, errors }),
    showPresets && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-md p-5", style: {
      borderColor: "var(--purple)",
      boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--purple)",
          textShadow: "0 0 10px rgba(168, 85, 247, 0.5)"
        }, children: "選擇地圖模板" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPresets(false), className: "cyber-btn p-1", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: PRESET_MAPS.map((preset) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleLoadPreset(preset.id), className: "w-full text-left p-4 cyber-card transition-all hover:scale-[1.01]", style: {
        borderColor: "color-mix(in srgb, var(--cyan) 30%, transparent)",
        backgroundColor: "hsl(240, 20%, 8%)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 flex items-center justify-center rounded-sm", style: {
          border: "1px solid var(--cyan)",
          color: "var(--cyan)",
          boxShadow: "0 0 8px rgba(0, 255, 255, 0.3)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider text-neon-cyan", children: preset.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] mt-0.5", children: [
            preset.description,
            " · ",
            preset.cellCount,
            " 格"
          ] })
        ] })
      ] }) }, preset.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-xs text-[var(--text-muted)] font-cyber", children: "載入模板將替換目前地圖，操作不可復原" })
    ] }) }),
    showTestPreview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-lg p-5", style: {
      borderColor: "var(--pink)",
      boxShadow: "0 0 30px rgba(255, 77, 212, 0.4)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--pink)",
          textShadow: "0 0 10px rgba(255, 77, 212, 0.5)"
        }, children: "地圖預覽" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowTestPreview(false), className: "cyber-btn p-1", style: {
          borderColor: "var(--text-secondary)",
          color: "var(--text-secondary)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider text-neon-cyan mb-1", children: mapName || "未命名地圖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "總格子數：",
            cells.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "地產格數：",
            cells.filter((c) => c.type === "property").length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "特殊格子：",
            cells.filter((c) => c.type !== "property").length
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6 border-t border-[rgba(255_77_212_0.2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[var(--text-secondary)] text-sm mb-4", children: "（預覽模式 - 展示地圖結構）" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowTestPreview(false), className: "cyber-btn px-5 py-2 text-sm font-cyber tracking-wider", children: "關閉" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            setShowTestPreview(false);
            navigate("/game", {
              state: {
                customMapCells: cells
              }
            });
          }, className: "cyber-btn px-5 py-2 text-sm font-cyber tracking-wider", style: {
            borderColor: "var(--pink)",
            color: "var(--pink)",
            backgroundColor: "rgba(255, 77, 212, 0.08)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 14 }),
            "開始測試"
          ] }) })
        ] })
      ] })
    ] }) }),
    showClearConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 30px rgba(255, 77, 77, 0.3)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider mb-3", style: {
        color: "var(--red)",
        textShadow: "0 0 10px rgba(255, 77, 77, 0.5)"
      }, children: "確認清空" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-5", children: "確定要清空目前地圖嗎？此操作可透過復原還原。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowClearConfirm(false), className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleClearMap, className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          backgroundColor: "rgba(255, 77, 77, 0.08)"
        }, children: "確認清空" })
      ] })
    ] }) }),
    pendingDeleteId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card w-full max-w-sm p-5", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 30px rgba(255, 77, 77, 0.3)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider mb-3", style: {
        color: "var(--red)",
        textShadow: "0 0 10px rgba(255, 77, 77, 0.5)"
      }, children: "確認刪除" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-5", children: "確定要刪除這張已儲存的地圖嗎？此操作無法復原。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingDeleteId(null), className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleDeleteMap(pendingDeleteId), className: "cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)",
          backgroundColor: "rgba(255, 77, 77, 0.08)"
        }, children: "確認刪除" })
      ] })
    ] }) })
  ] });
};
export {
  MapEditorPage as default
};
