import type { FC } from 'react';
import { X } from 'lucide-react';
import { ITEMS, MAX_ITEMS } from '@shared/game-config';
import type { GameState, ItemType } from '@shared/api.interface';

interface ItemShopProps {
  open: boolean;
  onClose: () => void;
  gameState: GameState;
  playerIndex: number;
  onBuy: (itemType: ItemType) => void;
}

const ItemShop: FC<ItemShopProps> = ({ open, onClose, gameState, playerIndex, onBuy }) => {
  if (!open) return null;

  const player = gameState.players[playerIndex];
  const playerMoney = player?.money ?? 0;
  const itemsHeld = player?.items?.length ?? 0;
  const isFull = itemsHeld >= MAX_ITEMS;
  const turnsUntilRefresh = Math.max(0, gameState.shopRefreshTurn - gameState.totalTurns);

  const handleBuy = (itemType: ItemType) => {
    if (isFull) return;
    const config = ITEMS[itemType];
    if (playerMoney < config.price) return;
    onBuy(itemType);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          border: '1px solid var(--cyan)',
          boxShadow:
            '0 0 30px color-mix(in srgb, var(--cyan) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--cyan) 5%, transparent)',
          animation: 'float-up 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-neon-cyan)' }}
        >
          <div>
            <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
              CYBER SHOP
            </div>
            <h2 className="text-neon-cyan font-cyber text-xl tracking-wider">道具商店</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shop items */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1">
          {isFull && (
            <div
              className="mb-4 px-3 py-2 rounded text-xs font-cyber tracking-wide text-center"
              style={{
                border: '1px solid var(--yellow)',
                color: 'var(--yellow)',
                backgroundColor: 'color-mix(in srgb, var(--yellow) 10%, transparent)',
                textShadow: '0 0 6px var(--yellow)',
              }}
            >
              注意 道具栏已满（{itemsHeld}/{MAX_ITEMS}），请先使用道具
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {gameState.shopItems.map((itemType: ItemType, idx: number) => {
              const config = ITEMS[itemType];
              if (!config) return null;
              const canAfford = playerMoney >= config.price;
              const disabled = !canAfford || isFull;

              return (
                <div
                  key={`${itemType}-${idx}`}
                  className="cyber-card rounded-lg p-3 flex flex-col gap-2"
                  style={{
                    border: `1px solid ${canAfford ? 'var(--border-neon-cyan)' : 'var(--text-muted)'}`,
                    opacity: canAfford ? 1 : 0.6,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div
                        className="font-cyber text-sm tracking-wide"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {config.name}
                      </div>
                      <div
                        className="font-cyber text-xs"
                        style={{
                          color: canAfford ? 'var(--green)' : 'var(--red)',
                          textShadow: canAfford ? '0 0 4px var(--green)' : 'none',
                        }}
                      >
                        ¥{config.price}
                      </div>
                    </div>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {config.description}
                  </p>
                  <button
                    onClick={() => handleBuy(itemType)}
                    disabled={disabled}
                    className="cyber-btn py-1.5 text-xs font-cyber tracking-wide mt-auto"
                    style={{
                      clipPath:
                        'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                    }}
                  >
                    {canAfford ? '購買' : '金币不足'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between text-xs font-cyber tracking-wide"
          style={{
            borderColor: 'var(--border-neon-cyan)',
            backgroundColor: 'color-mix(in srgb, var(--cyan) 3%, transparent)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            下次刷新：<span style={{ color: 'var(--cyan)' }}>{turnsUntilRefresh} 回合</span>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            道具栏：
            <span style={{ color: isFull ? 'var(--red)' : 'var(--pink)' }}>
              {itemsHeld}/{MAX_ITEMS}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemShop;
