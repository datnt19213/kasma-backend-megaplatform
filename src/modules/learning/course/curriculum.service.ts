import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningChapter } from '@/entities/learning/learning-chapter.entity';
import { LearningLesson } from '@/entities/learning/learning-lesson.entity';
import { CreateChapterDto, CreateLessonDto } from '@/dto/learning-dto/course.dto';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(LearningChapter, 'postgres')
    private readonly chapterRepo: Repository<LearningChapter>,
    @InjectRepository(LearningLesson, 'postgres')
    private readonly lessonRepo: Repository<LearningLesson>,
  ) {}

  async addChapter(courseId: string, dto: CreateChapterDto, ctx: { app_key: string; tenant_key: string }) {
    const chapter = this.chapterRepo.create({
      ...dto,
      course_id: courseId,
      ...ctx,
    });
    return await this.chapterRepo.save(chapter);
  }

  async addLesson(chapterId: string, dto: CreateLessonDto, ctx: { app_key: string; tenant_key: string }) {
    const lesson = this.lessonRepo.create({
      ...dto,
      chapter_id: chapterId,
      ...ctx,
    });
    return await this.lessonRepo.save(lesson);
  }

  async reorderChapters(chapterIds: string[], ctx: { app_key: string; tenant_key: string }) {
    for (let i = 0; i < chapterIds.length; i++) {
      await this.chapterRepo.update(
        { id: chapterIds[i], app_key: ctx.app_key, tenant_key: ctx.tenant_key },
        { order: i }
      );
    }
    return { success: true };
  }

  async reorderLessons(lessonIds: string[], ctx: { app_key: string; tenant_key: string }) {
    for (let i = 0; i < lessonIds.length; i++) {
      await this.lessonRepo.update(
        { id: lessonIds[i], app_key: ctx.app_key, tenant_key: ctx.tenant_key },
        { order: i }
      );
    }
    return { success: true };
  }
}
