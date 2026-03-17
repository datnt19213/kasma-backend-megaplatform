import { AuditAuthLog } from '@/entities/audit-auth-log.entity';
import { AuthSession } from '@/entities/auth-session.entity';
import { Otp } from '@/entities/otp.entity';
import { UserCredential } from '@/entities/user-credential.entity';
import { User } from '@/entities/user.entity';
import { UserProfile } from '@/entities/mongo/user-profile.mongo-entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserCredential, AuthSession, AuditAuthLog, Otp], 'postgres'),
    TypeOrmModule.forFeature([UserProfile], 'mongo'),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  exports: [AuthService, OtpService],
})
export class AuthModule { }
