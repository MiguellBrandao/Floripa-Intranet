import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlatformCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo_path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  favicon_path?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nif?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobile_phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  iban?: string;
}
