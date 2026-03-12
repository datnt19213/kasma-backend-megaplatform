import {
  Column,
  Entity,
} from 'typeorm';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('UserTenantKey')
export class UserTenantKey extends MultiTenantEntity {

  @Column('uuid')
  user_id: string;
}
