import {
  Column,
  Entity,
  Index,
} from 'typeorm';
import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('Role')
@Index(['role_key'], { unique: true })
export class Role extends MultiTenantEntity {

    @Column({ length: 100 })
    code: string; // ADMIN, KADMIN, MANAGER

    @Column({ name: 'role_key' })
  role_key: string;

  @Column({ name: 'display_name' })
  display_name: string;
}
