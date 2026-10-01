import { Users, Clock, Zap, ChevronRight, Swords, Trophy } from 'lucide-react';
import type { LiveTournament } from '@shared/api.interface';

interface LiveTournamentCardProps {
  tournament: LiveTournament;
  onJoin: () => void;
}

const STATUS_LABELS: Record<LiveTournament['status'], string> = {
  registration: '報名中',
  'in-progress': '進行中',
  completed: '已結束',
};

const STATUS_COLORS: Record<LiveTournament['status'], string> = {
  registration: 'var(--green)',
  'in-progress': 'var(--pink)',
  completed: 'var(--text-secondary)',
};

const LiveTournamentCard = ({ tournament, onJoin }: LiveTournamentCardProps) => {
  const statusColor = STATUS_COLORS[tournament.status];
  const progress =
    tournament.format > 0
      ? ((tournament.format - tournament.remainingPlayers + tournament.remainingPlayers) /
          tournament.format) *
        100
      : 0;
  const survivalPercent =
    tournament.format > 0
      ? Math.round((tournament.remainingPlayers / tournament.format) * 100)
      : 0;

  return (
    <div
      className="cyber-card p-4 md:p-6 relative overflow-hidden"
      style={{
        borderColor: 'rgba(255, 107, 157, 0.35)',
        boxShadow: '0 0 20px rgba(255, 107, 157, 0.2)',
        background:
          'linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(0, 255, 255, 0.04))',
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-20 h-20 opacity-20"
        style={{
          background:
            'radial-gradient(circle at top left, var(--pink), transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-20 h-20 opacity-20"
        style={{
          background:
            'radial-gradient(circle at bottom right, var(--cyan), transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-sm"
              style={{
                border: '1px solid var(--pink)',
                color: 'var(--pink)',
                background: 'rgba(255, 107, 157, 0.1)',
                boxShadow: '0 0 12px rgba(255, 107, 157, 0.3)',
              }}
            >
              <Swords size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-cyber text-lg md:text-xl tracking-wider"
                  style={{
                    color: 'var(--pink)',
                    textShadow: '0 0 8px rgba(255, 107, 157, 0.5)',
                  }}
                >
                  霓虹挑戰賽
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-sm font-cyber tracking-wider"
                  style={{
                    border: `1px solid ${statusColor}`,
                    color: statusColor,
                    background: `${statusColor}15`,
                    animation:
                      tournament.status === 'in-progress'
                        ? 'pulse-glow 2s ease-in-out infinite'
                        : 'none',
                  }}
                >
                  {STATUS_LABELS[tournament.status]}
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                {tournament.format} 人單敗淘汰制
              </div>
            </div>
          </div>

          {tournament.myPosition !== undefined && (
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5">
                我的位置
              </div>
              <div
                className="font-cyber text-2xl font-bold tracking-wider"
                style={{
                  color: 'var(--cyan)',
                  textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
                }}
              >
                #{tournament.myPosition}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div
            className="p-3 rounded-sm text-center"
            style={{
              border: '1px solid rgba(0, 255, 255, 0.2)',
              background: 'rgba(0, 255, 255, 0.04)',
            }}
          >
            <Users size={16} className="mx-auto mb-1" style={{ color: 'var(--cyan)' }} />
            <div
              className="font-cyber text-lg tracking-wider"
              style={{ color: 'var(--cyan)' }}
            >
              {tournament.remainingPlayers}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider">
              剩餘選手
            </div>
          </div>

          <div
            className="p-3 rounded-sm text-center"
            style={{
              border: '1px solid rgba(255, 107, 157, 0.2)',
              background: 'rgba(255, 107, 157, 0.04)',
            }}
          >
            <Zap size={16} className="mx-auto mb-1" style={{ color: 'var(--pink)' }} />
            <div
              className="font-cyber text-lg tracking-wider"
              style={{ color: 'var(--pink)' }}
            >
              第 {tournament.currentRound} 輪
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider">
              當前輪次
            </div>
          </div>

          <div
            className="p-3 rounded-sm text-center"
            style={{
              border: '1px solid rgba(167, 139, 250, 0.2)',
              background: 'rgba(167, 139, 250, 0.04)',
            }}
          >
            <Clock size={16} className="mx-auto mb-1" style={{ color: 'var(--purple)' }} />
            <div
              className="font-cyber text-lg tracking-wider"
              style={{ color: 'var(--purple)' }}
            >
              {tournament.nextRoundAt}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider">
              下一輪
            </div>
          </div>
        </div>

        {/* Survival bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className="font-cyber tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              淘汰進度
            </span>
            <span className="font-cyber" style={{ color: 'var(--pink)' }}>
              {survivalPercent}% 存活
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${survivalPercent}%`,
                background:
                  'linear-gradient(90deg, var(--cyan), var(--pink))',
                boxShadow: '0 0 8px rgba(255, 107, 157, 0.6)',
              }}
            />
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onJoin}
          className="cyber-btn w-full py-3.5 font-cyber text-base tracking-widest flex items-center justify-center gap-2 group"
          style={{
            borderColor: 'var(--pink)',
            color: 'var(--pink)',
            background:
              'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(255, 107, 157, 0.05))',
            boxShadow: '0 0 12px rgba(255, 107, 157, 0.3)',
          }}
        >
          <Trophy size={16} />
          <span>{tournament.status === 'registration' ? '立即報名' : '參加下一場'}</span>
          <ChevronRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
};

export default LiveTournamentCard;
