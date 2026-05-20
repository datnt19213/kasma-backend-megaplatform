import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { resolveSocialContext } from '../common/social-context';
import { TrendingService } from './trending.service';

interface RequestWithUser extends Request {
  user?: { id?: string; sub?: string; app_key?: string; tenant_key?: string };
}

@Controller('api/social/trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get('topics')
  @UseGuards(JwtAuthGuard)
  getTrendingTopics(
    @Req() req: RequestWithUser,
    @Query('hours') hours?: string,
    @Query('limit') limit?: string,
  ) {
    const { ctx } = resolveSocialContext(req);
    return this.trendingService.getTrendingTopics(
      ctx,
      hours !== undefined ? +hours : undefined,
      limit !== undefined ? +limit : undefined,
    );
  }

  @Get('hashtags/search')
  @UseGuards(JwtAuthGuard)
  searchHashtags(
    @Req() req: RequestWithUser,
    @Query('q') q: string,
    @Query('hours') hours?: string,
    @Query('limit') limit?: string,
  ) {
    const { ctx } = resolveSocialContext(req);
    return this.trendingService.searchHashtags(
      ctx,
      q ?? '',
      hours !== undefined ? +hours : undefined,
      limit !== undefined ? +limit : undefined,
    );
  }

  @Get('hashtags/:slug/posts')
  @UseGuards(JwtAuthGuard)
  listPostsByHashtag(
    @Req() req: RequestWithUser,
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { userId, ctx } = resolveSocialContext(req);
    return this.trendingService.listPostsForHashtag(
      slug,
      userId,
      ctx,
      page !== undefined ? +page : undefined,
      limit !== undefined ? +limit : undefined,
    );
  }
}
