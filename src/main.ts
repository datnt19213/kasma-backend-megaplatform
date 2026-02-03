import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isProd = configService.get('NODE_ENV') === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || !isProd) {
        // Dev hoặc non-browser (Postman, curl, mobile native): allow all
        return callback(null, true);
      }

      // Prod: echo origin (dynamic allow all known/unknown origins)
      // → echo origin to browser allow
      callback(null, origin); // echo origin of request

      // Alternative strict: Just echo if origin matches pattern (ex: *.yourdomain.com)
      // const allowedPattern = /\.kasma\.vn$/; // or regex for subdomains
      // if (allowedPattern.test(origin)) {
      //   callback(null, origin);
      // } else {
      //   callback(new Error('Not allowed by CORS'));
      // }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: 'Content-Type, Authorization, X-Tenant-Kasma-Id, X-App-Kasma-Id, X-Idempotency-Key',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

bootstrap();