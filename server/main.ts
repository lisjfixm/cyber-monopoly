import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { __express as hbsExpressEngine } from 'hbs';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: process.env.NODE_ENV !== 'development',
  });

  // CORS
  app.enableCors();

  // Body parsers (10mb limit for JSON / urlencoded)
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, forbidUnknownValues: true }));

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

bootstrap();
