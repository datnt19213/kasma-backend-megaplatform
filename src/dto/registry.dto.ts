import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateModuleDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];
}

export class CreateRegistryDto {
  @IsNotEmpty()
  @IsString()
  app_family_key: string;

  @IsNotEmpty()
  @IsString()
  tenant_key: string;

  @IsNotEmpty()
  @IsString()
  module_key: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateRegistryDto {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
