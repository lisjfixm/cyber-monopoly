'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { listChatsByIds } from '@client/src/components/business-ui/api/chats/service';
import type {
  Chat,
  ChatSelectValue,
  ValueType,
} from '@client/src/components/business-ui/chat-select/types';
import {
  chatInfoToChat,
  createUnknownChat,
  extractIdsFromValue,
} from '@client/src/components/business-ui/chat-select/utils';
import { logger } from '@lark-apaas/client-toolkit/logger';

export type UseChatValueResult = {
  /**
   * 標準化後的內部 value（Chat 物件格式）
   * 用於傳遞給 BaseCombobox
   */
  internalValue: Chat | Chat[] | null;

  /**
   * 是否正在載入群組資訊
   */
  isLoading: boolean;

  /**
   * 將內部 Chat 物件轉換回外部格式
   * ID 模式時返回字串，物件模式時返回 Chat
   */
  toExternalValue: (
    internalVal: Chat | Chat[] | null,
    multiple: boolean,
  ) => ChatSelectValue;
};

/**
 * 處理 ChatSelect 的 value 型別轉換
 *
 * - 根據 valueType 決定 value 是 chatID 字串還是 Chat 物件
 * - ID 模式下呼叫搜尋 API 獲取完整群組資訊
 * - 無效 ID 生成 "未知群組" 佔位
 *
 * @param value - 外部傳入的 value
 * @param multiple - 是否多選模式
 * @param valueType - 值型別，'string' 表示 ID 模式，'object' 表示 Chat 物件模式
 */
export function useChatValue(
  value: ChatSelectValue,
  multiple: boolean = false,
  valueType: ValueType = 'string',
): UseChatValueResult {
  const isIdMode = valueType === 'string';

  const [resolvedChats, setResolvedChats] = useState<Map<string, Chat>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const currentIds = useMemo(() => extractIdsFromValue(value), [value]);

  const missingIds = useMemo(() => {
    if (!isIdMode) return [];
    return currentIds.filter((id) => !resolvedChats.has(String(id)));
  }, [isIdMode, currentIds, resolvedChats]);

  // 穩定化 missingIds 引用
  const missingIdsKey = missingIds.join(',');

  useEffect(() => {
    if (!missingIdsKey) {
      return;
    }

    const ids = missingIdsKey.split(',');
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await listChatsByIds(ids);
        if (cancelled) return;

        const chatInfoMap = response?.data?.chatInfoMap || {};
        setResolvedChats((prev) => {
          const next = new Map(prev);
          for (const [chatId, chatInfo] of Object.entries(chatInfoMap)) {
            const chat = chatInfoToChat(chatInfo);
            next.set(String(chatId), chat);
          }
          // 標記未找到的 ID 為未知群組
          for (const id of ids) {
            if (!next.has(String(id))) {
              next.set(String(id), createUnknownChat(id));
            }
          }
          return next;
        });
      } catch (error) {
        logger.error('Failed to resolve chat IDs:', String(error));
        if (!cancelled) {
          setResolvedChats((prev) => {
            const next = new Map(prev);
            for (const id of ids) {
              if (!next.has(String(id))) {
                next.set(String(id), createUnknownChat(id));
              }
            }
            return next;
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [missingIdsKey]);

  const internalValue = useMemo((): Chat | Chat[] | null => {
    if (value === null || value === undefined) {
      return multiple ? [] : null;
    }

    if (Array.isArray(value) && value.length === 0) {
      return [];
    }

    if (!isIdMode) {
      return value as Chat | Chat[];
    }

    const chats = currentIds
      .map((id) => resolvedChats.get(String(id)))
      .filter((c): c is Chat => c !== undefined);

    if (multiple) {
      return chats;
    }

    return chats[0] ?? null;
  }, [value, isIdMode, currentIds, resolvedChats, multiple]);

  const toExternalValue = useCallback(
    (
      internalVal: Chat | Chat[] | null,
      isMultiple: boolean,
    ): ChatSelectValue => {
      if (internalVal === null) {
        return null;
      }

      if (isIdMode) {
        // ID 模式：返回 string 或 string[]
        if (isMultiple) {
          return (internalVal as Chat[]).map((c) => String(c.id));
        }
        return String((internalVal as Chat).id);
      }

      // Object 模式：直接返回 Chat 物件
      return internalVal;
    },
    [isIdMode],
  );

  return {
    internalValue,
    isLoading,
    toExternalValue,
  };
}
