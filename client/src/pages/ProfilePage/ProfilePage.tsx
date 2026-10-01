import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  X,
  Check,
  TrendingUp,
  Target,
  Zap,
  Crown,
  Coins,
  Calendar,
  Award,
  ChevronRight,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  Palette,
  BookOpen,
  Video,
  Users,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import { useCloudSave } from '@client/src/hooks/useCloudSave';
import { useSkinStorage } from '@client/src/hooks/useSkinStorage';
import { useTitles } from '@client/src/hooks/useTitles';
import { useAvatarFrame } from '@client/src/hooks/useAvatarFrame';
import { useAchievements } from '@client/src/hooks/useAchievements';
import SkinSelectModal from '@client/src/components/game/SkinSelectModal';
import TitleEffect from '@client/src/components/TitleEffect';
import AccountBindingsSection from '@client/src/components/AccountBindingsSection';
import { getBattlePassState } from '@client/src/utils/battlepass';
import { TITLES, TITLE_IDS, AVATAR_FRAMES } from '@shared/game-config';
import type { TitleId, AvatarFrameConfig } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

const MAX_NICKNAME_LEN = 20;

function getRankTitle(elo: number): { text: string; color: string } | null {
  if (elo >= 2000) return { text: '王者', color: 'var(--yellow)' };
  if (elo >= 1700) return { text: '大師', color: 'var(--purple)' };
  if (elo >= 1400) return { text: '鑽石', color: 'var(--cyan)' };
  if (elo >= 1100) return { text: '鉑金', color: 'hsl(210, 50%, 70%)' };
  return { text: '青銅', color: 'hsl(25, 60%, 50%)' };
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  color: string;
}

