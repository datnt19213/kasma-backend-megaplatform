import { Entity, Column, OneToMany } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Product } from '../ecommerce/product.entity';

@Entity('vendors')
export class Vendor extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defaultCommissionRate: number; // e.g., 10.00 for 10%

  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];
}
