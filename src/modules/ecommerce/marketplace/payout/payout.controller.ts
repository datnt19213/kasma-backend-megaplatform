import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PayoutService } from './payout.service';

@Controller('api/marketplace/payout')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('balance')
  async getBalance(@Body() body: { vendorId: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.getAvailableBalance(body.vendorId, context);
  }

  @Post('request')
  async request(@Body() dto: any, @Req() req: any) {
    const context = {
      vendorId: dto.vendorId || req.user.id, // In a real scenario, use vendor record linked to user
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.createPayoutRequest(dto, context);
  }

  @Post('process')
  async process(@Body() body: { requestId: string; provider: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.processPayout(body.requestId, body.provider, context);
  }

  @Post('list')
  async list(@Body() body: { vendorId?: string }, @Req() req: any) {
    const context = {
      vendorId: body.vendorId,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.listRequests(context);
  }
}
