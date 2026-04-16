import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShippingZone, ShippingMethod } from '@/entities/logistics/shipping.entity';
import { Carrier } from '@/entities/logistics/carrier.entity';
import { CarrierConfig } from '@/entities/mongo/carrier-config.mongo-entity';
import { TenantContext } from '../inventory/inventory.service';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingZone, 'postgres')
    private readonly zoneRepo: Repository<ShippingZone>,
    @InjectRepository(ShippingMethod, 'postgres')
    private readonly methodRepo: Repository<ShippingMethod>,
    @InjectRepository(Carrier, 'postgres')
    private readonly carrierRepo: Repository<Carrier>,
    @InjectRepository(CarrierConfig, 'mongo')
    private readonly configRepo: Repository<CarrierConfig>,
  ) {}

  async createZone(dto: any, ctx: TenantContext) {
    const zone = this.zoneRepo.create({
      ...dto,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    return await this.zoneRepo.save(zone);
  }

  async addMethodToZone(dto: any, ctx: TenantContext) {
    // Verify zone ownership
    const zone = await this.zoneRepo.findOne({
      where: { id: dto.zoneId, app_key: ctx.app_key, tenant_key: ctx.tenant_key }
    });
    if (!zone) throw new Error('Zone not found or access denied');

    const method = this.methodRepo.create({
      ...dto,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    return await this.methodRepo.save(method);
  }

  async listCarriers(ctx: TenantContext) {
    return await this.carrierRepo.find({ 
      where: { isActive: true, app_key: ctx.app_key, tenant_key: ctx.tenant_key } 
    });
  }

  async saveCarrierConfig(dto: any, ctx: TenantContext) {
    let config = await this.configRepo.findOne({
      where: { carrier_code: dto.carrier_code, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any
    });

    if (config) {
      Object.assign(config, dto);
    } else {
      const newConfig = this.configRepo.create({
        ...dto,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
      });
      config = Array.isArray(newConfig) ? newConfig[0] : newConfig;
    }

    if (!config) throw new Error('Failed to create or find carrier config');
    return await this.configRepo.save(config);
  }

  async calculateShipping(dto: { zoneId: string; weight: number }, ctx: TenantContext) {
    // Verify zone ownership
    const zone = await this.zoneRepo.findOne({
      where: { id: dto.zoneId, app_key: ctx.app_key, tenant_key: ctx.tenant_key }
    });
    if (!zone) throw new Error('Zone not found or access denied');

    const methods = await this.methodRepo.find({ 
      where: { zoneId: dto.zoneId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } 
    });
    
    return methods.map(m => ({
      methodName: m.name,
      totalPrice: Number(m.basePrice) + (Number(m.pricePerKg) * dto.weight),
      estimatedDays: m.estimatedDays
    }));
  }
}
