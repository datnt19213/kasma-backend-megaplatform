import { IsBoolean, IsNumber, IsOptional, IsString, IsObject, IsEnum } from 'class-validator';
import { LoyaltyTxType } from '@/entities/marketing/loyalty-point.entity';

export class CreateLoyaltyTierDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  minPoints: number;

  @IsObject()
  @IsOptional()
  benefits?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddLoyaltyPointsDto {
  @IsString()
  userId: string;

  @IsNumber()
  points: number;

  @IsEnum(LoyaltyTxType)
  transactionType: LoyaltyTxType;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
