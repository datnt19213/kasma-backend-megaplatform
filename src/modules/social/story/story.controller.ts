import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { StoryService, CreateStoryDto } from './story.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/social/stories')
@UseGuards(JwtAuthGuard)
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  async createStory(@Body() dto: CreateStoryDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.storyService.createStory(req.user.id, dto, ctx);
  }

  @Get('author/:authorId')
  async getActiveStoriesByAuthor(@Param('authorId') authorId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.storyService.getActiveStoriesByAuthor(authorId, ctx);
  }

  @Post(':id/view')
  async viewStory(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.storyService.viewStory(id, ctx);
  }

  @Delete(':id')
  async deleteStory(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return this.storyService.deleteStory(id, req.user.id, ctx);
  }
}
