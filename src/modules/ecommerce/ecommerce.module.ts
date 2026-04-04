import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductDetail } from '@/entities/mongo/product-detail.mongo-entity';

import { ProductCatalogController } from './product-catalog.controller';
import { ProductCatalogService } from './product-catalog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      ProductTag,
      Product,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      ProductDetail,
    ], 'mongo'),
  ],
  controllers: [ProductCatalogController],
  providers: [ProductCatalogService],
  exports: [ProductCatalogService],
})
export class EcommerceModule { }
