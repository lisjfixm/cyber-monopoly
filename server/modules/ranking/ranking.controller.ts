import { Controller, Get, Post, Patch, Body, Param, Query, BadRequestException } from '@nestjs/common';

import { RankingService } from './ranking.service';
import {
  GetOrCreatePlayerRequest,
  UpdateNicknameRequest,
  ApiResponse,
  PlayerProfile,
  LeaderboardItem,
  PlayerRankInfo,
  LeaderboardType,
} from '@shared/api.interface';

@Controller('api/ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post('player')
  async getOrCreatePlayer(
    @Body() dto: GetOrCreatePlayerRequest,
  ): Promise<ApiResponse<{ player: PlayerProfile; isNew: boolean }>> {
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('访客ID不能为空');
    }
    const result = await this.rankingService.getOrCreatePlayer(
      dto.visitorId.trim(),
      dto.nickname,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Patch('player/nickname')
  async updateNickname(
    @Body() dto: UpdateNicknameRequest,
  ): Promise<ApiResponse<{ success: boolean; player: PlayerProfile }>> {
    if (!dto.visitorId?.trim()) {
      throw new BadRequestException('访客ID不能为空');
    }
    const result = await this.rankingService.updateNickname(
      dto.visitorId.trim(),
      dto.nickname,
    );
    return { code: 0, message: 'ok', data: result };
  }

  @Get('player/:visitorId')
  async getPlayer(
    @Param('visitorId') visitorId: string,
  ): Promise<ApiResponse<{ player: PlayerProfile; ranks: PlayerRankInfo }>> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('访客ID不能为空');
    }
    const result = await this.rankingService.getPlayer(visitorId.trim());
    return { code: 0, message: 'ok', data: result };
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<{ items: LeaderboardItem[]; type: string }>> {
    const validTypes: LeaderboardType[] = ['elo', 'wins', 'season'];
    const boardType: LeaderboardType = validTypes.includes(type as LeaderboardType)
      ? (type as LeaderboardType)
      : 'elo';

    const parsedLimit = limit !== undefined ? parseInt(limit, 10) : undefined;
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit <= 0)) {
      throw new BadRequestException('limit 必须是正整数');
    }

    const result = await this.rankingService.getLeaderboard(boardType, parsedLimit);
    return { code: 0, message: 'ok', data: result };
  }
}
