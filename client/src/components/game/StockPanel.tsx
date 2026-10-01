import type { FC } from 'react';
import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, LineChart, Users, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react';
import { STOCKS } from '@shared/game-config';
import type { StockSymbol, PlayerStock, StockState } from '@shared/api.interface';

interface StockPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Record<StockSymbol, number>;
  playerStocks: PlayerStock[];
  playerMoney: number;
  playerIndex?: number;
  isMyTurn: boolean;
  stockStates?: Record<StockSymbol, StockState>;
  players?: Array<{ name: string; color: string; playerIndex: number }>;
  onBuy: (symbol: StockSymbol, quantity: number) => void;
  onSell: (symbol: StockSymbol, quantity: number) => void;
  onShareholderMeeting?: (symbol: StockSymbol, direction: 'up' | 'down') => void;
}

const StockPanel: FC<StockPanelProps> = ({
  isOpen,
  onClose,
  stocks,
  playerStocks,
  playerMoney,
  isMyTurn,
  onBuy,
  onSell,
  onShareholderMeeting,
  stockStates,
  playerIndex,
  players,
}) => {
  const [quantities, setQuantities] = useState<Record<StockSymbol, number>>({
    NEON: 1,
    QNTM: 1,
    DATA: 1,
    CYBR: 1,
  });

  if (!isOpen) return null;

  const stockSymbols = Object.keys(STOCKS) as StockSymbol[];

  const getHolding = (symbol: StockSymbol): number => {
    const holding = playerStocks.find((s) => s.symbol === symbol);
    return holding?.quantity ?? 0;
  };

  const getChange = (symbol: StockSymbol): number => {
    const config = STOCKS[symbol];
    const current = stocks[symbol];
    const prev = config.initialPrice;
    return ((current - prev) / prev) * 100;
  };

  const totalMarketValue = stockSymbols.reduce((sum, symbol) => {
    return sum + getHolding(symbol) * stocks[symbol];
  }, 0);

  const handleQuantityChange = (symbol: StockSymbol, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      setQuantities((prev) => ({ ...prev, [symbol]: 0 }));
    } else {
      setQuantities((prev) => ({ ...prev, [symbol]: num }));
    }
  };

  const handleBuy = (symbol: StockSymbol) => {
    const qty = quantities[symbol];
    if (qty > 0) onBuy(symbol, qty);
  };

  const handleSell = (symbol: StockSymbol) => {
    const qty = quantities[symbol];
    if (qty > 0) onSell(symbol, qty);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          borderColor: 'var(--cyan)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b" style={{ borderColor: 'var(--border-neon-cyan)' }}>
          <div className="flex items-center gap-3">
            <LineChart className="w-6 h-6" style={{ color: 'var(--cyan)' }} />
            <h2
              className="font-cyber text-xl md:text-2xl tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 10px var(--cyan), 0 0 20px var(--cyan)',
              }}
            >
              股票市场
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player money */}
        <div className="px-4 md:px-5 py-3 border-b" style={{ borderColor: 'var(--border-neon-cyan)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              可用资金
            </span>
            <span
              className="font-cyber text-lg md:text-xl tracking-wider"
              style={{
                color: 'var(--green)',
                textShadow: '0 0 8px var(--green)',
              }}
            >
              ¥{playerMoney.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stock cards */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {stockSymbols.map((symbol) => {
              const config = STOCKS[symbol];
              const price = stocks[symbol];
              const change = getChange(symbol);
              const holding = getHolding(symbol);
              const marketValue = holding * price;
              const isUp = change >= 0;
              const qty = quantities[symbol];
              const canBuy = isMyTurn && qty > 0 && playerMoney >= price * qty;
              const canSell = isMyTurn && qty > 0 && holding >= qty;

              // 控股 & 股東大會狀態
              const stockState = stockStates?.[symbol];
              const controllingPlayer = stockState?.controllingPlayer;
              const controllingPlayerInfo = controllingPlayer !== undefined && controllingPlayer !== null
                ? players.find((p) => p.playerIndex === controllingPlayer)
                : undefined;
              const isControlling = controllingPlayer === playerIndex;
              const meetingUsed = stockState?.shareholderMeetingUsed === true;
              const meetingCooldown = stockState?.shareholderMeetingCooldown ?? 0;
              const canCallMeeting = isControlling && !meetingUsed && meetingCooldown <= 0 && isMyTurn && onShareholderMeeting !== undefined;

              return (
                <div
                  key={symbol}
                  className="cyber-card p-4 flex flex-col gap-3"
                  style={{
                    borderColor: `${config.color}50`,
                    boxShadow: `0 0 12px ${config.color}20, inset 0 0 10px ${config.color}10`,
                  }}
                >
                  {/* Stock header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className="font-cyber text-lg md:text-xl tracking-wider"
                        style={{
                          color: config.color,
                          textShadow: `0 0 8px ${config.color}80`,
                        }}
                      >
                        {symbol}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {config.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-cyber text-2xl md:text-3xl tracking-wider"
                        style={{
                          color: isUp ? 'hsl(140, 100%, 50%)' : 'hsl(0, 100%, 60%)',
                          textShadow: `0 0 8px ${isUp ? 'hsl(140, 100%, 50%)' : 'hsl(0, 100%, 60%)'}`,
                        }}
                      >
                        ¥{price}
                      </div>
                      <div
                        className="flex items-center justify-end gap-1 text-xs font-cyber"
                        style={{ color: isUp ? 'hsl(140, 100%, 50%)' : 'hsl(0, 100%, 60%)' }}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : change === 0 ? (
                          <Minus className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isUp ? '+' : ''}{change.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Holdings */}
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>持有</span>
                    <span style={{ color: 'var(--text-primary)' }}>{holding} 股</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>市值</span>
                    <span
                      className="font-cyber tracking-wider"
                      style={{ color: config.color }}
                    >
                      ¥{marketValue.toLocaleString()}
                    </span>
                  </div>

                  {/* 控股標記 */}
                  {controllingPlayerInfo && (
                    <div
                      className="flex items-center gap-1.5 text-xs pt-1"
                      style={{
                        color: controllingPlayerInfo.color,
                        textShadow: `0 0 6px ${controllingPlayerInfo.color}`,
                      }}
                    >
                      <Users className="w-3 h-3" />
                      <span className="font-cyber tracking-wide">控股：{controllingPlayerInfo.name}</span>
                    </div>
                  )}

                  {/* 股東大會按鈕 */}
                  {onShareholderMeeting && stockState && (
                    <div className="pt-2 border-t" style={{ borderColor: `${config.color}30` }}>
                      {meetingUsed ? (
                        <div
                          className="w-full py-1.5 text-xs font-cyber tracking-wider text-center border rounded opacity-50"
                          style={{
                            borderColor: 'var(--text-secondary)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          已召開
                        </div>
                      ) : meetingCooldown > 0 ? (
                        <div
                          className="w-full py-1.5 text-xs font-cyber tracking-wider text-center border rounded"
                          style={{
                            borderColor: 'var(--yellow)',
                            color: 'var(--yellow)',
                            backgroundColor: 'rgba(255, 200, 0, 0.05)',
                          }}
                        >
                          冷卻中（剩餘 {meetingCooldown} 回合）
                        </div>
                      ) : isControlling && isMyTurn ? (
                        <div className="space-y-1.5">
                          <div
                            className="text-xs font-cyber tracking-wider text-center"
                            style={{ color: 'hsl(270, 80%, 70%)', textShadow: '0 0 6px hsl(270, 80%, 70%)' }}
                          >
                            閃電 掌控控股權
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onShareholderMeeting(symbol, 'up')}
                              className="flex-1 py-1.5 text-xs font-cyber tracking-wider border rounded transition-all hover:brightness-125"
                              style={{
                                borderColor: 'hsl(270, 80%, 70%)',
                                color: 'hsl(270, 80%, 70%)',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                boxShadow: '0 0 8px rgba(168, 85, 247, 0.3)',
                              }}
                            >
                              <TrendingUpIcon className="w-3 h-3 inline mr-0.5" />
                              拉抬 +50%
                            </button>
                            <button
                              onClick={() => onShareholderMeeting(symbol, 'down')}
                              className="flex-1 py-1.5 text-xs font-cyber tracking-wider border rounded transition-all hover:brightness-125"
                              style={{
                                borderColor: 'hsl(270, 80%, 70%)',
                                color: 'hsl(270, 80%, 70%)',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                boxShadow: '0 0 8px rgba(168, 85, 247, 0.3)',
                              }}
                            >
                              <TrendingDownIcon className="w-3 h-3 inline mr-0.5" />
                              打壓 -50%
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Buy/Sell controls */}
                  <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: `${config.color}30` }}>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQuantityChange(symbol, e.target.value)}
                      disabled={!isMyTurn}
                      className="w-16 md:w-20 px-2 py-1.5 text-sm bg-transparent border rounded text-center font-cyber"
                      style={{
                        borderColor: `${config.color}50`,
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      onClick={() => handleBuy(symbol)}
                      disabled={!canBuy}
                      className="flex-1 py-1.5 text-xs md:text-sm font-cyber tracking-wider border rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        borderColor: 'hsl(140, 100%, 50%)',
                        color: 'hsl(140, 100%, 50%)',
                        backgroundColor: 'rgba(0, 255, 128, 0.08)',
                      }}
                    >
                      买入
                    </button>
                    <button
                      onClick={() => handleSell(symbol)}
                      disabled={!canSell}
                      className="flex-1 py-1.5 text-xs md:text-sm font-cyber tracking-wider border rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        borderColor: 'hsl(0, 100%, 60%)',
                        color: 'hsl(0, 100%, 60%)',
                        backgroundColor: 'rgba(255, 77, 109, 0.08)',
                      }}
                    >
                      卖出
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - total market value */}
        <div className="p-4 md:p-5 border-t" style={{ borderColor: 'var(--border-neon-cyan)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm md:text-base font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              总市值
            </span>
            <span
              className="font-cyber text-xl md:text-2xl tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 10px var(--cyan), 0 0 20px var(--cyan)',
              }}
            >
              ¥{totalMarketValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPanel;
