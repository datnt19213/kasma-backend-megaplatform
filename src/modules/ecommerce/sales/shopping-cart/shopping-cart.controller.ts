import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { ShoppingCartService } from './shopping-cart.service';
import { AddToCartDto, UpdateCartItemDto } from '@/dto/sales-dto/sales.dto';

@Controller('sales/cart')
@UseGuards(JwtAuthGuard)
export class ShoppingCartController {
  constructor(private readonly cartService: ShoppingCartService) {}

  @Get('me')
  async getCart(@Req() req: any) {
    const userId = req.user.sub;
    return this.cartService.getCart(userId);
  }

  @Post('add')
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user.sub;
    return this.cartService.addToCart(userId, dto);
  }

  @Post('update')
  async updateCartItem(@Req() req: any, @Body() dto: UpdateCartItemDto) {
    const userId = req.user.sub;
    return this.cartService.updateCartItem(userId, dto);
  }

  @Post('remove')
  async removeFromCart(
    @Req() req: any,
    @Body() body: { productId: string; variantId?: string }
  ) {
    const userId = req.user.sub;
    return this.cartService.removeFromCart(userId, body.productId, body.variantId);
  }

  @Post('clear')
  async clearCart(@Req() req: any) {
    const userId = req.user.sub;
    return this.cartService.clearCart(userId);
  }

  @Get('summary')
  async getSummary(@Req() req: any) {
    const userId = req.user.sub;
    return this.cartService.calculateTotals(userId);
  }
}
