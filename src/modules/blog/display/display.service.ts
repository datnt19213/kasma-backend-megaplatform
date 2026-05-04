import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogMenu } from '@/entities/blog/blog-menu.entity';
import { BlogWidget } from '@/entities/blog/blog-widget.entity';
import { BlogArticle, BlogStatus } from '@/entities/blog/blog-article.entity';

@Injectable()
export class DisplayService {
  constructor(
    @InjectRepository(BlogMenu, 'postgres')
    private readonly menuRepo: Repository<BlogMenu>,
    @InjectRepository(BlogWidget, 'postgres')
    private readonly widgetRepo: Repository<BlogWidget>,
    @InjectRepository(BlogArticle, 'postgres')
    private readonly articleRepo: Repository<BlogArticle>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // --- MENU ---
  async getMenu(location: string, ctx: { app_key: string; tenant_key: string }) {
    const cacheKey = `menu_${location}_${ctx.app_key}_${ctx.tenant_key}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const menu = await this.menuRepo.findOne({
      where: { location, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    if (menu) {
      await this.cacheManager.set(cacheKey, menu, 86400); // 24 hours
    }

    return menu;
  }

  async saveMenu(data: { name: string; slug: string; location: string; items: any[] }, ctx: { app_key: string; tenant_key: string }) {
    let menu = await this.menuRepo.findOne({
      where: { slug: data.slug, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    if (menu) {
      Object.assign(menu, data);
    } else {
      menu = this.menuRepo.create({ ...data, ...ctx });
    }

    const saved = await this.menuRepo.save(menu);
    
    // Invalidate cache
    const cacheKey = `menu_${data.location}_${ctx.app_key}_${ctx.tenant_key}`;
    await this.cacheManager.del(cacheKey);

    return saved;
  }

  // --- WIDGETS ---
  async getWidgets(ctx: { app_key: string; tenant_key: string }) {
    return await this.widgetRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key, is_active: true },
      order: { order: 'ASC' },
    });
  }

  // --- TOC ---
  generateToC(content: string) {
    if (!content) return [];
    
    // Extract H1, H2, H3 tags
    const headers: { level: number; text: string; id: string }[] = [];
    const headerRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, ''); // Strip inner HTML
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      headers.push({ level, text, id });
    }

    return headers;
  }

  // --- RELATED POSTS ---
  async getRelatedPosts(articleId: string, ctx: { app_key: string; tenant_key: string }, limit = 4) {
    const article = await this.articleRepo.findOne({
      where: { id: articleId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['tags'],
    });

    if (!article) return [];

    const tagIds = article.tags.map(t => t.id);

    // Find articles with similar tags, excluding the current one
    return await this.articleRepo.createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.id != :id', { id: articleId })
      .andWhere('article.app_key = :appKey', { appKey: ctx.app_key })
      .andWhere('article.tenant_key = :tenantKey', { tenantKey: ctx.tenant_key })
      .andWhere('article.status = :status', { status: BlogStatus.PUBLISHED })
      .andWhere('tag.id IN (:...tagIds)', { tagIds: tagIds.length > 0 ? tagIds : ['dummy-id'] })
      .orderBy('article.publishedAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
