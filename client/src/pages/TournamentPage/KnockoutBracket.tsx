import type { TournamentMatch } from '@shared/api.interface';
import { Award } from 'lucide-react';

const ROUND_LABELS_ASC = ['三十二強', '十六強', '八強', '四強', '準決賽', '決賽'];

function getRoundLabel(idx: number, total: number): string {
  // total rounds in knockout bracket
  // from left (idx=0) to right (idx=total-1 = 決賽)
  const labelCount = ROUND_LABELS_ASC.length;
  // map idx to position from the right (final)
  const fromRight = total - 1 - idx;
  if (fromRight < labelCount) {
    return ROUND_LABELS_ASC[labelCount - 1 - fromRight] || `第${idx + 1}輪`;
  }
  return `第${idx + 1}輪`;
}

interface KnockoutBracketProps {
  rounds: TournamentMatch[][];
}

const KnockoutBracket = ({ rounds }: KnockoutBracketProps) => {
  return (
    <div
      className="cyber-card p-4 overflow-x-auto"
      style={{ borderColor: 'rgba(255, 107, 157, 0.25)' }}
    >
      <div className="flex gap-4 min-w-max">
        {rounds.map((round, roundIdx) => (
          <div
            key={roundIdx}
            className="flex flex-col justify-around gap-3 min-w-[160px]"
          >
            <div className="text-xs text-center text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
              {getRoundLabel(roundIdx, rounds.length)}
            </div>
            {round.map((m: TournamentMatch) => {
              const done = m.status === 'finished';
              const w1 = m.winner === m.player1;
              const w2 = m.winner === m.player2;
              const hasPlayers = m.player1 && m.player2;
              return (
                <div
                  key={m.id}
                  className="cyber-card p-2 text-xs relative"
                  style={{
                    borderColor: done
                      ? 'rgba(0, 255, 128, 0.4)'
                      : hasPlayers
                        ? 'rgba(255, 107, 157, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: done
                      ? '0 0 8px rgba(0, 255, 128, 0.2)'
                      : 'none',
                    minHeight: '60px',
                  }}
                >
                  {hasPlayers ? (
                    <>
                      <div
                        className="flex items-center justify-between px-1 py-0.5 font-cyber"
                        style={{
                          color: w1
                            ? 'var(--green)'
                            : done
                              ? 'rgba(255,255,255,0.4)'
                              : 'var(--text-primary)',
                        }}
                      >
                        <span className="truncate max-w-[70px]">
                          {m.player1}
                        </span>
                        {w1 && (
                          <Award size={12} style={{ color: 'var(--green)' }} />
                        )}
                      </div>
                      <div className="h-px bg-[rgba(255_255_255_0.1)] my-1" />
                      <div
                        className="flex items-center justify-between px-1 py-0.5 font-cyber"
                        style={{
                          color: w2
                            ? 'var(--green)'
                            : done
                              ? 'rgba(255,255,255,0.4)'
                              : 'var(--text-primary)',
                        }}
                      >
                        <span className="truncate max-w-[70px]">
                          {m.player2}
                        </span>
                        {w2 && (
                          <Award size={12} style={{ color: 'var(--green)' }} />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[52px] text-[var(--text-secondary)] font-cyber">
                      — 待定 —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnockoutBracket;
