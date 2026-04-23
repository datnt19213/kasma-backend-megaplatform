import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreatePayoutRequestDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @IsNotEmpty()
  destinationInfo: any; // Unstructured bank/account info
}

export class ProcessPayoutDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsNotEmpty()
  provider: string;
}

export class PayoutListFilterDto {
  @IsString()
  @IsOptional()
  vendorId?: string;
}
