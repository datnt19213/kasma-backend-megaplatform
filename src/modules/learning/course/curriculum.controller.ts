import { Controller, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Query, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurriculumService } from './curriculum.service';
import { MaterialService } from './material.service';
import { CreateChapterDto, CreateLessonDto } from '@/dto/learning-dto/course.dto';
import { MaterialType } from '@/entities/mongo/learning-material.mongo-entity';
import { MediaProviderKey } from '@/config/apps';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/curriculum')
@UseGuards(JwtAuthGuard)
export class CurriculumController {
  constructor(
    private readonly curriculumService: CurriculumService,
    private readonly materialService: MaterialService,
  ) {}

  @Post('course/:courseId/chapters')
  async addChapter(@Param('courseId') courseId: string, @Body() dto: CreateChapterDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.curriculumService.addChapter(courseId, dto, ctx);
  }

  @Post('chapter/:chapterId/lessons')
  async addLesson(@Param('chapterId') chapterId: string, @Body() dto: CreateLessonDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.curriculumService.addLesson(chapterId, dto, ctx);
  }

  @Post('lesson/:lessonId/materials')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMaterial(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: MaterialType,
    @Query('provider') provider: MediaProviderKey = MediaProviderKey.KEDIA,
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.materialService.uploadMaterial(lessonId, type, file, provider, ctx);
  }

  @Get('lesson/:lessonId/materials')
  async getMaterials(@Param('lessonId') lessonId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.materialService.getLessonMaterials(lessonId, ctx);
  }

  @Post('reorder/chapters')
  async reorderChapters(@Body('ids') ids: string[], @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.curriculumService.reorderChapters(ids, ctx);
  }

  @Post('reorder/lessons')
  async reorderLessons(@Body('ids') ids: string[], @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.curriculumService.reorderLessons(ids, ctx);
  }
}
