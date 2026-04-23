import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, RMARequestStatus } from '@/entities/operations/return-request.entity';
import { RMAInspection } from '@/entities/mongo/rma-inspection.mongo-entity';
import { InventoryService } from '../../logistics/inventory/inventory.service';

@Injectable()
export class RMAService {
  constructor(
    @InjectRepository(ReturnRequest, 'postgres')
    private readonly rmaRepo: Repository<ReturnRequest>,
    @InjectRepository(RMAInspection, 'mongo')
    private readonly inspectionRepo: Repository<RMAInspection>,
    private readonly inventoryService: InventoryService,
  ) {}

  async createRequest(dto: any, context: { userId: string; app_key: string; tenant_key: string }) {
    const request = this.rmaRepo.create({
      ...dto,
      userId: context.userId,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    return await this.rmaRepo.save(request);
  }

  async updateStatus(id: string, status: RMARequestStatus, context: { app_key: string; tenant_key: string; restock?: boolean; warehouseId?: string }) {
    const request = await this.rmaRepo.findOne({
      where: { id, app_key: context.app_key, tenant_key: context.tenant_key }
    });
    if (!request) throw new NotFoundException('RMA request not found');

    request.status = status;

    // Optional restocking logic
    if (context.restock && context.warehouseId && request.items) {
      for (const item of request.items) {
        await this.inventoryService.adjustStock({
          warehouseId: context.warehouseId,
          productId: item.productId,
          quantity: item.qty,
        }, { app_key: context.app_key, tenant_key: context.tenant_key });
      }
    }

    return await this.rmaRepo.save(request);
  }

  async addInspection(id: string, findings: any, context: { app_key: string; tenant_key: string }) {
    const inspection = this.inspectionRepo.create({
      returnRequestId: id,
      findings,
      app_key: context.app_key,
      tenant_key: context.tenant_key,
    });
    return await this.inspectionRepo.save(inspection);
  }

  async listRequests(context: { app_key: string; tenant_key: string }) {
    return await this.rmaRepo.find({
      where: { app_key: context.app_key, tenant_key: context.tenant_key },
      order: { created_at: 'DESC' },
    });
  }
}
