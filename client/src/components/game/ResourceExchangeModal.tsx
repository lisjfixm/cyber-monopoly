import type { FC } from 'react';
import { X, Database, ArrowRightCircle } from 'lucide-react';
import { RESOURCE_EXCHANGE_CONFIG } from '@shared/game-engine';
import type { ResourceExchangeType } from '@shared/game-engine';

interface ResourceExchangeModalProps {
  open: boolean;
  onClose: () => void;
  currentResources: number;
  onExchange: (type: ResourceExchangeType) => void;
}

const ResourceExchangeModal: FC<ResourceExchangeModalProps> = ({
  open,
  onClose,
  currentResources,
  onExchange,
}) => {
  if (!open) return null;

  const exchangeItems: { key: ResourceExchangeType; cost: number; label: string }[] = (
    Object.entries(RESOURCE_EXCHANGE_CONFIG) as [ResourceExchangeType, { cost: number; label: string }][]
  ).map(([key, value]) => ({ key, cost: value.cost, label: value.label }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card p-5 md:p-6 max-w-md w-full relative"
        style={{
          borderColor: 'var(--purple)',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 15px rgba(168, 85, 247, 0.1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--pink)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Database
            className="w-6 h-6"
            style={{ color: 'var(--green)', filter: 'drop-shadow(0 0 6px var(--green))' }}
          />
          <div>
            <h3
              className="font-cyber text-lg tracking-wider"
              style={{ color: 'var(--green)', textShadow: '0 0 8px rgba(0, 255, 128, 0.5)' }}
            >
              資源兌換
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              消耗數據資源，獲得強力增益
            </p>
          </div>
        </div>

        {/* Current resources */}
        <div
          className="flex items-center justify-between p-3 rounded-lg mb-4"
          style={{
            backgroundColor: 'rgba(0, 255, 128, 0.08)',
            border: '1px solid rgba(0, 255, 128, 0.3)',
          }}
        >
          <span className="text-sm text-[var(--text-secondary)]">當前數據資源</span>
          <span
            className="font-cyber text-xl tracking-wider"
            style={{ color: 'var(--green)', textShadow: '0 0 8px rgba(0, 255, 128, 0.6)' }}
          >
            {currentResources}
          </span>
        </div>

        {/* Exchange options */}
        <div className="flex flex-col gap-2">
          {exchangeItems.map((item) => {
            const canAfford = currentResources >= item.cost;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => canAfford && onExchange(item.key)}
                disabled={!canAfford}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-left"
                style={{
                  backgroundColor: canAfford ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${canAfford ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.5,
                }}
              >
                <div className="flex items-center gap-3">
                  <ArrowRightCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: canAfford ? 'var(--purple)' : 'var(--text-secondary)' }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: canAfford ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 font-cyber text-sm"
                  style={{ color: canAfford ? 'var(--green)' : 'var(--text-secondary)' }}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{item.cost}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: 'var(--purple)' }} />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: 'var(--purple)' }} />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: 'var(--purple)' }} />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: 'var(--purple)' }} />
      </div>
    </div>
  );
};

export default ResourceExchangeModal;
