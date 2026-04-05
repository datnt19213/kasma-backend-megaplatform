import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RecurringService, PreOrderService } from './recurring-preorder.service';
import { CreateSubscriptionDto } from '@/dto/sales-dto/sales.dto';

@Controller('sales/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get('me')
  async getMySubscriptions(@Req() req: any) {
    const userId = req.user.sub;
    return this.recurringService.getMySubscriptions(userId);
  }

  @Post('create')
  async createSubscription(@Req() req: any, @Body() dto: CreateSubscriptionDto) {
    const userId = req.user.sub;
    return this.recurringService.createSubscription(userId, dto);
  }

  @Post('cancel')
  async cancelSubscription(@Body() body: { id: string }) {
    return this.recurringService.cancelSubscription(body.id);
  }
}

@Controller('sales/pre-orders')
@UseGuards(JwtAuthGuard)
export class PreOrderController {
  constructor(private readonly preOrderService: PreOrderService) {}

  @Get('me')
  async getMyPreOrders(@Req() req: any) {
    const userId = req.user.sub;
    return this.preOrderService.getMyPreOrders(userId);
  }

  @Post('create')
  async createPreOrder(@Req() req: any, @Body() body: { productId: string; variantId?: string }) {
    const userId = req.user.sub;
    return this.preOrderService.createPreOrder(userId, body.productId, body.variantId);
  }
}
