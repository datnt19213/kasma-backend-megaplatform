import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Product } from '../ecommerce/product.entity';
import { ProductVariant } from '../ecommerce/product-variant.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends MultiTenantEntity {
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', nullable: true })
  variantId: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subTotal: number;

  @Column({ name: 'warehouse_id', nullable: true })
  warehouseId: string; // Captured at time of order for splitting
}
