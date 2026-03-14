import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const QUOTE_STATUSES = ['draft', 'sent'] as const;

export class CreateQuoteDto {
  @IsString()
  client_name!: string;

  @IsString()
  address!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @IsIn(QUOTE_STATUSES)
  status?: (typeof QUOTE_STATUSES)[number];
}

