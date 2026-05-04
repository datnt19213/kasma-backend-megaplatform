import { Controller, Get, Post, Body, Param, Req, UseGuards, Query, Header } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdvancedService } from './advanced.service';
import { CreateArticleDto } from '@/dto/blog-dto/article.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/blog/advanced')
export class AdvancedController {
  constructor(private readonly advancedService: AdvancedService) {}

  @Get('rss.xml')
  @Header('Content-Type', 'application/xml')
  async getRSS(@Query('siteUrl') siteUrl: string, @Req() req: RequestWithUser) {
    // Note: Public endpoint, but requires siteUrl. ctx might need to be derived differently or hardcoded for public feeds
    // For now, using mock or req.user if available.
    const ctx = { 
      app_key: req.user?.app_key || 'default_app', 
      tenant_key: req.user?.tenant_key || 'default_tenant' 
    };
    return await this.advancedService.generateRSS(ctx, siteUrl || 'https://kasma.io');
  }

  @Post('guest-submit')
  @UseGuards(JwtAuthGuard)
  async submitGuestPost(@Body() dto: CreateArticleDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.advancedService.submitGuestPost(dto, req.user.id, ctx);
  }

  @Post('shortlink')
  @UseGuards(JwtAuthGuard)
  async createShortlink(@Body('target_url') targetUrl: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.advancedService.createShortlink(targetUrl, ctx);
  }

  @Get('s/:code')
  async resolveShortlink(@Param('code') code: string, @Req() req: RequestWithUser) {
    const ctx = { 
      app_key: req.user?.app_key || 'default_app', 
      tenant_key: req.user?.tenant_key || 'default_tenant' 
    };
    const targetUrl = await this.advancedService.resolveShortlink(code, ctx);
    return { target_url: targetUrl };
  }
}
