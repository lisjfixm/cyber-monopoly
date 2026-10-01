import { useState } from 'react';
import type { FC } from 'react';
import { WEATHERS } from '@shared/game-config';
import type { WeatherType } from '@shared/api.interface';

interface WeatherDisplayProps {
  weather: WeatherType;
}

const WEATHER_COLORS: Record<WeatherType, string> = {
  sunny: 'var(--yellow)',
  rain: 'var(--blue)',
  fog: 'var(--text-secondary)',
  em_storm: 'var(--purple)',
  neon_night: 'var(--pink)',
  space_calm: 'var(--cyan)',
};

const WeatherDisplay: FC<WeatherDisplayProps> = ({ weather }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = WEATHERS[weather];
  const color = WEATHER_COLORS[weather] ?? 'var(--cyan)';

  if (!config) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip((v) => !v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 md:gap-3 px-4 py-2 md:px-5 md:py-2.5 rounded-lg transition-all hover:scale-[1.02]"
        style={{
          border: `1px solid ${color}`,
          backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
          boxShadow: `0 0 12px color-mix(in srgb, ${color} 35%, transparent), inset 0 0 10px color-mix(in srgb, ${color} 12%, transparent)`,
          animation: 'fade-in 0.5s ease-out, weather-glow 3s ease-in-out infinite',
          ['--weather-color' as string]: color,
        }}
      >
        <span
          className="text-xl md:text-2xl"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            animation: 'weather-icon-float 2s ease-in-out infinite',
          }}
        >
          {config.icon}
        </span>
        <div className="flex flex-col items-start">
          <span
            className="font-cyber text-sm md:text-base tracking-wider leading-tight"
            style={{
              color,
              textShadow: `0 0 6px color-mix(in srgb, ${color} 70%, transparent)`,
            }}
          >
            {config.name}
          </span>
          <span
            className="text-[10px] md:text-xs leading-tight"
            style={{ color: 'var(--text-secondary)' }}
          >
            {config.description}
          </span>
        </div>
      </button>

      {showTooltip && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50 cyber-card"
          style={{
            border: `1px solid ${color}`,
            color: 'var(--text-primary)',
            boxShadow: `0 0 12px color-mix(in srgb, ${color} 30%, transparent)`,
            animation: 'fade-in 0.2s ease-out',
          }}
        >
          <div className="font-cyber tracking-wide mb-1" style={{ color }}>
            {config.name}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {config.description}
          </div>
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{
              borderTop: `1px solid ${color}`,
              borderLeft: `1px solid ${color}`,
              backgroundColor: 'var(--bg-card)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
