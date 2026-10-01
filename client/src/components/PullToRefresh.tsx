import React, { useRef, useState, useCallback, useEffect } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing';

const THRESHOLD = 60;
const INDICATOR_HEIGHT = 50;
const MAX_PULL = 120;
const RESISTANCE = 0.5;

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [pullState, setPullState] = useState<PullState>('idle');
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const animDisabledRef = useRef(false);

  useEffect(() => {
    const checkAnim = (): void => {
      animDisabledRef.current =
        document.documentElement.getAttribute('data-animation') === 'off';
    };
    checkAnim();
    const observer = new MutationObserver(checkAnim);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-animation'],
    });
    return () => observer.disconnect();
  }, []);

  const getScrollTarget = useCallback((): Element | null => {
    const el = containerRef.current;
    if (!el) return null;
    // Find the nearest scrollable child or use the container itself
    const scrollable = el.querySelector(
      '[data-scroll="true"], .scroll-container',
    ) as HTMLElement | null;
    return scrollable ?? el;
  }, []);

  const isAtTop = useCallback((): boolean => {
    const target = getScrollTarget();
    if (!target) return true;
    return target.scrollTop <= 0;
  }, [getScrollTarget]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>): void => {
      if (disabled || pullState === 'refreshing') return;
      if (!isAtTop()) return;
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = false;
    },
    [disabled, pullState, isAtTop],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>): void => {
      if (disabled || pullState === 'refreshing') return;
      if (startYRef.current === null) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      // Only start pulling when moving down from top
      if (diff <= 0 && !isPullingRef.current) {
        return;
      }

      // Check if user is scrolling content instead of pulling
      if (!isPullingRef.current && diff > 0) {
        if (!isAtTop()) {
          startYRef.current = null;
          return;
        }
        isPullingRef.current = true;
      }

      if (!isPullingRef.current) return;

      // Prevent page scroll while pulling
      if (e.cancelable) {
        e.preventDefault();
      }

      const damped = Math.min(diff * RESISTANCE, MAX_PULL);
      setPullDistance(damped);

      if (damped >= THRESHOLD) {
        setPullState('ready');
      } else {
        setPullState('pulling');
      }
    },
    [disabled, pullState, isAtTop],
  );

  const handleTouchEnd = useCallback((): void => {
    if (disabled || pullState === 'refreshing') {
      startYRef.current = null;
      isPullingRef.current = false;
      return;
    }
    if (startYRef.current === null || !isPullingRef.current) {
      startYRef.current = null;
      isPullingRef.current = false;
      return;
    }

    if (pullState === 'ready') {
      // Trigger refresh
      setPullState('refreshing');
      setPullDistance(INDICATOR_HEIGHT);
      void Promise.resolve(onRefresh()).finally(() => {
        setPullState('idle');
        setPullDistance(0);
      });
    } else {
      // Snap back
      setPullState('idle');
      setPullDistance(0);
    }

    startYRef.current = null;
    isPullingRef.current = false;
  }, [disabled, pullState, onRefresh]);

  const getLabel = (): string => {
    switch (pullState) {
      case 'pulling':
        return '下拉刷新';
      case 'ready':
        return '釋放刷新';
      case 'refreshing':
        return '刷新中...';
      default:
        return '';
    }
  };

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const transition = animDisabledRef.current
    ? 'none'
    : pullState === 'refreshing' || pullState === 'idle'
      ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease'
      : 'none';

  const indicatorVisible =
    pullState === 'pulling' ||
    pullState === 'ready' ||
    pullState === 'refreshing';

  const ringDashOffset =
    pullState === 'refreshing' ? 0 : 2 * Math.PI * 10 * (1 - progress * 0.8);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 top-0 flex items-center justify-center pointer-events-none z-10"
        style={{
          height: INDICATOR_HEIGHT,
          transform: `translateY(${pullDistance - INDICATOR_HEIGHT}px)`,
          transition,
          opacity: indicatorVisible ? 1 : 0,
          willChange: 'transform, opacity',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Neon ring */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{
              transform:
                pullState === 'refreshing'
                  ? 'rotate(0deg)'
                  : `rotate(${progress * 180}deg)`,
              animation:
                pullState === 'refreshing' && !animDisabledRef.current
                  ? 'ptr-spin 1s linear infinite'
                  : 'none',
              transition:
                pullState === 'refreshing' || animDisabledRef.current
                  ? 'none'
                  : 'transform 0.05s linear',
              filter: `drop-shadow(0 0 4px hsl(180 100% 55%)) drop-shadow(0 0 8px hsl(180 100% 55% / 0.6))`,
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="hsl(180 100% 55% / 0.2)"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="hsl(180, 100%, 55%)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 10}
              strokeDashoffset={ringDashOffset}
              transform="rotate(-90 12 12)"
              style={{
                transition: animDisabledRef.current
                  ? 'none'
                  : 'stroke-dashoffset 0.1s linear',
              }}
            />
          </svg>
          <span
            className="text-[12px] tracking-wider"
            style={{
              color: 'hsl(220, 8%, 55%)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {getLabel()}
          </span>
        </div>
      </div>

      {/* Content wrapper */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Keyframes for spin animation (injected once) */}
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PullToRefresh;
