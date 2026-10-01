import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Lock, Users, Zap, Swords, Plus } from 'lucide-react';
import { monopoly, ranking } from '@client/src/api';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import PasswordModal from '@client/src/components/game/PasswordModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import type { RoomState, GameMode, RoomStatus } from '@shared/api.interface';

type ModeFilter = 'all' | GameMode;
type PlayerFilter = 'all' | 2 | 4 | 6;
type StatusFilter = 'all' | RoomStatus;

const MODE_OPTIONS: { value: ModeFilter; label: string; icon: typeof Zap | null }[] = [
  { value: 'all', label: '全部', icon: null },
  { value: 'classic', label: '經典', icon: Users },
  { value: 'fast', label: '快速', icon: Zap },
  { value: 'crazy', label: '瘋狂', icon: Swords },
];

const PLAYER_OPTIONS: { value: PlayerFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 2, label: '2人' },
  { value: 4, label: '4人' },
  { value: 6, label: '6人' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: '全部', color: 'var(--text-secondary)' },
  { value: 'waiting', label: '等待中', color: 'var(--green)' },
  { value: 'playing', label: '遊戲中', color: 'hsl(35, 100%, 60%)' },
  { value: 'ended', label: '已結束', color: 'var(--text-muted)' },
];

const MODE_COLORS: Record<GameMode, string> = {
  classic: 'var(--cyan)',
  fast: 'var(--green)',
  crazy: 'var(--pink)',
  custom: 'var(--purple)',
  coop2v2: 'var(--blue)',
  battle_royale: 'hsl(35, 100%, 60%)',
  race: 'hsl(160, 100%, 50%)',
  survival: 'var(--red)',
  coop_boss: 'hsl(0, 80%, 50%)',
  treasure: 'hsl(45, 100%, 55%)',
  emperor: 'hsl(45, 100%, 50%)',
  dark: 'hsl(270, 80%, 50%)',
  lightning: 'hsl(45, 100%, 60%)',
  resource: 'hsl(140, 100%, 55%)',
  team_deathmatch: 'hsl(0, 100%, 60%)',
  darknet: 'hsl(270, 80%, 55%)',
};

const MODE_LABELS: Record<GameMode, string> = {
  classic: '經典',
  fast: '快速',
  crazy: '瘋狂',
  custom: '自訂',
  coop2v2: '合作',
  battle_royale: '大逃殺',
  race: '競速',
  survival: '生存',
  coop_boss: 'Boss戰',
  treasure: '奪寶',
  emperor: '皇帝',
  dark: '黑暗',
  lightning: '閃電戰',
  resource: '資源爭奪',
  team_deathmatch: '團隊死鬥',
  darknet: '暗網',
};

const STATUS_COLORS: Record<RoomStatus, string> = {
  waiting: 'var(--green)',
  playing: 'hsl(35, 100%, 60%)',
  ended: 'var(--text-muted)',
};

const STATUS_LABELS: Record<RoomStatus, string> = {
  waiting: '等待中',
  playing: '遊戲中',
  ended: '已結束',
};

