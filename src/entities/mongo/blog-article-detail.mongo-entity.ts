import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('BlogArticleDetail')
export class BlogArticleDetail {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  article_id: string; // Reference to Postgres BlogArticle id

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'json', nullable: true })
  format_data: Record<string, any>; // Dynamic data based on post_format (gallery, video, etc.)

  @Column({ type: 'json', nullable: true })
  seo: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    og_image?: string;
  };

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
