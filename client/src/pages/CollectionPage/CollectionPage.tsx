import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Palette, Trophy, Award, Lock, Check, Sparkles, Dices, User } from 'lucide-react';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { useTitles } from '@client/src/hooks/useTitles';
import { useAvatarFrame } from '@client/src/hooks/useAvatarFrame';
import { useSkinStorage } from '@client/src/hooks/useSkinStorage';
import { getBattlePassState } from '@client/src/utils/battlepass';
import type { BattlePassState } from '@shared/api.interface';
import TitleEffect from '@client/src/components/TitleEffect';
import { TITLES, TITLE_IDS, AVATAR_FRAMES, ACHIEVEMENTS, ACHIEVEMENT_IDS, PAWN_SKINS, DICE_SKINS } from '@shared/game-config';
import type { TitleId, AchievementId, AvatarFrameConfig, PawnSkinType, DiceSkinType } from '@shared/api.interface';

type TabType = 'titles' | 'frames' | 'skins' | 'achievements';

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#22d3ee',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

const RARITY_NAMES: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

const CollectionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('titles');
  const { unlocked: unlockedAchievements } = useAchievements();
  const { equippedTitle, unlockedTitles, equipTitle, checkAndUnlockTitles } = useTitles();
  const { equippedFrame, unlockedFrames, equipFrame, checkAndUnlockFrames } = useAvatarFrame();
  const { pawnSkin, diceSkin, unlockedPawnSkins, unlockedDiceSkins, setPawnSkin, setDiceSkin } = useSkinStorage();
  const [bpState, setBpState] = useState<BattlePassState>(() => (typeof window !== 'undefined' ? getBattlePassState() : {
    seasonName: '', seasonEndsAt: '', currentLevel: 1, currentXP: 0, xpToNextLevel: 100, totalXP: 0,
    premiumPurchased: false, tiers: [], dailyQuests: [], weeklyQuests: [], seasonQuests: [],
  }));

  useEffect(() => {
    setBpState(getBattlePassState());
  }, []);

  // 自動解鎖稱號和頭像框
  useEffect(() => {
    checkAndUnlockTitles(unlockedAchievements);
    checkAndUnlockFrames({
      unlockedAchievements,
      battlePassLevel: bpState.currentLevel,
      isPremium: bpState.premiumPurchased,
      unlockedPawnSkins,
    });
  }, [unlockedAchievements, checkAndUnlockTitles, checkAndUnlockFrames, bpState.currentLevel, bpState.premiumPurchased, unlockedPawnSkins]);

  const tabs: { id: TabType; label: string; icon: typeof Crown }[] = [
    { id: 'titles', label: '稱號', icon: Crown },
    { id: 'frames', label: '頭像框', icon: Award },
    { id: 'skins', label: '皮膚', icon: Palette },
    { id: 'achievements', label: '成就', icon: Trophy },
  ];

  const totalCounts = {
    titles: TITLE_IDS.length,
    frames: AVATAR_FRAMES.length,
    skins: Object.keys(PAWN_SKINS).length + Object.keys(DICE_SKINS).length,
    achievements: ACHIEVEMENT_IDS.length,
  };

  const unlockedCounts = {
    titles: unlockedTitles.length,
    frames: unlockedFrames.length,
    skins: unlockedPawnSkins.length + unlockedDiceSkins.length,
    achievements: unlockedAchievements.size,
  };

  const handleBack = () => {
    navigate('/');
  };

  const getUnlockText = (frame: AvatarFrameConfig): string => {
    switch (frame.unlockType) {
      case 'default':
        return '初始擁有';
      case 'achievement':
        return `成就：${ACHIEVEMENTS[frame.unlockValue as AchievementId]?.name ?? frame.unlockValue}`;
      case 'battlepass': {
        const parts = String(frame.unlockValue).split('_');
        return `通行證 ${parts[0]} 級${parts[1] === 'premium' ? '（高級）' : ''}`;
      }
      case 'assets':
        return `資產達到 ${frame.unlockValue}`;
      case 'achievements_count':
        return `收集 ${frame.unlockValue} 個成就`;
      case 'all_pawn_skins':
        return '解鎖所有棋子皮膚';
      case 'achievements_combo': {
        const ids = String(frame.unlockValue).split('+');
        return ids.map((id: string) => ACHIEVEMENTS[id as AchievementId]?.name ?? id).join(' + ');
      }
      default:
        return '未知';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          收藏櫃
        </h1>
      </div>

      <div className="max-w-4xl w-full mx-auto pb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2 whitespace-nowrap"
                style={{
                  borderColor: isActive ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                  boxShadow: isActive ? '0 0 10px rgba(0, 255, 255, 0.3)' : 'none',
                }}
              >
                <Icon size={16} />
                {tab.label}
                <span className="text-xs opacity-70">
                  {unlockedCounts[tab.id]}/{totalCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="cyber-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)] font-cyber tracking-wider">
              收藏進度
            </span>
            <span className="text-sm font-cyber" style={{ color: 'var(--cyan)' }}>
              {Object.values(unlockedCounts).reduce((a, b) => a + b, 0)} / {Object.values(totalCounts).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(Object.values(unlockedCounts).reduce((a, b) => a + b, 0) / Object.values(totalCounts).reduce((a, b) => a + b, 0)) * 100}%`,
                background: 'linear-gradient(90deg, var(--cyan), var(--pink))',
                boxShadow: '0 0 8px var(--cyan)',
              }}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === 'titles' && TITLE_IDS.map((titleId: TitleId) => {
            const title = TITLES[titleId];
            if (!title) return null;
            const isUnlocked = unlockedTitles.includes(titleId);
            const isEquipped = equippedTitle === titleId;
            const rarityColor = RARITY_COLORS[title.rarity] ?? '#9ca3af';

            return (
              <div
                key={titleId}
                className="cyber-card p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  borderColor: isUnlocked ? rarityColor : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isUnlocked ? `0 0 10px ${rarityColor}40` : 'none',
                  opacity: isUnlocked ? 1 : 0.5,
                }}
                onClick={() => {
                  if (isUnlocked) equipTitle(titleId);
                }}
              >
                <Crown size={24} style={{ color: isUnlocked ? rarityColor : 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <div className="font-cyber text-lg flex items-center gap-2">
                    {isUnlocked ? (
                      <TitleEffect effect={title.effect} color={rarityColor}>
                        【{title.name}】
                      </TitleEffect>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>【???】</span>
                    )}
                    {isEquipped && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'rgba(0, 255, 255, 0.15)',
                          color: 'var(--cyan)',
                          border: '1px solid var(--cyan)',
                        }}
                      >
                        裝備中
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {isUnlocked ? title.description : '未解鎖'}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider"
                      style={{
                        backgroundColor: `${rarityColor}20`,
                        color: rarityColor,
                        border: `1px solid ${rarityColor}50`,
                      }}
                    >
                      {RARITY_NAMES[title.rarity]}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {title.unlockCondition}
                    </span>
                  </div>
                </div>
                <div>
                  {isUnlocked ? (
                    isEquipped ? <Check size={20} style={{ color: 'var(--green)' }} /> : <Sparkles size={20} style={{ color: rarityColor }} />
                  ) : (
                    <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>
            );
          })}

          {activeTab === 'frames' && AVATAR_FRAMES.map((frame) => {
            const isUnlocked = unlockedFrames.includes(frame.id);
            const isEquipped = equippedFrame === frame.id;
            const rarityColor = RARITY_COLORS[frame.rarity] ?? '#9ca3af';

            return (
              <div
                key={frame.id}
                className="cyber-card p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  borderColor: isUnlocked ? rarityColor : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isUnlocked ? `0 0 10px ${rarityColor}40` : 'none',
                  opacity: isUnlocked ? 1 : 0.5,
                }}
                onClick={() => {
                  if (isUnlocked) equipFrame(frame.id);
                }}
              >
                {/* Avatar preview */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center relative flex-shrink-0"
                  style={{
                    border: frame.borderStyle.replace(/\d+px/, '3px'),
                    borderColor: isUnlocked ? frame.color : '#444',
                    boxShadow: isUnlocked ? `0 0 12px ${frame.glowColor ?? frame.color}` : 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <User size={24} style={{ color: isUnlocked ? frame.color : '#444' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-cyber text-lg" style={{ color: isUnlocked ? rarityColor : 'var(--text-muted)' }}>
                    {isUnlocked ? frame.name : '???'}
                    {isEquipped && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'rgba(0, 255, 255, 0.15)',
                          color: 'var(--cyan)',
                          border: '1px solid var(--cyan)',
                        }}
                      >
                        裝備中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider"
                      style={{
                        backgroundColor: `${rarityColor}20`,
                        color: rarityColor,
                        border: `1px solid ${rarityColor}50`,
                      }}
                    >
                      {RARITY_NAMES[frame.rarity]}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {getUnlockText(frame)}
                    </span>
                  </div>
                </div>
                <div>
                  {isUnlocked ? (
                    isEquipped ? <Check size={20} style={{ color: 'var(--green)' }} /> : <Sparkles size={20} style={{ color: rarityColor }} />
                  ) : (
                    <Lock size={20} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>
            );
          })}

          {activeTab === 'skins' && (
            <>
              <div className="text-sm font-cyber tracking-wider text-[var(--text-secondary)] mb-2">
                棋子皮膚
              </div>
              {Object.values(PAWN_SKINS).map((skin) => {
                const isUnlocked = unlockedPawnSkins.includes(skin.id as PawnSkinType);
                const isEquipped = pawnSkin === skin.id;
                const rarityColor = RARITY_COLORS[skin.rarity];
                return (
                  <div
                    key={skin.id}
                    className="cyber-card p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      borderColor: isUnlocked ? rarityColor : 'rgba(255, 255, 255, 0.1)',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                    onClick={() => {
                      if (isUnlocked) setPawnSkin(skin.id as PawnSkinType);
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{
                        border: `1px solid ${isUnlocked ? rarityColor : '#444'}`,
                        backgroundColor: `${rarityColor}10`,
                      }}
                    >
                      <Dices size={20} style={{ color: isUnlocked ? rarityColor : '#666' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-cyber text-sm" style={{ color: isUnlocked ? rarityColor : 'var(--text-muted)' }}>
                        {skin.name}
                        {isEquipped && <span className="ml-2 text-xs text-[var(--green)]">使用中</span>}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{skin.unlockCondition}</div>
                    </div>
                    {isUnlocked ? (
                      isEquipped ? <Check size={16} style={{ color: 'var(--green)' }} /> : null
                    ) : (
                      <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                );
              })}

              <div className="text-sm font-cyber tracking-wider text-[var(--text-secondary)] mt-4 mb-2">
                骰子皮膚
              </div>
              {Object.values(DICE_SKINS).map((skin) => {
                const isUnlocked = unlockedDiceSkins.includes(skin.id as DiceSkinType);
                const isEquipped = diceSkin === skin.id;
                const rarityColor = RARITY_COLORS[skin.rarity];
                return (
                  <div
                    key={skin.id}
                    className="cyber-card p-3 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      borderColor: isUnlocked ? rarityColor : 'rgba(255, 255, 255, 0.1)',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                    onClick={() => {
                      if (isUnlocked) setDiceSkin(skin.id as DiceSkinType);
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{
                        border: `1px solid ${isUnlocked ? rarityColor : '#444'}`,
                        backgroundColor: `${rarityColor}10`,
                      }}
                    >
                      <Dices size={20} style={{ color: isUnlocked ? rarityColor : '#666' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-cyber text-sm" style={{ color: isUnlocked ? rarityColor : 'var(--text-muted)' }}>
                        {skin.name}
                        {isEquipped && <span className="ml-2 text-xs text-[var(--green)]">使用中</span>}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{skin.unlockCondition}</div>
                    </div>
                    {isUnlocked ? (
                      isEquipped ? <Check size={16} style={{ color: 'var(--green)' }} /> : null
                    ) : (
                      <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'achievements' && ACHIEVEMENT_IDS.map((achId: AchievementId) => {
            const ach = ACHIEVEMENTS[achId];
            if (!ach) return null;
            const isUnlocked = unlockedAchievements.has(achId);

            return (
              <div
                key={achId}
                className="cyber-card p-4 flex items-center gap-4"
                style={{
                  borderColor: isUnlocked ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isUnlocked ? '0 0 10px rgba(250, 204, 21, 0.3)' : 'none',
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <div
                  className="w-12 h-12 rounded flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: isUnlocked ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isUnlocked ? 'var(--yellow)' : '#444'}`,
                  }}
                >
                  <Trophy size={24} style={{ color: isUnlocked ? 'var(--yellow)' : 'var(--text-muted)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-cyber text-base"
                    style={{ color: isUnlocked ? 'var(--yellow)' : 'var(--text-muted)' }}
                  >
                    {ach.name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {ach.description}
                  </div>
                </div>
                {isUnlocked && <Check size={20} style={{ color: 'var(--green)' }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
