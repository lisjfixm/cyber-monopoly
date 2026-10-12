import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EconomyService } from './economy.service';
import { AuthGuard } from '../account/auth.guard';
import { ReportEconomyEventDto } from './dto';

@Controller('api/economy')
@UseGuards(AuthGuard)
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Post('report')
  report(@Req() req: any, @Body() dto: ReportEconomyEventDto) {
    return this.economyService.reportEvent(req.user.accountId, dto);
  }

  @Get('my-summary')
  mySummary(@Req() req: any) {
    return this.economyService.getSummary(req.user.accountId);
  }

  @Get('global-summary')
  globalSummary() {
    return this.economyService.getGlobalSummary();
  }
}
