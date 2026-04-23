import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { ProductDetail } from '@/entities/mongo/product-detail.mongo-entity';

import { ProductCatalogController } from './product-catalog/product-catalog.controller';
import { ProductCatalogService } from './product-catalog/product-catalog.service';
import { SalesModule } from './sales/sales.module';

import { MarketingModule } from './marketing/marketing.module';
import { LogisticsModule } from './logistics/logistics.module';
import { FinanceModule } from './finance/finance.module';
import { OperationsModule } from './operations/operations.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      ProductTag,
      Product,
      ProductVariant,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      ProductDetail,
    ], 'mongo'),
    SalesModule,
    MarketingModule,
    LogisticsModule,
    FinanceModule,
    OperationsModule,
    MarketplaceModule,
  ],
  controllers: [ProductCatalogController],
  providers: [ProductCatalogService],
  exports: [ProductCatalogService, SalesModule, MarketingModule, LogisticsModule, FinanceModule, OperationsModule, MarketplaceModule],
})
export class EcommerceModule { }
