import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OAuthProvider } from '@shared/api.interface';

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

@Injectable()
export class OAuthConfigService {
  private readonly logger = new Logger(OAuthConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  getGoogleConfig(): ProviderConfig {
    return {
      clientId: this.configService.get('OAUTH_GOOGLE_CLIENT_ID', ''),
      clientSecret: this.configService.get('OAUTH_GOOGLE_CLIENT_SECRET', ''),
      redirectUri: this.configService.get(
        'OAUTH_GOOGLE_REDIRECT_URI',
        '/api/auth/oauth/google/callback',
      ),
      scope: 'openid email profile',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
    };
  }

  getAppleConfig(): ProviderConfig & {
    teamId: string;
    keyId: string;
    privateKey: string;
  } {
    return {
      clientId: this.configService.get('OAUTH_APPLE_CLIENT_ID', ''),
      clientSecret: '',
      teamId: this.configService.get('OAUTH_APPLE_TEAM_ID', ''),
      keyId: this.configService.get('OAUTH_APPLE_KEY_ID', ''),
      privateKey: this.configService.get('OAUTH_APPLE_PRIVATE_KEY', '').replace(/\\n/g, '\n'),
      redirectUri: this.configService.get(
        'OAUTH_APPLE_REDIRECT_URI',
        '/api/auth/oauth/apple/callback',
      ),
      scope: 'name email',
      authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
      tokenEndpoint: 'https://appleid.apple.com/auth/token',
      userInfoEndpoint: '',
    };
  }

  getGitHubConfig(): ProviderConfig {
    return {
      clientId: this.configService.get('OAUTH_GITHUB_CLIENT_ID', ''),
      clientSecret: this.configService.get('OAUTH_GITHUB_CLIENT_SECRET', ''),
      redirectUri: this.configService.get(
        'OAUTH_GITHUB_REDIRECT_URI',
        '/api/auth/oauth/github/callback',
      ),
      scope: 'read:user user:email',
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      userInfoEndpoint: 'https://api.github.com/user',
    };
  }

  getConfig(provider: OAuthProvider): ProviderConfig {
    switch (provider) {
      case 'google':
        return this.getGoogleConfig();
      case 'apple':
        return this.getAppleConfig();
      case 'github':
        return this.getGitHubConfig();
      default:
        throw new BadRequestException(`未知的 OAuth Provider: ${provider}`);
    }
  }

  isConfigured(provider: OAuthProvider): boolean {
    const config = this.getConfig(provider);
    if (provider === 'apple') {
      const appleConfig = this.getAppleConfig();
      return (
        !!appleConfig.clientId &&
        !!appleConfig.teamId &&
        !!appleConfig.keyId &&
        !!appleConfig.privateKey
      );
    }
    return !!config.clientId && !!config.clientSecret;
  }

  ensureConfigured(provider: OAuthProvider): void {
    if (!this.isConfigured(provider)) {
      throw new BadRequestException(
        `${provider} 第三方登录未配置，请联系管理员设置 ${provider.toUpperCase()}_CLIENT_ID / ${provider.toUpperCase()}_CLIENT_SECRET 等环境变量。`,
      );
    }
  }
}
