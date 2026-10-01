import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import type { DiceSkinType } from "@shared/api.interface";

interface DiceOverlayProps {
  isRolling: boolean;
  values: [number, number];
  onComplete?: () => void;
  skin?: DiceSkinType;
}

type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

const DiceOverlay: FC<DiceOverlayProps> = ({
  isRolling,
  values,
  onComplete,
  skin = 'default',
}) => {
  const [displayValues, setDisplayValues] = useState<[number, number]>([1, 1]);
  const [showResult, setShowResult] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredRef = useRef(false);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const randomFace = (): number => Math.floor(Math.random() * 6) + 1;

  // Rolling animation: each die cycles independently
  useEffect(() => {
    if (isRolling) {
      clearTimers();
      hasTriggeredRef.current = false;
      setShowResult(false);
      setVisible(true);
      intervalRef.current = setInterval(() => {
        setDisplayValues([randomFace(), randomFace()]);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Show final values with a glow burst, then auto-dismiss
      const bothValid = values[0] > 0 && values[1] > 0;
      if (bothValid && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setDisplayValues(values);
        setShowResult(true);
        setVisible(true);
        timerRef.current = setTimeout(() => {
          setShowResult(false);
          setVisible(false);
          onComplete?.();
        }, 1500);
      }
    }

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling, values[0], values[1]]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  if (!visible) return null;

  // Dice dot positions for values 1-6
  const dotPositions: Record<number, string[]> = {
    1: ["center"],
    2: ["top-left", "bottom-right"],
    3: ["top-left", "center", "bottom-right"],
    4: ["top-left", "top-right", "bottom-left", "bottom-right"],
    5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
    6: [
      "top-left",
      "top-right",
      "mid-left",
      "mid-right",
      "bottom-left",
      "bottom-right",
    ],
  };

  const getDotClass = (pos: string): string => {
    switch (pos) {
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "top-left":
        return "top-[20%] left-[20%]";
      case "top-right":
        return "top-[20%] right-[20%]";
      case "bottom-left":
        return "bottom-[20%] left-[20%]";
      case "bottom-right":
        return "bottom-[20%] right-[20%]";
      case "mid-left":
        return "top-1/2 left-[20%] -translate-y-1/2";
      case "mid-right":
        return "top-1/2 right-[20%] -translate-y-1/2";
      default:
        return "";
    }
  };

  const renderDice = (val: number, key: string, delayMs: number) => (
    <div
      key={key}
      className="relative"
      style={{
        perspective: '400px',
        transformStyle: 'preserve-3d',
        transform: showResult ? "scale(1.2)" : "scale(1)",
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        className={`dice-face dice-skin-${skin} ${showResult ? 'dice-result' : ''} relative w-24 h-24 md:w-32 md:h-32 rounded-lg`}
        style={{
          transformStyle: 'preserve-3d',
          animation: isRolling
            ? `dice-roll 0.6s linear infinite`
            : showResult
            ? 'dice-land 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            : undefined,
          animationDelay: isRolling ? `${delayMs}ms` : undefined,
          boxShadow: isRolling
            ? '0 0 15px var(--cyan), 0 0 30px var(--cyan), inset 0 0 10px var(--cyan)'
            : showResult
            ? '0 0 20px var(--pink), 0 0 40px var(--pink), inset 0 0 15px var(--pink)'
            : undefined,
          transition: 'box-shadow 0.3s ease-out',
        }}
      >
        {/* Dots */}
        {dotPositions[val]?.map((pos: string) => (
          <div
            key={pos}
            className={`dice-dot absolute w-4 h-4 md:w-5 md:h-5 rounded-full ${getDotClass(pos)}`}
          />
        ))}
      </div>
    </div>
  );

  const total = values[0] + values[1];

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{
         backgroundColor: "color-mix(in srgb, var(--bg-deep) 85%, transparent)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
    >
      {/* Neon border frame */}
      <div
        className="relative w-64 h-48 md:w-96 md:h-64 rounded-xl flex items-center justify-center"
        style={{
          border: "2px solid var(--cyan)",
          boxShadow:
             "0 0 20px var(--cyan), 0 0 40px color-mix(in srgb, var(--cyan) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--cyan) 10%, transparent)",
        }}
      >
        {/* Two dice side by side */}
        <div className="flex items-center gap-2.5 md:gap-5">
           {renderDice(displayValues[0], "dice-1", 0)}
           {renderDice(displayValues[1], "dice-2", 120)}
         </div>

        {/* Result label */}
        {showResult && (
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-cyber text-lg md:text-2xl text-neon-cyan tracking-widest whitespace-nowrap"
            style={{ animation: "float-up 0.3s ease-out" }}
          >
            {values[0]} + {values[1]} = {total} 点
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--pink)]" />
      </div>

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
             "repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, var(--cyan) 3%, transparent) 2px, color-mix(in srgb, var(--cyan) 3%, transparent) 4px)",
        }}
      />
    </div>
  );
};

export default DiceOverlay;
