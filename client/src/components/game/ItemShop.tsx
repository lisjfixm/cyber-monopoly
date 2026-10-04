import type { FC } from 'react';
import { useEffect, useCallback } from 'react';
import {
  X,
  Shield,
  Sparkles,
  Swords,
  Ticket,
  Dices,
  Settings2,
  Bomb,
  Ghost,
  Clock,
  TreeDeciduous,
  Eye,
  Target,
  RotateCcw,
  Zap,
  Radio,
  Palette,
  Plane,
  CreditCard,
  Satellite,
  FileText,
  Package,
  IdCard,
  Snowflake,
  Repeat,
  Crown,
  Database,
  Bug,
  Magnet,
  Coins,
  Shell,
  Banknote,
  Crosshair,
  TreePine,
  BadgePercent,
  Rocket,
  HeartPulse,
} from 'lucide-react';
import { ITEMS, MAX_ITEMS } from '@shared/game-config';
import type { GameState, ItemType } from '@shared/api.interface';

interface ItemShopProps {
  open: boolean;
  onClose: () => void;
  gameState: GameState;
  playerIndex: number;
  onBuy: (itemType: ItemType) => void;
}

// 與 ItemBar 保持一致的道具圖標映射（未知道具以 Package 兜底）
const ITEM_ICON_COMPONENTS: Partial<Record<ItemType, typeof Shield>> = {
  double_dice: Dices,
  teleport: Sparkles,
  steal_property: Swords,
  shield: Shield,
  free_pass: Ticket,
  remote_dice: Settings2,
  bomb: Bomb,
  invisibility: Ghost,
  time_machine: Clock,
  money_tree: TreeDeciduous,
  x_ray: Eye,
  clone_dice: Target,
  time_travel: RotateCcw,
  hacker_backdoor: Zap,
  emp_pulse: Radio,
  stealth_cloak: Palette,
  drone_scout: Satellite,
  quantum_portal: Plane,
  credit_voucher: CreditCard,
  time_pocket_watch: Clock,
  electronic_contract: FileText,
  energy_shield: Shield,
  data_courier: Package,
  fake_id: IdCard,
  freeze_ray: Snowflake,
  swap_portal: Repeat,
  golden_passport: Crown,
  data_backup: Database,
  loaded_dice: Dices,
  ransomware: Bug,
  toll_magnet: Magnet,
  lucky_coin: Coins,
  overclock_shield: Shell,
  cash_injection: Banknote,
  emp_gun: Crosshair,
  land_bomb: Bomb,
  money_tree_plus: TreePine,
  ghost_protocol: Ghost,
  buy_coupon: BadgePercent,
  loot_drone: Satellite,
  warp_token: Rocket,
  heal_synth: HeartPulse,
};

function getItemIcon(type: ItemType): typeof Shield {
  return ITEM_ICON_COMPONENTS[type] ?? Package;
}

const ItemShop: FC<ItemShopProps> = ({ open, onClose, gameState, playerIndex, onBuy }) => {
  // Esc 關閉 + 背景滾動鎖
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleBuy = useCallback((itemType: ItemType) => {
    onBuy(itemType);
  }, [onBuy]);

  if (!open) return null;

  const player = gameState.players[playerIndex];
  const playerMoney = player?.money ?? 0;
  const itemsHeld = player?.items?.length ?? 0;
  const isFull = itemsHeld >= MAX_ITEMS;
  const turnsUntilRefresh = Math.max(0, gameState.shopRefreshTurn - gameState.totalTurns);
  const shopItems = gameState.shopItems ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="道具商店"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          border: '1px solid var(--cyan)',
          boxShadow:
            '0 0 30px color-mix(in srgb, var(--cyan) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--cyan) 5%, transparent)',
          animation: 'float-up 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'var(--border-neon-cyan)' }}
        >
          <div>
            <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
              CYBER SHOP
            </div>
            <h2 className="text-neon-cyan font-cyber text-xl tracking-wider">道具商店</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 -m-1 rounded flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="關閉道具商店"
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

          {shopItems.length === 0 ? (
            <div
              className="py-10 text-center text-xs font-cyber tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              商店尚無商品，下輪刷新
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shopItems.map((itemType: ItemType, idx: number) => {
                const config = ITEMS[itemType];
                if (!config) return null;
                const IconComponent = getItemIcon(itemType);
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
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          border: '1px solid var(--cyan)',
                          backgroundColor: 'color-mix(in srgb, var(--cyan) 10%, transparent)',
                          color: 'var(--cyan)',
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-cyber text-sm tracking-wide truncate"
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
                          ¥{config.price.toLocaleString()}
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
                      type="button"
                      onClick={() => handleBuy(itemType)}
                      disabled={disabled}
                      className="cyber-btn py-2 text-xs font-cyber tracking-wide mt-auto min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isFull ? '道具欄已滿' : canAfford ? '購買' : '金幣不足'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between text-xs font-cyber tracking-wide flex-shrink-0"
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
