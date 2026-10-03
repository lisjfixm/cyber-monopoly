import type { FC } from 'react';
import { useEffect } from 'react';
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
  Award,
  Palette,
  Shirt,
} from 'lucide-react';
import { ACHIEVEMENTS } from '@shared/game-config';
import type { AchievementId } from '@shared/api.interface';

interface AchievementToastProps {
  achievementId: AchievementId;
  onClose: () => void;
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
};

const AchievementToast: FC<AchievementToastProps> = ({ achievementId, onClose }) => {
  const achievement = ACHIEVEMENTS[achievementId];
  const IconComp = ACHIEVEMENT_ICON_MAP[achievementId] ?? Trophy;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-[100] achievement-toast-enter"
      style={{ maxWidth: '320px' }}
    >
      <div
        className="cyber-card p-4 flex items-center gap-3"
        style={{
          borderColor: 'hsl(45, 100%, 60%)',
          backgroundColor: 'hsla(240, 20%, 8%, 0.95)',
          boxShadow:
            '0 0 20px hsla(45, 100%, 60%, 0.5), 0 0 40px hsla(45, 100%, 60%, 0.2), inset 0 0 15px hsla(45, 100%, 60%, 0.1)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'hsla(45, 100%, 60%, 0.15)',
            border: '2px solid hsl(45, 100%, 60%)',
            boxShadow: '0 0 12px hsla(45, 100%, 60%, 0.6), inset 0 0 8px hsla(45, 100%, 60%, 0.3)',
          }}
        >
          <IconComp
            className="w-6 h-6"
            style={{
              color: 'hsl(45, 100%, 60%)',
              filter: 'drop-shadow(0 0 4px hsl(45, 100%, 60%))',
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-cyber tracking-wider mb-0.5"
            style={{
              color: 'hsl(45, 100%, 60%)',
              textShadow: '0 0 6px hsla(45, 100%, 60%, 0.6)',
            }}
          >
            獎盃 成就解锁！
          </div>
          <div
            className="font-cyber text-sm tracking-wider truncate"
            style={{
              color: 'hsl(45, 100%, 60%)',
              textShadow: '0 0 4px hsla(45, 100%, 60%, 0.4)',
            }}
          >
            {achievement.name}
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {achievement.description}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes achievement-slide-in {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .achievement-toast-enter {
          animation: achievement-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AchievementToast;
