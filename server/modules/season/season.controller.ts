import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SeasonService } from './season.service';
import { AuthGuard } from '../account/auth.guard';
import { ReportSeasonScoreDto } from './dto';

@Controller('api/season')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Post('report')
  @UseGuards(AuthGuard)
  report(@Req() req: any, @Body() dto: ReportSeasonScoreDto) {
    return this.seasonService.reportScore(req.user.accountId, dto);
  }

  @Get(':seasonId/ranking')
  getRanking(@Param('seasonId') seasonId: string, @Query('limit') limit?: string) {
    return this.seasonService.getRanking(seasonId, limit ? parseInt(limit, 10) : 50);
  }

  @Get(':seasonId/my-rank')
  @UseGuards(AuthGuard)
  getMyRank(@Req() req: any, @Param('seasonId') seasonId: string) {
    return this.seasonService.getMyRank(req.user.accountId, seasonId);
  }
}
