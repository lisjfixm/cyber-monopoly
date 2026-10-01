import React, { type FC } from 'react';

interface CyberStickerProps {
  id: string;
  size?: number;
  className?: string;
}

const COLORS = {
  cyan: '#00ffff',
  pink: '#ff00ff',
  yellow: '#ffd700',
  green: '#00ff80',
  red: '#ff4444',
  purple: '#a855f7',
};

function GlowFilter(): React.ReactElement {
  return (
    <defs>
      <filter id="cyberGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

const NeonSmile: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <circle cx="32" cy="32" r="26" stroke={COLORS.cyan} strokeWidth="3" filter="url(#cyberGlow)" />
    <circle cx="22" cy="26" r="3" fill={COLORS.cyan} filter="url(#cyberGlow)" />
    <circle cx="42" cy="26" r="3" fill={COLORS.cyan} filter="url(#cyberGlow)" />
    <path d="M20 40 Q32 52 44 40" stroke={COLORS.cyan} strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#cyberGlow)" />
    <path d="M32 6 L32 14 M32 50 L32 58" stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const HackerMask: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <rect x="10" y="18" width="44" height="28" rx="4" stroke={COLORS.green} strokeWidth="2.5" filter="url(#cyberGlow)" />
    <rect x="16" y="24" width="12" height="8" fill={COLORS.green} opacity="0.6" filter="url(#cyberGlow)" />
    <rect x="36" y="24" width="12" height="8" fill={COLORS.green} opacity="0.6" filter="url(#cyberGlow)" />
    <path d="M22 44 L42 44" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <path d="M14 18 L14 10 M50 18 L50 10 M20 10 L44 10" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <path d="M28 6 L36 6" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const DataStream: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    {[1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect
          x={8 + i * 10}
          y={6 + ((i * 7) % 40)}
          width="4"
          height="18"
          fill={COLORS.cyan}
          opacity={0.4 + (i % 3) * 0.2}
          filter="url(#cyberGlow)"
        />
      </g>
    ))}
    <rect x="4" y="50" width="56" height="4" rx="2" fill={COLORS.cyan} opacity="0.3" filter="url(#cyberGlow)" />
    <path d="M6 54 L58 54" stroke={COLORS.cyan} strokeWidth="1.5" strokeDasharray="4 3" filter="url(#cyberGlow)" />
    <circle cx="32" cy="32" r="8" stroke={COLORS.pink} strokeWidth="2" filter="url(#cyberGlow)" />
    <path d="M28 32 L36 32 M32 28 L32 36" stroke={COLORS.pink} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const GoldCoin: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <circle cx="32" cy="32" r="22" fill={COLORS.yellow} opacity="0.2" stroke={COLORS.yellow} strokeWidth="3" filter="url(#cyberGlow)" />
    <circle cx="32" cy="32" r="16" stroke={COLORS.yellow} strokeWidth="2" filter="url(#cyberGlow)" />
    <text x="32" y="40" textAnchor="middle" fontSize="18" fontWeight="bold" fill={COLORS.yellow} fontFamily="monospace" filter="url(#cyberGlow)">$</text>
    <path d="M32 12 L32 16 M32 48 L32 52 M12 32 L16 32 M48 32 L52 32" stroke={COLORS.yellow} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const CyberBomb: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <circle cx="30" cy="38" r="20" fill={COLORS.red} opacity="0.2" stroke={COLORS.red} strokeWidth="3" filter="url(#cyberGlow)" />
    <path d="M42 22 Q50 14 54 18" stroke={COLORS.yellow} strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#cyberGlow)" />
    <path d="M54 14 L54 20 M50 16 L58 16" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" filter="url(#cyberGlow)" />
    <rect x="22" y="34" width="16" height="6" rx="1" fill={COLORS.red} opacity="0.6" filter="url(#cyberGlow)" />
    <circle cx="30" cy="38" r="4" fill={COLORS.yellow} filter="url(#cyberGlow)" />
  </svg>
);

const CyberCrown: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M10 40 L10 24 L20 32 L32 14 L44 32 L54 24 L54 40 Z"
      stroke={COLORS.yellow}
      strokeWidth="2.5"
      fill={COLORS.yellow}
      fillOpacity="0.15"
      strokeLinejoin="round"
      filter="url(#cyberGlow)"
    />
    <rect x="8" y="42" width="48" height="6" rx="2" stroke={COLORS.yellow} strokeWidth="2" fill="none" filter="url(#cyberGlow)" />
    <circle cx="32" cy="20" r="3" fill={COLORS.pink} filter="url(#cyberGlow)" />
    <circle cx="18" cy="28" r="2" fill={COLORS.cyan} filter="url(#cyberGlow)" />
    <circle cx="46" cy="28" r="2" fill={COLORS.cyan} filter="url(#cyberGlow)" />
    <path d="M24 52 L40 52" stroke={COLORS.yellow} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" filter="url(#cyberGlow)" />
  </svg>
);

const Robot: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <rect x="14" y="14" width="36" height="30" rx="4" stroke={COLORS.purple} strokeWidth="2.5" filter="url(#cyberGlow)" />
    <rect x="20" y="22" width="10" height="10" rx="2" fill={COLORS.cyan} opacity="0.7" filter="url(#cyberGlow)" />
    <rect x="34" y="22" width="10" height="10" rx="2" fill={COLORS.cyan} opacity="0.7" filter="url(#cyberGlow)" />
    <rect x="24" y="36" width="16" height="4" rx="1" fill={COLORS.purple} filter="url(#cyberGlow)" />
    <path d="M32 6 L32 14" stroke={COLORS.purple} strokeWidth="2.5" strokeLinecap="round" filter="url(#cyberGlow)" />
    <circle cx="32" cy="4" r="2" fill={COLORS.red} filter="url(#cyberGlow)" />
    <path d="M18 48 L18 56 M46 48 L46 56" stroke={COLORS.purple} strokeWidth="3" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const Rocket: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M32 6 Q44 20 44 36 Q44 44 40 48 L24 48 Q20 44 20 36 Q20 20 32 6 Z"
      stroke={COLORS.cyan}
      strokeWidth="2.5"
      fill={COLORS.cyan}
      fillOpacity="0.15"
      filter="url(#cyberGlow)"
    />
    <circle cx="32" cy="24" r="5" stroke={COLORS.pink} strokeWidth="2" fill="none" filter="url(#cyberGlow)" />
    <path d="M20 44 L12 52 Q20 48 24 46 Z" fill={COLORS.red} opacity="0.7" filter="url(#cyberGlow)" />
    <path d="M44 44 L52 52 Q44 48 40 46 Z" fill={COLORS.red} opacity="0.7" filter="url(#cyberGlow)" />
    <path d="M28 50 L28 56 Q32 60 36 56 L36 50" fill={COLORS.yellow} opacity="0.8" filter="url(#cyberGlow)" />
  </svg>
);

