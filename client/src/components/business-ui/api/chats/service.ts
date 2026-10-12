import {
  ChatService,
  type BatchGetChatsResponse,
  type ChatInfo,
  type SearchChatsParams,
  type SearchChatsResponse,
} from '@lark-apaas/client-toolkit/tools/services';

const chatService = new ChatService();

/**
 * 搜尋群組
 */
export async function searchChats(
  params: SearchChatsParams,
): Promise<SearchChatsResponse> {
  return chatService.searchChats(params);
}

/**
 * 批次根據群組 ID 查詢群組資訊
 */
export async function listChatsByIds(
  chatIds: string[],
): Promise<BatchGetChatsResponse> {
  return chatService.listChatsByIds(chatIds);
}

export type { BatchGetChatsResponse, ChatInfo, SearchChatsParams, SearchChatsResponse };
