import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningCourse } from './learning-course.entity';
import { LearningLesson } from './learning-lesson.entity';

export enum AssessmentType {
  QUIZ = 'QUIZ',
  EXAM = 'EXAM',
  ASSIGNMENT = 'ASSIGNMENT',
}

@Entity('learning_assessments')
export class LearningAssessment extends MultiTenantEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.QUIZ,
  })
  type: AssessmentType;

  @Column({ type: 'int', default: 0 })
  duration: number; // in minutes (0 for no limit)

  @Column({ type: 'int', default: 0 })
  passing_score: number;

  @Column({ type: 'int', default: 1 })
  max_attempts: number;

  @Column()
  course_id: string;

  @Column({ nullable: true })
  lesson_id: string;

  @ManyToOne(() => LearningCourse)
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;

  @ManyToOne(() => LearningLesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: LearningLesson;
}
