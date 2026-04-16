import { Carrier } from '@/entities/logistics/carrier.entity';
import { Fulfillment } from '@/entities/logistics/fulfillment.entity';
import { PurchaseOrder } from '@/entities/logistics/purchase-order.entity';
import {
  ShippingMethod,
  ShippingZone,
} from '@/entities/logistics/shipping.entity';
import {
  WarehouseInventory,
} from '@/entities/logistics/warehouse-inventory.entity';
import { Warehouse } from '@/entities/logistics/warehouse.entity';
import { CarrierConfig } from '@/entities/mongo/carrier-config.mongo-entity';
import {
  InventoryBuffer,
} from '@/entities/mongo/inventory-buffer.mongo-entity';
import {
  WarehouseLayout,
} from '@/entities/mongo/warehouse-layout.mongo-entity';
import {
  FulfillmentController,
} from '@/modules/ecommerce/logistics/fulfillment/fulfillment.controller';
import {
  FulfillmentService,
} from '@/modules/ecommerce/logistics/fulfillment/fulfillment.service';
import {
  InventoryController,
} from '@/modules/ecommerce/logistics/inventory/inventory.controller';
import {
  InventoryService,
} from '@/modules/ecommerce/logistics/inventory/inventory.service';
import {
  ProcurementController,
} from '@/modules/ecommerce/logistics/procurement/procurement.controller';
import {
  ProcurementService,
} from '@/modules/ecommerce/logistics/procurement/procurement.service';
import {
  ShippingController,
} from '@/modules/ecommerce/logistics/shipping/shipping.controller';
import {
  ShippingService,
} from '@/modules/ecommerce/logistics/shipping/shipping.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      WarehouseInventory,
      ShippingZone,
      ShippingMethod,
      Carrier,
      Fulfillment,
      PurchaseOrder,
    ], 'postgres'),
    TypeOrmModule.forFeature([
      InventoryBuffer,
      WarehouseLayout,
      CarrierConfig,
    ], 'mongo'),
  ],
  controllers: [
    InventoryController,
    ShippingController,
    FulfillmentController,
    ProcurementController,
  ],
  providers: [
    InventoryService,
    ShippingService,
    FulfillmentService,
    ProcurementService,
  ],
  exports: [
    InventoryService,
    ShippingService,
    FulfillmentService,
    ProcurementService,
  ],
})
export class LogisticsModule { }
