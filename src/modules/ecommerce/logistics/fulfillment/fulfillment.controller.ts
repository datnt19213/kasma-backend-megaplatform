import { Body, Controller, Post, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { FulfillmentService } from './fulfillment.service';

@Controller('api/logistics/fulfillment')
@UseGuards(JwtAuthGuard)
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  private getContext(req: any) {
    return {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
  }

  @Post('create')
  async create(@Body() dto: any, @Req() req: any) {
    return await this.fulfillmentService.createFulfillment(dto, this.getContext(req));
  }

  @Post(':id/update-status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: any; trackingNumber?: string },
    @Req() req: any
  ) {
    return await this.fulfillmentService.updateStatus(id, body.status, this.getContext(req), body.trackingNumber);
  }

  @Post('order-details')
  async getByOrder(@Body() body: { orderId: string }, @Req() req: any) {
    return await this.fulfillmentService.getFulfillmentByOrder(body.orderId, this.getContext(req));
  }
}
