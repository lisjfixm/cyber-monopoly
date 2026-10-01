import { FC, useState } from 'react';
import {
  X,
  Coins,
  Home,
  Building2,
  Hotel,
  TrendingUp,
  Sparkles,
  Layers,
  Handshake,
  Gavel,
  Lock,
  RotateCcw,
  Trophy,
  Home as HomeIcon,
  Crown,
  Brain,
} from 'lucide-react';
import { PLAYER_COLOR_HEX } from '@shared/game-config';
import type { GameStats, PlayerStats, PlayerColor } from '@shared/api.interface';
import StrategyAnalysisPanel from './StrategyAnalysisPanel';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats | null;
  isFinal?: boolean;
  onBackToMenu?: () => void;
  humanPlayerIndex?: number;
}

const getPlayerColorInfo = (
  playerIndex: number,
  players: PlayerStats[],
): { main: string; glow: string } => {
  // Fallback to a color cycle if we don't have color info in stats
  const fallbackColors: { main: string; glow: string }[] = [
    { main: 'var(--red)', glow: 'color-mix(in srgb, var(--red) 50%, transparent)' },
    { main: 'var(--blue)', glow: 'color-mix(in srgb, var(--blue) 50%, transparent)' },
    { main: 'var(--green)', glow: 'color-mix(in srgb, var(--green) 50%, transparent)' },
    { main: 'var(--yellow)', glow: 'color-mix(in srgb, var(--yellow) 50%, transparent)' },
    { main: 'var(--purple)', glow: 'color-mix(in srgb, var(--purple) 50%, transparent)' },
    { main: 'var(--orange)', glow: 'color-mix(in srgb, var(--orange) 50%, transparent)' },
  ];
  const idx = Math.max(0, Math.min(playerIndex, fallbackColors.length - 1));
  return fallbackColors[idx];
};

