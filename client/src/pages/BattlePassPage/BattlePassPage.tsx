import { FC, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Lock,
  Crown,
  Coins,
  Sparkles,
  Zap,
  Gift,
  ChevronRight,
  Target,
  Calendar,
  Trophy,
  Clock,
  Star,
  Gem,
  Swords,
  Scroll,
  Palette,
  Flame,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/src/components/ui/tabs';
import {
  getBattlePassState,
  saveBattlePassState,
  addExp,
  canClaimTierReward,
  claimTierReward,
  canClaimQuest,
  claimQuest,
  purchasePremium,
  getSeasonRewardsPreview,
} from '@client/src/utils/battlepass';
import {
  BATTLE_PASS_EXP_PER_LEVEL,
  BATTLE_PASS_MAX_LEVEL,
  BATTLE_PASS_SEASON_NAME,
} from '@shared/game-config';
import type { BattlePassState, BattlePassTier, BattlePassQuest } from '@shared/api.interface';

type QuestTab = 'daily' | 'weekly' | 'season';

const RARITY_COLORS: Record<string, string> = {
  common: 'var(--text-secondary)',
  rare: 'var(--cyan)',
  epic: 'var(--purple)',
  legendary: 'var(--yellow)',
};

const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

function getRewardIcon(type: string) {
  switch (type) {
    case 'coin':
    case 'ticket':
      return Coins;
    case 'skin':
    case 'pawnSkin':
      return Crown;
    case 'avatarFrame':
      return Sparkles;
    case 'diceSkin':
      return Star;
    case 'effect':
      return Zap;
    case 'item':
      return Gift;
    case 'profession':
      return Swords;
    case 'title':
      return Trophy;
    case 'collectible':
      return Gem;
    default:
      return Gift;
  }
}

function useCountdown(targetIso: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const calc = () => {
    const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  return time;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const BattlePassPage: FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<BattlePassState>(() => getBattlePassState());
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [questTab, setQuestTab] = useState<QuestTab>('daily');
  const trackRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdown(state.seasonEndsAt);

  const seasonRewardsPreview = useMemo(
    () => getSeasonRewardsPreview(state),
    [state],
  );

  useEffect(() => {
    if (trackRef.current) {
      const levelIndex = state.currentLevel - 1;
      const total = trackRef.current.children.length;
      if (levelIndex >= 0 && levelIndex < total) {
        const node = trackRef.current.children[levelIndex] as HTMLElement | undefined;
        if (node) {
          trackRef.current.scrollLeft = node.offsetLeft - trackRef.current.clientWidth / 2 + node.clientWidth / 2;
        }
      }
    }
  }, [state.currentLevel]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleAddExp = useCallback(() => {
    const newState = addExp(state, 200);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);

  const handlePurchasePremium = useCallback(() => {
    const newState = purchasePremium(state);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);

  const handleClaimTier = useCallback((level: number, isPremium: boolean) => {
    const newState = claimTierReward(state, level, isPremium);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);

  const handleClaimQuest = useCallback((questId: string) => {
    const { state: newState, xpGained } = claimQuest(state, questId);
    saveBattlePassState(newState);
    setState(newState);
  }, [state]);

  const selectedTier = useMemo<BattlePassTier | null>(() => {
    if (selectedLevel === null) return null;
    return state.tiers.find((t) => t.level === selectedLevel) ?? null;
  }, [selectedLevel, state.tiers]);

  const expPercent = useMemo(() => {
    if (state.currentLevel >= BATTLE_PASS_MAX_LEVEL) return 100;
    const denom = state.xpToNextLevel;
    if (typeof denom !== 'number' || denom <= 0) return 0;
    return Math.min(100, Math.max(0, (state.currentXP / denom) * 100));
  }, [state.currentLevel, state.currentXP, state.xpToNextLevel]);

  const activeQuests = useMemo(() => {
    switch (questTab) {
      case 'daily':
        return state.dailyQuests;
      case 'weekly':
        return state.weeklyQuests;
      case 'season':
        return state.seasonQuests;
    }
  }, [questTab, state.dailyQuests, state.weeklyQuests, state.seasonQuests]);

  const unclaimedTiersCount = useMemo(() => {
    let count = 0;
    for (const tier of state.tiers) {
      // 不依賴 tiers 陣列升序排列：逐個檢查，只統計已解鎖且未領取的階級
      if (tier.level > state.currentLevel) continue;
      if (!tier.claimed.free) count++;
      if (state.premiumPurchased && !tier.claimed.premium) count++;
    }
    return count;
  }, [state.tiers, state.currentLevel, state.premiumPurchased]);

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <div className="flex-1">
          <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
            賽季通行證
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1">
            第 3 賽季 · {BATTLE_PASS_SEASON_NAME}
          </p>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto space-y-6 pb-10">
        {/* 頂部：賽季倒計時 + 等級進度 */}
        <div
          className="cyber-card p-5 md:p-6 relative overflow-hidden"
          style={{
            borderColor: state.premiumPurchased ? 'var(--yellow)' : 'var(--cyan)',
            boxShadow: state.premiumPurchased
              ? '0 0 25px rgba(255, 200, 0, 0.25), inset 0 0 20px rgba(255, 200, 0, 0.1)'
              : '0 0 20px rgba(0, 255, 255, 0.2)',
          }}
        >
          {state.premiumPurchased && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-cyber tracking-wider"
              style={{
                color: 'var(--yellow)',
                border: '1px solid var(--yellow)',
                backgroundColor: 'rgba(255, 200, 0, 0.1)',
                boxShadow: '0 0 8px rgba(255, 200, 0, 0.4)',
              }}
            >
              <Crown size={12} />
              豪華通行證
            </div>
          )}

          {/* 倒計時 */}
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} style={{ color: 'var(--pink)' }} />
            <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
              賽季倒計時
            </span>
            <div
              className="font-cyber text-sm md:text-base tracking-wider"
              style={{
                color: 'var(--pink)',
                textShadow: '0 0 8px rgba(255, 105, 180, 0.6)',
              }}
            >
              {countdown.days}天 {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
            </div>
          </div>

          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
                當前等級
              </div>
              <div
                className="font-cyber text-5xl md:text-6xl font-bold tracking-wider"
                style={{
                  color: state.premiumPurchased ? 'var(--yellow)' : 'var(--cyan)',
                  textShadow: state.premiumPurchased
                    ? '0 0 15px rgba(255, 200, 0, 0.6)'
                    : '0 0 15px rgba(0, 255, 255, 0.6)',
                }}
              >
                {state.currentLevel}
                <span className="text-xl md:text-2xl text-[var(--text-secondary)] ml-1">
                  / {BATTLE_PASS_MAX_LEVEL}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-1">
                總經驗
              </div>
              <div className="font-cyber text-lg text-[var(--text-primary)]">
                {state.totalXP} EXP
              </div>
            </div>
          </div>

          {/* 大進度條 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
              <span>Lv.{state.currentLevel}</span>
              <span>
                {state.currentLevel >= BATTLE_PASS_MAX_LEVEL
                  ? '已滿級'
                  : `${state.currentXP} / ${state.xpToNextLevel} EXP`}
              </span>
              <span>
                Lv.{Math.min(state.currentLevel + 1, BATTLE_PASS_MAX_LEVEL)}
              </span>
            </div>
            <div
              className="h-4 rounded-sm bg-[var(--bg-mid)] border relative overflow-hidden"
              style={{ borderColor: state.premiumPurchased ? 'rgba(255, 200, 0, 0.3)' : 'var(--border-neon-cyan)' }}
            >
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${expPercent}%`,
                  background: state.premiumPurchased
                    ? 'linear-gradient(90deg, rgba(255, 200, 0, 0.2), rgba(255, 107, 157, 0.7))'
                    : 'linear-gradient(90deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.85))',
                  boxShadow: state.premiumPurchased
                    ? '0 0 12px rgba(255, 200, 0, 0.6)'
                    : '0 0 12px rgba(0, 255, 255, 0.6)',
                }}
              />
            </div>
            {state.currentLevel < BATTLE_PASS_MAX_LEVEL && (
              <div className="text-xs text-right text-[var(--text-secondary)] font-cyber">
                距下一級還差 {state.xpToNextLevel - state.currentXP} EXP
              </div>
            )}
          </div>
        </div>

        {/* 雙軌獎勵時間線 */}
        <div
          className="cyber-card p-4 md:p-5"
          style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cyber text-base tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Flame size={18} style={{ color: 'var(--pink)' }} />
              獎勵時線
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1" style={{ color: 'var(--cyan)' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
                免費
              </span>
              <span className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                <Crown size={12} />
                豪華
              </span>
              {unclaimedTiersCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full font-cyber text-xs"
                  style={{
                    color: 'var(--green)',
                    border: '1px solid var(--green)',
                  }}
                >
                  {unclaimedTiersCount} 項可領取
                </span>
              )}
            </div>
          </div>

          <div
            ref={trackRef}
            className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--cyan) transparent' }}
          >
            {state.tiers.map((tier) => {
              const isCurrent = tier.level === state.currentLevel;
              const isUnlocked = tier.level <= state.currentLevel;
              const freeReward = tier.freeReward ?? { type: 'item', name: '???', value: '' };
              const freeClaimed = tier.claimed?.free === true;
              const premClaimed = tier.claimed?.premium === true;
              const isMilestone = tier.level % 5 === 0;

              return (
                <button
                  key={tier.level}
                  type="button"
                  onClick={() => setSelectedLevel(tier.level)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group relative w-20 md:w-24"
                >
                  <span
                    className="text-[10px] md:text-xs font-cyber"
                    style={{
                      color: isCurrent
                        ? 'var(--cyan)'
                        : isUnlocked
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                    }}
                  >
                    Lv.{tier.level}
                    {isMilestone && (
                      <span
                        className="ml-1"
                        style={{ color: 'var(--yellow)', textShadow: '0 0 4px var(--yellow)' }}
                      >
                        ★
                      </span>
                    )}
                  </span>

                  {/* 雙層節點：外圈=免費，內點=豪華 */}
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative transition-transform group-hover:scale-110"
                    style={{
                      border: `2px solid ${isUnlocked ? 'var(--cyan)' : 'var(--text-muted)'}`,
                      backgroundColor: isUnlocked ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0,0,0,0.3)',
                      boxShadow: isCurrent
                        ? '0 0 16px var(--cyan), 0 0 32px rgba(0, 255, 255, 0.4)'
                        : isUnlocked
                          ? '0 0 8px rgba(0, 255, 255, 0.4)'
                          : 'none',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                      style={{
                        border: `2px solid ${state.premiumPurchased ? 'var(--yellow)' : 'rgba(255, 200, 0, 0.3)'}`,
                        backgroundColor: state.premiumPurchased ? 'rgba(255, 200, 0, 0.15)' : 'rgba(0,0,0,0.4)',
                        boxShadow: state.premiumPurchased && isUnlocked
                          ? '0 0 10px rgba(255, 200, 0, 0.5)'
                          : 'none',
                      }}
                    >
                      {(() => {
                        const Icon = getRewardIcon(freeReward.type);
                        return (
                          <Icon
                            size={16}
                            style={{
                              color: isUnlocked ? 'var(--cyan)' : 'var(--text-muted)',
                            }}
                          />
                        );
                      })()}
                    </div>

                    {freeClaimed && (
                      <div
                        className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}
                      >
                        <Check size={12} color="var(--bg-deep)" strokeWidth={3} />
                      </div>
                    )}
                    {state.premiumPurchased && premClaimed && (
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--yellow)', boxShadow: '0 0 6px var(--yellow)' }}
                      >
                        <Check size={12} color="var(--bg-deep)" strokeWidth={3} />
                      </div>
                    )}
                    {!state.premiumPurchased && isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-dark)] flex items-center justify-center" style={{ border: '1px solid var(--yellow)' }}>
                        <Lock size={8} style={{ color: 'var(--yellow)' }} />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-center max-w-[80px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {freeReward.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 賽季任務 */}
        <div
          className="cyber-card p-4 md:p-5"
          style={{ borderColor: 'rgba(0, 255, 255, 0.25)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cyber text-base tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Target size={18} style={{ color: 'var(--cyan)' }} />
              賽季任務
            </h2>
            <span className="text-xs text-[var(--text-secondary)] font-cyber">
              完成任務獲取大量經驗
            </span>
          </div>

          <Tabs value={questTab} onValueChange={(v) => setQuestTab(v as QuestTab)}>
            <TabsList className="grid w-full grid-cols-3 mb-4" style={{ backgroundColor: 'var(--bg-mid)' }}>
              <TabsTrigger value="daily" className="font-cyber text-xs md:text-sm tracking-wider data-[state=active]:text-cyan-400">
                <Calendar size={14} className="inline mr-1" />
                每日任務
              </TabsTrigger>
              <TabsTrigger value="weekly" className="font-cyber text-xs md:text-sm tracking-wider data-[state=active]:text-purple-400">
                <Scroll size={14} className="inline mr-1" />
                每週任務
              </TabsTrigger>
              <TabsTrigger value="season" className="font-cyber text-xs md:text-sm tracking-wider data-[state=active]:text-yellow-400">
                <Trophy size={14} className="inline mr-1" />
                賽季任務
              </TabsTrigger>
            </TabsList>

            <TabsContent value={questTab} className="mt-0 space-y-2">
              {activeQuests.map((quest) => (
                <QuestRow
                  key={quest.id}
                  quest={quest}
                  onClaim={() => handleClaimQuest(quest.id)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* 賽季結算獎勵預覽 */}
        <div
          className="cyber-card p-4 md:p-5"
          style={{ borderColor: 'rgba(255, 105, 180, 0.3)' }}
        >
          <h2 className="font-cyber text-base tracking-wider text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Star size={18} style={{ color: 'var(--pink)' }} />
            賽季結算獎勵
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            賽季結算時依據最終等級額外發放獎勵
          </p>
          <div className="grid grid-cols-3 gap-3">
            {seasonRewardsPreview.map((item) => {
              const unlocked = state.currentLevel >= item.levelThreshold;
              const Icon = getRewardIcon(item.type);
              const color = RARITY_COLORS[item.rarity] || 'var(--text-secondary)';
              return (
                <div
                  key={item.levelThreshold}
                  className="p-3 text-center rounded-sm"
                  style={{
                    border: `1px solid ${unlocked ? color : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: unlocked ? `${color}10` : 'rgba(0,0,0,0.2)',
                    opacity: unlocked ? 1 : 0.5,
                  }}
                >
                  <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ border: `2px solid ${color}`, boxShadow: `0 0 8px ${color}40` }}>
                    {unlocked ? <Icon size={18} style={{ color }} /> : <Lock size={14} style={{ color }} />}
                  </div>
                  <div className="text-xs font-cyber" style={{ color }}>
                    Lv.{item.levelThreshold}+
                  </div>
                  <div className="text-[11px] mt-1 text-[var(--text-secondary)]">
                    {item.name}
                  </div>
                  <div
                    className="text-[10px] mt-1 font-cyber tracking-wider"
                    style={{ color }}
                  >
                    {RARITY_LABELS[item.rarity] || ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleAddExp}
            className="cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--green)',
              color: 'var(--green)',
              background: 'rgba(0, 255, 128, 0.08)',
              boxShadow: '0 0 12px rgba(0, 255, 128, 0.2)',
            }}
          >
            <Zap size={16} />
            模擬獲得經驗 (+200)
          </button>

          {!state.premiumPurchased ? (
            <button
              type="button"
              onClick={handlePurchasePremium}
              className="cyber-btn cyber-btn-pink flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
            >
              <Crown size={16} />
              解鎖豪華通行證 · NT$ 299
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="cyber-btn flex-1 py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--yellow)',
                color: 'var(--yellow)',
                background: 'rgba(255, 200, 0, 0.08)',
                boxShadow: '0 0 12px rgba(255, 200, 0, 0.2)',
                cursor: 'default',
              }}
            >
              <Crown size={16} />
              已解鎖豪華通行證
            </button>
          )}
        </div>
      </div>

      {/* 獎勵詳情彈窗 */}
      <Dialog open={selectedLevel !== null} onOpenChange={(o) => !o && setSelectedLevel(null)}>
        <DialogContent
          className="cyber-card max-w-md"
          style={{
            borderColor: 'var(--purple)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.35)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
        >
          {selectedTier && (
            <>
              <DialogHeader>
                <DialogTitle
                  className="font-cyber text-xl tracking-wider text-center"
                  style={{
                    color: 'var(--cyan)',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                  }}
                >
                  第 {selectedTier.level} 級獎勵
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 my-4">
                <RewardDetailRow
                  reward={selectedTier.freeReward ?? { type: 'item', name: '???', value: '' }}
                  label="免費通行證"
                  color="var(--cyan)"
                  claimed={selectedTier.claimed?.free === true}
                  canClaim={canClaimTierReward(state, selectedTier.level, false)}
                  onClaim={() => handleClaimTier(selectedTier.level, false)}
                />
                <RewardDetailRow
                  reward={selectedTier.premiumReward ?? { type: 'item', name: '???', value: '' }}
                  label="豪華通行證"
                  color="var(--yellow)"
                  claimed={selectedTier.claimed?.premium === true}
                  canClaim={canClaimTierReward(state, selectedTier.level, true)}
                  locked={!state.premiumPurchased}
                  onClaim={() => handleClaimTier(selectedTier.level, true)}
                />
              </div>

              {!state.premiumPurchased && selectedTier.level <= state.currentLevel && (
                <button
                  type="button"
                  onClick={handlePurchasePremium}
                  className="cyber-btn cyber-btn-pink w-full py-2.5 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
                >
                  <Crown size={14} />
                  升級通行證解鎖豪華獎勵
                </button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface QuestRowProps {
  quest: BattlePassQuest;
  onClaim: () => void;
}

const QuestRow: FC<QuestRowProps> = ({ quest, onClaim }) => {
  const progress = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0;
  const canClaim = canClaimQuest(quest);

  const tabColor = quest.refreshType === 'daily'
    ? 'var(--cyan)'
    : quest.refreshType === 'weekly'
      ? 'var(--purple)'
      : 'var(--yellow)';

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-sm"
      style={{
        border: `1px solid ${tabColor}30`,
        backgroundColor: `${tabColor}08`,
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          border: `2px solid ${tabColor}`,
          backgroundColor: `${tabColor}15`,
          boxShadow: `0 0 8px ${tabColor}40`,
        }}
      >
        <Target size={18} style={{ color: tabColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-cyber text-[var(--text-primary)] mb-1">
          {quest.description}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-mid)] overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: tabColor,
                boxShadow: `0 0 6px ${tabColor}`,
              }}
            />
          </div>
          <span className="text-xs font-cyber" style={{ color: tabColor, minWidth: '48px', textAlign: 'right' }}>
            {quest.progress}/{quest.target}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="text-xs font-cyber" style={{ color: 'var(--green)' }}>
          +{quest.xpReward} EXP
        </div>
        {quest.claimed ? (
          <div
            className="px-2 py-0.5 text-xs font-cyber flex items-center gap-1"
            style={{ color: 'var(--green)', border: '1px solid var(--green)' }}
          >
            <Check size={10} />
            已領取
          </div>
        ) : canClaim ? (
          <button
            type="button"
            onClick={onClaim}
            className="cyber-btn cyber-btn-sm px-3 py-1 text-xs font-cyber"
            style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
          >
            領取
          </button>
        ) : (
          <span className="text-[10px] text-[var(--text-muted)] font-cyber">進行中</span>
        )}
      </div>
    </div>
  );
};

interface RewardDetailRowProps {
  reward: { type: string; value: string | number; name: string; rarity?: string; amount?: number };
  label: string;
  color: string;
  claimed: boolean;
  canClaim: boolean;
  locked?: boolean;
  onClaim: () => void;
}

const RewardDetailRow: FC<RewardDetailRowProps> = ({
  reward,
  label,
  color,
  claimed,
  canClaim,
  locked,
  onClaim,
}) => {
  const Icon = getRewardIcon(reward.type);
  const rarityColor = reward.rarity ? RARITY_COLORS[reward.rarity] : color;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-sm"
      style={{
        border: `1px solid ${locked ? 'rgba(255,255,255,0.1)' : `${color}40`}`,
        backgroundColor: locked ? 'rgba(0,0,0,0.2)' : `${color}08`,
        opacity: locked ? 0.5 : 1,
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          border: `2px solid ${color}`,
          backgroundColor: `${color}15`,
          boxShadow: `0 0 10px ${color}40`,
        }}
      >
        {locked ? <Lock size={18} color={color} /> : <Icon size={20} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
          {label}
        </div>
        <div className="font-cyber text-base font-bold truncate" style={{ color: rarityColor }}>
          {reward.name}
        </div>
        {reward.rarity && (
          <div className="text-[10px] font-cyber tracking-wider mt-0.5" style={{ color: rarityColor }}>
            {RARITY_LABELS[reward.rarity] || ''}
          </div>
        )}
      </div>
      {claimed ? (
        <div
          className="px-2 py-1 text-xs font-cyber flex items-center gap-1"
          style={{ color: 'var(--green)', border: '1px solid var(--green)' }}
        >
          <Check size={12} />
          已領取
        </div>
      ) : canClaim ? (
        <button
          type="button"
          onClick={onClaim}
          className="cyber-btn cyber-btn-sm px-3 py-1 text-xs font-cyber"
          style={{ borderColor: color, color }}
        >
          領取
        </button>
      ) : (
        <ChevronRight size={18} color="var(--text-muted)" />
      )}
    </div>
  );
};

export default BattlePassPage;
