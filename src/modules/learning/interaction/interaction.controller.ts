import { Controller, Post, Body, Param, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ForumService } from './forum.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/interaction')
@UseGuards(JwtAuthGuard)
export class InteractionController {
  constructor(private readonly forumService: ForumService) {}

  @Post('forum/threads')
  async createThread(@Body() body: any, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.forumService.createThread({ ...body, user_id: req.user.id }, ctx);
  }

  @Post('forum/threads/:id/comments')
  async addComment(@Param('id') id: string, @Body() body: any, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.forumService.addComment(id, { ...body, user_id: req.user.id }, ctx);
  }

  @Get('forum/lesson/:lessonId')
  async getThreads(@Param('lessonId') lessonId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.forumService.getThreadsByLesson(lessonId, ctx);
  }

  @Get('forum/threads/:id/comments')
  async getComments(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.forumService.getCommentsByThread(id, ctx);
  }
}
