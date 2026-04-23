import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TaxService } from './tax.service';

@Controller('api/finance/tax')
@UseGuards(JwtAuthGuard)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('calculate')
  async calculate(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
      country: body.country,
      region: body.region,
      zipCode: body.zipCode,
    };
    return await this.taxService.calculateTax(body.amount, context);
  }

  @Post('rules/create')
  async createRule(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.taxService.createTaxRule(body, context);
  }
}
