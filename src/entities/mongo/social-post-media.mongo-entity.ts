import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
}

@Entity('social_post_media')
export class SocialPostMedia {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  post_id: string; // References SocialPost.id (PostgreSQL)

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  type: MediaType;

  @Column()
  url: string;

  @Column({ nullable: true })
  provider: string; // KEDIA, CLOUDINARY, S3

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
