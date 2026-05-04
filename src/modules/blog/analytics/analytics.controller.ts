import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/blog/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('view')
  async recordView(@Body() body: any, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.analyticsService.recordView(
      { ...body, userId: req.user.id },
      ctx
    );
  }

  @Post('heartbeat/:logId')
  async heartbeat(@Param('logId') logId: string, @Body('duration') duration: number) {
    return await this.analyticsService.updateHeartbeat(logId, duration || 10);
  }

  @Post('search')
  async logSearch(@Body() body: { query: string; results_count: number }, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.analyticsService.logSearch(body.query, body.results_count, req.user.id, ctx);
  }

  @Get('stats/:articleId')
  async getStats(@Param('articleId') articleId: string) {
    return await this.analyticsService.getArticleStats(articleId);
  }

  @Get('popular-searches')
  async getPopularQueries(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.analyticsService.getPopularQueries(ctx);
  }
}
