import type { Chat, ChatInfo, ChatSelectValue, I18nText } from './types';

/**
 * 獲取國際化文字顯示值（獨立實現，不依賴其他元件）
 */
function getI18nText(text: I18nText | string | undefined): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text.zh_cn || text.en_us || text.ja_jp || '';
}

/**
 * 獲取群組顯示名稱
 */
export function getChatDisplayName(name: ChatInfo['name']): string {
  return getI18nText(name);
}

/**
 * ChatInfo → Chat 標準化轉換
 */
export function chatInfoToChat(chatInfo: ChatInfo): Chat {
  return {
    id: chatInfo.chatID,
    name: getChatDisplayName(chatInfo.name),
    avatar: chatInfo.avatar,
    raw: chatInfo,
  };
}

/**
 * 建立未知群組佔位（ID 無法解析時使用）
 */
export function createUnknownChat(id: string): Chat {
  return {
    id,
    name: '未知群組',
    avatar: '',
    raw: undefined,
  };
}

/**
 * 判斷 value 是否為 ID 模式（字串或字串陣列）
 */
export function isIdModeValue(
  value: ChatSelectValue,
): value is string | string[] {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return true;
  }
  if (Array.isArray(value) && value.length > 0) {
    return typeof value[0] === 'string';
  }
  return false;
}

/**
 * 從 value 中提取 ID 列表
 */
export function extractIdsFromValue(value: ChatSelectValue): string[] {
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
    if (typeof value[0] === 'string') {
      return value as string[];
    }
    return (value as Chat[]).map((c) => c.id);
  }
  return [(value as Chat).id];
}
