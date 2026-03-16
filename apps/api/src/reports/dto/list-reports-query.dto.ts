import { IsIn, IsOptional, IsString } from 'class-validator';
import { CompanyScopedQueryDto } from '../../common/dto/company-scoped-query.dto';
import { reportPeriodTypes, reportTypes } from '../reports.constants';

export class ListReportsQueryDto extends CompanyScopedQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(reportTypes)
  report_type?: (typeof reportTypes)[number];

  @IsOptional()
  @IsIn(reportPeriodTypes)
  period_type?: (typeof reportPeriodTypes)[number];
}
