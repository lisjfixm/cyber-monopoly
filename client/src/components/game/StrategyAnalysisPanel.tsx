import { FC, useMemo, useState } from 'react';
import {
  X,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  ChevronRight,
  BarChart3,
  Coins,
  Home,
} from 'lucide-react';

import type { GameStats, PlayerStats } from '@shared/api.interface';
import { PLAYER_COLOR_HEX, CELLS } from '@shared/game-config';

interface StrategyAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats | null;
  humanPlayerIndex?: number;
}

interface AnalysisPoint {
  id: string;
  turn: number;
  title: string;
  description: string;
  category: 'turning_point' | 'mistake' | 'good_move' | 'tip';
  impact: 'high' | 'medium' | 'low';
  playerIndex: number;
  simulation?: {
    whatIf: string;
    outcome: string;
    cashflowDelta: number;
  };
}

const generateAnalysisPoints = (stats: GameStats, humanIdx: number): AnalysisPoint[] => {
  const points: AnalysisPoint[] = [];
  const players = stats.players;
  const human = players[humanIdx];
  if (!human) return points;

  const totalTurns = stats.totalTurns || 30;

  if (human.tollExpense > 0) {
    const tollPercent = Math.round((human.tollExpense / (human.finalMoney + human.tollExpense)) * 100);
    points.push({
      id: 'tp-1',
      turn: Math.floor(totalTurns * 0.3),
      title: '過路費支出占比過高',
      description: `本局你支付了 ${human.tollExpense.toLocaleString()} 元過路費，約占總資金流的 ${tollPercent}%。建議優先購買對方經常經過的地塊系列，形成套裝反制，而非分散買地。`,
      category: 'mistake',
      impact: 'high',
      playerIndex: humanIdx,
      simulation: {
        whatIf: '若第5回合搶下對方必經的核心區塊',
        outcome: `預計可減少 ${Math.round(human.tollExpense * 0.4).toLocaleString()} 元過路費支出，並增加 ${Math.round(human.tollExpense * 0.25).toLocaleString()} 元收入`,
        cashflowDelta: Math.round(human.tollExpense * 0.65),
      },
    });
  }

  if (human.completeSets === 0 && players.some((p: PlayerStats) => p.completeSets > 0)) {
    points.push({
      id: 'tp-2',
      turn: Math.floor(totalTurns * 0.5),
      title: '未湊齊任何套裝是敗局關鍵',
      description: '你本局擁有散地但未形成任何套裝。在大富翁中，套裝的過路費加成（3倍起跳）遠比地塊數量重要。原則：寧可少買3塊散地，也要確保1個系列完整。',
      category: 'turning_point',
      impact: 'high',
      playerIndex: humanIdx,
      simulation: {
        whatIf: '假如第12回合用2塊散地交易換取1塊關鍵套裝地',
        outcome: '套裝達成後單次過路費可從600元跳升至1500元，10回合內即可額外獲利約9000元',
        cashflowDelta: 9000,
      },
    });
  }

  if (human.auctionWins > 0) {
    points.push({
      id: 'tp-3',
      turn: Math.floor(totalTurns * 0.4),
      title: '拍賣策略值得肯定',
      description: `你在拍賣中贏得了 ${human.auctionWins} 次。拍賣是低價獲取關鍵地塊的重要渠道，特別是對方也想要的地塊，若能在拍賣中以低於市價入手，長期收益可觀。`,
      category: 'good_move',
      impact: 'medium',
      playerIndex: humanIdx,
    });
  }

  if (human.tradeCount > 0) {
    points.push({
      id: 'tp-4',
      turn: Math.floor(totalTurns * 0.6),
      title: '交易次數偏少',
      description: `你本局僅發起 ${human.tradeCount} 次交易。交易是扭轉劣勢的最快方式——當你缺某塊地才能湊齊套裝時，主動用對方想要的牌去換，比單純擲骰等著踩到要高效得多。`,
      category: 'tip',
      impact: 'medium',
      playerIndex: humanIdx,
    });
  }

  if (human.totalAssets > 0) {
    const propertyValue = human.totalAssets - human.finalMoney;
    const propertyRatio = Math.round((propertyValue / human.totalAssets) * 100);
    if (propertyRatio > 85) {
      points.push({
        id: 'tp-5',
        turn: Math.floor(totalTurns * 0.7),
        title: '資產配置過於集中在不動產',
        description: `你 ${propertyRatio}% 的資產綁在房地產上，現金僅剩 ${human.finalMoney.toLocaleString()} 元。一旦連續踩到對方高額地塊，容易被迫賤賣地產套現。建議隨時保留至少總資產 15% 的現金。`,
        category: 'mistake',
        impact: 'medium',
        playerIndex: humanIdx,
        simulation: {
          whatIf: '若提前抵押1塊非套裝地補充現金',
          outcome: `現金增加約 ${Math.round(propertyValue * 0.15).toLocaleString()} 元，可避免被迫賤賣套裝地產導致的套裝喪失損失`,
          cashflowDelta: -Math.round(propertyValue * 0.05),
        },
      });
    }
  }

  if (human.detentionCount > 2) {
    points.push({
      id: 'tp-6',
      turn: Math.floor(totalTurns * 0.5),
      title: '進入禁閉區次數偏多',
      description: `你本局限留在禁閉區 ${human.detentionCount} 次，錯過了約 ${human.detentionCount * 2} 次購地機會。禁閉區對前期擴張極為不利，後局反而有保護作用。前期應盡快繳納保釋金出場搶地。`,
      category: 'tip',
      impact: 'low',
      playerIndex: humanIdx,
    });
  }

  if (points.length < 3) {
    points.push({
      id: 'tp-default',
      turn: Math.floor(totalTurns * 0.5),
      title: '整體策略平衡',
      description: '本局你的決策整體較為均衡，沒有特別明顯的失誤。提升空間在於：更主動地利用交易系統來加速套裝達成，以及在建屋時機的選擇上更為精準。',
      category: 'good_move',
      impact: 'low',
      playerIndex: humanIdx,
    });
  }

  return points.slice(0, 6);
};

