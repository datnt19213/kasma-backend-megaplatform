import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('learning_progress')
@Index(['user_id', 'lesson_id'], { unique: true })
export class LearningProgress extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column()
  course_id: string;

  @Column()
  lesson_id: string;

  @Column({ type: 'int', default: 0 })
  last_position: number; // in seconds

  @Column({ default: false })
  is_completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
