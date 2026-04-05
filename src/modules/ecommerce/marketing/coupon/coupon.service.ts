import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '@/entities/marketing/coupon.entity';
import { MarketingLog, MarketingLogType } from '@/entities/mongo/marketing-log.mongo-entity';
import { CreateCouponDto, UpdateCouponDto } from '@/dto/marketing-dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon, 'postgres')
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(MarketingLog, 'mongo')
    private readonly logRepo: Repository<MarketingLog>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(code: string): string {
    return `coupon:${code}`;
  }

  async logRedemption(couponId: string, userId: string, success: boolean, details: any) {
    const log = this.logRepo.create({
      logType: MarketingLogType.COUPON_REDEMPTION,
      resourceId: couponId,
      userId,
      details: { ...details, success },
    });
    return this.logRepo.save(log);
  }

  async create(dto: CreateCouponDto) {
    const coupon = this.couponRepo.create(dto);
    const saved = await this.couponRepo.save(coupon);
    await this.cacheManager.set(this.getCacheKey(saved.code), saved);
    return saved;
  }

  async findAll() {
    return this.couponRepo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    const oldCode = coupon.code;
    Object.assign(coupon, dto);
    const saved = await this.couponRepo.save(coupon);
    
    if (oldCode !== saved.code) {
      await this.cacheManager.del(this.getCacheKey(oldCode));
    }
    await this.cacheManager.set(this.getCacheKey(saved.code), saved);
    
    return saved;
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    coupon.isActive = false;
    await this.couponRepo.save(coupon);
    await this.cacheManager.del(this.getCacheKey(coupon.code));
    return { success: true };
  }

  async validateCoupon(code: string) {
    const cacheKey = this.getCacheKey(code);
    let coupon = await this.cacheManager.get(cacheKey) as Coupon | null;

    if (!coupon) {
      coupon = await this.couponRepo.findOne({ where: { code, isActive: true } });
      if (coupon) {
        await this.cacheManager.set(cacheKey, coupon);
      }
    }

    if (!coupon || !coupon.isActive) return { valid: false, message: 'Invalid or inactive coupon' };
    
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      await this.logRedemption(coupon.id, 'SYSTEM', false, { reason: 'not_active' });
      return { valid: false, message: 'Coupon not yet active' };
    }
    if (coupon.endDate && now > coupon.endDate) {
      await this.logRedemption(coupon.id, 'SYSTEM', false, { reason: 'expired' });
      return { valid: false, message: 'Coupon expired' };
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      await this.logRedemption(coupon.id, 'SYSTEM', false, { reason: 'limit_reached' });
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    await this.logRedemption(coupon.id, 'SYSTEM', true, { message: 'validation_success' });
    return { valid: true, coupon };
  }
}
