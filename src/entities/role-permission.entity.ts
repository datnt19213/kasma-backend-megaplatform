import {
  Column,
  Entity,
} from 'typeorm';
import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('RolePermission')
export class RolePermission extends MultiTenantEntity {

    @Column('uuid')
    permission_id: string;
}
