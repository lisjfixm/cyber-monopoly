import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { DRIZZLE_DATABASE } from '@lark-apaas/fullstack-nestjs-core';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import * as schema from '../database/schema';

/** Raw postgres-js client token */
const POSTGRES_CLIENT = 'POSTGRES_CLIENT';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 5000 }),
  ],
  providers: [
    {
      provide: POSTGRES_CLIENT,
      useFactory: (): ReturnType<typeof postgres> => {
        const url =
          process.env.DATABASE_URL || process.env.SUDA_DATABASE_URL;
        if (!url) {
          // 未設定資料庫連線時不讓進程啟動失敗：
          // 使用本機佔位連線字串，postgres-js 為惰性連線，實際查詢才會失敗
          // （由全域例外過濾器轉為 5xx）；但健康檢查、靜態資源與 SPA fallback 仍可正常回應。
          return postgres(
            'postgres://user:password@127.0.0.1:1/no_database?connect_timeout=1',
            { max: 1, idle_timeout: 1, connect_timeout: 1 },
          );
        }
        return postgres(url, { max: 10 });
      },
    },
    {
      provide: DRIZZLE_DATABASE,
      inject: [POSTGRES_CLIENT],
      useFactory: (client: ReturnType<typeof postgres>) => {
        return drizzle(client, { schema });
      },
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        // 白名單：只保留 DTO 中宣告的欄位，其餘一律剝除
        whitelist: true,
        // 遇到未宣告欄位直接回 400，避免多出來的欄位被隱帶處理
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
    StandaloneCoreModule,
  ],
  exports: [DRIZZLE_DATABASE, POSTGRES_CLIENT],
})
export class StandaloneCoreModule implements OnModuleInit {
  private readonly logger = new Logger('StandaloneCore');

  constructor(
    @Inject(POSTGRES_CLIENT)
    private readonly pgClient: ReturnType<typeof postgres>,
  ) {}

  async onModuleInit(): Promise<void> {
    const hasDbUrl = !!(
      process.env.DATABASE_URL || process.env.SUDA_DATABASE_URL
    );
    // 未設定資料庫時不應在啟動階段嘗試連線建表（postgres-js 連線重試退避會卡住開機）。
    // 連線保持惰性，僅在實際查詢時失敗（由全域例外過濾器轉 5xx）。
    if (!hasDbUrl) {
      this.logger.warn(
        '未設定 DATABASE_URL，略過自動建表；健康檢查、靜態資源與 SPA fallback 仍可正常服務。',
      );
      return;
    }
    const candidates = [
      join(process.cwd(), 'dist/server/database/init.sql'),
      join(process.cwd(), 'server/database/init.sql'),
    ];
    const sqlPath = candidates.find((p) => existsSync(p));
    if (!sqlPath) {
      this.logger.warn(
        'init.sql not found; skipping auto table creation. Expected at: ' +
          candidates.join(' or '),
      );
      return;
    }
    try {
      const sql = readFileSync(sqlPath, 'utf-8');
      await this.pgClient.unsafe(sql);
      this.logger.log('Database schema initialized (init.sql executed)');
    } catch (err) {
      // Tables/types may already exist; warn but do not crash startup
      this.logger.warn(
        `init.sql execution warning: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
