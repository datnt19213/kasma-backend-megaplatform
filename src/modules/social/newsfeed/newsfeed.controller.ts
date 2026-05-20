import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { NewsfeedService } from './newsfeed.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/social/newsfeed')
@UseGuards(JwtAuthGuard)
export class NewsfeedController {
  constructor(private readonly newsfeedService: NewsfeedService) {}

  @Get()
  async getNewsfeed(@Req() req: RequestWithUser, @Query('page') page = 1, @Query('limit') limit = 20) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.newsfeedService.getNewsfeed(req.user.id, ctx, +page, +limit);
  }
}
