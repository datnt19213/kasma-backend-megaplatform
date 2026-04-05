import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AbandonedCartService } from './abandoned-cart.service';
import { AbandonedCartStatus } from '@/entities/mongo/abandoned-cart.mongo-entity';

@Controller('marketing/abandoned-cart')
@UseGuards(JwtAuthGuard)
export class AbandonedCartController {
  constructor(private readonly abandonedService: AbandonedCartService) {}

  @Post('track')
  async trackCarts() {
    return this.abandonedService.trackAbandonedCarts();
  }

  @Get('list')
  async listAll() {
    return this.abandonedService.listAbandoned();
  }

  @Post('status/recovered')
  async markRecovered(@Body() body: { userId: string }) {
    return this.abandonedService.markRecovered(body.userId);
  }
}
