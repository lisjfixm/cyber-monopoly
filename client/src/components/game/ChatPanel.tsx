import React, { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { ChatMessage } from '@shared/api.interface';

import { PLAYER_COLOR_HEX } from '@shared/game-config';
import type { PlayerColor } from '@shared/api.interface';

const QUICK_PHRASES: string[] = ['好棋', '等等', '哈哈', '加油', '认输吧'];

interface ChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  myPlayerIndex: number;
  unreadCount: number;
  onSend: (content: string) => void;
  onMarkRead?: () => void;
  disabled?: boolean;
  /** Map of playerIndex -> color (for multi-player coloring) */
  playerColors?: Record<number, PlayerColor>;
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onToggle,
  messages,
  myPlayerIndex,
  onSend,
  onMarkRead,
  disabled = false,
  playerColors,
}) => {
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef(false);

  // 自动滚动到底部
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, isOpen]);

  // 打开面板时标记已读
  useEffect(() => {
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
      setInputValue('');
    } catch (err) {
      logger.error('发送聊天消息失败', { error: String(err) });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPhrase = (phrase: string) => {
    if (disabled) return;
    try {
      onSend(phrase);
    } catch (err) {
      logger.error('发送快捷短语失败', { error: String(err) });
    }
  };

  return (
    <>
      {/* 右侧滑出面板 - 桌面端固定定位，移动端底部滑出 */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out
          bottom-0 left-0 right-0 md:top-20 md:right-0 md:left-auto md:bottom-auto
          md:h-[60vh] h-[70vh]
          w-full md:w-[320px]
          ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}`}
      >
        <div
          className="h-full flex flex-col cyber-card border-neon-cyan
            md:border-r-0 md:border-t-0 border-t md:border-l md:border-b"
          style={{
            background: 'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 -4px 20px rgba(0, 255, 255, 0.15)',
          }}
        >
          {/* 标题栏 */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-neon-cyan)' }}
          >
            <h2
              className="font-cyber text-base md:text-lg tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
              }}
            >
              聊天
            </h2>
            <button
              onClick={onToggle}
              className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 消息列表 */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-text-muted text-xs py-8">
                暂无聊天消息
              </div>
            )}
            {messages.map((msg: ChatMessage) => {
              const isSystem = msg.type === 'system';
              const isMine = msg.sender === myPlayerIndex;

              // Get player color for message styling
              const getSenderColor = (sender: number): string => {
                if (playerColors && sender >= 0) {
                  const c = playerColors[sender];
                  if (c && PLAYER_COLOR_HEX[c]) return PLAYER_COLOR_HEX[c];
                }
                // Fallback: cycle through colors by index
                const colorKeys = Object.keys(PLAYER_COLOR_HEX) as PlayerColor[];
                return PLAYER_COLOR_HEX[colorKeys[Math.max(0, sender) % colorKeys.length]] || 'var(--cyan)';
              };

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <div
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        color: 'hsl(220, 10%, 60%)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              }

              const isVoice = msg.type === 'voice';
              const senderColor = msg.sender >= 0 ? getSenderColor(msg.sender) : 'var(--pink)';

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span style={{
                      color: senderColor,
                      fontWeight: 600,
                      textShadow: msg.sender >= 0 ? `0 0 6px ${senderColor}80` : 'none',
                    }}>
                      {msg.senderName}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className="px-3 py-2 rounded text-sm max-w-[220px] break-words flex items-center gap-1.5"
                    style={{
                      background: isVoice
                        ? 'rgba(177, 151, 252, 0.15)'
                        : (isMine
                          ? 'rgba(0, 255, 255, 0.12)'
                          : `${senderColor}20`),
                      border: `1px solid ${isVoice ? 'var(--purple)' : senderColor}`,
                      color: 'var(--text-primary)',
                      boxShadow: isVoice
                        ? '0 0 8px rgba(177, 151, 252, 0.4), inset 0 0 4px rgba(177, 151, 252, 0.15)'
                        : (msg.sender >= 0
                          ? `0 0 8px ${senderColor}50, inset 0 0 4px ${senderColor}20`
                          : '0 0 8px rgba(255, 107, 157, 0.3), inset 0 0 4px rgba(255, 107, 157, 0.1)'),
                    }}
                  >
                    {isVoice && (
                      <span className="flex-shrink-0" aria-hidden>語音</span>
                    )}
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 快捷短语 */}
          <div
            className="px-3 py-2 border-t flex flex-wrap gap-1.5"
            style={{ borderColor: 'var(--border-neon-cyan)' }}
          >
            {QUICK_PHRASES.map((phrase: string) => (
              <button
                key={phrase}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={disabled}
                className="cyber-btn px-2 py-1 text-xs transition-all"
                style={{
                  fontSize: '11px',
                  borderColor: disabled
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0, 255, 255, 0.3)',
                  color: disabled ? 'rgba(255,255,255,0.3)' : 'var(--cyan)',
                  background: 'rgba(0, 255, 255, 0.05)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* 输入区 */}
          <div
            className="p-3 border-t flex items-center gap-2"
            style={{ borderColor: 'var(--border-neon-cyan)' }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyDown}
              maxLength={500}
              placeholder={disabled ? '无法发送消息' : '说点什么...'}
              disabled={disabled}
              className="cyber-input flex-1 text-sm"
              style={{ height: '36px' }}
            />
            <button
              onClick={handleSend}
              disabled={disabled || !inputValue.trim()}
              className="cyber-btn w-9 h-9 flex items-center justify-center p-0 flex-shrink-0 transition-all"
              style={{
                borderColor: !disabled && inputValue.trim()
                  ? 'var(--cyan)'
                  : 'rgba(255,255,255,0.1)',
                color: !disabled && inputValue.trim()
                  ? 'var(--cyan)'
                  : 'rgba(255,255,255,0.3)',
                boxShadow: !disabled && inputValue.trim()
                  ? '0 0 8px rgba(0, 255, 255, 0.3)'
                  : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              aria-label="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 移动端半透明遮罩 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default ChatPanel;