const getCategoryIcon = (category: AnalysisPoint['category']) => {
  switch (category) {
    case 'turning_point': return <Target size={16} />;
    case 'mistake': return <AlertTriangle size={16} />;
    case 'good_move': return <TrendingUp size={16} />;
    case 'tip': return <Lightbulb size={16} />;
  }
};

const getCategoryLabel = (category: AnalysisPoint['category']) => {
  switch (category) {
    case 'turning_point': return '關鍵轉折';
    case 'mistake': return '決策失誤';
    case 'good_move': return '優秀操作';
    case 'tip': return '改進建議';
  }
};

const getCategoryColor = (category: AnalysisPoint['category']) => {
  switch (category) {
    case 'turning_point': return 'var(--pink)';
    case 'mistake': return 'var(--red)';
    case 'good_move': return 'var(--green)';
    case 'tip': return 'var(--yellow)';
  }
};

const getImpactLabel = (impact: AnalysisPoint['impact']) => {
  switch (impact) {
    case 'high': return '影響重大';
    case 'medium': return '影響中等';
    case 'low': return '影響較小';
  }
};

const StrategyAnalysisPanel: FC<StrategyAnalysisPanelProps> = ({
  isOpen,
  onClose,
  stats,
  humanPlayerIndex = 0,
}) => {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const analysisPoints = useMemo(() => {
    if (!stats) return [];
    return generateAnalysisPoints(stats, humanPlayerIndex);
  }, [stats, humanPlayerIndex]);

  const selectedPoint = useMemo(() => {
    if (!selectedPointId) return null;
    return analysisPoints.find((p) => p.id === selectedPointId) ?? null;
  }, [selectedPointId, analysisPoints]);

  if (!isOpen || !stats) return null;

  const human = stats.players[humanPlayerIndex];
  const winnerIdx = stats.winner;
  const isWin = winnerIdx === humanPlayerIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="cyber-card w-full max-w-3xl max-h-[85vh] flex flex-col relative"
        style={{
          borderColor: 'rgba(255, 107, 157, 0.5)',
          boxShadow: '0 0 30px rgba(255, 107, 157, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255, 107, 157, 0.2)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 107, 157, 0.15)',
                color: 'var(--pink)',
              }}
            >
              <Brain size={22} />
            </div>
            <div>
              <h2 className="font-cyber text-xl tracking-wider" style={{ color: 'var(--pink)', textShadow: '0 0 8px var(--pink-glow)' }}>
                策略分析器
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                本局關鍵決策事後分析 · 共 {analysisPoints.length} 個分析點
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-5 py-3 grid grid-cols-3 gap-3 border-b" style={{ borderColor: 'rgba(77, 195, 255, 0.1)' }}>
          <div className="text-center">
            <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
              本局結果
            </div>
            <div
              className="text-lg font-cyber tracking-wider"
              style={{ color: isWin ? 'var(--green)' : 'var(--red)' }}
            >
              {isWin ? '勝利' : '失敗'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
              總回合數
            </div>
            <div className="text-lg font-cyber tracking-wider" style={{ color: 'var(--cyan)' }}>
              {stats.totalTurns}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
              最終資產
            </div>
            <div className="text-lg font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
              {human?.totalAssets?.toLocaleString() ?? '-'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: list */}
          <div className="w-1/2 border-r overflow-y-auto" style={{ borderColor: 'rgba(77, 195, 255, 0.1)' }}>
            <div className="p-3 space-y-2">
              {analysisPoints.map((point) => {
                const color = getCategoryColor(point.category);
                const isSelected = selectedPointId === point.id;
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => setSelectedPointId(point.id)}
                    className="w-full text-left p-3 rounded transition-all"
                    style={{
                      border: `1px solid ${isSelected ? color : `${color}22`}`,
                      backgroundColor: isSelected ? `${color}10` : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {getCategoryIcon(point.category)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[9px] font-cyber tracking-wider px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {getCategoryLabel(point.category)}
                          </span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            回合 {point.turn}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                          {point.title}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          {getImpactLabel(point.impact)}
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: detail */}
          <div className="w-1/2 overflow-y-auto p-4">
            {selectedPoint ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-cyber tracking-wider px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${getCategoryColor(selectedPoint.category)}22`,
                        color: getCategoryColor(selectedPoint.category),
                      }}
                    >
                      {getCategoryLabel(selectedPoint.category)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      關鍵程度：
                      <span style={{ color: getCategoryColor(selectedPoint.category) }}>
                        {getImpactLabel(selectedPoint.impact)}
                      </span>
                    </span>
                  </div>
                  <h3
                    className="text-lg font-cyber tracking-wider"
                    style={{ color: getCategoryColor(selectedPoint.category) }}
                  >
                    {selectedPoint.title}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {selectedPoint.description}
                </p>

                {selectedPoint.simulation && (
                  <div
                    className="p-3 rounded"
                    style={{
                      border: '1px solid rgba(77, 195, 255, 0.3)',
                      backgroundColor: 'rgba(77, 195, 255, 0.05)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--cyan)' }}>
                      <BarChart3 size={14} />
                      <span className="text-xs font-cyber tracking-wider">模擬推演</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>情境：</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedPoint.simulation.whatIf}</span>
                      </div>
                      <div className="text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>預期結果：</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedPoint.simulation.outcome}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'rgba(77, 195, 255, 0.15)' }}>
                        <Coins size={14} style={{ color: 'var(--yellow)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>現金流變化：</span>
                        <span
                          className="text-sm font-cyber tracking-wider"
                          style={{
                            color: selectedPoint.simulation.cashflowDelta >= 0 ? 'var(--green)' : 'var(--red)',
                          }}
                        >
                          {selectedPoint.simulation.cashflowDelta >= 0 ? '+' : ''}
                          {selectedPoint.simulation.cashflowDelta.toLocaleString()} 元
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className="p-3 rounded text-xs"
                  style={{
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    backgroundColor: 'rgba(168, 85, 247, 0.03)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb size={12} style={{ color: 'var(--purple)' }} />
                    <span className="font-cyber tracking-wider" style={{ color: 'var(--purple)' }}>
                      備註
                    </span>
                  </div>
                  <p>
                    以上分析基於本局數據與通用大富翁策略模型，僅供參考。實際對局中變數眾多，
                    最佳決策需綜合判斷對手風格、當前局勢與運氣成分。
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Brain size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                  點擊左側分析項目查看詳細解讀
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end gap-3" style={{ borderColor: 'rgba(255, 107, 157, 0.2)' }}>
          <button
            type="button"
            onClick={onClose}
            className="cyber-btn px-6 py-2 font-cyber tracking-wider text-sm"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyAnalysisPanel;
