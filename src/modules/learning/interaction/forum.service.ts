import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningForumThread } from '@/entities/mongo/learning-forum-thread.mongo-entity';
import { LearningForumComment } from '@/entities/mongo/learning-forum-comment.mongo-entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(LearningForumThread, 'mongo')
    private readonly threadRepo: Repository<LearningForumThread>,
    @InjectRepository(LearningForumComment, 'mongo')
    private readonly commentRepo: Repository<LearningForumComment>,
  ) {}

  async createThread(data: Partial<LearningForumThread>, ctx: { app_key: string; tenant_key: string }) {
    const thread = this.threadRepo.create({ ...data, ...ctx });
    return await this.threadRepo.save(thread);
  }

  async addComment(threadId: string, data: Partial<LearningForumComment>, ctx: { app_key: string; tenant_key: string }) {
    const thread = await this.threadRepo.findOne({ where: { _id: threadId } as any });
    if (!thread) throw new NotFoundException('Thread not found');

    const comment = this.commentRepo.create({ ...data, thread_id: threadId, ...ctx });
    return await this.commentRepo.save(comment);
  }

  async getThreadsByLesson(lessonId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.threadRepo.find({
      where: { lesson_id: lessonId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
      order: { created_at: 'DESC' } as any,
    });
  }

  async getCommentsByThread(threadId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.commentRepo.find({
      where: { thread_id: threadId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
      order: { created_at: 'ASC' } as any,
    });
  }
}
