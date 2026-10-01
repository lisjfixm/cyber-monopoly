import type { FC } from "react";
import { useEffect, useState } from "react";
import type { ChanceCard } from "@shared/api.interface";
import { Zap, X } from "lucide-react";

interface ChanceCardModalProps {
  isOpen: boolean;
  card: ChanceCard | null;
  onClose: () => void;
  onChoice?: (optionIndex: number) => void;
}

const ChanceCardModal: FC<ChanceCardModalProps> = ({
  isOpen,
  card,
  onClose,
  onChoice,
}) => {
  const [flipped, setFlipped] = useState(false);
  const isChoiceCard = card?.isChoice === true && card.choiceOptions && card.choiceOptions.length > 0;

  useEffect(() => {
    if (isOpen && card) {
      setFlipped(false);
      const flipTimer = setTimeout(() => setFlipped(true), 400);
      // 非選擇題延遲自動關閉，根據文案長度動態調整（最少 5 秒）
      if (!isChoiceCard) {
         const description = card.description || card.name || '';
        const baseTime = 5000;
        const extraTime = Math.max(0, description.length - 20) * 80;
        const closeDelay = Math.min(baseTime + extraTime, 12000);
        const closeTimer = setTimeout(() => onClose(), closeDelay);
        return () => {
          clearTimeout(flipTimer);
          clearTimeout(closeTimer);
        };
      }
      return () => clearTimeout(flipTimer);
    }
  }, [isOpen, card, onClose, isChoiceCard]);

  if (!isOpen || !card) return null;

  const isPositive = (() => {
    switch (card.effect.type) {
      case "money":
        return card.effect.amount >= 0;
      case "teleport_start":
      case "forward":
      case "steal_money":
      case "get_out_of_jail":
      case "forward_to_fate":
      case "lucky_star":
      case "forward_to_property":
      case "collect_from_all":
      case "chain_draw":
      case "buff":
      case "property_appreciate":
      case "choice":
        return true;
      case "go_to_detention":
      case "backward":
      case "give_money":
      case "repair_fee":
      case "backward_to_fate":
      case "pay_to_all":
        return false;
      case "random_teleport":
      default:
        return true;
    }
  })();
  const accentColor = isPositive ? "var(--cyan)" : "var(--pink)";

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
      {/* Card container with flip perspective */}
      <div
        className="relative w-72 md:w-80"
        style={{ perspective: "1000px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full transition-transform duration-500 max-h-[85vh] flex flex-col overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
            aspectRatio: "3 / 4",
          }}
        >
          {/* Card front (face side) */}
          <div
            className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-6 overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, rgba(30, 30, 120, 0.9), rgba(15, 15, 70, 0.95))",
              border: "2px solid var(--blue)",
              boxShadow:
                "0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(59, 130, 246, 0.1)",
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                border: "2px solid var(--blue)",
                boxShadow:
                  "0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.2)",
                background: "rgba(59, 130, 246, 0.1)",
              }}
            >
              <Zap
                className="w-8 h-8 md:w-10 md:h-10"
                style={{ color: "var(--blue)" }}
                strokeWidth={1.5}
              />
            </div>

            {/* Card label */}
            <div className="text-[10px] font-cyber text-[var(--blue)] tracking-[0.3em] mb-2">
              CHANCE CARD
            </div>

            {/* Card name */}
            <h2
              className="text-xl md:text-2xl font-cyber text-center tracking-wider mb-3"
              style={{
                color: "var(--blue)",
                textShadow:
                  "0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5)",
              }}
            >
              {card.name}
            </h2>

            {/* Tags */}
            <div className="flex gap-2 mb-3 flex-wrap justify-center">
              {card.isChain && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: "var(--yellow, #facc15)",
                    border: "1px solid var(--yellow, #facc15)",
                    background: "rgba(250, 204, 21, 0.1)",
                    animation: "pulse-glow 1s ease-in-out infinite",
                  }}
                >
                  閃電 連鎖
                </span>
              )}
              {card.duration !== undefined && card.duration > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: "var(--green)",
                    border: "1px solid var(--green)",
                    background: "rgba(34, 197, 94, 0.1)",
                  }}
                >
                  ⏱ 持續 {card.duration} 回合
                </span>
              )}
              {card.isChoice && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: "var(--cyan)",
                    border: "1px solid var(--cyan)",
                    background: "rgba(6, 182, 212, 0.1)",
                  }}
                >
                  未知 選擇題
                </span>
              )}
            </div>

            {/* Description */}
            <p
              className="text-sm md:text-base text-center"
              style={{
                color: accentColor,
                textShadow: `0 0 8px ${accentColor}80`,
              }}
            >
              {card.description}
            </p>

            {/* Choice buttons */}
            {isChoiceCard && card.choiceOptions && (
              <div className="mt-4 w-full space-y-2">
                {card.choiceOptions.map((opt: { label: string; effect: { type: string } }, idx: number) => (
                  <button
                    key={idx}
                    className="w-full py-2 px-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
                    style={{
                      color: "var(--blue)",
                      border: "1px solid var(--blue)",
                      background: "rgba(59, 130, 246, 0.15)",
                      boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)",
                    }}
                    onClick={() => onChoice?.(idx)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Decorative lines */}
            <div
              className="mt-4 w-full h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--blue), transparent)",
              }}
            />
            <div
              className="mt-1 w-2/3 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--blue), transparent)",
              }}
            />
          </div>

          {/* Card back */}
          <div
            className="absolute inset-0 rounded-xl flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "repeating-linear-gradient(45deg, rgba(59,130,246,0.3), rgba(59,130,246,0.3) 10px, rgba(15,15,70,0.95) 10px, rgba(15,15,70,0.95) 20px)",
              border: "2px solid var(--blue)",
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
            }}
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-cyber text-neon-blue mb-2">
                ?
              </div>
              <div className="text-xs font-cyber text-[var(--blue)] tracking-[0.3em]">
                CHANCE
              </div>
            </div>
          </div>
        </div>

        {/* Close hint */}
        {!isChoiceCard && (
          <div
            className="text-center mt-4 text-xs text-[var(--text-secondary)]"
            style={{
              animation: "pulse-glow 2s ease-in-out infinite",
              color: "var(--blue)",
            }}
          >
            点击任意处关闭
          </div>
        )}
        {isChoiceCard && (
          <div
            className="text-center mt-4 text-xs"
            style={{ color: "var(--blue)" }}
          >
            請選擇一個選項
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
        style={{
          border: "1px solid var(--blue)",
          color: "var(--blue)",
          background: "rgba(59, 130, 246, 0.1)",
        }}
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChanceCardModal;
