import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BlogArticle, BlogStatus } from '@/entities/blog/blog-article.entity';
import { BlogRedirect } from '@/entities/blog/blog-redirect.entity';

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(BlogArticle, 'postgres')
    private readonly articleRepo: Repository<BlogArticle>,
    @InjectRepository(BlogRedirect, 'postgres')
    private readonly redirectRepo: Repository<BlogRedirect>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async generateSitemap(ctx: { app_key: string; tenant_key: string }, baseUrl: string) {
    const cacheKey = `sitemap_${ctx.app_key}_${ctx.tenant_key}`;
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) return cached;

    const articles = await this.articleRepo.find({
      where: { 
        app_key: ctx.app_key, 
        tenant_key: ctx.tenant_key,
        status: BlogStatus.PUBLISHED 
      },
      select: ['slug', 'updated_at'],
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const article of articles) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${article.slug}</loc>\n`;
      xml += `    <lastmod>${article.updated_at.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    await this.cacheManager.set(cacheKey, xml, 3600); // 1 hour
    return xml;
  }

  async analyzeKeywords(content: string, mainKeyword: string) {
    if (!content || !mainKeyword) return { density: 0, suggestions: [] };

    const text = content.replace(/<[^>]*>/g, ' ').toLowerCase();
    const keyword = mainKeyword.toLowerCase();
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // Simple density check (this is a basic simulation)
    const occurrences = (text.match(new RegExp(keyword, 'g')) || []).length;
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;

    const suggestions: string[] = [];
    if (density < 0.5) suggestions.push('Keyword density is too low. Try mentioning it more.');
    if (density > 3) suggestions.push('Keyword density is too high (Keyword stuffing). Reduce occurrences.');
    if (wordCount < 300) suggestions.push('Content length is short. Aim for at least 300-500 words.');

    return {
      wordCount,
      occurrences,
      density: parseFloat(density.toFixed(2)),
      suggestions,
    };
  }

  async getRedirects(ctx: { app_key: string; tenant_key: string }) {
    return await this.redirectRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      order: { created_at: 'DESC' },
    });
  }
}
