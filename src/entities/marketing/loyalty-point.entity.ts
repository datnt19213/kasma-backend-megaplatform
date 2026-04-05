import { Column, Entity, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { User } from '../user.entity';

export enum LoyaltyTxType {
  EARN = 'earn',
  REDEEM = 'redeem',
  EXPIRE = 'expire',
}

@Entity('loyalty_points')
export class LoyaltyPoint extends MultiTenantEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'integer', default: 0 })
  points: number;

  @Column({ type: 'enum', enum: LoyaltyTxType, default: LoyaltyTxType.EARN })
  transactionType: LoyaltyTxType;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string; // e.g. orderId

  @Column({ type: 'text', nullable: true })
  note: string;
}
