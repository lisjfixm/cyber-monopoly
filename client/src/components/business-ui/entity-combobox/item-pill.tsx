'use client';

import React from 'react';

import {
  itemPillTextVariants,
  itemPillVariants,
  tagAvatarVariants,
  type ComboboxSize,
} from '@client/src/components/business-ui/entity-combobox/size-variants';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@client/src/components/ui/avatar';
import { Badge } from '@client/src/components/ui/badge';

export type ItemPillProps = {
  /**
   * 顯示的文字
   */
  label: string;

  /**
   * 尺寸
   * @default "medium"
   */
  size?: ComboboxSize;

  /**
   * 頭像 URL
   */
  avatarUrl?: string;

  /**
   * 頭像內容（用於自定義頭像顯示）
   */
  avatar?: React.ReactNode;

  /**
   * 是否顯示頭像佔位符（當沒有頭像 URL 時顯示）
   * @default false
   *
   */
  avatarFallback?: boolean;

  /**
   * 自定義樣式
   */
  className?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 最大文字長度
   */
  maxTextLength?: number;

  /**
   * 字尾
   */
  suffix?: React.ReactNode;
};

// 檢查是否是 16 進位制 RGB 顏色（如 #RRGGBB 或 #RGB）
export const isHexColor = (str?: string): boolean => {
  if (!str) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
};

/**
 * renderPillAvatar 的引數型別
 */
export type RenderPillAvatarOptions = {
  /**
   * 頭像 URL
   */
  avatarUrl?: string;
  /**
   * 顯示的文字（用於 fallback 首字母）
   */
  label: string;
  /**
   * 尺寸
   * @default "medium"
   */
  size?: ComboboxSize;
  /**
   * 是否顯示頭像佔位符（當沒有頭像 URL 時顯示）
   * @default true
   */
  avatarFallback?: boolean;
};

/**
 * 渲染 Pill 頭像的輔助函式
 * 可被其他元件複用（如 UserPill）
 */
export const renderPillAvatar = ({
  avatarUrl,
  label,
  size = 'medium',
  avatarFallback = true,
}: RenderPillAvatarOptions): React.ReactNode => {
  if (avatarUrl) {
    // 如果是 16 進位制顏色，渲染帶背景色的頭像和使用者名稱首字
    if (isHexColor(avatarUrl)) {
      return (
        <Avatar className={tagAvatarVariants({ size })}>
          <AvatarFallback style={{ backgroundColor: avatarUrl }}>
            {label?.charAt?.(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <Avatar className={tagAvatarVariants({ size })}>
        <AvatarImage src={avatarUrl} alt={label} loading="eager" />
      </Avatar>
    );
  }

  if (avatarFallback) {
    return (
      <Avatar className={tagAvatarVariants({ size })}>
        <AvatarFallback>{label?.charAt?.(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    );
  }

  return null;
};

export const ItemPill: React.FC<ItemPillProps> = ({
  className,
  avatarUrl,
  disabled,
  label,
  maxTextLength,
  suffix,
  avatar,
  avatarFallback = true,
  size = 'medium',
}) => {
  const displayLabel = React.useMemo(() => {
    if (!maxTextLength || label?.length <= maxTextLength) {
      return label;
    }
    return label.slice(0, maxTextLength) + '...';
  }, [maxTextLength, label]);

  const avatarElement = React.useMemo(() => {
    if (avatar) {
      return avatar;
    }

    return renderPillAvatar({ avatarUrl, label, size, avatarFallback });
  }, [avatar, avatarUrl, avatarFallback, label, size]);

  return (
    <Badge
      variant="secondary"
      className={cn(
        itemPillVariants({ size }),
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {/* 頭像 */}
      {avatarElement}
      {/* 文字 */}
      <span className={itemPillTextVariants({ size })}>{displayLabel}</span>

      {suffix}
    </Badge>
  );
};
