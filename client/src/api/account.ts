import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  AccountProfile,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UpdateProfileRequest,
  LeaderboardEntry,
  Announcement,
} from '@shared/api.interface';

const TOKEN_KEY = 'cyber_monopoly_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function isApiResponse<T>(body: unknown): body is ApiResponse<T> {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof (body as Record<string, unknown>).code === 'number'
  );
}

async function request<T>(url: string, method: string, data?: unknown, useAuth = true): Promise<T> {
  const headers: Record<string, string> = {};
  if (useAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await axiosForBackend({ url, method, data, headers });
  const body = response.data;

  if (isApiResponse<T>(body)) {
    if (body.code !== 0) {
      throw new Error(body.message || '請求失敗');
    }
    return body.data as T;
  }

  return body as T;
}

export const accountApi = {
  register: (username: string, password: string, nickname: string) =>
    request<AuthResponse>(
      '/api/account/register',
      'POST',
      { username, password, nickname } satisfies RegisterRequest,
      false,
    ),

  login: (username: string, password: string) =>
    request<AuthResponse>(
      '/api/account/login',
      'POST',
      { username, password } satisfies LoginRequest,
      false,
    ),

  getMe: () => request<AccountProfile>('/api/account/me', 'GET'),

  updateProfile: (patch: UpdateProfileRequest) =>
    request<AccountProfile>('/api/account/me', 'PATCH', patch),

  getLeaderboard: () =>
    request<LeaderboardEntry[]>('/api/account/leaderboard', 'GET', undefined, false),

  getAnnouncements: () =>
    request<Announcement[]>('/api/account/announcements', 'GET', undefined, false),

  mergeSave: (saveData: unknown) =>
    request<AccountProfile>('/api/account/merge', 'POST', { saveData }),
};
