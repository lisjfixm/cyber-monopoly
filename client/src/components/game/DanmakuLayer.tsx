import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Settings, X } from 'lucide-react';

export interface DanmakuMessage {
  id: string;
  sender: string;
  content: string;
  color?: string;
}

export interface DanmakuLayerProps {
  messages: DanmakuMessage[];
  speed?: number; // px/s，預設 100
  maxTracks?: number; // 軌道數，預設 6
  maxVisible?: number; // 最大同時顯示條數，預設 20
  enabled?: boolean; // 彈幕開關（預設 true）
  opacity?: number; // 不透明度 0-1（預設 0.9）
  showControls?: boolean; // 是否顯示控制按鈕（預設 true）
}

interface ActiveDanmaku extends DanmakuMessage {
  track: number;
  startTime: number;
  duration: number;
  width: number;
  travelDistance: number;
}

type SpeedPreset = 'slow' | 'normal' | 'fast';

const STORAGE_KEY = 'cyber_monopoly_danmaku_settings';

const NEON_COLORS: string[] = [
  '#ff4d6d', // 紅
  '#ff9500', // 橙
  '#ffd60a', // 黃
  '#06ffa5', // 綠
  '#00f5ff', // 青
  '#4dabf7', // 藍
  '#b197fc', // 紫
  '#ff6b9d', // 粉
];

const DEFAULT_COLORS = [...NEON_COLORS];

const SPEED_PRESETS: Record<SpeedPreset, number> = {
  slow: 60,
  normal: 100,
  fast: 160,
};

function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
}

interface DanmakuSettings {
  enabled: boolean;
  speed: SpeedPreset;
  opacity: number;
  color: string;
}

function loadSettings(): DanmakuSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DanmakuSettings>;
      return {
        enabled: parsed.enabled ?? true,
        speed: parsed.speed ?? 'normal',
        opacity: parsed.opacity ?? 0.9,
        color: parsed.color ?? NEON_COLORS[4],
      };
    }
  } catch {
    // ignore
  }
  return {
    enabled: true,
    speed: 'normal',
    opacity: 0.9,
    color: NEON_COLORS[4],
  };
}

