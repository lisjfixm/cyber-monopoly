import type { FC } from "react";
import { useState, useEffect } from "react";
import { Gavel, X, Clock, Users, Trophy, AlertTriangle, Coins } from "lucide-react";
import type {
  BlackMarketAuctionState,
  ItemType,
  ItemConfig,
} from "@shared/api.interface";

type ItemConfigMap = Record<string, ItemConfig>;

interface BlackMarketAuctionModalProps {
  isOpen: boolean;
  auction: BlackMarketAuctionState | null;
  myPlayerIndex: number;
  playerMoney: number;
  items: ItemConfigMap;
  onPlaceBid: (itemIndex: number, amount: number) => void;
  onFinalize: () => void;
  onClose: () => void;
}

const BlackMarketAuctionModal: FC<BlackMarketAuctionModalProps> = ({
  isOpen,
  auction,
  myPlayerIndex,
  playerMoney,
  items,
  onPlaceBid,
  onFinalize,
  onClose,
}) => {
  const [bidAmounts, setBidAmounts] = useState<Record<number, string>>({});
  const [biddingItem, setBiddingItem] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setBidAmounts({});
      setBiddingItem(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (auction) {
      setTimeLeft(auction.timeLeft);
    }
  }, [auction?.timeLeft]);

  useEffect(() => {
    if (!isOpen || !auction || auction.phase !== "bidding") return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, auction?.phase, auction?.timeLeft, timeLeft > 0]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !auction) return null;

  const isBiddingPhase = auction.phase === "bidding";
  const isRevealPhase = auction.phase === "reveal" || auction.phase === "finished";
  const isCountdownPhase = auction.phase === "countdown";

  const handleBidChange = (itemIndex: number, value: string) => {
    setBidAmounts((prev) => ({ ...prev, [itemIndex]: value }));
  };

  const handlePlaceBid = (itemIndex: number) => {
    if (isSubmitting || biddingItem !== null) return;
    const raw = bidAmounts[itemIndex];
    const amount = raw ? Number(raw) : 0;
    const item = auction.items[itemIndex];
    if (!item || isNaN(amount) || amount < item.startingPrice) return;
    if (amount > playerMoney) return;

    // 計算我方在所有拍品上已下注的總金額，避免重複出價超出現金
    let totalBids = 0;
    for (let i = 0; i < auction.items.length; i++) {
      const otherItem = auction.items[i];
      const bidVal = otherItem?.bids?.[myPlayerIndex];
      if (bidVal !== null && bidVal !== undefined) {
        totalBids += Number(bidVal);
      }
    }
    if (totalBids + amount > playerMoney) {
      return;
    }

    setBiddingItem(itemIndex);
    setIsSubmitting(true);
    const result = onPlaceBid(itemIndex, amount) as unknown;
    if (result && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
      (result as Promise<unknown>).then(() => {
        setBiddingItem(null);
        setIsSubmitting(false);
      }).catch(() => {
        setBiddingItem(null);
        setIsSubmitting(false);
      });
    } else {
      setBiddingItem(null);
      setIsSubmitting(false);
    }
  };

  const getBidderCount = (bids: Record<number, number | null>): number => {
    return Object.values(bids).filter((v) => v !== null).length;
  };

  const getTotalMyBids = (): number => {
    let total = 0;
    if (!auction) return 0;
    for (const item of auction.items) {
      const bidVal = item.bids[myPlayerIndex];
      if (bidVal !== null && bidVal !== undefined) {
        total += Number(bidVal);
      }
    }
    return total;
  };

  const hasMyBid = (bids: Record<number, number | null>): boolean => {
    return bids[myPlayerIndex] !== null && bids[myPlayerIndex] !== undefined;
  };

  const phaseLabel = {
    countdown: "倒數中",
    bidding: "暗拍進行中",
    reveal: "揭曉階段",
    finished: "拍賣結束",
  }[auction.phase];

  const phaseColor = isBiddingPhase
    ? "var(--purple)"
    : isRevealPhase
    ? "var(--green)"
    : "var(--yellow)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-deep) 90%, transparent)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes purple-glow {
          0%, 100% { box-shadow: 0 0 20px color-mix(in srgb, var(--purple) 30%, transparent); }
          50% { box-shadow: 0 0 35px color-mix(in srgb, var(--purple) 50%, transparent); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div
        className="relative w-full max-w-xl cyber-card rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          border: "1px solid var(--purple)",
          boxShadow:
            "0 0 30px color-mix(in srgb, var(--purple) 35%, transparent), inset 0 0 20px color-mix(in srgb, var(--purple) 8%, transparent)",
          animation: "float-up 0.3s ease-out, purple-glow 3s ease-in-out infinite",
        }}
      >
        {/* Close button */}
        {!isBiddingPhase && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Gavel className="w-5 h-5" style={{ color: "var(--purple)" }} />
            <span className="text-[10px] font-cyber tracking-widest" style={{ color: "var(--text-secondary)" }}>
              黑市拍賣 / BLACK MARKET
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h2
              className="text-xl md:text-2xl font-cyber tracking-wider"
              style={{ color: "var(--purple)", textShadow: "0 0 10px var(--purple)" }}
            >
              地下道具拍賣
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-cyber tracking-wider px-2 py-1 rounded"
                style={{
                  backgroundColor: `color-mix(in srgb, ${phaseColor} 15%, transparent)`,
                  border: `1px solid ${phaseColor}`,
                  color: phaseColor,
                }}
              >
                {phaseLabel}
              </span>
            </div>
          </div>

          {/* 倒計時 */}
          {isBiddingPhase && (
            <div
              className="mt-3 flex items-center justify-center gap-2 p-2 rounded"
              style={{
                backgroundColor: "color-mix(in srgb, var(--purple) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--purple) 30%, transparent)",
              }}
            >
              <Clock className="w-4 h-4" style={{ color: "var(--purple)", animation: "flicker 1s ease-in-out infinite" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                出價剩餘時間：
              </span>
              <span
                className="font-cyber text-lg tracking-wider"
                style={{
                  color: timeLeft <= 5 ? "var(--red)" : "var(--purple)",
                  textShadow: timeLeft <= 5
                    ? "0 0 8px var(--red)"
                    : "0 0 8px var(--purple)",
                  animation: timeLeft <= 5 ? "flicker 0.5s ease-in-out infinite" : "none",
                }}
              >
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* 玩家資訊 */}
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "color-mix(in srgb, var(--purple) 20%, transparent)" }}
        >
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4" style={{ color: "var(--green)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              持有現金
            </span>
          </div>
          <span
            className="font-cyber text-sm tracking-wider"
            style={{ color: "var(--green)", textShadow: "0 0 6px var(--green)" }}
          >
            ¥{playerMoney.toLocaleString()}
          </span>
        </div>

        {/* 道具列表 */}
        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          {auction.items.map((item, idx) => {
            const itemConfig = items[item.itemType];
            const itemName = itemConfig?.name ?? item.itemType;
            const itemDesc = itemConfig?.description ?? "";
            const bidderCount = getBidderCount(item.bids);
            const myBidPlaced = hasMyBid(item.bids);
            const isWinner = isRevealPhase && item.winner === myPlayerIndex;
            const rawBid = bidAmounts[idx] ?? "";
            const bidNum = rawBid ? Number(rawBid) : 0;
            const totalOtherBids = getTotalMyBids() - (hasMyBid(item.bids) ? Number(item.bids[myPlayerIndex] ?? 0) : 0);
            const totalWithThis = totalOtherBids + bidNum;
            const canAfford = totalWithThis <= playerMoney && bidNum <= playerMoney;
            const meetsMin = bidNum >= item.startingPrice;
            const canBid = isBiddingPhase && canAfford && meetsMin && !isSubmitting;

            return (
              <div
                key={idx}
                className="p-4 rounded-lg relative overflow-hidden"
                style={{
                  backgroundColor: isWinner
                    ? "color-mix(in srgb, var(--green) 12%, transparent)"
                    : "var(--bg-mid)",
                  border: isWinner
                    ? "1px solid var(--green)"
                    : `1px solid color-mix(in srgb, var(--purple) 30%, transparent)`,
                  boxShadow: isWinner
                    ? "0 0 15px color-mix(in srgb, var(--green) 30%, transparent)"
                    : "none",
                }}
              >
                {/* 中標標記 */}
                {isWinner && (
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-cyber tracking-wider"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--green) 20%, transparent)",
                      color: "var(--green)",
                      border: "1px solid var(--green)",
                    }}
                  >
                    <Trophy className="w-3 h-3" />
                    中標
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-cyber text-base tracking-wider"
                        style={{
                          color: "var(--purple)",
                          textShadow: "0 0 6px color-mix(in srgb, var(--purple) 50%, transparent)",
                        }}
                      >
                        拍品 #{idx + 1}
                      </span>
                      {myBidPlaced && isBiddingPhase && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--cyan) 15%, transparent)",
                            color: "var(--cyan)",
                            border: "1px solid var(--cyan)",
                          }}
                        >
                          已出價
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                      {itemName}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {itemDesc}
                    </div>
                  </div>
                </div>

                {/* 起拍價 / 出價人數 */}
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5" style={{ color: "var(--purple)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>起拍價</span>
                    <span
                      className="font-cyber"
                      style={{ color: "var(--purple)" }}
                    >
                      ¥{item.startingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" style={{ color: "var(--cyan)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      已有 <span style={{ color: "var(--cyan)" }}>{bidderCount}</span> 位玩家出價
                    </span>
                  </div>
                </div>

                {/* 暗拍階段：出價輸入 */}
                {isBiddingPhase && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={rawBid}
                        onChange={(e) => handleBidChange(idx, e.target.value)}
                        placeholder={`輸入金額（最低 ${item.startingPrice.toLocaleString()}）`}
                        className="w-full px-3 py-2 rounded text-sm outline-none"
                        style={{
                          backgroundColor: "var(--bg-deep)",
                          border: `1px solid ${meetsMin && canAfford ? "var(--purple)" : "color-mix(in srgb, var(--purple) 25%, transparent)"}`,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-cyber, monospace)",
                        }}
                        min={item.startingPrice}
                        disabled={isSubmitting && biddingItem === idx}
                        aria-label={`出價金額 ${itemName}`}
                      />
                      {!meetsMin && rawBid && (
                        <div className="absolute -bottom-4 left-0 text-[10px]" style={{ color: "var(--yellow)" }}>
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          金額低於起拍價
                        </div>
                      )}
                      {!canAfford && rawBid && meetsMin && (
                        <div className="absolute -bottom-4 left-0 text-[10px]" style={{ color: "var(--red)" }}>
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          現金不足
                        </div>
                      )}
                    </div>
                    <button
                      className="cyber-btn text-xs px-4 py-2 flex-shrink-0"
                      style={{
                        borderColor: "var(--purple)",
                        color: "var(--purple)",
                        background: "color-mix(in srgb, var(--purple) 10%, transparent)",
                        boxShadow: canBid ? "0 0 10px color-mix(in srgb, var(--purple) 30%, transparent)" : "none",
                      }}
                      onClick={() => handlePlaceBid(idx)}
                      disabled={!canBid}
                      aria-label={`出價 ${itemName}`}
                    >
                      {biddingItem === idx && isSubmitting ? "提交中..." : "出價"}
                    </button>
                  </div>
                )}

                {/* 揭曉階段：中標資訊 */}
                {isRevealPhase && item.winner !== undefined && item.winner !== null && (
                  <div
                    className="p-3 rounded"
                    style={{
                      backgroundColor: isWinner
                        ? "color-mix(in srgb, var(--green) 10%, transparent)"
                        : "color-mix(in srgb, var(--purple) 8%, transparent)",
                      border: `1px solid ${isWinner ? "var(--green)" : "color-mix(in srgb, var(--purple) 25%, transparent)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" style={{ color: isWinner ? "var(--green)" : "var(--purple)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          中標者：
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: isWinner ? "var(--green)" : "var(--text-primary)" }}
                        >
                          玩家 {item.winner + 1}
                          {isWinner && "（你）"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          成交價
                        </div>
                        <div
                          className="font-cyber text-sm tracking-wider"
                          style={{
                            color: isWinner ? "var(--green)" : "var(--purple)",
                            textShadow: isWinner ? "0 0 6px var(--green)" : "0 0 6px var(--purple)",
                          }}
                        >
                          ¥{item.finalPrice?.toLocaleString() ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isRevealPhase && (item.winner === undefined || item.winner === null) && (
                  <div
                    className="p-3 rounded text-center"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--text-secondary) 10%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent)",
                    }}
                  >
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      無人出價，拍品流標
                    </span>
                  </div>
                )}

                {isCountdownPhase && (
                  <div className="text-center py-2">
                    <span className="text-xs" style={{ color: "var(--yellow)" }}>
                      拍賣即將開始，請稍候...
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 border-t"
          style={{ borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)" }}
        >
          {isRevealPhase && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                點擊確認收取道具並關閉拍賣
              </p>
              <button
                className="cyber-btn text-sm px-6 py-2"
                style={{
                  borderColor: "var(--green)",
                  color: "var(--green)",
                  background: "color-mix(in srgb, var(--green) 10%, transparent)",
                  boxShadow: "0 0 10px color-mix(in srgb, var(--green) 30%, transparent)",
                }}
                onClick={onFinalize}
                aria-label="確認收取"
              >
                確認收取
              </button>
            </div>
          )}
          {isBiddingPhase && (
            <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              暗拍模式：僅顯示參與人數，不顯示具體出價金額
            </p>
          )}
          {isCountdownPhase && (
            <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              等待拍賣開始...
            </p>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--pink)]" />
      </div>
    </div>
  );
};

export default BlackMarketAuctionModal;
