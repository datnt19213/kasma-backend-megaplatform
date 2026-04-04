import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Product } from '@/entities/ecommerce/product.entity';

@Entity('product_variants')
export class ProductVariant extends MultiTenantEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  name: string; // e.g., "Red / 64GB"

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>; // { color: "Red", storage: "64GB" }

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'warehouse_id', nullable: true })
  warehouseId: string; // Linked to a warehouse or supplier for splitting logic
}
