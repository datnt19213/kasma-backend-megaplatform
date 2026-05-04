import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('user_learning_points')
@Index(['user_id', 'app_key', 'tenant_key'], { unique: true })
export class UserLearningPoint extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_earned_at: Date;
}
