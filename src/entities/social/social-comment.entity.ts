import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

@Entity('social_comments')
@Index(['post_id', 'app_key', 'tenant_key'])
@Index(['parent_comment_id', 'app_key', 'tenant_key']) // For fast reply fetching
export class SocialComment extends MultiTenantEntity {
  @Column()
  post_id: string;

  @Column()
  author_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parent_comment_id: string; // If this is a reply to another comment

  // Counters for performance
  @Column({ type: 'int', default: 0 })
  like_count: number;

  @Column({ type: 'int', default: 0 })
  reply_count: number;

  @Column({ default: false })
  is_deleted: boolean;
}
