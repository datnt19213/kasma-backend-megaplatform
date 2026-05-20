import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum SocialNoticeType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  TAG = 'TAG',
  GROUP_JOIN_REQUEST = 'GROUP_JOIN_REQUEST',
  GROUP_POST_PENDING = 'GROUP_POST_PENDING',
  GROUP_POST_APPROVED = 'GROUP_POST_APPROVED',
  GROUP_POST_REJECTED = 'GROUP_POST_REJECTED',
  GROUP_INVITE = 'GROUP_INVITE',
  SYSTEM = 'SYSTEM',
}

export enum SocialNoticeReferenceType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  GROUP = 'GROUP',
  USER = 'USER',
}

@Entity('social_notices')
@Index(['recipient_id', 'is_read', 'app_key', 'tenant_key'])
@Index(['recipient_id', 'created_at', 'app_key', 'tenant_key'])
export class SocialNotice extends MultiTenantEntity {
  @Column()
  recipient_id: string;

  @Column({ nullable: true })
  actor_id: string | null;

  @Column({
    type: 'enum',
    enum: SocialNoticeType,
  })
  notice_type: SocialNoticeType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: SocialNoticeReferenceType,
    nullable: true,
  })
  reference_type: SocialNoticeReferenceType | null;

  @Column({ nullable: true })
  reference_id: string | null;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, string | number | boolean | null> | null;
}
