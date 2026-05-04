import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Req,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProductCatalogService } from '@/modules/ecommerce/product-catalog/product-catalog.service';
import { CreateProductDto, UpdateProductDto, BulkCompareDto, ProductFilterDto } from '@/dto/ecommerce-dto/product.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    app_key: string;
    tenant_key: string;
  };
}

@Controller('api/ecommerce/products')
@UseGuards(JwtAuthGuard)
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) { }

  @Post('create')
  async createProduct(@Body() dto: CreateProductDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.catalogService.createProduct(dto, ctx);
  }

  @Post(':id/update')
  async updateProduct(@Param('id') id: string, @Body() data: UpdateProductDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.catalogService.updateProduct(id, data as any, ctx);
  }

  @Post(':id/delete')
  async deleteProduct(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.catalogService.deleteProduct(id, ctx);
  }

  @Get('list')
  async listProducts(@Query() filter: ProductFilterDto, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.catalogService.getAllProducts(filter, ctx);
  }

  @Get(':id')
  async getProductDetails(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.catalogService.getProductById(id, ctx);
  }

  @Get('categories/list')
  async listCategories(@Req() req: RequestWithUser) {
    const ctx = { app_key: req.user.app_key, tenant_key: req.user.tenant_key };
    return await this.catalogService.getAllCategories(ctx);
  }
}
