import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto } from '@/dto/marketing-dto/promotion.dto';

@Controller('marketing/promotions')
@UseGuards(JwtAuthGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('create')
  async create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Get('list')
  async findAll() {
    return this.promotionService.findAll();
  }

  @Post('details')
  async findOne(@Body() body: { id: string }) {
    return this.promotionService.findOne(body.id);
  }

  @Post('update')
  async update(@Body() body: { id: string; data: UpdatePromotionDto }) {
    return this.promotionService.update(body.id, body.data);
  }

  @Post('remove')
  async remove(@Body() body: { id: string }) {
    return this.promotionService.remove(body.id);
  }
}
