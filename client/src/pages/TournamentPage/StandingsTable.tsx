import type { TournamentStanding } from '@shared/api.interface';
import { Crown } from 'lucide-react';

interface StandingsTableProps {
  standings: TournamentStanding[];
  champion?: string;
  phase: string;
}

const StandingsTable = ({
  standings,
  champion,
  phase,
}: StandingsTableProps) => {
  return (
    <div
      className="cyber-card overflow-hidden"
      style={{ borderColor: 'rgba(0, 255, 255, 0.25)' }}
    >
      <div className="px-4 py-3 border-b border-[rgba(0_255_255_0.1)] flex items-center justify-between">
        <span className="font-cyber text-neon-cyan tracking-wider">積分榜</span>
        <span className="text-xs text-[var(--text-secondary)] font-cyber">
          共 {standings.length} 人
        </span>
      </div>

      <div
        className="grid grid-cols-12 px-4 py-2 text-xs font-cyber tracking-wider text-[var(--text-secondary)] border-b border-[rgba(0_255_255_0.1)]"
        style={{ background: 'rgba(0, 255, 255, 0.03)' }}
      >
        <div className="col-span-1">排名</div>
        <div className="col-span-5">玩家</div>
        <div className="col-span-2 text-center">勝場</div>
        <div className="col-span-2 text-center">敗場</div>
        <div className="col-span-2 text-center">積分</div>
      </div>

      <div>
        {standings.map((s: TournamentStanding, idx: number) => {
          const rank = idx + 1;
          const isChamp = champion === s.player;
          const top2 = phase === 'group' && rank <= 2;
          const highlight = isChamp || top2;

          return (
            <div
              key={s.player}
              className={`grid grid-cols-12 px-4 py-2.5 text-sm items-center transition-all hover:bg-[rgba(0_255_255_0.05)] ${
                idx % 2 === 1 ? 'bg-[rgba(255_255_255_0.02)]' : ''
              }`}
              style={{
                background: isChamp
                  ? 'linear-gradient(90deg, rgba(250,204,21,0.15), transparent)'
                  : undefined,
                boxShadow: highlight
                  ? 'inset 3px 0 0 var(--green)'
                  : undefined,
              }}
            >
              <div
                className="col-span-1 font-cyber font-bold"
                style={{
                  color: isChamp
                    ? '#facc15'
                    : top2
                      ? 'var(--green)'
                      : 'var(--cyan)',
                }}
              >
                {isChamp ? (
                  <Crown
                    size={16}
                    style={{
                      color: '#facc15',
                      filter: 'drop-shadow(0 0 4px #facc15)',
                    }}
                  />
                ) : (
                  rank
                )}
              </div>
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <span
                  className="truncate font-cyber tracking-wider"
                  style={{
                    color: isChamp
                      ? '#facc15'
                      : top2
                        ? 'var(--green)'
                        : 'var(--text-primary)',
                    textShadow: isChamp
                      ? '0 0 8px rgba(250,204,21,0.5)'
                      : 'none',
                  }}
                >
                  {s.player}
                </span>
                {isChamp && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 font-cyber rounded-sm"
                    style={{
                      color: '#facc15',
                      border: '1px solid #facc15',
                      background: 'rgba(250,204,21,0.1)',
                    }}
                  >
                    冠軍
                  </span>
                )}
              </div>
              <div
                className="col-span-2 text-center font-cyber"
                style={{ color: 'var(--green)' }}
              >
                {s.wins}
              </div>
              <div
                className="col-span-2 text-center font-cyber"
                style={{ color: 'var(--red)', opacity: 0.7 }}
              >
                {s.losses}
              </div>
              <div
                className="col-span-2 text-center font-cyber font-bold"
                style={{
                  color: isChamp ? '#facc15' : 'var(--cyan)',
                }}
              >
                {s.points}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StandingsTable;
