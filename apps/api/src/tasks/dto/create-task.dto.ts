import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { TASK_TYPES, type TaskType } from '../tasks.constants';

export class CreateTaskDto {
  @IsUUID()
  garden_id!: string;

  @IsUUID()
  team_id!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  start_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  end_time?: string;

  @IsString()
  @IsIn(TASK_TYPES)
  task_type!: TaskType;

  @IsOptional()
  @IsString()
  description?: string;
}
