import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '@/entities/finance/currency.entity';
import { ExchangeRate } from '@/entities/mongo/exchange-rate.mongo-entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency, 'postgres')
    private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(ExchangeRate, 'mongo')
    private readonly rateRepo: Repository<ExchangeRate>,
  ) {}

  async listCurrencies(context: { app_key: string; tenant_key: string }) {
    return await this.currencyRepo.find({
      where: { app_key: context.app_key, tenant_key: context.tenant_key, isActive: true }
    });
  }

  async convert(amount: number, from: string, to: string, context: { app_key: string; tenant_key: string }) {
    const { app_key, tenant_key } = context;

    if (from === to) return amount;

    // Try to find direct rate in Mongo first
    const directRate = await this.rateRepo.findOne({
      where: { fromCurrency: from, toCurrency: to, app_key, tenant_key } as any,
      order: { created_at: 'DESC' } as any,
    });

    if (directRate) {
      return amount * Number(directRate.rate);
    }

    // Fallback to Postgres exchangeRateToBase if direct match not found
    const fromCurrency = await this.currencyRepo.findOne({ where: { code: from, app_key, tenant_key } });
    const toCurrency = await this.currencyRepo.findOne({ where: { code: to, app_key, tenant_key } });

    if (!fromCurrency || !toCurrency) {
      throw new NotFoundException('One or both currencies not supported');
    }

    // Convert from -> Base -> to
    const amountInBase = amount / Number(fromCurrency.exchangeRateToBase);
    const result = amountInBase * Number(toCurrency.exchangeRateToBase);

    return parseFloat(result.toFixed(toCurrency.decimalPlaces));
  }

  async updateRate(dto: { from: string; to: string; rate: number }, context: { app_key: string; tenant_key: string }) {
    const rate = this.rateRepo.create({
      fromCurrency: dto.from,
      toCurrency: dto.to,
      rate: dto.rate,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    return await this.rateRepo.save(rate);
  }
}
