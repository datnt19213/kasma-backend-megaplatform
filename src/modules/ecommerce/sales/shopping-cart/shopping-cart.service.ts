import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ShoppingCart } from '@/entities/mongo/shopping-cart.mongo-entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { AddToCartDto, UpdateCartItemDto } from '@/dto/sales-dto/sales.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCart, 'mongo')
    private readonly cartRepo: Repository<ShoppingCart>,
    @InjectRepository(Product, 'postgres')
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant, 'postgres')
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectQueue('marketing-queue') private readonly marketingQueue: Queue,
  ) {}

  async getCart(userId: string): Promise<ShoppingCart> {
    let cart = await this.cartRepo.findOne({ where: { user_id: userId } as any });
    if (!cart) {
      cart = this.cartRepo.create({ user_id: userId, items: [] });
      await this.cartRepo.save(cart);
    }
    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    let price = product.price;
    if (dto.variantId) {
      const variant = await this.variantRepo.findOne({ where: { id: dto.variantId } });
      if (!variant) throw new NotFoundException('Variant not found');
      price = variant.price;
    }

    const cart = await this.getCart(userId);
    const existingItem = cart.items.find(
      (item) => item.productId === dto.productId && item.variantId === dto.variantId
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
    } else {
      cart.items.push({
        productId: dto.productId,
        variantId: dto.variantId as string,
        quantity: dto.quantity,
        addedAt: new Date(),
        priceAtAddition: price,
      });
    }

    const savedCart = await this.cartRepo.save(cart);

    // Dispatch Abandoned Cart Notification Job (delayed by 1 hour)
    // In a real scenario, we'd remove previous pending jobs for this user
    await this.marketingQueue.add(
      'abandoned-cart-notification',
      { userId, items: cart.items },
      { delay: 3600000, jobId: `abandoned-cart-${userId}` } // 1 hour delay, unique per user
    );

    return savedCart;
  }

  async updateCartItem(userId: string, dto: UpdateCartItemDto) {
    const cart = await this.getCart(userId);
    const item = cart.items.find(
      (item) => item.productId === dto.productId && item.variantId === dto.variantId
    );

    if (!item) throw new NotFoundException('Item not found in cart');
    item.quantity = dto.quantity;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((i) => i !== item);
    }

    const savedCart = await this.cartRepo.save(cart);

    // Update/Reset Abandoned Cart Job
    await this.marketingQueue.add(
      'abandoned-cart-notification',
      { userId, items: cart.items },
      { delay: 3600000, jobId: `abandoned-cart-${userId}` }
    );

    return savedCart;
  }

  async removeFromCart(userId: string, productId: string, variantId?: string) {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    return this.cartRepo.save(cart);
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    cart.items = [];
    return this.cartRepo.save(cart);
  }

  async calculateTotals(userId: string) {
    const cart = await this.getCart(userId);
    const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * Number(item.priceAtAddition), 0);
    return {
      itemsCount: cart.items.length,
      subtotal,
      tax: subtotal * 0.1, // Example 10% tax
      total: subtotal * 1.1,
    };
  }
}
