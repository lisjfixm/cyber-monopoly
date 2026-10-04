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
          throw new Error(
            'DATABASE_URL (or SUDA_DATABASE_URL) environment variable is not set',
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
      useValue: new ValidationPipe({ transform: true, forbidUnknownValues: true }),
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
