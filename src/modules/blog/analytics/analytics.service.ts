import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogViewLog } from '@/entities/mongo/blog-view-log.mongo-entity';
import { BlogSearchLog } from '@/entities/mongo/blog-search-log.mongo-entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(BlogViewLog, 'mongo')
    private readonly viewRepo: Repository<BlogViewLog>,
    @InjectRepository(BlogSearchLog, 'mongo')
    private readonly searchRepo: Repository<BlogSearchLog>,
  ) {}

  async recordView(data: { articleId: string; userId?: string; sessionId: string; metadata?: any }, ctx: { app_key: string; tenant_key: string }) {
    const log = this.viewRepo.create({
      article_id: data.articleId,
      user_id: data.userId,
      session_id: data.sessionId,
      metadata: data.metadata,
      ...ctx,
    });
    return await this.viewRepo.save(log);
  }

  async updateHeartbeat(logId: string, duration: number) {
    const log = await this.viewRepo.findOne({ where: { _id: new ObjectId(logId) } as any });
    if (log) {
      log.duration += duration;
      return await this.viewRepo.save(log);
    }
  }

  async logSearch(query: string, resultsCount: number, userId: string | undefined, ctx: { app_key: string; tenant_key: string }) {
    const log = this.searchRepo.create({
      query,
      results_count: resultsCount,
      user_id: userId,
      ...ctx,
    });
    return await this.searchRepo.save(log);
  }

  async getArticleStats(articleId: string) {
    const logs = await this.viewRepo.find({ where: { article_id: articleId } });
    const views = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const avgDuration = views > 0 ? totalDuration / views : 0;
    
    // Bounce rate: % of views with duration < 5 seconds
    const bounces = logs.filter(log => log.duration < 5).length;
    const bounceRate = views > 0 ? (bounces / views) * 100 : 0;

    return {
      views,
      avgDuration: parseFloat(avgDuration.toFixed(2)),
      bounceRate: parseFloat(bounceRate.toFixed(2)),
    };
  }

  async getPopularQueries(ctx: { app_key: string; tenant_key: string }, limit = 10) {
    // Basic aggregation using find and manual grouping if mongo aggregation is too complex for simple repository
    const logs = await this.searchRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.query] = (counts[log.query] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
