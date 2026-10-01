import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Coins,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Clock,
  Award,
  Star,
  Crown,
  HelpCircle,
  Globe,
  Users,
  MapPin,
  ChevronDown,
  X,
  Swords,
  Gem,
  Target,
} from 'lucide-react';
import { useLeaderboard } from '@client/src/hooks/useLeaderboard';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import type { LeaderboardItem, LeaderboardType, LeaderboardScope } from '@shared/api.interface';

const TABS: Array<{ key: LeaderboardType; label: string; icon: typeof Trophy; unit: string }> = [
  { key: 'elo', label: 'ELO積分', icon: Trophy, unit: 'ELO' },
  { key: 'wins', label: '勝場排行', icon: Swords, unit: '勝' },
  { key: 'season', label: '賽季排行', icon: Zap, unit: '勝' },
  { key: 'total-networth', label: '總資產', icon: Coins, unit: '' },
  { key: 'peak-networth', label: '單局峰值', icon: Gem, unit: '' },
  { key: 'fastest-win', label: '最快勝利', icon: Clock, unit: '分鐘' },
  { key: 'achievement-points', label: '成就點數', icon: Award, unit: '點' },
  { key: 'collection-completion', label: '收藏完成度', icon: Star, unit: '%' },
];

const SCOPES: Array<{ key: LeaderboardScope; label: string; icon: typeof Globe }> = [
  { key: 'global', label: '全球', icon: Globe },
  { key: 'regional', label: '區域', icon: MapPin },
  { key: 'friends', label: '好友', icon: Users },
];

function formatValue(item: LeaderboardItem, type: LeaderboardType): string {
  switch (type) {
    case 'elo':
      return item.elo.toFixed(0);
    case 'wins':
      return item.wins.toString();
    case 'season':
      return item.seasonWins.toString();
    case 'total-networth':
      return (item.totalAssets || 0).toLocaleString();
    case 'peak-networth':
      return (item.peakAssets || 0).toLocaleString();
    case 'fastest-win':
      return `${item.fastestWinMinutes?.toFixed(1) || '--'}`;
    case 'achievement-points':
      return (item.achievementPoints || 0).toLocaleString();
    case 'collection-completion':
      return `${item.collectionCompletion?.toFixed(1) || 0}`;
    default:
      return item.elo.toFixed(0);
  }
}

function getValueLabel(type: LeaderboardType): string {
  const tab = TABS.find((t) => t.key === type);
  return tab?.unit || '';
}

function getMedalColor(rank: number): string {
  if (rank === 1) return 'hsl(45, 100%, 55%)';
  if (rank === 2) return 'hsl(210, 10%, 75%)';
  if (rank === 3) return 'hsl(25, 80%, 55%)';
  return 'var(--text-secondary)';
}

function RankChangeArrow({ change, isNew }: { change: number; isNew: boolean }) {
  if (isNew) {
    return (
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded-sm blink-text"
        style={{
          color: 'var(--blue)',
          backgroundColor: 'rgba(0, 100, 255, 0.15)',
          border: '1px solid rgba(0, 100, 255, 0.4)',
          textShadow: '0 0 8px rgba(0, 100, 255, 0.8)',
        }}
      >
        NEW
      </span>
    );
  }
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: 'var(--green)' }}>
        <TrendingUp size={14} style={{ filter: 'drop-shadow(0 0 4px var(--green))' }} />
        {change}
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: 'var(--red)' }}>
        <TrendingDown size={14} style={{ filter: 'drop-shadow(0 0 4px var(--red))' }} />
        {Math.abs(change)}
      </span>
    );
  }
  return (
    <span className="flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
      <Minus size={14} />
    </span>
  );
}

