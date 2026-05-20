import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum ParticipantRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

@Entity('social_conversation_participants')
@Index(['conversation_id', 'user_id', 'app_key', 'tenant_key'], { unique: true })
@Index(['user_id', 'app_key', 'tenant_key'])
export class SocialConversationParticipant extends MultiTenantEntity {
  @Column()
  conversation_id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER,
  })
  role: ParticipantRole;

  @Column({ type: 'timestamp', nullable: true })
  left_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_read_at: Date;

  @Column({ default: false })
  is_muted: boolean;
}
