import {
  Between,
  ILike,
  In,
  Repository,
} from 'typeorm';

import { ProductCategory } from '@/entities/ecommerce/product-category.entity';
import { ProductTag } from '@/entities/ecommerce/product-tag.entity';
import { Product } from '@/entities/ecommerce/product.entity';
import { ProductDetail } from '@/entities/mongo/product-detail.mongo-entity';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateCategoryDto } from '../../dto/ecommerce-dto/category.dto';
import {
  CreateProductDto,
  ProductFilterDto,
} from '../../dto/ecommerce-dto/product.dto';
import { CreateTagDto } from '../../dto/ecommerce-dto/tag.dto';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(ProductCategory, 'postgres')
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(ProductTag, 'postgres')
    private readonly tagRepo: Repository<ProductTag>,
    @InjectRepository(Product, 'postgres')
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductDetail, 'mongo')
    private readonly detailRepo: Repository<ProductDetail>,
  ) { }

  // --- Categories ---
  async createCategory(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async getCategories() {
    return this.categoryRepo.find({ relations: ['children'] });
  }

  // --- Tags ---
  async createTag(dto: CreateTagDto) {
    const tag = this.tagRepo.create(dto);
    return this.tagRepo.save(tag);
  }

  async getTags() {
    return this.tagRepo.find();
  }

  // --- Products ---
  async createProduct(dto: CreateProductDto) {
    const { tagIds, specifications, description, ...productData } = dto;
    
    // 1. Save core data to Postgres
    const product = this.productRepo.create(productData);
    if (tagIds?.length) {
      product.tags = await this.tagRepo.findBy({ id: In(tagIds) });
    }
    const savedProduct = await this.productRepo.save(product);

    // 2. Save details to Mongo
    const productDetail = this.detailRepo.create({
      product_id: savedProduct.id,
      description,
      specifications: specifications?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
    });
    await this.detailRepo.save(productDetail);

    return this.findProductById(savedProduct.id);
  }

  async findProductById(id: string) {
    // 1. Get core data from Postgres
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!product) throw new NotFoundException('Product not found');

    // 2. Get details from Mongo
    const details = await this.detailRepo.findOne({
      where: { product_id: id } as any,
    });

    return {
      ...product,
      description: details?.description,
      specifications: details?.specifications,
      metadata: details?.metadata,
    };
  }

  async searchProducts(filter: ProductFilterDto) {
    const { search, categoryId, tagIds, minPrice, maxPrice } = filter;

    const query = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags');

    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (categoryId) {
      query.andWhere('product.category_id = :categoryId', { categoryId });
    }

    if (tagIds?.length) {
      query.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    query.andWhere('product.is_active = :isActive', { isActive: filter.isActive ?? true });

    return query.getMany();
  }
}
