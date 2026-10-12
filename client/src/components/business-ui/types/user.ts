// client/src/types/user.ts

import type { I18nText } from '@/components/business-ui/entity-combobox/types';
import type { Department } from '@/components/business-ui/department-select/types';

/**
 * 重新匯出相關型別，方便統一匯入
 */
export type { I18nText, Department };

/**
 * 使用者型別列舉
 */
export type UserType = '_employee' | '_externalUser' | '_anonymousUser';

/**
 * 統一的標準使用者型別（單一事實來源）
 * 使用下劃線命名（與後端統一），larkUserId 除外
 */
export interface User {
  /** 使用者 ID（未註冊外部聯絡人可能沒有） */
  user_id?: string;

  /** 飛書使用者 ID（保持駝峰） */
  larkUserId?: string;

  /**
   * 使用者名稱稱
   * 支援簡單字串或國際化文字
   */
  name?: I18nText | string;

  /** 使用者頭像 URL */
  avatar?: string;

  /** 使用者郵箱 */
  email?: string;

  /**
   * 使用者型別
   * - '_employee': 內部員工
   * - '_externalUser': 外部使用者
   * - '_anonymousUser': 匿名使用者
   */
  user_type?: UserType;

  /** 部門資訊（引用 DepartmentSelect 的型別） */
  department?: Department;

  /** 租戶名稱（外部使用者顯示） */
  tenantName?: string;

  /** 使用者狀態 */
  status?: number;
}

/**
 * 使用者資料輸入型別（用於元件 Props）
 * 相容駝峰和下劃線命名，內部自動轉換為標準 User 型別
 */
export type UserInput =
  | User
  | {
      user_id?: string;
      userId?: string;         // 相容駝峰
      larkUserId?: string;
      name?: I18nText | string;
      avatar?: string;
      email?: string;
      user_type?: UserType;
      userType?: UserType;     // 相容駝峰
      department?: Department | any;
      status?: number;
    };
