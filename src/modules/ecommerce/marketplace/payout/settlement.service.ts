import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/entities/sales/order.entity';
import { VendorRevenue } from '@/entities/marketplace/vendor-revenue.entity';
import { CommissionService } from '../commission/commission.service';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(VendorRevenue, 'postgres')
    private readonly revenueRepo: Repository<VendorRevenue>,
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
    private readonly commissionService: CommissionService,
  ) {}

  async settleOrder(orderId: string, context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;

    const order = await this.orderRepo.findOne({
      where: { id: orderId, app_key, tenant_key },
      relations: ['items', 'items.product']
    });

    if (!order) return;

    // In a multi-vendor scenario, an order can have items from multiple vendors.
    // We group items by vendor and calculate revenue for each.
    const vendorItemsMap = new Map<string, any[]>();
    for (const item of order.items) {
      const vendorId = item.product?.vendorId || 'SYSTEM';
      if (!vendorItemsMap.has(vendorId)) vendorItemsMap.set(vendorId, []);
      vendorItemsMap.get(vendorId)!.push(item);
    }

    for (const [vendorId, items] of vendorItemsMap.entries()) {
      const grossAmount = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
      
      const commissionInfo = await this.commissionService.calculateCommission(grossAmount, {
        vendorId,
        app_key,
        tenant_key,
      });

      const revenue = this.revenueRepo.create({
        vendorId,
        orderId,
        grossAmount,
        commissionAmount: commissionInfo.commissionAmount,
        netAmount: commissionInfo.netAmount,
        app_key,
        tenant_key,
        isSettled: false,
      });

      await this.revenueRepo.save(revenue);
    }
  }
}
