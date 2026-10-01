import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { X, Building2, Landmark, Wallet } from 'lucide-react';
import type { GameState, PlayerState } from '@shared/api.interface';
import { CELLS } from '@shared/game-config';

interface BatchSelectModalProps {
  open: boolean;
  type: 'build' | 'mortgage' | 'redeem';
  gameState: GameState;
  playerIndex: number;
  playerMoney: number;
  onClose: () => void;
  onConfirm: (cellIds: number[]) => void;
}

const BatchSelectModal: FC<BatchSelectModalProps> = ({
  open,
  type,
  gameState,
  playerIndex,
  playerMoney,
  onClose,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const properties = useMemo(() => {
    if (!gameState) return [];
    const cells = gameState.boardCells?.map((c, idx) => ({ ...c, index: idx })) ??
      CELLS.map((c, idx) => ({ ...c, index: idx }));

    return cells.filter((c) => {
      if (c.type !== 'property') return false;
      const prop = gameState.properties[c.index];
      if (!prop) return false;
      if (prop.owner !== playerIndex) return false;

      if (type === 'build') {
        if (prop.isMortgaged) return false;
        return (prop.buildings ?? 0) < 5;
      }
      if (type === 'mortgage') {
        return !prop.isMortgaged;
      }
      return prop.isMortgaged;
    });
  }, [gameState, playerIndex, type]);

  const totalAmount = useMemo(() => {
    if (!gameState) return 0;
    let total = 0;
    for (const cell of properties) {
      if (!selected.has(cell.index)) continue;
      const price = cell.basePrice ?? 0;
      if (type === 'build') {
        const buildCost = Math.floor(price * 0.5);
        total += buildCost;
      } else if (type === 'mortgage') {
        total += Math.floor(price * 0.5);
      } else {
        total += Math.floor(price * 0.55);
      }
    }
    return total;
  }, [properties, selected, type, gameState]);

  if (!open) return null;

  const toggleSelect = (cellIndex: number) => {
    const next = new Set(selected);
    if (next.has(cellIndex)) {
      next.delete(cellIndex);
    } else {
      next.add(cellIndex);
    }
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === properties.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(properties.map((c) => c.index)));
    }
  };

  const titleText = type === 'build' ? '批量建造' : type === 'mortgage' ? '批量抵押' : '批量贖回';
  const titleColor = type === 'build' ? 'var(--green)' : type === 'mortgage' ? 'hsl(45, 100%, 60%)' : 'var(--cyan)';
  const amountLabel = type === 'mortgage' ? '獲得現金' : '總花費';

  const canAfford = type === 'mortgage' ? true : playerMoney >= totalAmount;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card rounded-lg w-full max-w-md flex flex-col max-h-[85vh]"
        style={{
          border: `1px solid ${titleColor}`,
          boxShadow: `0 0 20px ${titleColor}, inset 0 0 20px ${titleColor}15`,
          animation: 'modal-in 0.3s ease-out',
        }}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {type === 'build' && <Building2 className="w-5 h-5" style={{ color: titleColor }} />}
            {type === 'mortgage' && <Wallet className="w-5 h-5" style={{ color: titleColor }} />}
            {type === 'redeem' && <Landmark className="w-5 h-5" style={{ color: titleColor }} />}
            <h3
              className="font-cyber text-lg tracking-wider"
              style={{ color: titleColor, textShadow: `0 0 8px ${titleColor}` }}
            >
              {titleText}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            共 {properties.length} 塊地產
          </span>
          <button
            onClick={toggleAll}
            className="text-xs font-cyber tracking-wide px-3 py-1 rounded transition-all"
            style={{
              border: `1px solid ${titleColor}`,
              color: titleColor,
              backgroundColor: `${titleColor}10`,
            }}
          >
            {selected.size === properties.length ? '取消全選' : '全選'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {properties.length === 0 ? (
            <div
              className="text-center py-8 text-xs rounded"
              style={{
                color: 'var(--text-secondary)',
                border: '1px dashed var(--border-neon-cyan)',
              }}
            >
              沒有可操作的地產
            </div>
          ) : (
            properties.map((cell) => {
              const prop = gameState.properties[cell.index];
              const buildings = prop?.buildings ?? 0;
              const isSelected = selected.has(cell.index);
              const price = cell.basePrice ?? 0;
              let unitText = '';
              if (type === 'build') unitText = `造價 ¥${Math.floor(price * 0.5)}`;
              else if (type === 'mortgage') unitText = `抵押值 ¥${Math.floor(price * 0.5)}`;
              else unitText = `贖回價 ¥${Math.floor(price * 0.55)}`;

              return (
                <button
                  key={cell.index}
                  onClick={() => toggleSelect(cell.index)}
                  className="w-full p-2.5 rounded-lg flex items-center gap-3 text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? `${titleColor}15` : 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${isSelected ? titleColor : 'rgba(255, 255, 255, 0.08)'}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                    style={{
                      borderColor: titleColor,
                      backgroundColor: isSelected ? titleColor : 'transparent',
                    }}
                  >
                    {isSelected && <span style={{ color: '#000', fontSize: 12, fontWeight: 700 }}>確認</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {cell.name}
                      </span>
                      <span className="text-xs font-cyber flex-shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                        {unitText}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {type === 'build'
                        ? `現有 ${buildings} 層 → ${buildings + 1} 層`
                        : `地價 ¥${price}`}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              已選 {selected.size} 塊
            </span>
            <span
              className={`font-cyber text-lg ${!canAfford && type !== 'mortgage' ? '' : ''}`}
              style={{
                color: type === 'mortgage'
                  ? 'var(--green)'
                  : canAfford ? 'var(--cyan)' : 'var(--red)',
              }}
            >
              {amountLabel} ¥{totalAmount.toLocaleString()}
            </span>
          </div>
          {!canAfford && type !== 'mortgage' && (
            <div className="text-xs text-center" style={{ color: 'var(--red)' }}>
              現金不足
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
              style={{ border: '1px solid var(--border-neon-cyan)', color: 'var(--text-secondary)' }}
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(Array.from(selected))}
              disabled={selected.size === 0 || !canAfford}
              className="flex-1 py-2 rounded font-cyber text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{
                border: `1px solid ${titleColor}`,
                color: titleColor,
                backgroundColor: `${titleColor}15`,
                boxShadow: canAfford ? `0 0 10px ${titleColor}40` : 'none',
                textShadow: `0 0 4px ${titleColor}`,
              }}
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchSelectModal;
