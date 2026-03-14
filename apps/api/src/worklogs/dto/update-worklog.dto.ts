import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateWorkLogDto {
  @IsOptional()
  @IsISO8601()
  start_time?: string;

  @IsOptional()
  @IsISO8601()
  end_time?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
