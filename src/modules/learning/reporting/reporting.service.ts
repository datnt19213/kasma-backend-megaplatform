import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningEnrollment, EnrollmentStatus } from '@/entities/learning/learning-enrollment.entity';
import { LearningAttempt } from '@/entities/learning/learning-attempt.entity';
import { LearningProgress } from '@/entities/learning/learning-progress.entity';
import { LearningForumComment } from '@/entities/mongo/learning-forum-comment.mongo-entity';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(LearningEnrollment, 'postgres')
    private readonly enrollmentRepo: Repository<LearningEnrollment>,
    @InjectRepository(LearningAttempt, 'postgres')
    private readonly attemptRepo: Repository<LearningAttempt>,
    @InjectRepository(LearningProgress, 'postgres')
    private readonly progressRepo: Repository<LearningProgress>,
    @InjectRepository(LearningForumComment, 'mongo')
    private readonly commentRepo: Repository<LearningForumComment>,
  ) {}

  async getCoursePerformance(courseId: string, ctx: { app_key: string; tenant_key: string }) {
    const totalEnrolled = await this.enrollmentRepo.count({
      where: { course_id: courseId, status: EnrollmentStatus.ACTIVE, ...ctx },
    });

    const revenueResult = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('SUM(e.price_paid)', 'total')
      .where('e.course_id = :courseId AND e.status = :status AND e.app_key = :app_key AND e.tenant_key = :tenant_key', {
        courseId,
        status: EnrollmentStatus.ACTIVE,
        ...ctx,
      })
      .getRawOne();

    const avgScoreResult = await this.attemptRepo
      .createQueryBuilder('a')
      .innerJoin('learning_assessments', 'ass', 'a.assessment_id = ass.id')
      .select('AVG(a.score)', 'avgScore')
      .where('ass.course_id = :courseId AND a.app_key = :app_key AND a.tenant_key = :tenant_key', {
        courseId,
        ...ctx,
      })
      .getRawOne();

    // Interaction metric: Total comments for threads linked to this course's lessons
    // (Simplified for now: count all comments by tenant for brevity, or join if possible)
    const interactionCount = await this.commentRepo.count({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });

    return {
      total_students: totalEnrolled,
      total_revenue: parseFloat(revenueResult?.total || 0),
      average_assessment_score: parseFloat(avgScoreResult?.avgScore || 0),
      interaction_volume: interactionCount,
    };
  }

  async getLearnerReport(studentId: string, ctx: { app_key: string; tenant_key: string }) {
    const enrollments = await this.enrollmentRepo.find({
      where: { user_id: studentId, status: EnrollmentStatus.ACTIVE, ...ctx },
      relations: ['course'],
    });

    const courseReports = await Promise.all(
      enrollments.map(async (enrol) => {
        const progress = await this.progressRepo.count({
          where: { course_id: enrol.course_id, user_id: studentId, is_completed: true, ...ctx },
        });

        const bestAttempt = await this.attemptRepo
          .createQueryBuilder('a')
          .innerJoin('learning_assessments', 'ass', 'a.assessment_id = ass.id')
          .select('MAX(a.score)', 'maxScore')
          .where('a.user_id = :studentId AND ass.course_id = :courseId', {
            studentId,
            courseId: enrol.course_id,
          })
          .getRawOne();

        return {
          course_id: enrol.course_id,
          course_title: enrol.course?.title,
          lessons_completed: progress,
          best_score: parseFloat(bestAttempt?.maxScore || 0),
        };
      }),
    );

    return {
      student_id: studentId,
      enrolled_courses: enrollments.length,
      activity: courseReports,
    };
  }
}
