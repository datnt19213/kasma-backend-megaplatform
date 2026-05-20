import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CommentService, CreateCommentDto } from './comment.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/social/comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(@Body() dto: CreateCommentDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.commentService.createComment(req.user.id, dto, ctx);
  }

  @Get('post/:postId')
  async getCommentsByPost(
    @Param('postId') postId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.commentService.getCommentsByPost(postId, ctx, +page, +limit);
  }

  @Get(':id/replies')
  async getReplies(
    @Param('id') commentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.commentService.getReplies(commentId, ctx, +page, +limit);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.commentService.deleteComment(id, req.user.id, ctx);
  }
}
