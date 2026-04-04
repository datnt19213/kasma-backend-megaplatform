import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subscription, SubscriptionStatus, BillingInterval } from '@/entities/sales/subscription.entity';
import { PreOrder, PreOrderStatus } from '@/entities/sales/pre-order.entity';
import { CreateSubscriptionDto } from '@/dto/sales-dto/sales.dto';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(Subscription, 'postgres')
    private readonly subRepo: Repository<Subscription>,
  ) {}

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const nextBilling = new Date();
    if (dto.interval === 'weekly') nextBilling.setDate(nextBilling.getDate() + 7);
    else if (dto.interval === 'monthly') nextBilling.setMonth(nextBilling.getMonth() + 1);
    else nextBilling.setFullYear(nextBilling.getFullYear() + 1);

    const sub = this.subRepo.create({
      userId,
      productId: dto.productId,
      variantId: dto.variantId,
      interval: dto.interval as BillingInterval,
      nextBillingDate: nextBilling,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subRepo.save(sub);
  }

  async getMySubscriptions(userId: string) {
    return this.subRepo.find({ where: { userId }, relations: ['product'] });
  }

  async cancelSubscription(id: string) {
    return this.subRepo.update(id, { status: SubscriptionStatus.CANCELLED });
  }
}

@Injectable()
export class PreOrderService {
  constructor(
    @InjectRepository(PreOrder, 'postgres')
    private readonly preRepo: Repository<PreOrder>,
  ) {}

  async createPreOrder(userId: string, productId: string, variantId?: string) {
    const pre = this.preRepo.create({
      userId,
      productId,
      variantId,
      expectedReleaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      status: PreOrderStatus.OPEN,
    });

    return this.preRepo.save(pre);
  }

  async getMyPreOrders(userId: string) {
    return this.preRepo.find({ where: { userId }, relations: ['product'] });
  }
}
