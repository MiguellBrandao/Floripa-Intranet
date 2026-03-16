import {
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CompanyScopedBodyDto } from '../../common/dto/company-scoped-body.dto';
import { reportPeriodTypes, reportTypes } from '../reports.constants';

export class CreateReportDto extends CompanyScopedBodyDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsIn(reportTypes)
  report_type!: (typeof reportTypes)[number];

  @IsIn(reportPeriodTypes)
  period_type!: (typeof reportPeriodTypes)[number];

  @IsOptional()
  @IsDateString()
  period_start?: string;

  @IsOptional()
  @IsDateString()
  period_end?: string;

  @IsString()
  @MaxLength(255)
  file_name!: string;

  @IsString()
  @MaxLength(100)
  mime_type!: string;

  @IsString()
  @MinLength(1)
  file_base64!: string;

  @IsObject()
  summary!: Record<string, unknown>;
}
