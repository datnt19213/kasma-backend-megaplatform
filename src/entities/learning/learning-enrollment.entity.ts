import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningCourse } from './learning-course.entity';

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('learning_enrollments')
export class LearningEnrollment extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column()
  course_id: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price_paid: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrolled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => LearningCourse)
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;
}
