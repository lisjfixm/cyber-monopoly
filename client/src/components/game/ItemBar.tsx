import { useState, useRef, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import {
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
  ScanLine,
  BadgePercent,
  Rocket,
  HeartPulse,
} from 'lucide-react';
import { ITEMS, ITEM_TYPES, MAX_ITEMS } from '@shared/game-config';
import type { GameState, ItemState, ItemType, PlayerState } from '@shared/api.interface';

interface ItemBarProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  onUseItem: (itemId: number, targetCellId?: number, remoteDiceValues?: [number, number]) => 'target_needed' | 'dice_needed' | void | Promise<'target_needed' | 'dice_needed' | void>;
  gameState: GameState;
}

// 使用 Partial 容納引擎後續新增的道具類型（未知道具以 Package 兜底）
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
  // v3.0 新增道具
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

// 取得道具圖標（未知類型兜底 Package）
function getItemIcon(type: ItemType): typeof Shield {
  return ITEM_ICON_COMPONENTS[type] ?? Package;
}

interface AggregatedItem {
  type: ItemType;
  count: number;
  firstItemId: number;
}

// 通用彈窗鎖定：鎖定背景滾動 + Esc 關閉
function useModalDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

const ItemBar: FC<ItemBarProps> = ({ player, isCurrentPlayer, onUseItem, gameState }) => {
  const items = player.items ?? [];
  const [confirmItem, setConfirmItem] = useState<ItemState | null>(null);
  const [remoteDiceModalOpen, setRemoteDiceModalOpen] = useState(false);
  const [pendingRemoteItemId, setPendingRemoteItemId] = useState<number | null>(null);
  const [dice1, setDice1] = useState<number>(1);
  const [dice2, setDice2] = useState<number>(1);
  // 競態鎖：防止連點重複使用道具
  const usingRef = useRef<boolean>(false);

  useModalDismiss(confirmItem !== null, useCallback(() => setConfirmItem(null), []));
  useModalDismiss(remoteDiceModalOpen, useCallback(() => {
    setRemoteDiceModalOpen(false);
    setPendingRemoteItemId(null);
  }, []));

  // 按类型聚合并计数
  const aggregated = aggregateItems(items);
  const clickable = isCurrentPlayer && gameState.phase === 'rolling' && gameState.winner === null;

  const handleItemClick = (agg: AggregatedItem) => {
    if (!clickable) return;
    if (usingRef.current) return;
    // 找到第一个可用的该类型道具
    const firstItem = items.find((it) => it.type === agg.type);
    if (!firstItem) return;
    setConfirmItem(firstItem);
  };

  const handleConfirmUse = () => {
    if (!confirmItem) return;
    if (usingRef.current) return;
    usingRef.current = true;
    const itemType = confirmItem.type;

    // 传送卡、偷地卡和炸彈需要选择目标
    if (itemType === 'teleport' || itemType === 'steal_property' || itemType === 'bomb' || itemType === 'land_bomb') {
      const result = onUseItem(confirmItem.id);
      if (result === 'target_needed') {
        // 父组件会进入选目标模式
      }
    } else if (itemType === 'remote_dice') {
      // 遥控骰子需要选择点数
      setPendingRemoteItemId(confirmItem.id);
      setDice1(3);
      setDice2(3);
      setRemoteDiceModalOpen(true);
    } else {
      onUseItem(confirmItem.id);
    }
    setConfirmItem(null);
    // 解鎖鎖（稍延遲避免同一事件迴圈重入）
    window.setTimeout(() => {
      usingRef.current = false;
    }, 150);
  };

  const handleConfirmRemoteDice = () => {
    if (pendingRemoteItemId === null) return;
    if (usingRef.current) return;
    usingRef.current = true;
    onUseItem(pendingRemoteItemId, undefined, [dice1, dice2]);
    setRemoteDiceModalOpen(false);
    setPendingRemoteItemId(null);
    window.setTimeout(() => {
      usingRef.current = false;
    }, 150);
  };

  const config = confirmItem ? ITEMS[confirmItem.type] : null;
  const ConfirmIcon = confirmItem ? getItemIcon(confirmItem.type) : Package;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] md:text-xs font-cyber tracking-wider text-[var(--text-secondary)]">
          道具栏
        </span>
        <span className="text-[10px] font-cyber text-[var(--text-muted)]">
          {items.length}/{MAX_ITEMS}
        </span>
      </div>

      {/* 激活状态标记 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {player.shieldCharges > 0 && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid var(--cyan)',
              color: 'var(--cyan)',
              backgroundColor: 'color-mix(in srgb, var(--cyan) 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, var(--cyan) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--cyan) 20%, transparent)',
              textShadow: '0 0 4px var(--cyan-glow)',
            }}
            title={`护盾剩余 ${player.shieldCharges} 次`}
          >
            <Shield className="w-3 h-3" />
            护盾 x{player.shieldCharges}
          </div>
        )}
        {player.doubleDiceActive && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid var(--yellow)',
              color: 'var(--yellow)',
              backgroundColor: 'color-mix(in srgb, var(--yellow) 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, var(--yellow) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--yellow) 20%, transparent)',
              textShadow: '0 0 4px var(--yellow)',
            }}
            title="双倍骰已激活"
          >
            <Dices className="w-3 h-3" />
            双倍骰
          </div>
        )}
        {player.remoteDiceActive && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid var(--purple)',
              color: 'var(--purple)',
              backgroundColor: 'color-mix(in srgb, var(--purple) 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, var(--purple) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--purple) 20%, transparent)',
              textShadow: '0 0 4px var(--purple)',
            }}
            title="遥控骰子已激活"
          >
            <Settings2 className="w-3 h-3" />
            遥控骰
          </div>
        )}
        {player.freePassRemaining > 0 && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid var(--pink)',
              color: 'var(--pink)',
              backgroundColor: 'color-mix(in srgb, var(--pink) 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, var(--pink) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--pink) 20%, transparent)',
              textShadow: '0 0 4px var(--pink-glow)',
            }}
            title={`免费过路剩余 ${player.freePassRemaining} 次`}
          >
            <Ticket className="w-3 h-3" />
            免费过路 x{player.freePassRemaining}
          </div>
        )}
        {player.invisibilityTurns !== undefined && player.invisibilityTurns > 0 && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid #a78bfa',
              color: '#a78bfa',
              backgroundColor: 'color-mix(in srgb, #a78bfa 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, #a78bfa 40%, transparent), inset 0 0 4px color-mix(in srgb, #a78bfa 20%, transparent)',
              textShadow: '0 0 4px #c4b5fd',
            }}
            title={`隐身剩余 ${player.invisibilityTurns} 回合`}
          >
            <Ghost className="w-3 h-3" />
            隱身 x{player.invisibilityTurns}
          </div>
        )}
        {player.moneyTreeTurns !== undefined && player.moneyTreeTurns > 0 && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid var(--green)',
              color: 'var(--green)',
              backgroundColor: 'color-mix(in srgb, var(--green) 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, var(--green) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--green) 20%, transparent)',
              textShadow: '0 0 4px var(--green)',
            }}
            title={`金钱树剩余 ${player.moneyTreeTurns} 回合`}
          >
            <TreeDeciduous className="w-3 h-3" />
            金錢樹 x{player.moneyTreeTurns}
          </div>
        )}
        {player.cloneDiceActive && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid #facc15',
              color: '#facc15',
              backgroundColor: 'color-mix(in srgb, #facc15 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, #facc15 40%, transparent), inset 0 0 4px color-mix(in srgb, #facc15 20%, transparent)',
              textShadow: '0 0 4px #fde047',
            }}
            title="克隆骰已激活"
          >
            <Target className="w-3 h-3" />
            克隆骰
          </div>
        )}
        {player.xRayActive && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-cyber tracking-wide"
            style={{
              border: '1px solid #22d3ee',
              color: '#22d3ee',
              backgroundColor: 'color-mix(in srgb, #22d3ee 12%, transparent)',
              boxShadow:
                '0 0 8px color-mix(in srgb, #22d3ee 40%, transparent), inset 0 0 4px color-mix(in srgb, #22d3ee 20%, transparent)',
              textShadow: '0 0 4px #67e8f9',
            }}
            title="透视镜已激活"
          >
            <Eye className="w-3 h-3" />
            透視鏡
          </div>
        )}
      </div>

      {/* 道具格子 - 水平捲動列（v3 改進：只顯示已持有道具，避免 42 種全部平鋪造成畫面混亂） */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
        role="listbox"
        aria-label="已持有道具"
      >
        {aggregated.length === 0 && (
          <div
            className="flex-1 text-center text-[11px] font-cyber tracking-wider py-3 rounded"
            style={{
              color: 'var(--text-muted)',
              border: '1px dashed var(--text-muted)',
            }}
          >
            尚無道具 — 至商店購買
          </div>
        )}
        {aggregated.map((agg) => {
          const itemConfig = ITEMS[agg.type];
          const IconComponent = getItemIcon(agg.type);
          if (!itemConfig) return null;
          const isActive =
            (agg.type === 'shield' && player.shieldCharges > 0) ||
            (agg.type === 'double_dice' && player.doubleDiceActive) ||
            (agg.type === 'remote_dice' && player.remoteDiceActive) ||
            (agg.type === 'invisibility' && (player.invisibilityTurns ?? 0) > 0) ||
            (agg.type === 'money_tree' && (player.moneyTreeTurns ?? 0) > 0) ||
            (agg.type === 'x_ray' && player.xRayActive) ||
            (agg.type === 'clone_dice' && player.cloneDiceActive);

          return (
            <button
              key={agg.type}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => handleItemClick(agg)}
              disabled={!clickable}
              className={`relative min-w-[44px] h-11 px-1.5 rounded flex flex-col items-center justify-center gap-0.5 transition-all flex-shrink-0 ${
                clickable
                  ? 'hover:brightness-125 hover:scale-105 cursor-pointer'
                  : 'cursor-default opacity-60'
              }`}
              style={{
                border: isActive
                  ? '2px solid var(--cyan)'
                  : '1px solid var(--border-neon-cyan)',
                backgroundColor: 'var(--bg-card)',
                boxShadow: isActive
                  ? '0 0 12px var(--cyan), inset 0 0 8px color-mix(in srgb, var(--cyan) 30%, transparent)'
                  : 'inset 0 0 4px color-mix(in srgb, var(--cyan) 10%, transparent)',
                animation: isActive ? 'pulse-glow 2s ease-in-out infinite' : undefined,
                color: 'var(--cyan)',
              }}
              title={`${itemConfig.name} x${agg.count} — ${itemConfig.description}`}
            >
              <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
              <span
                className="text-[8px] md:text-[9px] font-cyber tracking-wide leading-tight"
                style={{ color: 'var(--text-secondary)' }}
              >
                {itemConfig.name.slice(0, 4)}
              </span>
              {/* 数量角标 */}
              {agg.count > 1 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-cyber font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--pink)',
                    color: 'var(--bg-deep)',
                    boxShadow: '0 0 6px var(--pink-glow)',
                  }}
                >
                  {agg.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* 保留 ITEM_TYPES 引用避免未使用告警（未來可作為"全部道具"索引入口） */}
      <span className="hidden">{ITEM_TYPES.length}</span>

      {/* 确认使用弹窗 */}
      {confirmItem && config && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`使用道具 ${config.name}`}
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-deep) 80%, transparent)',
            backdropFilter: 'blur(3px)',
            animation: 'fade-in 0.15s ease-out',
          }}
          onClick={() => setConfirmItem(null)}
        >
          <div
            className="cyber-card rounded-xl p-5 max-w-xs w-full text-center"
            style={{
              border: '1px solid var(--cyan)',
              boxShadow:
                '0 0 20px color-mix(in srgb, var(--cyan) 30%, transparent)',
              animation: 'float-up 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{
                border: '1px solid var(--cyan)',
                backgroundColor: 'color-mix(in srgb, var(--cyan) 10%, transparent)',
                color: 'var(--cyan)',
                boxShadow: '0 0 12px color-mix(in srgb, var(--cyan) 40%, transparent)',
              }}
            >
              <ConfirmIcon className="w-7 h-7" />
            </div>
            <div className="text-neon-cyan font-cyber text-lg tracking-wider mb-2">
              {config.name}
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {config.description}
            </p>
            {(confirmItem.type === 'teleport' || confirmItem.type === 'swap_portal') && (
              <p className="text-xs mb-3 text-[var(--yellow)]">
                提示：使用后请在棋盘上選擇目标格子
              </p>
            )}
            {(confirmItem.type === 'steal_property' || confirmItem.type === 'bomb' || confirmItem.type === 'land_bomb') && (
              <p className="text-xs mb-3 text-[var(--yellow)]">
                提示：使用后请選擇对手的目标地产
              </p>
            )}
            {confirmItem.type === 'remote_dice' && (
              <p className="text-xs mb-3 text-[var(--yellow)]">
                提示：使用后请選擇两个骰子的点数（2-12）
              </p>
            )}
            {confirmItem.type === 'emp_gun' && (
              <p className="text-xs mb-3 text-[var(--yellow)]">
                提示：指定一名對手，使其下回合跳過行動
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmItem(null)}
                className="flex-1 cyber-btn py-2 text-sm font-cyber min-h-[44px]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmUse}
                className="flex-1 cyber-btn cyber-btn-pink py-2 text-sm font-cyber min-h-[44px]"
              >
                使用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 遥控骰子选择弹窗 */}
      {remoteDiceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="遥控骰子"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-deep) 80%, transparent)',
            backdropFilter: 'blur(3px)',
            animation: 'fade-in 0.15s ease-out',
          }}
          onClick={() => {
            setRemoteDiceModalOpen(false);
            setPendingRemoteItemId(null);
          }}
        >
          <div
            className="cyber-card rounded-xl p-5 max-w-sm w-full text-center"
            style={{
              border: '1px solid var(--purple)',
              boxShadow:
                '0 0 20px color-mix(in srgb, var(--purple) 30%, transparent)',
              animation: 'float-up 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl mb-3 font-cyber" style={{ color: 'var(--cyan)' }}>遙控</div>
            <div
              className="font-cyber text-lg tracking-wider mb-4"
              style={{ color: 'var(--purple)', textShadow: '0 0 8px var(--purple)' }}
            >
              遥控骰子
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              選擇你想要的两个骰子点数
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <DiceSelector value={dice1} onChange={setDice1} label="骰子1" />
              <span className="font-cyber text-2xl" style={{ color: 'var(--text-secondary)' }}>+</span>
              <DiceSelector value={dice2} onChange={setDice2} label="骰子2" />
            </div>

            <div
              className="text-sm font-cyber mb-4"
              style={{ color: 'var(--cyan)' }}
            >
              总点数：{dice1 + dice2}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRemoteDiceModalOpen(false);
                  setPendingRemoteItemId(null);
                }}
                className="flex-1 cyber-btn py-2 text-sm font-cyber min-h-[44px]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoteDice}
                className="flex-1 cyber-btn cyber-btn-pink py-2 text-sm font-cyber min-h-[44px]"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 骰子选择器子组件
