import cookieParser from 'cookie-parser';
import * as fs from 'fs';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NestFactory,
  PartialGraphHost,
} from '@nestjs/core';

import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isProd = configService.get('NODE_ENV') === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || !isProd) {
        return callback(null, true);
      }
      return callback(null, origin);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization, X-Tenant-Kasma-Id, X-App-Kasma-Id, X-Idempotency-Key',
    /* 
    Content-Type: type of content,
    Authorization: Auth token
    X-Tenant-Kasma-Id: the id of each tenant,
    X-App-Kasma-Id: the id of each app in each tenant,
    X-Idempotency-Key: the string uuid/string unique of each request to prevent duplicate requests
    */
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}


bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});
