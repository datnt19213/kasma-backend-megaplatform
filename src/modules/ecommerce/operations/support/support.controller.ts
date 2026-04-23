import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SupportService } from './support.service';

@Controller('api/operations/support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket/create')
  async create(@Body() dto: any, @Req() req: any) {
    const context = {
      userId: req.user.id,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.supportService.createTicket(dto, context);
  }

  @Post('ticket/message')
  async addMessage(@Body() body: any, @Req() req: any) {
    const context = {
      userId: req.user.id,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
      senderType: req.user.roles?.includes('ADMIN') ? 'AGENT' : 'USER' as any,
    };
    return await this.supportService.addMessage(body.ticketId, body.message, context);
  }

  @Post('ticket/list')
  async list(@Req() req: any) {
    const context = {
      userId: req.user.roles?.includes('ADMIN') ? undefined : req.user.id,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.supportService.listTickets(context);
  }

  @Post('ticket/conversation')
  async getConversation(@Body() body: { id: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.supportService.getConversation(body.id, context);
  }

  @Post('ticket/close')
  async close(@Body() body: { id: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.supportService.closeTicket(body.id, context);
  }
}
