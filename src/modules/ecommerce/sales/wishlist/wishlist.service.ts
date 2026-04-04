import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wishlist } from '@/entities/mongo/wishlist.mongo-entity';
import { Product } from '@/entities/ecommerce/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist, 'mongo')
    private readonly wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Product, 'postgres')
    private readonly productRepo: Repository<Product>,
  ) {}

  async getWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepo.findOne({ where: { user_id: userId } as any });
    if (!wishlist) {
      wishlist = this.wishlistRepo.create({ user_id: userId, products: [] });
      await this.wishlistRepo.save(wishlist);
    }
    return wishlist;
  }

  async addToWishlist(userId: string, productId: string, variantId?: string, note?: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const wishlist = await this.getWishlist(userId);
    const existing = wishlist.products.find(
      (p) => p.productId === productId && p.variantId === variantId
    );

    if (!existing) {
      wishlist.products.push({
        productId,
        variantId: variantId as string,
        note: note as string,
        addedAt: new Date(),
      });
    }

    return this.wishlistRepo.save(wishlist);
  }

  async removeFromWishlist(userId: string, productId: string, variantId?: string) {
    const wishlist = await this.getWishlist(userId);
    wishlist.products = wishlist.products.filter(
      (p) => !(p.productId === productId && p.variantId === variantId)
    );
    return this.wishlistRepo.save(wishlist);
  }
}
