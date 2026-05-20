import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { resolveSocialContext } from '../common/social-context';
import { NoticeService } from './notice.service';

interface RequestWithUser extends Request {
  user?: {
    id?: string;
    sub?: string;
    app_key?: string;
    tenant_key?: string;
  };
}

@Controller('api/social/notices')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  listNotices(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('unread_only') unreadOnly?: string,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.noticeService.listNotices(
      userId,
      ctx,
      +page,
      +limit,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.noticeService.getUnreadCount(userId, ctx);
  }

  @Post('read-all')
  markAllRead(@Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.noticeService.markAllRead(userId, ctx);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.noticeService.markRead(id, userId, ctx);
  }
}
