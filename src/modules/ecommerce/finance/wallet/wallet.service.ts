import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StoreCredit } from '@/entities/finance/store-credit.entity';
import { GiftCard, GiftCardStatus } from '@/entities/finance/gift-card.entity';
import { FinanceTransaction, FinanceTransactionType } from '@/entities/mongo/finance-transaction.mongo-entity';
import { LockService } from '@/shared/lock/lock.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(StoreCredit, 'postgres')
    private readonly walletRepo: Repository<StoreCredit>,
    @InjectRepository(GiftCard, 'postgres')
    private readonly giftCardRepo: Repository<GiftCard>,
    @InjectRepository(FinanceTransaction, 'mongo')
    private readonly ledgerRepo: Repository<FinanceTransaction>,
    private readonly dataSource: DataSource,
    private readonly lockService: LockService,
  ) {}

  async getBalance(userId: string, context: { app_key: string; tenant_key: string }) {
    let wallet = await this.walletRepo.findOne({
      where: { userId, app_key: context.app_key, tenant_key: context.tenant_key }
    });

    if (!wallet) {
      wallet = this.walletRepo.create({
        userId,
        balance: 0,
        app_key: context.app_key,
        tenant_key: context.tenant_key,
      });
      await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  async redeemGiftCard(userId: string, code: string, context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;
    
    const giftCard = await this.giftCardRepo.findOne({
      where: { code, app_key, tenant_key, status: GiftCardStatus.ACTIVE }
    });

    if (!giftCard) throw new NotFoundException('Invalid or expired gift card');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Update Gift Card status
      giftCard.status = GiftCardStatus.REDEEMED;
      giftCard.currentAmount = 0;
      await queryRunner.manager.save(giftCard);

      // 2. Update Wallet balance
      let wallet = await queryRunner.manager.findOne(StoreCredit, {
        where: { userId, app_key, tenant_key },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = this.walletRepo.create({ userId, balance: 0, app_key, tenant_key });
      }

      const amountToCredit = Number(giftCard.initialAmount);
      wallet.balance = Number(wallet.balance) + amountToCredit;
      await queryRunner.manager.save(wallet);

      // 3. Log to Ledger (Mongo)
      const entry = this.ledgerRepo.create({
        app_key,
        tenant_key,
        userId,
        type: FinanceTransactionType.GIFT_CARD_REDEEM,
        amount: amountToCredit,
        currencyCode: giftCard.currencyCode,
        referenceId: giftCard.id,
        description: `Redeemed gift card: ${code}`,
      });
      await this.ledgerRepo.save(entry);

      await queryRunner.commitTransaction();
      return { success: true, credited: amountToCredit, newBalance: wallet.balance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getLedger(userId: string, context: { app_key: string; tenant_key: string }) {
    return await this.ledgerRepo.find({
      where: { userId, app_key: context.app_key, tenant_key: context.tenant_key } as any,
      order: { created_at: 'DESC' } as any,
    });
  }

  async creditUser(userId: string, amount: number, context: { app_key: string; tenant_key: string; reason?: string; type?: FinanceTransactionType; referenceId?: string }) {
    const { app_key, tenant_key, reason, type, referenceId } = context;
    
    // Acquire distributed lock for this user's wallet
    const lockKey = `lock:wallet:${userId}`;
    const lock = await this.lockService.acquire(lockKey, 10000);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(StoreCredit, {
        where: { userId, app_key, tenant_key },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = this.walletRepo.create({ userId, balance: 0, app_key, tenant_key });
      }

      wallet.balance = Number(wallet.balance) + amount;
      await queryRunner.manager.save(wallet);

      const entry = this.ledgerRepo.create({
        app_key,
        tenant_key,
        userId,
        type: type || FinanceTransactionType.ADJUSTMENT,
        amount: amount,
        currencyCode: wallet.currencyCode,
        referenceId: referenceId,
        description: reason || 'Account credit',
      });
      await this.ledgerRepo.save(entry);

      await queryRunner.commitTransaction();
      return wallet;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
      await lock.release();
    }
  }
}
