import { useState } from 'react';
import type { FC } from 'react';
import { X, Landmark, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown, BarChart3, CircleDollarSign } from 'lucide-react';
import { STOCKS, STOCK_SYMBOLS } from '@shared/game-config';
import type { GameState, PlayerState, StockSymbol, StockDerivativeContract } from '@shared/api.interface';
import { getStockDerivativePnl } from '@shared/game-engine';

interface BankModalProps {
  open: boolean;
  onClose: () => void;
  playerIndex: number;
  currentSavings: number;
  playerMoney: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  gameState?: GameState;
  onBuyDerivative?: (kind: 'futures' | 'call' | 'put', symbol: StockSymbol, quantity: number) => void;
  onSettleDerivative?: (contractId: number) => void;
}

const QUICK_AMOUNTS = [1000, 2000, 5000];

type TabKey = 'deposit' | 'withdraw' | 'derivatives';

const BankModal: FC<BankModalProps> = ({
  open,
  onClose,
  currentSavings,
  playerMoney,
  onDeposit,
  onWithdraw,
  gameState,
  onBuyDerivative,
  onSettleDerivative,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<TabKey>('deposit');
  const [derivativeQuantity, setDerivativeQuantity] = useState<number>(1);
  const [confirmTrade, setConfirmTrade] = useState<{ kind: 'futures' | 'call' | 'put'; symbol: StockSymbol } | null>(null);

  if (!open) return null;

  const canDeposit = playerMoney > 0;
  const canWithdraw = currentSavings > 0;

  const myContracts: StockDerivativeContract[] =
    gameState?.stockDerivatives?.filter((c) => c.playerIndex === gameState?.currentPlayerIndex && !c.settled) ?? [];

  const getUnitCost = (kind: 'futures' | 'call' | 'put', symbol: StockSymbol): number => {
    if (!gameState) return 0;
    const price = gameState.stocks[symbol] ?? 0;
    if (kind === 'futures') return Math.floor(price * 0.1);
    const vol = STOCKS[symbol]?.volatility === 'high' ? 0.2 : STOCKS[symbol]?.volatility === 'medium' ? 0.15 : 0.1;
    return Math.floor(price * vol);
  };

  const getPriceChange = (symbol: StockSymbol): number => {
    if (!gameState) return 0;
    const state = gameState.stockStates?.[symbol];
    if (!state) return 0;
    return state.price - state.previousPrice;
  };

  const getPriceChangePct = (symbol: StockSymbol): number => {
    if (!gameState) return 0;
    const state = gameState.stockStates?.[symbol];
    if (!state || state.previousPrice === 0) return 0;
    return ((state.price - state.previousPrice) / state.previousPrice) * 100;
  };

  const handleConfirmTrade = () => {
    if (!confirmTrade || !onBuyDerivative) return;
    onBuyDerivative(confirmTrade.kind, confirmTrade.symbol, derivativeQuantity);
    setConfirmTrade(null);
  };

  const openTradeConfirm = (kind: 'futures' | 'call' | 'put', symbol: StockSymbol) => {
    setDerivativeQuantity(1);
    setConfirmTrade({ kind, symbol });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card rounded-lg w-full max-w-lg relative max-h-[85vh] flex flex-col"
        style={{
          border: '1px solid var(--green)',
          boxShadow: '0 0 20px var(--green), inset 0 0 20px rgba(0, 255, 128, 0.1)',
          animation: 'modal-in 0.3s ease-out',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 md:p-6 border-b border-[var(--border-neon-cyan)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Landmark
              className="w-7 h-7 md:w-8 md:h-8"
              style={{ color: 'var(--green)', filter: 'drop-shadow(0 0 6px var(--green))' }}
            />
            <div>
              <h2
                className="font-cyber text-xl md:text-2xl tracking-wider"
                style={{ color: 'var(--green)', textShadow: '0 0 10px var(--green), 0 0 20px rgba(0, 255, 128, 0.5)' }}
              >
                銀行中心
              </h2>
              <p className="text-[10px] md:text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                CYBER FINANCIAL HUB
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: 'rgba(0, 255, 128, 0.08)', border: '1px solid rgba(0, 255, 128, 0.3)' }}
            >
              <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                存款餘額
              </div>
              <div
                className="font-cyber text-lg md:text-xl tracking-wider"
                style={{ color: 'var(--green)', textShadow: '0 0 6px var(--green)' }}
              >
                ¥{currentSavings.toLocaleString()}
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: 'rgba(0, 255, 255, 0.08)', border: '1px solid rgba(0, 255, 255, 0.3)' }}
            >
              <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                可用現金
              </div>
              <div
                className="font-cyber text-lg md:text-xl tracking-wider"
                style={{ color: 'var(--cyan)', textShadow: '0 0 6px var(--cyan)' }}
              >
                ¥{playerMoney.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('deposit')}
              className="flex-1 py-2 text-xs font-cyber tracking-wide rounded transition-all"
              style={{
                border: `1px solid ${activeTab === 'deposit' ? 'var(--green)' : 'var(--border-neon-cyan)'}`,
                color: activeTab === 'deposit' ? 'var(--green)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'deposit' ? 'rgba(0, 255, 128, 0.15)' : 'transparent',
                boxShadow: activeTab === 'deposit' ? '0 0 8px rgba(0, 255, 128, 0.3)' : 'none',
                textShadow: activeTab === 'deposit' ? '0 0 4px var(--green)' : 'none',
              }}
            >
              存入
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className="flex-1 py-2 text-xs font-cyber tracking-wide rounded transition-all"
              style={{
                border: `1px solid ${activeTab === 'withdraw' ? 'var(--cyan)' : 'var(--border-neon-cyan)'}`,
                color: activeTab === 'withdraw' ? 'var(--cyan)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'withdraw' ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                boxShadow: activeTab === 'withdraw' ? '0 0 8px rgba(0, 255, 255, 0.3)' : 'none',
                textShadow: activeTab === 'withdraw' ? '0 0 4px var(--cyan)' : 'none',
              }}
            >
              提領
            </button>
            <button
              onClick={() => setActiveTab('derivatives')}
              className="flex-1 py-2 text-xs font-cyber tracking-wide rounded transition-all"
              style={{
                border: `1px solid ${activeTab === 'derivatives' ? 'var(--purple)' : 'var(--border-neon-cyan)'}`,
                color: activeTab === 'derivatives' ? 'var(--purple)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'derivatives' ? 'rgba(160, 120, 255, 0.15)' : 'transparent',
                boxShadow: activeTab === 'derivatives' ? '0 0 8px rgba(160, 120, 255, 0.3)' : 'none',
                textShadow: activeTab === 'derivatives' ? '0 0 4px var(--purple)' : 'none',
              }}
            >
              期貨/期權
            </button>
          </div>

          {activeTab === 'deposit' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--green)' }} />
                <span
                  className="font-cyber text-sm tracking-wider"
                  style={{ color: 'var(--green)', textShadow: '0 0 4px var(--green)' }}
                >
                  存入金額
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                <button
                  onClick={() => onDeposit(playerMoney)}
                  disabled={!canDeposit}
                  className="py-1.5 text-xs font-cyber tracking-wide rounded transition-all disabled:opacity-40"
                  style={{ border: '1px solid var(--green)', color: 'var(--green)', backgroundColor: 'rgba(0, 255, 128, 0.1)' }}
                >
                  全部
                </button>
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount)}
                    disabled={!canDeposit}
                    className={`py-1.5 text-xs font-cyber tracking-wide rounded transition-all ${
                      depositAmount === amount ? '' : 'opacity-60 hover:opacity-100'
                    } disabled:opacity-40`}
                    style={{
                      border: `1px solid ${depositAmount === amount ? 'var(--green)' : 'var(--border-neon-cyan)'}`,
                      color: depositAmount === amount ? 'var(--green)' : 'var(--text-secondary)',
                      backgroundColor: depositAmount === amount ? 'rgba(0, 255, 128, 0.15)' : 'transparent',
                      boxShadow: depositAmount === amount ? '0 0 8px rgba(0, 255, 128, 0.3)' : 'none',
                    }}
                  >
                    {amount / 1000}k
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min={100}
                  max={playerMoney || 100}
                  step={100}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  disabled={!canDeposit}
                  className="flex-1 accent-[var(--green)]"
                />
                <span className="font-cyber text-sm w-20 text-right" style={{ color: 'var(--green)' }}>
                  ¥{depositAmount.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => onDeposit(Math.min(depositAmount, playerMoney))}
                disabled={!canDeposit || depositAmount <= 0}
                className="w-full py-2.5 rounded font-cyber tracking-wider text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid var(--green)',
                  color: 'var(--green)',
                  backgroundColor: 'rgba(0, 255, 128, 0.1)',
                  boxShadow: canDeposit ? '0 0 10px rgba(0, 255, 128, 0.3)' : 'none',
                  textShadow: '0 0 6px var(--green)',
                }}
              >
                {canDeposit ? '確認存入' : '現金不足'}
              </button>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                <span
                  className="font-cyber text-sm tracking-wider"
                  style={{ color: 'var(--cyan)', textShadow: '0 0 4px var(--cyan-glow)' }}
                >
                  提領金額
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                <button
                  onClick={() => onWithdraw(currentSavings)}
                  disabled={!canWithdraw}
                  className="py-1.5 text-xs font-cyber tracking-wide rounded transition-all disabled:opacity-40"
                  style={{ border: '1px solid var(--cyan)', color: 'var(--cyan)', backgroundColor: 'rgba(0, 255, 255, 0.1)' }}
                >
                  全部
                </button>
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWithdrawAmount(amount)}
                    disabled={!canWithdraw}
                    className={`py-1.5 text-xs font-cyber tracking-wide rounded transition-all ${
                      withdrawAmount === amount ? '' : 'opacity-60 hover:opacity-100'
                    } disabled:opacity-40`}
                    style={{
                      border: `1px solid ${withdrawAmount === amount ? 'var(--cyan)' : 'var(--border-neon-cyan)'}`,
                      color: withdrawAmount === amount ? 'var(--cyan)' : 'var(--text-secondary)',
                      backgroundColor: withdrawAmount === amount ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                      boxShadow: withdrawAmount === amount ? '0 0 8px rgba(0, 255, 255, 0.3)' : 'none',
                    }}
                  >
                    {amount / 1000}k
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min={100}
                  max={currentSavings || 100}
                  step={100}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  disabled={!canWithdraw}
                  className="flex-1 accent-[var(--cyan)]"
                />
                <span className="font-cyber text-sm w-20 text-right" style={{ color: 'var(--cyan)' }}>
                  ¥{withdrawAmount.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => onWithdraw(Math.min(withdrawAmount, currentSavings))}
                disabled={!canWithdraw || withdrawAmount <= 0}
                className="w-full py-2.5 rounded font-cyber tracking-wider text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid var(--cyan)',
                  color: 'var(--cyan)',
                  backgroundColor: 'rgba(0, 255, 255, 0.1)',
                  boxShadow: canWithdraw ? '0 0 10px rgba(0, 255, 255, 0.3)' : 'none',
                  textShadow: '0 0 6px var(--cyan-glow)',
                }}
              >
                {canWithdraw ? '確認提領' : '無存款可提'}
              </button>
            </div>
          )}

          {activeTab === 'derivatives' && gameState && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4" style={{ color: 'var(--purple)' }} />
                  <span
                    className="font-cyber text-sm tracking-wider"
                    style={{ color: 'var(--purple)', textShadow: '0 0 4px var(--purple)' }}
                  >
                    標的行情
                  </span>
                </div>
                <div className="space-y-2">
                  {STOCK_SYMBOLS.map((symbol) => {
                    const config = STOCKS[symbol];
                    const price = gameState.stocks[symbol] ?? 0;
                    const change = getPriceChange(symbol);
                    const pct = getPriceChangePct(symbol);
                    const isUp = change >= 0;
                    return (
                      <div
                        key={symbol}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(160, 120, 255, 0.05)',
                          border: '1px solid rgba(160, 120, 255, 0.2)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: config?.color, boxShadow: `0 0 6px ${config?.color}` }}
                            />
                            <span className="font-cyber text-sm tracking-wide" style={{ color: config?.color }}>
                              {symbol}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {config?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-cyber text-sm" style={{ color: 'var(--text-primary)' }}>
                              ¥{price}
                            </div>
                            <div
                              className="text-xs font-cyber flex items-center justify-end gap-1"
                              style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}
                            >
                              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isUp ? '+' : ''}{change.toFixed(1)} ({isUp ? '+' : ''}{pct.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => openTradeConfirm('call', symbol)}
                            disabled={!onBuyDerivative || playerMoney < getUnitCost('call', symbol)}
                            className="py-1.5 text-[10px] font-cyber tracking-wide rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              border: '1px solid var(--green)',
                              color: 'var(--green)',
                              backgroundColor: 'rgba(0, 255, 128, 0.08)',
                            }}
                          >
                            看漲 ¥{getUnitCost('call', symbol)}
                          </button>
                          <button
                            onClick={() => openTradeConfirm('put', symbol)}
                            disabled={!onBuyDerivative || playerMoney < getUnitCost('put', symbol)}
                            className="py-1.5 text-[10px] font-cyber tracking-wide rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              border: '1px solid var(--red)',
                              color: 'var(--red)',
                              backgroundColor: 'rgba(255, 77, 109, 0.08)',
                            }}
                          >
                            看跌 ¥{getUnitCost('put', symbol)}
                          </button>
                          <button
                            onClick={() => openTradeConfirm('futures', symbol)}
                            disabled={!onBuyDerivative || playerMoney < getUnitCost('futures', symbol)}
                            className="py-1.5 text-[10px] font-cyber tracking-wide rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              border: '1px solid var(--cyan)',
                              color: 'var(--cyan)',
                              backgroundColor: 'rgba(0, 255, 255, 0.08)',
                            }}
                          >
                            期貨 ¥{getUnitCost('futures', symbol)}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign className="w-4 h-4" style={{ color: 'var(--gold, #ffd700)' }} />
                  <span
                    className="font-cyber text-sm tracking-wider"
                    style={{ color: 'var(--gold, #ffd700)', textShadow: '0 0 4px rgba(255, 215, 0, 0.6)' }}
                  >
                    我的持倉
                  </span>
                </div>
                {myContracts.length === 0 ? (
                  <div
                    className="text-center py-6 rounded-lg text-xs"
                    style={{
                      color: 'var(--text-secondary)',
                      border: '1px dashed var(--border-neon-cyan)',
                      backgroundColor: 'rgba(180, 180, 220, 0.03)',
                    }}
                  >
                    暫無持倉
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myContracts.map((c) => {
                      const pnl = gameState ? getStockDerivativePnl(gameState, c) : 0;
                      const kindLabel = c.kind === 'futures' ? '期貨' : c.kind === 'call' ? '看漲期權' : '看跌期權';
                      const remainingTurns = Math.max(0, c.expiresTurn - (gameState?.totalTurns ?? 0));
                      return (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-lg flex items-center justify-between gap-2"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(160, 120, 255, 0.15)',
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-cyber text-xs" style={{ color: STOCKS[c.symbol]?.color }}>
                                {c.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: c.kind === 'call' ? 'rgba(0,255,128,0.15)' : c.kind === 'put' ? 'rgba(255,77,109,0.15)' : 'rgba(0,255,255,0.15)',
                                  color: c.kind === 'call' ? 'var(--green)' : c.kind === 'put' ? 'var(--red)' : 'var(--cyan)',
                                }}
                              >
                                {kindLabel}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                                ×{c.quantity}
                              </span>
                            </div>
                            <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                              行權價 ¥{c.strikePrice} · 剩餘 {remainingTurns} 回合
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className="font-cyber text-sm"
                              style={{ color: pnl >= 0 ? 'var(--green)' : 'var(--red)' }}
                            >
                              {pnl >= 0 ? '+' : ''}¥{pnl.toLocaleString()}
                            </div>
                            <button
                              onClick={() => onSettleDerivative?.(c.id)}
                              className="text-[10px] font-cyber tracking-wide px-2 py-0.5 rounded mt-1 transition-all hover:opacity-80"
                              style={{
                                border: '1px solid var(--purple)',
                                color: 'var(--purple)',
                                backgroundColor: 'rgba(160, 120, 255, 0.1)',
                              }}
                            >
                              提前結算
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmTrade && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div
            className="cyber-card rounded-lg w-full max-w-sm p-5"
            style={{
              border: '1px solid var(--purple)',
              boxShadow: '0 0 20px var(--purple), inset 0 0 15px rgba(160, 120, 255, 0.1)',
              animation: 'modal-in 0.2s ease-out',
            }}
          >
            <h3
              className="font-cyber text-lg tracking-wider mb-3 text-center"
              style={{ color: 'var(--purple)', textShadow: '0 0 8px var(--purple)' }}
            >
              確認交易
            </h3>
            <div className="space-y-2 mb-5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>標的</span>
                <span style={{ color: STOCKS[confirmTrade.symbol]?.color }}>
                  {STOCKS[confirmTrade.symbol]?.name}（{confirmTrade.symbol}）
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>類型</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {confirmTrade.kind === 'futures' ? '期貨合約' : confirmTrade.kind === 'call' ? '看漲期權' : '看跌期權'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>數量</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDerivativeQuantity(Math.max(1, derivativeQuantity - 1))}
                    className="w-6 h-6 rounded font-cyber text-xs"
                    style={{ border: '1px solid var(--border-neon-cyan)', color: 'var(--text-secondary)' }}
                  >
                    -
                  </button>
                  <span className="font-cyber w-8 text-center" style={{ color: 'var(--text-primary)' }}>
                    {derivativeQuantity}
                  </span>
                  <button
                    onClick={() => setDerivativeQuantity(Math.min(10, derivativeQuantity + 1))}
                    className="w-6 h-6 rounded font-cyber text-xs"
                    style={{ border: '1px solid var(--border-neon-cyan)', color: 'var(--text-secondary)' }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>單位成本</span>
                <span style={{ color: 'var(--cyan)' }}>
                  ¥{getUnitCost(confirmTrade.kind, confirmTrade.symbol)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span style={{ color: 'var(--text-secondary)' }}>總花費</span>
                <span
                  className="font-cyber"
                  style={{ color: playerMoney >= getUnitCost(confirmTrade.kind, confirmTrade.symbol) * derivativeQuantity ? 'var(--green)' : 'var(--red)' }}
                >
                  ¥{(getUnitCost(confirmTrade.kind, confirmTrade.symbol) * derivativeQuantity).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTrade(null)}
                className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
                style={{ border: '1px solid var(--border-neon-cyan)', color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmTrade}
                disabled={playerMoney < getUnitCost(confirmTrade.kind, confirmTrade.symbol) * derivativeQuantity}
                className="flex-1 py-2 rounded font-cyber text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid var(--purple)',
                  color: 'var(--purple)',
                  backgroundColor: 'rgba(160, 120, 255, 0.15)',
                  boxShadow: '0 0 10px rgba(160, 120, 255, 0.3)',
                  textShadow: '0 0 4px var(--purple)',
                }}
              >
                確認買入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankModal;
