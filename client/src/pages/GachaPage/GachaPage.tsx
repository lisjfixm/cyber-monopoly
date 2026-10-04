import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  Sparkles,
  Gem,
  Gift,
  RotateCw,
  Crown,
  Star,
  PawPrint,
  Award,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGacha,
  RARITY_COLORS,
  RARITY_LABELS,
  DUPLICATE_FRAGMENTS,
  SINGLE_PULL_COST,
  TEN_PULL_COST,
  PITY_MAX,
  type GachaReward,
} from '@client/src/hooks/useGacha';
import { useSkinStorage } from '@client/src/hooks/useSkinStorage';
import { usePetStorage } from '@client/src/hooks/usePetStorage';
import { useTitles } from '@client/src/hooks/useTitles';
import { useSkinUpgrade } from '@client/src/hooks/useSkinUpgrade';
import { addCoins, getCoins } from '@client/src/hooks/useDailyCheckin';
import { vibrate, vibrationPatterns } from '@client/src/utils/vibrate';

interface GrantedReward {
  reward: GachaReward;
  isNew: boolean;
  convertedFragments: number;
}

const GachaPage = () => {
  const navigate = useNavigate();
  const gacha = useGacha();
  const skin = useSkinStorage();
  const pet = usePetStorage();
  const titles = useTitles();
  const skinUpgrade = useSkinUpgrade();

  const [coins, setCoins] = useState<number>(() => getCoins());
  const [pulling, setPulling] = useState<boolean>(false);
  const [results, setResults] = useState<GrantedReward[] | null>(null);

  // 同步鎖與動畫計時器：避免連點重複扣款/發獎，unmount 時清除
  const pullingRef = useRef<boolean>(false);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  const fragments = skinUpgrade.fragments;

  const isOwned = useCallback(
    (reward: GachaReward): boolean => {
      switch (reward.kind) {
        case 'pawnSkin':
          return skin.unlockedPawnSkins.includes(reward.id);
        case 'diceSkin':
          return skin.unlockedDiceSkins.includes(reward.id);
        case 'pet':
          return pet.unlockedPets.includes(reward.id);
        case 'title':
          return titles.unlockedTitles.includes(reward.id);
        default:
          return false;
      }
    },
    [skin.unlockedPawnSkins, skin.unlockedDiceSkins, pet.unlockedPets, titles.unlockedTitles],
  );

  const grantReward = useCallback(
    (reward: GachaReward): { isNew: boolean; convertedFragments: number } => {
      if (isOwned(reward)) {
        const converted = DUPLICATE_FRAGMENTS[reward.rarity];
        skinUpgrade.addFragments(converted);
        return { isNew: false, convertedFragments: converted };
      }
      switch (reward.kind) {
        case 'pawnSkin':
          skin.unlockPawnSkin(reward.id);
          break;
        case 'diceSkin':
          skin.unlockDiceSkin(reward.id);
          break;
        case 'pet':
          pet.unlockPet(reward.id);
          break;
        case 'title':
          titles.unlockTitle(reward.id);
          break;
      }
      return { isNew: true, convertedFragments: 0 };
    },
    [isOwned, skin, pet, titles, skinUpgrade],
  );

  const doPull = useCallback(
    (times: 1 | 10, currency: 'coins' | 'fragments') => {
      if (pullingRef.current) return;
      const cost = times === 1 ? SINGLE_PULL_COST : TEN_PULL_COST;
      if (currency === 'coins') {
        if (coins < cost.coins) {
          toast.error(`金幣不足，需要 ${cost.coins}`);
          return;
        }
      } else {
        if (fragments < cost.fragments) {
          toast.error(`碎片不足，需要 ${cost.fragments}`);
          return;
        }
      }

      pullingRef.current = true;
      setPulling(true);
      vibrate(vibrationPatterns.medium);

      // 扣款
      if (currency === 'coins') {
        addCoins(-cost.coins);
        setCoins(getCoins());
      } else {
        skinUpgrade.addFragments(-cost.fragments);
      }

      // 抽獎（hook 內隨機）
      const outcomes = Array.from({ length: times }, () => gacha.drawOnce());
      gacha.commitDraws(outcomes);

      // 發放獎勵
      const granted: GrantedReward[] = outcomes.map((o) => {
        const g = grantReward(o.reward);
        return { reward: o.reward, isNew: g.isNew, convertedFragments: g.convertedFragments };
      });

      settleTimeoutRef.current = setTimeout(() => {
        pullingRef.current = false;
        setPulling(false);
        setResults(granted);
        const legendaryCount = granted.filter((g) => g.reward.rarity === 'legendary').length;
        if (legendaryCount > 0) {
          vibrate(vibrationPatterns.win);
          toast.success(`恭喜獲得 ${legendaryCount} 項傳說獎勵！`);
        } else {
          vibrate(vibrationPatterns.light);
        }
      }, 800);
    },
    [pulling, coins, fragments, gacha, grantReward, skinUpgrade],
  );

  const rarityIcon = (reward: GachaReward) => {
    switch (reward.kind) {
      case 'pawnSkin': return <Crown size={22} />;
      case 'diceSkin': return <Star size={22} />;
      case 'pet': return <PawPrint size={22} />;
      case 'title': return <Award size={22} />;
    }
  };

  const costButtons = useMemo(
    () => [
      {
        times: 1 as const,
        label: '單抽',
        desc: `金幣 ${SINGLE_PULL_COST.coins}`,
        action: () => doPull(1, 'coins' as const),
        disabled: coins < SINGLE_PULL_COST.coins,
        color: 'var(--cyan)',
      },
      {
        times: 10 as const,
        label: '十連',
        desc: `金幣 ${TEN_PULL_COST.coins}`,
        action: () => doPull(10, 'coins' as const),
        disabled: coins < TEN_PULL_COST.coins,
        color: 'var(--pink)',
      },
      {
        times: 1 as const,
        label: '碎片單抽',
        desc: `碎片 ${SINGLE_PULL_COST.fragments}`,
        action: () => doPull(1, 'fragments' as const),
        disabled: fragments < SINGLE_PULL_COST.fragments,
        color: 'var(--purple)',
      },
      {
        times: 10 as const,
        label: '碎片十連',
        desc: `碎片 ${TEN_PULL_COST.fragments}`,
        action: () => doPull(10, 'fragments' as const),
        disabled: fragments < TEN_PULL_COST.fragments,
        color: 'var(--yellow)',
      },
    ],
    [coins, fragments, doPull],
  );

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-24 md:pb-10 max-w-2xl mx-auto">
      {/* 頂欄 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-cyber text-2xl md:text-3xl tracking-wider" style={{ color: 'var(--pink)', textShadow: '0 0 12px var(--pink-glow)' }}>
            霓虹扭蛋
          </h1>
          <p className="text-xs font-cyber tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
            抽取皮膚 / 寵物 / 稱號 · v3.0.0
          </p>
        </div>
      </div>

      {/* 資產列 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="cyber-card p-3 flex items-center gap-3">
          <Coins size={20} style={{ color: 'var(--yellow)' }} />
          <div>
            <div className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>金幣</div>
            <div className="font-cyber text-lg" style={{ color: 'var(--yellow)' }}>{coins}</div>
          </div>
        </div>
        <div className="cyber-card p-3 flex items-center gap-3">
          <Sparkles size={20} style={{ color: 'var(--purple)' }} />
          <div>
            <div className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>碎片</div>
            <div className="font-cyber text-lg" style={{ color: 'var(--purple)' }}>{fragments}</div>
          </div>
        </div>
      </div>

      {/* 保底進度 */}
      <div className="cyber-card p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-cyber text-sm" style={{ color: 'var(--text-secondary)' }}>傳說保底進度</span>
          <span className="font-cyber text-sm" style={{ color: 'var(--yellow)' }}>
            {gacha.pityCount} / {PITY_MAX}
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full"
            style={{
              width: `${(gacha.pityCount / PITY_MAX) * 100}%`,
              background: 'linear-gradient(90deg, var(--yellow), var(--pink))',
              boxShadow: '0 0 8px var(--pink-glow)',
              transition: 'width 0.3s',
            }}
          />
        </div>
        <p className="text-xs font-cyber mt-2" style={{ color: 'var(--text-muted)' }}>
          距離保底傳說還剩 {gacha.pityRemaining} 抽
        </p>
      </div>

      {/* 機率預告 */}
      <div className="cyber-card p-4 mb-6">
        <h3 className="font-cyber text-sm mb-3" style={{ color: 'var(--cyan)' }}>獎池機率</h3>
        <div className="flex flex-wrap gap-2 text-xs font-cyber">
          {(['common', 'rare', 'epic', 'legendary'] as const).map((r) => (
            <span
              key={r}
              className="px-2 py-1"
              style={{
                color: RARITY_COLORS[r],
                border: `1px solid ${RARITY_COLORS[r]}`,
                background: `${RARITY_COLORS[r]}15`,
              }}
            >
              {RARITY_LABELS[r]} {r === 'common' ? '50%' : r === 'rare' ? '30%' : r === 'epic' ? '15%' : '5%'}
            </span>
          ))}
        </div>
        <p className="text-xs font-cyber mt-3" style={{ color: 'var(--text-muted)' }}>
          重複取得會自動轉換為碎片（普通 5 / 稀有 15 / 史詩 30 / 傳說 80）
        </p>
      </div>

      {/* 抽取按鈕 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {costButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            disabled={btn.disabled || pulling}
            className="cyber-btn p-4 flex flex-col items-center gap-2 min-h-[88px]"
            style={{
              borderColor: btn.color,
              color: btn.color,
              background: `${btn.color}14`,
              boxShadow: `0 0 12px ${btn.color}33`,
              cursor: btn.disabled || pulling ? 'not-allowed' : 'pointer',
              opacity: btn.disabled || pulling ? 0.5 : 1,
            }}
          >
            {pulling ? <RotateCw size={22} className="animate-spin" /> : <Gift size={22} />}
            <span className="font-cyber tracking-wider">{btn.label}</span>
            <span className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>{btn.desc}</span>
          </button>
        ))}
      </div>

      {/* 歷史統計 */}
      <div className="cyber-card p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-cyber" style={{ color: 'var(--text-secondary)' }}>
          <Gem size={16} />
          累計抽取 {gacha.totalPulls} 次
        </div>
      </div>

      {/* 結果彈窗 */}
      {results && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setResults(null)}
        >
          <div
            className="cyber-card p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-cyber text-lg" style={{ color: 'var(--pink)', textShadow: '0 0 8px var(--pink-glow)' }}>
                抽取結果
              </h3>
              <button
                type="button"
                onClick={() => setResults(null)}
                className="p-1"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="關閉"
              >
                <X size={18} />
              </button>
            </div>
            <div className={`grid gap-2 ${results.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {results.map((g, i) => (
                <div
                  key={i}
                  className="p-3 text-center"
                  style={{
                    border: `1px solid ${RARITY_COLORS[g.reward.rarity]}`,
                    background: `${RARITY_COLORS[g.reward.rarity]}12`,
                    boxShadow: `0 0 10px ${RARITY_COLORS[g.reward.rarity]}33`,
                  }}
                >
                  <div className="flex justify-center mb-2" style={{ color: RARITY_COLORS[g.reward.rarity] }}>
                    {rarityIcon(g.reward)}
                  </div>
                  <div className="font-cyber text-xs mb-1" style={{ color: RARITY_COLORS[g.reward.rarity] }}>
                    {RARITY_LABELS[g.reward.rarity]}
                  </div>
                  <div className="font-cyber text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {g.reward.name}
                  </div>
                  {g.isNew ? (
                    <div className="text-xs font-cyber" style={{ color: 'var(--green)' }}>新解放！</div>
                  ) : (
                    <div className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>
                      重複 → 碎片 +{g.convertedFragments}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setResults(null)}
              className="cyber-btn w-full mt-4 py-2.5 text-sm"
            >
              確認
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaPage;
