import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningScormPackage } from '@/entities/learning/learning-scorm.entity';

@Injectable()
export class ScormService {
  constructor(
    @InjectRepository(LearningScormPackage, 'postgres')
    private readonly scormRepo: Repository<LearningScormPackage>,
  ) {}

  async registerPackage(data: Partial<LearningScormPackage>, ctx: { app_key: string; tenant_key: string }) {
    const pkg = this.scormRepo.create({ ...data, ...ctx });
    return await this.scormRepo.save(pkg);
  }

  async getPackage(lessonId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.scormRepo.findOne({ where: { lesson_id: lessonId, is_active: true, ...ctx } });
  }

  // xAPI tracking (Simplified: can be expanded to store full statements in MongoDB)
  async trackXApiStatement(statement: any, ctx: { app_key: string; tenant_key: string }) {
    // In a full implementation, we would store this in MongoDB for analytics
    // For now, we log the activity
    console.log(`xAPI Statement received for tenant ${ctx.tenant_key}:`, statement);
    return { success: true, timestamp: new Date() };
  }
}
