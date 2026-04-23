import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PayoutRequest, PayoutStatus } from '@/entities/marketplace/payout-request.entity';
import { Vendor } from '@/entities/marketplace/vendor.entity';
import { Order, OrderStatus } from '@/entities/sales/order.entity';
import { VendorRevenue } from '@/entities/marketplace/vendor-revenue.entity';
import { TransactionBridgeService } from '../../finance/integration/transaction-bridge.service';
import { CreatePayoutRequestDto, ProcessPayoutDto, PayoutListFilterDto } from '@/dto/marketplace-dto/payout.dto';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(PayoutRequest, 'postgres')
    private readonly payoutRepo: Repository<PayoutRequest>,
    @InjectRepository(Vendor, 'postgres')
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(VendorRevenue, 'postgres')
    private readonly revenueRepo: Repository<VendorRevenue>,
    private readonly transactionBridge: TransactionBridgeService,
    private readonly dataSource: DataSource,
  ) {}

  async getAvailableBalance(vendorId: string, context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;

    const revenues = await this.revenueRepo.find({
      where: { vendorId, app_key, tenant_key, isSettled: false } as any
    });

    const availableBalance = revenues.reduce((acc, r) => acc + Number(r.netAmount), 0);

    return {
      availableBalance,
      revenueCount: revenues.length,
    };
  }

  async createPayoutRequest(dto: CreatePayoutRequestDto, context: { vendorId: string; app_key: string; tenant_key: string }) {
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

  async processPayout(dto: ProcessPayoutDto, context: { app_key: string; tenant_key: string }) {
    const request = await this.payoutRepo.findOne({
      where: { id: dto.requestId, app_key: context.app_key, tenant_key: context.tenant_key } as any,
      relations: ['vendor'],
    });

    if (!request) throw new NotFoundException('Payout request not found');
    if (request.status !== PayoutStatus.PENDING) throw new BadRequestException('Payout is not in PENDING state');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payoutResult = await this.transactionBridge.processPayout({
        amount: Number(request.amount),
        currency: request.currency,
        destination: JSON.stringify(request.destinationInfo),
        provider: dto.provider,
      });

      await queryRunner.manager.update(VendorRevenue, 
        { vendorId: request.vendorId, isSettled: false, app_key: context.app_key, tenant_key: context.tenant_key },
        { isSettled: true }
      );

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

  async listRequests(filter: PayoutListFilterDto, context: { app_key: string; tenant_key: string }) {
    const where: any = { app_key: context.app_key, tenant_key: context.tenant_key };
    if (filter.vendorId) where.vendorId = filter.vendorId;

    return await this.payoutRepo.find({
      where,
      order: { created_at: 'DESC' } as any,
    });
  }
}
