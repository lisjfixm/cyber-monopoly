import { memo } from 'react';
import { PROFESSIONS } from '@shared/game-config';
import type { Profession } from '@shared/api.interface';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

export type FilterGameMode = 'all' | 'classic' | 'fast' | 'crazy';
export type FilterPlayerCount = 'all' | 2 | 4 | 6;
export type FilterProfession = 'all' | Profession;

export interface LeaderboardFilters {
  profession: FilterProfession;
  gameMode: FilterGameMode;
  playerCount: FilterPlayerCount;
}

interface LeaderboardFilterProps {
  filters: LeaderboardFilters;
  onChange: (filters: LeaderboardFilters) => void;
}

const GAME_MODE_OPTIONS: { value: FilterGameMode; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'classic', label: '經典模式' },
  { value: 'fast', label: '快速模式' },
  { value: 'crazy', label: '瘋狂模式' },
];

const PLAYER_COUNT_OPTIONS: { value: FilterPlayerCount; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 2, label: '2 人' },
  { value: 4, label: '4 人' },
  { value: 6, label: '6 人' },
];

const FILTER_NEON_COLOR = 'var(--cyan)';

const LeaderboardFilter = memo(function LeaderboardFilter({
  filters,
  onChange,
}: LeaderboardFilterProps) {
  const professionList = Object.values(PROFESSIONS);

  const handleProfessionChange = (value: string) => {
    onChange({ ...filters, profession: value as FilterProfession });
  };

  const handleGameModeChange = (value: string) => {
    onChange({ ...filters, gameMode: value as FilterGameMode });
  };

  const handlePlayerCountChange = (value: string) => {
    const numVal = value === 'all' ? 'all' : (parseInt(value, 10) as 2 | 4 | 6);
    onChange({ ...filters, playerCount: numVal as FilterPlayerCount });
  };

  return (
    <div
      className="cyber-card p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-2xl mx-auto"
      style={{
        borderColor: 'color-mix(in srgb, var(--cyan) 30%, transparent)',
        boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)',
      }}
    >
      {/* 職業篩選 */}
      <FilterField label="職業" className="flex-1">
        <Select value={filters.profession} onValueChange={handleProfessionChange}>
          <SelectTrigger
            className="w-full"
            style={{
              borderColor: 'color-mix(in srgb, var(--cyan) 40%, transparent)',
              color: 'var(--text-primary)',
              background: 'rgba(0, 229, 255, 0.04)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: 'var(--bg-mid)',
              borderColor: FILTER_NEON_COLOR,
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
              color: 'var(--text-primary)',
            }}
          >
            <SelectItem value="all">全部</SelectItem>
            {professionList.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                <span className="font-cyber tracking-wide" style={{ color: prof.color }}>
                  {prof.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {/* 模式篩選 */}
      <FilterField label="模式" className="flex-1">
        <Select value={filters.gameMode} onValueChange={handleGameModeChange}>
          <SelectTrigger
            className="w-full"
            style={{
              borderColor: 'color-mix(in srgb, var(--pink) 40%, transparent)',
              color: 'var(--text-primary)',
              background: 'rgba(255, 107, 157, 0.04)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: 'var(--bg-mid)',
              borderColor: 'var(--pink)',
              boxShadow: '0 0 15px rgba(255, 107, 157, 0.3)',
              color: 'var(--text-primary)',
            }}
          >
            {GAME_MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {/* 人數篩選 */}
      <FilterField label="人數" className="flex-1">
        <Select value={String(filters.playerCount)} onValueChange={handlePlayerCountChange}>
          <SelectTrigger
            className="w-full"
            style={{
              borderColor: 'color-mix(in srgb, var(--purple) 40%, transparent)',
              color: 'var(--text-primary)',
              background: 'rgba(168, 85, 247, 0.04)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: 'var(--bg-mid)',
              borderColor: 'var(--purple)',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
              color: 'var(--text-primary)',
            }}
          >
            {PLAYER_COUNT_OPTIONS.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
    </div>
  );
});

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span
        className="text-[10px] font-cyber tracking-widest"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default LeaderboardFilter;
