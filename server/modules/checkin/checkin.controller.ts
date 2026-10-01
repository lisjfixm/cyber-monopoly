import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CheckinService } from './checkin.service';
import { AuthGuard } from '../account/auth.guard';
import type {
  CheckinStatusResponse,
  CheckinPerformResponse,
} from '@shared/api.interface';

@Controller('api/checkin')
@UseGuards(AuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('status')
  async getStatus(@Req() req: Request): Promise<CheckinStatusResponse> {
    const accountId = req.accountId!;
    return this.checkinService.getStatus(accountId);
  }

  @Post()
  async checkin(@Req() req: Request): Promise<CheckinPerformResponse> {
    const accountId = req.accountId!;
    return this.checkinService.performCheckin(accountId);
  }
}
