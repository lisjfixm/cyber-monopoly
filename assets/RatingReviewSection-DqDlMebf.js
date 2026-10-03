import { d as createLucideIcon, r as reactExports, j as jsxRuntimeExports, e as Send, aL as Star } from "./index-ymfxQ6bv.js";
const __iconNode = [
  ["path", { d: "M7 10v12", key: "1qc93n" }],
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ]
];
const ThumbsUp = createLucideIcon("thumbs-up", __iconNode);
function StarRating({
  score,
  onRate,
  size = 16,
  interactive = false
}) {
  const [hover, setHover] = reactExports.useState(0);
  const displayScore = hover || score;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5", style: {
    cursor: interactive ? "pointer" : "default"
  }, children: [1, 2, 3, 4, 5].map((star) => {
    const filled = star <= displayScore;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: !interactive, onClick: () => interactive && onRate && onRate(star), onMouseEnter: () => interactive && setHover(star), onMouseLeave: () => interactive && setHover(0), className: "p-0 bg-transparent border-0", style: {
      color: filled ? "var(--yellow, #facc15)" : "rgba(255, 255, 255, 0.2)",
      filter: filled ? "drop-shadow(0 0 4px currentColor)" : "none",
      cursor: interactive ? "pointer" : "default",
      lineHeight: 0
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size, fill: filled ? "currentColor" : "none" }) }, star);
  }) });
}
const RatingReviewSection = ({
  averageRating,
  ratingCount,
  reviews,
  onRate,
  onAddReview,
  onLikeReview
}) => {
  const [newReview, setNewReview] = reactExports.useState("");
  const [selectedScore, setSelectedScore] = reactExports.useState(0);
  const handleSubmit = () => {
    if (!newReview.trim()) return;
    onAddReview(newReview.trim());
    setNewReview("");
  };
  const handleRate = (score) => {
    setSelectedScore(score);
    onRate(score);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4", style: {
      borderColor: "rgba(250, 204, 21, 0.3)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-4xl md:text-5xl font-bold tracking-wider", style: {
          color: "var(--yellow, #facc15)",
          textShadow: "0 0 15px currentColor"
        }, children: averageRating > 0 ? averageRating.toFixed(1) : "--" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1", children: [
          ratingCount,
          " 人評分"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: "我的評分：" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StarRating, { score: selectedScore, onRate: handleRate, size: 20, interactive: true }),
          selectedScore > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber", style: {
            color: "var(--yellow)"
          }, children: [
            selectedScore,
            " 星"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "點擊星星為此內容評分" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: newReview, onChange: (e) => setNewReview(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") handleSubmit();
      }, placeholder: "分享你的想法...", className: "cyber-input flex-1 text-sm", style: {
        borderColor: "rgba(0, 255, 255, 0.2)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSubmit, disabled: !newReview.trim(), className: "cyber-btn cyber-btn-sm flex items-center gap-1", style: {
        borderColor: newReview.trim() ? "var(--cyan)" : "var(--text-secondary)",
        color: newReview.trim() ? "var(--cyan)" : "var(--text-secondary)",
        cursor: newReview.trim() ? "pointer" : "not-allowed"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }),
        "發表"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 max-h-80 overflow-y-auto pr-1", children: reviews.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-sm", style: {
      color: "var(--text-secondary)"
    }, children: "暫無評論，成為第一個評論者吧" }) : reviews.map((review) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3", style: {
      borderColor: "rgba(0, 255, 255, 0.15)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-cyber", style: {
            background: "linear-gradient(135deg, var(--cyan), var(--pink))",
            color: "#000"
          }, children: review.author.charAt(0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-wider truncate text-[var(--text-primary)]", children: review.author }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-[var(--text-secondary)]", children: [
              "積分 ",
              review.authorScore ?? "--",
              " · ",
              new Date(review.createdAt).toLocaleDateString("zh-TW")
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRating, { score: review.score, size: 12 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-primary)] mb-2 break-words", children: review.content }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => onLikeReview(review.id), className: "flex items-center gap-1 text-xs", style: {
        color: "var(--text-secondary)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { size: 12 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: review.likes })
      ] }) })
    ] }, review.id)) })
  ] });
};
export {
  RatingReviewSection as R,
  ThumbsUp as T
};
