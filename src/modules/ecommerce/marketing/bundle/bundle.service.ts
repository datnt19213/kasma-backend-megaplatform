import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductBundle } from '@/entities/marketing/product-bundle.entity';
import { ProductBundleItem } from '@/entities/marketing/product-bundle-item.entity';
import { CreateBundleDto, UpdateBundleDto } from '@/dto/marketing-dto/bundle.dto';

@Injectable()
export class BundleService {
  constructor(
    @InjectRepository(ProductBundle, 'postgres')
    private readonly bundleRepo: Repository<ProductBundle>,
    @InjectRepository(ProductBundleItem, 'postgres')
    private readonly bundleItemRepo: Repository<ProductBundleItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBundleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bundle = this.bundleRepo.create({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isActive: dto.isActive,
      });
      const savedBundle = await queryRunner.manager.save(bundle);

      for (const item of dto.items) {
        const bundleItem = this.bundleItemRepo.create({
          bundleId: savedBundle.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
        await queryRunner.manager.save(bundleItem);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedBundle.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.bundleRepo.find({ relations: ['items', 'items.product', 'items.variant'] });
  }

  async findOne(id: string) {
    const bundle = await this.bundleRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.variant'],
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    return bundle;
  }

  async update(id: string, dto: UpdateBundleDto) {
    const bundle = await this.findOne(id);
    // Add update logic for items if needed, for simplicity we'll just update main fields
    Object.assign(bundle, {
      name: dto.name,
      description: dto.description,
      price: dto.price,
      isActive: dto.isActive,
    });
    return this.bundleRepo.save(bundle);
  }

  async remove(id: string) {
    const bundle = await this.findOne(id);
    bundle.isActive = false;
    return this.bundleRepo.save(bundle);
  }
}
