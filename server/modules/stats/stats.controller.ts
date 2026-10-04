import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';

import { StatsService, GameRecordItem, PlayerStatsSummary } from './stats.service';
import { ReportGameDto } from './dto/report-game.dto';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // 回報一場完賽結果（戰報入庫，供戰績統計與賽季戰報使用）
  @Post('report')
  async reportGame(
    @Body() dto: ReportGameDto,
  ): Promise<ApiResponse<{ record: GameRecordItem }>> {
    const { record } = await this.statsService.reportGame(dto);
    return { code: 0, message: '戰報已記錄', data: { record } };
  }

  // 我的戰績統計：總覽 + 本賽季 + 近期戰報
  @Get('me')
  async getMyStats(
    @Query('visitorId') visitorId?: string,
    @Query('season') season?: string,
  ): Promise<ApiResponse<{ summary: PlayerStatsSummary; recent: GameRecordItem[] }>> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    const result = await this.statsService.getMyStats(visitorId.trim(), season);
    return { code: 0, message: 'ok', data: result };
  }

  // 近期戰報列表
  @Get('recent')
  async getRecent(
    @Query('visitorId') visitorId?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<{ items: GameRecordItem[] }>> {
    if (!visitorId?.trim()) {
      throw new BadRequestException('visitorId 不能為空');
    }
    let limitNum: number | undefined;
    if (limit !== undefined) {
      const parsed = Number.parseInt(limit, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new BadRequestException('limit 必須是正整數');
      }
      limitNum = parsed;
    }
    const result = await this.statsService.getRecent(visitorId.trim(), limitNum);
    return { code: 0, message: 'ok', data: result };
  }
}
