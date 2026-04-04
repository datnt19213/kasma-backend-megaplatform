import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductVariant } from '@/entities/ecommerce/product-variant.entity';
import { ProductDetail } from '@/entities/mongo/product-detail.mongo-entity';

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

  // 1. CREATE Product (POST-only)
  async createProduct(dto: any) {
    // a. Save Core relational data (Postgres)
    const product = this.productRepo.create({
      code: dto.code,
      name: dto.name,
      slug: dto.slug,
      shortDescription: dto.shortDescription,
      price: dto.price,
      salePrice: dto.salePrice,
      categoryId: dto.categoryId,
    });
    const savedProduct = await this.productRepo.save(product);

    // b. Save Rich/Dynamic content (MongoDB)
    const detail = this.detailRepo.create({
      product_id: savedProduct.id,
      description: dto.fullDescription,
      specifications: dto.specifications || {},
      attributes: dto.attributes || [],
      media: dto.media || [],
    });
    await this.detailRepo.save(detail);

    return { success: true, productId: savedProduct.id };
  }

  // 2. UPDATE Product (POST-only)
  async updateProduct(id: string, data: any) {
    // a. Update Core (Postgres)
    await this.productRepo.update(id, {
      name: data.name,
      price: data.price,
      salePrice: data.salePrice,
      shortDescription: data.shortDescription,
    });

    // b. Update Detail (MongoDB)
    const detail = await this.detailRepo.findOne({ where: { product_id: id } as any });
    if (detail) {
      detail.description = data.fullDescription;
      detail.specifications = data.specifications;
      detail.attributes = data.attributes;
      detail.media = data.media;
      await this.detailRepo.save(detail);
    }

    return { success: true, message: 'Product updated successfully' };
  }

  // 3. DELETE Product (POST-only)
  async deleteProduct(id: string) {
    // Delete from both stores (Ideally wrapped in a saga or similar in production)
    await this.productRepo.delete(id);
    await this.detailRepo.delete({ product_id: id } as any);
    return { success: true, message: 'Product deleted successfully' };
  }

  // 4. GET All Products (GET)
  async getAllProducts() {
    return await this.productRepo.find({
      relations: ['category', 'variants'],
    });
  }

  // 5. GET Product Details (Hybrid View)
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

  // 6. Product Comparison (Aggregated specifications from MongoDB)
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

  // 7. Data Feed Generator (Flattened hybrid data)
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
        image_url: d?.media?.[0]?.url || '',
        category: p.categoryId,
        availability: 'in_stock'
      };
    });
  }
}
