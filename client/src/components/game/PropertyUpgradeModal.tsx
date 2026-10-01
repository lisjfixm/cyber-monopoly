import type { FC } from "react";
import { useState, useEffect } from "react";
import { Swords, Shield, Cpu, X, Check, AlertTriangle } from "lucide-react";
import { PROPERTY_UPGRADE_PATHS } from "@shared/game-config";
import type { PropertyUpgradePath } from "@shared/api.interface";

interface PropertyUpgradeModalProps {
  isOpen: boolean;
  cellName: string;
  currentLevel: number;
  currentUpgradePath: PropertyUpgradePath | null;
  playerMoney: number;
  onChoose: (path: PropertyUpgradePath) => void;
  onClose: () => void;
}

const UPGRADE_UNLOCK_LEVEL = 3;

const PATH_ICON_MAP: Record<PropertyUpgradePath, typeof Swords> = {
  attack: Swords,
  defense: Shield,
  tech: Cpu,
};

const PATH_COLOR_MAP: Record<PropertyUpgradePath, string> = {
  attack: "hsl(0, 100%, 60%)",
  defense: "hsl(180, 100%, 50%)",
  tech: "hsl(270, 80%, 60%)",
};

const PropertyUpgradeModal: FC<PropertyUpgradeModalProps> = ({
  isOpen,
  cellName,
  currentLevel,
  currentUpgradePath,
  playerMoney,
  onChoose,
  onClose,
}) => {
  const [selectedPath, setSelectedPath] = useState<PropertyUpgradePath | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPath(null);
      setShowConfirm(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirm) {
          setShowConfirm(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, showConfirm, onClose]);

  const handleSelectPath = (path: PropertyUpgradePath) => {
    if (currentUpgradePath) return;
    setSelectedPath(path);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedPath || isProcessing) return;
    setIsProcessing(true);
    onChoose(selectedPath);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setSelectedPath(null);
  };

  if (!isOpen) return null;

  const paths: PropertyUpgradePath[] = ['attack', 'defense', 'tech'];
  const canUnlock = currentLevel >= UPGRADE_UNLOCK_LEVEL;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-deep) 88%, transparent)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
    >
      <div
        className="relative w-full max-w-lg cyber-card rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          border: "1px solid var(--purple)",
          boxShadow:
            "0 0 30px color-mix(in srgb, var(--purple) 35%, transparent), inset 0 0 20px color-mix(in srgb, var(--purple) 8%, transparent)",
          animation: "float-up 0.3s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
          style={{ color: "var(--text-secondary)" }}
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)" }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            地產進化樹 / UPGRADE TREE
          </div>
          <h2 className="text-xl md:text-2xl font-cyber tracking-wider" style={{ color: "var(--purple)", textShadow: "0 0 10px var(--purple)" }}>
            {cellName}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>目前建築等級：Lv.{currentLevel}</span>
            <span>·</span>
            <span style={{ color: canUnlock ? "var(--green)" : "var(--yellow)" }}>
              {canUnlock ? "已達解鎖條件" : `需 Lv.${UPGRADE_UNLOCK_LEVEL} 解鎖`}
            </span>
          </div>
        </div>

        {/* Current path indicator */}
        {currentUpgradePath && (
          <div
            className="px-5 py-3 border-b flex items-center gap-2"
            style={{
              borderColor: "color-mix(in srgb, var(--purple) 20%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--purple) 8%, transparent)",
            }}
          >
            <Check className="w-4 h-4" style={{ color: "var(--green)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              已選擇路線：
            </span>
            <span
              className="font-cyber text-sm tracking-wider"
              style={{
                color: PATH_COLOR_MAP[currentUpgradePath],
                textShadow: `0 0 6px ${PATH_COLOR_MAP[currentUpgradePath]}`,
              }}
            >
              {PROPERTY_UPGRADE_PATHS[currentUpgradePath].name}
            </span>
            <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
              路線一經選定不可更改
            </span>
          </div>
        )}

        {/* Content - path cards */}
        <div className="px-5 py-5 space-y-3 overflow-y-auto">
          {paths.map((pathId) => {
            const config = PROPERTY_UPGRADE_PATHS[pathId];
            const Icon = PATH_ICON_MAP[pathId];
            const color = PATH_COLOR_MAP[pathId];
            const isCurrent = currentUpgradePath === pathId;
            const isSelected = selectedPath === pathId;
            const isLocked = !canUnlock;
            const disabled = !!currentUpgradePath || isLocked;

            return (
              <button
                key={pathId}
                onClick={() => handleSelectPath(pathId)}
                disabled={disabled}
                className="w-full text-left p-4 rounded-lg transition-all duration-200 relative overflow-hidden"
                style={{
                  backgroundColor: isCurrent
                    ? "color-mix(in srgb, var(--green) 10%, transparent)"
                    : isSelected
                    ? "color-mix(in srgb, var(--cyan) 10%, transparent)"
                    : "var(--bg-mid)",
                  border: `1px solid ${isCurrent ? "var(--green)" : isSelected ? "var(--cyan)" : color}33`,
                  boxShadow: isCurrent
                    ? `0 0 15px color-mix(in srgb, var(--green) 30%, transparent), inset 0 0 10px color-mix(in srgb, var(--green) 10%, transparent)`
                    : isSelected
                    ? `0 0 15px color-mix(in srgb, var(--cyan) 30%, transparent), inset 0 0 10px color-mix(in srgb, var(--cyan) 10%, transparent)`
                    : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled && !isCurrent ? 0.5 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${color}22`,
                      border: `1px solid ${color}66`,
                      boxShadow: `0 0 10px ${color}44`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-cyber text-base tracking-wider"
                        style={{ color, textShadow: `0 0 6px ${color}88` }}
                      >
                        {config.name}
                      </span>
                      {isCurrent && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--green) 20%, transparent)",
                            color: "var(--green)",
                            border: "1px solid var(--green)",
                          }}
                        >
                          已選定
                        </span>
                      )}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                      {config.description}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${color}15`,
                          border: `1px solid ${color}33`,
                          color,
                        }}
                      >
                        過路費 +{Math.round(config.tollBonus * 100)}%
                      </span>
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${color}15`,
                          border: `1px solid ${color}33`,
                          color,
                        }}
                      >
                        建造成本 ×{config.buildingCostMultiplier.toFixed(1)}
                      </span>
                      {config.passiveIncomePerPass !== undefined && (
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${color}15`,
                            border: `1px solid ${color}33`,
                            color,
                          }}
                        >
                          被動收入 +¥{config.passiveIncomePerPass}/次
                        </span>
                      )}
                      {config.infectionChance !== undefined && (
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${color}15`,
                            border: `1px solid ${color}33`,
                            color,
                          }}
                        >
                          感染機率 {Math.round(config.infectionChance * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isLocked && !currentUpgradePath && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(10, 10, 25, 0.7)",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    <div className="text-center">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--yellow)" }} />
                      <span className="text-xs" style={{ color: "var(--yellow)" }}>
                        Lv.{UPGRADE_UNLOCK_LEVEL} 解鎖
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {!currentUpgradePath && canUnlock && (
          <div
            className="px-5 py-4 border-t flex items-center justify-between gap-3"
            style={{ borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)" }}
          >
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              持有現金：
              <span className="font-cyber ml-1" style={{ color: "var(--green)" }}>
                ¥{playerMoney.toLocaleString()}
              </span>
            </div>
            <button
              className="cyber-btn text-xs px-4 py-2"
              onClick={onClose}
              aria-label="關閉"
            >
              返回
            </button>
          </div>
        )}
        {currentUpgradePath && (
          <div
            className="px-5 py-4 border-t text-right"
            style={{ borderColor: "color-mix(in srgb, var(--purple) 30%, transparent)" }}
          >
            <button
              className="cyber-btn text-xs px-4 py-2"
              onClick={onClose}
              aria-label="關閉"
            >
              關閉
            </button>
          </div>
        )}

        {/* Confirm dialog */}
        {showConfirm && selectedPath && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(5, 5, 15, 0.85)",
              backdropFilter: "blur(4px)",
              animation: "fade-in 0.15s ease-out",
            }}
          >
            <div
              className="w-full max-w-sm rounded-lg p-5"
              style={{
                backgroundColor: "var(--bg-dark)",
                border: `1px solid ${PATH_COLOR_MAP[selectedPath]}`,
                boxShadow: `0 0 20px color-mix(in srgb, ${PATH_COLOR_MAP[selectedPath]} 40%, transparent)`,
              }}
            >
              <div className="text-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{
                    backgroundColor: `${PATH_COLOR_MAP[selectedPath]}22`,
                    border: `1px solid ${PATH_COLOR_MAP[selectedPath]}`,
                    boxShadow: `0 0 15px ${PATH_COLOR_MAP[selectedPath]}66`,
                  }}
                >
                  {(() => {
                    const Icon = PATH_ICON_MAP[selectedPath];
                    return <Icon className="w-6 h-6" style={{ color: PATH_COLOR_MAP[selectedPath] }} />;
                  })()}
                </div>
                <div className="text-[10px] font-cyber tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                  確認選擇
                </div>
                <h3
                  className="text-lg font-cyber tracking-wider"
                  style={{
                    color: PATH_COLOR_MAP[selectedPath],
                    textShadow: `0 0 8px ${PATH_COLOR_MAP[selectedPath]}`,
                  }}
                >
                  {PROPERTY_UPGRADE_PATHS[selectedPath].name}
                </h3>
              </div>
              <p className="text-sm text-center mb-5" style={{ color: "var(--text-secondary)" }}>
                路線一經選定將無法更改，是否確認？
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="cyber-btn text-xs py-2.5"
                  onClick={handleCancelConfirm}
                  disabled={isProcessing}
                  aria-label="取消"
                >
                  取消
                </button>
                <button
                  className="cyber-btn text-xs py-2.5"
                  style={{
                    borderColor: PATH_COLOR_MAP[selectedPath],
                    color: PATH_COLOR_MAP[selectedPath],
                    background: `color-mix(in srgb, ${PATH_COLOR_MAP[selectedPath]} 10%, transparent)`,
                    boxShadow: `0 0 10px ${PATH_COLOR_MAP[selectedPath]}44`,
                  }}
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  aria-label="確認選擇"
                >
                  確認選擇
                </button>
              </div>
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

export default PropertyUpgradeModal;
