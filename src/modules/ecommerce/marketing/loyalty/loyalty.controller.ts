import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LoyaltyService } from './loyalty.service';
import { CreateLoyaltyTierDto, AddLoyaltyPointsDto } from '@/dto/marketing-dto/loyalty.dto';

@Controller('marketing/loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('tiers/create')
  async createTier(@Body() dto: CreateLoyaltyTierDto) {
    return this.loyaltyService.createTier(dto);
  }

  @Get('tiers/list')
  async listTiers() {
    return this.loyaltyService.findAllTiers();
  }

  @Post('points/add')
  async addPoints(@Body() dto: AddLoyaltyPointsDto) {
    return this.loyaltyService.addPoints(dto);
  }

  @Get('me/balance')
  async getBalance(@Req() req: any) {
    return this.loyaltyService.getBalance(req.user.sub);
  }

  @Get('me/history')
  async getHistory(@Req() req: any) {
    return this.loyaltyService.getHistory(req.user.sub);
  }
}
