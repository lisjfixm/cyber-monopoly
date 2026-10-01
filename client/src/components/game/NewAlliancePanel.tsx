import type { FC } from "react";
import { useState } from "react";
import { Handshake, Swords, X, Check, UserX, AlertTriangle } from "lucide-react";
import type { PlayerState, AllianceState, PlayerColor } from "@shared/api.interface";

interface NewAlliancePanelProps {
  players: PlayerState[];
  myPlayerIndex: number;
  alliances: AllianceState[];
  pendingInvites: Record<number, number> | undefined;
  onSendInvite: (toPlayer: number) => void;
  onAcceptInvite: () => void;
  onRejectInvite: () => void;
  onBreakAlliance: () => void;
}

const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  red: "hsl(0, 100%, 60%)",
  blue: "hsl(210, 100%, 60%)",
  green: "hsl(140, 100%, 50%)",
  yellow: "hsl(45, 100%, 60%)",
  purple: "hsl(270, 80%, 60%)",
  orange: "hsl(25, 100%, 60%)",
};

const NewAlliancePanel: FC<NewAlliancePanelProps> = ({
  players,
  myPlayerIndex,
  alliances,
  pendingInvites,
  onSendInvite,
  onAcceptInvite,
  onRejectInvite,
  onBreakAlliance,
}) => {
  const [breakConfirm, setBreakConfirm] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<number | null>(null);

  const me = players[myPlayerIndex];
  if (!me) return null;

  // 找到我的盟友
  const myAllyIndex = alliances
    .find((a) => a.members.includes(myPlayerIndex) && !a.breaker)
    ?.members.find((m) => m !== myPlayerIndex);

  // 我收到的邀請（from → me）
  const incomingFrom =
    pendingInvites && pendingInvites[myPlayerIndex] !== undefined
      ? pendingInvites[myPlayerIndex]
      : null;

  // 我發出的邀請集合（我 → to）
  const sentInvites = new Set<number>();
  if (pendingInvites) {
    for (const [toStr, fromVal] of Object.entries(pendingInvites)) {
      if (fromVal === myPlayerIndex) {
        sentInvites.add(Number(toStr));
      }
    }
  }

  const otherPlayers = players.filter(
    (p) => p.playerIndex !== myPlayerIndex && !p.isBankrupt,
  );

  if (otherPlayers.length === 0) return null;

  const myColor = PLAYER_COLOR_HEX[me.color] ?? "var(--cyan)";

  const handleBreakConfirm = () => {
    setBreakConfirm(false);
    onBreakAlliance();
  };

  const handleSendInvite = (target: number) => {
    setInviteTarget(null);
    onSendInvite(target);
  };

  const getPlayerColor = (p: PlayerState): string =>
    PLAYER_COLOR_HEX[p.color] ?? "var(--text-secondary)";

  return (
    <div className="cyber-card p-3 md:p-4">
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes alliance-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <div className="flex items-center gap-2 mb-3">
        <Handshake className="w-4 h-4" style={{ color: "var(--green)" }} />
        <span
          className="font-cyber text-sm tracking-wider"
          style={{ color: "var(--green)", textShadow: "0 0 6px var(--green)" }}
        >
          結盟系統
        </span>
      </div>

      {/* 收到的邀請 */}
      {incomingFrom !== null && (
        <div
          className="mb-3 p-3 rounded-lg"
          style={{
            background: "color-mix(in srgb, var(--cyan) 8%, transparent)",
            border: "1px solid var(--cyan)",
            boxShadow: "0 0 12px color-mix(in srgb, var(--cyan) 25%, transparent)",
            animation: "neon-pulse 2s ease-in-out infinite",
          }}
        >
          <div className="text-[10px] font-cyber tracking-widest mb-2" style={{ color: "var(--cyan)" }}>
            新的結盟邀請
          </div>
          {(() => {
            const fromPlayer = players[incomingFrom];
            if (!fromPlayer) return null;
            const fromColor = getPlayerColor(fromPlayer);
            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: `${fromColor}33`,
                      border: `1px solid ${fromColor}`,
                      color: fromColor,
                      boxShadow: `0 0 6px ${fromColor}66`,
                    }}
                  >
                    P{fromPlayer.playerNumber}
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {fromPlayer.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    向你發起結盟
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="cyber-btn text-xs py-2"
                    style={{
                      borderColor: "var(--green)",
                      color: "var(--green)",
                      background: "color-mix(in srgb, var(--green) 8%, transparent)",
                    }}
                    onClick={onAcceptInvite}
                    aria-label="接受邀請"
                  >
                    <Check className="w-3 h-3 inline mr-1" />
                    接受
                  </button>
                  <button
                    className="cyber-btn text-xs py-2 cyber-btn-pink"
                    onClick={onRejectInvite}
                    aria-label="拒絕邀請"
                  >
                    <X className="w-3 h-3 inline mr-1" />
                    拒絕
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 玩家列表 */}
      <div className="space-y-2">
        {otherPlayers.map((p) => {
          const pColor = getPlayerColor(p);
          const isAlly = myAllyIndex === p.playerIndex;
          const hasIncoming = incomingFrom === p.playerIndex;
          const hasSent = sentInvites.has(p.playerIndex);
          const isBroken =
            alliances.some(
              (a) =>
                a.members.includes(myPlayerIndex) &&
                a.members.includes(p.playerIndex) &&
                !!a.breaker,
            ) ||
            p.hasBrokenAlliance;

          // 狀態判斷
          let status: "ally" | "incoming" | "sent" | "available" | "broken";
          if (isAlly) status = "ally";
          else if (hasIncoming) status = "incoming";
          else if (hasSent) status = "sent";
          else if (isBroken) status = "broken";
          else status = "available";

          return (
            <div
              key={p.playerIndex}
              className="p-2.5 rounded-lg relative overflow-hidden"
              style={{
                backgroundColor: isAlly
                  ? "color-mix(in srgb, var(--green) 8%, transparent)"
                  : "var(--bg-mid)",
                border: isAlly
                  ? "1px solid var(--green)"
                  : `1px solid ${pColor}33`,
                boxShadow: isAlly
                  ? "0 0 10px color-mix(in srgb, var(--green) 25%, transparent)"
                  : "none",
              }}
            >
              {/* 聯盟連線效果 */}
              {isAlly && (
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, ${myColor}, var(--green), ${pColor}, var(--green), ${myColor})`,
                    backgroundSize: "200% 100%",
                    animation: "alliance-flow 3s linear infinite",
                    opacity: 0.4,
                    filter: "blur(1px)",
                  }}
                />
              )}

              <div className="flex items-center gap-2 relative z-10">
                {/* 玩家頭像 */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `${pColor}22`,
                    border: `1.5px solid ${pColor}`,
                    color: pColor,
                    boxShadow: `0 0 8px ${pColor}66`,
                  }}
                >
                  P{p.playerNumber}
                </div>

                {/* 玩家資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {p.name}
                    {p.isAI && (
                      <span
                        className="ml-1.5 text-[9px] px-1 py-0.5 rounded font-cyber tracking-wider"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--purple) 20%, transparent)",
                          color: "var(--purple)",
                          border: "1px solid var(--purple)",
                          verticalAlign: "middle",
                        }}
                      >
                        AI
                      </span>
                    )}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {status === "ally" && (
                      <span style={{ color: "var(--green)" }}>盟約存續中</span>
                    )}
                    {status === "incoming" && (
                      <span style={{ color: "var(--cyan)" }}>有邀請待處理</span>
                    )}
                    {status === "sent" && (
                      <span style={{ color: "var(--yellow)" }}>已發出邀請，等待回覆</span>
                    )}
                    {status === "available" && (
                      <span style={{ color: "var(--text-secondary)" }}>可邀請結盟</span>
                    )}
                    {status === "broken" && (
                      <span style={{ color: "var(--red)" }}>本局限時無法結盟</span>
                    )}
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex-shrink-0">
                  {status === "ally" && (
                    <button
                      className="cyber-btn text-[10px] px-2 py-1.5"
                      style={{
                        borderColor: "var(--red)",
                        color: "var(--red)",
                        background: "color-mix(in srgb, var(--red) 8%, transparent)",
                      }}
                      onClick={() => setBreakConfirm(true)}
                      aria-label="解除聯盟"
                    >
                      <Swords className="w-3 h-3 inline mr-1" />
                      毀約
                    </button>
                  )}
                  {status === "available" && (
                    <button
                      className="cyber-btn text-[10px] px-2 py-1.5"
                      style={{
                        borderColor: "var(--green)",
                        color: "var(--green)",
                        background: "color-mix(in srgb, var(--green) 8%, transparent)",
                      }}
                      onClick={() => setInviteTarget(p.playerIndex)}
                      aria-label="發起結盟"
                    >
                      <Handshake className="w-3 h-3 inline mr-1" />
                      結盟
                    </button>
                  )}
                  {status === "sent" && (
                    <span
                      className="text-[10px] px-2 py-1.5 rounded font-cyber tracking-wider"
                      style={{
                        border: "1px solid var(--yellow)",
                        color: "var(--yellow)",
                        backgroundColor: "color-mix(in srgb, var(--yellow) 8%, transparent)",
                      }}
                    >
                      等待中
                    </span>
                  )}
                  {status === "broken" && (
                    <UserX className="w-4 h-4" style={{ color: "var(--red)", opacity: 0.6 }} />
                  )}
                  {status === "incoming" && (
                    <span
                      className="text-[10px] px-2 py-1.5 rounded font-cyber tracking-wider"
                      style={{
                        border: "1px solid var(--cyan)",
                        color: "var(--cyan)",
                        backgroundColor: "color-mix(in srgb, var(--cyan) 8%, transparent)",
                        animation: "neon-pulse 1.5s ease-in-out infinite",
                      }}
                    >
                      新邀請
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 毀約確認彈窗 */}
      {breakConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(5, 5, 15, 0.8)",
            backdropFilter: "blur(4px)",
            animation: "fade-in 0.15s ease-out",
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg p-5"
            style={{
              backgroundColor: "var(--bg-dark)",
              border: "1px solid var(--red)",
              boxShadow: "0 0 20px color-mix(in srgb, var(--red) 35%, transparent)",
            }}
          >
            <div className="text-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--red) 15%, transparent)",
                  border: "1px solid var(--red)",
                }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: "var(--red)" }} />
              </div>
              <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                危險操作
              </div>
              <h3 className="text-lg font-cyber tracking-wider" style={{ color: "var(--red)" }}>
                確認毀約？
              </h3>
            </div>
            <p className="text-sm text-center mb-2" style={{ color: "var(--text-secondary)" }}>
              毀約後本局將無法再次結盟
            </p>
            <p className="text-xs text-center mb-5" style={{ color: "var(--yellow)" }}>
              並支付違約金與聲望損失
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="cyber-btn text-xs py-2.5"
                onClick={() => setBreakConfirm(false)}
                aria-label="取消"
              >
                取消
              </button>
              <button
                className="cyber-btn text-xs py-2.5"
                style={{
                  borderColor: "var(--red)",
                  color: "var(--red)",
                  background: "color-mix(in srgb, var(--red) 12%, transparent)",
                  boxShadow: "0 0 10px color-mix(in srgb, var(--red) 30%, transparent)",
                }}
                onClick={handleBreakConfirm}
                aria-label="確認毀約"
              >
                確認毀約
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 發起邀請確認 */}
      {inviteTarget !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(5, 5, 15, 0.8)",
            backdropFilter: "blur(4px)",
            animation: "fade-in 0.15s ease-out",
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg p-5"
            style={{
              backgroundColor: "var(--bg-dark)",
              border: "1px solid var(--green)",
              boxShadow: "0 0 20px color-mix(in srgb, var(--green) 35%, transparent)",
            }}
          >
            <div className="text-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--green) 15%, transparent)",
                  border: "1px solid var(--green)",
                }}
              >
                <Handshake className="w-6 h-6" style={{ color: "var(--green)" }} />
              </div>
              <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                發起結盟
              </div>
              <h3 className="text-lg font-cyber tracking-wider" style={{ color: "var(--green)" }}>
                向 {players[inviteTarget]?.name ?? "玩家"} 發起邀請？
              </h3>
            </div>
            <p className="text-sm text-center mb-5" style={{ color: "var(--text-secondary)" }}>
              對方同意後雙方結成聯盟，互不收取過路費
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="cyber-btn text-xs py-2.5"
                onClick={() => setInviteTarget(null)}
                aria-label="取消"
              >
                取消
              </button>
              <button
                className="cyber-btn text-xs py-2.5"
                style={{
                  borderColor: "var(--green)",
                  color: "var(--green)",
                  background: "color-mix(in srgb, var(--green) 12%, transparent)",
                  boxShadow: "0 0 10px color-mix(in srgb, var(--green) 30%, transparent)",
                }}
                onClick={() => handleSendInvite(inviteTarget)}
                aria-label="發送邀請"
              >
                發送邀請
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAlliancePanel;
