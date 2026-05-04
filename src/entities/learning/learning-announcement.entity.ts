import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningCourse } from './learning-course.entity';

@Entity('learning_announcements')
export class LearningAnnouncement extends MultiTenantEntity {
  @Column()
  course_id: string;

  @Column()
  instructor_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @ManyToOne(() => LearningCourse)
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;
}
