import type { FC } from "react";
import { useEffect } from "react";
import { PROFESSIONS, PLAYER_COLOR_HEX } from "@shared/game-config";
import type { Profession, PlayerColor } from "@shared/api.interface";
import {
  Wrench,
  Landmark,
  TrendingUp,
  Building2,
  Cpu,
  Heart,
  Scale,
  Newspaper,
  Dices,
  Palette,
  FlaskConical,
  Compass,
  Sparkles,
  Check,
  X,
  Atom,
  Crown,
  ShoppingBag,
  Bot,
  Pickaxe,
  Bug,
  Zap,
  DatabaseZap,
  Eye,
  Clock,
  Swords,
} from "lucide-react";

interface ProfessionSelectModalProps {
  isOpen: boolean;
  playerName: string;
  playerColor: PlayerColor;
  selectedProfession?: Profession;
  onSelect: (profession: Profession) => void;
  onConfirm: () => void;
  onClose: () => void;
  disabled?: boolean;
}

const ICON_MAP: Record<Profession, FC<{ className?: string; style?: React.CSSProperties }>> = {
  engineer: Wrench,
  banker: Landmark,
  speculator: TrendingUp,
  tycoon: Building2,
  hacker: Cpu,
  doctor: Heart,
  lawyer: Scale,
  journalist: Newspaper,
  gambler: Dices,
  artist: Palette,
  scientist: FlaskConical,
  traveler: Compass,
  cyber_hacker: Bug,
  quantum_physicist: Atom,
  influencer: Crown,
  black_market_dealer: ShoppingBag,
  cyberborg: Bot,
  blockchain_miner: Pickaxe,
  cyber_daoist: Zap,
  data_priest: DatabaseZap,
  mechanical_alchemist: FlaskConical,
  shadow_broker: Eye,
  time_watcher: Clock,
  net_ninja: Swords,
};

const ProfessionSelectModal: FC<ProfessionSelectModalProps> = ({
  isOpen,
  playerName,
  playerColor,
  selectedProfession,
  onSelect,
  onConfirm,
  onClose,
  disabled,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const neonColor = PLAYER_COLOR_HEX[playerColor];
  const glowColor = `${neonColor}40`;

  const professions = Object.values(PROFESSIONS);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(10, 10, 25, 0.85)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl cyber-card rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          border: `1px solid ${neonColor}`,
          boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px rgba(0,255,255,0.05)`,
          animation: "float-up 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
        data-tutorial="professions"
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            職業選擇 / PROFESSION
          </div>
          <h2
            className="text-xl md:text-2xl font-cyber tracking-wider pr-8"
            style={{ color: neonColor, textShadow: `0 0 8px ${glowColor}` }}
          >
            選擇你的職業 — {playerName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 md:px-5 py-4 md:py-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {professions.map((prof) => {
              const Icon = ICON_MAP[prof.id];
              const isSelected = selectedProfession === prof.id;
              const profColor = prof.color;

              return (
                <button
                  key={prof.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(prof.id)}
                  className="relative p-3 md:p-4 rounded-lg text-left transition-all duration-300 group"
                  style={{
                    backgroundColor: "var(--bg-mid)",
                    border: `1px solid ${isSelected ? profColor : "rgba(255,255,255,0.1)"}`,
                    boxShadow: isSelected
                      ? `0 0 15px ${profColor}60, inset 0 0 15px ${profColor}20`
                      : "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: profColor,
                        boxShadow: `0 0 8px ${profColor}`,
                      }}
                    >
                      <Check className="w-3 h-3" style={{ color: "var(--bg-deep)" }} />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-3"
                    style={{
                      backgroundColor: `${profColor}15`,
                      border: `1px solid ${profColor}40`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5 md:w-6 md:h-6"
                      style={{ color: profColor }}
                    />
                  </div>

                  {/* Name */}
                  <div
                    className="font-cyber text-sm md:text-base tracking-wider mb-1"
                    style={{
                      color: profColor,
                      textShadow: `0 0 6px ${profColor}80`,
                    }}
                  >
                    {prof.name}
                  </div>

                  {/* Description */}
                  <div className="text-[10px] md:text-xs text-[var(--text-secondary)] mb-2 md:mb-3 leading-relaxed">
                    {prof.description}
                  </div>

                  {/* Skills */}
                  <div className="space-y-1">
                    {prof.skills.map((skill: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-[10px] md:text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Sparkles
                          className="w-3 h-3 flex-shrink-0 mt-0.5"
                          style={{ color: profColor }}
                        />
                        <span className="leading-relaxed">{skill}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover glow overlay */}
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: `inset 0 0 20px ${profColor}20`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-5 py-4 border-t flex-shrink-0 flex gap-3"
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          <button
            className="cyber-btn flex-1 py-3 text-base font-cyber tracking-wider"
            onClick={onClose}
            disabled={disabled}
          >
            返回
          </button>
          <button
            className="cyber-btn cyber-btn-pink flex-1 py-3 text-base font-cyber tracking-wider"
            onClick={onConfirm}
            disabled={!selectedProfession || disabled}
          >
            {selectedProfession ? "確認選擇" : "請選擇一個職業"}
          </button>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: neonColor }} />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: neonColor }} />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: neonColor }} />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: neonColor }} />
      </div>
    </div>
  );
};

export default ProfessionSelectModal;
