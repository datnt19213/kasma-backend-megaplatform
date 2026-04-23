import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RefundService } from './refund.service';

@Controller('api/operations/refund')
@UseGuards(JwtAuthGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post('process')
  async process(@Body() dto: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.refundService.processRefund(dto, context);
  }

  @Post('list')
  async list(@Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.refundService.getCreditMemos(context);
  }
}
