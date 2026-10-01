import React from 'react';

interface NeonSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: number | string;
  height?: number | string;
}

/**
 * 霓虹風格骨架屏，帶有 cyan 色 shimmer 掃描動畫。
 */
export const NeonSkeleton: React.FC<NeonSkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const baseStyle: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : variant === 'circle' ? '2.5rem' : '100%'),
    height: height ?? (variant === 'text' ? '1em' : variant === 'circle' ? '2.5rem' : '1rem'),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(0, 255, 255, 0.12)',
    borderRadius: variant === 'circle' ? '9999px' : variant === 'text' ? '4px' : '8px',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div className={`neon-skeleton ${className}`} style={baseStyle} aria-hidden>
      <div className="neon-skeleton-shimmer" />
    </div>
  );
};

interface PageSkeletonProps {
  cardCount?: number;
}

/**
 * 頁面級骨架屏：標題 + 若干卡片佔位。
 */
export const PageSkeleton: React.FC<PageSkeletonProps> = ({ cardCount = 3 }) => {
  return (
    <div className="min-h-[60vh] w-full p-4 md:p-8 flex flex-col gap-6">
      {/* 頁面標題 */}
      <div className="flex flex-col gap-2">
        <NeonSkeleton variant="text" width="40%" height="2rem" />
        <NeonSkeleton variant="text" width="25%" height="0.875rem" />
      </div>

      {/* 卡片列表 */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, i: number) => (
          <div
            key={i}
            className="p-4 md:p-5 rounded-xl flex flex-col gap-3"
            style={{
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid rgba(0, 255, 255, 0.15)',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.05)',
            }}
          >
            <NeonSkeleton variant="text" width="60%" height="1.125rem" />
            <NeonSkeleton variant="text" width="90%" height="0.75rem" />
            <NeonSkeleton variant="rect" width="100%" height="5rem" />
            <div className="flex gap-2 mt-1">
              <NeonSkeleton variant="text" width="30%" height="0.75rem" />
              <NeonSkeleton variant="text" width="25%" height="0.75rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// shimmer 動畫樣式（僅注入一次）
const skeletonStyle = document.createElement('style');
skeletonStyle.textContent = `
  .neon-skeleton-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 255, 255, 0.08) 40%,
      rgba(0, 255, 255, 0.18) 50%,
      rgba(0, 255, 255, 0.08) 60%,
      transparent 100%
    );
    transform: translateX(-100%);
    animation: neon-shimmer 1.8s ease-in-out infinite;
  }

  @keyframes neon-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(skeletonStyle);
}
