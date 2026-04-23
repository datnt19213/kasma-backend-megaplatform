import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReview } from '@/entities/operations/product-review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ProductReview, 'postgres')
    private readonly reviewRepo: Repository<ProductReview>,
  ) {}

  async createReview(dto: any, context: { userId: string; app_key: string; tenant_key: string }) {
    const review = this.reviewRepo.create({
      ...dto,
      userId: context.userId,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    return await this.reviewRepo.save(review);
  }

  async listReviews(productId: string, context: { app_key: string; tenant_key: string }) {
    return await this.reviewRepo.find({
      where: { productId, app_key: context.app_key, tenant_key: context.tenant_key, isVisible: true },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async toggleVisibility(id: string, isVisible: boolean, context: { app_key: string; tenant_key: string }) {
    await this.reviewRepo.update(
      { id, app_key: context.app_key, tenant_key: context.tenant_key },
      { isVisible }
    );
    return { success: true };
  }

  async getRatingSummary(productId: string, context: { app_key: string; tenant_key: string }) {
    const reviews = await this.reviewRepo.find({
      where: { productId, app_key: context.app_key, tenant_key: context.tenant_key, isVisible: true }
    });

    if (reviews.length === 0) return { averageRating: 0, totalReviews: 0 };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      averageRating: parseFloat((sum / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
    };
  }
}
