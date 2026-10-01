import React, { useState, type FC } from 'react';
import { X } from 'lucide-react';
import { PAWN_SKINS, DICE_SKINS } from '@shared/game-config';
import type {
  PawnSkinType,
  DiceSkinType,
  SkinConfig,
} from '@shared/api.interface';

interface SkinSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPawnSkin: PawnSkinType;
  currentDiceSkin: DiceSkinType;
  unlockedPawnSkins: PawnSkinType[];
  unlockedDiceSkins: DiceSkinType[];
  onSelectPawn: (skin: PawnSkinType) => void;
  onSelectDice: (skin: DiceSkinType) => void;
  skinFragments?: number;
  skinLevels?: Record<string, 1 | 2 | 3>;
  onUpgradePawn?: (skin: PawnSkinType) => boolean;
}

const RARITY_COLORS: Record<SkinConfig['rarity'], string> = {
  common: 'var(--text-secondary)',
  rare: 'var(--blue)',
  epic: 'var(--purple)',
  legendary: 'var(--yellow)',
};

const RARITY_LABELS: Record<SkinConfig['rarity'], string> = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

// ========== 棋子預覽（CSS繪製） ==========

const PawnPreview: FC<{ skin: PawnSkinType; unlocked: boolean }> = ({
  skin,
  unlocked,
}) => {
  const baseColor = unlocked ? 'var(--cyan)' : 'var(--text-muted)';
  const glowColor = unlocked
    ? '0 0 10px var(--cyan-glow), 0 0 20px var(--cyan)'
    : 'none';

  if (skin === 'default') {
    return (
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center border-2"
        style={{
          backgroundColor: unlocked ? 'var(--bg-mid)' : 'transparent',
          borderColor: baseColor,
          boxShadow: glowColor,
        }}
      >
        <span
          className="text-lg font-bold"
          style={{ color: unlocked ? baseColor : 'var(--text-muted)' }}
        >
          1
        </span>
      </div>
    );
  }

  if (skin === 'mecha') {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: unlocked
              ? 'linear-gradient(135deg, #64748b, #1e293b, #475569)'
              : 'var(--bg-mid)',
            border: `2px solid ${baseColor}`,
            boxShadow: glowColor,
          }}
        />
        <div
          className="relative w-3 h-3 rounded-sm"
          style={{
            background: unlocked ? 'var(--cyan)' : 'var(--text-muted)',
            boxShadow: unlocked ? '0 0 6px var(--cyan-glow)' : 'none',
          }}
        />
      </div>
    );
  }

  if (skin === 'ufo') {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* 碟身 */}
        <div
          className="absolute top-4 left-0 w-12 h-4 rounded-full"
          style={{
            background: unlocked
              ? 'linear-gradient(180deg, #94a3b8, #475569)'
              : 'var(--bg-mid)',
            border: `1px solid ${baseColor}`,
            boxShadow: glowColor,
          }}
        />
        {/* 穹頂 */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-4 rounded-t-full"
          style={{
            background: unlocked
              ? 'linear-gradient(180deg, var(--cyan-glow), var(--cyan))'
              : 'var(--bg-mid)',
            border: `1px solid ${baseColor}`,
            borderBottom: 'none',
          }}
        />
        {/* 底部燈光 */}
        {unlocked && (
          <div
            className="absolute top-7 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full"
            style={{
              background: 'var(--pink)',
              boxShadow: '0 0 6px var(--pink-glow)',
            }}
          />
        )}
      </div>
    );
  }

  if (skin === 'dragon') {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: unlocked
              ? 'radial-gradient(circle at 30% 30%, #fef3c7, #facc15, #ca8a04)'
              : 'var(--bg-mid)',
            border: `2px solid ${baseColor}`,
            boxShadow: unlocked
              ? '0 0 12px var(--yellow), 0 0 24px rgba(250, 204, 21, 0.5)'
              : 'none',
          }}
        />
        {/* 星星 */}
        <svg
          className="relative w-5 h-5"
          viewBox="0 0 24 24"
          fill={unlocked ? '#dc2626' : 'var(--text-muted)'}
          style={{
            filter: unlocked ? 'drop-shadow(0 0 2px #fca5a5)' : 'none',
          }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    );
  }

  return null;
};

