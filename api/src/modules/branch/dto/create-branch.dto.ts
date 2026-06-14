import { IsNotEmpty, IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class OpeningHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsOptional()
  closed?: boolean;
}

export class CreateBranchDto {
  @IsNotEmpty()
  @IsString()
  businessId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsObject()
  location?: {
    type: string;
    coordinates: [number, number];
  };

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, OpeningHoursDto>;

  @IsOptional()
  @IsArray()
  holidays?: Date[];

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsArray()
  staff?: string[];
}
