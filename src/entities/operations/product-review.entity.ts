import { Entity, Column, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { Product } from '../ecommerce/product.entity';
import { User } from '../user.entity';

@Entity('product_reviews')
export class ProductReview extends MultiTenantEntity {
  @Column()
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ default: true })
  isVisible: boolean;
}
