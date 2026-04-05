import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto } from '@/dto/marketing-dto/coupon.dto';

@Controller('marketing/coupons')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  async create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get('list')
  async findAll() {
    return this.couponService.findAll();
  }

  @Post('details')
  async findOne(@Body() body: { id: string }) {
    return this.couponService.findOne(body.id);
  }

  @Post('update')
  async update(@Body() body: { id: string; data: UpdateCouponDto }) {
    return this.couponService.update(body.id, body.data);
  }

  @Post('remove')
  async remove(@Body() body: { id: string }) {
    return this.couponService.remove(body.id);
  }

  @Post('validate')
  async validate(@Body() body: { code: string }) {
    return this.couponService.validateCoupon(body.code);
  }
}
