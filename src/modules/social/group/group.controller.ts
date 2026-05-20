import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SocialGroupType } from '@/entities/social/social-group.entity';
import { resolveSocialContext } from '../common/social-context';
import {
  CreateCommunityDto,
  CreateFanpageDto,
  CreateGroupPostDto,
  GroupService,
  UpdateMemberRoleDto,
} from './group.service';

interface RequestWithUser extends Request {
  user?: {
    id?: string;
    sub?: string;
    app_key?: string;
    tenant_key?: string;
  };
}

@Controller('api/social/groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('community/create')
  createCommunity(@Body() dto: CreateCommunityDto, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.createCommunity(userId, dto, ctx);
  }

  @Post('fanpage/create')
  createFanpage(@Body() dto: CreateFanpageDto, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.createFanpage(userId, dto, ctx);
  }

  @Get()
  listGroups(
    @Req() req: RequestWithUser,
    @Query('type') type?: SocialGroupType,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    const { ctx } = resolveSocialContext(req);
    return this.groupService.listGroups(ctx, type, +page, +limit, search);
  }

  @Get(':id')
  getGroup(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.getGroup(id, userId, ctx);
  }

  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.joinGroup(id, userId, ctx);
  }

  @Post(':id/leave')
  leaveGroup(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.leaveGroup(id, userId, ctx);
  }

  @Get(':id/members')
  listMembers(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.listMembers(id, userId, ctx, +page, +limit);
  }

  @Post(':id/members/:userId/approve')
  approveMember(@Param('id') id: string, @Param('userId') targetUserId: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.approveMember(userId, id, targetUserId, ctx);
  }

  @Post(':id/members/:userId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.updateMemberRole(userId, id, targetUserId, dto, ctx);
  }

  @Post(':id/members/:userId/remove')
  removeMember(@Param('id') id: string, @Param('userId') targetUserId: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.removeMember(userId, id, targetUserId, ctx);
  }

  @Post(':id/posts')
  createGroupPost(@Param('id') id: string, @Body() dto: CreateGroupPostDto, @Req() req: RequestWithUser) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.createGroupPost(userId, id, dto, ctx);
  }

  @Get(':id/posts')
  listGroupPosts(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.listGroupPosts(userId, id, ctx, +page, +limit);
  }

  @Post(':id/posts/:postId/approve')
  approveGroupPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.approveGroupPost(userId, id, postId, ctx);
  }

  @Post(':id/posts/:postId/reject')
  rejectGroupPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.groupService.rejectGroupPost(userId, id, postId, ctx);
  }
}
