import { d as createLucideIcon, r as reactExports, j as jsxRuntimeExports, X, e as Send, P as PLAYER_COLOR_HEX, l as logger, M as MessageCircle, C as ChevronUp, f as ChevronDown, g as CircleAlert, V as Volume2, U as Users, u as useNavigate, h as useParams, i as useSearchParams, k as useAchievements, m as useAudio, n as calculateGameStats, o as checkAchievements, p as SettingsButton, q as VolumeControl, s as Copy, W as WifiOff, t as Crown, v as MODE_LABELS, w as LogOut, x as CELLS, y as getCellPrice, z as PlayerList, B as Board, D as DanmakuLayer, A as DanmakuInput, E as BAIL_AMOUNT, F as ACHIEVEMENTS, H as SpectatorSidebar, I as GameLog, J as BuyModal, K as ProfessionSelectModal, N as AuctionModal, O as PropertyActionModal, Q as TradeModal, R as DiceOverlay, Y as FateCardModal, _ as ChanceCardModal, $ as TriangleAlert, a0 as StockPanel, a1 as GlobalEventModal, a2 as AchievementModal, a3 as AchievementToast, a4 as StatsPanel } from "./index-ymfxQ6bv.js";
import { m as monopolyApi } from "./monopoly-1z6oaVCn.js";
const __iconNode$1 = [
  ["path", { d: "M12 19v3", key: "npa21l" }],
  ["path", { d: "M15 9.34V5a3 3 0 0 0-5.68-1.33", key: "1gzdoj" }],
  ["path", { d: "M16.95 16.95A7 7 0 0 1 5 12v-2", key: "cqa7eg" }],
  ["path", { d: "M18.89 13.23A7 7 0 0 0 19 12v-2", key: "16hl24" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12", key: "r2i35w" }]
];
const MicOff = createLucideIcon("mic-off", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 19v3", key: "npa21l" }],
  ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
  ["rect", { x: "9", y: "2", width: "6", height: "13", rx: "3", key: "s6n7sd" }]
];
const Mic = createLucideIcon("mic", __iconNode);
const QUICK_PHRASES = ["好棋", "等等", "哈哈", "加油", "认输吧"];
function formatTime(ts) {
  try {
    const d = new Date(ts);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
}
const ChatPanel = ({
  isOpen,
  onToggle,
  messages,
  myPlayerIndex,
  onSend,
  onMarkRead,
  disabled = false,
  playerColors
}) => {
  const [inputValue, setInputValue] = reactExports.useState("");
  const listRef = reactExports.useRef(null);
  const markedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, isOpen]);
  reactExports.useEffect(() => {
    if (isOpen && !markedRef.current) {
      markedRef.current = true;
      onMarkRead?.();
    }
    if (!isOpen) {
      markedRef.current = false;
    }
  }, [isOpen, onMarkRead]);
  const handleSend = () => {
    if (disabled) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) return;
    try {
      onSend(trimmed);
      setInputValue("");
    } catch (err) {
      logger.error("发送聊天消息失败", {
        error: String(err)
      });
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  const handleQuickPhrase = (phrase) => {
    if (disabled) return;
    try {
      onSend(phrase);
    } catch (err) {
      logger.error("发送快捷短语失败", {
        error: String(err)
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `fixed z-50 transition-all duration-300 ease-out
          bottom-0 left-0 right-0 md:top-20 md:right-0 md:left-auto md:bottom-auto
          md:h-[60vh] h-[70vh]
          w-full md:w-[320px]
          ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col cyber-card border-neon-cyan\n            md:border-r-0 md:border-t-0 border-t md:border-l md:border-b", style: {
      background: "linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)",
      backdropFilter: "blur(8px)",
      boxShadow: "0 -4px 20px rgba(0, 255, 255, 0.15)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b", style: {
        borderColor: "var(--border-neon-cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-base md:text-lg tracking-wider", style: {
          color: "var(--cyan)",
          textShadow: "0 0 8px rgba(0, 255, 255, 0.5)"
        }, children: "聊天" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onToggle, className: "w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10", style: {
          color: "var(--text-secondary)"
        }, "aria-label": "关闭", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: listRef, className: "flex-1 overflow-y-auto px-3 py-3 space-y-3", children: [
        messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-text-muted text-xs py-8", children: "暂无聊天消息" }),
        messages.map((msg) => {
          const isSystem = msg.type === "system";
          const isMine = msg.sender === myPlayerIndex;
          const getSenderColor = (sender) => {
            if (playerColors && sender >= 0) {
              const c = playerColors[sender];
              if (c && PLAYER_COLOR_HEX[c]) return PLAYER_COLOR_HEX[c];
            }
            const colorKeys = Object.keys(PLAYER_COLOR_HEX);
            return PLAYER_COLOR_HEX[colorKeys[Math.max(0, sender) % colorKeys.length]] || "var(--cyan)";
          };
          if (isSystem) {
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs px-2 py-1 rounded", style: {
              color: "hsl(220, 10%, 60%)",
              background: "rgba(255, 255, 255, 0.05)"
            }, children: msg.content }) }, msg.id);
          }
          const isVoice = msg.type === "voice";
          const senderColor = msg.sender >= 0 ? getSenderColor(msg.sender) : "var(--pink)";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col ${isMine ? "items-end" : "items-start"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: senderColor,
                fontWeight: 600,
                textShadow: msg.sender >= 0 ? `0 0 6px ${senderColor}80` : "none"
              }, children: msg.senderName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "var(--text-muted)"
              }, children: formatTime(msg.timestamp) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 rounded text-sm max-w-[220px] break-words flex items-center gap-1.5", style: {
              background: isVoice ? "rgba(177, 151, 252, 0.15)" : isMine ? "rgba(0, 255, 255, 0.12)" : `${senderColor}20`,
              border: `1px solid ${isVoice ? "var(--purple)" : senderColor}`,
              color: "var(--text-primary)",
              boxShadow: isVoice ? "0 0 8px rgba(177, 151, 252, 0.4), inset 0 0 4px rgba(177, 151, 252, 0.15)" : msg.sender >= 0 ? `0 0 8px ${senderColor}50, inset 0 0 4px ${senderColor}20` : "0 0 8px rgba(255, 107, 157, 0.3), inset 0 0 4px rgba(255, 107, 157, 0.1)"
            }, children: [
              isVoice && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0", "aria-hidden": true, children: "語音" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: msg.content })
            ] })
          ] }, msg.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-t flex flex-wrap gap-1.5", style: {
        borderColor: "var(--border-neon-cyan)"
      }, children: QUICK_PHRASES.map((phrase) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleQuickPhrase(phrase), disabled, className: "cyber-btn px-2 py-1 text-xs transition-all", style: {
        fontSize: "11px",
        borderColor: disabled ? "rgba(255,255,255,0.1)" : "rgba(0, 255, 255, 0.3)",
        color: disabled ? "rgba(255,255,255,0.3)" : "var(--cyan)",
        background: "rgba(0, 255, 255, 0.05)",
        cursor: disabled ? "not-allowed" : "pointer"
      }, children: phrase }, phrase)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t flex items-center gap-2", style: {
        borderColor: "var(--border-neon-cyan)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: handleKeyDown, maxLength: 500, placeholder: disabled ? "无法发送消息" : "说点什么...", disabled, className: "cyber-input flex-1 text-sm", style: {
          height: "36px"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSend, disabled: disabled || !inputValue.trim(), className: "cyber-btn w-9 h-9 flex items-center justify-center p-0 flex-shrink-0 transition-all", style: {
          borderColor: !disabled && inputValue.trim() ? "var(--cyan)" : "rgba(255,255,255,0.1)",
          color: !disabled && inputValue.trim() ? "var(--cyan)" : "rgba(255,255,255,0.3)",
          boxShadow: !disabled && inputValue.trim() ? "0 0 8px rgba(0, 255, 255, 0.3)" : "none",
          cursor: disabled ? "not-allowed" : "pointer"
        }, "aria-label": "发送", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" }) })
      ] })
    ] }) }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden fixed inset-0 bg-black/40 z-40", onClick: onToggle })
  ] });
};
const ChatButton = ({
  hasNewMessage,
  onClick,
  messageCount
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: "cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all relative", style: {
      borderColor: hasNewMessage ? "var(--green)" : "rgba(255,255,255,0.2)",
      color: hasNewMessage ? "var(--green)" : "rgba(255,255,255,0.4)",
      boxShadow: hasNewMessage ? "0 0 8px rgba(0, 255, 150, 0.4)" : "none",
      animation: hasNewMessage ? "chatPulse 1.5s ease-in-out infinite" : "none"
    }, "aria-label": "聊天", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-4 h-4 md:w-5 md:h-5" }),
      hasNewMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold", style: {
        minWidth: "16px",
        height: "16px",
        padding: "0 4px",
        background: "var(--red)",
        color: "white",
        fontSize: "10px",
        boxShadow: "0 0 6px rgba(255, 0, 0, 0.6)",
        border: "1px solid rgba(255,255,255,0.3)"
      }, children: messageCount && messageCount > 0 ? messageCount > 99 ? "99+" : messageCount : "" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes chatPulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(0, 255, 150, 0.4);
          }
          50% {
            box-shadow: 0 0 16px rgba(0, 255, 150, 0.7), 0 0 24px rgba(0, 255, 150, 0.3);
          }
        }
      ` })
  ] });
};
const VoiceControl = ({
  currentPlayerIndex,
  voiceParticipants,
  playerNames,
  playerColors,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  sttEnabled = false,
  isListening = false,
  sttSupported = false,
  onToggleStt
}) => {
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  const handleToggleMute = () => {
    onToggleMute(!isMuted);
  };
  const handleVolumeInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onVolumeChange(val);
    }
  };
  const handleToggleStt = () => {
    if (!sttSupported || !onToggleStt) return;
    onToggleStt(!sttEnabled);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleToggleMute, className: `cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all relative`, style: {
        borderColor: !isMuted ? "var(--cyan)" : "rgba(255,255,255,0.2)",
        color: !isMuted ? "var(--cyan)" : "rgba(255,255,255,0.4)",
        boxShadow: !isMuted ? "0 0 8px rgba(0, 255, 255, 0.4)" : "none"
      }, "aria-label": isMuted ? "開啟麥克風" : "關閉麥克風", title: isMuted ? "開啟麥克風" : "關閉麥克風", children: [
        isMuted ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "w-4 h-4 md:w-5 md:h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "w-4 h-4 md:w-5 md:h-5" }),
        !isMuted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded animate-ping opacity-30", style: {
          backgroundColor: "var(--cyan)",
          animationDuration: "2s"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsExpanded((v) => !v), className: "cyber-btn w-6 h-9 md:h-10 flex items-center justify-center p-0 ml-0.5", style: {
        borderColor: "rgba(0, 255, 255, 0.2)",
        color: "rgba(0, 255, 255, 0.6)",
        fontSize: "10px"
      }, "aria-label": isExpanded ? "收起語音面板" : "展開語音面板", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3" }) })
    ] }),
    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-full right-0 mt-2 w-64 z-50 cyber-card border-neon-cyan p-3 space-y-3", style: {
      background: "linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)",
      backdropFilter: "blur(8px)",
      boxShadow: "0 4px 20px rgba(0, 255, 255, 0.2)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-xs p-2 rounded", style: {
        backgroundColor: "rgba(255, 200, 0, 0.08)",
        border: "1px solid rgba(255, 200, 0, 0.2)",
        color: "hsl(45, 80%, 70%)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "需要 WebRTC 伺服器支援才能傳輸語音" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", style: {
            color: "var(--cyan)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wide", children: "音量" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber", style: {
            color: "var(--text-secondary)"
          }, children: volume })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 100, value: volume, onChange: handleVolumeInput, className: "w-full h-1.5 rounded-full appearance-none cursor-pointer", style: {
          background: `linear-gradient(to right, var(--cyan) 0%, var(--cyan) ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`,
          accentColor: "var(--cyan)"
        }, "aria-label": "語音音量" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-2 border-t", style: {
        borderColor: "rgba(0, 255, 255, 0.15)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", style: {
            color: "var(--cyan)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wide", children: "語音轉文字" })
          ] }),
          !sttSupported && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: {
            color: "var(--text-muted)"
          }, children: "瀏覽器不支援" }),
          sttSupported && isListening && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1", style: {
            color: "var(--red)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full animate-pulse", style: {
              backgroundColor: "hsl(0, 100%, 60%)",
              boxShadow: "0 0 6px hsl(0, 100%, 60%)"
            } }),
            "正在聆聽..."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleToggleStt, disabled: !sttSupported, className: "w-full py-1.5 text-xs font-cyber transition-all rounded", style: {
          border: `1px solid ${sttSupported ? sttEnabled ? "var(--pink)" : "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
          color: sttSupported ? sttEnabled ? "var(--pink)" : "var(--text-secondary)" : "rgba(255,255,255,0.2)",
          background: sttEnabled ? "rgba(255, 107, 157, 0.1)" : "transparent",
          boxShadow: sttEnabled ? "0 0 6px rgba(255, 107, 157, 0.3)" : "none",
          cursor: sttSupported ? "pointer" : "not-allowed"
        }, children: sttEnabled ? "關閉語音轉文字" : "開啟語音轉文字" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t", style: {
        borderColor: "rgba(0, 255, 255, 0.15)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", style: {
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber tracking-wide", children: [
            "語音成員 (",
            voiceParticipants.length,
            "/",
            playerNames.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 max-h-32 overflow-y-auto", children: playerNames.map((name, idx) => {
          const isSpeaking = voiceParticipants.includes(idx);
          const isMe = idx === currentPlayerIndex;
          const color = playerColors[idx] || "var(--cyan)";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs py-1 px-2 rounded", style: {
            backgroundColor: isMe ? "rgba(0, 255, 255, 0.06)" : "transparent"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full flex-shrink-0", style: {
                backgroundColor: color,
                boxShadow: isSpeaking ? `0 0 6px ${color}` : "none"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", style: {
                color: "var(--text-primary)"
              }, children: [
                name,
                isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "var(--text-muted)"
                }, children: "（我）" })
              ] })
            ] }),
            isSpeaking ? /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "w-3 h-3 flex-shrink-0", style: {
              color
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "w-3 h-3 flex-shrink-0", style: {
              color: "var(--text-muted)"
            } })
          ] }, idx);
        }) })
      ] })
    ] })
  ] });
};
const DEFAULT_VOLUME = 70;
function checkSttSupported() {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
function createRecognition() {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}
function useVoice(options = {}) {
  const {
    serverVoiceParticipants = [],
    toggleApi,
    onSendMessage
  } = options;
  const [muted, setMuted] = reactExports.useState(true);
  const [volume, setVolumeState] = reactExports.useState(DEFAULT_VOLUME);
  const [sttEnabled, setSttEnabled] = reactExports.useState(false);
  const [isListening, setIsListening] = reactExports.useState(false);
  const [transcript, setTranscript] = reactExports.useState("");
  const [sttSupported] = reactExports.useState(() => checkSttSupported());
  const recognitionRef = reactExports.useRef(null);
  const shouldRestartRef = reactExports.useRef(false);
  const toggleMute = reactExports.useCallback(() => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (toggleApi) {
      toggleApi(nextMuted).catch((err) => {
        logger.error("語音切換失敗", {
          error: String(err)
        });
        setMuted(muted);
      });
    }
  }, [muted, toggleApi]);
  const setVolume = reactExports.useCallback((v) => {
    const clamped = Math.max(0, Math.min(100, v));
    setVolumeState(clamped);
  }, []);
  const toggleStt = reactExports.useCallback((enabled) => {
    if (!sttSupported && enabled) {
      logger.warn({
        message: "瀏覽器不支援語音識別"
      });
      return;
    }
    setSttEnabled(enabled);
    if (!enabled) {
      shouldRestartRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
      }
    }
  }, [sttSupported]);
  reactExports.useEffect(() => {
    if (!sttSupported) return;
    if (!sttEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
        }
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }
    const recognition = createRecognition();
    if (!recognition) return;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "zh-HK";
    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcriptText = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += transcriptText;
        } else {
          interimText += transcriptText;
        }
      }
      setTranscript(interimText || finalText);
      if (finalText.trim()) {
        const trimmed = finalText.trim();
        logger.info({
          message: `語音識別完成: ${trimmed}`
        });
        if (onSendMessage) {
          try {
            onSendMessage(trimmed);
          } catch (err) {
            logger.error("語音消息發送失敗", {
              error: String(err)
            });
          }
        }
        setTranscript("");
      }
    };
    recognition.onerror = (event) => {
      logger.error("語音識別錯誤", {
        error: event.error,
        message: event.message
      });
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldRestartRef.current = false;
        setSttEnabled(false);
        setIsListening(false);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      if (shouldRestartRef.current && sttEnabled) {
        try {
          setTimeout(() => {
            if (shouldRestartRef.current) {
              try {
                recognitionRef.current?.start();
              } catch {
              }
            }
          }, 100);
        } catch {
        }
      }
    };
    recognition.onstart = () => {
      setIsListening(true);
    };
    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    try {
      recognition.start();
    } catch (err) {
      logger.error("語音識別啟動失敗", {
        error: String(err)
      });
      setSttEnabled(false);
    }
    return () => {
      shouldRestartRef.current = false;
      try {
        recognition.abort();
      } catch {
      }
      recognitionRef.current = null;
      setIsListening(false);
    };
  }, [sttEnabled, sttSupported, onSendMessage]);
  return {
    muted,
    volume,
    voiceParticipants: serverVoiceParticipants,
    toggleMute,
    setVolume,
    sttEnabled,
    isListening,
    transcript,
    sttSupported,
    toggleStt
  };
}
const OnlineRoomPage = () => {
  const navigate = useNavigate();
  const {
    code
  } = useParams();
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get("player");
  const getInitialPlayerIndex = () => {
    if (playerParam !== null) {
      const idx = parseInt(playerParam, 10);
      if (!isNaN(idx) && idx >= 0) return idx;
    }
    try {
      const raw = sessionStorage.getItem("monopoly_online_room");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.roomCode === code && typeof parsed.playerIndex === "number") {
          return parsed.playerIndex;
        }
      }
    } catch {
    }
    return 0;
  };
  const myPlayerIndex = getInitialPlayerIndex();
  const roomCode = code || "";
  const [roomState, setRoomState] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [selectedMode, setSelectedMode] = reactExports.useState("classic");
  const [actionLoading, setActionLoading] = reactExports.useState(false);
  const [showFateModal, setShowFateModal] = reactExports.useState(false);
  const [showChanceModal, setShowChanceModal] = reactExports.useState(false);
  const [showEndModal, setShowEndModal] = reactExports.useState(false);
  const [copySuccess, setCopySuccess] = reactExports.useState(false);
  const [isRolling, setIsRolling] = reactExports.useState(false);
  const [diceValues, setDiceValues] = reactExports.useState([1, 1]);
  const [selectedCellId, setSelectedCellId] = reactExports.useState(null);
  const [showPropertyAction, setShowPropertyAction] = reactExports.useState(false);
  const [showTradeModal, setShowTradeModal] = reactExports.useState(false);
  const [tradeTargetIndex, setTradeTargetIndex] = reactExports.useState(null);
  const [selectedProfession, setSelectedProfession] = reactExports.useState(void 0);
  const [showStockPanel, setShowStockPanel] = reactExports.useState(false);
  const [showAchievementModal, setShowAchievementModal] = reactExports.useState(false);
  const [globalEventToShow, setGlobalEventToShow] = reactExports.useState(null);
  const [toastAchievement, setToastAchievement] = reactExports.useState(null);
  const [showStatsPanel, setShowStatsPanel] = reactExports.useState(false);
  const [showPlayerList, setShowPlayerList] = reactExports.useState(false);
  const [showChatPanel, setShowChatPanel] = reactExports.useState(false);
  const [unreadChatCount, setUnreadChatCount] = reactExports.useState(0);
  const heartbeatRef = reactExports.useRef(null);
  const [nowTick, setNowTick] = reactExports.useState(Date.now());
  const [connectionStatus, setConnectionStatus] = reactExports.useState("normal");
  const [retryCount, setRetryCount] = reactExports.useState(0);
  const [showReconnectToast, setShowReconnectToast] = reactExports.useState(false);
  const [roomNotFound, setRoomNotFound] = reactExports.useState(false);
  const consecutiveFailuresRef = reactExports.useRef(0);
  const reconnectTimerRef = reactExports.useRef(null);
  const reconnectToastTimerRef = reactExports.useRef(null);
  const errorTimerRef = reactExports.useRef(null);
  const copyTimerRef = reactExports.useRef(null);
  const pollIntervalRef = reactExports.useRef(1500);
  const [disconnectMap, setDisconnectMap] = reactExports.useState({});
  const tickIntervalRef = reactExports.useRef(null);
  const lastTradeIdRef = reactExports.useRef(null);
  const lastGlobalEventRef = reactExports.useRef(null);
  const toastQueueRef = reactExports.useRef([]);
  const prevLogLengthRef = reactExports.useRef(0);
  const {
    unlocked: unlockedAchievements,
    unlockMany: unlockAchievements
  } = useAchievements();
  const audio = useAudio();
  const voiceParticipants = roomState?.voiceParticipants ?? [];
  const voicePlayerNames = reactExports.useMemo(() => {
    if (!roomState) return [];
    return (roomState.players ?? []).map((p) => p.name);
  }, [roomState]);
  const voicePlayerColors = reactExports.useMemo(() => {
    if (!roomState) return [];
    return (roomState.players ?? []).map((p) => PLAYER_COLOR_HEX[p.color] || "var(--cyan)");
  }, [roomState]);
  const voice = useVoice({
    serverVoiceParticipants: voiceParticipants,
    toggleApi: (muted) => monopolyApi.toggleVoice(roomCode, myPlayerIndex, muted),
    onSendMessage: (text) => {
      monopolyApi.sendChat(roomCode, myPlayerIndex, text, "voice").catch((err) => {
        logger.error("語音轉文字發送失敗", {
          error: String(err)
        });
      });
      fetchRoom().catch(() => {
      });
    }
  });
  const isSpectatorMode = searchParams.get("spectator") === "1";
  const spectatorId = searchParams.get("visitorId") || `spec_${Date.now()}`;
  const spectatorNickname = searchParams.get("nickname") || "觀戰者";
  const [followView, setFollowView] = reactExports.useState("free");
  const [localDanmaku, setLocalDanmaku] = reactExports.useState([]);
  const [danmakuColor, setDanmakuColor] = reactExports.useState("#00f5ff");
  const danmakuMessages = reactExports.useMemo(() => {
    const serverMsgs = (roomState?.danmaku ?? []).map((d) => ({
      id: String(d.id),
      sender: d.sender,
      content: d.content,
      color: d.color
    }));
    return [...serverMsgs, ...localDanmaku];
  }, [roomState?.danmaku, localDanmaku]);
  const handleSendDanmaku = reactExports.useCallback(async (content, color) => {
    try {
      await monopolyApi.sendDanmaku(roomCode, spectatorId, spectatorNickname, content, color);
      const tempId = `temp_${Date.now()}`;
      setLocalDanmaku((prev) => [...prev, {
        id: tempId,
        sender: spectatorId,
        content,
        color
      }]);
    } catch (err) {
      logger.error("發送彈幕失敗", {
        error: String(err)
      });
    }
  }, [roomCode, spectatorId, spectatorNickname, danmakuColor]);
  const handleFollowPlayer = reactExports.useCallback(async (playerIndex) => {
    if (playerIndex === null) {
      setFollowView("free");
    } else {
      setFollowView(playerIndex);
    }
    if (isSpectatorMode) {
      try {
        await monopolyApi.spectatorFollow(roomCode, spectatorId, playerIndex);
      } catch (err) {
        logger.error("設置跟隨視角失敗", {
          error: String(err)
        });
      }
    }
  }, [isSpectatorMode, roomCode, spectatorId]);
  const spectators = reactExports.useMemo(() => roomState?.spectators ?? [], [roomState]);
  const pollRef = reactExports.useRef(null);
  const lastFateIdRef = reactExports.useRef(null);
  const lastChanceIdRef = reactExports.useRef(null);
  const playerColors = reactExports.useMemo(() => {
    if (!roomState) return {};
    const map = {};
    roomState.players.forEach((p, i) => {
      if (p.color) map[i] = p.color;
    });
    return map;
  }, [roomState]);
  const gameStats = reactExports.useMemo(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return null;
    return calculateGameStats(gs2);
  }, [roomState?.gameState]);
  const propertyCounts = reactExports.useMemo(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return {};
    const counts = {};
    for (let i = 0; i < gs2.players.length; i++) {
      counts[i] = 0;
    }
    for (const prop of Object.values(gs2.properties)) {
      if (prop.owner >= 0 && prop.owner < gs2.players.length) {
        counts[prop.owner] = (counts[prop.owner] || 0) + 1;
      }
    }
    return counts;
  }, [roomState?.gameState]);
  const fetchRoom = reactExports.useCallback(async () => {
    try {
      const room = await monopolyApi.getRoom(roomCode, myPlayerIndex);
      setRoomState(room);
      setError(null);
      consecutiveFailuresRef.current = 0;
      if (connectionStatus !== "normal") {
        setConnectionStatus("normal");
        setRetryCount(0);
        pollIntervalRef.current = 1500;
        if (connectionStatus === "reconnecting") {
          setShowReconnectToast(true);
          if (reconnectToastTimerRef.current) clearTimeout(reconnectToastTimerRef.current);
          reconnectToastTimerRef.current = setTimeout(() => {
            setShowReconnectToast(false);
            reconnectToastTimerRef.current = null;
          }, 2e3);
        }
      }
      const serverUnread = room.unreadCount;
      if (!showChatPanel && typeof serverUnread === "number") {
        if (serverUnread > unreadChatCount) {
          const diff = serverUnread - unreadChatCount;
          if (diff > 0 && unreadChatCount > 0) {
            audio.playSfx("click");
          }
          setUnreadChatCount(serverUnread);
        } else if (serverUnread === 0 && unreadChatCount > 0) {
          setUnreadChatCount(0);
        }
      }
      const disconnected = room.disconnectedPlayers || [];
      setDisconnectMap((prev) => {
        const next = {
          ...prev
        };
        for (const idx of Object.keys(next).map(Number)) {
          if (!disconnected.includes(idx)) {
            delete next[idx];
          }
        }
        for (const idx of disconnected) {
          if (next[idx] === void 0) {
            next[idx] = Date.now();
          }
        }
        return next;
      });
    } catch (err) {
      logger.error("获取房间失败", {
        error: String(err)
      });
      const errAny = err;
      const status = errAny.response?.status;
      if (status === 404 || status === 403) {
        setError("房間不存在或已解散");
        setRoomNotFound(true);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        return;
      }
      setError("無法取得房間資訊。聯機功能於靜態版不可用，部署後端後即可使用。");
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= 3 && connectionStatus === "normal") {
        setConnectionStatus("reconnecting");
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [roomCode, myPlayerIndex, connectionStatus, showChatPanel, audio, unreadChatCount]);
  reactExports.useEffect(() => {
    if (!roomCode) return;
    fetchRoom();
    pollRef.current = setInterval(fetchRoom, pollIntervalRef.current);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomCode, fetchRoom]);
  reactExports.useEffect(() => {
    if (!roomCode) return;
    const doHeartbeat = async () => {
      try {
        await monopolyApi.sendHeartbeat(roomCode, myPlayerIndex);
      } catch (err) {
        logger.error("心跳失败", {
          error: String(err)
        });
      }
    };
    void doHeartbeat();
    heartbeatRef.current = setInterval(doHeartbeat, 5e3);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [roomCode, myPlayerIndex]);
  reactExports.useEffect(() => {
    const hasDisconnect = Object.keys(disconnectMap).length > 0;
    if (!hasDisconnect) {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }
    if (!tickIntervalRef.current) {
      tickIntervalRef.current = setInterval(() => {
        setNowTick(Date.now());
      }, 1e3);
    }
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [disconnectMap]);
  reactExports.useEffect(() => {
    if (connectionStatus !== "reconnecting") {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      return;
    }
    const doRetry = () => {
      setRetryCount((prev) => {
        const next = prev + 1;
        if (next <= 5) {
          pollIntervalRef.current = 2e3;
        } else if (next <= 10) {
          pollIntervalRef.current = 5e3;
        } else {
          setConnectionStatus("failed");
          if (pollRef.current) clearInterval(pollRef.current);
          return next;
        }
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(fetchRoom, pollIntervalRef.current);
        return next;
      });
    };
    const interval = retryCount <= 5 ? 2e3 : 5e3;
    reconnectTimerRef.current = setTimeout(doRetry, interval);
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [connectionStatus, retryCount, fetchRoom]);
  reactExports.useEffect(() => {
    if (!roomCode) return;
    try {
      sessionStorage.setItem("monopoly_online_room", JSON.stringify({
        roomCode,
        playerIndex: myPlayerIndex,
        maxPlayers: roomState?.maxPlayers
      }));
    } catch {
    }
  }, [roomCode, myPlayerIndex, roomState?.maxPlayers]);
  const clearRoomSession = reactExports.useCallback(() => {
    try {
      sessionStorage.removeItem("monopoly_online_room");
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (reconnectToastTimerRef.current) clearTimeout(reconnectToastTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);
  const handleToggleChat = reactExports.useCallback(() => {
    setShowChatPanel((prev) => !prev);
  }, []);
  const handleMarkChatRead = reactExports.useCallback(async () => {
    try {
      await monopolyApi.markChatRead(roomCode, myPlayerIndex);
      setUnreadChatCount(0);
    } catch (err) {
      logger.error("标记已读失败", {
        error: String(err)
      });
    }
  }, [roomCode, myPlayerIndex]);
  const handleSendChat = reactExports.useCallback(async (content) => {
    try {
      await monopolyApi.sendChat(roomCode, myPlayerIndex, content);
      audio.playSfx("click");
      await fetchRoom();
    } catch (err) {
      logger.error("发送聊天消息失败", {
        error: String(err)
      });
      setError("訊息發送失敗");
    }
  }, [roomCode, myPlayerIndex, audio, fetchRoom]);
  reactExports.useCallback(async () => {
    try {
      await monopolyApi.surrenderDisconnected(roomCode, myPlayerIndex);
      await fetchRoom();
    } catch (err) {
      logger.error("判定断线对方负失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    }
  }, [roomCode, myPlayerIndex, fetchRoom]);
  const handleContinueRetry = reactExports.useCallback(() => {
    setConnectionStatus("reconnecting");
    setRetryCount(5);
    consecutiveFailuresRef.current = 3;
    pollIntervalRef.current = 5e3;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchRoom, 5e3);
  }, [fetchRoom]);
  reactExports.useEffect(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return;
    if (gs2.phase !== "fate") return;
    const card = gs2.pendingFateCard;
    if (!card) return;
    if (lastFateIdRef.current === card.id) return;
    lastFateIdRef.current = card.id;
    setShowFateModal(true);
    const t = setTimeout(() => setShowFateModal(false), 2e3);
    return () => clearTimeout(t);
  }, [roomState?.gameState?.phase, roomState?.gameState?.pendingFateCard?.id]);
  reactExports.useEffect(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return;
    if (gs2.phase !== "chance") return;
    const card = gs2.pendingChanceCard;
    if (!card) return;
    if (lastChanceIdRef.current === card.id) return;
    lastChanceIdRef.current = card.id;
    setShowChanceModal(true);
    const t = setTimeout(() => setShowChanceModal(false), 2e3);
    return () => clearTimeout(t);
  }, [roomState?.gameState?.phase, roomState?.gameState?.pendingChanceCard?.id]);
  reactExports.useEffect(() => {
    if (roomState?.status === "ended" || roomState?.gameState?.phase === "ended") {
      setShowEndModal(true);
      setShowStatsPanel(true);
    }
  }, [roomState?.status, roomState?.gameState?.phase]);
  reactExports.useEffect(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return;
    const trade = gs2.pendingTrade;
    if (!trade) return;
    if (trade.toPlayer !== myPlayerIndex) return;
    if (lastTradeIdRef.current === trade.id) return;
    lastTradeIdRef.current = trade.id;
    setShowTradeModal(true);
  }, [roomState?.gameState?.pendingTrade?.id, myPlayerIndex]);
  reactExports.useEffect(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return;
    const event = gs2.currentGlobalEvent;
    if (!event) {
      lastGlobalEventRef.current = null;
      return;
    }
    if (lastGlobalEventRef.current === event) return;
    lastGlobalEventRef.current = event;
    setGlobalEventToShow(event);
    audio.playGlobalEvent();
  }, [roomState?.gameState?.currentGlobalEvent, audio]);
  reactExports.useEffect(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) return;
    const newlyUnlocked = checkAchievements(gs2, myPlayerIndex);
    if (newlyUnlocked.length === 0) return;
    const newlyStored = unlockAchievements(newlyUnlocked);
    if (newlyStored.length > 0) {
      toastQueueRef.current = [...toastQueueRef.current, ...newlyStored];
      if (!toastAchievement) {
        const next = toastQueueRef.current.shift();
        if (next) {
          setToastAchievement(next);
          audio.playAchievement();
        }
      }
    }
  }, [roomState?.gameState, myPlayerIndex, unlockAchievements, toastAchievement, audio]);
  const handleAchievementToastClose = reactExports.useCallback(() => {
    const next = toastQueueRef.current.shift();
    if (next) {
      setToastAchievement(next);
      audio.playAchievement();
    } else {
      setToastAchievement(null);
    }
  }, [audio]);
  reactExports.useEffect(() => {
    const gs2 = roomState?.gameState;
    if (!gs2) {
      prevLogLengthRef.current = 0;
      return;
    }
    const logs = gs2.logs;
    const prevLen = prevLogLengthRef.current;
    if (logs.length <= prevLen) {
      prevLogLengthRef.current = logs.length;
      return;
    }
    const newLogs = logs.slice(prevLen);
    prevLogLengthRef.current = logs.length;
    for (const log of newLogs) {
      const txt = log.text;
      if (log.type === "player1" || log.type === "player2") {
        if (txt.includes("掷出")) {
          audio.playDiceRoll();
        } else if (txt.includes("购得") || txt.includes("购买")) {
          audio.playBuy();
        } else if (txt.includes("支付过路费")) {
          audio.playToll();
        } else if (txt.includes("进入") && txt.includes("禁闭区")) {
          audio.playDetention();
        } else if (txt.includes("出狱") || txt.includes("释放")) {
          audio.playRelease();
        } else if (txt.includes("建造") || txt.includes("升级")) {
          audio.playBuild();
        } else if (txt.includes("抵押") || txt.includes("赎回")) {
          audio.playMortgage();
        }
      } else if (log.type === "fate") {
        audio.playFateCard();
      } else if (log.type === "chance") {
        audio.playChanceCard();
      } else if (log.type === "trade" && txt.includes("完成")) {
        audio.playTrade();
      } else if (log.type === "auction") {
        audio.playAuction();
      } else if (log.type === "system" && txt.includes("破产")) {
        audio.playBankruptcy();
      }
    }
  }, [roomState?.gameState?.logs.length, roomState?.gameState, audio]);
  const handleStartGame = async () => {
    if (!isHost) return;
    if (actionLoading) return;
    if (!roomState) return;
    audio.init();
    audio.startBGM();
    setActionLoading(true);
    try {
      const room = await monopolyApi.startGame(roomCode, myPlayerIndex, selectedMode);
      setRoomState(room);
    } catch (err) {
      logger.error("開始遊戲失敗", {
        error: String(err)
      });
      setError("開始遊戲失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleRollDice = async () => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (roomState.gameState.currentPlayerIndex !== myPlayerIndex) return;
    if (roomState.gameState.phase !== "rolling") return;
    audio.init();
    audio.startBGM();
    setActionLoading(true);
    setIsRolling(true);
    setDiceValues([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    try {
      const room = await monopolyApi.rollDice(roomCode, myPlayerIndex);
      setRoomState(room);
      if (room.gameState?.lastDiceValues) {
        setDiceValues(room.gameState.lastDiceValues);
      }
    } catch (err) {
      logger.error("掷骰子失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
      setIsRolling(false);
    }
  };
  const handlePayBail = async () => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (roomState.gameState.currentPlayerIndex !== myPlayerIndex) return;
    if (roomState.gameState.phase !== "rolling") return;
    const player = roomState.gameState.players[myPlayerIndex];
    if (!player?.isInDetention) return;
    if (player.money < BAIL_AMOUNT) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.payBail(roomCode, myPlayerIndex);
      setRoomState(room);
      setError(`支付 ${BAIL_AMOUNT} 元保釋金，當即獲釋`);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setError(null);
        errorTimerRef.current = null;
      }, 2e3);
    } catch (err) {
      logger.error("保釋失敗", {
        error: String(err)
      });
      setError("保釋失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDiceComplete = () => {
  };
  const handleBuy = async (buy) => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.buyProperty(roomCode, myPlayerIndex, buy);
      setRoomState(room);
    } catch (err) {
      logger.error("购买操作失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleCellClick = (cellId) => {
    if (!roomState?.gameState) return;
    if (!isMyTurn) return;
    if (roomState.gameState.phase !== "rolling") return;
    const prop = roomState.gameState.properties[cellId];
    if (!prop || prop.owner !== myPlayerIndex) return;
    setSelectedCellId(cellId);
    setShowPropertyAction(true);
  };
  const handleBuild = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.buildHouse(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error("建造失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDemolish = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.demolishBuilding(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error("拆除失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleMortgage = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.mortgageProperty(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error("抵押失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleRedeem = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.redeemProperty(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error("赎回失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleBuyInsurance = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.buyInsurance(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error("购买保险失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleOpenTrade = () => {
    if (!roomState?.gameState) return;
    setTradeTargetIndex(null);
    setShowTradeModal(true);
  };
  const handleSelectTradeTarget = (targetIndex) => {
    setTradeTargetIndex(targetIndex);
  };
  const handleProposeTrade = async (given, received, money) => {
    if (actionLoading || tradeTargetIndex === null) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.proposeTrade(roomCode, myPlayerIndex, tradeTargetIndex, given, received, money);
      setRoomState(room);
      setShowTradeModal(false);
      setTradeTargetIndex(null);
    } catch (err) {
      logger.error("发起交易失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleAcceptTrade = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.respondTrade(roomCode, myPlayerIndex, true);
      setRoomState(room);
      setShowTradeModal(false);
    } catch (err) {
      logger.error("接受交易失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleRejectTrade = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.respondTrade(roomCode, myPlayerIndex, false);
      setRoomState(room);
      setShowTradeModal(false);
    } catch (err) {
      logger.error("拒绝交易失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleSelectProfession = async () => {
    if (actionLoading || !selectedProfession) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.selectProfession(roomCode, myPlayerIndex, selectedProfession);
      setRoomState(room);
    } catch (err) {
      logger.error("选择职业失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleStartAuction = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.startAuction(roomCode, myPlayerIndex);
      setRoomState(room);
    } catch (err) {
      logger.error("发起拍卖失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleAuctionBid = async (bidAmount) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.auctionBid(roomCode, myPlayerIndex, bidAmount);
      setRoomState(room);
    } catch (err) {
      logger.error("拍卖出价失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleAuctionPass = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.auctionPass(roomCode, myPlayerIndex);
      setRoomState(room);
    } catch (err) {
      logger.error("放弃拍卖失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleBuyStock = async (symbol, quantity) => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (!isMyTurn) return;
    if (roomState.gameState.phase === "ended") return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.buyStock(roomCode, myPlayerIndex, symbol, quantity);
      setRoomState(room);
    } catch (err) {
      logger.error("买入股票失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleSellStock = async (symbol, quantity) => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (!isMyTurn) return;
    if (roomState.gameState.phase === "ended") return;
    setActionLoading(true);
    try {
      const room = await monopolyApi.sellStock(roomCode, myPlayerIndex, symbol, quantity);
      setRoomState(room);
    } catch (err) {
      logger.error("卖出股票失败", {
        error: String(err)
      });
      setError("操作失敗，請重試");
    } finally {
      setActionLoading(false);
    }
  };
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopySuccess(false);
        copyTimerRef.current = null;
      }, 2e3);
    } catch {
      setCopySuccess(false);
    }
  };
  const handleBackToMenu = async () => {
    try {
      if (roomCode && myPlayerIndex !== void 0) {
        await monopolyApi.leaveRoom(roomCode, myPlayerIndex);
      }
    } catch (e) {
    }
    clearRoomSession();
    navigate("/");
  };
  const isReconnectEntry = reactExports.useMemo(() => {
    try {
      const raw = sessionStorage.getItem("monopoly_online_room");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed.roomCode === roomCode && parsed.playerIndex === myPlayerIndex;
    } catch {
      return false;
    }
  }, [roomCode, myPlayerIndex]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-cyan pulse-glow text-xl font-cyber", children: isReconnectEntry ? "正在重新連線..." : "連線中..." }) });
  }
  if (error && !roomState) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-pink font-cyber text-xl", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBackToMenu, className: "cyber-btn px-6 py-2", children: "返回主選單" })
    ] });
  }
  if (!roomState) return null;
  const gs = roomState.gameState;
  const isHost = myPlayerIndex === roomState.hostIndex;
  const isWaiting = roomState.status === "waiting";
  const isPlaying = roomState.status === "playing" && gs !== null;
  const isEnded = roomState.status === "ended" || gs?.phase === "ended";
  const myPlayer = gs ? gs.players[myPlayerIndex] : null;
  const currentPlayer = gs ? gs.players[gs.currentPlayerIndex] : null;
  const isMyTurn = gs && gs.currentPlayerIndex === myPlayerIndex;
  const tradeMode = (() => {
    if (gs?.pendingTrade && gs.pendingTrade.toPlayer === myPlayerIndex) return "respond";
    if (tradeTargetIndex !== null) return "propose";
    return "selectTarget";
  })();
  const otherDisconnected = Object.entries(disconnectMap).map(([idx, time]) => ({
    index: Number(idx),
    time
  })).filter((d) => d.index !== myPlayerIndex);
  const hasOtherDisconnect = otherDisconnected.length > 0;
  if (isWaiting) {
    const playerCount = (roomState.players ?? []).length;
    const maxPlayers = roomState.maxPlayers || 2;
    const canStart = isHost && playerCount >= 2;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex items-center justify-center p-4 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 z-30 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChatButton, { hasNewMessage: unreadChatCount > 0, messageCount: unreadChatCount, onClick: handleToggleChat }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceControl, { currentPlayerIndex: myPlayerIndex, voiceParticipants, playerNames: voicePlayerNames, playerColors: voicePlayerColors, isMuted: voice.muted, volume: voice.volume, onToggleMute: voice.toggleMute, onVolumeChange: voice.setVolume, sttEnabled: voice.sttEnabled, isListening: voice.isListening, sttSupported: voice.sttSupported, onToggleStt: voice.toggleStt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsButton, { onFirstInteract: () => {
          audio.init();
          audio.startBGM();
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeControl, { onFirstInteract: () => {
          audio.init();
          audio.startBGM();
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card border-neon-cyan p-6 md:p-8 w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-neon-pink font-cyber text-2xl md:text-3xl text-center mb-2 pulse-glow", children: "聯機房間" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary text-sm text-center mb-6", children: isHost ? "等待玩家加入..." : "等待房主開始遊戲..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-text-secondary text-xs font-cyber mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "房間碼" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-neon-cyan", children: [
              playerCount,
              "/",
              maxPlayers,
              " 人"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: handleCopyCode, className: "cyber-card border-neon-pink p-4 text-center cursor-pointer hover:shadow-neon-pink transition-all flex items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-pink font-cyber text-3xl md:text-4xl tracking-[0.3em] pulse-glow", children: roomCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 text-text-muted" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-text-muted text-xs mt-2 text-center", children: copySuccess ? "已複製" : "點擊複製房間碼" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-text-secondary text-xs font-cyber mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3 h-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "玩家列表 (",
              playerCount,
              "/",
              maxPlayers,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            (roomState.players ?? []).map((player, idx) => {
              const isHostPlayer = idx === roomState.hostIndex;
              const isMe = idx === myPlayerIndex;
              const colorHex = player.color ? PLAYER_COLOR_HEX[player.color] : "var(--text-secondary)";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-3 flex items-center justify-between", style: {
                borderColor: isMe ? colorHex : "rgba(255,255,255,0.1)",
                boxShadow: isMe ? `0 0 10px ${colorHex}40` : "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 md:gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 md:w-4 md:h-4 rounded-full", style: {
                    backgroundColor: colorHex,
                    boxShadow: `0 0 8px ${colorHex}`
                  } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-primary text-sm md:text-base flex items-center gap-2", children: [
                      player.name,
                      isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-neon-cyan", children: "（我）" })
                    ] }),
                    !player.isOnline && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-text-muted flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "w-3 h-3" }),
                      " 離線"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  isHostPlayer && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-cyber flex items-center gap-1", style: {
                    color: "#ffcc00",
                    textShadow: "0 0 6px rgba(255,204,0,0.5)"
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3" }),
                    "房主"
                  ] }),
                  player.ready && !isHostPlayer && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-green text-xs font-cyber", children: "已就绪" })
                ] })
              ] }, idx);
            }),
            Array.from({
              length: maxPlayers - playerCount
            }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-3 flex items-center justify-center border-dashed opacity-50", style: {
              borderColor: "rgba(255,255,255,0.15)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted text-sm", children: "等待加入..." }) }, `empty-${i}`))
          ] })
        ] }),
        isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-text-secondary text-xs font-cyber mb-2", children: "遊戲模式" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: ["classic", "fast", "crazy"].map((mode) => {
            const selected = selectedMode === mode;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedMode(mode), className: "cyber-btn py-2 text-xs md:text-sm transition-all", style: {
              borderColor: selected ? "var(--pink)" : "rgba(255,255,255,0.15)",
              color: selected ? "var(--pink)" : "var(--text-secondary)",
              background: selected ? "rgba(255, 107, 157, 0.08)" : "transparent"
            }, children: MODE_LABELS[mode] || mode }, mode);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStartGame, disabled: !canStart || actionLoading, className: "cyber-btn cyber-btn-pink w-full py-3 font-cyber tracking-wider", children: actionLoading ? "加载中..." : canStart ? "開始遊戲" : playerCount < 2 ? "等待至少2名玩家" : "開始遊戲" })
        ] }),
        !isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-text-secondary text-sm mb-4 flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-neon-cyan pulse-glow animate-pulse" }),
          "房主正在准备，请耐心等待..."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleBackToMenu, className: "cyber-btn w-full py-2 text-sm flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4" }),
          isHost ? "返回主選單" : "退出房间"
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-neon-pink text-xs text-center", children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { isOpen: showChatPanel, onToggle: handleToggleChat, messages: roomState.messages || [], myPlayerIndex, unreadCount: unreadChatCount, onSend: handleSendChat, onMarkRead: handleMarkChatRead, disabled: isEnded, playerColors })
    ] });
  }
  const currentCell = gs && currentPlayer ? CELLS[currentPlayer.position] : null;
  const buyPrice = gs && myPlayer ? getCellPrice(myPlayer.position, gs.mode) : 0;
  const canAffordBuy = myPlayer ? myPlayer.money >= buyPrice : false;
  const showBuyModal = gs?.phase === "buying" && isMyTurn;
  const showAuction = gs?.phase === "auction" && gs.auction?.active;
  const auctionState = gs?.auction && gs.phase === "auction" ? gs.auction : null;
  const auctionCellId = auctionState?.cellId ?? 0;
  const auctionCellName = auctionState ? CELLS[auctionCellId]?.name || "" : "";
  const auctionCellPrice = auctionState ? getCellPrice(auctionCellId, gs.mode) : 0;
  const auctionActiveBidderPlayerIndex = auctionState ? auctionState.activeBidders[auctionState.activeBidderIndex] ?? 0 : 0;
  const winner = gs?.winner !== null && gs?.winner !== void 0 ? gs.players[gs.winner] : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen p-3 md:p-6 flex flex-col relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 md:top-6 md:right-6 z-30 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowPlayerList((p) => !p), className: "cyber-btn p-2 flex items-center gap-1 text-xs", style: {
        borderColor: "rgba(0, 255, 255, 0.3)",
        color: "var(--cyan)",
        background: "rgba(0, 255, 255, 0.05)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline font-cyber", children: "玩家" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChatButton, { hasNewMessage: unreadChatCount > 0, messageCount: unreadChatCount, onClick: handleToggleChat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceControl, { currentPlayerIndex: myPlayerIndex, voiceParticipants, playerNames: voicePlayerNames, playerColors: voicePlayerColors, isMuted: voice.muted, volume: voice.volume, onToggleMute: voice.toggleMute, onVolumeChange: voice.setVolume }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsButton, { onFirstInteract: () => {
        audio.init();
        audio.startBGM();
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeControl, { onFirstInteract: () => {
        audio.init();
        audio.startBGM();
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block fixed left-4 top-20 w-56 z-20", children: gs && /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerList, { players: gs.players, currentPlayerIndex: gs.currentPlayerIndex, myPlayerIndex, propertyCounts }) }),
    showPlayerList && gs && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden fixed inset-0 bg-black/60 z-40 flex items-start justify-center pt-16 p-4", onClick: () => setShowPlayerList(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-sm", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerList, { players: gs.players, currentPlayerIndex: gs.currentPlayerIndex, myPlayerIndex, propertyCounts }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center mb-3 md:mb-4 lg:ml-60", children: [
      isSpectatorMode && gs && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-cyber tracking-widest px-4 py-1 rounded-full", style: {
        color: "var(--pink)",
        border: "1px solid var(--pink)",
        backgroundColor: "rgba(255, 107, 157, 0.1)",
        boxShadow: "0 0 10px rgba(255, 107, 157, 0.3)"
      }, children: "觀戰中" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[560px] aspect-square relative", children: [
        gs && /* @__PURE__ */ jsxRuntimeExports.jsx(Board, { gameState: gs, onCellClick: isSpectatorMode ? void 0 : handleCellClick }),
        isSpectatorMode && /* @__PURE__ */ jsxRuntimeExports.jsx(DanmakuLayer, { messages: danmakuMessages, speed: 80, maxTracks: 6, maxVisible: 20 })
      ] }),
      isSpectatorMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[560px] mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DanmakuInput, { onSend: handleSendDanmaku, placeholder: "發送彈幕...", selectedColor: danmakuColor, onColorChange: setDanmakuColor }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `cyber-card p-3 md:p-4 lg:ml-60 ${isSpectatorMode ? "opacity-60" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3 md:gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
        myPlayer && gs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-neon-cyan font-cyber text-sm md:text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full", style: {
                backgroundColor: PLAYER_COLOR_HEX[myPlayer.color] || "var(--cyan)",
                boxShadow: `0 0 6px ${PLAYER_COLOR_HEX[myPlayer.color] || "var(--cyan)"}`
              } }),
              myPlayer.name,
              "（我）"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-text-secondary text-xs md:text-sm", children: [
              "現金 ",
              myPlayer.money
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right flex-shrink-0", children: gs.phase === "rolling" && isMyTurn && !isEnded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 md:gap-2 flex-wrap justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleOpenTrade, disabled: actionLoading, className: "cyber-btn px-3 py-2 text-xs md:text-sm", style: {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              background: "rgba(255, 107, 157, 0.08)"
            }, children: "交易" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowStockPanel(true), disabled: actionLoading, className: "cyber-btn px-3 py-2 text-xs md:text-sm", style: {
              borderColor: "hsl(180, 100%, 50%)",
              color: "hsl(180, 100%, 50%)",
              background: "rgba(0, 255, 255, 0.08)"
            }, children: "股票" }),
            myPlayer?.isInDetention && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePayBail, disabled: actionLoading || (myPlayer?.money ?? 0) < BAIL_AMOUNT, className: "cyber-btn px-3 py-2 text-xs md:text-sm", style: {
              borderColor: "var(--purple)",
              color: (myPlayer?.money ?? 0) >= BAIL_AMOUNT ? "var(--purple)" : "rgba(160, 120, 255, 0.4)",
              background: "rgba(160, 120, 255, 0.08)",
              opacity: (myPlayer?.money ?? 0) >= BAIL_AMOUNT ? 1 : 0.5,
              cursor: (myPlayer?.money ?? 0) >= BAIL_AMOUNT ? "pointer" : "not-allowed"
            }, children: [
              "保釋 ",
              BAIL_AMOUNT
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRollDice, disabled: actionLoading, className: "cyber-btn cyber-btn-pink px-4 py-2 text-xs md:text-sm", children: actionLoading ? "操作中..." : myPlayer?.isInDetention ? "监禁摇骰" : "掷骰子" })
          ] }) : gs.phase === "rolling" && !isMyTurn && !isEnded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-neon-pink text-xs md:text-sm font-cyber pulse-glow", children: [
            currentPlayer?.name || "对手",
            " 思考中..."
          ] }) : gs.phase === "buying" && isMyTurn ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-cyan text-xs md:text-sm font-cyber", children: "選擇是否購買" }) : gs.phase === "fate" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-purple text-xs md:text-sm font-cyber pulse-glow", children: "命運時刻" }) : gs.phase === "chance" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            color: "hsl(210, 100%, 60%)"
          }, className: "text-xs md:text-sm font-cyber pulse-glow", children: "機會降臨" }) : gs.phase === "auction" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs md:text-sm font-cyber pulse-glow", style: {
            color: "#ffcc00",
            textShadow: "0 0 8px rgba(255,204,0,0.5)"
          }, children: "拍賣中" }) : isEnded ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-pink font-cyber", children: "已結束" }) : null })
        ] }),
        currentCell && gs && !isEnded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs md:text-sm text-text-secondary", children: [
          "當前位置：",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-cyan ml-1", children: gs.players[myPlayerIndex] ? CELLS[gs.players[myPlayerIndex].position]?.name : "" }),
          gs.lastDiceValues && gs.lastDiceValues[0] > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-text-muted ml-3", children: [
            "上次點數：",
            gs.lastDiceValues[0],
            "+",
            gs.lastDiceValues[1],
            "=",
            gs.lastDiceValues[0] + gs.lastDiceValues[1]
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAchievementModal(true), className: "self-start text-xs font-cyber tracking-wider transition-colors hover:opacity-80", style: {
            color: "hsl(45, 100%, 60%)",
            textShadow: "0 0 6px hsla(45, 100%, 60%, 0.6)"
          }, children: [
            "成就 (",
            unlockedAchievements.size,
            " / ",
            Object.keys(ACHIEVEMENTS).length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowStatsPanel(true), className: "self-start text-xs font-cyber tracking-wider transition-colors hover:opacity-80", style: {
            color: "var(--pink)",
            textShadow: "0 0 6px rgba(255, 107, 157, 0.6)"
          }, children: "統計" })
        ] })
      ] }),
      isSpectatorMode && gs && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:w-72 lg:w-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SpectatorSidebar, { spectators: spectators.map((s) => ({
        id: s.id,
        nickname: s.nickname,
        following: s.following
      })), currentView: followView, onFollowPlayer: handleFollowPlayer, playerNames: roomState?.players.map((p) => p.name) ?? [], playerColors: voicePlayerColors }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:w-72 lg:w-80 h-32 md:h-40 overflow-hidden", children: gs && /* @__PURE__ */ jsxRuntimeExports.jsx(GameLog, { logs: gs.logs }) })
    ] }) }),
    myPlayer && gs && /* @__PURE__ */ jsxRuntimeExports.jsx(BuyModal, { isOpen: !!showBuyModal, cellName: CELLS[myPlayer.position]?.name || "", price: buyPrice, playerMoney: myPlayer.money, canAfford: canAffordBuy && isMyTurn, onBuy: () => handleBuy(true), onAuction: handleStartAuction, onSkip: () => handleBuy(false) }),
    myPlayer && gs && !myPlayer.profession && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfessionSelectModal, { isOpen: isPlaying, playerName: myPlayer.name, playerColor: myPlayer.color, selectedProfession, onSelect: setSelectedProfession, onConfirm: handleSelectProfession, onClose: () => {
    }, disabled: actionLoading }),
    myPlayer && gs && auctionState && showAuction && /* @__PURE__ */ jsxRuntimeExports.jsx(AuctionModal, { isOpen: true, auction: auctionState, cellName: auctionCellName, cellPrice: auctionCellPrice, players: gs.players, activeBidderIndex: auctionActiveBidderPlayerIndex, myPlayerIndex, myMoney: myPlayer.money, onBid: handleAuctionBid, onPass: handleAuctionPass, disabled: actionLoading }),
    gs && selectedCellId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(PropertyActionModal, { isOpen: showPropertyAction, cellId: selectedCellId, gameState: gs, playerIndex: myPlayerIndex, canBuild: isMyTurn && gs.phase === "rolling", onBuild: handleBuild, onDemolish: handleDemolish, onMortgage: handleMortgage, onRedeem: handleRedeem, onBuyInsurance: handleBuyInsurance, onClose: () => setShowPropertyAction(false) }),
    gs && /* @__PURE__ */ jsxRuntimeExports.jsx(TradeModal, { mode: tradeMode, isOpen: showTradeModal, gameState: gs, playerIndex: myPlayerIndex, targetPlayerIndex: tradeTargetIndex ?? void 0, onClose: () => {
      setShowTradeModal(false);
      setTradeTargetIndex(null);
    }, onSelectTarget: handleSelectTradeTarget, onPropose: handleProposeTrade, onAccept: handleAcceptTrade, onReject: handleRejectTrade }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DiceOverlay, { isRolling, values: diceValues, onComplete: handleDiceComplete }),
    gs && gs.pendingFateCard && /* @__PURE__ */ jsxRuntimeExports.jsx(FateCardModal, { isOpen: showFateModal, card: gs.pendingFateCard, onClose: () => setShowFateModal(false) }),
    gs && gs.pendingChanceCard && /* @__PURE__ */ jsxRuntimeExports.jsx(ChanceCardModal, { isOpen: showChanceModal, card: gs.pendingChanceCard, onClose: () => setShowChanceModal(false) }),
    hasOtherDisconnect && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-0 left-0 right-0 z-30 py-2 px-4 text-center text-sm font-cyber tracking-wide", style: {
      background: "linear-gradient(90deg, rgba(255,200,0,0.15), rgba(255,200,0,0.25), rgba(255,200,0,0.15))",
      color: "hsl(45, 100%, 60%)",
      borderBottom: "1px solid rgba(255,200,0,0.3)",
      textShadow: "0 0 6px rgba(255,200,0,0.5)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        otherDisconnected.map((d) => gs.players[d.index]?.name || `玩家${d.index + 1}`).join("、"),
        " ",
        "断线，等待重连中..."
      ] })
    ] }) }),
    connectionStatus === "reconnecting" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card border-neon-cyan p-6 md:p-8 max-w-sm w-full text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-16 mx-auto mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2 border-t-transparent", style: {
            borderColor: "var(--cyan)",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-2 rounded-full border-2 border-b-transparent", style: {
            borderColor: "var(--pink)",
            borderBottomColor: "transparent",
            animation: "spin 1.5s linear infinite reverse"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-neon-cyan font-cyber text-xl mb-2 pulse-glow", style: {
          color: "var(--cyan)",
          textShadow: "0 0 10px rgba(0, 255, 255, 0.5)"
        }, children: "网络中断" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary text-sm mb-2", children: "正在重连..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-text-muted text-xs", children: [
          "重试次数：",
          retryCount,
          " / 10"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes reconnectToastIn {
              from { opacity: 0; transform: translate(-50%, -10px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          ` })
    ] }),
    connectionStatus === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card border-neon-pink p-6 md:p-8 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl mb-4 pulse-glow", style: {
        color: "var(--pink)",
        textShadow: "0 0 10px rgba(255, 107, 157, 0.5)"
      }, children: "重连失败" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary text-sm mb-6", children: "网络连接不稳定，请检查网络后重试" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleContinueRetry, className: "cyber-btn cyber-btn-pink w-full py-3", children: "继续重试" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBackToMenu, className: "cyber-btn w-full py-2 text-sm", children: "返回主選單" })
      ] })
    ] }) }),
    roomNotFound && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card border-neon-pink p-6 md:p-8 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl mb-4 pulse-glow", style: {
        color: "var(--pink)",
        textShadow: "0 0 10px rgba(255, 107, 157, 0.5)"
      }, children: "房間不存在" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary text-sm mb-6", children: "房間可能已解散或你已被移出房间" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBackToMenu, className: "cyber-btn cyber-btn-pink w-full py-3", children: "返回主選單" })
    ] }) }),
    showReconnectToast && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 z-50 cyber-card px-4 py-2 text-sm font-cyber tracking-wide", style: {
      borderColor: "var(--green)",
      color: "var(--green)",
      background: "rgba(0, 255, 150, 0.1)",
      boxShadow: "0 0 12px rgba(0, 255, 150, 0.4)",
      animation: "reconnectToastIn 0.3s ease-out"
    }, children: "已恢復連線" }),
    showEndModal && winner && !showStatsPanel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card border-neon-cyan p-6 md:p-8 max-w-md w-full text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-neon-pink font-cyber text-2xl md:text-3xl mb-4 pulse-glow", children: "遊戲結束" }),
      myPlayerIndex === gs?.winner ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-green font-cyber text-xl md:text-2xl mb-2 pulse-glow", children: "恭喜獲勝！" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-text-secondary text-sm mb-6", children: "你取得了最终胜利" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-neon-pink font-cyber text-xl md:text-2xl mb-2", children: "挑戰失敗" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-text-secondary text-sm mb-6", children: [
          winner.name,
          " 取得胜利"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBackToMenu, className: "cyber-btn cyber-btn-pink px-8 py-2", children: "返回主選單" })
    ] }) }),
    gs && myPlayer && /* @__PURE__ */ jsxRuntimeExports.jsx(StockPanel, { isOpen: showStockPanel, onClose: () => setShowStockPanel(false), stocks: gs.stocks, playerStocks: myPlayer.stocks, playerMoney: myPlayer.money, isMyTurn: !!isMyTurn && gs.phase !== "ended", onBuy: handleBuyStock, onSell: handleSellStock }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalEventModal, { isOpen: globalEventToShow !== null, eventType: globalEventToShow, onClose: () => setGlobalEventToShow(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementModal, { isOpen: showAchievementModal, onClose: () => setShowAchievementModal(false), unlockedAchievements }),
    toastAchievement && /* @__PURE__ */ jsxRuntimeExports.jsx(AchievementToast, { achievementId: toastAchievement, onClose: handleAchievementToastClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatsPanel, { isOpen: showStatsPanel, onClose: () => setShowStatsPanel(false), stats: gameStats, isFinal: isEnded, onBackToMenu: handleBackToMenu }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { isOpen: showChatPanel, onToggle: handleToggleChat, messages: roomState?.messages || [], myPlayerIndex, unreadCount: unreadChatCount, onSend: handleSendChat, onMarkRead: handleMarkChatRead, disabled: isEnded, playerColors }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-4 left-1/2 -translate-x-1/2 cyber-card border-neon-pink px-4 py-2 z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-pink text-sm", children: error }) })
  ] });
};
export {
  OnlineRoomPage as default
};
