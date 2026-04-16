import { Body, Controller, Post, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProcurementService } from './procurement.service';

@Controller('api/logistics/procurement')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  private getContext(req: any) {
    return {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
  }

  @Post('po/create')
  async createPO(@Body() dto: any, @Req() req: any) {
    return await this.procurementService.createPO(dto, this.getContext(req));
  }

  @Post('po/:id/update-status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: any },
    @Req() req: any
  ) {
    return await this.procurementService.updatePOStatus(id, body.status, this.getContext(req));
  }

  @Post('po/list')
  async listPOs(@Req() req: any) {
    return await this.procurementService.listPOs(this.getContext(req));
  }
}
