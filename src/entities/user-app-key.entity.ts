import {
  Column,
  Entity,
} from 'typeorm';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('UserAppKey')
export class UserAppKey extends MultiTenantEntity {

  @Column('uuid')
  user_id: string;
}
