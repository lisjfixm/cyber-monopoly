'use client';

import { useQuery, queryOptions, type QueryClient } from '@tanstack/react-query';

import { fetchUserProfile, type AccountType } from './service';

export const userProfileQueries = {
  all: () => ['userProfiles'] as const,
  byId: (userId: string, accountType: AccountType = 'apaas') =>
    queryOptions({
      queryKey: [...userProfileQueries.all(), 'byId', accountType, userId],
      queryFn: ({ signal }) => fetchUserProfile(userId, accountType, signal),
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: !!userId,
    }),
};

export type UseUserProfileOptions = {
  userId: string;
  accountType?: AccountType;
  enabled?: boolean;
};

/**
 * 獲取使用者 Profile 卡片資料的 hook
 */
export function useUserProfile(options: UseUserProfileOptions) {
  const { userId, accountType = 'apaas', enabled = true } = options;

  return useQuery({
    ...userProfileQueries.byId(userId, accountType),
    enabled: enabled && !!userId,
  });
}

/**
 * 清除使用者 Profile 快取
 */
export function clearUserProfileCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: userProfileQueries.all() });
}
