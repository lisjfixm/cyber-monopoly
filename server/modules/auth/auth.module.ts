import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from '@server/modules/account/account.module';
import { OAuthController } from './oauth.controller';
import { OAuthConfigService } from './oauth-config.service';
import { OAuthProviderService } from './oauth-provider.service';
import { OAuthAccountService } from './oauth-account.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
    }),
    AccountModule,
  ],
  controllers: [OAuthController],
  providers: [OAuthConfigService, OAuthProviderService, OAuthAccountService],
  exports: [OAuthAccountService],
})
export class AuthModule {}
