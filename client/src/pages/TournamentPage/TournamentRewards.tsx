import { useMemo } from 'react';
import type { TournamentReward } from '@shared/api.interface';
import { Trophy, Medal, Star, Gem, Crown, Award } from 'lucide-react';

interface TournamentRewardsProps {
  format: 8 | 16 | 32;
}

const RARITY_COLORS: Record<NonNullable<TournamentReward['rarity']>, string> = {
  common: 'var(--text-secondary)',
  rare: 'var(--blue)',
  epic: 'var(--purple)',
  legendary: '#facc15',
};

const REWARD_DATA: Record<8 | 16 | 32, TournamentReward[]> = {
  8: [
    { position: '冠軍', currency: 5000, reward: '稀有道具·霓虹晶片', rarity: 'rare' },
    { position: '亞軍', currency: 3000, reward: '參加獎·強化模組', rarity: 'common' },
    { position: '四強', currency: 1500, reward: '參加獎·修復套件', rarity: 'common' },
  ],
  16: [
    { position: '冠軍', currency: 20000, reward: '史詩收藏品·數據核心', rarity: 'epic' },
    { position: '亞軍', currency: 10000, reward: '稀有道具·霓虹晶片', rarity: 'rare' },
    { position: '四強', currency: 5000, reward: '強化模組 x2', rarity: 'rare' },
    { position: '八強', currency: 2000, reward: '參加獎·修復套件', rarity: 'common' },
  ],
  32: [
    { position: '冠軍', currency: 100000, reward: '傳級收藏品·永恆之核 + 傳級稱號「錦標之王」', rarity: 'legendary' },
    { position: '亞軍', currency: 50000, reward: '史詩收藏品·量子引擎', rarity: 'epic' },
    { position: '季軍', currency: 30000, reward: '史詩道具·時空裂隙', rarity: 'epic' },
    { position: '四強', currency: 15000, reward: '稀有套裝·霓虹行者', rarity: 'rare' },
    { position: '八強', currency: 8000, reward: '強化模組 x5', rarity: 'rare' },
    { position: '十六強', currency: 3000, reward: '參加獎·修復套件', rarity: 'common' },
  ],
};

const POSITION_ICONS: Record<string, typeof Trophy> = {
  冠軍: Crown,
  亞軍: Trophy,
  季軍: Medal,
  四強: Star,
  八強: Award,
  十六強: Gem,
};

const TournamentRewards = ({ format }: TournamentRewardsProps) => {
  const rewards = useMemo(() => REWARD_DATA[format] ?? [], [format]);

  return (
    <div
      className="cyber-card p-4 md:p-5"
      style={{
        borderColor: 'rgba(0, 255, 255, 0.3)',
        boxShadow: '0 0 12px rgba(0, 255, 255, 0.15)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={20} style={{ color: 'var(--cyan)' }} />
        <h3 className="font-cyber text-lg text-neon-cyan tracking-wider">
          獎勵預覽
        </h3>
        <span className="text-xs text-[var(--text-secondary)] font-cyber ml-auto">
          {format} 人賽制
        </span>
      </div>

      <div className="space-y-2">
        {rewards.map((r: TournamentReward, idx: number) => {
          const color = r.rarity ? RARITY_COLORS[r.rarity] : 'var(--text-secondary)';
          const Icon = POSITION_ICONS[r.position] ?? Star;
          const isTop = idx === 0;

          return (
            <div
              key={r.position}
              className="flex items-center gap-3 p-3 rounded-sm relative overflow-hidden"
              style={{
                border: `1px solid ${isTop ? color : 'rgba(255, 255, 255, 0.08)'}`,
                background: isTop
                  ? `linear-gradient(90deg, ${color}15, transparent)`
                  : 'rgba(255, 255, 255, 0.02)',
                boxShadow: isTop ? `0 0 12px ${color}33` : 'none',
              }}
            >
              {/* Position icon */}
              <div
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm"
                style={{
                  border: `1px solid ${color}`,
                  color: color,
                  background: `${color}15`,
                  boxShadow: `0 0 8px ${color}44`,
                }}
              >
                <Icon size={18} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-cyber tracking-wider text-sm"
                    style={{ color }}
                  >
                    {r.position}
                  </span>
                  {r.rarity && r.rarity !== 'common' && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-sm font-cyber tracking-wider"
                      style={{
                        border: `1px solid ${color}`,
                        color,
                        background: `${color}15`,
                      }}
                    >
                      {r.rarity === 'legendary'
                        ? '傳級'
                        : r.rarity === 'epic'
                          ? '史詩'
                          : '稀有'}
                    </span>
                  )}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {r.reward}
                </div>
              </div>

              {/* Currency */}
              <div className="flex-shrink-0 text-right">
                <div
                  className="font-cyber font-bold tracking-wider"
                  style={{
                    color: isTop ? color : 'var(--cyan)',
                    textShadow: isTop ? `0 0 6px ${color}` : 'none',
                  }}
                >
                  {r.currency.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider">
                  幣
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TournamentRewards;
