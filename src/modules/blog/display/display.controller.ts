import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DisplayService } from './display.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/blog/display')
@UseGuards(JwtAuthGuard)
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  @Get('menu/:location')
  async getMenu(@Param('location') location: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.displayService.getMenu(location, ctx);
  }

  @Post('menu/save')
  async saveMenu(@Body() data: any, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.displayService.saveMenu(data, ctx);
  }

  @Get('widgets')
  async getWidgets(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.displayService.getWidgets(ctx);
  }

  @Get('related/:articleId')
  async getRelated(@Param('articleId') articleId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.displayService.getRelatedPosts(articleId, ctx);
  }

  @Post('toc')
  async getToC(@Body() body: { content: string }) {
    return this.displayService.generateToC(body.content);
  }
}
