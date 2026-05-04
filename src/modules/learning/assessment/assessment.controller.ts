import { Controller, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, Query, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AssessmentService } from './assessment.service';
import { MediaProviderKey } from '@/config/apps';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/assessments')
@UseGuards(JwtAuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post(':id/start')
  async start(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.assessmentService.startAttempt(id, req.user.id, ctx);
  }

  @Post('attempt/:id/submit')
  async submit(@Param('id') id: string, @Body('answers') answers: any, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.assessmentService.submitAssessment(id, answers, req.user.id, ctx);
  }

  @Post('attempt/:id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('provider') provider: MediaProviderKey = MediaProviderKey.KEDIA,
    @Req() req: RequestWithUser
  ) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.assessmentService.uploadAssignment(id, file, provider, req.user.id, ctx);
  }
}
