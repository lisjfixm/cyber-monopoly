import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Users,
  Bot,
  Globe,
  BookOpen,
  Trophy,
  Target,
  Crown,
  Swords,
  Map,
  FileEdit,
  Puzzle,
  Shield,
  Sparkles,
  Gift,
  Mail,
  GraduationCap,
  Flag,
  X,
  User,
  ChevronDown,
  ChevronRight,
  Dices,
  BarChart3,
  Megaphone,
  ScrollText,
  Hammer,
  Plus,
  LogIn,
  Eye,
  Award,
  Swords as QuickMatchIcon,
} from 'lucide-react';
import NeonParticles from '@client/src/components/NeonParticles';
import { useIsMobile } from '@client/src/hooks/useIsMobile';
import UserMenu from '@client/src/components/UserMenu';
import AchievementModal from '@client/src/components/game/AchievementModal';
import VolumeControl from '@client/src/components/game/VolumeControl';
import SettingsButton from '@client/src/components/SettingsButton';
import CustomRulesPanel from '@client/src/components/game/CustomRulesPanel';
import SaveSlotPanel from '@client/src/components/game/SaveSlotPanel';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { useAudio } from '@client/src/hooks/useAudio';
import { useSaveSlots, setContinueSave } from '@client/src/hooks/useSaveSlots';
import { useTutorial } from '@client/src/hooks/useTutorial';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import { hasGuestNickname, setGuestNickname, useAccount } from '@client/src/hooks/useAccount';
import { consumeOAuthCallback, getOAuthError } from '@client/src/api/oauth';
import { useTitles } from '@client/src/hooks/useTitles';
import { useDailyCheckin } from '@client/src/hooks/useDailyCheckin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import type { CustomGameRules } from '@shared/api.interface';
import { DEFAULT_CUSTOM_RULES } from '@shared/game-config';
import AnnouncementModal from '@client/src/components/AnnouncementModal';
import { getUnreadAnnouncements } from '@client/src/utils/announcements';
import { getUnreadCount } from '@client/src/utils/mail';
import DailyCheckinModal from '@client/src/components/DailyCheckinModal';
import TitleEffect from '@client/src/components/TitleEffect';
import { TITLES } from '@shared/game-config';

// ---------- 共用小元件 ----------

interface EntryButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
  badge?: string;
  disabled?: boolean;
}

