import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('blog_categories')
export class BlogCategory extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => BlogCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: BlogCategory;

  @OneToMany(() => BlogCategory, (category) => category.parent)
  children: BlogCategory[];
}
