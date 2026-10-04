import type { FC } from 'react';
import { useEffect } from 'react';
import {
  TrendingDown,
  Zap,
  PartyPopper,
  Skull,
  Building2,
  Battery,
  Gift,
  RefreshCw,
  Rocket,
  Bot,
  AlertTriangle,
  TrendingUp,
  Landmark,
  Atom,
  Power,
  CircleDollarSign,
  Megaphone,
  BadgePercent,
  ShieldAlert,
  Satellite,
  CloudLightning,
  Cpu,
  HandCoins,
} from 'lucide-react';
import { GLOBAL_EVENTS } from '@shared/game-config';
import type { GlobalEventType } from '@shared/api.interface';

interface GlobalEventModalProps {
  isOpen: boolean;
  eventType: GlobalEventType | null;
  onClose: () => void;
}

// 使用 Partial 容納引擎後續新增的事件類型（未知事件以 AlertTriangle 兜底）
const EVENT_ICON_MAP: Partial<Record<GlobalEventType, typeof AlertTriangle>> = {
  economic_crisis: TrendingDown,
  tech_boom: Zap,
  neon_festival: PartyPopper,
  hacker_attack: Skull,
  real_estate_bubble: Building2,
  energy_shortage: Battery,
  data_dividend: Gift,
  urban_reconstruction: RefreshCw,
  space_immigration: Rocket,
  ai_rebellion: Bot,
  investment_hint: TrendingUp,
  bank_crisis: Landmark,
  quantum_storm: Atom,
  stock_circuit_breaker: Power,
  foreign_inflow: CircleDollarSign,
  ad_storm: Megaphone,
  subsidy_carnival: BadgePercent,
  black_market_crackdown: ShieldAlert,
  // v3.0 新增全局事件
  satellite_airdrop: Satellite,
  data_thunder: CloudLightning,
  chip_boom: Cpu,
  mega_subsidy: HandCoins,
};

const GlobalEventModal: FC<GlobalEventModalProps> = ({ isOpen, eventType, onClose }) => {
  // Esc 關閉 + 背景滾動鎖
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !eventType) return null;

  const event = GLOBAL_EVENTS[eventType];
  const EventIcon = EVENT_ICON_MAP[eventType] ?? AlertTriangle;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={event?.name ?? '全球事件'}
    >
      <div
        className="cyber-card w-full max-w-md p-6 md:p-8 text-center relative overflow-hidden global-event-glow max-h-[85vh] flex flex-col overflow-y-auto"
        style={{
          borderColor: 'hsl(0, 100%, 60%)',
          boxShadow:
            '0 0 30px hsla(0, 100%, 60%, 0.5), 0 0 60px hsla(0, 100%, 60%, 0.3), inset 0 0 30px hsla(0, 100%, 60%, 0.1)',
          animation: 'event-pulse 1.5s ease-in-out infinite',
        }}
      >
        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.03) 2px, rgba(255, 0, 0, 0.03) 4px)',
          }}
        />

        {/* Alert badge */}
        <div
          className="inline-block px-3 py-1 mb-4 rounded font-cyber text-xs tracking-[0.3em]"
          style={{
            color: 'hsl(0, 100%, 60%)',
            border: '1px solid hsl(0, 100%, 60%)',
            backgroundColor: 'hsla(0, 100%, 60%, 0.1)',
            textShadow: '0 0 8px hsl(0, 100%, 60%)',
          }}
        >
          注意 全球事件 注意
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4 flex-shrink-0">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
            style={{
              border: '2px solid hsl(0, 100%, 60%)',
              boxShadow:
                '0 0 20px hsla(0, 100%, 60%, 0.6), inset 0 0 20px hsla(0, 100%, 60%, 0.3)',
              animation: 'icon-pulse 1s ease-in-out infinite',
            }}
          >
            <EventIcon
              className="w-10 h-10 md:w-12 md:h-12"
              style={{
                color: 'hsl(0, 100%, 60%)',
                filter: 'drop-shadow(0 0 8px hsl(0, 100%, 60%))',
              }}
            />
          </div>
        </div>

        {/* Event name */}
        <h2
          className="font-cyber text-2xl md:text-3xl tracking-wider mb-3"
          style={{
            color: 'hsl(0, 100%, 60%)',
            textShadow: '0 0 10px hsl(0, 100%, 60%), 0 0 20px hsl(0, 100%, 60%), 0 0 40px hsl(0, 100%, 60%)',
          }}
        >
          {event?.name ?? eventType}
        </h2>

        {/* Description */}
        <p
          className="text-sm md:text-base mb-6 leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {event?.description ?? '未知事件，請稍後再試。'}
        </p>

        {/* Confirm button */}
        <button
          type="button"
          onClick={onClose}
          className="cyber-btn w-full py-3 font-cyber tracking-wider min-h-[44px] mt-auto"
          style={{
            borderColor: 'hsl(0, 100%, 60%)',
            color: 'hsl(0, 100%, 60%)',
            backgroundColor: 'hsla(0, 100%, 60%, 0.1)',
            boxShadow: '0 0 15px hsla(0, 100%, 60%, 0.4)',
          }}
        >
          確認
        </button>
      </div>

      <style>{`
        @keyframes event-pulse {
          0%, 100% {
            box-shadow:
              0 0 30px hsla(0, 100%, 60%, 0.5),
              0 0 60px hsla(0, 100%, 60%, 0.3),
              inset 0 0 30px hsla(0, 100%, 60%, 0.1);
          }
          50% {
            box-shadow:
              0 0 50px hsla(0, 100%, 60%, 0.7),
              0 0 100px hsla(0, 100%, 60%, 0.4),
              inset 0 0 40px hsla(0, 100%, 60%, 0.15);
          }
        }
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .global-event-glow, .global-event-glow * {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalEventModal;
