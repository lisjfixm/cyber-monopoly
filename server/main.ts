import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { __express as hbsExpressEngine } from 'hbs';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // 生產環境啟動失敗時讓進程退出（由容器/編排層重啟）；開發環境保留完整錯誤輸出
    abortOnError: process.env.NODE_ENV !== 'development',
  });

  // CORS：預設開放（獨立部署、H5 直連場景）；若設定 CORS_ORIGIN 則收斂為白名單
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors(
    corsOrigin
      ? {
          origin: corsOrigin.split(',').map((o) => o.trim()).filter(Boolean),
          credentials: true,
        }
      : { origin: true, credentials: true },
  );

  // Body parsers (10mb limit for JSON / urlencoded)
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });

  // 全域 ValidationPipe 已在 StandaloneCoreModule 以 APP_PIPE 註冊
  // （含 whitelist + forbidNonWhitelisted），此處不再重複註冊。

  // Static assets from built client (dist/client)
  const clientDist = join(process.cwd(), 'dist/client');
  app.useStaticAssets(clientDist, { prefix: '/' });

  // hbs view engine for SPA fallback (renders index.html)
  app.setBaseViewsDir(clientDist);
  app.setViewEngine('html');
  app.engine('html', hbsExpressEngine);

  const logger = new Logger('Bootstrap');
  const host = process.env.SERVER_HOST || '0.0.0.0';
  const port = Number(process.env.SERVER_PORT || '3000');

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`API endpoints ready at http://${host}:${port}/api`);
}

bootstrap().catch((err) => {
  // 啟動階段未被 Nest 接住的例外（如監聽失敗）至少印出結構化錯誤，避免進程靜默退出
  // eslint-disable-next-line no-console
  console.error('伺服器啟動失敗:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
