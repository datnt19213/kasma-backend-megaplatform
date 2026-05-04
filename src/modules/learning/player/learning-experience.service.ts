import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningEnrollment, EnrollmentStatus } from '@/entities/learning/learning-enrollment.entity';
import { LearningProgress } from '@/entities/learning/learning-progress.entity';
import { LearningLesson } from '@/entities/learning/learning-lesson.entity';

@Injectable()
export class LearningExperienceService {
  constructor(
    @InjectRepository(LearningEnrollment, 'postgres')
    private readonly enrollmentRepo: Repository<LearningEnrollment>,
    @InjectRepository(LearningProgress, 'postgres')
    private readonly progressRepo: Repository<LearningProgress>,
    @InjectRepository(LearningLesson, 'postgres')
    private readonly lessonRepo: Repository<LearningLesson>,
  ) {}

  async checkAccess(lessonId: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['chapter'],
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.is_preview) return { access: true, is_preview: true };

    const enrollment = await this.enrollmentRepo.findOne({
      where: { 
        course_id: lesson.chapter.course_id, 
        user_id: userId, 
        status: EnrollmentStatus.ACTIVE,
        app_key: ctx.app_key, 
        tenant_key: ctx.tenant_key 
      },
    });

    if (!enrollment) throw new ForbiddenException('You are not enrolled in this course');

    // Drip Logic
    if (lesson.drip_days > 0) {
      const daysSinceEnrollment = Math.floor((Date.now() - enrollment.enrolled_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceEnrollment < lesson.drip_days) {
        throw new ForbiddenException(`This lesson will be unlocked in ${lesson.drip_days - daysSinceEnrollment} days`);
      }
    }

    return { access: true, is_preview: false };
  }

  async updateProgress(data: { lesson_id: string; course_id: string; position: number; completed?: boolean }, userId: string, ctx: { app_key: string; tenant_key: string }) {
    let progress = await this.progressRepo.findOne({
      where: { user_id: userId, lesson_id: data.lesson_id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        user_id: userId,
        course_id: data.course_id,
        lesson_id: data.lesson_id,
        ...ctx,
      });
    }

    progress.last_position = data.position;
    if (data.completed && !progress.is_completed) {
      progress.is_completed = true;
      progress.completed_at = new Date();
    }

    return await this.progressRepo.save(progress);
  }

  async getCourseProgress(courseId: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const totalLessons = await this.lessonRepo.count({
      where: { chapter: { course_id: courseId }, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });

    const completedLessons = await this.progressRepo.count({
      where: { course_id: courseId, user_id: userId, is_completed: true, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      total: totalLessons,
      completed: completedLessons,
      percentage: Math.round(percentage),
    };
  }
}
