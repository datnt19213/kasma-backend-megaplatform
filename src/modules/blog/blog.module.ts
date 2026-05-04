import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogArticle } from '@/entities/blog/blog-article.entity';
import { BlogCategory } from '@/entities/blog/blog-category.entity';
import { BlogTag } from '@/entities/blog/blog-tag.entity';
import { BlogRedirect } from '@/entities/blog/blog-redirect.entity';
import { BlogMenu } from '@/entities/blog/blog-menu.entity';
import { BlogWidget } from '@/entities/blog/blog-widget.entity';
import { BlogArticleDetail } from '@/entities/mongo/blog-article-detail.mongo-entity';
import { BlogRevision } from '@/entities/mongo/blog-revision.mongo-entity';
import { BlogViewLog } from '@/entities/mongo/blog-view-log.mongo-entity';
import { BlogSearchLog } from '@/entities/mongo/blog-search-log.mongo-entity';

import { ArticleEditorService } from './content/article-editor.service';
import { ArticleEditorController } from './content/article-editor.controller';
import { TaxonomyService } from './taxonomy/taxonomy.service';
import { TaxonomyController } from './taxonomy/taxonomy.controller';
import { RevisionControlService } from './content/revision-control.service';
import { SchedulingService } from './content/scheduling.service';
import { RevisionCleanupService } from './content/revision-cleanup.service';
import { SeoService } from './seo/seo.service';
import { SeoController } from './seo/seo.controller';
import { DisplayService } from './display/display.service';
import { DisplayController } from './display/display.controller';
import { BlogShortlink } from '@/entities/blog/blog-shortlink.entity';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AdvancedService } from './advanced/advanced.service';
import { AdvancedController } from './advanced/advanced.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogArticle, BlogCategory, BlogTag, BlogRedirect, BlogMenu, BlogWidget, BlogShortlink
    ], 'postgres'),
    TypeOrmModule.forFeature([
      BlogArticleDetail, BlogRevision, BlogViewLog, BlogSearchLog
    ], 'mongo'),
  ],
  controllers: [
    ArticleEditorController, TaxonomyController, SeoController, DisplayController, AnalyticsController, AdvancedController
  ],
  providers: [
    ArticleEditorService,
    TaxonomyService,
    RevisionControlService,
    SchedulingService,
    RevisionCleanupService,
    SeoService,
    DisplayService,
    AnalyticsService,
    AdvancedService,
  ],
  exports: [ArticleEditorService, TaxonomyService],
})
export class BlogModule {}
