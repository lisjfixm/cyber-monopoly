import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, and } from 'drizzle-orm';
import { scryptSync, randomBytes } from 'node:crypto';
import {
  monopolyAccountTable,
  monopolyAccountProvider,
} from '@server/database/schema';
import { AccountService } from '@server/modules/account/account.service';
import type {
  OAuthProvider,
  OAuthUserInfo,
  OAuthAuthResponse,
  AccountProfile,
} from '@shared/api.interface';

function mapToProfile(row: typeof monopolyAccountTable.$inferSelect): AccountProfile {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatarFrame: row.avatarFrame,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    coins: row.coins,
    level: row.level,
    isBanned: row.isBanned,
    banReason: row.banReason ?? undefined,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : undefined,
    unlockedSkins: row.unlockedSkins as string[],
    unlockedTitles: row.unlockedTitles as string[],
    unlockedAchievements: row.unlockedAchievements as Record<string, boolean>,
    inventory: row.inventory as { coins: number; items: Record<string, number> },
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class OAuthAccountService {
  private readonly logger = new Logger(OAuthAccountService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly accountService: AccountService,
  ) {}

  async loginOrRegister(userInfo: OAuthUserInfo): Promise<OAuthAuthResponse> {
    const { provider, providerUserId, email, displayName } = userInfo;

    const existingBindings = await this.db
      .select({ accountId: monopolyAccountProvider.accountId })
      .from(monopolyAccountProvider)
      .where(
        and(
          eq(monopolyAccountProvider.provider, provider),
          eq(monopolyAccountProvider.providerUserId, providerUserId),
        ),
      )
      .limit(1);

    const now = new Date();

    if (existingBindings.length > 0) {
      const { accountId } = existingBindings[0];
      const accounts = await this.db
        .select()
        .from(monopolyAccountTable)
        .where(eq(monopolyAccountTable.id, accountId))
        .limit(1);

      if (accounts.length === 0) {
        throw new BadRequestException('關聯帳號不存在');
      }

      const account = accounts[0];
      await this.db
        .update(monopolyAccountTable)
        .set({ lastLoginAt: now })
        .where(eq(monopolyAccountTable.id, accountId));

      const token = this.accountService.generateToken(account.id);
      this.logger.log(`第三方登錄成功: ${provider}/${providerUserId} -> ${account.username}`);

      return {
        token,
        account: mapToProfile(account),
        isNewUser: false,
        needsNicknameSetup: false,
      };
    }

    const generatedUsername = `${provider}_${providerUserId.slice(0, 20)}`;
    const tempPassword = randomBytes(32).toString('hex');
    const defaultNickname =
      displayName || email?.split('@')[0] || `${provider}_user`;

    let accountId: string;
    let isNewUser = true;
    let needsNicknameSetup = true;

    if (email) {
      const existingByEmail = await this.db
        .select({ id: monopolyAccountTable.id, username: monopolyAccountTable.username })
        .from(monopolyAccountTable)
        .where(eq(monopolyAccountTable.username, email))
        .limit(1);

      if (existingByEmail.length > 0) {
        accountId = existingByEmail[0].id;
        isNewUser = false;
        needsNicknameSetup = false;
        await this.db
          .update(monopolyAccountTable)
          .set({ lastLoginAt: now })
          .where(eq(monopolyAccountTable.id, accountId));
      } else {
        const inserted = await this.db
          .insert(monopolyAccountTable)
          .values({
            username: generatedUsername,
            passwordHash: this.hashPassword(tempPassword),
            nickname: defaultNickname,
            lastLoginAt: now,
          })
          .returning({ id: monopolyAccountTable.id });
        accountId = inserted[0].id;
      }
    } else {
      const existingByName = await this.db
        .select({ id: monopolyAccountTable.id })
        .from(monopolyAccountTable)
        .where(eq(monopolyAccountTable.username, generatedUsername))
        .limit(1);

      if (existingByName.length > 0) {
        accountId = existingByName[0].id;
        isNewUser = false;
        needsNicknameSetup = false;
        await this.db
          .update(monopolyAccountTable)
          .set({ lastLoginAt: now })
          .where(eq(monopolyAccountTable.id, accountId));
      } else {
        const inserted = await this.db
          .insert(monopolyAccountTable)
          .values({
            username: generatedUsername,
            passwordHash: this.hashPassword(tempPassword),
            nickname: defaultNickname,
            lastLoginAt: now,
          })
          .returning({ id: monopolyAccountTable.id });
        accountId = inserted[0].id;
      }
    }

    try {
      await this.db.insert(monopolyAccountProvider).values({
        accountId,
        provider,
        providerUserId,
        email,
        displayName,
        boundAt: now,
      });
    } catch (err) {
      // 並發回調時，唯一索引 (provider, provider_user_id) 可能衝突；
      // 此時視為已綁定，重新讀取該綁定對應帳號完成登入
      if (this.isUniqueViolation(err)) {
        const rebound = await this.db
          .select({ accountId: monopolyAccountProvider.accountId })
          .from(monopolyAccountProvider)
          .where(
            and(
              eq(monopolyAccountProvider.provider, provider),
              eq(monopolyAccountProvider.providerUserId, providerUserId),
            ),
          )
          .limit(1);
        if (rebound.length > 0) {
          accountId = rebound[0].accountId;
          isNewUser = false;
        }
      } else {
        throw err;
      }
    }

    const accounts = await this.db
      .select()
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.id, accountId))
      .limit(1);

    if (accounts.length === 0) {
      throw new BadRequestException('創建帳號失敗');
    }

    const token = this.accountService.generateToken(accountId);
    this.logger.log(
      `第三方${isNewUser ? '註冊並' : ''}綁定成功: ${provider}/${providerUserId} -> account:${accountId}`,
    );

    return {
      token,
      account: mapToProfile(accounts[0]),
      isNewUser,
      needsNicknameSetup,
    };
  }

  async listBindings(accountId: string): Promise<{
    bindings: Array<{
      provider: OAuthProvider;
      displayName?: string;
      email?: string;
      boundAt: string;
    }>;
    hasPassword: boolean;
  }> {
    const rows = await this.db
      .select({
        provider: monopolyAccountProvider.provider,
        boundAt: monopolyAccountProvider.boundAt,
        displayName: monopolyAccountProvider.displayName,
        email: monopolyAccountProvider.email,
      })
      .from(monopolyAccountProvider)
      .where(eq(monopolyAccountProvider.accountId, accountId))
      .orderBy(monopolyAccountProvider.boundAt);

    const accountRows = await this.db
      .select({ passwordHash: monopolyAccountTable.passwordHash })
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.id, accountId))
      .limit(1);

    const hasPassword = accountRows.length > 0 && !!accountRows[0].passwordHash;

    return {
      bindings: rows.map(r => ({
        provider: r.provider as OAuthProvider,
        displayName: r.displayName ?? undefined,
        email: r.email ?? undefined,
        boundAt: r.boundAt.toISOString(),
      })),
      hasPassword,
    };
  }

  async bindToAccount(accountId: string, userInfo: OAuthUserInfo): Promise<void> {
    const { provider, providerUserId, email, displayName } = userInfo;

    const existing = await this.db
      .select({ accountId: monopolyAccountProvider.accountId })
      .from(monopolyAccountProvider)
      .where(
        and(
          eq(monopolyAccountProvider.provider, provider),
          eq(monopolyAccountProvider.providerUserId, providerUserId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].accountId === accountId) {
        return;
      }
      throw new BadRequestException(
        '該第三方帳號已綁定其他遊戲帳號，請先解除舊綁定再重試',
      );
    }

    try {
      await this.db.insert(monopolyAccountProvider).values({
        accountId,
        provider,
        providerUserId,
        email,
        displayName,
        boundAt: new Date(),
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new BadRequestException(
          '該第三方帳號已被綁定，請重新整理後再試',
        );
      }
      throw err;
    }

    this.logger.log(
      `第三方帳號綁定成功: account:${accountId} + ${provider}/${providerUserId}`,
    );
  }

  async unbind(accountId: string, provider: OAuthProvider): Promise<void> {
    const bindings = await this.db
      .select({ id: monopolyAccountProvider.id })
      .from(monopolyAccountProvider)
      .where(
        and(
          eq(monopolyAccountProvider.accountId, accountId),
          eq(monopolyAccountProvider.provider, provider),
        ),
      )
      .limit(1);

    if (bindings.length === 0) {
      throw new BadRequestException('未找到該第三方綁定');
    }

    const { bindings: allBindings, hasPassword } = await this.listBindings(accountId);
    const remainingCount = allBindings.filter(b => b.provider !== provider).length;
    if (remainingCount === 0 && !hasPassword) {
      throw new BadRequestException(
        '至少保留一種登入方式，請先設定密碼或綁定其他第三方帳號',
      );
    }

    await this.db
      .delete(monopolyAccountProvider)
      .where(eq(monopolyAccountProvider.id, bindings[0].id));
  }

  // 遞迴剝離 drizzle/postgres 的錯誤包裝，取出 Postgres 原生 code（23505 = 唯一衝突）
  private isUniqueViolation(error: unknown): boolean {
    let current: unknown = error;
    for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
      const { code, cause } = current as { code?: unknown; cause?: unknown };
      if (code === '23505') return true;
      current = cause;
    }
    return false;
  }

  private hashPassword(password: string): string {
    const SCRYPT_KEYLEN = 64;
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
    return `${salt}:${derivedKey}`;
  }
}
