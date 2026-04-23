import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudSignal } from '@/entities/mongo/fraud-signal.mongo-entity';
import { Order } from '@/entities/sales/order.entity';

@Injectable()
export class FraudService {
  constructor(
    @InjectRepository(FraudSignal, 'mongo')
    private readonly signalRepo: Repository<FraudSignal>,
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
  ) {}

  async analyzeOrder(order: Order, context: { app_key: string; tenant_key: string }) {
    const flags: string[] = [];
    let riskScore = 0;

    // 1. High value order check
    if (Number(order.totalAmount) > 5000000) { // > 5M VND
      flags.push('HIGH_VALUE_ORDER');
      riskScore += 30;
    }

    // 2. User history check (Simulated)
    const userOrders = await this.orderRepo.find({ where: { userId: order.userId } });
    if (userOrders.length === 1) { // First order
      flags.push('NEW_USER');
      riskScore += 20;
    }

    // 3. Save signal to Mongo
    const signal = this.signalRepo.create({
      app_key: context.app_key,
      tenant_key: context.tenant_key,
      orderId: order.id,
      userId: order.userId,
      vendorId: 'SYSTEM', // Should be vendorId from order
      riskScore,
      flags,
      evidence: {
        total: order.totalAmount,
        orderCount: userOrders.length,
      },
    });

    await this.signalRepo.save(signal);
    return signal;
  }

  async getSignals(context: { app_key: string; tenant_key: string }) {
    return await this.signalRepo.find({
      where: { app_key: context.app_key, tenant_key: context.tenant_key } as any,
      order: { created_at: 'DESC' } as any,
    });
  }
}
