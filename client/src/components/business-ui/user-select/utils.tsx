import type { UserInfo, SearchAvatar } from '@lark-apaas/client-toolkit/tools/services';

import type { AccountType } from '@client/src/components/business-ui/api/users/service';
import type {
  UserSelectItemValue,
  UserSelectValue,
} from '@client/src/components/business-ui/user-select/types';
import { getI18nText } from '@client/src/components/business-ui/utils/user';
import type { User } from '@client/src/components/business-ui/types/user';

export function getUserDisplayName(name: UserInfo['name']): string {
  return name.zh_cn || name.en_us || '';
}

export function getUserId(
  user: Pick<UserInfo, 'userID' | 'larkUserID'>,
  accountType: AccountType,
): string {
  if (accountType === 'lark') {
    return user.larkUserID || `_unknown_${Math.random().toString(36).slice(2)}`;
  }
  // 未註冊外部聯絡人沒有 userID，暫用 larkUserID 作為臨時標識
  return user.userID || user.larkUserID || `_unknown_${Math.random().toString(36).slice(2)}`;
}

/**
 * 判斷使用者是否為未註冊的外部聯絡人
 */
export function isUnregisteredExternalContact(user: UserSelectItemValue): boolean {
  const raw = user.raw;
  return !!raw && !raw.user_id && !!raw.larkUserId;
}

export function createUnknownUser(id: string): UserSelectItemValue {
  return {
    id,
    name: '未知使用者',
    avatar: undefined,
    raw: undefined,
  };
}

export function userInfoToUser(
  userInfo: UserInfo & SearchAvatar,
  accountType: AccountType,
): UserSelectItemValue {
  // 構建統一的 User 型別作為 raw 資料
  const rawUser: User = {
    user_id: userInfo.userID || undefined,
    larkUserId: userInfo.larkUserID || undefined,
    name: userInfo.name,
    avatar: userInfo.avatar?.image?.large,
    user_type: userInfo.userType,
    department: userInfo.department as any,
  };

  return {
    id: getUserId(userInfo, accountType),
    name: getI18nText(userInfo.name),
    avatar: userInfo.avatar?.image?.large,
    raw: rawUser,
  };
}

export function searchUserInfoToUser(
  userInfo: UserInfo & { avatar?: string; tenantName?: string },
  accountType: AccountType,
): UserSelectItemValue {
  // 構建統一的 User 型別作為 raw 資料
  const rawUser: User = {
    user_id: userInfo.userID || undefined,
    larkUserId: userInfo.larkUserID || undefined,
    name: userInfo.name,
    avatar: userInfo.avatar,
    user_type: userInfo.userType,
    department: userInfo.department as any,
    tenantName: userInfo.tenantName,
  };

  return {
    id: getUserId(userInfo, accountType),
    name: getI18nText(userInfo.name),
    avatar: userInfo.avatar,
    raw: rawUser,
  };
}

declare global {
  interface Window {
    MIAODA_APP_ID?: string;
    __platform__?: {
      appId?: string;
    };
    appId?: string;
  }
}

export function getAppId(path: string): string | null | undefined {
  if (window?.__platform__?.appId) {
    return window.__platform__.appId;
  }

  if (window.MIAODA_APP_ID) {
    return window.MIAODA_APP_ID;
  }

  let prefix: string;

  /**
   * 從路徑中提取 appId
   * @example "/app/my-app/settings" → "my-app"
   */
  const appMatch = path.match(/\/app\/([^/]+)/);
  if (appMatch) {
    return appMatch[1];
  }

  // 檢查路徑是否以固定字首開頭
  if (path.includes('/ai/feida/runtime/')) {
    prefix = '/ai/feida/runtime/';
  } else if (path.includes('/spark/r/')) {
    prefix = '/spark/r/';
  } else {
    prefix = '/ai/miaoda/';
  }

  // 相容全棧appId掛載在window上，作為兜底
  const windowAppId = window.appId || null;

  if (!path.startsWith(prefix)) {
    return windowAppId;
  }

  // 擷取字首後的部分
  const remainder = path.substring(prefix.length);

  // 找到下一個斜槓的位置
  const nextSlashIndex = remainder.indexOf('/');

  // 如果沒有斜槓，返回整個remainder；否則返回斜槓前的部分
  if (nextSlashIndex === -1) {
    return remainder || windowAppId;
  }
  return remainder.substring(0, nextSlashIndex) || windowAppId;
}

/**
 * 從 value 中提取 ID 列表
 * 支援 User 型別（user_id）和 UserSelectItemValue 型別（id）
 */
export function extractIdsFromValue(value: UserSelectValue): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }
    // 檢查第一個元素判斷型別
    if (typeof value[0] === 'string') {
      return value as string[];
    }
    // 物件陣列：可能是 User[] 或 UserSelectItemValue[]
    return value.map((item: any) => {
      // UserSelectItemValue 有 id 欄位（內部型別）
      if ('id' in item && item.id) {
        return item.id;
      }
      // User 有 user_id 欄位（外部型別）
      if ('user_id' in item && item.user_id) {
        return item.user_id;
      }
      return '';
    }).filter(Boolean);
  }
  // 單個物件：可能是 User 或 UserSelectItemValue
  const item = value as any;
  if ('id' in item && item.id) {
    return [item.id];
  }
  if ('user_id' in item && item.user_id) {
    return [item.user_id];
  }
  return [];
}
