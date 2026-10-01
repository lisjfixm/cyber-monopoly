import { X, Trash2, Save, Play, Clock, User, Coins } from 'lucide-react';
import type { FC } from 'react';
import type { SaveSlotInfo } from '@client/src/hooks/useSaveSlots';
import { getModeLabel } from '@client/src/hooks/useSaveSlots';

interface SaveSlotPanelProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  slots: (SaveSlotInfo | null)[];
  onClose: () => void;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
  onDelete?: (slot: number) => void;
}

const SaveSlotPanel: FC<SaveSlotPanelProps> = ({
  isOpen,
  mode,
  slots,
  onClose,
  onSave,
  onLoad,
  onDelete,
}) => {
  if (!isOpen) return null;

  const formatTime = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handleSlotClick = (slot: number, hasData: boolean) => {
    if (mode === 'save') {
      onSave(slot);
    } else if (hasData) {
      onLoad(slot);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className="cyber-card border-neon-cyan p-5 md:p-6 max-w-lg w-full relative max-h-[85vh] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-text-secondary hover:text-neon-cyan transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-neon-cyan font-cyber text-xl md:text-2xl mb-5 tracking-wider pulse-glow">
          {mode === 'save' ? '保存遊戲' : '讀取存檔'}
        </h2>

        <div className="flex flex-col gap-3">
          {slots.map((slotData, idx) => {
            const isEmpty = slotData === null;
            const isAuto = slotData?.isAutoSave;

            return (
              <div
                key={idx}
                className={`
                  relative cyber-card p-4 cursor-pointer transition-all
                  ${mode === 'load' && isEmpty ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
                `}
                style={{
                  borderColor: isAuto
                    ? 'hsl(45, 100%, 60%)'
                    : isEmpty
                      ? 'rgba(255,255,255,0.1)'
                      : 'var(--border-neon-cyan)',
                  boxShadow: isAuto
                    ? '0 0 12px rgba(250, 204, 21, 0.2)'
                    : isEmpty
                      ? 'none'
                      : '0 0 10px rgba(0, 255, 255, 0.15)',
                }}
                onClick={() => handleSlotClick(idx, !isEmpty)}
              >
                {isEmpty ? (
                  <div className="flex items-center justify-center py-4 text-text-muted font-cyber tracking-wider">
                    槽位 {idx + 1} — 空
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="font-cyber text-sm tracking-wider"
                          style={{ color: isAuto ? 'hsl(45, 100%, 60%)' : 'var(--cyan)' }}
                        >
                          槽位 {idx + 1}
                          {isAuto && <span className="ml-2 text-xs">自動存檔</span>}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(slotData.savedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary">
                          <Play className="w-3 h-3" />
                          <span>{getModeLabel(slotData.gameMode)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--red)]">
                          <User className="w-3 h-3" />
                          <span className="truncate">{slotData.player1Name}</span>
                          <Coins className="w-3 h-3 ml-1" />
                          <span>{slotData.player1Money}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--blue)]">
                          <User className="w-3 h-3" />
                          <span className="truncate">{slotData.player2Name}</span>
                          <Coins className="w-3 h-3 ml-1" />
                          <span>{slotData.player2Money}</span>
                        </div>
                      </div>
                      <div className="text-text-muted text-xs mt-1">
                        第 {slotData.turnCount} 回合
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        type="button"
                        className="cyber-btn w-10 h-10 flex items-center justify-center p-0"
                        style={{
                          borderColor: mode === 'save' ? 'var(--green)' : 'var(--cyan)',
                          color: mode === 'save' ? 'var(--green)' : 'var(--cyan)',
                          background:
                            mode === 'save'
                              ? 'rgba(0, 255, 128, 0.08)'
                              : 'rgba(0, 255, 255, 0.08)',
                        }}
                        aria-label={mode === 'save' ? '保存到此槽位' : '读取此存档'}
                      >
                        {mode === 'save' ? (
                          <Save className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(idx);
                          }}
                          className="cyber-btn w-10 h-10 flex items-center justify-center p-0"
                          style={{
                            borderColor: 'var(--pink)',
                            color: 'var(--pink)',
                            background: 'rgba(255, 107, 157, 0.08)',
                          }}
                          aria-label="删除存档"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 text-text-muted text-xs font-cyber tracking-wider text-center">
          共 {slots.filter((s) => s !== null).length} / {slots.length} 个存档
        </div>
      </div>
    </div>
  );
};

export default SaveSlotPanel;
