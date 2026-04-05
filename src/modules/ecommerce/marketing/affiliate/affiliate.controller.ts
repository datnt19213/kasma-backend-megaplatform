import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AffiliateService } from './affiliate.service';
import { CreateAffiliateProgramDto, CreateAffiliateLinkDto } from '@/dto/marketing-dto/affiliate.dto';

@Controller('marketing/affiliate')
@UseGuards(JwtAuthGuard)
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('program/create')
  async createProgram(@Body() dto: CreateAffiliateProgramDto) {
    return this.affiliateService.createProgram(dto);
  }

  @Get('program/list')
  async listPrograms() {
    return this.affiliateService.findAllPrograms();
  }

  @Post('link/create')
  async createLink(@Body() dto: CreateAffiliateLinkDto) {
    return this.affiliateService.createLink(dto);
  }

  @Get('me/links')
  async getMyLinks(@Req() req: any) {
    return this.affiliateService.getMyLinks(req.user.sub);
  }

  @Post('link/lookup')
  async lookupLink(@Body() body: { code: string }) {
    return this.affiliateService.findLinkByCode(body.code);
  }
}
