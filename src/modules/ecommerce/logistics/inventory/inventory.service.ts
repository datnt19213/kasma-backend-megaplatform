import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Warehouse } from '@/entities/logistics/warehouse.entity';
import { WarehouseInventory } from '@/entities/logistics/warehouse-inventory.entity';
import { InventoryBuffer } from '@/entities/mongo/inventory-buffer.mongo-entity';
import { WarehouseLayout } from '@/entities/mongo/warehouse-layout.mongo-entity';
import { LockService } from '@/shared/lock/lock.service';

export interface TenantContext {
  app_key: string;
  tenant_key: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Warehouse, 'postgres')
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(WarehouseInventory, 'postgres')
    private readonly inventoryRepo: Repository<WarehouseInventory>,
    @InjectRepository(InventoryBuffer, 'mongo')
    private readonly bufferRepo: Repository<InventoryBuffer>,
    @InjectRepository(WarehouseLayout, 'mongo')
    private readonly layoutRepo: Repository<WarehouseLayout>,
    private readonly lockService: LockService,
  ) {}

  async createWarehouse(dto: any, ctx: TenantContext) {
    const warehouse = this.warehouseRepo.create({
      ...dto,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    return await this.warehouseRepo.save(warehouse);
  }

  async adjustStock(dto: { warehouseId: string; productId: string; quantity: number }, ctx: TenantContext) {
    const lockKey = `lock:inventory:${dto.warehouseId}:${dto.productId}`;
    const lock = await this.lockService.acquire(lockKey, 5000);

    try {
      // Verify warehouse belongs to tenant
      const warehouse = await this.warehouseRepo.findOne({
        where: { id: dto.warehouseId, app_key: ctx.app_key, tenant_key: ctx.tenant_key }
      });
      if (!warehouse) throw new Error('Warehouse not found or access denied');

      let inventory = await this.inventoryRepo.findOne({
        where: { warehouseId: dto.warehouseId, productId: dto.productId, app_key: ctx.app_key, tenant_key: ctx.tenant_key }
      });

      if (inventory) {
        inventory.quantity += dto.quantity;
      } else {
        inventory = this.inventoryRepo.create({
          ...dto,
          app_key: ctx.app_key,
          tenant_key: ctx.tenant_key,
        });
      }

      return await this.inventoryRepo.save(inventory);
    } finally {
      await lock.release();
    }
  }

  async getInventoryLevels(warehouseId: string | undefined, ctx: TenantContext) {
    const where: any = { app_key: ctx.app_key, tenant_key: ctx.tenant_key };
    if (warehouseId) where.warehouseId = warehouseId;
    
    return await this.inventoryRepo.find({ where });
  }

  async setBuffer(dto: { productId: string; buffer_quantity: number }, ctx: TenantContext) {
    let buffer = await this.bufferRepo.findOne({
      where: { product_id: dto.productId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any
    });

    if (buffer) {
      Object.assign(buffer, dto);
    } else {
      const newBuffer = this.bufferRepo.create({
        ...dto,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
      });
      buffer = Array.isArray(newBuffer) ? newBuffer[0] : newBuffer;
    }

    if (!buffer) throw new Error('Failed to create or find buffer');
    return await this.bufferRepo.save(buffer);
  }

  async saveLayout(dto: any, ctx: TenantContext) {
    let layout = await this.layoutRepo.findOne({
      where: { warehouse_id: dto.warehouse_id, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any
    });

    if (layout) {
      Object.assign(layout, dto);
    } else {
      const newLayout = this.layoutRepo.create({
        ...dto,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
      });
      layout = Array.isArray(newLayout) ? newLayout[0] : newLayout;
    }

    if (!layout) throw new Error('Failed to create or find layout');
    return await this.layoutRepo.save(layout);
  }
}
