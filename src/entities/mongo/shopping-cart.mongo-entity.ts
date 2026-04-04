import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CartItem {
  @Column()
  productId: string;

  @Column({ nullable: true })
  variantId: string;

  @Column()
  quantity: number;

  @Column({ name: 'added_at' })
  addedAt: Date;

  @Column({ name: 'price_at_addition', type: 'decimal' })
  priceAtAddition: number;
}

@Entity('ShoppingCart')
export class ShoppingCart {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  user_id: string;

  @Column(() => CartItem)
  items: CartItem[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
