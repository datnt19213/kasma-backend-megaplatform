import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import {
  AddGroupMembersDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  MessagingService,
  SendMessageDto,
  UpdateParticipantRoleDto,
} from './messaging.service';

interface RequestWithUser extends Request {
  user: {
    id?: string;
    sub?: string;
    app_key?: string;
    tenant_key?: string;
  };
}

@Controller('api/social/messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('conversations/direct')
  createDirectConversation(
    @Body() dto: CreateDirectConversationDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.createDirectConversation(userId, dto, ctx);
  }

  @Post('conversations/group')
  createGroupConversation(
    @Body() dto: CreateGroupConversationDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.createGroupConversation(userId, dto, ctx);
  }

  @Get('conversations')
  listConversations(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.listConversations(userId, ctx, +page, +limit);
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.getConversation(id, userId, ctx);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.sendMessage(userId, id, dto, ctx);
  }

  @Get('conversations/:id/messages')
  listMessages(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.listMessages(userId, id, ctx, +page, +limit);
  }

  @Post('conversations/:id/read')
  markRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.markRead(userId, id, ctx);
  }

  @Post('conversations/:id/members/add')
  addGroupMembers(
    @Param('id') id: string,
    @Body() dto: AddGroupMembersDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.addGroupMembers(userId, id, dto, ctx);
  }

  @Post('conversations/:id/members/:userId/remove')
  removeParticipant(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.removeParticipant(userId, id, targetUserId, ctx);
  }

  @Post('conversations/:id/members/:userId/role')
  updateParticipantRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateParticipantRoleDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.updateParticipantRole(userId, id, targetUserId, dto, ctx);
  }

  @Delete('messages/:messageId')
  deleteMessage(@Param('messageId') messageId: string, @Req() req: RequestWithUser) {
    const { userId, ctx } = this.resolveContext(req);
    return this.messagingService.deleteMessage(userId, messageId, ctx);
  }

  private resolveContext(req: RequestWithUser) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User identity missing');
    }

    const headerApp = req.headers['x-app-kasma-id'];
    const headerTenant = req.headers['x-tenant-kasma-id'];

    const ctx = {
      app_key:
        req.user?.app_key ||
        (Array.isArray(headerApp) ? headerApp[0] : headerApp) ||
        'MASTER',
      tenant_key:
        req.user?.tenant_key ||
        (Array.isArray(headerTenant) ? headerTenant[0] : headerTenant) ||
        'MASTER',
    };

    return { userId, ctx };
  }
}
