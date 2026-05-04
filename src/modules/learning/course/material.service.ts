import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningMaterial, MaterialType } from '@/entities/mongo/learning-material.mongo-entity';
import { MediaLibraryService } from '@/modules/media/media-library.service';
import { MediaProviderKey } from '@/config/apps';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(LearningMaterial, 'mongo')
    private readonly materialRepo: Repository<LearningMaterial>,
    private readonly mediaLibrary: MediaLibraryService,
  ) {}

  async uploadMaterial(
    lessonId: string, 
    type: MaterialType, 
    file: Express.Multer.File, 
    provider: MediaProviderKey, 
    ctx: { app_key: string; tenant_key: string }
  ) {
    const result = await this.mediaLibrary.uploadFile(file, provider, ctx);

    const material = this.materialRepo.create({
      lesson_id: lessonId,
      type,
      content_data: {
        url: result.url,
        provider: result.provider,
        provider_metadata: result.metadata,
        size: file.size,
        mime_type: file.mimetype,
      },
      ...ctx,
    });

    return await this.materialRepo.save(material);
  }

  async getLessonMaterials(lessonId: string, ctx: { app_key: string; tenant_key: string }) {
    return await this.materialRepo.find({
      where: { lesson_id: lessonId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });
  }

  async deleteMaterial(id: string, ctx: { app_key: string; tenant_key: string }) {
    const material = await this.materialRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });
    if (!material) throw new NotFoundException('Material not found');

    return await this.materialRepo.remove(material);
  }
}
