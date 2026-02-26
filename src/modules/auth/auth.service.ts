import * as bcrypt from 'bcrypt';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { UserProfile } from 'src/mongo-entities/user-profile.mongo-entity';
import {
  DeepPartial,
  Repository,
} from 'typeorm';

import {
  UserStatus,
  UserType,
} from '@/config/apps';
import {
  LoginDto,
  RegisterDto,
} from '@/dto/auth.dto';
import { AuditAuthLog } from '@/entities/audit-auth-log.entity';
import { AuthSession } from '@/entities/auth-session.entity';
import { UserCredential } from '@/entities/user-credential.entity';
import { User } from '@/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

interface JwtPayload {
  sub: string;
  email: string;
  user_type: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User, 'postgres')
    private userRepository: Repository<User>,
    @InjectRepository(UserCredential, 'postgres')
    private credentialRepository: Repository<UserCredential>,
    @InjectRepository(AuthSession, 'postgres')
    private sessionRepository: Repository<AuthSession>,
    @InjectRepository(AuditAuthLog, 'postgres')
    private auditRepository: Repository<AuditAuthLog>,
    @InjectRepository(UserProfile, 'mongo')
    private userProfileRepository: Repository<UserProfile>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) { }

  private generateOpaqueToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private createJwtToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      user_type: user.user_type,
    };
    const secret = this.configService.get<string>('auth.jwtSecret') || process.env.JWT_SECRET || 'default-secret';
    const expiresIn = this.configService.get<string>('auth.jwtExpiresIn') || '15m';
    return jwt.sign(payload as jwt.JwtPayload, secret, { expiresIn } as jwt.SignOptions);
  }

  private async storeTokenMapping(
    opaqueToken: string,
    jwtToken: string,
    userId: string,
    expiresAt: Date,
  ): Promise<void> {
    const key = `auth:token:${opaqueToken}`;
    // Store mapping for 7 days (matching refresh token lifespan)
    await this.cacheManager.set(key, jwtToken, 86400 * 7);
  }

  private async getTokenFromOpaque(opaqueToken: string): Promise<string | null> {
    const key = `auth:token:${opaqueToken}`;
    return (await this.cacheManager.get(key)) as string | null;
  }

  private async deleteTokenMapping(opaqueToken: string): Promise<void> {
    const key = `auth:token:${opaqueToken}`;
    await this.cacheManager.del(key);
  }

  private async createAuthSession(
    userId: string,
    accessToken: string,
    refreshToken: string,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<AuthSession> {
    const session = this.sessionRepository.create({
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      ip_address: ipAddress,
      expires_at: expiresAt,
    } as DeepPartial<AuthSession>);
    return this.sessionRepository.save(session as AuthSession);
  }

  private async logAuthAction(
    userId: string | null,
    action: string,
    target: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const log = this.auditRepository.create({
      user_id: userId,
      action,
      target,
      metadata: metadata ? JSON.stringify(metadata) : null,
    } as DeepPartial<AuditAuthLog>);
    await this.auditRepository.save(log as AuditAuthLog);
  }

  async login(dto: LoginDto, ipAddress: string): Promise<{
    user: { id: string; email: string; display_name: string | null; user_type: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.identifier } as any,
    });

    if (!user) {
      await this.logAuthAction(null, 'LOGIN_FAILED', `user:${dto.identifier}`, { reason: 'user_not_found' });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE || user.is_locked) {
      await this.logAuthAction(user.id, 'LOGIN_FAILED', `user:${user.id}`, { reason: 'account_inactive_or_locked' });
      throw new UnauthorizedException('Account is inactive or locked');
    }

    const credential = await this.credentialRepository.findOne({
      where: { user_id: user.id, provider: 'local', is_active: true } as any,
    });

    if (!credential || !(await this.comparePassword(dto.password, credential.password))) {
      await this.logAuthAction(user.id, 'LOGIN_FAILED', `user:${user.id}`, { reason: 'invalid_password' });
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtToken = this.createJwtToken(user);
    const accessToken = this.generateOpaqueToken();
    const refreshToken = this.generateOpaqueToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.storeTokenMapping(accessToken, jwtToken, user.id, expiresAt);
    await this.storeTokenMapping(refreshToken, jwtToken, user.id, expiresAt);
    await this.createAuthSession(user.id, accessToken, refreshToken, ipAddress, expiresAt);
    await this.logAuthAction(user.id, 'LOGIN_SUCCESS', `user:${user.id}`, { ip: ipAddress });

    return {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        user_type: user.user_type,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto, ipAddress: string): Promise<{
    user: { id: string; email: string; display_name: string | null; user_type: string };
    accessToken?: string;
    refreshToken?: string;
  }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email } as any,
    });

    if (existingUser) {
      await this.logAuthAction(null, 'REGISTER_FAILED', `email:${dto.email}`, { reason: 'email_exists' });
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create({
      email: dto.email,
      display_name: dto.display_name || null,
      user_type: UserType.GENERAL_0,
      status: UserStatus.ACTIVE,
      is_locked: false,
    } as DeepPartial<User>);

    const savedUser = await this.userRepository.save(user as User);

    // Also create UserProfile in MongoDB
    const profile = this.userProfileRepository.create({
      user_id: savedUser.id,
    });
    await this.userProfileRepository.save(profile);

    const hashedPassword = await this.hashPassword(dto.password);
    const credential = this.credentialRepository.create({
      user_id: savedUser.id,
      password: hashedPassword,
      provider: 'local',
      is_active: true,
    } as DeepPartial<UserCredential>);
    await this.credentialRepository.save(credential as UserCredential);

    await this.logAuthAction(savedUser.id, 'REGISTER_SUCCESS', `user:${savedUser.id}`, { ip: ipAddress });

    if (dto.is_login_after_registration_success) {
      const jwtToken = this.createJwtToken(savedUser);
      const accessToken = this.generateOpaqueToken();
      const refreshToken = this.generateOpaqueToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.storeTokenMapping(accessToken, jwtToken, savedUser.id, expiresAt);
      await this.storeTokenMapping(refreshToken, jwtToken, savedUser.id, expiresAt);
      await this.createAuthSession(savedUser.id, accessToken, refreshToken, ipAddress, expiresAt);

      await this.logAuthAction(savedUser.id, 'LOGIN_SUCCESS', `user:${savedUser.id}`, {
        ip: ipAddress,
        source: 'auto_login_after_registration',
      });

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          display_name: savedUser.display_name,
          user_type: savedUser.user_type,
        },
        accessToken,
        refreshToken,
      };
    }

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        display_name: savedUser.display_name,
        user_type: savedUser.user_type,
      },
    };
  }

  async refreshTokens(refreshToken: string, ipAddress: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwtToken = await this.getTokenFromOpaque(refreshToken);
    if (!jwtToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    let payload: JwtPayload;
    try {
      const secret = this.configService.get<string>('auth.jwtSecret') || process.env.JWT_SECRET || 'gdTzoE4Ybram1gI5bI20laJkYZLgQSBBTOMb4OIWqvqvnkTLyf';
      // Add ignoreExpiration: true so we can refresh even if the 15m JWT has expired
      payload = jwt.verify(jwtToken, secret, { ignoreExpiration: true }) as JwtPayload;
    } catch (e) {
      await this.deleteTokenMapping(refreshToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({ where: { id: payload.sub } as any });
    if (!user || user.status !== UserStatus.ACTIVE || user.is_locked) {
      await this.deleteTokenMapping(refreshToken);
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.deleteTokenMapping(refreshToken);

    const newJwtToken = this.createJwtToken(user);
    const newAccessToken = this.generateOpaqueToken();
    const newRefreshToken = this.generateOpaqueToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.storeTokenMapping(newAccessToken, newJwtToken, user.id, expiresAt);
    await this.storeTokenMapping(newRefreshToken, newJwtToken, user.id, expiresAt);
    await this.createAuthSession(user.id, newAccessToken, newRefreshToken, ipAddress, expiresAt);
    await this.logAuthAction(user.id, 'TOKEN_REFRESH', `user:${user.id}`, { ip: ipAddress });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(accessToken: string, refreshToken: string, userId: string): Promise<void> {
    await this.deleteTokenMapping(accessToken);
    await this.deleteTokenMapping(refreshToken);
    await this.sessionRepository.delete({ user_id: userId, access_token: accessToken } as any);
    await this.logAuthAction(userId, 'LOGOUT', `user:${userId}`);
  }

  async logoutAll(userId: string): Promise<void> {
    const sessions = await this.sessionRepository.find({ where: { user_id: userId } as any });
    for (const session of sessions) {
      await this.deleteTokenMapping(session.access_token);
      await this.deleteTokenMapping(session.refresh_token);
    }
    await this.sessionRepository.delete({ user_id: userId } as any);
    await this.logAuthAction(userId, 'LOGOUT_ALL', `user:${userId}`);
  }

  async getJwtFromAccessToken(accessToken: string): Promise<string | null> {
    return this.getTokenFromOpaque(accessToken);
  }

  async validateJwtToken(jwtToken: string): Promise<JwtPayload | null> {
    try {
      const secret = this.configService.get<string>('auth.jwtSecret') || process.env.JWT_SECRET || 'default-secret';
      return jwt.verify(jwtToken, secret) as JwtPayload;
    } catch (e) {
      return null;
    }
  }

  async getLoginLogs(filters: {
    page: number;
    limit: number;
    user_id?: string;
    action?: string;
  }): Promise<{
    data: AuditAuthLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, user_id, action } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (action) where.action = action;

    const [data, total] = await this.auditRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
