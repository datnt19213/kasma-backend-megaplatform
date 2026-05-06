import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningReview } from '@/entities/mongo/learning-review.mongo-entity';
import { LearningExperienceService } from '../player/learning-experience.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(LearningReview, 'mongo')
    private readonly reviewRepo: Repository<LearningReview>,
    private readonly learningExperienceService: LearningExperienceService,
  ) {}

  async createReview(courseId: string, userId: string, rating: number, comment: string, ctx: { app_key: string; tenant_key: string }) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if user has completed at least 50% of the course
    const progress = await this.learningExperienceService.getCourseProgress(courseId, userId, ctx);
    
    if (progress.percentage < 50) {
      throw new ForbiddenException('Bạn cần hoàn thành ít nhất 50% khóa học để có thể đánh giá.');
    }

    // Check if user already reviewed
    const existingReview = await this.reviewRepo.findOne({
      where: { course_id: courseId, user_id: userId, ...ctx } as any,
    });

    if (existingReview) {
      throw new ForbiddenException('Bạn đã đánh giá khóa học này rồi.');
    }

    const review = this.reviewRepo.create({
      course_id: courseId,
      user_id: userId,
      rating,
      comment,
      ...ctx,
    });

    return await this.reviewRepo.save(review);
  }

  async getCourseReviews(courseId: string, ctx: { app_key: string; tenant_key: string }) {
    const reviews = await this.reviewRepo.find({
      where: { course_id: courseId, ...ctx } as any,
      order: { created_at: 'DESC' } as any,
    });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    return {
      average_rating: avgRating,
      total_reviews: reviews.length,
      data: reviews,
    };
  }
}