const StatsPanel: FC<StatsPanelProps> = ({ isOpen, onClose, stats, isFinal = false, onBackToMenu, humanPlayerIndex }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  if (!isOpen || !stats) return null;

  const winnerIdx = stats.winner;
  const winReasonText = stats.winReason === 'bankruptcy' ? '对手破产' : stats.winReason === 'surrender' ? '对手投降' : '';
  const playerCount = stats.players.length;

  // Grid columns based on player count
  const gridCols = playerCount <= 2 ? 'grid-cols-1 md:grid-cols-2' : playerCount <= 4 ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3';

  // Players sorted by totalAssets (descending) for bar chart
  const sortedPlayers = [...stats.players]
    .map((p, idx) => ({ ...p, playerIndex: idx }))
    .sort((a, b) => b.totalAssets - a.totalAssets);

  const maxAssets = Math.max(...stats.players.map((p: PlayerStats) => p.totalAssets), 1);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 md:p-6 relative"
        style={{
          borderColor: isFinal ? 'var(--yellow)' : 'var(--border-neon-cyan)',
          boxShadow: isFinal
            ? '0 0 20px color-mix(in srgb, var(--yellow) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--yellow) 10%, transparent)'
            : '0 0 15px color-mix(in srgb, var(--cyan) 20%, transparent)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题区 */}
        <div className="text-center mb-6">
          {isFinal && winnerIdx !== null ? (
            <>
              <div
                className="font-cyber text-3xl md:text-5xl tracking-wider mb-2 pulse-glow"
                style={{
                  color: 'var(--yellow)',
                  textShadow:
                    '0 0 10px color-mix(in srgb, var(--yellow) 80%, transparent), 0 0 20px color-mix(in srgb, var(--yellow) 50%, transparent), 0 0 40px color-mix(in srgb, var(--yellow) 30%, transparent)',
                }}
              >
                獎盃 遊戲結算
              </div>
              <div
                className="font-cyber text-xl md:text-2xl mb-1"
                style={{
                  color: getPlayerColorInfo(winnerIdx, stats.players).main,
                  textShadow: `0 0 10px ${getPlayerColorInfo(winnerIdx, stats.players).glow}`,
                }}
              >
                {stats.players[winnerIdx].name} 获胜！
              </div>
              {winReasonText && (
                <div className="text-sm font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  胜利原因：{winReasonText}
                </div>
              )}
            </>
          ) : (
            <>
              <h2
                className="font-cyber text-2xl md:text-3xl tracking-wider mb-2"
                style={{
                  color: 'var(--cyan)',
                  textShadow: '0 0 10px var(--cyan-glow)',
                }}
              >
                統計面板
              </h2>
            </>
          )}
          <div
            className="text-sm font-cyber tracking-wider mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
            总回合数：{stats.totalTurns}
          </div>
        </div>

        {/* 玩家卡片 - 自适应网格 */}
        <div className={`grid ${gridCols} gap-3 md:gap-4 mb-6`}>
          {stats.players.map((player: PlayerStats, idx: number) => {
            const isWinner = winnerIdx === idx;
            const colors = getPlayerColorInfo(idx, stats.players);
            const isBankrupt = player.totalAssets <= 0;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all ${isBankrupt ? 'grayscale opacity-60' : ''}`}
                style={{
                  borderColor: isWinner ? 'var(--yellow)' : `${colors.main}40`,
                  boxShadow: isWinner
                    ? '0 0 15px color-mix(in srgb, var(--yellow) 40%, transparent), inset 0 0 15px color-mix(in srgb, var(--yellow) 10%, transparent)'
                    : `0 0 8px ${colors.glow}30`,
                  backgroundColor: isWinner ? 'color-mix(in srgb, var(--yellow) 5%, transparent)' : 'color-mix(in srgb, var(--bg-deep) 20%, transparent)',
                }}
              >
                {/* 玩家名 + 胜者标记 */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: `${colors.main}30` }}>
                  <span
                    className="font-cyber text-base md:text-lg tracking-wider"
                    style={{
                      color: colors.main,
                      textShadow: `0 0 8px ${colors.glow}`,
                    }}
                  >
                    {player.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {isWinner && (
                      <Crown
                        className="w-4 h-4 md:w-5 md:h-5"
                        style={{
                           color: 'var(--yellow)',
                           filter: 'drop-shadow(0 0 4px color-mix(in srgb, var(--yellow) 80%, transparent))',
                        }}
                      />
                    )}
                    {isBankrupt && !isWinner && (
                      <span className="text-[10px] font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        已破产
                      </span>
                    )}
                  </div>
                </div>

                {/* 統計項 - 兩列 */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs">
                  <StatRow
                    icon={<Coins className="w-3.5 h-3.5" style={{ color: 'var(--yellow)' }} />}
                     label="最终现金"
                     value={`¥${player.finalMoney.toLocaleString()}`}
                     valueColor="var(--yellow)"
                  />
                  <StatRow
                    icon={<HomeIcon className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />}
                    label="地产数量"
                    value={`${player.propertyCount} 块`}
                  />
                  <StatRow
                    icon={<Building2 className="w-3.5 h-3.5" style={{ color: 'var(--pink)' }} />}
                    label="建筑总数"
                    value={`${player.totalBuildings} 栋`}
                  />
                  <StatRow
                    icon={<Hotel className="w-3.5 h-3.5" style={{ color: 'var(--orange)' }} />}
                    label="房屋/酒店"
                    value={`${player.totalHouses}/${player.totalHotels}`}
                  />
                  <StatRow
                    icon={<TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} />}
                    label="过路费收入"
                    value={`¥${player.tollIncome.toLocaleString()}`}
                    valueColor="var(--green)"
                  />
                  <StatRow
                    icon={<TrendingUp className="w-3.5 h-3.5 rotate-180" style={{ color: 'var(--red)' }} />}
                    label="过路费支出"
                    value={`¥${player.tollExpense.toLocaleString()}`}
                    valueColor="var(--red)"
                  />
                  <StatRow
                    icon={<TrendingUp className="w-3.5 h-3.5" style={{ color: player.stockProfit >= 0 ? 'var(--green)' : 'var(--red)' }} />}
                    label="股票盈亏"
                    value={`${player.stockProfit >= 0 ? '+' : ''}¥${player.stockProfit.toLocaleString()}`}
                    valueColor={player.stockProfit >= 0 ? 'var(--green)' : 'var(--red)'}
                  />
                  <StatRow
                    icon={<Home className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />}
                    label="股票市值"
                    value={`¥${player.stockValue.toLocaleString()}`}
                  />
                  <StatRow
                    icon={<Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--pink)' }} />}
                     label="命運卡次数"
                    value={`${player.fateCardDraws} 次`}
                  />
                  <StatRow
                    icon={<Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--cell-chance-color)' }} />}
                     label="機會卡次数"
                    value={`${player.chanceCardDraws} 次`}
                  />
                  <StatRow
                    icon={<Lock className="w-3.5 h-3.5" style={{ color: 'var(--purple)' }} />}
                    label="进禁闭区"
                    value={`${player.detentionCount} 次`}
                  />
                  <StatRow
                    icon={<Handshake className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} />}
                    label="交易次数"
                    value={`${player.tradeCount} 次`}
                  />
                  <StatRow
                    icon={<Gavel className="w-3.5 h-3.5" style={{ color: 'var(--orange)' }} />}
                     label="拍賣获胜"
                    value={`${player.auctionWins} 次`}
                  />
                  <StatRow
                    icon={<Layers className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />}
                    label="完整套装"
                    value={`${player.completeSets} 套`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 總資產排行柱状图 */}
        <div className="mb-6 px-2">
          <div
            className="text-xs font-cyber tracking-wider mb-3 text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
             — 總資產排行 —
          </div>
          <div className="space-y-2.5">
            {sortedPlayers.map((player, rankIdx) => {
              const colors = getPlayerColorInfo(player.playerIndex, stats.players);
              const widthPct = (player.totalAssets / maxAssets) * 100;
              const isWinner = winnerIdx === player.playerIndex;
              return (
                <div key={player.playerIndex} className="flex items-center gap-2 md:gap-3">
                  <span
                    className="text-[10px] font-cyber w-5 text-right flex-shrink-0"
                    style={{
                       color: rankIdx === 0 ? 'var(--yellow)' : 'var(--text-secondary)',
                    }}
                  >
                    {rankIdx + 1}
                  </span>
                  <span
                    className="text-xs font-cyber w-16 md:w-20 text-right flex-shrink-0 truncate"
                    style={{ color: colors.main }}
                  >
                    {player.name}
                  </span>
                  <div
                    className="flex-1 h-6 md:h-7 rounded relative overflow-hidden border"
                    style={{
                       borderColor: isWinner ? 'var(--yellow)' : `${colors.main}40`,
                       backgroundColor: 'color-mix(in srgb, var(--bg-deep) 30%, transparent)',
                       boxShadow: isWinner ? '0 0 8px color-mix(in srgb, var(--yellow) 30%, transparent)' : 'none',
                    }}
                  >
                    <div
                      className="h-full rounded transition-all duration-700 ease-out flex items-center justify-end pr-2"
                      style={{
                        width: `${widthPct}%`,
                        minWidth: widthPct > 0 ? '24px' : '0',
                         background: isWinner
                           ? `linear-gradient(90deg, color-mix(in srgb, var(--yellow) 40%, transparent), color-mix(in srgb, var(--yellow) 80%, transparent), var(--yellow))`
                           : `linear-gradient(90deg, ${colors.main}20, ${colors.main}cc, ${colors.main})`,
                         boxShadow: isWinner
                           ? '0 0 10px color-mix(in srgb, var(--yellow) 50%, transparent), inset 0 0 5px color-mix(in srgb, var(--text-primary) 30%, transparent)'
                           : `0 0 10px ${colors.glow}, inset 0 0 5px color-mix(in srgb, var(--text-primary) 30%, transparent)`,
                      }}
                    >
                      {widthPct > 20 && (
                        <span
                          className="text-[10px] font-cyber font-bold"
                          style={{
                             color: 'var(--text-primary)',
                             textShadow: '0 0 4px color-mix(in srgb, var(--bg-deep) 80%, transparent)',
                          }}
                        >
                          ¥{player.totalAssets.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {widthPct <= 20 && widthPct > 0 && (
                      <span
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-cyber"
                        style={{ color: colors.main }}
                      >
                        ¥{player.totalAssets.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

         {/* 底部按钮 */}
         <div className="flex justify-center gap-3 mt-4 flex-wrap">
           {isFinal && (
             <button
               onClick={() => setShowAnalysis(true)}
               className="cyber-btn px-6 py-2 font-cyber tracking-wider text-sm flex items-center gap-2"
               style={{
                 borderColor: 'var(--pink)',
                 color: 'var(--pink)',
                 backgroundColor: 'rgba(255, 107, 157, 0.08)',
               }}
             >
               <Brain size={16} />
               策略分析
             </button>
           )}
           {isFinal && onBackToMenu && (
            <button onClick={onBackToMenu} className="cyber-btn cyber-btn-pink px-8 py-2 font-cyber tracking-wider">
               返回主選單
            </button>
          )}
          {!isFinal && (
            <button onClick={onClose} className="cyber-btn px-8 py-2 font-cyber tracking-wider">
              关闭
            </button>
          )}
          {isFinal && (
            <button onClick={onClose} className="cyber-btn px-8 py-2 font-cyber tracking-wider">
              查看棋盘
            </button>
          )}
        </div>

        <StrategyAnalysisPanel
          isOpen={showAnalysis}
          onClose={() => setShowAnalysis(false)}
          stats={stats}
          humanPlayerIndex={humanPlayerIndex}
        />
      </div>
    </div>
  );
};

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

const StatRow: FC<StatRowProps> = ({ icon, label, value, valueColor }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
      {icon}
      <span className="text-[10px] font-cyber tracking-wide">{label}</span>
    </div>
    <span
      className="text-[10px] font-cyber tracking-wide"
      style={{ color: valueColor || 'var(--text-primary)' }}
    >
      {value}
    </span>
  </div>
);

export default StatsPanel;
