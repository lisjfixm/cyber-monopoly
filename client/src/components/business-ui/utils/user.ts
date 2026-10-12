// client/src/utils/user.ts

import type { I18nText, User, UserInput } from '../types/user';

/**
 * 獲取國際化文字的顯示值
 * @param text 國際化文字或普通字串
 * @param locale 語言，預設 zh_cn
 */
export function getI18nText(
  text: I18nText | string | undefined,
  locale: 'zh_cn' | 'en_us' | 'ja_jp' = 'zh_cn',
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  // 新增更完整的 fallback 邏輯
  return text[locale] || text.zh_cn || text.en_us || text.ja_jp || '';
}

/**
 * 將任意格式的使用者資料轉換為標準 User 型別（下劃線命名）
 */
export function normalizeUser(input: UserInput): User {
  const data = input as any;

  // 提取 user_id（相容駝峰和下劃線）
  const user_id = data.user_id || data.userId || '';

  // 提取其他欄位
  const larkUserId = data.larkUserId;  // larkUserId 保持駝峰
  const name = data.name;
  const avatar = data.avatar;
  const email = data.email;

  // 提取 user_type（相容駝峰和下劃線）
  const user_type = data.user_type || data.userType;

  const department = data.department;

  return {
    user_id,
    larkUserId,
    name,
    avatar,
    email,
    user_type,
    department,
  };
}

/**
 * 驗證 user_id 是否有效
 */
export function isValidUserId(user_id: string | undefined): boolean {
  if (!user_id) return false;
  const trimmed = user_id.trim();
  if (!trimmed) return false;
  if (trimmed === '""') return false; // 過濾 AI 可能生成的 ""
  return true;
}

/**
 * 獲取使用者顯示名稱
 * 自動處理 I18nText 型別
 */
export function getUserDisplayName(
  user: User | undefined,
  locale: 'zh_cn' | 'en_us' | 'ja_jp' = 'zh_cn',
): string {
  if (!user) return '';
  return getI18nText(user.name, locale) || '無效人員';
}
