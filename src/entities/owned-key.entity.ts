import {
  Column,
  Entity,
  Index,
} from 'typeorm';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('OwnedKey')
@Index(['owned_key'], { unique: true })
export class OwnedKey extends MultiTenantEntity {

  @Column()
  owned_key: string;

  @Column({ default: true })
  is_active: boolean;
}
