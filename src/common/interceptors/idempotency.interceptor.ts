import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.path;

    // Only apply to POST write actions
    if (method !== 'POST' || !path.includes('/action')) {
      return next.handle();
    }

    const idempotencyKey = request.headers['x-idempotency-key'];
    if (!idempotencyKey) {
      throw new BadRequestException('X-Idempotency-Key header is required for write operations');
    }

    // Create hash of body to detect payload changes
    const bodyHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(request.body || {}))
      .digest('hex');

    const cacheKey = `idempotency:${idempotencyKey}`;
    const lockKey = `idempotency:lock:${idempotencyKey}`;

    // Try to acquire lock
    const lockAcquired = await (this.cacheManager as any).store.set(lockKey, '1', {
      ttl: 10,
      setIfNotExists: true,
    });

    if (!lockAcquired) {
      // Check cache
      const cached = await this.cacheManager.get<{ result: any; bodyHash: string }>(cacheKey);
      if (cached) {
        // If body changes → reject (safer)
        if (cached.bodyHash !== bodyHash) {
          throw new ConflictException(
            'Idempotency key reused with different payload. Please use a new key for different requests.',
          );
        }
        // Return cached result
        return from([cached.result]);
      }
      throw new ConflictException('Request is being processed. Please retry.');
    }

    // Proceed with request
    return next.handle().pipe(
      switchMap((data) => {
        return from(
          this.cacheManager
            .set(cacheKey, { result: data, bodyHash }, 86400)
            .then(async () => {
              await this.cacheManager.del(lockKey); // 🔓 unlock
              return data;
            })
            .catch(async () => {
              await this.cacheManager.del(lockKey);
              return data;
            }),
        );
      }),
      catchError(async (err) => {
        await this.cacheManager.del(lockKey); // 🔓 unlock on error
        return throwError(() => err);
      }),
    );
  }
}
