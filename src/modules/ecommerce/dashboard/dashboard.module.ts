import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/entities/sales/order.entity';
import { FinanceTransaction } from '@/entities/mongo/finance-transaction.mongo-entity';
import { FraudSignal } from '@/entities/mongo/fraud-signal.mongo-entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order], 'postgres'),
    TypeOrmModule.forFeature([FinanceTransaction, FraudSignal], 'mongo'),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
