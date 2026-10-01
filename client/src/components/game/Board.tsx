import type { FC, TouchEvent } from "react";
import { memo, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { CELLS, MODE_LABELS, PLAYER_COLOR_HEX, SETS, PETS } from "@shared/game-config";
import type { PetType } from '@shared/api.interface';
import type { GameState, CellConfig, BuildingLevel, PlayerState, TemporaryCellEffect, TemporaryEffectType, NpcEntity, DisasterState, PawnSkinType, WeatherType } from "@shared/api.interface";
import { Lock, HelpCircle, Flag, Zap, X, Gamepad2, TrendingUp, TrendingDown, Skull, ShoppingBag, UserSearch } from "lucide-react";
import { useIsTouchDevice } from "@client/src/hooks/use-mobile";
import WeatherParticles from "./WeatherParticles";

const EFFECT_COLORS: Record<TemporaryEffectType, string> = {
  fate_zone: '#a855f7',
  price_up: '#4ade80',
  price_down: '#ff4d6d',
  ruins: '#9ca3af',
  investment_preview: '#facc15',
};

const EDGE_PROPERTY_CELLS: Record<string, number[]> = {
  bottom: [1, 2, 3, 4, 6, 7, 8, 9],
  right: [11, 12, 13, 14, 15, 16, 17],
  top: [19, 21, 22, 24, 25, 26],
  left: [28, 29, 30, 31, 32, 34],
};

function getCellPosition(id: number): { row: number; col: number } {
  if (id >= 0 && id <= 9) return { row: 9, col: id };
  if (id >= 10 && id <= 18) return { row: 18 - id, col: 9 };
  if (id >= 19 && id <= 27) return { row: 0, col: 27 - id };
  return { row: id - 27, col: 0 };
}

function getCellRotation(id: number): number {
  if (id >= 0 && id <= 9) return 0;
  if (id >= 10 && id <= 18) return 90;
  if (id >= 19 && id <= 27) return 180;
  return -90;
}

// ===== 棋子渲染組件（memo 優化） =====
interface PlayerTokenProps {
  player: PlayerState;
  currentPlayerIndex: number;
  colorHex: string;
  skin: PawnSkinType;
  isEmperor: boolean;
  carriesTreasure: boolean;
  petIcon?: string;
  petColor?: string;
}

const PlayerToken: FC<PlayerTokenProps> = memo(({ player, currentPlayerIndex, colorHex, skin, isEmperor, carriesTreasure, petIcon, petColor }) => {
  const isCurrent = player.playerIndex === currentPlayerIndex;
  const isBankrupt = player.isBankrupt;

  return (
    <div
      key={player.playerIndex}
      title={player.name}
      data-player-index={player.playerIndex}
      className={`pawn-skin pawn-skin-${skin} relative w-4 h-4 md:w-5 md:h-5 rounded-full border border-white/70 flex items-center justify-center flex-shrink-0 ${
        isCurrent && !isBankrupt ? "token-glow" : ""
      } ${isBankrupt ? "grayscale opacity-50" : ""}`}
      style={{
        backgroundColor: colorHex,
        boxShadow: isBankrupt
          ? "none"
          : `0 0 4px ${colorHex}, 0 0 8px ${colorHex}`,
        color: colorHex,
        zIndex: isCurrent ? 10 : 5,
        '--pawn-color': colorHex,
      } as React.CSSProperties}
    >
      {isEmperor && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs z-30 whitespace-nowrap"
          style={{
            filter:
              'drop-shadow(0 0 3px #a855f7) drop-shadow(0 0 6px #fbbf24)',
            animation: 'emperor-pawn-crown-shine 2s ease-in-out infinite',
          }}
        >
          帝
        </div>
      )}
      {carriesTreasure && (
        <div
          className="absolute -top-3 -right-1 text-[9px] md:text-[10px] z-30"
          style={{
            filter:
              'drop-shadow(0 0 3px #fbbf24) drop-shadow(0 0 6px #fbbf24)',
            animation: 'treasure-pawn-pulse 1.2s ease-in-out infinite',
          }}
        >
          寶
        </div>
      )}
      <span className="pawn-skin-number text-[8px] md:text-[9px] font-bold text-white/95 leading-none">
        {player.playerNumber}
      </span>
      {skin === 'mecha' && (
        <div className="absolute inset-0 pawn-skin-mecha-overlay" />
      )}
      {skin === 'ufo' && (
        <div className="absolute inset-0 pawn-skin-ufo-overlay" />
      )}
      {skin === 'dragon' && (
        <div className="absolute inset-0 pawn-skin-dragon-overlay" />
      )}
      {isBankrupt && (
        <X
          className="absolute inset-0 w-full h-full text-white/90 z-20"
          strokeWidth={3}
        />
      )}
      {player.equippedPet && (
        <span
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs whitespace-nowrap"
          style={{
            color: petColor ?? '#fff',
            textShadow: `0 0 4px ${petColor ?? '#fff'}`,
            zIndex: 20,
          }}
        >
          {petIcon ?? '寵'}
        </span>
      )}
    </div>
  );
});

// ===== 棋盤格子組件（memo 優化，避免無關 state 變化導致整盤重渲染） =====
interface BoardCellProps {
  cell: CellConfig;
  resolvedCell: CellConfig;
  ownerIndex: number | undefined;
  ownerColorHex: string;
  propertyData: { buildings: BuildingLevel; isMortgaged: boolean; owner: number; evolutionLevel: number } | null;
  cellPlayers: PlayerState[];
  cellNpcs: NpcEntity[];
  cellEffect: TemporaryCellEffect | undefined;
  players: PlayerState[];
  pawnSkins?: Record<number, PawnSkinType>;
  currentPlayerIndex: number;
  phase: string;
  targetMode: 'teleport' | 'steal_property' | 'bomb' | 'quantum_portal' | null;
  targetPlayerIndex: number;
  onCellClick?: (cellId: number) => void;
  hasSetBonus: boolean;
  isDominantCell: boolean;
  dominantColor: string | null;
  dominantPlayerName?: string;
  controllingColor: string | null;
  controllingPlayerName?: string;
  futurePlayerName?: string;
  futureDeposit?: number;
  evolutionLevel: number;
  treasureHere: boolean;
  treasureDropHere: boolean;
  isFlooded: boolean;
  tokenAnimPlayerIndex: number | null;
  setColor: string;
}

