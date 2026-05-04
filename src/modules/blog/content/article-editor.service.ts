import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, ILike, In } from 'typeorm';
import { BlogArticle, BlogStatus } from '@/entities/blog/blog-article.entity';
import { BlogArticleDetail } from '@/entities/mongo/blog-article-detail.mongo-entity';
import { BlogRevision } from '@/entities/mongo/blog-revision.mongo-entity';
import { BlogRedirect } from '@/entities/blog/blog-redirect.entity';
import { BlogShortlink } from '@/entities/blog/blog-shortlink.entity';
import { RevisionControlService } from './revision-control.service';
import { CreateArticleDto, UpdateArticleDto } from '@/dto/blog-dto/article.dto';
import { ContentSanitizerService } from '@/modules/media/content-sanitizer.service';

@Injectable()
export class ArticleEditorService {
  constructor(
    @InjectRepository(BlogArticle, 'postgres')
    private readonly articleRepo: Repository<BlogArticle>,
    @InjectRepository(BlogRedirect, 'postgres')
    private readonly redirectRepo: Repository<BlogRedirect>,
    @InjectRepository(BlogShortlink, 'postgres')
    private readonly shortlinkRepo: Repository<BlogShortlink>,
    @InjectRepository(BlogArticleDetail, 'mongo')
    private readonly detailRepo: Repository<BlogArticleDetail>,
    @InjectRepository(BlogRevision, 'mongo')
    private readonly revisionRepo: Repository<BlogRevision>,
    private readonly revisionService: RevisionControlService,
    private readonly sanitizer: ContentSanitizerService,
  ) {}

  async searchArticles(query: string, ctx: { app_key: string; tenant_key: string }) {
    // 1. Search in Postgres (Title, Slug)
    const postgresArticles = await this.articleRepo.find({
      where: [
        { title: ILike(`%${query}%`), app_key: ctx.app_key, tenant_key: ctx.tenant_key },
        { slug: ILike(`%${query}%`), app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      ],
    });

    // 2. Search in Mongo (Content)
    const mongoDetails = await this.detailRepo.find({
      where: {
        content: { $regex: query, $options: 'i' } as any,
      },
    });

    const mongoArticleIds = mongoDetails.map(d => d.article_id);
    
    // 3. Combine results
    const combinedIds = Array.from(new Set([
      ...postgresArticles.map(a => a.id),
      ...mongoArticleIds
    ]));

    if (combinedIds.length === 0) return [];

    return await this.articleRepo.find({
      where: { id: In(combinedIds), app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['category'],
    });
  }

  async createArticle(data: CreateArticleDto, authorId: string, ctx: { app_key: string; tenant_key: string }) {
    // 0. Validate slug uniqueness for this tenant/app
    const existing = await this.articleRepo.findOne({
      where: { slug: data.slug, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (existing) throw new ConflictException(`Slug "${data.slug}" already exists for this app`);

    // 1. Create Postgres Article (Core)
    const article = this.articleRepo.create({
      title: data.title,
      slug: data.slug,
      status: data.status || BlogStatus.DRAFT,
      post_format: data.post_format,
      featuredImage: data.featuredImage,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      authorId: authorId,
      categoryId: data.categoryId,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    const savedArticle = await this.articleRepo.save(article);

    try {
      // 2. Create Mongo Article Detail
      const detail = this.detailRepo.create({
        article_id: savedArticle.id,
        content: this.sanitizer.sanitize(data.content),
        summary: data.summary,
        format_data: data.format_data,
        seo: data.seo,
        custom_fields: data.custom_fields,
      });
      await this.detailRepo.save(detail);

      this.logAction('create', authorId, ctx);
      return { ...savedArticle, detail };
    } catch (error) {
      // ROLLBACK Postgres if Mongo fails
      await this.articleRepo.delete(savedArticle.id);
      throw error;
    }
  }

  async updateArticle(id: string, data: UpdateArticleDto, authorId: string, ctx: { app_key: string; tenant_key: string }) {
    const article = await this.articleRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!article) throw new NotFoundException('Article not found');

    const detail = await this.detailRepo.findOne({
      where: { article_id: id } as FindOptionsWhere<BlogArticleDetail>,
    });

    // Save revision BEFORE update
    if (detail) {
      await this.revisionService.createRevision(article, detail, authorId, data.revision_note);
    }

    const oldSlug = article.slug;
    const isSlugChanged = data.slug && data.slug !== oldSlug;

    // Update Postgres
    Object.assign(article, {
      title: data.title ?? article.title,
      slug: data.slug ?? article.slug,
      status: data.status ?? article.status,
      post_format: data.post_format ?? article.post_format,
      featuredImage: data.featuredImage ?? article.featuredImage,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : article.publishedAt,
      categoryId: data.categoryId ?? article.categoryId,
    });
    await this.articleRepo.save(article);

    // If slug changed, create redirect
    if (isSlugChanged) {
      await this.redirectRepo.save(this.redirectRepo.create({
        old_slug: oldSlug,
        new_slug: data.slug,
        article_id: id,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
        redirect_type: '301',
      }));
    }

    // Update Mongo
    const detailRecord = await this.detailRepo.findOne({
      where: { article_id: id } as FindOptionsWhere<BlogArticleDetail>,
    });
    if (detailRecord) {
      detailRecord.content = data.content ? this.sanitizer.sanitize(data.content) : detailRecord.content;
      detailRecord.summary = data.summary ?? detailRecord.summary;
      detailRecord.format_data = data.format_data ?? detailRecord.format_data;
      detailRecord.seo = data.seo ?? detailRecord.seo;
      detailRecord.custom_fields = data.custom_fields ?? detailRecord.custom_fields;
      await this.detailRepo.save(detailRecord);
    }

    this.logAction('update', authorId, ctx);
    return { ...article, detail: detailRecord };
  }

  async getArticle(id: string, ctx: { app_key: string; tenant_key: string }) {
    const article = await this.articleRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['category', 'tags', 'author'],
    });
    if (!article) throw new NotFoundException('Article not found');

    const detail = await this.detailRepo.findOne({
      where: { article_id: id } as FindOptionsWhere<BlogArticleDetail>,
    });

    return { ...article, detail };
  }

  async listArticles(ctx: { app_key: string; tenant_key: string }) {
    return await this.articleRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['category', 'author'],
      order: { created_at: 'DESC' },
    });
  }

  async deleteArticle(id: string, authorId: string, ctx: { app_key: string; tenant_key: string }) {
    const article = await this.articleRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!article) throw new NotFoundException('Article not found');

    await this.articleRepo.delete(id);
    await this.detailRepo.delete({ article_id: id } as FindOptionsWhere<BlogArticleDetail>);
    
    // Clean up associated data
    await this.revisionRepo.delete({ article_id: id } as any);
    await this.redirectRepo.delete({ article_id: id, app_key: ctx.app_key, tenant_key: ctx.tenant_key });
    await this.shortlinkRepo.delete({ target_url: ILike(`%${article.slug}%`), app_key: ctx.app_key, tenant_key: ctx.tenant_key });

    this.logAction('delete', authorId, ctx);
    return { success: true };
  }

  private logAction(action: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    // Simulated Kasma Audit Log Call
    // Endpoint: /api/audit-logs?action=<action>&range=now&userId=<userId>
    console.log(`[AUDIT LOG] Action: ${action}, User: ${userId}, App: ${ctx.app_key}, Tenant: ${ctx.tenant_key}`);
  }
}
