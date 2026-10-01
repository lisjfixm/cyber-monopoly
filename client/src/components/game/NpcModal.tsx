import { useState, type FC, useEffect } from 'react';
import type { NpcEntity, ItemState, ItemType } from '@shared/api.interface';
import { ITEMS, MAX_ITEMS, NPC_CONFIG } from '@shared/game-config';
import {
  ShoppingBag,
  UserSearch,
  DollarSign,
  X,
  Package,
} from 'lucide-react';

interface NpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  npc: NpcEntity | null;
  playerIndex: number;
  playerMoney: number;
  playerItems: ItemState[];
  opponents: { index: number; name: string; items: ItemState[] }[];
  canInteract: boolean;
  onBuyItem: (itemType: string) => void;
  onHireHacker: (targetIndex: number) => void;
}

const NpcModal: FC<NpcModalProps> = ({
  isOpen,
  onClose,
  npc,
  playerMoney,
  playerItems,
  opponents,
  canInteract,
  onBuyItem,
  onHireHacker,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHoveredItem(null);
    }
  }, [isOpen]);

  if (!isOpen || !npc) return null;

  const isMerchant = npc.type === 'wanderer';
  const isHacker = npc.type === 'hacker';
  const config = NPC_CONFIG[npc.type];

  const themeColor = isMerchant ? 'var(--yellow)' : 'var(--purple)';
  const themeGlow = isMerchant
    ? 'color-mix(in srgb, var(--yellow) 30%, transparent)'
    : 'color-mix(in srgb, var(--purple) 30%, transparent)';
  const themeGlowBg = isMerchant
    ? 'color-mix(in srgb, var(--yellow) 5%, transparent)'
    : 'color-mix(in srgb, var(--purple) 5%, transparent)';

  const getItemCount = (itemType: ItemType): number =>
    playerItems.filter((it: ItemState) => it.type === itemType).length;

  const merchantPrice = (basePrice: number): number =>
    Math.ceil(basePrice * 1.5);

  const canBuyItem = (itemType: ItemType): boolean => {
    if (!canInteract) return false;
    const itemConfig = ITEMS[itemType];
    if (!itemConfig) return false;
    const price = merchantPrice(itemConfig.price);
    if (playerMoney < price) return false;
    if (getItemCount(itemType) >= MAX_ITEMS) return false;
    return true;
  };

  const canHireTarget = (targetItems: ItemState[]): boolean => {
    if (!canInteract) return false;
    if (playerMoney < 1000) return false;
    return targetItems.length > 0;
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
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden"
        style={{
          border: `1px solid ${themeColor}`,
          boxShadow: `0 0 30px ${themeGlow}, inset 0 0 20px ${themeGlowBg}`,
          animation: 'float-up 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded transition-all hover:scale-110"
          style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'color-mix(in srgb, var(--bg-deep) 60%, transparent)',
            border: '1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent)',
          }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: `color-mix(in srgb, ${themeColor} 30%, transparent)` }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            {isMerchant ? 'NPC / MERCHANT' : 'NPC / HACKER'}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${themeColor} 15%, transparent)`,
                border: `1px solid ${themeColor}`,
                boxShadow: `0 0 12px ${themeGlow}`,
              }}
            >
              {isMerchant ? (
                <ShoppingBag className="w-6 h-6" style={{ color: themeColor }} />
              ) : (
                <UserSearch className="w-6 h-6" style={{ color: themeColor }} />
              )}
            </div>
            <div>
              <h2
                className="text-xl md:text-2xl font-cyber tracking-wider"
                style={{ color: themeColor }}
              >
                {config.name}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isMerchant
                  ? '稀有道具，價格稍貴，但品質保證！'
                  : '花 $1000 幫你偷取對手一個隨機道具'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* My money */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'var(--bg-mid)' }}
          >
            <div className="flex items-center gap-2">
              <DollarSign
                className="w-4 h-4"
                style={{ color: 'var(--green)' }}
              />
              <span className="text-xs text-[var(--text-secondary)]">
                我的現金
              </span>
            </div>
            <span
              className="font-cyber text-sm"
              style={{ color: 'var(--green)' }}
            >
              ¥{playerMoney.toLocaleString()}
            </span>
          </div>

          {/* Merchant: item list */}
          {isMerchant && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package
                  className="w-4 h-4"
                  style={{ color: themeColor }}
                />
                <span className="text-xs font-cyber tracking-wider" style={{ color: themeColor }}>
                  稀有道具（價格 ×1.5）
                </span>
              </div>
              <div className="space-y-2">
                {(Object.keys(ITEMS) as ItemType[]).map((itemType) => {
                  const item = ITEMS[itemType];
                  const price = merchantPrice(item.price);
                  const count = getItemCount(itemType);
                  const canBuy = canBuyItem(itemType);
                  const isFull = count >= MAX_ITEMS;
                  const isHovered = hoveredItem === itemType;

                  return (
                    <div
                      key={itemType}
                      onMouseEnter={() => setHoveredItem(itemType)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="p-3 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'var(--bg-mid)',
                        border: isHovered
                          ? `1px solid ${themeColor}`
                          : '1px solid transparent',
                        boxShadow: isHovered
                          ? `0 0 8px ${themeGlow}`
                          : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${themeColor} 10%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${themeColor} 20%, transparent)`,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-cyber text-sm tracking-wide"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {item.name}
                            </span>
                            <span
                              className="text-[10px] font-cyber px-1 rounded"
                              style={{
                                color: 'var(--text-secondary)',
                                backgroundColor:
                                  'color-mix(in srgb, var(--text-secondary) 15%, transparent)',
                              }}
                            >
                              {count}/{MAX_ITEMS}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className="font-cyber text-sm"
                            style={{
                              color: canBuy ? themeColor : 'var(--text-secondary)',
                              textDecoration: isFull ? 'line-through' : 'none',
                            }}
                          >
                            ¥{price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => canBuy && onBuyItem(itemType)}
                            disabled={!canBuy}
                            className="cyber-btn cyber-btn-pink px-3 py-1 text-xs"
                            style={{
                              opacity: canBuy ? 1 : 0.5,
                              cursor: canBuy ? 'pointer' : 'not-allowed',
                            }}
                          >
                            購買
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hacker: opponent list */}
          {isHacker && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserSearch
                  className="w-4 h-4"
                  style={{ color: themeColor }}
                />
                <span className="text-xs font-cyber tracking-wider" style={{ color: themeColor }}>
                  選擇偷取目標（花費 $1000）
                </span>
              </div>
              <div className="space-y-2">
                {opponents.map((opp) => {
                  const canHire = canHireTarget(opp.items);
                  return (
                    <div
                      key={opp.index}
                      className="p-3 rounded-lg flex items-center justify-between"
                      style={{
                        backgroundColor: 'var(--bg-mid)',
                        border: '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
                          style={{
                            backgroundColor:
                              'color-mix(in srgb, var(--purple) 15%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
                            color: 'var(--purple)',
                          }}
                        >
                          {opp.name.charAt(0)}
                        </div>
                        <div>
                          <div
                            className="font-cyber text-sm tracking-wide"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {opp.name}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            道具：{opp.items.length} 個
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => canHire && onHireHacker(opp.index)}
                        disabled={!canHire}
                        className="cyber-btn px-3 py-1 text-xs"
                        style={{
                          borderColor: canHire ? 'var(--purple)' : 'rgba(255,255,255,0.1)',
                          color: canHire ? 'var(--purple)' : 'var(--text-secondary)',
                          background: canHire
                            ? 'rgba(168, 85, 247, 0.08)'
                            : 'transparent',
                          opacity: canHire ? 1 : 0.5,
                          cursor: canHire ? 'pointer' : 'not-allowed',
                        }}
                      >
                        僱用
                      </button>
                    </div>
                  );
                })}
                {opponents.length === 0 && (
                  <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                    沒有可偷取的對手
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interaction hint */}
          {!canInteract && (
            <div
              className="p-3 rounded-lg text-center text-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--text-secondary) 5%, transparent)',
                border: '1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent)',
                color: 'var(--text-secondary)',
              }}
            >
              等待對方互動...
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <div
          className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2"
          style={{ borderColor: 'var(--cyan)' }}
        />
        <div
          className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2"
          style={{ borderColor: 'var(--cyan)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2"
          style={{ borderColor: 'var(--cyan)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2"
          style={{ borderColor: 'var(--cyan)' }}
        />
      </div>
    </div>
  );
};

export default NpcModal;
