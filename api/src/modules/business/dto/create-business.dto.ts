import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { BusinessType } from '../business.schema';

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(BusinessType)
  type?: BusinessType;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
