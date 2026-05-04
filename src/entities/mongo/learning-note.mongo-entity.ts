import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('learning_notes')
export class LearningNote {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  user_id: string;

  @Column()
  lesson_id: string;

  @Column()
  timestamp: number; // seconds into video

  @Column('text')
  content: string;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
