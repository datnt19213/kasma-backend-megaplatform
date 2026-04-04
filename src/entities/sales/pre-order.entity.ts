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
import { User } from '../user.entity';

export enum PreOrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
}

@Entity('pre_orders')
export class PreOrder extends MultiTenantEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  @Column({ name: 'expected_release_date' })
  expectedReleaseDate: Date;

  @Column({ type: 'enum', enum: PreOrderStatus, default: PreOrderStatus.OPEN })
  status: PreOrderStatus;

  @Column({ name: 'is_paid_upfront', default: false })
  isPaidUpfront: boolean; // Flag to indicate full payment or reservation only

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  reservationFee: number;
}
