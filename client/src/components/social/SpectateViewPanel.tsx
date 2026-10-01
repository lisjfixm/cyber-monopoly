import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Eye,
  Users,
  MessageSquare,
  Crown,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Wallet,
  Package,
  Send,
  User,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SpectateRoom, SpectatePlayer, MentorTip, SpectateChatMessage } from '@client/src/utils/friends.types';
import {
  getMentorTips,
  getSpectateChatMessages,
  sendSpectateChatMessage,
  PLAYER_COLOR_PALETTE,
} from '@client/src/utils/spectate-store';

interface SpectateViewPanelProps {
  open: boolean;
  onClose: () => void;
  room: SpectateRoom;
  currentViewerId: string;
  currentViewerName: string;
}

type TabType = 'overview' | 'tips' | 'chat';

export const SpectateViewPanel: React.FC<SpectateViewPanelProps> = ({
  open,
  onClose,
  room,
  currentViewerId,
  currentViewerName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [viewPlayerIndex, setViewPlayerIndex] = useState(0);
  const [tips, setTips] = useState<MentorTip[]>([]);
  const [chatMessages, setChatMessages] = useState<SpectateChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && room) {
      setTips(getMentorTips(room.id));
      setChatMessages(getSpectateChatMessages(room.id));
      setViewPlayerIndex(0);
      setActiveTab('overview');
    }
  }, [open, room?.id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, activeTab]);

  const currentPlayer = useMemo<SpectatePlayer | undefined>(
    () => room.players[viewPlayerIndex],
    [room, viewPlayerIndex],
  );

  const handlePrevPlayer = useCallback(() => {
    setViewPlayerIndex((prev) => (prev > 0 ? prev - 1 : room.players.length - 1));
  }, [room.players.length]);

  const handleNextPlayer = useCallback(() => {
    setViewPlayerIndex((prev) => (prev < room.players.length - 1 ? prev + 1 : 0));
  }, [room.players.length]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const msg = sendSpectateChatMessage(room.id, currentViewerId, currentViewerName, chatInput.trim());
    setChatMessages((prev) => [...prev, msg]);
    setChatInput('');
  }, [chatInput, room.id, currentViewerId, currentViewerName]);

  const handleCopyRoomCode = useCallback(() => {
    navigator.clipboard?.writeText(room.roomCode).catch(() => {});
    toast.success('已複製房號');
  }, [room.roomCode]);

  if (!open) return null;

  const totalAssets = (p: SpectatePlayer) => p.cash + p.propertyValue;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(20,10,40,0.98) 100%)',
          border: '1px solid var(--cyan)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{
            borderColor: 'rgba(0,255,255,0.2)',
            background: 'rgba(0, 255, 255, 0.05)',
          }}
        >
          <Eye size={20} style={{ color: 'var(--cyan)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-bold tracking-wider text-lg"
                style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan)' }}
              >
                觀戰中 · {room.roomCode}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-bold"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '1px solid var(--cyan)',
                  color: 'var(--cyan)',
                }}
              >
                {room.modeLabel}
              </span>
              {room.isMentorRoom && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1"
                  style={{
                    background: 'rgba(255, 0, 170, 0.15)',
                    border: '1px solid var(--pink)',
                    color: 'var(--pink)',
                  }}
                >
                  <Crown size={12} />
                  {room.mentorName}
                </span>
              )}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              第 {room.turnCount} 回合 · 當前回合：{room.players[room.currentTurnIndex]?.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 text-xs px-2 py-1 rounded"
              style={{
                background: 'rgba(0, 255, 128, 0.1)',
                border: '1px solid var(--green)',
                color: 'var(--green)',
              }}
            >
              <Users size={12} />
              {room.spectatorCount} 觀眾
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cyber-btn p-1.5"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div
          className="flex gap-1 px-4 py-2 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {[
            { key: 'overview' as const, label: '實況總覽', icon: <Eye size={14} />, color: 'var(--cyan)' },
            { key: 'tips' as const, label: '導師提示', icon: <Lightbulb size={14} />, color: 'var(--pink)' },
            { key: 'chat' as const, label: '觀眾聊天', icon: <MessageSquare size={14} />, color: 'var(--green)' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="cyber-btn cyber-btn-sm px-3 py-1.5 text-xs flex items-center gap-1.5"
              style={{
                borderColor: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.1)',
                color: activeTab === tab.key ? tab.color : 'var(--text-secondary)',
                background: activeTab === tab.key ? `${tab.color}15` : 'transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && currentPlayer && (
            <div className="flex flex-col gap-4">
              {/* 视角切换 */}
              <div
                className="cyber-card p-4"
                style={{ borderColor: currentPlayer.color }}
              >
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={handlePrevPlayer}
                    className="cyber-btn p-1.5"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-secondary)' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-center flex-1 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                        style={{
                          background: `${currentPlayer.color}20`,
                          border: `2px solid ${currentPlayer.color}`,
                          color: currentPlayer.color,
                          boxShadow: `0 0 15px ${currentPlayer.color}40`,
                        }}
                      >
                        {currentPlayer.name.slice(0, 1)}
                      </div>
                      <div className="text-left">
                        <div
                          className="text-lg font-bold tracking-wide"
                          style={{ color: currentPlayer.color, textShadow: `0 0 8px ${currentPlayer.color}60` }}
                        >
                          {currentPlayer.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {currentPlayer.rank} · 位置 #{currentPlayer.position}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      視角 {viewPlayerIndex + 1} / {room.players.length}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextPlayer}
                    className="cyber-btn p-1.5"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-secondary)' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* 资产数据 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className="p-3 rounded text-center"
                    style={{ background: 'rgba(0,255,128,0.05)', border: '1px solid rgba(0,255,128,0.2)' }}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs mb-1" style={{ color: 'var(--green)' }}>
                      <Wallet size={12} />
                      現金
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--green)' }}>
                      ${currentPlayer.cash.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="p-3 rounded text-center"
                    style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.2)' }}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs mb-1" style={{ color: 'var(--cyan)' }}>
                      <Building2 size={12} />
                      地產總值
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--cyan)' }}>
                      ${currentPlayer.propertyValue.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="p-3 rounded text-center"
                    style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs mb-1" style={{ color: '#ffd700' }}>
                      <Home size={12} />
                      地產數量
                    </div>
                    <div className="text-lg font-bold" style={{ color: '#ffd700' }}>
                      {currentPlayer.propertyCount}
                    </div>
                  </div>
                  <div
                    className="p-3 rounded text-center"
                    style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs mb-1" style={{ color: 'var(--purple, #a855f7)' }}>
                      <Package size={12} />
                      道具
                    </div>
                    <div className="text-lg font-bold" style={{ color: 'var(--purple, #a855f7)' }}>
                      {currentPlayer.items}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 text-center">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>總資產：</span>
                  <span
                    className="text-base font-bold ml-1"
                    style={{ color: currentPlayer.color, textShadow: `0 0 6px ${currentPlayer.color}60` }}
                  >
                    ${totalAssets(currentPlayer).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 全部玩家资产排行 */}
              <div className="cyber-card p-4" style={{ borderColor: 'var(--border-neon)' }}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Trophy size={16} style={{ color: '#ffd700' }} />
                  資產排行
                </h3>
                <div className="space-y-2">
                  {[...room.players]
                    .sort((a, b) => totalAssets(b) - totalAssets(a))
                    .map((p, idx) => {
                      const pct = (totalAssets(p) / totalAssets(room.players[0])) * 100;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-3"
                          onClick={() => {
                            const realIdx = room.players.findIndex((rp) => rp.id === p.id);
                            if (realIdx >= 0) setViewPlayerIndex(realIdx);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <span
                            className="w-6 text-center text-xs font-bold"
                            style={{
                              color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-secondary)',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: `${p.color}20`, border: `1px solid ${p.color}`, color: p.color }}
                          >
                            {p.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold truncate" style={{ color: p.color }}>{p.name}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                ${totalAssets(p).toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 房间信息 */}
              <div className="cyber-card p-4" style={{ borderColor: 'var(--border-neon)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>房間資訊</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>房號：</span>
                    <button
                      type="button"
                      onClick={handleCopyRoomCode}
                      className="font-bold hover:underline"
                      style={{ color: 'var(--cyan)' }}
                    >
                      {room.roomCode}
                    </button>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>模式：</span>
                    <span style={{ color: 'var(--text-primary)' }}>{room.modeLabel}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>玩家數：</span>
                    <span style={{ color: 'var(--text-primary)' }}>{room.players.length}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>回數：</span>
                    <span style={{ color: 'var(--text-primary)' }}>{room.turnCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              {!room.isMentorRoom && (
                <div
                  className="p-4 rounded text-center"
                  style={{
                    background: 'rgba(255, 215, 0, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                  }}
                >
                  <Crown size={24} style={{ color: '#ffd700' }} className="mx-auto mb-2" />
                  <p className="text-sm" style={{ color: '#ffd700' }}>本局暫無導師觀戰</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    選擇帶有「導師」標籤的房間即可觀看導師實時講解
                  </p>
                </div>
              )}
              {room.isMentorRoom && tips.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: 'var(--text-secondary)' }}>
                  導師暫未發布提示
                </p>
              )}
              {tips.map((tip: MentorTip) => {
                const icon = tip.type === 'tip'
                  ? <Lightbulb size={16} style={{ color: 'var(--pink)' }} />
                  : tip.type === 'warning'
                    ? <AlertTriangle size={16} style={{ color: '#ffd700' }} />
                    : <Info size={16} style={{ color: 'var(--cyan)' }} />;
                const borderColor = tip.type === 'tip'
                  ? 'var(--pink)'
                  : tip.type === 'warning' ? '#ffd700' : 'var(--cyan)';
                return (
                  <div
                    key={tip.id}
                    className="cyber-card p-3"
                    style={{ borderColor }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {icon}
                      <span className="text-xs font-bold" style={{ color: borderColor }}>
                        {tip.mentorName}
                      </span>
                      <span
                        className="ml-auto text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {new Date(tip.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {tip.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full gap-2" style={{ minHeight: '300px' }}>
              <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                觀眾聊天頻道 · 僅觀眾可見，不干擾遊戲玩家
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: '40vh' }}>
                {chatMessages.map((msg: SpectateChatMessage) => {
                  const isMine = msg.senderId === currentViewerId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{
                          background: 'rgba(0, 255, 255, 0.1)',
                          border: '1px solid var(--cyan)',
                          color: 'var(--cyan)',
                        }}
                      >
                        {msg.senderName.slice(0, 1)}
                      </div>
                      <div className={`max-w-[75%] ${isMine ? 'text-right' : ''}`}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {msg.senderName}
                        </div>
                        <div
                          className="inline-block px-3 py-1.5 rounded-lg text-sm"
                          style={{
                            background: isMine ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${isMine ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="輸入訊息..."
                  className="flex-1 px-3 py-2 text-sm rounded-md outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendChat}
                  className="cyber-btn cyber-btn-sm px-4"
                  style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpectateViewPanel;
