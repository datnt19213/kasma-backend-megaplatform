import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';

@Entity('TicketConversation')
export class TicketConversation {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  ticketId: string;

  @Column({ type: 'json' })
  messages: {
    senderId: string;
    senderType: 'USER' | 'AGENT' | 'SYSTEM';
    text: string;
    attachments?: string[];
    timestamp: Date;
  }[];

  @CreateDateColumn()
  created_at: Date;
}
