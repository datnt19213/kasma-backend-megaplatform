import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OrderManagementService } from './order-management.service';
import { CreateOrderDto } from '@/dto/sales-dto/sales.dto';
import { OrderStatus } from '@/entities/sales/order.entity';

@Controller('sales/orders')
@UseGuards(JwtAuthGuard)
export class OrderManagementController {
  constructor(private readonly orderService: OrderManagementService) {}

  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    const userId = req.user.sub;
    return this.orderService.getMyOrders(userId);
  }

  @Post('checkout')
  async createOrderFromCart(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.sub;
    return this.orderService.createOrderFromCart(userId, dto);
  }

  @Post('details')
  async getOrderDetails(@Body() body: { id: string }) {
    return this.orderService.getOrderById(body.id);
  }

  @Post('update-status')
  async updateOrderStatus(
    @Body() body: { id: string; status: OrderStatus; trackingNumber?: string }
  ) {
    return this.orderService.updateOrderStatus(body.id, body.status, body.trackingNumber);
  }

  @Post('cancel')
  async cancelOrder(@Body() body: { id: string }) {
    return this.orderService.cancelOrder(body.id);
  }
}
