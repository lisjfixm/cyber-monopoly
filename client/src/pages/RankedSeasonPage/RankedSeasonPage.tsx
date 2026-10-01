import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Flame, TrendingUp, Award, Zap } from 'lucide-react';
import {
  RANK_TIERS,
  getRankedState,
  saveRankedState,
  applyMatchResult,
  getTierProgress,
} from '@client/src/utils/ranked';
import type { RankedState, RankTierConfig } from '@client/src/utils/ranked';

const SEASON_REWARDS: { tier: string; reward: string; type: string }[] = [
  { tier: '黃金', reward: '黃金段位頭像框', type: 'avatarFrame' },
  { tier: '鉑金', reward: '霓虹擊敗特效', type: 'effect' },
  { tier: '鑽石', reward: '鑽石骰子皮膚', type: 'skin' },
  { tier: '大師', reward: '大師稱號', type: 'title' },
  { tier: '王者', reward: '王者傳說皮膚', type: 'skin' },
];

function getSeasonDaysLeft(): number {
  const now = new Date();
  const month = now.getMonth();
  const quarterEndMonth = Math.ceil((month + 1) / 3) * 3 - 1;
  const lastDay = new Date(now.getFullYear(), quarterEndMonth + 1, 0);
  const diff = lastDay.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const RankedSeasonPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<RankedState>(() => getRankedState());
  const [, setTick] = useState(0);
  const progress = useMemo(() => getTierProgress(state.elo), [state.elo]);

  // 每分鐘重新計算賽季剩餘天數，確保跨午夜後邊界正確
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSimulateWin = useCallback(() => {
    const opponentElo = state.elo + Math.floor(Math.random() * 100) - 50;
    const newState = applyMatchResult(state, true, opponentElo);
    saveRankedState(newState);
    setState(newState);
  }, [state]);

  const handleSimulateLoss = useCallback(() => {
    const opponentElo = state.elo + Math.floor(Math.random() * 100) - 50;
    const newState = applyMatchResult(state, false, opponentElo);
    saveRankedState(newState);
    setState(newState);
  }, [state]);

  const seasonNum = state.currentSeason;
  const daysLeft = getSeasonDaysLeft();
  const totalGames = state.wins + state.losses;
  const winRate = totalGames > 0 ? Math.round((state.wins / totalGames) * 100) : 0;
  const currentTierConfig = progress.currentTier;

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <div className="flex-1">
          <h1 className="font-cyber text-2xl md:text-3xl tracking-wider"
            style={{
              color: currentTierConfig.color,
              textShadow: `0 0 15px ${currentTierConfig.glowColor}60`,
            }}
          >
            排位賽季
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1">
            {seasonNum} · 剩餘 {daysLeft} 天
          </p>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-6 pb-8">
        {/* Current Rank Card */}
        <div
          className="cyber-card p-5 relative overflow-hidden"
          style={{
            borderColor: currentTierConfig.color,
            boxShadow: `0 0 25px ${currentTierConfig.glowColor}30, inset 0 0 20px ${currentTierConfig.glowColor}10`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Rank Icon */}
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: `3px solid ${currentTierConfig.color}`,
                backgroundColor: `${currentTierConfig.color}15`,
                boxShadow: `0 0 20px ${currentTierConfig.glowColor}60, inset 0 0 15px ${currentTierConfig.glowColor}30`,
              }}
            >
              <span
                className="font-cyber text-5xl md:text-6xl font-bold"
                style={{
                  color: currentTierConfig.color,
                  textShadow: `0 0 15px ${currentTierConfig.glowColor}`,
                }}
              >
                {currentTierConfig.iconLetter}
              </span>
            </div>

            {/* Rank Info */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
                當前段位
              </div>
              <div
                className="font-cyber text-3xl md:text-4xl font-bold tracking-wider"
                style={{
                  color: currentTierConfig.color,
                  textShadow: `0 0 10px ${currentTierConfig.glowColor}`,
                }}
              >
                {currentTierConfig.name}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                {currentTierConfig.description}
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                  <span>{currentTierConfig.name}</span>
                  <span>
                    {state.elo} / {progress.nextTier ? progress.maxElo : 'MAX'} ELO
                  </span>
                  <span>
                    {progress.nextTier ? progress.nextTier.name : '最高段位'}
                  </span>
                </div>
                <div
                  className="h-3 rounded-sm bg-[var(--bg-mid)] border relative overflow-hidden"
                  style={{ borderColor: `${currentTierConfig.color}40` }}
                >
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${progress.progress}%`,
                      background: `linear-gradient(90deg, ${currentTierConfig.color}40, ${currentTierConfig.color})`,
                      boxShadow: `0 0 10px ${currentTierConfig.glowColor}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Trophy size={18} />}
            label="ELO 分數"
            value={String(state.elo)}
            color="var(--yellow)"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="勝場"
            value={String(state.wins)}
            color="var(--green)"
          />
          <StatCard
            icon={<Zap size={18} />}
            label="敗場"
            value={String(state.losses)}
            color="var(--red)"
          />
          <StatCard
            icon={<Flame size={18} />}
            label="連勝"
            value={`${state.winStreak} 連勝`}
            color="var(--pink)"
          />
        </div>

        {/* Win Rate + Stats */}
        <div
          className="cyber-card p-4"
          style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-cyber text-sm tracking-wider text-[var(--text-secondary)]">
              賽季戰績
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
                總對局
              </div>
              <div className="font-cyber text-2xl font-bold text-[var(--text-primary)]">
                {totalGames}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
                勝率
              </div>
              <div className="font-cyber text-2xl font-bold" style={{ color: 'var(--green)' }}>
                {winRate}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
                最高連勝
              </div>
              <div className="font-cyber text-2xl font-bold" style={{ color: 'var(--yellow)' }}>
                {state.bestWinStreak ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* All Tiers */}
        <div
          className="cyber-card p-4"
          style={{ borderColor: 'rgba(168, 85, 247, 0.25)' }}
        >
          <h2 className="font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3">
            段位一覽
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {RANK_TIERS.map((tier: RankTierConfig) => {
              const isCurrent = tier.tier === state.tier;
              return (
                <div
                  key={tier.tier}
                  className="flex flex-col items-center gap-1 p-2 rounded-sm transition-all"
                  style={{
                    border: `1px solid ${isCurrent ? tier.color : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: isCurrent ? `${tier.color}15` : 'transparent',
                    boxShadow: isCurrent ? `0 0 10px ${tier.glowColor}40` : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-cyber font-bold text-lg"
                    style={{
                      color: tier.color,
                      border: `1.5px solid ${tier.color}`,
                      textShadow: `0 0 6px ${tier.glowColor}`,
                      opacity: isCurrent ? 1 : 0.7,
                    }}
                  >
                    {tier.iconLetter}
                  </div>
                  <span
                    className="text-[10px] font-cyber tracking-wider text-center"
                    style={{ color: isCurrent ? tier.color : 'var(--text-secondary)' }}
                  >
                    {tier.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rank Rules */}
        <div
          className="cyber-card p-4"
          style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}
        >
          <h2 className="font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3">
            升降段規則
          </h2>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--green)' }}>▲</span>
              <span>勝場獲得 15-30 ELO 分，連勝 3 場以上額外加成</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--red)' }}>▼</span>
              <span>敗場扣除 10-20 ELO 分，ELO 歸零不再扣除</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--cyan)' }}>◆</span>
              <span>達到下一段位最低 ELO 門檻即自動升段</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--yellow)' }}>星</span>
              <span>賽季結算後段位軟重置，保留 70% 基礎分數</span>
            </div>
          </div>
        </div>

        {/* Season Rewards */}
        <div
          className="cyber-card p-4"
          style={{ borderColor: 'rgba(255, 200, 0, 0.25)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} style={{ color: 'var(--yellow)' }} />
            <h2 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--yellow)' }}>
              賽季結算獎勵
            </h2>
          </div>
          <div className="space-y-2">
            {SEASON_REWARDS.map((reward) => {
              const tierConfig = RANK_TIERS.find((t) => t.name === reward.tier);
              const achieved = tierConfig
                ? state.elo >= tierConfig.minElo
                : false;
              return (
                <div
                  key={reward.tier}
                  className="flex items-center gap-3 p-2.5 rounded-sm"
                  style={{
                    border: `1px solid ${achieved ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: achieved ? 'rgba(0, 255, 128, 0.05)' : 'transparent',
                    opacity: achieved ? 1 : 0.6,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-cyber font-bold text-sm flex-shrink-0"
                    style={{
                      color: tierConfig?.color ?? 'var(--text-secondary)',
                      border: `1.5px solid ${tierConfig?.color ?? 'var(--text-muted)'}`,
                    }}
                  >
                    {tierConfig?.iconLetter ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-cyber tracking-wider" style={{ color: tierConfig?.color }}>
                      {reward.tier}段位
                    </div>
                    <div className="text-sm text-[var(--text-primary)] truncate">
                      {reward.reward}
                    </div>
                  </div>
                  {achieved ? (
                    <span
                      className="text-xs font-cyber px-2 py-0.5 rounded-sm"
                      style={{
                        color: 'var(--green)',
                        border: '1px solid var(--green)',
                      }}
                    >
                      已達成
                    </span>
                  ) : (
                    <span
                      className="text-xs font-cyber px-2 py-0.5 rounded-sm"
                      style={{
                        color: 'var(--text-muted)',
                        border: '1px solid var(--text-muted)',
                      }}
                    >
                      未達成
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulate Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleSimulateWin}
            className="cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--green)',
              color: 'var(--green)',
              background: 'rgba(0, 255, 128, 0.08)',
              boxShadow: '0 0 12px rgba(0, 255, 128, 0.2)',
            }}
          >
            <Trophy size={16} />
            模擬獲勝
          </button>
          <button
            type="button"
            onClick={handleSimulateLoss}
            className="cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--red)',
              color: 'var(--red)',
              background: 'rgba(255, 59, 59, 0.08)',
              boxShadow: '0 0 12px rgba(255, 59, 59, 0.2)',
            }}
          >
            <Zap size={16} />
            模擬落敗
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  return (
    <div
      className="cyber-card p-3 text-center"
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}05`,
      }}
    >
      <div className="flex items-center justify-center gap-1 mb-1" style={{ color }}>
        {icon}
        <span className="text-xs font-cyber tracking-wider">{label}</span>
      </div>
      <div
        className="font-cyber text-xl font-bold"
        style={{ color, textShadow: `0 0 8px ${color}60` }}
      >
        {value}
      </div>
    </div>
  );
};

export default RankedSeasonPage;
