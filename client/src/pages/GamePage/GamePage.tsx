import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Coins, Globe, MessageCircle, BarChart3, ShoppingBag, Landmark, Receipt, HandCoins, ClipboardList, Trophy, Store, Flag, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

import Board from '@client/src/components/game/Board';
import DiceOverlay from '@client/src/components/game/DiceOverlay';
import PlayerList from '@client/src/components/game/PlayerList';
import GameLog from '@client/src/components/game/GameLog';
import BuyModal from '@client/src/components/game/BuyModal';
import FateCardModal from '@client/src/components/game/FateCardModal';
import ChanceCardModal from '@client/src/components/game/ChanceCardModal';
import PropertyActionModal from '@client/src/components/game/PropertyActionModal';
import TradeModal from '@client/src/components/game/TradeModal';
import ProfessionSelectModal from '@client/src/components/game/ProfessionSelectModal';
import AuctionModal from '@client/src/components/game/AuctionModal';
import StockPanel from '@client/src/components/game/StockPanel';
import GlobalEventModal from '@client/src/components/game/GlobalEventModal';
import AchievementModal from '@client/src/components/game/AchievementModal';
import AchievementToast from '@client/src/components/game/AchievementToast';
import VolumeControl from '@client/src/components/game/VolumeControl';
import SettingsButton from '@client/src/components/SettingsButton';
import AnnouncementButton from '@client/src/components/game/AnnouncementButton';
import StatsPanel from '@client/src/components/game/StatsPanel';
import AIPredictionHint from '@client/src/components/game/AIPredictionHint';
import TutorialOverlay from '@client/src/components/game/TutorialOverlay';
import ItemShop from '@client/src/components/game/ItemShop';
import ItemBar from '@client/src/components/game/ItemBar';
import WorldviewSystemsPanel from '@client/src/components/game/WorldviewSystemsPanel';
import WeatherDisplay from '@client/src/components/game/WeatherDisplay';
import LoanModal from '@client/src/components/game/LoanModal';
import BankModal from '@client/src/components/game/BankModal';
import BatchSelectModal from '@client/src/components/game/BatchSelectModal';
import BondModal from '@client/src/components/game/BondModal';
import MiniGameModal from '@client/src/components/game/MiniGameModal';
import { GlobalChatPanel } from '@client/src/components/social/GlobalChatPanel';
import SkillTreeModal from '@client/src/components/game/SkillTreeModal';
import MissionPanel from '@client/src/components/game/MissionPanel';
import NpcModal from '@client/src/components/game/NpcModal';
import UndergroundMarketModal from '@client/src/components/game/UndergroundMarketModal';
import SeasonDisplay from '@client/src/components/game/SeasonDisplay';
import DisasterModal from '@client/src/components/game/DisasterModal';
import ReplayShareModal from '@client/src/components/game/ReplayShareModal';
import ResourceExchangeModal from '@client/src/components/game/ResourceExchangeModal';
import EmotePanel from '@client/src/components/game/EmotePanel';
import AlliancePanel from '@client/src/components/game/AlliancePanel';
import { TUTORIAL_STEPS } from '@client/src/config/tutorial';
import { useTutorial } from '@client/src/hooks/useTutorial';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { useAudio } from '@client/src/hooks/useAudio';
import { useSaveSlots, consumeContinueSave } from '@client/src/hooks/useSaveSlots';
import { useAutoReplay } from '@client/src/hooks/useAutoReplay';
import SaveSlotPanel from '@client/src/components/game/SaveSlotPanel';
import DanmakuLayer from '@client/src/components/game/DanmakuLayer';
import type { DanmakuMessage as DanmakuMsg } from '@client/src/components/game/DanmakuLayer';
import SpectatorSidebar from '@client/src/components/game/SpectatorSidebar';
import DanmakuInput from '@client/src/components/game/DanmakuInput';
import MentorCard from '@client/src/components/game/MentorCard';
import MentorInput from '@client/src/components/game/MentorInput';
import DevToolsPanel from '@client/src/components/game/DevToolsPanel';
import SystemMenuSheet, { type SystemMenuSection } from '@client/src/components/game/SystemMenuSheet';
import ModeRulesModal from '@client/src/components/game/v3/ModeRulesModal';
import ModeLivePanel from '@client/src/components/game/v3/ModeLivePanel';
import MountQuickActions from '@client/src/components/game/v3/MountQuickActions';
import { getV3ModeLabel, isV3Mode, V3_MODES } from '@client/src/components/game/v3/modeMeta';

import {
  createInitialState,
  rollDice as rollDiceFn,
  processMove,
  applyBuyDecision,
  applyFateCard,
  applyChanceCard,
  applyAIDecision,
  getCellPrice,
  buildHouse,
  demolishBuilding,
  mortgageProperty,
  redeemProperty,
  upgradeSkill as upgradeSkillFn,
  buildSpecialBuilding as buildSpecialBuildingFn,
  demolishSpecialBuilding as demolishSpecialBuildingFn,
  proposeTrade,
  acceptTrade,
  rejectTrade,
  aiShouldAcceptTrade,
  startAuction,
  placeBid,
  passAuction,
  aiAuctionDecision,
  buyFromMerchant,
  hireHacker,
  closeNpcInteraction,
  submitBlindBid,
  aiBlindBid,
  revealBlindBids,
  resolveNpcInteraction,
  buyStock,
  sellStock,
  forceAcquireProperty,
  callShareholderMeeting,
  undergroundMarketBuy,
  bribeBank as bribeBankFn,
  getPropertyValue,
  checkAchievements,
  calculateGameStats,
  reserveProperty,
  proposeOption,
  exerciseOption,
  declareWar,
  makePeace,
  sendSpy,
  gatherIntel,
  counterSpy,
  hireRobotProxy,
  cancelRobotProxy,
  useTimeTravel as applyTimeTravelItem,
  applyItem as applyItemFn,
  triggerParallelWorld,
  evolveProperty,
  unlockMount,
  useFlyerMount,
  useRocketMount,
  addBuildingMaterials,
  equipPet,
  upgradePet,
  takeLoan as takeLoanEngine,
  repayLoan as repayLoanEngine,
  depositMoney as depositMoneyEngine,
  withdrawMoney as withdrawMoneyEngine,
  undoAction as undoActionFn,
  batchBuild as batchBuildFn,
  batchMortgage as batchMortgageFn,
  batchRedeem as batchRedeemFn,
  batchBuildSelected,
  batchMortgageSelected,
  batchRedeemSelected,
  surrender as surrenderFn,
  payBailRelease as payBailReleaseFn,
  buyStockDerivative,
  settleStockDerivative,
  exchangeResource,
  proposeDarknetTrade,
  RESOURCE_EXCHANGE_CONFIG,
  hackProperty,
  quantumJump,
  sellItemToPlayer,
  adjustDiceResult,
  priestSacrifice,
  timeWatcherExtraTurn,
  useProfessionSkill as castProfessionSkill,
  getAvailableProfessionSkills,
  getToll,
  tryAIUseProfessionSkill,
} from '@shared/game-engine';
import { CELLS, GAME_MODES, MODE_LABELS, PROFESSIONS, PLAYER_COLORS, PLAYER_COLOR_HEX, DEFAULT_PLAYER_NAMES, ITEMS, MAX_ITEMS, LOAN_MAX, LOAN_INTEREST_RATE, INSURANCE_RATE, SKILL_IDS, STOCKS, STORY_LEVELS, BAIL_AMOUNT, ACHIEVEMENT_IDS } from '@shared/game-config';
import type { StoryLevelConfig } from '@shared/api.interface';
import type {
  GameState,
  GameMode,
  PlayerState,
  LogEntry,
  FateCard,
  ChanceCard,
  Profession,
  StockSymbol,
  AchievementId,
  CustomGameRules,
  PlayerConfig,
  PlayerColor,
  ItemType,
  Bond,
  DailyChallengeType,
  Mod,
  ItemState,
  NpcEntity,
} from '@shared/api.interface';
import { loadEnabledMods } from '@client/src/utils/mod';
import { AntiCheatMonitor } from '@client/src/utils/anti-cheat';
import { uploadReplay } from '@client/src/utils/replay-share';
import { loadReplays } from '@client/src/pages/ReplayPage/ReplayList';
import { showConfirm } from '@lark-apaas/client-toolkit';
import { vibrate, vibrationPatterns } from '@client/src/utils/vibrate';

type PlayMode = 'local' | 'ai';

const MOVE_STEP_DELAY = 150;

// 投降確認按鈕（長按 1.5 秒）
interface SurrenderButtonProps {
  onConfirm: () => void;
}
const SurrenderButton: React.FC<SurrenderButtonProps> = ({ onConfirm }) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOLD_DURATION = 1500;

  const startHold = () => {
    setHoldProgress(0);
    const startTime = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
      if (elapsed >= HOLD_DURATION) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        onConfirm();
      }
    }, 30);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);
  };

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={(e) => { e.preventDefault(); startHold(); }}
      onTouchEnd={endHold}
      className="cyber-btn px-6 py-2 relative overflow-hidden"
      style={{
        borderColor: 'var(--red)',
        color: 'var(--red)',
        backgroundColor: 'rgba(255, 77, 109, 0.08)',
        boxShadow: holdProgress > 0 ? `0 0 ${holdProgress / 5}px rgba(255, 77, 109, 0.5)` : 'none',
      }}
    >
      <div
        className="absolute inset-0 transition-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 77, 109, 0.3) 0%, rgba(255, 77, 109, 0.1) 100%)',
          width: `${holdProgress}%`,
        }}
      />
      <span className="relative z-10">
        {holdProgress > 0 ? `確認中 ${Math.round(holdProgress)}%` : '長按確認投降'}
      </span>
    </button>
  );
};

