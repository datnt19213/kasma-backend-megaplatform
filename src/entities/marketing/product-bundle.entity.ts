import { Column, Entity, OneToMany } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { ProductBundleItem } from '@/entities/marketing/product-bundle-item.entity';

@Entity('product_bundles')
export class ProductBundle extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductBundleItem, (item) => item.bundle)
  items: ProductBundleItem[];
}
