import { Entity, Column, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('store_credits')
export class StoreCredit extends MultiTenantEntity {
  @Column()
  @Index()
  userId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 10, default: 'VND' })
  currencyCode: string;

  @Column({ default: true })
  isActive: boolean;
}
