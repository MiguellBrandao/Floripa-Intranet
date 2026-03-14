import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class ListWorkLogsQueryDto {
  @IsOptional()
  @IsUUID()
  task_id?: string;

  @IsOptional()
  @IsUUID()
  team_id?: string;

  @IsOptional()
  @IsUUID()
  garden_id?: string;

  @IsOptional()
  @IsISO8601()
  start_from?: string;

  @IsOptional()
  @IsISO8601()
  start_to?: string;
}
