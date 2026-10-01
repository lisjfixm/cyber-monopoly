import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Trophy,
  FastForward,
  Clock,
  Eye,
  Zap,
  RotateCcw,
  Info,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import Board from '@client/src/components/game/Board';
import PlayerList from '@client/src/components/game/PlayerList';
import {
  replayStateFromLog,
} from '@shared/game-engine';
import { MODE_LABELS, PLAYER_COLOR_HEX } from '@shared/game-config';
import type { PlayerColor } from '@shared/api.interface';
import type {
  ReplayLogEntry,
  GameState,
} from '@shared/api.interface';
import type { StoredReplay } from './ReplayList';
import { formatDuration } from './ReplayList';
import {
  SAMPLE_REPLAY_TURNS,
  SAMPLE_PLAYERS,
  type SampleTurn,
} from './sample-replay';

const ACTION_LABELS: Record<string, string> = {
  roll: '擲骰子',
  buy: '購買地產',
  pass: '跳過',
  build: '建造房屋',
  demolish: '拆除建築',
  pay_toll: '支付過路費',
  draw_fate: '抽取命運卡',
  draw_chance: '抽取機會卡',
  go_to_start: '傳送至起點',
  auction_start: '開始拍賣',
  auction_bid: '出價',
  auction_end: '拍賣結束',
  trade_propose: '提議交易',
  trade_accept: '接受交易',
  trade_reject: '拒絕交易',
  use_item: '使用道具',
  buy_item: '購買道具',
  force_acquire: '強制收購',
  bribe: '賄賂',
  bankruptcy: '破產',
  game_end: '遊戲結束',
  stock_buy: '買入股票',
  stock_sell: '賣出股票',
  season_change: '季節變化',
  disaster: '災難',
  turn_end: '回合結束',
};

const ACTION_COLORS: Record<string, string> = {
  roll: 'var(--cyan)',
  buy: 'var(--green)',
  pass: 'var(--text-secondary)',
  build: 'var(--green)',
  demolish: 'var(--red)',
  pay_toll: 'var(--yellow)',
  draw_fate: 'var(--purple)',
  draw_chance: 'hsl(240, 80%, 70%)',
  auction_start: 'var(--yellow)',
  auction_bid: 'var(--yellow)',
  auction_end: 'var(--yellow)',
  trade_propose: 'var(--cyan)',
  trade_accept: 'var(--green)',
  trade_reject: 'var(--red)',
  bankruptcy: 'var(--red)',
  game_end: 'var(--pink)',
  stock_buy: 'var(--green)',
  stock_sell: 'var(--red)',
  disaster: 'var(--red)',
  season_change: 'var(--cyan)',
  turn_end: 'var(--text-secondary)',
};

interface ReplayPlayerProps {
  replay: StoredReplay;
  onBack: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 1, 2, 4];

