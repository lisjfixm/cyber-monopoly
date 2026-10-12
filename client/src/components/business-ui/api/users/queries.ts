'use client';

import { useQuery, queryOptions, type QueryClient } from '@tanstack/react-query';

import { listUsersByIds, type AccountType } from './service';

export const userQueries = {
  all: () => ['users'] as const,
  byIds: (userIds: string[], accountType: AccountType = 'apaas') =>
    queryOptions({
      queryKey: [...userQueries.all(), 'byIds', accountType, userIds.join(',')],
      queryFn: () => listUsersByIds(userIds),
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: userIds.length > 0,
    }),
};

/**
 * 批次獲取使用者資訊的 hook
 */
export function useUsersByIds(
  userIds: string[],
  accountType: AccountType = 'apaas',
) {
  return useQuery(userQueries.byIds(userIds, accountType));
}

/**
 * 清除使用者快取
 */
export function clearUserCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: userQueries.all() });
}
