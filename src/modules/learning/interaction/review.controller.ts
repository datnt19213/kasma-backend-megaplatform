import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReviewService } from './review.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/interaction/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':courseId')
  async createReview(
    @Param('courseId') courseId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
    @Req() req: RequestWithUser,
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.reviewService.createReview(courseId, req.user.id, rating, comment, ctx);
  }

  @Get(':courseId')
  async getReviews(
    @Param('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.reviewService.getCourseReviews(courseId, ctx);
  }
}
