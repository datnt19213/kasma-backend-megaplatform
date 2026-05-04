import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
} from 'typeorm';

@Entity('BlogRevision')
export class BlogRevision {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  article_id: string; // Reference to Postgres BlogArticle id

  @Column({ type: 'json' })
  article_snapshot: Record<string, any>; // Snapshot of Postgres data

  @Column({ type: 'json' })
  detail_snapshot: Record<string, any>; // Snapshot of Mongo detail data

  @Column({ nullable: true })
  revision_note: string;

  @Column()
  author_id: string;

  @CreateDateColumn()
  created_at: Date;
}
