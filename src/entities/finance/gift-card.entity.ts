import { Entity, Column, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum GiftCardStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REDEEMED = 'REDEEMED',
  DISABLED = 'DISABLED',
}

@Entity('gift_cards')
export class GiftCard extends MultiTenantEntity {
  @Column({ unique: true })
  @Index()
  code: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  currentAmount: number;

  @Column({ length: 10, default: 'VND' })
  currencyCode: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: GiftCardStatus,
    default: GiftCardStatus.ACTIVE,
  })
  status: GiftCardStatus;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ nullable: true })
  message: string;
}
