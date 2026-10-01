import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Target,
  Briefcase,
  Package,
  Users,
  Sparkles,
  Star,
  Crown,
  Gem,
  Medal,
  Landmark,
  Building2,
  Hotel,
  Layers,
  TrendingUp,
  Lock,
  Handshake,
  Gavel,
  Coins,
  GraduationCap,
  Backpack,
  Dices,
  Sun,
  Skull,
  Swords,
  Home,
  Hammer,
  Wallet,
  Zap,
  Award,
  Palette,
  Shirt,
  Shield,
  Flag,
  RotateCcw,
  XCircle,
  Crosshair,
} from 'lucide-react';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { ACHIEVEMENTS, ACHIEVEMENT_IDS } from '@shared/game-config';
import type { AchievementCategory, AchievementRarity } from '@shared/api.interface';

const CATEGORIES: { id: AchievementCategory; label: string; icon: typeof Trophy }[] = [
  { id: 'beginner', label: '新手', icon: Star },
  { id: 'wealth', label: '財富', icon: Gem },
  { id: 'streak', label: '連勝', icon: Flame },
  { id: 'mode', label: '模式', icon: Target },
  { id: 'profession', label: '職業', icon: Briefcase },
  { id: 'collection', label: '收藏', icon: Package },
  { id: 'social', label: '社交', icon: Users },
  { id: 'special', label: '特殊', icon: Sparkles },
];

const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9ca3af',
  rare: '#22d3ee',
  epic: '#a855f7',
  legendary: '#facc15',
};

const AchievementPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const { isUnlocked, getProgress, getTotalPoints, unlocked } = useAchievements();

  const totalPoints = getTotalPoints();
  const totalAchievements = ACHIEVEMENT_IDS.length;
  const unlockedCount = unlocked.size;
  const overallPercent = totalAchievements > 0
    ? Math.floor((unlockedCount / totalAchievements) * 100)
    : 0;

  const filteredIds = useMemo(() => {
    if (activeCategory === 'all') return ACHIEVEMENT_IDS;
    return ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENTS[id]?.category === activeCategory);
  }, [activeCategory]);

  const categoryProgress = useMemo(() => {
    const result: Record<string, { unlocked: number; total: number }> = { all: { unlocked: unlockedCount, total: totalAchievements } };
    for (const cat of CATEGORIES) {
      const total = ACHIEVEMENT_IDS.filter((id) => ACHIEVEMENTS[id]?.category === cat.id).length;
      const unlockedNum = ACHIEVEMENT_IDS.filter(
        (id) => ACHIEVEMENTS[id]?.category === cat.id && unlocked.has(id),
      ).length;
      result[cat.id] = { unlocked: unlockedNum, total };
    }
    return result;
  }, [unlocked, unlockedCount, totalAchievements]);

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          成就殿堂
        </h1>
      </div>

      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* 顶部汇总 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(250, 204, 21, 0.3)',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.1)',
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(250,204,21,0.15), transparent 70%)',
                border: '2px solid rgba(250, 204, 21, 0.4)',
                boxShadow: '0 0 30px rgba(250, 204, 21, 0.2)',
              }}
            >
              <Crown size={36} style={{ color: '#facc15' }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-xs font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                總成就點數
              </div>
              <div
                className="font-cyber text-3xl md:text-4xl font-bold tracking-wider"
                style={{
                  color: '#facc15',
                  textShadow: '0 0 15px rgba(250, 204, 21, 0.6)',
                }}
              >
                {totalPoints}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                已解鎖 {unlockedCount} / {totalAchievements} 個成就 ({overallPercent}%)
              </div>
            </div>
          </div>
          <div className="mt-4 w-full h-2.5 rounded-full bg-bg-mid overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${overallPercent}%`,
                background: 'linear-gradient(90deg, #facc15, #ff6b9d, #a855f7)',
                boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
              }}
            />
          </div>
        </section>

        {/* 分类 Tab */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap"
            style={{
              borderColor: activeCategory === 'all' ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
              color: activeCategory === 'all' ? 'var(--cyan)' : 'var(--text-secondary)',
              backgroundColor: activeCategory === 'all' ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
              boxShadow: activeCategory === 'all' ? '0 0 10px rgba(0, 255, 255, 0.3)' : 'none',
            }}
          >
            <Trophy size={16} />
            全部
            <span className="text-xs opacity-70">
              {categoryProgress.all.unlocked}/{categoryProgress.all.total}
            </span>
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const p = categoryProgress[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap"
                style={{
                  borderColor: isActive ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                  boxShadow: isActive ? '0 0 10px rgba(0, 255, 255, 0.3)' : 'none',
                }}
              >
                <Icon size={16} />
                {cat.label}
                {p && (
                  <span className="text-xs opacity-70">
                    {p.unlocked}/{p.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 成就网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filteredIds.map((id) => {
            const ach = ACHIEVEMENTS[id];
            if (!ach) return null;
            const achUnlocked = isUnlocked(id);
            const currentProgress = getProgress(id);
            const target = ach.target ?? 1;
            const progressPercent = Math.min(100, Math.floor((currentProgress / target) * 100));
            const rarityColor = RARITY_COLORS[ach.rarity];

            const IconComponent = getAchievementIcon(ach.icon);

            return (
              <div
                key={id}
                className="cyber-card p-4 transition-all"
                style={{
                  borderColor: achUnlocked
                    ? `${rarityColor}55`
                    : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: achUnlocked
                    ? `0 0 15px ${rarityColor}33`
                    : 'none',
                  opacity: achUnlocked ? 1 : 0.7,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: achUnlocked ? `${rarityColor}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${achUnlocked ? `${rarityColor}55` : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {IconComponent ? (
                      <IconComponent
                        size={24}
                        style={{
                          color: achUnlocked ? rarityColor : 'var(--text-secondary)',
                          filter: achUnlocked ? `drop-shadow(0 0 6px ${rarityColor})` : 'none',
                        }}
                      />
                    ) : (
                      <Trophy size={24} style={{ color: achUnlocked ? rarityColor : 'var(--text-secondary)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="text-xs font-cyber tracking-wider px-1.5 py-0.5 rounded-sm"
                        style={{
                          color: rarityColor,
                          backgroundColor: `${rarityColor}15`,
                          border: `1px solid ${rarityColor}33`,
                        }}
                      >
                        {RARITY_LABELS[ach.rarity]}
                      </span>
                      <span
                        className="text-xs font-cyber tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        +{ach.points}點
                      </span>
                    </div>
                    <div
                      className="font-cyber text-sm font-bold truncate"
                      style={{
                        color: achUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {ach.name}
                    </div>
                    <div
                      className="text-xs mt-0.5 line-clamp-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {ach.description}
                    </div>
                  </div>
                </div>

                {/* 进度条 */}
                {ach.target && ach.target > 1 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>進度</span>
                      <span style={{ color: achUnlocked ? '#4ade80' : 'var(--text-secondary)' }}>
                        {Math.min(currentProgress, target)} / {target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-bg-mid overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: achUnlocked ? '#4ade80' : rarityColor,
                          boxShadow: achUnlocked
                            ? '0 0 6px rgba(74, 222, 128, 0.5)'
                            : `0 0 6px ${rarityColor}55`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {achUnlocked && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-cyber tracking-wider" style={{ color: '#4ade80' }}>
                    <Medal size={12} />
                    已解鎖
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredIds.length === 0 && (
          <div className="cyber-card p-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              此分類暫無成就
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getAchievementIcon(iconName: string) {
  const iconMap: Record<string, typeof Trophy> = {
    Trophy,
    Flame,
    Target,
    Briefcase,
    Package,
    Users,
    Sparkles,
    Star,
    Crown,
    Gem,
    Medal,
    Landmark,
    Building2,
    Hotel,
    Layers,
    TrendingUp,
    Lock,
    Handshake,
    Gavel,
    Coins,
    GraduationCap,
    Backpack,
    Dices,
    Sun,
    Skull,
    Swords,
    Home,
    Hammer,
    Wallet,
    Zap,
    Award,
    Palette,
    Shirt,
    Shield,
    Flag,
    RotateCcw,
    XCircle,
    Crosshair,
  };
  return iconMap[iconName] || Trophy;
}

export default AchievementPage;
