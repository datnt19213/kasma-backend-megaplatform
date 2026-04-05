import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from '@/entities/marketing/promotion.entity';
import { MarketingLog, MarketingLogType } from '@/entities/mongo/marketing-log.mongo-entity';
import { CreatePromotionDto, UpdatePromotionDto } from '@/dto/marketing-dto/promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion, 'postgres')
    private readonly promotionRepo: Repository<Promotion>,
    @InjectRepository(MarketingLog, 'mongo')
    private readonly logRepo: Repository<MarketingLog>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly CACHE_KEY = 'promotions:all';

  async logUsage(promotionId: string, userId: string, details: any) {
    const log = this.logRepo.create({
      logType: MarketingLogType.PROMOTION_USAGE,
      resourceId: promotionId,
      userId,
      details,
    });
    return this.logRepo.save(log);
  }

  async create(dto: CreatePromotionDto) {
    const promotion = this.promotionRepo.create(dto);
    const saved = await this.promotionRepo.save(promotion);
    await this.cacheManager.del(this.CACHE_KEY);
    return saved;
  }

  async findAll() {
    const cached = await this.cacheManager.get(this.CACHE_KEY) as Promotion[];
    if (cached) return cached;

    const promotions = await this.promotionRepo.find({ order: { created_at: 'DESC' } });
    await this.cacheManager.set(this.CACHE_KEY, promotions);
    return promotions;
  }

  async findOne(id: string) {
    const promotion = await this.promotionRepo.findOne({ where: { id } });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return promotion;
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const promotion = await this.findOne(id);
    Object.assign(promotion, dto);
    const saved = await this.promotionRepo.save(promotion);
    await this.cacheManager.del(this.CACHE_KEY);
    return saved;
  }

  async remove(id: string) {
    const promotion = await this.findOne(id);
    promotion.isActive = false;
    await this.promotionRepo.save(promotion);
    await this.cacheManager.del(this.CACHE_KEY);
    return { success: true };
  }
}
