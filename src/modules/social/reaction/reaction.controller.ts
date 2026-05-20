import { Controller, Post, Get, Body, Req, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReactionService, ToggleReactionDto } from './reaction.service';
import { TargetType } from '@/entities/social/social-reaction.entity';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/social/reactions')
@UseGuards(JwtAuthGuard)
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post('toggle')
  async toggleReaction(@Body() dto: ToggleReactionDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.reactionService.toggleReaction(req.user.id, dto, ctx);
  }

  @Get()
  async getReactions(
    @Query('target_type') targetType: TargetType,
    @Query('target_id') targetId: string,
    @Req() req: RequestWithUser,
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.reactionService.getReactions(targetType, targetId, ctx);
  }
}
