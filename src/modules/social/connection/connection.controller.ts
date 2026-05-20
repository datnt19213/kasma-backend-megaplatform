import { Controller, Post, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ConnectionService } from './connection.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/social/connection')
@UseGuards(JwtAuthGuard)
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  // ─── Follow / Unfollow ───
  @Post('follow/:targetUserId')
  async toggleFollow(@Param('targetUserId') targetUserId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.toggleFollow(req.user.id, targetUserId, ctx);
  }

  // ─── Friend Requests ───
  @Post('friend/request/:targetUserId')
  async sendFriendRequest(@Param('targetUserId') targetUserId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.sendFriendRequest(req.user.id, targetUserId, ctx);
  }

  @Post('friend/:requestId/respond')
  async respondFriendRequest(
    @Param('requestId') requestId: string,
    @Body('action') action: 'ACCEPT' | 'REJECT',
    @Req() req: RequestWithUser,
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.respondFriendRequest(requestId, req.user.id, action, ctx);
  }

  // ─── Block / Unblock ───
  @Post('block/:targetUserId')
  async toggleBlock(@Param('targetUserId') targetUserId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.toggleBlock(req.user.id, targetUserId, ctx);
  }

  // ─── List Queries ───
  @Get('following')
  async getFollowing(@Req() req: RequestWithUser, @Query('page') page = 1, @Query('limit') limit = 20) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.getFollowing(req.user.id, ctx, +page, +limit);
  }

  @Get('followers')
  async getFollowers(@Req() req: RequestWithUser, @Query('page') page = 1, @Query('limit') limit = 20) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.getFollowers(req.user.id, ctx, +page, +limit);
  }

  @Get('friends')
  async getFriends(@Req() req: RequestWithUser, @Query('page') page = 1, @Query('limit') limit = 20) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.getFriends(req.user.id, ctx, +page, +limit);
  }

  @Get('friend/pending')
  async getPendingRequests(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.connectionService.getPendingRequests(req.user.id, ctx);
  }
}
