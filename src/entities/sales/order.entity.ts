import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { User } from '../user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order extends MultiTenantEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'payment_status', default: 'unpaid' })
  paymentStatus: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: any;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: any;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber: string;

  @Column({ name: 'parent_order_id', nullable: true })
  parentOrderId: string; // Used for order splitting

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
