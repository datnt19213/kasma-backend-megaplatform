import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { Order } from '@/entities/sales/order.entity';
import { OrderItem } from '@/entities/sales/order-item.entity';
import { Subscription } from '@/entities/sales/subscription.entity';
import { PreOrder } from '@/entities/sales/pre-order.entity';
import { ShoppingCart } from '@/entities/mongo/shopping-cart.mongo-entity';
import { Wishlist } from '@/entities/mongo/wishlist.mongo-entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';

import { ShoppingCartController } from './shopping-cart/shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart/shopping-cart.service';
import { OrderManagementController } from './order-management/order-management.controller';
import { InternalOrderController } from './order-management/internal-order.controller';
import { OrderManagementService } from './order-management/order-management.service';
import { WishlistController } from './wishlist/wishlist.controller';
import { WishlistService } from './wishlist/wishlist.service';
import { RecurringService, PreOrderService } from './recurring-preorder.service';
import { SubscriptionController, PreOrderController } from './recurring-preorder.controller';
import { SalesProcessor } from './sales.processor';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    FinanceModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Subscription,
      PreOrder,
      Product,
      ProductVariant,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      ShoppingCart,
      Wishlist,
    ], 'mongo'),
    BullModule.registerQueue(
      { name: 'sales-queue' },
      { name: 'marketing-queue' },
    ),
  ],
  controllers: [
    ShoppingCartController,
    OrderManagementController,
    InternalOrderController,
    WishlistController,
    SubscriptionController,
    PreOrderController,
  ],
  providers: [
    ShoppingCartService,
    OrderManagementService,
    WishlistService,
    RecurringService,
    PreOrderService,
    SalesProcessor,
  ],
  exports: [
    ShoppingCartService,
    OrderManagementService,
    WishlistService,
    RecurringService,
    PreOrderService,
  ],
})
export class SalesModule {}
