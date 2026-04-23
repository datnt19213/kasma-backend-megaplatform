import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRule } from '@/entities/finance/tax-rule.entity';
import { TaxConfig } from '@/entities/mongo/tax-config.mongo-entity';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxRule, 'postgres')
    private readonly taxRuleRepo: Repository<TaxRule>,
    @InjectRepository(TaxConfig, 'mongo')
    private readonly taxConfigRepo: Repository<TaxConfig>,
  ) {}

  async calculateTax(amount: number, context: { country?: string; region?: string; zipCode?: string; app_key: string; tenant_key: string }) {
    const { app_key, tenant_key, country, region, zipCode } = context;

    // 1. Get Tax Rules prioritized by specificity (Specific -> Global)
    const ruleOrders = [
      { country, region, zipCode, app_key, tenant_key, isActive: true },
      { country, region, app_key, tenant_key, isActive: true },
      { country, app_key, tenant_key, isActive: true },
      { app_key, tenant_key, isActive: true },
    ];

    let rule: TaxRule | null = null;
    for (const where of ruleOrders) {
      if (where.country === undefined && where !== ruleOrders[3]) continue;
      rule = await this.taxRuleRepo.findOne({ where });
      if (rule) break;
    }
    const rate = rule ? Number(rule.rate) : 0;
    
    // 2. Get dynamic config from Mongo
    const config = await this.taxConfigRepo.findOne({
      where: { app_key, tenant_key } as any
    });

    const isInclusive = config?.calculationType === 'inclusive';
    let taxAmount = 0;

    if (isInclusive) {
      taxAmount = amount - (amount / (1 + rate / 100));
    } else {
      taxAmount = amount * (rate / 100);
    }

    return {
      originalAmount: amount,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: isInclusive ? amount : amount + taxAmount,
      rate,
      ruleName: rule?.name || 'No Tax Applied',
      isInclusive,
    };
  }

  async createTaxRule(dto: any, context: { app_key: string; tenant_key: string }) {
    const rule = this.taxRuleRepo.create({
      ...dto,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    return await this.taxRuleRepo.save(rule);
  }
}
