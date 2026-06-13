import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargeStatus } from '../token.schema';

export class UpdateChargeDto {
  @ApiPropertyOptional({ example: 25000, description: 'Final charge in paise (₹250 = 25000)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  finalAmount?: number;

  @ApiProperty({ enum: [ChargeStatus.CONFIRMED, ChargeStatus.WAIVED] })
  @IsIn([ChargeStatus.CONFIRMED, ChargeStatus.WAIVED])
  status: ChargeStatus.CONFIRMED | ChargeStatus.WAIVED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
