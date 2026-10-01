import { Module } from '@nestjs/common';
import { MonopolyController } from './monopoly.controller';
import { MonopolyService } from './monopoly.service';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [RankingModule],
  controllers: [MonopolyController],
  providers: [MonopolyService],
  exports: [MonopolyService],
})
export class MonopolyModule {}
