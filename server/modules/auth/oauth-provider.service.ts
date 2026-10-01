import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OAuthConfigService } from './oauth-config.service';
import type { OAuthProvider, OAuthUserInfo } from '@shared/api.interface';

@Injectable()
export class OAuthProviderService {
  private readonly logger = new Logger(OAuthProviderService.name);

  constructor(
    private readonly configService: OAuthConfigService,
    private readonly httpService: HttpService,
  ) {}

  buildAuthorizationUrl(provider: OAuthProvider, state: string): string {
    const config = this.configService.getConfig(provider);
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope,
      state,
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `${config.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeCode(provider: OAuthProvider, code: string): Promise<string> {
    const config = this.configService.getConfig(provider);

    const body = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(config.tokenEndpoint, body.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        }),
      );
      const data = response.data as { access_token: string; id_token?: string };
      return data.access_token;
    } catch (error: unknown) {
      this.logger.error(`${provider} code 換 token 失敗: ${this.extractErrMsg(error)}`);
      throw new BadRequestException('第三方授權碼無效或已過期');
    }
  }

  async getUserInfo(provider: OAuthProvider, accessToken: string): Promise<OAuthUserInfo> {
    switch (provider) {
      case 'google':
        return this.getGoogleUserInfo(accessToken);
      case 'apple':
        return this.getAppleUserInfo(accessToken);
      case 'github':
        return this.getGitHubUserInfo(accessToken);
      default:
        throw new BadRequestException(`未知的 OAuth Provider: ${provider}`);
    }
  }

  private async getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const config = this.configService.getGoogleConfig();
    const response = await firstValueFrom(
      this.httpService.get(config.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    const data = response.data as { sub: string; email?: string; name?: string; picture?: string };
    return {
      provider: 'google',
      providerUserId: data.sub,
      email: data.email,
      displayName: data.name,
      avatarUrl: data.picture,
    };
  }

  private async getAppleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://appleid.apple.com/auth/token',
        new URLSearchParams({
          client_id: this.configService.getAppleConfig().clientId,
          client_secret: '',
          code: accessToken,
          grant_type: 'authorization_code',
          redirect_uri: this.configService.getAppleConfig().redirectUri,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      ),
    );
    const data = response.data as { id_token?: string };
    const idToken = data.id_token ?? '';
    const payload = this.decodeJwtPayload(idToken);
    return {
      provider: 'apple',
      providerUserId: payload.sub || '',
      email: payload.email,
      displayName: undefined,
    };
  }

  private async getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const config = this.configService.getGitHubConfig();
    const response = await firstValueFrom(
      this.httpService.get(config.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }),
    );
    const data = response.data as {
      id: number;
      login: string;
      name?: string;
      email?: string;
      avatar_url?: string;
    };

    let email = data.email;
    if (!email) {
      try {
        const emailsResponse = await firstValueFrom(
          this.httpService.get('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }),
        );
        const emails = emailsResponse.data as Array<{ email: string; primary?: boolean; verified?: boolean }>;
        const primary = emails.find(e => e.primary);
        email = primary?.email;
      } catch {
        // 拿不到 email 也不阻塞登錄
      }
    }

    return {
      provider: 'github',
      providerUserId: String(data.id),
      email,
      displayName: data.name || data.login,
      avatarUrl: data.avatar_url,
    };
  }

  private decodeJwtPayload(token: string): Record<string, string> {
    if (!token) return {};
    try {
      const parts = token.split('.');
      if (parts.length < 2) return {};
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
      return payload as Record<string, string>;
    } catch {
      return {};
    }
  }

  private extractErrMsg(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const resp = (error as { response?: { data?: unknown } }).response;
      return JSON.stringify(resp?.data ?? '');
    }
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
