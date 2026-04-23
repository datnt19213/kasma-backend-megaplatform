import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { ProductDetail } from '@/entities/mongo/product-detail.mongo-entity';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from '@/dto/ecommerce-dto/product.dto';

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
  ) { }

  async createProduct(dto: CreateProductDto) {
    const product = this.productRepo.create({
      code: (dto as any).code,
      name: dto.name,
      slug: dto.slug,
      shortDescription: (dto as any).shortDescription,
      price: dto.price,
      salePrice: (dto as any).salePrice,
      categoryId: dto.categoryId,
    });
    const savedProduct = await this.productRepo.save(product);

    const detail = this.detailRepo.create({
      product_id: savedProduct.id,
      description: dto.description,
      specifications: dto.specifications || [],
      attributes: dto.attributes || [],
      media: dto.media || [],
    });
    await this.detailRepo.save(detail);

    return { success: true, productId: savedProduct.id };
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    await this.productRepo.update(id, {
      name: data.name,
      price: data.price,
      salePrice: (data as any).salePrice,
      shortDescription: (data as any).shortDescription,
    });

    const detail = await this.detailRepo.findOne({ where: { product_id: id } as any });
    if (detail) {
      detail.description = data.description;
      detail.specifications = data.specifications;
      detail.attributes = data.attributes;
      detail.media = data.media;
      await this.detailRepo.save(detail);
    }

    return { success: true, message: 'Product updated successfully' };
  }

  async deleteProduct(id: string) {
    await this.productRepo.delete(id);
    await this.detailRepo.delete({ product_id: id } as any);
    return { success: true, message: 'Product deleted successfully' };
  }

  async getAllProducts(filter?: ProductFilterDto) {
    const where: any = {};
    if (filter?.categoryId) where.categoryId = filter.categoryId;
    if (filter?.isActive !== undefined) where.isActive = filter.isActive;

    return await this.productRepo.find({
      where,
      relations: ['category', 'variants'],
    });
  }

  async getProductById(id: string) {
    const core = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'tags', 'variants'],
    });
    if (!core) throw new NotFoundException('Product not found');

    const detail = await this.detailRepo.findOne({
      where: { product_id: id } as any,
    });

    return {
      ...core,
      richContent: detail || null,
    };
  }

  async getAllCategories() {
    return await this.categoryRepo.find();
  }

  async compareProducts(productIds: string[]) {
    const details = await this.detailRepo.find({
      where: { product_id: { $in: productIds } } as any,
    });

    return details.map(d => ({
      productId: d.product_id,
      specs: d.specifications,
      attributes: d.attributes
    }));
  }

  async generateFeed() {
    const products = await this.productRepo.find();
    const details = await this.detailRepo.find();

    const detailMap = new Map(details.map(d => [d.product_id, d]));

    return products.map(p => {
      const d = detailMap.get(p.id);
      return {
        id: p.id,
        title: p.name,
        price: `${p.price} VND`,
        image_url: d?.media?.[0]?.mediaUrl || '',
        category: p.categoryId,
        availability: 'in_stock'
      };
    });
  }
}
