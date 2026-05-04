import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { MultiTenantEntity } from '../base/multi-tenant.entity';
import { BlogCategory } from './blog-category.entity';
import { BlogTag } from './blog-tag.entity';
import { User } from '../user.entity';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
}

export enum PostFormat {
  STANDARD = 'STANDARD',
  VIDEO = 'VIDEO',
  GALLERY = 'GALLERY',
  AUDIO = 'AUDIO',
  QUOTE = 'QUOTE',
}

@Entity('blog_articles')
export class BlogArticle extends MultiTenantEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: BlogStatus, default: BlogStatus.DRAFT })
  status: BlogStatus;

  @Column({ type: 'enum', enum: PostFormat, default: PostFormat.STANDARD })
  post_format: PostFormat;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => BlogCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: BlogCategory;

  @ManyToMany(() => BlogTag)
  @JoinTable({
    name: 'blog_article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: BlogTag[];
}
