import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { CreateCategoryDto } from '../../dto/ecommerce-dto/category.dto';
import {
  CreateProductDto,
  ProductFilterDto,
} from '../../dto/ecommerce-dto/product.dto';
import { CreateTagDto } from '../../dto/ecommerce-dto/tag.dto';
import { ProductCatalogService } from './product-catalog.service';

@Controller('ecommerce')
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) { }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Post('tags')
  createTag(@Body() dto: CreateTagDto) {
    return this.catalogService.createTag(dto);
  }

  @Get('tags')
  getTags() {
    return this.catalogService.getTags();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Get('products')
  searchProducts(@Query() filter: ProductFilterDto) {
    return this.catalogService.searchProducts(filter);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.findProductById(id);
  }
}
