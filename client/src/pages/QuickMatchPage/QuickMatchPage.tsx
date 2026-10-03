import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Zap, Users, Clock, Hash, ArrowLeft, Flag, UserX } from 'lucide-react';
import { matchmaking } from '@client/src/api';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import { useAudio } from '@client/src/hooks/useAudio';
import { MODE_LABELS } from '@shared/game-config';
import type { GameMode, MatchStatusResponse } from '@shared/api.interface';
import { isBlocked } from '@client/src/utils/report-block';
import ReportBlockDialogs from './ReportBlockDialogs';

type MatchPhase = 'config' | 'matching' | 'matched' | 'timeout';

interface ModeOption {
  key: GameMode;
  label: string;
  color: string;
  description: string;
}

const MODES: ModeOption[] = [
  { key: 'classic', label: MODE_LABELS.classic, color: 'var(--cyan)', description: '標準規則，穩步經營' },
  { key: 'fast', label: MODE_LABELS.fast, color: 'var(--green)', description: '地價更低，節奏更快' },
  { key: 'crazy', label: MODE_LABELS.crazy, color: 'var(--pink)', description: '命運加倍，瘋狂豪賭' },
];

const PLAYER_COUNTS: number[] = [2, 4, 6];
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_SECONDS = 30;

const QuickMatchPage = () => {
  const navigate = useNavigate();
  const { visitorId, nickname } = usePlayerIdentity();
  const { playSfx } = useAudio();

  const [phase, setPhase] = useState<MatchPhase>('config');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedPlayers, setSelectedPlayers] = useState<number>(2);
  const [error, setError] = useState<string>('');
  const [waitedSeconds, setWaitedSeconds] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [matchedRoomCode, setMatchedRoomCode] = useState<string>('');
  const [matchedPlayerIndex, setMatchedPlayerIndex] = useState<number>(0);
  const [matchedOpponent, setMatchedOpponent] = useState<string>('');

  // 舉報/拉黑彈窗
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [showBlockDialog, setShowBlockDialog] = useState<boolean>(false);

  // 黑名單跳過提示
  const [skipMessage, setSkipMessage] = useState<string>('');

  const pollTimerRef = useRef<number | null>(null);
  const secondTimerRef = useRef<number | null>(null);
  const hasJoinedRef = useRef<boolean>(false);

  const clearTimers = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (secondTimerRef.current !== null) {
      window.clearInterval(secondTimerRef.current);
      secondTimerRef.current = null;
    }
  }, []);

  const leaveQueue = useCallback(async () => {
    if (!visitorId || !hasJoinedRef.current) return;
    try {
      await matchmaking.matchmakingApi.leaveMatch(visitorId);
    } catch (err) {
      logger.warn('leaveMatch failed', err instanceof Error ? err.message : String(err));
    }
    hasJoinedRef.current = false;
  }, [visitorId]);

  const stopMatching = useCallback(async () => {
    clearTimers();
    await leaveQueue();
    setPhase('config');
    setWaitedSeconds(0);
    setQueuePosition(0);
  }, [clearTimers, leaveQueue]);

  // 清理：离开页面时取消匹配
  useEffect(() => {
    return () => {
      clearTimers();
      void leaveQueue();
    };
  }, [clearTimers, leaveQueue]);

  const goToRoom = useCallback((roomCode: string, playerIndex: number) => {
    clearTimers();
    hasJoinedRef.current = false;
    // 存 sessionStorage 供 OnlineRoomPage 读取
    try {
      sessionStorage.setItem(
        'monopoly_online_room',
        JSON.stringify({ roomCode, playerIndex }),
      );
    } catch {
      // ignore
    }
    navigate(`/online/room/${roomCode}?player=${playerIndex}`);
  }, [clearTimers, navigate]);

  const pollStatus = useCallback(async () => {
    if (!visitorId) return;
    try {
      const status: MatchStatusResponse = await matchmaking.matchmakingApi.getMatchStatus(visitorId);

      if (!status.inQueue && !status.matchedRoomCode) {
        // 被移出队列但未匹配（异常）
        setError('配對連線已中斷，請重試');
        setPhase('config');
        clearTimers();
        hasJoinedRef.current = false;
        return;
      }

      setQueuePosition(status.position);
      if (status.waitedSeconds !== undefined) {
        setWaitedSeconds(status.waitedSeconds);
      }

      if (status.matchedRoomCode && status.playerIndex !== null) {
        // 模擬對手暱稱（真實場景由後端返回，這裡用房間號生成模擬）
        const mockOpponent = `玩家${status.matchedRoomCode.slice(-4)}`;

        // #20 黑名單過濾：如果對方在黑名單中，跳過並重新匹配
        if (isBlocked(mockOpponent)) {
          setSkipMessage(`對方在黑名單中，已跳過匹配（${mockOpponent}）`);
          // 短暫顯示提示後繼續輪詢
          window.setTimeout(() => {
            setSkipMessage('');
          }, 2000);
          pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
          return;
        }

        setMatchedRoomCode(status.matchedRoomCode);
        setMatchedPlayerIndex(status.playerIndex);
        setMatchedOpponent(mockOpponent);
        setPhase('matched');
        clearTimers();
        hasJoinedRef.current = false;
        return;
      }

      // 继续轮询
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    } catch (err) {
      logger.warn('getMatchStatus failed', err instanceof Error ? err.message : String(err));
      // 失败后继续轮询
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    }
  }, [visitorId, clearTimers, goToRoom]);

  const startMatching = useCallback(async () => {
    if (!visitorId) {
      setError('玩家身份初始化中，請稍候');
      return;
    }
    if (!nickname) {
      setError('請先設定暱稱');
      return;
    }

    setError('');
    setWaitedSeconds(0);
    setQueuePosition(1);
    setPhase('matching');
    playSfx('click');

    try {
      const result = await matchmaking.matchmakingApi.joinMatch({
        visitorId,
        nickname,
        gameMode: selectedMode,
        maxPlayers: selectedPlayers,
      });
      hasJoinedRef.current = true;
      setQueuePosition(result.position);
      setWaitedSeconds(result.waitedSeconds);

      // 启动秒数计时（本地递增，UI 用）
      secondTimerRef.current = window.setInterval(() => {
        setWaitedSeconds((prev: number) => prev + 1);
      }, 1000);

      // 启动轮询
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加入匹配失敗';
      setError(message);
      setPhase('config');
      hasJoinedRef.current = false;
    }
  }, [visitorId, nickname, selectedMode, selectedPlayers, playSfx, pollStatus]);

  const handleCancel = useCallback(() => {
    playSfx('click');
    void stopMatching();
  }, [playSfx, stopMatching]);

  const handleContinueWaiting = useCallback(() => {
    playSfx('click');
    // 重置已等待秒數，重新給一段等待窗口；
    // 否則 waitedSeconds 仍 >= TIMEOUT_SECONDS，下方 timeout effect 會立刻把 phase 打回 timeout。
    setWaitedSeconds(0);
    setPhase('matching');
    // 逾時時已清除輪詢計時器；若仍在隊列中（hasJoined），重啟輪詢以恢復配對狀態。
    if (hasJoinedRef.current && visitorId) {
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    }
  }, [playSfx, visitorId, pollStatus]);

  const handleGoCreateRoom = useCallback(() => {
    playSfx('click');
    void stopMatching();
    navigate('/online/create');
  }, [playSfx, stopMatching, navigate]);

  const handleBack = useCallback(() => {
    playSfx('click');
    navigate('/');
  }, [playSfx, navigate]);

  // 超时检测：達到等待上限後停止所有輪詢/計時，避免離線時持續打 API
  useEffect(() => {
    if (phase === 'matching' && waitedSeconds >= TIMEOUT_SECONDS) {
      clearTimers();
      setPhase('timeout');
    }
  }, [phase, waitedSeconds, clearTimers]);

  const currentMode = MODES.find((m: ModeOption) => m.key === selectedMode) ?? MODES[0];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative">
      <div className="w-full max-w-md">
        {/* ===== 配置阶段 ===== */}
        {phase === 'config' && (
          <div className="cyber-card p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider mb-2 pulse-glow">
                快速匹配
              </h2>
              <p className="text-[var(--text-secondary)] text-sm font-cyber tracking-wider">
                自動匹配 · 秒速開局
              </p>
            </div>

            {/* 模式选择 */}
            <div className="mb-6">
              <label className="block font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3">
                <Zap size={14} className="inline mr-1.5" style={{ color: 'var(--cyan)' }} />
                選擇模式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map((mode: ModeOption) => {
                  const isSelected = selectedMode === mode.key;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setSelectedMode(mode.key);
                      }}
                      className="cyber-btn py-3 text-xs md:text-sm transition-all"
                      style={{
                        borderColor: isSelected ? mode.color : 'rgba(0, 255, 255, 0.2)',
                        color: isSelected ? mode.color : 'var(--text-secondary)',
                        boxShadow: isSelected
                          ? `0 0 15px ${mode.color}50, inset 0 0 10px ${mode.color}20`
                          : 'none',
                        background: isSelected ? `${mode.color}15` : 'transparent',
                      }}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)] text-center">
                {currentMode.description}
              </p>
            </div>

            {/* 人数选择 */}
            <div className="mb-6">
              <label className="block font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3">
                <Users size={14} className="inline mr-1.5" style={{ color: 'var(--pink)' }} />
                玩家人數
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLAYER_COUNTS.map((count: number) => {
                  const isSelected = selectedPlayers === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setSelectedPlayers(count);
                      }}
                      className="cyber-btn py-3 text-sm"
                      style={{
                        borderColor: isSelected ? 'var(--pink)' : 'rgba(255, 107, 157, 0.2)',
                        color: isSelected ? 'var(--pink)' : 'var(--text-secondary)',
                        boxShadow: isSelected
                          ? '0 0 15px rgba(255, 107, 157, 0.4), inset 0 0 10px rgba(255, 107, 157, 0.15)'
                          : 'none',
                        background: isSelected ? 'rgba(255, 107, 157, 0.1)' : 'transparent',
                      }}
                    >
                      {count} 人
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-center" style={{ color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={startMatching}
              className="cyber-btn w-full py-4 text-lg font-cyber tracking-wider match-card-pulse"
              style={{
                borderColor: 'var(--cyan)',
                color: 'var(--cyan)',
              }}
            >
              閃電 開始匹配
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} />
              返回主選單
            </button>

            <p className="mt-6 text-xs text-center text-[var(--text-muted)] font-cyber tracking-wider">
              系統將自動匹配相同模式與人數的玩家
            </p>
          </div>
        )}

        {/* ===== 匹配中阶段 ===== */}
        {(phase === 'matching' || phase === 'matched' || phase === 'timeout') && (
          <div className="cyber-card p-6 md:p-8 text-center match-card-pulse">
            {/* 动画圆环 */}
            <div className="flex justify-center mb-6">
              <div className="neon-ring" />
            </div>

            <h2 className="font-cyber text-2xl md:text-3xl tracking-widest mb-1 pulse-glow"
                style={{ color: phase === 'matched' ? 'var(--green)' : 'var(--cyan)' }}>
              {phase === 'matched' ? '配對成功！' : phase === 'timeout' ? '匹配時間較長' : '配對中...'}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm font-cyber tracking-wider mb-6">
              {phase === 'matched'
                ? '正在進入房間...'
                : phase === 'timeout'
                ? '繼續等待還是建立房間？'
                : '正在尋找對手，請稍候'}
            </p>

            {/* 匹配信息 */}
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center justify-between py-2 px-3 cyber-card"
                   style={{ borderColor: 'rgba(0, 255, 255, 0.15)' }}>
                <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Zap size={14} style={{ color: 'var(--cyan)' }} />
                  模式
                </span>
                <span className="font-cyber text-sm tracking-wider" style={{ color: currentMode.color }}>
                  {currentMode.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 cyber-card"
                   style={{ borderColor: 'rgba(255, 107, 157, 0.15)' }}>
                <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Users size={14} style={{ color: 'var(--pink)' }} />
                  人數
                </span>
                <span className="font-cyber text-sm tracking-wider" style={{ color: 'var(--pink)' }}>
                  {selectedPlayers} 人
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 cyber-card"
                   style={{ borderColor: 'rgba(77, 195, 255, 0.15)' }}>
                <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Clock size={14} style={{ color: 'var(--blue)' }} />
                  已等待
                </span>
                <span className="font-cyber text-sm tracking-wider" style={{ color: 'var(--blue)' }}>
                  {waitedSeconds} 秒
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 cyber-card"
                   style={{ borderColor: 'rgba(255, 200, 0, 0.15)' }}>
                <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Hash size={14} style={{ color: 'var(--yellow)' }} />
                  排隊位置
                </span>
                <span className="font-cyber text-sm tracking-wider" style={{ color: 'var(--yellow)' }}>
                  第 {queuePosition} 位
                </span>
              </div>
            </div>

            {/* 按钮区 */}
            {phase === 'matching' && (
              <button
                type="button"
                onClick={handleCancel}
                className="cyber-btn cyber-btn-pink w-full py-3 text-base"
              >
                取消匹配
              </button>
            )}

            {phase === 'timeout' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleContinueWaiting}
                  className="cyber-btn w-full py-3 text-base"
                  style={{
                    borderColor: 'var(--cyan)',
                    color: 'var(--cyan)',
                  }}
                >
                  繼續等待
                </button>
                <button
                  type="button"
                  onClick={handleGoCreateRoom}
                  className="cyber-btn cyber-btn-pink w-full py-3 text-base"
                >
                  建立房間
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider"
                >
                  取消
                </button>
              </div>
            )}

            {phase === 'matched' && (
              <div className="space-y-4">
                {/* 對手資訊 */}
                <div
                  className="cyber-card p-4 text-left"
                  style={{ borderColor: 'rgba(0, 255, 128, 0.3)' }}
                >
                  <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-2">
                    對手資訊
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-cyber text-lg tracking-wider text-neon-green">
                        {matchedOpponent}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-cyber mt-1">
                        房間 {matchedRoomCode} · 你是玩家 {matchedPlayerIndex + 1}
                      </div>
                    </div>
                  </div>
                  {/* 舉報 / 拉黑按鈕 */}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setShowReportDialog(true);
                      }}
                      className="cyber-btn flex-1 py-2 text-xs flex items-center justify-center gap-1"
                      style={{
                        borderColor: 'var(--yellow)',
                        color: 'var(--yellow)',
                      }}
                    >
                      <Flag size={14} />
                      舉報
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setShowBlockDialog(true);
                      }}
                      className="cyber-btn flex-1 py-2 text-xs flex items-center justify-center gap-1"
                      style={{
                        borderColor: 'var(--red)',
                        color: 'var(--red)',
                      }}
                    >
                      <UserX size={14} />
                      拉黑
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goToRoom(matchedRoomCode, matchedPlayerIndex)}
                  className="cyber-btn w-full py-3 text-base"
                  style={{
                    borderColor: 'var(--green)',
                    color: 'var(--green)',
                    boxShadow: '0 0 15px rgba(0, 255, 128, 0.4)',
                  }}
                >
                  進入對局
                </button>
              </div>
            )}

            {/* 黑名單跳過提示 */}
            {skipMessage && phase === 'matching' && (
              <div
                className="mt-4 p-3 text-xs font-cyber tracking-wider text-center rounded"
                style={{
                  color: 'var(--yellow)',
                  border: '1px solid var(--yellow)',
                  backgroundColor: 'rgba(250, 204, 21, 0.1)',
                  boxShadow: '0 0 10px rgba(250, 204, 21, 0.3)',
                }}
              >
                注意 {skipMessage}
              </div>
            )}
          </div>
        )}
      </div>

      <ReportBlockDialogs
        showReport={showReportDialog}
        onReportOpenChange={setShowReportDialog}
        showBlock={showBlockDialog}
        onBlockOpenChange={setShowBlockDialog}
        opponentNickname={matchedOpponent}
        onPlaySfx={() => playSfx('click')}
      />

      {/* 版本 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[var(--text-muted)] text-xs font-cyber tracking-wider">
        v1.0 · CYBER MONOPOLY
      </div>
    </div>
  );
};

export default QuickMatchPage;
