import { Entity, Column, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Vendor } from './vendor.entity';

export enum PayoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

@Entity('payout_requests')
export class PayoutRequest extends MultiTenantEntity {
  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor)
  vendor: Vendor;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({ type: 'jsonb', nullable: true })
  destinationInfo: any; // Bank account or PayPal email

  @Column({ nullable: true })
  transactionReference: string; // From microservice

  @Column({ type: 'text', nullable: true })
  adminNotes: string;
}
