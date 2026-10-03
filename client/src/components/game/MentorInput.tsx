import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCog } from 'lucide-react';

const STORAGE_KEY = 'monopoly_mentor_messages';
const MENTOR_NAME = '導師·觀戰者';

export interface MentorInputProps {
  playerNames: string[];
  playerColors?: string[];
}

interface MentorMessage {
  id: string;
  targetPlayerIndex: number;
  content: string;
  mentorName: string;
  timestamp: number;
  handled?: boolean;
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

const MentorInput: React.FC<MentorInputProps> = ({
  playerNames,
  playerColors = [],
}) => {
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [showTip, setShowTip] = useState<boolean>(false);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, []);

  const handleSend = (): void => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (targetIndex < 0 || targetIndex >= playerNames.length) return;

    const message: MentorMessage = {
      id: `mentor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      targetPlayerIndex: targetIndex,
      content: trimmed,
      mentorName: MENTOR_NAME,
      timestamp: Date.now(),
      handled: false,
    };

    const existing = loadMessages();
    saveMessages([...existing, message]);

    setContent('');
    setShowTip(true);
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    tipTimerRef.current = setTimeout(() => setShowTip(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const color = playerColors[targetIndex] || 'var(--cyan)';

  return (
    <div
      className="cyber-card border-neon-cyan p-3 md:p-4 flex flex-col gap-3"
      style={{
        background:
          'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
      }}
    >
      {/* 標題 */}
      <div className="flex items-center gap-2">
        <UserCog
          className="w-4 h-4 md:w-5 md:h-5"
          style={{
            color: 'var(--cyan)',
            filter: 'drop-shadow(0 0 4px var(--cyan))',
          }}
        />
        <h3
          className="font-cyber text-base tracking-wider"
          style={{
            color: 'var(--cyan)',
            textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
          }}
        >
          導師指導
        </h3>
      </div>

      {/* 選擇被指導者 */}
      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-cyber tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          被指導者
        </label>
        <select
          value={targetIndex}
          onChange={(e) => setTargetIndex(parseInt(e.target.value, 10))}
          className="w-full px-3 py-2 text-sm rounded outline-none appearance-none cursor-pointer"
          style={{
            backgroundColor: 'rgba(0, 255, 255, 0.05)',
            border: `1px solid ${color}40`,
            color: color,
            fontFamily: 'var(--font-cyber)',
          }}
        >
          {playerNames.map((name: string, idx: number) => {
            const pc = playerColors[idx] || 'var(--cyan)';
            return (
              <option
                key={idx}
                value={idx}
                style={{
                  backgroundColor: 'hsl(240, 20%, 10%)',
                  color: pc,
                }}
              >
                P{idx + 1} · {name}
              </option>
            );
          })}
        </select>
      </div>

      {/* 輸入框 */}
      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-cyber tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          指導建議
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入指導內容…（Ctrl+Enter 發送）"
          rows={3}
          className="w-full px-3 py-2 text-sm rounded outline-none resize-none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            color: 'var(--text-primary)',
            fontFamily: 'system-ui',
          }}
        />
      </div>

      {/* 發送按鈕 + 提示 */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-cyber"
          style={{
            color: showTip ? 'var(--green)' : 'transparent',
            textShadow: showTip ? '0 0 6px var(--green)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          確認 指導已發送
        </span>
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="cyber-btn cyber-btn-sm px-4 py-2 flex items-center gap-1.5"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
            backgroundColor: 'rgba(0, 255, 255, 0.08)',
          }}
        >
          <Send className="w-3.5 h-3.5" />
          <span>發送指導</span>
        </button>
      </div>
    </div>
  );
};

export default MentorInput;
