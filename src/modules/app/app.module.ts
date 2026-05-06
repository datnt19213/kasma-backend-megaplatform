import authConfig from '@/config/apps/auth.config';
import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { RegistryModule } from '@/modules/registry/registry.module';
import { BullModule } from '@nestjs/bullmq';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RegistryGuard } from '@/common/guards/registry.guard';
import { GatewayMiddleware } from '@/common/middlewares/gateway.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from '../mail/mail.module';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { BlogModule } from '../blog/blog.module';
import { MediaModule } from '../media/media.module';
import { LearningModule } from '../learning/learning.module';
import { IntegrationModule } from '../integration/integration.module';
import { LockModule } from '@/shared/lock/lock.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    LockModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [authConfig],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'mail-queue' },
      { name: 'sales-queue' },
      { name: 'marketing-queue' },
    ),
    AuthModule,
    UserModule,
    RegistryModule,
    MailModule,
    EcommerceModule,
    BlogModule,
    MediaModule,
    LearningModule,
    IntegrationModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 600, // 10 minutes default
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RegistryGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GatewayMiddleware).forRoutes('*');
  }
}
