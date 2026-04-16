import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, POStatus } from '@/entities/logistics/purchase-order.entity';
import { TenantContext } from '../inventory/inventory.service';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(PurchaseOrder, 'postgres')
    private readonly poRepo: Repository<PurchaseOrder>,
  ) {}

  async createPO(dto: any, ctx: TenantContext) {
    const po = this.poRepo.create({
      ...dto,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    return await this.poRepo.save(po);
  }

  async updatePOStatus(id: string, status: POStatus, ctx: TenantContext) {
    const po = await this.poRepo.findOne({ 
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key } 
    });
    if (!po) throw new Error('PO not found or access denied');
    
    po.status = status;
    if (status === POStatus.RECEIVED) po.receivedAt = new Date();
    
    return await this.poRepo.save(po);
  }

  async listPOs(ctx: TenantContext) {
    return await this.poRepo.find({
      where: { app_key: ctx.app_key, tenant_key: ctx.tenant_key }
    });
  }
}
