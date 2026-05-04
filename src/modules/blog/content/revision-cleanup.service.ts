import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlogRevision } from '@/entities/mongo/blog-revision.mongo-entity';

@Injectable()
export class RevisionCleanupService {
  private readonly logger = new Logger(RevisionCleanupService.name);

  constructor(
    @InjectRepository(BlogRevision, 'mongo')
    private readonly revisionRepo: Repository<BlogRevision>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldRevisions() {
    this.logger.log('Starting scheduled cleanup of old blog revisions...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const result = await this.revisionRepo.delete({
        created_at: { $lt: thirtyDaysAgo } as any,
      });

      this.logger.log(`Cleanup complete. Removed revisions older than ${thirtyDaysAgo.toISOString()}.`);
    } catch (error) {
      this.logger.error('Failed to cleanup old revisions:', error.stack);
    }
  }
}
