import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('blog_tags')
export class BlogTag extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;
}
