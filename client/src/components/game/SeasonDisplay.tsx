import type { FC } from 'react';
import { SEASONS, SEASON_CHANGE_INTERVAL } from '@shared/game-config';
import type { SeasonState } from '@shared/api.interface';

interface SeasonDisplayProps {
  season?: SeasonState;
}

const SeasonDisplay: FC<SeasonDisplayProps> = ({ season }) => {
  if (!season) return null;

  const config = SEASONS[season.type];
  if (!config) return null;

  const progress = Math.min(season.turn, SEASON_CHANGE_INTERVAL);
  const progressPercent = (progress / SEASON_CHANGE_INTERVAL) * 100;

  return (
    <div
      className="relative w-full px-4 py-2.5 rounded-lg overflow-hidden season-display-enter"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-dark) 90%, transparent)',
        border: `1px solid color-mix(in srgb, ${config.color} 40%, transparent)`,
        boxShadow: `0 0 12px color-mix(in srgb, ${config.color} 25%, transparent), inset 0 0 8px color-mix(in srgb, ${config.color} 10%, transparent)`,
      }}
    >
      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, ${config.color} 15%, transparent) 2px, color-mix(in srgb, ${config.color} 15%, transparent) 4px)`,
        }}
      />

      <div className="relative flex items-center justify-between gap-3">
        {/* Left: icon + name */}
        <div className="flex items-center gap-2.5">
          <span
            className="text-xl md:text-2xl season-icon-float"
            style={{ filter: `drop-shadow(0 0 6px ${config.color})` }}
          >
            {config.icon}
          </span>
          <div>
            <div
              className="font-cyber text-base md:text-lg tracking-wider"
              style={{
                color: config.color,
                textShadow: `0 0 8px ${config.color}, 0 0 16px color-mix(in srgb, ${config.color} 50%, transparent)`,
              }}
            >
              {config.name}之季
            </div>
            <div
              className="text-[10px] md:text-xs font-cyber tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              {config.description}
            </div>
          </div>
        </div>

        {/* Right: turn counter */}
        <div className="text-right">
          <div
            className="text-[10px] md:text-xs font-cyber tracking-wider"
            style={{ color: config.color }}
          >
            第 {progress} / {SEASON_CHANGE_INTERVAL} 回合
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="relative mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-mid)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: config.color,
            boxShadow: `0 0 6px ${config.color}`,
          }}
        />
      </div>
    </div>
  );
};

export default SeasonDisplay;
