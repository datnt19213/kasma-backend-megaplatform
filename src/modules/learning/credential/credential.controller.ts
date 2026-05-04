import { Controller, Get, Post, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CertificateService } from './certificate.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/learning/credentials')
export class CredentialController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('certificates/generate/:courseId')
  @UseGuards(JwtAuthGuard)
  async generate(@Param('courseId') courseId: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.certificateService.checkAndGenerate(req.user.id, courseId, ctx);
  }

  @Get('certificates/my')
  @UseGuards(JwtAuthGuard)
  async getMy(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.certificateService.getMyCertificates(req.user.id, ctx);
  }

  @Get('certificates/verify/:code')
  async verify(@Param('code') code: string) {
    return await this.certificateService.verify(code);
  }
}
