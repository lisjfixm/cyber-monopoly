import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, Gamepad2 } from 'lucide-react';
import type { FriendInfo, FriendMessage } from '@shared/api.interface';

interface ChatPanelProps {
  friend: FriendInfo | null;
  messages: FriendMessage[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

const ONLINE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  online: { label: '線上', color: 'var(--green)' },
  in_game: { label: '遊戲中', color: 'var(--blue)' },
  away: { label: '暫離', color: 'var(--yellow)' },
  offline: { label: '離線', color: 'var(--text-secondary)' },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

const ChatPanel = ({ friend, messages, onSendMessage, currentUserId }: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      onSendMessage(trimmed);
      setInputValue('');
    },
    [inputValue, onSendMessage],
  );

  const handleInvite = useCallback(() => {
    onSendMessage('邀請你一起開黑！');
  }, [onSendMessage]);

  if (!friend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{
            border: '1px solid var(--border-neon)',
            background: 'rgba(0, 255, 255, 0.05)',
          }}
        >
          <Gamepad2 size={36} style={{ color: 'var(--cyan)' }} />
        </div>
        <div className="font-cyber text-lg tracking-wider text-neon-cyan mb-2">
          選擇一位好友
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          從左側列表選擇好友開始聊天
        </div>
      </div>
    );
  }

  const statusInfo = ONLINE_STATUS_MAP[friend.onlineStatus] ?? ONLINE_STATUS_MAP.offline;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 頂部 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border-neon)',
          background: 'rgba(0, 255, 255, 0.03)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                color: 'var(--bg-deep)',
                border: friend.onlineStatus === 'online'
                  ? '2px solid var(--green)'
                  : '2px solid transparent',
                boxShadow: friend.onlineStatus === 'online'
                  ? '0 0 10px var(--green)'
                  : 'none',
              }}
            >
              {friend.nickname.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="font-cyber text-base tracking-wide text-[var(--text-primary)]">
              {friend.nickname}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: statusInfo.color,
                  boxShadow: `0 0 6px ${statusInfo.color}`,
                }}
              />
              <span style={{ color: statusInfo.color }}>{statusInfo.label}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInvite}
          className="cyber-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
          style={{
            borderColor: 'var(--pink)',
            color: 'var(--pink)',
            background: 'rgba(255, 107, 157, 0.08)',
            boxShadow: '0 0 8px rgba(255, 107, 157, 0.2)',
          }}
        >
          <Gamepad2 size={14} />
          <span className="font-cyber tracking-wider">邀請開黑</span>
        </button>
      </div>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-sm text-[var(--text-secondary)] mb-2">
              還沒有訊息
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              發送第一條訊息開始對話吧
            </div>
          </div>
        )}
        {messages.map((msg: FriendMessage) => {
          const isMine = msg.fromUserId === currentUserId;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div
                  className="px-3 py-1 rounded text-xs font-cyber tracking-wider"
                  style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: 'var(--purple)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[75%]">
                <div
                  className="px-3 py-2 rounded-lg text-sm break-words"
                  style={{
                    background: isMine
                      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 200, 255, 0.15))'
                      : 'var(--bg-mid)',
                    border: isMine
                      ? '1px solid rgba(0, 255, 255, 0.4)'
                      : '1px solid var(--border-neon)',
                    boxShadow: isMine
                      ? '0 0 10px rgba(0, 255, 255, 0.2)'
                      : 'none',
                    color: 'var(--text-primary)',
                  }}
                >
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] mt-1 ${isMine ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部輸入 */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: 'var(--border-neon)' }}
      >
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="輸入訊息..."
            className="cyber-input flex-1 text-sm"
            style={{ borderColor: 'var(--border-neon)' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="cyber-btn px-4 flex items-center gap-1.5"
            style={{
              borderColor: inputValue.trim() ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
              color: inputValue.trim() ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.3)',
              background: inputValue.trim()
                ? 'rgba(0, 255, 255, 0.08)'
                : 'transparent',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
