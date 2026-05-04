import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('learning_scorm_packages')
export class LearningScormPackage extends MultiTenantEntity {
  @Column()
  course_id: string;

  @Column()
  lesson_id: string;

  @Column()
  title: string;

  @Column()
  entry_url: string; // The index.html path in storage

  @Column({ nullable: true })
  version: string; // e.g., SCORM 1.2, SCORM 2004

  @Column({ type: 'jsonb', nullable: true })
  manifest_data: any;

  @Column({ default: true })
  is_active: boolean;
}
