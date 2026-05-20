import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

@Entity('social_messages')
export class SocialMessage {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  conversation_id: string;

  @Column()
  sender_id: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  @Column()
  content_ciphertext: string;

  @Column()
  content_iv: string;

  @Column()
  content_auth_tag: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, string | number | boolean | null> | null;

  @Column({ default: false })
  is_deleted: boolean;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
