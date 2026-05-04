import { Column, Entity } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('blog_shortlinks')
export class BlogShortlink extends MultiTenantEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  target_url: string;

  @Column({ default: 0 })
  clicks: number;
}
