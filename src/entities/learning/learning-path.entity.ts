import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('learning_paths')
export class LearningPath extends MultiTenantEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  target_skill: string;

  @Column({ type: 'boolean', default: false })
  is_published: boolean;
}
