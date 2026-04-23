import { Entity, Column, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Order } from '../sales/order.entity';

export enum RMARequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
  COMPLETED = 'COMPLETED',
}

@Entity('return_requests')
export class ReturnRequest extends MultiTenantEntity {
  @Column()
  orderId: string;

  @ManyToOne(() => Order)
  order: Order;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: RMARequestStatus,
    default: RMARequestStatus.PENDING,
  })
  status: RMARequestStatus;

  @Column({ type: 'jsonb', nullable: true })
  items: any[]; // List of items being returned and their quantities

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;
}
