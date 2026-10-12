'use client';

import { useCallback, useMemo } from 'react';

import { useUsersByIds } from '@client/src/components/business-ui/api/users/queries';
import type {
  AccountType,
  UserSelectItemValue,
  UserSelectValue,
  ValueType,
} from '@client/src/components/business-ui/user-select/types';
import {
  extractIdsFromValue,
  userInfoToUser,
  createUnknownUser,
} from '@client/src/components/business-ui/user-select/utils';
import { getI18nText } from '@client/src/components/business-ui/utils/user';
import type { User } from '@client/src/components/business-ui/types/user';

/**
 * 將 User 轉換為 UserSelectItemValue
 */
function userToItemValue(user: User, accountType: AccountType): UserSelectItemValue {
  return {
    id: accountType === 'lark' ? (user.larkUserId || user.user_id || '') : (user.user_id || user.larkUserId || ''),
    name: getI18nText(user.name) || '未知使用者',
    avatar: user.avatar,
    raw: user,
  };
}

export type UseUserValueResult = {
  /**
   * 標準化後的內部 value（UserSelectItemValue 物件格式）
   * 用於傳遞給 BaseCombobox
   */
  internalValue: UserSelectItemValue | UserSelectItemValue[] | null;

  /**
   * 是否正在載入使用者資訊
   */
  isLoading: boolean;

  /**
   * 將內部 UserSelectItemValue 物件轉換回外部格式
   * ID 模式時返回字串，物件模式時返回 UserSelectItemValue
   */
  toExternalValue: (
    internalVal: UserSelectItemValue | UserSelectItemValue[] | null,
    multiple: boolean,
  ) => UserSelectValue;
};

/**
 * 處理 UserSelect 的 value 型別轉換
 *
 * - 根據 valueType 決定 value 是 ID 字串還是 UserSelectItemValue 物件
 * - ID 模式下呼叫 API 獲取完整使用者資訊（使用 react-query 快取）
 * - 無效 ID 生成 "未知使用者" 佔位
 *
 * @param value - 外部傳入的 value
 * @param multiple - 是否多選模式
 * @param accountType - 賬戶型別
 * @param valueType - 值型別，'string' 表示 ID 模式，'object' 表示 UserSelectItemValue 物件模式
 */
export function useUserValue(
  value: UserSelectValue,
  multiple: boolean = false,
  accountType: AccountType = 'apaas',
  valueType: ValueType = 'string',
): UseUserValueResult {
  const isIdMode = valueType === 'string';

  // 提取當前 value 中的所有 ID
  const currentIds = useMemo(() => extractIdsFromValue(value), [value]);

  // ID 模式下需要獲取的 ID 列表（去重和排序，確保相同的 ID 集合有相同的 queryKey）
  const idsToFetch = useMemo(() => {
    if (!isIdMode) return [];
    return [...new Set(currentIds.map(String))].filter(Boolean).sort();
  }, [isIdMode, currentIds]);

  // 使用 react-query hook 獲取使用者資訊
  const { data: response, isLoading } = useUsersByIds(idsToFetch, accountType);

  // 構建 ID -> UserSelectItemValue 的對映
  const usersMap = useMemo(() => {
    const map = new Map<string, UserSelectItemValue>();
    const userInfoMap = response?.data?.userInfoMap || {};

    for (const id of idsToFetch) {
      const userInfo = userInfoMap[id];
      const user = userInfo
        ? userInfoToUser(userInfo, accountType)
        : createUnknownUser(id);
      map.set(String(id), user);
    }
    return map;
  }, [response, idsToFetch, accountType]);

  const internalValue = useMemo((): UserSelectItemValue | UserSelectItemValue[] | null => {
    if (value === null || value === undefined) {
      return multiple ? [] : null;
    }

    if (Array.isArray(value) && value.length === 0) {
      return [];
    }

    if (!isIdMode) {
      // Object 模式：將 User 轉換為 UserSelectItemValue
      if (Array.isArray(value)) {
        return (value as User[]).map((user) => userToItemValue(user, accountType));
      }
      return userToItemValue(value as User, accountType);
    }

    const users = currentIds
      .map((id) => usersMap.get(String(id)))
      .filter((u): u is UserSelectItemValue => u !== undefined);

    if (multiple) {
      return users;
    }

    return users[0] ?? null;
  }, [value, isIdMode, currentIds, usersMap, multiple, accountType]);

  const toExternalValue = useCallback(
    (
      internalVal: UserSelectItemValue | UserSelectItemValue[] | null,
      isMultiple: boolean,
    ): UserSelectValue => {
      if (internalVal === null) {
        return null;
      }

      if (isIdMode) {
        // ID 模式：返回 string 或 string[]
        if (isMultiple) {
          return (internalVal as UserSelectItemValue[]).map((u) => String(u.id));
        }
        return String((internalVal as UserSelectItemValue).id);
      }

      // Object 模式：提取 raw 資料，返回標準 User 型別
      if (isMultiple) {
        return (internalVal as UserSelectItemValue[]).map((u) => u.raw!);
      }
      return (internalVal as UserSelectItemValue).raw!;
    },
    [isIdMode],
  );

  return {
    internalValue,
    isLoading,
    toExternalValue,
  };
}
