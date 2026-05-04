import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SeoService } from './seo.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/blog/seo')
@UseGuards(JwtAuthGuard)
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  async getSitemap(@Req() req: RequestWithUser, @Query('baseUrl') baseUrl: string) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.seoService.generateSitemap(ctx, baseUrl || 'https://kasma-blog.com');
  }

  @Post('analyze')
  async analyze(@Body() body: { content: string; keyword: string }) {
    return await this.seoService.analyzeKeywords(body.content, body.keyword);
  }

  @Get('redirects')
  async getRedirects(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.seoService.getRedirects(ctx);
  }
}
