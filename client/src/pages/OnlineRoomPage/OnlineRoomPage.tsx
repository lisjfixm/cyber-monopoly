import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Users, Copy, Crown, LogOut, WifiOff, AlertTriangle } from 'lucide-react';

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
import StatsPanel from '@client/src/components/game/StatsPanel';
import ChatPanel from '@client/src/components/game/ChatPanel';
import ChatButton from '@client/src/components/game/ChatButton';
import VoiceControl from '@client/src/components/game/VoiceControl';
import DanmakuLayer from '@client/src/components/game/DanmakuLayer';
import type { DanmakuMessage as DanmakuMsg } from '@client/src/components/game/DanmakuLayer';
import SpectatorSidebar from '@client/src/components/game/SpectatorSidebar';
import DanmakuInput from '@client/src/components/game/DanmakuInput';

import { monopoly } from '@client/src/api';
import { useVoice } from '@client/src/hooks/useVoice';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { useAudio } from '@client/src/hooks/useAudio';
import { CELLS, MODE_LABELS, PLAYER_COLOR_HEX, ACHIEVEMENTS, BAIL_AMOUNT } from '@shared/game-config';
import { getCellPrice, checkAchievements, calculateGameStats } from '@shared/game-engine';
import type {
  RoomState,
  GameState,
  GameMode,
  LogEntry,
  FateCard,
  ChanceCard,
  Profession,
  AuctionState,
  GlobalEventType,
  AchievementId,
  StockSymbol,
  PlayerColor,
} from '@shared/api.interface';

const OnlineRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get('player');

  // 从 URL 或 sessionStorage 读取 myPlayerIndex
  const getInitialPlayerIndex = (): number => {
    if (playerParam !== null) {
      const idx = parseInt(playerParam, 10);
      if (!isNaN(idx) && idx >= 0) return idx;
    }
    try {
      const raw = sessionStorage.getItem('monopoly_online_room');
      if (raw) {
        const parsed = JSON.parse(raw) as { roomCode: string; playerIndex: number };
        if (parsed.roomCode === code && typeof parsed.playerIndex === 'number') {
          return parsed.playerIndex;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  };

  const myPlayerIndex = getInitialPlayerIndex();
  const roomCode = code || '';

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [actionLoading, setActionLoading] = useState(false);
  const [showFateModal, setShowFateModal] = useState(false);
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([1, 1]);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [showPropertyAction, setShowPropertyAction] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeTargetIndex, setTradeTargetIndex] = useState<number | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<Profession | undefined>(undefined);
  const [showStockPanel, setShowStockPanel] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [globalEventToShow, setGlobalEventToShow] = useState<GlobalEventType | null>(null);
  const [toastAchievement, setToastAchievement] = useState<AchievementId | null>(null);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);

  // 聊天相关状态
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nowTick, setNowTick] = useState(Date.now()); // 用于倒计时刷新

  // 断线重连状态
  type ConnectionStatus = 'normal' | 'reconnecting' | 'failed';
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('normal');
  const [retryCount, setRetryCount] = useState(0);
  const [showReconnectToast, setShowReconnectToast] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const consecutiveFailuresRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<number>(1500);

  // 其他玩家断线状态（多人模式：记录每个断线玩家的断线时间）
  const [disconnectMap, setDisconnectMap] = useState<Record<number, number>>({});
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lastTradeIdRef = useRef<number | null>(null);
  const lastGlobalEventRef = useRef<GlobalEventType | null>(null);
  const toastQueueRef = useRef<AchievementId[]>([]);
  const prevLogLengthRef = useRef<number>(0);

  const { unlocked: unlockedAchievements, unlockMany: unlockAchievements } = useAchievements();
  const audio = useAudio();

  // 語音聊天狀態
  const voiceParticipants = roomState?.voiceParticipants ?? [];
  const voicePlayerNames = useMemo<string[]>(() => {
    if (!roomState) return [];
    return (roomState.players ?? []).map((p) => p.name);
  }, [roomState]);
  const voicePlayerColors = useMemo<string[]>(() => {
    if (!roomState) return [];
    return (roomState.players ?? []).map((p) => PLAYER_COLOR_HEX[p.color] || 'var(--cyan)');
  }, [roomState]);

  const voice = useVoice({
    roomCode,
    playerIndex: myPlayerIndex,
    serverVoiceParticipants: voiceParticipants,
    toggleApi: (muted: boolean) =>
      monopoly.monopolyApi.toggleVoice(roomCode, myPlayerIndex, muted),
    onSendMessage: (text: string) => {
      monopoly.monopolyApi.sendChat(roomCode, myPlayerIndex, text, 'voice').catch((err: unknown) => {
        logger.error('語音轉文字發送失敗', { error: String(err) });
      });
      fetchRoom().catch(() => {});
    },
  });

  // 觀戰模式（從 URL 參數判斷）
  const isSpectatorMode = searchParams.get('spectator') === '1';
  const spectatorId = searchParams.get('visitorId') || `spec_${Date.now()}`;
  const spectatorNickname = searchParams.get('nickname') || '觀戰者';
  const [followView, setFollowView] = useState<number | 'free'>('free');

  // 本地彈幕緩存（用於即時顯示自己發送的彈幕）
  const [localDanmaku, setLocalDanmaku] = useState<DanmakuMsg[]>([]);
  const [danmakuColor, setDanmakuColor] = useState<string>('#00f5ff');

  // 彈幕列表（從 roomState 同步 + 本地即時顯示）
  const danmakuMessages = useMemo<DanmakuMsg[]>(() => {
    const serverMsgs: DanmakuMsg[] = (roomState?.danmaku ?? []).map((d) => ({
      id: String(d.id),
      sender: d.sender,
      content: d.content,
      color: d.color,
    }));
    return [...serverMsgs, ...localDanmaku];
  }, [roomState?.danmaku, localDanmaku]);

  // 發送彈幕（實際通過輪詢同步到列表）
  const handleSendDanmaku = useCallback(async (content: string, color?: string): Promise<void> => {
    try {
      await monopoly.monopolyApi.sendDanmaku(
        roomCode,
        spectatorId,
        spectatorNickname,
        content,
        color,
      );
      // 立即本地添加一條，無需等輪詢
      const tempId = `temp_${Date.now()}`;
      setLocalDanmaku((prev: DanmakuMsg[]) => [
        ...prev,
        { id: tempId, sender: spectatorId, content, color },
      ]);
    } catch (err) {
      logger.error('發送彈幕失敗', { error: String(err) });
    }
  }, [roomCode, spectatorId, spectatorNickname, danmakuColor]);

  // 跟隨玩家視角
  const handleFollowPlayer = useCallback(async (playerIndex: number | null): Promise<void> => {
    if (playerIndex === null) {
      setFollowView('free');
    } else {
      setFollowView(playerIndex);
    }
    // 同步到服務端
    if (isSpectatorMode) {
      try {
        await monopoly.monopolyApi.spectatorFollow(roomCode, spectatorId, playerIndex);
      } catch (err) {
        logger.error('設置跟隨視角失敗', { error: String(err) });
      }
    }
  }, [isSpectatorMode, roomCode, spectatorId]);

  // 觀戰者列表
  const spectators = useMemo(() => roomState?.spectators ?? [], [roomState]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFateIdRef = useRef<number | null>(null);
  const lastChanceIdRef = useRef<number | null>(null);

  // 玩家颜色映射（从 roomState.players 提取，供聊天面板使用）
  const playerColors = useMemo<Record<number, PlayerColor>>(() => {
    if (!roomState) return {};
    const map: Record<number, PlayerColor> = {};
    roomState.players.forEach((p, i) => {
      if (p.color) map[i] = p.color;
    });
    return map;
  }, [roomState]);

  // 实时计算游戏统计（必须在所有 early return 之前）
  const gameStats = useMemo(() => {
    const gs = roomState?.gameState;
    if (!gs) return null;
    return calculateGameStats(gs);
  }, [roomState?.gameState]);

  // 计算各玩家地产数量（供 PlayerList 使用）
  const propertyCounts = useMemo<Record<number, number>>(() => {
    const gs = roomState?.gameState;
    if (!gs) return {};
    const counts: Record<number, number> = {};
    for (let i = 0; i < gs.players.length; i++) {
      counts[i] = 0;
    }
    for (const prop of Object.values(gs.properties)) {
      if (prop.owner >= 0 && prop.owner < gs.players.length) {
        counts[prop.owner] = (counts[prop.owner] || 0) + 1;
      }
    }
    return counts;
  }, [roomState?.gameState]);

  // 拉取房间状态（带 playerIndex 心跳 + 断线检测）
  const fetchRoom = useCallback(async () => {
    try {
      const room = await monopoly.monopolyApi.getRoom(roomCode, myPlayerIndex);
      setRoomState(room);
      setError(null);
      consecutiveFailuresRef.current = 0;

      // 从 normal 恢复：清除重连状态
      if (connectionStatus !== 'normal') {
        setConnectionStatus('normal');
        setRetryCount(0);
        pollIntervalRef.current = 1500;
        if (connectionStatus === 'reconnecting') {
          setShowReconnectToast(true);
          if (reconnectToastTimerRef.current) clearTimeout(reconnectToastTimerRef.current);
          reconnectToastTimerRef.current = setTimeout(() => {
            setShowReconnectToast(false);
            reconnectToastTimerRef.current = null;
          }, 2000);
        }
      }

      // 聊天未读计数：优先使用新字段 unreadCount
      const serverUnread = room.unreadCount;
      if (!showChatPanel && typeof serverUnread === 'number') {
        if (serverUnread > unreadChatCount) {
          const diff = serverUnread - unreadChatCount;
          if (diff > 0 && unreadChatCount > 0) {
            audio.playSfx('click');
          }
          setUnreadChatCount(serverUnread);
        } else if (serverUnread === 0 && unreadChatCount > 0) {
          setUnreadChatCount(0);
        }
      }

      // 断线玩家检测（多人模式：使用 disconnectedPlayers 数组）
      const disconnected = room.disconnectedPlayers || [];
      setDisconnectMap((prev: Record<number, number>) => {
        const next: Record<number, number> = { ...prev };
        // 清除已恢复的玩家
        for (const idx of Object.keys(next).map(Number)) {
          if (!disconnected.includes(idx)) {
            delete next[idx];
          }
        }
        // 新增断线玩家
        for (const idx of disconnected) {
          if (next[idx] === undefined) {
            next[idx] = Date.now();
          }
        }
        return next;
      });
    } catch (err) {
      logger.error('获取房间失败', { error: String(err) });

      const errAny = err as { response?: { status?: number } };
      const status = errAny.response?.status;

      // 404 / 403：房间不存在或已被踢，直接停止轮询并显示错误页
      if (status === 404 || status === 403) {
        setError('房间不存在或已解散');
        setRoomNotFound(true);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        return;
      }

      setError('获取房间信息失败，请检查网络连接');
      consecutiveFailuresRef.current += 1;

      // 连续3次失败进入重连状态
      if (consecutiveFailuresRef.current >= 3 && connectionStatus === 'normal') {
        setConnectionStatus('reconnecting');
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [roomCode, myPlayerIndex, connectionStatus, showChatPanel, audio, unreadChatCount]);

  // 初始加载 + 轮询（动态间隔适配重连）
  useEffect(() => {
    if (!roomCode) return;
    fetchRoom();
    pollRef.current = setInterval(fetchRoom, pollIntervalRef.current);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomCode, fetchRoom]);

  // 心跳定时器（每 5 秒一次，用于更新 lastSeen）
  useEffect(() => {
    if (!roomCode) return;
    const doHeartbeat = async () => {
      try {
        await monopoly.monopolyApi.sendHeartbeat(roomCode, myPlayerIndex);
      } catch (err) {
        logger.error('心跳失败', { error: String(err) });
      }
    };
    // 立即发一次
    void doHeartbeat();
    heartbeatRef.current = setInterval(doHeartbeat, 5000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [roomCode, myPlayerIndex]);

  // 倒计时刷新 tick（每 1 秒更新一次用于显示）
  useEffect(() => {
    const hasDisconnect = Object.keys(disconnectMap).length > 0;
    if (!hasDisconnect) {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }
    if (!tickIntervalRef.current) {
      tickIntervalRef.current = setInterval(() => {
        setNowTick(Date.now());
      }, 1000);
    }
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [disconnectMap]);

  // 重连节奏控制：reconnecting 状态下调整重试间隔
  useEffect(() => {
    if (connectionStatus !== 'reconnecting') {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      return;
    }

    const doRetry = () => {
      setRetryCount((prev: number) => {
        const next = prev + 1;
        // 前5次：2秒；6-10次：5秒；超过10次：failed
        if (next <= 5) {
          pollIntervalRef.current = 2000;
        } else if (next <= 10) {
          pollIntervalRef.current = 5000;
        } else {
          setConnectionStatus('failed');
          if (pollRef.current) clearInterval(pollRef.current);
          return next;
        }
        // 重置轮询间隔
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(fetchRoom, pollIntervalRef.current);
        return next;
      });
    };

    // 每次连接状态变为 reconnecting 时启动节奏计时
    const interval = retryCount <= 5 ? 2000 : 5000;
    reconnectTimerRef.current = setTimeout(doRetry, interval);

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [connectionStatus, retryCount, fetchRoom]);

  // 进入房间保存 sessionStorage
  useEffect(() => {
    if (!roomCode) return;
    try {
      sessionStorage.setItem(
        'monopoly_online_room',
        JSON.stringify({
          roomCode,
          playerIndex: myPlayerIndex,
          maxPlayers: roomState?.maxPlayers,
        }),
      );
    } catch {
      // 忽略存储失败
    }
  }, [roomCode, myPlayerIndex, roomState?.maxPlayers]);

  // 游戏结束 / 主动离开时清除 sessionStorage
  const clearRoomSession = useCallback(() => {
    try {
      sessionStorage.removeItem('monopoly_online_room');
    } catch {
      // ignore
    }
  }, []);

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (reconnectToastTimerRef.current) clearTimeout(reconnectToastTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // 聊天面板打开/关闭切换
  const handleToggleChat = useCallback(() => {
    setShowChatPanel((prev: boolean) => !prev);
  }, []);

  // 标记聊天已读
  const handleMarkChatRead = useCallback(async () => {
    try {
      await monopoly.monopolyApi.markChatRead(roomCode, myPlayerIndex);
      setUnreadChatCount(0);
    } catch (err) {
      logger.error('标记已读失败', { error: String(err) });
    }
  }, [roomCode, myPlayerIndex]);

  // 发送聊天消息
  const handleSendChat = useCallback(async (content: string) => {
    try {
      await monopoly.monopolyApi.sendChat(roomCode, myPlayerIndex, content);
      audio.playSfx('click');
      // 立即拉取一次最新状态
      await fetchRoom();
    } catch (err) {
      logger.error('发送聊天消息失败', { error: String(err) });
      setError('消息发送失败');
    }
  }, [roomCode, myPlayerIndex, audio, fetchRoom]);

  // 判定断线对方负（多人模式下暂保留为单对手兼容）
  const handleSurrenderDisconnected = useCallback(async () => {
    try {
      await monopoly.monopolyApi.surrenderDisconnected(roomCode, myPlayerIndex);
      // 立即拉取最新状态
      await fetchRoom();
    } catch (err) {
      logger.error('判定断线对方负失败', { error: String(err) });
      setError('操作失败，请重试');
    }
  }, [roomCode, myPlayerIndex, fetchRoom]);

  // 继续重连
  const handleContinueRetry = useCallback(() => {
    setConnectionStatus('reconnecting');
    setRetryCount(5); // 从第6次节奏开始（5秒间隔）
    consecutiveFailuresRef.current = 3;
    pollIntervalRef.current = 5000;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchRoom, 5000);
  }, [fetchRoom]);

  // 命运卡展示检测
  useEffect(() => {
    const gs = roomState?.gameState;
    if (!gs) return;
    if (gs.phase !== 'fate') return;
    const card = gs.pendingFateCard;
    if (!card) return;
    if (lastFateIdRef.current === card.id) return;
    lastFateIdRef.current = card.id;
    setShowFateModal(true);
    const t = setTimeout(() => setShowFateModal(false), 2000);
    return () => clearTimeout(t);
  }, [roomState?.gameState?.phase, roomState?.gameState?.pendingFateCard?.id]);

  // 机会卡展示检测
  useEffect(() => {
    const gs = roomState?.gameState;
    if (!gs) return;
    if (gs.phase !== 'chance') return;
    const card = gs.pendingChanceCard;
    if (!card) return;
    if (lastChanceIdRef.current === card.id) return;
    lastChanceIdRef.current = card.id;
    setShowChanceModal(true);
    const t = setTimeout(() => setShowChanceModal(false), 2000);
    return () => clearTimeout(t);
  }, [roomState?.gameState?.phase, roomState?.gameState?.pendingChanceCard?.id]);

  // 游戏结束检测
  useEffect(() => {
    if (roomState?.status === 'ended' || roomState?.gameState?.phase === 'ended') {
      setShowEndModal(true);
      setShowStatsPanel(true);
    }
  }, [roomState?.status, roomState?.gameState?.phase]);

  // 收到交易请求检测
  useEffect(() => {
    const gs = roomState?.gameState;
    if (!gs) return;
    const trade = gs.pendingTrade;
    if (!trade) return;
    if (trade.toPlayer !== myPlayerIndex) return;
    if (lastTradeIdRef.current === trade.id) return;
    lastTradeIdRef.current = trade.id;
    setShowTradeModal(true);
  }, [roomState?.gameState?.pendingTrade?.id, myPlayerIndex]);

  // 全局事件展示检测
  useEffect(() => {
    const gs = roomState?.gameState;
    if (!gs) return;
    const event = gs.currentGlobalEvent;
    if (!event) {
      lastGlobalEventRef.current = null;
      return;
    }
    if (lastGlobalEventRef.current === event) return;
    lastGlobalEventRef.current = event;
    setGlobalEventToShow(event);
    audio.playGlobalEvent();
  }, [roomState?.gameState?.currentGlobalEvent, audio]);

  // 成就检测
  useEffect(() => {
    const gs = roomState?.gameState;
    if (!gs) return;
    const newlyUnlocked = checkAchievements(gs, myPlayerIndex);
    if (newlyUnlocked.length === 0) return;
    const newlyStored = unlockAchievements(newlyUnlocked);
    if (newlyStored.length > 0) {
      toastQueueRef.current = [...toastQueueRef.current, ...newlyStored];
      if (!toastAchievement) {
        const next = toastQueueRef.current.shift();
        if (next) {
          setToastAchievement(next);
          audio.playAchievement();
        }
      }
    }
  }, [roomState?.gameState, myPlayerIndex, unlockAchievements, toastAchievement, audio]);

  // 成就 toast 关闭，显示下一个
  const handleAchievementToastClose = useCallback(() => {
    const next = toastQueueRef.current.shift();
    if (next) {
      setToastAchievement(next);
      audio.playAchievement();
    } else {
      setToastAchievement(null);
    }
  }, [audio]);

  // 监听日志变化播放音效
  useEffect(() => {
    const gs = roomState?.gameState;
    if (!gs) {
      prevLogLengthRef.current = 0;
      return;
    }
    const logs = gs.logs;
    const prevLen = prevLogLengthRef.current;
    if (logs.length <= prevLen) {
      prevLogLengthRef.current = logs.length;
      return;
    }
    const newLogs = logs.slice(prevLen);
    prevLogLengthRef.current = logs.length;

    for (const log of newLogs) {
      const txt = log.text;
      if (log.type === 'player1' || log.type === 'player2') {
        if (txt.includes('掷出')) {
          audio.playDiceRoll();
        } else if (txt.includes('购得') || txt.includes('购买')) {
          audio.playBuy();
        } else if (txt.includes('支付过路费')) {
          audio.playToll();
        } else if (txt.includes('进入') && txt.includes('禁闭区')) {
          audio.playDetention();
        } else if (txt.includes('出狱') || txt.includes('释放')) {
          audio.playRelease();
        } else if (txt.includes('建造') || txt.includes('升级')) {
          audio.playBuild();
        } else if (txt.includes('抵押') || txt.includes('赎回')) {
          audio.playMortgage();
        }
      } else if (log.type === 'fate') {
        audio.playFateCard();
      } else if (log.type === 'chance') {
        audio.playChanceCard();
      } else if (log.type === 'trade' && txt.includes('完成')) {
        audio.playTrade();
      } else if (log.type === 'auction') {
        audio.playAuction();
      } else if (log.type === 'system' && txt.includes('破产')) {
        audio.playBankruptcy();
      }
    }
  }, [roomState?.gameState?.logs.length, roomState?.gameState, audio]);

  // 开始游戏
  const handleStartGame = async () => {
    if (!isHost) return;
    if (actionLoading) return;
    if (!roomState) return;
    audio.init();
    audio.startBGM();
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.startGame(roomCode, myPlayerIndex, selectedMode);
      setRoomState(room);
    } catch (err) {
      logger.error('開始遊戲失敗', { error: String(err) });
      setError('開始遊戲失敗，請重試');
    } finally {
      setActionLoading(false);
    }
  };

  // 掷骰子
  const handleRollDice = async () => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (roomState.gameState.currentPlayerIndex !== myPlayerIndex) return;
    if (roomState.gameState.phase !== 'rolling') return;

    audio.init();
    audio.startBGM();
    setActionLoading(true);
    setIsRolling(true);
    setDiceValues([
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ]);
    try {
      const room = await monopoly.monopolyApi.rollDice(roomCode, myPlayerIndex);
      setRoomState(room);
      if (room.gameState?.lastDiceValues) {
        setDiceValues(room.gameState.lastDiceValues);
      }
    } catch (err) {
      logger.error('掷骰子失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
      setIsRolling(false);
    }
  };

  const handlePayBail = async () => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (roomState.gameState.currentPlayerIndex !== myPlayerIndex) return;
    if (roomState.gameState.phase !== 'rolling') return;
    const player = roomState.gameState.players[myPlayerIndex];
    if (!player?.isInDetention) return;
    if (player.money < BAIL_AMOUNT) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.payBail(roomCode, myPlayerIndex);
      setRoomState(room);
      setError(`支付 ${BAIL_AMOUNT} 元保釋金，當即獲釋`);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setError(null);
        errorTimerRef.current = null;
      }, 2000);
    } catch (err) {
      logger.error('保釋失敗', { error: String(err) });
      setError('保釋失敗，請重試');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiceComplete = () => {
    // 骰子动画结束后的回调（联机模式棋子移动由服务器状态同步驱动）
  };

  // 购买决策
  const handleBuy = async (buy: boolean) => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;

    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.buyProperty(roomCode, myPlayerIndex, buy);
      setRoomState(room);
    } catch (err) {
      logger.error('购买操作失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 地块点击
  const handleCellClick = (cellId: number) => {
    if (!roomState?.gameState) return;
    if (!isMyTurn) return;
    if (roomState.gameState.phase !== 'rolling') return;
    const prop = roomState.gameState.properties[cellId];
    if (!prop || prop.owner !== myPlayerIndex) return;
    setSelectedCellId(cellId);
    setShowPropertyAction(true);
  };

  // 建造房屋
  const handleBuild = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.buildHouse(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error('建造失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 拆除建筑
  const handleDemolish = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.demolishBuilding(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error('拆除失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 抵押地块
  const handleMortgage = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.mortgageProperty(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error('抵押失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 赎回地块
  const handleRedeem = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.redeemProperty(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error('赎回失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyInsurance = async () => {
    if (actionLoading || selectedCellId === null) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.buyInsurance(roomCode, myPlayerIndex, selectedCellId);
      setRoomState(room);
    } catch (err) {
      logger.error('购买保险失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 发起交易（多人模式需要选择目标）
  const handleOpenTrade = () => {
    if (!roomState?.gameState) return;
    setTradeTargetIndex(null);
    setShowTradeModal(true);
  };

  const handleSelectTradeTarget = (targetIndex: number) => {
    setTradeTargetIndex(targetIndex);
  };

  const handleProposeTrade = async (given: number[], received: number[], money: number) => {
    if (actionLoading || tradeTargetIndex === null) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.proposeTrade(
        roomCode,
        myPlayerIndex,
        tradeTargetIndex,
        given,
        received,
        money,
      );
      setRoomState(room);
      setShowTradeModal(false);
      setTradeTargetIndex(null);
    } catch (err) {
      logger.error('发起交易失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 接受交易
  const handleAcceptTrade = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.respondTrade(roomCode, myPlayerIndex, true);
      setRoomState(room);
      setShowTradeModal(false);
    } catch (err) {
      logger.error('接受交易失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 拒绝交易
  const handleRejectTrade = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.respondTrade(roomCode, myPlayerIndex, false);
      setRoomState(room);
      setShowTradeModal(false);
    } catch (err) {
      logger.error('拒绝交易失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 选择职业
  const handleSelectProfession = async () => {
    if (actionLoading || !selectedProfession) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.selectProfession(
        roomCode,
        myPlayerIndex,
        selectedProfession,
      );
      setRoomState(room);
    } catch (err) {
      logger.error('选择职业失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 发起拍卖
  const handleStartAuction = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.startAuction(roomCode, myPlayerIndex);
      setRoomState(room);
    } catch (err) {
      logger.error('发起拍卖失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 拍卖出价
  const handleAuctionBid = async (bidAmount: number) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.auctionBid(roomCode, myPlayerIndex, bidAmount);
      setRoomState(room);
    } catch (err) {
      logger.error('拍卖出价失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 拍卖放弃
  const handleAuctionPass = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.auctionPass(roomCode, myPlayerIndex);
      setRoomState(room);
    } catch (err) {
      logger.error('放弃拍卖失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 买入股票
  const handleBuyStock = async (symbol: StockSymbol, quantity: number) => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (!isMyTurn) return;
    if (roomState.gameState.phase === 'ended') return;

    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.buyStock(roomCode, myPlayerIndex, symbol, quantity);
      setRoomState(room);
    } catch (err) {
      logger.error('买入股票失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 卖出股票
  const handleSellStock = async (symbol: StockSymbol, quantity: number) => {
    if (actionLoading) return;
    if (!roomState?.gameState) return;
    if (!isMyTurn) return;
    if (roomState.gameState.phase === 'ended') return;

    setActionLoading(true);
    try {
      const room = await monopoly.monopolyApi.sellStock(roomCode, myPlayerIndex, symbol, quantity);
      setRoomState(room);
    } catch (err) {
      logger.error('卖出股票失败', { error: String(err) });
      setError('操作失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 复制房间码
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopySuccess(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  const handleBackToMenu = async () => {
    try {
      if (roomCode && myPlayerIndex !== undefined) {
        await monopoly.monopolyApi.leaveRoom(roomCode, myPlayerIndex);
      }
    } catch (e) {
      // 忽略 leave 失败，仍要跳转
    }
    clearRoomSession();
    navigate('/');
  };

  // 检测是否为重连进入
  const isReconnectEntry = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('monopoly_online_room');
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { roomCode: string; playerIndex: number };
      return parsed.roomCode === roomCode && parsed.playerIndex === myPlayerIndex;
    } catch {
      return false;
    }
  }, [roomCode, myPlayerIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-neon-cyan pulse-glow text-xl font-cyber">
          {isReconnectEntry ? '正在重连...' : '连接中...'}
        </div>
      </div>
    );
  }

  if (error && !roomState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="text-neon-pink font-cyber text-xl">{error}</div>
        <button onClick={handleBackToMenu} className="cyber-btn px-6 py-2">
          返回主選單
        </button>
      </div>
    );
  }

  if (!roomState) return null;

  const gs = roomState.gameState;
  const isHost = myPlayerIndex === roomState.hostIndex;
  const isWaiting = roomState.status === 'waiting';
  const isPlaying = roomState.status === 'playing' && gs !== null;
  const isEnded = roomState.status === 'ended' || gs?.phase === 'ended';

  const myPlayer = gs ? gs.players[myPlayerIndex] : null;
  const currentPlayer = gs ? gs.players[gs.currentPlayerIndex] : null;
  const isMyTurn = gs && gs.currentPlayerIndex === myPlayerIndex;

  const tradeMode: 'selectTarget' | 'propose' | 'respond' = (() => {
    if (gs?.pendingTrade && gs.pendingTrade.toPlayer === myPlayerIndex) return 'respond';
    if (tradeTargetIndex !== null) return 'propose';
    return 'selectTarget';
  })();

  // 其他断线玩家（排除自己）
  const otherDisconnected = Object.entries(disconnectMap)
    .map(([idx, time]) => ({ index: Number(idx), time }))
    .filter((d) => d.index !== myPlayerIndex);
  const hasOtherDisconnect = otherDisconnected.length > 0;

  // 等待中界面
  if (isWaiting) {
    const playerCount = (roomState.players ?? []).length;
    const maxPlayers = roomState.maxPlayers || 2;
    const canStart = isHost && playerCount >= 2;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <ChatButton
            hasNewMessage={unreadChatCount > 0}
            messageCount={unreadChatCount}
            onClick={handleToggleChat}
          />
          <VoiceControl
            currentPlayerIndex={myPlayerIndex}
            voiceParticipants={voiceParticipants}
            playerNames={voicePlayerNames}
            playerColors={voicePlayerColors}
            isMuted={voice.muted}
            volume={voice.volume}
            onToggleMute={voice.toggleMute}
            onVolumeChange={voice.setVolume}
            sttEnabled={voice.sttEnabled}
            isListening={voice.isListening}
            sttSupported={voice.sttSupported}
            onToggleStt={voice.toggleStt}
          />
          <SettingsButton onFirstInteract={() => { audio.init(); audio.startBGM(); }} />
          <VolumeControl onFirstInteract={() => { audio.init(); audio.startBGM(); }} />
        </div>
        <div className="cyber-card border-neon-cyan p-6 md:p-8 w-full max-w-md">
          <h1 className="text-neon-pink font-cyber text-2xl md:text-3xl text-center mb-2 pulse-glow">
            联机房间
          </h1>
          <p className="text-text-secondary text-sm text-center mb-6">
            {isHost ? '等待玩家加入...' : '等待房主開始遊戲...'}
          </p>

          {/* 房间码 */}
          <div className="mb-6">
            <div className="text-text-secondary text-xs font-cyber mb-2 flex items-center justify-between">
              <span>房间码</span>
              <span className="text-neon-cyan">
                {playerCount}/{maxPlayers} 人
              </span>
            </div>
            <div
              onClick={handleCopyCode}
              className="cyber-card border-neon-pink p-4 text-center cursor-pointer hover:shadow-neon-pink transition-all flex items-center justify-center gap-3"
            >
              <div className="text-neon-pink font-cyber text-3xl md:text-4xl tracking-[0.3em] pulse-glow">
                {roomCode}
              </div>
              <Copy className="w-4 h-4 text-text-muted" />
            </div>
            <div className="text-text-muted text-xs mt-2 text-center">
              {copySuccess ? '已複製' : '點擊複製房間碼'}
            </div>
          </div>

          {/* 玩家列表 */}
          <div className="mb-6">
            <div className="text-text-secondary text-xs font-cyber mb-2 flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>玩家列表 ({playerCount}/{maxPlayers})</span>
            </div>
            <div className="space-y-2">
              {(roomState.players ?? []).map((player, idx) => {
                const isHostPlayer = idx === roomState.hostIndex;
                const isMe = idx === myPlayerIndex;
                const colorHex = player.color ? PLAYER_COLOR_HEX[player.color] : 'var(--text-secondary)';
                return (
                  <div
                    key={idx}
                    className="cyber-card p-3 flex items-center justify-between"
                    style={{
                      borderColor: isMe ? colorHex : 'rgba(255,255,255,0.1)',
                      boxShadow: isMe ? `0 0 10px ${colorHex}40` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                        style={{
                          backgroundColor: colorHex,
                          boxShadow: `0 0 8px ${colorHex}`,
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-text-primary text-sm md:text-base flex items-center gap-2">
                          {player.name}
                          {isMe && <span className="text-xs text-neon-cyan">（我）</span>}
                        </span>
                        {!player.isOnline && (
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <WifiOff className="w-3 h-3" /> 離線
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isHostPlayer && (
                        <span className="text-xs font-cyber flex items-center gap-1" style={{ color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.5)' }}>
                          <Crown className="w-3 h-3" />
                          房主
                        </span>
                      )}
                      {player.ready && !isHostPlayer && (
                        <span className="text-neon-green text-xs font-cyber">已就绪</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* 空座位占位 */}
              {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="cyber-card p-3 flex items-center justify-center border-dashed opacity-50"
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <span className="text-text-muted text-sm">等待加入...</span>
                </div>
              ))}
            </div>
          </div>

          {/* 房主：模式选择 + 开始按钮 */}
          {isHost && (
            <div className="mb-4">
              <div className="text-text-secondary text-xs font-cyber mb-2">遊戲模式</div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(['classic', 'fast', 'crazy'] as GameMode[]).map((mode) => {
                  const selected = selectedMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className="cyber-btn py-2 text-xs md:text-sm transition-all"
                      style={{
                        borderColor: selected ? 'var(--pink)' : 'rgba(255,255,255,0.15)',
                        color: selected ? 'var(--pink)' : 'var(--text-secondary)',
                        background: selected ? 'rgba(255, 107, 157, 0.08)' : 'transparent',
                      }}
                    >
                      {MODE_LABELS[mode] || mode}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleStartGame}
                disabled={!canStart || actionLoading}
                className="cyber-btn cyber-btn-pink w-full py-3 font-cyber tracking-wider"
              >
                {actionLoading
                  ? '加载中...'
                  : canStart
                    ? '開始遊戲'
                    : playerCount < 2
                      ? '等待至少2名玩家'
                      : '開始遊戲'}
              </button>
            </div>
          )}

          {/* 客人：等待提示 */}
          {!isHost && (
            <div className="text-center text-text-secondary text-sm mb-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-cyan pulse-glow animate-pulse" />
              房主正在准备，请耐心等待...
            </div>
          )}

          <button onClick={handleBackToMenu} className="cyber-btn w-full py-2 text-sm flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            {isHost ? '返回主選單' : '退出房间'}
          </button>

          {error && (
            <div className="mt-4 text-neon-pink text-xs text-center">{error}</div>
          )}
        </div>

        {/* 聊天面板 */}
        <ChatPanel
          isOpen={showChatPanel}
          onToggle={handleToggleChat}
          messages={roomState.messages || []}
          myPlayerIndex={myPlayerIndex}
          unreadCount={unreadChatCount}
          onSend={handleSendChat}
          onMarkRead={handleMarkChatRead}
          disabled={isEnded}
          playerColors={playerColors}
        />
      </div>
    );
  }

  // ==================== 游戏中 / 已结束界面 ====================
  const currentCell = gs && currentPlayer ? CELLS[currentPlayer.position] : null;
  const buyPrice = gs && myPlayer ? getCellPrice(myPlayer.position, gs.mode) : 0;
  const canAffordBuy = myPlayer ? myPlayer.money >= buyPrice : false;
  const showBuyModal = gs?.phase === 'buying' && isMyTurn;
  const showAuction = gs?.phase === 'auction' && gs.auction?.active;
  const auctionState: AuctionState | null = gs?.auction && gs.phase === 'auction' ? gs.auction : null;
  const auctionCellId = auctionState?.cellId ?? 0;
  const auctionCellName = auctionState ? CELLS[auctionCellId]?.name || '' : '';
  const auctionCellPrice = auctionState ? getCellPrice(auctionCellId, gs.mode) : 0;
  // activeBidderIndex 是 activeBidders 数组中的索引，需要转换为玩家索引
  const auctionActiveBidderPlayerIndex = auctionState
    ? auctionState.activeBidders[auctionState.activeBidderIndex] ?? 0
    : 0;
  const winner = gs?.winner !== null && gs?.winner !== undefined
    ? gs.players[gs.winner]
    : null;

  // (moved up before loading return)

  return (
    <div className="min-h-screen p-3 md:p-6 flex flex-col relative">
      {/* 右上角控制区 */}
      <div className="absolute top-3 right-3 md:top-6 md:right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => setShowPlayerList((p) => !p)}
          className="cyber-btn p-2 flex items-center gap-1 text-xs"
          style={{
            borderColor: 'rgba(0, 255, 255, 0.3)',
            color: 'var(--cyan)',
            background: 'rgba(0, 255, 255, 0.05)',
          }}
        >
          <Users className="w-4 h-4" />
          <span className="hidden md:inline font-cyber">玩家</span>
        </button>
        <ChatButton
          hasNewMessage={unreadChatCount > 0}
          messageCount={unreadChatCount}
          onClick={handleToggleChat}
        />
        <VoiceControl
          currentPlayerIndex={myPlayerIndex}
          voiceParticipants={voiceParticipants}
          playerNames={voicePlayerNames}
          playerColors={voicePlayerColors}
          isMuted={voice.muted}
          volume={voice.volume}
          onToggleMute={voice.toggleMute}
          onVolumeChange={voice.setVolume}
        />
        <SettingsButton onFirstInteract={() => { audio.init(); audio.startBGM(); }} />
        <VolumeControl onFirstInteract={() => { audio.init(); audio.startBGM(); }} />
      </div>

      {/* 桌面端左侧玩家列表 */}
      <div className="hidden lg:block fixed left-4 top-20 w-56 z-20">
        {gs && (
          <PlayerList
            players={gs.players}
            currentPlayerIndex={gs.currentPlayerIndex}
            myPlayerIndex={myPlayerIndex}
            propertyCounts={propertyCounts}
          />
        )}
      </div>

      {/* 移动端玩家列表弹层 */}
      {showPlayerList && gs && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 flex items-start justify-center pt-16 p-4" onClick={() => setShowPlayerList(false)}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <PlayerList
              players={gs.players}
              currentPlayerIndex={gs.currentPlayerIndex}
              myPlayerIndex={myPlayerIndex}
              propertyCounts={propertyCounts}
            />
          </div>
        </div>
      )}

      {/* 棋盘 */}
      <div className="flex-1 flex flex-col items-center justify-center mb-3 md:mb-4 lg:ml-60">
        {/* 觀戰中標籤 */}
        {isSpectatorMode && gs && (
          <div className="mb-3">
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

        <div className="w-full max-w-[560px] aspect-square relative">
          {gs && (
            <Board
              gameState={gs}
              onCellClick={isSpectatorMode ? undefined : handleCellClick}
            />
          )}
          {isSpectatorMode && (
            <DanmakuLayer
              messages={danmakuMessages}
              speed={80}
              maxTracks={6}
              maxVisible={20}
            />
          )}
        </div>

        {/* 彈幕輸入框（觀戰模式） */}
        {isSpectatorMode && (
          <div className="w-full max-w-[560px] mt-3">
            <DanmakuInput
              onSend={handleSendDanmaku}
              placeholder="發送彈幕..."
              selectedColor={danmakuColor}
              onColorChange={setDanmakuColor}
            />
          </div>
        )}
      </div>

      {/* 底部操作区（觀戰模式下禁用操作按鈕） */}
      <div className={`cyber-card p-3 md:p-4 lg:ml-60 ${isSpectatorMode ? 'opacity-60' : ''}`}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-6">
          {/* 我的面板 + 操作 */}
          <div className="flex-1 flex flex-col gap-3">
            {myPlayer && gs && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="text-neon-cyan font-cyber text-sm md:text-base flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: PLAYER_COLOR_HEX[myPlayer.color] || 'var(--cyan)',
                        boxShadow: `0 0 6px ${PLAYER_COLOR_HEX[myPlayer.color] || 'var(--cyan)'}`,
                      }}
                    />
                    {myPlayer.name}（我）
                  </div>
                  <div className="text-text-secondary text-xs md:text-sm">
                     現金 {myPlayer.money}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {gs.phase === 'rolling' && isMyTurn && !isEnded ? (
                    <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
                      <button
                        onClick={handleOpenTrade}
                        disabled={actionLoading}
                        className="cyber-btn px-3 py-2 text-xs md:text-sm"
                        style={{
                          borderColor: 'var(--pink)',
                          color: 'var(--pink)',
                          background: 'rgba(255, 107, 157, 0.08)',
                        }}
                      >
                        交易
                      </button>
                      <button
                        onClick={() => setShowStockPanel(true)}
                        disabled={actionLoading}
                        className="cyber-btn px-3 py-2 text-xs md:text-sm"
                        style={{
                          borderColor: 'hsl(180, 100%, 50%)',
                          color: 'hsl(180, 100%, 50%)',
                          background: 'rgba(0, 255, 255, 0.08)',
                        }}
                      >
                        股票
                      </button>
                      {myPlayer?.isInDetention && (
                        <button
                          onClick={handlePayBail}
                          disabled={actionLoading || (myPlayer?.money ?? 0) < BAIL_AMOUNT}
                          className="cyber-btn px-3 py-2 text-xs md:text-sm"
                          style={{
                            borderColor: 'var(--purple)',
                            color: (myPlayer?.money ?? 0) >= BAIL_AMOUNT ? 'var(--purple)' : 'rgba(160, 120, 255, 0.4)',
                            background: 'rgba(160, 120, 255, 0.08)',
                            opacity: (myPlayer?.money ?? 0) >= BAIL_AMOUNT ? 1 : 0.5,
                            cursor: (myPlayer?.money ?? 0) >= BAIL_AMOUNT ? 'pointer' : 'not-allowed',
                          }}
                        >
                          保釋 {BAIL_AMOUNT}
                        </button>
                      )}
                      <button
                        onClick={handleRollDice}
                        disabled={actionLoading}
                        className="cyber-btn cyber-btn-pink px-4 py-2 text-xs md:text-sm"
                      >
                        {actionLoading
                          ? '操作中...'
                          : myPlayer?.isInDetention
                            ? '监禁摇骰'
                            : '掷骰子'}
                      </button>
                    </div>
                  ) : gs.phase === 'rolling' && !isMyTurn && !isEnded ? (
                    <div className="text-neon-pink text-xs md:text-sm font-cyber pulse-glow">
                      {currentPlayer?.name || '对手'} 思考中...
                    </div>
                  ) : gs.phase === 'buying' && isMyTurn ? (
                    <div className="text-neon-cyan text-xs md:text-sm font-cyber">
                      選擇是否購買
                    </div>
                  ) : gs.phase === 'fate' ? (
                    <div className="text-neon-purple text-xs md:text-sm font-cyber pulse-glow">
                      命運時刻
                    </div>
                  ) : gs.phase === 'chance' ? (
                    <div style={{ color: 'hsl(210, 100%, 60%)' }} className="text-xs md:text-sm font-cyber pulse-glow">
                      機會降臨
                    </div>
                  ) : gs.phase === 'auction' ? (
                    <div className="text-xs md:text-sm font-cyber pulse-glow" style={{ color: '#ffcc00', textShadow: '0 0 8px rgba(255,204,0,0.5)' }}>
                      拍賣中
                    </div>
                  ) : isEnded ? (
                    <div className="text-neon-pink font-cyber">已結束</div>
                  ) : null}
                </div>
              </div>
            )}

            {currentCell && gs && !isEnded && (
              <div className="text-xs md:text-sm text-text-secondary">
                當前位置：
                <span className="text-neon-cyan ml-1">
                  {gs.players[myPlayerIndex]
                    ? CELLS[gs.players[myPlayerIndex].position]?.name
                    : ''}
                </span>
                {gs.lastDiceValues && gs.lastDiceValues[0] > 0 && (
                  <span className="text-text-muted ml-3">
                    上次點數：{gs.lastDiceValues[0]}+{gs.lastDiceValues[1]}={gs.lastDiceValues[0] + gs.lastDiceValues[1]}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowAchievementModal(true)}
                className="self-start text-xs font-cyber tracking-wider transition-colors hover:opacity-80"
                style={{
                  color: 'hsl(45, 100%, 60%)',
                  textShadow: '0 0 6px hsla(45, 100%, 60%, 0.6)',
                }}
              >
                 成就 ({unlockedAchievements.size} / {Object.keys(ACHIEVEMENTS).length})
              </button>
              <button
                onClick={() => setShowStatsPanel(true)}
                className="self-start text-xs font-cyber tracking-wider transition-colors hover:opacity-80"
                style={{
                  color: 'var(--pink)',
                  textShadow: '0 0 6px rgba(255, 107, 157, 0.6)',
                }}
              >
                 統計
              </button>
            </div>
          </div>

          {/* 觀戰者面板（觀戰模式） */}
          {isSpectatorMode && gs && (
            <div className="md:w-72 lg:w-80">
              <SpectatorSidebar
                spectators={spectators.map((s) => ({
                  id: s.id,
                  nickname: s.nickname,
                  following: s.following,
                }))}
                currentView={followView}
                onFollowPlayer={handleFollowPlayer}
                playerNames={roomState?.players.map((p) => p.name) ?? []}
                playerColors={voicePlayerColors}
              />
            </div>
          )}

          {/* 游戏日志 */}
          <div className="md:w-72 lg:w-80 h-32 md:h-40 overflow-hidden">
            {gs && <GameLog logs={gs.logs as LogEntry[]} />}
          </div>
        </div>
      </div>

      {/* 购买弹窗 - 仅自己回合显示操作 */}
      {myPlayer && gs && (
        <BuyModal
          isOpen={!!showBuyModal}
          cellName={CELLS[myPlayer.position]?.name || ''}
          price={buyPrice}
          playerMoney={myPlayer.money}
          canAfford={canAffordBuy && isMyTurn}
          onBuy={() => handleBuy(true)}
          onAuction={handleStartAuction}
          onSkip={() => handleBuy(false)}
        />
      )}

      {/* 职业选择弹窗 */}
      {myPlayer && gs && !myPlayer.profession && (
        <ProfessionSelectModal
          isOpen={isPlaying}
          playerName={myPlayer.name}
          playerColor={myPlayer.color}
          selectedProfession={selectedProfession}
          onSelect={setSelectedProfession}
          onConfirm={handleSelectProfession}
          onClose={() => {}}
          disabled={actionLoading}
        />
      )}

      {/* 拍卖弹窗 */}
      {myPlayer && gs && auctionState && showAuction && (
        <AuctionModal
          isOpen={true}
          auction={auctionState}
          cellName={auctionCellName}
          cellPrice={auctionCellPrice}
          players={gs.players}
          activeBidderIndex={auctionActiveBidderPlayerIndex}
          myPlayerIndex={myPlayerIndex}
          myMoney={myPlayer.money}
          onBid={handleAuctionBid}
          onPass={handleAuctionPass}
          disabled={actionLoading}
        />
      )}

      {/* 地块操作弹窗 */}
      {gs && selectedCellId !== null && (
        <PropertyActionModal
          isOpen={showPropertyAction}
          cellId={selectedCellId}
          gameState={gs}
          playerIndex={myPlayerIndex}
          canBuild={isMyTurn && gs.phase === 'rolling'}
          onBuild={handleBuild}
          onDemolish={handleDemolish}
          onMortgage={handleMortgage}
          onRedeem={handleRedeem}
          onBuyInsurance={handleBuyInsurance}
          onClose={() => setShowPropertyAction(false)}
        />
      )}

      {/* 交易弹窗（多人模式支持选目标） */}
      {gs && (
        <TradeModal
          mode={tradeMode}
          isOpen={showTradeModal}
          gameState={gs}
          playerIndex={myPlayerIndex}
          targetPlayerIndex={tradeTargetIndex ?? undefined}
          onClose={() => {
            setShowTradeModal(false);
            setTradeTargetIndex(null);
          }}
          onSelectTarget={handleSelectTradeTarget}
          onPropose={handleProposeTrade}
          onAccept={handleAcceptTrade}
          onReject={handleRejectTrade}
        />
      )}

      {/* 骰子覆盖层 */}
      <DiceOverlay isRolling={isRolling} values={diceValues} onComplete={handleDiceComplete} />

      {/* 命运卡弹窗 */}
      {gs && gs.pendingFateCard && (
        <FateCardModal
          isOpen={showFateModal}
          card={gs.pendingFateCard as FateCard}
          onClose={() => setShowFateModal(false)}
        />
      )}

      {/* 机会卡弹窗 */}
      {gs && gs.pendingChanceCard && (
        <ChanceCardModal
          isOpen={showChanceModal}
          card={gs.pendingChanceCard as ChanceCard}
          onClose={() => setShowChanceModal(false)}
        />
      )}

      {/* 断线提示条（多人模式） */}
      {hasOtherDisconnect && (
        <div
          className="fixed top-0 left-0 right-0 z-30 py-2 px-4 text-center text-sm font-cyber tracking-wide"
          style={{
            background: 'linear-gradient(90deg, rgba(255,200,0,0.15), rgba(255,200,0,0.25), rgba(255,200,0,0.15))',
            color: 'hsl(45, 100%, 60%)',
            borderBottom: '1px solid rgba(255,200,0,0.3)',
            textShadow: '0 0 6px rgba(255,200,0,0.5)',
          }}
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {otherDisconnected.map((d) => gs.players[d.index]?.name || `玩家${d.index + 1}`).join('、')}
              {' '}断线，等待重连中...
            </span>
          </div>
        </div>
      )}

      {/* 重连中遮罩 */}
      {connectionStatus === 'reconnecting' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="cyber-card border-neon-cyan p-6 md:p-8 max-w-sm w-full text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div
                className="absolute inset-0 rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: 'var(--cyan)',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div
                className="absolute inset-2 rounded-full border-2 border-b-transparent"
                style={{
                  borderColor: 'var(--pink)',
                  borderBottomColor: 'transparent',
                  animation: 'spin 1.5s linear infinite reverse',
                }}
              />
            </div>
            <h2
              className="text-neon-cyan font-cyber text-xl mb-2 pulse-glow"
              style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
            >
              网络中断
            </h2>
            <p className="text-text-secondary text-sm mb-2">正在重连...</p>
            <p className="text-text-muted text-xs">重试次数：{retryCount} / 10</p>
          </div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes reconnectToastIn {
              from { opacity: 0; transform: translate(-50%, -10px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      )}

      {/* 重连失败遮罩 */}
      {connectionStatus === 'failed' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="cyber-card border-neon-pink p-6 md:p-8 max-w-sm w-full text-center">
            <h2
              className="font-cyber text-2xl mb-4 pulse-glow"
              style={{ color: 'var(--pink)', textShadow: '0 0 10px rgba(255, 107, 157, 0.5)' }}
            >
              重连失败
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              网络连接不稳定，请检查网络后重试
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinueRetry}
                className="cyber-btn cyber-btn-pink w-full py-3"
              >
                继续重试
              </button>
              <button
                onClick={handleBackToMenu}
                className="cyber-btn w-full py-2 text-sm"
              >
                返回主選單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 房间不存在遮罩 */}
      {roomNotFound && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="cyber-card border-neon-pink p-6 md:p-8 max-w-sm w-full text-center">
            <h2
              className="font-cyber text-2xl mb-4 pulse-glow"
              style={{ color: 'var(--pink)', textShadow: '0 0 10px rgba(255, 107, 157, 0.5)' }}
            >
              房間不存在
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              房間可能已解散或你已被移出房间
            </p>
            <button
              onClick={handleBackToMenu}
              className="cyber-btn cyber-btn-pink w-full py-3"
            >
              返回主選單
            </button>
          </div>
        </div>
      )}

      {/* 重连成功 toast */}
      {showReconnectToast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 cyber-card px-4 py-2 text-sm font-cyber tracking-wide"
          style={{
            borderColor: 'var(--green)',
            color: 'var(--green)',
            background: 'rgba(0, 255, 150, 0.1)',
            boxShadow: '0 0 12px rgba(0, 255, 150, 0.4)',
            animation: 'reconnectToastIn 0.3s ease-out',
          }}
        >
          已恢復連線
        </div>
      )}

      {/* 游戏结束弹窗 - 仅当统计面板关闭时显示 */}
      {showEndModal && winner && !showStatsPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="cyber-card border-neon-cyan p-6 md:p-8 max-w-md w-full text-center">
            <h2 className="text-neon-pink font-cyber text-2xl md:text-3xl mb-4 pulse-glow">
              遊戲結束
            </h2>
            {myPlayerIndex === gs?.winner ? (
              <>
                <div className="text-neon-green font-cyber text-xl md:text-2xl mb-2 pulse-glow">
                   恭喜獲勝！
                </div>
                <div className="text-text-secondary text-sm mb-6">
                  你取得了最终胜利
                </div>
              </>
            ) : (
              <>
                <div className="text-neon-pink font-cyber text-xl md:text-2xl mb-2">
                   挑戰失敗
                </div>
                <div className="text-text-secondary text-sm mb-6">
                  {winner.name} 取得胜利
                </div>
              </>
            )}
            <button onClick={handleBackToMenu} className="cyber-btn cyber-btn-pink px-8 py-2">
              返回主選單
            </button>
          </div>
        </div>
      )}

      {/* 股票面板 */}
      {gs && myPlayer && (
        <StockPanel
          isOpen={showStockPanel}
          onClose={() => setShowStockPanel(false)}
          stocks={gs.stocks}
          playerStocks={myPlayer.stocks}
          playerMoney={myPlayer.money}
          isMyTurn={!!isMyTurn && gs.phase !== 'ended'}
          onBuy={handleBuyStock}
          onSell={handleSellStock}
        />
      )}

      {/* 全局事件弹窗 */}
      <GlobalEventModal
        isOpen={globalEventToShow !== null}
        eventType={globalEventToShow}
        onClose={() => setGlobalEventToShow(null)}
      />

      {/* 成就面板 */}
      <AchievementModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        unlockedAchievements={unlockedAchievements}
      />

      {/* 成就解锁 toast */}
      {toastAchievement && (
        <AchievementToast
          achievementId={toastAchievement}
          onClose={handleAchievementToastClose}
        />
      )}

      {/* 游戏统计面板 */}
      <StatsPanel
        isOpen={showStatsPanel}
        onClose={() => setShowStatsPanel(false)}
        stats={gameStats}
        isFinal={isEnded}
        onBackToMenu={handleBackToMenu}
      />

      {/* 聊天面板 */}
      <ChatPanel
        isOpen={showChatPanel}
        onToggle={handleToggleChat}
        messages={roomState?.messages || []}
        myPlayerIndex={myPlayerIndex}
        unreadCount={unreadChatCount}
        onSend={handleSendChat}
        onMarkRead={handleMarkChatRead}
        disabled={isEnded}
        playerColors={playerColors}
      />

      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 cyber-card border-neon-pink px-4 py-2 z-40">
          <span className="text-neon-pink text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default OnlineRoomPage;
