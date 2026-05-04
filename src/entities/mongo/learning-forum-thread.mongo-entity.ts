import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('learning_forum_threads')
export class LearningForumThread {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  lesson_id: string;

  @Column()
  user_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
