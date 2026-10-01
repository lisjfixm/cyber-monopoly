import { Module } from '@nestjs/common';
import { GmController } from './gm.controller';
import { GmService } from './gm.service';

@Module({
  controllers: [GmController],
  providers: [GmService],
  exports: [GmService],
})
export class GmModule {}
