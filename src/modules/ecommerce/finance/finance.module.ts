import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Postgres Entities
import { TaxRule } from '@/entities/finance/tax-rule.entity';
import { Currency } from '@/entities/finance/currency.entity';
import { StoreCredit } from '@/entities/finance/store-credit.entity';
import { GiftCard } from '@/entities/finance/gift-card.entity';

// Mongo Entities
import { TaxConfig } from '@/entities/mongo/tax-config.mongo-entity';
import { ExchangeRate } from '@/entities/mongo/exchange-rate.mongo-entity';
import { FinanceTransaction } from '@/entities/mongo/finance-transaction.mongo-entity';

// Services
import { TaxService } from '@/modules/ecommerce/finance/tax/tax.service';
import { CurrencyService } from '@/modules/ecommerce/finance/currency/currency.service';
import { WalletService } from '@/modules/ecommerce/finance/wallet/wallet.service';
import { TransactionBridgeService } from '@/modules/ecommerce/finance/integration/transaction-bridge.service';

// Controllers
import { TaxController } from '@/modules/ecommerce/finance/tax/tax.controller';
import { CurrencyController } from '@/modules/ecommerce/finance/currency/currency.controller';
import { WalletController } from '@/modules/ecommerce/finance/wallet/wallet.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaxRule,
      Currency,
      StoreCredit,
      GiftCard,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      TaxConfig,
      ExchangeRate,
      FinanceTransaction,
    ], 'mongo'),
  ],
  controllers: [
    TaxController,
    CurrencyController,
    WalletController,
  ],
  providers: [
    TaxService,
    CurrencyService,
    WalletService,
    TransactionBridgeService,
  ],
  exports: [
    TaxService,
    CurrencyService,
    WalletService,
    TransactionBridgeService,
  ],
})
export class FinanceModule { }
