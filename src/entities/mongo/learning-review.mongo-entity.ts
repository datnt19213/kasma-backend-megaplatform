import { Column, Entity, ObjectId, ObjectIdColumn, Index } from 'typeorm';

@Entity('learning_reviews')
@Index(['course_id', 'app_key', 'tenant_key'])
@Index(['user_id', 'course_id', 'app_key', 'tenant_key'], { unique: true })
export class LearningReview {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column()
  course_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column()
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
