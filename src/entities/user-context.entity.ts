import {
  Column,
  Entity,
} from 'typeorm';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('UserContext')
export class UserContext extends MultiTenantEntity {

  @Column('uuid')
  user_id: string;

  @Column()
  owned_key: string;
}
