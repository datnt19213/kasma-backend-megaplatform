import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum ActivityAction {
  VIEWED_PROFILE = 'VIEWED_PROFILE',
  SEARCHED_USER = 'SEARCHED_USER',
  SENT_FRIEND_REQUEST = 'SENT_FRIEND_REQUEST',
  FOLLOWED_USER = 'FOLLOWED_USER',
}

@Entity('user_activity_logs')
export class UserActivityLog {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  actor_id: string;

  @Column()
  target_id: string;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
