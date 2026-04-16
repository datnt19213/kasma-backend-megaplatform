import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('carriers')
export class Carrier extends MultiTenantEntity {
  @Column()
  name: string; // GHTK, GHN, Viettel Post, DHL

  @Column({ unique: true })
  code: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;
}
