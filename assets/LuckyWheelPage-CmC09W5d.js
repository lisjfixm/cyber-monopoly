import { d as createLucideIcon, r as reactExports, c$ as getCoins, aG as safeSetJSON, d0 as addCoins, aF as safeGetJSON, u as useNavigate, bY as toast, d1 as vibrate, d2 as vibrationPatterns, j as jsxRuntimeExports, bf as Gift, b9 as Sparkles, aJ as Coins } from "./index-Clt-7orM.js";
import { u as useSkinUpgrade, R as RotateCw } from "./useSkinUpgrade-CmAGW2rz.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode);
const STORAGE_KEY = "cyber_monopoly_lucky_wheel";
const WHEEL_PRIZES = [{
  id: 0,
  type: "coins",
  label: "金幣 ×100",
  amount: 100,
  weight: 20,
  color: "rgba(0,255,255,0.15)",
  textColor: "var(--cyan)"
}, {
  id: 1,
  type: "fragments",
  label: "碎片 ×5",
  amount: 5,
  weight: 18,
  color: "rgba(168,85,247,0.15)",
  textColor: "var(--purple)"
}, {
  id: 2,
  type: "nothing",
  label: "謝謝參與",
  amount: 0,
  weight: 16,
  color: "rgba(255,255,255,0.05)",
  textColor: "var(--text-secondary)"
}, {
  id: 3,
  type: "big_coins",
  label: "金幣 ×300",
  amount: 300,
  weight: 14,
  color: "rgba(255,200,0,0.15)",
  textColor: "var(--yellow)"
}, {
  id: 4,
  type: "fragments",
  label: "碎片 ×5",
  amount: 5,
  weight: 12,
  color: "rgba(168,85,247,0.15)",
  textColor: "var(--purple)"
}, {
  id: 5,
  type: "big_fragments",
  label: "碎片 ×15",
  amount: 15,
  weight: 10,
  color: "rgba(255,107,157,0.15)",
  textColor: "var(--pink)"
}, {
  id: 6,
  type: "big_coins",
  label: "金幣 ×500",
  amount: 500,
  weight: 7,
  color: "rgba(255,200,0,0.25)",
  textColor: "var(--yellow)"
}, {
  id: 7,
  type: "jackpot",
  label: "傳說寶箱",
  amount: 50,
  weight: 3,
  color: "rgba(255,0,128,0.25)",
  textColor: "var(--pink)"
}];
function getTodayStr() {
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function readData() {
  const raw = safeGetJSON(STORAGE_KEY, {});
  return {
    lastSpinDate: raw.lastSpinDate ?? "",
    totalSpins: raw.totalSpins ?? 0,
    history: Array.isArray(raw.history) ? raw.history.slice(-30) : []
  };
}
function pickPrizeIndex() {
  const total = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WHEEL_PRIZES.length; i += 1) {
    r -= WHEEL_PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}
function useLuckyWheel() {
  const [data, setData] = reactExports.useState(() => readData());
  const {
    addFragments
  } = useSkinUpgrade();
  const [coins, setCoins] = reactExports.useState(() => getCoins());
  reactExports.useEffect(() => {
    safeSetJSON(STORAGE_KEY, data);
  }, [data]);
  const canSpin = reactExports.useMemo(() => data.lastSpinDate !== getTodayStr(), [data.lastSpinDate]);
  const spin = reactExports.useCallback(() => {
    if (!canSpin) {
      throw new Error("今日已轉過，請明日再來");
    }
    const idx = pickPrizeIndex();
    const prize = WHEEL_PRIZES[idx];
    let coinDelta = 0;
    let fragmentDelta = 0;
    if (prize.type === "coins" || prize.type === "big_coins") {
      coinDelta = prize.amount;
      addCoins(coinDelta);
      setCoins(getCoins());
    } else if (prize.type === "fragments" || prize.type === "big_fragments") {
      fragmentDelta = prize.amount;
      addFragments(fragmentDelta);
    } else if (prize.type === "jackpot") {
      fragmentDelta = prize.amount;
      addFragments(fragmentDelta);
    }
    const today = getTodayStr();
    setData((prev) => ({
      lastSpinDate: today,
      totalSpins: prev.totalSpins + 1,
      history: [...prev.history.slice(-29), {
        date: today,
        prizeId: prize.id
      }]
    }));
    return {
      prize,
      coinDelta,
      fragmentDelta,
      isNew: true
    };
  }, [canSpin, addFragments]);
  return {
    canSpin,
    totalSpins: data.totalSpins,
    history: data.history,
    coins,
    prizes: WHEEL_PRIZES,
    spin,
    // 供 UI 計算旋轉角度時使用（索引 → 最終角度）
    getPrizeIndex: pickPrizeIndex
  };
}
const SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / SEGMENTS;
const SPIN_TURNS = 5;
function rotationForIndex(idx) {
  const centerAngle = -90 + idx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  const target = -90 - centerAngle;
  return SPIN_TURNS * 360 + target;
}
function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}
function segmentPath(cx, cy, r, startAngle, endAngle) {
  const s = polar(cx, cy, r, startAngle);
  const e = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}
