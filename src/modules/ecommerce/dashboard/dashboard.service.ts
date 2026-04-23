import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudSignal } from '@/entities/mongo/fraud-signal.mongo-entity';
import { FinanceTransaction } from '@/entities/mongo/finance-transaction.mongo-entity';
import { Order } from '@/entities/sales/order.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(FinanceTransaction, 'mongo')
    private readonly ledgerRepo: Repository<FinanceTransaction>,
    @InjectRepository(FraudSignal, 'mongo')
    private readonly fraudRepo: Repository<FraudSignal>,
  ) {}

  async getTenantStats(context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;

    // 1. Total Revenue (from Postgres)
    const revenueStats = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.app_key = :app_key AND order.tenant_key = :tenant_key', { app_key, tenant_key })
      .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
      .getRawOne();

    // 2. Fraud Risk Summary (from Mongo)
    const fraudSignals = await this.fraudRepo.find({
      where: { app_key, tenant_key } as any,
    });
    const avgRiskScore = fraudSignals.length > 0 
      ? fraudSignals.reduce((acc, s) => acc + s.riskScore, 0) / fraudSignals.length 
      : 0;

    // 3. Wallet Movement (from Mongo Ledger)
    const ledgerStats = await this.ledgerRepo.find({
      where: { app_key, tenant_key } as any,
    });
    const totalWalletCredit = ledgerStats
      .filter(l => Number(l.amount) > 0)
      .reduce((acc, l) => acc + Number(l.amount), 0);

    return {
      totalRevenue: Number(revenueStats?.total || 0),
      fraudRisk: {
        totalSignals: fraudSignals.length,
        averageRiskScore: avgRiskScore,
      },
      finance: {
        totalWalletCredit,
        ledgerEntries: ledgerStats.length,
      },
    };
  }
}
