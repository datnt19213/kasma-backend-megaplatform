import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';

import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { ProductDetail } from '@/entities/mongo/product-detail.mongo-entity';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from '@/dto/ecommerce-dto/product.dto';
import { ContentSanitizerService } from '@/modules/media/content-sanitizer.service';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(ProductCategory, 'postgres')
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(ProductTag, 'postgres')
    private readonly tagRepo: Repository<ProductTag>,
    @InjectRepository(Product, 'postgres')
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant, 'postgres')
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductDetail, 'mongo')
    private readonly detailRepo: Repository<ProductDetail>,
    private readonly sanitizer: ContentSanitizerService,
  ) { }

  async createProduct(dto: CreateProductDto, ctx: { app_key: string; tenant_key: string }) {
    // 0. Validate slug uniqueness per tenant
    const existing = await this.productRepo.findOne({
      where: { slug: dto.slug, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (existing) throw new ConflictException(`Product slug "${dto.slug}" already exists`);

    // 1. Create Postgres Product
    const product = this.productRepo.create({
      name: dto.name,
      slug: dto.slug,
      shortDescription: dto.description ? this.sanitizer.sanitize(dto.description).substring(0, 255) : '', // Assuming shortDescription from description start
      price: dto.price || 0,
      salePrice: 0, // Default for now
      categoryId: dto.categoryId,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    const savedProduct = await this.productRepo.save(product);

    try {
      // 2. Create Mongo Detail
      const detail = this.detailRepo.create({
        product_id: savedProduct.id,
        description: this.sanitizer.sanitize(dto.description || ''),
        specifications: dto.specifications || [],
        attributes: dto.attributes || [],
        media: dto.media || [],
      });
      await this.detailRepo.save(detail);

      this.logAction('create', 'system', ctx);
      return { success: true, productId: savedProduct.id };
    } catch (error) {
      // ROLLBACK Postgres if Mongo fails
      await this.productRepo.delete(savedProduct.id);
      throw error;
    }
  }

  async updateProduct(id: string, data: UpdateProductDto, ctx: { app_key: string; tenant_key: string }) {
    const product = await this.productRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Update Postgres
    Object.assign(product, {
      name: data.name ?? product.name,
      price: data.price ?? product.price,
      categoryId: data.categoryId ?? product.categoryId,
      isActive: data.isActive ?? product.isActive,
    });
    await this.productRepo.save(product);

    // Update Mongo
    const detail = await this.detailRepo.findOne({
      where: { product_id: id } as FindOptionsWhere<ProductDetail>
    });
    if (detail) {
      detail.description = data.description ? this.sanitizer.sanitize(data.description) : detail.description;
      detail.specifications = data.specifications ?? detail.specifications;
      detail.attributes = data.attributes ?? detail.attributes;
      detail.media = data.media ?? detail.media;
      await this.detailRepo.save(detail);
    }

    this.logAction('update', 'system', ctx);
    return { success: true, message: 'Product updated successfully' };
  }

  async deleteProduct(id: string, ctx: { app_key: string; tenant_key: string }) {
    const product = await this.productRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.productRepo.delete(id);
    await this.detailRepo.delete({ product_id: id } as FindOptionsWhere<ProductDetail>);

    this.logAction('delete', 'system', ctx);
    return { success: true, message: 'Product deleted successfully' };
  }

  async getAllProducts(filter: ProductFilterDto, ctx: { app_key: string; tenant_key: string }) {
    const where: any = {
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    };
    if (filter?.categoryId) where.categoryId = filter.categoryId;
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;

    return await this.productRepo.find({
      where,
      relations: ['category', 'variants'],
    });
  }

  async getProductById(id: string, ctx: { app_key: string; tenant_key: string }) {
    const core = await this.productRepo.findOne({
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key },
      relations: ['category', 'tags', 'variants'],
    });
    if (!core) throw new NotFoundException('Product not found');

    const detail = await this.detailRepo.findOne({
      where: { product_id: id } as FindOptionsWhere<ProductDetail>,
    });

    return {
      ...core,
      richContent: detail || null,
    };
  }

  async getAllCategories(ctx: { app_key: string; tenant_key: string }) {
    return await this.categoryRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });
  }

  private logAction(action: string, userId: string, ctx: { app_key: string; tenant_key: string }) {
    console.log(`[AUDIT LOG - ECOMMERCE] Action: ${action}, User: ${userId}, App: ${ctx.app_key}, Tenant: ${ctx.tenant_key}`);
  }
}