const ReplayPlayer = ({ replay, onBack }: ReplayPlayerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'follow' | 'global'>('global');
  const [jumpTurn, setJumpTurn] = useState<number>(1);

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // 是否使用樣本回放資料（當 replay 本身沒有足夠日誌時）
  const useSampleData = replay.log.length < 5;

  // 樣本回合數據
  const sampleTurns: SampleTurn[] = SAMPLE_REPLAY_TURNS;

  // 當前回合（基於 step 或樣本數據計算）
  const currentTurn = useMemo(() => {
    if (useSampleData) {
      return sampleTurns[Math.min(currentStep, sampleTurns.length - 1)]?.turn ?? 1;
    }
    const entry = replay.log[currentStep];
    return entry?.turn ?? 1;
  }, [useSampleData, currentStep, sampleTurns, replay.log]);

  const totalTurns = useSampleData
    ? sampleTurns.length
    : replay.totalTurns;

  const totalSteps = useSampleData
    ? sampleTurns.length
    : replay.log.length;

  // 玩家名單
  const displayPlayers = useSampleData
    ? SAMPLE_PLAYERS
    : replay.players;

  const replayResult = useMemo(() => {
    if (useSampleData) return null;
    try {
      return replayStateFromLog(replay.log, currentStep);
    } catch {
      return null;
    }
  }, [replay, currentStep, useSampleData]);

  // 自動播放
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }

    const step = () => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    };

    const delay = 1000 / playbackSpeed;
    playTimerRef.current = setTimeout(step, delay);

    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, currentStep, totalSteps, playbackSpeed]);

  // 滾動時間線到當前回合
  useEffect(() => {
    if (timelineRef.current) {
      const activeEl = timelineRef.current.querySelector(
        `[data-turn-idx="${currentStep}"]`,
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStep]);

  const handlePlayPause = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentStep, totalSteps]);

  const handlePrevStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps]);

  const handleSkipStart = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const handleSkipEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(totalSteps - 1);
  }, [totalSteps]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    const value = parseInt(e.target.value, 10);
    setCurrentStep(value);
  }, []);

  const handleJumpToTurn = useCallback((idx: number) => {
    setIsPlaying(false);
    setCurrentStep(Math.max(0, Math.min(idx, totalSteps - 1)));
  }, [totalSteps]);

  const handleJumpSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!Number.isNaN(val)) {
      handleJumpToTurn(val - 1);
      setJumpTurn(val);
    }
  }, [handleJumpToTurn]);

  const handleExportCode = useCallback(() => {
    try {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(replay))));
      navigator.clipboard.writeText(code).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Export failed:', err instanceof Error ? err.message : String(err));
    }
  }, [replay]);

  const gameState: GameState | null = replayResult?.state ?? null;
  const currentEntry: ReplayLogEntry | null = replayResult?.entry ?? null;

  // 計算每個玩家的地產數量
  const propertyCounts = useMemo(() => {
    if (!gameState) return {};
    const counts: Record<number, number> = {};
    for (const prop of Object.values(gameState.properties)) {
      counts[prop.owner] = (counts[prop.owner] ?? 0) + 1;
    }
    return counts;
  }, [gameState]);

  // 當前回合的事件列表（樣本模式）
  const currentTurnEvents = useMemo(() => {
    if (!useSampleData) return [];
    return sampleTurns[currentStep]?.events ?? [];
  }, [useSampleData, currentStep, sampleTurns]);

  // 當前回合摘要（樣本模式）
  const currentTurnSummary = useMemo(() => {
    if (!useSampleData) {
      const entry = replay.log[currentStep];
      if (!entry) return '';
      const player = replay.players[entry.playerIndex];
      const label = ACTION_LABELS[entry.action] || entry.action;
      return `${player?.name || '系統'}：${label}`;
    }
    return sampleTurns[currentStep]?.summary ?? '';
  }, [useSampleData, currentStep, sampleTurns, replay]);

  // 視角切換處理
  const handleToggleView = useCallback(() => {
    setViewMode((prev) => (prev === 'follow' ? 'global' : 'follow'));
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col scanlines bg-[var(--bg-deep)]">
      {/* Top Bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-neon)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ChevronLeft size={16} />
          <span className="font-cyber tracking-wider">列表</span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span
              className="font-cyber text-lg tracking-wider truncate"
              style={{ color: 'var(--cyan)', textShadow: '0 0 8px var(--cyan)' }}
            >
              {MODE_LABELS[replay.gameMode] || replay.gameMode}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock size={12} />
              {formatDuration(replay.duration)}
            </span>
            {replay.winner && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                <Trophy size={12} />
                {replay.winner}
              </span>
            )}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {displayPlayers.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 mr-2">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    background: PLAYER_COLOR_HEX[p.color as PlayerColor]
                      || (p.color === 'cyan' ? 'var(--cyan)' : 'var(--pink)'),
                  }}
                />
                {p.name}
              </span>
            ))}
            {' · '}
            {totalTurns} 回合
          </div>
        </div>

        {/* 視角切換按鈕 */}
        <button
          type="button"
          onClick={handleToggleView}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: viewMode === 'follow' ? 'var(--pink)' : 'var(--purple)',
            color: viewMode === 'follow' ? 'var(--pink)' : 'var(--purple)',
          }}
          title={viewMode === 'follow' ? '跟隨視角' : '全局視角'}
        >
          <Eye size={16} />
          <span className="font-cyber tracking-wider hidden md:inline">
            {viewMode === 'follow' ? '跟隨' : '全局'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleExportCode}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--pink)', color: 'var(--pink)' }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span className="font-cyber tracking-wider hidden md:inline">
            {copied ? '已複製' : '回放碼'}
          </span>
        </button>
      </div>

      {/* Main Content: 三欄布局 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左側：時間線列表 */}
        <div
          className="w-full lg:w-64 xl:w-72 border-t lg:border-t-0 lg:border-r flex flex-col order-2 lg:order-1"
          style={{ borderColor: 'var(--border-neon)' }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-neon)' }}>
            <Zap size={14} style={{ color: 'var(--cyan)' }} />
            <h3 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--cyan)' }}>
              回合時間線
            </h3>
          </div>
          <div
            ref={timelineRef}
            className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5"
          >
            {sampleTurns.map((turn, idx) => {
              const isActive = idx === currentStep;
              return (
                <button
                  key={turn.turn}
                  type="button"
                  data-turn-idx={idx}
                  onClick={() => handleJumpToTurn(idx)}
                  className="w-full text-left px-3 py-2 rounded cursor-pointer text-xs transition-all"
                  style={{
                    border: isActive
                      ? '1px solid var(--cyan)'
                      : '1px solid transparent',
                    backgroundColor: isActive
                      ? 'rgba(0, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: isActive
                      ? '0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)'
                      : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-cyber tracking-wide text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: isActive
                          ? 'rgba(0, 255, 255, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                      }}
                    >
                      第 {turn.turn} 回合
                    </span>
                    {isActive && (
                      <span
                        className="text-[10px] font-cyber"
                        style={{
                          color: 'var(--pink)',
                          textShadow: '0 0 6px var(--pink)',
                        }}
                      >
                        ▶ 播放中
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs leading-snug"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {turn.summary}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {turn.events.slice(0, 3).map((evt, ei) => (
                      <span
                        key={ei}
                        className="text-[9px] px-1 py-0.5 rounded font-cyber"
                        style={{
                          backgroundColor: `${ACTION_COLORS[evt.action] || 'var(--text-secondary)'}20`,
                          color: ACTION_COLORS[evt.action] || 'var(--text-secondary)',
                        }}
                      >
                        {ACTION_LABELS[evt.action] || evt.action}
                      </span>
                    ))}
                    {turn.events.length > 3 && (
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        +{turn.events.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 中間：棋盤 + 播放控制 */}
        <div className="flex-1 flex flex-col items-center justify-start p-3 md:p-4 overflow-auto min-h-0 order-1 lg:order-2">
          {/* 棋盤區域 */}
          {gameState ? (
            <div className="w-full max-w-[600px] aspect-square">
              <Board
                gameState={gameState}
                boardCells={gameState.boardCells}
                cellEffects={gameState.cellEffects}
                disaster={gameState.disaster}
              />
            </div>
          ) : (
            <div
              className="w-full max-w-[600px] aspect-square flex items-center justify-center cyber-card"
              style={{ borderColor: 'var(--border-neon-cyan)' }}
            >
              <div className="text-center">
                <Zap
                  size={48}
                  style={{ color: 'var(--cyan)', margin: '0 auto 12px' }}
                />
                <div
                  className="font-cyber text-lg tracking-wider mb-2"
                  style={{ color: 'var(--cyan)', textShadow: '0 0 8px var(--cyan)' }}
                >
                  回放模式
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  當前為樣本回放演示
                </div>
                <div
                  className="text-xs mt-2 font-cyber"
                  style={{ color: 'var(--pink)' }}
                >
                  第 {currentTurn} / {totalTurns} 回合
                </div>
              </div>
            </div>
          )}

          {/* 玩家資訊 */}
          {gameState && (
            <div className="w-full max-w-[600px] mt-4">
              <PlayerList
                players={gameState.players}
                currentPlayerIndex={gameState.currentPlayerIndex}
                propertyCounts={propertyCounts}
              />
            </div>
          )}

          {/* 樣本模式玩家資訊條 */}
          {useSampleData && (
            <div className="w-full max-w-[600px] mt-4 grid grid-cols-2 gap-3">
              {displayPlayers.map((p, idx) => {
                // 模擬資產變化
                const progress = currentStep / Math.max(1, totalSteps - 1);
                const baseMoney = 15000;
                const props = idx === 0
                  ? Math.min(10, Math.floor(progress * 10 + 1))
                  : Math.min(8, Math.floor(progress * 7 + 1));
                const money = idx === 0
                  ? Math.max(500, baseMoney - props * 1800 + currentStep * 200)
                  : Math.max(200, baseMoney - props * 2000 - currentStep * 100);
                const pColor = idx === 0 ? 'var(--cyan)' : 'var(--pink)';
                return (
                  <div
                    key={idx}
                    className="cyber-card p-3"
                    style={{ borderColor: `${pColor}40` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pColor, boxShadow: `0 0 8px ${pColor}` }}
                      />
                      <span className="font-cyber text-sm tracking-wider" style={{ color: pColor }}>
                        {p.name}
                      </span>
                    </div>
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex justify-between">
                        <span>現金</span>
                        <span style={{ color: 'var(--green)' }}>${money.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>地產</span>
                        <span style={{ color: 'var(--cyan)' }}>{props} 塊</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 增強版播放控制欄 */}
          <div
            className="w-full max-w-[600px] mt-4 cyber-card p-3 md:p-4"
            style={{
              borderColor: 'rgba(255, 107, 157, 0.3)',
              boxShadow: '0 0 15px rgba(255, 107, 157, 0.1)',
            }}
          >
            {/* 進度列 */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-mono w-12 text-right font-cyber"
                style={{ color: 'var(--cyan)' }}
              >
                第 {currentTurn} 回
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalSteps - 1)}
                value={currentStep}
                onChange={handleSeek}
                className="flex-1 h-2 rounded-full"
                style={{ accentColor: 'var(--pink)' }}
              />
              <span className="text-xs font-mono w-12 font-cyber" style={{ color: 'var(--text-secondary)' }}>
                第 {totalTurns} 回
              </span>
            </div>

            {/* 控制按鈕列 */}
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={handleSkipStart}
                className="cyber-btn p-2"
                style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
                aria-label="跳到開頭"
                title="跳到開頭"
              >
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                onClick={handlePrevStep}
                className="cyber-btn p-2 md:p-3"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                aria-label="上一回合"
                title="上一回合"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handlePlayPause}
                className="cyber-btn cyber-btn-pink w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                style={{
                  boxShadow: '0 0 20px rgba(255, 107, 157, 0.5), inset 0 0 15px rgba(255, 107, 157, 0.2)',
                }}
                aria-label={isPlaying ? '暫停' : '播放'}
              >
                {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="cyber-btn p-2 md:p-3"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                aria-label="下一回合"
                title="下一回合"
              >
                <ChevronRight size={20} />
              </button>
              <button
                type="button"
                onClick={handleSkipEnd}
                className="cyber-btn p-2"
                style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
                aria-label="跳到結尾"
                title="跳到結尾"
              >
                <SkipForward size={18} />
              </button>

              <div className="w-px h-8 mx-1 md:mx-2" style={{ background: 'var(--border-neon)' }} />

              {/* 重新播放 */}
              <button
                type="button"
                onClick={handleSkipStart}
                className="cyber-btn p-2"
                style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}
                aria-label="重新播放"
                title="重新播放"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* 速度切換 + 回合跳轉 */}
            <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1">
                <FastForward size={14} style={{ color: 'var(--text-secondary)' }} />
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`cyber-btn px-2 py-1 text-[10px] font-cyber tracking-wide ${
                      playbackSpeed === speed ? '' : 'opacity-60'
                    }`}
                    style={{
                      borderColor: playbackSpeed === speed
                        ? 'var(--cyan)'
                        : 'var(--border-neon)',
                      color: playbackSpeed === speed
                        ? 'var(--cyan)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* 回合跳轉下拉 */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  跳至回合
                </span>
                <select
                  value={currentTurn}
                  onChange={handleJumpSelect}
                  className="cyber-input px-2 py-1 text-xs font-cyber"
                  style={{
                    borderColor: 'var(--pink)',
                    color: 'var(--pink)',
                    backgroundColor: 'var(--bg-dark)',
                    cursor: 'pointer',
                  }}
                >
                  {sampleTurns.map((t) => (
                    <option key={t.turn} value={t.turn}>
                      第 {t.turn} 回合
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 當前回合資訊 */}
            <div
              className="text-center mt-3 pt-3 border-t text-xs"
              style={{
                borderColor: 'var(--border-neon)',
                color: 'var(--text-muted)',
              }}
            >
              <span className="font-cyber tracking-wide" style={{ color: 'var(--cyan)' }}>
                第 {currentTurn} 回合
              </span>
              {' · '}
              {currentTurnSummary || '—'}
            </div>
          </div>
        </div>

        {/* 右側：詳細資訊面板 */}
        <div
          className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l flex flex-col order-3"
          style={{ borderColor: 'var(--border-neon)' }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-neon)' }}>
            <Info size={14} style={{ color: 'var(--pink)' }} />
            <h3 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--pink)' }}>
              回合詳情
            </h3>
          </div>

          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
          >
            {/* 當前回合標題 */}
            <div
              className="cyber-card p-3"
              style={{
                borderColor: 'var(--cyan)',
                boxShadow: '0 0 12px rgba(0, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} style={{ color: 'var(--cyan)' }} />
                <span className="font-cyber text-sm tracking-wider" style={{ color: 'var(--cyan)' }}>
                  第 {currentTurn} 回合
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {currentTurnSummary}
              </p>
            </div>

            {/* 事件明細 */}
            <div>
              <div
                className="text-[10px] font-cyber tracking-wider mb-2 px-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                事件明細
              </div>
              <div className="space-y-2">
                {currentTurnEvents.length > 0 ? (
                  currentTurnEvents.map((evt, idx) => {
                    const color = ACTION_COLORS[evt.action] || 'var(--text-secondary)';
                    const label = ACTION_LABELS[evt.action] || evt.action;
                    const isKey = ['buy', 'build', 'pay_toll', 'bankruptcy', 'game_end'].includes(evt.action);
                    return (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded text-xs"
                        style={{
                          borderLeft: `2px solid ${color}`,
                          backgroundColor: isKey
                            ? `${color}10`
                            : 'rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-cyber text-[10px] tracking-wide"
                            style={{ color }}
                          >
                            {label}
                          </span>
                          {isKey && (
                            <span
                              className="text-[9px] px-1 py-0.5 rounded font-cyber"
                              style={{
                                backgroundColor: 'var(--yellow)20',
                                color: 'var(--yellow)',
                              }}
                            >
                              關鍵
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {evt.description}
                        </div>
                        {evt.amount !== undefined && (
                          <div
                            className="mt-1 text-[10px] font-cyber"
                            style={{
                              color: evt.amount >= 0 ? 'var(--green)' : 'var(--red)',
                            }}
                          >
                            {evt.amount >= 0 ? '+' : ''}${evt.amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="px-3 py-2 text-xs rounded"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {currentEntry
                      ? (
                        <>
                          <div style={{ color: ACTION_COLORS[currentEntry.action] || 'var(--cyan)' }}>
                            {ACTION_LABELS[currentEntry.action] || currentEntry.action}
                          </div>
                          <div className="mt-1">
                            {replay.players[currentEntry.playerIndex]?.name || '系統'}
                          </div>
                        </>
                      )
                      : '暫無事件細節'}
                  </div>
                )}
              </div>
            </div>

            {/* 資產變化 */}
            {useSampleData && (
              <div>
                <div
                  className="text-[10px] font-cyber tracking-wider mb-2 px-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  資產變化
                </div>
                <div className="cyber-card p-3 space-y-2" style={{ borderColor: 'var(--border-neon-cyan)' }}>
                  {displayPlayers.map((p, idx) => {
                    const progress = currentStep / Math.max(1, totalSteps - 1);
                    const props = idx === 0
                      ? Math.min(10, Math.floor(progress * 10 + 1))
                      : Math.min(8, Math.floor(progress * 7 + 1));
                    const money = idx === 0
                      ? Math.max(500, 15000 - props * 1800 + currentStep * 200)
                      : Math.max(200, 15000 - props * 2000 - currentStep * 100);
                    const pColor = idx === 0 ? 'var(--cyan)' : 'var(--pink)';
                    const totalAssets = money + props * 1200;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: pColor }}
                            />
                            <span className="text-xs" style={{ color: pColor }}>{p.name}</span>
                          </div>
                          <span
                            className="text-[10px] font-cyber"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            ${totalAssets.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-[var(--bg-mid)]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (totalAssets / 30000) * 100)}%`,
                              backgroundColor: pColor,
                              boxShadow: `0 0 6px ${pColor}`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span>現金 ${money.toLocaleString()}</span>
                          <span>{props} 塊地</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 關鍵決策標註 */}
            {useSampleData && currentTurnEvents.some((e) => ['buy', 'build', 'pay_toll', 'bankruptcy'].includes(e.action)) && (
              <div>
                <div
                  className="text-[10px] font-cyber tracking-wider mb-2 px-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  關鍵決策
                </div>
                <div
                  className="cyber-card p-3"
                  style={{
                    borderColor: 'var(--purple)',
                    boxShadow: '0 0 10px rgba(155, 89, 255, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Zap size={12} style={{ color: 'var(--purple)', marginTop: 2 }} />
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {getTurnAnalysis(currentTurn)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部播放控制（保留原始樣式，用於日誌模式） */}
      {!useSampleData && gameState && (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: 'var(--border-neon)', background: 'var(--bg-dark)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs font-mono w-12 text-right"
              style={{ color: 'var(--text-muted)' }}
            >
              {currentStep + 1}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStep}
              onChange={handleSeek}
              className="flex-1 h-1"
              style={{ accentColor: 'var(--cyan)' }}
            />
            <span className="text-xs font-mono w-12" style={{ color: 'var(--text-muted)' }}>
              {totalSteps}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleSkipStart}
              className="cyber-btn p-2"
              style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
              aria-label="跳到開頭"
            >
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={handlePrevStep}
              className="cyber-btn p-2"
              style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
              aria-label="上一步"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              className="cyber-btn p-3"
              style={{
                borderColor: 'var(--pink)',
                color: 'var(--pink)',
                boxShadow: '0 0 15px color-mix(in srgb, var(--pink) 40%, transparent)',
              }}
              aria-label={isPlaying ? '暫停' : '播放'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="cyber-btn p-2"
              style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
              aria-label="下一步"
            >
              <ChevronRight size={20} />
            </button>
            <button
              type="button"
              onClick={handleSkipEnd}
              className="cyber-btn p-2"
              style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
              aria-label="跳到結尾"
            >
              <SkipForward size={18} />
            </button>

            <div className="w-px h-8 mx-2" style={{ background: 'var(--border-neon)' }} />

            <div className="flex items-center gap-1">
              <FastForward size={16} style={{ color: 'var(--text-secondary)' }} />
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`cyber-btn px-2 py-1 text-xs font-cyber ${
                    playbackSpeed === speed ? '' : 'opacity-50'
                  }`}
                  style={{
                    borderColor: playbackSpeed === speed ? 'var(--cyan)' : 'var(--border-neon)',
                    color: playbackSpeed === speed ? 'var(--cyan)' : 'var(--text-secondary)',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {currentEntry && (
            <div className="text-center mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              第 {currentEntry.turn} 回合 ·{' '}
              {replay.players[currentEntry.playerIndex]?.name || '系統'} ·{' '}
              {ACTION_LABELS[currentEntry.action] || currentEntry.action}
              {!replayResult?.isExact && (
                <span className="ml-2" style={{ color: 'var(--yellow)' }}>
                  (近似)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 回合分析文本
function getTurnAnalysis(turn: number): string {
  const analyses: Record<number, string> = {
    1: '雙方開局穩健，各自購買起點附近地產，奠定基礎。',
    2: '暗影黑客跳過能源站，顯示其傾向高價值核心地產的策略。',
    3: '核心區與中央塔的爭奪揭開序幕，這兩塊是中期關鍵資產。',
    4: '命運卡帶來隨機波動，霓虹行者繳稅導致現金暫時緊張。',
    5: '霓虹行者進入禁閉區，錯過寶貴的購地機會，節奏被打斷。',
    6: '暗影黑客利用對方入獄期間加速擴張，購入後街增強套裝潛力。',
    7: '暗影黑客率先升級建築，開始建立收租優勢。',
    8: '關鍵轉折！霓虹行者踩中央塔付出高額過路費，現金大幅縮水。',
    9: '霓虹行者反擊，購入星光道佈局頂級資產線。',
    10: '雙方雙雙通過起點，獲得營運資金補血。',
    11: '霓虹行者開始建房，雙方進入收租對壘階段。',
    12: '暗影黑客首次支付霓虹區過路費，金額雖小但預示反撲開始。',
    13: '命運卡罰款進一步打擊暗影黑客的現金流。',
    14: '霓虹行者升級核心區至酒店級，釋放強烈進攻信號。',
    15: '致命一擊！暗影黑客踩到核心區酒店，現金幾乎見底。',
    16: '暗影黑客被迫拆房套現，進入被動防守狀態。',
    17: '霓虹行者持續擴張版圖，勝利天平傾斜。',
    18: '暗影黑客破產，霓虹行者以壓倒性資產優勢獲勝。',
  };
  return analyses[turn] || '雙方繼續佈局，積累資產優勢。';
}

export default ReplayPlayer;
