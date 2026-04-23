import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreditMemo } from '@/entities/operations/credit-memo.entity';
import { Order, OrderStatus } from '@/entities/sales/order.entity';
import { WalletService } from '../../finance/wallet/wallet.service';
import { TransactionBridgeService } from '../../finance/integration/transaction-bridge.service';
import { FinanceTransactionType } from '@/entities/mongo/finance-transaction.mongo-entity';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(CreditMemo, 'postgres')
    private readonly memoRepo: Repository<CreditMemo>,
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
    private readonly walletService: WalletService,
    private readonly transactionBridge: TransactionBridgeService,
    private readonly dataSource: DataSource,
  ) {}

  async processRefund(dto: {
    orderId: string;
    amount: number;
    method: 'STORE_CREDIT' | 'ORIGINAL_GATEWAY' | 'MANUAL';
    reason?: string;
    transactionId?: string; // Original transaction ID from microservice
  }, context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;

    const order = await this.orderRepo.findOne({ where: { id: dto.orderId, app_key, tenant_key } });
    if (!order) throw new NotFoundException('Order not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Credit Memo
      const memo = this.memoRepo.create({
        orderId: dto.orderId,
        amount: dto.amount,
        refundMethod: dto.method,
        reason: dto.reason,
        memoNumber: `MEMO-${Date.now()}`,
        transactionId: dto.transactionId,
        app_key,
        tenant_key,
      });
      await queryRunner.manager.save(memo);

      // 2. Process Money Movement
      if (dto.method === 'STORE_CREDIT') {
        await this.walletService.creditUser(order.userId, dto.amount, {
          app_key,
          tenant_key,
          reason: `Refund for order ${order.orderNumber}: ${dto.reason}`,
          type: FinanceTransactionType.REFUND_TO_WALLET,
          referenceId: memo.id,
        });
      } else if (dto.method === 'ORIGINAL_GATEWAY') {
        if (!dto.transactionId) throw new BadRequestException('Transaction ID required for gateway refund');
        
        // Call microservice
        await this.transactionBridge.refundPayment({
          transactionId: dto.transactionId,
          amount: dto.amount,
          reason: dto.reason,
        });
      }

      // 3. Update Order Status if fully refunded (Optional logic)
      // For now just keep it as is or mark as REFUNDED
      order.status = OrderStatus.REFUNDED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return memo;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getCreditMemos(context: { app_key: string; tenant_key: string }) {
    return await this.memoRepo.find({
      where: { app_key: context.app_key, tenant_key: context.tenant_key },
      order: { created_at: 'DESC' },
    });
  }
}
