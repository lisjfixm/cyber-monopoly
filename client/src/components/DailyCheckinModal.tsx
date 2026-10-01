import { useState, useEffect } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { X, Gift, Check, Sparkles, Coins } from 'lucide-react';
import { useDailyCheckin, type WeeklyReward } from '@client/src/hooks/useDailyCheckin';
import { useAvatarFrame } from '@client/src/hooks/useAvatarFrame';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DailyCheckinModal = ({ isOpen, onClose }: DailyCheckinModalProps) => {
  const { canCheckin, streak, totalDays, currentDay, weeklyRewards, checkin, performServerCheckin, coins, isLoggedIn, isLoading } = useDailyCheckin();
  const { unlockFrame } = useAvatarFrame();
  const [showRewardAnim, setShowRewardAnim] = useState<boolean>(false);
  const [lastReward, setLastReward] = useState<WeeklyReward | null>(null);
  const [animating, setAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShowRewardAnim(false);
      setLastReward(null);
    }
  }, [isOpen]);

  const handleCheckin = async () => {
    if (!canCheckin || animating) return;
    setAnimating(true);
    try {
      const result = isLoggedIn
        ? await performServerCheckin()
        : checkin();
      if (!result) {
        setAnimating(false);
        return;
      }
      setLastReward(result.reward);
      setShowRewardAnim(true);

      if (result.isGrandPrize && result.reward.bonus) {
        try {
          unlockFrame('coin');
        } catch {
          // ignore unlock frame error
        }
      }
    } catch (err) {
      // 簽到失敗時重置動畫狀態，避免卡死
      logger.error('[DailyCheckin] 簽到異常', err);
    }

    setTimeout(() => {
      setAnimating(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="cyber-card relative w-full max-w-lg p-6"
        style={{
          borderColor: 'var(--yellow)',
          boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)',
          backgroundColor: 'hsl(240, 18%, 10%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded transition-colors hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="關閉"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="font-cyber text-2xl md:text-3xl tracking-wider"
            style={{
              color: 'var(--yellow)',
              textShadow: '0 0 10px rgba(250, 204, 21, 0.6)',
            }}
          >
            <Gift size={28} className="inline-block mr-2" style={{ verticalAlign: '-6px' }} />
            每日簽到
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-2 font-cyber tracking-wider">
            連續簽到：<span style={{ color: 'var(--yellow)' }}>{streak}</span> 天
            &nbsp;|&nbsp; 累計簽到：<span style={{ color: 'var(--cyan)' }}>{totalDays}</span> 天
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            金幣餘額：{coins.toLocaleString()}
          </div>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weeklyRewards.map((reward: WeeklyReward, idx: number) => {
            const dayIdx = idx + 1;
            const checkedIn = canCheckin ? dayIdx < currentDay : dayIdx <= currentDay;
            const isToday = canCheckin && dayIdx === currentDay;
            const isGrand = reward.isGrandPrize;

            return (
              <div
                key={reward.day}
                className="relative flex flex-col items-center p-2 rounded"
                style={{
                  border: `1px solid ${
                    isToday ? 'var(--yellow)' : isGrand ? 'var(--pink)' : 'color-mix(in srgb, var(--text-muted) 20%, transparent)'
                  }`,
                  backgroundColor: checkedIn
                    ? 'rgba(0, 255, 128, 0.08)'
                    : isToday
                      ? 'rgba(250, 204, 21, 0.08)'
                      : 'transparent',
                  boxShadow: isToday ? '0 0 12px rgba(250, 204, 21, 0.4)' : 'none',
                }}
              >
                <div className="text-[10px] font-cyber mb-1" style={{ color: 'var(--text-muted)' }}>
                  第{dayIdx}天
                </div>
                {isGrand ? (
                  <Sparkles size={20} style={{ color: 'var(--pink)' }} />
                ) : (
                  <Coins size={18} style={{ color: 'var(--yellow)' }} />
                )}
                <div className="text-xs font-cyber mt-1" style={{ color: checkedIn ? 'var(--green)' : 'var(--text-secondary)' }}>
                  {reward.coins}
                </div>
                {checkedIn && (
                  <div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--green)' }}
                  >
                    <Check size={10} style={{ color: 'var(--bg-deep)' }} />
                  </div>
                )}
                {isToday && canCheckin && (
                  <div
                    className="absolute inset-0 rounded pointer-events-none"
                    style={{
                      boxShadow: 'inset 0 0 8px rgba(250, 204, 21, 0.5)',
                      animation: 'checkinPulse 1.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Checkin button */}
        <button
          type="button"
          onClick={handleCheckin}
          disabled={!canCheckin || animating}
          className="cyber-btn w-full py-3 text-lg font-cyber tracking-wider flex items-center justify-center gap-2"
          style={{
            borderColor: canCheckin ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.1)',
            color: canCheckin ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.3)',
            backgroundColor: canCheckin ? 'rgba(250, 204, 21, 0.08)' : 'transparent',
            boxShadow: canCheckin ? '0 0 15px rgba(250, 204, 21, 0.3)' : 'none',
            cursor: canCheckin ? 'pointer' : 'not-allowed',
          }}
        >
          {canCheckin ? (
            <>
              <Gift size={20} />
              立即簽到
            </>
          ) : (
            <>
              <Check size={20} />
              今日已簽到
            </>
          )}
        </button>

        {/* Reward popup */}
        {showRewardAnim && lastReward && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              animation: 'rewardFadeIn 0.3s ease-out',
            }}
          >
            <div className="text-center">
              <div
                className="font-cyber text-3xl mb-4"
                style={{
                  color: lastReward.isGrandPrize ? 'var(--pink)' : 'var(--yellow)',
                  textShadow: `0 0 20px ${lastReward.isGrandPrize ? 'var(--pink)' : 'var(--yellow)'}`,
                  animation: 'rewardBounce 0.6s ease-out',
                }}
              >
                {lastReward.isGrandPrize ? '慶祝 大獎！' : '簽到成功'}
              </div>
              <div className="flex items-center justify-center gap-2 text-xl font-cyber" style={{ color: 'var(--yellow)' }}>
                <Coins size={24} />
                +{lastReward.coins.toLocaleString()}
              </div>
              {lastReward.isGrandPrize && lastReward.bonusName && (
                <div className="mt-3 text-sm" style={{ color: 'var(--pink)' }}>
                  <Sparkles size={16} className="inline mr-1" />
                  額外獎勵：{lastReward.bonusName}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowRewardAnim(false)}
                className="cyber-btn mt-6 px-6 py-2 text-sm font-cyber"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
              >
                確定
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes checkinPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
          }
          @keyframes rewardFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes rewardBounce {
            0% { transform: scale(0.3); opacity: 0; }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default DailyCheckinModal;
