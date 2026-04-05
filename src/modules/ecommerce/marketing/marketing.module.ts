import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Promotion } from '@/entities/marketing/promotion.entity';
import { Coupon } from '@/entities/marketing/coupon.entity';
import { LoyaltyTier } from '@/entities/marketing/loyalty-tier.entity';
import { LoyaltyPoint } from '@/entities/marketing/loyalty-point.entity';
import { AffiliateProgram } from '@/entities/marketing/affiliate-program.entity';
import { AffiliateLink } from '@/entities/marketing/affiliate-link.entity';
import { ProductBundle } from '@/entities/marketing/product-bundle.entity';
import { ProductBundleItem } from '@/entities/marketing/product-bundle-item.entity';
import { AbandonedCart } from '@/entities/mongo/abandoned-cart.mongo-entity';
import { ShoppingCart } from '@/entities/mongo/shopping-cart.mongo-entity';
import { MarketingLog } from '@/entities/mongo/marketing-log.mongo-entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';

import { PromotionController } from './promotion/promotion.controller';
import { PromotionService } from './promotion/promotion.service';
import { CouponController } from './coupon/coupon.controller';
import { CouponService } from './coupon/coupon.service';
import { LoyaltyController } from './loyalty/loyalty.controller';
import { LoyaltyService } from './loyalty/loyalty.service';
import { AffiliateController } from './affiliate/affiliate.controller';
import { AffiliateService } from './affiliate/affiliate.service';
import { AbandonedCartController } from './abandoned-cart/abandoned-cart.controller';
import { AbandonedCartService } from './abandoned-cart/abandoned-cart.service';
import { BundleController } from './bundle/bundle.controller';
import { BundleService } from './bundle/bundle.service';
import { MarketingProcessor } from './marketing.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Promotion,
      Coupon,
      LoyaltyTier,
      LoyaltyPoint,
      AffiliateProgram,
      AffiliateLink,
      ProductBundle,
      ProductBundleItem,
      Product,
      ProductVariant,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      AbandonedCart,
      ShoppingCart,
      MarketingLog,
    ], 'mongo'),
  ],
  controllers: [
    PromotionController,
    CouponController,
    LoyaltyController,
    AffiliateController,
    AbandonedCartController,
    BundleController,
  ],
  providers: [
    PromotionService,
    CouponService,
    LoyaltyService,
    AffiliateService,
    AbandonedCartService,
    BundleService,
    MarketingProcessor,
  ],
  exports: [
    PromotionService,
    CouponService,
    LoyaltyService,
    AffiliateService,
    AbandonedCartService,
    BundleService,
  ],
})
export class MarketingModule {}
