import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ReportingService } from './reporting.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/reporting')
@UseGuards(JwtAuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('course/:courseId')
  async getCourseReport(@Param('courseId') courseId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.reportingService.getCoursePerformance(courseId, ctx);
  }

  @Get('learner/me')
  async getMyReport(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.reportingService.getLearnerReport(req.user.id, ctx);
  }

  @Get('learner/:studentId')
  async getStudentReport(@Param('studentId') studentId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.reportingService.getLearnerReport(studentId, ctx);
  }
}
