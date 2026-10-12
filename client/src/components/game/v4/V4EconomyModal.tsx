import { useState, type FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/src/components/ui/tabs';
import {
  Landmark,
  Receipt,
  LineChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
} from 'lucide-react';
import type { GameState, StockSymbol } from '@shared/api.interface';
import { STOCKS } from '@shared/game-config';
import {
  buyCrypto,
  sellCrypto,
  subscribeIpo,
  payIncomeTax,
  getEffectiveLoanRate,
  getEffectiveSavingsRate,
  getStockOwnershipRatio,
} from '@shared/game-engine';

interface V4EconomyModalProps {
  open: boolean;
  onClose: () => void;
  gameState: GameState;
  playerIndex: number;
  /** 提交引擎回傳的新 state（由 GamePage 統一 setGameState） */
  onCommit: (newState: GameState) => void;
}

const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('zh-Hant');
};

const V4EconomyModal: FC<V4EconomyModalProps> = ({ open, onClose, gameState, playerIndex, onCommit }) => {
  const player = gameState.players[playerIndex];
  const [tab, setTab] = useState('crypto');

  if (!player) return null;

  const cryptoMarket = gameState.cryptoMarket ?? {};
  const coins = Object.values(cryptoMarket);
  const ipoPool = gameState.ipoPool ?? {};
  const ipoEntries = Object.values(ipoPool);
  const loanRate = getEffectiveLoanRate(gameState);
  const savingsRate = getEffectiveSavingsRate(gameState);
  const centralRate = gameState.centralBankRate ?? 0.02;

  const handleBuyCrypto = (symbol: string) => {
    onCommit(buyCrypto(gameState, playerIndex, symbol, 1));
  };
  const handleSellCrypto = (symbol: string) => {
    onCommit(sellCrypto(gameState, playerIndex, symbol, 1));
  };
  const handleSubscribe = (symbol: StockSymbol) => {
    onCommit(subscribeIpo(gameState, playerIndex, symbol, 10));
  };
  const handlePayTax = (evade: boolean) => {
    onCommit(payIncomeTax(gameState, playerIndex, evade));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="cyber-card max-w-lg w-[92vw] p-0 overflow-hidden" style={{ borderColor: 'var(--cyan)' }}>
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="font-cyber text-lg tracking-wider flex items-center gap-2" style={{ color: 'var(--cyan)' }}>
            <LineChart size={18} /> v4 量子金融系統
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="px-3 pb-3">
          <TabsList className="w-full grid grid-cols-4 gap-1 mb-3">
            <TabsTrigger value="crypto" className="font-cyber text-xs min-h-[44px]">加密貨幣</TabsTrigger>
            <TabsTrigger value="ipo" className="font-cyber text-xs min-h-[44px]">IPO 申購</TabsTrigger>
            <TabsTrigger value="tax" className="font-cyber text-xs min-h-[44px]">稅務</TabsTrigger>
            <TabsTrigger value="control" className="font-cyber text-xs min-h-[44px]">利率控股</TabsTrigger>
          </TabsList>

          {/* 加密貨幣 */}
          <TabsContent value="crypto" className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[var(--text-secondary)]">迷因幣市場（DOGE/PEPE/MOON/FOMO）</span>
              <span className="font-cyber" style={{ color: (player.cryptoPnl ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                持倉盈虧 {fmt(player.cryptoPnl ?? 0)}
              </span>
            </div>
            {coins.length === 0 && (
              <div className="text-center text-xs text-[var(--text-muted)] py-6">市場尚未開盤</div>
            )}
            {coins.map((c) => {
              const holdings = player.cryptoHoldings?.[c.symbol] ?? 0;
              const up = c.lastChange >= 0;
              return (
                <div key={c.symbol} className="cyber-card p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-cyber text-sm" style={{ color: 'var(--cyan)' }}>{c.symbol}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">{c.name}</span>
                    </div>
                    <div className="text-xs mt-0.5 flex items-center gap-1">
                      <span>${fmt(c.price)}</span>
                      <span className="flex items-center" style={{ color: up ? 'var(--green)' : 'var(--red)' }}>
                        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {up ? '+' : ''}{(c.lastChange * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">持倉 {fmt(holdings)} 單位</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => handleSellCrypto(c.symbol)} disabled={holdings <= 0}
                      className="cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{ borderColor: 'var(--red)', color: 'var(--red)', opacity: holdings <= 0 ? 0.4 : 1 }}
                      aria-label={`賣出 ${c.symbol}`}>
                      <Minus size={16} />
                    </button>
                    <button type="button" onClick={() => handleBuyCrypto(c.symbol)}
                      className="cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
                      aria-label={`買入 ${c.symbol}`}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* IPO 申購 */}
          <TabsContent value="ipo" className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[var(--text-secondary)]">進行中的 IPO</span>
              <span className="font-cyber" style={{ color: 'var(--green)' }}>IPO 獲利 {fmt(player.ipoProfit ?? 0)}</span>
            </div>
            {ipoEntries.length === 0 && (
              <div className="text-center text-xs text-[var(--text-muted)] py-6">
                目前沒有 IPO 案場（等待「IPO 狂潮」事件開啟）
              </div>
            )}
            {ipoEntries.map((ipo) => (
              <div key={ipo.symbol} className="cyber-card p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="font-cyber text-sm" style={{ color: 'var(--yellow)' }}>{ipo.symbol} {ipo.name}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    承銷價 ${fmt(ipo.offerPrice)} · 總股數 {fmt(ipo.totalShares)}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    你已申購 {fmt(player.ipoSubscriptions?.[ipo.symbol] ?? 0)} 股
                  </div>
                </div>
                <button type="button" onClick={() => handleSubscribe(ipo.symbol)}
                  className="cyber-btn px-3 py-2 text-xs min-h-[44px] flex-shrink-0"
                  style={{ borderColor: 'var(--yellow)', color: 'var(--yellow)' }}>
                  申購 10 股
                </button>
              </div>
            ))}
          </TabsContent>

          {/* 稅務 */}
          <TabsContent value="tax" className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="cyber-card p-3">
                <div className="text-lg font-cyber" style={{ color: 'var(--green)' }}>{fmt(gameState.taxPaidThisGame?.[playerIndex] ?? 0)}</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">已繳稅額</div>
              </div>
              <div className="cyber-card p-3">
                <div className="text-lg font-cyber" style={{ color: 'var(--yellow)' }}>{player.taxEvadedThisGame ?? 0}</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">逃稅次數</div>
              </div>
              <div className="cyber-card p-3">
                <div className="text-lg font-cyber" style={{ color: 'var(--red)' }}>{player.taxAuditedCount ?? 0}</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">被稽查次數</div>
              </div>
            </div>
            <div className="cyber-card p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              選擇如實申報，或鋌而走險逃稅——逃稅成功可省稅金，但遭稽查將面臨罰款。
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => handlePayTax(false)}
                className="cyber-btn flex-1 py-3 text-sm min-h-[44px]"
                style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                <Receipt size={15} className="inline mr-1" /> 如實申報
              </button>
              <button type="button" onClick={() => handlePayTax(true)}
                className="cyber-btn flex-1 py-3 text-sm min-h-[44px]"
                style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                冒險逃稅
              </button>
            </div>
          </TabsContent>

          {/* 利率與敵意收購 */}
          <TabsContent value="control" className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="cyber-card p-3">
                <div className="text-sm font-cyber" style={{ color: 'var(--cyan)' }}>{(centralRate * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">央行政策利率</div>
              </div>
              <div className="cyber-card p-3">
                <div className="text-sm font-cyber" style={{ color: 'var(--green)' }}>{(savingsRate * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">有效存款利率</div>
              </div>
              <div className="cyber-card p-3">
                <div className="text-sm font-cyber" style={{ color: 'var(--yellow)' }}>{(loanRate * 100).toFixed(1)}%</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">有效貸款利率</div>
              </div>
            </div>
            <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
              <Landmark size={13} /> 敵意收購持股比例
            </div>
            {(Object.keys(STOCKS) as StockSymbol[]).map((sym) => {
              const ratio = getStockOwnershipRatio(gameState, sym, playerIndex);
              const control = gameState.stockControl?.[sym];
              const iControl = control?.controllingPlayer === playerIndex;
              return (
                <div key={sym} className="cyber-card p-2.5 flex items-center justify-between">
                  <span className="font-cyber text-sm" style={{ color: 'var(--purple)' }}>{sym}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{(ratio * 100).toFixed(0)}%</span>
                    {iControl && (
                      <span className="px-1.5 py-0.5 text-[10px] font-cyber" style={{ border: '1px solid var(--green)', color: 'var(--green)' }}>
                        控股中
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="text-[10px] text-[var(--text-muted)] px-1">
              你已控制 {player.controlledCompanies?.length ?? 0} 家公司（持股達門檻可收紅利）
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default V4EconomyModal;
