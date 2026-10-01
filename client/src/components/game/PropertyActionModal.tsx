import type { FC } from "react";
import { useState } from "react";
import { CELLS, INSURANCE_RATE, SPECIAL_BUILDINGS } from "@shared/game-config";
import { getBuildingPrice, getRedeemValue, getPropertyValue } from "@shared/game-engine";
import type { GameState, BuildingLevel, SpecialBuildingType } from "@shared/api.interface";
import { X, Home, Building2, Landmark, Coins, DollarSign, Shield, Factory, FlaskConical, ChevronDown, ChevronUp, Zap, HandCoins, Sparkles } from "lucide-react";

interface PropertyActionModalProps {
  isOpen: boolean;
  cellId: number;
  gameState: GameState;
  playerIndex: number;
  canBuild: boolean;
  onBuild: () => void;
  onDemolish: () => void;
  onMortgage: () => void;
  onRedeem: () => void;
  onBuyInsurance: () => void;
  onClose: () => void;
  specialBuilding?: string | null;
  onBuildSpecial?: (type: string) => void;
  onDemolishSpecial?: () => void;
  canBuildSpecial?: boolean;
  // 強制收購（可選）
  canForceAcquire?: boolean;
  forceAcquirePrice?: number;
  marketValue?: number;
  onForceAcquire?: () => void;
  // 賄賂銀行（可選）
  canBribe?: boolean;
  bribePrice?: number;
  bribeCount?: number;
  bribeMaxCount?: number;
  onBribe?: () => void;
  // 地產進化（可選）
  canEvolve?: boolean;
  evolutionLevel?: number;
  evolutionCost?: number;
  buildingMaterials?: number;
  onEvolve?: () => void;
}

