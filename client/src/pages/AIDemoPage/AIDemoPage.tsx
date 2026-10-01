import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  Trophy,
  Brain,
  Zap,
  Info,
  Lightbulb,
  AlertTriangle,
  Target,
  Shield,
  Skull,
  Gauge,
  X,
  Swords,
  Eye,
  Sparkles,
} from 'lucide-react';

import Board from '@client/src/components/game/Board';
import { AI_DEMO_REPLAYS, type DemoReplay, type DemoAnnotation } from './ai-demo-data';
import { AI_PERSONALITY_CONFIG } from '@shared/game-config';
import { createInitialState } from '@shared/game-engine';
import type { GameState } from '@shared/api.interface';
import { GAME_MODES, PLAYER_COLORS } from '@shared/game-config';

// AI 難度定義
interface AIDifficultyLevel {
  id: 'easy' | 'normal' | 'hard' | 'hell';
  name: string;
  description: string;
  recommendedFor: string;
  power: number;
  color: string;
  icon: 'brain' | 'shield' | 'zap' | 'skull';
  strategies: string[];
}

const AI_DIFFICULTIES: AIDifficultyLevel[] = [
  {
    id: 'easy',
    name: '簡單 AI',
    description: '隨機決策，偶爾做出合理選擇，適合初次體驗的玩家。',
    recommendedFor: '新手入門 / 休閒玩家',
    power: 30,
    color: 'var(--green)',
    icon: 'brain',
    strategies: [
      '購買決策幾乎隨機，大約 30% 機率買下經過的地產',
      '不考慮套裝價值，見地就買是常態',
      '建房隨意，傾向有錢就升級',
      '幾乎不參與拍賣，錯過大量撿便宜機會',
      '安全墊觀念薄弱，容易現金斷鏈',
    ],
  },
  {
    id: 'normal',
    name: '普通 AI',
    description: '具備基本策略，懂得購買和建房，但風險意識不足。',
    recommendedFor: '有基礎經驗的玩家',
    power: 60,
    color: 'var(--cyan)',
    icon: 'shield',
    strategies: [
      '現金充足時優先購買地產，大約 60% 購買率',
      '懂得優先升級已擁有套裝的地產',
      '但分散投資，缺乏聚焦核心系列的概念',
      '命運卡隨機應對，沒有長期現金規劃',
      '安全墊約 500 元，容易被高額過路費擊潰',
    ],
  },
  {
    id: 'hard',
    name: '困難 AI',
    description: '會計算資產價值與風險，懂得套裝策略，具備交易判斷力。',
    recommendedFor: '資深玩家 / 想磨練技術',
    power: 85,
    color: 'var(--pink)',
    icon: 'zap',
    strategies: [
      '現金超過地價 3 倍時 80% 機率購買，緊張時降到 20%',
      '優先搶奪核心套裝系列（中央塔/富豪區/總部）',
      '建房前計算對方路過機率，優先升級高流量地',
      '參與拍賣並計算底線，超過市價 120% 果斷放棄',
      '永遠保留 1000-1500 元現金安全墊',
      '交易評估：只接受能幫助自己湊齊套裝的提議',
    ],
  },
  {
    id: 'hell',
    name: '地獄 AI',
    description: '接近人類頂尖水平，精確計算資產、風險、對手心理。',
    recommendedFor: '頂尖玩家 / 想被虐的挑戰者',
    power: 98,
    color: 'var(--red)',
    icon: 'skull',
    strategies: [
      '精確計算每塊地的 ROI（投資回報率）和路過機率',
      '模擬未來 5 回合現金流，提前調整資產結構',
      '聯合圍剿最強對手，形成弱勢者隱性聯盟',
      '拍賣場心理戰：前期高價營造氣勢，對方接近底線時瞬間撤離',
      '交易談判精確到 100 元以內的底線計算',
      '根據對手風格動態調整策略：保守型就高壓進攻，激進型就誘導超支',
      '酒店升級時機精準：確認對方下回合必經過才連續升級',
    ],
  },
];