const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => (
  <div className="cyber-card p-4 text-center" style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}>
    <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
    <div
      className="font-cyber text-2xl md:text-3xl font-bold"
      style={{ color, textShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)` }}
    >
      {value}
    </div>
    <div className="text-xs text-[var(--text-muted)] mt-1 font-cyber tracking-wider">
      {label}
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { nickname, playerProfile, loading, setNickname, refreshProfile, visitorId } = usePlayerIdentity();
  const [editing, setEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const {
    syncStatus,
    lastSyncedAt,
    enabled,
    enableCloudSave,
    disableCloudSave,
    syncNow,
    resolveConflict,
    errorMessage: cloudError,
  } = useCloudSave(visitorId);

  const {
    pawnSkin,
    diceSkin,
    unlockedPawnSkins,
    unlockedDiceSkins,
    setPawnSkin,
    setDiceSkin,
  } = useSkinStorage();

  const [skinModalOpen, setSkinModalOpen] = useState<boolean>(false);

  // 稱號系統
  const { unlocked: unlockedAchievements, getTotalPoints } = useAchievements();
  const totalAchievementPoints = getTotalPoints();
  const { equippedTitle, unlockedTitles, equipTitle, checkAndUnlockTitles } = useTitles();
  const { equippedFrame, unlockedFrames, equipFrame, checkAndUnlockFrames } = useAvatarFrame();

  // 自訂頭像
  const AVATAR_STORAGE_KEY = 'cyber_monopoly_custom_avatar';
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自動解鎖稱號和頭像框
  useEffect(() => {
    const newTitles = checkAndUnlockTitles(unlockedAchievements);
    const bpState = getBattlePassState();
    checkAndUnlockFrames({
      unlockedAchievements,
      battlePassLevel: bpState.currentLevel,
      isPremium: bpState.premiumPurchased,
      unlockedPawnSkins: unlockedPawnSkins,
    });
    void newTitles;
  }, [unlockedAchievements, checkAndUnlockTitles, checkAndUnlockFrames, unlockedPawnSkins]);

  // 加載自訂頭像
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) setCustomAvatar(saved);
    } catch {
      // ignore
    }
  }, [AVATAR_STORAGE_KEY]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setCustomAvatar(result);
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, result);
      } catch {
        // ignore
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    setCustomAvatar(null);
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const getFrameConfig = (frameId: string): AvatarFrameConfig | undefined => {
    return AVATAR_FRAMES.find((f: AvatarFrameConfig) => f.id === frameId);
  };

  const getTitleConfig = (titleId: TitleId | null) => {
    return titleId ? TITLES[titleId] : null;
  };

  const RARITY_COLORS: Record<string, string> = {
    common: '#9ca3af',
    rare: '#22d3ee',
    epic: '#a855f7',
    legendary: '#fbbf24',
  };

  const RARITY_NAMES: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說',
  };

  const getFrameUnlockText = (frame: AvatarFrameConfig): string => {
    switch (frame.unlockType) {
      case 'default': return '初始擁有';
      case 'achievement': return `成就解鎖`;
      case 'battlepass': return `通行證獎勵`;
      case 'assets': return `資產達到 ${frame.unlockValue}`;
      case 'achievements_count': return `收集 ${frame.unlockValue} 個成就`;
      case 'all_pawn_skins': return '解鎖所有棋子皮膚';
      case 'achievements_combo': return '組合成就解鎖';
      default: return '未知';
    }
  };

  const syncStatusInfo = (() => {
    switch (syncStatus) {
      case 'syncing':
        return { label: '同步中', color: 'var(--cyan)', icon: Loader2 };
      case 'synced':
        return { label: '已同步', color: 'var(--green)', icon: CheckCircle };
      case 'conflict':
        return { label: '衝突', color: 'var(--yellow)', icon: AlertTriangle };
      case 'error':
        return { label: '同步失敗', color: 'var(--red)', icon: X };
      default:
        return { label: '未同步', color: 'var(--text-secondary)', icon: CloudOff };
    }
  })();

  const formatSyncTime = (iso: string | null): string => {
    if (!iso) return '從未同步';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '從未同步';
    return date.toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  const goToBattlePass = () => {
    navigate('/battlepass');
  };

  const goToStats = () => {
    navigate('/stats');
  };

  const handleStartEdit = () => {
    setEditValue(nickname);
    setError('');
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_NICKNAME_LEN) return;
    setEditValue(value);
    setError('');
  };

  const handleSaveNickname = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = editValue.trim();
    if (!trimmed) {
      setError('暱稱不能為空');
      return;
    }
    if (trimmed.length > MAX_NICKNAME_LEN) {
      setError(`暱稱不能超過 ${MAX_NICKNAME_LEN} 個字元`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await setNickname(trimmed);
      setEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '修改失敗';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const elo = playerProfile?.elo ?? 1000;
  const wins = playerProfile?.wins ?? 0;
  const losses = playerProfile?.losses ?? 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';
  const totalTurns = playerProfile?.totalTurns ?? 0;
  const highestAssets = playerProfile?.highestAssets ?? 0;
  const seasonWins = playerProfile?.seasonWins ?? 0;
  const seasonElo = playerProfile?.seasonElo ?? 1000;
  const title = getRankTitle(elo);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          個人資料
        </h1>
      </div>

      <div className="max-w-2xl w-full mx-auto space-y-6 pb-8">
        {/* Profile Header */}
        <div
          className="cyber-card p-6 text-center relative overflow-hidden"
          style={{
            borderColor: title?.color || 'var(--cyan)',
            boxShadow: `0 0 20px color-mix(in srgb, ${title?.color || 'var(--cyan)'} 30%, transparent)`,
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: title?.color || 'var(--cyan)' }}
          />

          <div className="relative z-10">
             {/* Avatar */}
             <div
               className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden cursor-pointer relative group"
               onClick={handleAvatarClick}
               style={{
                 border: equippedFrame ? getFrameConfig(equippedFrame)?.borderStyle ?? 'solid 3px' : 'solid 3px',
                 borderColor: equippedFrame ? getFrameConfig(equippedFrame)?.color ?? 'var(--cyan)' : 'var(--cyan)',
                 boxShadow: equippedFrame
                   ? `0 0 20px ${getFrameConfig(equippedFrame)?.glowColor ?? getFrameConfig(equippedFrame)?.color ?? 'var(--cyan)'}, inset 0 0 10px ${getFrameConfig(equippedFrame)?.glowColor ?? 'transparent'}`
                   : '0 0 10px rgba(0, 255, 255, 0.3)',
               }}
             >
               {customAvatar ? (
                 <Image src={customAvatar} alt="avatar" className="w-full h-full object-cover" />
               ) : (
                 <svg viewBox="0 0 100 100" className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                   <defs>
                     <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#00ffff" />
                       <stop offset="100%" stopColor="#ff00ff" />
                     </linearGradient>
                   </defs>
                   <circle cx="50" cy="38" r="18" fill="none" stroke="url(#avatarGrad)" strokeWidth="2.5" />
                   <path d="M20 85 Q 50 55 80 85" fill="none" stroke="url(#avatarGrad)" strokeWidth="2.5" />
                   <circle cx="50" cy="50" r="45" fill="none" stroke="url(#avatarGrad)" strokeWidth="0.5" opacity="0.3" />
                   <circle cx="50" cy="50" r="40" fill="none" stroke="url(#avatarGrad)" strokeWidth="0.5" opacity="0.2" />
                 </svg>
               )}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Pencil size={20} style={{ color: 'var(--cyan)' }} />
               </div>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 className="hidden"
                 onChange={handleAvatarFileChange}
               />
             </div>
             {customAvatar && (
               <button
                 type="button"
                 onClick={handleResetAvatar}
                 className="text-xs text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors flex items-center gap-1 mx-auto mb-3"
               >
                 <RotateCcw size={12} />
                 重置預設頭像
               </button>
             )}

             {/* Nickname */}
            {editing ? (
              <form onSubmit={handleSaveNickname} className="mb-4">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleEditChange}
                    maxLength={MAX_NICKNAME_LEN}
                    autoFocus
                    className="cyber-input text-center font-cyber text-xl md:text-2xl w-48 md:w-64"
                    style={{
                      borderColor: title?.color || 'var(--cyan)',
                      color: title?.color || 'var(--cyan)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="cyber-btn p-2"
                    style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
                    aria-label="保存"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="cyber-btn p-2"
                    style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                    aria-label="取消"
                  >
                    <X size={18} />
                  </button>
                </div>
                {error && (
                  <div className="text-sm mt-2" style={{ color: 'var(--red)' }}>
                    {error}
                  </div>
                )}
                <div className="text-xs text-[var(--text-muted)] mt-2">
                  {editValue.length}/{MAX_NICKNAME_LEN}
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                 {/* 稱號顯示 */}
                 {equippedTitle && getTitleConfig(equippedTitle) && (
                   <TitleEffect effect={getTitleConfig(equippedTitle)!.effect} color={getTitleConfig(equippedTitle)!.color}>
                     <span className="font-cyber text-lg md:text-xl font-bold">
                       【{getTitleConfig(equippedTitle)!.name}】
                     </span>
                   </TitleEffect>
                 )}
                 <h2
                   className="font-cyber text-2xl md:text-3xl font-bold"
                   style={{
                     color: title?.color || 'var(--text-primary)',
                     textShadow: `0 0 10px color-mix(in srgb, ${title?.color || 'var(--cyan)'} 60%, transparent)`,
                   }}
                 >
                   {nickname || '匿名玩家'}
                 </h2>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1.5 rounded transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="編輯暱稱"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}

            {/* Title Badge */}
            {title && !editing && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown size={18} style={{ color: title.color }} />
                <span
                  className="px-3 py-1 text-sm font-cyber tracking-widest rounded-sm"
                  style={{
                    color: title.color,
                    border: `1px solid ${title.color}`,
                    backgroundColor: `color-mix(in srgb, ${title.color} 10%, transparent)`,
                    boxShadow: `0 0 8px color-mix(in srgb, ${title.color} 40%, transparent)`,
                  }}
                >
                  {title.text}
                </span>
              </div>
            )}

            {/* ELO Big Display */}
            <div className="mt-4">
              <div className="text-xs text-[var(--text-muted)] font-cyber tracking-[0.3em] mb-1">
                ELO 積分
              </div>
              <div
                className="font-cyber text-5xl md:text-6xl font-bold tracking-wider"
                style={{
                  color: title?.color || 'var(--cyan)',
                  textShadow: `0 0 15px color-mix(in srgb, ${title?.color || 'var(--cyan)'} 70%, transparent), 0 0 30px color-mix(in srgb, ${title?.color || 'var(--cyan)'} 40%, transparent)`,
                }}
              >
                {Math.round(elo)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <StatCard label="總勝場" value={wins} icon={TrendingUp} color="var(--green)" />
          <StatCard label="總敗場" value={losses} icon={Target} color="var(--red)" />
          <StatCard label="勝率" value={`${winRate}%`} icon={Award} color="var(--cyan)" />
          <StatCard label="總回合" value={formatNumber(totalTurns)} icon={Zap} color="var(--yellow)" />
          <StatCard label="最高資產" value={formatNumber(highestAssets)} icon={Coins} color="var(--pink)" />
          <StatCard label="賽季勝場" value={seasonWins} icon={Calendar} color="var(--purple)" />
        </div>

        {/* Season ELO */}
        <div
          className="cyber-card p-4"
          style={{ borderColor: 'color-mix(in srgb, var(--purple) 30%, transparent)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                賽季 ELO
              </div>
              <div
                className="font-cyber text-3xl font-bold"
                style={{
                  color: 'var(--purple)',
                  textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                }}
              >
                {Math.round(seasonElo)}
              </div>
            </div>
            <div className="text-right text-xs text-[var(--text-muted)]">
              <div>當前賽季進行中</div>
              <div className="mt-1">賽季勝場: {seasonWins}</div>
            </div>
          </div>
        </div>

        {/* Battle Pass Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, var(--yellow) 30%, transparent)' }}
          onClick={goToBattlePass}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={22} style={{ color: 'var(--yellow)' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  賽季通行證
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: 'var(--yellow)',
                    textShadow: '0 0 8px rgba(255, 200, 0, 0.5)',
                  }}
                >
                  查看詳情
                </div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* Stats Dashboard Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, var(--cyan) 30%, transparent)' }}
          onClick={goToStats}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={22} style={{ color: 'var(--cyan)' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  數據儀表板
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: 'var(--cyan)',
                    textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
                  }}
                >
                  查看戰績
                </div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* Achievements Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, #facc15 30%, transparent)' }}
          onClick={() => navigate('/achievements')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={22} style={{ color: '#facc15' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  成就殿堂
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: '#facc15',
                    textShadow: '0 0 8px rgba(250, 204, 21, 0.5)',
                  }}
                >
                  {totalAchievementPoints} 點
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                已解鎖
              </div>
              <div className="font-cyber text-lg" style={{ color: '#facc15' }}>
                {unlockedAchievements.size}/49
              </div>
            </div>
          </div>
        </div>

        {/* Codex Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, #a855f7 30%, transparent)' }}
          onClick={() => navigate('/codex')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={22} style={{ color: '#a855f7' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  收藏圖鑑
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: '#a855f7',
                    textShadow: '0 0 8px rgba(168, 85, 247, 0.5)',
                  }}
                >
                  圖鑑收藏
                </div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* Replay Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, hsl(280, 100%, 60%) 30%, transparent)' }}
          onClick={() => navigate('/replay')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video size={22} style={{ color: 'hsl(280, 100%, 60%)' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  回放紀錄
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: 'hsl(280, 100%, 70%)',
                    textShadow: '0 0 8px rgba(168, 85, 247, 0.5)',
                  }}
                >
                  觀看回放
                </div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* Friends Center Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, var(--cyan) 30%, transparent)' }}
          onClick={() => navigate('/friends')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={22} style={{ color: 'var(--cyan)' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  好友中心
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: 'var(--cyan)',
                    textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
                  }}
                >
                  管理好友
                </div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* Skin Warehouse Entry */}
        <div
          className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform"
          style={{ borderColor: 'color-mix(in srgb, var(--pink) 30%, transparent)' }}
          onClick={() => setSkinModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette size={22} style={{ color: 'var(--pink)' }} />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider mb-1">
                  皮膚倉庫
                </div>
                <div
                  className="font-cyber text-xl font-bold"
                  style={{
                    color: 'var(--pink)',
                    textShadow: '0 0 8px rgba(255, 0, 180, 0.5)',
                  }}
                >
                  個性化裝扮
                </div>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* 稱號管理 */}
        <div className="cyber-card p-4" style={{ borderColor: 'color-mix(in srgb, var(--yellow) 30%, transparent)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Crown size={18} style={{ color: 'var(--yellow)' }} />
            <h3 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--yellow)' }}>
              稱號管理
            </h3>
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {unlockedTitles.length}/{TITLE_IDS.length}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TITLE_IDS.map((titleId: TitleId) => {
              const t = TITLES[titleId];
              const isUnlocked = unlockedTitles.includes(titleId);
              const isEquipped = equippedTitle === titleId;
              const rarityColor = RARITY_COLORS[t.rarity];
              return (
                <button
                  key={titleId}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => equipTitle(titleId)}
                  className="p-2 text-left rounded transition-all"
                  style={{
                    border: `1px solid ${isUnlocked ? rarityColor : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: isEquipped ? `${rarityColor}15` : 'transparent',
                    opacity: isUnlocked ? 1 : 0.4,
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div className="text-xs font-cyber flex items-center gap-1">
                    <span>{t.icon}</span>
                    <span style={{ color: rarityColor }}>{t.name}</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                    {isUnlocked ? (
                      isEquipped ? <><Check size={10} style={{ color: 'var(--green)' }} />已裝備</> : <><Sparkles size={10} />點擊裝備</>
                    ) : (
                      <><Lock size={10} />{t.unlockCondition}</>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 頭像框管理 */}
        <div className="cyber-card p-4" style={{ borderColor: 'color-mix(in srgb, var(--purple) 30%, transparent)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} style={{ color: 'var(--purple)' }} />
            <h3 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--purple)' }}>
              頭像框管理
            </h3>
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {unlockedFrames.length}/{AVATAR_FRAMES.length}
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {AVATAR_FRAMES.map((frame: AvatarFrameConfig) => {
              const isUnlocked = unlockedFrames.includes(frame.id);
              const isEquipped = equippedFrame === frame.id;
              const rarityColor = RARITY_COLORS[frame.rarity];
              return (
                <button
                  key={frame.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => equipFrame(frame.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded transition-all"
                  style={{
                    border: `1px solid ${isUnlocked ? rarityColor : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: isEquipped ? `${rarityColor}15` : 'transparent',
                    opacity: isUnlocked ? 1 : 0.4,
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      border: frame.borderStyle,
                      borderColor: isUnlocked ? frame.color : '#444',
                      boxShadow: isUnlocked ? `0 0 8px ${frame.glowColor ?? frame.color}` : 'none',
                    }}
                  >
                    <span className="text-sm font-cyber" style={{ color: 'var(--cyan)' }}>玩家</span>
                  </div>
                  <div className="text-[10px] font-cyber text-center" style={{ color: rarityColor }}>
                    {isUnlocked ? frame.name : '???'}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] text-center">
                    {getFrameUnlockText(frame)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Bindings */}
        <AccountBindingsSection isLoggedIn={!!nickname && !loading} />

        {/* Cloud Sync Card */}
        <div
          className="cyber-card p-4"
          style={{
            borderColor: enabled
              ? 'color-mix(in srgb, var(--cyan) 30%, transparent)'
              : 'color-mix(in srgb, var(--text-muted) 20%, transparent)',
            boxShadow: enabled && syncStatus === 'synced'
              ? '0 0 15px rgba(0, 255, 255, 0.2)'
              : 'none',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cloud size={18} style={{ color: 'var(--cyan)' }} />
              <h3 className="font-cyber text-sm tracking-wider text-neon-cyan">
                雲端同步
              </h3>
            </div>
            <div
              className="relative w-10 h-5 rounded-full cursor-pointer transition-colors"
              onClick={enabled ? disableCloudSave : enableCloudSave}
              style={{
                backgroundColor: enabled ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.15)',
                boxShadow: enabled ? '0 0 8px rgba(0, 255, 255, 0.5)' : 'none',
              }}
              role="switch"
              aria-checked={enabled}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  left: enabled ? '22px' : '2px',
                  backgroundColor: 'var(--bg-deep)',
                  boxShadow: enabled ? '0 0 6px rgba(0, 255, 255, 0.8)' : 'none',
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">
                目前狀態
              </span>
              <span
                className="text-xs font-cyber tracking-wider flex items-center gap-1"
                style={{ color: syncStatusInfo.color }}
              >
                <syncStatusInfo.icon size={12} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                {syncStatusInfo.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">
                上次同步
              </span>
              <span className="text-xs text-[var(--text-primary)] font-mono">
                {formatSyncTime(lastSyncedAt)}
              </span>
            </div>

            {cloudError && (
              <div className="text-xs p-2" style={{ color: 'var(--red)', backgroundColor: 'rgba(255, 77, 77, 0.08)' }}>
                {cloudError}
              </div>
            )}

            {syncStatus === 'conflict' && (
              <div className="space-y-2 p-3" style={{ backgroundColor: 'rgba(250, 204, 21, 0.08)', border: '1px solid color-mix(in srgb, var(--yellow) 30%, transparent)' }}>
                <div className="flex items-center gap-2 text-sm font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                  <AlertTriangle size={14} />
                  衝突！選擇保留版本
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void resolveConflict('local')}
                    className="cyber-btn flex-1 py-1.5 text-xs font-cyber tracking-wider"
                    style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                  >
                    保留本地
                  </button>
                  <button
                    type="button"
                    onClick={() => void resolveConflict('cloud')}
                    className="cyber-btn flex-1 py-1.5 text-xs font-cyber tracking-wider"
                    style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}
                  >
                    保留雲端
                  </button>
                </div>
              </div>
            )}

            {enabled && syncStatus !== 'conflict' && (
              <button
                type="button"
                onClick={() => void syncNow()}
                disabled={syncStatus === 'syncing'}
                className="cyber-btn w-full py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
                style={{
                  borderColor: 'var(--cyan)',
                  color: 'var(--cyan)',
                  backgroundColor: 'rgba(0, 255, 255, 0.08)',
                  opacity: syncStatus === 'syncing' ? 0.6 : 1,
                  cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                立即同步
              </button>
            )}

            {!enabled && (
              <div className="text-xs text-[var(--text-muted)] text-center">
                開啟後自動同步成就、設定與對局記錄
              </div>
            )}
          </div>
        </div>

        {/* Rank Info */}
        <div className="cyber-card p-4">
          <h3 className="font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3">
            排名資訊
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">ELO 排名</span>
              <span className="text-neon-cyan font-cyber">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">勝場排名</span>
              <span className="text-neon-green font-cyber">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">賽季排名</span>
              <span className="text-neon-purple font-cyber">--</span>
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-2 text-center">
              參與更多線上對戰提升排名
            </div>
          </div>
        </div>

        {loading && !playerProfile && (
          <div className="text-center text-[var(--text-secondary)] font-cyber tracking-wider">
            載入中...
          </div>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => void refreshProfile()}
          className="cyber-btn w-full py-2 text-sm font-cyber tracking-wider"
          style={{ borderColor: 'var(--text-muted)', color: 'var(--text-secondary)' }}
        >
          刷新資料
        </button>
      </div>

      {/* Skin Select Modal */}
      <SkinSelectModal
        isOpen={skinModalOpen}
        onClose={() => setSkinModalOpen(false)}
        currentPawnSkin={pawnSkin}
        currentDiceSkin={diceSkin}
        unlockedPawnSkins={unlockedPawnSkins}
        unlockedDiceSkins={unlockedDiceSkins}
        onSelectPawn={setPawnSkin}
        onSelectDice={setDiceSkin}
      />
    </div>
  );
};

export default ProfilePage;
