'use client';

import { useCallback, useEffect, useRef } from 'react';

export type UseInfiniteScrollOptions = {
  /**
   * 載入更多資料的回撥函式
   */
  onLoadMore: () => void;
  /**
   * 是否還有更多資料
   */
  hasMore: boolean;
  /**
   * 是否正在載入中
   */
  isLoading: boolean;
  /**
   * 是否啟用無限滾動
   * @default true
   */
  enabled?: boolean;
  /**
   * IntersectionObserver 的 threshold
   * @default 0.1
   */
  threshold?: number;
  /**
   * IntersectionObserver 的 rootMargin，用於提前觸發載入
   * @default '50px'
   */
  rootMargin?: string;
};

export type UseInfiniteScrollResult = {
  /**
   * 繫結到觸發元素的 ref
   */
  triggerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * 無限滾動載入 hook
 * 使用 IntersectionObserver 檢測滾動觸底，自動觸發載入更多
 *
 * @example
 * ```tsx
 * const { triggerRef } = useInfiniteScroll({
 *   onLoadMore: fetchMore,
 *   hasMore,
 *   isLoading: isFetchingMore,
 * })
 *
 * return (
 *   <ScrollArea>
 *     {items.map(item => <Item key={item.id} />)}
 *     <div ref={triggerRef} />
 *   </ScrollArea>
 * )
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  enabled = true,
  threshold = 0.1,
  rootMargin = '50px',
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore && !isLoading && enabled) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, enabled, onLoadMore],
  );

  useEffect(() => {
    const element = triggerRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, threshold, rootMargin, enabled]);

  return { triggerRef };
}
