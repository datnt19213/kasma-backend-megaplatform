import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningCourse } from './learning-course.entity';
import { LearningLesson } from './learning-lesson.entity';

@Entity('learning_chapters')
export class LearningChapter extends MultiTenantEntity {
  @Column()
  title: string;

  @Column({ default: 0 })
  order: number;

  @Column()
  course_id: string;

  @ManyToOne(() => LearningCourse, (course) => course.chapters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;

  @OneToMany(() => LearningLesson, (lesson) => lesson.chapter)
  lessons: LearningLesson[];
}