// ========== 骰子預覽（CSS繪製） ==========

const DicePreview: FC<{ skin: DiceSkinType; unlocked: boolean }> = ({
  skin,
  unlocked,
}) => {
  const dots = ['top-left', 'center', 'bottom-right'];

  const getDotClass = (pos: string): string => {
    switch (pos) {
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'top-left':
        return 'top-[20%] left-[20%]';
      case 'bottom-right':
        return 'bottom-[20%] right-[20%]';
      default:
        return '';
    }
  };

  const faceStyles: React.CSSProperties = (() => {
    if (!unlocked) {
      return {
        background: 'var(--bg-mid)',
        border: '1px solid var(--text-muted)',
        opacity: 0.5,
      };
    }
    switch (skin) {
      case 'gold':
        return {
          background:
            'linear-gradient(135deg, #fef3c7, #facc15, #d97706)',
          border: '2px solid #b45309',
          boxShadow: '0 0 10px rgba(250, 204, 21, 0.6)',
        };
      case 'neon':
        return {
          background:
            'linear-gradient(135deg, var(--bg-dark), var(--bg-mid))',
          border: '2px solid var(--pink)',
          boxShadow:
            '0 0 12px var(--pink-glow), inset 0 0 8px rgba(255, 0, 180, 0.2)',
        };
      case 'pixel':
        return {
          background: '#2d1b69',
          border: '3px solid #22c55e',
          imageRendering: 'pixelated',
          boxShadow: '4px 4px 0 #166534',
          borderRadius: '2px',
        };
      default:
        return {
          background:
            'linear-gradient(135deg, var(--bg-dark), var(--bg-mid))',
          border: '2px solid var(--cyan)',
          boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
        };
    }
  })();

  const dotStyles: React.CSSProperties = (() => {
    if (!unlocked) {
      return { backgroundColor: 'var(--text-muted)' };
    }
    switch (skin) {
      case 'gold':
        return {
          backgroundColor: '#78350f',
          boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)',
        };
      case 'neon':
        return {
          backgroundColor: 'var(--pink)',
          boxShadow:
            '0 0 6px var(--pink-glow), 0 0 12px var(--pink)',
        };
      case 'pixel':
        return {
          backgroundColor: '#22c55e',
          borderRadius: '0',
          boxShadow: 'none',
        };
      default:
        return {
          backgroundColor: 'var(--cyan)',
          boxShadow:
            '0 0 4px var(--cyan-glow), 0 0 8px var(--cyan)',
        };
    }
  })();

  const dotSize = skin === 'pixel' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const dotRadius = skin === 'pixel' ? 'rounded-none' : 'rounded-full';

  return (
    <div
      className="relative w-12 h-12"
      style={{ ...faceStyles, borderRadius: skin === 'pixel' ? '2px' : '6px' }}
    >
      {dots.map((pos: string, i: number) => (
        <div
          key={i}
          className={`absolute ${dotSize} ${dotRadius} ${getDotClass(pos)}`}
          style={dotStyles}
        />
      ))}
    </div>
  );
};

// ========== 皮膚卡片 ==========

interface SkinCardProps<T extends string> {
  config: SkinConfig;
  isCurrent: boolean;
  unlocked: boolean;
  onSelect: (id: T) => void;
  preview: React.ReactElement;
  skinLevel?: 1 | 2 | 3;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: (id: T) => void;
  fragments?: number;
}