interface DiceSelectorProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

const DiceSelector: FC<DiceSelectorProps> = ({ value, onChange, label }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <button
        type="button"
        aria-label={`${label} 目前點數 ${value}，點擊切換`}
        className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform"
        style={{
          border: '2px solid var(--cyan)',
          backgroundColor: 'var(--bg-mid)',
          boxShadow:
            '0 0 10px color-mix(in srgb, var(--cyan) 30%, transparent), inset 0 0 8px color-mix(in srgb, var(--cyan) 15%, transparent)',
        }}
        onClick={() => onChange((value % 6) + 1)}
      >
        {['①', '②', '③', '④', '⑤', '⑥'][value - 1] ?? '①'}
      </button>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} 點數 ${n}`}
            onClick={() => onChange(n)}
            className="w-5 h-5 rounded text-[10px] font-cyber transition-all"
            style={{
              border: value === n ? '1px solid var(--cyan)' : '1px solid var(--text-muted)',
              backgroundColor: value === n ? 'color-mix(in srgb, var(--cyan) 20%, transparent)' : 'transparent',
              color: value === n ? 'var(--cyan)' : 'var(--text-secondary)',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
};

// 聚合道具的工具函数
function aggregateItems(items: ItemState[]): AggregatedItem[] {
  const map = new Map<ItemType, { count: number; firstItemId: number }>();
  for (const item of items) {
    const existing = map.get(item.type);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(item.type, { count: 1, firstItemId: item.id });
    }
  }
  const result: AggregatedItem[] = [];
  for (const [type, data] of map) {
    result.push({ type, count: data.count, firstItemId: data.firstItemId });
  }
  return result;
}

export default ItemBar;
