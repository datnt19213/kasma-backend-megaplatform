import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

export enum QuestionType {
  MCQ = 'MCQ', // Multiple Choice
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE',
}

@Entity('learning_questions')
export class LearningQuestion {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ nullable: true })
  assessment_id: string; // If null, it's in the generic Question Bank

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column()
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';

  @Column()
  topic: string;

  @Column('json')
  content: {
    question_text: string;
    options?: any[]; // For MCQ, Matching
    media_url?: string;
  };

  @Column('json')
  answer_key: any; // Correct answer or criteria

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
