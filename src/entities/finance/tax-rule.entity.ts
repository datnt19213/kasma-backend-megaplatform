import { Entity, Column } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('tax_rules')
export class TaxRule extends MultiTenantEntity {
  @Column()
  name: string; // e.g., "VAT", "Sales Tax"

  @Column({ nullable: true })
  country: string; // ISO code, e.g., "VN"

  @Column({ nullable: true })
  region: string; // e.g., "Hanoi", "CA"

  @Column({ nullable: true })
  zipCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number; // e.g., 10.00 for 10%

  @Column({ default: true })
  isActive: boolean;
}
