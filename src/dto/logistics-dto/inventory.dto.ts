import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;
}

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SetBufferDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  bufferQuantity: number;
}

export class SaveLayoutDto {
  @IsString()
  @IsNotEmpty()
  warehouse_id: string;

  @IsArray()
  @IsOptional()
  aisles?: any[]; // This is unstructured/dynamic layout data
}
