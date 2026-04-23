import { Entity, Column } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('commission_rules')
export class CommissionRule extends MultiTenantEntity {
  @Column({ nullable: true })
  vendorId: string; // Specific vendor or null for global/category rule

  @Column({ nullable: true })
  categoryId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number; // e.g., 5.00 for 5%

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fixedFee: number;

  @Column({ default: true })
  isActive: boolean;
}
