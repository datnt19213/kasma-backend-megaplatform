import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('shipping_zones')
export class ShippingZone extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ type: 'simple-array', nullable: true })
  regions: string[]; // List of states/cities/postcodes

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('shipping_methods')
export class ShippingMethod extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ name: 'zone_id' })
  zoneId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pricePerKg: number;

  @Column({ name: 'estimated_days', nullable: true })
  estimatedDays: string;
}
