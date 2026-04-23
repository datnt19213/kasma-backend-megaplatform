import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('api/finance/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('me')
  async getMyWallet(@Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.walletService.getBalance(req.user.id, context);
  }

  @Post('redeem')
  async redeem(@Body() body: { code: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.walletService.redeemGiftCard(req.user.id, body.code, context);
  }

  @Post('ledger')
  async getLedger(@Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.walletService.getLedger(req.user.id, context);
  }
}
