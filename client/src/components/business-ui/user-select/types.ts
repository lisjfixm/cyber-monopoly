import type {
  BaseEntitySelectProps,
  ItemValue,
} from '@client/src/components/business-ui/entity-combobox/shared-types';
import type { User, I18nText, UserType, Department } from '@client/src/components/business-ui/types/user';

// 統一從 @lark-apaas/client-toolkit 匯入 AccountType
export type { AccountType } from '@lark-apaas/client-toolkit/tools/services';
import type { AccountType } from '@lark-apaas/client-toolkit/tools/services';

// 重新匯出統一的型別
export type { User, I18nText, UserType, Department };

/**
 * 值型別
 * - 'string': value 為 string 或 string[]（與 multiple 聯動）
 * - 'object': value 為 User 或 User[]（與 multiple 聯動）
 * @default 'string'
 */
export type ValueType = 'string' | 'object';

export type SearchAvatar = {
  avatar: {
    image: {
      large: string;
    };
  };
};

/**
 * UserSelect 的值型別（包裝 User）
 */
export type UserSelectItemValue = ItemValue<User>;

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
    ? User[]              // ✅ 直接返回標準 User 型別
    : User | null;        // ✅ 直接返回標準 User 型別

type UserSelectBaseProps<
  V extends ValueType = 'string',
  M extends boolean = false,
> = Omit<
  BaseEntitySelectProps<UserSelectItemValue>,
  'value' | 'defaultValue' | 'onChange'
> & {
  /**
   * 值型別
   * - 'string': value 為 string 或 string[]（與 multiple 聯動）
   * - 'object': value 為 User 或 User[]（與 multiple 聯動）
   * @default 'string'
   */
  valueType?: V;
  /**
   * 是否多選
   * @default false
   */
  multiple?: M;
  /**
   * 賬戶型別，決定 value 中 id 欄位的來源
   * @default 'apaas'
   */
  accountType?: AccountType;
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
 * UserSelect 元件 Props
 *
 * 型別組合：
 * | valueType | multiple | value 型別 |
 * |-----------|----------|------------|
 * | 'string'  | false    | string \| null |
 * | 'string'  | true     | string[] |
 * | 'object'  | false    | User \| null |
 * | 'object'  | true     | User[] |
 */
export type UserSelectProps =
  | UserSelectBaseProps<'string', false>
  | UserSelectBaseProps<'string', true>
  | UserSelectBaseProps<'object', false>
  | UserSelectBaseProps<'object', true>;

export type UserSelectValue =
  | User
  | User[]
  | string
  | string[]
  | null;