function SkinCard<T extends string>({
  config,
  isCurrent,
  unlocked,
  onSelect,
  preview,
  skinLevel = 1,
  upgradeCost = Infinity,
  canUpgrade = false,
  onUpgrade,
  fragments = 0,
}: SkinCardProps<T>) {
  const rarityColor = RARITY_COLORS[config.rarity];

  return (
    <div
      className="cyber-card p-3 flex flex-col items-center gap-2 relative"
      style={{
        borderColor: unlocked
          ? `color-mix(in srgb, ${rarityColor} 30%, transparent)`
          : 'color-mix(in srgb, var(--text-muted) 15%, transparent)',
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      {/* 稀有度標籤 */}
      <span
        className="absolute top-1.5 right-1.5 text-[10px] font-cyber tracking-wider px-1.5 py-0.5"
        style={{
          color: rarityColor,
          border: `1px solid ${rarityColor}`,
          backgroundColor: `color-mix(in srgb, ${rarityColor} 10%, transparent)`,
        }}
      >
        {RARITY_LABELS[config.rarity]}
      </span>

      {/* 預覽區 */}
      <div className="w-16 h-16 flex items-center justify-center mt-2">
        {preview}
      </div>

      {/* 名稱 */}
      <div
        className="text-sm font-cyber tracking-wider text-center"
        style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {config.name}
      </div>

      {/* 解鎖條件 / 操作按鈕 */}
      <div className="mt-auto w-full">
        {!unlocked ? (
          <div
            className="text-[10px] text-center font-cyber tracking-wide py-1"
            style={{ color: 'var(--text-muted)' }}
          >
            未解锁
          </div>
        ) : isCurrent ? (
          <div
            className="text-xs text-center font-cyber tracking-wider py-1"
            style={{
              color: 'var(--green)',
              border: '1px solid var(--green)',
              backgroundColor: 'color-mix(in srgb, var(--green) 10%, transparent)',
            }}
          >
            使用中
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(config.id as T)}
            className="w-full cyber-btn py-1 text-xs font-cyber tracking-wider"
            style={{
              borderColor: rarityColor,
              color: rarityColor,
            }}
          >
            使用
          </button>
        )}
        {/* 皮膚升級 */}
        {unlocked && upgradeCost !== Infinity && onUpgrade && (
          <div className="mt-2 w-full">
            <div className="text-[10px] text-center mb-1" style={{ color: 'var(--text-muted)' }}>
              等級 {skinLevel} → {skinLevel + 1} · 碎片 {fragments}/{upgradeCost}
            </div>
            <button
              type="button"
              onClick={() => onUpgrade(config.id as T)}
              disabled={!canUpgrade}
              className="w-full cyber-btn py-1 text-xs font-cyber tracking-wider"
              style={{
                borderColor: canUpgrade ? 'var(--yellow)' : 'var(--text-muted)',
                color: canUpgrade ? 'var(--yellow)' : 'var(--text-muted)',
                opacity: canUpgrade ? 1 : 0.5,
              }}
            >
              {skinLevel >= 3 ? '星 傳說 星' : '升級'}
            </button>
          </div>
        )}
      </div>

      {/* 解鎖條件說明 */}
      {!unlocked && (
        <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
          {config.unlockCondition}
        </div>
      )}
    </div>
  );
}

// ========== 主組件 ==========

const SkinSelectModal: FC<SkinSelectModalProps> = ({
  isOpen,
  onClose,
  currentPawnSkin,
  currentDiceSkin,
  unlockedPawnSkins,
  unlockedDiceSkins,
  onSelectPawn,
  onSelectDice,
  skinFragments = 0,
  skinLevels = {},
  onUpgradePawn,
}) => {
  const [activeTab, setActiveTab] = useState<'pawn' | 'dice'>('pawn');

  if (!isOpen) return null;

  const pawnSkinIds: PawnSkinType[] = ['default', 'mecha', 'ufo', 'dragon'];
  const diceSkinIds: DiceSkinType[] = ['default', 'gold', 'neon', 'pixel'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="cyber-card w-full max-w-md p-5 relative"
        style={{
          borderColor: 'var(--pink)',
          boxShadow:
            '0 0 30px color-mix(in srgb, var(--pink) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--pink) 10%, transparent)',
          animation: 'modal-pop 0.25s ease-out',
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* 關閉按鈕 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="關閉"
        >
          <X size={18} />
        </button>

        {/* 標題 */}
        <h2
          className="font-cyber text-2xl text-center tracking-widest mb-2"
          style={{
            color: 'var(--pink)',
            textShadow:
              '0 0 10px var(--pink-glow), 0 0 20px var(--pink-glow)',
          }}
        >
          皮膚倉庫
        </h2>
        {skinFragments > 0 && (
          <div className="text-center text-sm mb-4" style={{ color: 'var(--yellow)' }}>
            星光 皮膚碎片：{skinFragments}
          </div>
        )}

        {/* Tab 切換 */}
        <div
          className="flex gap-2 mb-5 p-1 rounded"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-mid) 80%, transparent)',
            border: '1px solid var(--border-neon-cyan)',
          }}
        >
          {(['pawn', 'dice'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-cyber tracking-wider transition-all"
              style={{
                color: activeTab === tab ? 'var(--cyan)' : 'var(--text-secondary)',
                backgroundColor:
                  activeTab === tab
                    ? 'color-mix(in srgb, var(--cyan) 15%, transparent)'
                    : 'transparent',
                borderBottom: activeTab === tab ? '2px solid var(--cyan)' : '2px solid transparent',
                textShadow: activeTab === tab ? '0 0 6px var(--cyan-glow)' : 'none',
              }}
            >
              {tab === 'pawn' ? '棋子' : '骰子'}
            </button>
          ))}
        </div>

        {/* 皮膚網格 */}
        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {activeTab === 'pawn' &&
            pawnSkinIds.map((id: PawnSkinType) => (
              <SkinCard<PawnSkinType>
                key={id}
                config={PAWN_SKINS[id]}
                isCurrent={currentPawnSkin === id}
                unlocked={unlockedPawnSkins.includes(id)}
                onSelect={onSelectPawn}
                preview={<PawnPreview skin={id} unlocked={unlockedPawnSkins.includes(id)} />}
                skinLevel={(skinLevels[id] as 1 | 2 | 3 | undefined) ?? 1}
                upgradeCost={
                  ((skinLevels[id] as 1 | 2 | 3 | undefined) ?? 1) >= 3
                    ? Infinity
                    : (skinLevels[id] as 1 | 2 | undefined) === 2 ? 30 : 10
                }
                canUpgrade={
                  ((skinLevels[id] as 1 | 2 | 3 | undefined) ?? 1) < 3 &&
                  skinFragments >= (((skinLevels[id] as 1 | 2 | undefined) === 2) ? 30 : 10)
                }
                onUpgrade={onUpgradePawn}
                fragments={skinFragments}
              />
            ))}
          {activeTab === 'dice' &&
            diceSkinIds.map((id: DiceSkinType) => (
              <SkinCard<DiceSkinType>
                key={id}
                config={DICE_SKINS[id]}
                isCurrent={currentDiceSkin === id}
                unlocked={unlockedDiceSkins.includes(id)}
                onSelect={onSelectDice}
                preview={<DicePreview skin={id} unlocked={unlockedDiceSkins.includes(id)} />}
              />
            ))}
        </div>

        {/* 底部提示 */}
        <div
          className="mt-4 text-[11px] text-center font-cyber tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          解鎖更多成就以獲取稀有皮膚
        </div>

        {/* 掃描線 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 rounded"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, var(--pink) 3%, transparent) 2px, color-mix(in srgb, var(--pink) 3%, transparent) 4px)',
          }}
        />
      </div>
    </div>
  );
};

export default SkinSelectModal;
