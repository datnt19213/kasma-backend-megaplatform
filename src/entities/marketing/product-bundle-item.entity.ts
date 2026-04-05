import { Column, Entity, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { ProductBundle } from '@/entities/marketing/product-bundle.entity';
import { Product } from '../ecommerce/product.entity';
import { ProductVariant } from '../ecommerce/product-variant.entity';

@Entity('product_bundle_items')
export class ProductBundleItem extends MultiTenantEntity {
  @Column({ name: 'bundle_id' })
  bundleId: string;

  @ManyToOne(() => ProductBundle, (bundle) => bundle.items)
  bundle: ProductBundle;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ name: 'variant_id', nullable: true })
  variantId: string;

  @ManyToOne(() => ProductVariant, { nullable: true })
  variant: ProductVariant;

  @Column({ type: 'integer', default: 1 })
  quantity: number;
}
