import {
  Column,
  Entity,
  Index,
  UpdateDateColumn,
} from 'typeorm';

import {
  UserStatus,
  UserType,
} from '@/config/apps';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('User')
@Index(['email'], { unique: true })
export class User extends MultiTenantEntity {

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  display_name: string;

  @Column({ type: 'enum', enum: UserType })
  user_type: UserType;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ default: false })
  is_locked: boolean;
}
