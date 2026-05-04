import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity('BlogViewLog')
export class BlogViewLog {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  article_id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  session_id: string;

  @Column({ default: 0 })
  duration: number; // in seconds

  @Column()
  app_key: string;

  @Column()
  tenant_key: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // browser, device, ip, etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
