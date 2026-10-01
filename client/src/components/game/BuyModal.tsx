import type { FC } from "react";
import { DollarSign, AlertTriangle, Gavel, Landmark } from "lucide-react";
import { useState, useEffect } from 'react';

interface BuyModalProps {
  isOpen: boolean;
  cellName: string;
  price: number;
  playerMoney: number;
  canAfford: boolean;
  onBuy: () => void | Promise<void>;
  onAuction: () => void | Promise<void>;
  onSkip: () => void | Promise<void>;
  onReserve?: () => void | Promise<void>;
  enablePropertyFutures?: boolean;
}

const BuyModal: FC<BuyModalProps> = ({
  isOpen,
  cellName,
  price,
  playerMoney,
  canAfford,
  onBuy,
  onAuction,
  onSkip,
  onReserve,
  enablePropertyFutures = true,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const deposit = Math.floor(price * 0.1);

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onSkip]);

  const wrapAction = (fn: () => void | Promise<void>) => () => {
    if (isProcessing) return;
    setIsProcessing(true);
    Promise.resolve(fn()).finally(() => {
      setIsProcessing(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-deep) 85%, transparent)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
    >
      <div
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          border: "1px solid var(--cyan)",
          boxShadow:
            "0 0 30px color-mix(in srgb, var(--cyan) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--cyan) 5%, transparent)",
          animation: "float-up 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            購買確認 / PURCHASE
          </div>
          <h2 className="text-xl md:text-2xl font-cyber text-neon-cyan tracking-wider">
            {cellName}
          </h2>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          {/* Price */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[var(--green)]" />
              <span className="text-sm text-[var(--text-secondary)]">
                地块价格
              </span>
            </div>
            <span
              className="font-cyber text-xl tracking-wider text-neon-green"
            >
              ¥{price.toLocaleString()}
            </span>
          </div>

          {/* Player money */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <span className="text-sm text-[var(--text-secondary)]">
              当前现金
            </span>
            <span
              className="font-cyber text-xl tracking-wider"
              style={{
                color: canAfford ? "var(--cyan)" : "var(--red)",
                textShadow: canAfford
                  ? "0 0 8px var(--cyan)"
                  : "0 0 8px var(--red)",
              }}
            >
              ¥{playerMoney.toLocaleString()}
            </span>
          </div>

          {/* Cannot afford warning */}
          {!canAfford && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                 backgroundColor: "color-mix(in srgb, var(--red) 10%, transparent)",
                border: "1px solid var(--red)",
              }}
            >
              <AlertTriangle
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--red)" }}
              />
              <span className="text-sm" style={{ color: "var(--red)" }}>
                现金不足，无法購買此地块
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-5 py-4 border-t grid grid-cols-3 gap-2"
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          <button
            className="cyber-btn text-xs py-2.5"
            onClick={wrapAction(onBuy)}
            disabled={!canAfford || isProcessing}
            aria-label="購買地產"
          >
            購買
          </button>
          <button
            className="cyber-btn text-xs py-2.5"
            style={{
              borderColor: "var(--yellow)",
              color: "var(--yellow)",
               background: "color-mix(in srgb, var(--yellow) 5%, transparent)",
            }}
            onClick={wrapAction(onAuction)}
            disabled={isProcessing}
          >
            <Gavel className="w-3.5 h-3.5 inline mr-1" />
            拍賣
          </button>
          <button
            className="cyber-btn cyber-btn-pink text-xs py-2.5"
            onClick={wrapAction(onSkip)}
            disabled={isProcessing}
            aria-label="放棄購買"
          >
            放棄
          </button>
        </div>

        {enablePropertyFutures && onReserve && (
          <div
            className="px-5 py-3 border-t text-center"
            style={{ borderColor: "rgba(255, 215, 0, 0.3)" }}
          >
            <button
              className="cyber-btn text-xs px-6 py-2 w-full"
              style={{
                borderColor: "var(--yellow)",
                color: "var(--yellow)",
                boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
                background: "color-mix(in srgb, var(--yellow) 8%, transparent)",
              }}
              onClick={wrapAction(onReserve)}
              disabled={playerMoney < deposit || isProcessing}
            >
              <Landmark className="w-3.5 h-3.5 inline mr-1" />
              支付10%定金預定（¥{deposit.toLocaleString()}）
            </button>
            <div
              className="text-[10px] mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              下一回合須補齊餘額，否則定金沒收
            </div>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--pink)]" />
      </div>
    </div>
  );
};

export default BuyModal;