const AIDemoPage = () => {
  const navigate = useNavigate();
  const [selectedDemo, setSelectedDemo] = useState<DemoReplay | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState<DemoAnnotation | null>(null);
  const [simulatedState, setSimulatedState] = useState<GameState | null>(null);
  const playIntervalRef = useRef<number | null>(null);

  // AI 對戰觀察模式狀態
  const [aiBattleMode, setAiBattleMode] = useState(false);
  const [aiBattleSpeed, setAiBattleSpeed] = useState(1);
  const [battleAiLeft, setBattleAiLeft] = useState<AIDifficultyLevel['id']>('normal');
  const [battleAiRight, setBattleAiRight] = useState<AIDifficultyLevel['id']>('hard');
  const [battleTurn, setBattleTurn] = useState(0);
  const [battleState, setBattleState] = useState<GameState | null>(null);
  const battleIntervalRef = useRef<number | null>(null);
  const BATTLE_TOTAL_TURNS = 50;

  // 策略說明彈窗
  const [strategyModal, setStrategyModal] = useState<AIDifficultyLevel | null>(null);

  const generateSimulatedState = useCallback((demo: DemoReplay, turn: number): GameState => {
    const state = createInitialState('classic', [
      {
        name: demo.playerNames[0],
        color: PLAYER_COLORS[0],
        isAI: true,
        aiDifficulty: demo.difficulty,
        aiPersonality: 'aggressive',
      },
      {
        name: demo.playerNames[1],
        color: PLAYER_COLORS[1],
        isAI: true,
        aiDifficulty: demo.difficulty,
        aiPersonality: 'trader',
      },
    ]);

    const progress = turn / demo.totalTurns;
    const p0Props = Math.floor(progress * 6 + 1);
    const p1Props = Math.floor(progress * 5 + 1);

    for (let i = 1; i <= p0Props && i <= 8; i += 1) {
      const cellId = i;
      state.properties[cellId] = {
        owner: 0,
        buildings: i % 3 === 0 ? (i > 6 ? 4 : 2) : 1,
        isMortgaged: false,
      };
    }
    for (let i = 0; i < p1Props && i < 7; i += 1) {
      const cellId = 11 + i * 2;
      if (cellId < 36) {
        state.properties[cellId] = {
          owner: 1,
          buildings: i % 2 === 0 ? 1 : 3,
          isMortgaged: false,
        };
      }
    }

    const baseMoney = GAME_MODES.classic.initialMoney;
    state.players[0].money = Math.max(500, baseMoney - p0Props * 1500 + Math.floor(turn * 50));
    state.players[1].money = Math.max(500, baseMoney - p1Props * 1600 + Math.floor(turn * 45));
    state.players[0].position = Math.floor(1 + turn * 2) % 36;
    state.players[1].position = Math.floor(19 + turn * 1.7) % 36;
    state.players[0].totalAssets = state.players[0].money + p0Props * 1200;
    state.players[1].totalAssets = state.players[1].money + p1Props * 1300;
    state.currentPlayerIndex = turn % 2;

    return state;
  }, []);

  // 生成 AI 對戰的模擬狀態
  const generateBattleState = useCallback((turn: number): GameState => {
    const leftDiff = AI_DIFFICULTIES.find((d) => d.id === battleAiLeft);
    const rightDiff = AI_DIFFICULTIES.find((d) => d.id === battleAiRight);
    const state = createInitialState('classic', [
      {
        name: `${leftDiff?.name || 'AI-A'} · 左`,
        color: PLAYER_COLORS[0],
        isAI: true,
        aiDifficulty: battleAiLeft,
        aiPersonality: 'trader',
      },
      {
        name: `${rightDiff?.name || 'AI-B'} · 右`,
        color: PLAYER_COLORS[1],
        isAI: true,
        aiDifficulty: battleAiRight,
        aiPersonality: 'aggressive',
      },
    ]);

    const progress = turn / BATTLE_TOTAL_TURNS;
    // 強度越高，購買效率越高
    const leftPower = leftDiff?.power ?? 60;
    const rightPower = rightDiff?.power ?? 60;
    const leftProps = Math.min(10, Math.floor(progress * (leftPower / 8) + 1));
    const rightProps = Math.min(10, Math.floor(progress * (rightPower / 8) + 1));

    // 左側 AI 佔有底部和左側地產
    for (let i = 1; i <= leftProps && i <= 8; i += 1) {
      const cellId = i;
      state.properties[cellId] = {
        owner: 0,
        buildings: i % 3 === 0 ? (i > 6 ? 4 : 2) : 1,
        isMortgaged: false,
      };
    }
    for (let i = 0; i < leftProps - 8; i += 1) {
      const cellId = 28 + i;
      if (cellId <= 35) {
        state.properties[cellId] = {
          owner: 0,
          buildings: 1,
          isMortgaged: false,
        };
      }
    }

    // 右側 AI 佔有右側和頂部地產
    for (let i = 0; i < rightProps && i < 8; i += 1) {
      const cellId = 11 + i * 2;
      if (cellId < 27) {
        state.properties[cellId] = {
          owner: 1,
          buildings: i % 2 === 0 ? 1 : 2,
          isMortgaged: false,
        };
      }
    }
    for (let i = 0; i < rightProps - 8; i += 1) {
      const cellId = 19 + i;
      if (cellId < 27) {
        state.properties[cellId] = {
          owner: 1,
          buildings: 1,
          isMortgaged: false,
        };
      }
    }

    const baseMoney = GAME_MODES.classic.initialMoney;
    state.players[0].money = Math.max(200, baseMoney - leftProps * 1400 + Math.floor(turn * (leftPower / 20)));
    state.players[1].money = Math.max(200, baseMoney - rightProps * 1500 + Math.floor(turn * (rightPower / 20)));
    state.players[0].position = Math.floor(1 + turn * 1.8) % 36;
    state.players[1].position = Math.floor(19 + turn * 1.5) % 36;
    state.players[0].totalAssets = state.players[0].money + leftProps * 1100;
    state.players[1].totalAssets = state.players[1].money + rightProps * 1200;
    state.currentPlayerIndex = turn % 2;

    return state;
  }, [battleAiLeft, battleAiRight]);

  // 開始 AI 對戰觀察
  const startAiBattle = useCallback(() => {
    setAiBattleMode(true);
    setBattleTurn(0);
    setIsPlaying(false);
  }, []);

  const handleBattlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleBattleStepForward = useCallback(() => {
    setBattleTurn((prev) => Math.min(prev + 1, BATTLE_TOTAL_TURNS - 1));
  }, []);

  const handleBattleStepBack = useCallback(() => {
    setBattleTurn((prev) => Math.max(0, prev - 1));
  }, []);

  const handleBattleSpeed = useCallback((speed: number) => {
    setAiBattleSpeed(speed);
  }, []);

  const exitBattleMode = useCallback(() => {
    setAiBattleMode(false);
    setBattleTurn(0);
    setIsPlaying(false);
    if (battleIntervalRef.current) {
      window.clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
  }, []);

  // AI 對戰播放邏輯
  useEffect(() => {
    if (!aiBattleMode) return;
    if (isPlaying) {
      const delay = 1200 / aiBattleSpeed;
      battleIntervalRef.current = window.setInterval(() => {
        setBattleTurn((prev) => {
          if (prev >= BATTLE_TOTAL_TURNS - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else if (battleIntervalRef.current) {
      window.clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    return () => {
      if (battleIntervalRef.current) {
        window.clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }
    };
  }, [isPlaying, aiBattleMode, aiBattleSpeed]);

  // 生成對戰狀態
  useEffect(() => {
    if (aiBattleMode) {
      const state = generateBattleState(battleTurn);
      setBattleState(state);
    }
  }, [aiBattleMode, battleTurn, generateBattleState]);

  // 獲取 AI 難度資訊
  const getAiDifficulty = useCallback((id: AIDifficultyLevel['id']): AIDifficultyLevel | undefined => {
    return AI_DIFFICULTIES.find((d) => d.id === id);
  }, []);

  // 渲染 AI 難度圖示
  const renderAiIcon = (iconName: AIDifficultyLevel['icon'], color: string, size = 20) => {
    const style = { color };
    switch (iconName) {
      case 'brain': return <Brain size={size} style={style} />;
      case 'shield': return <Shield size={size} style={style} />;
      case 'zap': return <Zap size={size} style={style} />;
      case 'skull': return <Skull size={size} style={style} />;
      default: return <Brain size={size} style={style} />;
    }
  };

  useEffect(() => {
    if (selectedDemo) {
      const state = generateSimulatedState(selectedDemo, currentTurn);
      setSimulatedState(state);

      const annotation = selectedDemo.annotations.find((a) => a.turn === currentTurn);
      if (annotation) {
        setShowAnnotation(annotation);
        if (isPlaying) {
          setIsPlaying(false);
        }
      } else {
        setShowAnnotation(null);
      }
      // 注意：播放計時器由下方 [isPlaying, selectedDemo] 的 effect 統一管理，
      // 此處不可清理 playIntervalRef，否則每推進一格就會誤殺後續播放。
    }
  }, [selectedDemo, currentTurn, generateSimulatedState, isPlaying]);

  useEffect(() => {
    if (isPlaying && selectedDemo) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentTurn((prev) => {
          if (prev >= selectedDemo.totalTurns) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    } else if (playIntervalRef.current) {
      window.clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    return () => {
      if (playIntervalRef.current) {
        window.clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, selectedDemo]);

  const handleSelectDemo = (demo: DemoReplay) => {
    setSelectedDemo(demo);
    setCurrentTurn(0);
    setIsPlaying(false);
    setShowAnnotation(null);
  };

  const handleBack = () => {
    if (aiBattleMode) {
      exitBattleMode();
    } else if (selectedDemo) {
      setSelectedDemo(null);
      setCurrentTurn(0);
      setIsPlaying(false);
    } else {
      navigate('/');
    }
  };

  const handleStepForward = () => {
    if (!selectedDemo) return;
    setCurrentTurn((prev) => Math.min(prev + 1, selectedDemo.totalTurns));
  };

  const handleStepBack = () => {
    setCurrentTurn((prev) => Math.max(0, prev - 1));
  };

  const handleJumpToAnnotation = (annotation: DemoAnnotation) => {
    setCurrentTurn(annotation.turn);
    setShowAnnotation(annotation);
    setIsPlaying(false);
  };

  const getAnnotationIcon = (type: DemoAnnotation['type']) => {
    switch (type) {
      case 'strategy': return <Target size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'tip': return <Lightbulb size={16} />;
      case 'analysis': return <Brain size={16} />;
    }
  };

  const getAnnotationColor = (type: DemoAnnotation['type']) => {
    switch (type) {
      case 'strategy': return 'var(--cyan)';
      case 'warning': return 'var(--red)';
      case 'tip': return 'var(--yellow)';
      case 'analysis': return 'var(--pink)';
    }
  };

  // AI 對戰觀察模式視圖
  if (aiBattleMode && battleState) {
    const leftDiff = getAiDifficulty(battleAiLeft);
    const rightDiff = getAiDifficulty(battleAiRight);
    return (
      <div className="min-h-screen w-full flex flex-col px-3 py-4 md:px-6 md:py-6 scanlines">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <ChevronLeft size={16} />
            <span className="font-cyber tracking-wider">返回</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-cyber text-lg md:text-2xl text-neon-cyan tracking-wider truncate">
              AI 對戰觀察室
            </h1>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              觀察不同難度 AI 之間的自動對局
            </p>
          </div>
          <div
            className="px-2 py-1 rounded text-[10px] font-cyber tracking-wider flex items-center gap-1"
            style={{
              border: '1px solid var(--purple)',
              color: 'var(--purple)',
              backgroundColor: 'rgba(155, 89, 255, 0.1)',
            }}
          >
            <Eye size={10} />
            觀察模式
          </div>
        </div>

        {/* 對戰雙方資訊 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="cyber-card p-3 text-center"
            style={{
              borderColor: `${leftDiff?.color || 'var(--cyan)'}60`,
              boxShadow: `0 0 15px ${leftDiff?.color || 'var(--cyan)'}20`,
            }}
          >
            <div className="flex justify-center mb-2">
              {renderAiIcon(leftDiff?.icon || 'brain', leftDiff?.color || 'var(--cyan)', 24)}
            </div>
            <div
              className="font-cyber text-sm tracking-wider mb-1"
              style={{ color: leftDiff?.color || 'var(--cyan)' }}
            >
              {leftDiff?.name || 'AI 左'}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              戰鬥力 {leftDiff?.power ?? 0}
            </div>
          </div>
          <div
            className="cyber-card p-3 text-center"
            style={{
              borderColor: `${rightDiff?.color || 'var(--pink)'}60`,
              boxShadow: `0 0 15px ${rightDiff?.color || 'var(--pink)'}20`,
            }}
          >
            <div className="flex justify-center mb-2">
              {renderAiIcon(rightDiff?.icon || 'zap', rightDiff?.color || 'var(--pink)', 24)}
            </div>
            <div
              className="font-cyber text-sm tracking-wider mb-1"
              style={{ color: rightDiff?.color || 'var(--pink)' }}
            >
              {rightDiff?.name || 'AI 右'}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              戰鬥力 {rightDiff?.power ?? 0}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* Board + Controls */}
          <div className="flex-1 flex flex-col">
            <div
              className="cyber-card p-3 md:p-4 mb-3 flex-shrink-0"
              style={{ borderColor: 'var(--border-neon-cyan)' }}
            >
              <Board gameState={battleState} onCellClick={() => {}} />
            </div>

            {/* Playback controls */}
            <div
              className="cyber-card p-3 md:p-4 flex flex-col gap-3"
              style={{ borderColor: 'rgba(255, 107, 157, 0.3)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs font-cyber tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  回合 {battleTurn + 1} / {BATTLE_TOTAL_TURNS}
                </span>
                <span
                  className="text-xs font-cyber"
                  style={{ color: PLAYER_COLORS[battleState.currentPlayerIndex] }}
                >
                  {battleState.players[battleState.currentPlayerIndex].name} 行動
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-[var(--bg-mid)] relative">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((battleTurn + 1) / BATTLE_TOTAL_TURNS) * 100}%`,
                    background: 'linear-gradient(90deg, var(--cyan), var(--pink))',
                    boxShadow: '0 0 8px var(--cyan)',
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleBattleStepBack}
                  className="cyber-btn w-10 h-10 flex items-center justify-center"
                  style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                >
                  <SkipBack size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleBattlePlayPause}
                  className="cyber-btn cyber-btn-pink w-14 h-14 rounded-full flex items-center justify-center"
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
                </button>
                <button
                  type="button"
                  onClick={handleBattleStepForward}
                  className="cyber-btn w-10 h-10 flex items-center justify-center"
                  style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* 速度切換 */}
              <div className="flex items-center justify-center gap-1">
                <Gauge size={14} style={{ color: 'var(--text-secondary)' }} />
                {[0.5, 1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleBattleSpeed(speed)}
                    className={`cyber-btn px-2 py-1 text-[10px] font-cyber ${aiBattleSpeed === speed ? '' : 'opacity-60'}`}
                    style={{
                      borderColor: aiBattleSpeed === speed ? 'var(--cyan)' : 'var(--border-neon)',
                      color: aiBattleSpeed === speed ? 'var(--cyan)' : 'var(--text-secondary)',
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: AI 狀態面板 */}
          <div className="lg:w-80 flex flex-col gap-3">
            {battleState.players.map((p, idx) => {
              const diff = idx === 0 ? leftDiff : rightDiff;
              const pColor = idx === 0 ? 'var(--cyan)' : 'var(--pink)';
              const props = Object.values(battleState.properties).filter(pr => pr.owner === idx).length;
              return (
                <div
                  key={idx}
                  className="cyber-card p-4"
                  style={{
                    borderColor: idx === battleState.currentPlayerIndex ? pColor : 'var(--border-neon-cyan)',
                    boxShadow: idx === battleState.currentPlayerIndex
                      ? `0 0 15px ${pColor}30`
                      : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {renderAiIcon(diff?.icon || 'brain', pColor, 16)}
                    <span className="font-cyber text-sm tracking-wider" style={{ color: pColor }}>
                      {p.name}
                    </span>
                    {idx === battleState.currentPlayerIndex && (
                      <span
                        className="ml-auto text-[9px] font-cyber px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${pColor}22`, color: pColor }}
                      >
                        行動中
                      </span>
                    )}
                  </div>
                  <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex justify-between">
                      <span>現金</span>
                      <span style={{ color: 'var(--green)' }}>${p.money.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>地產</span>
                      <span style={{ color: 'var(--cyan)' }}>{props} 塊</span>
                    </div>
                    <div className="flex justify-between">
                      <span>總資產</span>
                      <span className="font-cyber" style={{ color: pColor }}>
                        ${p.totalAssets?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="cyber-card p-3" style={{ borderColor: 'var(--border-neon-cyan)' }}>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                <Info size={14} />
                <span className="text-xs font-cyber tracking-wider">對戰分析</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {getBattleAnalysis(battleTurn, leftDiff, rightDiff)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDemo && simulatedState) {
    return (
      <div className="min-h-screen w-full flex flex-col px-3 py-4 md:px-6 md:py-6 scanlines">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <ChevronLeft size={16} />
            <span className="font-cyber tracking-wider">列表</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-cyber text-lg md:text-2xl text-neon-cyan tracking-wider truncate">
              {selectedDemo.title}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {selectedDemo.description}
            </p>
          </div>
          <div
            className="px-2 py-1 rounded text-[10px] font-cyber tracking-wider flex items-center gap-1"
            style={{
              border: '1px solid var(--red)',
              color: 'var(--red)',
              backgroundColor: 'rgba(255, 77, 109, 0.1)',
            }}
          >
            <Zap size={10} />
            {selectedDemo.difficulty === 'hell' ? '地獄級' : '困難級'}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* Board + Controls */}
          <div className="flex-1 flex flex-col">
            <div className="cyber-card p-3 md:p-4 mb-3 flex-shrink-0" style={{ borderColor: 'var(--border-neon-cyan)' }}>
              <Board gameState={simulatedState} onCellClick={() => {}} />
            </div>

            {/* Playback controls */}
            <div
              className="cyber-card p-3 md:p-4 flex flex-col gap-3"
              style={{ borderColor: 'rgba(255, 107, 157, 0.3)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  回合 {currentTurn} / {selectedDemo.totalTurns}
                </span>
                <span className="text-xs font-cyber" style={{ color: PLAYER_COLORS[simulatedState.currentPlayerIndex] }}>
                  {simulatedState.players[simulatedState.currentPlayerIndex].name} 行動
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-[var(--bg-mid)] relative">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(currentTurn / selectedDemo.totalTurns) * 100}%`,
                    background: 'linear-gradient(90deg, var(--cyan), var(--pink))',
                    boxShadow: '0 0 8px var(--cyan)',
                  }}
                />
                {selectedDemo.annotations.map((ann) => (
                  <button
                    key={ann.turn}
                    type="button"
                    onClick={() => handleJumpToAnnotation(ann)}
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full -ml-1 hover:scale-150 transition-transform"
                    style={{
                      left: `${(ann.turn / selectedDemo.totalTurns) * 100}%`,
                      backgroundColor: getAnnotationColor(ann.type),
                      boxShadow: `0 0 6px ${getAnnotationColor(ann.type)}`,
                    }}
                    title={`回合 ${ann.turn}: ${ann.title}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStepBack}
                  className="cyber-btn w-10 h-10 flex items-center justify-center"
                  style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                >
                  <SkipBack size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="cyber-btn cyber-btn-pink w-14 h-14 rounded-full flex items-center justify-center"
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
                </button>
                <button
                  type="button"
                  onClick={handleStepForward}
                  className="cyber-btn w-10 h-10 flex items-center justify-center"
                  style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                >
                  <SkipForward size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: annotation + key moments list */}
          <div className="lg:w-80 flex flex-col gap-3">
            {/* Current annotation */}
            {showAnnotation && (
              <div
                className="cyber-card p-4 animate-fade-in"
                style={{
                  borderColor: getAnnotationColor(showAnnotation.type),
                  boxShadow: `0 0 15px ${getAnnotationColor(showAnnotation.type)}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${getAnnotationColor(showAnnotation.type)}20`,
                      color: getAnnotationColor(showAnnotation.type),
                    }}
                  >
                    {getAnnotationIcon(showAnnotation.type)}
                  </span>
                  <div>
                    <div className="text-[10px] font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      關鍵決策 · 回合 {showAnnotation.turn}
                    </div>
                    <div className="font-cyber text-base tracking-wider" style={{ color: getAnnotationColor(showAnnotation.type) }}>
                      {showAnnotation.title}
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {showAnnotation.content}
                </p>
              </div>
            )}

            {!showAnnotation && (
              <div className="cyber-card p-4" style={{ borderColor: 'var(--border-neon-cyan)' }}>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Info size={14} />
                  <span className="text-xs font-cyber tracking-wider">繼續播放以查看關鍵決策分析</span>
                </div>
              </div>
            )}

            {/* Key moments list */}
            <div className="cyber-card p-3 flex-1 overflow-y-auto" style={{ borderColor: 'rgba(77, 195, 255, 0.2)' }}>
              <div className="text-xs font-cyber tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--blue)' }}>
                <Brain size={14} />
                <span>關鍵決策點 ({selectedDemo.annotations.length})</span>
              </div>
              <div className="space-y-2">
                {selectedDemo.annotations.map((ann) => {
                  const isActive = showAnnotation?.turn === ann.turn;
                  const color = getAnnotationColor(ann.type);
                  return (
                    <button
                      key={ann.turn}
                      type="button"
                      onClick={() => handleJumpToAnnotation(ann)}
                      className="w-full text-left p-2 rounded transition-all"
                      style={{
                        border: `1px solid ${isActive ? color : `${color}30`}`,
                        backgroundColor: isActive ? `${color}15` : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-cyber px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${color}22`, color }}
                        >
                          回合 {ann.turn}
                        </span>
                        <span className="text-xs font-cyber tracking-wide" style={{ color }}>
                          {ann.title}
                        </span>
                      </div>
                      <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {ann.content}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <ChevronLeft size={16} />
            <span className="font-cyber tracking-wider">返回</span>
          </button>
          <div>
            <h1 className="font-cyber text-2xl md:text-4xl text-neon-cyan tracking-wider pulse-glow">
              AI 示範棋譜
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-cyber tracking-wider mt-1">
              頂級AI對局解構 · 關鍵決策深度分析
            </p>
          </div>
        </div>

        {/* Intro */}
        <div
          className="cyber-card p-4 mb-6"
          style={{
            borderColor: 'rgba(255, 107, 157, 0.3)',
            background: 'rgba(255, 107, 157, 0.03)',
          }}
        >
          <div className="flex items-start gap-3">
            <Brain className="flex-shrink-0 mt-0.5" style={{ color: 'var(--pink)' }} size={20} />
            <div className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <p>觀摩頂級AI的對局過程，學習職業級策略思維。</p>
              <p className="text-xs">
                每個示範棋譜包含多個<span style={{ color: 'var(--pink)' }}>關鍵決策點</span>，
                到達時自動暫停並顯示繁體中文註解，解讀AI背後的計算邏輯。
              </p>
            </div>
          </div>
        </div>

        {/* AI 難度等級展示 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={20} style={{ color: 'var(--cyan)' }} />
            <h2 className="font-cyber text-xl tracking-wider" style={{ color: 'var(--cyan)', textShadow: '0 0 8px var(--cyan)' }}>
              AI 難度等級
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_DIFFICULTIES.map((diff) => (
              <div
                key={diff.id}
                className="cyber-card p-4 transition-all hover:scale-[1.01]"
                style={{
                  borderColor: `${diff.color}60`,
                  boxShadow: `0 0 12px ${diff.color}20`,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${diff.color}15` }}
                    >
                      {renderAiIcon(diff.icon, diff.color, 22)}
                    </div>
                    <div>
                      <h3
                        className="font-cyber text-base tracking-wider"
                        style={{ color: diff.color, textShadow: `0 0 6px ${diff.color}` }}
                      >
                        {diff.name}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {diff.recommendedFor}
                      </p>
                    </div>
                  </div>
                  <span
                    className="font-cyber text-lg tracking-wider"
                    style={{ color: diff.color }}
                  >
                    {diff.power}
                  </span>
                </div>

                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {diff.description}
                </p>

                {/* 戰鬥力進度條 */}
                <div className="mb-3">
                  <div className="w-full h-2 rounded-full bg-[var(--bg-mid)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${diff.power}%`,
                        backgroundColor: diff.color,
                        boxShadow: `0 0 8px ${diff.color}`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] font-cyber" style={{ color: 'var(--text-muted)' }}>
                    <span>戰鬥力</span>
                    <span style={{ color: diff.color }}>{diff.power} / 100</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStrategyModal(diff)}
                    className="cyber-btn flex-1 px-3 py-1.5 text-xs font-cyber tracking-wide flex items-center justify-center gap-1"
                    style={{ borderColor: diff.color, color: diff.color }}
                  >
                    <Info size={12} />
                    策略說明
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBattleAiLeft(diff.id);
                      setBattleAiRight(diff.id === 'hell' ? 'hard' : 'hell');
                      startAiBattle();
                    }}
                    className="cyber-btn flex-1 px-3 py-1.5 text-xs font-cyber tracking-wide flex items-center justify-center gap-1"
                    style={{
                      borderColor: 'var(--pink)',
                      color: 'var(--pink)',
                      backgroundColor: 'rgba(255, 107, 157, 0.08)',
                    }}
                  >
                    <Play size={12} />
                    觀看演示
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 觀察 AI 對戰 */}
        <div
          className="cyber-card p-4 md:p-5 mb-8"
          style={{
            borderColor: 'rgba(155, 89, 255, 0.4)',
            background: 'linear-gradient(135deg, rgba(155, 89, 255, 0.05), rgba(255, 107, 157, 0.03))',
            boxShadow: '0 0 20px rgba(155, 89, 255, 0.1)',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(155, 89, 255, 0.15)' }}>
              <Swords size={22} style={{ color: 'var(--purple)' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-cyber text-lg tracking-wider mb-1" style={{ color: 'var(--purple)', textShadow: '0 0 8px rgba(155, 89, 255, 0.5)' }}>
                觀察 AI 對戰
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                選擇兩個不同難度的 AI 進行自動對戰演示，觀察不同策略的碰撞
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[10px] font-cyber tracking-wide mb-1 block" style={{ color: 'var(--cyan)' }}>
                左側 AI
              </label>
              <select
                value={battleAiLeft}
                onChange={(e) => setBattleAiLeft(e.target.value as AIDifficultyLevel['id'])}
                className="cyber-input w-full px-3 py-2 text-sm font-cyber"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)', backgroundColor: 'var(--bg-dark)' }}
              >
                {AI_DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} · 戰力{d.power}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <Sparkles size={24} style={{ color: 'var(--pink)' }} />
            </div>

            <div>
              <label className="text-[10px] font-cyber tracking-wide mb-1 block" style={{ color: 'var(--pink)' }}>
                右側 AI
              </label>
              <select
                value={battleAiRight}
                onChange={(e) => setBattleAiRight(e.target.value as AIDifficultyLevel['id'])}
                className="cyber-input w-full px-3 py-2 text-sm font-cyber"
                style={{ borderColor: 'var(--pink)', color: 'var(--pink)', backgroundColor: 'var(--bg-dark)' }}
              >
                {AI_DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} · 戰力{d.power}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={startAiBattle}
            className="cyber-btn w-full mt-4 py-3 font-cyber tracking-wider flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--purple)',
              color: 'var(--purple)',
              backgroundColor: 'rgba(155, 89, 255, 0.1)',
              boxShadow: '0 0 15px rgba(155, 89, 255, 0.2)',
            }}
          >
            <Eye size={18} />
            開始觀察對戰
          </button>
        </div>

        {/* Demo list */}
        <div className="space-y-4">
          {AI_DEMO_REPLAYS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => handleSelectDemo(demo)}
              className="w-full cyber-card p-4 md:p-5 text-left transition-all hover:scale-[1.01]"
              style={{
                borderColor: demo.difficulty === 'hell'
                  ? 'rgba(255, 77, 109, 0.4)'
                  : 'rgba(77, 195, 255, 0.3)',
                boxShadow: demo.difficulty === 'hell'
                  ? '0 0 15px rgba(255, 77, 109, 0.15)'
                  : '0 0 10px rgba(77, 195, 255, 0.1)',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3
                  className="font-cyber text-lg md:text-xl tracking-wider"
                  style={{
                    color: demo.difficulty === 'hell' ? 'var(--red)' : 'var(--cyan)',
                    textShadow: `0 0 8px ${demo.difficulty === 'hell' ? 'var(--red)' : 'var(--cyan-glow)'}`,
                  }}
                >
                  {demo.title}
                </h3>
                <div
                  className="flex-shrink-0 px-2 py-1 rounded text-[10px] font-cyber tracking-wider flex items-center gap-1"
                  style={{
                    border: `1px solid ${demo.difficulty === 'hell' ? 'var(--red)' : 'var(--pink)'}`,
                    color: demo.difficulty === 'hell' ? 'var(--red)' : 'var(--pink)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  }}
                >
                  <Zap size={10} />
                  {demo.difficulty === 'hell' ? '地獄級' : '困難級'}
                </div>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {demo.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--text-secondary)' }} className="font-cyber tracking-wide">
                    {demo.playerNames.join('  vs  ')}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span style={{ color: 'var(--text-secondary)' }} className="flex items-center gap-1">
                    <Trophy size={12} />
                    {demo.totalTurns} 回合
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span style={{ color: 'var(--text-secondary)' }} className="flex items-center gap-1">
                    <Brain size={12} />
                    {demo.annotations.length} 個關鍵點
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 策略說明彈窗 */}
      {strategyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="cyber-card p-5 md:p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{
              borderColor: strategyModal.color,
              boxShadow: `0 0 30px ${strategyModal.color}30`,
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${strategyModal.color}20` }}
                >
                  {renderAiIcon(strategyModal.icon, strategyModal.color, 28)}
                </div>
                <div>
                  <h3
                    className="font-cyber text-xl tracking-wider"
                    style={{
                      color: strategyModal.color,
                      textShadow: `0 0 8px ${strategyModal.color}`,
                    }}
                  >
                    {strategyModal.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    戰鬥力 {strategyModal.power} / 100
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStrategyModal(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {strategyModal.description}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                推薦對象：{strategyModal.recommendedFor}
              </p>
            </div>

            {/* 戰鬥力進度條 */}
            <div className="mb-5">
              <div className="w-full h-3 rounded-full bg-[var(--bg-mid)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${strategyModal.power}%`,
                    backgroundColor: strategyModal.color,
                    boxShadow: `0 0 10px ${strategyModal.color}`,
                  }}
                />
              </div>
            </div>

            <div>
              <div
                className="text-xs font-cyber tracking-wider mb-3 flex items-center gap-2"
                style={{ color: strategyModal.color }}
              >
                <Brain size={14} />
                策略特點
              </div>
              <div className="space-y-3">
                {strategyModal.strategies.map((strategy, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded"
                    style={{ backgroundColor: `${strategyModal.color}08` }}
                  >
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-cyber mt-0.5"
                      style={{
                        backgroundColor: `${strategyModal.color}20`,
                        color: strategyModal.color,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {strategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBattleAiLeft(strategyModal.id);
                  setBattleAiRight(strategyModal.id === 'hell' ? 'hard' : 'hell');
                  setStrategyModal(null);
                  startAiBattle();
                }}
                className="cyber-btn flex-1 py-2 font-cyber tracking-wide text-sm flex items-center justify-center gap-2"
                style={{
                  borderColor: strategyModal.color,
                  color: strategyModal.color,
                }}
              >
                <Play size={14} />
                觀看演示
              </button>
              <button
                type="button"
                onClick={() => setStrategyModal(null)}
                className="cyber-btn px-4 py-2 font-cyber tracking-wide text-sm"
                style={{
                  borderColor: 'var(--text-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 對戰分析文本
function getBattleAnalysis(
  turn: number,
  leftDiff: AIDifficultyLevel | undefined,
  rightDiff: AIDifficultyLevel | undefined,
): string {
  const leftPower = leftDiff?.power ?? 50;
  const rightPower = rightDiff?.power ?? 50;
  const diff = leftPower - rightPower;

  if (turn < 5) {
    return '對局初期，雙方 AI 都在快速擴張地產版圖。低難度 AI 傾向見地就買，高難度 AI 則開始篩選核心區塊。';
  }
  if (turn < 15) {
    if (Math.abs(diff) > 20) {
      return `${diff > 0 ? leftDiff?.name : rightDiff?.name} 憑藉更優的決策品質，在土地 acquisition 階段明顯領先。套裝成型速度更快。`;
    }
    return '雙方勢均力敵，各自累積了數塊地產。接下來的套裝爭奪戰將成為勝負關鍵。';
  }
  if (turn < 30) {
    if (Math.abs(diff) > 20) {
      return '高難度 AI 開始利用資產優勢升級建築，過路費收入滾雪球式增長。低難度 AI 現金流壓力逐漸顯現。';
    }
    return '中期階段，雙方都開始升級建築並嘗試交易。地獄級 AI 在此階段會精準計算對方路過機率來決定建房時機。';
  }
  if (turn < 45) {
    if (Math.abs(diff) > 20) {
      return '戰局已基本明朗。高難度 AI 憑藉前期積累的資產優勢，正在逐步吞噬對手的現金儲備。';
    }
    return '後期鏖戰，雙方資產龐大，一次高額過路費就可能逆轉局勢。地獄級 AI 在此時會尋找致命一擊的機會。';
  }
  return '對局接近尾聲。最終勝負取決於誰的現金管理更為出色，以及誰能在對方踩中自己的高級建築時給予最後一擊。';
}

export default AIDemoPage;
