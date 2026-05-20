import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum PostPrivacy {
  PUBLIC = 'PUBLIC',       // Ai cũng thấy
  FRIENDS = 'FRIENDS',     // Chỉ bạn bè
  FOLLOWERS = 'FOLLOWERS', // Chỉ người theo dõi
  ONLY_ME = 'ONLY_ME',    // Chỉ mình tôi
}

export enum PostType {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',       // Image/Video
  LINK = 'LINK',         // Shared link
  POLL = 'POLL',
}

export enum GroupPostApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('social_posts')
@Index(['author_id', 'app_key', 'tenant_key'])
@Index(['created_at', 'privacy', 'app_key', 'tenant_key'])
@Index(['group_id', 'approval_status', 'app_key', 'tenant_key'])
export class SocialPost extends MultiTenantEntity {
  @Column()
  author_id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.TEXT,
  })
  type: PostType;

  @Column({
    type: 'enum',
    enum: PostPrivacy,
    default: PostPrivacy.PUBLIC,
  })
  privacy: PostPrivacy;

  @Column({ nullable: true })
  location_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  link_url: string;

  @Column({ nullable: true })
  link_preview_image: string;

  @Column({ nullable: true })
  link_preview_title: string;

  // Repost tracking
  @Column({ nullable: true })
  original_post_id: string;

  @Column({ default: false })
  is_repost: boolean;

  // Denormalized counters for performance
  @Column({ type: 'int', default: 0 })
  like_count: number;

  @Column({ type: 'int', default: 0 })
  comment_count: number;

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true })
  group_id: string;

  @Column({
    type: 'enum',
    enum: GroupPostApprovalStatus,
    nullable: true,
  })
  approval_status: GroupPostApprovalStatus | null;
}
