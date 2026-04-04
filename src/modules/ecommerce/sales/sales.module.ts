import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { OrderManagementService } from './order-management/order-management.service';
import { WishlistController } from './wishlist/wishlist.controller';
import { WishlistService } from './wishlist/wishlist.service';
import { RecurringService, PreOrderService } from './recurring-preorder.service';
import { SubscriptionController, PreOrderController } from './recurring-preorder.controller';

@Module({
  imports: [
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
  ],
  controllers: [
    ShoppingCartController,
    OrderManagementController,
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
