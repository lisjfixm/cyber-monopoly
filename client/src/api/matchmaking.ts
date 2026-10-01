import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  MatchJoinRequest,
  MatchJoinResponse,
  MatchStatusResponse,
  MatchLeaveRequest,
  MatchLeaveResponse,
  ApiResponse,
} from '@shared/api.interface';

async function request<T>(url: string, method: string, data?: unknown, params?: unknown): Promise<T> {
  const response = await axiosForBackend({ url, method, data, params });
  const result = response.data as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }
  return result.data as T;
}

export const matchmakingApi = {
  joinMatch: (params: MatchJoinRequest) =>
    request<MatchJoinResponse>('/api/matchmaking/join', 'POST', params),

  leaveMatch: (visitorId: string) =>
    request<MatchLeaveResponse>('/api/matchmaking/leave', 'POST', { visitorId } as MatchLeaveRequest),

  getMatchStatus: (visitorId: string) =>
    request<MatchStatusResponse>('/api/matchmaking/status', 'GET', undefined, { visitorId }),
};
