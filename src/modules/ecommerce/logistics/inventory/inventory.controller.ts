import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@Controller('api/logistics/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  private getContext(req: any) {
    return {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
  }

  @Post('warehouse/create')
  async createWarehouse(@Body() dto: any, @Req() req: any) {
    return await this.inventoryService.createWarehouse(dto, this.getContext(req));
  }

  @Post('adjust')
  async adjustStock(@Body() dto: any, @Req() req: any) {
    return await this.inventoryService.adjustStock(dto, this.getContext(req));
  }

  @Post('list')
  async listInventory(@Body() body: { warehouseId?: string }, @Req() req: any) {
    return await this.inventoryService.getInventoryLevels(body.warehouseId, this.getContext(req));
  }

  @Post('buffer/set')
  async setBuffer(@Body() dto: any, @Req() req: any) {
    return await this.inventoryService.setBuffer(dto, this.getContext(req));
  }

  @Post('layout/save')
  async saveLayout(@Body() dto: any, @Req() req: any) {
    return await this.inventoryService.saveLayout(dto, this.getContext(req));
  }
}
