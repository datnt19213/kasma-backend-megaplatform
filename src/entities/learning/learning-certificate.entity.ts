import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningCourse } from './learning-course.entity';

@Entity('learning_certificates')
export class LearningCertificate extends MultiTenantEntity {
  @Column()
  user_id: string;

  @Column()
  course_id: string;

  @Column({ unique: true })
  @Index()
  verification_code: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_provider: string; // KEDIA or CLOUDINARY

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issued_at: Date;

  @ManyToOne(() => LearningCourse)
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;
}
