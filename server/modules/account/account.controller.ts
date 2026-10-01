import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccountService } from './account.service';
import { AuthGuard } from './auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MergeLocalSaveDto } from './dto/merge-local-save.dto';
import type {
  AuthResponse,
  AccountProfile,
  LeaderboardEntry,
  Announcement,
} from '@shared/api.interface';

@Controller('api/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.accountService.register(dto.username, dto.password, dto.nickname);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.accountService.login(dto.username, dto.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request): Promise<AccountProfile> {
    const accountId = req.accountId!;
    return this.accountService.getProfile(accountId);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<AccountProfile> {
    const accountId = req.accountId!;
    return this.accountService.updateProfile(accountId, {
      nickname: dto.nickname,
      avatarFrame: dto.avatarFrame,
    });
  }

  @Get('leaderboard')
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.accountService.getLeaderboard();
  }

  @Get('announcements')
  async getAnnouncements(): Promise<Announcement[]> {
    return this.accountService.getAnnouncements();
  }

  @Post('merge')
  @UseGuards(AuthGuard)
  async mergeLocalSave(
    @Req() req: Request,
    @Body() data: MergeLocalSaveDto,
  ): Promise<AccountProfile> {
    const accountId = req.accountId!;
    return this.accountService.mergeLocalSave(accountId, data);
  }
}
