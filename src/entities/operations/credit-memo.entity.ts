import { Entity, Column, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Order } from '../sales/order.entity';

@Entity('credit_memos')
export class CreditMemo extends MultiTenantEntity {
  @Column()
  orderId: string;

  @ManyToOne(() => Order)
  order: Order;

  @Column({ unique: true })
  memoNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ nullable: true })
  transactionId: string; // Reference to the original transaction in microservice

  @Column({ nullable: true })
  refundMethod: 'STORE_CREDIT' | 'ORIGINAL_GATEWAY' | 'MANUAL';

  @Column({ type: 'text', nullable: true })
  reason: string;
}
