import { UserProfile } from 'src/mongo-entities/user-profile.mongo-entity';

import { Role } from '@/entities/role.entity';
import { UserCredential } from '@/entities/user-credential.entity';
import { UserRole } from '@/entities/user-role.entity';
import { User } from '@/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserCredential,
      UserRole,
      Role,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      UserProfile,
    ], 'mongo'),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
