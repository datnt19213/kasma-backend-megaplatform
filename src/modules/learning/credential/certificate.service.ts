import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningCertificate } from '@/entities/learning/learning-certificate.entity';
import { LearningProgress } from '@/entities/learning/learning-progress.entity';
import { LearningLesson } from '@/entities/learning/learning-lesson.entity';
import { MediaLibraryService } from '@/modules/media/media-library.service';
import { MediaProviderKey } from '@/config/apps';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(LearningCertificate, 'postgres')
    private readonly certificateRepo: Repository<LearningCertificate>,
    @InjectRepository(LearningProgress, 'postgres')
    private readonly progressRepo: Repository<LearningProgress>,
    @InjectRepository(LearningLesson, 'postgres')
    private readonly lessonRepo: Repository<LearningLesson>,
    private readonly mediaLibrary: MediaLibraryService,
  ) {}

  async checkAndGenerate(userId: string, courseId: string, ctx: { app_key: string; tenant_key: string }) {
    // 1. Check if already exists
    const existing = await this.certificateRepo.findOne({
      where: { user_id: userId, course_id: courseId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (existing) return existing;

    // 2. Check course completion
    const totalLessons = await this.lessonRepo.count({
      where: { chapter: { course_id: courseId }, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });

    const completedLessons = await this.progressRepo.count({
      where: { course_id: courseId, user_id: userId, is_completed: true, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });

    if (totalLessons === 0 || completedLessons < totalLessons) {
      throw new ConflictException('Course not fully completed yet');
    }

    // 3. Generate Verification Code
    const verificationCode = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

    // 4. Create record (PDF generation would be a worker task or external service)
    const certificate = this.certificateRepo.create({
      user_id: userId,
      course_id: courseId,
      verification_code: verificationCode,
      ...ctx,
    });

    return await this.certificateRepo.save(certificate);
  }

  async verify(code: string) {
    const certificate = await this.certificateRepo.findOne({
      where: { verification_code: code },
      relations: ['course'],
    });
    if (!certificate) throw new NotFoundException('Certificate not found or invalid');
    return certificate;
  }

  async getMyCertificates(userId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.certificateRepo.find({
      where: { user_id: userId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['course'],
    });
  }
}