const PublicRoomsPage = () => {
  const navigate = useNavigate();
  const { visitorId, nickname } = usePlayerIdentity();
  const [rooms, setRooms] = useState<RoomState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomState | null>(null);
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);

  // Nickname modal (for joining without a stored nickname)
  const [nicknameModalOpen, setNicknameModalOpen] = useState<boolean>(false);
  const [pendingRoom, setPendingRoom] = useState<RoomState | null>(null);
  const [joinNickname, setJoinNickname] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filter: { gameMode?: string; maxPlayers?: number; status?: string } = {};
      if (modeFilter !== 'all') filter.gameMode = modeFilter;
      if (playerFilter !== 'all') filter.maxPlayers = playerFilter;
      if (statusFilter !== 'all') filter.status = statusFilter;
      const data = await monopoly.monopolyApi.getPublicRooms(filter);
      if (!mountedRef.current) return;
      setRooms(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : '載入房間列表失敗';
      setError(message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [modeFilter, playerFilter, statusFilter]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const handleJoin = (room: RoomState) => {
    // Need nickname first
    if (!nickname) {
      setPendingRoom(room);
      setJoinNickname('');
      setJoinError('');
      setNicknameModalOpen(true);
      return;
    }

    if (room.hasPassword) {
      setSelectedRoom(room);
      setPasswordError('');
      setPasswordModalOpen(true);
    } else {
      void doJoin(room, '');
    }
  };

  const doJoin = async (room: RoomState, password: string, playerName?: string) => {
    const name = playerName || nickname;
    if (!name) return;

    setPasswordLoading(true);
    setJoinLoading(true);
    setPasswordError('');
    setJoinError('');

    try {
      if (visitorId && name) {
        try {
          await ranking.rankingApi.getOrCreatePlayer(visitorId, name);
        } catch {
          // ignore
        }
      }
      const result = await monopoly.monopolyApi.joinRoom(
        room.roomCode,
        name,
        visitorId,
        password || undefined,
      );
      setPasswordModalOpen(false);
      setNicknameModalOpen(false);
      navigate(`/online/room/${result.room.roomCode}?player=${result.playerIndex}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加入房間失敗';
      if (passwordModalOpen) {
        setPasswordError(message);
      } else {
        setJoinError(message);
      }
    } finally {
      setPasswordLoading(false);
      setJoinLoading(false);
    }
  };

  const handlePasswordConfirm = (password: string) => {
    if (selectedRoom) {
      void doJoin(selectedRoom, password);
    }
  };

  const handleNicknameConfirm = () => {
    const name = joinNickname.trim();
    if (!name) {
      setJoinError('請輸入你的暱稱');
      return;
    }
    if (!pendingRoom) return;

    if (pendingRoom.hasPassword) {
      // Need password next — close nickname modal, open password modal
      setNicknameModalOpen(false);
      setSelectedRoom(pendingRoom);
      setPasswordError('');
      // Use the entered name as playerName for the join call
      void (async () => {
        // We'll open password modal; when confirmed, use joinNickname
        // Wait a tick for dialog to close before opening next
        setTimeout(() => {
          setPasswordModalOpen(true);
        }, 100);
      })();
    } else {
      void doJoin(pendingRoom, '', name);
    }
  };

  // When confirming password after nickname flow, use joinNickname
  const handlePasswordConfirmWithNickname = (password: string) => {
    if (selectedRoom) {
      const name = joinNickname.trim() || nickname;
      void doJoin(selectedRoom, password, name);
    }
  };

  const isRoomJoinable = (room: RoomState): boolean => {
    return room.status === 'waiting' && room.players.length < room.maxPlayers;
  };

  const isRoomFull = (room: RoomState): boolean => {
    return room.players.length >= room.maxPlayers;
  };

  return (
    <div className="min-h-screen w-full flex flex-col scanlines relative">
      {/* 頂部欄 */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-sm"
        style={{
          borderColor: 'var(--border-neon)',
          backgroundColor: 'rgba(10, 10, 18, 0.85)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cyber-btn p-2 flex items-center"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
          title="返回"
        >
          <ArrowLeft size={18} />
        </button>
        <h1
          className="font-cyber text-xl md:text-2xl tracking-widest"
          style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
        >
          公開房間
        </h1>
        <button
          type="button"
          onClick={() => { void loadRooms(); }}
          disabled={loading}
          className="cyber-btn p-2 flex items-center"
          style={{
            borderColor: 'var(--green)',
            color: 'var(--green)',
          }}
          title="刷新"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 篩選器欄 */}
      <div className="px-4 py-3 flex flex-wrap gap-2 md:gap-3 items-center border-b"
        style={{ borderColor: 'rgba(0, 255, 255, 0.1)' }}
      >
        {/* 模式篩選 */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mr-1">模式</span>
          {MODE_OPTIONS.map((opt) => {
            const active = modeFilter === opt.value;
            const IconComp = opt.icon;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setModeFilter(opt.value)}
                className="cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider flex items-center gap-1"
                style={{
                  borderColor: active ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)',
                  color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                  background: active ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                  boxShadow: active ? '0 0 10px rgba(0, 255, 255, 0.2)' : 'none',
                }}
              >
                {IconComp && <IconComp size={12} />}
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-[var(--border-neon)] hidden md:block" />

        {/* 人數篩選 */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mr-1">人數</span>
          {PLAYER_OPTIONS.map((opt) => {
            const active = playerFilter === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setPlayerFilter(opt.value)}
                className="cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider"
                style={{
                  borderColor: active ? 'var(--pink)' : 'rgba(255, 107, 157, 0.2)',
                  color: active ? 'var(--pink)' : 'var(--text-secondary)',
                  background: active ? 'rgba(255, 107, 157, 0.1)' : 'transparent',
                  boxShadow: active ? '0 0 10px rgba(255, 107, 157, 0.2)' : 'none',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-[var(--border-neon)] hidden md:block" />

        {/* 狀態篩選 */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mr-1">狀態</span>
          {STATUS_OPTIONS.map((opt) => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className="cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider"
                style={{
                  borderColor: active ? opt.color : `${opt.color}33`,
                  color: active ? opt.color : 'var(--text-secondary)',
                  background: active ? `${opt.color}15` : 'transparent',
                  boxShadow: active ? `0 0 10px ${opt.color}33` : 'none',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 房間卡片列表 */}
      <div className="flex-1 px-4 py-4 overflow-auto">
        {error && (
          <div
            className="cyber-card p-4 mb-4 text-sm text-center font-cyber tracking-wider"
            style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
          >
            {error}
          </div>
        )}

        {loading && rooms.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-secondary)] font-cyber tracking-wider">
            <RefreshCw size={32} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--cyan)' }} />
            載入中...
          </div>
        ) : rooms.length === 0 ? (
          /* 空狀態 */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                border: '1px solid var(--border-neon)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.15)',
              }}
            >
              <Users size={32} style={{ color: 'var(--cyan)' }} />
            </div>
            <p className="font-cyber text-lg tracking-wider text-[var(--text-primary)] mb-2">
              暫無公開房間
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              建立第一個公開房間吧！
            </p>
            <button
              type="button"
              onClick={() => navigate('/online/create')}
              className="cyber-btn px-6 py-2.5 text-sm font-cyber tracking-wider flex items-center gap-2"
              style={{
                borderColor: 'var(--green)',
                color: 'var(--green)',
                background: 'rgba(0, 255, 128, 0.1)',
                boxShadow: '0 0 12px rgba(0, 255, 128, 0.3)',
              }}
            >
              <Plus size={16} />
              建立房間
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {rooms.map((room) => {
              const joinable = isRoomJoinable(room);
              const full = isRoomFull(room);
              const modeColor = MODE_COLORS[room.gameMode] || 'var(--cyan)';
              const statusColor = STATUS_COLORS[room.status] || 'var(--text-secondary)';
              const hostName = room.players[room.hostIndex]?.name || room.hostName;
              return (
                <div
                  key={room.id}
                  className="cyber-card p-4 flex flex-col gap-3 transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: `${modeColor}44`,
                    boxShadow: `0 0 15px ${modeColor}22`,
                  }}
                >
                  {/* 房間名 + 鎖 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {room.hasPassword && (
                        <Lock size={14} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
                      )}
                      <h3
                        className="font-cyber text-base md:text-lg tracking-wider truncate"
                        style={{ color: modeColor, textShadow: `0 0 8px ${modeColor}66` }}
                        title={`${hostName}的房間`}
                      >
                        {hostName}的房間
                      </h3>
                    </div>
                  </div>

                  {/* 房間號 */}
                  <div className="text-xs font-mono tracking-[0.2em] text-[var(--text-muted)]">
                    #{room.roomCode}
                  </div>

                  {/* 標籤列 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm"
                      style={{
                        color: modeColor,
                        border: `1px solid ${modeColor}66`,
                        backgroundColor: `${modeColor}15`,
                      }}
                    >
                      {MODE_LABELS[room.gameMode] || room.gameMode}
                    </span>
                    <span
                      className="px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm"
                      style={{
                        color: statusColor,
                        border: `1px solid ${statusColor}66`,
                        backgroundColor: `${statusColor}15`,
                      }}
                    >
                      {full ? '已滿' : STATUS_LABELS[room.status]}
                    </span>
                  </div>

                  {/* 人數 + 加入按鈕 */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Users size={14} />
                      <span className="font-cyber tracking-wider">
                        <span style={{ color: full ? 'var(--red)' : 'var(--text-primary)' }}>
                          {room.players.length}
                        </span>
                        {' / '}
                        {room.maxPlayers} 人
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoin(room)}
                      disabled={!joinable}
                      className="cyber-btn px-4 py-1.5 text-xs font-cyber tracking-wider"
                      style={{
                        borderColor: joinable ? 'var(--green)' : 'rgba(255, 255, 255, 0.1)',
                        color: joinable ? 'var(--green)' : 'rgba(255, 255, 255, 0.3)',
                        background: joinable ? 'rgba(0, 255, 128, 0.1)' : 'transparent',
                        boxShadow: joinable ? '0 0 10px rgba(0, 255, 128, 0.3)' : 'none',
                        cursor: joinable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {room.status === 'playing' ? '觀戰' : full ? '已滿' : '加入'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 密碼彈窗 */}
      <PasswordModal
        open={passwordModalOpen}
        roomName={selectedRoom ? `${selectedRoom.players[selectedRoom.hostIndex]?.name || selectedRoom.hostName}的房間` : undefined}
        onClose={() => {
          if (!passwordLoading) {
            setPasswordModalOpen(false);
            setSelectedRoom(null);
            setPasswordError('');
          }
        }}
        onConfirm={joinNickname ? handlePasswordConfirmWithNickname : handlePasswordConfirm}
        error={passwordError || (passwordLoading ? '驗證中...' : undefined)}
      />

      {/* 暱稱輸入彈窗 */}
      <Dialog open={nicknameModalOpen} onOpenChange={(open: boolean) => { if (!open && !joinLoading) setNicknameModalOpen(false); }}>
        <DialogContent
          className="cyber-card max-w-sm"
          style={{
            borderColor: 'var(--cyan)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle
              className="font-cyber text-xl tracking-wider text-center"
              style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
            >
              輸入你的暱稱
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <input
              type="text"
              value={joinNickname}
              onChange={(e) => { setJoinNickname(e.target.value.slice(0, 10)); setJoinError(''); }}
              maxLength={10}
              placeholder="你的暱稱"
              className="cyber-input w-full"
              style={{
                borderColor: 'rgba(0, 255, 255, 0.4)',
                boxShadow: '0 0 8px rgba(0, 255, 255, 0.2)',
              }}
              autoFocus
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {joinNickname.length}/10
            </div>
            {joinError && (
              <div className="text-sm text-center" style={{ color: 'var(--red)' }}>
                {joinError}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setNicknameModalOpen(false)}
              disabled={joinLoading}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-secondary)',
              }}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleNicknameConfirm}
              disabled={joinLoading || !joinNickname.trim()}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
              style={{
                borderColor: 'var(--cyan)',
                color: 'var(--cyan)',
                background: 'rgba(0, 255, 255, 0.1)',
                boxShadow: '0 0 12px rgba(0, 255, 255, 0.3)',
              }}
            >
              {joinLoading ? '加入中...' : '確認'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicRoomsPage;
