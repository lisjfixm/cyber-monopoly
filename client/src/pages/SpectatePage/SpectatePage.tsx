import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Users,
  Trophy,
  Crown,
  Filter,
  Search,
  Zap,
  Swords,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSpectateRooms, incrementSpectatorCount } from '@client/src/utils/spectate-store';
import type { SpectateRoom } from '@client/src/utils/friends.types';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import { SpectateViewPanel } from '@client/src/components/social/SpectateViewPanel';

interface SpectatePageProps {
}

type FilterMode = 'all' | 'ranked' | 'mentor' | 'classic' | 'tournament';

const SpectatePage: React.FC<SpectatePageProps> = () => {
  const navigate = useNavigate();
  const { visitorId, nickname } = usePlayerIdentity();
  const [rooms, setRooms] = useState<SpectateRoom[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<SpectateRoom | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    setRooms(getSpectateRooms());
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r: SpectateRoom) => {
      if (filter === 'ranked' && !r.isRanked) return false;
      if (filter === 'mentor' && !r.isMentorRoom) return false;
      if (filter === 'classic' && r.gameMode !== 'classic' && r.gameMode !== 'quick' && r.gameMode !== 'crazy') return false;
      if (filter === 'tournament' && r.gameMode !== 'tournament') return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.roomCode.toLowerCase().includes(q) &&
          !r.players.some((p) => p.name.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, filter, search]);

  // 記錄目前開啟的觀戰房間，供卸載時歸還觀戰人數，避免計數外洩
  const openRoomIdRef = useRef<string | null>(null);

  const handleEnterSpectate = useCallback((room: SpectateRoom) => {
    incrementSpectatorCount(room.id, 1);
    openRoomIdRef.current = room.id;
    setRooms(getSpectateRooms());
    setSelectedRoom(room);
    setViewOpen(true);
    toast.success(`已進入觀戰：${room.roomCode}`);
  }, []);

  const handleCloseView = useCallback(() => {
    if (selectedRoom) {
      incrementSpectatorCount(selectedRoom.id, -1);
      openRoomIdRef.current = null;
      setRooms(getSpectateRooms());
    }
    setViewOpen(false);
    setSelectedRoom(null);
  }, [selectedRoom]);

  // 卸載時若仍開著觀戰面板，主動歸還一次觀戰人數
  useEffect(() => {
    return () => {
      if (openRoomIdRef.current) {
        incrementSpectatorCount(openRoomIdRef.current, -1);
        openRoomIdRef.current = null;
      }
    };
  }, []);

  const filterOptions: { key: FilterMode; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: '全部', icon: <Eye size={14} />, color: 'var(--cyan)' },
    { key: 'ranked', label: '排位賽', icon: <Trophy size={14} />, color: '#ffd700' },
    { key: 'mentor', label: '導師觀戰', icon: <Crown size={14} />, color: 'var(--pink)' },
    { key: 'classic', label: '休閒模式', icon: <Zap size={14} />, color: 'var(--green)' },
    { key: 'tournament', label: '錦標賽', icon: <Swords size={14} />, color: 'var(--purple, #a855f7)' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines">
      <div className="w-full max-w-5xl flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/social')}
          className="cyber-btn p-2"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          className="text-2xl md:text-3xl font-bold tracking-wider"
          style={{
            color: 'var(--cyan)',
            textShadow: '0 0 10px var(--cyan), 0 0 20px var(--cyan)',
          }}
        >
          觀戰大廳
        </h1>
        <div className="flex-1" />
        <div
          className="cyber-card px-3 py-1.5 text-xs flex items-center gap-2"
          style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
        >
          <Users size={14} />
          <span>{rooms.reduce((sum: number, r: SpectateRoom) => sum + r.spectatorCount, 0)} 人在線觀戰</span>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="w-full max-w-5xl cyber-card p-4 mb-4" style={{ borderColor: 'var(--border-neon)' }}>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} className="mr-1 my-auto" />
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className="cyber-btn cyber-btn-sm px-3 py-1.5 text-xs flex items-center gap-1.5"
                style={{
                  borderColor: filter === opt.key ? opt.color : 'rgba(255,255,255,0.15)',
                  color: filter === opt.key ? opt.color : 'var(--text-secondary)',
                  background: filter === opt.key ? `${opt.color}15` : 'transparent',
                  boxShadow: filter === opt.key ? `0 0 8px ${opt.color}40` : 'none',
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search
              size={16}
              style={{ color: 'var(--text-secondary)' }}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋房號或玩家..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 房间列表 */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRooms.length === 0 && (
          <div className="col-span-full cyber-card p-10 text-center" style={{ borderColor: 'var(--border-neon)' }}>
            <Eye size={40} style={{ color: 'var(--text-secondary)' }} className="mx-auto mb-3 opacity-50" />
            <p style={{ color: 'var(--text-secondary)' }}>暫無符合條件的房間</p>
          </div>
        )}
        {filteredRooms.map((room: SpectateRoom) => (
          <div
            key={room.id}
            className="cyber-card p-4 flex flex-col gap-3 hover:scale-[1.01] transition-transform"
            style={{ borderColor: room.isMentorRoom ? 'var(--pink)' : 'var(--border-neon)' }}
          >
            {/* 房间头部 */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-lg font-bold tracking-wider"
                    style={{ color: room.isMentorRoom ? 'var(--pink)' : 'var(--cyan)' }}
                  >
                    {room.roomCode}
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
                  {room.isRanked && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold"
                      style={{
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '1px solid #ffd700',
                        color: '#ffd700',
                      }}
                    >
                      排位
                    </span>
                  )}
                  {room.isMentorRoom && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1"
                      style={{
                        background: 'rgba(255, 0, 170, 0.1)',
                        border: '1px solid var(--pink)',
                        color: 'var(--pink)',
                      }}
                    >
                      <Crown size={12} />
                      導師
                    </span>
                  )}
                </div>
                {room.isMentorRoom && (
                  <p className="text-xs" style={{ color: 'var(--pink)' }}>
                    導師：{room.mentorName} · {room.mentorTitle}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div
                  className="text-sm font-bold flex items-center gap-1"
                  style={{ color: 'var(--green)' }}
                >
                  <Eye size={14} />
                  {room.spectatorCount}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>觀眾</p>
              </div>
            </div>

            {/* 玩家信息 */}
            <div className="flex flex-wrap gap-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${p.color}40`,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}` }}
                  >
                    {p.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: p.color }}>{p.name}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{p.rank}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 房间信息底部 */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  第 {room.turnCount} 回合
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {room.players.length} 人
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleEnterSpectate(room)}
                className="cyber-btn cyber-btn-sm px-4 py-1.5 text-xs flex items-center gap-1.5"
                style={{
                  borderColor: 'var(--green)',
                  color: 'var(--green)',
                  background: 'rgba(0, 255, 128, 0.1)',
                }}
              >
                進入觀戰
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 观战面板 */}
      {selectedRoom && (
        <SpectateViewPanel
          open={viewOpen}
          onClose={handleCloseView}
          room={selectedRoom}
          currentViewerId={visitorId || 'local_viewer'}
          currentViewerName={nickname || '旁觀者'}
        />
      )}
    </div>
  );
};

export default SpectatePage;
