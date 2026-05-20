import { Column, Entity, Index } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';

export enum StoryType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity('social_stories')
@Index(['author_id', 'app_key', 'tenant_key'])
@Index(['expires_at', 'app_key', 'tenant_key']) // For cleanup scheduler
export class SocialStory extends MultiTenantEntity {
  @Column()
  author_id: string;

  @Column({
    type: 'enum',
    enum: StoryType,
    default: StoryType.IMAGE,
  })
  type: StoryType;

  @Column()
  media_url: string;

  @Column({ nullable: true })
  media_provider: string; // KEDIA or CLOUDINARY

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ nullable: true })
  music_track: string;

  // Stories expire 24h by default, short videos can have longer TTL
  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ default: false })
  is_deleted: boolean;
}
