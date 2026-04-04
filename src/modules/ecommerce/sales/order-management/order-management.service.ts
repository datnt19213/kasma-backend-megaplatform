import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Order, OrderStatus } from '@/entities/sales/order.entity';
import { OrderItem } from '@/entities/sales/order-item.entity';
import { ShoppingCart, CartItem } from '@/entities/mongo/shopping-cart.mongo-entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { CreateOrderDto } from '@/dto/sales-dto/sales.dto';

@Injectable()
export class OrderManagementService {
  constructor(
    @InjectRepository(Order, 'postgres')
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem, 'postgres')
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(ProductVariant, 'postgres')
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ShoppingCart, 'mongo')
    private readonly cartRepo: Repository<ShoppingCart>,
    private readonly dataSource: DataSource,
  ) {}

  async createOrderFromCart(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartRepo.findOne({ where: { user_id: userId } as any });
    if (!cart || cart.items.length === 0) throw new NotFoundException('Cart is empty');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Group items by warehouse for splitting
      const itemsWithWarehouse = await Promise.all(
        (cart.items as CartItem[]).map(async (item) => {
          let warehouseId = 'DEFAULT_WH';
          if (item.variantId) {
            const variant = await this.variantRepo.findOne({
              where: { id: item.variantId } as any,
            });
            if (variant?.warehouseId) {
              warehouseId = variant.warehouseId;
            }
          }
          return { ...item, warehouseId };
        })
      );

      const itemsByWarehouse: Record<string, any[]> = {};
      itemsWithWarehouse.forEach((item) => {
        if (!itemsByWarehouse[item.warehouseId]) itemsByWarehouse[item.warehouseId] = [];
        itemsByWarehouse[item.warehouseId].push(item);
      });

      const warehouseIds = Object.keys(itemsByWarehouse);
      
      // 2. Create Orders (Main or Split)
      let mainOrderId: string | null = null;
      const createdOrders: Order[] = [];

      for (let i = 0; i < warehouseIds.length; i++) {
        const whId = warehouseIds[i];
        const whItems = itemsByWarehouse[whId];
        
        const totalAmount = whItems.reduce((sum, item) => sum + item.quantity * Number(item.priceAtAddition), 0);
        
        const order = this.orderRepo.create({
          userId,
          orderNumber: `ORD-${Date.now()}-${i}`,
          totalAmount,
          shippingAddress: dto.shippingAddress,
          paymentMethod: dto.paymentMethod,
          parentOrderId: mainOrderId as string, // Link if splitting
        });

        const savedOrder = await queryRunner.manager.save(order);
        if (i === 0) mainOrderId = savedOrder.id; // First order is the parent
        createdOrders.push(savedOrder);

        // 3. Create Order Items
        for (const item of whItems) {
          const orderItem = this.orderItemRepo.create({
            orderId: savedOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.priceAtAddition,
            subTotal: item.quantity * Number(item.priceAtAddition),
            warehouseId: whId,
          });
          await queryRunner.manager.save(orderItem);
        }
      }

      // 4. Clear Cart
      cart.items = [];
      await this.cartRepo.save(cart);

      await queryRunner.commitTransaction();
      return { success: true, orders: createdOrders };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyOrders(userId: string) {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product', 'items.variant'],
      order: { created_at: 'DESC' },
    });
  }

  async getOrderById(id: string) {
    return this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.variant'],
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    return this.orderRepo.save(order);
  }

  async cancelOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Cannot cancel order already in processing');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }
}
