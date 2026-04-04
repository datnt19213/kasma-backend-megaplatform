import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  IMAGE_360 = 'image_360',
  DOCUMENT = 'document',
}

class SpecificationDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ProductAttributeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class ProductMediaDto {
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;

  @IsBoolean()
  @IsOptional()
  isMain?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  attributes?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  @IsOptional()
  media?: ProductMediaDto[];
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  @IsOptional()
  specifications?: SpecificationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  @IsOptional()
  attributes?: ProductAttributeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  @IsOptional()
  media?: ProductMediaDto[];
}

export class UpdateProductDto extends CreateProductDto {}

export class ProductFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class BulkCompareDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  productIds: string[];
}
