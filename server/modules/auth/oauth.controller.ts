import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { OAuthConfigService } from './oauth-config.service';
import { OAuthProviderService } from './oauth-provider.service';
import { OAuthAccountService } from './oauth-account.service';
import { AuthGuard } from '@server/modules/account/auth.guard';
import type {
  OAuthProvider,
  OAuthUrlResponse,
  OAuthBindingsResponse,
} from '@shared/api.interface';

const VALID_PROVIDERS: OAuthProvider[] = ['google', 'apple', 'github'];
const LINK_STATE_PREFIX = 'link:';
const LINK_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 分鐘
// 一般登入流程的 state TTL，與授權碼交換的有效時間對齊
const LOGIN_STATE_TTL_MS = 10 * 60 * 1000;

interface LinkTokenEntry {
  accountId: string;
  expiresAt: number;
}

interface LoginStateEntry {
  provider: OAuthProvider;
  expiresAt: number;
}

const linkTokenStore = new Map<string, LinkTokenEntry>();
// 登入流程的 CSRF state 暫存：發起授權時寫入，回調時比對，防止登入 CSRF
const loginStateStore = new Map<string, LoginStateEntry>();

@Controller('api/auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(
    private readonly configService: OAuthConfigService,
    private readonly providerService: OAuthProviderService,
    private readonly accountService: OAuthAccountService,
  ) {}

  @Get(':provider/url')
  getAuthorizationUrl(
    @Param('provider') provider: string,
  ): OAuthUrlResponse {
    const oauthProvider = this.validateProvider(provider);
    this.configService.ensureConfigured(oauthProvider);

    const state = randomBytes(32).toString('hex');
    this.registerLoginState(oauthProvider, state);
    const url = this.providerService.buildAuthorizationUrl(oauthProvider, state);

    return {
      authorizationUrl: url,
      provider: oauthProvider,
    };
  }

  @Get(':provider')
  startOAuth(
    @Param('provider') provider: string,
    @Res() res: Response,
  ): void {
    const oauthProvider = this.validateProvider(provider);
    this.configService.ensureConfigured(oauthProvider);

    const state = randomBytes(32).toString('hex');
    this.registerLoginState(oauthProvider, state);
    const url = this.providerService.buildAuthorizationUrl(oauthProvider, state);

    res.redirect(url);
  }

  @Get('bindings')
  @UseGuards(AuthGuard)
  async getBindings(@Req() req: Request): Promise<OAuthBindingsResponse> {
    const accountId = req.accountId!;
    return this.accountService.listBindings(accountId);
  }

  @Delete('bindings/:provider')
  @UseGuards(AuthGuard)
  async unbind(
    @Req() req: Request,
    @Param('provider') provider: string,
  ): Promise<void> {
    const oauthProvider = this.validateProvider(provider);
    const accountId = req.accountId!;
    await this.accountService.unbind(accountId, oauthProvider);
  }

  @Get(':provider/link')
  @UseGuards(AuthGuard)
  getLinkUrl(
    @Param('provider') provider: string,
    @Req() req: Request,
  ): OAuthUrlResponse {
    const oauthProvider = this.validateProvider(provider);
    this.configService.ensureConfigured(oauthProvider);
    const accountId = req.accountId!;

    const linkToken = randomBytes(32).toString('hex');
    const state = `${LINK_STATE_PREFIX}${linkToken}`;

    linkTokenStore.set(linkToken, {
      accountId,
      expiresAt: Date.now() + LINK_TOKEN_TTL_MS,
    });

    this.purgeExpiredLinkTokens();

    const url = this.providerService.buildAuthorizationUrl(oauthProvider, state);

    return {
      authorizationUrl: url,
      provider: oauthProvider,
    };
  }

  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Req() _req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const oauthProvider = this.validateProvider(provider);
    this.configService.ensureConfigured(oauthProvider);

    if (error || !code) {
      this.logger.warn(`${oauthProvider} 授權被拒絕或未返回 code: ${error || 'missing code'}`);
      const redirectPath = state?.startsWith(LINK_STATE_PREFIX)
        ? '/profile?oauth_link_error='
        : '/?oauth_error=';
      res.redirect(`${redirectPath}${encodeURIComponent(error || '授權失敗')}`);
      return;
    }

    // CSRF 防護：一般登入流程必須帶有伺服器簽發且未過期的 state；
    // 綁定流程的 state 由 linkTokenStore 另外校驗。
    const isLinkMode = state?.startsWith(LINK_STATE_PREFIX);
    if (!isLinkMode) {
      const loginEntry = state ? loginStateStore.get(state) : undefined;
      if (
        !loginEntry ||
        loginEntry.provider !== oauthProvider ||
        Date.now() > loginEntry.expiresAt
      ) {
        this.logger.warn(
          `${oauthProvider} 回調 state 無效或已過期，可能為 CSRF 攻擊`,
        );
        res.redirect(
          `/?oauth_error=${encodeURIComponent('授權連結已過期，請重新登入')}`,
        );
        return;
      }
      loginStateStore.delete(state);
      this.purgeExpiredLoginStates();
    }

    try {
      const accessToken = await this.providerService.exchangeCode(oauthProvider, code);
      const userInfo = await this.providerService.getUserInfo(oauthProvider, accessToken);

      if (isLinkMode) {
        const linkToken = this.extractLinkToken(state);
        const entry = linkTokenStore.get(linkToken);
        if (!entry || Date.now() > entry.expiresAt) {
          throw new BadRequestException(
            '綁定連結已過期或無效，請重新發起綁定請求',
          );
        }
        linkTokenStore.delete(linkToken);
        await this.accountService.bindToAccount(entry.accountId, userInfo);
        this.logger.log(
          `第三方帳號綁定成功: account:${entry.accountId} + ${oauthProvider}/${userInfo.providerUserId}`,
        );
        res.redirect('/profile?oauth_link=1');
        return;
      }

      const result = await this.accountService.loginOrRegister(userInfo);
      const redirectUrl = this.buildCallbackRedirectUrl(result);
      res.redirect(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知錯誤';
      this.logger.error(`${oauthProvider} 回調處理失敗: ${msg}`);
      const isLinkMode = state?.startsWith(LINK_STATE_PREFIX);
      const redirectPath = isLinkMode
        ? '/profile?oauth_link_error='
        : '/?oauth_error=';
      res.redirect(`${redirectPath}${encodeURIComponent(msg)}`);
    }
  }

  private extractLinkToken(state: string): string {
    return state.slice(LINK_STATE_PREFIX.length);
  }

  private purgeExpiredLinkTokens(): void {
    const now = Date.now();
    for (const [token, entry] of linkTokenStore) {
      if (now > entry.expiresAt) {
        linkTokenStore.delete(token);
      }
    }
  }

  // 登入流程 state 註冊與清理
  private registerLoginState(provider: OAuthProvider, state: string): void {
    loginStateStore.set(state, {
      provider,
      expiresAt: Date.now() + LOGIN_STATE_TTL_MS,
    });
    this.purgeExpiredLoginStates();
  }

  private purgeExpiredLoginStates(): void {
    const now = Date.now();
    for (const [token, entry] of loginStateStore) {
      if (now > entry.expiresAt) {
        loginStateStore.delete(token);
      }
    }
  }

  private validateProvider(provider: string): OAuthProvider {
    if (!VALID_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new BadRequestException(`不支援的第三方登錄方式: ${provider}`);
    }
    return provider as OAuthProvider;
  }

  private buildCallbackRedirectUrl(result: {
    token: string;
    isNewUser: boolean;
    needsNicknameSetup: boolean;
  }): string {
    const params = new URLSearchParams({
      oauth_token: result.token,
      oauth_new_user: result.isNewUser ? '1' : '0',
      oauth_needs_nickname: result.needsNicknameSetup ? '1' : '0',
    });
    return `/?${params.toString()}`;
  }
}
