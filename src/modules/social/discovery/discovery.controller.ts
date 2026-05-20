import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DiscoveryService } from './discovery.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/social/discovery')
@UseGuards(JwtAuthGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('suggestions')
  async getSuggestions(@Req() req: RequestWithUser, @Query('limit') limit = 10) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.discoveryService.getSuggestions(req.user.id, ctx, +limit);
  }
}