const BoardCell: FC<BoardCellProps> = memo(({
  cell,
  resolvedCell,
  ownerIndex,
  ownerColorHex,
  propertyData,
  cellPlayers,
  cellNpcs,
  cellEffect,
  players,
  pawnSkins,
  currentPlayerIndex,
  phase,
  targetMode,
  targetPlayerIndex,
  onCellClick,
  hasSetBonus,
  isDominantCell,
  dominantColor,
  dominantPlayerName,
  controllingColor,
  controllingPlayerName,
  futurePlayerName,
  futureDeposit,
  evolutionLevel,
  treasureHere,
  treasureDropHere,
  isFlooded,
  tokenAnimPlayerIndex,
  setColor,
}) => {
  const { row, col } = getCellPosition(resolvedCell.id);
  const rotation = getCellRotation(resolvedCell.id);
  const hasNpc = cellNpcs.length > 0;
  const effectColor = cellEffect ? EFFECT_COLORS[cellEffect.type] : null;
  const buildings = propertyData?.buildings ?? 0;
  const isMortgaged = propertyData?.isMortgaged ?? false;
  const evolutionColors = ['', '#22d3ee', '#f59e0b'];
  const evolutionLabels = ['', '商業', '地標'];
  const evolutionIcon = evolutionLevel === 1 ? '商' : evolutionLevel === 2 ? '標' : '';

  const prop = propertyData;

  const isTargetSelectable = targetMode !== null && onCellClick !== undefined && (
    targetMode === 'teleport' ||
    targetMode === 'quantum_portal' ||
    (targetMode === 'steal_property' &&
      resolvedCell.type === 'property' &&
      prop !== null &&
      prop.owner !== targetPlayerIndex &&
      prop.owner !== undefined &&
      prop.buildings === 0 &&
      !prop.isMortgaged) ||
    (targetMode === 'bomb' &&
      resolvedCell.type === 'property' &&
      prop !== null &&
      prop.owner !== targetPlayerIndex &&
      prop.owner !== undefined &&
      prop.buildings > 0)
  );

  const isClickable =
    isTargetSelectable ||
    (resolvedCell.type === "property" &&
      prop !== null &&
      phase === "rolling" &&
      onCellClick !== undefined);

  const baseBg =
    resolvedCell.type === "start"
      ? "bg-[var(--cell-start-bg)]"
      : resolvedCell.type === "detention"
        ? "bg-[var(--cell-detention-bg)]"
        : resolvedCell.type === "fate"
          ? "bg-[var(--cell-fate-bg)]"
          : resolvedCell.type === "chance"
            ? "bg-[var(--cell-chance-bg)]"
            : resolvedCell.type === "minigame"
              ? "bg-[var(--cell-minigame-bg)]"
              : resolvedCell.type === "property"
                ? "bg-[var(--cell-property-bg)]"
                : "bg-[var(--cell-corner-bg)]";

  const borderColor =
    resolvedCell.type === "start"
      ? "border-[var(--cell-start-border)]"
      : resolvedCell.type === "detention"
        ? "border-[var(--cell-detention-border)]"
        : resolvedCell.type === "fate"
          ? "border-[var(--cell-fate-border)]"
          : resolvedCell.type === "chance"
            ? "border-[var(--cell-chance-border)]"
            : resolvedCell.type === "minigame"
              ? "border-[var(--cell-minigame-border)]"
              : "border-[var(--cell-property-border)]";

  const handleClick = () => {
    if (isClickable && onCellClick) {
      onCellClick(resolvedCell.id);
    }
  };

  const cellBorderStyle = effectColor
    ? `2px solid ${effectColor}`
    : isDominantCell
      ? `2px solid #facc15`
      : hasSetBonus && resolvedCell.type === 'property'
        ? `2px solid ${setColor}`
        : resolvedCell.type === 'minigame'
          ? '2px solid transparent'
          : `1px solid var(--${resolvedCell.type === 'start' ? 'cell-start-border' : resolvedCell.type === 'detention' ? 'cell-detention-border' : resolvedCell.type === 'fate' ? 'cell-fate-border' : resolvedCell.type === 'chance' ? 'cell-chance-border' : 'cell-property-border'})`;

  const setBonusGlow = hasSetBonus && resolvedCell.type === 'property'
    ? `0 0 12px ${setColor}, 0 0 24px ${setColor}80, 0 0 36px ${setColor}40, inset 0 0 10px ${setColor}60`
    : null;
  const dominantGlow = isDominantCell
    ? `0 0 15px #facc15, 0 0 30px #facc1580, 0 0 45px #facc1540, inset 0 0 12px #facc1560`
    : null;

  const cellBoxShadow = effectColor
    ? `0 0 8px ${effectColor}, 0 0 16px ${effectColor}80, inset 0 0 6px ${effectColor}60`
    : hasNpc
      ? `0 0 8px var(--yellow), 0 0 16px var(--yellow)60, inset 0 0 6px var(--yellow)40`
      : isTargetSelectable
        ? `0 0 10px var(--cell-minigame-color), inset 0 0 8px var(--cell-minigame-color)`
        : resolvedCell.type === 'minigame'
          ? `0 0 8px color-mix(in srgb, var(--cell-minigame-color) 40%, transparent), inset 0 0 6px color-mix(in srgb, var(--pink) 15%, transparent)`
          : dominantGlow
            ? dominantGlow
            : setBonusGlow
              ? setBonusGlow
              : isClickable
                ? `inset 0 0 8px ${ownerColorHex}`
                : undefined;

  return (
    <div
      data-cell-id={cell.id}
      data-set-id={resolvedCell.type === 'property' ? resolvedCell.setId : undefined}
      onClick={handleClick}
      className={`relative flex items-center justify-center ${baseBg} border ${borderColor} overflow-hidden transition-all ${
        isClickable ? "cursor-pointer hover:brightness-125" : ""
      } ${isTargetSelectable ? "animate-pulse" : ""} ${cellEffect ? "cell-effect-pulse" : ""}`}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
        opacity: isMortgaged ? 0.55 : 1,
        border: cellBorderStyle,
        background: resolvedCell.type === 'minigame'
          ? 'linear-gradient(var(--cell-minigame-bg), var(--cell-minigame-bg)) padding-box, linear-gradient(135deg, var(--pink), var(--purple), var(--cyan), var(--pink)) border-box'
          : effectColor
            ? undefined
            : undefined,
        boxShadow: cellBoxShadow,
        '--cell-effect-color': effectColor || 'transparent',
      } as React.CSSProperties}
    >
      {/* Top bars: owner indicator + series color */}
      {resolvedCell.type === "property" && (
        <div className="absolute top-0 left-0 right-0 flex flex-col z-10">
          {ownerIndex !== undefined && (
            <div
              className="h-1"
              style={{
                backgroundColor: ownerColorHex,
                boxShadow: `0 0 6px ${ownerColorHex}`,
              }}
            />
          )}
          <div
            className="h-1 cell-set-bar"
            style={{
              backgroundColor: setColor,
              boxShadow: `0 0 4px ${setColor}`,
            }}
          />
        </div>
      )}

      {/* 區域霸權標籤（左上角） */}
      {isDominantCell && (
        <div
          className="absolute top-0 left-0 z-30 px-1 py-0.5 font-cyber text-[7px] md:text-[8px] font-bold tracking-wider"
          style={{
            color: '#facc15',
            backgroundColor: 'rgba(250, 204, 21, 0.15)',
            borderRight: '1px solid #facc15',
            borderBottom: '1px solid #facc15',
            textShadow: '0 0 4px #facc15, 0 0 8px #facc15',
            boxShadow: '0 0 6px #facc1580',
          }}
          title={`區域霸權：${dominantPlayerName ?? ''}`}
        >
          霸權
        </div>
      )}

      {/* 地產期貨：定金預定標記（右上角） */}
      {futurePlayerName && futureDeposit !== undefined && (
        <div
          className="absolute top-0 right-0 z-30 px-1 py-0.5 font-cyber text-[7px] md:text-[8px] font-bold tracking-wider"
          style={{
            color: '#ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            borderLeft: '1px solid #ffd700',
            borderBottom: '1px solid #ffd700',
            textShadow: '0 0 4px #ffd700, 0 0 8px #ffd700',
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.5)',
          }}
          title={`已被 ${futurePlayerName} 預定，定金 $${futureDeposit}`}
        >
          預定
        </div>
      )}

      {/* 地產進化標記（左上角） */}
      {evolutionLevel > 0 && resolvedCell.type === 'property' && (
        <div
          className="absolute top-0 left-0 z-30 px-1 py-0.5 font-cyber text-[7px] md:text-[8px] font-bold tracking-wider"
          style={{
            color: evolutionColors[evolutionLevel],
            backgroundColor: `${evolutionColors[evolutionLevel]}20`,
            borderRight: `1px solid ${evolutionColors[evolutionLevel]}`,
            borderBottom: `1px solid ${evolutionColors[evolutionLevel]}`,
            textShadow: `0 0 4px ${evolutionColors[evolutionLevel]}, 0 0 8px ${evolutionColors[evolutionLevel]}`,
            boxShadow: `0 0 6px ${evolutionColors[evolutionLevel]}80`,
          }}
          title={`進化等級：${evolutionLabels[evolutionLevel]}（過路費 +${evolutionLevel * 50}%）`}
        >
          {evolutionIcon}
        </div>
      )}

      {/* 套裝齊全 ×3 角標（右上角） */}
      {hasSetBonus && resolvedCell.type === 'property' && !isDominantCell && (
        <div
          className="absolute top-0 right-0 z-20 px-1 py-0.5 font-cyber text-[7px] md:text-[8px] font-bold tracking-wider"
          style={{
            color: setColor,
            backgroundColor: `${setColor}20`,
            borderLeft: `1px solid ${setColor}`,
            borderBottom: `1px solid ${setColor}`,
            textShadow: `0 0 4px ${setColor}, 0 0 8px ${setColor}`,
            boxShadow: `0 0 6px ${setColor}80`,
          }}
          title="地產鏈 ×3 加成"
        >
          ×3
        </div>
      )}

      {/* 控股光環標記（右上角） */}
      {controllingColor && resolvedCell.type === "property" && (
        <div
          className="absolute top-0.5 right-0.5 z-20 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
          style={{
            backgroundColor: controllingColor,
            boxShadow: `0 0 4px ${controllingColor}, 0 0 8px ${controllingColor}`,
            animation: 'npc-pulse 2s ease-in-out infinite',
            top: hasSetBonus || isDominantCell ? '18px' : '2px',
          }}
          title={`控股：${controllingPlayerName ?? ''}`}
        />
      )}

      {/* Temporary effect icon + duration badge */}
      {cellEffect && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-0.5 pt-0.5 z-20"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="flex items-center justify-center rounded-sm"
            style={{ color: effectColor || 'currentColor' }}
          >
            {cellEffect.type === 'price_up' && (
              <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={2.5} />
            )}
            {cellEffect.type === 'price_down' && (
              <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={2.5} />
            )}
            {cellEffect.type === 'ruins' && (
              <Skull className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={2} />
            )}
            {cellEffect.type === 'fate_zone' && (
              <HelpCircle className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={2.5} />
            )}
          </div>
          <div
            className="flex items-center justify-center rounded-full font-cyber text-[7px] md:text-[8px] font-bold leading-none"
            style={{
              minWidth: '12px',
              height: '12px',
              padding: '0 2px',
              backgroundColor: effectColor || 'transparent',
              color: 'var(--bg-deep)',
              boxShadow: `0 0 4px ${effectColor || 'transparent'}`,
            }}
          >
            {cellEffect.duration}
          </div>
        </div>
      )}

      {/* Cell content */}
      <div
        className="flex flex-col items-center justify-center w-full h-full p-0.5"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {resolvedCell.type === "start" && (
          <Flag
            className="w-3 h-3 md:w-4 md:h-4 text-[var(--green)] drop-shadow-[0_0_4px_var(--green)]"
            strokeWidth={2}
          />
        )}
        {resolvedCell.type === "detention" && (
          <Lock
            className="w-3 h-3 md:w-4 md:h-4 text-[var(--purple)] drop-shadow-[0_0_4px_var(--purple)]"
            strokeWidth={2}
          />
        )}
        {resolvedCell.type === "fate" && (
          <HelpCircle
            className="w-3 h-3 md:w-4 md:h-4 text-[var(--pink)] drop-shadow-[0_0_4px_var(--pink)]"
            strokeWidth={2}
          />
        )}
        {resolvedCell.type === "chance" && (
          <Zap
            className="w-3 h-3 md:w-4 md:h-4 text-[var(--cell-chance-color)] drop-shadow-[0_0_4px_var(--cell-chance-color)]"
            strokeWidth={2}
            fill="currentColor"
          />
        )}
        {resolvedCell.type === "minigame" && (
          <div
            className="flex flex-col items-center justify-center"
            style={{ animation: 'minigame-pulse 2s ease-in-out infinite' }}
          >
            <Gamepad2
              className="w-3 h-3 md:w-4 md:h-4"
              strokeWidth={2}
              style={{
                color: 'var(--cell-minigame-color)',
                filter: 'drop-shadow(0 0 4px var(--cell-minigame-color))',
              }}
            />
          </div>
        )}

        <span
          className={`text-[10px] md:text-[11px] font-medium leading-tight text-center w-full px-0.5 line-clamp-2 ${resolvedCell.type === 'minigame' ? 'font-cyber tracking-wide' : ''}`}
          style={{
            color: resolvedCell.type === 'minigame' ? 'var(--cell-minigame-color)' : 'var(--text-primary)',
            textShadow: resolvedCell.type === 'minigame' ? '0 0 4px var(--cell-minigame-color)' : 'none',
          }}
          title={resolvedCell.name}
        >
          {resolvedCell.name}
        </span>

        {resolvedCell.type === "property" && (
          <span className="text-[7px] md:text-[9px] text-[var(--text-secondary)] font-cyber mt-0.5">
            ¥{resolvedCell.basePrice}
          </span>
        )}

        {/* Buildings indicator - 3D 立體建築 */}
        {resolvedCell.type === "property" && buildings > 0 && (
          <div
            className="flex items-end justify-center gap-px mt-0.5"
            style={{ perspective: '100px', perspectiveOrigin: 'center bottom' }}
          >
            {buildings < 5 ? (
              Array.from({ length: buildings }).map((_, i: number) => {
                const height = 6 + buildings * 2 + i;
                const glow = 2 + buildings * 2;
                return (
                  <div
                    key={i}
                    className="relative"
                    style={{
                      width: '4px',
                      height: `${height}px`,
                      transformStyle: 'preserve-3d',
                      transform: 'rotateX(-15deg)',
                      transition: 'height .4s ease, transform .4s ease',
                      animation: 'build-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-sm"
                      style={{
                        backgroundColor: ownerColorHex,
                        boxShadow: `0 0 ${glow}px ${ownerColorHex}, inset 0 0 2px rgba(255,255,255,0.3)`,
                        transform: 'translateZ(2px)',
                        transition: 'box-shadow .4s ease, background-color .4s ease',
                      }}
                    />
                    <div
                      className="absolute left-0 right-0 rounded-sm"
                      style={{
                        height: '4px',
                        backgroundColor: `color-mix(in srgb, ${ownerColorHex} 60%, white)`,
                        boxShadow: `0 0 ${glow}px ${ownerColorHex}`,
                        transform: 'rotateX(90deg) translateZ(2px) translateY(-2px)',
                        transformOrigin: 'top',
                        top: 0,
                        transition: 'box-shadow .4s ease, background-color .4s ease',
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <div
                className="relative"
                style={{
                  width: '12px',
                  height: '22px',
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(-12deg)',
                  transition: 'height .4s ease, width .4s ease, transform .4s ease',
                  animation: 'build-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
              >
                <div
                  className="absolute inset-0 rounded-sm flex items-center justify-center font-cyber font-bold"
                  style={{
                    backgroundColor: ownerColorHex,
                    color: 'var(--bg-deep)',
                    fontSize: '7px',
                    lineHeight: 1,
                    boxShadow: `0 0 8px ${ownerColorHex}, 0 0 16px ${ownerColorHex}80, inset 0 0 4px rgba(255,255,255,0.4)`,
                    transform: 'translateZ(4px)',
                  }}
                >
                  H
                </div>
                <div
                  className="absolute left-0 right-0 rounded-sm"
                  style={{
                    height: '8px',
                    backgroundColor: `color-mix(in srgb, ${ownerColorHex} 70%, white)`,
                    boxShadow: `0 0 6px ${ownerColorHex}`,
                    transform: 'rotateX(90deg) translateZ(4px) translateY(-4px)',
                    transformOrigin: 'top',
                    top: 0,
                  }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    width: '2px',
                    height: '6px',
                    backgroundColor: ownerColorHex,
                    boxShadow: `0 0 4px ${ownerColorHex}`,
                    transform: 'translateZ(4px) translateY(-8px)',
                    top: 0,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Mortgage label */}
        {isMortgaged && resolvedCell.type === "property" && (
          <div
            className="absolute bottom-0 left-0 right-0 text-center font-cyber text-[6px] md:text-[8px] py-0.5 tracking-wider"
            style={{
              backgroundColor: "var(--text-muted)",
              color: "var(--bg-deep)",
            }}
          >
            抵押
          </div>
        )}
      </div>

      {/* NPC icon - top-left corner */}
      {hasNpc && (
        <div
          className="absolute top-0.5 left-0.5 z-30 flex items-center justify-center rounded-sm"
          style={{
            pointerEvents: 'none',
            animation: 'npc-pulse 2s ease-in-out infinite',
          }}
        >
          <div
            className="w-4 h-4 md:w-5 md:h-5 rounded-sm flex items-center justify-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--yellow) 20%, transparent)',
              border: '1px solid var(--yellow)',
              boxShadow: '0 0 6px var(--yellow), 0 0 12px var(--yellow)80',
            }}
          >
            {cellNpcs[0].type === 'wanderer' ? (
              <ShoppingBag
                className="w-2.5 h-2.5 md:w-3 md:h-3"
                style={{ color: 'var(--yellow)' }}
                strokeWidth={2}
              />
            ) : (
              <UserSearch
                className="w-2.5 h-2.5 md:w-3 md:h-3"
                style={{ color: 'var(--yellow)' }}
                strokeWidth={2}
              />
            )}
          </div>
        </div>
      )}

      {/* 寶藏圖示（奪寶模式） */}
      {treasureHere && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 text-base md:text-xl pointer-events-none"
          style={{
            filter:
              'drop-shadow(0 0 4px #fbbf24) drop-shadow(0 0 8px #fbbf24)',
            animation: 'treasure-cell-pulse 1.5s ease-in-out infinite',
          }}
          title="寶藏位置"
        >
          寶
        </div>
      )}
      {/* 寶藏掉落標記（較小） */}
      {treasureDropHere && (
        <div
          className="absolute bottom-0.5 left-0.5 z-25 text-[10px] md:text-xs pointer-events-none opacity-70"
          style={{
            filter:
              'drop-shadow(0 0 3px #fbbf24) drop-shadow(0 0 6px #fbbf24)',
            animation: 'treasure-drop-pulse 2s ease-in-out infinite',
          }}
          title="寶藏掉落點"
        >
          鑽
        </div>
      )}

      {/* 洪水波紋覆蓋層 */}
      {isFlooded && <div className="wave-overlay" />}

      {/* Player tokens - flex wrap for multi-player */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ perspective: '500px', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute bottom-0.5 right-0.5 left-0.5 flex flex-wrap justify-end items-end gap-0.5 p-0.5">
          {cellPlayers.map((p: PlayerState) => {
            if (tokenAnimPlayerIndex !== null && p.playerIndex === tokenAnimPlayerIndex) return null;
            const colorHex = PLAYER_COLOR_HEX[p.color];
            const skin: PawnSkinType = pawnSkins?.[p.playerIndex] ?? 'default';
            const isEmperor = false; // emperor check is done at Board level via gameState, not per-cell
            const carriesTreasure = false;
            const petIcon = p.equippedPet ? PETS[p.equippedPet as PetType]?.icon : undefined;
            const petColor = p.equippedPet ? PETS[p.equippedPet as PetType]?.color : undefined;
            return (
              <PlayerToken
                key={p.playerIndex}
                player={p}
                currentPlayerIndex={currentPlayerIndex}
                colorHex={colorHex}
                skin={skin}
                isEmperor={isEmperor}
                carriesTreasure={carriesTreasure}
                petIcon={petIcon}
                petColor={petColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

interface BoardProps {
  gameState: GameState;
  onCellClick?: (cellId: number) => void;
  targetMode?: 'teleport' | 'steal_property' | 'bomb' | 'quantum_portal' | null;
  targetPlayerIndex?: number;
  boardCells?: CellConfig[];
  cellEffects?: Record<number, TemporaryCellEffect>;
  npcs?: NpcEntity[];
  controllingCells?: Record<number, { symbol: string; playerIndex: number }>;
  disaster?: DisasterState;
  pawnSkins?: Record<number, PawnSkinType>;
  weather?: WeatherType;
  bankruptPlayerIndex?: number | null;
  isVictory?: boolean;
  onJumpLand?: () => void;
}

const Board: FC<BoardProps> = ({ gameState, onCellClick, targetMode = null, targetPlayerIndex = -1, boardCells, cellEffects, npcs, controllingCells, disaster, pawnSkins, weather, bankruptPlayerIndex = null, isVictory = false, onJumpLand }) => {
  const { players, currentPlayerIndex, ownedProperties, properties, phase } =
    gameState;

  const isTouch = useIsTouchDevice();

  const boardRef = useRef<HTMLDivElement>(null);
  const boardInnerRef = useRef<HTMLDivElement>(null);

  // 手勢狀態
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // ===== 鏡頭動畫狀態 =====
  const [cameraZoom, setCameraZoom] = useState<number>(1);
  const [cameraOffsetX, setCameraOffsetX] = useState<number>(0);
  const [cameraOffsetY, setCameraOffsetY] = useState<number>(0);
  const [cameraTransition, setCameraTransition] = useState<string>('transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)');

  // ===== 棋子跳躍動畫狀態 =====
  const [tokenAnim, setTokenAnim] = useState<{
    playerIndex: number;
    path: number[];
    step: number;
  } | null>(null);
  const prevPositionsRef = useRef<number[]>([]);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 監聽破產玩家，觸發鏡頭拉近
  useEffect(() => {
    if (bankruptPlayerIndex === null) return;
    const player = players[bankruptPlayerIndex];
    if (!player) return;
    const pos = player.position;
    const { row, col } = getCellPosition(pos);
    // 計算目標在棋盤中的百分比位置（相對於中心）
    // 10x10 網格，中心在 4.5, 4.5
    const offsetXPct = (col - 4.5) / 10 * 100 * 1.3;
    const offsetYPct = (row - 4.5) / 10 * 100 * 1.3;
    setCameraTransition('transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)');
    setCameraZoom(1.3);
    setCameraOffsetX(-offsetXPct);
    setCameraOffsetY(-offsetYPct);
    // 2秒後恢復
    const timer = setTimeout(() => {
      setCameraTransition('transform 1.2s ease-out');
      setCameraZoom(1);
      setCameraOffsetX(0);
      setCameraOffsetY(0);
    }, 2000);
    return () => clearTimeout(timer);
  }, [bankruptPlayerIndex, players]);

  // 監聽勝利，觸發鏡頭拉遠
  useEffect(() => {
    if (isVictory) {
      setCameraTransition('transform 1.5s ease-out');
      setCameraZoom(0.85);
      setCameraOffsetX(0);
      setCameraOffsetY(0);
    } else {
      setCameraZoom(1);
      setCameraOffsetX(0);
      setCameraOffsetY(0);
    }
  }, [isVictory]);

  // ===== 棋子跳躍動畫邏輯 =====
  useEffect(() => {
    // 初始化位置記錄
    const positions = players.map((p: PlayerState) => p.position);
    if (prevPositionsRef.current.length === 0) {
      prevPositionsRef.current = positions;
      return;
    }
    const prevPositions = prevPositionsRef.current;
    // 尋找 position 變化的玩家（且不在動畫中）
    for (let i = 0; i < players.length; i += 1) {
      const newPos = positions[i];
      const oldPos = prevPositions[i];
      if (newPos !== oldPos && tokenAnim === null) {
        // 生成逐格路徑
        const path: number[] = [];
        // 向前移動（大富翁是順時針，position 增加）
        const totalCells = 36;
        let steps = (newPos - oldPos + totalCells) % totalCells;
        if (steps === 0) steps = totalCells;
        let cur = oldPos;
        for (let s = 1; s <= steps; s += 1) {
          cur = (cur + 1) % totalCells;
          path.push(cur);
        }
        if (path.length > 0) {
          setTokenAnim({ playerIndex: i, path, step: 0 });
        }
        break;
      }
    }
    prevPositionsRef.current = positions;
  }, [players, tokenAnim]);

  // 逐格推進跳躍動畫
  useEffect(() => {
    if (!tokenAnim) return;
    if (jumpTimerRef.current) {
      clearTimeout(jumpTimerRef.current);
    }
    if (tokenAnim.step >= tokenAnim.path.length - 1) {
      // 最後一格，動畫結束
      jumpTimerRef.current = setTimeout(() => {
        setTokenAnim(null);
        onJumpLand?.();
      }, 250);
      return;
    }
    jumpTimerRef.current = setTimeout(() => {
      setTokenAnim((prev) => {
        if (!prev) return null;
        return { ...prev, step: prev.step + 1 };
      });
    }, 250);
    return () => {
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    };
  }, [tokenAnim, onJumpLand]);

  // 計算動畫中棋子的像素位置（用於獨立渲染層）
  const jumpingPawnStyle = useMemo(() => {
    if (!tokenAnim) return null;
    const cellId = tokenAnim.path[tokenAnim.step];
    const { row, col } = getCellPosition(cellId);
    const leftPct = 2 + (col / 10) * 96 + col * 0.05;
    const topPct = 2 + (row / 10) * 96 + row * 0.05;
    return {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      width: '10%',
      height: '10%',
    };
  }, [tokenAnim]);
  const touchStartRef = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    initialPinchDist: number;
    initialScale: number;
    pinchMidX: number;
    pinchMidY: number;
    isGesturing: boolean;
    tapStartTime: number;
    tapStartX: number;
    tapStartY: number;
    moved: boolean;
  }>({
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    initialPinchDist: 0,
    initialScale: 1,
    pinchMidX: 0,
    pinchMidY: 0,
    isGesturing: false,
    tapStartTime: 0,
    tapStartX: 0,
    tapStartY: 0,
    moved: false,
  });

  const clampOffset = useCallback((newOffsetX: number, newOffsetY: number, currentScale: number) => {
    // 縮放 > 1 時才允許平移邊界限制
    if (currentScale <= 1) {
      return { x: 0, y: 0 };
    }
    const maxOffsetX = ((currentScale - 1) * 100) / 2; // 百分比單位
    const maxOffsetY = ((currentScale - 1) * 100) / 2;
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY)),
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;
    const ref = touchStartRef.current;

    if (touches.length === 1) {
      ref.startX = touches[0].clientX;
      ref.startY = touches[0].clientY;
      ref.startOffsetX = offsetX;
      ref.startOffsetY = offsetY;
      ref.tapStartTime = Date.now();
      ref.tapStartX = touches[0].clientX;
      ref.tapStartY = touches[0].clientY;
      ref.moved = false;
      ref.isGesturing = true;
    } else if (touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      ref.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
      ref.initialScale = scale;
      ref.pinchMidX = (touches[0].clientX + touches[1].clientX) / 2;
      ref.pinchMidY = (touches[0].clientY + touches[1].clientY) / 2;
      ref.startOffsetX = offsetX;
      ref.startOffsetY = offsetY;
      ref.moved = true; // 雙指不當點擊
      ref.isGesturing = true;
    }
  }, [offsetX, offsetY, scale]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;
    const ref = touchStartRef.current;

    if (touches.length === 1 && ref.isGesturing) {
      const dx = touches[0].clientX - ref.startX;
      const dy = touches[0].clientY - ref.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        ref.moved = true;
      }

      // 僅在縮放 > 1 時啟用平移
      if (scale > 1) {
        const boardWidth = boardRef.current?.offsetWidth ?? 0;
        const boardHeight = boardRef.current?.offsetHeight ?? 0;
        // 將像素位移轉換為百分比（相對於棋盤大小）
        const dxPercent = boardWidth > 0 ? (dx / boardWidth) * 100 : 0;
        const dyPercent = boardHeight > 0 ? (dy / boardHeight) * 100 : 0;

        const clamped = clampOffset(
          ref.startOffsetX + dxPercent,
          ref.startOffsetY + dyPercent,
          scale,
        );
        setOffsetX(clamped.x);
        setOffsetY(clamped.y);
      }
    } else if (touches.length === 2 && ref.isGesturing && ref.initialPinchDist > 0) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = currentDist / ref.initialPinchDist;
      const newScale = Math.max(0.5, Math.min(2, ref.initialScale * ratio));

      // 以雙指中點為縮放中心調整偏移
      const boardRect = boardRef.current?.getBoundingClientRect();
      if (boardRect) {
        const boardWidth = boardRect.width;
        const boardHeight = boardRect.height;
        const midXPercent = ((ref.pinchMidX - boardRect.left) / boardWidth) * 100 - 50;
        const midYPercent = ((ref.pinchMidY - boardRect.top) / boardHeight) * 100 - 50;

        const scaleDelta = newScale - ref.initialScale;
        const newOffsetX = ref.startOffsetX - midXPercent * scaleDelta / newScale * ref.initialScale;
        const newOffsetY = ref.startOffsetY - midYPercent * scaleDelta / newScale * ref.initialScale;

        const clamped = clampOffset(newOffsetX, newOffsetY, newScale);
        setOffsetX(clamped.x);
        setOffsetY(clamped.y);
      }

      setScale(newScale);
    }
  }, [scale, offsetX, offsetY, clampOffset]);

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const ref = touchStartRef.current;

    // 縮放回到 1 以下時重置偏移
    if (scale <= 1.01) {
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
    }

    // 單指輕觸（未移動）當作點擊 — 手動觸發以避免 touch-action:none 的 click 延遲/失效
    if (
      !ref.moved &&
      e.changedTouches.length === 1 &&
      Date.now() - ref.tapStartTime < 300 &&
      onCellClick
    ) {
      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
      const cellEl = el?.closest('[data-cell-id]') as HTMLElement | null;
      if (cellEl) {
        const cellId = Number(cellEl.dataset.cellId);
        if (!Number.isNaN(cellId)) {
          onCellClick(cellId);
        }
      }
    }

    ref.isGesturing = false;
  }, [scale, onCellClick]);

  // Build a lookup for boardCells (random board overrides)
  const boardCellMap = useMemo(() => {
    const map = new Map<number, CellConfig>();
    if (boardCells && boardCells.length > 0) {
      for (const c of boardCells) {
        map.set(c.id, c);
      }
    }
    return map;
  }, [boardCells]);

  // Group NPCs by cell position for efficient rendering
  const npcsByCell = useMemo(() => {
    const map = new Map<number, NpcEntity[]>();
    if (npcs && npcs.length > 0) {
      for (const npc of npcs) {
        const list = map.get(npc.cellId) ?? [];
        list.push(npc);
        map.set(npc.cellId, list);
      }
    }
    return map;
  }, [npcs]);

  // Group players by cell position for efficient rendering
  const playersByCell = useMemo(() => {
    const map = new Map<number, PlayerState[]>();
    for (const p of players) {
      const list = map.get(p.position) ?? [];
      list.push(p);
      map.set(p.position, list);
    }
    return map;
  }, [players]);

  // ===== #16 地產鏈×3 可視化：計算已齊全套裝 =====
  const completedSets = useMemo(() => {
    const set = new Set<string>();
    for (const s of SETS) {
      if (s.cells.length === 0) continue;
      const firstOwner = properties[s.cells[0]]?.owner;
      if (firstOwner === undefined) continue;
      const allOwned = s.cells.every((cid: number) => properties[cid]?.owner === firstOwner);
      if (allOwned) {
        set.add(s.id);
      }
    }
    return set;
  }, [properties]);

  // ===== #17 區域霸權檢測 =====
  const { edgeDominance, cellToEdge } = useMemo(() => {
    const dominance = new Map<string, number>();
    const cellEdgeMap = new Map<number, string>();
    for (const [edge, cellIds] of Object.entries(EDGE_PROPERTY_CELLS)) {
      for (const cid of cellIds) {
        cellEdgeMap.set(cid, edge);
      }
      const ownedCells = cellIds.filter((cid: number) => properties[cid]?.owner !== undefined);
      if (ownedCells.length === 0) continue;
      const counts = new Map<number, number>();
      for (const cid of ownedCells) {
        const o = properties[cid].owner;
        counts.set(o, (counts.get(o) ?? 0) + 1);
      }
      let maxPlayer = -1;
      let maxCount = 0;
      for (const [pIdx, cnt] of counts) {
        if (cnt > maxCount) {
          maxCount = cnt;
          maxPlayer = pIdx;
        }
      }
      if (maxCount > ownedCells.length / 2) {
        dominance.set(edge, maxPlayer);
      }
    }
    return { edgeDominance: dominance, cellToEdge: cellEdgeMap };
  }, [properties]);

  // 每格衍生資料：計算給 BoardCell 使用，保持引用穩定
  const cellDerivedData = useMemo(() => {
    const data = new Map<number, {
      resolvedCell: CellConfig;
      ownerIndex: number | undefined;
      ownerColorHex: string;
      propertyData: { buildings: BuildingLevel; isMortgaged: boolean; owner: number; evolutionLevel: number } | null;
      cellPlayers: PlayerState[];
      cellNpcs: NpcEntity[];
      cellEffect: TemporaryCellEffect | undefined;
      hasSetBonus: boolean;
      isDominantCell: boolean;
      dominantColor: string | null;
      dominantPlayerName: string | null;
      controllingColor: string | null;
      controllingPlayerName: string | null;
      futurePlayerName: string | null;
      futureDeposit: number | undefined;
      evolutionLevel: number;
      treasureHere: boolean;
      treasureDropHere: boolean;
      isFlooded: boolean;
      setColor: string;
    }>();

    for (const cell of CELLS) {
      const override = boardCellMap.get(cell.id);
      const resolvedCell = override ?? cell;

      const owner = ownedProperties[resolvedCell.id];
      const prop = properties[resolvedCell.id];
      const ownerPlayer = owner !== undefined ? players[owner] : undefined;
      const ownerColorHex = ownerPlayer
        ? PLAYER_COLOR_HEX[ownerPlayer.color]
        : 'transparent';

      const propertyData = prop
        ? {
            buildings: prop.buildings ?? 0,
            isMortgaged: prop.isMortgaged ?? false,
            owner: prop.owner,
            evolutionLevel: prop.evolutionLevel ?? 0,
          }
        : null;

      const cellPlayers = playersByCell.get(resolvedCell.id) ?? [];
      const cellNpcs = npcsByCell.get(resolvedCell.id) ?? [];
      const cellEffect = cellEffects?.[resolvedCell.id];

      const setId = resolvedCell.type === 'property' ? resolvedCell.setId : undefined;
      const hasSetBonus = setId ? completedSets.has(setId) : false;

      const cellEdge = cellToEdge.get(resolvedCell.id);
      const dominantPlayerIndex = cellEdge ? edgeDominance.get(cellEdge) ?? -1 : -1;
      const isDominantCell =
        resolvedCell.type === 'property' &&
        dominantPlayerIndex >= 0 &&
        prop?.owner === dominantPlayerIndex;
      const dominantPlayer = dominantPlayerIndex >= 0 ? players[dominantPlayerIndex] : undefined;
      const dominantColor = dominantPlayer
        ? PLAYER_COLOR_HEX[dominantPlayer.color]
        : null;

      const controllingInfo = controllingCells?.[resolvedCell.id];
      const controllingPlayer = controllingInfo
        ? players[controllingInfo.playerIndex]
        : undefined;
      const controllingColor = controllingPlayer
        ? PLAYER_COLOR_HEX[controllingPlayer.color]
        : null;

      const futureInfo = gameState.propertyFutures?.[resolvedCell.id];
      const futurePlayer = futureInfo ? players[futureInfo.playerIndex] : undefined;

      const evolutionLevel = prop?.evolutionLevel ?? 0;

      const treasureHere = gameState.treasureMode?.treasurePosition === resolvedCell.id;
      const treasureDropHere = gameState.treasureMode?.treasureDropPosition === resolvedCell.id;

      const isFlooded =
        disaster?.type === 'flood' &&
        disaster.active &&
        disaster.affectedCells.includes(resolvedCell.id);

      const setColor = resolvedCell.type === 'property' ? resolvedCell.color : 'transparent';

      data.set(cell.id, {
        resolvedCell,
        ownerIndex: owner,
        ownerColorHex,
        propertyData,
        cellPlayers,
        cellNpcs,
        cellEffect,
        hasSetBonus,
        isDominantCell,
        dominantColor,
        dominantPlayerName: dominantPlayer?.name ?? null,
        controllingColor,
        controllingPlayerName: controllingPlayer?.name ?? null,
        futurePlayerName: futurePlayer?.name ?? null,
        futureDeposit: futureInfo?.deposit,
        evolutionLevel,
        treasureHere,
        treasureDropHere,
        isFlooded,
        setColor,
      });
    }
    return data;
  }, [boardCellMap, playersByCell, npcsByCell, completedSets, cellToEdge, edgeDominance, players, ownedProperties, properties, cellEffects, controllingCells, gameState.propertyFutures, gameState.treasureMode, disaster]);

  // 跳躍中的玩家資訊
  const jumpingPlayer = useMemo(() => {
    if (!tokenAnim) return null;
    return players[tokenAnim.playerIndex] ?? null;
  }, [tokenAnim, players]);

  // 跳躍動畫中的棋子顏色
  const jumpingColorHex = jumpingPlayer ? PLAYER_COLOR_HEX[jumpingPlayer.color] : 'transparent';
  const jumpingSkin: PawnSkinType = jumpingPlayer
    ? (pawnSkins?.[jumpingPlayer.playerIndex] ?? 'default')
    : 'default';
  const jumpingIsEmperor = jumpingPlayer
    ? gameState.emperorMode?.emperorIndex === jumpingPlayer.playerIndex
    : false;
  const jumpingCarriesTreasure = jumpingPlayer
    ? gameState.treasureMode?.treasureCarrier === jumpingPlayer.playerIndex
    : false;
  const jumpingPetIcon = jumpingPlayer?.equippedPet
    ? PETS[jumpingPlayer.equippedPet as PetType]?.icon
    : undefined;
  const jumpingPetColor = jumpingPlayer?.equippedPet
    ? PETS[jumpingPlayer.equippedPet as PetType]?.color
    : undefined;

  // 競速模式圈數HUD
  const raceMode = gameState.raceMode;

  return (
    <div className="w-full max-w-[640px] mx-auto">
      {/* 競速模式圈數進度條 */}
      {raceMode && (
        <div
          className="mb-3 p-3 rounded-lg cyber-card"
          style={{
            border: '1px solid var(--cyan)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="font-cyber text-xs md:text-sm tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 4px var(--cyan-glow)',
              }}
            >
              競速模式 · 目標 {raceMode.requiredLaps} 圈
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {players.map((p: PlayerState, idx: number) => {
              const laps = raceMode.lapsCompleted[idx] ?? 0;
              const progress = Math.min(
                100,
                (laps / raceMode.requiredLaps) * 100,
              );
              const playerColor = PLAYER_COLOR_HEX[p.color];
              const isFinished = laps >= raceMode.requiredLaps;
              return (
                <div key={p.playerIndex} className="flex items-center gap-2">
                  <span
                    className="text-[10px] md:text-xs font-cyber tracking-wider flex-shrink-0 w-16 truncate"
                    style={{ color: playerColor }}
                  >
                    {p.name}
                  </span>
                  <div
                    className="flex-1 h-2 md:h-2.5 rounded-full overflow-hidden relative"
                    style={{ backgroundColor: 'var(--bg-mid)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: playerColor,
                        boxShadow: `0 0 6px ${playerColor}`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] md:text-xs font-cyber tracking-wider flex-shrink-0 w-12 text-right"
                    style={{
                      color: isFinished ? 'var(--green)' : playerColor,
                      textShadow: isFinished
                        ? '0 0 4px var(--green)'
                        : `0 0 4px ${playerColor}40`,
                    }}
                  >
                    {laps}/{raceMode.requiredLaps} 圈
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="w-full max-w-[640px] mx-auto aspect-square overflow-hidden p-3 -m-3"
        ref={boardRef}
        onTouchStart={isTouch ? handleTouchStart : undefined}
        onTouchMove={isTouch ? handleTouchMove : undefined}
        onTouchEnd={isTouch ? handleTouchEnd : undefined}
      style={{
        touchAction: isTouch ? 'none' : 'auto',
        outline: gameState.parallelWorld?.active
          ? '2px dashed #60a5fa'
          : undefined,
        outlineOffset: '2px',
        animation: gameState.parallelWorld?.active
          ? 'parallel-pulse 1.5s ease-in-out infinite'
          : undefined,
        borderRadius: '8px',
      }}
    >
      <div
        ref={boardInnerRef}
        className="relative w-full h-full"
        style={{
          transform: `translate(${offsetX + cameraOffsetX}%, ${offsetY + cameraOffsetY}%) scale(${scale * cameraZoom})`,
          transformOrigin: 'center center',
          transition: cameraTransition,
        }}
      >
      <div
        className="relative w-full h-full grid grid-cols-10 grid-rows-10 gap-0.5 p-2 rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, var(--board-frame-from), var(--board-frame-to))",
          boxShadow:
            "0 0 20px var(--board-frame-glow), inset 0 0 20px var(--board-frame-inner-shadow)",
          border: "1px solid var(--board-frame-border)",
        }}
      >
        {/* 36 perimeter cells */}
        {CELLS.map((cell) => {
          const derived = cellDerivedData.get(cell.id);
          if (!derived) return null;
          return (
            <BoardCell
              key={cell.id}
              cell={cell}
              resolvedCell={derived.resolvedCell}
              ownerIndex={derived.ownerIndex}
              ownerColorHex={derived.ownerColorHex}
              propertyData={derived.propertyData}
              cellPlayers={derived.cellPlayers}
              cellNpcs={derived.cellNpcs}
              cellEffect={derived.cellEffect}
              players={players}
              pawnSkins={pawnSkins}
              currentPlayerIndex={currentPlayerIndex}
              phase={phase}
              targetMode={targetMode}
              targetPlayerIndex={targetPlayerIndex}
              onCellClick={onCellClick}
              hasSetBonus={derived.hasSetBonus}
              isDominantCell={derived.isDominantCell}
              dominantColor={derived.dominantColor}
              dominantPlayerName={derived.dominantPlayerName ?? undefined}
              controllingColor={derived.controllingColor}
              controllingPlayerName={derived.controllingPlayerName ?? undefined}
              futurePlayerName={derived.futurePlayerName ?? undefined}
              futureDeposit={derived.futureDeposit}
              evolutionLevel={derived.evolutionLevel}
              treasureHere={derived.treasureHere}
              treasureDropHere={derived.treasureDropHere}
              isFlooded={derived.isFlooded}
              tokenAnimPlayerIndex={tokenAnim ? tokenAnim.playerIndex : null}
              setColor={derived.setColor}
            />
          );
        })}

        {/* Center area */}
        <div
          className="row-start-2 row-end-10 col-start-2 col-end-10 flex flex-col items-center justify-center gap-2 md:gap-3"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--board-center-from), var(--board-center-to))",
            border: "1px solid var(--board-center-border)",
          }}
        >
          <div className="text-neon-cyan font-cyber text-lg md:text-2xl tracking-widest text-center">
            CYBER
          </div>
          <div className="text-neon-pink font-cyber text-lg md:text-2xl tracking-widest text-center">
            MONOPOLY
          </div>
          <div
            className="text-xs md:text-sm text-[var(--text-secondary)] font-cyber tracking-wider mt-1 px-3 py-1 border border-[var(--border-neon-cyan)] rounded"
            style={{ boxShadow: "0 0 8px var(--board-mode-shadow)" }}
          >
            {MODE_LABELS[gameState.mode]}
          </div>
          {gameState.winner !== null && (
            <div className="text-neon-green font-cyber text-sm md:text-base mt-2 pulse-glow">
              {gameState.players[gameState.winner].name} 獲勝!
            </div>
          )}
        </div>
       </div>

       {/* 天氣粒子層 */}
       {weather && (
         <WeatherParticles weather={weather} active={true} />
       )}

       {/* 棋子跳躍動畫獨立渲染層 */}
       {jumpingPlayer && jumpingPawnStyle && (
         <div
           className="absolute pointer-events-none z-40"
           style={{
             ...jumpingPawnStyle,
             perspective: '500px',
             transformStyle: 'preserve-3d',
           }}
         >
            <div
              className="absolute bottom-1 right-1 flex items-end justify-end"
              style={{
                animation: 'pawn-jump 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 拖尾残影：三層延遲漸變 */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: PLAYER_COLOR_HEX[jumpingPlayer.color],
                  opacity: 0.5,
                  filter: 'blur(4px)',
                  transform: 'scale(1)',
                  animation: 'pawn-trail 250ms ease-out forwards',
                  animationDelay: '0ms',
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: PLAYER_COLOR_HEX[jumpingPlayer.color],
                  opacity: 0.35,
                  filter: 'blur(4px)',
                  transform: 'scale(0.9)',
                  animation: 'pawn-trail 250ms ease-out forwards',
                  animationDelay: '60ms',
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: PLAYER_COLOR_HEX[jumpingPlayer.color],
                  opacity: 0.2,
                  filter: 'blur(4px)',
                  transform: 'scale(0.8)',
                  animation: 'pawn-trail 250ms ease-out forwards',
                  animationDelay: '120ms',
                }}
              />
              <PlayerToken
                player={jumpingPlayer}
                currentPlayerIndex={currentPlayerIndex}
                colorHex={jumpingColorHex}
                skin={jumpingSkin}
                isEmperor={jumpingIsEmperor}
                carriesTreasure={jumpingCarriesTreasure}
                petIcon={jumpingPetIcon}
                petColor={jumpingPetColor}
              />
            </div>
         </div>
       )}
       </div>
     </div>
      </div>
    );
};

// 平行世界脈衝動畫樣式
const parallelStyle = document.createElement('style');
parallelStyle.textContent = `
  @keyframes parallel-pulse {
    0%, 100% { outline-color: rgba(96, 165, 250, 0.4); box-shadow: 0 0 10px rgba(96, 165, 250, 0.2); }
    50% { outline-color: rgba(96, 165, 250, 1); box-shadow: 0 0 20px rgba(96, 165, 250, 0.5), 0 0 40px rgba(96, 165, 250, 0.3); }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(parallelStyle);

// 新模式棋盤動畫樣式
const modeBoardStyle = document.createElement('style');
modeBoardStyle.textContent = `
  @keyframes treasure-cell-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.85; }
  }
  @keyframes treasure-drop-pulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes emperor-pawn-crown-shine {
    0%, 100% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.15); }
  }
  @keyframes treasure-pawn-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(modeBoardStyle);

export default Board;
