import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '../service.schema';

class CreateChargeDto {
  @ApiProperty({ example: 30000, description: 'Amount in paise (₹300 = 30000)' })
  @IsInt()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ example: 60000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAmount?: number;
}

export class CreateServiceDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  businessId: string;

  @ApiPropertyOptional({ example: '665f1a2b3c4d5e6f7a8b9c0e' })
  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @ApiProperty({ example: 'General Consultation' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'GEN', maxLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(8)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiProperty({ type: CreateChargeDto })
  @ValidateNested()
  @Type(() => CreateChargeDto)
  charge: CreateChargeDto;

  @ApiProperty({ example: 15, description: 'Estimated service duration in minutes' })
  @IsInt()
  @Min(1)
  @Max(480)
  estimatedDuration: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
