import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AuthGuard } from './auth.guard';

@Module({
  controllers: [AccountController],
  providers: [AccountService, AuthGuard],
  exports: [AccountService],
})
export class AccountModule {}
