import { useState, useEffect, type FC } from 'react';
import { X, Share2 } from 'lucide-react';
import {
  Trophy,
  Landmark,
  Building2,
  Hotel,
  Layers,
  Target,
  Lock,
  Sparkles,
  Handshake,
  Gavel,
  Coins,
  Crown,
  Award,
  GraduationCap,
  Package,
  Dices,
  Sun,
  Skull,
  Flame,
  Rocket,
  TrendingUp,
  Swords,
  Users,
  Star,
  Zap,
  Shield,
  Eye,
  ScrollText,
  Medal,
  Gem,
  Briefcase,
  Palette,
  Shirt,
  LineChart,
  ShoppingBag,
  Terminal,
  Stethoscope,
  Gift,
  Cpu,
  HeartPulse,
  Flag,
} from 'lucide-react';
import { ACHIEVEMENTS, ACHIEVEMENT_IDS } from '@shared/game-config';
import type { AchievementId } from '@shared/api.interface';
import ShareCardModal from './ShareCardModal';
import {
  generateAchievementCard,
  canvasToDataUrl,
} from '@client/src/utils/achievement-card';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedAchievements: Set<AchievementId>;
}

// 使用 Partial 容納引擎後續新增的成就（未知成就以 Trophy 兜底）
const ACHIEVEMENT_ICON_MAP: Partial<Record<AchievementId, typeof Trophy>> = {
  first_win: Trophy,
  property_tycoon: Landmark,
  building_magnate: Building2,
  hotel_king: Hotel,
  set_collector: Layers,
  stock_sniper: Target,
  jailbird: Lock,
  fate_favorite: Sparkles,
  trade_master: Handshake,
  auction_hunter: Gavel,
  rags_to_riches: Coins,
  perfect_victory: Crown,
  beginner: GraduationCap,
  item_collector: Package,
  gambler: Dices,
  chosen_one: Sun,
  battle_royale_champion: Skull,
  shrink_survivor: Flame,
  asset_millionaire: Coins,
  asset_100k: Crown,
  first_match: Swords,
  first_property: Landmark,
  first_building: Building2,
  first_card_draw: Sparkles,
  wealth_10k: Coins,
  wealth_50k: TrendingUp,
  wealth_100k_single: Crown,
  profit_per_match_10k: TrendingUp,
  win_streak_3: Flame,
  win_streak_5: Zap,
  win_streak_10: Star,
  win_streak_20: Crown,
  mode_classic_win: Trophy,
  mode_speed_win: Rocket,
  mode_crazy_win: Skull,
  mode_battle_royale_win: Swords,
  mode_all_master: Medal,
  profession_all_used: Briefcase,
  profession_each_win: Award,
  collect_all_cards: ScrollText,
  collect_all_items: Package,
  collect_all_themes: Palette,
  collect_all_skins: Shirt,
  friend_10: Users,
  create_guild: Shield,
  guild_quest_complete: Target,
  bankruptcy_comeback: Rocket,
  zero_property_win: Star,
  triple_double_jail: Lock,
  // v3.0 新增成就
  stock_frenzy_champion: LineChart,
  black_market_tycoon: ShoppingBag,
  twin_strike_veteran: Users,
  item_armory: Package,
  netrunner_legend: Terminal,
  medic_angel: Stethoscope,
  broker_pro: TrendingUp,
  airdrop_grateful: Gift,
  chip_mogul: Cpu,
  survival_master: HeartPulse,
  emperor_crowned: Crown,
  race_finisher: Flag,
};

