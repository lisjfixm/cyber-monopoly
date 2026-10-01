import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { GmService } from './gm.service';
import { GmAuthGuard } from './gm-auth.guard';
import type {
  Announcement,
  GmCreateAnnouncementRequest,
  GmLoginRequest,
  GmSendRewardRequest,
  GmUpdateUserRequest,
  GmUserSearchResult,
} from '@shared/api.interface';

@Controller('api/gm')
export class GmController {
  constructor(private readonly gmService: GmService) {}

  // ====== 登录 ======

  @Post('login')
  async login(
    @Body() dto: GmLoginRequest,
  ): Promise<{ token: string; expiresAt: string }> {
    return this.gmService.login(dto.password);
  }

  // ====== 用户管理 ======

  @UseGuards(GmAuthGuard)
  @Get('users')
  async searchUsers(
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{
    items: GmUserSearchResult[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.gmService.searchUsers(keyword, page, pageSize);
  }

  @UseGuards(GmAuthGuard)
  @Get('users/:id')
  async getUser(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.gmService.getUserById(id);
  }

  @UseGuards(GmAuthGuard)
  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: GmUpdateUserRequest,
  ): Promise<Record<string, unknown>> {
    return this.gmService.updateUser(id, dto);
  }

  @UseGuards(GmAuthGuard)
  @Post('users/:id/reward')
  async sendReward(
    @Param('id') id: string,
    @Body() dto: GmSendRewardRequest,
  ): Promise<Record<string, unknown>> {
    return this.gmService.sendReward(id, dto);
  }

  @UseGuards(GmAuthGuard)
  @Post('users/:id/reset')
  async resetUser(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.gmService.resetUser(id);
  }

  // ====== 公告管理 ======

  @UseGuards(GmAuthGuard)
  @Get('announcements')
  async listAnnouncements(): Promise<Announcement[]> {
    return this.gmService.listAnnouncements();
  }

  @UseGuards(GmAuthGuard)
  @Post('announcements')
  async createAnnouncement(
    @Body() dto: GmCreateAnnouncementRequest,
  ): Promise<Announcement> {
    return this.gmService.createAnnouncement(dto);
  }

  @UseGuards(GmAuthGuard)
  @Patch('announcements/:id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      content?: string;
      priority?: number;
      isActive?: boolean;
    },
  ): Promise<Announcement> {
    return this.gmService.updateAnnouncement(id, dto);
  }

  @UseGuards(GmAuthGuard)
  @Delete('announcements/:id')
  async deleteAnnouncement(@Param('id') id: string): Promise<void> {
    return this.gmService.deleteAnnouncement(id);
  }

  // ====== 活动管理 ======

  @UseGuards(GmAuthGuard)
  @Get('events')
  async listEvents() {
    return this.gmService.listEvents();
  }

  @UseGuards(GmAuthGuard)
  @Post('events')
  async createEvent(
    @Body()
    dto: {
      eventType: string;
      name: string;
      description?: string;
      isActive?: boolean;
      config?: Record<string, unknown>;
      startsAt?: string;
      endsAt?: string;
    },
  ) {
    return this.gmService.createEvent(dto);
  }

  @UseGuards(GmAuthGuard)
  @Patch('events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body()
    dto: {
      eventType?: string;
      name?: string;
      description?: string;
      isActive?: boolean;
      config?: Record<string, unknown>;
      startsAt?: string;
      endsAt?: string;
    },
  ) {
    return this.gmService.updateEvent(id, dto);
  }

  @UseGuards(GmAuthGuard)
  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return this.gmService.deleteEvent(id);
  }

  // ====== 在线用户 ======

  @UseGuards(GmAuthGuard)
  @Get('online-users')
  async getOnlineUsers() {
    return this.gmService.getOnlineUsers();
  }
}
