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

@Controller('api/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  async getFriends(@Req() req: Request): Promise<ApiResponse<FriendInfo[]>> {
    const userId = this.getUserId(req);
    const friends = await this.friendsService.getFriends(userId);
    return { code: 0, message: 'ok', data: friends };
  }

  @Get('pending')
  async getPendingRequests(
    @Req() req: Request,
  ): Promise<ApiResponse<FriendInfo[]>> {
    const userId = this.getUserId(req);
    const requests = await this.friendsService.getPendingRequests(userId);
    return { code: 0, message: 'ok', data: requests };
  }

  @Get('search')
  async searchUsers(
    @Req() req: Request,
    @Query('query') query?: string,
  ): Promise<ApiResponse<SearchUserResult[]>> {
    const userId = this.getUserId(req);
    if (!query?.trim()) {
      return { code: 0, message: 'ok', data: [] };
    }
    const results = await this.friendsService.searchUsers(userId, query.trim());
    return { code: 0, message: 'ok', data: results };
  }

  @Post('add')
  async addFriend(
    @Req() req: Request,
    @Body() dto: AddFriendRequest,
  ): Promise<ApiResponse<void>> {
    const userId = this.getUserId(req);
    if (!dto.targetUserId?.trim()) {
      throw new BadRequestException('目标用户ID不能为空');
    }
    await this.friendsService.addFriend(
      userId,
      dto.targetUserId.trim(),
      dto.remark,
    );
    return { code: 0, message: '好友请求已发送' };
  }

  @Post('action')
  async handleAction(
    @Req() req: Request,
    @Body() dto: FriendActionRequest,
  ): Promise<ApiResponse<void>> {
    const userId = this.getUserId(req);
    if (!dto.friendUserId?.trim()) {
      throw new BadRequestException('好友用户ID不能为空');
    }
    const validActions: readonly string[] = ['accept', 'reject', 'remove', 'block'];
    if (!validActions.includes(dto.action)) {
      throw new BadRequestException('无效的操作类型');
    }
    await this.friendsService.handleAction(
      userId,
      dto.friendUserId.trim(),
      dto.action,
    );
    return { code: 0, message: '操作成功' };
  }

  @Get('messages/:userId')
  async getMessages(
    @Req() req: Request,
    @Param('userId') otherUserId: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<FriendMessage[]>> {
    const userId = this.getUserId(req);
    // limit 未提供時由 service 使用預設值；無法解析為正整數時回傳 400，避免 NaN 進入 SQL LIMIT
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
    return { code: 0, message: 'ok', data: messages };
  }

  @Post('messages')
  async sendMessage(
    @Req() req: Request,
    @Body() dto: SendMessageRequest,
  ): Promise<ApiResponse<FriendMessage>> {
    const userId = this.getUserId(req);
    if (!dto.toUserId?.trim()) {
      throw new BadRequestException('接收用户ID不能为空');
    }
    if (!dto.content?.trim()) {
      throw new BadRequestException('消息内容不能为空');
    }
    const message = await this.friendsService.sendMessage(
      userId,
      dto.toUserId.trim(),
      dto.content,
    );
    return { code: 0, message: 'ok', data: message };
  }

  @Post('messages/read')
  async markMessagesRead(
    @Req() req: Request,
    @Body() dto: MarkMessagesReadRequest,
  ): Promise<ApiResponse<void>> {
    const userId = this.getUserId(req);
    if (!dto.fromUserId?.trim()) {
      throw new BadRequestException('发送方用户ID不能为空');
    }
    await this.friendsService.markAsRead(userId, dto.fromUserId.trim());
    return { code: 0, message: '已标记为已读' };
  }

  @Get('online')
  async getOnlineStatus(
    @Req() req: Request,
    @Query('userIds') userIds?: string,
  ): Promise<ApiResponse<Record<string, string>>> {
    if (!userIds?.trim()) {
      return { code: 0, message: 'ok', data: {} };
    }
    const ids = userIds.split(',').map((s: string) => s.trim()).filter(Boolean);
    const statuses = await this.friendsService.getOnlineStatus(ids);
    return { code: 0, message: 'ok', data: statuses };
  }

  // ========== 辅助方法 ==========

  private getUserId(req: Request): string {
    const userId = (req.userContext as { userId?: string } | undefined)?.userId;
    if (!userId) {
      throw new BadRequestException('用户未登录');
    }
    return userId;
  }
}
