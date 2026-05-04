import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningAssessment } from './learning-assessment.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  GRADED = 'GRADED',
}

@Entity('learning_attempts')
export class LearningAttempt extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column()
  assessment_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @ManyToOne(() => LearningAssessment)
  @JoinColumn({ name: 'assessment_id' })
  assessment: LearningAssessment;
}
