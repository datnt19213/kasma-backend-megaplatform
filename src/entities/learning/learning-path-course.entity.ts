import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningPath } from './learning-path.entity';
import { LearningCourse } from './learning-course.entity';

@Entity('learning_path_courses')
export class LearningPathCourse extends MultiTenantEntity {
  @Column()
  path_id: string;

  @Column()
  course_id: string;

  @Column({ type: 'int', default: 0 })
  sequence_order: number;

  @ManyToOne(() => LearningPath)
  @JoinColumn({ name: 'path_id' })
  path: LearningPath;

  @ManyToOne(() => LearningCourse)
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;
}