function TopPodiumCard({
  item,
  type,
  position,
  onClick,
}: {
  item: LeaderboardItem;
  type: LeaderboardType;
  position: 1 | 2 | 3;
  onClick: () => void;
}) {
  const color = getMedalColor(position);
  const sizeClass = position === 1 ? 'md:scale-110 md:-translate-y-4' : '';
  const Icon = position === 1 ? Crown : Medal;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`cyber-card relative flex flex-col items-center p-4 md:p-6 transition-all hover:scale-105 cursor-pointer ${sizeClass}`}
      style={{
        borderColor: color,
        boxShadow: `0 0 20px color-mix(in srgb, ${color} 50%, transparent), inset 0 0 20px color-mix(in srgb, ${color} 10%, transparent)`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${color} 8%, transparent), var(--bg-card))`,
        minWidth: 0,
      }}
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 font-cyber text-sm font-bold rounded-sm"
        style={{
          color: color,
          backgroundColor: 'var(--bg-deep)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 10px ${color}`,
        }}
      >
        #{position}
      </div>

      <div
        className="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 mt-2"
        style={{
          border: `3px solid ${color}`,
          boxShadow: `0 0 15px ${color}, inset 0 0 10px color-mix(in srgb, ${color} 30%, transparent)`,
          background: `radial-gradient(circle, color-mix(in srgb, ${color} 20%, transparent), transparent)`,
        }}
      >
        <Icon size={position === 1 ? 32 : 24} style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
      </div>

      <div
        className="font-cyber text-sm md:text-base font-bold truncate w-full text-center"
        style={{ color: 'var(--text-primary)' }}
      >
        {item.nickname}
      </div>

      {item.guildName && (
        <div className="text-xs mt-0.5 truncate w-full text-center" style={{ color: 'var(--cyan)' }}>
          {item.guildName}
        </div>
      )}

      {item.tier && (
        <span
          className="text-xs px-2 py-0.5 mt-2 font-cyber tracking-wider rounded-sm"
          style={{
            color,
            border: `1px solid ${color}`,
            backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
          }}
        >
          {item.tier}
        </span>
      )}

      <div className="mt-3 text-center">
        <div
          className="font-cyber text-xl md:text-2xl font-bold"
          style={{ color, textShadow: `0 0 10px ${color}` }}
        >
          {formatValue(item, type)}
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">
          {getValueLabel(type)}
        </div>
      </div>

      <div className="mt-2">
        <RankChangeArrow change={item.rankChange} isNew={item.isNew} />
      </div>
    </button>
  );
}

