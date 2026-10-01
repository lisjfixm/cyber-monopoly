import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Smile, Users, MessageSquare, X, ChevronDown, Flag, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CyberSticker, STICKER_LIST } from './CyberSticker';
import {
  getGlobalMessages,
  sendGlobalMessage,
  getPrivateMessages,
  sendPrivateMessage,
  addReport,
} from '@client/src/utils/chat-store';
import type { ChatMessage } from '@client/src/utils/social.types';
import { QUICK_PHRASES, type QuickPhraseKey } from '@client/src/utils/social.types';

interface ChatTab {
  id: string;
  name: string;
  type: 'global' | 'private';
  targetId?: string;
  targetName?: string;
  unread: number;
}

interface GlobalChatPanelProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentGuildTag?: string;
  showQuickPhrases?: boolean;
  onQuickPhrase?: (phrase: string) => void;
  anchorSide?: 'right' | 'left';
}

const ONLINE_USERS = [
  { id: 'u1', name: '霓虹夜行者', status: 'online', guild: 'NEON' },
  { id: 'u2', name: '數據殭屍', status: 'in_game', guild: 'CYBR' },
  { id: 'u3', name: '影子跑者', status: 'online', guild: '' },
  { id: 'u4', name: '光纖貓', status: 'away', guild: 'PHNT' },
  { id: 'u5', name: '量子駭客', status: 'online', guild: '' },
  { id: 'u6', name: '電流公主', status: 'offline', guild: 'NEON' },
];

const STATUS_COLORS: Record<string, string> = {
  online: '#00ff80',
  in_game: '#00ffff',
  away: '#ffd700',
  offline: '#64748b',
};

