import {
  Column,
  Entity,
  Index,
} from 'typeorm';
import { MultiTenantEntity } from './base/multi-tenant.entity';

@Entity('App')
@Index(['app_key'], { unique: true })
export class App extends MultiTenantEntity {

    @Column()
    name: string;

    @Column({ default: true })
    is_active: boolean;
}
