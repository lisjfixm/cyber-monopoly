import type { FC } from 'react';
import { useState } from 'react';
import { X, AlertTriangle, ShoppingCart, Skull } from 'lucide-react';
import type { StolenProperty, CellConfig } from '@shared/api.interface';

interface UndergroundMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  stolenProperties: StolenProperty[];
  playerMoney: number;
  playerReputation?: number;
  canTrade: boolean;
  onBuy: (cellId: number) => void;
  cellConfigs: CellConfig[];
}

const UndergroundMarketModal: FC<UndergroundMarketModalProps> = ({
  isOpen,
  onClose,
  stolenProperties,
  playerMoney,
  playerReputation,
  canTrade,
  onBuy,
  cellConfigs,
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!isOpen) return null;

  const forSaleItems = stolenProperties.filter((s) => s.forSale);

  const getCellName = (cellId: number): string => {
    const cell = cellConfigs.find((c) => c.id === cellId);
    return cell?.name ?? `地產 #${cellId}`;
  };

  const getOriginalPrice = (stolen: StolenProperty): number => {
    // 折扣比例由後端 StolenProperty.discount 提供，前端兜底 0.4
    const discount = stolen.discount ?? 0.4;
    return Math.floor(stolen.price / discount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          borderColor: 'hsl(0, 100%, 60%)',
          boxShadow:
            '0 0 40px rgba(255, 77, 109, 0.4), inset 0 0 30px rgba(255, 77, 109, 0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 md:p-5 border-b"
          style={{ borderColor: 'rgba(255, 77, 109, 0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 77, 109, 0.15)',
                border: '1px solid var(--red)',
                boxShadow: '0 0 15px rgba(255, 77, 109, 0.4)',
              }}
            >
              <Skull className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--red)' }} />
            </div>
            <div>
              <h2
                className="font-cyber text-xl md:text-2xl tracking-wider"
                style={{
                  color: 'var(--red)',
                  textShadow: '0 0 10px var(--red), 0 0 20px var(--red)',
                }}
              >
                地下市場
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                聲望不足者的樂園，低價入手，但小心警察...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player stats */}
        <div
          className="px-4 md:px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255, 77, 109, 0.2)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-cyber tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              聲望
            </span>
            <span
              className="font-cyber text-base tracking-wider"
              style={{
                color: playerReputation !== undefined && playerReputation < 50
                  ? 'var(--red)'
                  : 'var(--yellow)',
                textShadow: playerReputation !== undefined && playerReputation < 50
                  ? '0 0 8px var(--red)'
                  : '0 0 8px var(--yellow)',
              }}
            >
              {playerReputation ?? 100}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-cyber tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              現金
            </span>
            <span
              className="font-cyber text-base tracking-wider"
              style={{
                color: 'var(--green)',
                textShadow: '0 0 8px var(--green)',
              }}
            >
              ¥{playerMoney.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 無法進入提示 */}
        {!canTrade && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-3">
              <AlertTriangle
                className="w-12 h-12 mx-auto"
                style={{ color: 'var(--red)' }}
              />
              <p
                className="font-cyber text-lg tracking-wider"
                style={{ color: 'var(--red)', textShadow: '0 0 8px var(--red)' }}
              >
                聲望不足
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                聲望需低於 50 才能進入地下市場
              </p>
            </div>
          </div>
        )}

        {/* 贓物列表 */}
        {canTrade && (
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            {forSaleItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart
                  className="w-10 h-10 mx-auto mb-3 opacity-30"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <p style={{ color: 'var(--text-secondary)' }}>
                  目前沒有贓物出售
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {forSaleItems.map((stolen) => {
                  const cellName = getCellName(stolen.cellId);
                  const originalPrice = getOriginalPrice(stolen);
                  const canAfford = playerMoney >= stolen.price;

                  return (
                    <div
                      key={stolen.cellId}
                      className="p-4 rounded-lg flex flex-col gap-2"
                      style={{
                        backgroundColor: 'rgba(255, 77, 109, 0.05)',
                        border: '1px solid rgba(255, 77, 109, 0.25)',
                        boxShadow: '0 0 10px rgba(255, 77, 109, 0.1)',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div
                            className="font-cyber text-sm md:text-base tracking-wide"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {cellName}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            來源：第 {stolen.stolenFrom + 1} 號玩家
                          </div>
                        </div>
                      </div>

                       <div className="flex items-baseline gap-2">
                         <span
                           className="text-xs line-through"
                           style={{ color: 'var(--text-secondary)' }}
                         >
                           ¥{originalPrice.toLocaleString()}
                         </span>
                         <span
                           className="font-cyber text-lg tracking-wider"
                           style={{
                             color: 'var(--red)',
                             textShadow: '0 0 8px var(--red)',
                           }}
                         >
                           ¥{stolen.price.toLocaleString()}
                         </span>
                         <span
                           className="text-xs ml-auto"
                           style={{ color: 'var(--green)' }}
                         >
                           {Math.round((stolen.discount ?? 0.4) * 10)}折
                         </span>
                       </div>

                      <div
                        className="text-xs flex items-center gap-1"
                        style={{ color: 'var(--yellow)' }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        30% 概率被警察沒收
                      </div>

                       <button
                         onClick={() => {
                           if (isPurchasing) return;
                           setIsPurchasing(true);
                           const result = onBuy(stolen.cellId) as unknown;
                           if (result && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
                             (result as Promise<unknown>).then(() => setIsPurchasing(false)).catch(() => setIsPurchasing(false));
                           } else {
                             setIsPurchasing(false);
                           }
                         }}
                         disabled={!canAfford || !canTrade || isPurchasing}
                         className="w-full py-2 mt-1 rounded text-xs font-cyber tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          border: '1px solid var(--red)',
                          color: 'var(--red)',
                          backgroundColor: canAfford
                            ? 'rgba(255, 77, 109, 0.15)'
                            : 'transparent',
                          boxShadow: canAfford
                            ? '0 0 10px rgba(255, 77, 109, 0.3)'
                            : 'none',
                        }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 inline mr-1" />
                        {canAfford ? '購買' : '資金不足'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="px-4 md:px-5 py-3 border-t text-center text-xs"
          style={{
            borderColor: 'rgba(255, 77, 109, 0.2)',
            color: 'var(--text-secondary)',
          }}
        >
          注意 購買有風險，請謹慎操作
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--red)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--red)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--red)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--red)]" />
      </div>
    </div>
  );
};

export default UndergroundMarketModal;