const ThumbUp: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M24 48 L14 48 L14 28 L24 28 L24 22 Q24 14 32 14 Q40 16 42 24 L46 28 Q50 32 48 40 Q46 48 40 48 L24 48 Z"
      stroke={COLORS.green}
      strokeWidth="2.5"
      fill={COLORS.green}
      fillOpacity="0.15"
      strokeLinejoin="round"
      filter="url(#cyberGlow)"
    />
    <path d="M32 22 L36 28 L30 34" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#cyberGlow)" />
  </svg>
);

const Heart: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M32 52 Q12 36 12 24 Q12 14 20 14 Q26 14 32 22 Q38 14 44 14 Q52 14 52 24 Q52 36 32 52 Z"
      stroke={COLORS.pink}
      strokeWidth="2.5"
      fill={COLORS.pink}
      fillOpacity="0.2"
      strokeLinejoin="round"
      filter="url(#cyberGlow)"
    />
    <path d="M22 24 L24 26 M40 24 L42 26" stroke={COLORS.pink} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <path d="M32 30 L32 38 M28 34 L36 34" stroke={COLORS.pink} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" filter="url(#cyberGlow)" />
  </svg>
);

const Skull: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M32 8 Q50 8 50 26 L50 36 L44 36 L44 48 L20 48 L20 36 L14 36 L14 26 Q14 8 32 8 Z"
      stroke={COLORS.cyan}
      strokeWidth="2.5"
      fill={COLORS.cyan}
      fillOpacity="0.1"
      strokeLinejoin="round"
      filter="url(#cyberGlow)"
    />
    <ellipse cx="23" cy="26" rx="5" ry="6" fill={COLORS.cyan} opacity="0.8" filter="url(#cyberGlow)" />
    <ellipse cx="41" cy="26" rx="5" ry="6" fill={COLORS.cyan} opacity="0.8" filter="url(#cyberGlow)" />
    <path d="M29 36 L32 42 L35 36" stroke={COLORS.cyan} strokeWidth="2" strokeLinejoin="round" fill="none" filter="url(#cyberGlow)" />
    <path d="M24 42 L24 48 M28 42 L28 48 M32 42 L32 48 M36 42 L36 48 M40 42 L40 48" stroke={COLORS.cyan} strokeWidth="1.5" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const Fire: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M32 56 Q16 48 18 32 Q20 20 28 18 Q26 28 32 30 Q30 12 40 10 Q44 24 44 32 Q48 42 44 50 Q40 58 32 56 Z"
      stroke={COLORS.red}
      strokeWidth="2.5"
      fill={COLORS.red}
      fillOpacity="0.25"
      strokeLinejoin="round"
      filter="url(#cyberGlow)"
    />
    <path
      d="M32 50 Q24 44 26 34 Q28 28 32 30 Q30 20 36 18 Q38 28 38 34 Q40 42 36 46 Q34 50 32 50 Z"
      stroke={COLORS.yellow}
      strokeWidth="1.5"
      fill={COLORS.yellow}
      fillOpacity="0.4"
      filter="url(#cyberGlow)"
    />
  </svg>
);

