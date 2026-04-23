import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, TicketStatus } from '@/entities/operations/support-ticket.entity';
import { TicketConversation } from '@/entities/mongo/ticket-conversation.mongo-entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket, 'postgres')
    private readonly ticketRepo: Repository<SupportTicket>,
    @InjectRepository(TicketConversation, 'mongo')
    private readonly conversationRepo: Repository<TicketConversation>,
  ) {}

  async createTicket(dto: any, context: { userId: string; app_key: string; tenant_key: string }) {
    const ticket = this.ticketRepo.create({
      ...dto,
      userId: context.userId,
      ticketNumber: `TKT-${Date.now()}`,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    const savedTicket = await this.ticketRepo.save(ticket) as any;

    // Initial message in Mongo
    const conversation = this.conversationRepo.create({
      ticketId: savedTicket.id,
      messages: [{
        senderId: context.userId,
        senderType: 'USER',
        text: dto.initialMessage,
        timestamp: new Date(),
      }],
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    await this.conversationRepo.save(conversation);

    return savedTicket;
  }

  async addMessage(ticketId: string, message: any, context: { userId: string; app_key: string; tenant_key: string; senderType: 'USER' | 'AGENT' }) {
    const conversation = await this.conversationRepo.findOne({
      where: { ticketId, app_key: context.app_key, tenant_key: context.tenant_key } as any
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    conversation.messages.push({
      senderId: context.userId,
      senderType: context.senderType,
      text: message.text,
      attachments: message.attachments,
      timestamp: new Date(),
    });

    return await this.conversationRepo.save(conversation);
  }

  async listTickets(context: { app_key: string; tenant_key: string; userId?: string }) {
    const where: any = { app_key: context.app_key, tenant_key: context.tenant_key };
    if (context.userId) where.userId = context.userId;
    
    return await this.ticketRepo.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async getConversation(ticketId: string, context: { app_key: string; tenant_key: string }) {
    return await this.conversationRepo.findOne({
      where: { ticketId, app_key: context.app_key, tenant_key: context.tenant_key } as any
    });
  }

  async closeTicket(id: string, context: { app_key: string; tenant_key: string }) {
    await this.ticketRepo.update(
      { id, app_key: context.app_key, tenant_key: context.tenant_key },
      { status: TicketStatus.CLOSED }
    );
    return { success: true };
  }
}
