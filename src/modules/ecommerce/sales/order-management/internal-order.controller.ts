import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderManagementService } from './order-management.service';
import { OrderStatus } from '@/entities/sales/order.entity';

@Controller('api/internal/orders')
export class InternalOrderController {
  constructor(
    private readonly orderService: OrderManagementService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sync-payment')
  async syncPayment(
    @Headers('x-internal-secret') secret: string,
    @Body() body: { orderId: string; status: string; provider: string }
  ) {
    const internalSecret = this.configService.get('INTERNAL_WEBHOOK_SECRET', 'sync_secret');
    
    if (secret !== internalSecret) {
      throw new UnauthorizedException('Invalid internal secret');
    }

    let orderStatus = OrderStatus.PENDING;
    let paymentStatus = 'failed';

    if (body.status === 'SUCCESS' || body.status === 'COMPLETED') {
      orderStatus = OrderStatus.PROCESSING;
      paymentStatus = 'paid';
    } else if (body.status === 'REFUNDED') {
      orderStatus = OrderStatus.REFUNDED;
      paymentStatus = 'refunded';
    }
    
    await this.orderService.updateOrderStatus(body.orderId, orderStatus, undefined, paymentStatus);
    
    return { success: true };
  }
}
