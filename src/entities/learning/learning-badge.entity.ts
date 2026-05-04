import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('learning_badges')
export class LearningBadge extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon_url: string;

  @Column({ type: 'json', nullable: true })
  criteria: any; // e.g. { type: 'course_completed', count: 1 }
}
