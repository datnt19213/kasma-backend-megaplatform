import { UserProfile } from 'src/mongo-entities/user-profile.mongo-entity';

import { AuditAuthLog } from '@/entities/audit-auth-log.entity';
import { AuthSession } from '@/entities/auth-session.entity';
import { UserCredential } from '@/entities/user-credential.entity';
import { User } from '@/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserCredential,
      AuthSession,
      AuditAuthLog,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      UserProfile,
    ], 'mongo'),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule { }


