import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class LockService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private redlock: Redlock;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisHost = this.configService.get('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get('REDIS_PORT', 6379);

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
    });

    this.redlock = new Redlock(
      [this.redisClient],
      {
        driftFactor: 0.01,
        retryCount: 10,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500,
      }
    );
  }

  async acquire(resource: string, ttl: number = 5000) {
    try {
      return await this.redlock.acquire([resource], ttl);
    } catch (err) {
      throw new Error(`Could not acquire lock for resource: ${resource}`);
    }
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }
}
