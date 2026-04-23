import { Entity, Column } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('currencies')
export class Currency extends MultiTenantEntity {
  @Column({ unique: true, length: 10 })
  code: string; // e.g., "USD", "VND"

  @Column()
  symbol: string; // e.g., "$", "₫"

  @Column({ default: 2 })
  decimalPlaces: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 1 })
  exchangeRateToBase: number; // Rate relative to base currency

  @Column({ default: false })
  isBase: boolean;

  @Column({ default: true })
  isActive: boolean;
}