const STATUS_LABELS: Record<string, string> = {
  online: '線上',
  in_game: '遊戲中',
  away: '暫離',
  offline: '離線',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

export const GlobalChatPanel: React.FC<GlobalChatPanelProps> = ({
  open,
  onClose,
  currentUserId,
  currentUserName,
  currentGuildTag,
  showQuickPhrases = false,
  onQuickPhrase,
  anchorSide = 'right',
}) => {
  const [tabs, setTabs] = useState<ChatTab[]>([
    { id: 'global', name: '全域頻道', type: 'global', unread: 0 },
  ]);
  const [activeTab, setActiveTab] = useState<string>('global');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showReport, setShowReport] = useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const loadMessages = useCallback((tab: ChatTab) => {
    if (tab.type === 'global') {
      setMessages(getGlobalMessages(150));
    } else if (tab.type === 'private' && tab.targetId) {
      setMessages(getPrivateMessages(currentUserId, tab.targetId));
    }
    scrollToBottom();
  }, [currentUserId, scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    const currentTab = tabs.find((t: ChatTab) => t.id === activeTab);
    if (currentTab) loadMessages(currentTab);
  }, [open, activeTab, tabs, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback((content: string, type: 'text' | 'sticker' = 'text', stickerId?: string) => {
    const trimmed = content.trim();
    if (!trimmed && type === 'text') return;
    const currentTab = tabs.find((t: ChatTab) => t.id === activeTab);
    if (!currentTab) return;

    let newMsg: ChatMessage;
    if (currentTab.type === 'global') {
      newMsg = sendGlobalMessage({
        senderId: currentUserId,
        senderName: currentUserName,
        senderGuildTag: currentGuildTag,
        content: trimmed,
        type,
        stickerId,
      });
    } else if (currentTab.type === 'private' && currentTab.targetId) {
      newMsg = sendPrivateMessage(currentUserId, currentUserName, currentTab.targetId, trimmed, type, stickerId);
    } else {
      return;
    }
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setShowStickers(false);
  }, [activeTab, tabs, currentUserId, currentUserName, currentGuildTag]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  }, [handleSend, inputValue]);

  const handleStickerClick = useCallback((stickerId: string) => {
    handleSend(stickerId, 'sticker', stickerId);
  }, [handleSend]);

  const handleUserClick = useCallback((user: { id: string; name: string }) => {
    if (user.id === currentUserId) return;
    const existing = tabs.find((t: ChatTab) => t.id === `priv_${user.id}`);
    if (!existing) {
      const newTab: ChatTab = {
        id: `priv_${user.id}`,
        name: user.name,
        type: 'private',
        targetId: user.id,
        targetName: user.name,
        unread: 0,
      };
      setTabs((prev) => [...prev, newTab]);
    }
    setActiveTab(`priv_${user.id}`);
    setShowUsers(false);
  }, [tabs, currentUserId]);

  const handleQuickPhrase = useCallback((key: QuickPhraseKey) => {
    const phrase = QUICK_PHRASES[key];
    if (onQuickPhrase) {
      onQuickPhrase(phrase);
    } else {
      handleSend(phrase);
    }
  }, [handleSend, onQuickPhrase]);

  const handleReport = useCallback(() => {
    if (!showReport) return;
    if (!reportReason.trim()) {
      toast.error('請填寫舉報原因');
      return;
    }
    addReport({
      targetUserId: showReport.senderId,
      targetUserName: showReport.senderName,
      reason: reportReason,
      messageContent: showReport.content,
    });
    toast.success('已提交舉報，管理員將儘快處理');
    setShowReport(null);
    setReportReason('');
  }, [showReport, reportReason]);

  const closeTab = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabId === 'global') return;
    setTabs((prev) => prev.filter((t: ChatTab) => t.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab('global');
    }
  }, [activeTab]);

  if (!open) return null;

  const currentTab = tabs.find((t: ChatTab) => t.id === activeTab);

  return (
    <div
      className="fixed z-50 flex flex-col bg-[var(--bg-dark)] border rounded-lg overflow-hidden"
      style={{
        [anchorSide === 'right' ? 'right' : 'left']: '16px',
        top: '80px',
        width: '340px',
        height: 'calc(100vh - 120px)',
        maxHeight: '600px',
        borderColor: 'var(--cyan)',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border-neon)' }}>
        <div className="flex items-center gap-1">
          <MessageSquare size={16} style={{ color: 'var(--cyan)' }} />
          <span className="text-sm font-bold tracking-wider" style={{ color: 'var(--cyan)', textShadow: '0 0 8px var(--cyan)' }}>
            聊天
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowUsers(!showUsers)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="線上玩家"
          >
            <Users size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-0.5 px-2 pt-2 pb-1 border-b" style={{ borderColor: 'var(--border-neon)' }}>
        {tabs.map((tab: ChatTab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-2 py-1 text-xs rounded-t transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-300'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
            }}
          >
            <span className="max-w-[70px] truncate inline-block">{tab.name}</span>
            {tab.unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {tab.unread}
              </span>
            )}
            {tab.type === 'private' && (
              <span
                role="button"
                tabIndex={0}
                aria-label={`關閉私人訊息分頁 ${tab.name}`}
                onClick={(e) => closeTab(tab.id, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    closeTab(tab.id, e as unknown as React.MouseEvent);
                  }
                }}
                className="ml-1 opacity-60 hover:opacity-100"
              >
                <X size={10} />
              </span>
            )}
          </button>
        ))}
      </div>

      {showUsers && (
        <div className="absolute top-[88px] right-2 w-48 bg-[var(--bg-mid)] border rounded-md shadow-lg z-10 max-h-64 overflow-y-auto" style={{ borderColor: 'var(--border-neon)' }}>
          <div className="px-2 py-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            線上玩家
          </div>
          {ONLINE_USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleUserClick(u)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 text-left transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[u.status] }}
              />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                {u.name}
              </span>
              {u.guild && (
                <span className="text-[10px] px-1 rounded" style={{ color: 'var(--cyan)', backgroundColor: 'rgba(0,255,255,0.1)' }}>
                  {u.guild}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.map((msg: ChatMessage) => {
          const isSelf = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-medium" style={{ color: isSelf ? 'var(--cyan)' : 'var(--pink)' }}>
                  {msg.senderName}
                </span>
                {msg.senderGuildTag && (
                  <span className="px-1 rounded text-[9px]" style={{ backgroundColor: 'rgba(0,255,255,0.1)', color: 'var(--cyan)' }}>
                    {msg.senderGuildTag}
                  </span>
                )}
                <span>{formatTime(msg.timestamp)}</span>
                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReport(msg);
                      setReportReason('');
                    }}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    title="舉報"
                  >
                    <Flag size={10} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                )}
              </div>
              <div
                className={`max-w-[75%] px-2.5 py-1.5 rounded text-sm mt-0.5 ${
                  isSelf ? 'bg-cyan-500/15' : 'bg-pink-500/10'
                }`}
                style={{
                  border: `1px solid ${isSelf ? 'rgba(0,255,255,0.3)' : 'rgba(255,0,255,0.3)'}`,
                  wordBreak: 'break-word',
                }}
              >
                {msg.type === 'sticker' && msg.stickerId ? (
                  <CyberSticker id={msg.stickerId} size={64} />
                ) : (
                  <span style={{ color: 'var(--text-primary)' }}>{msg.content}</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showStickers && (
        <div className="border-t px-2 py-2 grid grid-cols-7 gap-1 max-h-36 overflow-y-auto" style={{ borderColor: 'var(--border-neon)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          {STICKER_LIST.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStickerClick(s.id)}
              className="p-1 rounded hover:bg-white/10 transition-colors flex items-center justify-center"
              title={s.name}
            >
              <CyberSticker id={s.id} size={28} />
            </button>
          ))}
        </div>
      )}

      {showQuickPhrases && (
        <div className="flex gap-1 px-2 py-1 border-t flex-wrap" style={{ borderColor: 'var(--border-neon)' }}>
          {(Object.keys(QUICK_PHRASES) as QuickPhraseKey[]).map((key: QuickPhraseKey) => (
            <button
              key={key}
              type="button"
              onClick={() => handleQuickPhrase(key)}
              className="px-2 py-0.5 text-xs rounded border transition-colors hover:bg-cyan-500/20"
              style={{ borderColor: 'var(--border-neon)', color: 'var(--cyan)' }}
            >
              <Zap size={10} className="inline mr-0.5" />
              {QUICK_PHRASES[key]}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-1 p-2 border-t" style={{ borderColor: 'var(--border-neon)' }}>
        <button
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          style={{ color: showStickers ? 'var(--cyan)' : 'var(--text-secondary)' }}
          title="貼圖"
        >
          <Smile size={16} />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentTab?.type === 'private' ? '發送訊息...' : '在全域頻道說點什麼...'}
          className="flex-1 bg-transparent border rounded px-2 py-1 text-sm outline-none focus:border-cyan-400 transition-colors"
          style={{ borderColor: 'var(--border-neon)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-1.5 rounded hover:bg-cyan-500/20 transition-colors disabled:opacity-40"
          style={{ color: 'var(--cyan)' }}
        >
          <Send size={16} />
        </button>
      </form>

      {showReport && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-20">
          <div className="bg-[var(--bg-dark)] border rounded-lg p-4 w-full" style={{ borderColor: 'var(--red)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--red)' }}>舉報訊息</h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              舉報對象：{showReport.senderName}
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="請說明舉報原因..."
              rows={3}
              className="w-full bg-transparent border rounded px-2 py-1.5 text-sm outline-none focus:border-red-400 mb-3"
              style={{ borderColor: 'var(--border-neon)', color: 'var(--text-primary)' }}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowReport(null)}
                className="px-3 py-1 text-xs rounded border transition-colors hover:bg-white/10"
                style={{ borderColor: 'var(--border-neon)', color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleReport}
                className="px-3 py-1 text-xs rounded bg-red-500/20 border border-red-500/50 transition-colors hover:bg-red-500/30"
                style={{ color: 'var(--red)' }}
              >
                提交舉報
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalChatPanel;
