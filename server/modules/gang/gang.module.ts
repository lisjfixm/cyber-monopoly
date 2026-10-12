import { Module } from '@nestjs/common';
import { GangController } from './gang.controller';
import { GangService } from './gang.service';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [GangController],
  providers: [GangService],
  exports: [GangService],
})
export class GangModule {}
