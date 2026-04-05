import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliateProgram } from '@/entities/marketing/affiliate-program.entity';
import { AffiliateLink } from '@/entities/marketing/affiliate-link.entity';
import { MarketingLog, MarketingLogType } from '@/entities/mongo/marketing-log.mongo-entity';
import { CreateAffiliateProgramDto, CreateAffiliateLinkDto } from '@/dto/marketing-dto/affiliate.dto';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectRepository(AffiliateProgram, 'postgres')
    private readonly programRepo: Repository<AffiliateProgram>,
    @InjectRepository(AffiliateLink, 'postgres')
    private readonly linkRepo: Repository<AffiliateLink>,
    @InjectRepository(MarketingLog, 'mongo')
    private readonly logRepo: Repository<MarketingLog>,
  ) {}

  async logClick(linkId: string, metadata: any) {
    const log = this.logRepo.create({
      logType: MarketingLogType.AFFILIATE_CLICK,
      resourceId: linkId,
      metadata,
    });
    return this.logRepo.save(log);
  }

  async logConversion(linkId: string, userId: string, details: any) {
    const log = this.logRepo.create({
      logType: MarketingLogType.AFFILIATE_CONVERSION,
      resourceId: linkId,
      userId,
      details,
    });
    return this.logRepo.save(log);
  }

  async createProgram(dto: CreateAffiliateProgramDto) {
    const program = this.programRepo.create(dto);
    return this.programRepo.save(program);
  }

  async findAllPrograms() {
    return this.programRepo.find({ where: { isActive: true } });
  }

  async createLink(dto: CreateAffiliateLinkDto) {
    if (!dto.code) {
      dto.code = `AFF-${dto.userId.slice(0, 8)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    }
    const link = this.linkRepo.create(dto);
    return this.linkRepo.save(link);
  }

  async getMyLinks(userId: string) {
    return this.linkRepo.find({ where: { userId }, relations: ['program'] });
  }

  async findLinkByCode(code: string) {
    const link = await this.linkRepo.findOne({ where: { code, isActive: true }, relations: ['program'] });
    if (link) {
      await this.logClick(link.id, { timestamp: new Date() });
    }
    return link;
  }
}
