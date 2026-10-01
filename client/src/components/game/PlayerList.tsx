import type { FC } from "react";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import type { PlayerState, GameState } from "@shared/api.interface";
import PlayerPanel from "./PlayerPanel";

interface PlayerListProps {
  players: PlayerState[];
  currentPlayerIndex: number;
  myPlayerIndex?: number;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Map of property count per player (key = playerIndex) */
  propertyCounts?: Record<number, number>;
  bondIssuedCounts?: Record<number, number>;
  bondHeldCounts?: Record<number, number>;
  reputations?: Record<number, number>;
  wars?: Array<{ attackerIndex: number; defenderIndex: number; remainingTurns: number }>;
  spies?: Array<{ spyIndex: number; targetIndex: number; remainingTurns: number }>;
  robotProxy?: Record<number, number>;
  parallelWorld?: { active: boolean; affectedPlayerIndex: number; remainingTurns: number } | null;
  buildingMaterials?: Record<number, number>;
  // 新模式狀態（從 gameState 派生）
  bossIndex?: number | null;
  emperorIndex?: number | null;
  treasureCarrierIndex?: number | null;
  taxPayingPlayerIndex?: number | null;
  showHealthBars?: boolean;
  isDarkMode?: boolean;
  darkViewPlayerIndex?: number | null; // 當前玩家索引（黑暗模式下自己可見）
  resources?: Record<number, number>; // 資源爭奪模式：每個玩家的資源數
}

const PlayerList: FC<PlayerListProps> = ({
  players,
  currentPlayerIndex,
  myPlayerIndex,
  isCollapsible = false,
  defaultCollapsed = false,
  propertyCounts = {},
  bondIssuedCounts = {},
  bondHeldCounts = {},
  reputations,
  wars = [],
  spies = [],
  robotProxy = {},
  parallelWorld = null,
  buildingMaterials = {},
  bossIndex = null,
  emperorIndex = null,
  treasureCarrierIndex = null,
  taxPayingPlayerIndex = null,
  showHealthBars = false,
  isDarkMode = false,
  darkViewPlayerIndex = null,
  resources = {},
}) => {
  const atWarSet = useMemo(() => {
    const s = new Set<number>();
    for (const w of wars) {
      s.add(w.attackerIndex);
      s.add(w.defenderIndex);
    }
    return s;
  }, [wars]);
  const spiedSet = useMemo(() => {
    const s = new Set<number>();
    for (const sp of spies) s.add(sp.targetIndex);
    return s;
  }, [spies]);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Sort: active players first (current player first among active),
  // bankrupt players last
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (a.isBankrupt !== b.isBankrupt) {
        return a.isBankrupt ? 1 : -1;
      }
      if (a.playerIndex === currentPlayerIndex) return -1;
      if (b.playerIndex === currentPlayerIndex) return 1;
      return a.playerIndex - b.playerIndex;
    });
  }, [players, currentPlayerIndex]);

  const activeCount = players.filter((p) => !p.isBankrupt).length;
  const bankruptCount = players.length - activeCount;

  return (
    <div className="w-full">
      {/* Collapsible header (mobile) */}
      {isCollapsible && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-3 py-2 cyber-card rounded-lg mb-2 text-left"
        >
          <div className="flex items-center gap-2">
            <Users
              className="w-4 h-4"
              style={{ color: "var(--cyan)" }}
            />
            <span
              className="font-cyber text-sm tracking-wider"
              style={{ color: "var(--cyan)" }}
            >
              玩家 ({activeCount}/{players.length})
              {bankruptCount > 0 && (
                <span className="text-[var(--text-secondary)] ml-1">
                  破产{bankruptCount}
                </span>
              )}
            </span>
          </div>
          {collapsed ? (
            <ChevronDown
              className="w-4 h-4"
              style={{ color: "var(--text-secondary)" }}
            />
          ) : (
            <ChevronUp
              className="w-4 h-4"
              style={{ color: "var(--text-secondary)" }}
            />
          )}
        </button>
      )}

      {/* Player panels */}
      {(!isCollapsible || !collapsed) && (
        <div className="flex flex-col gap-2">
          {sortedPlayers.map((player) => (
            <PlayerPanel
              key={player.playerIndex}
              player={player}
              isCurrent={player.playerIndex === currentPlayerIndex}
              position={player.position}
              isMe={myPlayerIndex !== undefined && player.playerIndex === myPlayerIndex}
              propertyCount={propertyCounts[player.playerIndex] ?? 0}
              bondIssuedCount={bondIssuedCounts[player.playerIndex] ?? 0}
              bondHeldCount={bondHeldCounts[player.playerIndex] ?? 0}
              reputation={reputations?.[player.playerIndex] ?? player.reputation}
              isAtWar={atWarSet.has(player.playerIndex)}
              isSpied={spiedSet.has(player.playerIndex)}
              isRobotActive={(robotProxy[player.playerIndex] ?? 0) > 0}
              isInParallelWorld={parallelWorld?.active && parallelWorld.affectedPlayerIndex === player.playerIndex}
              buildingMaterials={buildingMaterials[player.playerIndex] ?? 0}
              resources={resources[player.playerIndex] ?? 0}
              hasMounts={!!player.mounts && (player.mounts.flyerUses > 0 || player.mounts.diverUses > 0 || player.mounts.rocketUses > 0)}
              isBoss={bossIndex !== null && player.playerIndex === bossIndex}
              isEmperor={emperorIndex !== null && player.playerIndex === emperorIndex}
              carriesTreasure={treasureCarrierIndex !== null && player.playerIndex === treasureCarrierIndex}
              paysTax={taxPayingPlayerIndex !== null && player.playerIndex === taxPayingPlayerIndex}
              showHealth={showHealthBars}
              isDarkHidden={isDarkMode && darkViewPlayerIndex !== null && player.playerIndex !== darkViewPlayerIndex && !player.isBankrupt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
