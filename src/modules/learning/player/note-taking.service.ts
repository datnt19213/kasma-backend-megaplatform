import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningNote } from '@/entities/mongo/learning-note.mongo-entity';

@Injectable()
export class NoteTakingService {
  constructor(
    @InjectRepository(LearningNote, 'mongo')
    private readonly noteRepo: Repository<LearningNote>,
  ) {}

  async createNote(data: { lesson_id: string; timestamp: number; content: string }, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const note = this.noteRepo.create({
      ...data,
      user_id: userId,
      ...ctx,
    });
    return await this.noteRepo.save(note);
  }

  async getMyNotes(lessonId: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.noteRepo.find({
      where: { lesson_id: lessonId, user_id: userId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
      order: { timestamp: 'ASC' } as any,
    });
  }

  async deleteNote(id: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const note = await this.noteRepo.findOne({
      where: { id, user_id: userId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });
    if (note) {
      return await this.noteRepo.remove(note);
    }
  }
}
