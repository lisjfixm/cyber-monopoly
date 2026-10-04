import type { Config } from 'drizzle-kit';

export default {
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.SUDA_DATABASE_URL || '',
  },
} satisfies Config;
