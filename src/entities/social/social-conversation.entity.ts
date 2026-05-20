import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

@Entity('social_conversations')
@Index(['type', 'app_key', 'tenant_key'])
@Index(['direct_pair_key', 'app_key', 'tenant_key'], { unique: true })
export class SocialConversation extends MultiTenantEntity {
  @Column({
    type: 'enum',
    enum: ConversationType,
  })
  type: ConversationType;

  @Column({ nullable: true })
  title: string;

  @Column()
  created_by: string;

  @Column({ nullable: true })
  direct_pair_key: string;

  @Column({ type: 'timestamp', nullable: true })
  last_message_at: Date;

  @Column({ type: 'varchar', length: 512, nullable: true })
  last_message_preview: string;

  @Column({ default: false })
  is_archived: boolean;
}
