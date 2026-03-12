import {
  Column,
  Entity,
} from 'typeorm';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('UserOwnedKey')
export class UserOwnedKey extends MultiTenantEntity {

  @Column('uuid')
  user_id: string;

  @Column()
  owned_key: string;
}
