import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAffiliateProgramDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  commissionRate: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class CreateAffiliateLinkDto {
  @IsString()
  userId: string;

  @IsString()
  programId: string;

  @IsString()
  @IsOptional()
  code?: string;
}
