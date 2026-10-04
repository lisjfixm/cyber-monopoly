import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { safeGetItem, safeSetItem } from '@client/src/utils/safeStorage';

/**
 * 首頁新手引導（輕量、居中分步彈層）
 * - 首次進入自動出現；可跳過、可略過、完成後寫入 safeStorage 不再打擾
 * - 不做脆弱的錨點定位，改用居中卡片步驟，確保手機/平板/桌面都穩定
 * - 每步都有明確行動按鈕，直接告訴新玩家「如何開始本地 / AI 對局」
 */

const DONE_KEY = 'monopoly_home_onboarding_v1_done';

export function hasHomeOnboardingCompleted(): boolean {
  return safeGetItem(DONE_KEY) === '1';
}

interface Step {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface HomeOnboardingGuideProps {
  open: boolean;
  onClose: () => void;
}

const HomeOnboardingGuide = ({ open, onClose }: HomeOnboardingGuideProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const finish = useCallback(() => {
    safeSetItem(DONE_KEY, '1');
    onClose();
  }, [onClose]);

  const goAi = useCallback(() => {
    safeSetItem(DONE_KEY, '1');
    navigate('/ai-setup');
  }, [navigate]);

  const goLocal = useCallback(() => {
    safeSetItem(DONE_KEY, '1');
    navigate('/local-setup');
  }, [navigate]);

  const steps: Step[] = [
    {
      id: 'welcome',
      icon: <Sparkles size={28} style={{ color: 'var(--cyan)' }} />,
      title: '歡迎來到賽博大富翁',
      body: '在這座霓虹都市裡，買地、收租、抽命運卡，把對手逼到破產！別擔心，三步帶你開局。',
    },
    {
      id: 'ai',
      icon: <Bot size={28} style={{ color: 'var(--pink)' }} />,
      title: '第一次玩？先挑戰 AI',
      body: '「人機對戰」會跟電腦對手單獨練習，沒有壓力，最適合新手熟悉規則。準備好就直接開始。',
      actionLabel: '開始人機對戰',
      onAction: goAi,
    },
    {
      id: 'local',
      icon: <Users size={28} style={{ color: 'var(--cyan)' }} />,
      title: '和朋友同樂？本地多人',
      body: '「本地多人」讓大家輪流使用同一台裝置對決，适合聚會同樂。規則都一樣，隨時能開一局。',
      actionLabel: '開始本地多人',
      onAction: goLocal,
    },
  ];

  if (!open) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-onboarding-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm p-6 relative"
        style={{
          background: 'var(--bg-dark)',
          border: '1px solid var(--cyan)',
          boxShadow: '0 0 30px color-mix(in srgb, var(--cyan) 35%, transparent), inset 0 0 20px color-mix(in srgb, var(--cyan) 8%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={finish}
          className="absolute top-2 right-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="略過教學"
        >
          <X size={18} />
        </button>

        <div className="flex justify-center mb-3">{current.icon}</div>
        <h3
          id="home-onboarding-title"
          className="font-cyber text-lg font-bold tracking-wider text-center mb-2"
          style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan-glow)' }}
        >
          {current.title}
        </h3>
        <p className="text-sm leading-relaxed text-center mb-5" style={{ color: 'var(--text-secondary)' }}>
          {current.body}
        </p>

        {/* 步驟指示點 */}
        <div className="flex justify-center gap-1.5 mb-5" aria-hidden="true">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? '20px' : '8px',
                background: i === step ? 'var(--cyan)' : 'color-mix(in srgb, var(--cyan) 30%, transparent)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((p) => Math.max(0, p - 1))}
              className="cyber-btn cyber-btn-sm flex items-center gap-1 px-3 py-2"
              aria-label="上一步"
            >
              <ChevronLeft size={14} /> 上一步
            </button>
          )}
          <button
            type="button"
            onClick={finish}
            className="cyber-btn cyber-btn-sm px-3 py-2"
            style={{ color: 'var(--text-secondary)', borderColor: 'color-mix(in srgb, var(--text-secondary) 40%, transparent)' }}
          >
            略過
          </button>
          <div className="flex-1" />
          {current.onAction ? (
            <button
              type="button"
              onClick={current.onAction}
              className="cyber-btn cyber-btn-pink cyber-btn-sm flex items-center gap-1 px-4 py-2 font-cyber tracking-wider"
            >
              {current.actionLabel} <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (isLast ? finish() : setStep((p) => p + 1))}
              className="cyber-btn cyber-btn-sm flex items-center gap-1 px-4 py-2 font-cyber tracking-wider"
            >
              {isLast ? '開始遊戲' : '下一步'} <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeOnboardingGuide;