const AchievementModal: FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  unlockedAchievements,
}) => {
  const { nickname } = usePlayerIdentity();
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareImageUrl, setShareImageUrl] = useState<string>('');
  const [shareTitle, setShareTitle] = useState<string>('');
  const [shareCanvas, setShareCanvas] = useState<HTMLCanvasElement | null>(null);

  // Esc 關閉 + 背景滾動鎖
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !shareModalOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose, shareModalOpen]);

  if (!isOpen) return null;

  const totalCount = ACHIEVEMENT_IDS.length || 1;
  const unlockedCount = unlockedAchievements.size;

  const handleShare = (id: AchievementId): void => {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return;
    try {
      const canvas = generateAchievementCard({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        unlockedAt: new Date().toISOString(),
        playerName: nickname || '匿名玩家',
      });
      const dataUrl = canvasToDataUrl(canvas);
      setShareImageUrl(dataUrl);
      setShareTitle(`${achievement.name} · 成就分享卡`);
      setShareCanvas(canvas);
      setShareModalOpen(true);
    } catch {
      // canvas 生成失敗，忽略
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="成就殿堂"
    >
      <div
        className="cyber-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          borderColor: 'hsl(45, 100%, 60%)',
          boxShadow: '0 0 30px hsla(45, 100%, 60%, 0.3), inset 0 0 20px hsla(45, 100%, 60%, 0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b" style={{ borderColor: 'hsla(45, 100%, 60%, 0.3)' }}>
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6" style={{ color: 'hsl(45, 100%, 60%)' }} />
            <h2
              className="font-cyber text-xl md:text-2xl tracking-wider"
              style={{
                color: 'hsl(45, 100%, 60%)',
                textShadow: '0 0 10px hsla(45, 100%, 60%, 0.8)',
              }}
            >
              成就殿堂
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 md:px-5 py-3 border-b" style={{ borderColor: 'hsla(45, 100%, 60%, 0.3)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              解锁进度
            </span>
            <span
              className="font-cyber text-base md:text-lg tracking-wider"
              style={{
                color: 'hsl(45, 100%, 60%)',
                textShadow: '0 0 6px hsla(45, 100%, 60%, 0.6)',
              }}
            >
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-mid)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(unlockedCount / totalCount) * 100}%`,
                backgroundColor: 'hsl(45, 100%, 60%)',
                boxShadow: '0 0 10px hsl(45, 100%, 60%)',
              }}
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {ACHIEVEMENT_IDS.map((id) => {
              const achievement = ACHIEVEMENTS[id];
              const isUnlocked = unlockedAchievements.has(id);
              const IconComp = ACHIEVEMENT_ICON_MAP[id] ?? Trophy;

              return (
                <div
                  key={id}
                  className="cyber-card p-3 md:p-4 flex flex-col items-center text-center transition-all duration-300"
                  style={{
                    borderColor: isUnlocked ? 'hsl(45, 100%, 60%)' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: isUnlocked
                      ? '0 0 15px hsla(45, 100%, 60%, 0.4), inset 0 0 10px hsla(45, 100%, 60%, 0.15)'
                      : 'none',
                    opacity: isUnlocked ? 1 : 0.5,
                    filter: isUnlocked ? 'none' : 'grayscale(70%)',
                  }}
                >
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2"
                    style={{
                      backgroundColor: isUnlocked ? 'hsla(45, 100%, 60%, 0.15)' : 'var(--bg-mid)',
                      border: `2px solid ${isUnlocked ? 'hsl(45, 100%, 60%)' : 'rgba(255,255,255,0.2)'}`,
                    }}
                  >
                    <IconComp
                      className="w-6 h-6 md:w-7 md:h-7"
                      style={{
                        color: isUnlocked ? 'hsl(45, 100%, 60%)' : 'var(--text-secondary)',
                        filter: isUnlocked ? 'drop-shadow(0 0 6px hsl(45, 100%, 60%))' : 'none',
                      }}
                    />
                  </div>
                  <div
                    className="font-cyber text-sm md:text-base tracking-wider mb-1"
                    style={{
                      color: isUnlocked ? 'hsl(45, 100%, 60%)' : 'var(--text-secondary)',
                      textShadow: isUnlocked ? '0 0 6px hsla(45, 100%, 60%, 0.6)' : 'none',
                    }}
                  >
                    {achievement.name}
                  </div>
                   <div className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                     {achievement.description}
                   </div>
                   {isUnlocked && (
                     <button
                       type="button"
                       onClick={(e): void => {
                         e.stopPropagation();
                         handleShare(id);
                       }}
                       className="cyber-btn px-3 py-1 text-xs font-cyber tracking-wider flex items-center gap-1 mx-auto mt-auto"
                       style={{
                         borderColor: 'rgba(255, 204, 0, 0.5)',
                         color: 'hsl(45, 100%, 70%)',
                       }}
                       aria-label={`分享成就 ${achievement.name}`}
                     >
                       <Share2 size={12} />
                       分享
                     </button>
                   )}
                 </div>
              );
            })}
          </div>
        </div>

        {/* Share Card Modal */}
        <ShareCardModal
          open={shareModalOpen}
          onClose={(): void => setShareModalOpen(false)}
          imageUrl={shareImageUrl}
          title={shareTitle}
          canvas={shareCanvas}
        />
      </div>
    </div>
  );
};

export default AchievementModal;
