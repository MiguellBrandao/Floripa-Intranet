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

export class UpdateReportDto extends CompanyScopedBodyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsIn(reportTypes)
  report_type?: (typeof reportTypes)[number];

  @IsOptional()
  @IsIn(reportPeriodTypes)
  period_type?: (typeof reportPeriodTypes)[number];

  @IsOptional()
  @IsDateString()
  period_start?: string;

  @IsOptional()
  @IsDateString()
  period_end?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  file_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mime_type?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  file_base64?: string;

  @IsOptional()
  @IsObject()
  summary?: Record<string, unknown>;
}
