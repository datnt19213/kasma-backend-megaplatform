import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateCategoryDto, CreateTagDto } from '@/dto/blog-dto/taxonomy.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/blog/taxonomy')
@UseGuards(JwtAuthGuard)
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('categories')
  async getCategories(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.taxonomyService.getCategories(ctx);
  }

  @Post('categories/create')
  async createCategory(@Body() data: CreateCategoryDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.taxonomyService.createCategory({
      ...data,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
  }

  @Get('tags')
  async getTags(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.taxonomyService.getTags(ctx);
  }

  @Post('tags/create')
  async createTag(@Body() data: CreateTagDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.taxonomyService.createTag({
      ...data,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
  }
}
