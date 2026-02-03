import {
    createKeyv,
} from '@keyv/redis'; // hoặc import KeyvRedis from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager';
// src/database/database.module.ts
import { Module } from '@nestjs/common';
import {
    ConfigModule,
    ConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule, // để dùng ConfigService

        // PostgreSQL connection (named 'postgres')
        TypeOrmModule.forRootAsync({
            name: 'postgres',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('POSTGRES_DB_URL');
                if (!url) {
                    throw new Error('POSTGRES_DB_URL is missing in .env');
                }

                return {
                    name: 'postgres',
                    type: 'postgres' as const,
                    url,
                    entities: [__dirname + '/../**/*.postgres-entity{.ts,.js}'], // chỉ load entity Postgres
                    synchronize: configService.get<boolean>('POSTGRES_SYNCHRONIZE', true), // true dev, false prod
                    logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : false,
                };
            },
        }),

        // MongoDB connection (named 'mongo')
        TypeOrmModule.forRootAsync({
            name: 'mongo',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('MONGO_DB_URL');
                if (!url) {
                    throw new Error('MONGO_DB_URL is missing in .env');
                }

                return {
                    name: 'mongo',
                    type: 'mongodb' as const,
                    url,
                    entities: [__dirname + '/../**/*.mongo-entity{.ts,.js}'], // chỉ load entity Mongo
                    synchronize: configService.get<boolean>('MONGO_SYNCHRONIZE', true),
                    logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : false,
                    useUnifiedTopology: true,
                };
            },
        }),

        // Redis Cache (global cho toàn app)
        CacheModule.registerAsync({
            isGlobal: true, // inject CACHE_MANAGER mọi nơi
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_STORAGE_URL');
                if (!redisUrl) {
                    throw new Error('REDIS_STORAGE_URL is missing in .env');
                }

                return {
                    stores: [
                        createKeyv(redisUrl), // hỗ trợ redis://... (có password thì redis://:pass@host:port)
                    ],
                    ttl: 3600, // default 1 giờ (giây), bạn có thể config động nếu cần
                };
            },
        }),
    ],
    exports: [TypeOrmModule, CacheModule], // export để các module khác dùng forFeature và cache
})
export class DatabaseModule { }