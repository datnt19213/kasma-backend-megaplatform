import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningEnrollment, EnrollmentStatus } from '@/entities/learning/learning-enrollment.entity';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(LearningEnrollment, 'postgres')
    private readonly enrollmentRepo: Repository<LearningEnrollment>,
  ) {}

  async updateEnrollmentStatus(id: string, status: EnrollmentStatus, ctx: { app_key: string; tenant_key: string }) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    enrollment.status = status;
    if (status === EnrollmentStatus.ACTIVE) {
      enrollment.approved_at = new Date();
    }
    return await this.enrollmentRepo.save(enrollment);
  }

  async getInstructorStats(ctx: { app_key: string; tenant_key: string }) {
    // Basic stats for the tenant/app
    const totalStudents = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.ACTIVE, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    const revenueResult = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('SUM(e.price_paid)', 'total')
      .where('e.app_key = :app_key AND e.tenant_key = :tenant_key', ctx)
      .getRawOne();

    return {
      total_students: totalStudents,
      total_revenue: parseFloat(revenueResult.total || 0),
    };
  }
}
