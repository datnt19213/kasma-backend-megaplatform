import { Entity, Column } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_USER = 'AWAITING_USER',
  CLOSED = 'CLOSED',
}

@Entity('support_tickets')
export class SupportTicket extends MultiTenantEntity {
  @Column()
  userId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column()
  subject: string;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({ unique: true })
  ticketNumber: string;
}
