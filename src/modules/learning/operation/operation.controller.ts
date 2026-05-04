import { Controller, Post, Body, Param, UseGuards, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OperationService } from './operation.service';
import { EnrollmentStatus } from '@/entities/learning/learning-enrollment.entity';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
    role: string;
  };
}

@Controller('api/learning/operation')
@UseGuards(JwtAuthGuard)
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Post('enrollments/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EnrollmentStatus,
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.operationService.updateEnrollmentStatus(id, status, ctx);
  }

  @Get('instructor/dashboard')
  async getDashboard(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.operationService.getInstructorStats(ctx);
  }
}
