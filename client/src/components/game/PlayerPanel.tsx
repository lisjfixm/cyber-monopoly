import type { FC } from "react";
import { CELLS, PLAYER_COLOR_HEX, PROFESSIONS, LOAN_INTEREST_RATE, AI_PERSONALITY_CONFIG } from "@shared/game-config";
import type { PlayerState } from "@shared/api.interface";
import {
  Key,
  ShieldCheck,
  User,
  Home,
  Building2,
  Wallet,
  Wrench,
  Landmark,
  TrendingUp,
  Cpu,
  Heart,
  MapPin,
  Skull,
  Building,
  FileText,
  Scale,
  Newspaper,
  Dices,
  Palette,
  FlaskConical,
  Compass,
  Swords,
  Eye,
  Bot,
  Sparkles,
  Bike,
  Hammer,
  Database,
  Bug,
  Atom,
  Crown,
  ShoppingBag,
  Pickaxe,
} from "lucide-react";

const PROFESSION_ICON_MAP = {
  engineer: Wrench,
  banker: Landmark,
  speculator: TrendingUp,
  tycoon: Building2,
  hacker: Cpu,
  doctor: Heart,
  lawyer: Scale,
  journalist: Newspaper,
  gambler: Dices,
  artist: Palette,
  scientist: FlaskConical,
  traveler: Compass,
  cyber_hacker: Bug,
  quantum_physicist: Atom,
  influencer: Crown,
  black_market_dealer: ShoppingBag,
  cyberborg: Bot,
  blockchain_miner: Pickaxe,
} as const;

interface PlayerPanelProps {
  player: PlayerState;
  isCurrent: boolean;
  position: number;
  isCustom?: boolean;
  isMe?: boolean;
  propertyCount?: number;
  bondIssuedCount?: number;
  bondHeldCount?: number;
  reputation?: number;
  isAtWar?: boolean;
  isSpied?: boolean;
  isRobotActive?: boolean;
  isInParallelWorld?: boolean;
  buildingMaterials?: number;
  hasMounts?: boolean;
  resources?: number; // 資源爭奪模式：數據資源點數
  // 新模式視覺狀態
  isBoss?: boolean;
  isEmperor?: boolean;
  carriesTreasure?: boolean;
  paysTax?: boolean;
  showHealth?: boolean;
  isDarkHidden?: boolean;
}

