import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';

export enum FinanceTransactionType {
  CREDIT_RELOAD = 'CREDIT_RELOAD',
  CREDIT_PAYMENT = 'CREDIT_PAYMENT',
  GIFT_CARD_REDEEM = 'GIFT_CARD_REDEEM',
  REFUND_TO_WALLET = 'REFUND_TO_WALLET',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('FinanceTransaction')
export class FinanceTransaction {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: FinanceTransactionType,
  })
  type: FinanceTransactionType;

  @Column({ type: 'decimal' })
  amount: number; // Positive for credit, negative for debit

  @Column()
  currencyCode: string;

  @Column({ nullable: true })
  referenceId: string; // e.g., Order ID, Gift Card ID

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
