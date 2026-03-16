import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyScopedQueryDto } from '../common/dto/company-scoped-query.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private requesterFrom(request: Request) {
    const user = request.user as { id: string };
    return { id: user.id };
  }

  @Get()
  findAll(@Req() request: Request, @Query() query: ListReportsQueryDto) {
    return this.reportsService.findAll(this.requesterFrom(request), query);
  }

  @Get(':id')
  async findOne(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: CompanyScopedQueryDto,
  ) {
    const report = await this.reportsService.findById(
      id,
      this.requesterFrom(request),
      query.company_id,
    );

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  @Post()
  create(@Req() request: Request, @Body() dto: CreateReportDto) {
    return this.reportsService.create(dto, this.requesterFrom(request));
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReportDto,
  ) {
    const updated = await this.reportsService.update(
      id,
      dto,
      this.requesterFrom(request),
    );

    if (!updated) {
      throw new NotFoundException('Report not found');
    }

    return updated;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const removed = await this.reportsService.remove(
      id,
      this.requesterFrom(request),
    );

    if (!removed) {
      throw new NotFoundException('Report not found');
    }
  }
}
