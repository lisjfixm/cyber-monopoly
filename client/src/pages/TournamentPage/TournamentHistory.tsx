import { useMemo } from 'react';
import type { TournamentHistory as TournamentHistoryItem } from '@shared/api.interface';
import { Award, Crown, ChevronRight, Calendar, Trophy, Medal } from 'lucide-react';

interface TournamentHistoryPanelProps {
  history: TournamentHistoryItem[];
}

const RANK_COLORS: Record<number, string> = {
  1: '#facc15',
  2: 'var(--cyan)',
  3: 'var(--pink)',
};

function getRankColor(rank: number): string {
  return RANK_COLORS[rank] ?? 'var(--text-secondary)';
}

function getRankLabel(rank: number): string {
  if (rank === 1) return '冠軍';
  if (rank === 2) return '亞軍';
  if (rank === 3) return '季軍';
  return `第 ${rank} 名`;
}

const TournamentHistoryPanel = ({ history }: TournamentHistoryPanelProps) => {
  const bestRank = useMemo(() => {
    if (history.length === 0) return null;
    return history.reduce(
      (best: TournamentHistoryItem | null, h: TournamentHistoryItem) =>
        !best || h.myRank < best.myRank ? h : best,
      null,
    );
  }, [history]);

  return (
    <div
      className="cyber-card p-4 md:p-5"
      style={{
        borderColor: 'rgba(167, 139, 250, 0.3)',
        boxShadow: '0 0 12px rgba(167, 139, 250, 0.15)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} style={{ color: 'var(--purple)' }} />
        <h3 className="font-cyber text-lg tracking-wider" style={{ color: 'var(--purple)' }}>
          歷史記錄
        </h3>
        <span className="text-xs text-[var(--text-secondary)] font-cyber ml-auto">
          共 {history.length} 場
        </span>
      </div>

      {/* Best record card */}
      {bestRank && (
        <div
          className="mb-4 p-4 rounded-sm relative overflow-hidden"
          style={{
            border: '1px solid #facc15',
            background:
              'linear-gradient(135deg, rgba(250, 204, 21, 0.12), rgba(250, 204, 21, 0.02))',
            boxShadow: '0 0 16px rgba(250, 204, 21, 0.25)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown
              size={16}
              style={{ color: '#facc15', filter: 'drop-shadow(0 0 4px #facc15)' }}
            />
            <span
              className="font-cyber text-sm tracking-widest"
              style={{ color: '#facc15', textShadow: '0 0 6px rgba(250,204,21,0.5)' }}
            >
              我的最好成績
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div
                className="font-cyber text-2xl tracking-wider"
                style={{ color: '#facc15', textShadow: '0 0 10px rgba(250,204,21,0.6)' }}
              >
                {getRankLabel(bestRank.myRank)}
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-cyber mt-0.5">
                {bestRank.format} 人賽 · {bestRank.date}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-sm font-cyber tracking-wider"
                style={{ color: '#facc15' }}
              >
                {bestRank.rewards}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] font-cyber mt-0.5">
                獲得獎勵
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table header */}
      <div
        className="grid grid-cols-12 px-3 py-2 text-xs font-cyber tracking-wider text-[var(--text-secondary)] border-b"
        style={{
          borderColor: 'rgba(167, 139, 250, 0.15)',
          background: 'rgba(167, 139, 250, 0.04)',
        }}
      >
        <div className="col-span-3 flex items-center gap-1">
          <Calendar size={12} /> 日期
        </div>
        <div className="col-span-2 flex items-center gap-1">
          <Trophy size={12} /> 賽制
        </div>
        <div className="col-span-3 flex items-center gap-1">
          <Medal size={12} /> 名次
        </div>
        <div className="col-span-4 text-right">獎勵</div>
      </div>

      {/* History rows */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {history.map((h: TournamentHistoryItem, idx: number) => {
          const rankColor = getRankColor(h.myRank);
          return (
            <div
              key={h.id}
              className={`grid grid-cols-12 px-3 py-3 text-xs items-center transition-all hover:bg-[rgba(167_139_250_0.05)] ${
                idx % 2 === 1 ? 'bg-[rgba(255_255_255_0.015)]' : ''
              }`}
            >
              <div
                className="col-span-3 font-cyber"
                style={{ color: 'var(--text-primary)' }}
              >
                {h.date}
              </div>
              <div
                className="col-span-2 font-cyber tracking-wider"
                style={{ color: 'var(--cyan)' }}
              >
                {h.format} 人
              </div>
              <div className="col-span-3 flex items-center gap-1.5">
                <ChevronRight size={12} style={{ color: rankColor, opacity: 0.6 }} />
                <span
                  className="font-cyber font-bold tracking-wider"
                  style={{
                    color: rankColor,
                    textShadow: h.myRank <= 3 ? `0 0 6px ${rankColor}` : 'none',
                  }}
                >
                  {getRankLabel(h.myRank)}
                </span>
              </div>
              <div
                className="col-span-4 text-right truncate font-cyber"
                style={{ color: 'var(--text-secondary)' }}
              >
                {h.rewards}
              </div>
            </div>
          );
        })}
      </div>

      {history.length === 0 && (
        <div className="py-8 text-center text-[var(--text-secondary)] text-sm font-cyber">
          尚無歷史記錄
        </div>
      )}
    </div>
  );
};

export default TournamentHistoryPanel;
