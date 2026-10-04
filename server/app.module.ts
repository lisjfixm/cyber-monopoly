import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { StandaloneCoreModule } from './standalone/standalone.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { MonopolyModule } from './modules/monopoly/monopoly.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { FriendsModule } from './modules/friends/friends.module';
import { AccountModule } from './modules/account/account.module';
import { GmModule } from './modules/gm/gm.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { StatsModule } from './modules/stats/stats.module';
import { ViewModule } from './modules/view/view.module';

@Module({
  imports: [
    // Standalone core module: ConfigModule, postgres-js + drizzle DB provider,
    // HttpModule, global ValidationPipe, auto table creation on boot.
    StandaloneCoreModule,
    // ====== @route-section: business-modules START ======
    // Place all business modules here.Do NOT add fallback modules here.
    RankingModule,
    MonopolyModule,
    MatchmakingModule,
    FriendsModule,
    AccountModule,
    GmModule,
    AuthModule,
    CheckinModule,
    StatsModule,
    // ====== @route-section: business-modules END ======

    // ⚠️ @route-order: last
    // ViewModule is the fallback route module, must be registered last.
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
