import { Entity, Column, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Vendor } from './vendor.entity';

@Entity('vendor_revenues')
export class VendorRevenue extends MultiTenantEntity {
  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor)
  vendor: Vendor;

  @Column()
  orderId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  commissionAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ default: false })
  isSettled: boolean; // Whether it has been included in a PayoutRequest
}
