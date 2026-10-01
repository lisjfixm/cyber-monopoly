import { useState, useMemo, type FC, useEffect } from "react";
import { CELLS, PLAYER_COLOR_HEX } from "@shared/game-config";
import { getCellPrice } from "@shared/game-engine";
import type { GameState, PlayerState } from "@shared/api.interface";
import {
  X,
  ArrowRightLeft,
  DollarSign,
  Landmark,
  Handshake,
  User,
  Home as HomeIcon,
  ChevronRight,
  MapPin,
} from "lucide-react";

interface TradeModalProps {
  mode: "selectTarget" | "propose" | "respond";
  isOpen: boolean;
  gameState: GameState;
  playerIndex: number;
  targetPlayerIndex?: number;
  onClose: () => void;
  onSelectTarget?: (targetIndex: number) => void;
  onPropose?: (given: number[], received: number[], money: number) => void | Promise<void>;
  onAccept?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  isDarknetMode?: boolean;
  darknetFeeRate?: number;
}

const TradeModal: FC<TradeModalProps> = ({
  mode,
  isOpen,
  gameState,
  playerIndex,
  targetPlayerIndex,
  onClose,
  onSelectTarget,
  onPropose,
  onAccept,
  onReject,
  isDarknetMode = false,
  darknetFeeRate = 0,
}) => {
  const [givenSelected, setGivenSelected] = useState<number[]>([]);
  const [receivedSelected, setReceivedSelected] = useState<number[]>([]);
  const [moneyInput, setMoneyInput] = useState<string>("0");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setGivenSelected([]);
      setReceivedSelected([]);
      setMoneyInput("0");
      setIsProcessing(false);
    }
  }, [isOpen, mode, targetPlayerIndex]);

  const currentPlayer = gameState.players[playerIndex];
  const opponentIndex = targetPlayerIndex ?? (gameState.pendingTrade
    ? (gameState.pendingTrade.fromPlayer === playerIndex
        ? gameState.pendingTrade.toPlayer
        : gameState.pendingTrade.fromPlayer)
    : -1);
  const opponent = opponentIndex >= 0 ? gameState.players[opponentIndex] : null;

  const trade = gameState.pendingTrade;

  // Propose mode: current player is the proposer
  // Respond mode: current player is the receiver, trade.fromPlayer is proposer
  const proposerPlayer =
    mode === "propose" || mode === "selectTarget"
      ? currentPlayer
      : gameState.players[trade?.fromPlayer ?? 0];
  const receiverPlayer =
    mode === "propose" || mode === "selectTarget"
      ? opponent
      : gameState.players[trade?.toPlayer ?? 1];

  // Other alive players (for target selection)
  const otherAlivePlayers = useMemo(() => {
    return gameState.players
      .map((p: PlayerState, i: number) => ({ player: p, index: i }))
      .filter(({ player, index }) => index !== playerIndex && !player.isBankrupt);
  }, [gameState.players, playerIndex]);

  // List of properties current player owns (un-mortgaged, no buildings) - for "given"
  const myUnmortgagedProperties = useMemo(() => {
    return Object.entries(gameState.properties)
      .filter(
        ([, prop]) =>
          prop.owner === playerIndex && !prop.isMortgaged && prop.buildings === 0,
      )
      .map(([id]) => Number(id))
      .sort((a, b) => a - b);
  }, [gameState.properties, playerIndex]);

  // List of properties opponent owns - for "received"
  const opponentProperties = useMemo(() => {
    if (opponentIndex < 0) return [];
    return Object.entries(gameState.properties)
      .filter(([, prop]) => prop.owner === opponentIndex)
      .map(([id]) => Number(id))
      .sort((a, b) => a - b);
  }, [gameState.properties, opponentIndex]);

  if (!currentPlayer) return null;

  // Respond mode: display lists from trade
  const givenList =
    mode === "propose"
      ? givenSelected
      : trade?.givenProperties ?? [];
  const receivedList =
    mode === "propose"
      ? receivedSelected
      : trade?.receivedProperties ?? [];
  const moneyAmount =
    mode === "propose"
      ? Number(moneyInput) || 0
      : trade?.moneyAmount ?? 0;

  if (!isOpen) return null;

  const handleGivenToggle = (cellId: number) => {
    if (mode !== "propose") return;
    setGivenSelected((prev) =>
      prev.includes(cellId)
        ? prev.filter((id) => id !== cellId)
        : [...prev, cellId],
    );
  };

  const handleReceivedToggle = (cellId: number) => {
    if (mode !== "propose") return;
    setReceivedSelected((prev) =>
      prev.includes(cellId)
        ? prev.filter((id) => id !== cellId)
        : [...prev, cellId],
    );
  };

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode !== "propose") return;
    const val = e.target.value;
    if (val === "" || val === "-" || /^-?\d+$/.test(val)) {
      setMoneyInput(val);
    }
  };

  const handlePropose = () => {
    if (!onPropose || isProcessing) return;
    const money = Number(moneyInput) || 0;
    setIsProcessing(true);
    Promise.resolve(onPropose(givenSelected, receivedSelected, money))
      .then(() => {
        setGivenSelected([]);
        setReceivedSelected([]);
        setMoneyInput("0");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const canPropose =
    mode === "propose" &&
    (givenSelected.length > 0 || receivedSelected.length > 0 || moneyAmount !== 0) &&
    (moneyAmount <= 0 || currentPlayer.money >= moneyAmount);

  const getPlayerColor = (p: PlayerState): string => {
    return PLAYER_COLOR_HEX[p.color] ?? "var(--cyan)";
  };

  const renderPropertyItem = (cellId: number, selectable: boolean, selected: boolean, onToggle?: () => void) => {
    const cell = CELLS[cellId];
    const price = getCellPrice(cellId, gameState.mode);
    const prop = gameState.properties[cellId];
    const isMortgaged = prop?.isMortgaged;

    return (
      <div
        key={cellId}
        className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
          selectable ? "cursor-pointer hover:bg-white/5" : ""
        } ${selected ? "bg-cyan-500/10" : ""}`}
        style={{
          backgroundColor: selected ? "rgba(0, 255, 255, 0.08)" : undefined,
          border: selected ? "1px solid var(--cyan)" : "1px solid transparent",
        }}
        onClick={selectable && onToggle ? onToggle : undefined}
      >
        {selectable && (
          <div
            className="w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center"
            style={{
              borderColor: "var(--cyan)",
              backgroundColor: selected ? "var(--cyan)" : "transparent",
            }}
          >
            {selected && <span style={{ color: "var(--bg-deep)", fontSize: "10px" }}>確認</span>}
          </div>
        )}
        <div
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{
            backgroundColor: cell.color,
            boxShadow: `0 0 4px ${cell.color}`,
          }}
        />
        <span className="flex-1 text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {cell.name}
        </span>
        <span
          className="text-xs font-cyber flex-shrink-0"
          style={{ color: isMortgaged ? "var(--yellow)" : "var(--green)" }}
        >
          ¥{price.toLocaleString()}
        </span>
      </div>
    );
  };

  const renderPropertyList = (
    title: string,
    subtitle: string,
    cellIds: number[],
    selectable: boolean,
    selectedIds: number[],
    onToggle?: (id: number) => void,
    emptyText?: string,
  ) => (
    <div className="space-y-2">
      <div>
        <div className="text-[10px] font-cyber tracking-widest" style={{ color: "var(--text-secondary)" }}>
          {title}
        </div>
        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </div>
      </div>
      <div
        className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-lg"
        style={{ backgroundColor: "var(--bg-mid)", border: "1px solid var(--border-neon-cyan)" }}
      >
        {cellIds.length === 0 ? (
          <div className="text-center py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
            {emptyText ?? "暂无地块"}
          </div>
        ) : (
          cellIds.map((cellId) =>
            renderPropertyItem(
              cellId,
              selectable,
              selectedIds.includes(cellId),
              selectable && onToggle ? () => onToggle(cellId) : undefined,
            ),
          )
        )}
      </div>
    </div>
  );

  // ===== Target selection view =====
  if (mode === "selectTarget") {
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
            border: "1px solid var(--pink)",
            boxShadow:
              "0 0 30px color-mix(in srgb, var(--pink) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--pink) 5%, transparent)",
            animation: "float-up 0.3s ease-out",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="px-5 py-4 border-b"
             style={{ borderColor: "color-mix(in srgb, var(--pink) 30%, transparent)" }}
          >
            <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
              SELECT TARGET / 選擇交易對象
            </div>
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5" style={{ color: "var(--pink)" }} />
              <h2 className="text-xl md:text-2xl font-cyber tracking-wider" style={{ color: "var(--pink)" }}>
                選擇交易對象
              </h2>
            </div>
          </div>

          <div className="px-5 py-4 space-y-2">
            {otherAlivePlayers.length === 0 ? (
              <div className="text-center py-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                沒有可交易的玩家
              </div>
            ) : (
              otherAlivePlayers.map(({ player: p, index }) => {
                const colorHex = getPlayerColor(p);
                const propertyCount = Object.values(gameState.properties).filter(
                  (prop) => prop.owner === index,
                ).length;
                return (
                  <button
                    key={index}
                    onClick={() => onSelectTarget?.(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: "var(--bg-mid)",
                      border: `1px solid ${colorHex}40`,
                      boxShadow: `0 0 8px ${colorHex}20`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "var(--bg-deep)",
                        border: `2px solid ${colorHex}`,
                        boxShadow: `0 0 8px ${colorHex}60`,
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: colorHex }} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div
                        className="font-cyber text-sm tracking-wider truncate"
                        style={{ color: colorHex, textShadow: `0 0 6px ${colorHex}60` }}
                      >
                        {p.name}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" style={{ color: "var(--green)" }} />
                          ¥{p.money.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" style={{ color: "var(--cyan)" }} />
                          {propertyCount} 块
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
                  </button>
                );
              })
            )}
          </div>

          <div
            className="px-5 py-3 border-t"
             style={{ borderColor: "color-mix(in srgb, var(--pink) 30%, transparent)" }}
          >
            <button className="cyber-btn w-full text-sm" onClick={onClose}>
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  const titleText =
    mode === "propose" ? "发起交易" : "交易请求";
  const subtitleText =
    mode === "propose" ? "PROPOSE TRADE" : "INCOMING TRADE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(10, 10, 25, 0.85)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
    >
      <div
        className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          border: "1px solid var(--pink)",
          boxShadow:
            "0 0 30px color-mix(in srgb, var(--pink) 30%, transparent), inset 0 0 20px color-mix(in srgb, var(--pink) 5%, transparent)",
          animation: "float-up 0.3s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
          style={{ color: "var(--text-secondary)" }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div
          className="px-5 py-4 border-b"
             style={{ borderColor: "color-mix(in srgb, var(--pink) 30%, transparent)" }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            {subtitleText}
          </div>
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5" style={{ color: "var(--pink)" }} />
            <h2 className="text-xl md:text-2xl font-cyber tracking-wider" style={{ color: "var(--pink)" }}>
              {titleText}
            </h2>
          </div>
        </div>

        {/* Players info */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
              <div className="text-[10px] font-cyber tracking-widest" style={{ color: "var(--text-secondary)" }}>
                {mode === "propose" ? "发起方" : "对方"}
              </div>
              <div
                className="font-cyber text-sm truncate"
                style={{ color: proposerPlayer ? getPlayerColor(proposerPlayer) : "var(--cyan)" }}
              >
                {proposerPlayer?.name ?? "-"}
              </div>
            </div>
            <ArrowRightLeft className="w-5 h-5 flex-shrink-0" style={{ color: "var(--pink)" }} />
            <div className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: "var(--bg-mid)" }}>
              <div className="text-[10px] font-cyber tracking-widest" style={{ color: "var(--text-secondary)" }}>
                {mode === "propose" ? "接收方" : "你"}
              </div>
              <div
                className="font-cyber text-sm truncate"
                style={{ color: receiverPlayer ? getPlayerColor(receiverPlayer) : "var(--red)" }}
              >
                {receiverPlayer?.name ?? "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          {/* Given properties */}
          {mode === "propose"
            ? renderPropertyList(
                "我给出的地块",
                 "選擇你想交易給對方的地塊（未抵押空地）",
                myUnmortgagedProperties,
                true,
                givenSelected,
                handleGivenToggle,
                "你暂无可交易的地块",
              )
            : renderPropertyList(
                "对方给出的地块",
                "对方将这些地块交给你",
                givenList,
                false,
                givenList,
                undefined,
                "无",
              )}

          {/* Received properties */}
          {mode === "propose"
            ? renderPropertyList(
                "我想要的地块",
                 "選擇你想從對方獲得的地塊",
                opponentProperties,
                true,
                receivedSelected,
                handleReceivedToggle,
                "对方暂无地块",
              )
            : renderPropertyList(
                "对方请求的地块",
                "对方希望获得你这些地块",
                receivedList,
                false,
                receivedList,
                undefined,
                "无",
              )}

          {/* Money amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: "var(--green)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {mode === "propose" ? "金额（正=你出钱，负=你收钱）" : "交易金额"}
                </span>
              </div>
              <Landmark className="w-4 h-4" style={{ color: "var(--purple)" }} />
            </div>
            {mode === "propose" ? (
              <input
                type="text"
                inputMode="numeric"
                value={moneyInput}
                onChange={handleMoneyChange}
                className="cyber-input w-full text-right font-cyber"
                placeholder="0"
              />
            ) : (
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-mid)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {moneyAmount > 0
                    ? "对方给你"
                    : moneyAmount < 0
                      ? "你给对方"
                      : "无金钱交易"}
                </span>
                <span
                  className="font-cyber text-lg tracking-wider"
                  style={{
                    color: moneyAmount > 0
                      ? "var(--green)"
                      : moneyAmount < 0
                        ? "var(--red)"
                        : "var(--text-secondary)",
                    textShadow: moneyAmount !== 0
                      ? `0 0 8px ${moneyAmount > 0 ? "var(--green)" : "var(--red)"}`
                      : "none",
                  }}
                >
                  {moneyAmount > 0
                    ? `+¥${moneyAmount.toLocaleString()}`
                    : moneyAmount < 0
                      ? `-¥${Math.abs(moneyAmount).toLocaleString()}`
                      : "¥0"}
                </span>
              </div>
            )}
          </div>

          {/* 暗網模式中介抽成提示（僅發起方模式顯示） */}
          {isDarknetMode && mode === "propose" && moneyAmount !== 0 && (
            <div
              className="flex items-center justify-between p-3 rounded-lg mt-3"
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              <span className="text-sm" style={{ color: "var(--purple)" }}>
                暗網 中介抽成 {Math.round(darknetFeeRate * 100)}%
                {moneyAmount > 0 ? '：實付' : '：實收'}
              </span>
              <span
                className="font-cyber tracking-wider"
                style={{
                  color: moneyAmount > 0 ? "var(--red)" : "var(--green)",
                  textShadow: `0 0 6px ${moneyAmount > 0 ? 'rgba(255, 77, 109, 0.6)' : 'rgba(0, 255, 128, 0.6)'}`,
                }}
              >
                {moneyAmount > 0
                  ? `¥${Math.floor(moneyAmount * (1 + darknetFeeRate)).toLocaleString()}`
                  : `¥${Math.floor(Math.abs(moneyAmount) * (1 - darknetFeeRate)).toLocaleString()}`}
              </span>
            </div>
          )}

          {/* Affordability warning (propose mode) */}
          {mode === "propose" && moneyAmount > 0 && currentPlayer.money < moneyAmount && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                 backgroundColor: "color-mix(in srgb, var(--red) 10%, transparent)",
                border: "1px solid var(--red)",
              }}
            >
              <X className="w-4 h-4 flex-shrink-0" style={{ color: "var(--red)" }} />
              <span className="text-sm" style={{ color: "var(--red)" }}>
                现金不足，无法支付该金额
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-5 py-4 border-t flex gap-3"
             style={{ borderColor: "color-mix(in srgb, var(--pink) 30%, transparent)" }}
        >
          {mode === "propose" ? (
            <>
               <button
                 className="cyber-btn flex-1 text-sm"
                 onClick={onClose}
                 disabled={isProcessing}
               >
                 取消
               </button>
               <button
                 className="cyber-btn cyber-btn-pink flex-1 text-sm"
                 onClick={handlePropose}
                 disabled={!canPropose || isProcessing}
               >
                 发起交易
               </button>
            </>
          ) : (
            <>
               <button
                 className="cyber-btn flex-1 text-sm"
                 onClick={() => {
                   if (isProcessing) return;
                   setIsProcessing(true);
                   Promise.resolve(onReject?.()).finally(() => {
                     setIsProcessing(false);
                   });
                 }}
                 disabled={isProcessing}
                 style={{
                   borderColor: "var(--red)",
                   color: "var(--red)",
                    background: "color-mix(in srgb, var(--red) 5%, transparent)",
                 }}
               >
                 拒绝
               </button>
               <button
                 className="cyber-btn cyber-btn-pink flex-1 text-sm"
                 onClick={() => {
                   if (isProcessing) return;
                   setIsProcessing(true);
                   Promise.resolve(onAccept?.()).finally(() => {
                     setIsProcessing(false);
                   });
                 }}
                 disabled={isProcessing}
               >
                 接受
               </button>
            </>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--cyan)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--cyan)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--cyan)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--cyan)]" />
      </div>
    </div>
  );
};

export default TradeModal;
