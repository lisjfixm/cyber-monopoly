import type { CSSProperties, ReactNode } from 'react';
import type { TitleEffectType } from '@shared/api.interface';

interface TitleEffectProps {
  effect: TitleEffectType;
  color: string;
  children: ReactNode;
}

const TitleEffect = ({ effect, color, children }: TitleEffectProps) => {
  const style: CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    color,
  };

  if (effect === 'neon') {
    style.textShadow = `0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color}`;
    style.animation = 'titleNeonPulse 2s ease-in-out infinite';
  } else if (effect === 'gold') {
    style.background = `linear-gradient(90deg, ${color} 0%, #fff8dc 25%, ${color} 50%, #fff8dc 75%, ${color} 100%)`;
    style.backgroundSize = '200% 100%';
    style.WebkitBackgroundClip = 'text';
    style.backgroundClip = 'text';
    style.WebkitTextFillColor = 'transparent';
    style.animation = 'titleGoldSweep 3s linear infinite';
  } else if (effect === 'rainbow') {
    style.background = 'linear-gradient(90deg, #ff0000, #ff8800, #ffee00, #00ff00, #0088ff, #8800ff, #ff0088, #ff0000)';
    style.backgroundSize = '400% 100%';
    style.WebkitBackgroundClip = 'text';
    style.backgroundClip = 'text';
    style.WebkitTextFillColor = 'transparent';
    style.animation = 'titleRainbow 4s linear infinite';
  } else if (effect === 'purple') {
    style.textShadow = `0 0 5px ${color}, 0 0 15px ${color}`;
    style.animation = 'titlePurpleArc 1.5s ease-in-out infinite';
  } else if (effect === 'flame') {
    style.textShadow = `0 0 5px ${color}, 0 -2px 10px #ff6600, 0 -5px 20px #ff3300, 0 -8px 30px #ff0000`;
    style.animation = 'titleFlame 0.8s ease-in-out infinite alternate';
  } else if (effect === 'ice') {
    style.textShadow = `0 0 5px ${color}, 0 0 15px #ffffff, 0 0 25px ${color}`;
    style.animation = 'titleIce 2s ease-in-out infinite';
  } else if (effect === 'glitch') {
    style.animation = 'titleGlitch 0.3s infinite';
    style.textShadow = `2px 0 #ff00ff, -2px 0 #00ffff`;
  } else if (effect === 'pulse') {
    style.textShadow = `0 0 5px ${color}, 0 0 10px ${color}`;
    style.animation = 'titlePulse 2s ease-in-out infinite';
  }

  return <span style={style}>{children}</span>;
};

// CSS keyframes injected via style tag
const keyframesCSS = `
@keyframes titleNeonPulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}
@keyframes titleGoldSweep {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes titleRainbow {
  0% { background-position: 0% 50%; }
  100% { background-position: 400% 50%; }
}
@keyframes titlePurpleArc {
  0%, 100% {
    text-shadow: 0 0 5px currentColor, 0 0 15px currentColor, -3px 0 10px currentColor, 3px 0 10px currentColor;
  }
  50% {
    text-shadow: 0 0 10px currentColor, 0 0 25px currentColor, -5px 0 15px currentColor, 5px 0 15px currentColor;
  }
}
@keyframes titleFlame {
  0% {
    text-shadow: 0 0 5px #ff6600, 0 -2px 10px #ff3300, 0 -5px 20px #ff0000, 0 -8px 30px #cc0000;
    transform: translateY(0);
  }
  100% {
    text-shadow: 0 0 8px #ffaa00, 0 -3px 15px #ff6600, 0 -7px 25px #ff3300, 0 -10px 35px #ff0000;
    transform: translateY(-1px);
  }
}
@keyframes titleIce {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 3px currentColor); }
  50% { filter: brightness(1.2) drop-shadow(0 0 8px currentColor); }
}
@keyframes titleGlitch {
  0% { transform: translate(0); }
  20% { transform: translate(-1px, 1px); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
  100% { transform: translate(0); }
}
@keyframes titlePulse {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.2); }
}
`;

// Inject keyframes once
if (typeof document !== 'undefined') {
  const existing = document.getElementById('title-effect-keyframes');
  if (!existing) {
    const style = document.createElement('style');
    style.id = 'title-effect-keyframes';
    style.textContent = keyframesCSS;
    document.head.appendChild(style);
  }
}

export default TitleEffect;
