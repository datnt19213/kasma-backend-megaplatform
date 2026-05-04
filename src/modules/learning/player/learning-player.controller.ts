import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LearningExperienceService } from './learning-experience.service';
import { NoteTakingService } from './note-taking.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/player')
@UseGuards(JwtAuthGuard)
export class LearningPlayerController {
  constructor(
    private readonly experienceService: LearningExperienceService,
    private readonly noteService: NoteTakingService,
  ) {}

  @Get('lesson/:id')
  async getLesson(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.experienceService.checkAccess(id, req.user.id, ctx);
  }

  @Post('progress')
  async updateProgress(
    @Body() data: { lesson_id: string; course_id: string; position: number; completed?: boolean },
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.experienceService.updateProgress(data, req.user.id, ctx);
  }

  @Get('course/:id/progress')
  async getCourseProgress(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.experienceService.getCourseProgress(id, req.user.id, ctx);
  }

  @Post('notes')
  async addNote(
    @Body() data: { lesson_id: string; timestamp: number; content: string },
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.noteService.createNote(data, req.user.id, ctx);
  }

  @Get('lesson/:id/notes')
  async getNotes(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.noteService.getMyNotes(id, req.user.id, ctx);
  }

  @Delete('notes/:id')
  async deleteNote(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.noteService.deleteNote(id, req.user.id, ctx);
  }
}
