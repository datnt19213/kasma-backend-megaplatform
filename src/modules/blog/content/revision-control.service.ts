import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { BlogRevision } from '@/entities/mongo/blog-revision.mongo-entity';
import { BlogArticle } from '@/entities/blog/blog-article.entity';
import { BlogArticleDetail } from '@/entities/mongo/blog-article-detail.mongo-entity';

@Injectable()
export class RevisionControlService {
  constructor(
    @InjectRepository(BlogRevision, 'mongo')
    private readonly revisionRepo: Repository<BlogRevision>,
  ) {}

  async createRevision(
    article: BlogArticle,
    detail: BlogArticleDetail,
    authorId: string,
    note?: string,
  ) {
    const revision = this.revisionRepo.create({
      article_id: article.id,
      article_snapshot: { ...article } as Record<string, unknown>,
      detail_snapshot: { ...detail } as Record<string, unknown>,
      revision_note: note || `Update at ${new Date().toISOString()}`,
      author_id: authorId,
    });
    return await this.revisionRepo.save(revision);
  }

  async getRevisionsByArticle(articleId: string) {
    return await this.revisionRepo.find({
      where: { article_id: articleId } as FindOptionsWhere<BlogRevision>,
      order: { created_at: 'DESC' } as FindOptionsOrder<BlogRevision>,
    });
  }
}
