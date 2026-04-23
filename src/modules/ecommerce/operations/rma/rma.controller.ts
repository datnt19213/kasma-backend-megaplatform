import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RMAService } from './rma.service';

@Controller('api/operations/rma')
@UseGuards(JwtAuthGuard)
export class RMAController {
  constructor(private readonly rmaService: RMAService) {}

  @Post('request')
  async create(@Body() dto: any, @Req() req: any) {
    const context = {
      userId: req.user.id,
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.rmaService.createRequest(dto, context);
  }

  @Post('update-status')
  async updateStatus(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.rmaService.updateStatus(body.id, body.status, context);
  }

  @Post('inspect')
  async inspect(@Body() body: any, @Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.rmaService.addInspection(body.id, body.findings, context);
  }

  @Post('list')
  async list(@Req() req: any) {
    const context = {
      app_key: req.user?.app_key || 'MASTER',
      tenant_key: req.user?.tenant_key || 'MASTER',
    };
    return await this.rmaService.listRequests(context);
  }
}
