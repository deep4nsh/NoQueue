import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateQueueDto {
  @ApiProperty()
  @IsMongoId()
  branchId: string;

  @ApiProperty()
  @IsMongoId()
  businessId: string;

  @ApiProperty({ example: 'OPD Queue' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A', default: 'A', description: 'Single letter prefix for token display' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({ example: 10, description: 'Average minutes to serve one token' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  averageServiceTime?: number;
}
