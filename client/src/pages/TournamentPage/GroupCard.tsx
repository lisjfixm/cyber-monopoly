import type { TournamentMatch, TournamentStanding } from '@shared/api.interface';
import { Award } from 'lucide-react';

interface GroupCardProps {
  groupName: string;
  players: string[];
  matches: TournamentMatch[];
  sortedStandings: TournamentStanding[];
}

const GroupCard = ({
  groupName,
  players,
  matches,
  sortedStandings,
}: GroupCardProps) => {
  const groupStandings = sortedStandings
    .filter((s: TournamentStanding) => players.includes(s.player))
    .slice(0, 2);
  const advancerSet = new Set(
    groupStandings.map((s: TournamentStanding) => s.player),
  );

  return (
    <div
      className="cyber-card p-4"
      style={{ borderColor: 'rgba(0, 255, 255, 0.25)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-cyber text-lg text-neon-cyan tracking-wider">
          {groupName} 組
        </span>
        <span className="text-xs text-[var(--text-secondary)] font-cyber">
          {players.length} 隊
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {players.map((p: string) => (
          <div
            key={p}
            className="flex items-center justify-between px-2 py-1 text-sm"
            style={{
              color: advancerSet.has(p)
                ? 'var(--green)'
                : 'var(--text-primary)',
              background: advancerSet.has(p)
                ? 'rgba(0, 255, 128, 0.08)'
                : 'transparent',
              borderRadius: '2px',
            }}
          >
            <span className="truncate font-cyber tracking-wider">{p}</span>
            {advancerSet.has(p) && (
              <Award size={14} style={{ color: 'var(--green)' }} />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1 pt-2 border-t border-[rgba(0_255_255_0.1)]">
        {matches.map((m: TournamentMatch) => {
          const w1 = m.winner === m.player1;
          const w2 = m.winner === m.player2;
          const done = m.status === 'finished';
          return (
            <div
              key={m.id}
              className="flex items-center justify-between text-xs px-2 py-1"
            >
              <span
                className="truncate font-cyber flex-1"
                style={{
                  color: w1
                    ? 'var(--green)'
                    : done
                      ? 'rgba(255,255,255,0.4)'
                      : 'var(--text-secondary)',
                }}
              >
                {m.player1}
              </span>
              <span
                className="px-2 font-cyber"
                style={{
                  color: done ? 'var(--cyan)' : 'var(--text-secondary)',
                }}
              >
                {done ? 'VS' : '—'}
              </span>
              <span
                className="truncate font-cyber flex-1 text-right"
                style={{
                  color: w2
                    ? 'var(--green)'
                    : done
                      ? 'rgba(255,255,255,0.4)'
                      : 'var(--text-secondary)',
                }}
              >
                {m.player2}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupCard;
