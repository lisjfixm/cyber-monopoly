import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { TutorialStepConfig } from '@client/src/config/tutorial';

interface TutorialOverlayProps {
  steps: TutorialStepConfig[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

function TutorialOverlay({
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: TutorialOverlayProps) {
  const step = steps[currentStep];
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const isCenter = !step?.targetSelector || step.placement === 'center';

  const computeTargetRect = useCallback((): TargetRect | null => {
    if (!step?.targetSelector) return null;
    try {
      const el = document.querySelector(step.targetSelector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };
    } catch {
      return null;
    }
  }, [step]);

  const updatePosition = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = computeTargetRect();
      setTargetRect(rect);

      if (!rect || !tooltipRef.current) {
        setTooltipPos(null);
        return;
      }

      const tooltip = tooltipRef.current;
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      const gap = 16;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (step.placement) {
        case 'top':
          top = rect.top - tooltipHeight - gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          if (top < 16) {
            top = rect.top + rect.height + gap;
          }
          break;
        case 'bottom':
          top = rect.top + rect.height + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          if (top + tooltipHeight > vh - 16) {
            top = rect.top - tooltipHeight - gap;
          }
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - gap;
          if (left < 16) {
            left = rect.left + rect.width + gap;
          }
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left + rect.width + gap;
          if (left + tooltipWidth > vw - 16) {
            left = rect.left - tooltipWidth - gap;
          }
          break;
        default:
          setTooltipPos(null);
          return;
      }

      // 水平边界约束
      left = Math.max(16, Math.min(left, vw - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, vh - tooltipHeight - 16));

      setTooltipPos({ top, left });
    });
  }, [computeTargetRect, step]);

  useEffect(() => {
    updatePosition();
  }, [currentStep, step, updatePosition]);

  // 内容变化后重新计算位置
  useEffect(() => {
    if (!tooltipRef.current) return;
    // 双重 RAF 确保布局完成
    const t1 = requestAnimationFrame(() => {
      const t2 = requestAnimationFrame(() => {
        updatePosition();
      });
      return () => cancelAnimationFrame(t2);
    });
    return () => cancelAnimationFrame(t1);
  }, [step?.title, step?.description, updatePosition]);

  useEffect(() => {
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updatePosition]);

  // 中心模式（welcome / victory）
  if (isCenter) {
    return (
      <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
        <div
          className="cyber-card max-w-md w-full p-6 md:p-8 relative"
          style={{
            borderColor: 'var(--cyan)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)',
          }}
        >
          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-neon-cyan transition-colors"
            aria-label="关闭"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="text-neon-cyan font-cyber text-xs tracking-[0.3em] mb-2">
              {step?.id === 'victory' ? '教学完成' : '新手教学'}
            </div>
            <h2
              className="font-cyber text-2xl md:text-3xl tracking-wider mb-4 pulse-glow"
              style={{ color: step?.id === 'victory' ? 'var(--pink)' : 'var(--cyan)' }}
            >
              {step?.title}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-primary)] leading-relaxed mb-6">
              {step?.description}
            </p>

            {/* 进度 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {steps.map((_, idx: number) => (
                <div
                  key={idx}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: idx === currentStep ? '24px' : '8px',
                    backgroundColor:
                      idx <= currentStep ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: idx <= currentStep ? '0 0 6px var(--cyan)' : 'none',
                  }}
                />
              ))}
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-6">
              第 {currentStep + 1} 步 / 共 {steps.length} 步
            </div>

            <div className="flex gap-3 justify-center">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="cyber-btn px-5 py-2 text-sm"
                >
                  <ChevronLeft size={16} className="inline align-middle" /> 上一步
                </button>
              )}
              <button
                type="button"
                onClick={onNext}
                className="cyber-btn cyber-btn-pink px-6 py-2 text-sm font-cyber tracking-wider"
              >
                {step?.actionLabel ?? (currentStep === steps.length - 1 ? '完成' : '下一步')}
                {!step?.actionLabel && currentStep < steps.length - 1 && (
                  <ChevronRight size={16} className="inline align-middle" />
                )}
              </button>
            </div>

            {currentStep < steps.length - 1 && (
              <button
                type="button"
                onClick={onSkip}
                className="mt-4 text-xs text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider"
              >
                跳过教学
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 非中心模式但找不到 target 時，暫時不渲染（等 target 出現後再顯示）
  if (!targetRect) return null;

  // 高亮模式
  const { top, left, width, height } = targetRect;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* 4 个遮罩块形成"洞" */}
      <div
        className="absolute left-0 right-0 bg-black/70"
        style={{ top: 0, height: Math.max(0, top) }}
      />
      <div
        className="absolute left-0 right-0 bg-black/70"
        style={{ top: top + height, bottom: 0 }}
      />
      <div
        className="absolute bg-black/70"
        style={{ top, left: 0, width: Math.max(0, left), height }}
      />
      <div
        className="absolute bg-black/70"
        style={{ top, left: left + width, right: 0, height }}
      />

      {/* 高亮边框 + 呼吸发光 */}
      <div
        className="absolute pointer-events-none tutorial-highlight-glow rounded-md"
        style={{
          top,
          left,
          width,
          height,
          border: '2px solid var(--cyan)',
        }}
      />

      {/* 提示框 */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-auto cyber-card p-5 max-w-sm"
        style={{
          top: tooltipPos?.top ?? -9999,
          left: tooltipPos?.left ?? -9999,
          borderColor: 'var(--cyan)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)',
          backgroundColor: 'rgba(10, 10, 20, 0.95)',
          opacity: tooltipPos ? 1 : 0,
          transition: 'opacity 0.15s ease-out',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className="font-cyber text-lg tracking-wider"
            style={{ color: 'var(--cyan)', textShadow: '0 0 8px rgba(0, 255, 255, 0.5)' }}
          >
            {step?.title}
          </h3>
          <button
            type="button"
            onClick={onSkip}
            className="text-[var(--text-secondary)] hover:text-neon-cyan transition-colors flex-shrink-0"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
          {step?.description}
        </p>

        {/* 进度 */}
        <div className="flex items-center gap-2 mb-3">
          {steps.map((_, idx: number) => (
            <div
              key={idx}
              className="h-1 rounded-full flex-1 transition-all"
              style={{
                backgroundColor:
                  idx <= currentStep ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: idx <= currentStep ? '0 0 4px var(--cyan)' : 'none',
              }}
            />
          ))}
        </div>
        <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-4">
          第 {currentStep + 1} 步 / 共 {steps.length} 步
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider"
          >
            跳过教学
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentStep === 0}
              className="cyber-btn px-3 py-1.5 text-xs disabled:opacity-40"
              aria-label="上一步"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="cyber-btn cyber-btn-pink px-4 py-1.5 text-xs font-cyber tracking-wider"
            >
              {currentStep === steps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;
