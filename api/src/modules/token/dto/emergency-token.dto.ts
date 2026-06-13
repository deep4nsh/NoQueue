import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EmergencyCustomerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class EmergencyTokenDto {
  @ApiProperty()
  @IsMongoId()
  queueId: string;

  @ApiProperty({ type: EmergencyCustomerDto })
  @ValidateNested()
  @Type(() => EmergencyCustomerDto)
  customer: EmergencyCustomerDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  serviceId?: string;

  @ApiProperty({ description: 'Reason for priority — logged to audit trail' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
