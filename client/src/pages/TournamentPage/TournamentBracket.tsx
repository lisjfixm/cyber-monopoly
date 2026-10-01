import type { BracketMatch } from '@shared/api.interface';
import { Crown, Swords, Zap } from 'lucide-react';

interface TournamentBracketProps {
  rounds: BracketMatch[][];
  format: 8 | 16 | 32;
}

const ROUND_LABELS: Record<number, string[]> = {
  8: ['八強', '四強', '決賽'],
  16: ['十六強', '八強', '四強', '決賽'],
  32: ['三十二強', '十六強', '八強', '四強', '決賽'],
};

function getRoundLabels(format: 8 | 16 | 32, totalRounds: number): string[] {
  const labels = ROUND_LABELS[format];
  if (labels && labels.length === totalRounds) return labels;
  // fallback: generate from the largest set, take last N
  const full = ROUND_LABELS[32];
  return full.slice(full.length - totalRounds);
}

const RARITY_COLORS = {
  cyan: 'var(--cyan)',
  pink: 'var(--pink)',
  green: 'var(--green)',
  gold: '#facc15',
};

const TournamentBracket = ({ rounds, format }: TournamentBracketProps) => {
  const labels = getRoundLabels(format, rounds.length);
  const totalRounds = rounds.length;

  return (
    <div
      className="cyber-card p-4 md:p-6 overflow-x-auto"
      style={{
        borderColor: 'rgba(255, 107, 157, 0.3)',
        boxShadow: '0 0 16px rgba(255, 107, 157, 0.15)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Swords size={20} style={{ color: 'var(--pink)' }} />
        <h3 className="font-cyber text-lg text-neon-pink tracking-wider">
          賽程樹狀圖
        </h3>
        <span className="text-xs text-[var(--text-secondary)] font-cyber ml-auto">
          {format} 人單敗淘汰制
        </span>
      </div>

      <div className="flex gap-3 md:gap-6 min-w-max pb-2">
        {rounds.map((round, roundIdx) => {
          const isFinal = roundIdx === totalRounds - 1;
          const matchCount = round.length;
          // vertical spacing grows as rounds progress to connect bracket lines
          const gapClass =
            matchCount >= 8
              ? 'gap-2'
              : matchCount >= 4
                ? 'gap-6'
                : matchCount >= 2
                  ? 'gap-14'
                  : 'gap-0';

          return (
            <div
              key={roundIdx}
              className={`flex flex-col justify-around ${gapClass} min-w-[180px] md:min-w-[200px]`}
            >
              <div
                className="text-xs text-center font-cyber tracking-widest mb-2"
                style={{
                  color: isFinal ? '#facc15' : 'var(--cyan)',
                  textShadow: isFinal
                    ? '0 0 8px rgba(250, 204, 21, 0.6)'
                    : '0 0 6px rgba(0, 255, 255, 0.4)',
                }}
              >
                {labels[roundIdx]}
              </div>

              {round.map((m: BracketMatch) => {
                const hasWinner = m.player1.won || m.player2.won;
                const isLive = m.isLive;

                return (
                  <div
                    key={`r${roundIdx}-m${m.matchNumber}`}
                    className="cyber-card p-2 text-xs relative overflow-hidden"
                    style={{
                      borderColor: isLive
                        ? 'var(--pink)'
                        : hasWinner
                          ? 'rgba(0, 255, 128, 0.4)'
                          : 'rgba(0, 255, 255, 0.2)',
                      boxShadow: isLive
                        ? '0 0 12px rgba(255, 107, 157, 0.5), inset 0 0 8px rgba(255, 107, 157, 0.15)'
                        : hasWinner
                          ? '0 0 8px rgba(0, 255, 128, 0.2)'
                          : 'none',
                      animation: isLive ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
                      minHeight: '72px',
                      background: isLive
                        ? 'linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(0, 255, 255, 0.04))'
                        : undefined,
                    }}
                  >
                    {/* Sweep line */}
                    {isLive && (
                      <div
                        className="absolute top-0 left-0 w-full h-px"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, var(--pink), transparent)',
                          animation: 'sweep-h 2s linear infinite',
                        }}
                      />
                    )}

                    {isFinal && hasWinner && (
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-cyber flex items-center gap-1"
                        style={{
                          background: 'rgba(250, 204, 21, 0.15)',
                          border: '1px solid #facc15',
                          color: '#facc15',
                          boxShadow: '0 0 8px rgba(250, 204, 21, 0.5)',
                        }}
                      >
                        <Crown size={10} />
                        冠軍
                      </div>
                    )}

                    {/* Player 1 */}
                    <div
                      className="flex items-center justify-between px-2 py-1.5 font-cyber tracking-wider rounded-sm"
                      style={{
                        color: m.player1.won
                          ? 'var(--green)'
                          : hasWinner
                            ? 'rgba(255,255,255,0.35)'
                            : 'var(--text-primary)',
                        background: m.player1.won
                          ? 'rgba(0, 255, 128, 0.1)'
                          : 'transparent',
                        boxShadow: m.player1.won
                          ? 'inset 2px 0 0 var(--green)'
                          : 'none',
                      }}
                    >
                      <span className="truncate max-w-[100px]">
                        {m.player1.name}
                      </span>
                      {m.player1.won && (
                        <Zap
                          size={12}
                          style={{ color: 'var(--green)' }}
                          fill="currentColor"
                        />
                      )}
                    </div>

                    {/* VS divider */}
                    <div className="relative h-px my-1 bg-[rgba(255_255_255_0.08)]">
                      <span
                        className="absolute left-1/2 -translate-x-1/2 -top-2 px-1.5 text-[10px] font-cyber tracking-widest"
                        style={{
                          color: isLive ? 'var(--pink)' : 'var(--text-secondary)',
                          background: 'var(--bg-dark)',
                        }}
                      >
                        {isLive ? 'LIVE' : 'VS'}
                      </span>
                    </div>

                    {/* Player 2 */}
                    <div
                      className="flex items-center justify-between px-2 py-1.5 font-cyber tracking-wider rounded-sm"
                      style={{
                        color: m.player2.won
                          ? 'var(--green)'
                          : hasWinner
                            ? 'rgba(255,255,255,0.35)'
                            : 'var(--text-primary)',
                        background: m.player2.won
                          ? 'rgba(0, 255, 128, 0.1)'
                          : 'transparent',
                        boxShadow: m.player2.won
                          ? 'inset 2px 0 0 var(--green)'
                          : 'none',
                      }}
                    >
                      <span className="truncate max-w-[100px]">
                        {m.player2.name}
                      </span>
                      {m.player2.won && (
                        <Zap
                          size={12}
                          style={{ color: 'var(--green)' }}
                          fill="currentColor"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Champion podium */}
        {rounds.length > 0 &&
          rounds[totalRounds - 1]?.length === 1 &&
          rounds[totalRounds - 1][0]?.winner && (
            <div className="flex flex-col justify-center items-center min-w-[140px] pl-2">
              <div
                className="text-xs text-center font-cyber tracking-widest mb-2"
                style={{
                  color: '#facc15',
                  textShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
                }}
              >
                頒獎台
              </div>
              <div
                className="cyber-card p-4 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  borderColor: '#facc15',
                  boxShadow:
                    '0 0 20px rgba(250, 204, 21, 0.5), inset 0 0 12px rgba(250, 204, 21, 0.15)',
                  background:
                    'linear-gradient(180deg, rgba(250, 204, 21, 0.12), rgba(250, 204, 21, 0.02))',
                  minWidth: '120px',
                  minHeight: '180px',
                  animation: 'pulse-glow 3s ease-in-out infinite',
                }}
              >
                <Crown
                  size={36}
                  style={{
                    color: '#facc15',
                    filter: 'drop-shadow(0 0 8px #facc15)',
                  }}
                />
                <div
                  className="mt-2 text-sm font-cyber tracking-wider text-center"
                  style={{
                    color: '#facc15',
                    textShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
                  }}
                >
                  {rounds[totalRounds - 1][0].winner}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-cyber mt-1 tracking-wider">
                  錦標之王
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default TournamentBracket;
