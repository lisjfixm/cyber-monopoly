import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';

import { MatchmakingService } from './matchmaking.service';
import {
  MatchJoinRequest,
  MatchJoinResponse,
  MatchStatusResponse,
  MatchLeaveRequest,
  MatchLeaveResponse,
  ApiResponse,
} from '@shared/api.interface';

@Controller('api/matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  /**
   * 加入配對佇列
   */
  @Post('join')
  async joinQueue(@Body() dto: MatchJoinRequest): Promise<ApiResponse<MatchJoinResponse>> {
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    if (!dto.nickname?.trim()) {
      throw new BadRequestException('暱稱不能為空');
    }
    if (dto.nickname.trim().length > 20) {
      throw new BadRequestException('暱稱長度不能超過 20 字元');
    }

    const { position, waitedSeconds } = await this.matchmakingService.joinQueue(
      dto.visitorId.trim(),
      dto.nickname.trim(),
      dto.gameMode,
      dto.maxPlayers,
    );

    return {
      code: 0,
      message: 'ok',
      data: {
        inQueue: true,
        position,
        waitedSeconds,
      },
    };
  }

  /**
   * 離開配對佇列
   */
  @Post('leave')
  async leaveQueue(@Body() dto: MatchLeaveRequest): Promise<ApiResponse<MatchLeaveResponse>> {
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }

    const success = await this.matchmakingService.leaveQueue(dto.visitorId.trim());

    return {
      code: 0,
      message: 'ok',
      data: { success },
    };
  }

  /**
   * 查詢配對狀態（輪詢介面）
   */
  @Get('status')
  async getStatus(
    @Query('visitorId') visitorId: string,
  ): Promise<ApiResponse<MatchStatusResponse>> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }

    const status = await this.matchmakingService.getQueueStatus(visitorId.trim());

    return {
      code: 0,
      message: 'ok',
      data: status,
    };
  }
}
