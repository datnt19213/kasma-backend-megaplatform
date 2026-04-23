import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrencyService } from './currency.service';

@Controller('api/finance/currency')
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('list')
  async list(@Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.currencyService.listCurrencies(context);
  }

  @Post('convert')
  async convert(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.currencyService.convert(body.amount, body.from, body.to, context);
  }

  @Post('rates/update')
  async updateRate(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.currencyService.updateRate(body, context);
  }
}
