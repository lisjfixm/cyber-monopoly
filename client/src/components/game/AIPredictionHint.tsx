import { FC, useEffect, useMemo, useState } from 'react';
import {
  Brain,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  TrendingDown,
  Target,
  Wallet,
} from 'lucide-react';

import type { GameState, PlayerState, CellConfig } from '@shared/api.interface';
import { CELLS, PLAYER_COLOR_HEX } from '@shared/game-config';

interface AIPredictionHintProps {
  gameState: GameState | null;
  humanPlayerIndex: number;
}

interface Prediction {
  type: 'toll_risk' | 'acquisition_target' | 'next_dest' | 'build_plan';
  title: string;
  detail: string;
  confidence: 'high' | 'medium' | 'low';
  aiIndex: number;
}

const PREDICTION_STORAGE_KEY = 'monopoly_ai_prediction_enabled';
const PREDICTION_COLLAPSED_KEY = 'monopoly_ai_prediction_collapsed';

const loadPredictionEnabled = (): boolean => {
  try {
    const raw = localStorage.getItem(PREDICTION_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
};

const savePredictionEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(PREDICTION_STORAGE_KEY, String(enabled));
  } catch {
    // ignore
  }
};

const loadCollapsed = (): boolean => {
  try {
    return localStorage.getItem(PREDICTION_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
};

const saveCollapsed = (collapsed: boolean): void => {
  try {
    localStorage.setItem(PREDICTION_COLLAPSED_KEY, String(collapsed));
  } catch {
    // ignore
  }
};

const getPlayerOwnedCells = (state: GameState, playerIndex: number): number[] => {
  const owned: number[] = [];
  for (let i = 0; i < 36; i += 1) {
    const prop = state.properties[i];
    if (prop && prop.owner === playerIndex) {
      owned.push(i);
    }
  }
  return owned;
};

const getDistanceToCell = (from: number, to: number): number => {
  return (to - from + 36) % 36;
};

const estimateNextPositions = (position: number): number[] => {
  const results: number[] = [];
  for (let d1 = 1; d1 <= 6; d1 += 1) {
    for (let d2 = 1; d2 <= 6; d2 += 1) {
      const steps = d1 + d2;
      const pos = (position + steps) % 36;
      if (!results.includes(pos)) {
        results.push(pos);
      }
    }
  }
  return results;
};

const generatePredictions = (
  state: GameState,
  humanIdx: number,
): Prediction[] => {
  const predictions: Prediction[] = [];
  const aiPlayers = state.players.filter(
    (p: PlayerState) => p.isAI && !p.isBankrupt && p.playerIndex !== humanIdx,
  );

  if (aiPlayers.length === 0) return predictions;

  const humanOwned = getPlayerOwnedCells(state, humanIdx);
  const humanColor = PLAYER_COLOR_HEX[state.players[humanIdx]?.color] || 'var(--red)';

  for (const ai of aiPlayers) {
    const aiIdx = ai.playerIndex;
    const aiOwned = getPlayerOwnedCells(state, aiIdx);
    const aiColor = PLAYER_COLOR_HEX[ai.color] || 'var(--blue)';

    const nextPositions = estimateNextPositions(ai.position);

    // 1. 過路費風險：AI 下一步可能踩到的人類地產
    const humanTollCells: number[] = [];
    for (const pos of nextPositions) {
      const prop = state.properties[pos];
      if (prop && prop.owner === humanIdx) {
        humanTollCells.push(pos);
      }
    }
    if (humanTollCells.length > 0) {
      const cellIdx = humanTollCells[0];
      const cell = CELLS[cellIdx];
      const distance = getDistanceToCell(ai.position, cellIdx);
      predictions.push({
        type: 'toll_risk',
        aiIndex: aiIdx,
        title: `${ai.name} 即將抵達你的地`,
        detail: `距離 ${cell?.name || cellIdx} 號格還有約 ${distance} 步，預計可收取過路費。`,
        confidence: distance <= 7 ? 'high' : distance <= 12 ? 'medium' : 'low',
      });
    }

    // 2. AI 可能想收購的人類地塊
    if (humanOwned.length >= 2 && ai.money > 2000) {
      // 找 AI 快要湊齊系列的關鍵地
      const aiSeriesMap = new Map<string, number[]>();
      for (const pos of aiOwned) {
        const cell = CELLS[pos];
        if (cell?.setId) {
          const series = cell.setId;
          const arr = aiSeriesMap.get(series) || [];
          arr.push(pos);
          aiSeriesMap.set(series, arr);
        }
      }

      for (const [series, aiCells] of aiSeriesMap) {
        if (aiCells.length >= 1 && aiCells.length < 3) {
          const humanInSeries = humanOwned.filter(
            (pos) => CELLS[pos]?.setId === series,
          );
          if (humanInSeries.length > 0) {
            const targetPos = humanInSeries[0];
            const targetCell = CELLS[targetPos];
            predictions.push({
              type: 'acquisition_target',
              aiIndex: aiIdx,
              title: `${ai.name} 可能想收購你的${targetCell?.name || '地塊'}`,
              detail: `${ai.name} 在「${series}」系列已有 ${aiCells.length} 塊，若取得此塊可湊齊套裝，後續威脅大增。`,
              confidence: ai.money > 5000 ? 'high' : 'medium',
            });
            break;
          }
        }
      }
    }

    // 3. AI 即將到達的重要位置
    for (const pos of nextPositions) {
      const cell = CELLS[pos];
      if (!cell) continue;
      const dist = getDistanceToCell(ai.position, pos);
      if (dist > 9) continue;

      if (cell.type === 'fate') {
        predictions.push({
          type: 'next_dest',
          aiIndex: aiIdx,
          title: `${ai.name} 可能抽到命運卡`,
          detail: `距離命運區約 ${dist} 步，金額事件可能改變局勢。`,
          confidence: 'medium',
        });
        break;
      }
      if (cell.type === 'start') {
        predictions.push({
          type: 'next_dest',
          aiIndex: aiIdx,
          title: `${ai.name} 即將經過起點`,
          detail: `約 ${dist} 步後可領取起點獎金，現金更加充裕。`,
          confidence: dist <= 4 ? 'high' : 'medium',
        });
        break;
      }
    }

    if (predictions.length >= 3) break;
  }

  return predictions.slice(0, 3);
};

const getPredictionIcon = (type: Prediction['type']) => {
  switch (type) {
    case 'toll_risk': return <Wallet size={14} />;
    case 'acquisition_target': return <Target size={14} />;
    case 'next_dest': return <TrendingDown size={14} />;
    case 'build_plan': return <Target size={14} />;
  }
};

const getPredictionColor = (type: Prediction['type']) => {
  switch (type) {
    case 'toll_risk': return 'var(--green)';
    case 'acquisition_target': return 'var(--red)';
    case 'next_dest': return 'var(--cyan)';
    case 'build_plan': return 'var(--yellow)';
  }
};

const getConfidenceLabel = (confidence: Prediction['confidence']) => {
  switch (confidence) {
    case 'high': return '高機率';
    case 'medium': return '中機率';
    case 'low': return '低機率';
  }
};

const AIPredictionHint: FC<AIPredictionHintProps> = ({ gameState, humanPlayerIndex }) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setEnabled(loadPredictionEnabled());
    setCollapsed(loadCollapsed());
  }, []);

  const predictions = useMemo(() => {
    if (!gameState || !enabled) return [];
    return generatePredictions(gameState, humanPlayerIndex);
  }, [gameState, enabled, humanPlayerIndex]);

  const toggleEnabled = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    savePredictionEnabled(newVal);
  };

  const toggleCollapsed = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    saveCollapsed(newVal);
  };

  if (!gameState || gameState.phase === 'ended') return null;
  if (!enabled) {
    return (
      <button
        type="button"
        onClick={toggleEnabled}
        className="fixed right-4 bottom-4 z-40 cyber-btn w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          borderColor: 'var(--cyan)',
          color: 'var(--cyan)',
          backgroundColor: 'var(--bg-dark)',
          boxShadow: '0 0 10px rgba(77, 195, 255, 0.3)',
        }}
        title="開啟 AI 對手預判提示"
      >
        <EyeOff size={18} />
      </button>
    );
  }

  return (
    <div
      className="fixed right-4 bottom-4 z-40 w-72 md:w-80 cyber-card overflow-hidden"
      style={{
        borderColor: 'rgba(77, 195, 255, 0.4)',
        boxShadow: '0 0 15px rgba(77, 195, 255, 0.2)',
        backgroundColor: 'rgba(10, 10, 20, 0.92)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={toggleCollapsed}
        style={{
          borderBottom: collapsed ? 'none' : '1px solid rgba(77, 195, 255, 0.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(77, 195, 255, 0.15)',
              color: 'var(--cyan)',
            }}
          >
            <Brain size={14} />
          </div>
          <div>
            <div className="text-xs font-cyber tracking-wider" style={{ color: 'var(--cyan)' }}>
              對手預判
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              AI 下一步可能行為
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleEnabled();
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="關閉提示"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-2 max-h-64 overflow-y-auto space-y-2">
          {predictions.length === 0 ? (
            <div className="py-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              暂无有效預判
            </div>
          ) : (
            predictions.map((pred, idx) => {
              const color = getPredictionColor(pred.type);
              return (
                <div
                  key={`${pred.aiIndex}-${pred.type}-${idx}`}
                  className="p-2 rounded animate-fade-in"
                  style={{
                    border: `1px solid ${color}22`,
                    backgroundColor: `${color}08`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {getPredictionIcon(pred.type)}
                    </span>
                    <span className="text-xs font-medium" style={{ color }}>
                      {pred.title}
                    </span>
                    <span
                      className="ml-auto text-[9px] font-cyber px-1 py-0.5 rounded"
                      style={{
                        backgroundColor: `${color}20`,
                        color,
                      }}
                    >
                      {getConfidenceLabel(pred.confidence)}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-6.5" style={{ color: 'var(--text-secondary)' }}>
                    {pred.detail}
                  </p>
                </div>
              );
            })
          )}

          <div
            className="text-[10px] text-center pt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            預判僅供參考，實際結果取決於擲骰運氣
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionHint;
