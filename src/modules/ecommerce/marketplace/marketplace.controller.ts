import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CommissionService } from './commission/commission.service';
import { FraudService } from './fraud/fraud.service';

@Controller('api/marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(
    private readonly commissionService: CommissionService,
    private readonly fraudService: FraudService,
  ) {}

  @Post('commission/calculate')
  async calc(@Body() body: any, @Req() req: any) {
    const context = {
      vendorId: body.vendorId,
      categoryId: body.categoryId,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.commissionService.calculateCommission(body.orderTotal, context);
  }

  @Post('commission/rule/save')
  async saveRule(@Body() dto: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.commissionService.saveRule(dto, context);
  }

  @Post('fraud/signals')
  async signals(@Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.fraudService.getSignals(context);
  }
}
