import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export class WishlistItem {
  @Column()
  productId: string;

  @Column({ nullable: true })
  variantId: string;

  @Column({ nullable: true })
  note: string;

  @Column({ name: 'added_at' })
  addedAt: Date;
}

@Entity('Wishlist')
export class Wishlist {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  user_id: string;

  @Column(() => WishlistItem)
  products: WishlistItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
