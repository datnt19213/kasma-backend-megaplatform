import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ArticleEditorService } from './article-editor.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateArticleDto, UpdateArticleDto } from '@/dto/blog-dto/article.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/blog/articles')
@UseGuards(JwtAuthGuard)
export class ArticleEditorController {
  constructor(
    private readonly articleService: ArticleEditorService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('search')
  async search(@Query('q') q: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    const results = await this.articleService.searchArticles(q, ctx);
    
    // Log the search query automatically
    await this.analyticsService.logSearch(q, results.length, req.user.id, ctx);
    
    return results;
  }

  @Get()
  async list(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.articleService.listArticles(ctx);
  }

  @Post('create')
  async create(@Body() data: CreateArticleDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.articleService.createArticle(data, req.user.id, ctx);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.articleService.getArticle(id, ctx);
  }

  @Post(':id/update')
  async update(@Param('id') id: string, @Body() data: UpdateArticleDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.articleService.updateArticle(id, data, req.user.id, ctx);
  }

  @Post(':id/delete')
  async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.articleService.deleteArticle(id, req.user.id, ctx);
  }
}