const LuckyWheelPage = () => {
  const navigate = useNavigate();
  const {
    canSpin,
    totalSpins,
    history,
    prizes,
    spin
  } = useLuckyWheel();
  const [rotation, setRotation] = reactExports.useState(0);
  const [spinning, setSpinning] = reactExports.useState(false);
  const [lastResult, setLastResult] = reactExports.useState(null);
  const [showHistory, setShowHistory] = reactExports.useState(false);
  const spinTimeoutRef = reactExports.useRef(null);
  const handleSpin = reactExports.useCallback(() => {
    if (spinning) return;
    if (!canSpin) {
      toast.info("今日已轉過，請明日再來");
      return;
    }
    let result;
    try {
      result = spin();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "轉盤失敗");
      return;
    }
    setSpinning(true);
    vibrate(vibrationPatterns.medium);
    const targetIdx = result.prize.id;
    const targetRotation = rotationForIndex(targetIdx);
    setRotation((prev) => {
      const base = prev - prev % 360;
      return base + targetRotation + 360;
    });
    spinTimeoutRef.current = setTimeout(() => {
      setSpinning(false);
      setLastResult(result);
      vibrate(result.prize.type === "jackpot" ? vibrationPatterns.win : vibrationPatterns.light);
      if (result.prize.type === "nothing") {
        toast("謝謝參與，明日再來");
      } else {
        const parts = [];
        if (result.coinDelta > 0) parts.push(`金幣 +${result.coinDelta}`);
        if (result.fragmentDelta > 0) parts.push(`碎片 +${result.fragmentDelta}`);
        toast.success(`獲得 ${result.prize.label}`, {
          description: parts.length > 0 ? parts.join(" · ") : void 0
        });
      }
    }, 4200);
  }, [spinning, canSpin, spin]);
  const R = 140;
  const C = R + 10;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full px-4 pt-6 pb-24 md:pb-10 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate(-1), className: "cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center", "aria-label": "返回", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl tracking-wider text-neon-cyan", style: {
          textShadow: "0 0 12px var(--cyan-glow)"
        }, children: "幸運轉盤" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-cyber tracking-wider mt-1", style: {
          color: "var(--text-secondary)"
        }, children: "每日一次免費轉盤 · v2.0.0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowHistory(true), className: "cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center", "aria-label": "歷史紀錄", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 20, style: {
          color: "var(--yellow)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber", style: {
            color: "var(--text-secondary)"
          }, children: "剩餘次數" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
            color: canSpin ? "var(--green)" : "var(--text-muted)"
          }, children: canSpin ? "1 次" : "今日已用完" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, style: {
          color: "var(--purple)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber", style: {
            color: "var(--text-secondary)"
          }, children: "累計轉數" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg", style: {
            color: "var(--purple)"
          }, children: totalSpins })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto my-8", style: {
      width: R * 2 + 40,
      height: R * 2 + 40
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 -translate-x-1/2 z-20", style: {
        top: -6,
        filter: "drop-shadow(0 0 6px var(--pink))"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        width: 0,
        height: 0,
        borderLeft: "12px solid transparent",
        borderRight: "12px solid transparent",
        borderTop: "20px solid var(--pink)"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: {
        boxShadow: "0 0 40px rgba(0,255,255,0.2), inset 0 0 30px rgba(0,0,0,0.6)",
        border: "2px solid var(--border-neon-cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: R * 2 + 20, height: R * 2 + 20, viewBox: `0 0 ${R * 2 + 20} ${R * 2 + 20}`, className: "absolute", style: {
        left: 10,
        top: 10,
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? "transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)" : "none"
      }, children: prizes.map((prize, i) => {
        const start = i * SEGMENT_ANGLE;
        const end = (i + 1) * SEGMENT_ANGLE;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: segmentPath(C, C, R, start, end), fill: prize.color, stroke: "rgba(0,255,255,0.3)", strokeWidth: 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).x, y: polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).y, textAnchor: "middle", dominantBaseline: "middle", fill: prize.textColor, fontSize: "11", fontFamily: "Orbitron, monospace", fontWeight: "bold", transform: `rotate(${start + SEGMENT_ANGLE / 2 + 90}, ${polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).x}, ${polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).y})`, children: prize.label })
        ] }, prize.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSpin, disabled: !canSpin || spinning, className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full flex flex-col items-center justify-center font-cyber", style: {
        width: 80,
        height: 80,
        background: canSpin && !spinning ? "radial-gradient(circle, rgba(0,255,255,0.3), rgba(0,0,0,0.8))" : "rgba(60,60,70,0.8)",
        border: `2px solid ${canSpin && !spinning ? "var(--cyan)" : "rgba(255,255,255,0.15)"}`,
        boxShadow: canSpin && !spinning ? "0 0 20px var(--cyan-glow)" : "none",
        color: canSpin && !spinning ? "var(--cyan)" : "var(--text-muted)",
        cursor: canSpin && !spinning ? "pointer" : "not-allowed",
        transition: "all 0.2s"
      }, "aria-label": "開始轉盤", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 22, className: spinning ? "animate-spin" : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs mt-1 tracking-wider", children: spinning ? "轉動中" : canSpin ? "開始" : "已轉完" })
      ] })
    ] }),
    lastResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 mt-4 text-center", style: {
      borderColor: lastResult.prize.textColor,
      boxShadow: `0 0 15px ${lastResult.prize.textColor}44`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber mb-1", style: {
        color: "var(--text-secondary)"
      }, children: "本次結果" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-xl", style: {
        color: lastResult.prize.textColor,
        textShadow: `0 0 8px ${lastResult.prize.textColor}`
      }, children: lastResult.prize.label }),
      (lastResult.coinDelta > 0 || lastResult.fragmentDelta > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm mt-2 font-cyber", style: {
        color: "var(--text-secondary)"
      }, children: [
        lastResult.coinDelta > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mr-3 inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { size: 14 }),
          " +",
          lastResult.coinDelta
        ] }),
        lastResult.fragmentDelta > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }),
          " +",
          lastResult.fragmentDelta
        ] })
      ] })
    ] }),
    showHistory && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", onClick: () => setShowHistory(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 w-full max-w-md max-h-[70vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg mb-4", style: {
        color: "var(--cyan)"
      }, children: "轉盤紀錄" }),
      history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-cyber", style: {
        color: "var(--text-secondary)"
      }, children: "尚無紀錄" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: history.slice().reverse().map((h, i) => {
        const prize = prizes[h.prizeId];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between items-center text-sm font-cyber p-2", style: {
          borderBottom: "1px solid var(--border-neon)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: prize?.textColor ?? "var(--text-primary)"
          }, children: prize?.label ?? "未知" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--text-muted)"
          }, children: h.date })
        ] }, i);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowHistory(false), className: "cyber-btn w-full mt-4 py-2 text-sm", children: "關閉" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media (max-width: 480px) {
          .cyber-card { border-radius: 8px; }
        }
      ` })
  ] });
};
export {
  LuckyWheelPage as default
};
