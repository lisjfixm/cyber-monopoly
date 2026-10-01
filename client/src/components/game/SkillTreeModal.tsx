import type { FC } from 'react';
import { X, Landmark, Coins, Sparkles, ShieldAlert, Hammer, Banknote } from 'lucide-react';
import { SKILLS, SKILL_POINT_INTERVAL, SKILL_IDS } from '@shared/game-config';
import type { SkillId, SkillConfig } from '@shared/api.interface';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillTree: Record<string, number>;
  skillPoints: number;
  playerIndex: number;
  canUpgrade: boolean;
  onUpgrade: (skillId: string) => void;
}

const ICON_MAP: Record<string, FC<{ className?: string; style?: React.CSSProperties }>> = {
  Landmark,
  Coins,
  Sparkles,
  ShieldAlert,
  Hammer,
  Banknote,
};

const SKILL_COLORS: Record<SkillId, string> = {
  buy_discount: '#4ade80',
  toll_bonus: '#facc15',
  lucky_draw: '#ff6b9d',
  jail_master: '#a855f7',
  build_master: '#00e5ff',
  wealth_sense: '#22d3ee',
};

const SkillTreeModal: FC<SkillTreeModalProps> = ({
  isOpen,
  onClose,
  skillTree,
  skillPoints,
  canUpgrade,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  const skillList = SKILL_IDS.map((id: SkillId) => SKILLS[id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(10, 10, 25, 0.85)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-2xl cyber-card rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          border: '1px solid var(--cyan)',
          boxShadow:
            '0 0 40px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.05)',
          animation: 'float-up 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-neon-cyan)' }}
        >
          <div>
            <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
              技能樹 / SKILL TREE
            </div>
            <h2
              className="text-2xl md:text-3xl font-cyber tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow:
                  '0 0 10px var(--cyan), 0 0 20px var(--cyan), 0 0 40px var(--cyan)',
              }}
            >
              技能樹
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
              剩餘技能點
            </div>
            <div
              className="text-2xl md:text-3xl font-cyber tracking-wider"
              style={{
                color: '#facc15',
                textShadow: '0 0 10px #facc15, 0 0 20px #facc15',
              }}
            >
              {skillPoints}
            </div>
          </div>
        </div>

        {/* Skill grid */}
        <div className="px-5 py-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {skillList.map((skill: SkillConfig) => {
              const level = skillTree[skill.id] ?? 0;
              const isMaxLevel = level >= skill.maxLevel;
              const canUpgradeSkill =
                canUpgrade && skillPoints > 0 && !isMaxLevel;
              const color = SKILL_COLORS[skill.id];
              const IconComponent = ICON_MAP[skill.icon] ?? Sparkles;

              const currentEffect =
                level > 0
                  ? skill.effects.find((e) => e.level === level)
                  : null;
              const nextEffect = skill.effects.find(
                (e) => e.level === level + 1,
              );

              return (
                <div
                  key={skill.id}
                  className="relative p-4 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-mid)',
                    border: `1px solid ${color}40`,
                    boxShadow: level > 0 ? `0 0 15px ${color}30` : 'none',
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${color}20`,
                        border: `1px solid ${color}60`,
                      }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-cyber text-base tracking-wide mb-1"
                        style={{ color }}
                      >
                        {skill.name}
                      </div>
                      {/* Level dots */}
                      <div className="flex items-center gap-1.5">
                        {Array.from(
                          { length: skill.maxLevel },
                          (_, i) => {
                            const dotLevel = i + 1;
                            const isUnlocked = dotLevel <= level;
                            const isCurrent = dotLevel === level;
                            return (
                              <div
                                key={i}
                                className="w-2.5 h-2.5 rounded-full transition-all"
                                style={{
                                  backgroundColor: isUnlocked
                                    ? color
                                    : 'transparent',
                                  border: `2px solid ${color}`,
                                  boxShadow: isCurrent
                                    ? `0 0 8px ${color}, 0 0 12px ${color}`
                                    : 'none',
                                }}
                              />
                            );
                          },
                        )}
                        <span
                          className="ml-2 text-xs font-cyber"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Lv.{level}/{skill.maxLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Current effect */}
                  <div
                    className="text-xs mb-2 px-2 py-1.5 rounded"
                    style={{
                      backgroundColor: `${color}10`,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span
                      className="font-cyber text-[10px] mr-1"
                      style={{ color }}
                    >
                      當前：
                    </span>
                    {currentEffect
                      ? currentEffect.description
                      : '尚未解鎖'}
                  </div>

                  {/* Next effect */}
                  {!isMaxLevel && nextEffect && (
                    <div
                      className="text-xs mb-3 px-2 py-1.5 rounded"
                      style={{
                        backgroundColor: 'rgba(0,255,128,0.05)',
                        color: 'var(--text-secondary)',
                        border: '1px dashed rgba(0,255,128,0.2)',
                      }}
                    >
                      <span
                        className="font-cyber text-[10px] mr-1"
                        style={{ color: 'var(--green)' }}
                      >
                        下級：
                      </span>
                      {nextEffect.description}
                    </div>
                  )}

                  {isMaxLevel && (
                    <div
                      className="text-xs mb-3 px-2 py-1.5 rounded text-center font-cyber tracking-wide"
                      style={{
                        backgroundColor: `${color}15`,
                        color,
                      }}
                    >
                      ⭐ 已達最高等級
                    </div>
                  )}

                  {/* Upgrade button */}
                  <button
                    className="w-full py-2 rounded font-cyber text-sm tracking-wide transition-all"
                    style={{
                      backgroundColor: canUpgradeSkill
                        ? 'rgba(0, 255, 128, 0.15)'
                        : 'transparent',
                      border: `1px solid ${
                        canUpgradeSkill ? 'var(--green)' : '#ffffff20'
                      }`,
                      color: canUpgradeSkill
                        ? 'var(--green)'
                        : 'var(--text-secondary)',
                      boxShadow: canUpgradeSkill
                        ? '0 0 10px rgba(0,255,128,0.3), inset 0 0 10px rgba(0,255,128,0.1)'
                        : 'none',
                      cursor: canUpgradeSkill ? 'pointer' : 'not-allowed',
                    }}
                    onClick={() => canUpgradeSkill && onUpgrade(skill.id)}
                    disabled={!canUpgradeSkill}
                  >
                    {isMaxLevel
                      ? '已滿級'
                      : canUpgrade
                        ? skillPoints > 0
                          ? '⬆ 升級'
                          : '技能點不足'
                        : '無法操作'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t text-center text-xs"
          style={{
            borderColor: 'var(--border-neon-cyan)',
            color: 'var(--text-secondary)',
          }}
        >
          提示 每 {SKILL_POINT_INTERVAL} 回合獲得 1 技能點
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--pink)]" />
      </div>
    </div>
  );
};

export default SkillTreeModal;
