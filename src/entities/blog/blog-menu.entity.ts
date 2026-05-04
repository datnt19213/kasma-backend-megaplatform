import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('blog_menus')
export class BlogMenu extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 'HEADER' })
  location: string; // HEADER, FOOTER, SIDEBAR

  @Column({ type: 'jsonb', default: [] })
  items: any[]; // Nested menu items: [{ label, url, children: [] }]
}
