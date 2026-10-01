import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  ApiResponse,
  FriendInfo,
  FriendMessage,
  OnlineStatus,
  SearchUserResult,
} from '@shared/api.interface';

async function request<T>(url: string, method: string, data?: unknown): Promise<T> {
  const response = await axiosForBackend({ url, method, data });
  const result = response.data as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.message || '請求失敗');
  }
  return result.data as T;
}

export const friendsApi = {
  // 取得好友列表
  getFriends: () =>
    request<{ items: FriendInfo[] }>('/api/friends/', 'GET'),

  // 取得待處理好友請求
  getPending: () =>
    request<{ items: FriendInfo[] }>('/api/friends/pending', 'GET'),

  // 搜尋使用者
  searchUsers: (query: string) =>
    request<{ items: SearchUserResult[] }>(
      `/api/friends/search?query=${encodeURIComponent(query)}`,
      'GET',
    ),

  // 新增好友
  addFriend: (targetUserId: string, remark?: string) =>
    request<{ success: boolean }>('/api/friends/add', 'POST', {
      targetUserId,
      remark,
    }),

  // 好友操作（接受/拒絕等）
  friendAction: (friendUserId: string, action: 'accept' | 'reject' | 'block' | 'remove') =>
    request<{ success: boolean }>('/api/friends/action', 'POST', {
      friendUserId,
      action,
    }),

  // 取得訊息紀錄
  getMessages: (userId: string, limit = 50) =>
    request<{ items: FriendMessage[] }>(
      `/api/friends/messages/${userId}?limit=${limit}`,
      'GET',
    ),

  // 發送訊息
  sendMessage: (toUserId: string, content: string) =>
    request<{ item: FriendMessage }>('/api/friends/messages', 'POST', {
      toUserId,
      content,
    }),

  // 標註訊息已讀
  markRead: (fromUserId: string) =>
    request<{ success: boolean }>('/api/friends/messages/read', 'POST', {
      fromUserId,
    }),

  // 查詢線上狀態
  getOnlineStatus: (userIds: string[]) =>
    request<{ statuses: Record<string, OnlineStatus> }>(
      `/api/friends/online?userIds=${userIds.join(',')}`,
      'GET',
    ),
};
