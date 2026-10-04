import {
  Injectable,
  Inject,
  Logger,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, desc, and } from 'drizzle-orm';
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  monopolyAccountTable,
  monopolyAnnouncementTable,
} from '@server/database/schema';
import type {
  AccountProfile,
  AuthResponse,
  LeaderboardEntry,
  Announcement,
} from '@shared/api.interface';

// 生產環境應透過環境變數 ACCOUNT_TOKEN_SECRET 注入強隨機密鑰；
// 預設值僅供本地開發使用，避免在多環境共享同一簽名金鑰。
const TOKEN_SECRET =
  process.env.ACCOUNT_TOKEN_SECRET || 'cyber_monopoly_secret_2026';
const TOKEN_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SCRYPT_KEYLEN = 64;

// 本地存檔合併時接受的最大數值，防止用戶端送出異常大值或負值
const MERGE_VALUE_CAP = 10_000_000;

function base64Encode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64url');
}

function base64Decode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, derivedKey] = storedHash.split(':');
  if (!salt || !derivedKey) return false;
  const inputKey = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  // 使用 timingSafeEqual 避免計時洩漏；長度不一致時直接視為不匹配
  if (inputKey.length !== derivedKey.length) return false;
  return timingSafeEqual(
    Buffer.from(inputKey, 'utf-8'),
    Buffer.from(derivedKey, 'utf-8'),
  );
}

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
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  // ===== Token helpers =====

  generateToken(accountId: string): string {
    const expiresAt = String(Date.now() + TOKEN_DURATION_MS);
    const payload = `${base64Encode(accountId)}.${base64Encode(expiresAt)}`;
    const signature = createHmac('sha256', TOKEN_SECRET)
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  verifyToken(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [userIdB64, expiresAtB64, signature] = parts;
      const payload = `${userIdB64}.${expiresAtB64}`;
      const expectedSignature = createHmac('sha256', TOKEN_SECRET)
        .update(payload)
        .digest('base64url');

      if (signature !== expectedSignature) return null;

      const expiresAt = Number(base64Decode(expiresAtB64));
      if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return null;

      return base64Decode(userIdB64);
    } catch {
      return null;
    }
  }

  // ===== Register =====

  async register(
    username: string,
    password: string,
    nickname: string,
  ): Promise<AuthResponse> {
    const existing = await this.db
      .select({ id: monopolyAccountTable.id })
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.username, username))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('使用者名稱已被註冊');
    }

    const passwordHash = hashPassword(password);
    const now = new Date();

    let inserted: Array<typeof monopolyAccountTable.$inferSelect>;
    try {
      inserted = await this.db
        .insert(monopolyAccountTable)
        .values({
          username,
          passwordHash,
          nickname,
          lastLoginAt: now,
        })
        .returning();
    } catch (err) {
      // 並發註冊時，唯一索引 (username) 會拋 23505；轉為 409 而非 500
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('使用者名稱已被註冊');
      }
      throw err;
    }

    if (inserted.length === 0) {
      throw new BadRequestException('注册失败');
    }

    const account = inserted[0];
    const token = this.generateToken(account.id);

    this.logger.log(`新用户注册成功: ${username}`);

    return {
      token,
      account: mapToProfile(account),
    };
  }

  // ===== Login =====

  async login(username: string, password: string): Promise<AuthResponse> {
    const accounts = await this.db
      .select()
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.username, username))
      .limit(1);

    if (accounts.length === 0) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const account = accounts[0];

    if (!verifyPassword(password, account.passwordHash)) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (account.isBanned) {
      throw new ForbiddenException(
        `账号已被封禁${account.banReason ? `：${account.banReason}` : ''}`,
      );
    }

    const now = new Date();
    await this.db
      .update(monopolyAccountTable)
      .set({ lastLoginAt: now })
      .where(eq(monopolyAccountTable.id, account.id));

    const token = this.generateToken(account.id);

    this.logger.log(`用户登录: ${username}`);

    return {
      token,
      account: mapToProfile({ ...account, lastLoginAt: now }),
    };
  }

  // ===== Get profile =====

  async getProfile(accountId: string): Promise<AccountProfile> {
    const accounts = await this.db
      .select()
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.id, accountId))
      .limit(1);

    if (accounts.length === 0) {
      throw new NotFoundException('账号不存在');
    }

    return mapToProfile(accounts[0]);
  }

  // ===== Update profile =====

  async updateProfile(
    accountId: string,
    data: { nickname?: string; avatarFrame?: string },
  ): Promise<AccountProfile> {
    const patch: Partial<typeof monopolyAccountTable.$inferInsert> = {};
    if (data.nickname !== undefined) patch.nickname = data.nickname;
    if (data.avatarFrame !== undefined) patch.avatarFrame = data.avatarFrame;

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    const updated = await this.db
      .update(monopolyAccountTable)
      .set(patch)
      .where(eq(monopolyAccountTable.id, accountId))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('账号不存在');
    }

    return mapToProfile(updated[0]);
  }

  // ===== Leaderboard =====

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const rows = await this.db
      .select({
        nickname: monopolyAccountTable.nickname,
        elo: monopolyAccountTable.elo,
        wins: monopolyAccountTable.wins,
        avatarFrame: monopolyAccountTable.avatarFrame,
      })
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.isBanned, false))
      .orderBy(desc(monopolyAccountTable.elo))
      .limit(100);

    return rows.map((row: { nickname: string; elo: number; wins: number; avatarFrame: string }, index: number) => ({
      rank: index + 1,
      nickname: row.nickname,
      elo: row.elo,
      wins: row.wins,
      isGuest: false,
      avatarFrame: row.avatarFrame,
    }));
  }

  // ===== Announcements =====

  async getAnnouncements(): Promise<Announcement[]> {
    const rows = await this.db
      .select()
      .from(monopolyAnnouncementTable)
      .where(eq(monopolyAnnouncementTable.isActive, true))
      .orderBy(desc(monopolyAnnouncementTable.priority));

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      isActive: row.isActive,
      priority: row.priority,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  // ===== Merge local save =====

  async mergeLocalSave(
    accountId: string,
    data: {
      wins?: number;
      losses?: number;
      elo?: number;
      coins?: number;
    },
  ): Promise<AccountProfile> {
    const accounts = await this.db
      .select()
      .from(monopolyAccountTable)
      .where(eq(monopolyAccountTable.id, accountId))
      .limit(1);

    if (accounts.length === 0) {
      throw new NotFoundException('账号不存在');
    }

    const account = accounts[0];
    const patch: Partial<typeof monopolyAccountTable.$inferInsert> = {};

    // 伺服器端二次校驗：僅接受有限、非負且在合理上限內的整數，避免用戶端送出
    // NaN、負數或超大值導致帳戶資料異常
    const pickMergeValue = (value: number | undefined): number | undefined => {
      if (value === undefined) return undefined;
      if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
      const intValue = Math.floor(value);
      if (intValue < 0 || intValue > MERGE_VALUE_CAP) return undefined;
      return intValue;
    };

    const incomingWins = pickMergeValue(data.wins);
    const incomingLosses = pickMergeValue(data.losses);
    const incomingElo = pickMergeValue(data.elo);
    const incomingCoins = pickMergeValue(data.coins);

    if (incomingWins !== undefined && incomingWins > account.wins) {
      patch.wins = incomingWins;
    }
    if (incomingLosses !== undefined && incomingLosses > account.losses) {
      patch.losses = incomingLosses;
    }
    if (incomingElo !== undefined && incomingElo > account.elo) {
      patch.elo = incomingElo;
    }
    if (incomingCoins !== undefined && incomingCoins > account.coins) {
      patch.coins = incomingCoins;
    }

    if (Object.keys(patch).length === 0) {
      return mapToProfile(account);
    }

    const updated = await this.db
      .update(monopolyAccountTable)
      .set(patch)
      .where(eq(monopolyAccountTable.id, accountId))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('账号不存在');
    }

    this.logger.log(`存档合并完成: ${account.username}`);

    return mapToProfile(updated[0]);
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
}
