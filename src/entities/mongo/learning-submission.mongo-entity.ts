import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('learning_submissions')
export class LearningSubmission {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  attempt_id: string;

  @Column()
  user_id: string;

  @Column()
  assessment_id: string;

  @Column('json')
  answers: any; // Key-value of question_id and student response

  @Column('json', { nullable: true })
  attachments: {
    url: string;
    provider: string; // KEDIA or CLOUDINARY
    name: string;
  }[];

  @Column({ type: 'text', nullable: true })
  instructor_feedback: string;

  @Column({ type: 'decimal', nullable: true })
  manual_grade: number;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
