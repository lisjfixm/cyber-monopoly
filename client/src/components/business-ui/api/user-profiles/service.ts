import {
  UserProfileService,
  getAssetsUrl,
  type AccountType,
  type UserProfileData,
} from '@lark-apaas/client-toolkit/tools/services';

const userProfileService = new UserProfileService();

/**
 * 獲取使用者 Profile 卡片資料
 */
export async function fetchUserProfile(
  userId: string,
  accountType: AccountType = 'apaas',
  signal?: AbortSignal,
): Promise<UserProfileData> {
  return userProfileService.getUserProfile(userId, accountType, signal);
}

// Re-export for convenience
export { getAssetsUrl };
export type { AccountType, UserProfileData };
