import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('blog_widgets')
export class BlogWidget extends MultiTenantEntity {
  @Column()
  title: string;

  @Column()
  type: string; // LATEST, POPULAR, CATEGORIES, TAG_CLOUD, CUSTOM_HTML

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // limit, show_thumbnails, etc.

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;
}
