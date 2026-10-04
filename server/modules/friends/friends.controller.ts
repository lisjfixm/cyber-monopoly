import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';

import { FriendsService } from './friends.service';
import type {
  ApiResponse,
  FriendInfo,
  FriendMessage,
  AddFriendRequest,
  FriendActionRequest,
  SendMessageRequest,
  SearchUserResult,
  MarkMessagesReadRequest,
} from '@shared/api.interface';

// 搜尋關鍵字長度上限，避免 ILIKE 過度掃描
const MAX_SEARCH_QUERY_LENGTH = 32;
// 單次查詢線上狀態的 ID 數量上限
const MAX_ONLINE_IDS = 50;

@Controller('api/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  async getFriends(
    @Req() req: Request,
    @Query('visitorId') visitorId?: string,
  ): Promise<ApiResponse<{ items: FriendInfo[] }>> {
    const userId = this.resolveUserId(req, visitorId);
    const friends = await this.friendsService.getFriends(userId);
    return { code: 0, message: 'ok', data: { items: friends } };
  }

  @Get('pending')
  async getPendingRequests(
    @Req() req: Request,
    @Query('visitorId') visitorId?: string,
  ): Promise<ApiResponse<{ items: FriendInfo[] }>> {
    const userId = this.resolveUserId(req, visitorId);
    const requests = await this.friendsService.getPendingRequests(userId);
    return { code: 0, message: 'ok', data: { items: requests } };
  }

  @Get('search')
  async searchUsers(
    @Req() req: Request,
    @Query('query') query?: string,
    @Query('visitorId') visitorId?: string,
  ): Promise<ApiResponse<{ items: SearchUserResult[] }>> {
    const userId = this.resolveUserId(req, visitorId);
    if (!query?.trim()) {
      return { code: 0, message: 'ok', data: { items: [] } };
    }
    const trimmed = query.trim();
    if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) {
      throw new BadRequestException(
        `搜尋關鍵字長度不能超過 ${MAX_SEARCH_QUERY_LENGTH} 字元`,
      );
    }
    const results = await this.friendsService.searchUsers(userId, trimmed);
    return { code: 0, message: 'ok', data: { items: results } };
  }

  @Post('add')
  async addFriend(
    @Req() req: Request,
    @Body() dto: AddFriendRequest & { visitorId?: string },
  ): Promise<ApiResponse<{ success: boolean }>> {
    const userId = this.resolveUserId(req, dto.visitorId);
    if (!dto.targetUserId?.trim()) {
      throw new BadRequestException('目標使用者 ID 不能為空');
    }
    const remark = dto.remark?.trim() ? dto.remark.trim().slice(0, 50) : undefined;
    await this.friendsService.addFriend(userId, dto.targetUserId.trim(), remark);
    return { code: 0, message: '好友邀請已發送', data: { success: true } };
  }

  @Post('action')
  async handleAction(
    @Req() req: Request,
    @Body() dto: FriendActionRequest & { visitorId?: string },
  ): Promise<ApiResponse<{ success: boolean }>> {
    const userId = this.resolveUserId(req, dto.visitorId);
    if (!dto.friendUserId?.trim()) {
      throw new BadRequestException('好友使用者 ID 不能為空');
    }
    const validActions: readonly string[] = ['accept', 'reject', 'remove', 'block'];
    if (!validActions.includes(dto.action)) {
      throw new BadRequestException('無效的操作類型');
    }
    await this.friendsService.handleAction(
      userId,
      dto.friendUserId.trim(),
      dto.action,
    );
    return { code: 0, message: '操作成功', data: { success: true } };
  }

  @Get('messages/:userId')
  async getMessages(
    @Req() req: Request,
    @Param('userId') otherUserId: string,
    @Query('limit') limit?: string,
    @Query('visitorId') visitorId?: string,
  ): Promise<ApiResponse<{ items: FriendMessage[] }>> {
    const userId = this.resolveUserId(req, visitorId);
    // limit 未提供時由 service 使用預設值；無法解析為正整數時回 400，避免 NaN 進入 SQL LIMIT
    let limitNum: number | undefined;
    if (limit !== undefined) {
      const parsed = Number.parseInt(limit, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new BadRequestException('limit 必須是正整數');
      }
      limitNum = parsed;
    }
    const messages = await this.friendsService.getMessages(
      userId,
      otherUserId,
      limitNum,
    );
    return { code: 0, message: 'ok', data: { items: messages } };
  }

  @Post('messages')
  async sendMessage(
    @Req() req: Request,
    @Body() dto: SendMessageRequest & { visitorId?: string },
  ): Promise<ApiResponse<{ item: FriendMessage }>> {
    const userId = this.resolveUserId(req, dto.visitorId);
    if (!dto.toUserId?.trim()) {
      throw new BadRequestException('接收使用者 ID 不能為空');
    }
    if (!dto.content?.trim()) {
      throw new BadRequestException('訊息內容不能為空');
    }
    const message = await this.friendsService.sendMessage(
      userId,
      dto.toUserId.trim(),
      dto.content,
    );
    return { code: 0, message: 'ok', data: { item: message } };
  }

  @Post('messages/read')
  async markMessagesRead(
    @Req() req: Request,
    @Body() dto: MarkMessagesReadRequest & { visitorId?: string },
  ): Promise<ApiResponse<{ success: boolean }>> {
    const userId = this.resolveUserId(req, dto.visitorId);
    if (!dto.fromUserId?.trim()) {
      throw new BadRequestException('發送方使用者 ID 不能為空');
    }
    await this.friendsService.markAsRead(userId, dto.fromUserId.trim());
    return { code: 0, message: '已標記為已讀', data: { success: true } };
  }

  @Get('online')
  async getOnlineStatus(
    @Query('userIds') userIds?: string,
  ): Promise<ApiResponse<Record<string, string>>> {
    if (!userIds?.trim()) {
      return { code: 0, message: 'ok', data: {} };
    }
    const ids = userIds
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_ONLINE_IDS);
    const statuses = await this.friendsService.getOnlineStatus(ids);
    return { code: 0, message: 'ok', data: statuses };
  }

  // ========== 輔助方法 ==========

  // 身份解析：平台環境由中介層注入 req.userContext；
  // 獨立部署（standalone）沒有中介層時，退回到查詢/請求中的 visitorId，
  // 與 ranking / matchmaking 等訪客制端點保持一致的身份模型。
  private resolveUserId(req: Request, visitorId?: string): string {
    const fromContext = (req.userContext as { userId?: string } | undefined)?.userId;
    if (fromContext) return fromContext;
    if (visitorId?.trim()) return visitorId.trim();
    throw new BadRequestException('無法識別使用者身分，請提供 visitorId');
  }
}
