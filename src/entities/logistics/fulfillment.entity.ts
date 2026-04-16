import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Order } from '../sales/order.entity';
import { Carrier } from './carrier.entity';

export enum FulfillmentStatus {
  PENDING = 'PENDING',
  PICKING = 'PICKING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

@Entity('fulfillments')
export class Fulfillment extends MultiTenantEntity {
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'carrier_id', nullable: true })
  carrierId: string;

  @ManyToOne(() => Carrier, { nullable: true })
  @JoinColumn({ name: 'carrier_id' })
  carrier: Carrier;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber: string;

  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.PENDING
  })
  status: FulfillmentStatus;

  @Column({ name: 'shipped_at', nullable: true })
  shippedAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;
}
