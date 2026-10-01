import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  GmLoginRequest,
  GmUserSearchResult,
  GmUpdateUserRequest,
  GmSendRewardRequest,
  GmCreateAnnouncementRequest,
  Announcement,
  GlobalEventConfig,
  ApiResponse,
} from '@shared/api.interface';

const GM_TOKEN_KEY = 'cyber_monopoly_gm_token';

function getGmToken(): string | null {
  return localStorage.getItem(GM_TOKEN_KEY);
}

export function setGmToken(token: string): void {
  localStorage.setItem(GM_TOKEN_KEY, token);
}

export function clearGmToken(): void {
  localStorage.removeItem(GM_TOKEN_KEY);
}

export function hasGmToken(): boolean {
  return !!getGmToken();
}

async function gmRequest<T>(url: string, method: string, data?: unknown, params?: Record<string, string | number>): Promise<T> {
  const token = getGmToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.append(key, String(value));
    }
    fullUrl = `${url}?${query.toString()}`;
  }

  try {
    const response = await axiosForBackend({ url: fullUrl, method, data, headers });
    const result = response.data as ApiResponse<T>;
    if (result.code !== 0) {
      throw new Error(result.message || '請求失敗');
    }
    return result.data as T;
  } catch (err: unknown) {
    logger.error({ level: 'error', args: [`GM API 請求失敗: ${url}`, err instanceof Error ? err.message : String(err)] });
    throw err;
  }
}

export interface GmLoginResponse {
  token: string;
  expiresAt: string;
}

export interface GmOnlineUser {
  id: string;
  nickname: string;
  elo: number;
  level: number;
  lastActiveAt: string;
}

export const gmApi = {
  // ===== 認證 =====
  login: (password: string) =>
    gmRequest<GmLoginResponse>('/api/gm/login', 'POST', { password } as GmLoginRequest),

  // ===== 使用者管理 =====
  searchUsers: (keyword: string) =>
    gmRequest<GmUserSearchResult[]>(`/api/gm/users`, 'GET', undefined, { keyword }),

  getUserDetail: (userId: string) =>
    gmRequest<GmUserSearchResult>(`/api/gm/users/${encodeURIComponent(userId)}`, 'GET'),

  updateUser: (userId: string, data: GmUpdateUserRequest) =>
    gmRequest<GmUserSearchResult>(`/api/gm/users/${encodeURIComponent(userId)}`, 'PATCH', data),

  sendReward: (userId: string, data: Omit<GmSendRewardRequest, 'userId'>) =>
    gmRequest<{ success: boolean }>(
      `/api/gm/users/${encodeURIComponent(userId)}/reward`,
      'POST',
      data,
    ),

  resetUser: (userId: string) =>
    gmRequest<{ success: boolean }>(
      `/api/gm/users/${encodeURIComponent(userId)}/reset`,
      'POST',
    ),

  // ===== 公告管理 =====
  getAnnouncements: () =>
    gmRequest<Announcement[]>('/api/gm/announcements', 'GET'),

  createAnnouncement: (data: GmCreateAnnouncementRequest & { isActive?: boolean }) =>
    gmRequest<Announcement>('/api/gm/announcements', 'POST', data),

  updateAnnouncement: (id: string, data: Partial<GmCreateAnnouncementRequest> & { isActive?: boolean }) =>
    gmRequest<Announcement>(`/api/gm/announcements/${encodeURIComponent(id)}`, 'PATCH', data),

  deleteAnnouncement: (id: string) =>
    gmRequest<{ success: boolean }>(`/api/gm/announcements/${encodeURIComponent(id)}`, 'DELETE'),

  // ===== 活動管理 =====
  getEvents: () =>
    gmRequest<GlobalEventConfig[]>('/api/gm/events', 'GET'),

  createEvent: (data: Partial<GlobalEventConfig>) =>
    gmRequest<GlobalEventConfig>('/api/gm/events', 'POST', data),

  updateEvent: (id: string, data: Partial<GlobalEventConfig>) =>
    gmRequest<GlobalEventConfig>(`/api/gm/events/${encodeURIComponent(id)}`, 'PATCH', data),

  deleteEvent: (id: string) =>
    gmRequest<{ success: boolean }>(`/api/gm/events/${encodeURIComponent(id)}`, 'DELETE'),

  // ===== 在線使用者 =====
  getOnlineUsers: () =>
    gmRequest<GmOnlineUser[]>('/api/gm/online-users', 'GET'),
};
