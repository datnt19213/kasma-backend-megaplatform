import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningChapter } from './learning-chapter.entity';

@Entity('learning_lessons')
export class LearningLesson extends MultiTenantEntity {
  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 0 })
  drip_days: number;

  @Column({ default: false })
  is_preview: boolean;

  @Column()
  chapter_id: string;

  @ManyToOne(() => LearningChapter, (chapter) => chapter.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter: LearningChapter;
}
