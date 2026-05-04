import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { LearningCourse } from './learning-course.entity';

export enum LiveProvider {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  JITSI = 'JITSI',
}

@Entity('learning_live_sessions')
export class LearningLiveSession extends MultiTenantEntity {
  @Column()
  course_id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LiveProvider,
    default: LiveProvider.ZOOM,
  })
  provider: LiveProvider;

  @Column()
  meeting_link: string;

  @Column({ type: 'timestamp' })
  start_at: Date;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @ManyToOne(() => LearningCourse)
  @JoinColumn({ name: 'course_id' })
  course: LearningCourse;
}
