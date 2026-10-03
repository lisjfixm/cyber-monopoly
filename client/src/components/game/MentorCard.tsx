import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Zap, CheckCircle, XCircle } from 'lucide-react';

const STORAGE_KEY = 'monopoly_mentor_messages';

export interface MentorMessage {
  id: string;
  targetPlayerIndex: number;
  content: string;
  mentorName: string;
  timestamp: number;
  handled?: boolean; // 已接受/忽略
  playerIndex?: number; // 接收者索引（過濾用）
}

export interface MentorCardProps {
  playerIndex: number;
  playerNames?: string[];
}

function loadMessages(): MentorMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: MentorMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // 儲存失敗（隱私模式/配額滿）不影響遊戲
  }
}

const MentorCard: React.FC<MentorCardProps> = ({ playerIndex, playerNames = [] }) => {
  const [pending, setPending] = useState<MentorMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const lastIdRef = useRef<string | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 輪詢 localStorage 檢查新消息
  const checkNewMessages = useCallback(() => {
    const all = loadMessages();
    const mine = all.filter(
      (m: MentorMessage) => m.targetPlayerIndex === playerIndex && !m.handled,
    );
    if (mine.length === 0) return;

    // 取最早的未處理消息
    const next = mine.sort(
      (a: MentorMessage, b: MentorMessage) => a.timestamp - b.timestamp,
    )[0];
    if (next && next.id !== lastIdRef.current) {
      lastIdRef.current = next.id;
      setPending(next);
      setVisible(true);
    }
  }, [playerIndex]);

  useEffect(() => {
    checkNewMessages();
    const timer = setInterval(checkNewMessages, 2000);
    return () => clearInterval(timer);
  }, [checkNewMessages]);

  const handleAction = useCallback(
    (accepted: boolean) => {
      if (!pending) return;
      const all = loadMessages();
      const updated = all.map((m: MentorMessage) =>
        m.id === pending.id ? { ...m, handled: true, accepted } : m,
      );
      saveMessages(updated);
      setVisible(false);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setPending(null);
        lastIdRef.current = null;
        // 檢查是否還有下一條
        checkNewMessages();
      }, 300);
    },
    [pending, checkNewMessages],
  );

  // 組件卸載時清除待處理的計時器
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  if (!pending || !visible) return null;

  const targetName = playerNames[playerIndex] || `玩家${playerIndex + 1}`;

  return (
    <div
      className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 w-72 md:w-80 animate-slide-in-right"
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div
        className="cyber-card border-neon-cyan p-4 flex flex-col gap-3 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, hsl(240, 25%, 8%) 0%, hsl(240, 30%, 12%) 100%)',
          borderColor: 'var(--cyan)',
          boxShadow:
            '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.05)',
        }}
      >
        {/* 頂部霓虹掃描線 */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--cyan), transparent)',
            boxShadow: '0 0 10px var(--cyan)',
          }}
        />

        {/* 標題 */}
        <div className="flex items-center gap-2">
          <Zap
            className="w-5 h-5"
            style={{
              color: 'var(--cyan)',
              filter: 'drop-shadow(0 0 4px var(--cyan))',
            }}
          />
          <div className="flex flex-col">
            <h4
              className="font-cyber text-base tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
              }}
            >
              導師指導
            </h4>
            <span
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {pending.mentorName}
            </span>
          </div>
        </div>

        {/* 接收者標籤 */}
        <div
          className="text-xs px-2 py-1 rounded font-cyber tracking-wide"
          style={{
            backgroundColor: 'rgba(0, 255, 255, 0.08)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            color: 'var(--cyan)',
          }}
        >
          致 {targetName}
        </div>

        {/* 指導內容 */}
        <div
          className="text-sm leading-relaxed min-h-[3rem] py-2 px-3 rounded"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {pending.content}
        </div>

        {/* 按鈕 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAction(true)}
            className="cyber-btn flex-1 py-2 text-xs font-cyber tracking-wide flex items-center justify-center gap-1"
            style={{
              borderColor: 'var(--green)',
              color: 'var(--green)',
              backgroundColor: 'rgba(0, 255, 128, 0.08)',
            }}
          >
            <CheckCircle className="w-4 h-4" />
            接受
          </button>
          <button
            type="button"
            onClick={() => handleAction(false)}
            className="cyber-btn flex-1 py-2 text-xs font-cyber tracking-wide flex items-center justify-center gap-1"
            style={{
              borderColor: 'var(--text-secondary)',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <XCircle className="w-4 h-4" />
            忽略
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MentorCard;
