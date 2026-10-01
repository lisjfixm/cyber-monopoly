import { Module } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { AccountModule } from '../account/account.module';
import { AuthGuard } from '../account/auth.guard';

@Module({
  imports: [AccountModule],
  controllers: [CheckinController],
  providers: [CheckinService, AuthGuard],
})
export class CheckinModule {}
