import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProductCatalogService } from '@/modules/ecommerce/product-catalog/product-catalog.service';
import { CreateProductDto, UpdateProductDto, BulkCompareDto, ProductFilterDto } from '@/dto/ecommerce-dto/product.dto';

@Controller('ecommerce/products')
@UseGuards(JwtAuthGuard)
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) { }

  @Post('create')
  async createProduct(@Body() dto: CreateProductDto) {
    return await this.catalogService.createProduct(dto);
  }

  @Post('update')
  async updateProduct(@Body() body: { id: string; data: UpdateProductDto }) {
    return await this.catalogService.updateProduct(body.id, body.data);
  }

  @Post('delete')
  async deleteProduct(@Body() body: { id: string }) {
    return await this.catalogService.deleteProduct(body.id);
  }

  @Get('list')
  async listProducts(@Query() filter: ProductFilterDto) {
    return await this.catalogService.getAllProducts(filter);
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
  async compareProducts(@Body() dto: BulkCompareDto) {
    return await this.catalogService.compareProducts(dto.productIds);
  }

  @Get('feed')
  async generateFeed() {
    return await this.catalogService.generateFeed();
  }
}
