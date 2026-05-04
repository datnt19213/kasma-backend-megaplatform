import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogCategory } from '@/entities/blog/blog-category.entity';
import { BlogTag } from '@/entities/blog/blog-tag.entity';
import { CreateCategoryDto, CreateTagDto } from '@/dto/blog-dto/taxonomy.dto';

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectRepository(BlogCategory, 'postgres')
    private readonly categoryRepo: Repository<BlogCategory>,
    @InjectRepository(BlogTag, 'postgres')
    private readonly tagRepo: Repository<BlogTag>,
  ) {}

  // Category CRUD
  async createCategory(data: CreateCategoryDto & { app_key: string; tenant_key: string }) {
    const category = this.categoryRepo.create(data);
    return await this.categoryRepo.save(category);
  }

  async getCategories(ctx: { app_key: string; tenant_key: string }) {
    return await this.categoryRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['children'],
    });
  }

  // Tag CRUD
  async createTag(data: CreateTagDto & { app_key: string; tenant_key: string }) {
    const tag = this.tagRepo.create(data);
    return await this.tagRepo.save(tag);
  }

  async getTags(ctx: { app_key: string; tenant_key: string }) {
    return await this.tagRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
  }
}
