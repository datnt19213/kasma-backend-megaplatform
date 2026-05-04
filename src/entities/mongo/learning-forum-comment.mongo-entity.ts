import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('learning_forum_comments')
export class LearningForumComment {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  thread_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  is_instructor_reply: boolean;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
