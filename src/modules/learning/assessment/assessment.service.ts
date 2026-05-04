import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningAssessment, AssessmentType } from '@/entities/learning/learning-assessment.entity';
import { LearningAttempt, AttemptStatus } from '@/entities/learning/learning-attempt.entity';
import { LearningQuestion } from '@/entities/mongo/learning-question.mongo-entity';
import { LearningSubmission } from '@/entities/mongo/learning-submission.mongo-entity';
import { GradingService } from './grading.service';
import { MediaLibraryService } from '@/modules/media/media-library.service';
import { MediaProviderKey } from '@/config/apps';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(LearningAssessment, 'postgres')
    private readonly assessmentRepo: Repository<LearningAssessment>,
    @InjectRepository(LearningAttempt, 'postgres')
    private readonly attemptRepo: Repository<LearningAttempt>,
    @InjectRepository(LearningQuestion, 'mongo')
    private readonly questionRepo: Repository<LearningQuestion>,
    @InjectRepository(LearningSubmission, 'mongo')
    private readonly submissionRepo: Repository<LearningSubmission>,
    private readonly gradingService: GradingService,
    private readonly mediaLibrary: MediaLibraryService,
  ) {}

  async startAttempt(assessmentId: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const attemptCount = await this.attemptRepo.count({
      where: { assessment_id: assessmentId, user_id: userId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (attemptCount >= assessment.max_attempts) throw new BadRequestException('Max attempts reached');

    const attempt = this.attemptRepo.create({
      assessment_id: assessmentId,
      user_id: userId,
      ...ctx,
    });
    return await this.attemptRepo.save(attempt);
  }

  async submitAssessment(attemptId: string, answers: any, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, user_id: userId, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['assessment'],
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== AttemptStatus.IN_PROGRESS) throw new BadRequestException('Attempt already closed');

    const questions = await this.questionRepo.find({
      where: { assessment_id: attempt.assessment_id, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });

    const grading = await this.gradingService.autoGrade(questions, answers);

    attempt.score = grading.score;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.completed_at = new Date();

    const submission = this.submissionRepo.create({
      attempt_id: attemptId,
      user_id: userId,
      assessment_id: attempt.assessment_id,
      answers,
      ...ctx,
    });

    await this.submissionRepo.save(submission);
    return await this.attemptRepo.save(attempt);
  }

  async uploadAssignment(attemptId: string, file: Express.Multer.File, provider: MediaProviderKey, userId: string, ctx: { app_key: string; tenant_key: string }) {
    const result = await this.mediaLibrary.uploadFile(file, provider, ctx);

    let submission = await this.submissionRepo.findOne({
      where: { attempt_id: attemptId, user_id: userId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });

    if (!submission) {
      submission = this.submissionRepo.create({
        attempt_id: attemptId,
        user_id: userId,
        answers: {},
        attachments: [],
        ...ctx,
      });
    }

    submission.attachments = submission.attachments || [];
    submission.attachments.push({
      url: result.url,
      provider: result.provider,
      name: file.originalname,
    });

    return await this.submissionRepo.save(submission);
  }
}
