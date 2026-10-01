import { Module } from '@nestjs/common';

import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import { MonopolyModule } from '../monopoly/monopoly.module';

@Module({
  imports: [MonopolyModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
