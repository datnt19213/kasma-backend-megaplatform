import {
  Column,
  Entity,
  Index,
} from 'typeorm';

import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('Tenant')
@Index(['tenant_key'], { unique: true })
export class Tenant extends MultiTenantEntity {

  @Column()
  name: string;

  @Column({ default: true })
  is_active: boolean;
}
