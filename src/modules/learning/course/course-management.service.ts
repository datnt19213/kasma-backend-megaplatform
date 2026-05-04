import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningCourse } from '@/entities/learning/learning-course.entity';
import { CreateCourseDto, UpdateCourseDto } from '@/dto/learning-dto/course.dto';
import { MediaLibraryService } from '@/modules/media/media-library.service';
import { MediaProviderKey } from '@/config/apps';

@Injectable()
export class CourseManagementService {
  constructor(
    @InjectRepository(LearningCourse, 'postgres')
    private readonly courseRepo: Repository<LearningCourse>,
    private readonly mediaLibrary: MediaLibraryService,
  ) {}

  async createCourse(dto: CreateCourseDto, ctx: { app_key: string; tenant_key: string }) {
    const existing = await this.courseRepo.findOne({
      where: { slug: dto.slug, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (existing) throw new ConflictException('Course slug already exists');

    const course = this.courseRepo.create({
      ...dto,
      ...ctx,
    });
    return await this.courseRepo.save(course);
  }

  async updateThumbnail(id: string, file: Express.Multer.File, provider: MediaProviderKey, ctx: { app_key: string; tenant_key: string }) {
    const course = await this.courseRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!course) throw new NotFoundException('Course not found');

    const result = await this.mediaLibrary.uploadFile(file, provider, ctx);
    
    course.thumbnail_url = result.url;
    course.thumbnail_provider = result.provider;
    
    return await this.courseRepo.save(course);
  }

  async getCourseDetail(id: string, ctx: { app_key: string; tenant_key: string }) {
    const course = await this.courseRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['chapters', 'chapters.lessons'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async listCourses(ctx: { app_key: string; tenant_key: string }) {
    return await this.courseRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      order: { created_at: 'DESC' },
    });
  }

  async deleteCourse(id: string, ctx: { app_key: string; tenant_key: string }) {
    const course = await this.courseRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!course) throw new NotFoundException('Course not found');

    return await this.courseRepo.remove(course);
  }
}
