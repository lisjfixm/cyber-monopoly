import type { FC } from 'react';
import type { CellConfig } from '@shared/api.interface';
import { SETS } from '@shared/game-config';
import { Layers } from 'lucide-react';

interface PropertyPanelProps {
  cell: CellConfig | null;
  onUpdate: (patch: Partial<CellConfig>) => void;
  onApplyToSameColor?: () => void;
  allCells?: CellConfig[];
}

const PropertyPanel: FC<PropertyPanelProps> = ({ cell, onUpdate, onApplyToSameColor, allCells }) => {
  if (!cell) {
    return (
      <div className="cyber-card p-3 md:p-4 h-full flex items-center justify-center">
        <div className="text-center text-[var(--text-secondary)]">
          <p className="font-cyber tracking-wider text-sm mb-1">未選中格子</p>
          <p className="text-xs">點擊棋盤上的格子以編輯屬性</p>
        </div>
      </div>
    );
  }

  const isProperty = cell.type === 'property';

  return (
    <div className="cyber-card p-3 md:p-4 h-full flex flex-col gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-cyber text-sm tracking-wider text-neon-pink">屬性面板</h3>
        <span className="text-xs font-cyber text-[var(--text-secondary)]">
          格子 #{cell.id}
        </span>
      </div>

      {/* Type display */}
      <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
        類型：
        <span className="text-neon-cyan ml-1">
          {cell.type === 'start' && '起點'}
          {cell.type === 'property' && '地產'}
          {cell.type === 'detention' && '禁閉區'}
          {cell.type === 'fate' && '命運區'}
          {cell.type === 'chance' && '機會區'}
          {cell.type === 'minigame' && '遊戲區'}
          {cell.type === 'parking' && '停車場'}
          {cell.type === 'jail' && '監獄/免費停車'}
          {cell.type === 'event' && '奇遇事件'}
          {cell.type === 'teleport' && '傳送門'}
        </span>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
          名稱
        </label>
        <input
          type="text"
          value={cell.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="cyber-input text-sm py-1.5"
          placeholder="輸入格子名稱"
        />
      </div>

      {/* Property-only fields */}
      {isProperty && (
        <>
          {/* Base price */}
          <div>
            <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
              地價
            </label>
            <input
              type="number"
              value={cell.basePrice}
              onChange={(e) => onUpdate({ basePrice: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              className="cyber-input text-sm py-1.5"
              min={0}
              step={100}
            />
          </div>

          {/* Rent */}
          <div>
            <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
              租金
            </label>
            <input
              type="number"
              value={cell.rent ?? Math.round(cell.basePrice * 0.25)}
              onChange={(e) => onUpdate({ rent: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              className="cyber-input text-sm py-1.5"
              min={0}
              step={50}
            />
          </div>

          {/* Set ID */}
          <div>
            <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
              套裝 ID
            </label>
            <input
              type="text"
              value={cell.setId || ''}
              onChange={(e) => onUpdate({ setId: e.target.value || undefined })}
              className="cyber-input text-sm py-1.5"
              placeholder="如 set1"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
              顏色
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cell.color || '#00e5ff'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-10 h-9 cursor-pointer rounded-sm border border-[rgba(0_255_255_0.3)] bg-transparent"
              />
              <input
                type="text"
                value={cell.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="cyber-input text-sm py-1.5 flex-1 font-mono"
              />
            </div>
          </div>

          {/* Preset set colors */}
          <div>
            <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
              預設套裝顏色
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {SETS.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onUpdate({ color: set.color, setId: set.id })}
                  className="aspect-square rounded-sm transition-transform hover:scale-110"
                  style={{
                    backgroundColor: set.color,
                    boxShadow: `0 0 6px ${set.color}80`,
                    border: cell.setId === set.id ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  }}
                  title={`${set.name} (${set.id})`}
                />
              ))}
            </div>
          </div>

          {/* Apply to all same color */}
          {cell.setId && onApplyToSameColor && (
            <button
              type="button"
              onClick={onApplyToSameColor}
              className="cyber-btn w-full py-1.5 text-xs font-cyber tracking-wider flex items-center justify-center gap-1.5"
              style={{
                borderColor: 'var(--pink)',
                color: 'var(--pink)',
                backgroundColor: 'rgba(255, 77, 212, 0.08)',
              }}
            >
              <Layers size={12} />
              應用到所有同色地產
            </button>
          )}
        </>
      )}

      {/* Non-property color picker (for visual customization) */}
      {!isProperty && (
        <div>
          <label className="block text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
            顏色
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cell.color || '#00ff88'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-10 h-9 cursor-pointer rounded-sm border border-[rgba(0_255_255_0.3)] bg-transparent"
            />
            <input
              type="text"
              value={cell.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="cyber-input text-sm py-1.5 flex-1 font-mono"
            />
          </div>
        </div>
      )}

      {/* Cell info summary */}
      <div className="mt-auto pt-3 border-t border-[rgba(0_255_255_0.1)]">
        <div className="text-[10px] text-[var(--text-muted)] font-cyber space-y-0.5">
          <p>ID：{cell.id}</p>
          <p>位置：{cell.id >= 0 && cell.id <= 9 ? '底邊' : cell.id >= 10 && cell.id <= 18 ? '右邊' : cell.id >= 19 && cell.id <= 27 ? '頂邊' : '左邊'}</p>
          <p>類型：{cell.type}</p>
          {isProperty && cell.setId && <p>套裝：{cell.setId}</p>}
          {allCells && isProperty && cell.setId && (
            <p>
              同色地塊：
              {allCells.filter((c: CellConfig) => c.setId === cell.setId).length} 塊
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
