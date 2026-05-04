import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('blog_redirects')
export class BlogRedirect extends MultiTenantEntity {
  @Column()
  old_slug: string;

  @Column()
  new_slug: string;

  @Column({ default: '301' })
  redirect_type: string; // 301 or 302

  @Column({ nullable: true })
  article_id: string;
}
