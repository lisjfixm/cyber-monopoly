import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  CheckinStatusResponse,
  CheckinPerformResponse,
} from '@shared/api.interface';
import { getToken } from './account';

async function request<T>(url: string, method: string, data?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axiosForBackend({ url, method, data, headers });
  return response.data as T;
}

export const checkinApi = {
  getStatus: () =>
    request<CheckinStatusResponse>('/api/checkin/status', 'GET'),

  performCheckin: () =>
    request<CheckinPerformResponse>('/api/checkin', 'POST'),
};
