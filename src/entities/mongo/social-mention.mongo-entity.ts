import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum MentionSourceType {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

@Entity('social_mentions')
export class SocialMention {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({
    type: 'enum',
    enum: MentionSourceType,
  })
  source_type: MentionSourceType;

  @Column()
  source_id: string; // ID of the Post or Comment

  @Column()
  mentioned_user_id: string;

  @Column()
  author_id: string; // The user who created the mention

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
