import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogArticle, BlogStatus } from '@/entities/blog/blog-article.entity';
import { BlogShortlink } from '@/entities/blog/blog-shortlink.entity';
import { ArticleEditorService } from '../content/article-editor.service';
import { CreateArticleDto } from '@/dto/blog-dto/article.dto';

@Injectable()
export class AdvancedService {
  constructor(
    @InjectRepository(BlogArticle, 'postgres')
    private readonly articleRepo: Repository<BlogArticle>,
    @InjectRepository(BlogShortlink, 'postgres')
    private readonly shortlinkRepo: Repository<BlogShortlink>,
    private readonly articleEditor: ArticleEditorService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // --- RSS FEED ---
  async generateRSS(ctx: { app_key: string; tenant_key: string }, siteUrl: string) {
    const cacheKey = `rss_${ctx.app_key}_${ctx.tenant_key}`;
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) return cached;

    const articles = await this.articleRepo.find({
      where: { status: BlogStatus.PUBLISHED, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      order: { publishedAt: 'DESC' },
      take: 20,
    });

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Kasma Blog - ${ctx.app_key}</title>
  <link>${siteUrl}</link>
  <description>Latest articles from Kasma Blog</description>
  <language>en-us</language>`;

    articles.forEach(article => {
      rss += `
  <item>
    <title>${article.title}</title>
    <link>${siteUrl}/blog/${article.slug}</link>
    <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
    <guid>${siteUrl}/blog/${article.slug}</guid>
  </item>`;
    });

    rss += `
</channel>
</rss>`;

    await this.cacheManager.set(cacheKey, rss, 3600);
    return rss;
  }

  // --- GUEST POST PORTAL ---
  async submitGuestPost(dto: CreateArticleDto, authorId: string, ctx: { app_key: string; tenant_key: string }) {
    // Force status to PENDING_REVIEW
    const guestDto = { ...dto, status: BlogStatus.PENDING_REVIEW };
    return await this.articleEditor.createArticle(guestDto, authorId, ctx);
  }

  // --- SHORTLINK GENERATOR ---
  async createShortlink(targetUrl: string, ctx: { app_key: string; tenant_key: string }) {
    const code = Math.random().toString(36).substring(2, 8); // Simple base36 code
    const shortlink = this.shortlinkRepo.create({
      code,
      target_url: targetUrl,
      ...ctx,
    });
    return await this.shortlinkRepo.save(shortlink);
  }

  async resolveShortlink(code: string, ctx: { app_key: string; tenant_key: string }) {
    const shortlink = await this.shortlinkRepo.findOne({
      where: { code, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    if (!shortlink) throw new NotFoundException('Shortlink not found');

    shortlink.clicks += 1;
    await this.shortlinkRepo.save(shortlink);

    return shortlink.target_url;
  }
}
