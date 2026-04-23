import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Vendor } from '@/entities/marketplace/vendor.entity';
import { PayoutRequest } from '@/entities/marketplace/payout-request.entity';
import { CommissionRule } from '@/entities/marketplace/commission-rule.entity';
import { Order } from '@/entities/sales/order.entity';

// Mongo Entities
import { FraudSignal } from '@/entities/mongo/fraud-signal.mongo-entity';

// Services
import { PayoutService } from './payout/payout.service';
import { CommissionService } from './commission/commission.service';
import { FraudService } from './fraud/fraud.service';

// Controllers
import { PayoutController } from './payout/payout.controller';
import { MarketplaceController } from './marketplace.controller';

// Shared
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      PayoutRequest,
      CommissionRule,
      Order,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      FraudSignal,
    ], 'mongo'),
    FinanceModule, // For TransactionBridge
  ],
  controllers: [
    PayoutController,
    MarketplaceController,
  ],
  providers: [
    PayoutService,
    CommissionService,
    FraudService,
  ],
  exports: [PayoutService, CommissionService, FraudService],
})
export class MarketplaceModule {}
