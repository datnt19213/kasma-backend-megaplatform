import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { BundleService } from './bundle.service';
import { CreateBundleDto, UpdateBundleDto } from '@/dto/marketing-dto/bundle.dto';

@Controller('marketing/bundles')
@UseGuards(JwtAuthGuard)
export class BundleController {
  constructor(private readonly bundleService: BundleService) {}

  @Post('create')
  async create(@Body() dto: CreateBundleDto) {
    return this.bundleService.create(dto);
  }

  @Get('list')
  async findAll() {
    return this.bundleService.findAll();
  }

  @Post('details')
  async findOne(@Body() body: { id: string }) {
    return this.bundleService.findOne(body.id);
  }

  @Post('update')
  async update(@Body() body: { id: string; data: UpdateBundleDto }) {
    return this.bundleService.update(body.id, body.data);
  }

  @Post('remove')
  async remove(@Body() body: { id: string }) {
    return this.bundleService.remove(body.id);
  }
}