const PropertyActionModal: FC<PropertyActionModalProps> = ({
  isOpen,
  cellId,
  gameState,
  playerIndex,
  canBuild,
  onBuild,
  onDemolish,
  onMortgage,
  onRedeem,
  onBuyInsurance,
  onClose,
  specialBuilding,
  onBuildSpecial,
  onDemolishSpecial,
  canBuildSpecial,
  canForceAcquire,
  forceAcquirePrice,
  marketValue,
  onForceAcquire,
  canBribe,
  bribePrice,
  bribeCount,
  bribeMaxCount,
  onBribe,
  canEvolve,
  evolutionLevel = 0,
  evolutionCost = 3,
  buildingMaterials = 0,
  onEvolve,
}) => {
  const [showSpecialBuild, setShowSpecialBuild] = useState(false);
  const [showForceAcquireConfirm, setShowForceAcquireConfirm] = useState(false);
  const [showBribeConfirm, setShowBribeConfirm] = useState(false);
  const [showEvolveConfirm, setShowEvolveConfirm] = useState(false);
  if (!isOpen) return null;

  const cell = CELLS[cellId];
  const prop = gameState.properties[cellId];
  const player = gameState.players[playerIndex];

  if (!cell || cell.type !== "property" || !prop) return null;

  const isOwner = prop.owner === playerIndex;
  const buildings = prop.buildings;
  const isMortgaged = prop.isMortgaged;
  const isMaxLevel = buildings >= 5;
  const isInsured = prop.insured === true;
  const currentSpecialBuilding = prop.specialBuilding ?? specialBuilding ?? null;
  const hasHouses = buildings > 0;

  const buildPrice = getBuildingPrice(cellId, gameState.mode);
  const redeemPrice = getRedeemValue(cellId, gameState.mode);
  const insurancePremium = Math.floor(cell.basePrice * INSURANCE_RATE);

  const canAffordBuild = player.money >= buildPrice;
  const canAffordRedeem = player.money >= redeemPrice;

  const canBuildHouse =
    isOwner && !isMortgaged && !isMaxLevel && canAffordBuild && canBuild;
  const canDemolish = isOwner && buildings > 0 && canBuild;
  const canDoMortgage = isOwner && !isMortgaged && buildings === 0 && canBuild;
  const canDoRedeem = isOwner && isMortgaged && canAffordRedeem && canBuild;
  const canBuyInsurance =
    isOwner && !isInsured && !isMortgaged && player.money >= insurancePremium && canBuild;

  const canBuildSpecialHere =
    isOwner &&
    !isMortgaged &&
    !hasHouses &&
    !currentSpecialBuilding &&
    canBuildSpecial === true;

  const isUnowned = !isOwner && prop.owner === undefined && !isMortgaged;
  const maxBribeCount = bribeMaxCount ?? 3;
  const remainingBribes = Math.max(0, maxBribeCount - (bribeCount ?? 0));

  const ownerLabel = isOwner ? "你拥有" : "对方拥有";
  const ownerColor = isOwner
    ? player.color === "red"
      ? "var(--red)"
      : "var(--cyan)"
    : "var(--text-secondary)";

  const buildingLabel: Record<BuildingLevel, string> = {
    0: "空地",
    1: "1 栋房屋",
    2: "2 栋房屋",
    3: "3 栋房屋",
    4: "4 栋房屋",
    5: "酒店",
  };

  const nextLevelLabel: Record<BuildingLevel, string> = {
    0: "第 1 栋房屋",
    1: "第 2 栋房屋",
    2: "第 3 栋房屋",
    3: "第 4 栋房屋",
    4: "酒店",
    5: "已达最高等級",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(10, 10, 25, 0.85)",
          backdropFilter: "blur(4px)",
          animation: "fade-in 0.2s ease-out",
        }}
      >
      <div
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          border: "1px solid var(--cyan)",
          boxShadow:
            "0 0 30px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.05)",
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
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            地块操作 / PROPERTY
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: cell.color,
                boxShadow: `0 0 6px ${cell.color}`,
              }}
            />
            <h2 className="text-xl md:text-2xl font-cyber text-neon-cyan tracking-wider">
              {cell.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-3">
          {/* Owner */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: "var(--bg-mid)" }}
          >
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5" style={{ color: "var(--purple)" }} />
              <span className="text-sm text-[var(--text-secondary)]">
                所有者
              </span>
            </div>
            <span
              className="font-cyber text-sm tracking-wider"
              style={{ color: ownerColor }}
            >
              {ownerLabel}
            </span>
          </div>

          {/* Building level */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: "var(--bg-mid)" }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: "var(--cyan)" }} />
              <span className="text-sm text-[var(--text-secondary)]">
                建筑等級
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {buildings < 5 ? (
                Array.from({ length: buildings }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        prop.owner === 0 ? "var(--red)" : "var(--cyan)",
                      boxShadow: `0 0 4px ${
                        prop.owner === 0 ? "var(--red)" : "var(--cyan)"
                      }`,
                    }}
                  />
                ))
              ) : (
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-cyber font-bold"
                  style={{
                    backgroundColor:
                      prop.owner === 0 ? "var(--red)" : "var(--cyan)",
                    color: "var(--bg-deep)",
                    boxShadow: `0 0 6px ${
                      prop.owner === 0 ? "var(--red)" : "var(--cyan)"
                    }`,
                  }}
                >
                  H
                </div>
              )}
              <span
                className="ml-1 font-cyber text-sm tracking-wider"
                style={{ color: "var(--text-primary)" }}
              >
                {buildingLabel[buildings]}
              </span>
            </div>
          </div>

          {/* Mortgage status */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: "var(--bg-mid)" }}
          >
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" style={{ color: "var(--yellow)" }} />
              <span className="text-sm text-[var(--text-secondary)]">
                抵押状态
              </span>
            </div>
            <span
              className="font-cyber text-sm tracking-wider"
              style={{
                color: isMortgaged ? "var(--yellow)" : "var(--green)",
                textShadow: isMortgaged
                  ? "0 0 6px var(--yellow)"
                  : "0 0 6px var(--green)",
              }}
            >
              {isMortgaged ? "已抵押" : "正常"}
            </span>
          </div>

          {/* Next build cost */}
          {isOwner && !isMortgaged && !isMaxLevel && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(0, 255, 128, 0.05)",
                border: "1px solid rgba(0, 255, 128, 0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--green)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  建造{nextLevelLabel[buildings]}
                </span>
              </div>
              <span className="font-cyber text-base tracking-wider text-neon-green">
                ¥{buildPrice.toLocaleString()}
              </span>
            </div>
          )}

          {isOwner && !isMortgaged && isMaxLevel && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(167, 139, 250, 0.05)",
                border: "1px solid rgba(167, 139, 250, 0.2)",
              }}
            >
              <span className="text-sm" style={{ color: "var(--purple)" }}>
                已達最高建築等級（酒店）
              </span>
            </div>
          )}

          {/* Special building status */}
          {currentSpecialBuilding && canBuildSpecial !== undefined && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: 'var(--purple)' }} />
                <span className="text-sm text-[var(--text-secondary)]">
                  特殊建築
                </span>
              </div>
              <span
                className="font-cyber text-sm tracking-wider"
                style={{
                  color: 'var(--purple)',
                  textShadow: '0 0 8px var(--purple)',
                }}
              >
                {SPECIAL_BUILDINGS[currentSpecialBuilding as SpecialBuildingType]?.name ?? currentSpecialBuilding}
              </span>
            </div>
          )}

          {/* Need to demolish houses first hint */}
          {isOwner && !isMortgaged && hasHouses && !currentSpecialBuilding && canBuildSpecial === true && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 200, 0, 0.05)',
                border: '1px solid rgba(255, 200, 0, 0.2)',
              }}
            >
              <span className="text-xs" style={{ color: 'var(--yellow)' }}>
                警告：需先拆除房屋才能建造特殊建築
              </span>
            </div>
          )}

          {/* Build special building expand area */}
          {isOwner && !isMortgaged && !hasHouses && !currentSpecialBuilding && canBuildSpecial !== undefined && (
            <div>
              <button
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'var(--purple)',
                }}
                onClick={() => setShowSpecialBuild(!showSpecialBuild)}
              >
                <span className="text-sm font-cyber tracking-wide">
                  建造特殊建築
                </span>
                {showSpecialBuild ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showSpecialBuild && (
                <div className="mt-2 space-y-2">
                  {Object.values(SPECIAL_BUILDINGS).map((sb) => {
                    const canAfford = player.money >= sb.cost;
                    const canBuild = canBuildSpecialHere && canAfford;
                    const IconComp = sb.icon === 'Factory' ? Factory : sb.icon === 'FlaskConical' ? FlaskConical : Building2;
                    return (
                      <div
                        key={sb.type}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: 'var(--bg-mid)',
                          border: '1px solid rgba(168, 85, 247, 0.2)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IconComp className="w-4 h-4" style={{ color: 'var(--purple)' }} />
                          <span
                            className="font-cyber text-sm tracking-wide"
                            style={{ color: 'var(--purple)' }}
                          >
                            {sb.name}
                          </span>
                          <span className="ml-auto font-cyber text-xs" style={{ color: '#facc15' }}>
                            ¥{sb.cost.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {sb.description}
                        </div>
                        <button
                          className="w-full py-1.5 rounded text-xs font-cyber tracking-wide transition-all"
                          style={{
                            backgroundColor: canBuild ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                            border: `1px solid ${canBuild ? 'var(--purple)' : '#ffffff20'}`,
                            color: canBuild ? 'var(--purple)' : 'var(--text-secondary)',
                            boxShadow: canBuild ? '0 0 8px rgba(168, 85, 247, 0.3)' : 'none',
                            cursor: canBuild ? 'pointer' : 'not-allowed',
                          }}
                          onClick={() => canBuild && onBuildSpecial?.(sb.type)}
                          disabled={!canBuild}
                        >
                          {canAfford ? '建造' : '資金不足'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Insurance status */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: "var(--bg-mid)" }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: isInsured ? "var(--green)" : "var(--cyan)" }} />
              <span className="text-sm text-[var(--text-secondary)]">
                保險狀態
              </span>
            </div>
            <span
              className="font-cyber text-sm tracking-wider flex items-center gap-1"
              style={{
                color: isInsured ? "var(--green)" : "var(--text-secondary)",
                textShadow: isInsured
                  ? "0 0 6px var(--green)"
                  : "none",
              }}
            >
              {isInsured ? (
                <>
                  已投保 <Shield className="w-3.5 h-3.5" />
                </>
              ) : (
                "未投保"
              )}
            </span>
          </div>

          {isOwner && isMortgaged && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(255, 200, 0, 0.05)",
                border: "1px solid rgba(255, 200, 0, 0.2)",
              }}
            >
              <span className="text-sm" style={{ color: "var(--yellow)" }}>
                赎回需要：¥{redeemPrice.toLocaleString()}
              </span>
            </div>
          )}

          {isOwner && !isInsured && !isMortgaged && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(0, 200, 255, 0.05)",
                border: "1px solid rgba(0, 200, 255, 0.2)",
              }}
            >
              <span className="text-xs" style={{ color: "var(--cyan)" }}>
                保費：地價 {Math.round(INSURANCE_RATE * 100)}%（¥{insurancePremium.toLocaleString()}）
                <br />
                <span style={{ color: "var(--text-secondary)" }}>本局災難全額賠償</span>
              </span>
            </div>
          )}

          {!isOwner && !isUnowned && (
            <div
              className="p-3 rounded-lg text-center"
              style={{
                backgroundColor: "rgba(255, 77, 109, 0.05)",
                border: "1px solid rgba(255, 77, 109, 0.2)",
              }}
            >
              <span className="text-sm" style={{ color: "var(--red)" }}>
                该地块属于对方，你无法操作
              </span>
            </div>
          )}

          {/* 賄賂銀行確認卡片 */}
          {showBribeConfirm && onBribe && (
            <div
              className="p-4 rounded-lg space-y-3"
              style={{
                backgroundColor: 'rgba(128, 90, 213, 0.08)',
                border: '1px solid rgba(128, 90, 213, 0.4)',
                boxShadow: '0 0 15px rgba(128, 90, 213, 0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <HandCoins className="w-5 h-5" style={{ color: 'var(--purple)' }} />
                <span
                  className="font-cyber text-base tracking-wider"
                  style={{ color: 'var(--purple)', textShadow: '0 0 8px var(--purple)' }}
                >
                  賄賂銀行確認
                </span>
              </div>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div>目標地產：<span style={{ color: 'var(--text-primary)' }}>{cell.name}</span></div>
                <div>賄賂費用：<span style={{ color: 'var(--yellow)' }}>¥{(bribePrice ?? 0).toLocaleString()}</span>（9折買地）</div>
                <div className="text-xs pt-1 space-y-0.5">
                  <div style={{ color: 'var(--green)' }}>成功：以 9 折價格獲得地產，聲望 -3</div>
                  <div style={{ color: 'var(--red)' }}>失敗（20%）：損失賄賂金 + 罰款 ¥2,000，聲望 -20</div>
                </div>
                <div className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                  剩餘賄賂次數：{remainingBribes}/{maxBribeCount}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 py-2 rounded text-xs font-cyber tracking-wider transition-all"
                  style={{
                    border: '1px solid var(--purple)',
                    color: 'var(--purple)',
                    backgroundColor: 'rgba(128, 90, 213, 0.15)',
                    boxShadow: '0 0 8px rgba(128, 90, 213, 0.3)',
                  }}
                  onClick={() => {
                    setShowBribeConfirm(false);
                    onBribe();
                  }}
                >
                  確定賄賂
                </button>
                <button
                  className="flex-1 py-2 rounded text-xs font-cyber tracking-wider transition-all"
                  style={{
                    border: '1px solid var(--text-secondary)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => setShowBribeConfirm(false)}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 強制收購確認卡片 */}
          {showForceAcquireConfirm && onForceAcquire && (
            <div
              className="p-4 rounded-lg space-y-3"
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.08)',
                border: '1px solid rgba(255, 100, 100, 0.4)',
                boxShadow: '0 0 15px rgba(255, 100, 100, 0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: 'var(--red)' }} />
                <span
                  className="font-cyber text-base tracking-wider"
                  style={{ color: 'var(--red)', textShadow: '0 0 8px var(--red)' }}
                >
                  強制收購確認
                </span>
              </div>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div>目標地產：<span style={{ color: 'var(--text-primary)' }}>{cell.name}</span></div>
                <div>市場價值：<span style={{ color: 'var(--cyan)' }}>¥{(marketValue ?? 0).toLocaleString()}</span></div>
                <div>收購價格（1.5倍）：<span style={{ color: 'var(--red)', textShadow: '0 0 6px var(--red)' }} className="font-cyber">¥{(forceAcquirePrice ?? 0).toLocaleString()}</span></div>
                <div className="text-xs pt-1" style={{ color: 'var(--yellow)' }}>
                  警告：需持有 3 倍市價現金才能發起收購
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 py-2 rounded text-xs font-cyber tracking-wider transition-all"
                  style={{
                    border: '1px solid var(--red)',
                    color: 'var(--red)',
                    backgroundColor: 'rgba(255, 77, 109, 0.15)',
                    boxShadow: '0 0 8px rgba(255, 77, 109, 0.3)',
                  }}
                  onClick={() => {
                    setShowForceAcquireConfirm(false);
                    onForceAcquire();
                  }}
                >
                  確認收購
                </button>
                <button
                  className="flex-1 py-2 rounded text-xs font-cyber tracking-wider transition-all"
                  style={{
                    border: '1px solid var(--text-secondary)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => setShowForceAcquireConfirm(false)}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-5 py-4 border-t grid grid-cols-2 gap-3"
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          <button
            className="cyber-btn text-xs py-2.5"
            onClick={onBuild}
            disabled={!canBuildHouse}
          >
            <Home className="w-4 h-4 inline mr-1.5" />
            建房
          </button>
          <button
            className="cyber-btn cyber-btn-pink text-xs py-2.5"
            onClick={onDemolish}
            disabled={!canDemolish}
          >
            <Building2 className="w-4 h-4 inline mr-1.5" />
            拆除
          </button>
          <button
            className="cyber-btn text-xs py-2.5"
            style={{
              borderColor: "var(--yellow)",
              color: "var(--yellow)",
              background: "rgba(255, 200, 0, 0.05)",
            }}
            onClick={onMortgage}
            disabled={!canDoMortgage}
          >
            <Coins className="w-4 h-4 inline mr-1.5" />
            抵押
          </button>
          <button
            className="cyber-btn cyber-btn-pink text-xs py-2.5"
            onClick={onRedeem}
            disabled={!canDoRedeem}
          >
            <DollarSign className="w-4 h-4 inline mr-1.5" />
            赎回
          </button>
          <button
            className="cyber-btn text-xs py-2.5 col-span-2"
            style={{
              borderColor: isInsured ? "var(--green)" : "var(--cyan)",
              color: isInsured ? "var(--green)" : "var(--cyan)",
              background: isInsured
                ? "rgba(0, 255, 128, 0.08)"
                : "rgba(0, 200, 255, 0.05)",
            }}
            onClick={onBuyInsurance}
            disabled={!canBuyInsurance || isInsured}
          >
            <Shield className="w-4 h-4 inline mr-1.5" />
            {isInsured
              ? "已投保"
              : `購買保險（¥${insurancePremium.toLocaleString()}）`}
          </button>

          {/* Demolish special building */}
          {currentSpecialBuilding && isOwner && canBuild && onDemolishSpecial && canBuildSpecial !== undefined && (
            <button
              className="cyber-btn text-xs py-2.5 col-span-2"
              style={{
                borderColor: 'var(--purple)',
                color: 'var(--purple)',
                background: 'rgba(168, 85, 247, 0.08)',
              }}
              onClick={onDemolishSpecial}
            >
              <Building2 className="w-4 h-4 inline mr-1.5" />
              拆除特殊建築（退還 50%）
            </button>
          )}

          {/* 賄賂銀行按鈕（僅無主地） */}
          {onBribe && isUnowned && (
            <button
              className="cyber-btn text-xs py-2.5 col-span-2"
              style={{
                borderColor: canBribe ? 'var(--purple)' : '#ffffff20',
                color: canBribe ? 'var(--purple)' : 'var(--text-secondary)',
                background: canBribe ? 'rgba(128, 90, 213, 0.1)' : 'transparent',
                boxShadow: canBribe ? '0 0 10px rgba(128, 90, 213, 0.3)' : 'none',
              }}
              onClick={() => canBribe && setShowBribeConfirm(true)}
              disabled={!canBribe}
            >
              <HandCoins className="w-4 h-4 inline mr-1.5" />
              賄賂銀行（9折買地）
            </button>
          )}
          {onBribe && isUnowned && (
            <div className="col-span-2 text-center text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
              <div>9 折買地 · 20% 被抓罰 ¥2,000</div>
              <div>剩餘 {remainingBribes}/{maxBribeCount} 次</div>
            </div>
          )}

          {/* 強制收購按鈕 */}
          {onForceAcquire && !isOwner && buildings === 0 && !isMortgaged && (
            <button
              className="cyber-btn text-xs py-2.5 col-span-2"
              style={{
                borderColor: canForceAcquire ? 'var(--red)' : '#ffffff20',
                color: canForceAcquire ? 'var(--red)' : 'var(--text-secondary)',
                background: canForceAcquire ? 'rgba(255, 77, 109, 0.1)' : 'transparent',
                boxShadow: canForceAcquire ? '0 0 10px rgba(255, 77, 109, 0.3)' : 'none',
              }}
              onClick={() => canForceAcquire && setShowForceAcquireConfirm(true)}
              disabled={!canForceAcquire}
            >
              <Zap className="w-4 h-4 inline mr-1.5" />
              強制收購（1.5倍市價）
            </button>
          )}
          {onForceAcquire && !isOwner && buildings === 0 && !isMortgaged && (
            <div className="col-span-2 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              需 3 倍市價現金門檻，以 1.5 倍市價收購
            </div>
          )}

          {/* 地產進化按鈕 */}
          {onEvolve && isOwner && !isMortgaged && evolutionLevel < 2 && (
            <button
              className="cyber-btn text-xs py-2.5 col-span-2"
              style={{
                borderColor: canEvolve ? 'var(--gold, #ffd700)' : '#ffffff20',
                color: canEvolve ? 'var(--gold, #ffd700)' : 'var(--text-secondary)',
                background: canEvolve ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                boxShadow: canEvolve ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none',
              }}
              onClick={() => canEvolve && setShowEvolveConfirm(true)}
              disabled={!canEvolve}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              {evolutionLevel === 0
                ? `進化為商業大樓（${evolutionCost} 建材）`
                : `進化為地標（${evolutionCost} 建材）`}
            </button>
          )}
          {onEvolve && isOwner && !isMortgaged && evolutionLevel >= 2 && (
            <div className="col-span-2 text-center text-xs py-1" style={{ color: 'var(--gold, #ffd700)' }}>
              已達最終形態：地標
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--pink)]" />
      </div>
    </div>

    {showEvolveConfirm && (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
        onClick={() => setShowEvolveConfirm(false)}
      >
        <div
          className="cyber-card rounded-lg w-full max-w-sm p-5"
          onClick={(e) => e.stopPropagation()}
          style={{
            border: '1px solid var(--gold, #ffd700)',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.1)',
            animation: 'modal-in 0.2s ease-out',
          }}
        >
          <h3
            className="font-cyber text-lg tracking-wider mb-3 text-center"
            style={{ color: 'var(--gold, #ffd700)', textShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }}
          >
            確認進化
          </h3>
          <div className="space-y-2 mb-5 text-sm text-center">
            <div style={{ color: 'var(--text-secondary)' }}>
              目標地產：<span style={{ color: 'var(--text-primary)' }}>{cell.name}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              現階段：<span style={{ color: 'var(--cyan)' }}>{evolutionLevel === 0 ? '住宅（過路費 ×1.0）' : '商業大樓（過路費 ×1.2）'}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              下階段：<span style={{ color: 'var(--gold, #ffd700)' }}>{evolutionLevel === 0 ? '商業大樓（過路費 +20%）' : '地標（過路費 +50%）'}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              消耗建材：<span style={{ color: canEvolve ? 'var(--green)' : 'var(--red)' }}>{evolutionCost}</span>
              （當前 {buildingMaterials}）
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEvolveConfirm(false)}
              className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
              style={{ border: '1px solid var(--border-neon-cyan)', color: 'var(--text-secondary)' }}
            >
              取消
            </button>
            <button
              onClick={() => {
                setShowEvolveConfirm(false);
                onEvolve?.();
              }}
              disabled={!canEvolve}
              className="flex-1 py-2 rounded font-cyber text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: '1px solid var(--gold, #ffd700)',
                color: 'var(--gold, #ffd700)',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
                textShadow: '0 0 4px rgba(255, 215, 0, 0.6)',
              }}
            >
              確認進化
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PropertyActionModal;
