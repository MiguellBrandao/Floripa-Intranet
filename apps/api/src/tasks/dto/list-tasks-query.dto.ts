import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class ListTasksQueryDto {
  @IsOptional()
  @IsUUID()
  garden_id?: string;

  @IsOptional()
  @IsUUID()
  team_id?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date_from?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date_to?: string;
}
