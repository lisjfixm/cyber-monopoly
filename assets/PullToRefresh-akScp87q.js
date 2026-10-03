import { r as reactExports, j as jsxRuntimeExports } from "./index-ymfxQ6bv.js";
const THRESHOLD = 60;
const INDICATOR_HEIGHT = 50;
const MAX_PULL = 120;
const RESISTANCE = 0.5;
const PullToRefresh = ({
  onRefresh,
  children,
  disabled = false,
  className = ""
}) => {
  const containerRef = reactExports.useRef(null);
  const [pullDistance, setPullDistance] = reactExports.useState(0);
  const [pullState, setPullState] = reactExports.useState("idle");
  const startYRef = reactExports.useRef(null);
  const isPullingRef = reactExports.useRef(false);
  const animDisabledRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const checkAnim = () => {
      animDisabledRef.current = document.documentElement.getAttribute("data-animation") === "off";
    };
    checkAnim();
    const observer = new MutationObserver(checkAnim);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-animation"]
    });
    return () => observer.disconnect();
  }, []);
  const getScrollTarget = reactExports.useCallback(() => {
    const el = containerRef.current;
    if (!el) return null;
    const scrollable = el.querySelector('[data-scroll="true"], .scroll-container');
    return scrollable ?? el;
  }, []);
  const isAtTop = reactExports.useCallback(() => {
    const target = getScrollTarget();
    if (!target) return true;
    return target.scrollTop <= 0;
  }, [getScrollTarget]);
  const handleTouchStart = reactExports.useCallback((e) => {
    if (disabled || pullState === "refreshing") return;
    if (!isAtTop()) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = false;
  }, [disabled, pullState, isAtTop]);
  const handleTouchMove = reactExports.useCallback((e) => {
    if (disabled || pullState === "refreshing") return;
    if (startYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff <= 0 && !isPullingRef.current) {
      return;
    }
    if (!isPullingRef.current && diff > 0) {
      if (!isAtTop()) {
        startYRef.current = null;
        return;
      }
      isPullingRef.current = true;
    }
    if (!isPullingRef.current) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const damped = Math.min(diff * RESISTANCE, MAX_PULL);
    setPullDistance(damped);
    if (damped >= THRESHOLD) {
      setPullState("ready");
    } else {
      setPullState("pulling");
    }
  }, [disabled, pullState, isAtTop]);
  const handleTouchEnd = reactExports.useCallback(() => {
    if (disabled || pullState === "refreshing") {
      startYRef.current = null;
      isPullingRef.current = false;
      return;
    }
    if (startYRef.current === null || !isPullingRef.current) {
      startYRef.current = null;
      isPullingRef.current = false;
      return;
    }
    if (pullState === "ready") {
      setPullState("refreshing");
      setPullDistance(INDICATOR_HEIGHT);
      void Promise.resolve(onRefresh()).finally(() => {
        setPullState("idle");
        setPullDistance(0);
      });
    } else {
      setPullState("idle");
      setPullDistance(0);
    }
    startYRef.current = null;
    isPullingRef.current = false;
  }, [disabled, pullState, onRefresh]);
  const getLabel = () => {
    switch (pullState) {
      case "pulling":
        return "下拉刷新";
      case "ready":
        return "釋放刷新";
      case "refreshing":
        return "刷新中...";
      default:
        return "";
    }
  };
  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const transition = animDisabledRef.current ? "none" : pullState === "refreshing" || pullState === "idle" ? "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease" : "none";
  const indicatorVisible = pullState === "pulling" || pullState === "ready" || pullState === "refreshing";
  const ringDashOffset = pullState === "refreshing" ? 0 : 2 * Math.PI * 10 * (1 - progress * 0.8);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: `relative overflow-hidden ${className}`, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-0 flex items-center justify-center pointer-events-none z-10", style: {
      height: INDICATOR_HEIGHT,
      transform: `translateY(${pullDistance - INDICATOR_HEIGHT}px)`,
      transition,
      opacity: indicatorVisible ? 1 : 0,
      willChange: "transform, opacity"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", style: {
        transform: pullState === "refreshing" ? "rotate(0deg)" : `rotate(${progress * 180}deg)`,
        animation: pullState === "refreshing" && !animDisabledRef.current ? "ptr-spin 1s linear infinite" : "none",
        transition: pullState === "refreshing" || animDisabledRef.current ? "none" : "transform 0.05s linear",
        filter: `drop-shadow(0 0 4px hsl(180 100% 55%)) drop-shadow(0 0 8px hsl(180 100% 55% / 0.6))`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10", fill: "none", stroke: "hsl(180 100% 55% / 0.2)", strokeWidth: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10", fill: "none", stroke: "hsl(180, 100%, 55%)", strokeWidth: "2", strokeLinecap: "round", strokeDasharray: 2 * Math.PI * 10, strokeDashoffset: ringDashOffset, transform: "rotate(-90 12 12)", style: {
          transition: animDisabledRef.current ? "none" : "stroke-dashoffset 0.1s linear"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] tracking-wider", style: {
        color: "hsl(220, 8%, 55%)",
        fontFamily: "system-ui, sans-serif"
      }, children: getLabel() })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      transform: `translateY(${pullDistance}px)`,
      transition,
      willChange: "transform"
    }, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` })
  ] });
};
export {
  PullToRefresh as P
};
