import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningBadge } from './learning-badge.entity';

@Entity('user_badges')
export class UserBadge extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column()
  badge_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  awarded_at: Date;

  @ManyToOne(() => LearningBadge)
  @JoinColumn({ name: 'badge_id' })
  badge: LearningBadge;
}
