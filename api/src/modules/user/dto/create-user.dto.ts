import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  firebaseUid?: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsMongoId()
  businessId?: string;
}