const EntryButton = ({ label, icon, onClick, color = 'var(--cyan)', badge, disabled }: EntryButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="cyber-btn flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-h-[72px] relative"
    style={{
      borderColor: disabled ? 'rgba(255,255,255,0.08)' : color,
      color: disabled ? 'var(--text-muted)' : color,
      background: disabled ? 'transparent' : `${color}0d`,
      boxShadow: disabled ? 'none' : `0 0 8px ${color}22`,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
  >
    <span className="opacity-90">{icon}</span>
    <span className="font-cyber tracking-wider text-[11px] md:text-xs leading-tight text-center">
      {label}
    </span>
    {badge && (
      <span
        className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-cyber rounded-sm"
        style={{ background: color, color: 'var(--bg-deep)' }}
      >
        {badge}
      </span>
    )}
  </button>
);

interface SectionGroupProps {
  title: string;
  color?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

const SectionGroup = ({ title, color = 'var(--cyan)', defaultOpen = true, children }: SectionGroupProps) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <div className="cyber-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]"
        style={{ borderBottom: open ? `1px solid ${color}33` : 'none' }}
        aria-expanded={open}
      >
        <span className="font-cyber tracking-wider text-sm" style={{ color }}>
          {title}
        </span>
        {open ? <ChevronDown size={16} style={{ color }} /> : <ChevronRight size={16} style={{ color }} />}
      </button>
      {open && <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2">{children}</div>}
    </div>
  );
};

// ---------- 主頁 ----------

const HomePage = () => {
  const [showRules] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showCustomRules, setShowCustomRules] = useState<boolean>(false);
  const [customRules, setCustomRules] = useState<CustomGameRules>({ ...DEFAULT_CUSTOM_RULES });
  const [showLoadPanel, setShowLoadPanel] = useState<boolean>(false);
  const { unlocked: unlockedAchievements, unlock: unlockAchievement } = useAchievements();
  const { init, startBGM, playSfx } = useAudio();
  const { slots, loadGame, deleteSlot, hasAnySave } = useSaveSlots(false);
  const navigate = useNavigate();
  usePlayerIdentity();
  const [unreadMailCount, setUnreadMailCount] = useState<number>(0);
  const { equippedTitle, checkAndUnlockTitles } = useTitles();
  const { canCheckin } = useDailyCheckin();
  const { oauthLogin, updateProfile, isLoading: accountLoading } = useAccount();
  const [oauthErrorMsg, setOauthErrorMsg] = useState<string>('');
  const [showOauthNicknameSetup, setShowOauthNicknameSetup] = useState<boolean>(false);
  const [oauthNicknameInput, setOauthNicknameInput] = useState<string>('');
  const [oauthNicknameError, setOauthNicknameError] = useState<string>('');
  const [isOauthSettingNickname, setIsOauthSettingNickname] = useState<boolean>(false);

  // 聯機子選單展開
  const [onlineExpanded, setOnlineExpanded] = useState<boolean>(false);

  useEffect(() => {
    const error = getOAuthError();
    if (error) setOauthErrorMsg(error);
    const callback = consumeOAuthCallback();
    if (callback && callback.token) {
      const handleOAuth = async (): Promise<void> => {
        try {
          await oauthLogin(callback.token);
          if (callback.needsNicknameSetup) setShowOauthNicknameSetup(true);
        } catch (err) {
          logger.error('OAuth callback failed', { error: err });
          setOauthErrorMsg('第三方登入失敗，請重試');
        }
      };
      void handleOAuth();
    }
  }, [oauthLogin]);

  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // GM 隱藏入口
  const [titleClickCount, setTitleClickCount] = useState<number>(0);
  const handleTitleClick = () => {
    const next = titleClickCount + 1;
    setTitleClickCount(next);
    if (next >= 5) {
      setTitleClickCount(0);
      navigate('/gm-panel');
    }
  };

  // 首次訪問暱稱
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>('');
  const [nicknameError, setNicknameError] = useState<string>('');

  useEffect(() => {
    if (!hasGuestNickname()) {
      const timer = setTimeout(() => setShowNicknameModal(true), 500);
      return () => clearTimeout(timer);
    }
    return;
  }, []);

  const handleSetNickname = () => {
    const trimmed = tempNickname.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setNicknameError('暱稱需為2-20字');
      return;
    }
    setGuestNickname(trimmed);
    setShowNicknameModal(false);
    playSfx('click');
  };

  const handleSkipNickname = () => {
    setShowNicknameModal(false);
    playSfx('click');
  };

  useEffect(() => {
    checkAndUnlockTitles(unlockedAchievements);
  }, [unlockedAchievements, checkAndUnlockTitles]);

  const equippedTitleConfig = equippedTitle ? TITLES[equippedTitle] : null;

  useEffect(() => {
    setUnreadMailCount(getUnreadCount());
  }, []);

  // 公告彈窗
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const unread = getUnreadAnnouncements();
      if (unread.length > 0) setShowAnnouncement(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 聯機斷線重連
  const [onlineRoomInfo, setOnlineRoomInfo] = useState<{ roomCode: string; playerIndex: number } | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('monopoly_online_room');
      if (raw) {
        const parsed = JSON.parse(raw) as { roomCode: string; playerIndex: number };
        if (parsed.roomCode && /^\d{6}$/.test(parsed.roomCode)) setOnlineRoomInfo(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUserInteract = useCallback(() => {
    init();
    startBGM();
  }, [init, startBGM]);

  // 新手教學
  const { shouldAutoPrompt, markPrompted, hasCompleted } = useTutorial({
    onComplete: () => unlockAchievement('beginner'),
  });
  const [showTutorialPrompt, setShowTutorialPrompt] = useState<boolean>(false);
  useEffect(() => {
    if (shouldAutoPrompt) {
      const timer = setTimeout(() => setShowTutorialPrompt(true), 800);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoPrompt]);

  const startTutorial = useCallback(() => {
    handleUserInteract();
    playSfx('click');
    try {
      sessionStorage.setItem('monopoly_tutorial_active', '1');
      sessionStorage.setItem('monopoly_tutorial_step', '1');
    } catch {
      // ignore
    }
    navigate('/local-setup?tutorial=1');
  }, [navigate, handleUserInteract, playSfx]);

  const handleTutorialSkipPrompt = () => {
    playSfx('click');
    markPrompted();
    setShowTutorialPrompt(false);
  };

  // 統一導航
  const go = useCallback(
    (path: string) => () => {
      handleUserInteract();
      playSfx('click');
      navigate(path);
    },
    [handleUserInteract, playSfx, navigate],
  );

  const handleContinue = () => {
    if (!hasAnySave) return;
    playSfx('click');
    setShowLoadPanel(true);
  };

  const handleLoadSlot = (slot: number) => {
    const saved = loadGame(slot);
    if (!saved) return;
    if (!saved.players || saved.players.length < 2) return;
    setContinueSave(slot);
    playSfx('release');
    setShowLoadPanel(false);
    const isAI = saved.players.some((p) => p.isAI);
    const p1Name = saved.players[0].name;
    const p2Name = saved.players[1].name;
    navigate({
      pathname: '/game',
      search: `mode=${saved.mode}&p1=${encodeURIComponent(p1Name)}&p2=${encodeURIComponent(p2Name)}&playMode=${isAI ? 'ai' : 'local'}`,
    });
  };

  const handleCustomStart = () => {
    playSfx('click');
    try {
      sessionStorage.setItem('monopoly_custom_rules', JSON.stringify(customRules));
    } catch {
      // ignore
    }
    navigate({ pathname: '/local-setup', search: 'mode=custom' });
  };

  const goToOnlineResume = () => {
    if (!onlineRoomInfo) return;
    handleUserInteract();
    playSfx('click');
    navigate(`/online/room/${onlineRoomInfo.roomCode}?player=${onlineRoomInfo.playerIndex}`);
  };

  return (
    <>
      <AnnouncementModal open={showAnnouncement} onClose={() => setShowAnnouncement(false)} />
      <div className="min-h-screen w-full px-4 pt-20 pb-28 md:pt-24 md:pb-12 scanlines relative">
        <NeonParticles count={isMobile ? 15 : 40} className="absolute inset-0 pointer-events-none z-0" />

        {/* 右上角控制區 */}
        <div
          className="absolute top-3 right-3 md:top-4 md:right-4 z-30 flex items-center gap-2"
          style={{ paddingTop: 'var(--safe-top, 0px)' }}
        >
          {equippedTitleConfig && (
            <div className="hidden md:block mr-2">
              <TitleEffect effect={equippedTitleConfig.effect} color={equippedTitleConfig.color}>
                <span className="font-cyber text-sm tracking-wider">【{equippedTitleConfig.name}】</span>
              </TitleEffect>
            </div>
          )}
          <UserMenu />
          <button
            type="button"
            onClick={go('/mail')}
            className="cyber-btn p-2 flex items-center gap-1 relative min-w-[44px] min-h-[44px]"
            style={{
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              background: 'rgba(0,255,255,0.08)',
            }}
            aria-label="郵件"
          >
            <Mail size={18} />
            {unreadMailCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ background: 'var(--red)', color: '#fff', boxShadow: '0 0 6px var(--red)', lineHeight: 1 }}
              >
                {unreadMailCount > 99 ? '99+' : unreadMailCount}
              </span>
            )}
          </button>
          <SettingsButton onFirstInteract={handleUserInteract} />
          <VolumeControl onFirstInteract={handleUserInteract} />
        </div>

        {/* 首次訪問暱稱設定 */}
        {showNicknameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
              className="w-full max-w-sm p-6 relative"
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--cyan)',
                boxShadow: '0 0 20px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.05)',
              }}
            >
              <button type="button" onClick={handleSkipNickname} className="absolute top-2 right-2 p-1" style={{ color: 'var(--text-secondary)' }} aria-label="關閉">
                <X size={18} />
              </button>
              <h3 className="font-cyber text-xl font-bold tracking-wider mb-2 text-center" style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan-glow)' }}>
                歡迎來到賽博大富翁
              </h3>
              <p className="text-sm text-center mb-4 font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>請設定你的暱稱</p>
              <div className="relative flex items-center mb-3" style={{ border: `1px solid ${nicknameError ? 'var(--red)' : 'var(--border-neon)'}`, background: 'rgba(0,0,0,0.3)' }}>
                <User size={16} className="absolute left-3" style={{ color: nicknameError ? 'var(--red)' : 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={tempNickname}
                  onChange={(e) => { setTempNickname(e.target.value); setNicknameError(''); }}
                  placeholder="2-20字"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  autoFocus
                />
              </div>
              {nicknameError && <p className="text-xs font-cyber mb-3" style={{ color: 'var(--red)' }}>{nicknameError}</p>}
              <button type="button" onClick={handleSetNickname} className="w-full py-2.5 text-sm font-cyber tracking-widest transition-all" style={{ border: '1px solid var(--cyan)', color: 'var(--cyan)', background: 'rgba(0,255,255,0.1)', boxShadow: '0 0 12px rgba(0,255,255,0.3)' }}>
                確認
              </button>
              <button type="button" onClick={handleSkipNickname} className="w-full py-2 mt-2 text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                稍後再說
              </button>
            </div>
          </div>
        )}

        {/* OAuth 錯誤提示 */}
        {oauthErrorMsg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <div className="p-3 text-sm font-cyber tracking-wide flex items-center justify-between gap-3" style={{ border: '1px solid var(--red)', color: 'var(--red)', background: 'rgba(10,10,20,0.95)', boxShadow: '0 0 15px rgba(255,0,0,0.4)' }}>
              <span className="flex-1">{oauthErrorMsg}</span>
              <button type="button" onClick={() => setOauthErrorMsg('')} className="p-1" style={{ color: 'var(--red)' }} aria-label="關閉"><X size={16} /></button>
            </div>
          </div>
        )}

        {/* OAuth 首次暱稱設定 */}
        {showOauthNicknameSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
              className="w-full max-w-sm p-6 relative"
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--pink)',
                boxShadow: '0 0 20px rgba(255,107,157,0.3)',
              }}
            >
              <h3 className="font-cyber text-xl font-bold tracking-wider mb-2 text-center" style={{ color: 'var(--pink)', textShadow: '0 0 10px var(--pink-glow)' }}>
                歡迎加入賽博大富翁
              </h3>
              <p className="text-sm text-center mb-4 font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>為你的帳號設定一個暱稱</p>
              <div className="relative flex items-center mb-3" style={{ border: `1px solid ${oauthNicknameError ? 'var(--red)' : 'var(--border-neon)'}`, background: 'rgba(0,0,0,0.3)' }}>
                <User size={16} className="absolute left-3" style={{ color: oauthNicknameError ? 'var(--red)' : 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={oauthNicknameInput}
                  onChange={(e) => { setOauthNicknameInput(e.target.value); setOauthNicknameError(''); }}
                  placeholder="2-20字"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  autoFocus
                />
              </div>
              {oauthNicknameError && <p className="text-xs font-cyber mb-3" style={{ color: 'var(--red)' }}>{oauthNicknameError}</p>}
              <button
                type="button"
                onClick={async () => {
                  const trimmed = oauthNicknameInput.trim();
                  if (trimmed.length < 2 || trimmed.length > 20) { setOauthNicknameError('暱稱需為2-20字'); return; }
                  setIsOauthSettingNickname(true);
                  setOauthNicknameError('');
                  try {
                    await updateProfile({ nickname: trimmed });
                    setShowOauthNicknameSetup(false);
                  } catch (err) {
                    const message = err instanceof Error ? err.message : '設定失敗，請重試';
                    setOauthNicknameError(message);
                    logger.error('OAuth nickname setup failed', { error: err });
                  } finally {
                    setIsOauthSettingNickname(false);
                  }
                }}
                disabled={isOauthSettingNickname}
                className="w-full py-2.5 text-sm font-cyber tracking-widest transition-all"
                style={{ border: '1px solid var(--pink)', color: 'var(--pink)', background: 'rgba(255,107,157,0.1)', boxShadow: '0 0 12px rgba(255,107,157,0.3)', cursor: isOauthSettingNickname ? 'not-allowed' : 'pointer', opacity: isOauthSettingNickname ? 0.6 : 1 }}
              >
                {isOauthSettingNickname ? '設定中...' : '確認並進入'}
              </button>
            </div>
          </div>
        )}

        {/* 標題區 */}
        <div className="relative z-10 text-center mb-6 md:mb-8">
          <h1
            className="font-cyber text-4xl md:text-5xl lg:text-6xl font-bold text-neon-cyan pulse-glow glitch-text tracking-widest cursor-pointer select-none"
            onClick={handleTitleClick}
          >
            賽博大富翁
          </h1>
          <p className="mt-2 font-cyber text-xs md:text-base text-neon-pink tracking-[0.3em] uppercase">
            CYBER MONOPOLY
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 text-[10px] md:text-xs font-cyber tracking-widest" style={{ border: '1px solid var(--border-neon)', color: 'var(--text-secondary)' }}>
            <span>v2.0.0</span>
            <span style={{ color: 'var(--cyan)' }}>NEON · FORTUNE · DOMINATION</span>
          </div>
        </div>

        {/* 繼續遊戲橫幅 */}
        {(hasAnySave || onlineRoomInfo) && (
          <div className="relative z-10 max-w-md mx-auto md:max-w-2xl space-y-2 mb-5">
            {hasAnySave && (
              <button
                type="button"
                onClick={handleContinue}
                className="cyber-btn w-full text-center py-3.5 text-base flex items-center justify-center gap-2"
                style={{
                  borderColor: 'var(--green)',
                  color: 'var(--green)',
                  background: 'rgba(0,255,128,0.1)',
                  boxShadow: '0 0 15px rgba(0,255,128,0.3)',
                }}
                aria-label="繼續遊戲"
              >
                <Flag size={18} /> 繼續遊戲
              </button>
            )}
            {onlineRoomInfo && (
              <button
                type="button"
                onClick={goToOnlineResume}
                className="cyber-btn w-full text-center py-3.5 text-base flex items-center justify-center gap-2"
                style={{
                  borderColor: 'var(--cyan)',
                  color: 'var(--cyan)',
                  background: 'rgba(0,255,255,0.1)',
                  boxShadow: '0 0 15px rgba(0,255,255,0.3)',
                }}
                aria-label="繼續聯機遊戲"
              >
                <Globe size={18} /> 繼續聯機遊戲（房號 {onlineRoomInfo.roomCode}）
              </button>
            )}
          </div>
        )}

        {/* 四大主要玩法 */}
        <div className="relative z-10 max-w-md mx-auto md:max-w-2xl mb-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={go('/local-setup')}
              className="cyber-btn p-4 flex flex-col items-center justify-center gap-2 min-h-[96px]"
              style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)', background: 'rgba(0,255,255,0.1)', boxShadow: '0 0 18px rgba(0,255,255,0.25)' }}
            >
              <Users size={28} />
              <span className="font-cyber tracking-wider text-sm">本地多人</span>
            </button>
            <button
              type="button"
              onClick={go('/ai-setup')}
              className="cyber-btn p-4 flex flex-col items-center justify-center gap-2 min-h-[96px]"
              style={{ borderColor: 'var(--pink)', color: 'var(--pink)', background: 'rgba(255,107,157,0.1)', boxShadow: '0 0 18px rgba(255,107,157,0.25)' }}
            >
              <Bot size={28} />
              <span className="font-cyber tracking-wider text-sm">人機對戰</span>
            </button>
            <button
              type="button"
              onClick={() => { playSfx('click'); setOnlineExpanded((p) => !p); }}
              className="cyber-btn p-4 flex flex-col items-center justify-center gap-2 min-h-[96px]"
              style={{ borderColor: 'var(--purple)', color: 'var(--purple)', background: 'rgba(168,85,247,0.1)', boxShadow: '0 0 18px rgba(168,85,247,0.25)' }}
              aria-expanded={onlineExpanded}
            >
              <Globe size={28} />
              <span className="font-cyber tracking-wider text-sm">聯機對戰</span>
              <span className="text-[10px]">{onlineExpanded ? '收起 ▲' : '展開 ▼'}</span>
            </button>
            <button
              type="button"
              onClick={go('/story')}
              className="cyber-btn p-4 flex flex-col items-center justify-center gap-2 min-h-[96px]"
              style={{ borderColor: 'var(--green)', color: 'var(--green)', background: 'rgba(0,255,128,0.1)', boxShadow: '0 0 18px rgba(0,255,128,0.25)' }}
            >
              <BookOpen size={28} />
              <span className="font-cyber tracking-wider text-sm">劇情模式</span>
            </button>
          </div>

          {/* 聯機子選單 */}
          {onlineExpanded && (
            <div className="cyber-card mt-3 p-3 grid grid-cols-2 gap-2">
              <EntryButton label="快速匹配" icon={<QuickMatchIcon size={20} />} onClick={go('/quick-match')} color="var(--green)" />
              <EntryButton label="公開房間" icon={<Users size={20} />} onClick={go('/online/rooms')} color="var(--cyan)" />
              <EntryButton label="建立房間" icon={<Plus size={20} />} onClick={go('/online/create')} color="var(--purple)" />
              <EntryButton label="加入房間" icon={<LogIn size={20} />} onClick={go('/online/join')} color="var(--pink)" />
            </div>
          )}
        </div>

        {/* 分區入口 */}
        <div className="relative z-10 max-w-md mx-auto md:max-w-2xl space-y-3">
          {/* 對戰中心 */}
          <SectionGroup title="對戰中心" color="var(--yellow)">
            <EntryButton label="排位賽季" icon={<Trophy size={20} />} onClick={go('/ranked')} color="var(--yellow)" />
            <EntryButton label="錦標賽" icon={<Swords size={20} />} onClick={go('/tournament')} color="var(--pink)" />
            <EntryButton label="快速匹配" icon={<QuickMatchIcon size={20} />} onClick={go('/quick-match')} color="var(--green)" />
            <EntryButton label="每日挑戰" icon={<Target size={20} />} onClick={go('/daily-challenge')} color="var(--pink)" badge="今日" />
            <EntryButton label="公開房間" icon={<Users size={20} />} onClick={go('/online/rooms')} color="var(--cyan)" />
            <EntryButton label="AI 示範棋譜" icon={<Bot size={20} />} onClick={go('/ai-demo')} color="var(--cyan)" />
            <EntryButton label="排行榜" icon={<BarChart3 size={20} />} onClick={go('/leaderboard')} color="var(--yellow)" />
          </SectionGroup>

          {/* 養成收藏 */}
          <SectionGroup title="養成收藏" color="var(--pink)">
            <EntryButton label="賽季通行證" icon={<Crown size={20} />} onClick={go('/battlepass')} color="var(--purple)" />
            <EntryButton label="成就殿堂" icon={<Trophy size={20} />} onClick={() => { playSfx('click'); setShowAchievements(true); }} color="var(--yellow)" />
            <EntryButton label="收藏櫃" icon={<Sparkles size={20} />} onClick={go('/collection')} color="var(--pink)" />
            <EntryButton label="圖鑑" icon={<BookOpen size={20} />} onClick={go('/codex')} color="var(--cyan)" />
            <EntryButton label="稱號" icon={<Award size={20} />} onClick={go('/profile')} color="var(--purple)" />
            <EntryButton label="皮膚" icon={<Sparkles size={20} />} onClick={go('/collection')} color="var(--pink)" />
            <EntryButton label="霓虹扭蛋" icon={<Gift size={20} />} onClick={go('/gacha')} color="var(--pink)" />
            <EntryButton
              label={canCheckin ? '每日簽到' : '已簽到'}
              icon={<Gift size={20} />}
              onClick={() => { playSfx('click'); setShowCheckinModal(true); }}
              color={canCheckin ? 'var(--yellow)' : 'var(--text-muted)'}
              disabled={!canCheckin}
            />
          </SectionGroup>

          {/* 創作工坊 */}
          <SectionGroup title="創作工坊" color="var(--green)" defaultOpen={false}>
            <EntryButton label="地圖編輯器" icon={<Map size={20} />} onClick={go('/map-editor')} color="var(--yellow)" />
            <EntryButton label="自製卡牌" icon={<FileEdit size={20} />} onClick={go('/card-editor')} color="var(--purple)" />
            <EntryButton label="劇本製作器" icon={<ScrollText size={20} />} onClick={go('/scenario-editor')} color="var(--green)" />
            <EntryButton label="模組管理" icon={<Puzzle size={20} />} onClick={go('/mods')} color="var(--green)" />
            <EntryButton label="社區地圖" icon={<Globe size={20} />} onClick={go('/community-maps')} color="var(--cyan)" />
          </SectionGroup>

          {/* 社交 */}
          <SectionGroup title="社交" color="var(--cyan)" defaultOpen={false}>
            <EntryButton label="好友" icon={<Users size={20} />} onClick={go('/friends')} color="var(--cyan)" />
            <EntryButton label="戰隊" icon={<Shield size={20} />} onClick={go('/guild')} color="var(--green)" />
            <EntryButton label="社交中心" icon={<Users size={20} />} onClick={go('/social')} color="var(--cyan)" />
            <EntryButton label="郵件" icon={<Mail size={20} />} onClick={go('/mail')} color="var(--pink)" badge={unreadMailCount > 0 ? String(unreadMailCount) : undefined} />
            <EntryButton label="觀戰" icon={<Eye size={20} />} onClick={go('/spectate')} color="var(--purple)" />
          </SectionGroup>

          {/* 系統 */}
          <SectionGroup title="系統" color="var(--purple)" defaultOpen={false}>
            <EntryButton label="數據統計" icon={<BarChart3 size={20} />} onClick={go('/stats')} color="var(--cyan)" />
            <EntryButton label="公告" icon={<Megaphone size={20} />} onClick={go('/announcements')} color="var(--yellow)" />
            <EntryButton label="新手教學" icon={<GraduationCap size={20} />} onClick={startTutorial} color="var(--cyan)" />
            <EntryButton label="幸運轉盤" icon={<Dices size={20} />} onClick={go('/lucky-wheel')} color="var(--yellow)" />
            <EntryButton label="霓虹扭蛋" icon={<Gift size={20} />} onClick={go('/gacha')} color="var(--pink)" />
            <EntryButton label="舉報黑名單" icon={<Flag size={20} />} onClick={go('/report-block')} color="var(--red)" />
          </SectionGroup>

          {/* 自訂模式入口（保留） */}
          <div className="cyber-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hammer size={16} style={{ color: 'var(--purple)' }} />
              <span className="font-cyber text-xs" style={{ color: 'var(--text-secondary)' }}>自訂規則模式</span>
            </div>
            <button
              type="button"
              onClick={() => { playSfx('click'); setShowCustomRules(true); }}
              className="cyber-btn px-3 py-1.5 text-xs"
              style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}
            >
              設定
            </button>
          </div>
        </div>

        {/* 版本號 */}
        <div className="relative z-10 mt-8 text-center text-[var(--text-muted)] text-xs font-cyber tracking-wider">
          v2.0.0 · CYBER MONOPOLY
        </div>

        {/* 新手教學提示 */}
        <Dialog open={showTutorialPrompt} onOpenChange={setShowTutorialPrompt}>
          <DialogContent className="cyber-card max-w-md" style={{ borderColor: 'var(--cyan)', boxShadow: '0 0 30px rgba(0,255,255,0.4)', backgroundColor: 'hsl(240,18%,10%)' }} showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="font-cyber text-2xl tracking-wider text-center" style={{ color: 'var(--cyan)' }}>
                歡迎來到賽博大富翁
              </DialogTitle>
              <DialogDescription className="text-center text-[var(--text-secondary)] text-sm">
                看起來你是第一次來到這座霓虹都市。<br />是否開啟新手教學，快速了解遊戲規則？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <button type="button" onClick={handleTutorialSkipPrompt} className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto">暫不</button>
              <button type="button" onClick={() => { setShowTutorialPrompt(false); startTutorial(); }} className="cyber-btn cyber-btn-pink px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider">開始教學</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 彈窗們 */}
        <DailyCheckinModal isOpen={showCheckinModal} onClose={() => setShowCheckinModal(false)} />
        <AchievementModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} unlockedAchievements={unlockedAchievements} />
        <CustomRulesPanel isOpen={showCustomRules} onClose={() => setShowCustomRules(false)} rules={customRules} onChange={setCustomRules} onStartGame={handleCustomStart} />
        <SaveSlotPanel isOpen={showLoadPanel} mode="load" slots={slots} onClose={() => setShowLoadPanel(false)} onSave={() => { /* 唯讀 */ }} onLoad={handleLoadSlot} onDelete={deleteSlot} />

        {showRules && null}
      </div>
    </>
  );
};

export default HomePage;
