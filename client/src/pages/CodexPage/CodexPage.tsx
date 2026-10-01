import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Map,
  Swords,
  Package,
  PawPrint,
  Zap,
  Lock,
  Briefcase,
  Palette,
  Shirt,
  Gamepad2,
  Trophy,
  Gift,
  CheckCircle,
} from 'lucide-react';
import { useCodex } from '@client/src/hooks/useCodex';
import {
  CELLS,
  FATE_CARDS,
  CHANCE_CARDS,
  ITEM_TYPES,
  ITEMS,
  PETS,
  PROFESSIONS,
  PAWN_SKINS,
  DICE_SKINS,
  MINIGAME_TYPES,
  MINIGAME_NAMES,
} from '@shared/game-config';
import { THEMES } from '@client/src/contexts/ThemeContext';
import type { MountType, SkinConfig } from '@shared/api.interface';
import type { Profession } from '@shared/api.interface';

type TabType =
  | 'properties'
  | 'cards'
  | 'items'
  | 'pets'
  | 'mounts'
  | 'professions'
  | 'themes'
  | 'skins'
  | 'minigames'
  | 'rewards';

const MOUNT_NAMES: Record<MountType, { name: string; icon: string }> = {
  flyer: { name: '飛行器', icon: '飛行器' },
  diver: { name: '潛水艇', icon: '潛水艇' },
  rocket: { name: '火箭', icon: '火箭' },
};

const CodexPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const {
    getProgress,
    getCollectionRewards,
    isPropertyUnlocked,
    isCardUnlocked,
    isItemUnlocked,
    isPetUnlocked,
    isMountUnlocked,
    isProfessionUnlocked,
    isThemeUnlocked,
    isSkinUnlocked,
    isMinigameUnlocked,
    getMinigameHighScore,
  } = useCodex('default');
  const progress = getProgress();
  const rewards = getCollectionRewards();

  const tabs: { id: TabType; label: string; icon: typeof Map }[] = [
    { id: 'properties', label: '地塊', icon: Map },
    { id: 'cards', label: '卡牌', icon: Swords },
    { id: 'items', label: '道具', icon: Package },
    { id: 'pets', label: '寵物', icon: PawPrint },
    { id: 'mounts', label: '坐騎', icon: Zap },
    { id: 'professions', label: '職業', icon: Briefcase },
    { id: 'themes', label: '主題', icon: Palette },
    { id: 'skins', label: '皮膚', icon: Shirt },
    { id: 'minigames', label: '迷你遊戲', icon: Gamepad2 },
    { id: 'rewards', label: '收集獎勵', icon: Gift },
  ];

  const renderProperties = () => (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
      {CELLS.map((cell) => {
        const unlocked = isPropertyUnlocked(cell.id);
        const color = cell.color ?? 'rgba(255,255,255,0.2)';
        return (
          <div
            key={cell.id}
            className="aspect-square rounded-md border flex flex-col items-center justify-center text-center p-1 text-[10px] md:text-xs transition-all"
            style={{
              borderColor: unlocked ? color : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? `${color}15` : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? `0 0 6px ${color}66` : 'none',
              color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            title={unlocked ? cell.name : '未解鎖'}
          >
            {unlocked ? (
              <>
                <div
                  className="w-full h-1.5 rounded-sm mb-1"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate w-full">{cell.name}</span>
              </>
            ) : (
              <Lock size={16} className="opacity-40" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {[
        ...FATE_CARDS.map((c) => ({ id: `fate_${c.id}`, name: c.name, type: '命運卡' as const, color: '#ff4dff' })),
        ...CHANCE_CARDS.map((c) => ({ id: `chance_${c.id}`, name: c.name, type: '機會卡' as const, color: '#6366f1' })),
      ].map((card) => {
        const unlocked = isCardUnlocked(card.id);
        return (
          <div
            key={card.id}
            className="rounded-lg border p-3 transition-all"
            style={{
              borderColor: unlocked ? card.color : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? `${card.color}10` : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? `0 0 8px ${card.color}44` : 'none',
            }}
          >
            <div className="text-xs mb-1" style={{ color: card.color }}>{card.type}</div>
            <div
              className="text-sm font-bold"
              style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {unlocked ? card.name : '??? 未解鎖'}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderItems = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {ITEM_TYPES.map((itemType) => {
        const unlocked = isItemUnlocked(itemType);
        const itemConfig = (Object.values(ITEMS) as Array<{ type: string; name?: string }>).find(
          (i) => i.type === itemType,
        );
        return (
          <div
            key={itemType}
            className="rounded-lg border p-3 transition-all"
            style={{
              borderColor: unlocked ? 'var(--green)' : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? 'rgba(0, 255, 128, 0.05)' : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? '0 0 8px rgba(0, 255, 128, 0.2)' : 'none',
            }}
          >
            <div
              className="text-sm font-bold"
              style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {unlocked ? itemConfig?.name ?? itemType : '??? 未解鎖'}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPets = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Object.keys(PETS).map((petType) => {
        const pet = PETS[petType as keyof typeof PETS];
        const unlocked = isPetUnlocked(petType);
        return (
          <div
            key={petType}
            className="rounded-xl border p-4 text-center transition-all"
            style={{
              borderColor: unlocked ? pet.color : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? `${pet.color}10` : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? `0 0 12px ${pet.color}44` : 'none',
            }}
          >
            <div className="text-4xl mb-2">{unlocked ? pet.icon : '鎖'}</div>
            <div
              className="text-lg font-bold mb-1"
              style={{ color: unlocked ? pet.color : 'var(--text-secondary)' }}
            >
              {unlocked ? pet.name : '未解鎖'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {unlocked ? pet.description : '在遊戲中獲得以解鎖'}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMounts = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(['flyer', 'diver', 'rocket'] as MountType[]).map((m) => {
        const mount = MOUNT_NAMES[m];
        const unlocked = isMountUnlocked(m);
        return (
          <div
            key={m}
            className="rounded-xl border p-4 text-center transition-all"
            style={{
              borderColor: unlocked ? 'var(--purple)' : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? '0 0 12px rgba(168, 85, 247, 0.3)' : 'none',
            }}
          >
            <div className="text-4xl mb-2">{unlocked ? mount.icon : '鎖'}</div>
            <div
              className="text-lg font-bold mb-1"
              style={{ color: unlocked ? 'var(--purple)' : 'var(--text-secondary)' }}
            >
              {unlocked ? mount.name : '未解鎖'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {unlocked ? '已解鎖此坐騎' : '在遊戲中獲得以解鎖'}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderProfessions = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {(Object.keys(PROFESSIONS) as Profession[]).map((profId) => {
        const prof = PROFESSIONS[profId];
        const unlocked = isProfessionUnlocked(profId);
        return (
          <div
            key={profId}
            className="rounded-lg border p-3 transition-all"
            style={{
              borderColor: unlocked ? prof.color : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? `${prof.color}10` : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? `0 0 8px ${prof.color}33` : 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: `${prof.color}20` }}
              >
                <Briefcase size={16} style={{ color: prof.color }} />
              </div>
              <div
                className="font-cyber font-bold text-sm"
                style={{ color: unlocked ? prof.color : 'var(--text-secondary)' }}
              >
                {unlocked ? prof.name : '???'}
              </div>
            </div>
            {unlocked && (
              <>
                <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {prof.description}
                </div>
                <div className="text-xs space-y-0.5">
                  {(prof.skills ?? []).map((skill: string, idx: number) => (
                    <div key={idx} className="flex gap-1">
                      <span style={{ color: prof.color }}>▸</span>
                      <span style={{ color: 'var(--text-primary)' }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!unlocked && (
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                在遊戲中使用此職業以解鎖
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderThemes = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {THEMES.map((theme) => {
        const unlocked = isThemeUnlocked(theme.id);
        return (
          <div
            key={theme.id}
            className="rounded-lg border p-3 transition-all"
            style={{
              borderColor: unlocked ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? 'rgba(0, 255, 255, 0.05)' : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? '0 0 8px rgba(0, 255, 255, 0.2)' : 'none',
            }}
          >
            <div className="flex gap-1 mb-2">
              {(theme.previewColors ?? []).map((color, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-6 rounded-sm"
                  style={{
                    backgroundColor: unlocked ? color : 'rgba(255,255,255,0.1)',
                    opacity: unlocked ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {unlocked ? theme.name : '??? 未解鎖'}
            </div>
            {unlocked && (
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {theme.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#22d3ee';
      case 'epic': return '#a855f7';
      case 'legendary': return '#facc15';
      default: return '#9ca3af';
    }
  };

  const renderSkins = () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-cyber tracking-wider mb-3" style={{ color: 'var(--cyan)' }}>
          棋子皮膚
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(PAWN_SKINS).map(([id, skin]) => {
            const unlocked = isSkinUnlocked(`pawn_${id}`);
            const color = getRarityColor(skin.rarity);
            return (
              <div
                key={`pawn_${id}`}
                className="rounded-lg border p-3 text-center transition-all"
                style={{
                  borderColor: unlocked ? color : 'rgba(255,255,255,0.1)',
                  backgroundColor: unlocked ? `${color}10` : 'rgba(255,255,255,0.03)',
                  boxShadow: unlocked ? `0 0 8px ${color}44` : 'none',
                }}
              >
                <div
                  className="w-10 h-10 mx-auto rounded-full mb-2"
                  style={{ backgroundColor: unlocked ? color : 'rgba(255,255,255,0.1)' }}
                />
                <div
                  className="text-sm font-bold"
                  style={{ color: unlocked ? color : 'var(--text-secondary)' }}
                >
                  {unlocked ? skin.name : '???'}
                </div>
                {unlocked && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {skin.rarity === 'legendary' ? '傳說' : skin.rarity === 'epic' ? '史詩' : skin.rarity === 'rare' ? '稀有' : '普通'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-sm font-cyber tracking-wider mb-3" style={{ color: 'var(--pink)' }}>
          骰子皮膚
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(DICE_SKINS).map(([id, skin]) => {
            const unlocked = isSkinUnlocked(`dice_${id}`);
            const color = getRarityColor(skin.rarity);
            return (
              <div
                key={`dice_${id}`}
                className="rounded-lg border p-3 text-center transition-all"
                style={{
                  borderColor: unlocked ? color : 'rgba(255,255,255,0.1)',
                  backgroundColor: unlocked ? `${color}10` : 'rgba(255,255,255,0.03)',
                  boxShadow: unlocked ? `0 0 8px ${color}44` : 'none',
                }}
              >
                <div
                  className="w-10 h-10 mx-auto rounded-md mb-2"
                  style={{ backgroundColor: unlocked ? color : 'rgba(255,255,255,0.1)' }}
                />
                <div
                  className="text-sm font-bold"
                  style={{ color: unlocked ? color : 'var(--text-secondary)' }}
                >
                  {unlocked ? skin.name : '???'}
                </div>
                {unlocked && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {skin.rarity === 'legendary' ? '傳說' : skin.rarity === 'epic' ? '史詩' : skin.rarity === 'rare' ? '稀有' : '普通'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMinigames = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {MINIGAME_TYPES.map((mgType) => {
        const unlocked = isMinigameUnlocked(mgType);
        const highScore = getMinigameHighScore(mgType);
        const name = MINIGAME_NAMES[mgType as keyof typeof MINIGAME_NAMES] ?? mgType;
        return (
          <div
            key={mgType}
            className="rounded-lg border p-3 transition-all"
            style={{
              borderColor: unlocked ? 'var(--pink)' : 'rgba(255,255,255,0.1)',
              backgroundColor: unlocked ? 'rgba(255, 107, 157, 0.05)' : 'rgba(255,255,255,0.03)',
              boxShadow: unlocked ? '0 0 8px rgba(255, 107, 157, 0.2)' : 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 size={18} style={{ color: unlocked ? 'var(--pink)' : 'var(--text-secondary)' }} />
              <div
                className="text-sm font-bold"
                style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {unlocked ? name : '??? 未解鎖'}
              </div>
            </div>
            {unlocked && (
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#facc15' }}>最高分：{highScore}</span>
              </div>
            )}
            {!unlocked && (
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                在遊戲中參與以解鎖
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-3">
      <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        達到指定收集度即可解鎖對應獎勵
      </div>
      <div className="space-y-3">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="rounded-lg border p-4 flex items-center gap-4 transition-all"
            style={{
              borderColor: reward.unlocked
                ? 'rgba(250, 204, 21, 0.4)'
                : 'rgba(255,255,255,0.1)',
              backgroundColor: reward.unlocked
                ? 'rgba(250, 204, 21, 0.08)'
                : 'rgba(255,255,255,0.03)',
              boxShadow: reward.unlocked ? '0 0 12px rgba(250, 204, 21, 0.15)' : 'none',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: reward.unlocked ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${reward.unlocked ? 'rgba(250, 204, 21, 0.5)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {reward.unlocked ? (
                <Trophy size={22} style={{ color: '#facc15' }} />
              ) : (
                <Lock size={22} style={{ color: 'var(--text-secondary)' }} />
              )}
            </div>
            <div className="flex-1">
              <div
                className="font-cyber text-lg font-bold"
                style={{ color: reward.unlocked ? '#facc15' : 'var(--text-secondary)' }}
              >
                {reward.name}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                收集度達成：{reward.threshold}%
              </div>
              <div className="text-xs mt-1" style={{ color: reward.unlocked ? '#4ade80' : 'var(--text-muted)' }}>
                獎勵：{reward.reward}
              </div>
            </div>
            {reward.unlocked && (
              <div className="flex items-center gap-1 text-xs font-cyber" style={{ color: '#4ade80' }}>
                <CheckCircle size={16} />
                已領取
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties': return renderProperties();
      case 'cards': return renderCards();
      case 'items': return renderItems();
      case 'pets': return renderPets();
      case 'mounts': return renderMounts();
      case 'professions': return renderProfessions();
      case 'themes': return renderThemes();
      case 'skins': return renderSkins();
      case 'minigames': return renderMinigames();
      case 'rewards': return renderRewards();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          收藏圖鑑
        </h1>
      </div>

      <div className="max-w-5xl w-full mx-auto">
        {/* 总收集进度 */}
        <section
          className="cyber-card p-4 md:p-6 mb-6"
          style={{
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              總收集進度
            </span>
            <span
              className="text-lg font-cyber font-bold"
              style={{
                color: '#a855f7',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
              }}
            >
              {progress.total.percent}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-bg-mid overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress.total.percent}%`,
                background: 'linear-gradient(90deg, #a855f7, #ff6b9d, #facc15)',
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.5)',
              }}
            />
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            已解鎖 {progress.total.unlocked} / {progress.total.total} 項
          </div>
        </section>

        {/* Tab 栏 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const p = progress[tab.id as keyof typeof progress];
            const count = typeof p === 'object' && 'unlocked' in p
              ? `${p.unlocked}/${p.total}`
              : '';
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
                {count && <span className="text-xs opacity-70">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Tab 内容 */}
        <div className="rounded-lg border border-white/10 bg-bg-dark/50 p-4 md:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CodexPage;
