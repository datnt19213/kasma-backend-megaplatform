import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon extends MultiTenantEntity {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DiscountType, default: DiscountType.FIXED })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountValue: number;

  @Column({ name: 'min_order_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  minOrderValue: number;

  @Column({ name: 'max_discount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  maxDiscount: number;

  @Column({ name: 'usage_limit', type: 'integer', default: 0 })
  usageLimit: number;

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount: number;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