// 从 searchParams 解析玩家名称列表
function parsePlayerNames(params: URLSearchParams, count: number): string[] {
  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const name = params.get(`p${i + 1}`);
    names.push(name || DEFAULT_PLAYER_NAMES[i] || `玩家${i + 1}`);
  }
  return names;
}

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 劇情模式：從路由 state 讀取關卡 ID
  const storyLevelId = (location.state as { storyLevel?: number } | null)?.storyLevel ?? null;
  const isStoryMode = storyLevelId !== null;
  const storyLevel = isStoryMode
    ? STORY_LEVELS.find((lvl: StoryLevelConfig) => lvl.id === storyLevelId) ?? null
    : null;

  const mode = isStoryMode && storyLevel
    ? storyLevel.gameMode
    : ((searchParams.get('mode') || 'classic') as GameMode);
  const playMode = isStoryMode ? 'ai' : ((searchParams.get('playMode') || 'local') as PlayMode);
  const isAIGame = playMode === 'ai';
  const aiDifficultyParam = searchParams.get('aiDifficulty');
  const aiDifficulty: 'easy' | 'normal' | 'hard' | 'hell' =
    aiDifficultyParam === 'easy' || aiDifficultyParam === 'hard' || aiDifficultyParam === 'hell'
      ? aiDifficultyParam
      : 'normal';

  // 解析 AI 個性設定
  const aiPersonalities = useMemo<('conservative' | 'aggressive' | 'speculator' | 'trader')[]>(() => {
    const result: ('conservative' | 'aggressive' | 'speculator' | 'trader')[] = [];
    for (let i = 1; i <= 5; i += 1) {
      const p = searchParams.get(`aiPersonality${i}`);
      if (p === 'conservative' || p === 'aggressive' || p === 'speculator' || p === 'trader') {
        result.push(p);
      }
    }
    return result;
  }, [searchParams]);

  // 解析玩家数量和名称
  const playerCountParam = searchParams.get('playerCount');
  const playerCount = isStoryMode && storyLevel
    ? storyLevel.aiCount + 1
    : (playerCountParam
      ? Math.max(2, Math.min(6, parseInt(playerCountParam, 10)))
      : 2);

  const playerNames = useMemo(
    () => parsePlayerNames(searchParams, playerCount),
    [searchParams, playerCount],
  );

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([1, 1]);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(0); // 剩餘秒數
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showFateModal, setShowFateModal] = useState(false);
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeModalMode, setTradeModalMode] = useState<'selectTarget' | 'propose' | 'respond'>('selectTarget');
  const [tradeTargetIndex, setTradeTargetIndex] = useState<number>(-1);
  const [showProfessionSelect, setShowProfessionSelect] = useState(false);
  const [professionSelectIndex, setProfessionSelectIndex] = useState(0);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [pendingProfession, setPendingProfession] = useState<Profession | undefined>(undefined);

  // ===== 金錢浮動動畫 =====
  interface CoinFloatItem {
    id: string;
    playerIndex: number;
    amount: number;
    cellId: number;
  }
  const [coinFloats, setCoinFloats] = useState<CoinFloatItem[]>([]);
  const prevMoneyRef = useRef<number[]>([]);
  const prevBankruptLenRef = useRef<number>(0);
  const prevWinnerRef = useRef<number | null>(null);
  const prevFateModalRef = useRef<boolean>(false);
  const prevChanceModalRef = useRef<boolean>(false);
  const [screenShake, setScreenShake] = useState(false);

  // 股票面板
  const [showStockPanel, setShowStockPanel] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  // 地下市場
  const [showUndergroundMarket, setShowUndergroundMarket] = useState(false);
  const [showResourceExchange, setShowResourceExchange] = useState(false);

  // 道具商店
  const [showItemShop, setShowItemShop] = useState(false);
  // 貸款彈窗
  const [showLoanModal, setShowLoanModal] = useState(false);
  // 存款彈窗
  const [showBankModal, setShowBankModal] = useState(false);
  // 債券彈窗
  const [showBondModal, setShowBondModal] = useState(false);
  const [showSkillTreeModal, setShowSkillTreeModal] = useState(false);
  const [showMissionPanel, setShowMissionPanel] = useState(false);
  // NPC 交互弹窗
  const [showNpcModal, setShowNpcModal] = useState(false);
  // 道具选目标模式
  const [itemTargetMode, setItemTargetMode] = useState<'teleport' | 'steal_property' | 'bomb' | 'quantum_portal' | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  // 撤銷操作倒計時
  const [undoCountdown, setUndoCountdown] = useState(0);
  // 投降確認彈窗
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);
  // 快捷操作確認彈窗
  const [showBatchConfirm, setShowBatchConfirm] = useState<null | 'build' | 'mortgage' | 'redeem'>(null);
  const [batchPreview, setBatchPreview] = useState<{ count: number; amount: number } | null>(null);
  const [showBatchSelect, setShowBatchSelect] = useState<null | 'build' | 'mortgage' | 'redeem'>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [showWorldviewPanel, setShowWorldviewPanel] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  // 次級系統分組抽屜
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  // v3：模式規則說明彈窗
  const [showRulesModal, setShowRulesModal] = useState(false);

  // 職業技能彈窗
  const [showHackModal, setShowHackModal] = useState(false);
  const [hackSelectedCellId, setHackSelectedCellId] = useState<number | null>(null);
  const [showQuantumModal, setShowQuantumModal] = useState(false);
  const [quantumSelectedCellId, setQuantumSelectedCellId] = useState<number | null>(null);
  const [showSellItemModal, setShowSellItemModal] = useState(false);
  const [sellTargetIndex, setSellTargetIndex] = useState<number>(-1);
  const [sellSelectedItemId, setSellSelectedItemId] = useState<number | null>(null);
  const [sellPrice, setSellPrice] = useState<number>(100);

  // Esc 关闭确认弹窗（等同于取消）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showSurrenderDialog) {
        setShowSurrenderDialog(false);
      }
      if (showBatchConfirm) {
        setShowBatchConfirm(null);
        setBatchPreview(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSurrenderDialog, showBatchConfirm]);

  // 分享回放彈窗
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareId, setShareId] = useState<string>('');

  // 全局事件弹窗
  const [showGlobalEvent, setShowGlobalEvent] = useState(false);
  const prevGlobalEventRef = useRef<string | null>(null);
  // 災難彈窗
  const [showDisasterModal, setShowDisasterModal] = useState(false);
  const prevDisasterTypeRef = useRef<string | null>(null);

  // 成就系统
  const { unlocked: unlockedAchievements, unlockMany, unlock: unlockAchievement } = useAchievements();

  // 新手教学（游戏页处理第3步及以后：professions ~ victory）
  const tutorial = useTutorial({
    onComplete: () => {
      unlockAchievement('beginner');
    },
  });
  // 当前步骤属于游戏页的范围（3-11，共9步：professions到victory）
  const tutorialVisible = tutorial.isActive && tutorial.currentStep >= 3;
  // 最新破產玩家索引（用於鏡頭動畫）
  const latestBankruptIndex = useMemo<number | null>(() => {
    if (!gameState) return null;
    const list = gameState.bankruptcyList;
    if (!list || list.length === 0) return null;
    return list[list.length - 1];
  }, [gameState]);

  // ===== 震動反饋 & 金錢浮動動畫 =====
  useEffect(() => {
    if (!gameState) return;
    const animationsOff = document.documentElement.getAttribute('data-animation') === 'off';

    // 金錢變化檢測 -> 浮動金幣
    const currentMoney = gameState.players.map((p) => p.money);
    const prevMoney = prevMoneyRef.current;

    if (prevMoney.length === currentMoney.length && prevMoney.length > 0) {
      const newFloats: CoinFloatItem[] = [];
      for (let i = 0; i < currentMoney.length; i += 1) {
        const diff = currentMoney[i] - prevMoney[i];
        if (Math.abs(diff) > 0) {
          newFloats.push({
            id: `coin-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
            playerIndex: i,
            amount: diff,
            cellId: gameState.players[i].position,
          });
        }
      }
      if (newFloats.length > 0) {
        setCoinFloats((prev) => [...prev, ...newFloats]);
        newFloats.forEach((f: CoinFloatItem) => {
          setTimeout(() => {
            setCoinFloats((prev) => prev.filter((c: CoinFloatItem) => c.id !== f.id));
          }, 800);
        });
      }
    }
    prevMoneyRef.current = currentMoney;

    // 破產 -> heavy 震動 + 畫面震動
    const bankruptLen = gameState.bankruptcyList?.length ?? 0;
    if (bankruptLen > prevBankruptLenRef.current && !animationsOff) {
      vibrate(vibrationPatterns.heavy);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }
    prevBankruptLenRef.current = bankruptLen;

    // 勝利 -> win 震動
    if (gameState.winner !== null && prevWinnerRef.current === null && !animationsOff) {
      vibrate(vibrationPatterns.win);
    }
    prevWinnerRef.current = gameState.winner;

    // 命運卡抽到 -> light 震動
    if (showFateModal && !prevFateModalRef.current && !animationsOff) {
      vibrate(vibrationPatterns.light);
    }
    prevFateModalRef.current = showFateModal;

    // 機會卡抽到 -> light 震動
    if (showChanceModal && !prevChanceModalRef.current && !animationsOff) {
      vibrate(vibrationPatterns.light);
    }
    prevChanceModalRef.current = showChanceModal;
  }, [gameState, showFateModal, showChanceModal]);

  const audio = useAudio();

  // 天氣環境音控制
  useEffect(() => {
    if (!audio.startAmbient || !audio.stopAmbient) return;
    if (!gameState) return;
    const weather = gameState.currentWeather;
    switch (weather) {
      case 'rain':
        audio.startAmbient('rain');
        break;
      case 'em_storm':
        audio.startAmbient('wind');
        break;
      case 'space_calm':
        audio.startAmbient('space');
        break;
      default:
        audio.stopAmbient();
        break;
    }
  }, [gameState, audio]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<AchievementId | null>(null);
  const lastCheckedStateRef = useRef<number>(0);
  const prevLogLengthRef = useRef<number>(0);
  const prevMoveStepRef = useRef<number>(0);

  // 存档系统
  const { slots, saveGame, loadGame, deleteSlot } = useSaveSlots(false);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [savePanelMode, setSavePanelMode] = useState<'save' | 'load'>('save');
  const autoSaveTriggeredRef = useRef<number>(0);

  // 觀戰模式（從 URL 參數啟用，用於演示/開發）
  const isSpectator = searchParams.get('spectator') === '1';
  const [followView, setFollowView] = useState<number | 'free'>('free');

  // 彈幕狀態
  const [danmakuMessages, setDanmakuMessages] = useState<DanmakuMsg[]>([]);
  const danmakuIdRef = useRef<number>(0);

  // 模擬觀戰者列表（演示用）
  const mockSpectators = useMemo(() => {
    if (!isSpectator) return [];
    return [
      { id: 's1', nickname: '霓虹獵手', following: 0 },
      { id: 's2', nickname: '數位浪人', following: 1 },
      { id: 's3', nickname: '賽博朋克', following: undefined },
      { id: 's4', nickname: '暗影行者', following: 0 },
      { id: 's5', nickname: '量子駭客', following: 1 },
    ];
  }, [isSpectator]);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const auctionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tradeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimatingRef = useRef(false);
  // 同步守衛：防止 onClick + onTouchStart 同 tick 連續觸發造成重複擲骰
  const isRollingGuardRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (fateTimerRef.current) clearTimeout(fateTimerRef.current);
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    if (buyTimerRef.current) clearTimeout(buyTimerRef.current);
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    if (tradeTimerRef.current) clearTimeout(tradeTimerRef.current);
    if (auctionTimerRef.current) clearTimeout(auctionTimerRef.current);
  }, []);

  // 构建 PlayerConfig 数组
  const buildPlayerConfigs = useCallback((): PlayerConfig[] => {
    const configs: PlayerConfig[] = [];
    for (let i = 0; i < playerCount; i += 1) {
      configs.push({
        name: playerNames[i] || `玩家${i + 1}`,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length] as PlayerColor,
         isAI: isAIGame && i > 0, // AI 模式：玩家0是人类，其他都是AI
         aiDifficulty: isAIGame && i > 0 ? aiDifficulty : undefined,
         aiPersonality: isAIGame && i > 0 ? aiPersonalities[i - 1] ?? undefined : undefined,
       });
    }
    return configs;
  }, [playerCount, playerNames, isAIGame, aiDifficulty, aiPersonalities]);

  const initGame = useCallback(() => {
    clearAllTimers();
    let customRules: CustomGameRules | undefined = undefined;
    if (mode === 'custom') {
      try {
        const raw = sessionStorage.getItem('monopoly_custom_rules');
        if (raw) {
          customRules = JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }
    // 劇情模式：根據關卡配置生成規則
    if (isStoryMode && storyLevel) {
      const baseInitialMoney = GAME_MODES[storyLevel.gameMode]?.initialMoney ?? 15000;
      const baseTollRate = GAME_MODES[storyLevel.gameMode]?.tollRate ?? 0.25;
      const baseGoBonus = GAME_MODES[storyLevel.gameMode]?.startReward ?? 1500;
      const baseFateMult = GAME_MODES[storyLevel.gameMode]?.fateMoneyMultiplier ?? 1.0;
      customRules = {
        initialMoney: storyLevel.startingMoney ?? baseInitialMoney,
        tollPercent: baseTollRate,
        goBonus: baseGoBonus,
        fateMoneyMultiplier: baseFateMult,
        enableFateCards: true,
        enableChanceCards: true,
        enableStockMarket: true,
        enableGlobalEvents: true,
        buildingTollMode: 'standard',
        bankruptcyLine: 0,
      };
      if (storyLevel.specialRule?.includes('命運卡金錢倍率×2')) {
        customRules.fateMoneyMultiplier = (customRules.fateMoneyMultiplier ?? 1) * 2;
      }
      // 其他特殊規則（建房成本、通脹等）由後續版本引擎實現，目前以基礎配置運行
    }
    // 隨機地圖（適用於所有模式）
    const randomBoardParam = searchParams.get('randomBoard');
    const blindAuctionParam = searchParams.get('blindAuction');
    const needsCustomRules = randomBoardParam === '1' || blindAuctionParam === '1';
    if (needsCustomRules && !isStoryMode) {
      if (!customRules) {
        // 非 custom 模式也啟用特殊規則：構建僅含所需字段的規則對象
        customRules = {
          initialMoney: GAME_MODES[mode]?.initialMoney ?? 15000,
          tollPercent: GAME_MODES[mode]?.tollRate ?? 0.25,
          goBonus: GAME_MODES[mode]?.startReward ?? 1500,
          fateMoneyMultiplier: GAME_MODES[mode]?.fateMoneyMultiplier ?? 1.0,
          enableFateCards: true,
          enableChanceCards: true,
          enableStockMarket: true,
          enableGlobalEvents: true,
          buildingTollMode: 'standard',
          bankruptcyLine: 0,
        };
      }
      if (randomBoardParam === '1') {
        customRules = { ...customRules, randomBoard: true };
      }
      if (blindAuctionParam === '1') {
        customRules = { ...customRules, defaultAuctionMode: 'blind' };
      }
    }
    const playerConfigs = buildPlayerConfigs();
    let challenge: DailyChallengeType | undefined = undefined;
    try {
      const raw = sessionStorage.getItem('monopoly_challenge');
      if (raw && raw !== 'none') {
        challenge = raw as DailyChallengeType;
      }
    } catch {
      // ignore
    }
    const enabledMods: Mod[] = loadEnabledMods();
    const state = createInitialState(mode, playerConfigs, customRules, challenge, enabledMods);
    setGameState(state);
    setGameStarted(false);
    setShowEndModal(false);
    setShowBuyModal(false);
    setShowFateModal(false);
    setShowChanceModal(false);
    setShowProfessionSelect(false);
    setProfessionSelectIndex(0);
    setPendingProfession(undefined);
    setIsRolling(false);
    isRollingGuardRef.current = false;
    setTradeTargetIndex(-1);
   }, [mode, buildPlayerConfigs, clearAllTimers, isStoryMode, storyLevel]);

  // 自動錄制回放
  useAutoReplay({
    gameState,
    gameStarted,
    gameMode: mode,
  });

  // 反作弊監控：遊戲開始時啟動，結束/卸載時停止
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase === 'ended') return;

    const monitor = AntiCheatMonitor.getInstance();
    if (!monitor.isRunning()) {
      monitor.start(
        gameState.players.map((p, i) => ({
          index: i,
          money: p.money,
        })),
      );
    }

    return () => {
      // 組件卸載或狀態變化時停止
    };
  }, [gameState, gameStarted]);

  // 遊戲結束時停止反作弊監控
  useEffect(() => {
    if (gameState?.phase === 'ended') {
      const monitor = AntiCheatMonitor.getInstance();
      if (monitor.isRunning()) {
        monitor.stop();
      }
    }
  }, [gameState?.phase]);

  // 記錄骰子點擊用於反作弊頻率檢測
  const recordAntiCheatClick = useCallback((): void => {
    const monitor = AntiCheatMonitor.getInstance();
    if (monitor.isRunning()) {
      monitor.recordClick();
    }
  }, []);

  // 实时计算游戏统计
  const gameStats = useMemo(() => {
    if (!gameState) return null;
    return calculateGameStats(gameState);
  }, [gameState]);

  // 实时计算每个玩家的地产数量
  const propertyCounts = useMemo(() => {
    if (!gameState) return {};
    const counts: Record<number, number> = {};
    for (let i = 0; i < gameState.players.length; i += 1) {
      counts[i] = 0;
    }
    for (const prop of Object.values(gameState.properties)) {
      if (counts[prop.owner] !== undefined) {
        counts[prop.owner] += 1;
      }
    }
    return counts;
  }, [gameState]);

  // 实时计算每个玩家的债券发行/持有数量
  const bondIssuedCounts = useMemo(() => {
    if (!gameState || !gameState.bonds) return {};
    const counts: Record<number, number> = {};
    for (let i = 0; i < gameState.players.length; i += 1) {
      counts[i] = 0;
    }
    for (const bond of gameState.bonds) {
      if (!bond.active) continue;
      if (counts[bond.issuerId] !== undefined) {
        counts[bond.issuerId] += 1;
      }
    }
    return counts;
  }, [gameState]);

  const bondHeldCounts = useMemo(() => {
    if (!gameState || !gameState.bonds) return {};
    const counts: Record<number, number> = {};
    for (let i = 0; i < gameState.players.length; i += 1) {
      counts[i] = 0;
    }
    for (const bond of gameState.bonds) {
      if (!bond.active || bond.holderId === null) continue;
      if (counts[bond.holderId] !== undefined) {
        counts[bond.holderId] += 1;
      }
    }
    return counts;
  }, [gameState]);

  useEffect(() => {
    initGame();
    // 检查是否有继续游戏的存档
    const continueSlot = consumeContinueSave();
    if (continueSlot !== null) {
      const saved = loadGame(continueSlot);
      if (saved) {
        setGameState(saved);
        setGameStarted(true);
      }
    }
    return () => clearAllTimers();
  }, [initGame, clearAllTimers, loadGame]);

  const isCurrentAI = useCallback((state: GameState): boolean => {
    if (!isAIGame) return false;
    const currentPlayer = state.players[state.currentPlayerIndex];
    return !!currentPlayer?.isAI;
  }, [isAIGame]);

  const advanceTurn = useCallback((newState: GameState) => {
    setGameState(newState);
    if (newState.phase === 'buying' && !isCurrentAI(newState)) {
      setShowBuyModal(true);
    }
  }, [isCurrentAI]);

  const handleRollDice = useCallback(() => {
    if (!gameState || isRolling) return;
    if (gameState.phase !== 'rolling') return;
    // 同步守衛：同 tick 內第二次呼叫直接忽略（觸控/點擊雙觸發）
    if (isRollingGuardRef.current) return;
    isRollingGuardRef.current = true;

    // 反作弊：記錄點擊頻率
    recordAntiCheatClick();

    audio.init();
    audio.startBGM();
    audio.playSfx('dice');
    const dice = rollDiceFn();
    setDiceValues(dice);
    setIsRolling(true);
    isAnimatingRef.current = true;

    if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    rollTimerRef.current = setTimeout(() => {
      setIsRolling(false);
      isRollingGuardRef.current = false;
    }, 1500);
  }, [gameState, isRolling, audio]);

  // 回合倒計時邏輯（放在所有 hook 之后，early return 之前）
  const turnTimeLimit = gameState?.turnTimeLimit ?? 0;
  const turnStartTime = gameState?.turnStartTime ?? 0;
  const hasTurnTimer = turnTimeLimit > 0 && turnStartTime > 0 && gameState?.phase === 'rolling' && gameState?.winner === null;
  const isUrgent = hasTurnTimer && turnTimeLeft <= 10 && turnTimeLeft > 0;

  useEffect(() => {
    if (!hasTurnTimer || !gameState) {
      setTurnTimeLeft(0);
      return;
    }

    const updateTimeLeft = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - turnStartTime) / 1000);
      const remaining = Math.max(0, turnTimeLimit - elapsed);
      setTurnTimeLeft(remaining);

      const currentIsMyTurn = !isCurrentAI(gameState);
      if (remaining === 0 && gameState.phase === 'rolling' && !isRolling && currentIsMyTurn && gameState.winner === null) {
        handleRollDice();
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [hasTurnTimer, turnTimeLimit, turnStartTime, gameState, isRolling, isCurrentAI, handleRollDice]);

  const onDiceComplete = useCallback(() => {
    if (!gameState) {
      setIsRolling(false);
      isRollingGuardRef.current = false;
      return;
    }
    const dice = diceValues;
    const current = gameState;
    const playerIdx = current.currentPlayerIndex;
    const player = current.players[playerIdx];
    const oldPos = player.position;
    const totalSteps = dice[0] + dice[1];

    if (player.isInDetention || totalSteps <= 0) {
      const newState = processMove(current, dice);
      setIsRolling(false);
      isRollingGuardRef.current = false;
      isAnimatingRef.current = false;
      advanceTurn(newState);
      return;
    }

    let step = 0;

    const doStep = () => {
      step += 1;
      audio.playMoveStep();

      if (step < totalSteps) {
        const nextPos = (((oldPos + step) % 36) + 36) % 36;
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p, i) =>
              i === playerIdx ? { ...p, position: nextPos } : p,
            ),
          };
        });
        moveTimerRef.current = setTimeout(doStep, MOVE_STEP_DELAY);
      } else {
        setGameState((prev) => {
          if (!prev) return prev;
          const resetForEngine = {
            ...prev,
            players: prev.players.map((p, i) =>
              i === playerIdx ? { ...p, position: oldPos } : p,
            ),
          };
          return processMove(resetForEngine, dice);
        });
        setIsRolling(false);
        isRollingGuardRef.current = false;
        isAnimatingRef.current = false;
      }
    };

    moveTimerRef.current = setTimeout(doStep, MOVE_STEP_DELAY);
  }, [gameState, diceValues, advanceTurn, audio]);

  const handleBuy = () => {
    if (!gameState) return;
    const newState = applyBuyDecision(gameState, true);
    setGameState(newState);
    setShowBuyModal(false);
    audio.playSfx('buy');
    const animationsOff = document.documentElement.getAttribute('data-animation') === 'off';
    if (!animationsOff) vibrate(vibrationPatterns.light);
  };

  const handleSkip = () => {
    if (!gameState) return;
    const newState = applyBuyDecision(gameState, false);
    setGameState(newState);
    setShowBuyModal(false);
  };

  const handleReserve = () => {
    if (!gameState) return;
    const newState = reserveProperty(gameState, gameState.players[gameState.currentPlayerIndex].position);
    setGameState(newState);
    setShowBuyModal(false);
    audio.playSfx('buy');
  };

  const handleRestart = () => {
    audio.playSfx('click');
    initGame();
  };

  // ========== 职业选择（多人轮转） ==========

  const handleProfessionSelect = (profession: Profession) => {
    setPendingProfession(profession);
  };

  const handleProfessionClose = () => {
    setShowProfessionSelect(false);
    setPendingProfession(undefined);
    // 回到开局前状态（如果尚未开始游戏）
    if (!gameStarted) {
      setProfessionSelectIndex(0);
    }
  };

  const handleProfessionConfirm = () => {
    if (!pendingProfession || !gameState) return;

    let newState: GameState = {
      ...gameState,
      players: gameState.players.map((p, i) =>
        i === professionSelectIndex ? { ...p, profession: pendingProfession } : p,
      ),
    };
    setPendingProfession(undefined);

    // AI 模式下，给所有 AI 玩家随机分配职业
    if (isAIGame && professionSelectIndex === 0) {
      const professionKeys = Object.keys(PROFESSIONS) as Profession[];
      const usedProfessions: Profession[] = [pendingProfession];

      newState = {
        ...newState,
        players: newState.players.map((p, i) => {
          if (i === 0 || !p.isAI) return p;
          const available = professionKeys.filter((pk) => !usedProfessions.includes(pk));
          if (available.length === 0) return p;
          const chosen = available[Math.floor(Math.random() * available.length)];
          usedProfessions.push(chosen);
          return { ...p, profession: chosen };
        }),
      };

      setGameState(newState);
      setShowProfessionSelect(false);
      setGameStarted(true);
    } else {
      setGameState(newState);

      // 找下一个还没选职业的人类玩家
      const nextIdx = findNextHumanPlayer(newState, professionSelectIndex);
      if (nextIdx >= 0) {
        setProfessionSelectIndex(nextIdx);
      } else {
        // 所有玩家都选好了
        setShowProfessionSelect(false);
        setGameStarted(true);
      }
    }
  };

  // 找下一个需要选职业的人类玩家索引
  const findNextHumanPlayer = (state: GameState, fromIdx: number): number => {
    const n = state.players.length;
    for (let offset = 1; offset <= n; offset += 1) {
      const idx = (fromIdx + offset) % n;
      const p = state.players[idx];
      if (p && !p.isAI && !p.profession) {
        return idx;
      }
    }
    return -1;
  };

  // ========== 拍卖（多人） ==========

  const handleStartAuction = () => {
    if (!gameState) return;
    const cellId = gameState.players[gameState.currentPlayerIndex].position;
    const newState = startAuction(gameState, cellId);
    setGameState(newState);
    setShowBuyModal(false);
  };

  const handleBid = (amount: number) => {
    if (!gameState || !gameState.auction) return;
    const activeBidder = gameState.auction.activeBidders[gameState.auction.activeBidderIndex];
    if (activeBidder === undefined) return;
    const newState = placeBid(gameState, activeBidder, amount);
    setGameState(newState);
  };

  const handlePass = () => {
    if (!gameState || !gameState.auction) return;
    const activeBidder = gameState.auction.activeBidders[gameState.auction.activeBidderIndex];
    if (activeBidder === undefined) return;
    const newState = passAuction(gameState, activeBidder);
    setGameState(newState);
  };

  // ========== NPC 交互 ==========

  const handleBuyFromMerchant = (itemType: string) => {
    if (!gameState) return;
    const newState = buyFromMerchant(gameState, gameState.currentPlayerIndex, itemType as ItemType);
    setGameState(newState);
  };

  const handleHireHacker = (targetIndex: number) => {
    if (!gameState) return;
    let newState = hireHacker(gameState, gameState.currentPlayerIndex, targetIndex);
    newState = closeNpcInteraction(newState, gameState.currentPlayerIndex);
    setGameState(newState);
    setShowNpcModal(false);
  };

  const handleCloseNpc = () => {
    if (!gameState) return;
    const newState = closeNpcInteraction(gameState, gameState.currentPlayerIndex);
    setGameState(newState);
    setShowNpcModal(false);
  };

  // ========== 暗拍 ==========

  const handleSubmitBlindBid = (bidAmount: number) => {
    if (!gameState || !gameState.auction?.isBlind) return;
    const newState = submitBlindBid(gameState, gameState.currentPlayerIndex, bidAmount);
    setGameState(newState);
  };

  const handleRevealBlindBids = () => {
    if (!gameState || !gameState.auction?.isBlind) return;
    const newState = revealBlindBids(gameState);
    setGameState(newState);
  };

  const handleCellClick = (cellId: number) => {
    if (!gameState) return;
    if (gameState.winner !== null) return;
    if (isAnimatingRef.current) return;

    // 选目标模式：传送卡/偷地卡
    if (itemTargetMode && pendingItemId !== null) {
      handleUseItem(pendingItemId, cellId);
      return;
    }

    if (gameState.phase !== 'rolling') return;
    if (gameState.pendingTrade) return;

    const prop = gameState.properties[cellId];
    if (!prop) return;

    // 只有当前玩家（热座模式下都是人类操作）且是自己的地块才能操作
    const currentIdx = gameState.currentPlayerIndex;
    if (isAIGame && gameState.players[currentIdx]?.isAI) return; // AI 回合不能点
    if (prop.owner !== currentIdx) return;

    setSelectedCellId(cellId);
    setShowPropertyModal(true);
  };

  const handleBuild = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = buildHouse(gameState, playerIdx, selectedCellId);
    setGameState(newState);
  };

  const handleDemolish = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = demolishBuilding(gameState, playerIdx, selectedCellId);
    setGameState(newState);
  };

  const handleMortgage = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = mortgageProperty(gameState, playerIdx, selectedCellId);
    setGameState(newState);
  };

  const handleRedeem = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = redeemProperty(gameState, playerIdx, selectedCellId);
    setGameState(newState);
  };

  // ========== 結盟系統（前端模擬） ==========

  const handleBetrayalLog = (text: string) => {
    if (!gameState) return;
    const newLog: LogEntry = {
      id: gameState.logs.length + 1,
      type: 'reputation',
      text,
    };
    setGameState({
      ...gameState,
      logs: [...gameState.logs, newLog],
    });
    audio.playSfx('pay');
  };

  // ========== 保險系統 ==========

  const handleBuyInsurance = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const cell = CELLS[selectedCellId];
    if (!cell) return;
    const premium = Math.floor(cell.basePrice * INSURANCE_RATE);
    const player = gameState.players[playerIdx];
    if (player.money < premium) return;

    const newState: GameState = {
      ...gameState,
      players: gameState.players.map((p, i) =>
        i === playerIdx ? { ...p, money: p.money - premium, totalAssets: p.totalAssets - premium } : p,
      ),
      properties: {
        ...gameState.properties,
        [selectedCellId]: {
          ...gameState.properties[selectedCellId],
          insured: true,
        },
      },
      logs: [
        ...gameState.logs,
        {
          id: gameState.logs.length + 1,
          type: 'insurance' as const,
          text: `${player.name} 為 ${cell.name} 購買了保險（保費 ¥${premium.toLocaleString()}）`,
        },
      ],
    };
    setGameState(newState);
    audio.playSfx('buy');
  };

  // ========== 地產進化 ==========

  const handleEvolveProperty = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = evolveProperty(gameState, playerIdx, selectedCellId);
    setGameState(newState);
    audio.playSfx('buy');
  };

  // ========== 世界觀系統 ==========

  const handleDeclareWar = (targetIndex: number) => {
    if (!gameState) return;
    const newState = declareWar(gameState, targetIndex);
    setGameState(newState);
    audio.playSfx('dice');
  };

  const handleMakePeace = (targetIndex: number) => {
    if (!gameState) return;
    const newState = makePeace(gameState, targetIndex);
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleSendSpy = (targetIndex: number) => {
    if (!gameState) return;
    const newState = sendSpy(gameState, targetIndex);
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleGatherIntel = (targetIndex: number) => {
    if (!gameState) return;
    const intel = gatherIntel(gameState, targetIndex);
    if (intel) {
      const target = gameState.players[targetIndex];
      toast(
        `【情報】${target?.name ?? ''}\n現金：¥${intel.money.toLocaleString()}\n地產：${intel.propertyCount} 塊\n道具：${intel.itemCount} 個`,
        { duration: 5000 }
      );
    } else {
      toast('情報獲取失敗', { duration: 2000 });
    }
  };

  const handleCounterSpy = () => {
    if (!gameState) return;
    const newState = counterSpy(gameState);
    setGameState(newState);
    audio.playSfx('event');
  };

  const handleToggleRobotProxy = (enable: boolean) => {
    if (!gameState) return;
    if (enable) {
      const newState = hireRobotProxy(gameState);
      setGameState(newState);
    } else {
      const newState = cancelRobotProxy(gameState);
      setGameState(newState);
    }
    audio.playSfx('buy');
  };

  const handleUseTimeTravel = () => {
    if (!gameState) return;
    const newState = applyTimeTravelItem(gameState, gameState.currentPlayerIndex);
    setGameState(newState);
    audio.playSfx('jump');
  };

  const handleTriggerParallelWorld = () => {
    if (!gameState) return;
    const newState = triggerParallelWorld(gameState, gameState.currentPlayerIndex);
    setGameState(newState);
    audio.playSfx('jump');
  };

  const handleEquipMount = (mountType: import('@shared/api.interface').MountType) => {
    if (!gameState) return;
    const newState = unlockMount(gameState, gameState.currentPlayerIndex, mountType);
    setGameState(newState);
    audio.playSfx('buy');
    toast(`已裝備坐騎：${mountType === 'flyer' ? '飛行器' : mountType === 'diver' ? '潛水艇' : '火箭'}`, { duration: 2000 });
  };

  const handleBringPet = (petType: import('@shared/api.interface').PetType) => {
    if (!gameState) return;
    const newState = equipPet(gameState, gameState.currentPlayerIndex, petType);
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleUpgradePet = (petType: import('@shared/api.interface').PetType) => {
    if (!gameState) return;
    const newState = upgradePet(gameState, gameState.currentPlayerIndex);
    setGameState(newState);
    audio.playSfx('buy');
  };

  // ========== 技能樹系統 ==========

  const handleUpgradeSkill = (skillId: string) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = upgradeSkillFn(gameState, playerIdx, skillId as import('@shared/api.interface').SkillId);
    setGameState(newState);
    audio.playSfx('buy');
  };

  // ========== 特殊建築系統 ==========

  const handleBuildSpecial = (buildingType: string) => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = buildSpecialBuildingFn(
      gameState,
      playerIdx,
      selectedCellId,
      buildingType as import('@shared/api.interface').SpecialBuildingType,
    );
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleDemolishSpecial = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = demolishSpecialBuildingFn(gameState, playerIdx, selectedCellId);
    setGameState(newState);
    audio.playSfx('release');
  };

  // ========== 交易（多人） ==========

  const handleOpenTrade = () => {
    if (!gameState) return;
    const aliveOthers = gameState.players.filter((p, i) => i !== gameState.currentPlayerIndex && !p.isBankrupt);
    if (aliveOthers.length === 0) return;

    // 多人模式先选择交易对象；两人模式直接进入 propose
    if (gameState.players.filter((p) => !p.isBankrupt).length > 2) {
      setTradeModalMode('selectTarget');
      setTradeTargetIndex(-1);
    } else {
      // 两人模式：直接找对方
      const otherIdx = gameState.players.findIndex((p, i) => i !== gameState.currentPlayerIndex && !p.isBankrupt);
      setTradeTargetIndex(otherIdx);
      setTradeModalMode('propose');
    }
    setShowTradeModal(true);
  };

  const handleSelectTradeTarget = (targetIdx: number) => {
    setTradeTargetIndex(targetIdx);
    setTradeModalMode('propose');
  };

  const handleProposeTrade = (given: number[], received: number[], money: number) => {
    if (!gameState || tradeTargetIndex < 0) return;
    const fromPlayer = gameState.currentPlayerIndex;
    const newState = gameState.darknetMode
      ? proposeDarknetTrade(gameState, fromPlayer, tradeTargetIndex, {
          givenProperties: given,
          receivedProperties: received,
          moneyAmount: money,
        })
      : proposeTrade(gameState, fromPlayer, tradeTargetIndex, {
          givenProperties: given,
          receivedProperties: received,
          moneyAmount: money,
        });
    setGameState(newState);
    setShowTradeModal(false);
    setTradeTargetIndex(-1);
  };

  const handleAcceptTrade = () => {
    if (!gameState) return;
    const newState = acceptTrade(gameState);
    setGameState(newState);
    setShowTradeModal(false);
  };

  const handleRejectTrade = () => {
    if (!gameState) return;
    const newState = rejectTrade(gameState);
    setGameState(newState);
    setShowTradeModal(false);
  };

  // ========== 資源兌換 ==========
  const handleExchangeResource = (type: import('@shared/game-engine').ResourceExchangeType) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = exchangeResource(gameState, playerIdx, type);
    setGameState(newState);
    setShowResourceExchange(false);
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  // ========== 存档系统 ==========

  const openSavePanel = () => {
    audio.playSfx('click');
    setSavePanelMode('save');
    setShowSavePanel(true);
  };

  const handleSaveToSlot = (slot: number) => {
    if (!gameState) return;
    const ok = saveGame(slot, gameState, { isAutoSave: slot === 0 });
    if (ok) {
      audio.playSfx('buy');
    }
    setShowSavePanel(false);
  };

  const handleLoadFromSlot = (slot: number) => {
    const saved = loadGame(slot);
    if (saved) {
      clearAllTimers();
      setGameState(saved);
      setGameStarted(true);
      setShowBuyModal(false);
      setShowFateModal(false);
      setShowChanceModal(false);
      setShowPropertyModal(false);
      setShowTradeModal(false);
      setShowEndModal(false);
      prevLogLengthRef.current = saved.logs.length;
      audio.playSfx('release');
    }
    setShowSavePanel(false);
  };

  const handleDeleteSlot = (slot: number) => {
    deleteSlot(slot);
    audio.playSfx('click');
  };

  // ========== 股票系统 ==========

  const handleBuyStock = (symbol: StockSymbol, quantity: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = buyStock(gameState, playerIdx, symbol, quantity);
    setGameState(newState);
  };

  const handleSellStock = (symbol: StockSymbol, quantity: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = sellStock(gameState, playerIdx, symbol, quantity);
    setGameState(newState);
  };

  // ========== 強制收購系統 ==========

  const handleForceAcquire = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = forceAcquireProperty(gameState, playerIdx, selectedCellId);
    setGameState(newState);
    setShowPropertyModal(false);
    setSelectedCellId(null);
    audio.playSfx('buy');
  };

  // ========== 賄賂銀行系統 ==========

  const handleBribeBank = () => {
    if (!gameState || selectedCellId === null) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = bribeBankFn(gameState, playerIdx, selectedCellId);
    setGameState(newState);
    setShowPropertyModal(false);
    setSelectedCellId(null);
    audio.playSfx('buy');
  };

  // ========== 撤銷操作 ==========

  const handleUndoConfirm = () => {
    if (!gameState) return;
    const newState = undoActionFn(gameState);
    setGameState(newState);
    setShowUndoConfirm(false);
    audio.playSfx('click');
    toast('已撤銷上一步操作');
  };

  // ========== 快捷操作（批量） ==========

  const handleBatchBuild = () => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const { state: newState, totalCost, builtCount } = batchBuildFn(gameState, playerIdx);
    setGameState(newState);
    setShowBatchConfirm(null);
    setBatchPreview(null);
    audio.playSfx('buy');
  };

  const handleBatchMortgage = () => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const { state: newState, totalValue, count } = batchMortgageFn(gameState, playerIdx);
    setGameState(newState);
    setShowBatchConfirm(null);
    setBatchPreview(null);
    audio.playSfx('click');
  };

  const handleBatchRedeem = () => {
    if (!gameState || !batchPreview) return;
    const playerIdx = gameState.currentPlayerIndex;
    const { state: newState, totalCost, count } = batchRedeemFn(gameState, playerIdx);
    setGameState(newState);
    setShowBatchConfirm(null);
    setBatchPreview(null);
    audio.playSfx('buy');
  };

  const handleBatchSelectConfirm = (cellIds: number[]) => {
    if (!gameState || !showBatchSelect) return;
    const playerIdx = gameState.currentPlayerIndex;
    let newState: GameState = gameState;
    let count = 0;
    if (showBatchSelect === 'build') {
      const res = batchBuildSelected(gameState, playerIdx, cellIds);
      newState = res.state;
      count = res.builtCount;
      audio.playSfx('buy');
      toast.success(`已建造 ${count} 棟建築`);
    } else if (showBatchSelect === 'mortgage') {
      const res = batchMortgageSelected(gameState, playerIdx, cellIds);
      newState = res.state;
      count = res.count;
      audio.playSfx('click');
      toast.success(`已抵押 ${count} 塊地產`);
    } else {
      const res = batchRedeemSelected(gameState, playerIdx, cellIds);
      newState = res.state;
      count = res.count;
      audio.playSfx('click');
      toast.success(`已贖回 ${count} 塊地產`);
    }
    setGameState(newState);
    setShowBatchSelect(null);
  };

  const openBatchConfirm = (type: 'build' | 'mortgage' | 'redeem') => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    // 簡單預覽：先模擬一遍獲取數量和金額（不修改狀態）
    if (type === 'build') {
      const { totalCost, builtCount } = batchBuildFn(gameState, playerIdx);
      setBatchPreview({ count: builtCount, amount: totalCost });
    } else if (type === 'mortgage') {
      const { totalValue, count } = batchMortgageFn(gameState, playerIdx);
      setBatchPreview({ count, amount: totalValue });
    } else {
      const { totalCost, count } = batchRedeemFn(gameState, playerIdx);
      setBatchPreview({ count, amount: totalCost });
    }
    setShowBatchConfirm(type);
  };

  // ========== 投降 ==========

  // ========== 付錢保釋 ==========

  const handlePayBail = () => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const player = gameState.players[playerIdx];
    if (!player?.isInDetention) return;
    if (player.money < BAIL_AMOUNT) return;
    const newState = payBailReleaseFn(gameState, playerIdx);
    advanceTurn(newState);
    audio.playSfx('buy');
    toast.success(`支付 ${BAIL_AMOUNT} 元保釋金，當即獲釋`);
  };

  const handleSurrender = () => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = surrenderFn(gameState, playerIdx);
    setGameState(newState);
    setShowSurrenderDialog(false);
    audio.playSfx('click');
  };

  // ========== 股東大會系統 ==========

  const handleShareholderMeeting = (symbol: StockSymbol, direction: 'up' | 'down') => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = callShareholderMeeting(gameState, playerIdx, symbol, direction);
    setGameState(newState);
    audio.playSfx('buy');
  };

  // ========== 地下市場系統 ==========

  const handleUndergroundMarketBuy = (cellId: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = undergroundMarketBuy(gameState, playerIdx, cellId);
    setGameState(newState);
    audio.playSfx('buy');
  };

  // 計算控股格子映射
  const getControllingCells = (): Record<number, { symbol: string; playerIndex: number }> => {
    if (!gameState?.stockStates) return {};
    const result: Record<number, { symbol: string; playerIndex: number }> = {};
    for (const [symbol, stockState] of Object.entries(gameState.stockStates)) {
      if (stockState.controllingPlayer === undefined || stockState.controllingPlayer === null) continue;
      const stockConfig = (STOCKS as Record<string, { linkedSetIds?: string[] }>)[symbol];
      if (!stockConfig?.linkedSetIds) continue;
      // 遍歷所有地產格，找到屬於這些 setId 的地產
      for (const cell of CELLS) {
        if (cell.type !== 'property') continue;
        if (cell.setId && stockConfig.linkedSetIds.includes(cell.setId)) {
          result[cell.id] = { symbol, playerIndex: stockState.controllingPlayer };
        }
      }
    }
    return result;
  };

  // ========== 道具系统 ==========

  const handleBuyItem = (itemType: ItemType) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const itemConfig = ITEMS[itemType];
    if (!itemConfig) return;
    if (gameState.players[playerIdx].money < itemConfig.price) return;
    if (gameState.players[playerIdx].items.length >= MAX_ITEMS) return;

    // 模拟本地购买（实际项目应走 API，此处调用游戏引擎）
    const newItems = [...gameState.players[playerIdx].items];
    const newItem = {
      type: itemType,
      id: Date.now() + Math.floor(Math.random() * 1000),
    };
    newItems.push(newItem);

    const newState: GameState = {
      ...gameState,
      players: gameState.players.map((p, i) =>
        i === playerIdx
          ? { ...p, money: p.money - itemConfig.price, items: newItems }
          : p,
      ),
      logs: [
        ...gameState.logs,
        {
          id: gameState.logs.length + 1,
          type: 'item' as const,
          text: `${gameState.players[playerIdx].name} 購買了 ${itemConfig.name}`,
        },
      ],
    };
    setGameState(newState);
    audio.playSfx('buy');
  };

  // ========== 貸款系統 ==========

  const handleTakeLoan = (amount: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = takeLoanEngine(gameState, playerIdx, amount);
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleRepayLoan = (amount: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = repayLoanEngine(gameState, playerIdx, amount);
    setGameState(newState);
    audio.playSfx('click');
  };

  // ========== 存款系統 ==========

  const handleDeposit = (amount: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = depositMoneyEngine(gameState, playerIdx, amount);
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleWithdraw = (amount: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = withdrawMoneyEngine(gameState, playerIdx, amount);
    setGameState(newState);
    audio.playSfx('click');
  };

  // ========== 股票期貨期權 ==========

  const handleBuyDerivative = (kind: 'futures' | 'call' | 'put', symbol: StockSymbol, quantity: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const newState = buyStockDerivative(gameState, playerIdx, kind, symbol, quantity);
    setGameState(newState);
    audio.playSfx('buy');
    const kindLabel = kind === 'futures' ? '期貨合約' : kind === 'call' ? '看漲期權' : '看跌期權';
    toast(`你買入了 ${STOCKS[symbol]?.name ?? symbol} 的${kindLabel}`);
  };

  const handleSettleDerivative = (contractId: number) => {
    if (!gameState) return;
    const newState = settleStockDerivative(gameState, contractId);
    setGameState(newState);
    audio.playSfx('click');
    toast('已結算持倉');
  };

  // ========== 債券系統 ==========

  const handleIssueBond = (amount: number, interestRate: number, turns: number) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const player = gameState.players[playerIdx];

    const newBond: Bond = {
      id: `bond_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      issuerId: playerIdx,
      holderId: null,
      amount,
      interestRate,
      turnsRemaining: turns,
      active: true,
      status: 'issued',
    };

    const newBonds: Bond[] = [...(gameState.bonds ?? []), newBond];

    const newState: GameState = {
      ...gameState,
      bonds: newBonds,
      players: gameState.players.map((p, i) =>
        i === playerIdx
          ? { ...p, money: p.money + amount, totalAssets: p.totalAssets + amount }
          : p,
      ),
      logs: [
        ...gameState.logs,
        {
          id: gameState.logs.length + 1,
          type: 'bond' as const,
          text: `${player.name} 發行了 ¥${amount.toLocaleString()} 債券（利率 ${Math.round(interestRate * 100)}%，${turns} 回合）`,
        },
      ],
    };
    setGameState(newState);
    audio.playSfx('buy');
  };

  const handleSubscribeBond = (bondId: string) => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const player = gameState.players[playerIdx];
    const bond = gameState.bonds?.find((b: Bond) => b.id === bondId);
    if (!bond || bond.holderId !== null || bond.issuerId === playerIdx) return;
    if (player.money < bond.amount) return;

    const newBonds: Bond[] = (gameState.bonds ?? []).map((b: Bond) =>
      b.id === bondId ? { ...b, holderId: playerIdx, status: 'subscribed' as const } : b,
    );

    const issuer = gameState.players[bond.issuerId];

    const newState: GameState = {
      ...gameState,
      bonds: newBonds,
      players: gameState.players.map((p, i) => {
        if (i === playerIdx) {
          return { ...p, money: p.money - bond.amount, totalAssets: p.totalAssets };
        }
        return p;
      }),
      logs: [
        ...gameState.logs,
        {
          id: gameState.logs.length + 1,
          type: 'bond' as const,
          text: `${player.name} 認購了 ${issuer?.name ?? '玩家'} 發行的 ¥${bond.amount.toLocaleString()} 債券`,
        },
      ],
    };
    setGameState(newState);
    audio.playSfx('click');
  };

  const handleUseItem = async (
    itemId: number,
    targetCellId?: number,
    remoteDiceValues?: [number, number],
  ): Promise<'target_needed' | 'dice_needed' | void> => {
    if (!gameState) return;
    const playerIdx = gameState.currentPlayerIndex;
    const player = gameState.players[playerIdx];
    const item = player.items.find((it) => it.id === itemId);
    if (!item) return;

    // 传送卡、量子传送门、偷地卡和炸彈需要选择目标
    if ((item.type === 'teleport' || item.type === 'quantum_portal' || item.type === 'steal_property' || item.type === 'bomb') && targetCellId === undefined) {
      setItemTargetMode(item.type);
      setPendingItemId(itemId);
      return 'target_needed';
    }

    // 遥控骰子在 ItemBar 组件内已经处理了弹窗选择
    // 这里 remoteDiceValues 会被传入

    // 直接可使用的道具：本地模拟效果
    const remainingItems = player.items.filter((it) => it.id !== itemId);
    let updatedPlayer = { ...player, items: remainingItems };
    let logText = '';

    switch (item.type) {
      case 'double_dice':
        updatedPlayer = { ...updatedPlayer, doubleDiceActive: true };
        logText = `${player.name} 使用了双倍骰`;
        break;
      case 'shield':
        updatedPlayer = { ...updatedPlayer, shieldCharges: 3 };
        logText = `${player.name} 使用了护盾（剩余3次）`;
        break;
      case 'free_pass':
        updatedPlayer = { ...updatedPlayer, freePassRemaining: 1 };
        logText = `${player.name} 使用了免费过路卡`;
        break;
      case 'remote_dice':
        if (remoteDiceValues) {
          updatedPlayer = {
            ...updatedPlayer,
            remoteDiceActive: true,
            remoteDiceValues,
          };
          logText = `${player.name} 使用了遥控骰子（${remoteDiceValues[0]}+${remoteDiceValues[1]}）`;
        }
        break;
      case 'teleport':
        if (targetCellId !== undefined) {
          updatedPlayer = { ...updatedPlayer, position: targetCellId };
          logText = `${player.name} 使用传送卡传送到 ${CELLS[targetCellId]?.name ?? '未知'}`;
          setItemTargetMode(null);
          setPendingItemId(null);
        }
        break;
      case 'steal_property':
        if (targetCellId !== undefined) {
          const prop = gameState.properties[targetCellId];
          const targetOwnerIdx = prop?.owner;
          if (targetOwnerIdx !== undefined && targetOwnerIdx !== playerIdx) {
            const newProperties = { ...gameState.properties };
            newProperties[targetCellId] = { ...prop, owner: playerIdx };
            const newState: GameState = {
              ...gameState,
              properties: newProperties,
              players: gameState.players.map((p, i) =>
                i === playerIdx ? updatedPlayer : p,
              ),
              logs: [
                ...gameState.logs,
                {
                  id: gameState.logs.length + 1,
                  type: 'item' as const,
                  text: `${player.name} 使用掠夺卡夺取了 ${CELLS[targetCellId]?.name}`,
                },
              ],
            };
            setGameState(newState);
            setItemTargetMode(null);
            setPendingItemId(null);
            audio.playSfx('click');
            return;
          }
        }
        break;
       case 'bomb':
         if (targetCellId !== undefined) {
           const prop = gameState.properties[targetCellId];
           if (prop && prop.owner !== undefined && prop.owner !== playerIdx && prop.buildings > 0) {
             const newProperties = { ...gameState.properties };
             const newBuildings = Math.max(0, prop.buildings - 1) as 0 | 1 | 2 | 3 | 4 | 5;
             newProperties[targetCellId] = { ...prop, buildings: newBuildings };
             const newState: GameState = {
               ...gameState,
               properties: newProperties,
               players: gameState.players.map((p, i) =>
                 i === playerIdx ? updatedPlayer : p,
               ),
               logs: [
                 ...gameState.logs,
                 {
                   id: gameState.logs.length + 1,
                   type: 'item' as const,
                   text: `${player.name} 使用炸彈摧毀了 ${CELLS[targetCellId]?.name} 的一棟建築`,
                 },
               ],
             };
             setGameState(newState);
             setItemTargetMode(null);
             setPendingItemId(null);
             audio.playSfx('click');
             return;
           }
         }
         break;
        case 'time_travel': {
          if (player.timeTravelUsed) {
            toast.error('本回合已使用過時間旅行');
            return;
          }
          const ok = await showConfirm('確認使用時間旅行？將回到上回合的位置與金錢，但地產變化會保留。');
          if (!ok) return;
          const newState = applyTimeTravelItem(gameState, playerIdx);
          if (newState) {
            setGameState(newState);
            audio.playSfx('click');
          } else {
            toast.error('暫無可用的時光快照');
          }
          return;
        }
        case 'time_pocket_watch': {
          const confirmReroll = await showConfirm('確認使用時光懷錶？將重擲本回合的骰子。');
          if (!confirmReroll) return;
          const newState = applyItemFn(gameState, playerIdx, itemId);
          setGameState(newState);
          audio.playSfx('click');
          return;
        }
        case 'electronic_contract': {
          updatedPlayer = { ...updatedPlayer, nextBuyDiscount: 0.3 };
          logText = `${player.name} 使用了電子契約，下次買地享 7 折`;
          break;
        }
        case 'energy_shield': {
          updatedPlayer = { ...updatedPlayer, shieldCharges: (updatedPlayer.shieldCharges ?? 0) + 1 };
          logText = `${player.name} 使用了能量護盾`;
          break;
        }
        case 'data_courier': {
          updatedPlayer = { ...updatedPlayer, money: updatedPlayer.money + 500 };
          logText = `${player.name} 使用了數據快遞，獲得 500 元`;
          break;
        }
        case 'fake_id': {
          updatedPlayer = { ...updatedPlayer, fakeIdActive: true };
          logText = `${player.name} 使用了偽身份證`;
          break;
        }
     }

    if (logText) {
      const newState: GameState = {
        ...gameState,
        players: gameState.players.map((p, i) =>
          i === playerIdx ? updatedPlayer : p,
        ),
        logs: [
          ...gameState.logs,
          {
            id: gameState.logs.length + 1,
            type: 'item' as const,
            text: logText,
          },
        ],
      };
      setGameState(newState);
      audio.playSfx('click');
    }
  };

  // ========== 迷你游戏 ==========

  const calcBlackjackTotal = (cards: number[]): number => {
    let total = 0;
    let aces = 0;
    for (const c of cards) {
      if (c === 1) {
        aces += 1;
        total += 11;
      } else if (c >= 10) {
        total += 10;
      } else {
        total += c;
      }
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const handleMiniGameAction = (action: string, data?: unknown) => {
    if (!gameState || !gameState.pendingMiniGame) return;
    const playerIdx = gameState.pendingMiniGame.playerIndex;

    let miniState = { ...gameState.pendingMiniGame };
    const logs = [...gameState.logs];
    let newPlayers = [...gameState.players];

    const addLog = (text: string, type: LogEntry['type'] = 'minigame' as const) => {
      logs.push({ id: logs.length + 1, type, text });
    };

    switch (action) {
      case 'start':
        miniState.spinning = true;
        break;

      case 'spin_slots': {
        // 生成结果（本地模拟）
        const r1 = Math.floor(Math.random() * 6);
        const r2 = Math.floor(Math.random() * 6);
        const r3 = Math.floor(Math.random() * 6);
        miniState.reels = [r1, r2, r3];
        miniState.spinning = false;
        miniState.finished = true;
        // 计算奖励
        if (r1 === r2 && r2 === r3) {
          miniState.reward = 3000;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
          miniState.reward = 500;
        } else {
          miniState.reward = 0;
        }
        addLog(
          `${gameState.players[playerIdx].name} 玩老虎机获得 ${miniState.reward > 0 ? `+¥${miniState.reward}` : '未中奖'}`,
        );
        if (miniState.reward > 0) {
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
          );
        }
        break;
      }

      case 'blackjack_hit': {
        const newCard = Math.floor(Math.random() * 13) + 1;
        const newPlayerCards = [...(miniState.playerCards ?? []), newCard];
        miniState.playerCards = newPlayerCards;
        // 计算是否爆牌
        const total = calcBlackjackTotal(newPlayerCards);
        if (total > 21) {
          miniState.finished = true;
          miniState.reward = 0;
          addLog(`${gameState.players[playerIdx].name} 21点爆牌，未获奖`);
        }
        break;
      }

      case 'blackjack_stand': {
        // 庄家补牌
        let dealerCards = [...(miniState.dealerCards ?? [])];
        let dealerTotal = calcBlackjackTotal(dealerCards);
        while (dealerTotal < 17) {
          dealerCards.push(Math.floor(Math.random() * 13) + 1);
          dealerTotal = calcBlackjackTotal(dealerCards);
        }
        miniState.dealerCards = dealerCards;
        miniState.finished = true;
        const playerTotal = calcBlackjackTotal(miniState.playerCards ?? []);
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          miniState.reward = 1000;
          addLog(`${gameState.players[playerIdx].name} 赢得21点，+¥1000`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + 1000 } : p,
          );
        } else if (playerTotal === dealerTotal) {
          miniState.reward = 0;
          addLog(`${gameState.players[playerIdx].name} 21点平局`);
        } else {
          miniState.reward = 0;
          addLog(`${gameState.players[playerIdx].name} 21点失败，无损失`);
        }
        break;
      }

      case 'guess_big':
      case 'guess_small': {
        const dice = Math.floor(Math.random() * 6) + 1;
        miniState.diceResult = dice;
        miniState.finished = true;
        const isBig = dice >= 4;
        const guessedBig = action === 'guess_big';
        if (isBig === guessedBig) {
          miniState.reward = 800;
          addLog(`${gameState.players[playerIdx].name} 猜大小猜对，+¥800`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + 800 } : p,
          );
        } else {
          miniState.reward = 0;
          addLog(`${gameState.players[playerIdx].name} 猜大小猜错了`);
        }
        break;
      }

      case 'guess_leopard': {
        const targetValue = (data as { value: number })?.value ?? 1;
        const dice = Math.floor(Math.random() * 6) + 1;
        miniState.diceResult = dice;
        miniState.finished = true;
        if (dice === targetValue) {
          miniState.reward = 2000;
          addLog(`${gameState.players[playerIdx].name} 豹子猜对！+¥2000`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + 2000 } : p,
          );
        } else {
          miniState.reward = 0;
          addLog(`${gameState.players[playerIdx].name} 豹子猜错了`);
        }
        break;
      }

      case 'memory_flip': {
        // 延迟初始化：第一次翻牌时生成卡片
        if (!miniState.memoryCards || miniState.memoryCards.length === 0) {
          const pairs: number[] = [];
          for (let i = 0; i < 6; i++) pairs.push(i, i);
          for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
          }
          miniState.memoryCards = pairs;
          miniState.memoryFlipped = [];
          miniState.memoryMatched = [];
          miniState.memoryTimeLeft = 30;
          miniState.memoryMoves = 0;
        }
        const cardIdx = (data as { index?: number })?.index ?? -1;
        if (!miniState.memoryFlipped) miniState.memoryFlipped = [];
        if (!miniState.memoryMatched) miniState.memoryMatched = [];
        if (miniState.memoryFlipped.length >= 2) break;
        if (miniState.memoryFlipped.includes(cardIdx)) break;
        if (miniState.memoryMatched.includes(cardIdx)) break;
        if (cardIdx < 0 || cardIdx >= 12) break;
        miniState.memoryFlipped.push(cardIdx);
        if (miniState.memoryMoves === undefined) miniState.memoryMoves = 0;
        miniState.memoryMoves += 0.5;
        break;
      }

      case 'memory_check_match': {
        if (!miniState.memoryFlipped || miniState.memoryFlipped.length !== 2) break;
        if (!miniState.memoryCards) break;
        const [a, b] = miniState.memoryFlipped;
        if (miniState.memoryCards[a] === miniState.memoryCards[b]) {
          if (!miniState.memoryMatched) miniState.memoryMatched = [];
          miniState.memoryMatched.push(a, b);
          // 全部匹配完成
          if (miniState.memoryMatched.length >= 12) {
            miniState.reward = 1000;
            miniState.finished = true;
            addLog(`${gameState.players[playerIdx].name} 記憶翻牌全對，+¥1000`);
            newPlayers = newPlayers.map((p, i) =>
              i === playerIdx ? { ...p, money: p.money + 1000 } : p,
            );
          }
        }
        miniState.memoryFlipped = [];
        break;
      }

      case 'memory_finish': {
        const matchedCount = miniState.memoryMatched
          ? Math.floor(miniState.memoryMatched.length / 2)
          : 0;
        if (matchedCount >= 6) {
          miniState.reward = 1000;
        } else if (matchedCount >= 4) {
          miniState.reward = 500;
        } else if (matchedCount >= 2) {
          miniState.reward = 200;
        } else {
          miniState.reward = 0;
        }
        miniState.finished = true;
        if (miniState.reward > 0) {
          addLog(`${gameState.players[playerIdx].name} 記憶翻牌獲得 +¥${miniState.reward}`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
          );
        } else {
          addLog(`${gameState.players[playerIdx].name} 記憶翻牌時間到，無獎勵`);
        }
        break;
      }

      case 'rhythm_start': {
        // 生成音符
        const notes: Array<{ id: number; time: number; lane: number; hit: boolean }> = [];
        for (let i = 0; i < 10; i++) {
          notes.push({
            id: i,
            time: 1000 + i * 800 + Math.floor(Math.random() * 300),
            lane: Math.floor(Math.random() * 3),
            hit: false,
          });
        }
        miniState.rhythmNotes = notes;
        miniState.rhythmHitCount = 0;
        miniState.rhythmTotalNotes = 10;
        miniState.rhythmScore = 0;
        miniState.rhythmPlaying = true;
        break;
      }

      case 'rhythm_hit': {
        if (miniState.rhythmHitCount === undefined) miniState.rhythmHitCount = 0;
        miniState.rhythmHitCount += 1;
        if (miniState.rhythmScore === undefined) miniState.rhythmScore = 0;
        miniState.rhythmScore += 100;
        break;
      }

      case 'rhythm_finish': {
        const hitCount = miniState.rhythmHitCount ?? 0;
        const totalNotes = miniState.rhythmTotalNotes ?? 10;
        const hitRate = totalNotes > 0 ? hitCount / totalNotes : 0;
        if (hitRate >= 0.9) {
          miniState.reward = 1500;
        } else if (hitRate >= 0.7) {
          miniState.reward = 800;
        } else if (hitRate >= 0.5) {
          miniState.reward = 300;
        } else {
          miniState.reward = 0;
        }
        miniState.rhythmPlaying = false;
        miniState.finished = true;
        if (miniState.reward > 0) {
          addLog(`${gameState.players[playerIdx].name} 節奏大師獲得 +¥${miniState.reward}`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
          );
        } else {
          addLog(`${gameState.players[playerIdx].name} 節奏大師節奏不準，無獎勵`);
        }
        break;
      }

      case 'shooting_shoot': {
        const targetId = (data as { targetId?: number })?.targetId;
        if (miniState.shootingBullets === undefined) miniState.shootingBullets = 3;
        if (miniState.shootingBullets <= 0) break;
        miniState.shootingBullets -= 1;
        if (targetId !== undefined && miniState.shootingTargets) {
          const target = miniState.shootingTargets.find((t) => t.id === targetId);
          if (target && !target.hit) {
            target.hit = true;
            if (miniState.shootingScore === undefined) miniState.shootingScore = 0;
            miniState.shootingScore += 1;
          }
        }
        // 子弹用完自动结算
        if (miniState.shootingBullets <= 0) {
          const hitCount = miniState.shootingTargets
            ? miniState.shootingTargets.filter((t) => t.hit).length
            : 0;
          if (hitCount >= 3) {
            miniState.reward = 1200;
          } else if (hitCount >= 2) {
            miniState.reward = 600;
          } else if (hitCount >= 1) {
            miniState.reward = 200;
          } else {
            miniState.reward = 0;
          }
          miniState.finished = true;
          if (miniState.reward > 0) {
            addLog(`${gameState.players[playerIdx].name} 射擊挑戰獲得 +¥${miniState.reward}`);
            newPlayers = newPlayers.map((p, i) =>
              i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
            );
          } else {
            addLog(`${gameState.players[playerIdx].name} 射擊挑戰全部射偏，無獎勵`);
          }
        }
        break;
      }

      case 'shooting_finish': {
        const hitCount = miniState.shootingTargets
          ? miniState.shootingTargets.filter((t) => t.hit).length
          : 0;
        if (hitCount >= 3) {
          miniState.reward = 1200;
        } else if (hitCount >= 2) {
          miniState.reward = 600;
        } else if (hitCount >= 1) {
          miniState.reward = 200;
        } else {
          miniState.reward = 0;
        }
        miniState.finished = true;
        if (miniState.reward > 0) {
          addLog(`${gameState.players[playerIdx].name} 射擊挑戰獲得 +¥${miniState.reward}`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
          );
        } else {
          addLog(`${gameState.players[playerIdx].name} 射擊挑戰全部射偏，無獎勵`);
        }
        break;
      }

      case 'miner_start': {
        miniState.minerScore = 0;
        miniState.minerCombo = 0;
        miniState.minerTimeLeft = 15;
        miniState.minerPlaying = true;
        break;
      }

      case 'miner_hit': {
        const points = (data as { points?: number })?.points ?? 1;
        if (miniState.minerScore === undefined) miniState.minerScore = 0;
        if (miniState.minerCombo === undefined) miniState.minerCombo = 0;
        miniState.minerScore += points;
        miniState.minerCombo += 1;
        break;
      }

      case 'miner_tick': {
        const timeLeft = (data as { timeLeft?: number })?.timeLeft ?? 0;
        miniState.minerTimeLeft = timeLeft;
        break;
      }

      case 'miner_finish': {
        const score = Math.floor(miniState.minerScore ?? 0);
        miniState.minerPlaying = false;
        miniState.reward = score * 50;
        miniState.finished = true;
        if (miniState.reward > 0) {
          addLog(`${gameState.players[playerIdx].name} 數據挖掘獲得 ${score} 點，+¥${miniState.reward}`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
          );
        } else {
          addLog(`${gameState.players[playerIdx].name} 數據挖掘顆粒無收`);
        }
        break;
      }

      case 'firewall_start': {
        miniState.firewallRound = 1;
        miniState.firewallLives = 3;
        miniState.firewallShowing = true;
        miniState.firewallSequence = [];
        miniState.firewallPlayerInput = [];
        const seq: number[] = [];
        for (let i = 0; i < 4; i++) seq.push(Math.floor(Math.random() * 6));
        miniState.firewallSequence = seq;
        break;
      }

      case 'firewall_show': {
        miniState.firewallShowing = true;
        break;
      }

      case 'firewall_input': {
        const index = (data as { index?: number })?.index ?? 0;
        if (!miniState.firewallPlayerInput) miniState.firewallPlayerInput = [];
        miniState.firewallPlayerInput.push(index);
        miniState.firewallShowing = false;
        const seq = miniState.firewallSequence ?? [];
        const input = miniState.firewallPlayerInput;
        const lastCorrect = input.every((v: number, idx: number) => v === seq[idx]);
        if (!lastCorrect) {
          if (miniState.firewallLives !== undefined) miniState.firewallLives -= 1;
          miniState.firewallPlayerInput = [];
          if ((miniState.firewallLives ?? 0) <= 0) {
            const passedRounds = (miniState.firewallRound ?? 1) - 1;
            let reward = 0;
            if (passedRounds >= 1) reward += 100;
            if (passedRounds >= 2) reward += 200;
            miniState.reward = reward;
            miniState.finished = true;
            if (reward > 0) {
              addLog(`${gameState.players[playerIdx].name} 防火牆突破失敗，獲得 +¥${reward}`);
              newPlayers = newPlayers.map((p, i) =>
                i === playerIdx ? { ...p, money: p.money + reward } : p,
              );
            } else {
              addLog(`${gameState.players[playerIdx].name} 防火牆突破失敗，無獎勵`);
            }
          }
        } else if (input.length === seq.length) {
          // round complete
        }
        break;
      }

      case 'firewall_next': {
        const nextRound = (miniState.firewallRound ?? 1) + 1;
        if (nextRound > 3) {
          miniState.reward = 1400;
          miniState.finished = true;
          addLog(`${gameState.players[playerIdx].name} 防火牆全數破解，+¥1400`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + 1400 } : p,
          );
        } else {
          miniState.firewallRound = nextRound;
          miniState.firewallPlayerInput = [];
          miniState.firewallShowing = true;
          const lengths = [4, 6, 8];
          const len = lengths[nextRound - 1] ?? 8;
          const seq: number[] = [];
          for (let i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 6));
          miniState.firewallSequence = seq;
        }
        break;
      }

      case 'firewall_finish': {
        const success = (data as { success?: boolean })?.success;
        if (!success) {
          const passedRounds = (miniState.firewallRound ?? 1) - 1;
          let reward = 0;
          if (passedRounds >= 1) reward += 100;
          if (passedRounds >= 2) reward += 200;
          miniState.reward = reward;
          miniState.finished = true;
          if (reward > 0) {
            addLog(`${gameState.players[playerIdx].name} 防火牆突破失敗，獲得 +¥${reward}`);
            newPlayers = newPlayers.map((p, i) =>
              i === playerIdx ? { ...p, money: p.money + reward } : p,
            );
          } else {
            addLog(`${gameState.players[playerIdx].name} 防火牆突破失敗，無獎勵`);
          }
        }
        break;
      }

      case 'racer_start': {
        miniState.racerLane = 1;
        miniState.racerTimeLeft = 30;
        miniState.racerPlaying = true;
        miniState.racerObstacles = [];
        miniState.racerSpeed = 1.5;
        break;
      }

      case 'racer_move': {
        const lane = (data as { lane?: number })?.lane ?? 1;
        miniState.racerLane = lane;
        break;
      }

      case 'racer_tick': {
        const timeLeft = (data as { timeLeft?: number })?.timeLeft ?? 0;
        const obstacles = (data as { obstacles?: Array<{ id: number; lane: number; y: number }> })?.obstacles ?? [];
        const speed = (data as { speed?: number })?.speed ?? 1.5;
        miniState.racerTimeLeft = timeLeft;
        miniState.racerObstacles = obstacles;
        miniState.racerSpeed = speed;
        break;
      }

      case 'racer_crash': {
        const elapsed = 30 - (miniState.racerTimeLeft ?? 30);
        const intervals = Math.floor(elapsed / 5);
        miniState.reward = Math.max(0, intervals * 50);
        miniState.racerPlaying = false;
        miniState.finished = true;
        if (miniState.reward > 0) {
          addLog(`${gameState.players[playerIdx].name} 賽博賽車撞車，獲得 +¥${miniState.reward}`);
          newPlayers = newPlayers.map((p, i) =>
            i === playerIdx ? { ...p, money: p.money + miniState.reward } : p,
          );
        } else {
          addLog(`${gameState.players[playerIdx].name} 賽博賽車開場即撞，無獎勵`);
        }
        break;
      }

      case 'racer_finish': {
        miniState.reward = 600;
        miniState.racerPlaying = false;
        miniState.finished = true;
        addLog(`${gameState.players[playerIdx].name} 賽博賽車完賽，+¥600`);
        newPlayers = newPlayers.map((p, i) =>
          i === playerIdx ? { ...p, money: p.money + 600 } : p,
        );
        break;
      }

      case 'auction_start': {
        const templates = [
          { name: '現金包裹', icon: 'coins', minBid: 300, valueRange: [500, 1500] },
          { name: '神祕寶箱', icon: 'mystery', minBid: 500, valueRange: [200, 2000] },
          { name: '數據核心', icon: 'item', minBid: 800, valueRange: [1000, 2500] },
          { name: '霓虹晶片', icon: 'item', minBid: 600, valueRange: [800, 1800] },
          { name: '能源電池', icon: 'mystery', minBid: 400, valueRange: [300, 1200] },
        ];
        const shuffled = [...templates].sort(() => Math.random() - 0.5).slice(0, 3);
        miniState.auctionItems = shuffled.map((t, i) => {
          const value = t.valueRange[0] + Math.floor(Math.random() * (t.valueRange[1] - t.valueRange[0]));
          return { id: i, name: t.name, minBid: t.minBid, value, icon: t.icon as 'coins' | 'item' | 'mystery' };
        });
        miniState.auctionCurrentItem = 0;
        miniState.auctionAiThinking = true;
        miniState.auctionPlayerPassed = false;
        const firstItem = miniState.auctionItems[0];
        if (firstItem) {
          miniState.auctionAiBid = firstItem.minBid + Math.floor(Math.random() * 200);
        }
        miniState.auctionAiThinking = false;
        miniState.reward = 0;
        break;
      }

      case 'auction_bid': {
        const items = miniState.auctionItems ?? [];
        const idx = miniState.auctionCurrentItem ?? 0;
        const current = items[idx];
        if (!current) break;
        const playerBid = (miniState.auctionAiBid ?? current.minBid) + Math.max(100, Math.floor((miniState.auctionAiBid ?? current.minBid) * 0.15 / 100) * 100);
        const aiValue = current.value;
        const aiMaxBid = Math.floor(aiValue * (0.7 + Math.random() * 0.4));
        if (playerBid >= aiMaxBid) {
          // AI passes, player wins
          current.won = true;
          current.bidAmount = playerBid;
          miniState.auctionPlayerPassed = false;
          miniState.auctionAiThinking = true;
          const totalValue = items.filter((it) => it.won).reduce((s, it) => s + (it.value ?? 0), 0);
          const totalBid = items.filter((it) => it.won).reduce((s, it) => s + (it.bidAmount ?? 0), 0);
          miniState.reward = Math.max(-2000, totalValue - totalBid);
          if (idx >= items.length - 1) {
            miniState.auctionCurrentItem = items.length;
            miniState.finished = true;
            const net = Math.max(-2000, totalValue - totalBid);
            if (net >= 0) {
              addLog(`${gameState.players[playerIdx].name} 拍賣大師淨賺 +¥${net}`);
              newPlayers = newPlayers.map((p, i) =>
                i === playerIdx ? { ...p, money: p.money + net } : p,
              );
            } else {
              addLog(`${gameState.players[playerIdx].name} 拍賣大師虧損 ¥${Math.abs(net)}`);
              newPlayers = newPlayers.map((p, i) =>
                i === playerIdx ? { ...p, money: Math.max(0, p.money + net) } : p,
              );
            }
          } else {
            // move to next item after delay (handled by component)
          }
        } else {
          // AI raises
          const aiRaise = playerBid + Math.max(100, Math.floor(Math.random() * 200));
          miniState.auctionAiBid = Math.min(aiRaise, aiMaxBid);
          miniState.auctionAiThinking = false;
        }
        break;
      }

      case 'auction_pass': {
        const items = miniState.auctionItems ?? [];
        const idx = miniState.auctionCurrentItem ?? 0;
        const current = items[idx];
        if (!current) break;
        current.won = false;
        current.bidAmount = miniState.auctionAiBid ?? current.minBid;
        miniState.auctionPlayerPassed = true;
        break;
      }

      case 'auction_next': {
        const items = miniState.auctionItems ?? [];
        const nextIdx = (miniState.auctionCurrentItem ?? 0) + 1;
        if (nextIdx >= items.length) {
          const totalValue = items.filter((it) => it.won).reduce((s, it) => s + (it.value ?? 0), 0);
          const totalBid = items.filter((it) => it.won).reduce((s, it) => s + (it.bidAmount ?? 0), 0);
          const net = Math.max(-2000, totalValue - totalBid);
          miniState.reward = net;
          miniState.finished = true;
          if (net >= 0) {
            addLog(`${gameState.players[playerIdx].name} 拍賣大師淨賺 +¥${net}`);
            newPlayers = newPlayers.map((p, i) =>
              i === playerIdx ? { ...p, money: p.money + net } : p,
            );
          } else {
            addLog(`${gameState.players[playerIdx].name} 拍賣大師虧損 ¥${Math.abs(net)}`);
            newPlayers = newPlayers.map((p, i) =>
              i === playerIdx ? { ...p, money: Math.max(0, p.money + net) } : p,
            );
          }
        } else {
          miniState.auctionCurrentItem = nextIdx;
          miniState.auctionPlayerPassed = false;
          miniState.auctionAiThinking = true;
          const nextItem = items[nextIdx];
          if (nextItem) {
            miniState.auctionAiBid = nextItem.minBid + Math.floor(Math.random() * 200);
          }
          miniState.auctionAiThinking = false;
        }
        break;
      }

      default:
        break;
    }

    const newState: GameState = {
      ...gameState,
      pendingMiniGame: miniState.finished ? null : miniState,
      players: newPlayers,
      logs,
    };
    setGameState(newState);
    if (miniState.finished && miniState.reward > 0) {
      audio.playSfx('release');
    }
  };

  // ========== 全局事件监听 ==========

  useEffect(() => {
    if (!gameState || !gameStarted) return;
    const currentEvent = gameState.currentGlobalEvent;
    const prevEvent = prevGlobalEventRef.current;

    if (currentEvent && prevEvent !== currentEvent) {
      setShowGlobalEvent(true);
    }
    prevGlobalEventRef.current = currentEvent;
  }, [gameState?.currentGlobalEvent, gameStarted, gameState]);

  // ========== 災難事件監聽 ==========

  useEffect(() => {
    if (!gameState || !gameStarted) return;
    const currentDisaster = gameState.disaster;
    const prevType = prevDisasterTypeRef.current;
    const currentType = currentDisaster?.type ?? null;

    // 災難從無到有 或 類型變化時彈出
    if (currentDisaster?.active && currentType && prevType !== currentType) {
      setShowDisasterModal(true);
    }
    prevDisasterTypeRef.current = currentType;
  }, [gameState?.disaster?.type, gameState?.disaster?.active, gameStarted, gameState]);

  // AI 拍卖决策（多人）
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'auction') return;
    if (!gameState.auction?.active) return;
    if (!isAIGame) return;

    const auction = gameState.auction;
    const activeBidder = auction.activeBidders[auction.activeBidderIndex];
    if (activeBidder === undefined) return;
    // 只有当行动方是 AI 时才自动处理
    if (!gameState.players[activeBidder]?.isAI) return;

    const delay = 800 + Math.random() * 600;
    auctionTimerRef.current = setTimeout(() => {
      const decision = aiAuctionDecision(gameState);
      if (decision.action === 'bid' && decision.bidAmount !== undefined) {
        const newState = placeBid(gameState, activeBidder, decision.bidAmount);
        setGameState(newState);
      } else {
        const newState = passAuction(gameState, activeBidder);
        setGameState(newState);
      }
    }, delay);

    return () => {
      if (auctionTimerRef.current) clearTimeout(auctionTimerRef.current);
    };
  }, [gameState?.auction?.currentBid, gameState?.auction?.activeBidderIndex, gameState?.phase, gameStarted, gameState, isAIGame]);

  // NPC 交互弹窗：检测到 pendingNpcInteraction 时打开
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.pendingNpcInteraction && !showNpcModal) {
      const npcPlayerIdx = gameState.pendingNpcInteraction.playerIndex;
      // 只有当前玩家是人类时才弹窗（AI 会在 AI 回合中自动处理）
      if (!gameState.players[npcPlayerIdx]?.isAI) {
        setShowNpcModal(true);
      }
    }
    if (!gameState.pendingNpcInteraction && showNpcModal) {
      setShowNpcModal(false);
    }
  }, [gameState?.pendingNpcInteraction, gameStarted, gameState, showNpcModal]);

  // 暗拍 AI 自动出价（本地模式）
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'auction') return;
    if (!gameState.auction?.active) return;
    if (!gameState.auction?.isBlind) return;
    if (gameState.auction.revealed) return;
    if (!isAIGame) return;

    const auction = gameState.auction;
    // 检查是否有 AI 玩家还未出价
    const aiBidders = auction.activeBidders.filter(
      (idx: number) => gameState.players[idx]?.isAI,
    );
    const needsBid = aiBidders.some(
      (idx: number) => !auction.blindBids || auction.blindBids[idx] === null || auction.blindBids[idx] === undefined,
    );
    if (!needsBid) return;

    const delay = 800 + Math.random() * 600;
    auctionTimerRef.current = setTimeout(() => {
      let newState = gameState;
      for (const bidderIdx of aiBidders) {
        if (!newState.auction?.blindBids || newState.auction.blindBids[bidderIdx] !== null && newState.auction.blindBids[bidderIdx] !== undefined) continue;
        if (!newState.auction?.active) break;
        const bidAmount = aiBlindBid(newState, bidderIdx);
        if (bidAmount > 0) {
          newState = submitBlindBid(newState, bidderIdx, bidAmount);
        }
      }
      setGameState(newState);
    }, delay);

    return () => {
      if (auctionTimerRef.current) clearTimeout(auctionTimerRef.current);
    };
  }, [gameState?.auction?.blindBids, gameState?.auction?.active, gameState?.phase, gameStarted, gameState, isAIGame]);

  // 暗拍：所有玩家出价后自动揭晓
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'auction') return;
    if (!gameState.auction?.active) return;
    if (!gameState.auction?.isBlind) return;
    if (gameState.auction.revealed) return;

    const auction = gameState.auction;
    if (!auction.blindBids) return;

    const allSubmitted = auction.activeBidders.every(
      (idx: number) => auction.blindBids?.[idx] !== null && auction.blindBids?.[idx] !== undefined,
    );

    if (allSubmitted) {
      const delay = 1200;
      const timer = setTimeout(() => {
        const newState = revealBlindBids(gameState);
        setGameState(newState);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState?.auction?.blindBids, gameState?.auction?.active, gameState?.auction?.revealed, gameState?.phase, gameStarted, gameState]);

  // AI 回合自动执行
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'rolling') return;
    if (!isCurrentAI(gameState)) return;
    if (isRolling) return;
    if (showBuyModal || showFateModal || showChanceModal) return;
    if (isAnimatingRef.current) return;
    if (gameState.winner !== null) return;
    // 如果有待处理的 NPC 交互，先不掷骰（由专门的 effect 处理）
    if (gameState.pendingNpcInteraction) return;

    const delay = 800 + Math.random() * 400;
    aiTimerRef.current = setTimeout(() => {
      // AI 自動使用職業技能（擲骰前）
      const stateWithSkill = tryAIUseProfessionSkill(gameState);
      if (stateWithSkill !== gameState) {
        setGameState(stateWithSkill);
        // 如果使用技能後 phase 不再是 rolling（例如量子跳躍觸發了買地/命運），跳過擲骰
        if (stateWithSkill.phase !== 'rolling') return;
      }
      handleRollDice();
    }, delay);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [gameState, gameStarted, isRolling, showBuyModal, showFateModal, showChanceModal, isCurrentAI, handleRollDice]);

  // AI 自动处理 NPC 交互
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (!gameState.pendingNpcInteraction) return;
    if (!isAIGame) return;

    const npcPlayerIdx = gameState.pendingNpcInteraction.playerIndex;
    if (!gameState.players[npcPlayerIdx]?.isAI) return;

    const delay = 800 + Math.random() * 600;
    const timer = setTimeout(() => {
      const npcType = gameState.pendingNpcInteraction?.npcType;
      let accept = false;
      if (npcType === 'wanderer') {
        accept = Math.random() < 0.5;
      } else if (npcType === 'hacker') {
        accept = gameState.players[npcPlayerIdx].money > 2000;
      }
      const newState = resolveNpcInteraction(gameState, npcPlayerIdx, accept);
      setGameState(newState);
    }, delay);

    return () => clearTimeout(timer);
  }, [gameState?.pendingNpcInteraction, gameStarted, gameState, isAIGame]);

  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'buying') return;
    if (!isCurrentAI(gameState)) return;

    const delay = 800 + Math.random() * 400;
    buyTimerRef.current = setTimeout(() => {
      const willBuy = applyAIDecision(gameState);
      const newState = applyBuyDecision(gameState, willBuy);
      setGameState(newState);
      setShowBuyModal(false);
    }, delay);

    return () => {
      if (buyTimerRef.current) clearTimeout(buyTimerRef.current);
    };
  }, [gameState, gameStarted, isCurrentAI]);

  // AI 自动响应交易请求（多人）
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (!isAIGame) return;
    if (!gameState.pendingTrade) return;

    const trade = gameState.pendingTrade;
    // 只有当接收方是 AI 时才自动处理
    const receiver = gameState.players[trade.toPlayer];
    if (!receiver?.isAI) return;

    const delay = 1000 + Math.random() * 800;
    tradeTimerRef.current = setTimeout(() => {
      const shouldAccept = aiShouldAcceptTrade(gameState, trade);
      const newState = shouldAccept
        ? acceptTrade(gameState)
        : rejectTrade(gameState);
      setGameState(newState);
    }, delay);

    return () => {
      if (tradeTimerRef.current) clearTimeout(tradeTimerRef.current);
    };
  }, [gameState?.pendingTrade?.id, gameState, gameStarted, isAIGame]);

  // 监听 pendingTrade，弹出响应弹窗（人类接收方）
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (!gameState.pendingTrade) return;

    const trade = gameState.pendingTrade;
    const receiver = gameState.players[trade.toPlayer];

    // 人类接收方才弹响应弹窗
    if (!receiver || receiver.isAI) return;

    if (!showTradeModal) {
      setTradeModalMode('respond');
      setTradeTargetIndex(trade.fromPlayer);
      setShowTradeModal(true);
    }
  }, [gameState?.pendingTrade?.id, gameState, gameStarted, isAIGame, showTradeModal]);

  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'fate') return;
    if (!gameState.pendingFateCard) return;

    setShowFateModal(true);
    fateTimerRef.current = setTimeout(() => {
      const newState = applyFateCard(gameState);
      setGameState(newState);
      setShowFateModal(false);
    }, 2000);

    return () => {
      if (fateTimerRef.current) clearTimeout(fateTimerRef.current);
    };
  }, [gameState?.phase, gameState?.pendingFateCard?.id, gameStarted, gameState]);

  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'chance') return;
    if (!gameState.pendingChanceCard) return;

    setShowChanceModal(true);
    const chanceTimerRef = setTimeout(() => {
      const newState = applyChanceCard(gameState);
      setGameState(newState);
      setShowChanceModal(false);
    }, 2000);

    return () => {
      clearTimeout(chanceTimerRef);
    };
  }, [gameState?.phase, gameState?.pendingChanceCard?.id, gameStarted, gameState]);

  useEffect(() => {
    if (gameState?.phase === 'ended') {
      setShowEndModal(true);
      setShowStatsPanel(true);
      // 胜利音效
      if (gameState.winner !== null) {
        audio.playSfx('victory');
        audio.speak('恭喜獲勝！');
      }
      // 劇情模式：勝利時寫入關卡進度
      if (isStoryMode && storyLevelId !== null && gameState.winner !== null) {
        window.dispatchEvent(new CustomEvent('story:complete-level', {
          detail: { levelId: storyLevelId },
        }));
      }
      // 游戏结束清除自动存档
      deleteSlot(0);
    }
  }, [gameState?.phase, gameState?.winner, audio, deleteSlot, isStoryMode, storyLevelId]);

  // 自动存档：每回合结束（phase 回到 rolling 且玩家切换时）存到 slot 0
  const prevPlayerIndexRef = useRef<number>(-1);
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (gameState.phase !== 'rolling') return;
    if (gameState.winner !== null) return;

    const currentIdx = gameState.currentPlayerIndex;
    if (prevPlayerIndexRef.current !== -1 && prevPlayerIndexRef.current !== currentIdx) {
      const turnCount = gameState.totalTurns;
      if (turnCount !== autoSaveTriggeredRef.current) {
        autoSaveTriggeredRef.current = turnCount;
        saveGame(0, gameState, { isAutoSave: true });
      }
    }
    prevPlayerIndexRef.current = currentIdx;
  }, [gameState?.currentPlayerIndex, gameState?.phase, gameStarted, gameState, saveGame]);

  // ========== 撤銷操作倒計時 ==========
  useEffect(() => {
    if (!gameState || !gameState.lastAction) {
      setUndoCountdown(0);
      return;
    }
    const updateCountdown = () => {
      const elapsed = Date.now() - gameState.lastAction!.timestamp;
      const remaining = Math.max(0, 5000 - elapsed);
      setUndoCountdown(remaining);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 100);
    return () => clearInterval(timer);
  }, [gameState?.lastAction?.timestamp, gameState?.lastAction?.type, gameState?.lastAction?.cellId]);

  // ========== 音效：监听日志变化播放对应音效 ==========

  useEffect(() => {
    if (!gameState || !gameStarted) {
      prevLogLengthRef.current = gameState?.logs.length ?? 0;
      return;
    }
    const logs = gameState.logs;
    const prevLen = prevLogLengthRef.current;
    if (logs.length <= prevLen) {
      prevLogLengthRef.current = logs.length;
      return;
    }
    const newLogs = logs.slice(prevLen);
    prevLogLengthRef.current = logs.length;

    for (const log of newLogs) {
      const txt = log.text;
      const ltype = log.type as string;
      if (ltype === 'fate') {
        audio.playFateCard();
      } else if (ltype === 'chance') {
        audio.playChanceCard();
      } else if (ltype === 'trade') {
        if (txt.includes('完成')) {
          audio.playTrade();
        }
      } else if (ltype === 'auction') {
        audio.playAuction();
      } else if (ltype === 'global_event') {
        audio.playGlobalEvent();
      } else {
        // player1 / player2 / system / stock
        if (txt.includes('掷出')) {
          audio.playDiceRoll();
          // 擷取點數：格式如「擲出 3+4 = 7 點」
          const diceMatch = txt.match(/(\d+)\s*點/);
          if (diceMatch) {
            audio.speak(`擲骰！${diceMatch[1]} 點`);
          }
        } else if (txt.includes('购得') || txt.includes('購得')) {
          audio.playBuy();
          // 購買成功，{propertyName}
          const buyMatch = txt.match(/(購得|购得)[\s]*[「"']?([^「"'，,。\n]+)[」"']?/);
          if (buyMatch && buyMatch[2]) {
            audio.speak(`購買成功，${buyMatch[2]}`);
          }
        } else if (txt.includes('支付过路费') || txt.includes('支付過路費')) {
          audio.playToll();
          const tollMatch = txt.match(/(\d+)\s*元/);
          if (tollMatch) {
            audio.speak(`支付過路費 ${tollMatch[1]} 元`);
          }
        } else if (txt.includes('进入') && txt.includes('禁闭区') ||
                   txt.includes('進入') && txt.includes('禁閉區')) {
          audio.playDetention();
          audio.speak('闖入禁閉區！');
        } else if (txt.includes('出狱') || txt.includes('释放') ||
                   txt.includes('出獄') || txt.includes('釋放')) {
          audio.playRelease();
        } else if (txt.includes('建造') || txt.includes('升级') ||
                   txt.includes('升級')) {
          audio.playBuild();
        } else if (txt.includes('抵押') || txt.includes('赎回') ||
                   txt.includes('贖回')) {
          audio.playMortgage();
        } else if (ltype === 'system' && (txt.includes('破产') || txt.includes('破產'))) {
          audio.playBankruptcy();
          audio.speak('破產了...');
        }
      }
    }
  }, [gameState?.logs.length, gameStarted, gameState, audio]);

  // ========== 成就检查 ==========

  const toastQueueRef = useRef<AchievementId[]>([]);

  useEffect(() => {
    if (!gameState || !gameStarted) return;
    const logLen = gameState.logs.length;
    if (logLen === lastCheckedStateRef.current) return;
    lastCheckedStateRef.current = logLen;

    const allNew: AchievementId[] = [];
    for (let i = 0; i < gameState.players.length; i += 1) {
      const newOnes = checkAchievements(gameState, i);
      allNew.push(...newOnes);
    }

    if (allNew.length > 0) {
      const newlyUnlocked = unlockMany(allNew);
      if (newlyUnlocked.length > 0) {
        toastQueueRef.current = [...toastQueueRef.current, ...newlyUnlocked];
        if (!toastAchievement) {
          const next = toastQueueRef.current.shift();
          if (next) {
            setToastAchievement(next);
            audio.playAchievement();
          }
        }
      }
    }
  }, [gameState?.logs.length, gameStarted, gameState, unlockMany, toastAchievement]);

  const handleToastClose = useCallback(() => {
    const next = toastQueueRef.current.shift();
    if (next) {
      setToastAchievement(next);
      audio.playAchievement();
    } else {
      setToastAchievement(null);
    }
  }, [audio]);

  useEffect(() => {
    if (!gameState || !gameStarted) {
      setShowBuyModal(false);
      return;
    }
    if (gameState.phase === 'buying' && !isCurrentAI(gameState)) {
      setShowBuyModal((prev) => prev || true);
    } else {
      setShowBuyModal(false);
    }
  }, [gameState?.phase, gameStarted, gameState, isCurrentAI]);

  // 發送彈幕（本地模式下僅本地顯示，聯機模式走 API）
  const handleSendDanmaku = useCallback((content: string): void => {
    danmakuIdRef.current += 1;
    const newMsg: DanmakuMsg = {
      id: `dm_${danmakuIdRef.current}`,
      sender: 'me',
      content,
    };
    setDanmakuMessages((prev: DanmakuMsg[]) => [...prev, newMsg]);
  }, []);

  // 跟隨玩家視角
  const handleFollowPlayer = useCallback((playerIndex: number | null): void => {
    if (playerIndex === null) {
      setFollowView('free');
    } else {
      setFollowView(playerIndex);
    }
  }, []);

  const handleStart = () => {
    setProfessionSelectIndex(0);
    setPendingProfession(undefined);
    setShowProfessionSelect(true);
    try {
      audio.init();
      audio.startBGM();
      audio.playSfx('click');
    } catch {
      // 音频初始化失败不影响游戏流程
    }
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-neon-cyan pulse-glow text-xl font-cyber">加载中...</div>
      </div>
    );
  }

  const currentPlayer: PlayerState = gameState.players[gameState.currentPlayerIndex];
  const currentCell = CELLS[currentPlayer.position];
  const buyPrice = getCellPrice(currentPlayer.position, gameState.mode);
  const canAffordBuy = currentPlayer.money >= buyPrice;
  const winner = gameState.winner !== null ? gameState.players[gameState.winner] : null;
  const isMyTurn = !isCurrentAI(gameState); // 热座模式：只有 AI 回合才不可操作

  const missions = gameState.missions ?? [];
  const hasCompletedMission = missions.some((m) => m.completed && !m.claimed);

  // 拍卖相关
  const auction = gameState.auction ?? null;
  const auctionCell = auction ? CELLS[auction.cellId] : null;
  const auctionCellPrice = auction ? getCellPrice(auction.cellId, gameState.mode) : 0;
  const auctionActiveBidder = auction
    ? auction.activeBidders[auction.activeBidderIndex]
    : 0;
  const auctionActivePlayer = auction && auctionActiveBidder !== undefined
    ? gameState.players[auctionActiveBidder]
    : null;

  // 热座模式：当前操作玩家 = 当前出价者（人类出价时才显示可操作）
  const auctionViewerIndex = auctionActiveBidder ?? 0;
  const auctionViewerMoney = gameState.players[auctionViewerIndex]?.money ?? 0;
  const isAuctionAITurn = isAIGame && auctionActivePlayer?.isAI;
  const isInDetention = currentPlayer.isInDetention;
  const rollButtonText = isInDetention
     ? `監禁搖骰（${currentPlayer.name}）`
     : isRolling
       ? '骰子轉動中...'
       : `擲骰子（${currentPlayer.name}）`;

  const canRoll =
    gameStarted &&
    gameState.phase === 'rolling' &&
    !isRolling &&
    isMyTurn &&
    gameState.winner === null;

  // ===== 次級系統分組抽屜內容（收納原本散落在操作列上的眾多次級按鈕）=====
  const systemMenuSections: SystemMenuSection[] = [
    {
      key: 'finance',
      label: '金融財務',
      items: [
        { key: 'stock', label: '股票', icon: BarChart3, color: 'var(--green)', onClick: () => setShowStockPanel(true) },
        { key: 'loan', label: '貸款', icon: HandCoins, color: 'var(--yellow)', onClick: () => setShowLoanModal(true) },
        { key: 'bank', label: '存款', icon: Landmark, color: 'var(--green)', onClick: () => setShowBankModal(true) },
        { key: 'bond', label: '債券', icon: Receipt, color: 'hsl(45, 100%, 60%)', onClick: () => setShowBondModal(true) },
        ...(gameState.resourceMode
          ? [{ key: 'resource', label: '資源兌換', icon: BarChart3, color: 'var(--green)', onClick: () => setShowResourceExchange(true) }]
          : []),
        { key: 'blackmarket', label: '黑市', icon: Store, color: 'var(--red)', onClick: () => setShowUndergroundMarket(true) },
      ],
    },
    {
      key: 'growth',
      label: '成長任務',
      items: [
        {
          key: 'skill',
          label: '技能樹',
          icon: SlidersHorizontal,
          color: 'var(--cyan)',
          onClick: () => setShowSkillTreeModal(true),
          badge: (currentPlayer.skillPoints ?? 0) > 0 ? currentPlayer.skillPoints : undefined,
        },
        {
          key: 'mission',
          label: '任務',
          icon: ClipboardList,
          color: hasCompletedMission ? 'var(--green)' : 'var(--pink)',
          onClick: () => setShowMissionPanel(true),
          badge: hasCompletedMission ? '!' : undefined,
        },
        {
          key: 'achievement',
          label: '成就',
          icon: Trophy,
          color: 'hsl(45, 100%, 60%)',
          onClick: () => setShowAchievementModal(true),
        },
        { key: 'stats', label: '統計', icon: BarChart3, color: 'var(--pink)', onClick: () => setShowStatsPanel(true) },
      ],
    },
    {
      key: 'world',
      label: '道具世界',
      items: [
        { key: 'itemshop', label: '道具商店', icon: ShoppingBag, color: 'var(--purple)', onClick: () => setShowItemShop(true) },
        { key: 'worldview', label: '世界觀', icon: Globe, color: 'var(--purple)', onClick: () => setShowWorldviewPanel(true) },
        { key: 'rules', label: '模式規則', icon: BookOpen, color: 'var(--yellow)', onClick: () => setShowRulesModal(true) },
      ],
    },
    {
      key: 'system',
      label: '存檔其他',
      items: [
        { key: 'save', label: '保存/讀檔', icon: ShoppingBag, color: 'var(--cyan)', onClick: () => { openSavePanel(); } },
        { key: 'surrender', label: '投降', icon: Flag, color: 'var(--red)', onClick: () => setShowSurrenderDialog(true), disabled: gameState.winner !== null },
      ],
    },
  ];

  return (
    <div className={`min-h-screen p-3 md:p-6 flex flex-col ${screenShake ? 'screen-shake' : ''}`}>
      {/* 顶部模式标签 + 回合信息 */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <button onClick={handleBackToMenu} className="cyber-btn px-3 py-1 text-xs md:text-sm">
          ← 返回
        </button>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div
            className="text-xs md:text-sm font-cyber tracking-wider px-3 py-1 border rounded"
            style={{
              color: 'var(--cyan)',
              borderColor: 'var(--border-neon-cyan)',
              boxShadow: '0 0 8px rgba(0,255,255,0.2)',
            }}
          >
            {MODE_LABELS[gameState.mode] ?? getV3ModeLabel(gameState.mode) ?? gameState.mode}
          </div>
          <div
            className="text-xs font-cyber tracking-wider px-3 py-1 border rounded"
            style={{
              color: 'var(--pink)',
              borderColor: 'rgba(255, 107, 157, 0.3)',
              backgroundColor: 'rgba(255, 107, 157, 0.08)',
            }}
          >
            第 {gameState.totalTurns + 1} 回合
          </div>
          {gameState.mode === 'custom' && (
            <div
              className="text-xs font-cyber tracking-wider px-2 py-0.5 border rounded"
              style={{
                color: 'var(--purple)',
                borderColor: 'rgba(168, 85, 247, 0.4)',
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
              }}
            >
              CUSTOM
            </div>
          )}
        </div>
        <SettingsButton onFirstInteract={() => { audio.init(); audio.startBGM(); }} />
        <AnnouncementButton />
        <VolumeControl onFirstInteract={() => { audio.init(); audio.startBGM(); }} />
      </div>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-center lg:items-start justify-center">
        {/* 棋盘 */}
        <div className="w-full max-w-[560px] lg:max-w-[640px] flex-shrink-0 order-1 lg:order-1" data-tutorial="board">
          {/* 天气显示 */}
          {/* 季節顯示 */}
          {gameState.season && (
            <div className="flex justify-center mb-3 max-w-[640px] mx-auto w-full">
              <SeasonDisplay season={gameState.season} />
            </div>
          )}

          <div className="flex justify-center mb-3">
            <WeatherDisplay weather={gameState.currentWeather} />
          </div>

          {/* 觀戰中標籤 */}
          {isSpectator && (
            <div className="flex justify-center mb-3">
              <div
                className="text-xs font-cyber tracking-widest px-4 py-1 rounded-full"
                style={{
                  color: 'var(--pink)',
                  border: '1px solid var(--pink)',
                  backgroundColor: 'rgba(255, 107, 157, 0.1)',
                  boxShadow: '0 0 10px rgba(255, 107, 157, 0.3)',
                }}
              >
                觀戰中
              </div>
            </div>
          )}

          {/* 棋盘 + 弹幕层 + 金幣浮動層 */}
          <div className="relative">
            <Board
              gameState={gameState}
              onCellClick={isSpectator ? undefined : handleCellClick}
              targetMode={isSpectator ? null : itemTargetMode}
              targetPlayerIndex={gameState.currentPlayerIndex}
              boardCells={gameState.boardCells}
              cellEffects={gameState.cellEffects}
              npcs={gameState.npcs}
               controllingCells={getControllingCells()}
               disaster={gameState.disaster}
              weather={gameState.currentWeather}
              bankruptPlayerIndex={latestBankruptIndex}
              isVictory={gameState.winner !== null}
              onJumpLand={() => audio.playSfx('jump')}
            />
            {/* 金錢浮動動畫層 */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {coinFloats.map((f: CoinFloatItem) => {
                // 計算格子在棋盤上的百分比位置（10x10 網格）
                let row = 0;
                let col = 0;
                const id = f.cellId;
                if (id >= 0 && id <= 9) { row = 9; col = id; }
                else if (id >= 10 && id <= 18) { row = 18 - id; col = 9; }
                else if (id >= 19 && id <= 27) { row = 0; col = 27 - id; }
                else { row = id - 27; col = 0; }
                const leftPct = (col + 0.5) * 10;
                const topPct = (row + 0.5) * 10;
                const isPositive = f.amount > 0;
                const color = isPositive ? 'var(--green)' : 'var(--red)';
                return (
                  <div
                    key={f.id}
                    className="absolute flex items-center gap-0.5 font-cyber font-bold text-xs md:text-sm coin-float-anim"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: 'translate(-50%, -50%)',
                      color,
                      textShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Coins size={14} />
                    <span>{isPositive ? '+' : ''}{f.amount}</span>
                  </div>
                );
              })}
            </div>
            {isSpectator && (
              <DanmakuLayer
                messages={danmakuMessages}
                speed={80}
                maxTracks={6}
                maxVisible={20}
              />
            )}
          </div>

          {/* 彈幕輸入框（觀戰模式） */}
          {isSpectator && (
            <div className="mt-3">
              <DanmakuInput
                onSend={handleSendDanmaku}
                placeholder="發送彈幕..."
              />
            </div>
          )}
        </div>

        {/* 右侧信息面板 */}
        <div className="w-full lg:w-80 flex flex-col gap-3 md:gap-4 order-2 lg:order-2">
          {/* 行動面板標題列（移動端摺疊按鈕） */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              操作面板
            </div>
            <button
              onClick={() => setPanelCollapsed((v) => !v)}
              className="cyber-btn px-2 py-1 text-xs font-cyber tracking-wide"
              style={{
                borderColor: 'var(--cyan)',
                color: 'var(--cyan)',
                backgroundColor: 'rgba(0, 255, 255, 0.08)',
              }}
            >
              {panelCollapsed ? '展開 ▾' : '收起 ▴'}
            </button>
          </div>
          {/* 模式規則橫幅 */}
          {gameState.lightningMode && (
            <div
              className="cyber-card px-3 py-2 flex items-center justify-between"
              style={{
                borderColor: 'hsl(45, 100%, 60%)',
                backgroundColor: 'rgba(250, 204, 21, 0.08)',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.3), inset 0 0 8px rgba(250, 204, 21, 0.1)',
              }}
            >
              <span className="text-xs font-cyber tracking-wider" style={{ color: 'hsl(45, 100%, 60%)' }}>
                閃電戰：{gameState.lightningMode.maxTurns}回合後按總資產結算
              </span>
              <span
                className="text-xs font-cyber tracking-wider"
                style={{ color: 'hsl(45, 100%, 60%)', textShadow: '0 0 6px rgba(250, 204, 21, 0.6)' }}
              >
                剩餘：{Math.max(0, gameState.lightningMode.maxTurns - gameState.totalTurns)} / {gameState.lightningMode.maxTurns}
              </span>
            </div>
          )}
          {gameState.resourceMode && (
            <div
              className="cyber-card px-3 py-2"
              style={{
                borderColor: 'var(--green)',
                backgroundColor: 'rgba(0, 255, 128, 0.08)',
                boxShadow: '0 0 10px rgba(0, 255, 128, 0.3), inset 0 0 8px rgba(0, 255, 128, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-cyber tracking-wider" style={{ color: 'var(--green)' }}>
                  資源爭奪：30回合後資源最多者勝
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {gameState.players.map((p: PlayerState) => (
                  <div
                    key={p.playerIndex}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${PLAYER_COLOR_HEX[p.color]}15`,
                      border: `1px solid ${PLAYER_COLOR_HEX[p.color]}40`,
                    }}
                  >
                    <span style={{ color: PLAYER_COLOR_HEX[p.color] }}>{p.name}</span>
                    <span style={{ color: 'var(--green)' }} className="font-cyber">
                      {p.resources ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {gameState.teamDeathmatchMode && (
            <div
              className="cyber-card px-3 py-2 flex items-center justify-center"
              style={{
                borderColor: 'var(--red)',
                backgroundColor: 'rgba(255, 77, 109, 0.08)',
                boxShadow: '0 0 10px rgba(255, 77, 109, 0.3), inset 0 0 8px rgba(255, 77, 109, 0.1)',
              }}
            >
              <span className="text-xs font-cyber tracking-wider" style={{ color: 'var(--red)' }}>
                團隊死鬥：消滅對方全隊獲勝
              </span>
            </div>
          )}
          {gameState.darknetMode && (
            <div
              className="cyber-card px-3 py-2 flex items-center justify-center"
              style={{
                borderColor: 'hsl(270, 80%, 55%)',
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.3), inset 0 0 8px rgba(168, 85, 247, 0.1)',
              }}
            >
              <span className="text-xs font-cyber tracking-wider" style={{ color: 'hsl(270, 80%, 65%)' }}>
                暗網模式：匿名對局，交易抽成10%，道具增強
              </span>
            </div>
          )}

          {/* v3：股市狂潮 / 黑市軍火賽 回合倒數橫幅 */}
          {(gameState.mode === 'stock_frenzy' || gameState.mode === 'black_market_race') && (() => {
            const meta = V3_MODES[gameState.mode];
            const maxTurns = gameState.mode === 'stock_frenzy'
              ? (GAME_MODES.stock_frenzy.maxTurns ?? 40)
              : (GAME_MODES.black_market_race.maxTurns ?? 40);
            const left = Math.max(0, maxTurns - gameState.totalTurns);
            return (
              <div
                className="cyber-card px-3 py-2 flex items-center justify-between"
                style={{
                  borderColor: `${meta.color}66`,
                  backgroundColor: `${meta.color}0d`,
                  boxShadow: `0 0 10px ${meta.color}33, inset 0 0 8px ${meta.color}11`,
                }}
              >
                <span className="text-xs font-cyber tracking-wider" style={{ color: meta.color }}>
                  {meta.label}：{meta.setupHint}
                </span>
                <span className="text-xs font-cyber tracking-wider flex-shrink-0 ml-2" style={{ color: meta.color, textShadow: `0 0 6px ${meta.color}60` }}>
                  結算：{left}/{maxTurns}
                </span>
              </div>
            );
          })()}

          {/* v3：雙子星陣營戰橫幅 */}
          {gameState.mode === 'twin_strike' && (
            <div
              className="cyber-card px-3 py-2 flex items-center justify-between"
              style={{
                borderColor: `${V3_MODES.twin_strike.color}66`,
                backgroundColor: `${V3_MODES.twin_strike.color}0d`,
              }}
            >
              <span className="text-xs font-cyber tracking-wider" style={{ color: V3_MODES.twin_strike.color }}>
                雙子星陣營戰：2v2 共享金庫，殲滅對方全隊
              </span>
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="text-[10px] font-cyber tracking-wider px-2 py-1 rounded flex-shrink-0 ml-2"
                style={{ border: `1px solid ${V3_MODES.twin_strike.color}66`, color: V3_MODES.twin_strike.color }}
                aria-label="查看雙子星陣營戰規則"
              >
                規則
              </button>
            </div>
          )}

          {/* v3：新模式即時戰況面板（可摺疊） */}
          {isV3Mode(gameState.mode) && (
            <ModeLivePanel gameState={gameState} />
          )}

          {/* 玩家列表（移动端可折叠） */}
          <PlayerList
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            isCollapsible={true}
            defaultCollapsed={false}
            propertyCounts={propertyCounts}
            bondIssuedCounts={bondIssuedCounts}
            bondHeldCounts={bondHeldCounts}
            wars={gameState.wars}
            spies={gameState.spies}
            robotProxy={gameState.robotProxy}
            parallelWorld={gameState.parallelWorld}
            buildingMaterials={gameState.buildingMaterials}
            bossIndex={gameState.coopBossMode?.bossIndex ?? null}
            emperorIndex={gameState.emperorMode?.emperorIndex ?? null}
            treasureCarrierIndex={gameState.treasureMode?.treasureCarrier ?? null}
            taxPayingPlayerIndex={gameState.emperorMode?.emperorIndex !== undefined && gameState.emperorMode?.emperorIndex !== null
              ? gameState.emperorMode.emperorIndex
              : null}
            showHealthBars={gameState.survivalMode === true}
            isDarkMode={gameState.darkMode === true || gameState.darknetMode !== undefined}
            darkViewPlayerIndex={gameState.currentPlayerIndex}
            resources={Object.fromEntries(
              gameState.players.map((p: PlayerState) => [p.playerIndex, p.resources ?? 0]),
            )}
          />

          {/* 可摺疊：上方次要面板 */}
          {!panelCollapsed && (
            <>
          {/* 結盟面板（前端模擬，localStorage 持久化） */}
          {!isSpectator && (
            <AlliancePanel
              players={gameState.players}
              myPlayerIndex={gameState.currentPlayerIndex}
              onBetrayalLog={handleBetrayalLog}
            />
          )}

          {/* 觀戰者面板（觀戰模式） */}
          {isSpectator && (
            <SpectatorSidebar
              spectators={mockSpectators}
              currentView={followView}
              onFollowPlayer={handleFollowPlayer}
              playerNames={playerNames}
              playerColors={gameState.players.map((p) => PLAYER_COLOR_HEX[p.color] || 'var(--cyan)')}
            />
          )}

          {/* 導師指導輸入（觀戰模式） */}
          {isSpectator && (
            <MentorInput
              playerNames={playerNames}
              playerColors={gameState.players.map((p) => PLAYER_COLOR_HEX[p.color] || 'var(--cyan)')}
            />
          )}

          {/* 可摺疊：上方次要面板 結束 */}
            </>
          )}

          {/* 操作区（觀戰模式下禁用） */}
          <div
            className={`cyber-card p-3 md:p-4 flex flex-col gap-3 ${isSpectator ? 'opacity-50 pointer-events-none' : ''}`}
            data-tutorial="building"
          >
            {!gameStarted ? (
              <div className="text-center">
                 <div className="text-neon-cyan font-cyber text-lg mb-3">準備就緒</div>
                 <button onClick={handleStart} className="cyber-btn cyber-btn-pink w-full py-3">
                   開始遊戲
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-center text-text-secondary text-xs font-cyber">
                  {gameState.winner !== null
                     ? '遊戲結束'
                     : isMyTurn
                       ? `輪到 ${currentPlayer.name}`
                       : `${currentPlayer.name}（AI）思考中...`}
                </div>
                {/* 職業被動資訊補充 */}
                {gameStarted && currentPlayer.profession === 'influencer' && (
                  <div
                    className="text-center text-[10px] font-cyber tracking-wide"
                    style={{ color: '#ec4899', textShadow: '0 0 4px rgba(236, 72, 153, 0.5)' }}
                  >
                    網紅 · 粉絲 {propertyCounts[gameState.currentPlayerIndex] ?? 0} 人 · 每次起點 +{(propertyCounts[gameState.currentPlayerIndex] ?? 0) * 10} 元
                  </div>
                )}
                {gameStarted && currentPlayer.profession === 'blockchain_miner' && (
                  <div
                    className="text-center text-[10px] font-cyber tracking-wide"
                    style={{ color: '#fbbf24', textShadow: '0 0 4px rgba(251, 191, 36, 0.5)' }}
                  >
                    礦工 · 每回合 +{Math.min((propertyCounts[gameState.currentPlayerIndex] ?? 0) * 20, 200)} 元收益
                  </div>
                )}
                {/* 付錢保釋按鈕（僅監禁狀態顯示） */}
                {canRoll && currentPlayer?.isInDetention && (
                  <button
                    onClick={handlePayBail}
                    disabled={currentPlayer.money < BAIL_AMOUNT}
                    className="cyber-btn w-full py-2 text-sm font-cyber tracking-wide"
                    style={{
                      borderColor: 'var(--purple)',
                      color: currentPlayer.money >= BAIL_AMOUNT ? 'var(--purple)' : 'rgba(160, 120, 255, 0.4)',
                      backgroundColor: 'rgba(160, 120, 255, 0.08)',
                      boxShadow: currentPlayer.money >= BAIL_AMOUNT
                        ? '0 0 10px rgba(160, 120, 255, 0.3), inset 0 0 10px rgba(160, 120, 255, 0.1)'
                        : 'none',
                      opacity: currentPlayer.money >= BAIL_AMOUNT ? 1 : 0.5,
                      cursor: currentPlayer.money >= BAIL_AMOUNT ? 'pointer' : 'not-allowed',
                    }}
                  >
                    付錢保釋（{BAIL_AMOUNT} 元）
                    {currentPlayer.money < BAIL_AMOUNT && <span className="text-xs ml-1 opacity-70">現金不足</span>}
                  </button>
                )}
                {hasTurnTimer ? (
                  <div className="flex items-center justify-center gap-3">
                     <button
                       onClick={handleRollDice}
                       onTouchStart={(e) => { e.preventDefault(); handleRollDice(); }}
                       disabled={!canRoll}
                       className="cyber-btn cyber-btn-pink flex-1 py-3 text-lg font-cyber tracking-widest"
                       data-tutorial="roll-dice"
                       aria-label="擲骰子"
                     >
                      {rollButtonText}
                    </button>
                    <div className="relative flex-shrink-0" style={{ width: 48, height: 48 }}>
                      <svg width={48} height={48} viewBox="0 0 48 48">
                        <circle
                          cx={24}
                          cy={24}
                          r={20}
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={3}
                        />
                        <circle
                          cx={24}
                          cy={24}
                          r={20}
                          fill="none"
                          stroke={isUrgent ? 'var(--red)' : 'var(--cyan)'}
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - turnTimeLeft / turnTimeLimit)}
                          transform="rotate(-90 24 24)"
                          style={{
                            filter: isUrgent
                              ? 'drop-shadow(0 0 4px var(--red)) drop-shadow(0 0 8px var(--red))'
                              : 'drop-shadow(0 0 4px var(--cyan)) drop-shadow(0 0 8px var(--cyan))',
                            transition: 'stroke-dashoffset 1s linear',
                            animation: isUrgent ? 'turn-timer-pulse 0.5s ease-in-out infinite' : undefined,
                          }}
                        />
                      </svg>
                      <div
                        className="absolute inset-0 flex items-center justify-center font-cyber text-sm font-bold"
                        style={{
                          color: isUrgent ? 'var(--red)' : 'var(--cyan)',
                          textShadow: isUrgent ? '0 0 6px var(--red)' : '0 0 6px var(--cyan)',
                        }}
                      >
                        {turnTimeLeft}
                      </div>
                    </div>
                  </div>
                ) : (
                     <button
                       onClick={handleRollDice}
                       onTouchStart={(e) => { e.preventDefault(); handleRollDice(); }}
                       disabled={!canRoll}
                       className="cyber-btn cyber-btn-pink w-full py-3 text-lg font-cyber tracking-widest"
                       data-tutorial="roll-dice"
                       aria-label="擲骰子"
                     >
                    {rollButtonText}
                  </button>
                )}
                {canRoll && !gameState.pendingTrade && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleOpenTrade}
                      className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                    >
                       交易
                    </button>
                    <button
                      onClick={() => setShowSystemMenu(true)}
                      className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide relative"
                      style={{
                        borderColor: 'var(--cyan)',
                        color: 'var(--cyan)',
                        backgroundColor: 'rgba(0, 255, 255, 0.08)',
                      }}
                      aria-label="開啟系統選單"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <SlidersHorizontal className="w-4 h-4" />
                        系統選單
                      </span>
                      {/* 有可升級技能 / 可領任務時顯示提示點 */}
                      {(currentPlayer.skillPoints ?? 0) > 0 || hasCompletedMission ? (
                        <span
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-cyber flex items-center justify-center"
                          style={{ backgroundColor: '#facc15', color: '#000', boxShadow: '0 0 8px #facc15' }}
                        >
                          !
                        </span>
                      ) : null}
                    </button>
                  </div>
                )}
                     {/* 職業主動技能按鈕（上下文相關，保留在主流程附近） */}
                     <div className="flex flex-wrap gap-2 justify-center">
                     {gameState && isMyTurn && gameState.winner === null && (() => {
                       const skills = getAvailableProfessionSkills(gameState, gameState.currentPlayerIndex);
                       if (skills.length === 0) return null;
                       const getSkillColor = (skillId: string): string => {
                         switch (skillId) {
                           case 'hack_property': return '#a855f7';
                           case 'quantum_jump': return '#06b6d4';
                           case 'sell_item': return '#f59e0b';
                           case 'dice_adjust': return '#10b981';
                           default: return 'var(--cyan)';
                         }
                       };
                       const handleSkillClick = (skillId: string) => {
                         // 引擎後續新增、由 useProfessionSkill 統一執行的主動技能（引擎已做 ready/守衛）
                         const NEW_SKILL_IDS = new Set([
                           'drone_deploy',
                           'auctioneer_undercut',
                           'bounty_collect',
                           'nitro_dash',
                           'media_blitz',
                           'snipe_shot',
                           // v3.0 新職業主動技能（統一走 applyProfessionSkill）
                           'digital_raid',
                           'nanite_repair',
                           'market_play',
                         ]);
                         if (NEW_SKILL_IDS.has(skillId)) {
                           if (gameState) {
                             audio.playSfx('click');
                             setGameState(castProfessionSkill(gameState, gameState.currentPlayerIndex, skillId));
                           }
                           return;
                         }
                         switch (skillId) {
                           case 'hack_property':
                             setHackSelectedCellId(null);
                             setShowHackModal(true);
                             break;
                           case 'quantum_jump':
                             setQuantumSelectedCellId(null);
                             setShowQuantumModal(true);
                             break;
                           case 'sell_item':
                             setSellTargetIndex(-1);
                             setSellSelectedItemId(null);
                             setSellPrice(100);
                             setShowSellItemModal(true);
                             break;
                           case 'dice_adjust':
                             // 機械強化由擲骰區按鈕觸發，這裡不做彈窗
                             break;
                           case 'priest_sacrifice':
                             // 數據獻祭：立即生效（引擎函式）
                             if (gameState) setGameState(priestSacrifice(gameState, gameState.currentPlayerIndex));
                             break;
                           case 'time_watcher_extra':
                             // 時間回溯：立即額外回合（引擎函式）
                             if (gameState) setGameState(timeWatcherExtraTurn(gameState, gameState.currentPlayerIndex));
                             break;
                           default:
                             break;
                         }
                       };
                       return skills.map((skill) => {
                         const color = getSkillColor(skill.id);
                         // dice_adjust 不在操作欄顯示按鈕（已在擲骰區顯示）
                         if (skill.id === 'dice_adjust') return null;
                         return (
                           <button
                             key={skill.id}
                             onClick={() => skill.ready && handleSkillClick(skill.id)}
                             disabled={!skill.ready}
                             className="cyber-btn px-3 py-2 text-sm font-cyber tracking-wide whitespace-nowrap flex-shrink-0"
                             style={{
                               borderColor: color,
                               color: skill.ready ? color : `${color}80`,
                               backgroundColor: `${color}10`,
                               opacity: skill.ready ? 1 : 0.6,
                               cursor: skill.ready ? 'pointer' : 'not-allowed',
                             }}
                           >
                              {skill.id === 'hack_property' && '駭客 '}
                              {skill.id === 'quantum_jump' && '量子 '}
                              {skill.id === 'sell_item' && '售物 '}
                             {skill.name}
                             {skill.cooldownText && (
                               <span className="text-[10px] ml-1 opacity-80">({skill.cooldownText})</span>
                             )}
                           </button>
                         );
                       });
                     })()}
                     </div>
                {/* v3：新坐騎主動快捷操作（偵察無人機 / 懸浮跑車） */}
                {gameStarted && !isSpectator && (
                  <MountQuickActions
                    gameState={gameState}
                    playerIndex={gameState.currentPlayerIndex}
                    canAct={canRoll}
                    onApply={(next: GameState) => setGameState(next)}
                  />
                )}
                {gameState.pendingTrade && (
                  <div
                    className="text-center text-xs py-1 px-2 rounded"
                    style={{
                      color: "var(--pink)",
                      backgroundColor: "rgba(255, 107, 157, 0.1)",
                      border: "1px solid rgba(255, 107, 157, 0.3)",
                    }}
                  >
                    交易等待对方回应中...
                  </div>
                )}
                {gameState.lastDiceValues[0] > 0 && gameState.winner === null && (
                  <span className="text-center text-xs text-text-secondary">
                    上次点数：{gameState.lastDiceValues[0]}+{gameState.lastDiceValues[1]}={gameState.lastDiceValues[0] + gameState.lastDiceValues[1]}
                  </span>
                )}

                {/* 賽博改造人：擲骰微調按鈕 */}
                {canRoll
                  && currentPlayer.profession === 'cyberborg'
                  && !currentPlayer.diceAdjustedThisTurn
                  && gameState.phase === 'rolling'
                  && gameState.diceValues[0] > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-cyber tracking-wide"
                      style={{ color: '#10b981' }}
                    >
                       機械強化：
                    </span>
                    <button
                      onClick={() => {
                        if (!gameState) return;
                        const newState = adjustDiceResult(gameState, gameState.currentPlayerIndex, -1);
                        setGameState(newState);
                        setDiceValues(newState.diceValues);
                      }}
                      disabled={gameState.diceValues[0] + gameState.diceValues[1] <= 2}
                      className="cyber-btn px-2 py-0.5 text-xs font-cyber"
                      style={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        minWidth: '28px',
                      }}
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        if (!gameState) return;
                        const newState = adjustDiceResult(gameState, gameState.currentPlayerIndex, 1);
                        setGameState(newState);
                        setDiceValues(newState.diceValues);
                      }}
                      disabled={gameState.diceValues[0] + gameState.diceValues[1] >= 12}
                      className="cyber-btn px-2 py-0.5 text-xs font-cyber"
                      style={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        minWidth: '28px',
                      }}
                    >
                      +1
                    </button>
                  </div>
                )}

                {/* 撤銷按鈕 */}
                {gameState.lastAction && undoCountdown > 0 && gameState.phase === 'rolling' && !gameState.players[gameState.lastAction.playerIndex]?.isAI && (
                  <div className="relative mt-2">
                    <button
                      onClick={() => setShowUndoConfirm(true)}
                      className="cyber-btn w-full py-2 text-sm font-cyber tracking-wide relative overflow-hidden"
                      style={{
                        borderColor: 'var(--cyan)',
                        color: 'var(--cyan)',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: 'linear-gradient(90deg, rgba(0,255,255,0.4) 0%, rgba(0,255,255,0.1) 100%)',
                          width: `${(undoCountdown / 5000) * 100}%`,
                          transition: 'width 0.1s linear',
                        }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7v6h6" />
                          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                        </svg>
                        撤銷操作 ({(undoCountdown / 1000).toFixed(1)}s)
                      </span>
                    </button>
                  </div>
                )}

                  {/* 快捷操作按鈕 */}
                  {canRoll && !gameState.pendingTrade && (
                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => openBatchConfirm('build')}
                           className="cyber-btn py-1.5 text-xs font-cyber tracking-wide whitespace-nowrap"
                           style={{
                            borderColor: 'hsl(140, 100%, 50%)',
                            color: 'hsl(140, 100%, 50%)',
                            backgroundColor: 'rgba(0, 255, 128, 0.06)',
                          }}
                        >
                          全部建房
                        </button>
                        <button
                          onClick={() => openBatchConfirm('mortgage')}
                          className="cyber-btn flex-1 py-1.5 text-xs font-cyber tracking-wide"
                          style={{
                            borderColor: 'hsl(45, 100%, 60%)',
                            color: 'hsl(45, 100%, 60%)',
                            backgroundColor: 'rgba(250, 204, 21, 0.06)',
                          }}
                        >
                          全部抵押
                        </button>
                        <button
                          onClick={() => openBatchConfirm('redeem')}
                          className="cyber-btn py-1.5 text-xs font-cyber tracking-wide whitespace-nowrap"
                          style={{
                            borderColor: 'hsl(200, 100%, 60%)',
                            color: 'hsl(200, 100%, 60%)',
                            backgroundColor: 'rgba(56, 189, 248, 0.06)',
                          }}
                        >
                          全部贖回
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setShowBatchSelect('build')}
                          className="cyber-btn py-1.5 text-xs font-cyber tracking-wide whitespace-nowrap opacity-80 hover:opacity-100"
                          style={{
                            borderColor: 'rgba(0, 255, 128, 0.5)',
                            color: 'rgba(0, 255, 128, 0.8)',
                            backgroundColor: 'rgba(0, 255, 128, 0.03)',
                          }}
                        >
                          精選建房
                        </button>
                        <button
                          onClick={() => setShowBatchSelect('mortgage')}
                          className="cyber-btn py-1.5 text-xs font-cyber tracking-wide whitespace-nowrap opacity-80 hover:opacity-100"
                          style={{
                            borderColor: 'rgba(250, 204, 21, 0.5)',
                            color: 'rgba(250, 204, 21, 0.8)',
                            backgroundColor: 'rgba(250, 204, 21, 0.03)',
                          }}
                        >
                          精選抵押
                        </button>
                        <button
                          onClick={() => setShowBatchSelect('redeem')}
                          className="cyber-btn py-1.5 text-xs font-cyber tracking-wide whitespace-nowrap opacity-80 hover:opacity-100"
                          style={{
                            borderColor: 'rgba(56, 189, 248, 0.5)',
                            color: 'rgba(56, 189, 248, 0.8)',
                            backgroundColor: 'rgba(56, 189, 248, 0.03)',
                          }}
                        >
                          精選贖回
                        </button>
                      </div>
                    </div>
                  )}

              </div>
            )}
          </div>

          {/* 可摺疊：下方次要面板 */}
          {!panelCollapsed && (
            <>
          {/* 道具栏 */}
          {gameStarted && gameState.winner === null && (
            <div className="cyber-card p-3 md:p-4">
              <ItemBar
                player={currentPlayer}
                isCurrentPlayer={isMyTurn && gameState.phase === 'rolling'}
                onUseItem={handleUseItem}
                gameState={gameState}
              />
            </div>
          )}

          {/* 游戏日志 */}
          <div className="md:w-auto h-32 md:h-40 overflow-hidden">
            <GameLog logs={gameState.logs as LogEntry[]} inflationRate={gameState.inflationRate ?? 1.0} />
          </div>
            </>
          )}
        </div>
      </div>

      {/* 骰子覆盖层 */}
      <DiceOverlay isRolling={isRolling} values={diceValues} onComplete={onDiceComplete} />

      {/* 购买弹窗 */}
      <BuyModal
        isOpen={showBuyModal}
        cellName={currentCell.name}
        price={buyPrice}
        playerMoney={currentPlayer.money}
        canAfford={canAffordBuy}
        onBuy={handleBuy}
        onAuction={handleStartAuction}
        onSkip={handleSkip}
        onReserve={handleReserve}
        enablePropertyFutures={gameState.customRules?.enablePropertyFutures !== false}
      />

      {/* 命运卡弹窗 */}
      <FateCardModal
        isOpen={showFateModal}
        card={(gameState.pendingFateCard as FateCard) || null}
        onClose={() => setShowFateModal(false)}
      />

      {/* 机会卡弹窗 */}
      <ChanceCardModal
        isOpen={showChanceModal}
        card={(gameState.pendingChanceCard as ChanceCard) || null}
        onClose={() => setShowChanceModal(false)}
      />

      {/* 地块操作弹窗 */}
      <PropertyActionModal
        isOpen={showPropertyModal && selectedCellId !== null}
        cellId={selectedCellId ?? 0}
        gameState={gameState}
        playerIndex={gameState.currentPlayerIndex}
        canBuild={gameState.phase === 'rolling' && gameState.winner === null}
        onBuild={handleBuild}
        onDemolish={handleDemolish}
        onMortgage={handleMortgage}
        onRedeem={handleRedeem}
        onBuyInsurance={handleBuyInsurance}
        onClose={() => {
          setShowPropertyModal(false);
          setSelectedCellId(null);
        }}
        specialBuilding={gameState.properties[selectedCellId ?? 0]?.specialBuilding ?? null}
        onBuildSpecial={handleBuildSpecial}
        onDemolishSpecial={handleDemolishSpecial}
        canBuildSpecial={gameState.phase === 'rolling' && gameState.winner === null && isMyTurn}
        canForceAcquire={(() => {
          if (selectedCellId === null) return false;
          const prop = gameState.properties[selectedCellId];
          if (!prop || prop.owner === undefined || prop.owner === gameState.currentPlayerIndex) return false;
          if (prop.buildings > 0 || prop.isMortgaged) return false;
          const marketVal = getPropertyValue(selectedCellId, gameState.mode, prop.buildings, prop.isMortgaged);
          return currentPlayer.money >= marketVal * 3;
        })()}
        forceAcquirePrice={selectedCellId !== null && gameState.properties[selectedCellId]
          ? Math.floor(getPropertyValue(selectedCellId, gameState.mode, gameState.properties[selectedCellId].buildings, gameState.properties[selectedCellId].isMortgaged) * 1.5)
          : undefined}
        marketValue={selectedCellId !== null && gameState.properties[selectedCellId]
          ? getPropertyValue(selectedCellId, gameState.mode, gameState.properties[selectedCellId].buildings, gameState.properties[selectedCellId].isMortgaged)
          : undefined}
        onForceAcquire={gameState.phase === 'rolling' && gameState.winner === null && isMyTurn ? handleForceAcquire : undefined}
        canBribe={(() => {
          if (selectedCellId === null) return false;
          const prop = gameState.properties[selectedCellId];
          if (!prop || prop.owner !== undefined) return false;
          const cell = CELLS[selectedCellId];
          if (!cell || cell.type !== 'property') return false;
          const basePrice = cell.basePrice;
          const totalCost = Math.round(basePrice * 0.9);
          const bribeUsed = gameState.bribeCount ?? 0;
          return currentPlayer.money >= totalCost && bribeUsed < 3;
        })()}
        bribePrice={selectedCellId !== null && CELLS[selectedCellId]?.type === 'property'
          ? Math.round(CELLS[selectedCellId].basePrice * 0.9)
          : undefined}
        bribeCount={gameState.bribeCount ?? 0}
        bribeMaxCount={3}
        onBribe={gameState.phase === 'rolling' && gameState.winner === null && isMyTurn ? handleBribeBank : undefined}
        canEvolve={(() => {
          if (selectedCellId === null) return false;
          const prop = gameState.properties[selectedCellId];
          if (!prop || prop.owner !== gameState.currentPlayerIndex) return false;
          if (prop.isMortgaged) return false;
          if ((prop.evolutionLevel ?? 0) >= 2) return false;
          const materials = gameState.buildingMaterials?.[gameState.currentPlayerIndex] ?? 0;
          return materials >= 3;
        })()}
        evolutionLevel={selectedCellId !== null ? (gameState.properties[selectedCellId]?.evolutionLevel ?? 0) : 0}
        evolutionCost={3}
        buildingMaterials={gameState.buildingMaterials?.[gameState.currentPlayerIndex] ?? 0}
        onEvolve={gameState.phase === 'rolling' && gameState.winner === null && isMyTurn ? handleEvolveProperty : undefined}
      />

      {/* 快捷操作確認彈窗 */}
      {showBatchConfirm && batchPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowBatchConfirm(null);
            setBatchPreview(null);
          }}
        >
          <div
            className="cyber-card border-neon-cyan p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-neon-cyan font-cyber text-xl mb-4 text-center">
              確認快捷操作
            </h3>
            <div className="text-text-secondary text-sm mb-6 text-center space-y-2">
              <div>
                {showBatchConfirm === 'build' && (
                  <>
                    <div className="text-base mb-2" style={{ color: 'hsl(140, 100%, 50%)' }}>
                      全部建房
                    </div>
                    <div>將建造 <span className="text-neon-cyan font-bold">{batchPreview.count}</span> 棟建築</div>
                    <div>總花費：<span className="text-neon-pink font-bold">¥{batchPreview.amount.toLocaleString()}</span></div>
                  </>
                )}
                {showBatchConfirm === 'mortgage' && (
                  <>
                    <div className="text-base mb-2" style={{ color: 'hsl(45, 100%, 60%)' }}>
                      全部抵押
                    </div>
                    <div>將抵押 <span className="text-neon-cyan font-bold">{batchPreview.count}</span> 塊地產</div>
                    <div>獲得現金：<span className="text-neon-pink font-bold">¥{batchPreview.amount.toLocaleString()}</span></div>
                  </>
                )}
                {showBatchConfirm === 'redeem' && (
                  <>
                    <div className="text-base mb-2" style={{ color: 'hsl(200, 100%, 60%)' }}>
                      全部贖回
                    </div>
                    <div>將贖回 <span className="text-neon-cyan font-bold">{batchPreview.count}</span> 塊地產</div>
                    <div>總花費：<span className="text-neon-pink font-bold">¥{batchPreview.amount.toLocaleString()}</span></div>
                  </>
                )}
              </div>
              {batchPreview.count === 0 && (
                <div className="text-xs text-red-400 mt-2">
                  沒有可操作的地產
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowBatchConfirm(null);
                  setBatchPreview(null);
                }}
                className="cyber-btn px-6 py-2"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (showBatchConfirm === 'build') handleBatchBuild();
                  else if (showBatchConfirm === 'mortgage') handleBatchMortgage();
                  else handleBatchRedeem();
                }}
                disabled={batchPreview.count === 0}
                className="cyber-btn cyber-btn-pink px-6 py-2"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 撤銷確認彈窗 */}
      {showUndoConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUndoConfirm(false)}
        >
          <div
            className="cyber-card rounded-lg w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
            style={{
              border: '1px solid var(--cyan)',
              boxShadow: '0 0 20px var(--cyan), inset 0 0 15px rgba(0, 255, 255, 0.1)',
              animation: 'modal-in 0.2s ease-out',
            }}
          >
            <h3
              className="font-cyber text-lg tracking-wider mb-3 text-center"
              style={{ color: 'var(--cyan)', textShadow: '0 0 8px var(--cyan)' }}
            >
              確認撤銷
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: 'var(--text-secondary)' }}>
              確定要撤銷上一步操作嗎？<br />
              狀態將回滾到操作前的快照。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
                style={{ border: '1px solid var(--border-neon-cyan)', color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                onClick={handleUndoConfirm}
                className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
                style={{
                  border: '1px solid var(--cyan)',
                  color: 'var(--cyan)',
                  backgroundColor: 'rgba(0, 255, 255, 0.15)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                  textShadow: '0 0 4px var(--cyan)',
                }}
              >
                確認撤銷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 精選批量操作彈窗 */}
      {gameState && gameStarted && gameState.winner === null && showBatchSelect && (
        <BatchSelectModal
          open={!!showBatchSelect}
          type={showBatchSelect}
          gameState={gameState}
          playerIndex={gameState.currentPlayerIndex}
          playerMoney={currentPlayer.money}
          onClose={() => setShowBatchSelect(null)}
          onConfirm={handleBatchSelectConfirm}
        />
      )}

      {/* 投降確認彈窗 */}
      {showSurrenderDialog && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSurrenderDialog(false)}
        >
          <div
            className="cyber-card p-6 max-w-md w-full"
            style={{ borderColor: 'var(--red)', boxShadow: '0 0 20px rgba(255, 77, 109, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-cyber text-xl mb-4 text-center" style={{ color: 'var(--red)', textShadow: '0 0 10px rgba(255, 77, 109, 0.5)' }}>
              確認投降
            </h3>
            <div className="text-text-secondary text-sm mb-6 text-center">
              確定要投降嗎？投降後將視為敗北，遊戲立即結束。
              <div className="text-xs mt-3" style={{ color: 'var(--red)' }}>
                長按下方按鈕 1.5 秒確認投降
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSurrenderDialog(false)}
                className="cyber-btn px-6 py-2"
              >
                取消
              </button>
              <SurrenderButton onConfirm={handleSurrender} />
            </div>
          </div>
        </div>
      )}

      {/* 災難彈窗 */}
      <DisasterModal
        isOpen={showDisasterModal}
        onClose={() => setShowDisasterModal(false)}
        disaster={gameState.disaster}
        cellNames={CELLS.reduce<Record<number, string>>((acc, cell) => {
          acc[cell.id] = cell.name;
          return acc;
        }, {})}
      />

      {/* 技能樹彈窗 */}
      <SkillTreeModal
        isOpen={showSkillTreeModal}
        onClose={() => setShowSkillTreeModal(false)}
        skillTree={currentPlayer.skillTree ?? Object.fromEntries(SKILL_IDS.map((id) => [id, 0]))}
        skillPoints={currentPlayer.skillPoints ?? 0}
        playerIndex={gameState.currentPlayerIndex}
        canUpgrade={isMyTurn && gameState.phase === 'rolling' && gameState.winner === null && !isSpectator}
        onUpgrade={handleUpgradeSkill}
      />

      {/* 任務面板 */}
      <MissionPanel
        missions={missions}
        isOpen={showMissionPanel}
        onClose={() => setShowMissionPanel(false)}
      />

      {/* 职业选择弹窗（多人轮转） */}
      <ProfessionSelectModal
        isOpen={showProfessionSelect}
        playerName={gameState.players[professionSelectIndex]?.name ?? ''}
        playerColor={gameState.players[professionSelectIndex]?.color ?? 'red'}
        selectedProfession={pendingProfession}
        onSelect={handleProfessionSelect}
        onConfirm={handleProfessionConfirm}
        onClose={handleProfessionClose}
        disabled={false}
      />

      {/* 拍卖弹窗（多人） */}
      <AuctionModal
        isOpen={gameState.phase === 'auction' && !!auction?.active}
        auction={auction}
        cellName={auctionCell?.name ?? ''}
        cellPrice={auctionCellPrice}
        players={gameState.players}
        activeBidderIndex={auctionActiveBidder ?? 0}
        myPlayerIndex={auctionViewerIndex}
        myMoney={auctionViewerMoney}
        onBid={handleBid}
        onPass={handlePass}
        onSubmitBlindBid={handleSubmitBlindBid}
        blindBidSubmitted={auction?.blindBids?.[auctionViewerIndex] !== undefined && auction?.blindBids?.[auctionViewerIndex] !== null}
        disabled={isAuctionAITurn}
      />

      {/* NPC 交互弹窗 */}
      <NpcModal
        isOpen={showNpcModal && !!gameState.pendingNpcInteraction}
        onClose={handleCloseNpc}
        npc={gameState.npcs?.find((n: NpcEntity) => n.id === gameState.pendingNpcInteraction?.npcId) ?? null}
        playerIndex={gameState.pendingNpcInteraction?.playerIndex ?? 0}
        playerMoney={gameState.players[gameState.pendingNpcInteraction?.playerIndex ?? 0]?.money ?? 0}
        playerItems={gameState.players[gameState.pendingNpcInteraction?.playerIndex ?? 0]?.items ?? []}
        opponents={gameState.players
          .map((p: PlayerState, idx: number) => ({
            index: idx,
            name: p.name,
            items: p.items,
          }))
          .filter((op: { index: number; name: string; items: ItemState[] }) => op.index !== (gameState.pendingNpcInteraction?.playerIndex ?? 0))}
        canInteract={isMyTurn && !gameState.players[gameState.pendingNpcInteraction?.playerIndex ?? 0]?.isAI}
        onBuyItem={handleBuyFromMerchant}
        onHireHacker={handleHireHacker}
      />

      {/* 交易弹窗（多人：可选对象） */}
      <TradeModal
        mode={tradeModalMode}
        isOpen={showTradeModal}
        gameState={gameState}
        playerIndex={
          tradeModalMode === 'respond' && gameState.pendingTrade
            ? gameState.pendingTrade.toPlayer
            : gameState.currentPlayerIndex
        }
        targetPlayerIndex={tradeTargetIndex >= 0 ? tradeTargetIndex : undefined}
        onClose={() => {
          if (tradeModalMode === 'propose' || tradeModalMode === 'selectTarget') {
            setShowTradeModal(false);
            setTradeTargetIndex(-1);
          }
        }}
        onSelectTarget={handleSelectTradeTarget}
        onPropose={handleProposeTrade}
        onAccept={handleAcceptTrade}
        onReject={handleRejectTrade}
        isDarknetMode={!!gameState.darknetMode}
        darknetFeeRate={gameState.darknetMode?.feeRate ?? 0}
      />

      {/* 資源兌換彈窗 */}
      {gameState && showResourceExchange && (
        <ResourceExchangeModal
          open={showResourceExchange}
          onClose={() => setShowResourceExchange(false)}
          currentResources={gameState.players[gameState.currentPlayerIndex]?.resources ?? 0}
          onExchange={handleExchangeResource}
        />
      )}

      {/* 表情面板（遊戲中常駐底部左側） */}
      {gameStarted && gameState.winner === null && (
        <EmotePanel currentPlayerIndex={gameState.currentPlayerIndex} />
      )}

      {/* 存档槽位面板 */}
      <SaveSlotPanel
        isOpen={showSavePanel}
        mode={savePanelMode}
        slots={slots}
        onClose={() => setShowSavePanel(false)}
        onSave={handleSaveToSlot}
        onLoad={handleLoadFromSlot}
        onDelete={handleDeleteSlot}
      />

      {/* 股票面板 */}
      <StockPanel
        isOpen={showStockPanel}
        onClose={() => setShowStockPanel(false)}
        stocks={gameState.stocks}
        playerStocks={currentPlayer.stocks}
        playerMoney={currentPlayer.money}
        playerIndex={gameState.currentPlayerIndex}
        isMyTurn={isMyTurn && gameState.phase === 'rolling'}
        stockStates={gameState.stockStates}
        players={gameState.players.map((p) => ({
          name: p.name,
          color: PLAYER_COLOR_HEX[p.color],
          playerIndex: p.playerIndex,
        }))}
        onBuy={handleBuyStock}
        onSell={handleSellStock}
        onShareholderMeeting={handleShareholderMeeting}
      />

      {/* 地下市場彈窗 */}
      <UndergroundMarketModal
        isOpen={showUndergroundMarket}
        onClose={() => setShowUndergroundMarket(false)}
        stolenProperties={gameState.stolenProperties ?? []}
        playerMoney={currentPlayer.money}
        playerReputation={currentPlayer.reputation}
        canTrade={
          currentPlayer.reputation !== undefined &&
          currentPlayer.reputation < 50 &&
          isMyTurn &&
          gameState.phase === 'rolling' &&
          gameState.winner === null
        }
        onBuy={handleUndergroundMarketBuy}
        cellConfigs={CELLS}
      />

      {/* 全局事件弹窗 */}
      <GlobalEventModal
        isOpen={showGlobalEvent}
        eventType={gameState.currentGlobalEvent}
        onClose={() => setShowGlobalEvent(false)}
      />

      {/* 道具商店弹窗 */}
      {/* TODO: 黑市商人道具商店價格展示（原價劃掉 + 8折後價）
         需在 ItemShop 組件中增加：檢查 player.profession === 'black_market_dealer'，
         若是則顯示原價 + 劃掉 + 折後價（price * 0.8）。
         由於 ItemShop 是獨立組件，此處暫不修改，待後續更新。 */}
      <ItemShop
        open={showItemShop}
        onClose={() => setShowItemShop(false)}
        gameState={gameState}
        playerIndex={gameState.currentPlayerIndex}
        onBuy={handleBuyItem}
      />

      {/* 駭客入侵彈窗 */}
      {showHackModal && gameState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
            backdropFilter: 'blur(4px)',
            animation: 'fade-in 0.2s ease-out',
          }}
          onClick={() => setShowHackModal(false)}
        >
          <div
            className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
            style={{
              border: '1px solid #a855f7',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.05)',
              animation: 'float-up 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
            >
              <div>
                <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: 'rgba(168, 85, 247, 0.7)' }}>
                  職業技能 / PROFESSION
                </div>
                <h2 className="text-xl font-cyber tracking-wider" style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168, 85, 247, 0.5)' }}>
                   入侵系統
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHackModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 overflow-y-auto flex-1">
              {(() => {
                const currentIdx = gameState.currentPlayerIndex;
                const targetProps = Object.entries(gameState.properties)
                  .filter(([_id, prop]) => prop.owner !== currentIdx && !prop.isMortgaged)
                  .map(([idStr, prop]) => ({
                    cellId: Number(idStr),
                    prop,
                    cell: CELLS[Number(idStr)] ?? gameState.boardCells?.[Number(idStr)],
                    toll: getToll(
                      Number(idStr),
                      gameState.mode,
                      prop.owner,
                      gameState.properties,
                      gameState.globalEventMultipliers,
                      gameState.customRules,
                      gameState.weatherMultipliers,
                      gameState.isCoopMode,
                      prop.ownerTeam,
                      0,
                      gameState.boardCells,
                      gameState.cellEffects,
                      gameState.stockStates,
                      gameState.season,
                      gameState.disaster,
                    ),
                  }))
                  .filter((item) => item.cell?.type === 'property');
                if (targetProps.length === 0) {
                  return (
                    <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      對手暫無可入侵地產
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {targetProps.map(({ cellId, prop, cell, toll }) => {
                      const isSelected = hackSelectedCellId === cellId;
                      return (
                        <button
                          key={cellId}
                          type="button"
                          onClick={() => setHackSelectedCellId(cellId)}
                          className="w-full p-3 rounded-lg text-left transition-all"
                          style={{
                            backgroundColor: 'var(--bg-mid)',
                            border: `1px solid ${isSelected ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: isSelected ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-cyber text-sm" style={{ color: cell?.color }}>
                              {cell?.name ?? `地產 ${cellId}`}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              過路費：{toll} 元
                            </span>
                          </div>
                          {prop.hackedUntilTurn && prop.hackedUntilTurn > gameState.totalTurns && (
                            <div className="text-[10px] mt-1" style={{ color: '#a855f7' }}>
                              已被入侵（剩餘 {prop.hackedUntilTurn - gameState.totalTurns} 回合）
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div className="px-5 py-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <button
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                onClick={() => setShowHackModal(false)}
              >
                取消
              </button>
              <button
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                style={{
                  borderColor: '#a855f7',
                  color: '#a855f7',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                }}
                disabled={hackSelectedCellId === null}
                onClick={() => {
                  if (hackSelectedCellId === null || !gameState) return;
                  const newState = hackProperty(gameState, gameState.currentPlayerIndex, hackSelectedCellId);
                  setGameState(newState);
                  setShowHackModal(false);
                  setHackSelectedCellId(null);
                }}
              >
                確認入侵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 量子跳躍彈窗 */}
      {showQuantumModal && gameState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
            backdropFilter: 'blur(4px)',
            animation: 'fade-in 0.2s ease-out',
          }}
          onClick={() => setShowQuantumModal(false)}
        >
          <div
            className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
            style={{
              border: '1px solid #06b6d4',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.05)',
              animation: 'float-up 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}
            >
              <div>
                <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: 'rgba(6, 182, 212, 0.7)' }}>
                  職業技能 / PROFESSION
                </div>
                <h2 className="text-xl font-cyber tracking-wider" style={{ color: '#06b6d4', textShadow: '0 0 8px rgba(6, 182, 212, 0.5)' }}>
                   量子跳躍
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowQuantumModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 flex-1 flex flex-col items-center">
              <p className="text-xs mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                選擇要跳躍到的格子
              </p>
              {/* 簡化 36 格棋盤示意圖 */}
              <div
                className="relative aspect-square w-full max-w-[360px]"
                style={{ border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px' }}
              >
                {CELLS.map((cell, idx) => {
                  // 棋盤為 10x10 外圈，計算每個格子的位置
                  let top = 0;
                  let left = 0;
                  const cellSize = 10; // 百分比
                  if (idx <= 9) {
                    // 底邊（左→右），位置 0 在左下角
                    left = idx * cellSize;
                    top = 9 * cellSize;
                  } else if (idx <= 18) {
                    // 右邊（下→上）
                    left = 9 * cellSize;
                    top = (18 - idx) * cellSize;
                  } else if (idx <= 27) {
                    // 頂邊（右→左）
                    left = (27 - idx) * cellSize;
                    top = 0;
                  } else {
                    // 左邊（上→下）
                    left = 0;
                    top = (idx - 27) * cellSize;
                  }
                  const isSelected = quantumSelectedCellId === idx;
                  const isCurrent = gameState.players[gameState.currentPlayerIndex]?.position === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuantumSelectedCellId(idx)}
                      className="absolute flex items-center justify-center text-[8px] font-cyber transition-all"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${cellSize}%`,
                        height: `${cellSize}%`,
                        backgroundColor: isSelected
                          ? 'rgba(6, 182, 212, 0.3)'
                          : isCurrent
                            ? 'rgba(255, 107, 157, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isSelected ? '#06b6d4' : isCurrent ? '#ff6b9d' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: cell.color,
                        boxShadow: isSelected ? '0 0 8px rgba(6, 182, 212, 0.5)' : 'none',
                        borderRadius: '2px',
                      }}
                      title={cell.name}
                    >
                      {idx}
                    </button>
                  );
                })}
              </div>
              {quantumSelectedCellId !== null && (
                <div className="mt-3 text-xs" style={{ color: '#06b6d4' }}>
                  目標：{CELLS[quantumSelectedCellId]?.name ?? `格子 ${quantumSelectedCellId}`}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              <button
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                onClick={() => setShowQuantumModal(false)}
              >
                取消
              </button>
              <button
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                style={{
                  borderColor: '#06b6d4',
                  color: '#06b6d4',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)',
                }}
                disabled={quantumSelectedCellId === null}
                onClick={() => {
                  if (quantumSelectedCellId === null || !gameState) return;
                  const newState = quantumJump(gameState, gameState.currentPlayerIndex, quantumSelectedCellId);
                  setGameState(newState);
                  setShowQuantumModal(false);
                  setQuantumSelectedCellId(null);
                  // 落地後可能進入 buying / fate 等 phase
                  if (newState.phase === 'buying' && !isCurrentAI(newState)) {
                    setShowBuyModal(true);
                  }
                }}
              >
                確認跳躍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 出售道具彈窗 */}
      {showSellItemModal && gameState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
            backdropFilter: 'blur(4px)',
            animation: 'fade-in 0.2s ease-out',
          }}
          onClick={() => setShowSellItemModal(false)}
        >
          <div
            className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
            style={{
              border: '1px solid #f59e0b',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(245, 158, 11, 0.05)',
              animation: 'float-up 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <div>
                <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: 'rgba(245, 158, 11, 0.7)' }}>
                  職業技能 / PROFESSION
                </div>
                <h2 className="text-xl font-cyber tracking-wider" style={{ color: '#f59e0b', textShadow: '0 0 8px rgba(245, 158, 11, 0.5)' }}>
                   出售道具
                </h2>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  剩餘 {3 - (currentPlayer.itemSellCount ?? 0)} / 3 次
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSellItemModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 overflow-y-auto flex-1 space-y-4">
              {/* 步驟1：選擇目標玩家 */}
              <div>
                <div className="text-xs font-cyber mb-2" style={{ color: '#f59e0b' }}>
                  ① 選擇買家
                </div>
                <div className="flex flex-wrap gap-2">
                  {gameState.players
                    .filter((p: PlayerState) => p.playerIndex !== gameState.currentPlayerIndex && !p.isBankrupt)
                    .map((p: PlayerState) => (
                      <button
                        key={p.playerIndex}
                        type="button"
                        onClick={() => setSellTargetIndex(p.playerIndex)}
                        className="px-3 py-1.5 rounded text-xs font-cyber transition-all"
                        style={{
                          backgroundColor: 'var(--bg-mid)',
                          border: `1px solid ${sellTargetIndex === p.playerIndex ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                          color: PLAYER_COLOR_HEX[p.color],
                          boxShadow: sellTargetIndex === p.playerIndex ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                </div>
              </div>
              {/* 步驟2：選擇道具 */}
              <div>
                <div className="text-xs font-cyber mb-2" style={{ color: '#f59e0b' }}>
                  ② 選擇道具
                </div>
                {currentPlayer.items.length === 0 ? (
                  <div className="text-xs text-center py-3" style={{ color: 'var(--text-secondary)' }}>
                    你沒有可出售的道具
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {currentPlayer.items.map((item: ItemState) => {
                      const config = ITEMS[item.type];
                      const isSelected = sellSelectedItemId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSellSelectedItemId(item.id)}
                          className="p-2 rounded text-left transition-all"
                          style={{
                            backgroundColor: 'var(--bg-mid)',
                            border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: isSelected ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
                          }}
                        >
                          <div className="text-xs font-cyber" style={{ color: isSelected ? '#f59e0b' : 'var(--text-primary)' }}>
                            {config?.name ?? item.type}
                          </div>
                          <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                            原價：{config?.price ?? 0} 元
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* 步驟3：輸入價格 */}
              <div>
                <div className="text-xs font-cyber mb-2" style={{ color: '#f59e0b' }}>
                  ③ 設定價格（0 - 5000）
                </div>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (Number.isNaN(val)) {
                      setSellPrice(0);
                    } else {
                      setSellPrice(Math.max(0, Math.min(5000, val)));
                    }
                  }}
                  min={0}
                  max={5000}
                  className="w-full px-3 py-2 rounded text-sm font-cyber"
                  style={{
                    backgroundColor: 'var(--bg-mid)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <button
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                onClick={() => setShowSellItemModal(false)}
              >
                取消
              </button>
              <button
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                style={{
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
                }}
                disabled={
                  sellTargetIndex < 0
                  || sellSelectedItemId === null
                  || sellPrice < 0
                  || sellPrice > 5000
                }
                onClick={() => {
                  if (sellTargetIndex < 0 || sellSelectedItemId === null || !gameState) return;
                  const newState = sellItemToPlayer(
                    gameState,
                    gameState.currentPlayerIndex,
                    sellTargetIndex,
                    sellSelectedItemId,
                    sellPrice,
                  );
                  setGameState(newState);
                  setShowSellItemModal(false);
                  setSellTargetIndex(-1);
                  setSellSelectedItemId(null);
                  setSellPrice(100);
                }}
              >
                確認出售
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 貸款彈窗 */}
      {gameState && gameStarted && gameState.winner === null && (
        <LoanModal
          open={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          playerIndex={gameState.currentPlayerIndex}
          currentLoan={currentPlayer.loan ?? 0}
          playerMoney={currentPlayer.money}
          onTakeLoan={handleTakeLoan}
          onRepayLoan={handleRepayLoan}
        />
      )}

      {/* 存款彈窗 */}
      {gameState && gameStarted && gameState.winner === null && (
        <BankModal
          open={showBankModal}
          onClose={() => setShowBankModal(false)}
          playerIndex={gameState.currentPlayerIndex}
          currentSavings={currentPlayer.savings ?? 0}
          playerMoney={currentPlayer.money}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          gameState={gameState}
          onBuyDerivative={handleBuyDerivative}
          onSettleDerivative={handleSettleDerivative}
        />
      )}

      {/* 債券彈窗 */}
      {gameState && gameStarted && gameState.winner === null && (
        <BondModal
          open={showBondModal}
          onClose={() => setShowBondModal(false)}
          playerIndex={gameState.currentPlayerIndex}
          bonds={gameState.bonds ?? []}
          players={gameState.players}
          playerMoney={currentPlayer.money}
          onIssue={handleIssueBond}
          onSubscribe={handleSubscribeBond}
        />
      )}

      {/* 迷你游戏弹窗 */}
      {gameState.pendingMiniGame && isMyTurn && (
        <MiniGameModal
          open={!!gameState.pendingMiniGame && !gameState.pendingMiniGame.finished}
          gameState={gameState}
          playerIndex={gameState.pendingMiniGame.playerIndex}
          miniGameState={gameState.pendingMiniGame}
          onAction={handleMiniGameAction}
          onClose={() => {
            if (gameState.pendingMiniGame?.finished) {
              setGameState((prev) => prev ? { ...prev, pendingMiniGame: null } : prev);
            }
          }}
        />
      )}

      {/* 成就殿堂弹窗 */}
      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        unlockedAchievements={unlockedAchievements}
      />

      {/* 成就解锁 Toast */}
      {toastAchievement && (
        <AchievementToast
          achievementId={toastAchievement}
          onClose={handleToastClose}
        />
      )}

       {/* 遊戲結束彈窗（簡版，只在結算面板關閉時顯示） */}
      {showEndModal && winner && !showStatsPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="cyber-card border-neon-cyan p-6 md:p-8 max-w-md w-full text-center">
            <h2 className="text-neon-pink font-cyber text-2xl md:text-3xl mb-4 pulse-glow">
               遊戲結束
            </h2>
            <div className="text-neon-cyan font-cyber text-xl md:text-2xl mb-2">
               {gameState.mode === 'twin_strike' && winner.teamId && gameState.teams?.[winner.teamId]
                 ? `${gameState.teams[winner.teamId].name} 獲勝`
                 : winner.name}
            </div>
            <div className="text-text-secondary text-sm mb-4">
              {gameState.lightningMode
                ? '按總資產排名，取得最終勝利！'
                : gameState.resourceMode
                ? '資源爭奪取勝！'
                : gameState.teamDeathmatchMode
                ? '團隊死鬥勝利！'
                : gameState.darknetMode
                ? '暗網對局勝利！'
                : gameState.mode === 'stock_frenzy'
                ? '股票持倉市值最高，股市狂潮稱霸！'
                : gameState.mode === 'black_market_race'
                ? '資產連同道具總值最高，軍火賽封王！'
                : gameState.mode === 'twin_strike'
                ? '雙子星陣營戰勝利，隊友共享榮耀！'
                : '取得最終勝利！'}
            </div>

            {/* 連鎖破產列表 */}
            {gameState.bankruptcyList && gameState.bankruptcyList.length > 0 && (
              <div
                className="mb-6 p-3 rounded-lg text-left"
                style={{
                  backgroundColor: 'rgba(255, 77, 109, 0.05)',
                  border: '1px solid rgba(255, 77, 109, 0.2)',
                }}
              >
                <div
                  className="text-xs font-cyber tracking-wider mb-2"
                  style={{ color: 'var(--red)', textShadow: '0 0 6px var(--red)' }}
                >
                   破產順序
                </div>
                <div className="space-y-1">
                  {gameState.bankruptcyList.map((idx, i) => {
                    const p = gameState.players[idx];
                    return (
                      <div
                        key={idx}
                        className="text-xs flex items-center gap-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span className="font-cyber w-5">#{i + 1}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: PLAYER_COLOR_HEX[p?.color ?? 'red'],
                            boxShadow: `0 0 4px ${PLAYER_COLOR_HEX[p?.color ?? 'red']}`,
                          }}
                        />
                         <span>{p?.name ?? '未知玩家'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center flex-wrap mb-3">
              <button onClick={handleRestart} className="cyber-btn px-4 py-2 text-sm">
                 再來一局
              </button>
              <button onClick={handleBackToMenu} className="cyber-btn cyber-btn-pink px-4 py-2 text-sm">
                 返回主選單
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                // 從 localStorage 取得最新回放（useAutoReplay 已自動保存）
                const replays = loadReplays();
                const latest = replays[0];
                if (latest) {
                  const id = uploadReplay(latest);
                  setShareId(id);
                } else if (gameState) {
                  // 若無保存的回放，構造一個基礎版本
                  const basicReplay = {
                    id: `replay_end_${Date.now()}`,
                    gameMode: mode,
                    players: gameState.players.map((p) => ({
                      name: p.name,
                      color: p.color,
                    })),
                    log: [],
                    finalState: gameState,
                    createdAt: new Date().toISOString(),
                    duration: 0,
                    winner: gameState.winner !== null ? gameState.players[gameState.winner]?.name : undefined,
                    totalTurns: gameState.totalTurns,
                  };
                  const id = uploadReplay(basicReplay);
                  setShareId(id);
                }
                setShowShareModal(true);
              }}
              className="cyber-btn w-full py-2 text-sm flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--pink)',
                color: 'var(--pink)',
                boxShadow: '0 0 8px rgba(255, 0, 255, 0.2)',
              }}
            >
               <span className="font-cyber tracking-wide">分享回放</span>
            </button>
          </div>
        </div>
      )}

      {/* 分享回放彈窗 */}
      <ReplayShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareId={shareId}
      />

      {/* v3：模式規則說明彈窗（賽中可隨時查看） */}
      {gameState && (
        <ModeRulesModal
          open={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          mode={gameState.mode}
        />
      )}

      {/* 游戏统计面板 */}
      <StatsPanel
        isOpen={showStatsPanel}
        onClose={() => setShowStatsPanel(false)}
        stats={gameStats}
        isFinal={gameState?.phase === 'ended'}
        onBackToMenu={handleBackToMenu}
        humanPlayerIndex={isAIGame ? 0 : undefined}
      />

      {/* 新手教学浮层 */}
      {tutorialVisible && tutorial.currentStepConfig && (
        <TutorialOverlay
          steps={TUTORIAL_STEPS}
          currentStep={tutorial.currentStep}
          onNext={tutorial.nextStep}
          onPrev={tutorial.prevStep}
          onSkip={tutorial.skipTutorial}
          onClose={tutorial.closeTutorial}
        />
      )}

      {/* 世界觀系統面板 */}
      {gameState && showWorldviewPanel && (
        <WorldviewSystemsPanel
          gameState={gameState}
          playerIndex={gameState.currentPlayerIndex}
          onClose={() => setShowWorldviewPanel(false)}
          onDeclareWar={handleDeclareWar}
          onMakePeace={handleMakePeace}
          onSendSpy={handleSendSpy}
          onGatherIntel={handleGatherIntel}
          onCounterSpy={handleCounterSpy}
          onToggleRobotProxy={handleToggleRobotProxy}
          onUseTimeTravel={handleUseTimeTravel}
          onTriggerParallelWorld={handleTriggerParallelWorld}
          onEquipMount={handleEquipMount}
          onBringPet={handleBringPet}
          onUpgradePet={handleUpgradePet}
        />
      )}

      {/* AI 對手預判提示 */}
      {isAIGame && gameState && (
        <AIPredictionHint
          gameState={gameState}
          humanPlayerIndex={0}
        />
      )}

      {/* 導師指導卡片（玩家模式） */}
      {!isSpectator && gameState && (
        <MentorCard
          playerIndex={0}
          playerNames={playerNames}
        />
      )}

      {/* 全局聊天按鈕 */}
      <button
        type="button"
        onClick={() => setShowGlobalChat(true)}
        className="fixed z-40 cyber-btn w-11 h-11 flex items-center justify-center p-0"
        style={{
          right: '16px',
          top: '80px',
          borderColor: 'var(--cyan)',
          color: 'var(--cyan)',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          display: showGlobalChat ? 'none' : 'flex',
        }}
        title="聊天"
      >
        <MessageCircle size={18} />
      </button>

      {/* 全局聊天面板 */}
      <GlobalChatPanel
        open={showGlobalChat}
        onClose={() => setShowGlobalChat(false)}
        currentUserId={`game_player_0`}
        currentUserName={playerNames[0] || '玩家1'}
        showQuickPhrases
        anchorSide="right"
      />
      {gameState && (
        <DevToolsPanel
          gameState={gameState}
          onChange={setGameState}
          onForceFate={() => setShowFateModal(true)}
          onForceChance={() => setShowChanceModal(true)}
        />
      )}

      {/* 次級系統分組抽屜（收納金融/成長/道具/世界觀/存檔等） */}
      <SystemMenuSheet
        open={showSystemMenu}
        onClose={() => setShowSystemMenu(false)}
        sections={systemMenuSections}
      />
    </div>
  );
};

export default GamePage;
