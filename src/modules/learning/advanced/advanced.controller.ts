import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';
import { ScormService } from './scorm.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/advanced')
@UseGuards(JwtAuthGuard)
export class AdvancedController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly scormService: ScormService,
  ) {}

  @Get('leaderboard')
  async getLeaderboard(@Req() req: RequestWithUser, @Query('limit') limit?: number) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.gamificationService.getLeaderboard(ctx, limit);
  }

  @Get('my-rank')
  async getMyRank(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.gamificationService.getUserRank(req.user.id, ctx);
  }

  @Post('xapi/statements')
  async trackXApi(@Body() statement: any, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.scormService.trackXApiStatement(statement, ctx);
  }

  @Get('scorm/:lessonId')
  async getScormPackage(@Param('lessonId') lessonId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.scormService.getPackage(lessonId, ctx);
  }
}
