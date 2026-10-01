import type { FC } from 'react';
import type { CellConfig, CellType } from '@shared/api.interface';
import { Flag, Lock, HelpCircle, Zap, Gamepad2, Dices, Car, ShieldAlert, Sparkles, ArrowRightLeft } from 'lucide-react';

interface EditorBoardProps {
  cells: CellConfig[];
  selectedId: number | null;
  onCellClick: (id: number) => void;
  onCellContextMenu?: (id: number) => void;
}

function getCellPosition(id: number): { row: number; col: number } {
  if (id >= 0 && id <= 9) return { row: 9, col: id };
  if (id >= 10 && id <= 18) return { row: 18 - id, col: 9 };
  if (id >= 19 && id <= 27) return { row: 0, col: 27 - id };
  return { row: id - 27, col: 0 };
}

const cellTypeIcons: Record<CellType, FC<{ size?: number }>> = {
  start: Flag,
  property: () => null,
  detention: Lock,
  fate: HelpCircle,
  chance: Zap,
  minigame: Gamepad2,
  parking: Car,
  jail: ShieldAlert,
  event: Sparkles,
  teleport: ArrowRightLeft,
};

const cellTypeColors: Record<CellType, { bg: string; border: string; text: string }> = {
  start: { bg: 'hsla(140, 100%, 55%, 0.2)', border: 'hsla(140, 100%, 55%, 0.6)', text: 'hsl(140, 100%, 65%)' },
  property: { bg: 'hsl(240, 18%, 12%)', border: 'hsla(180, 100%, 55%, 0.3)', text: 'hsl(180, 15%, 92%)' },
  detention: { bg: 'hsla(270, 80%, 65%, 0.2)', border: 'hsla(270, 80%, 65%, 0.6)', text: 'hsl(270, 80%, 75%)' },
  fate: { bg: 'hsla(320, 100%, 60%, 0.15)', border: 'hsla(320, 100%, 60%, 0.5)', text: 'hsl(320, 100%, 70%)' },
  chance: { bg: 'hsla(250, 90%, 60%, 0.15)', border: 'hsla(250, 90%, 60%, 0.5)', text: 'hsl(250, 90%, 70%)' },
  minigame: { bg: 'hsla(280, 100%, 65%, 0.18)', border: 'hsla(280, 100%, 65%, 0.6)', text: 'hsl(280, 100%, 75%)' },
  parking: { bg: 'hsla(200, 70%, 55%, 0.18)', border: 'hsla(200, 70%, 55%, 0.5)', text: 'hsl(200, 70%, 70%)' },
  jail: { bg: 'hsla(15, 80%, 50%, 0.2)', border: 'hsla(15, 80%, 50%, 0.6)', text: 'hsl(15, 80%, 65%)' },
  event: { bg: 'hsla(50, 100%, 55%, 0.15)', border: 'hsla(50, 100%, 55%, 0.5)', text: 'hsl(50, 100%, 70%)' },
  teleport: { bg: 'hsla(160, 100%, 55%, 0.18)', border: 'hsla(160, 100%, 55%, 0.6)', text: 'hsl(160, 100%, 70%)' },
};

const EditorBoard: FC<EditorBoardProps> = ({ cells, selectedId, onCellClick, onCellContextMenu }) => {
  const renderCell = (cell: CellConfig) => {
    const { row, col } = getCellPosition(cell.id);
    const colors = cellTypeColors[cell.type];
    const Icon = cellTypeIcons[cell.type];
    const isSelected = selectedId === cell.id;

    return (
      <div
        key={cell.id}
        onClick={() => onCellClick(cell.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          onCellContextMenu?.(cell.id);
        }}
        className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-125 select-none"
        style={{
          gridRow: row + 1,
          gridColumn: col + 1,
          background: colors.bg,
          border: isSelected ? '2px solid var(--cyan)' : `1px solid ${colors.border}`,
          boxShadow: isSelected
            ? '0 0 12px var(--cyan), 0 0 24px var(--cyan), inset 0 0 8px var(--cyan)'
            : cell.type === 'property'
              ? `inset 0 0 4px ${cell.color}30`
              : undefined,
        }}
      >
        {/* Property color bar */}
        {cell.type === 'property' && (
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              backgroundColor: cell.color,
              boxShadow: `0 0 4px ${cell.color}`,
            }}
          />
        )}

        {/* Cell ID badge */}
        <div
          className="absolute top-0.5 left-1 text-[8px] font-cyber opacity-60"
          style={{ color: colors.text }}
        >
          {cell.id}
        </div>

        {/* Icon for non-property */}
        {cell.type !== 'property' && Icon && (
          <div style={{ color: colors.text }} className="mb-0.5">
            <Icon size={14} />
          </div>
        )}

        {/* Cell name */}
        <div
          className="text-[9px] md:text-[10px] font-cyber tracking-tight text-center leading-tight px-0.5 max-w-full truncate"
          style={{ color: colors.text }}
          title={cell.name}
        >
          {cell.name || '—'}
        </div>

        {/* Price for property */}
        {cell.type === 'property' && cell.basePrice > 0 && (
          <div
            className="text-[8px] md:text-[9px] font-cyber mt-0.5 opacity-80"
            style={{ color: cell.color }}
          >
            ¥{cell.basePrice}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative w-full aspect-square max-w-[min(70vh,520px)] mx-auto p-3 md:p-4"
      style={{
        background: 'linear-gradient(135deg, var(--board-frame-from), var(--board-frame-to))',
        border: '1px solid var(--board-frame-border)',
        boxShadow: '0 0 30px var(--board-frame-glow), inset 0 0 20px var(--board-frame-inner-shadow)',
      }}
    >
      <div
        className="w-full h-full grid gap-0.5"
        style={{
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(10, 1fr)',
        }}
      >
        {cells.map((cell: CellConfig) => renderCell(cell))}

        {/* Center area */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            gridRow: '2 / span 8',
            gridColumn: '2 / span 8',
            background: 'linear-gradient(135deg, var(--board-center-from), var(--board-center-to))',
            border: '1px solid var(--board-center-border)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          }}
        >
          <Dices className="mb-2 text-neon-cyan" size={32} />
          <div className="font-cyber text-lg md:text-xl text-neon-cyan tracking-widest">
            地圖編輯器
          </div>
          <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1">
            36 格 · 自訂你的賽博世界
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorBoard;
