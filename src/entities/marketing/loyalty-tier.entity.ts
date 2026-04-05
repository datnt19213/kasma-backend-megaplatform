import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('loyalty_tiers')
export class LoyaltyTier extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'min_points', type: 'integer', default: 0 })
  minPoints: number;

  @Column({ type: 'jsonb', nullable: true })
  benefits: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
