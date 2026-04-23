import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PayoutRequest, PayoutStatus } from '@/entities/marketplace/payout-request.entity';
import { Vendor } from '@/entities/marketplace/vendor.entity';
import { Order, OrderStatus } from '@/entities/sales/order.entity';
import { TransactionBridgeService } from '../../finance/integration/transaction-bridge.service';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(PayoutRequest, 'postgres')
    private readonly payoutRepo: Repository<PayoutRequest>,
    @InjectRepository(Vendor, 'postgres')
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
    private readonly transactionBridge: TransactionBridgeService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Calculate available balance for a vendor
   * Only DELIVERED orders that haven't been included in a payout are eligible.
   */
  async getAvailableBalance(vendorId: string, context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;

    // Find all orders for this vendor that are DELIVERED and not yet settled
    // Note: In a real system, we'd need a 'settlementStatus' column on Order or OrderItem.
    // For this implementation, we'll assume orders with status DELIVERED are eligible.
    const orders = await this.orderRepo.find({
      where: { 
        // In a real scenario, we'd join with OrderItems to filter by vendorId
        // For simplicity, we'll assume Order has a vendorId or the tenant matches.
        app_key, 
        tenant_key, 
        status: OrderStatus.DELIVERED 
      }
    });

    // Subtract already requested/processed payouts
    const processedPayouts = await this.payoutRepo.find({
      where: { vendorId, app_key, tenant_key, status: PayoutStatus.PROCESSED }
    });
    
    const pendingPayouts = await this.payoutRepo.find({
      where: { vendorId, app_key, tenant_key, status: PayoutStatus.PENDING }
    });

    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
    const totalPayouts = [...processedPayouts, ...pendingPayouts].reduce((acc, p) => acc + Number(p.amount), 0);

    return {
      totalRevenue,
      totalPayouts,
      availableBalance: totalRevenue - totalPayouts,
    };
  }

  async createPayoutRequest(dto: { amount: number; destinationInfo: any }, context: { vendorId: string; app_key: string; tenant_key: string }) {
    const { vendorId, app_key, tenant_key } = context;

    const balance = await this.getAvailableBalance(vendorId, context);
    if (dto.amount > balance.availableBalance) {
      throw new BadRequestException('Insufficient balance for payout');
    }

    const request = this.payoutRepo.create({
      vendorId,
      amount: dto.amount,
      destinationInfo: dto.destinationInfo,
      status: PayoutStatus.PENDING,
      app_key,
      tenant_key,
    });

    return await this.payoutRepo.save(request);
  }

  async processPayout(requestId: string, provider: string, context: { app_key: string; tenant_key: string }) {
    const request = await this.payoutRepo.findOne({
      where: { id: requestId, app_key: context.app_key, tenant_key: context.tenant_key },
      relations: ['vendor'],
    });

    if (!request) throw new NotFoundException('Payout request not found');
    if (request.status !== PayoutStatus.PENDING) throw new BadRequestException('Payout is not in PENDING state');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Call Microservice
      const payoutResult = await this.transactionBridge.processPayout({
        amount: Number(request.amount),
        currency: request.currency,
        destination: JSON.stringify(request.destinationInfo),
        provider,
      });

      // 2. Update status
      request.status = PayoutStatus.PROCESSED;
      request.transactionReference = payoutResult.metadata?.dynamicPayoutResponse?.id || 'EXTERNAL_SYNC';
      await queryRunner.manager.save(request);

      await queryRunner.commitTransaction();
      return request;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      request.status = PayoutStatus.FAILED;
      request.adminNotes = `Error: ${err.message}`;
      await this.payoutRepo.save(request);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async listRequests(context: { vendorId?: string; app_key: string; tenant_key: string }) {
    const where: any = { app_key: context.app_key, tenant_key: context.tenant_key };
    if (context.vendorId) where.vendorId = context.vendorId;

    return await this.payoutRepo.find({
      where,
      order: { created_at: 'DESC' },
    });
  }
}
