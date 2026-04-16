import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum POStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

@Entity('purchase_orders')
export class PurchaseOrder extends MultiTenantEntity {
  @Column({ unique: true })
  poNumber: string;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: string;

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT
  })
  status: POStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'expected_at', nullable: true })
  expectedAt: Date;

  @Column({ name: 'received_at', nullable: true })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
