import type { FC } from 'react';
import { DISASTERS } from '@shared/game-config';
import type { DisasterState } from '@shared/api.interface';
import { AlertTriangle, X, Waves, Flame, Mountain } from 'lucide-react';

interface DisasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  disaster?: DisasterState;
  cellNames?: Record<number, string>;
}

const DisasterModal: FC<DisasterModalProps> = ({
  isOpen,
  onClose,
  disaster,
  cellNames = {},
}) => {
  if (!isOpen || !disaster) return null;

  const config = DISASTERS[disaster.type];
  if (!config) return null;

  const affectedNames = disaster.affectedCells
    .map((id: number) => cellNames[id] ?? `第${id}格`)
    .filter(Boolean);

  const DisasterIcon =
    disaster.type === 'earthquake'
      ? Mountain
      : disaster.type === 'fire'
      ? Flame
      : Waves;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(20, 0, 0, 0.85)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-md rounded-xl overflow-hidden disaster-modal-shake max-h-[85vh] flex flex-col"
        style={{
          border: '2px solid var(--red)',
          boxShadow:
            '0 0 40px rgba(255, 0, 0, 0.5), inset 0 0 30px rgba(255, 0, 0, 0.1)',
          background:
            'linear-gradient(180deg, hsl(0, 40%, 8%) 0%, hsl(0, 50%, 12%) 50%, hsl(0, 40%, 8%) 100%)',
        }}
      >
        {/* Red alert stripes */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--red) 0px, var(--red) 12px, transparent 12px, transparent 24px)',
            animation: 'stripe-move 1s linear infinite',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-5 py-4 border-b relative" style={{ borderColor: 'rgba(255, 0, 0, 0.4)' }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className="w-5 h-5 alert-blink"
              style={{ color: 'var(--red)' }}
            />
            <span
              className="text-[10px] font-cyber tracking-[0.2em] alert-blink"
              style={{ color: 'var(--red)', textShadow: '0 0 8px var(--red)' }}
            >
              注意 緊急新聞 / BREAKING NEWS
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <DisasterIcon
              className="w-10 h-10 md:w-12 md:h-12"
              style={{
                color: config.color,
                filter: `drop-shadow(0 0 10px ${config.color})`,
              }}
            />
            <h2
              className="text-2xl md:text-3xl font-cyber tracking-wider"
              style={{
                color: config.color,
                textShadow: `0 0 10px ${config.color}, 0 0 20px ${config.color}80`,
              }}
            >
              {config.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4 relative">
          {/* Description */}
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(255, 0, 0, 0.08)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
            }}
          >
            <p
              className="text-sm font-cyber tracking-wide"
              style={{ color: config.color }}
            >
              {config.description}
            </p>
          </div>

          {/* Affected cells */}
          <div>
            <div
              className="text-[10px] md:text-xs font-cyber tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              受影響地區
            </div>
            <div className="flex flex-wrap gap-2">
              {affectedNames.length > 0 ? (
                affectedNames.map((name: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-xs font-cyber tracking-wide"
                    style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 0, 0, 0.4)',
                      color: 'var(--red)',
                      textShadow: '0 0 4px var(--red)',
                    }}
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  未知區域
                </span>
              )}
            </div>
          </div>

          {/* Duration info for flood */}
          {disaster.type === 'flood' && disaster.duration > 0 && (
            <div
              className="p-3 rounded-lg flex items-center justify-between"
              style={{
                backgroundColor: 'rgba(0, 100, 255, 0.1)',
                border: '1px solid rgba(0, 100, 255, 0.3)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--blue)' }}>
                海嘯 洪水持續
              </span>
              <span
                className="font-cyber text-base tracking-wider"
                style={{
                  color: 'var(--blue)',
                  textShadow: '0 0 6px var(--blue)',
                }}
              >
                剩餘 {disaster.duration} 回合
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-5 py-4 border-t relative"
          style={{ borderColor: 'rgba(255, 0, 0, 0.4)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded font-cyber text-sm tracking-wider transition-all hover:brightness-110"
            style={{
              backgroundColor: 'rgba(255, 0, 0, 0.15)',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
              textShadow: '0 0 6px var(--red)',
            }}
          >
            確定
          </button>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: 'var(--red)' }} />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: 'var(--red)' }} />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: 'var(--red)' }} />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: 'var(--red)' }} />
      </div>
    </div>
  );
};

export default DisasterModal;