const Chip: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <rect x="14" y="14" width="36" height="36" rx="4" stroke={COLORS.green} strokeWidth="2.5" filter="url(#cyberGlow)" />
    <rect x="24" y="24" width="16" height="16" rx="2" stroke={COLORS.green} strokeWidth="2" filter="url(#cyberGlow)" />
    <path d="M18 24 L10 24 M18 32 L10 32 M18 40 L10 40" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <path d="M46 24 L54 24 M46 32 L54 32 M46 40 L54 40" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <path d="M24 18 L24 10 M32 18 L32 10 M40 18 L40 10" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <path d="M24 46 L24 54 M32 46 L32 54 M40 46 L40 54" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
    <circle cx="32" cy="32" r="3" fill={COLORS.green} filter="url(#cyberGlow)" />
  </svg>
);

const Lightning: FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GlowFilter />
    <path
      d="M36 6 L18 34 L30 34 L24 58 L46 26 L34 26 L42 6 Z"
      stroke={COLORS.yellow}
      strokeWidth="2.5"
      fill={COLORS.yellow}
      fillOpacity="0.3"
      strokeLinejoin="round"
      filter="url(#cyberGlow)"
    />
    <path d="M30 30 L34 34" stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" filter="url(#cyberGlow)" />
  </svg>
);

const STICKER_MAP: Record<string, React.FC<{ size: number }>> = {
  neon_smile: NeonSmile,
  hacker_mask: HackerMask,
  data_stream: DataStream,
  gold_coin: GoldCoin,
  cyber_bomb: CyberBomb,
  cyber_crown: CyberCrown,
  robot: Robot,
  rocket: Rocket,
  thumb_up: ThumbUp,
  heart: Heart,
  skull: Skull,
  fire: Fire,
  chip: Chip,
  lightning: Lightning,
};

export const STICKER_LIST = [
  { id: 'neon_smile', name: '霓虹笑臉' },
  { id: 'hacker_mask', name: '駭客面具' },
  { id: 'data_stream', name: '數據流' },
  { id: 'gold_coin', name: '金幣' },
  { id: 'cyber_bomb', name: '炸彈' },
  { id: 'cyber_crown', name: '王冠' },
  { id: 'robot', name: '機器人' },
  { id: 'rocket', name: '火箭' },
  { id: 'thumb_up', name: '點讚' },
  { id: 'heart', name: '愛心' },
  { id: 'skull', name: '骷髏' },
  { id: 'fire', name: '火焰' },
  { id: 'chip', name: '晶片' },
  { id: 'lightning', name: '閃電' },
];

export const CyberSticker: FC<CyberStickerProps> = ({ id, size = 48, className }) => {
  const StickerComp = STICKER_MAP[id];
  if (!StickerComp) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }
  return (
    <div className={className} style={{ width: size, height: size }}>
      <StickerComp size={size} />
    </div>
  );
};

export default CyberSticker;
