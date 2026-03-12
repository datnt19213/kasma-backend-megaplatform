import {
  Column,
  Entity,
} from 'typeorm';
import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('UserRole')
export class UserRole extends MultiTenantEntity {

    @Column('uuid')
    role_id: string;
}
