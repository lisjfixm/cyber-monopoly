import { useState, type FC, useEffect } from "react";
import type { AuctionState, PlayerState } from "@shared/api.interface";
import { PLAYER_COLOR_HEX } from "@shared/game-config";
import {
  Gavel,
  DollarSign,
  AlertTriangle,
  Timer,
  Landmark,
  ArrowUp,
  Users,
  X,
  Check,
  Eye,
  Clock,
} from "lucide-react";

interface AuctionModalProps {
  isOpen: boolean;
  auction: AuctionState | null;
  cellName: string;
  cellPrice: number;
  players: PlayerState[];
  activeBidderIndex: number;
  myPlayerIndex: number;
  myMoney: number;
  onBid: (amount: number) => void;
  onPass: () => void;
  onSubmitBlindBid?: (amount: number) => void;
  blindBidSubmitted?: boolean;
  disabled?: boolean;
}

const AuctionModal: FC<AuctionModalProps> = ({
  isOpen,
  auction,
  cellName,
  cellPrice,
  players,
  activeBidderIndex,
  myPlayerIndex,
  myMoney,
  onBid,
  onPass,
  onSubmitBlindBid,
  blindBidSubmitted = false,
  disabled,
}) => {
  const [bidInput, setBidInput] = useState<string>("");
  const [blindInput, setBlindInput] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (auction && isOpen) {
      setBidInput(String(auction.minIncrement));
    }
  }, [auction?.minIncrement, isOpen]);

  // 暗拍倒計時
  useEffect(() => {
    if (!auction?.isBlind || !auction.blindDeadline || auction.revealed) {
      setCountdown(null);
      return;
    }
    const updateCountdown = () => {
      const deadline = new Date(auction.blindDeadline!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
      setCountdown(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [auction?.isBlind, auction?.blindDeadline, auction?.revealed, isOpen]);

  if (!isOpen || !auction) return null;

  const isBlindMode = auction.isBlind === true;
  const isRevealed = auction.revealed === true;

  // 暗拍：當前玩家是否已出價
  const myBlindBid = isBlindMode && auction.blindBids
    ? auction.blindBids[myPlayerIndex]
    : undefined;
  const hasSubmittedBlind = myBlindBid !== null && myBlindBid !== undefined;

  // 暗拍：已出價人數
  const submittedCount = isBlindMode && auction.blindBids
    ? Object.values(auction.blindBids).filter(
        (v: number | null | undefined) => v !== null && v !== undefined,
      ).length
    : 0;

  const isMyTurn = activeBidderIndex === myPlayerIndex;
  const canAct = isMyTurn && !disabled && auction.active;

  const bidAmount = Number(bidInput) || 0;
  const newTotal = auction.currentBid + bidAmount;
  const canAffordBid = myMoney >= newTotal;
  const isValidIncrement = bidAmount >= auction.minIncrement;
  const canBid = canAct && canAffordBid && isValidIncrement;

  const currentBidder = players[auction.currentBidder];
  const activePlayer = players[activeBidderIndex];

  const currentBidderColor = currentBidder
    ? PLAYER_COLOR_HEX[currentBidder.color]
    : "var(--yellow)";
  const currentBidderGlow = `${currentBidderColor}80`;

  const handleBidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setBidInput(val);
    }
  };

  const handleBid = () => {
    const amount = Number(bidInput) || 0;
    if (amount >= auction.minIncrement && myMoney >= auction.currentBid + amount) {
      onBid(amount);
    }
  };

  const handleQuickBid = (multiplier: number) => {
    const amount = auction.minIncrement * multiplier;
    if (myMoney >= auction.currentBid + amount) {
      onBid(amount);
    }
  };

  // 暗拍：找出最高出價者（揭曉後）
  const getBlindWinners = (): number[] => {
    if (!isBlindMode || !isRevealed || !auction.blindBids) return [];
    let highest = 0;
    let winners: number[] = [];
    for (const idx of auction.activeBidders) {
      const bid = auction.blindBids?.[idx] ?? 0;
      if (bid > highest) {
        highest = bid;
        winners = [idx];
      } else if (bid === highest && bid > 0) {
        winners.push(idx);
      }
    }
    return winners;
  };

  const blindWinners = getBlindWinners();
  const blindWinningBid = isBlindMode && isRevealed && auction.blindBids
    ? Math.max(
        ...Object.values(auction.blindBids).map(
          (v: number | null | undefined) => v ?? 0,
        ),
      )
    : 0;

  const handleBlindInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setBlindInput(val);
    }
  };

  const handleSubmitBlindBid = () => {
    const amount = Number(blindInput) || 0;
    if (amount >= auction.startingPrice && myMoney >= amount && onSubmitBlindBid) {
      onSubmitBlindBid(amount);
    }
  };

  // 计算已退出竞拍的玩家
  const allPlayerIndices = players.map((_p, i) => i);
  const activeBiddersSet = new Set(auction.activeBidders);

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
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden"
        style={{
          border: isBlindMode
            ? "1px solid var(--purple)"
            : "1px solid var(--yellow)",
          boxShadow: isBlindMode
            ? "0 0 30px color-mix(in srgb, var(--purple) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--purple) 5%, transparent)"
            : "0 0 30px color-mix(in srgb, var(--yellow) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--yellow) 5%, transparent)",
          animation: "float-up 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{
            borderColor: isBlindMode
              ? "color-mix(in srgb, var(--purple) 30%, transparent)"
              : "color-mix(in srgb, var(--yellow) 30%, transparent)",
          }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            {isBlindMode ? "暗拍 / BLIND AUCTION" : "地塊拍賣 / AUCTION"}
          </div>
          <div className="flex items-center gap-2">
            {isBlindMode ? (
              <Eye className="w-5 h-5" style={{ color: "var(--purple)" }} />
            ) : (
              <Gavel className="w-5 h-5" style={{ color: "var(--yellow)" }} />
            )}
            <h2
              className="text-xl md:text-2xl font-cyber tracking-wider"
              style={{ color: isBlindMode ? "var(--purple)" : "var(--yellow)" }}
            >
              {cellName}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 暗拍模式：出價介面（未揭曉） */}
          {isBlindMode && !isRevealed && <>
              {/* 暗拍說明 */}
              <div
                className="text-center p-4 rounded-lg"
                style={{ backgroundColor: "var(--bg-mid)" }}
              >
                <div
                  className="font-cyber text-lg md:text-xl tracking-wider pulse-glow"
                  style={{
                    color: "var(--purple)",
                    textShadow:
                      "0 0 10px color-mix(in srgb, var(--purple) 80%, transparent), 0 0 20px color-mix(in srgb, var(--purple) 50%, transparent)",
                  }}
                >
                  所有人同時出價，價高者得
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-2">
                  底價：¥{auction.startingPrice.toLocaleString()} · 最低出價：¥{auction.minIncrement.toLocaleString()}
                </div>
              </div>

              {/* 倒計時 */}
              {countdown !== null && countdown > 0 && (
                <div
                  className="flex items-center justify-center gap-2 p-3 rounded-lg"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--purple) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--purple) 30%, transparent)",
                  }}
                >
                  <Clock
                    className="w-4 h-4"
                    style={{ color: "var(--purple)" }}
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    剩餘時間
                  </span>
                  <span
                    className="font-cyber text-lg tracking-wider"
                    style={{
                      color: "var(--purple)",
                      textShadow: "0 0 6px color-mix(in srgb, var(--purple) 60%, transparent)",
                    }}
                  >
                    {countdown}s
                  </span>
                </div>
              )}

              {/* 參與者狀態 */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: "var(--purple)" }} />
                  <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                    參與者（{submittedCount}/{auction.activeBidders.length} 已出價）
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {auction.activeBidders.map((pIdx: number) => {
                    const p = players[pIdx];
                    if (!p) return null;
                    const hasBid = auction.blindBids?.[pIdx] !== null &&
                      auction.blindBids?.[pIdx] !== undefined;
                    const colorHex = PLAYER_COLOR_HEX[p.color];
                    return (
                      <div
                        key={pIdx}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all`}
                        style={{
                          backgroundColor: hasBid
                            ? `${colorHex}20`
                            : "color-mix(in srgb, var(--bg-deep) 30%, transparent)",
                          border: hasBid
                            ? `1px solid ${colorHex}`
                            : "1px solid transparent",
                          boxShadow: hasBid ? `0 0 6px ${colorHex}40` : "none",
                          opacity: hasBid ? 1 : 0.5,
                        }}
                      >
                        {hasBid ? (
                          <Check className="w-3 h-3" style={{ color: colorHex }} />
                        ) : (
                          <Timer className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                        )}
                        <span
                          className="font-cyber tracking-wide truncate max-w-[80px]"
                          style={{ color: hasBid ? colorHex : "var(--text-secondary)" }}
                        >
                          {p.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 我的現金 */}
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-mid)" }}
              >
                <div className="flex items-center gap-2">
                  <DollarSign
                    className="w-4 h-4"
                    style={{ color: "var(--green)" }}
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    我的現金
                  </span>
                </div>
                <span
                  className="font-cyber text-sm"
                  style={{ color: "var(--green)" }}
                >
                  ¥{myMoney.toLocaleString()}
                </span>
              </div>

              {/* 已提交狀態 */}
              {hasSubmittedBlind ? (
                <div
                  className="flex items-center justify-center gap-2 p-4 rounded-lg"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--green) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)",
                  }}
                >
                  <Check className="w-5 h-5" style={{ color: "var(--green)" }} />
                  <span style={{ color: "var(--green)" }}>
                    確認 已提交出價，等待揭曉
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[10px] font-cyber tracking-widest" style={{ color: "var(--text-secondary)" }}>
                    輸入你的出價金額
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={blindInput}
                      onChange={handleBlindInputChange}
                      className="cyber-input flex-1 text-right font-cyber"
                      placeholder={String(auction.startingPrice)}
                      disabled={disabled || !auction.active}
                    />
                    <button
                      className="cyber-btn px-4 text-sm"
                      style={{
                        borderColor: "var(--purple)",
                        color: "var(--purple)",
                        background: "rgba(168, 85, 247, 0.08)",
                      }}
                      onClick={handleSubmitBlindBid}
                      disabled={
                        disabled ||
                        !auction.active ||
                        Number(blindInput) < auction.startingPrice ||
                        Number(blindInput) > myMoney ||
                        !onSubmitBlindBid
                      }
                    >
                      提交出價
                    </button>
                  </div>
                  {/* 快捷出價 */}
                  <div className="flex gap-2">
                    {[0.5, 1, 1.5].map((mult) => {
                      const quickAmount = Math.round(auction.startingPrice * mult);
                      const canQuick = myMoney >= quickAmount;
                      return (
                        <button
                          key={mult}
                          className="flex-1 py-1.5 text-[10px] font-cyber rounded border transition-all"
                          style={{
                            borderColor: canQuick
                              ? "var(--purple)"
                              : "color-mix(in srgb, var(--text-primary) 10%, transparent)",
                            color: canQuick
                              ? "var(--purple)"
                              : "var(--text-secondary)",
                            backgroundColor: canQuick
                              ? "color-mix(in srgb, var(--purple) 5%, transparent)"
                              : "transparent",
                            cursor:
                              canQuick && !disabled ? "pointer" : "not-allowed",
                            opacity: canQuick ? 1 : 0.5,
                          }}
                          onClick={() => {
                            if (canQuick && !disabled) {
                              setBlindInput(String(quickAmount));
                            }
                          }}
                          disabled={!canQuick || disabled}
                        >
                          ¥{quickAmount.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 地塊原價參考 */}
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-mid)" }}
              >
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4" style={{ color: "var(--purple)" }} />
                  <span className="text-xs text-[var(--text-secondary)]">
                    地塊原價
                  </span>
                </div>
                <span className="font-cyber text-sm text-[var(--text-secondary)] line-through">
                  ¥{cellPrice.toLocaleString()}
                </span>
              </div>
            </>
          }

          {/* 明拍模式 / 暗拍揭曉後：顯示競拍結果 */}
          {(!isBlindMode || isRevealed) && (
            <>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
              当前最高价（{currentBidder?.name ?? "-"}）
            </div>
            <div
              className="font-cyber text-3xl md:text-4xl tracking-wider pulse-glow"
              style={{
                color: "var(--yellow)",
                textShadow:
                  "0 0 10px color-mix(in srgb, var(--yellow) 80%, transparent), 0 0 20px color-mix(in srgb, var(--yellow) 50%, transparent), 0 0 40px color-mix(in srgb, var(--yellow) 30%, transparent)",
              }}
            >
              ¥{auction.currentBid.toLocaleString()}
            </div>
          </div>

          {/* Bidders list */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: "var(--cyan)" }} />
              <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                竞拍者 ({auction.activeBidders.length}/{players.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allPlayerIndices.map((pIdx) => {
                const p = players[pIdx];
                if (!p) return null;
                const isActive = activeBiddersSet.has(pIdx);
                const isCurrentHighest = auction.currentBidder === pIdx;
                const isNowActing = activeBidderIndex === pIdx;
                const colorHex = PLAYER_COLOR_HEX[p.color];
                return (
                  <div
                    key={pIdx}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                      !isActive ? "grayscale opacity-40" : ""
                    }`}
                    style={{
                      backgroundColor: isNowActing ? `${colorHex}20` : "color-mix(in srgb, var(--bg-deep) 30%, transparent)",
                      border: isNowActing ? `1px solid ${colorHex}` : "1px solid transparent",
                      boxShadow: isNowActing ? `0 0 6px ${colorHex}40` : "none",
                    }}
                  >
                    {isActive ? (
                      <Check className="w-3 h-3" style={{ color: colorHex }} />
                    ) : (
                      <X className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                    )}
                    <span
                      className="font-cyber tracking-wide truncate max-w-[80px]"
                      style={{ color: isActive ? colorHex : "var(--text-secondary)" }}
                    >
                      {p.name}
                    </span>
                    {isCurrentHighest && (
                      <span
                        className="text-[9px] font-cyber px-1 rounded"
                        style={{
                          backgroundColor: "var(--yellow)",
                          color: "var(--bg-deep)",
                        }}
                      >
                        最高
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current bidder turn indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" style={{ color: PLAYER_COLOR_HEX[activePlayer?.color ?? "red"] }} />
              <span className="text-xs text-[var(--text-secondary)]">
                当前出价者
              </span>
            </div>
            <span
              className="font-cyber text-sm tracking-wider"
              style={{
                color: PLAYER_COLOR_HEX[activePlayer?.color ?? "red"],
                textShadow: `0 0 6px ${PLAYER_COLOR_HEX[activePlayer?.color ?? "red"]}80`,
              }}
            >
              {activePlayer?.name ?? "-"}
            </span>
          </div>

          {/* Starting price & min increment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--bg-mid)" }}>
              <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                起拍价
              </div>
              <div className="font-cyber text-sm" style={{ color: "var(--cyan)" }}>
                ¥{auction.startingPrice.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--bg-mid)" }}>
              <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                最低加价
              </div>
              <div className="font-cyber text-sm" style={{ color: "var(--green)" }}>
                ¥{auction.minIncrement.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Original price reference */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4" style={{ color: "var(--purple)" }} />
              <span className="text-xs text-[var(--text-secondary)]">
                地块原价
              </span>
            </div>
            <span className="font-cyber text-sm text-[var(--text-secondary)] line-through">
              ¥{cellPrice.toLocaleString()}
            </span>
          </div>

          {/* My money */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: "var(--green)" }} />
              <span className="text-xs text-[var(--text-secondary)]">
                我的现金
              </span>
            </div>
            <span
              className="font-cyber text-sm"
              style={{ color: canAffordBid ? "var(--green)" : "var(--red)" }}
            >
              ¥{myMoney.toLocaleString()}
            </span>
          </div>

          {/* Not my turn indicator */}
          {!isMyTurn && auction.active && (
            <div
              className="flex items-center justify-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: "color-mix(in srgb, var(--purple) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--purple) 30%, transparent)",
              }}
            >
              <Timer className="w-4 h-4" style={{ color: "var(--purple)" }} />
              <span className="text-sm" style={{ color: "var(--purple)" }}>
                等待 {activePlayer?.name ?? "对方"} 出价...
              </span>
            </div>
          )}

              {/* Warning: cannot afford */}
              {isMyTurn && bidAmount > 0 && !canAffordBid && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--red) 10%, transparent)",
                    border: "1px solid var(--red)",
                  }}
                >
                  <AlertTriangle
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--red)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--red)" }}>
                    现金不足，无法支付该出价
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions - 明拍模式才顯示 */}
        {!isBlindMode && (
        <div
          className="px-5 py-4 border-t space-y-3"
          style={{ borderColor: "color-mix(in srgb, var(--yellow) 30%, transparent)" }}
        >
          {/* Bid input */}
          {isMyTurn && auction.active && (
            <div className="space-y-2">
              <div className="text-[10px] font-cyber tracking-widest" style={{ color: "var(--text-secondary)" }}>
                加价金额
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={bidInput}
                  onChange={handleBidInputChange}
                  className="cyber-input flex-1 text-right font-cyber"
                  placeholder={String(auction.minIncrement)}
                  disabled={!canAct}
                />
                <button
                  className="cyber-btn cyber-btn-pink px-4 text-sm"
                  onClick={handleBid}
                  disabled={!canBid}
                >
                  <ArrowUp className="w-4 h-4 inline mr-1" />
                  出价
                </button>
              </div>
              {/* Quick bid buttons */}
              <div className="flex gap-2">
                {[1, 2, 5].map((mult) => {
                  const quickAmount = auction.minIncrement * mult;
                  const canQuick = myMoney >= auction.currentBid + quickAmount;
                  return (
                    <button
                      key={mult}
                      className="flex-1 py-1.5 text-[10px] font-cyber rounded border transition-all"
                      style={{
                        borderColor: canQuick ? "var(--cyan)" : "color-mix(in srgb, var(--text-primary) 10%, transparent)",
                        color: canQuick ? "var(--cyan)" : "var(--text-secondary)",
                        backgroundColor: canQuick ? "color-mix(in srgb, var(--cyan) 5%, transparent)" : "transparent",
                        cursor: canQuick && canAct ? "pointer" : "not-allowed",
                        opacity: canQuick ? 1 : 0.5,
                      }}
                      onClick={() => canQuick && canAct && handleQuickBid(mult)}
                      disabled={!canQuick || !canAct}
                    >
                      +¥{quickAmount.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pass button */}
          {!isBlindMode && isMyTurn && auction.active && (
            <button
              className="cyber-btn w-full text-sm"
              style={{
                borderColor: "var(--red)",
                color: "var(--red)",
                background: "color-mix(in srgb, var(--red) 5%, transparent)",
              }}
              onClick={onPass}
              disabled={!canAct}
            >
              放棄出價
            </button>
          )}
         </div>
         )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: "var(--cyan)" }} />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: "var(--cyan)" }} />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: "var(--cyan)" }} />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: "var(--cyan)" }} />
      </div>
    </div>
  );
};

export default AuctionModal;
