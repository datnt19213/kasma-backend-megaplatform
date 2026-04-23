import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PayoutService } from './payout.service';
import { CreatePayoutRequestDto, ProcessPayoutDto, PayoutListFilterDto } from '@/dto/marketplace-dto/payout.dto';

interface RequestWithUser {
  user: {
    id: string;
    app_key?: string;
    tenant_key?: string;
  };
}

@Controller('api/marketplace/payout')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('balance')
  async getBalance(@Body() body: { vendorId: string }, @Req() req: RequestWithUser) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.getAvailableBalance(body.vendorId, context);
  }

  @Post('request')
  async request(@Body() dto: CreatePayoutRequestDto & { vendorId?: string }, @Req() req: RequestWithUser) {
    const context = {
      vendorId: dto.vendorId || req.user.id,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.createPayoutRequest(dto, context);
  }

  @Post('process')
  async process(@Body() dto: ProcessPayoutDto, @Req() req: RequestWithUser) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.processPayout(dto, context);
  }

  @Post('list')
  async list(@Body() filter: PayoutListFilterDto, @Req() req: RequestWithUser) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.payoutService.listRequests(filter, context);
  }
}
