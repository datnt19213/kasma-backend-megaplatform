import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { BlogArticle, BlogStatus } from '@/entities/blog/blog-article.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectRepository(BlogArticle, 'postgres')
    private readonly articleRepo: Repository<BlogArticle>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledPosts() {
    this.logger.debug('Checking for scheduled articles to publish...');
    const now = new Date();
    const scheduledPosts = await this.articleRepo.find({
      where: {
        status: BlogStatus.SCHEDULED,
        publishedAt: LessThanOrEqual(now),
      },
    });

    if (scheduledPosts.length > 0) {
      this.logger.log(`Found ${scheduledPosts.length} articles to publish.`);
      for (const post of scheduledPosts) {
        post.status = BlogStatus.PUBLISHED;
        await this.articleRepo.save(post);
        this.logger.log(`Article "${post.title}" (ID: ${post.id}) has been published.`);
      }
    }
  }
}
