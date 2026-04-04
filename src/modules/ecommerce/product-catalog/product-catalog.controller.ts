import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProductCatalogService } from '@/modules/ecommerce/product-catalog/product-catalog.service';

@Controller('ecommerce/products')
@UseGuards(JwtAuthGuard)
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) { }

  @Post('create')
  async createProduct(@Body() dto: any) {
    return await this.catalogService.createProduct(dto);
  }

  @Post('update')
  async updateProduct(@Body() body: { id: string; data: any }) {
    return await this.catalogService.updateProduct(body.id, body.data);
  }

  @Post('delete')
  async deleteProduct(@Body() body: { id: string }) {
    return await this.catalogService.deleteProduct(body.id);
  }

  @Get('list')
  async listProducts() {
    return await this.catalogService.getAllProducts();
  }

  @Post('details')
  async getProductDetails(@Body() body: { id: string }) {
    return await this.catalogService.getProductById(body.id);
  }

  @Get('categories')
  async listCategories() {
    return await this.catalogService.getAllCategories();
  }

  @Post('compare')
  async compareProducts(@Body() body: { productIds: string[] }) {
    return await this.catalogService.compareProducts(body.productIds);
  }

  @Get('feed')
  async generateFeed() {
    return await this.catalogService.generateFeed();
  }
}
