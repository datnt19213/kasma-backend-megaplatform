import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum TagType {
  USER = 'USER',
  LOCATION = 'LOCATION',
  HASHTAG = 'HASHTAG',
}

@Entity('social_post_tags')
export class SocialPostTag {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  post_id: string; // References SocialPost.id (PostgreSQL)

  @Column({
    type: 'enum',
    enum: TagType,
  })
  type: TagType;

  @Column()
  target_id: string; // User ID, Location ID, or Hashtag string

  @Column({ nullable: true })
  target_name: string; // Display name (e.g. "@ponander", "Ho Chi Minh City", "#tech")

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
