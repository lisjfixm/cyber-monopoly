import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { GraduationCap, Trophy, User, Target, Crown, Puzzle, Swords, Map, Users, Brain, Shield, Mail, Flag, Gift, Sparkles, Globe, FileEdit, BookOpen, X } from 'lucide-react';
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

const HomePage = () => {
  const [showOnlineMenu, setShowOnlineMenu] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showCustomRules, setShowCustomRules] = useState<boolean>(false);
  const [customRules, setCustomRules] = useState<CustomGameRules>({ ...DEFAULT_CUSTOM_RULES });
  const [showLoadPanel, setShowLoadPanel] = useState<boolean>(false);
  const { unlocked: unlockedAchievements, unlock: unlockAchievement } = useAchievements();
  const { init, startBGM, playSfx } = useAudio();
  const { slots, loadGame, deleteSlot, hasAnySave } = useSaveSlots(false);
  const navigate = useNavigate();
  const { nickname } = usePlayerIdentity();
  const [unreadMailCount, setUnreadMailCount] = useState<number>(0);
  const { equippedTitle, checkAndUnlockTitles } = useTitles();
  const { canCheckin } = useDailyCheckin();
  const { oauthLogin, updateProfile, isLoading: accountLoading } = useAccount();
  const [oauthErrorMsg, setOauthErrorMsg] = useState<string>('');
  const [showOauthNicknameSetup, setShowOauthNicknameSetup] = useState<boolean>(false);
  const [oauthNicknameInput, setOauthNicknameInput] = useState<string>('');
  const [oauthNicknameError, setOauthNicknameError] = useState<string>('');
  const [isOauthSettingNickname, setIsOauthSettingNickname] = useState<boolean>(false);

  useEffect(() => {
    const error = getOAuthError();
    if (error) {
      setOauthErrorMsg(error);
    }

    const callback = consumeOAuthCallback();
    if (callback && callback.token) {
      const handleOAuth = async (): Promise<void> => {
        try {
          await oauthLogin(callback.token);
          if (callback.needsNicknameSetup) {
            setShowOauthNicknameSetup(true);
          }
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

  // GM 隱藏入口：連續點擊標題5次
  const [titleClickCount, setTitleClickCount] = useState<number>(0);
  const handleTitleClick = () => {
    const next = titleClickCount + 1;
    setTitleClickCount(next);
    if (next >= 5) {
      setTitleClickCount(0);
      navigate('/gm-panel');
    }
  };

  // 首次訪問設置暱稱
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>('');
  const [nicknameError, setNicknameError] = useState<string>('');

  useEffect(() => {
    if (!hasGuestNickname()) {
      const timer = setTimeout(() => {
        setShowNicknameModal(true);
      }, 500);
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

  // 自動解鎖稱號
  useEffect(() => {
    checkAndUnlockTitles(unlockedAchievements);
  }, [unlockedAchievements, checkAndUnlockTitles]);

  const equippedTitleConfig = equippedTitle ? TITLES[equippedTitle] : null;

  useEffect(() => {
    setUnreadMailCount(getUnreadCount());
  }, []);

  // 公告彈窗
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);

  // 進入頁面時檢查未讀公告
  useEffect(() => {
    const timer = setTimeout(() => {
      const unread = getUnreadAnnouncements();
      if (unread.length > 0) {
        setShowAnnouncement(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 联机游戏断线重连检测
  const [onlineRoomInfo, setOnlineRoomInfo] = useState<{ roomCode: string; playerIndex: number } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('monopoly_online_room');
      if (raw) {
        const parsed = JSON.parse(raw) as { roomCode: string; playerIndex: number };
        if (parsed.roomCode && /^\d{6}$/.test(parsed.roomCode)) {
          setOnlineRoomInfo(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUserInteract = useCallback(() => {
    init();
    startBGM();
  }, [init, startBGM]);

  // 新手教学
  const { shouldAutoPrompt, markPrompted, hasCompleted } = useTutorial({
    onComplete: () => {
      unlockAchievement('beginner');
    },
  });
  const [showTutorialPrompt, setShowTutorialPrompt] = useState<boolean>(false);

  // 首次访问自动弹出教学提示
  useEffect(() => {
    if (shouldAutoPrompt) {
      const timer = setTimeout(() => {
        setShowTutorialPrompt(true);
      }, 800);
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

  const goToLeaderboard = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/leaderboard');
  };

  const goToProfile = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/profile');
  };

  const goToMail = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/mail');
  };

  const goToBattlePass = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/battlepass');
  };

  const goToRanked = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/ranked');
  };

  const goToDailyChallenge = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/daily-challenge');
  };

  const goToCollection = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/collection');
  };

  const goToMods = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/mods');
  };

  const goToGuild = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/guild');
  };

  const goToSocial = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/social');
  };

  const handleOnlineClick = () => {
    playSfx('click');
    setShowOnlineMenu((prev) => !prev);
  };

  const goToStory = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/story');
  };

  const goToTournament = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/tournament');
  };

  const goToMapEditor = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/map-editor');
  };

  const goToCommunityMaps = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/community-maps');
  };

  const goToCardEditor = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/card-editor');
  };

  const goToScenarioEditor = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/scenario-editor');
  };

  const goToFriends = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/friends');
  };

  const goToReportBlock = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/report-block');
  };

  const goToAIDemo = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/ai-demo');
  };

  const goToLocal = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/local-setup');
  };

  const goToAI = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/ai-setup');
  };

  const goToOnlineCreate = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/online/create');
  };

  const goToOnlineJoin = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/online/join');
  };

  const goToQuickMatch = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/quick-match');
  };

  const goToPublicRooms = () => {
    handleUserInteract();
    playSfx('click');
    navigate('/online/rooms');
  };

  const goToOnlineResume = () => {
    if (!onlineRoomInfo) return;
    handleUserInteract();
    playSfx('click');
    navigate(`/online/room/${onlineRoomInfo.roomCode}?player=${onlineRoomInfo.playerIndex}`);
  };

  const handleContinue = () => {
    if (!hasAnySave) return;
    playSfx('click');
    setShowLoadPanel(true);
  };

  const handleLoadSlot = (slot: number) => {
    const saved = loadGame(slot);
    if (!saved) return;
    // 防禦：存檔缺少玩家資料時直接返回，避免解構 players[0]/[1] 崩潰
    if (!saved.players || saved.players.length < 2) {
      return;
    }
    // 通过 sessionStorage 传递存档槽位，跳转到游戏页
    setContinueSave(slot);
    playSfx('release');
    setShowLoadPanel(false);
    // 判断模式：AI 还是本地
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
    // 保存当前自定义规则到 sessionStorage
    try {
      sessionStorage.setItem('monopoly_custom_rules', JSON.stringify(customRules));
    } catch {
      // ignore
    }
    // 自定义模式：走本地设置流程，但携带 custom 模式参数
    navigate({
      pathname: '/local-setup',
      search: `mode=custom`,
    });
  };

  const toggleRules = () => {
    playSfx('click');
    setShowRules((prev) => !prev);
  };

  return (
    <>
      <AnnouncementModal
        open={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
      />
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative">
        <NeonParticles count={isMobile ? 15 : 40} className="absolute inset-0 pointer-events-none z-0" />
       {/* 右上角控制区 */}
       <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
         {/* 頂部稱號+暱稱顯示 */}
         {equippedTitleConfig && (
           <div className="hidden md:block mr-2">
             <TitleEffect effect={equippedTitleConfig.effect} color={equippedTitleConfig.color}>
               <span className="font-cyber text-sm tracking-wider">
                 【{equippedTitleConfig.name}】
               </span>
             </TitleEffect>
           </div>
         )}
         <UserMenu />
         <button
           type="button"
           onClick={goToMail}
           className="cyber-btn p-2 flex items-center gap-1 relative"
           style={{
             borderColor: 'var(--cyan)',
             color: 'var(--cyan)',
             background: 'rgba(0, 255, 255, 0.08)',
           }}
           title="郵件"
         >
           <Mail size={18} />
           {unreadMailCount > 0 && (
             <span
               className="absolute -top-1 -right-1 min-w-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
               style={{
                 background: 'var(--red)',
                 color: '#fff',
                 boxShadow: '0 0 6px var(--red)',
                 lineHeight: 1,
               }}
             >
               {unreadMailCount > 99 ? '99+' : unreadMailCount}
             </span>
           )}
         </button>
         <SettingsButton onFirstInteract={handleUserInteract} />
         <VolumeControl onFirstInteract={handleUserInteract} />
       </div>

       {/* 首次訪問暱稱設定彈窗 */}
       {showNicknameModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
           <div
             className="w-full max-w-sm mx-4 p-6 relative"
             style={{
               background: 'var(--bg-dark)',
               border: '1px solid var(--cyan)',
               boxShadow:
                 '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.05)',
             }}
           >
             <button
               type="button"
               onClick={handleSkipNickname}
               className="absolute top-2 right-2 p-1"
               style={{ color: 'var(--text-secondary)' }}
             >
               <X size={18} />
             </button>
             <h3
               className="font-cyber text-xl font-bold tracking-wider mb-2 text-center"
               style={{
                 color: 'var(--cyan)',
                 textShadow: '0 0 10px var(--cyan-glow)',
               }}
             >
               歡迎來到賽博大富翁
             </h3>
             <p
               className="text-sm text-center mb-4 font-cyber tracking-wide"
               style={{ color: 'var(--text-secondary)' }}
             >
               請設定你的暱稱
             </p>
             <div
               className="relative flex items-center mb-3"
               style={{
                 border: `1px solid ${nicknameError ? 'var(--red)' : 'var(--border-neon)'}`,
                 background: 'rgba(0, 0, 0, 0.3)',
               }}
             >
               <User
                 size={16}
                 className="absolute left-3"
                 style={{ color: nicknameError ? 'var(--red)' : 'var(--text-secondary)' }}
               />
               <input
                 type="text"
                 value={tempNickname}
                 onChange={(e) => {
                   setTempNickname(e.target.value);
                   setNicknameError('');
                 }}
                 placeholder="2-20字"
                 className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                 style={{ color: 'var(--text-primary)' }}
                 autoFocus
               />
             </div>
             {nicknameError && (
               <p
                 className="text-xs font-cyber mb-3"
                 style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
               >
                 {nicknameError}
               </p>
             )}
             <button
               type="button"
               onClick={handleSetNickname}
               className="w-full py-2.5 text-sm font-cyber tracking-widest transition-all"
               style={{
                 border: '1px solid var(--cyan)',
                 color: 'var(--cyan)',
                 background: 'rgba(0, 255, 255, 0.1)',
                 boxShadow: '0 0 12px rgba(0, 255, 255, 0.3)',
                 textShadow: '0 0 6px var(--cyan-glow)',
               }}
             >
               確認
             </button>
             <button
               type="button"
               onClick={handleSkipNickname}
               className="w-full py-2 mt-2 text-xs font-cyber tracking-wide"
               style={{ color: 'var(--text-secondary)' }}
             >
               稍後再說
             </button>
           </div>
         </div>
        )}

       {/* OAuth 錯誤提示 */}
       {oauthErrorMsg && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
           <div
             className="p-3 text-sm font-cyber tracking-wide flex items-center justify-between gap-3"
             style={{
               border: '1px solid var(--red)',
               color: 'var(--red)',
               background: 'rgba(10, 10, 20, 0.95)',
               boxShadow: '0 0 15px rgba(255, 0, 0, 0.4)',
               textShadow: '0 0 5px rgba(255, 0, 0, 0.5)',
             }}
           >
             <span className="flex-1">{oauthErrorMsg}</span>
             <button
               type="button"
               onClick={() => setOauthErrorMsg('')}
               className="p-1"
               style={{ color: 'var(--red)' }}
             >
               <X size={16} />
             </button>
           </div>
         </div>
       )}

       {/* OAuth 首次暱稱設定彈窗 */}
       {showOauthNicknameSetup && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
           <div
             className="w-full max-w-sm mx-4 p-6 relative"
             style={{
               background: 'var(--bg-dark)',
               border: '1px solid var(--pink)',
               boxShadow:
                 '0 0 20px rgba(255, 107, 157, 0.3), inset 0 0 20px rgba(255, 107, 157, 0.05)',
             }}
           >
             <h3
               className="font-cyber text-xl font-bold tracking-wider mb-2 text-center"
               style={{
                 color: 'var(--pink)',
                 textShadow: '0 0 10px var(--pink-glow)',
               }}
             >
               歡迎加入賽博大富翁
             </h3>
             <p
               className="text-sm text-center mb-4 font-cyber tracking-wide"
               style={{ color: 'var(--text-secondary)' }}
             >
               為你的帳號設定一個暱稱
             </p>
             <div
               className="relative flex items-center mb-3"
               style={{
                 border: `1px solid ${oauthNicknameError ? 'var(--red)' : 'var(--border-neon)'}`,
                 background: 'rgba(0, 0, 0, 0.3)',
               }}
             >
               <User
                 size={16}
                 className="absolute left-3"
                 style={{ color: oauthNicknameError ? 'var(--red)' : 'var(--text-secondary)' }}
               />
               <input
                 type="text"
                 value={oauthNicknameInput}
                 onChange={(e) => {
                   setOauthNicknameInput(e.target.value);
                   setOauthNicknameError('');
                 }}
                 placeholder="2-20字"
                 className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                 style={{ color: 'var(--text-primary)' }}
                 autoFocus
               />
             </div>
             {oauthNicknameError && (
               <p
                 className="text-xs font-cyber mb-3"
                 style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
               >
                 {oauthNicknameError}
               </p>
             )}
             <button
               type="button"
               onClick={async () => {
                 const trimmed = oauthNicknameInput.trim();
                 if (trimmed.length < 2 || trimmed.length > 20) {
                   setOauthNicknameError('暱稱需為2-20字');
                   return;
                 }
                 setIsOauthSettingNickname(true);
                 setOauthNicknameError('');
                 try {
                   await updateProfile({ nickname: trimmed });
                   setShowOauthNicknameSetup(false);
                 } catch (err) {
                   const message = err instanceof Error ? err.message : '設置失敗，請重試';
                   setOauthNicknameError(message);
                   logger.error('OAuth nickname setup failed', { error: err });
                 } finally {
                   setIsOauthSettingNickname(false);
                 }
               }}
               disabled={isOauthSettingNickname}
               className="w-full py-2.5 text-sm font-cyber tracking-widest transition-all"
               style={{
                 border: '1px solid var(--pink)',
                 color: 'var(--pink)',
                 background: 'rgba(255, 107, 157, 0.1)',
                 boxShadow: '0 0 12px rgba(255, 107, 157, 0.3)',
                 textShadow: '0 0 6px var(--pink-glow)',
                 cursor: isOauthSettingNickname ? 'not-allowed' : 'pointer',
                 opacity: isOauthSettingNickname ? 0.6 : 1,
               }}
             >
               {isOauthSettingNickname ? '設定中...' : '確認並進入'}
             </button>
           </div>
         </div>
       )}

       {/* Title */}
      <div className="text-center mt-14 md:mt-0 mb-12 md:mb-16">
        <h1
          className="font-cyber text-4xl md:text-6xl lg:text-7xl font-bold text-neon-cyan pulse-glow glitch-text tracking-widest cursor-pointer select-none"
          onClick={handleTitleClick}
        >
           賽博大富翁
        </h1>
        <p className="mt-4 font-cyber text-sm md:text-lg text-neon-pink tracking-[0.3em] uppercase">
          CYBER MONOPOLY
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 text-[var(--text-secondary)] text-xs md:text-sm font-cyber tracking-wider">
          <span className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-[var(--cyan)]" />
          <span>NEON · FORTUNE · DOMINATION</span>
          <span className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-[var(--cyan)]" />
        </div>
      </div>

      {/* Main Buttons */}
      <div className="flex flex-col items-stretch gap-4 w-full max-w-sm">
        {/* 繼續遊戲 */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasAnySave}
          className="cyber-btn w-full text-center py-4 text-lg transition-all"
          style={{
            borderColor: hasAnySave ? 'var(--green)' : 'rgba(255, 255, 255, 0.1)',
            color: hasAnySave ? 'var(--green)' : 'rgba(255, 255, 255, 0.3)',
            backgroundColor: hasAnySave ? 'rgba(0, 255, 128, 0.08)' : 'transparent',
            boxShadow: hasAnySave ? '0 0 15px rgba(0, 255, 128, 0.3)' : 'none',
            cursor: hasAnySave ? 'pointer' : 'not-allowed',
          }}
          aria-label="繼續遊戲"
        >
          繼續遊戲
        </button>

        {/* 繼續聯機遊戲 */}
        {onlineRoomInfo && (
          <button
            type="button"
            onClick={goToOnlineResume}
            className="cyber-btn w-full text-center py-4 text-lg transition-all"
            style={{
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              backgroundColor: 'rgba(0, 255, 255, 0.08)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
            }}
            aria-label="繼續聯機遊戲"
          >
             繼續聯機遊戲
          </button>
        )}

        <button
          type="button"
          onClick={goToLeaderboard}
          className="cyber-btn w-full text-center py-4 text-lg flex items-center justify-center gap-2"
          style={{
            borderColor: 'var(--yellow)',
            color: 'var(--yellow)',
            background: 'rgba(255, 200, 0, 0.08)',
            boxShadow: '0 0 12px rgba(255, 200, 0, 0.2)',
          }}
          aria-label="排行榜"
        >
          <Trophy size={20} />
           排行榜
         </button>

        {/* 好友 */}
        <button
          type="button"
          onClick={goToFriends}
          className="cyber-btn w-full text-center py-4 text-lg flex items-center justify-center gap-2"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
            background: 'rgba(0, 255, 255, 0.08)',
            boxShadow: '0 0 12px rgba(0, 255, 255, 0.2)',
          }}
          aria-label="好友中心"
        >
          <Users size={20} />
           好友中心
         </button>

        {/* 賽季通行證 & 排位賽季 & 每日挑戰 & 模組管理 & 戰隊 & 自製卡牌 & 劇本製作器 & 收藏櫃 & 每日簽到 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          <button
            type="button"
            onClick={goToBattlePass}
            className="cyber-btn text-center py-3 text-sm flex flex-col items-center gap-1"
            style={{
              borderColor: 'var(--purple)',
              color: 'var(--purple)',
              background: 'rgba(168, 85, 247, 0.08)',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
            }}
          >
            <Crown size={20} />
             <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">賽季通行證</span>
          </button>

          <button
            type="button"
            onClick={goToRanked}
            className="cyber-btn text-center py-3 text-sm flex flex-col items-center gap-1"
            style={{
              borderColor: 'var(--yellow)',
              color: 'var(--yellow)',
              background: 'rgba(255, 200, 0, 0.08)',
              boxShadow: '0 0 10px rgba(255, 200, 0, 0.2)',
            }}
          >
            <Trophy size={20} />
             <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">排位賽季</span>
          </button>

          <button
            type="button"
            onClick={goToDailyChallenge}
            className="cyber-btn text-center py-3 text-sm flex flex-col items-center gap-1 relative"
            style={{
              borderColor: 'var(--pink)',
              color: 'var(--pink)',
              background: 'rgba(255, 107, 157, 0.08)',
              boxShadow: '0 0 10px rgba(255, 107, 157, 0.2)',
            }}
          >
            <Target size={20} />
             <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">每日挑戰</span>
            <span
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-cyber rounded-sm"
              style={{
                backgroundColor: 'var(--pink)',
                color: 'var(--bg-deep)',
                boxShadow: '0 0 6px var(--pink)',
              }}
            >
              今日
            </span>
          </button>

          <button
            type="button"
            onClick={goToMods}
            className="cyber-btn text-center py-3 text-sm flex flex-col items-center gap-1"
            style={{
              borderColor: 'var(--green)',
              color: 'var(--green)',
              background: 'rgba(0, 255, 128, 0.08)',
              boxShadow: '0 0 10px rgba(0, 255, 128, 0.2)',
            }}
          >
            <Puzzle size={20} />
             <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">模組管理</span>
          </button>

             <button
              type="button"
              onClick={goToGuild}
              className="cyber-btn text-center py-3 text-sm flex flex-col items-center gap-1"
              style={{
                borderColor: 'var(--green)',
                color: 'var(--green)',
                background: 'rgba(0, 255, 128, 0.08)',
                boxShadow: '0 0 10px rgba(0, 255, 128, 0.2)',
              }}
            >
             <Shield size={20} />
               <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">戰隊</span>
             </button>

             <button
               type="button"
               onClick={goToSocial}
               className="cyber-btn text-center py-3 text-sm flex flex-col items-center gap-1"
               style={{
                 borderColor: 'var(--cyan)',
                 color: 'var(--cyan)',
                 background: 'rgba(0, 255, 255, 0.08)',
                 boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
               }}
             >
              <Users size={20} />
               <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">社交中心</span>
              </button>

            <button
              type="button"
              onClick={goToCardEditor}
              className="cyber-btn text-center py-3 text-xs md:text-sm flex flex-col items-center gap-1 min-h-[64px] justify-center whitespace-normal break-words"
              style={{
                borderColor: 'var(--purple)',
                color: 'var(--purple)',
                background: 'rgba(168, 85, 247, 0.08)',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
              }}
            >
              <FileEdit size={20} />
              <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">自製卡牌</span>
            </button>

            <button
              type="button"
              onClick={goToScenarioEditor}
              className="cyber-btn text-center py-3 text-xs md:text-sm flex flex-col items-center gap-1 min-h-[64px] justify-center whitespace-normal break-words"
              style={{
                borderColor: 'var(--green)',
                color: 'var(--green)',
                background: 'rgba(0, 255, 128, 0.08)',
                boxShadow: '0 0 10px rgba(0, 255, 128, 0.2)',
              }}
            >
              <BookOpen size={20} />
              <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">劇本製作器</span>
            </button>

            <button
              type="button"
              onClick={goToCollection}
              className="cyber-btn text-center py-3 text-xs md:text-sm flex flex-col items-center gap-1 min-h-[64px] justify-center whitespace-normal break-words"
              style={{
                borderColor: 'var(--pink)',
                color: 'var(--pink)',
                background: 'rgba(236, 72, 153, 0.08)',
                boxShadow: '0 0 10px rgba(236, 72, 153, 0.2)',
              }}
            >
              <Sparkles size={20} />
              <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">收藏櫃</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setShowCheckinModal(true);
              }}
              className="cyber-btn text-center py-3 text-xs md:text-sm flex flex-col items-center gap-1 min-h-[64px] justify-center whitespace-normal break-words relative"
              style={{
                borderColor: canCheckin ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.1)',
                color: canCheckin ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.3)',
                background: canCheckin ? 'rgba(250, 204, 21, 0.08)' : 'transparent',
                boxShadow: canCheckin ? '0 0 10px rgba(250, 204, 21, 0.2)' : 'none',
                cursor: canCheckin ? 'pointer' : 'not-allowed',
              }}
            >
              <Gift size={20} />
              <span className="font-cyber tracking-wider text-xs md:text-sm whitespace-normal break-words text-center">{canCheckin ? '每日簽到' : '已簽到'}</span>
              {canCheckin && (
                <span
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--red)',
                    boxShadow: '0 0 6px var(--red)',
                    animation: 'checkinDot 1s ease-in-out infinite',
                  }}
                />
              )}
            </button>
          </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={goToStory}
            className="cyber-btn text-center py-3 text-base min-h-[56px] flex items-center justify-center"
            style={{
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              background: 'rgba(0, 255, 255, 0.08)',
              boxShadow: '0 0 12px rgba(0, 255, 255, 0.2)',
            }}
          >
            劇情模式
          </button>

          <button
            type="button"
            onClick={goToTournament}
            className="cyber-btn text-center py-3 text-base min-h-[56px] flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--pink)',
              color: 'var(--pink)',
              background: 'rgba(255, 107, 157, 0.08)',
              boxShadow: '0 0 12px rgba(255, 107, 157, 0.2)',
            }}
          >
            <Swords size={18} />
            錦標賽
          </button>
        </div>

        <button
          type="button"
          onClick={goToMapEditor}
          className="cyber-btn w-full text-center py-3 text-base flex items-center justify-center gap-2"
          style={{
            borderColor: 'var(--yellow)',
            color: 'var(--yellow)',
            background: 'rgba(250, 204, 21, 0.08)',
            boxShadow: '0 0 12px rgba(250, 204, 21, 0.15)',
          }}
        >
          <Map size={18} />
           地圖編輯器
        </button>

        <button
          type="button"
          onClick={goToCommunityMaps}
          className="cyber-btn w-full text-center py-3 text-base flex items-center justify-center gap-2"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
            background: 'rgba(0, 255, 255, 0.06)',
          }}
        >
          <Globe size={18} />
           社區地圖
        </button>

        <button
          type="button"
          onClick={goToLocal}
          className="cyber-btn w-full text-center py-4 text-lg"
           aria-label="本地多人"
        >
           本地多人
         </button>

         <button
           type="button"
           onClick={goToAI}
           className="cyber-btn cyber-btn-pink w-full text-center py-4 text-lg"
           aria-label="人機對戰"
         >
            人機對戰
         </button>

         <button
           type="button"
           onClick={goToAIDemo}
           className="cyber-btn w-full text-center py-3 text-sm flex items-center justify-center gap-2"
           style={{
             borderColor: 'var(--cyan)',
             color: 'var(--cyan)',
             background: 'rgba(0, 255, 255, 0.06)',
           }}
         >
           <Brain size={18} />
           <span className="font-cyber tracking-wider">AI 示範棋譜</span>
         </button>
 

        <button
          type="button"
          onClick={() => {
            playSfx('click');
            setShowCustomRules(true);
          }}
          className="cyber-btn w-full text-center py-4 text-lg"
          style={{
            borderColor: 'var(--purple)',
            color: 'var(--purple)',
            background: 'rgba(168, 85, 247, 0.08)',
          }}
        >
            自訂模式
        </button>

        <div className="w-full">
          <button
            type="button"
            onClick={handleOnlineClick}
            className="cyber-btn w-full text-center py-4 text-lg"
            style={{
              borderColor: 'var(--purple)',
              color: 'var(--purple)',
              background: 'rgba(168, 85, 247, 0.08)',
            }}
          >
             聯機對戰
            <span className="ml-2 text-sm">
              {showOnlineMenu ? '▲' : '▼'}
            </span>
          </button>

          {showOnlineMenu && (
            <div className="mt-2 space-y-2 cyber-card p-3">
               <button
                 type="button"
                 onClick={goToQuickMatch}
                 className="cyber-btn w-full py-3 text-sm"
                 style={{
                   borderColor: 'var(--green)',
                   color: 'var(--green)',
                   background: 'rgba(0, 255, 128, 0.08)',
                   boxShadow: '0 0 12px rgba(0, 255, 128, 0.2)',
                 }}
                 aria-label="快速匹配"
               >
                  快速匹配
              </button>
               <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={goToOnlineCreate}
                   className="cyber-btn flex-1 py-3 text-sm"
                   style={{
                     borderColor: 'var(--purple)',
                     color: 'var(--purple)',
                     background: 'rgba(168, 85, 247, 0.08)',
                   }}
                   aria-label="建立房間"
                 >
                   建立房間
                 </button>
                 <button
                   type="button"
                   onClick={goToOnlineJoin}
                   className="cyber-btn cyber-btn-pink flex-1 py-3 text-sm"
                   aria-label="加入房間"
                 >
                   加入房間
                 </button>
               </div>
               <button
                 type="button"
                 onClick={goToPublicRooms}
                 className="cyber-btn w-full py-3 text-sm"
                 style={{
                   borderColor: 'var(--cyan)',
                   color: 'var(--cyan)',
                   background: 'rgba(0, 255, 255, 0.08)',
                   boxShadow: '0 0 12px rgba(0, 255, 255, 0.2)',
                 }}
                 aria-label="公開房間"
               >
                  公開房間
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Achievement & Rules Buttons */}
        <div className="mt-10 flex items-center justify-center gap-4 md:gap-6 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              startTutorial();
            }}
            className="text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider flex items-center gap-1"
            style={{ textShadow: hasCompleted ? '0 0 8px rgba(0, 255, 255, 0.5)' : 'none' }}
          >
            <GraduationCap size={14} />
             [ 新手教學 ]
          </button>
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setShowAchievements(true);
            }}
            className="text-sm text-[var(--text-secondary)] hover:text-yellow-400 transition-colors font-cyber tracking-wider"
            style={{ textShadow: unlockedAchievements.size > 0 ? '0 0 8px hsla(45, 100%, 60%, 0.5)' : 'none' }}
          >
            [ 成就殿堂 ] ({unlockedAchievements.size}/13)
          </button>
           <button
             type="button"
             onClick={toggleRules}
             className="text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider"
           >
              [ 遊戲規則 ]
           </button>
           <button
             type="button"
             onClick={goToReportBlock}
             className="text-sm text-[var(--text-secondary)] hover:text-neon-pink transition-colors font-cyber tracking-wider flex items-center gap-1"
           >
             <Flag size={14} />
             [ 舉報與黑名單 ]
           </button>
         </div>

      {/* Rules Panel */}
      {showRules && (
        <div className="cyber-card mt-4 p-5 max-w-lg w-full text-sm text-[var(--text-primary)] space-y-3">
          <h3 className="font-cyber text-neon-cyan text-lg tracking-wider mb-2">
             遊戲規則
          </h3>
          <p>
             · 玩家輪流擲骰子，按點數在棋盤上順時針移動。
          </p>
          <p>
             · 落在無主地產上可選擇購買，支付地價後成為所有者。
          </p>
          <p>
             · 落在對手的地產上需支付過路費（地價 × 過路費比例）。
          </p>
          <p>
             · 落在命運區將抽取一張命運卡，觸發隨機事件。
          </p>
          <p>
             · 落在禁閉區會被拘留一回合。
          </p>
          <p>
             · 每經過起點可獲得起點獎勵。
          </p>
          <p>
             · 當僅剩一名玩家未破產時，該玩家獲勝。
          </p>
          <p className="text-[var(--text-secondary)] text-xs mt-4">
             支援 經典 / 快速 / 瘋狂 三種模式，參數各異。
          </p>
        </div>
      )}

      {/* 新手教学提示弹窗 */}
      <Dialog open={showTutorialPrompt} onOpenChange={setShowTutorialPrompt}>
        <DialogContent
          className="cyber-card max-w-md"
          style={{
            borderColor: 'var(--cyan)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle
              className="font-cyber text-2xl tracking-wider text-center"
              style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
            >
               歡迎來到賽博大富翁
            </DialogTitle>
            <DialogDescription className="text-center text-[var(--text-secondary)] text-sm">
               看起來你是第一次來到這座霓虹都市。
               <br />
               是否開啟新手教學，快速了解遊戲規則？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleTutorialSkipPrompt}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
            >
               暫不
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTutorialPrompt(false);
                startTutorial();
              }}
              className="cyber-btn cyber-btn-pink px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
            >
               開始教學
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Daily Checkin Modal */}
       <DailyCheckinModal
         isOpen={showCheckinModal}
         onClose={() => setShowCheckinModal(false)}
       />

       {/* Achievement Modal */}
       <AchievementModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlockedAchievements={unlockedAchievements}
      />

      {/* Custom Rules Panel */}
      <CustomRulesPanel
        isOpen={showCustomRules}
        onClose={() => setShowCustomRules(false)}
        rules={customRules}
        onChange={setCustomRules}
        onStartGame={handleCustomStart}
      />

       {/* 存檔讀取面板 */}
      <SaveSlotPanel
        isOpen={showLoadPanel}
        mode="load"
        slots={slots}
        onClose={() => setShowLoadPanel(false)}
        onSave={() => { /* 只读模式不会调用 */ }}
        onLoad={handleLoadSlot}
        onDelete={deleteSlot}
      />

      {/* Version */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[var(--text-muted)] text-xs font-cyber tracking-wider">
        v1.0 · CYBER MONOPOLY
      </div>

      <style>
        {`
          @keyframes checkinDot {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
          }
        `}
      </style>
    </div>
    </>
  );
};

export default HomePage;
