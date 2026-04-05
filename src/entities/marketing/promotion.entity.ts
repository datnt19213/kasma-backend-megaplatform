import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum PromotionType {
  DISCOUNT = 'discount',
  B1G1 = 'b1g1',
  FLASH_SALE = 'flash_sale',
}

@Entity('promotions')
export class Promotion extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PromotionType, default: PromotionType.DISCOUNT })
  type: PromotionType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  value: number;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