function PlayerDetailModal({
  item,
  type,
  onClose,
}: {
  item: LeaderboardItem;
  type: LeaderboardType;
  onClose: () => void;
}) {
  const medalColor = item.rank <= 3 ? getMedalColor(item.rank) : 'var(--cyan)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="cyber-card p-6 max-w-md w-full relative"
        style={{
          borderColor: medalColor,
          boxShadow: `0 0 30px color-mix(in srgb, ${medalColor} 40%, transparent)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{
              border: `3px solid ${medalColor}`,
              boxShadow: `0 0 20px ${medalColor}`,
              background: `radial-gradient(circle, color-mix(in srgb, ${medalColor} 20%, transparent), transparent)`,
            }}
          >
            <Trophy size={36} style={{ color: medalColor, filter: `drop-shadow(0 0 8px ${medalColor})` }} />
          </div>

          <div className="font-cyber text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {item.nickname}
          </div>

          {item.guildName && (
            <div className="text-sm mt-1" style={{ color: 'var(--cyan)' }}>
              公會：{item.guildName}
            </div>
          )}

          {item.tier && (
            <span
              className="text-xs px-3 py-1 mt-2 font-cyber tracking-wider rounded-sm"
              style={{
                color: medalColor,
                border: `1px solid ${medalColor}`,
                backgroundColor: `color-mix(in srgb, ${medalColor} 10%, transparent)`,
              }}
            >
              段位：{item.tier}
            </span>
          )}

          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <div className="p-3 text-center rounded-sm" style={{ border: '1px solid var(--border-neon)' }}>
              <div className="text-xs text-[var(--text-muted)] mb-1">排名</div>
              <div className="font-cyber text-lg font-bold text-neon-cyan">#{item.rank}</div>
            </div>
            <div className="p-3 text-center rounded-sm" style={{ border: '1px solid var(--border-neon)' }}>
              <div className="text-xs text-[var(--text-muted)] mb-1">{TABS.find(t => t.key === type)?.label}</div>
              <div className="font-cyber text-lg font-bold text-neon-pink">{formatValue(item, type)}</div>
            </div>
            <div className="p-3 text-center rounded-sm" style={{ border: '1px solid var(--border-neon)' }}>
              <div className="text-xs text-[var(--text-muted)] mb-1">ELO</div>
              <div className="font-cyber text-lg font-bold" style={{ color: 'var(--yellow)' }}>{item.elo}</div>
            </div>
            <div className="p-3 text-center rounded-sm" style={{ border: '1px solid var(--border-neon)' }}>
              <div className="text-xs text-[var(--text-muted)] mb-1">勝/負</div>
              <div className="font-cyber text-lg font-bold">
                <span style={{ color: 'var(--green)' }}>{item.wins}</span>
                <span className="text-[var(--text-muted)] mx-1">/</span>
                <span style={{ color: 'var(--red)' }}>{item.losses}</span>
              </div>
            </div>
            <div className="p-3 text-center rounded-sm" style={{ border: '1px solid var(--border-neon)' }}>
              <div className="text-xs text-[var(--text-muted)] mb-1">勝率</div>
              <div className="font-cyber text-lg font-bold text-neon-cyan">{(item.winRate ?? 0).toFixed(1)}%</div>
            </div>
            <div className="p-3 text-center rounded-sm" style={{ border: '1px solid var(--border-neon)' }}>
              <div className="text-xs text-[var(--text-muted)] mb-1">賽季勝場</div>
              <div className="font-cyber text-lg font-bold text-neon-pink">{item.seasonWins}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RulesModal({
  type,
  rules,
  onClose,
}: {
  type: LeaderboardType;
  rules: ReturnType<typeof useLeaderboard>['rules'];
  onClose: () => void;
}) {
  const rule = rules.find((r) => r.type === type);
  if (!rule) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="cyber-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
        style={{
          borderColor: 'var(--cyan)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <X size={20} />
        </button>

        <h2 className="font-cyber text-xl text-neon-cyan tracking-wider mb-4">
          {rule.name} 規則說明
        </h2>

        <div className="space-y-4 text-sm">
          <div>
            <div className="font-cyber text-neon-pink mb-1 tracking-wider">計算規則</div>
            <p style={{ color: 'var(--text-secondary)' }}>{rule.calculationRule}</p>
          </div>

          <div>
            <div className="font-cyber text-neon-pink mb-1 tracking-wider">更新頻率</div>
            <p style={{ color: 'var(--text-secondary)' }}>{rule.updateFrequency}</p>
          </div>

          <div>
            <div className="font-cyber text-neon-pink mb-2 tracking-wider">排行獎勵</div>
            <ul className="space-y-1.5">
              {rule.rewards.map((reward, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-sm"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 255, 255, 0.1)',
                  }}
                >
                  <Trophy size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--yellow)' }} />
                  <span style={{ color: 'var(--text-primary)' }}>{reward}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonCountdownBar() {
  // 取得真實賽季結束時間與名稱（季度末）
  const { getSeasonInfo } = useLeaderboard();
  const seasonInfo = getSeasonInfo();
  const seasonName = seasonInfo.seasonName || '第7賽季：霓虹覺醒';
  const endsAt = useMemo(() => new Date(seasonInfo.endsAt).getTime(), [seasonInfo.endsAt]);

  const calcRemaining = () => {
    const diff = Math.max(0, endsAt - Date.now());
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((diff % (1000 * 60)) / 1000),
      ended: diff <= 0,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcRemaining());
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  return (
    <div
      className="cyber-card px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
      style={{ borderColor: 'rgba(255, 200, 0, 0.3)' }}
    >
      <div className="flex items-center gap-2">
        <Clock size={18} style={{ color: 'var(--yellow)' }} />
        <span className="font-cyber text-xs md:text-sm tracking-wider" style={{ color: 'var(--yellow)' }}>
          {seasonName} · {timeLeft.ended ? '本賽季已結束' : '結束倒數'}
        </span>
      </div>
      <div className="flex items-center gap-1 md:gap-2 font-mono">
        <TimeBlock value={timeLeft.d} label="天" color="var(--yellow)" />
        <span className="text-xl font-bold" style={{ color: 'var(--yellow)' }}>:</span>
        <TimeBlock value={timeLeft.h} label="時" color="var(--yellow)" />
        <span className="text-xl font-bold" style={{ color: 'var(--yellow)' }}>:</span>
        <TimeBlock value={timeLeft.m} label="分" color="var(--yellow)" />
        <span className="text-xl font-bold" style={{ color: 'var(--yellow)' }}>:</span>
        <TimeBlock value={timeLeft.s} label="秒" color="var(--yellow)" pulse />
      </div>
    </div>
  );
}

function TimeBlock({ value, label, color, pulse }: { value: number; label: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-cyber text-xl md:text-2xl font-bold min-w-[2ch] text-center ${pulse ? 'blink-text' : ''}`}
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] font-cyber" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { visitorId } = usePlayerIdentity();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('elo');
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [showRules, setShowRules] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardItem | null>(null);
  const { getItems, getMyRank, rules } = useLeaderboard();

  const listRef = useRef<HTMLDivElement>(null);
  const myRowRef = useRef<HTMLDivElement>(null);

  const items = useMemo<LeaderboardItem[]>(
    () => getItems(activeTab, scope),
    [activeTab, scope, getItems],
  );
  const myRank = useMemo<LeaderboardItem | null>(
    () => getMyRank(activeTab, scope),
    [activeTab, scope, getMyRank],
  );

  const top3 = items.slice(0, 3);
  const restItems = items.slice(3);

  const isMe = (item: LeaderboardItem): boolean => item.visitorId === visitorId;
  const showMyRankSeparately = myRank && !items.some((it: LeaderboardItem) => isMe(it));

  const scrollToMyRank = () => {
    if (myRowRef.current) {
      myRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getNextRankDiff = (): string => {
    if (!myRank || myRank.rank <= 1) return '--';
    const itemsList = getItems(activeTab, scope);
    const prev = itemsList.find((it: LeaderboardItem) => it.rank === (myRank.rank - 1));
    if (!prev) return '--';
    switch (activeTab) {
      case 'fastest-win':
        return `${((prev.fastestWinMinutes || 0) - (myRank.fastestWinMinutes || 0)).toFixed(1)} 分鐘`;
      case 'collection-completion':
        return `${((prev.collectionCompletion || 0) - (myRank.collectionCompletion || 0)).toFixed(1)}%`;
      case 'achievement-points':
        return `${(prev.achievementPoints || 0) - (myRank.achievementPoints || 0)} 點`;
      case 'total-networth':
      case 'peak-networth':
        return `${((prev.totalAssets || 0) - (myRank.totalAssets || 0)).toLocaleString()}`;
      default:
        return `${(prev.elo - myRank.elo).toFixed(0)} ELO`;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider flex-1">
          排行榜
        </h1>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="cyber-btn p-2"
          style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
          title="規則說明"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      <div className="max-w-3xl w-full mx-auto space-y-4">
        <SeasonCountdownBar />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 overflow-x-auto pb-1 flex-1 max-w-xl">
            {TABS.map((tab) => {
              const selected = activeTab === tab.key;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="cyber-btn flex-shrink-0 px-2 md:px-3 py-1.5 md:py-2 text-xs font-cyber tracking-wider transition-all flex items-center gap-1"
                  style={{
                    borderColor: selected ? 'var(--pink)' : 'rgba(0, 255, 255, 0.2)',
                    color: selected ? 'var(--pink)' : 'var(--text-secondary)',
                    background: selected ? 'rgba(255, 107, 157, 0.08)' : 'transparent',
                    boxShadow: selected ? '0 0 12px rgba(255, 107, 157, 0.3)' : 'none',
                  }}
                >
                  <IconComp size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {SCOPES.map((s) => {
              const selected = scope === s.key;
              const IconComp = s.icon;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setScope(s.key)}
                  className="cyber-btn px-2 md:px-3 py-1.5 text-xs font-cyber tracking-wider transition-all flex items-center gap-1"
                  style={{
                    borderColor: selected ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)',
                    color: selected ? 'var(--cyan)' : 'var(--text-secondary)',
                    background: selected ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                    boxShadow: selected ? '0 0 8px rgba(0, 255, 255, 0.3)' : 'none',
                  }}
                >
                  <IconComp size={12} />
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-2 items-end">
          {top3[1] && (
            <TopPodiumCard
              item={top3[1]}
              type={activeTab}
              position={2}
              onClick={() => setSelectedPlayer(top3[1])}
            />
          )}
          {top3[0] && (
            <TopPodiumCard
              item={top3[0]}
              type={activeTab}
              position={1}
              onClick={() => setSelectedPlayer(top3[0])}
            />
          )}
          {top3[2] && (
            <TopPodiumCard
              item={top3[2]}
              type={activeTab}
              position={3}
              onClick={() => setSelectedPlayer(top3[2])}
            />
          )}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto pb-32">
          {restItems.length === 0 && (
            <div className="cyber-card p-8 text-center text-[var(--text-secondary)]">
              <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--purple)' }} />
              <p className="font-cyber tracking-wider">暫無排行數據</p>
            </div>
          )}

          <div className="space-y-2">
            {restItems.map((item: LeaderboardItem) => {
              const medalColor = getMedalColor(item.rank);
              const mine = isMe(item);
              const inTop10 = item.rank <= 10;
              return (
                <div
                  key={item.visitorId}
                  ref={mine ? myRowRef : null}
                  className="cyber-card p-3 flex items-center gap-3 transition-all cursor-pointer"
                  style={{
                    borderColor: mine
                      ? 'var(--pink)'
                      : inTop10
                        ? 'rgba(0, 255, 255, 0.4)'
                        : 'color-mix(in srgb, var(--cyan) 15%, transparent)',
                    boxShadow: mine
                      ? '0 0 12px rgba(255, 107, 157, 0.3)'
                      : inTop10
                        ? '0 0 8px rgba(0, 255, 255, 0.2)'
                        : 'none',
                    background: mine
                      ? 'linear-gradient(135deg, rgba(255, 107, 157, 0.08), var(--bg-card))'
                      : inTop10
                        ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.04), var(--bg-card))'
                        : undefined,
                  }}
                  onClick={() => setSelectedPlayer(item)}
                >
                  <div
                    className="w-8 md:w-10 text-center font-cyber text-lg md:text-xl font-bold flex items-center justify-center"
                    style={{ color: inTop10 ? 'var(--cyan)' : medalColor }}
                  >
                    {item.rank}
                  </div>

                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: `2px solid ${mine ? 'var(--pink)' : inTop10 ? 'var(--cyan)' : 'var(--border-neon)'}`,
                      boxShadow: mine ? '0 0 8px var(--pink)' : 'none',
                    }}
                  >
                    <Trophy
                      size={18}
                      style={{ color: mine ? 'var(--pink)' : 'var(--text-secondary)' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-cyber text-sm md:text-base truncate"
                        style={{ color: mine ? 'var(--pink)' : 'var(--text-primary)' }}
                      >
                        {item.nickname || '匿名玩家'}
                        {mine && <span className="ml-1 text-xs opacity-70">(我)</span>}
                      </span>
                      {item.tier && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 font-cyber tracking-wider rounded-sm"
                          style={{
                            color: 'var(--cyan)',
                            border: '1px solid rgba(0, 255, 255, 0.4)',
                            backgroundColor: 'rgba(0, 255, 255, 0.06)',
                          }}
                        >
                          {item.tier}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2 truncate">
                      {item.guildName && (
                        <span style={{ color: 'var(--cyan)' }}>{item.guildName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4">
                    <RankChangeArrow change={item.rankChange} isNew={item.isNew} />
                    <div className="text-right">
                      <div
                        className="font-cyber text-base md:text-lg font-bold"
                        style={{
                          color: inTop10 ? 'var(--cyan)' : 'var(--text-primary)',
                          textShadow: inTop10 ? '0 0 6px rgba(0, 255, 255, 0.5)' : 'none',
                        }}
                      >
                        {formatValue(item, activeTab)}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {getValueLabel(activeTab)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showMyRankSeparately && myRank && (
        <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 z-20">
          <div className="max-w-3xl mx-auto">
            <div
              className="cyber-card p-3 md:p-4 flex items-center gap-3 cursor-pointer"
              style={{
                borderColor: 'var(--pink)',
                boxShadow: '0 0 15px rgba(255, 107, 157, 0.4), 0 -5px 20px rgba(0, 0, 0, 0.5)',
                background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.12), var(--bg-card))',
              }}
              onClick={scrollToMyRank}
            >
              <div className="w-10 md:w-12 text-center font-cyber text-xl md:text-2xl font-bold text-neon-pink">
                #{myRank.rank}
              </div>
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: '2px solid var(--pink)',
                  boxShadow: '0 0 8px var(--pink)',
                }}
              >
                <Trophy size={18} style={{ color: 'var(--pink)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-cyber text-base md:text-lg text-neon-pink truncate">
                  {myRank.nickname || '匿名玩家'}
                  <span className="ml-1 text-xs opacity-70">(我的排名)</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  距上一名：{getNextRankDiff()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-cyber text-lg md:text-xl font-bold text-neon-pink">
                  {formatValue(myRank, activeTab)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {getValueLabel(activeTab)}
                </div>
              </div>
              <ChevronDown size={20} className="text-neon-pink animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <RulesModal type={activeTab} rules={rules} onClose={() => setShowRules(false)} />
      )}

      {selectedPlayer && (
        <PlayerDetailModal
          item={selectedPlayer}
          type={activeTab}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

export default LeaderboardPage;