const PlayerPanel: FC<PlayerPanelProps> = ({
  player,
  isCurrent,
  position,
  isCustom = false,
  isMe = false,
  propertyCount = 0,
  bondIssuedCount = 0,
  bondHeldCount = 0,
  reputation,
  isAtWar = false,
  isSpied = false,
  isRobotActive = false,
  isInParallelWorld = false,
  buildingMaterials = 0,
  hasMounts = false,
  resources = 0,
  isBoss = false,
  isEmperor = false,
  carriesTreasure = false,
  paysTax = false,
  showHealth = false,
  isDarkHidden = false,
}) => {
  const repValue = reputation ?? player.reputation;
  const showReputation = repValue !== undefined;
  const cell = CELLS[position];
  const colorHex = PLAYER_COLOR_HEX[player.color] ?? player.color ?? '#ffffff';
  const glowColor = `${colorHex}66`;
  const isBankrupt = player.isBankrupt;
  const totalBuildings = (player.totalHouses ?? 0) + (player.totalHotels ?? 0);

  const healthValue = player.health ?? null;
  const showHealthBar = showHealth && healthValue !== null;
  const healthColor =
    healthValue === null
      ? "#10b981"
      : healthValue > 60
      ? "#10b981"
      : healthValue >= 30
      ? "#fbbf24"
      : "#ef4444";

  return (
    <div
      className={`relative cyber-card rounded-lg p-3 md:p-4 transition-all duration-300 ${
        isCurrent ? "scale-[1.02]" : "opacity-80"
      } ${isBankrupt ? "grayscale opacity-60" : ""} ${
        isDarkHidden ? "opacity-60" : ""
      }`}
      style={{
        borderColor: isBoss
          ? "#ef4444"
          : isCurrent
          ? colorHex
          : "var(--border-neon-cyan)",
        boxShadow: isBoss
          ? "0 0 20px rgba(239, 68, 68, 0.6), inset 0 0 15px rgba(239, 68, 68, 0.3)"
          : isCurrent
          ? `0 0 15px ${glowColor}, inset 0 0 15px ${glowColor}`
          : "none",
      }}
    >
      {/* Current turn indicator */}
      {isCurrent && !isBankrupt && (
        <div
          className="absolute -top-2 left-4 px-2 py-0.5 text-[10px] font-cyber tracking-wider rounded"
          style={{
            backgroundColor: "var(--bg-deep)",
            color: colorHex,
            border: `1px solid ${colorHex}`,
            textShadow: `0 0 8px ${glowColor}`,
          }}
        >
          當前回合
        </div>
      )}

      {/* Bankrupt badge */}
      {isBankrupt && (
        <div
          className="absolute -top-2 right-4 px-2 py-0.5 text-[10px] font-cyber tracking-wider rounded flex items-center gap-1"
          style={{
            backgroundColor: "var(--bg-deep)",
            color: "var(--text-secondary)",
            border: "1px solid var(--text-muted)",
          }}
        >
          <Skull className="w-3 h-3" />
          已破產
        </div>
      )}

      {/* Header: avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {/* Boss 皇冠 */}
          {isBoss && (
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-base md:text-lg z-10"
              style={{
                filter:
                  "drop-shadow(0 0 4px #ef4444) drop-shadow(0 0 8px #ef4444)",
                animation: "boss-crown-pulse 1.5s ease-in-out infinite",
              }}
            >
              首領
            </div>
          )}
          {/* 皇帝皇冠 */}
          {isEmperor && (
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-base md:text-lg z-10"
              style={{
                background:
                  "linear-gradient(135deg, #a855f7, #fbbf24, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter:
                  "drop-shadow(0 0 4px #a855f7) drop-shadow(0 0 8px #fbbf24)",
                animation: "emperor-crown-shine 2s ease-in-out infinite",
              }}
             >
               皇帝
             </div>
           )}
           <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
              isBoss ? "boss-avatar-glow" : ""
            }`}
            style={{
              backgroundColor: "var(--bg-mid)",
              border: isBoss ? "3px solid #ef4444" : `2px solid ${colorHex}`,
              boxShadow: isBoss
                ? "0 0 15px #ef4444, 0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 8px rgba(239, 68, 68, 0.4)"
                : `0 0 10px ${glowColor}`,
            }}
          >
            <User
              className="w-5 h-5 md:w-6 md:h-6"
              style={{ color: isBoss ? "#ef4444" : colorHex }}
            />
          </div>
        </div>

        {/* Name area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-cyber text-sm md:text-base tracking-wider truncate"
              style={{ color: colorHex, textShadow: `0 0 6px ${glowColor}` }}
            >
              {player.name}
            </span>
            {/* 寶藏圖示 */}
            {carriesTreasure && (
              <span
                title="攜帶寶藏"
                className="flex-shrink-0 text-sm md:text-base"
                style={{
                  filter:
                    "drop-shadow(0 0 4px #fbbf24) drop-shadow(0 0 8px #fbbf24)",
                  animation: "treasure-pulse 1.2s ease-in-out infinite",
                }}
              >
                 寶
               </span>
             )}
            {/* 納稅圖示 */}
            {paysTax && (
              <span
                title="納稅中"
                className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider"
                style={{
                  backgroundColor: "rgba(251, 191, 36, 0.15)",
                  border: "1px solid #fbbf24",
                  color: "#fbbf24",
                  textShadow: "0 0 4px rgba(251, 191, 36, 0.6)",
                }}
              >
                納稅中
              </span>
            )}
            {isMe && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider flex-shrink-0"
                style={{
                  backgroundColor: "var(--cyan)",
                  color: "var(--bg-deep)",
                  fontWeight: "bold",
                }}
              >
                我
              </span>
            )}
            {isAtWar && (
              <span title="戰爭中">
                <Swords
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: "var(--red)",
                    filter: "drop-shadow(0 0 4px var(--red))",
                  }}
                />
              </span>
            )}
            {isSpied && (
              <span title="被間諜中">
                <Eye
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: "var(--purple)",
                    filter: "drop-shadow(0 0 4px var(--purple))",
                  }}
                />
              </span>
            )}
            {isRobotActive && (
              <span title="AI 代打中">
                <Bot
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: "var(--cyan)",
                    filter: "drop-shadow(0 0 4px var(--cyan))",
                  }}
                />
              </span>
            )}
            {isInParallelWorld && (
              <span title="平行世界中">
                <Sparkles
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: "#60a5fa",
                    filter: "drop-shadow(0 0 4px #60a5fa)",
                  }}
                />
              </span>
            )}
            {hasMounts && (
              <span title="已解鎖坐騎">
                <Bike
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: "#fbbf24",
                    filter: "drop-shadow(0 0 4px #fbbf24)",
                  }}
                />
              </span>
            )}
            {player.isAI && (
              <div className="flex items-center gap-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider flex-shrink-0"
                  style={{
                    backgroundColor: "var(--purple)",
                    color: "white",
                    textShadow: "0 0 4px var(--purple)",
                  }}
                >
                  AI
                </span>
                {player.aiPersonality &&
                  player.aiPersonality in AI_PERSONALITY_CONFIG && (
                    <span
                      className="text-[9px] px-1 py-0.5 rounded font-cyber tracking-wider flex-shrink-0"
                      title={
                        AI_PERSONALITY_CONFIG[player.aiPersonality]
                          .description
                      }
                      style={{
                        border: `1px solid ${AI_PERSONALITY_CONFIG[player.aiPersonality].color}`,
                        color:
                          AI_PERSONALITY_CONFIG[player.aiPersonality].color,
                        backgroundColor: `${AI_PERSONALITY_CONFIG[player.aiPersonality].color}15`,
                        textShadow: `0 0 4px ${AI_PERSONALITY_CONFIG[player.aiPersonality].color}80`,
                      }}
                    >
                      {AI_PERSONALITY_CONFIG[player.aiPersonality].name}
                    </span>
                  )}
              </div>
            )}
            {isCustom && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider flex-shrink-0"
                style={{
                  border: "1px solid var(--pink)",
                  color: "var(--pink)",
                  backgroundColor:
                    "color-mix(in srgb, var(--pink) 10%, transparent)",
                  textShadow:
                    "0 0 4px color-mix(in srgb, var(--pink) 50%, transparent)",
                }}
              >
                自定義
              </span>
            )}
          </div>

          {/* Profession */}
          {player.profession && (
            <div
              className="flex items-center gap-1 mt-1.5"
              title={PROFESSIONS[player.profession]?.description}
            >
              {(() => {
                const profConfig = PROFESSIONS[player.profession];
                if (!profConfig) return null;
                const ProfIcon = PROFESSION_ICON_MAP[player.profession];
                return (
                  <>
                    <ProfIcon
                      className="w-3 h-3 md:w-3.5 md:h-3.5"
                      style={{ color: profConfig.color }}
                    />
                    <span
                      className="text-[10px] font-cyber tracking-wider"
                      style={{
                        color: profConfig.color,
                        textShadow: `0 0 4px ${profConfig.color}80`,
                      }}
                    >
                      {profConfig.name}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          {/* 生命值條（生存模式） */}
          {showHealthBar && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="text-[10px] font-cyber tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  HP
                </span>
                <span
                  className="text-[10px] font-cyber tracking-wider"
                  style={{
                    color: healthColor,
                    textShadow: `0 0 4px ${healthColor}`,
                  }}
                >
                  {healthValue}/100
                </span>
              </div>
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--bg-mid)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, healthValue as number),
                    )}%`,
                    backgroundColor: healthColor,
                    boxShadow: `0 0 6px ${healthColor}`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Money */}
      <div className="mb-2">
        <div className="text-[10px] md:text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
          現金
        </div>
        <div
          className="font-cyber text-xl md:text-2xl tracking-wider"
          style={{
            color: colorHex,
            textShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`,
          }}
        >
          {isDarkHidden ? "???" : `¥${(player.money ?? 0).toLocaleString()}`}
        </div>
      </div>

      {/* Loan */}
      {player.loan !== undefined && player.loan > 0 && !isDarkHidden && (
        <div className="mb-2">
          <div className="text-[10px] md:text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5">
            貸款餘額
          </div>
          <div
            className="font-cyber text-sm md:text-base tracking-wider"
            style={{
              color: "var(--red)",
              textShadow:
                "0 0 6px var(--red), 0 0 12px rgba(255, 0, 0, 0.5)",
            }}
          >
            -¥{player.loan.toLocaleString()}
          </div>
          <div
            className="text-[10px] font-cyber tracking-wider mt-0.5"
            style={{ color: "var(--red)" }}
          >
            下期利息：
            ¥{Math.ceil((player.loan ?? 0) * LOAN_INTEREST_RATE).toLocaleString()}
          </div>
        </div>
      )}

      {/* Total Assets */}
      <div className="mb-2">
        <div className="text-[10px] md:text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
          總資產
        </div>
        <div
          className="font-cyber text-base md:text-lg tracking-wider"
          style={{
            color: "var(--yellow)",
            textShadow:
              "0 0 6px color-mix(in srgb, var(--yellow) 60%, transparent), 0 0 12px color-mix(in srgb, var(--yellow) 30%, transparent)",
          }}
        >
          <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1" />
          {isDarkHidden
            ? "???"
            : `¥${(player.totalAssets ?? 0).toLocaleString()}`}
        </div>
      </div>

      {/* 聲望條 */}
      {showReputation && !isDarkHidden && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              聲望
            </span>
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider"
              style={{
                color:
                  repValue < 30
                    ? "var(--red)"
                    : repValue <= 70
                    ? "var(--yellow)"
                    : "var(--green)",
                textShadow:
                  repValue < 30
                    ? "0 0 4px var(--red)"
                    : repValue <= 70
                    ? "0 0 4px var(--yellow)"
                    : "0 0 4px var(--green)",
              }}
            >
              {repValue < 30
                ? "惡名昭彰"
                : repValue <= 70
                ? "普通"
                : "聲名遠播"}
            </span>
          </div>
          <div
            className="relative h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-mid)" }}
          >
            <div
              className={`reputation-bar-fill h-full rounded-full ${
                repValue < 30
                  ? "low"
                  : repValue <= 70
                  ? "mid"
                  : "high"
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, repValue))}%`,
              }}
            />
          </div>
          <div className="text-right mt-0.5">
            <span
              className="text-[9px] md:text-[10px] font-cyber"
              style={{ color: "var(--text-secondary)" }}
            >
              {repValue}/100
            </span>
          </div>
        </div>
      )}

      {/* Property & Buildings count */}
      {!isDarkHidden && (
        <div className="mb-2 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin
              className="w-3 h-3 md:w-3.5 md:h-3.5"
              style={{ color: colorHex }}
            />
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider"
              style={{
                color: colorHex,
                textShadow: `0 0 4px ${glowColor}`,
              }}
            >
              地產 x{propertyCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Building
              className="w-3 h-3 md:w-3.5 md:h-3.5"
              style={{ color: "var(--cyan)" }}
            />
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider"
              style={{
                color: "var(--cyan)",
                textShadow: "0 0 4px var(--cyan-glow)",
              }}
            >
              建築 x{totalBuildings}
            </span>
          </div>
          {(bondIssuedCount > 0 || bondHeldCount > 0) && (
            <div className="flex items-center gap-1">
              <FileText
                className="w-3 h-3 md:w-3.5 md:h-3.5"
                style={{ color: "hsl(45, 100%, 60%)" }}
              />
              <span
                className="text-[10px] md:text-xs font-cyber tracking-wider"
                style={{
                  color: "hsl(45, 100%, 60%)",
                  textShadow: "0 0 4px hsla(45, 100%, 60%, 0.6)",
                }}
              >
                債券：發{bondIssuedCount}/持{bondHeldCount}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status info */}
      <div className="mb-3 space-y-1.5">
        {/* Completed sets */}
        {!isDarkHidden && (
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider"
              style={{
                color: "var(--purple)",
                textShadow:
                  "0 0 6px color-mix(in srgb, var(--purple) 50%, transparent)",
              }}
            >
              集齊系列：{player.completeSets ?? 0}/10
            </span>
          </div>
        )}

        {/* Properties: houses + hotels */}
        {!isDarkHidden && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Home
                className="w-3 h-3 md:w-3.5 md:h-3.5"
                style={{ color: "var(--cyan)" }}
              />
              <span
                className="text-[10px] md:text-xs font-cyber tracking-wider"
                style={{
                  color: "var(--cyan)",
                  textShadow: "0 0 4px var(--cyan-glow)",
                }}
              >
                 房屋 x{player.totalHouses ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Building2
                className="w-3 h-3 md:w-3.5 md:h-3.5"
                style={{ color: "var(--pink)" }}
              />
              <span
                className="text-[10px] md:text-xs font-cyber tracking-wider"
                style={{
                  color: "var(--pink)",
                  textShadow: "0 0 4px var(--pink-glow)",
                }}
              >
                 酒店 x{player.totalHotels ?? 0}
              </span>
            </div>
            {buildingMaterials > 0 && (
              <div className="flex items-center gap-1">
                <Hammer
                  className="w-3 h-3"
                  style={{ color: "#fbbf24" }}
                />
                <span
                  className="text-[10px] md:text-xs"
                  style={{ color: "#fbbf24" }}
                >
                  建材 x{buildingMaterials}
                </span>
              </div>
            )}
            {resources > 0 && (
              <div className="flex items-center gap-1">
                <Database
                  className="w-3 h-3"
                  style={{ color: "var(--green)" }}
                />
                <span
                  className="text-[10px] md:text-xs font-cyber"
                  style={{ color: "var(--green)" }}
                >
                  資源 x{resources}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Detention status */}
        {player.isInDetention && (
          <div className="flex items-center gap-1.5">
            <ShieldCheck
              className="w-3 h-3 md:w-3.5 md:h-3.5"
              style={{ color: "var(--purple)" }}
            />
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider"
              style={{
                color: "var(--purple)",
                textShadow:
                  "0 0 8px color-mix(in srgb, var(--purple) 60%, transparent)",
              }}
            >
               監禁中（第{player.detentionTurns ?? 0}回合）
            </span>
          </div>
        )}

        {/* Get out of jail free card */}
        {player.hasGetOutOfJailCard && !isDarkHidden && (
          <div className="flex items-center gap-1.5">
            <Key
              className="w-3 h-3 md:w-3.5 md:h-3.5"
              style={{ color: "var(--green)" }}
            />
            <span
              className="text-[10px] md:text-xs font-cyber tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color: "var(--green)",
                border: "1px solid var(--green)",
                backgroundColor:
                  "color-mix(in srgb, var(--green) 10%, transparent)",
                textShadow: "0 0 6px var(--green), 0 0 12px var(--green)",
                boxShadow:
                  "0 0 8px color-mix(in srgb, var(--green) 40%, transparent), inset 0 0 4px color-mix(in srgb, var(--green) 20%, transparent)",
              }}
            >
              免費出獄卡
            </span>
          </div>
        )}
      </div>

      {/* Position */}
      <div>
        <div className="text-[10px] md:text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
          當前位置
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{
              backgroundColor: cell?.color || "var(--text-muted)",
              boxShadow: `0 0 6px ${cell?.color || "var(--text-muted)"}`,
            }}
          />
          <span className="text-sm text-[var(--text-primary)] truncate">
            {isDarkHidden ? "???" : cell?.name || "未知"}
          </span>
        </div>
      </div>

      {/* 黑暗模式問號遮罩 */}
      {isDarkHidden && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center rounded-lg"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)",
          }}
        >
          <span
            className="text-4xl font-cyber tracking-widest"
            style={{
              color: "var(--text-secondary)",
              textShadow: "0 0 10px var(--text-secondary)",
              opacity: 0.3,
            }}
          >
            ?
          </span>
        </div>
      )}

      {/* Color indicator bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${colorHex}, transparent)`,
        }}
      />
    </div>
  );
};

// 新模式動畫樣式
const modeAnimationsStyle = document.createElement("style");
modeAnimationsStyle.textContent = `
  @keyframes boss-crown-pulse {
    0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 0 4px #ef4444) drop-shadow(0 0 8px #ef4444); }
    50% { transform: translateX(-50%) scale(1.1); filter: drop-shadow(0 0 6px #ef4444) drop-shadow(0 0 12px #ef4444); }
  }
  @keyframes emperor-crown-shine {
    0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 0 4px #a855f7) drop-shadow(0 0 8px #fbbf24); }
    50% { transform: translateX(-50%) scale(1.08); filter: drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 12px #a855f7); }
  }
  @keyframes treasure-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.85; }
  }
  @keyframes boss-avatar-glow {
    0%, 100% { box-shadow: 0 0 15px #ef4444, 0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 8px rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 20px #ef4444, 0 0 40px rgba(239, 68, 68, 0.7), inset 0 0 12px rgba(239, 68, 68, 0.6); }
  }
  .boss-avatar-glow {
    animation: boss-avatar-glow 1.8s ease-in-out infinite;
  }
`;
if (typeof document !== "undefined")
  document.head.appendChild(modeAnimationsStyle);

export default PlayerPanel;
