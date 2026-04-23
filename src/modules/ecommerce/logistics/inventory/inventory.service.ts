import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Warehouse } from '@/entities/logistics/warehouse.entity';
import { WarehouseInventory } from '@/entities/logistics/warehouse-inventory.entity';
import { InventoryBuffer } from '@/entities/mongo/inventory-buffer.mongo-entity';
import { WarehouseLayout } from '@/entities/mongo/warehouse-layout.mongo-entity';
import { LockService } from '@/shared/lock/lock.service';
import { CreateWarehouseDto, AdjustStockDto, SetBufferDto, SaveLayoutDto } from '@/dto/logistics-dto/inventory.dto';

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
    private readonly dataSource: DataSource,
    private readonly lockService: LockService,
  ) {}

  async createWarehouse(dto: CreateWarehouseDto, ctx: TenantContext) {
    const warehouse = this.warehouseRepo.create({
      ...dto,
      app_key: ctx.app_key,
      tenant_key: ctx.tenant_key,
    });
    return await this.warehouseRepo.save(warehouse);
  }

  async adjustStock(dto: AdjustStockDto, ctx: TenantContext) {
    const lockKey = `inventory:${dto.warehouseId}:${dto.productId}`;
    const lock = await this.lockService.acquire(lockKey, 5000);

    try {
      let inv = await this.inventoryRepo.findOne({
        where: { 
          warehouseId: dto.warehouseId, 
          productId: dto.productId,
          app_key: ctx.app_key,
          tenant_key: ctx.tenant_key
        } as any,
      });

      if (!inv) {
        inv = this.inventoryRepo.create({
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantity: dto.quantity,
          app_key: ctx.app_key,
          tenant_key: ctx.tenant_key,
        });
      } else {
        inv.quantity = Number(inv.quantity) + Number(dto.quantity);
      }

      return await this.inventoryRepo.save(inv);
    } finally {
      await lock.release();
    }
  }

  async getInventoryLevels(warehouseId: string | undefined, ctx: TenantContext) {
    const where: any = { app_key: ctx.app_key, tenant_key: ctx.tenant_key };
    if (warehouseId) where.warehouseId = warehouseId;

    return await this.inventoryRepo.find({
      where,
      relations: ['product'],
    });
  }

  async setBuffer(dto: SetBufferDto, ctx: TenantContext) {
    let buffer = await this.bufferRepo.findOne({
      where: { product_id: dto.productId, app_key: ctx.app_key, tenant_key: ctx.tenant_key } as any,
    });

    if (buffer) {
      buffer.buffer_quantity = dto.bufferQuantity;
    } else {
      buffer = this.bufferRepo.create({
        product_id: dto.productId,
        buffer_quantity: dto.bufferQuantity,
        app_key: ctx.app_key,
        tenant_key: ctx.tenant_key,
      });
    }
    return await this.bufferRepo.save(buffer);
  }

  async saveLayout(dto: SaveLayoutDto, ctx: TenantContext) {
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
