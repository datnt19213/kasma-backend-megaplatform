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

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum BillingInterval {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscriptions')
export class Subscription extends MultiTenantEntity {
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

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: 'enum', enum: BillingInterval, default: BillingInterval.MONTHLY })
  interval: BillingInterval;

  @Column({ name: 'next_billing_date' })
  nextBillingDate: Date;

  @Column({ name: 'last_billing_date', nullable: true })
  lastBillingDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
