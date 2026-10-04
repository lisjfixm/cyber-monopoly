import React from 'react';
import { X, Scale, Trophy, ListChecks } from 'lucide-react';
import type { GameMode } from '@shared/api.interface';
import { V3_MODES, isV3Mode } from './modeMeta';

interface ModeRulesModalProps {
  open: boolean;
  onClose: () => void;
  mode: GameMode;
}

// 既有的非 v3 模式規則速查（僅補充說明，不取代既有流程）
const LEGACY_RULES: Partial<Record<string, { win: string; score: string }>> = {
  classic: { win: '經典規則：透過購地、收租讓對手全數破產，最後一位倖存者獲勝。', score: '無回合上限，以破產淘汰制決勝負。' },
  fast: { win: '快速規則：地價更低、過路費更高，更快分出勝負。', score: '破產淘汰制。' },
  crazy: { win: '瘋狂規則：命運／機會卡金錢效果加倍，高風險高報酬。', score: '破產淘汰制。' },
};

const ModeRulesModal: React.FC<ModeRulesModalProps> = ({ open, onClose, mode }) => {
  if (!open) return null;
  const v3 = isV3Mode(mode) ? V3_MODES[mode] : null;
  const legacy = LEGACY_RULES[mode];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="模式規則說明"
    >
      <div
        className="cyber-card w-full max-w-md max-h-[80vh] overflow-y-auto p-5 md:p-6"
        style={{ borderColor: v3 ? v3.color : 'var(--border-neon-cyan)' }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-cyber text-lg md:text-xl tracking-wider"
            style={{ color: v3 ? v3.color : 'var(--cyan)' }}
          >
            <Scale size={18} className="inline mr-2 -mt-1" />
            {v3 ? v3.label : '模式規則'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cyber-btn w-10 h-10 flex items-center justify-center p-0"
            aria-label="關閉規則說明"
          >
            <X size={18} />
          </button>
        </div>

        {v3 ? (
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <div
                className="flex items-center gap-1.5 font-cyber text-xs tracking-wider mb-1"
                style={{ color: v3.color }}
              >
                <Trophy size={13} /> 取勝條件
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">{v3.winCondition}</p>
            </div>
            <div>
              <div
                className="flex items-center gap-1.5 font-cyber text-xs tracking-wider mb-1"
                style={{ color: v3.color }}
              >
                <ListChecks size={13} /> 計分方式
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">{v3.scoring}</p>
            </div>
            <div>
              <div
                className="flex items-center gap-1.5 font-cyber text-xs tracking-wider mb-1"
                style={{ color: v3.color }}
              >
                <ListChecks size={13} /> 備註
              </div>
              <ul className="list-disc pl-5 text-[var(--text-secondary)] space-y-1 leading-relaxed">
                {v3.notes.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : legacy ? (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-[var(--text-secondary)] leading-relaxed">{legacy.win}</p>
            <p className="text-[var(--text-secondary)] leading-relaxed">{legacy.score}</p>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            此模式沿用經典大富翁規則：購地產、收過路費，讓其他玩家全數破產即獲勝。
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="cyber-btn w-full py-2 mt-5 text-sm font-cyber tracking-wide"
          style={{ borderColor: v3 ? v3.color : 'var(--cyan)', color: v3 ? v3.color : 'var(--cyan)' }}
        >
          知道了
        </button>
      </div>
    </div>
  );
};

export default ModeRulesModal;
