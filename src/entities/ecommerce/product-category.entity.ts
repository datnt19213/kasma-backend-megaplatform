import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('product_categories')
export class ProductCategory extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => ProductCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: ProductCategory;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children: ProductCategory[];
}