function saveSettings(settings: DanmakuSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const DanmakuLayer: React.FC<DanmakuLayerProps> = ({
  messages,
  speed: propSpeed,
  maxTracks = 6,
  maxVisible = 20,
  enabled: propEnabled,
  opacity: propOpacity,
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [active, setActive] = useState<ActiveDanmaku[]>([]);
  const lastIdRef = useRef<string>('');
  const trackAvailabilityRef = useRef<number[]>(new Array(maxTracks).fill(0));
  const rafRef = useRef<number | null>(null);

  // 設置狀態
  const [settings, setSettings] = useState<DanmakuSettings>(() => loadSettings());
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // 計算實際生效值（props 優先，否則用 settings）
  const effectiveEnabled = propEnabled !== undefined ? propEnabled : settings.enabled;
  const effectiveOpacity = propOpacity !== undefined ? propOpacity : settings.opacity;
  const effectiveSpeed = useMemo((): number => {
    if (propSpeed !== undefined) return propSpeed;
    return SPEED_PRESETS[settings.speed];
  }, [propSpeed, settings.speed]);

  // 保存設置
  const updateSettings = useCallback((patch: Partial<DanmakuSettings>): void => {
    setSettings((prev: DanmakuSettings) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleEnabled = useCallback((): void => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  const handleSpeedChange = useCallback((speed: SpeedPreset): void => {
    updateSettings({ speed });
  }, [updateSettings]);

  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      updateSettings({ opacity: val });
    }
  }, [updateSettings]);

  // 監聽容器寬度變化
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    setContainerWidth(el.offsetWidth);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 估計彈幕寬度（粗略，按字數估算）
  const estimateWidth = useCallback((text: string): number => {
    let width = 0;
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i);
      width += code > 127 ? 16 : 9;
    }
    return width + 16; // padding
  }, []);

  // 選擇空閒軌道
  const pickTrack = useCallback((now: number, danmakuWidth: number): number => {
    const entryTime = (danmakuWidth / effectiveSpeed) * 1000 + 200;

    let bestTrack = 0;
    let earliestFree = Infinity;
    for (let i = 0; i < maxTracks; i += 1) {
      const freeAt = trackAvailabilityRef.current[i] ?? 0;
      if (freeAt <= now) {
        return i;
      }
      if (freeAt < earliestFree) {
        earliestFree = freeAt;
        bestTrack = i;
      }
    }
    return bestTrack;
  }, [maxTracks, effectiveSpeed]);

  // 新消息入隊
  useEffect(() => {
    if (!effectiveEnabled) return;
    if (messages.length === 0) return;

    const lastIdx = messages.findIndex((m) => m.id === lastIdRef.current);
    const newMessages = lastIdx === -1 ? messages : messages.slice(lastIdx + 1);
    if (newMessages.length === 0) return;

    const now = performance.now();

    const newActives: ActiveDanmaku[] = [];
    for (const msg of newMessages) {
      const width = estimateWidth(msg.content);
      const travelDistance = containerWidth + width;
      const duration = (travelDistance / effectiveSpeed) * 1000; // ms
      const track = pickTrack(now, width);

      const entryTimeMs = (width / effectiveSpeed) * 1000 + 200;
      trackAvailabilityRef.current[track] = now + entryTimeMs;

      newActives.push({
        ...msg,
        color: msg.color || pickColor(msg.sender),
        track,
        startTime: now,
        duration,
        width,
        travelDistance,
      });
    }

    lastIdRef.current = messages[messages.length - 1].id;

    setActive((prev) => {
      const next = [...prev, ...newActives];
      if (next.length > maxVisible) {
        return next.slice(next.length - maxVisible);
      }
      return next;
    });
  }, [messages, effectiveSpeed, maxVisible, containerWidth, estimateWidth, pickTrack, effectiveEnabled]);

  // 關閉彈幕時清空
  useEffect(() => {
    if (!effectiveEnabled) {
      setActive([]);
      lastIdRef.current = '';
    }
  }, [effectiveEnabled]);

  // 動畫幀：清理已完成的彈幕
  useEffect(() => {
    if (active.length === 0) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = (): void => {
      const now = performance.now();
      setActive((prev) => {
        const filtered = prev.filter((d) => now - d.startTime < d.duration);
        return filtered.length === prev.length ? prev : filtered;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [active.length]);

  // 渲染彈幕
  const rendered = useMemo(() => {
    return active.map((d) => {
      const color = d.color || pickColor(d.sender);
      const trackHeight = 100 / maxTracks;
      const topPercent = d.track * trackHeight + trackHeight * 0.15;
      return (
        <div
          key={d.id}
          className="absolute whitespace-nowrap text-sm font-medium pointer-events-none danmaku-item"
          style={{
            top: `${topPercent}%`,
            left: `${containerWidth}px`,
            color,
            opacity: effectiveOpacity,
            textShadow: `
              0 0 2px #000,
              0 0 4px #000,
              -1px -1px 0 #000,
              1px -1px 0 #000,
              -1px 1px 0 #000,
              1px 1px 0 #000,
              0 0 8px ${color}80
            `,
            animation: `danmaku-scroll ${d.duration}ms linear forwards`,
            animationDelay: '0s',
            willChange: 'transform',
            // 用 CSS 變量傳遞移動距離
            ['--dm-travel' as string]: `-${d.travelDistance}px`,
          } as React.CSSProperties}
        >
          {d.content}
        </div>
      );
    });
  }, [active, maxTracks, containerWidth, effectiveOpacity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        {rendered}
      </div>

      {/* 控制按鈕（右下角） */}
      {showControls && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-auto">
          {/* 彈幕開關 */}
          <button
            type="button"
            onClick={toggleEnabled}
            className="cyber-btn w-8 h-8 flex items-center justify-center p-0 transition-all"
            style={{
              borderColor: effectiveEnabled ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
              color: effectiveEnabled ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
              boxShadow: effectiveEnabled ? '0 0 8px rgba(0, 255, 255, 0.3)' : 'none',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            aria-label={effectiveEnabled ? '關閉彈幕' : '開啟彈幕'}
            title={effectiveEnabled ? '關閉彈幕' : '開啟彈幕'}
          >
            {effectiveEnabled ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* 設置按鈕 */}
          <button
            type="button"
            onClick={() => setShowSettingsPanel((v) => !v)}
            className="cyber-btn w-8 h-8 flex items-center justify-center p-0 transition-all"
            style={{
              borderColor: showSettingsPanel ? 'var(--pink)' : 'rgba(255,255,255,0.2)',
              color: showSettingsPanel ? 'var(--pink)' : 'rgba(255,255,255,0.6)',
              boxShadow: showSettingsPanel ? '0 0 8px rgba(255, 107, 157, 0.3)' : 'none',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            aria-label="彈幕設置"
            title="彈幕設置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 設置面板 */}
      {showControls && showSettingsPanel && (
        <div
          className="absolute bottom-14 right-3 w-64 z-40 cyber-card border-neon-pink p-3 space-y-3 pointer-events-auto"
          style={{
            background: 'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(255, 107, 157, 0.2)',
          }}
        >
          {/* 標題 */}
          <div className="flex items-center justify-between">
            <span
              className="font-cyber text-sm tracking-wide"
              style={{ color: 'var(--pink)', textShadow: '0 0 6px rgba(255, 107, 157, 0.5)' }}
            >
              彈幕設置
            </span>
            <button
              type="button"
              onClick={() => setShowSettingsPanel(false)}
              className="w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="關閉設置"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 速度選擇 */}
          <div className="space-y-1.5">
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              速度
            </div>
            <div className="flex gap-1">
              {(['slow', 'normal', 'fast'] as SpeedPreset[]).map((s) => {
                const active = settings.speed === s;
                const label = s === 'slow' ? '慢' : s === 'normal' ? '中' : '快';
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedChange(s)}
                    className="flex-1 py-1.5 text-xs font-cyber transition-all rounded"
                    style={{
                      border: `1px solid ${active ? 'var(--cyan)' : 'rgba(255,255,255,0.15)'}`,
                      color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                      background: active ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                      boxShadow: active ? '0 0 6px rgba(0, 255, 255, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 不透明度 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>不透明度</span>
              <span className="font-cyber" style={{ color: 'var(--cyan)' }}>
                {Math.round(settings.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.0}
              step={0.1}
              value={settings.opacity}
              onChange={handleOpacityChange}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--cyan) 0%, var(--cyan) ${((settings.opacity - 0.3) / 0.7) * 100}%, rgba(255,255,255,0.1) ${((settings.opacity - 0.3) / 0.7) * 100}%, rgba(255,255,255,0.1) 100%)`,
                accentColor: 'var(--cyan)',
              }}
              aria-label="彈幕不透明度"
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes danmaku-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(var(--dm-travel, -200%));
          }
        }
      `}</style>
    </div>
  );
};

export default DanmakuLayer;
