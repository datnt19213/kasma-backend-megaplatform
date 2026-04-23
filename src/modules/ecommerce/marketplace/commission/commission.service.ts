import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionRule } from '@/entities/marketplace/commission-rule.entity';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(CommissionRule, 'postgres')
    private readonly ruleRepo: Repository<CommissionRule>,
  ) {}

  async calculateCommission(orderTotal: number, context: { vendorId: string; categoryId?: string; app_key: string; tenant_key: string }) {
    const { vendorId, categoryId, app_key, tenant_key } = context;

    // 1. Try to find specific vendor rule
    let rule = await this.ruleRepo.findOne({
      where: { vendorId, isActive: true, app_key, tenant_key }
    });

    // 2. If not found, try category rule
    if (!rule && categoryId) {
      rule = await this.ruleRepo.findOne({
        where: { categoryId, isActive: true, app_key, tenant_key }
      });
    }

    // 3. Global rule (where both vendorId and categoryId are null)
    if (!rule) {
      rule = await this.ruleRepo.findOne({
        where: { vendorId: null, categoryId: null, isActive: true, app_key, tenant_key } as any
      });
    }

    if (!rule) return { rate: 0, fixedFee: 0, commissionAmount: 0 };

    const rateAmount = (Number(rule.rate) / 100) * orderTotal;
    const totalCommission = rateAmount + Number(rule.fixedFee);

    return {
      rate: rule.rate,
      fixedFee: rule.fixedFee,
      commissionAmount: totalCommission,
      netAmount: orderTotal - totalCommission,
    };
  }

  async saveRule(dto: any, context: { app_key: string; tenant_key: string }) {
    const rule = this.ruleRepo.create({
      ...dto,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    return await this.ruleRepo.save(rule);
  }
}
