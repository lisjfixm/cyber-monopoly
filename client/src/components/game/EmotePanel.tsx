import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

export interface EmoteItem {
  id: number;
  emoji: string;
  label: string;
}

const EMOTES: EmoteItem[] = [
  { id: 1, emoji: '😮', label: '驚訝' },
  { id: 2, emoji: '😠', label: '憤怒' },
  { id: 3, emoji: '😄', label: '開心' },
  { id: 4, emoji: '😏', label: '得意' },
];

interface FloatingEmote {
  id: number;
  emoji: string;
  x: number;
}

interface EmotePanelProps {
  /** 當前玩家索引，用於定位表情飄出位置 */
  currentPlayerIndex?: number;
}

const EmotePanel: React.FC<EmotePanelProps> = ({ currentPlayerIndex = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const idCounterRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEmoteClick = useCallback((emote: EmoteItem) => {
    setIsOpen(false);
    const newId = (idCounterRef.current += 1);
    // 從底部中間偏玩家方向飄出，簡化處理不做像素級對齊
    const baseX = 50;
    const offset = (currentPlayerIndex % 2 === 0 ? -1 : 1) * 8;
    const randomJitter = (Math.random() - 0.5) * 20;
    setFloatingEmotes(prev => [
      ...prev,
      { id: newId, emoji: emote.emoji, x: baseX + offset + randomJitter },
    ]);
  }, [currentPlayerIndex]);

  // 動畫結束後清理
  useEffect(() => {
    if (floatingEmotes.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingEmotes(prev => prev.slice(1));
    }, 1800);
    return () => clearTimeout(timer);
  }, [floatingEmotes.length]);

  return (
    <>
      {/* 飄浮表情層 */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: 0,
          right: 0,
          bottom: '80px',
          height: 0,
        }}
      >
        {floatingEmotes.map((fe) => (
          <div
            key={fe.id}
            className="absolute text-4xl"
            style={{
              left: `${fe.x}%`,
              bottom: 0,
              transform: 'translateX(-50%)',
              animation: 'emote-float-up 1.8s ease-out forwards',
              filter: `drop-shadow(0 0 8px var(--cyan-glow)) drop-shadow(0 0 16px var(--pink-glow))`,
            }}
          >
            {fe.emoji}
          </div>
        ))}
      </div>

      {/* 表情面板 */}
      <div
        ref={containerRef}
        className="fixed bottom-4 left-4 z-40 flex items-end gap-2"
      >
        {/* 表情按鈕列（展開時顯示） */}
        <div
          className="flex gap-2 overflow-hidden transition-all duration-300"
          style={{
            maxWidth: isOpen ? '500px' : '0px',
            opacity: isOpen ? 1 : 0,
          }}
        >
          {EMOTES.map((emote) => (
            <button
              key={emote.id}
              onClick={() => handleEmoteClick(emote)}
              className="cyber-btn flex flex-col items-center justify-center gap-1 px-3 py-2 text-2xl font-cyber transition-all hover:scale-110"
              style={{
                borderColor: 'var(--cyan)',
                color: 'var(--cyan)',
                backgroundColor: 'rgba(0, 255, 255, 0.08)',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)',
                minWidth: '56px',
              }}
              title={emote.label}
            >
              <span>{emote.emoji}</span>
              <span className="text-[10px] tracking-wider" style={{ color: 'var(--cyan)' }}>
                {emote.label}
              </span>
            </button>
          ))}
        </div>

        {/* 主切換按鈕 */}
        <button
          onClick={() => setIsOpen(v => !v)}
          className="cyber-btn flex items-center justify-center w-12 h-12 rounded-full font-cyber transition-all hover:scale-110"
          style={{
            borderColor: 'var(--pink)',
            color: 'var(--pink)',
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            boxShadow: isOpen
              ? '0 0 15px rgba(255, 107, 157, 0.6), 0 0 30px rgba(255, 107, 157, 0.3), inset 0 0 10px rgba(255, 107, 157, 0.2)'
              : '0 0 10px rgba(255, 107, 157, 0.4), inset 0 0 8px rgba(255, 107, 157, 0.1)',
          }}
          title="表情"
          aria-label="表情面板"
        >
          <Smile size={22} strokeWidth={2} />
        </button>
      </div>

      {/* 關鍵幀動畫 */}
      <style>{`
        @keyframes emote-float-up {
          0% {
            transform: translateX(-50%) translateY(0) scale(0.5);
            opacity: 0;
          }
          15% {
            transform: translateX(-50%) translateY(-10px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(-160px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default EmotePanel;
