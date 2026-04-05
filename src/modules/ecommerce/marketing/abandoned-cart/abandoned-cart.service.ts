import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AbandonedCart, AbandonedCartStatus } from '@/entities/mongo/abandoned-cart.mongo-entity';
import { ShoppingCart } from '@/entities/mongo/shopping-cart.mongo-entity';

@Injectable()
export class AbandonedCartService {
  constructor(
    @InjectRepository(AbandonedCart, 'mongo')
    private readonly abandonedRepo: Repository<AbandonedCart>,
    @InjectRepository(ShoppingCart, 'mongo')
    private readonly cartRepo: Repository<ShoppingCart>,
  ) {}

  async trackAbandonedCarts() {
    // Logic to find carts not updated for X hours and moving them to AbandonedCart
    // For this demonstration, we'll just provide a way to manual trigger or list
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 1); // 1 hour inactivity

    const idleCarts = await this.cartRepo.find({
      where: {
        updated_at: { $lt: threshold } as any,
        items: { $not: { $size: 0 } } as any,
      } as any,
    });

    for (const cart of idleCarts) {
      const existing = await this.abandonedRepo.findOne({
        where: { user_id: cart.user_id, status: AbandonedCartStatus.PENDING },
      });

      if (!existing) {
        const abandoned = this.abandonedRepo.create({
          user_id: cart.user_id,
          items: cart.items,
          lastActivity: cart.updated_at,
          status: AbandonedCartStatus.PENDING,
        });
        await this.abandonedRepo.save(abandoned);
      }
    }

    return { tracked: idleCarts.length };
  }

  async listAbandoned(status?: AbandonedCartStatus) {
    const query: any = {};
    if (status) query.status = status;
    return this.abandonedRepo.find({ where: query, order: { updated_at: 'DESC' } });
  }

  async markRecovered(userId: string) {
    const abandoned = await this.abandonedRepo.findOne({
      where: { user_id: userId, status: AbandonedCartStatus.PENDING },
    });
    if (abandoned) {
      abandoned.status = AbandonedCartStatus.RECOVERED;
      await this.abandonedRepo.save(abandoned);
    }
    return { success: true };
  }
}
