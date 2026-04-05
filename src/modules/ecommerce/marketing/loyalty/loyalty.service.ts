import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyTier } from '@/entities/marketing/loyalty-tier.entity';
import { LoyaltyPoint } from '@/entities/marketing/loyalty-point.entity';
import { MarketingLog, MarketingLogType } from '@/entities/mongo/marketing-log.mongo-entity';
import { CreateLoyaltyTierDto, AddLoyaltyPointsDto } from '@/dto/marketing-dto/loyalty.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyTier, 'postgres')
    private readonly tierRepo: Repository<LoyaltyTier>,
    @InjectRepository(LoyaltyPoint, 'postgres')
    private readonly pointRepo: Repository<LoyaltyPoint>,
    @InjectRepository(MarketingLog, 'mongo')
    private readonly logRepo: Repository<MarketingLog>,
  ) {}

  async logAudit(userId: string, action: string, points: number, details: any) {
    const log = this.logRepo.create({
      logType: MarketingLogType.LOYALTY_AUDIT,
      userId,
      details: { ...details, action, points },
    });
    return this.logRepo.save(log);
  }

  // Tiers
  async createTier(dto: CreateLoyaltyTierDto) {
    const tier = this.tierRepo.create(dto);
    return this.tierRepo.save(tier);
  }

  async findAllTiers() {
    return this.tierRepo.find({ order: { minPoints: 'ASC' } });
  }

  // Points
  async addPoints(dto: AddLoyaltyPointsDto) {
    const entry = this.pointRepo.create(dto);
    const saved = await this.pointRepo.save(entry);
    await this.logAudit(dto.userId, 'ADD_POINTS', dto.points, { sourceId: dto.sourceId, note: dto.note });
    return saved;
  }

  async getBalance(userId: string) {
    const result = await this.pointRepo
      .createQueryBuilder('lp')
      .select('SUM(CASE WHEN lp.transactionType = \'earn\' THEN lp.points ELSE -lp.points END)', 'total')
      .where('lp.user_id = :userId', { userId })
      .getRawOne();
    
    return { balance: parseInt(result?.total || '0') };
  }

  async getHistory(userId: string) {
    return this.pointRepo.find({ where: { userId }, order: { created_at: 'DESC' } });
  }
}
