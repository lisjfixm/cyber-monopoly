import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  PlayerProfile,
  LeaderboardType,
  GetOrCreatePlayerRequest,
  UpdateNicknameRequest,
  LeaderboardResponse,
  ApiResponse,
} from '@shared/api.interface';

async function request<T>(url: string, method: string, data?: unknown): Promise<T> {
  const response = await axiosForBackend({ url, method, data });
  const result = response.data as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }
  return result.data as T;
}

export const rankingApi = {
  getOrCreatePlayer: (visitorId: string, nickname?: string) =>
    request<PlayerProfile>('/api/ranking/player', 'POST', {
      visitorId,
      nickname,
    } as GetOrCreatePlayerRequest),

  updateNickname: (visitorId: string, nickname: string) =>
    request<PlayerProfile>('/api/ranking/player/nickname', 'PATCH', {
      visitorId,
      nickname,
    } as UpdateNicknameRequest),

  getPlayerProfile: (visitorId: string) =>
    request<PlayerProfile>(`/api/ranking/player/${encodeURIComponent(visitorId)}`, 'GET'),

  getLeaderboard: (type: LeaderboardType = 'elo', limit = 50) =>
    request<LeaderboardResponse>(
      `/api/ranking/leaderboard?type=${encodeURIComponent(type)}&limit=${limit}`,
      'GET',
    ),
};
