import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateQueueSettingsDto {
  @ApiPropertyOptional({ example: 10, description: 'Average minutes per token (affects estimated wait)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  averageServiceTime?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number;

  @ApiPropertyOptional({ example: 3, description: 'How many tokens ahead to alert the customer' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  alertAheadCount?: number;

  @ApiPropertyOptional({ description: 'Allow customers to join via QR / link (not just receptionist)' })
  @IsOptional()
  @IsBoolean()
  allowRemoteJoin?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requirePhone?: boolean;

  @ApiPropertyOptional({ description: 'Allow receptionist to issue emergency (priority) tokens' })
  @IsOptional()
  @IsBoolean()
  allowEmergencyTokens?: boolean;
}
