import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ShippingService } from './shipping.service';

@Controller('api/logistics/shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  private getContext(req: any) {
    return {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
  }

  @Post('zone/create')
  async createZone(@Body() dto: any, @Req() req: any) {
    return await this.shippingService.createZone(dto, this.getContext(req));
  }

  @Post('method/add')
  async addMethod(@Body() dto: any, @Req() req: any) {
    return await this.shippingService.addMethodToZone(dto, this.getContext(req));
  }

  @Post('carriers')
  async listCarriers(@Req() req: any) {
    return await this.shippingService.listCarriers(this.getContext(req));
  }

  @Post('carrier-config/save')
  async saveConfig(@Body() dto: any, @Req() req: any) {
    return await this.shippingService.saveCarrierConfig(dto, this.getContext(req));
  }

  @Post('calculate')
  async calculate(@Body() dto: any, @Req() req: any) {
    return await this.shippingService.calculateShipping(dto, this.getContext(req));
  }
}
