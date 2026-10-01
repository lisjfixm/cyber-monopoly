import { useEffect, useRef, useState } from "react";
import type { LogEntry } from "@shared/api.interface";
import { Sparkles, Info, User, Zap, TrendingUp, Landmark, Shield, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface GameLogProps {
  logs: LogEntry[];
  inflationRate?: number;
}

const GameLog = ({ logs, inflationRate = 1.0 }: GameLogProps) => {
  const [showInflationTip, setShowInflationTip] = useState(false);
  const hasInflation = inflationRate > 1.0;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type: LogEntry["type"]): { color: string; icon: LucideIcon } => {
    switch (type) {
      case "player1":
        return { color: "var(--red)", icon: User };
      case "player2":
        return { color: "var(--cyan)", icon: User };
      case "fate":
        return { color: "var(--pink)", icon: Sparkles };
      case "loan":
        return { color: "var(--yellow)", icon: Landmark };
      case "insurance":
        return { color: "hsl(180, 100%, 60%)", icon: Shield };
      case "bond":
        return { color: "hsl(45, 100%, 60%)", icon: FileText };
      case "chance":
        return { color: "var(--blue)", icon: Zap };
      case "system":
      default:
        return { color: "var(--cyan)", icon: Info };
    }
  };

  return (
    <div className="cyber-card rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--border-neon-cyan)] flex items-center justify-between">
        <span className="font-cyber text-xs md:text-sm tracking-wider text-neon-cyan">
          系統日誌 / LOG
        </span>
        {/* 通脹倍率顯示 */}
        <div className="relative">
          <button
            onClick={() => setShowInflationTip((v) => !v)}
            onMouseEnter={() => setShowInflationTip(true)}
            onMouseLeave={() => setShowInflationTip(false)}
            className="flex items-center gap-1 px-2 py-0.5 rounded transition-all hover:scale-[1.05]"
            style={{
              border: hasInflation ? '1px solid var(--orange)' : '1px solid var(--text-muted)',
              color: hasInflation ? 'var(--orange)' : 'var(--text-secondary)',
              backgroundColor: hasInflation
                ? 'color-mix(in srgb, var(--orange) 15%, transparent)'
                : 'transparent',
              boxShadow: hasInflation
                ? '0 0 8px color-mix(in srgb, var(--orange) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--orange) 20%, transparent)'
                : 'none',
              textShadow: hasInflation ? '0 0 4px var(--orange)' : 'none',
              animation: hasInflation ? 'inflation-pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="font-cyber text-[10px] md:text-xs tracking-wider">
              通脹 x{inflationRate.toFixed(1)}
            </span>
          </button>
          {showInflationTip && (
            <div
              className="absolute top-full right-0 mt-1.5 px-3 py-2 rounded text-xs whitespace-nowrap z-50 cyber-card"
              style={{
                border: hasInflation ? '1px solid var(--orange)' : '1px solid var(--text-muted)',
                color: 'var(--text-primary)',
                boxShadow: hasInflation
                  ? '0 0 10px color-mix(in srgb, var(--orange) 30%, transparent)'
                  : 'none',
                animation: 'fade-in 0.2s ease-out',
              }}
            >
              <div className="font-cyber tracking-wide mb-1" style={{ color: hasInflation ? 'var(--orange)' : 'var(--text-secondary)' }}>
                通貨膨脹倍率
              </div>
              <div style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
                每10回合上漲10%，影響地價與過路費
              </div>
              <div
                className="absolute -top-1.5 right-3 w-3 h-3 rotate-45"
                style={{
                  borderTop: hasInflation ? '1px solid var(--orange)' : '1px solid var(--text-muted)',
                  borderLeft: hasInflation ? '1px solid var(--orange)' : '1px solid var(--text-muted)',
                  backgroundColor: 'var(--bg-card)',
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="h-[200px] overflow-y-auto p-2 md:p-3 space-y-1.5 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--cyan) transparent" }}
      >
        {logs.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-xs py-4">
            暂无日志
          </div>
        )}
        {logs.map((log) => {
          const style = getLogStyle(log.type);
          const IconComponent = style.icon;
          return (
            <div
              key={log.id}
              className="flex items-start gap-2 text-xs md:text-sm"
              style={{
                animation: "slide-in-right 0.3s ease-out",
              }}
            >
              <IconComponent
                className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5"
                style={{ color: style.color }}
              />
              <span
                className="leading-relaxed break-words"
                style={{
                  color: style.color,
                  textShadow: `0 0 4px ${style.color}40`,
                }}
              >
                {log.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameLog;
