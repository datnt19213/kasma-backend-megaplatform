import type { Cache } from 'cache-manager';
import * as jwt from 'jsonwebtoken';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) { }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // Get access token from cookies
    const token = req.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    // Get JWT from Redis using opaque token
    const jwtToken = await this.cacheManager.get<string>(`auth:token:${token}`);
    if (!jwtToken) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // Verify JWT
    try {
      const secret = this.configService.get<string>('auth.jwtSecret') || process.env.JWT_SECRET || 'gdTzoE4Ybram1gI5bI20laJkYZLgQSBBTOMb4OIWqvqvnkTLyf';
      const payload = jwt.verify(jwtToken, secret);
      req.user = payload;
      return true;
    } catch (e) {
      // Don't delete the token mapping here! 
      // We need it to stay in Redis so the user can still use the refresh token.
      throw new UnauthorizedException('Token expired');
    }
  }
}
