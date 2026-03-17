import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdatePlatformCompanyMembershipDto {
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'employee'])
  role?: 'admin' | 'employee';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  team_ids?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
