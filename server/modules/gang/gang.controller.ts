import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { GangService } from './gang.service';
import { AuthGuard } from '../account/auth.guard';
import { CreateGangDto, UpdateGangDto, KickMemberDto } from './dto';

@Controller('api/gang')
@UseGuards(AuthGuard)
export class GangController {
  constructor(private readonly gangService: GangService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateGangDto) {
    return this.gangService.createGang(req.user.accountId, dto);
  }

  @Get()
  list() {
    return this.gangService.listGangs();
  }

  @Get(':gangId')
  getOne(@Param('gangId') gangId: string) {
    return this.gangService.getGang(gangId);
  }

  @Post(':gangId/join')
  join(@Req() req: any, @Param('gangId') gangId: string) {
    return this.gangService.joinGang(req.user.accountId, gangId);
  }

  @Post('leave')
  leave(@Req() req: any) {
    return this.gangService.leaveGang(req.user.accountId);
  }

  @Patch(':gangId')
  update(@Req() req: any, @Param('gangId') gangId: string, @Body() dto: UpdateGangDto) {
    return this.gangService.updateGang(req.user.accountId, gangId, dto);
  }

  @Post(':gangId/kick')
  kick(@Req() req: any, @Param('gangId') gangId: string, @Body() dto: KickMemberDto) {
    return this.gangService.kickMember(req.user.accountId, gangId, dto);
  }
}
