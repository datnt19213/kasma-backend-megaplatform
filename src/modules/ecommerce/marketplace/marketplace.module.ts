import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Vendor } from '@/entities/marketplace/vendor.entity';
import { PayoutRequest } from '@/entities/marketplace/payout-request.entity';
import { CommissionRule } from '@/entities/marketplace/commission-rule.entity';
import { VendorRevenue } from '@/entities/marketplace/vendor-revenue.entity';
import { Order } from '@/entities/sales/order.entity';

// Mongo Entities
import { FraudSignal } from '@/entities/mongo/fraud-signal.mongo-entity';

// Services
import { PayoutService } from './payout/payout.service';
import { CommissionService } from './commission/commission.service';
import { FraudService } from './fraud/fraud.service';
import { SettlementService } from './payout/settlement.service';
import { SettlementProcessor } from './payout/settlement.processor';

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
      VendorRevenue,
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
    SettlementService,
    SettlementProcessor,
  ],
  exports: [PayoutService, CommissionService, FraudService, SettlementService],
})
export class MarketplaceModule {}
