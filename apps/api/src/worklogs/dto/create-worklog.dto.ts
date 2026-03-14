import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWorkLogDto {
  @IsUUID()
  task_id!: string;

  @IsUUID()
  team_id!: string;

  @IsISO8601()
  start_time!: string;

  @IsOptional()
  @IsISO8601()
  end_time?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
