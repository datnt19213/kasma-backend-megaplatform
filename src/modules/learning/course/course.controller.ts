import { Controller, Post, Get, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Query, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CourseManagementService } from './course-management.service';
import { CreateCourseDto } from '@/dto/learning-dto/course.dto';
import { MediaProviderKey } from '@/config/apps';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseManagementService) {}

  @Post()
  async create(@Body() dto: CreateCourseDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.courseService.createCourse(dto, ctx);
  }

  @Get()
  async list(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.courseService.listCourses(ctx);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.courseService.getCourseDetail(id, ctx);
  }

  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('provider') provider: MediaProviderKey = MediaProviderKey.KEDIA,
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.courseService.updateThumbnail(id, file, provider, ctx);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.courseService.deleteCourse(id, ctx);
  }
}
