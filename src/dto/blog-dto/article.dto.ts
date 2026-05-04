import { IsEnum, IsOptional, IsString, IsArray, IsObject, IsDateString, IsUUID } from 'class-validator';
import { BlogStatus, PostFormat } from '@/entities/blog/blog-article.entity';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsEnum(PostFormat)
  post_format?: PostFormat;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  format_data?: Record<string, any>;

  @IsOptional()
  @IsObject()
  seo?: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    og_image?: string;
  };

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}

export class UpdateArticleDto extends CreateArticleDto {
  @IsOptional()
  @IsString()
  revision_note?: string;
}
