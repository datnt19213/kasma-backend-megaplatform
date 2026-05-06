import { Column, Entity, OneToMany } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningChapter } from './learning-chapter.entity';

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

@Entity('learning_courses')
export class LearningCourse extends MultiTenantEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  thumbnail_provider: string; // KEDIA or CLOUDINARY

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  instructor_id: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @OneToMany(() => LearningChapter, (chapter) => chapter.course)
  chapters: LearningChapter[];

  @Column({ default: false })
  is_strict_order: boolean;
}
