import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './shopping-cart.mongo-entity';

export enum AbandonedCartStatus {
  PENDING = 'pending',
  RECOVERED = 'recovered',
  EXPIRED = 'expired',
}

@Entity('AbandonedCart')
export class AbandonedCart {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  user_id: string;

  @Column(() => CartItem)
  items: CartItem[];

  @Column({ type: 'enum', enum: AbandonedCartStatus, default: AbandonedCartStatus.PENDING })
  status: AbandonedCartStatus;

  @Column({ name: 'last_activity' })
  lastActivity: Date;

  @Column({ name: 'email_sent_count', default: 0 })
  emailSentCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
