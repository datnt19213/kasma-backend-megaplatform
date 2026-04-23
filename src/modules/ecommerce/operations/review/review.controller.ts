import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReviewService } from './review.service';

@Controller('api/operations/review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  async create(@Body() dto: any, @Req() req: any) {
    const context = {
      userId: req.user.id,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.reviewService.createReview(dto, context);
  }

  @Post('list')
  async list(@Body() body: { productId: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.reviewService.listReviews(body.productId, context);
  }

  @Post('toggle-visibility')
  async toggle(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.reviewService.toggleVisibility(body.id, body.isVisible, context);
  }

  @Post('rating-summary')
  async summary(@Body() body: { productId: string }, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.reviewService.getRatingSummary(body.productId, context);
  }
}
