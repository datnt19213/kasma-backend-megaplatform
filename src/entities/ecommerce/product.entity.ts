import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { ProductCategory } from './product-category.entity';
import { ProductTag } from './product-tag.entity';

@Entity('products')
export class Product extends MultiTenantEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => ProductCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @ManyToMany(() => ProductTag)
  @JoinTable({
    name: 'product_tags_mapping',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: ProductTag[];
}
