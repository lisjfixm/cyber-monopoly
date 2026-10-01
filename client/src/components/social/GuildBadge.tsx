import type { FC } from 'react';
import { Crown, Shield, Zap, Flame, Skull, Cpu } from 'lucide-react';
import type { BadgeIcon } from '@client/src/utils/social.types';

interface GuildBadgeProps {
  icon: BadgeIcon;
  color: string;
  size?: number;
  className?: string;
}

const ICON_MAP: Record<BadgeIcon, typeof Crown> = {
  crown: Crown,
  shield: Shield,
  bolt: Zap,
  flame: Flame,
  skull: Skull,
  chip: Cpu,
};

export const GuildBadge: FC<GuildBadgeProps> = ({ icon, color, size = 40, className }) => {
  const Icon = ICON_MAP[icon] ?? Shield;
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}15`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 12px ${color}80, inset 0 0 8px ${color}40`,
      }}
    >
      <Icon size={size * 0.55} style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
    </div>
  );
};

export const BADGE_ICONS: Array<{ id: BadgeIcon; name: string }> = [
  { id: 'crown', name: '王冠' },
  { id: 'shield', name: '盾牌' },
  { id: 'bolt', name: '閃電' },
  { id: 'flame', name: '火焰' },
  { id: 'skull', name: '骷髏' },
  { id: 'chip', name: '晶片' },
];

export default GuildBadge;
