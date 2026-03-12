import {
  Column,
  Entity,
  Index,
} from 'typeorm';
import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('Permission')
@Index(['permission_key'], { unique: true })
export class Permission extends MultiTenantEntity {
    @Column({ name: 'permission_key', length: 150 })
    permission_key: string; // user.create, app.delete

    @Column({ length: 255 })
    description: string;
}
