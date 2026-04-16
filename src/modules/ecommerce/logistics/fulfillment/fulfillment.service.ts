import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fulfillment, FulfillmentStatus } from '@/entities/logistics/fulfillment.entity';
import { TenantContext } from '../inventory/inventory.service';

@Injectable()
export class FulfillmentService {
  constructor(
    @InjectRepository(Fulfillment, 'postgres')
    private readonly fulfillmentRepo: Repository<Fulfillment>,
  ) {}

  async createFulfillment(dto: any, ctx: TenantContext) {
    const fulfillment = this.fulfillmentRepo.create({
      ...dto,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    return await this.fulfillmentRepo.save(fulfillment);
  }

  async updateStatus(id: string, status: FulfillmentStatus, ctx: TenantContext, trackingNumber?: string) {
    const fulfillment = await this.fulfillmentRepo.findOne({ 
      where: { id, app_key: ctx.app_key, tenant_key: ctx.tenant_key } 
    });
    if (!fulfillment) throw new Error('Fulfillment not found or access denied');

    fulfillment.status = status;
    if (trackingNumber) fulfillment.trackingNumber = trackingNumber;

    if (status === FulfillmentStatus.SHIPPED) fulfillment.shippedAt = new Date();
    if (status === FulfillmentStatus.DELIVERED) fulfillment.deliveredAt = new Date();

    return await this.fulfillmentRepo.save(fulfillment);
  }

  async getFulfillmentByOrder(orderId: string, ctx: TenantContext) {
    return await this.fulfillmentRepo.findOne({ 
      where: { orderId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } 
    });
  }
}
