import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

@Controller('sales/wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('me')
  async getWishlist(@Req() req: any) {
    const userId = req.user.sub;
    return this.wishlistService.getWishlist(userId);
  }

  @Post('add')
  async addToWishlist(
    @Req() req: any,
    @Body() body: { productId: string; variantId?: string; note?: string }
  ) {
    const userId = req.user.sub;
    return this.wishlistService.addToWishlist(
      userId,
      body.productId,
      body.variantId,
      body.note
    );
  }

  @Post('remove')
  async removeFromWishlist(
    @Req() req: any,
    @Body() body: { productId: string; variantId?: string }
  ) {
    const userId = req.user.sub;
    return this.wishlistService.removeFromWishlist(userId, body.productId, body.variantId);
  }
}
