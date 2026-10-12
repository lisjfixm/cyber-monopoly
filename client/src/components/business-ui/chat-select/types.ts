import type {
  BaseEntitySelectProps,
  ItemValue,
} from '@client/src/components/business-ui/entity-combobox/shared-types';
import type { I18nText } from '@client/src/components/business-ui/entity-combobox/types';

export type { I18nText };

/**
 * 群組原始資訊（對應 SearchChatEntity）
 */
export type ChatInfo = {
  /** 群組 ID */
  chatID: string;
  /** 群組名稱（國際化文字） */
  name: I18nText;
  /** 頭像：URL 或 16 進位制 RGB 顏色 */
  avatar: string;
  /** 是否是外部群 */
  isExternal?: boolean;
  /** 群成員數量（不包括機器人） */
  userCount?: number;
};

/**
 * 標準化後的群組資料（用於 BaseCombobox）
 */
export type Chat = ItemValue<ChatInfo>;

/**
 * 值型別
 * - 'string': value 為 chatID 字串
 * - 'object': value 為 Chat 物件
 * @default 'string'
 */
export type ValueType = 'string' | 'object';

/**
 * 根據 valueType 和 multiple 推斷 value 型別
 */
export type InferValue<
  V extends ValueType,
  M extends boolean,
> = V extends 'string'
  ? M extends true
    ? string[]
    : string | null
  : M extends true
    ? Chat[]
    : Chat | null;

type ChatSelectBaseProps<
  V extends ValueType = 'string',
  M extends boolean = false,
> = Omit<
  BaseEntitySelectProps<Chat>,
  'value' | 'defaultValue' | 'onChange'
> & {
  /**
   * 值型別
   * - 'string': value 為 chatID 字串
   * - 'object': value 為 Chat 物件
   * @default 'string'
   */
  valueType?: V;
  /**
   * 是否多選
   * @default false
   */
  multiple?: M;
  /**
   * 當前值
   */
  value?: InferValue<V, M>;
  /**
   * 預設值
   */
  defaultValue?: InferValue<V, M>;
  /**
   * 值變化回撥
   */
  onChange?: (value: InferValue<V, M>) => void;
};

/**
 * ChatSelect 元件 Props
 *
 * 型別組合：
 * | valueType | multiple | value 型別 |
 * |-----------|----------|------------|
 * | 'string'  | false    | string \| null |
 * | 'string'  | true     | string[] |
 * | 'object'  | false    | Chat \| null |
 * | 'object'  | true     | Chat[] |
 */
export type ChatSelectProps =
  | ChatSelectBaseProps<'string', false>
  | ChatSelectBaseProps<'string', true>
  | ChatSelectBaseProps<'object', false>
  | ChatSelectBaseProps<'object', true>;

export type ChatSelectValue = Chat | Chat[] | string | string[] | null;
