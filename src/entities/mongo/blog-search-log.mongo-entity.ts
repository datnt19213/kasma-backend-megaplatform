import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('BlogSearchLog')
export class BlogSearchLog {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  query: string;

  @Column({ default: 0 })
  results_count: number;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @CreateDateColumn()
  created_at: Date;
}
