import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { Vendor } from '@/entities/marketplace/vendor.entity';

@Entity('products')
export class Product extends MultiTenantEntity {
  @Column({ name: 'vendor_id', nullable: true })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.products, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salePrice: number;

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

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];
}
