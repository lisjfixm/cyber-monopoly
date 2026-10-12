import type { FocusEvent, ReactNode } from 'react';

import { PopoverContent } from '@client/src/components/ui/popover';

// 重新匯出 size 相關型別
export type { ComboboxSize } from '@client/src/components/business-ui/entity-combobox/size-variants';

/**
 * 通用選項值型別
 * @template TRaw - 原始資料型別，用於保留完整的原始物件
 */
export type ItemValue<TRaw = unknown> = {
  id: string;
  name: string;
  avatar?: string;
  raw?: TRaw;
};

/**
 * 觸發器型別
 */
export type TriggerType = 'button' | 'search' | 'custom';

/**
 * 觸發器渲染屬性
 */
export type TriggerRenderProps<TRaw = unknown> = {
  selectedValue: ItemValue<TRaw> | ItemValue<TRaw>[] | null;
  multiple: boolean;
  open: boolean;
  disabled: boolean;
};

/**
 * 樣式類名配置
 * 用於統一配置各個內部元素的自定義 className
 */
export type ClassNamesConfig = {
  /** 根容器的 className */
  root?: string;
  /** 觸發器的 className */
  trigger?: string;
  /** 彈層內容的 className */
  popover?: string;
  /** 搜尋框的 className */
  search?: string;
  /** 列表容器的 className */
  list?: string;
  /** 列表項的 className */
  listItem?: string;
  /** 標籤的 className（多選模式） */
  tag?: string;
  /** 空狀態的 className */
  empty?: string;
  /** 異常態的 className */
  error?: string;
  /** 載入狀態的 className */
  loading?: string;
  /** 清除按鈕元素的 className */
  clear?: string;
  /** 字尾元素的 className */
  suffix?: string;
};

/**
 * 彈層容器配置
 */
export type PopoverSlotProps = {
  popover?: React.ComponentProps<typeof PopoverContent>;
};

/**
 * 基礎 Select 元件共享的 Props
 * 適用於 UserSelect、DepartmentSelect 等所有實體選擇器
 */
export type BaseEntitySelectProps<TValue = ItemValue<unknown>> = {
  /**
   * 元件尺寸
   * @default "medium"
   */
  size?: 'medium' | 'small' | 'xs';

  /**
   * 觸發器型別
   * - "button": 按鈕樣式觸發器
   * - "search": 搜尋框樣式觸發器
   * - "custom": 自定義觸發器，需配合 renderTrigger 使用
   */
  triggerType?: TriggerType;

  /**
   * 自定義渲染觸發器
   * @param props - 觸發器渲染屬性，包含選中值、多選狀態、展開狀態、禁用狀態
   * @returns 自定義觸發器的 ReactNode
   */
  renderTrigger?: (props: TriggerRenderProps<unknown>) => ReactNode;

  /**
   * 是否多選模式
   * @default false
   */
  multiple?: boolean;

  /**
   * 當前選中的值（受控模式）
   * - 單選時為 TValue | null
   * - 多選時為 TValue[] | null
   */
  value?: TValue | TValue[] | null;

  /**
   * 預設選中的值（非受控模式）
   * - 單選時為 TValue | null
   * - 多選時為 TValue[] | null
   */
  defaultValue?: TValue | TValue[] | null;

  /**
   * 選中值變化時的回撥
   * @param value - 新的選中值
   */
  onChange?: (value: TValue | TValue[] | null) => void;

  /**
   * 彈層預設是否展開（非受控模式）
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * 是否禁用元件
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否自動聚焦
   * @default false
   */
  autoFocus?: boolean;

  /**
   * 是否必填（用於表單校驗）
   * @default false
   */
  required?: boolean;

  /**
   * 表單欄位名稱
   */
  name?: string;

  /**
   * 根元素的自定義類名
   */
  className?: string;

  /**
   * 各元素的自定義類名配置
   * @example
   * classNames={{
   *   root: 'my-root',
   *   trigger: 'my-trigger',
   *   popover: 'my-popover',
   *   tag: 'my-tag',
   * }}
   */
  classNames?: ClassNamesConfig;

  /**
   * 未選中時顯示的佔位文字
   */
  placeholder?: string;

  /**
   * 選項列表為空時顯示的文字
   */
  emptyText?: string;

  /**
   * 多選模式下，標籤是否可關閉（顯示刪除按鈕）
   * @default true
   */
  tagClosable?: boolean;

  /**
   * 多選模式下，最多顯示的標籤數量
   * - 數字: 最多顯示指定數量的標籤，超出部分顯示 "+N"
   * - "responsive": 根據容器寬度自動計算顯示數量
   */
  maxTagCount?: number | 'responsive';

  /**
   * 判斷選項是否禁用
   * @param value 選項值
   * @returns 如果返回 true，該選項將被禁用，不能改變選中狀態，已選中項的 tag 不顯示刪除按鈕
   */
  getOptionDisabled?: (value: TValue) => boolean;

  /**
   * 選中選項時的回撥
   * @param value - 被選中的選項值
   */
  onSelect?: (value: TValue) => void;

  /**
   * 取消選中選項時的回撥（多選模式下生效）
   * @param value - 被取消選中的選項值
   */
  onDeselect?: (value: TValue) => void;

  /**
   * 清空所有選中值時的回撥
   */
  onClear?: () => void;

  /**
   * 元件獲得焦點時的回撥
   * @param event - 焦點事件物件
   */
  onFocus?: (event: FocusEvent<HTMLElement>) => void;

  /**
   * 元件失去焦點時的回撥
   * @param event - 焦點事件物件
   */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;

  /**
   * 插槽屬性配置，用於自定義內部元件的 props
   */
  slotProps?: PopoverSlotProps;
};

/**
 * Combobox 配置相關的 Props
 */
export type ComboboxConfigProps = {
  pageSize?: number;
  debounce?: number;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  showSearch?: boolean;
  required?: boolean;
  name?: string;
};

/**
 * Combobox 樣式相關的 Props
 */
export type ComboboxStyleProps = {
  className?: string;
  popoverClassName?: string;
  classNames?: ClassNamesConfig;
};

/**
 * Combobox Placeholder 相關的 Props
 */
export type ComboboxPlaceholderProps = {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
};

/**
 * Combobox 標籤相關的 Props
 */
export type ComboboxTagProps = {
  tagClosable?: boolean;
  maxTagCount?: number | 'responsive';
  maxTagTextLength?: number;
};

/**
 * Combobox 彈層配置相關的 Props
 */
export type ComboboxPopoverProps = {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
};

/**
 * Combobox 回撥相關的 Props
 */
export type ComboboxCallbackProps<TRaw = unknown> = {
  onSelect?: (value: ItemValue<TRaw>) => void;
  onDeselect?: (value: ItemValue<TRaw>) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
};
