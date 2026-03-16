import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, ilike, inArray, type SQL } from 'drizzle-orm';
import { CompaniesService } from '../companies/companies.service';
import { db } from '../db';
import { reports } from '../db/schema';
import { CreateReportDto } from './dto/create-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import type { ReportPeriodType, ReportType } from './reports.constants';

type Requester = {
  id: string;
};

@Injectable()
export class ReportsService {
  constructor(private readonly companiesService: CompaniesService) {}

  async findAll(requester: Requester, query: ListReportsQueryDto) {
    const accessibleCompanyIds = await this.companiesService.resolveAdminCompanyIds(
      requester.id,
      query.company_id,
    );

    if (accessibleCompanyIds.length === 0) {
      return [];
    }

    const filters: SQL<unknown>[] = [inArray(reports.companyId, accessibleCompanyIds)];

    if (query.search?.trim()) {
      filters.push(ilike(reports.title, `%${query.search.trim()}%`));
    }

    if (query.report_type) {
      filters.push(eq(reports.reportType, query.report_type));
    }

    if (query.period_type) {
      filters.push(eq(reports.periodType, query.period_type));
    }

    const rows = await db
      .select({
        id: reports.id,
        company_id: reports.companyId,
        generated_by_company_membership_id: reports.generatedByCompanyMembershipId,
        generated_by_name: reports.generatedByName,
        report_type: reports.reportType,
        period_type: reports.periodType,
        period_start: reports.periodStart,
        period_end: reports.periodEnd,
        title: reports.title,
        file_name: reports.fileName,
        mime_type: reports.mimeType,
        summary_json: reports.summaryJson,
        created_at: reports.createdAt,
      })
      .from(reports)
      .where(and(...filters))
      .orderBy(desc(reports.createdAt));

    return rows.map((row) => this.mapSummary(row));
  }

  async findById(id: string, requester: Requester, companyId?: string) {
    const report = await this.findReportById(id);
    if (!report) {
      return null;
    }

    if (companyId && companyId !== report.company_id) {
      return null;
    }

    await this.companiesService.assertAdminAccess(requester.id, report.company_id);

    return this.mapSummary(report);
  }

  async create(dto: CreateReportDto, requester: Requester) {
    const membership = await this.companiesService.assertAdminAccess(
      requester.id,
      dto.company_id,
    );

    const rows = await db
      .insert(reports)
      .values({
        companyId: dto.company_id,
        generatedByCompanyMembershipId: membership.id,
        generatedByName: membership.name,
        reportType: dto.report_type,
        periodType: dto.period_type,
        periodStart: dto.period_start ?? null,
        periodEnd: dto.period_end ?? null,
        title: dto.title.trim(),
        fileName: dto.file_name.trim(),
        mimeType: dto.mime_type.trim(),
        fileBase64: dto.file_base64,
        summaryJson: JSON.stringify(dto.summary),
      })
      .returning({
        id: reports.id,
        company_id: reports.companyId,
        generated_by_company_membership_id: reports.generatedByCompanyMembershipId,
        generated_by_name: reports.generatedByName,
        report_type: reports.reportType,
        period_type: reports.periodType,
        period_start: reports.periodStart,
        period_end: reports.periodEnd,
        title: reports.title,
        file_name: reports.fileName,
        mime_type: reports.mimeType,
        summary_json: reports.summaryJson,
        created_at: reports.createdAt,
      });

    return this.mapSummary(rows[0]);
  }

  async update(id: string, dto: UpdateReportDto, requester: Requester) {
    const current = await this.findReportById(id);
    if (!current) {
      return null;
    }

    if (dto.company_id !== current.company_id) {
      throw new BadRequestException('company_id must match the report company_id');
    }

    await this.companiesService.assertAdminAccess(requester.id, current.company_id);

    const setPayload: {
      title?: string;
      reportType?: ReportType;
      periodType?: ReportPeriodType;
      periodStart?: string | null;
      periodEnd?: string | null;
      fileName?: string;
      mimeType?: string;
      fileBase64?: string;
      summaryJson?: string;
    } = {};

    if (dto.title !== undefined) {
      setPayload.title = dto.title.trim();
    }
    if (dto.report_type !== undefined) {
      setPayload.reportType = dto.report_type;
    }
    if (dto.period_type !== undefined) {
      setPayload.periodType = dto.period_type;
    }
    if (dto.period_start !== undefined) {
      setPayload.periodStart = dto.period_start ?? null;
    }
    if (dto.period_end !== undefined) {
      setPayload.periodEnd = dto.period_end ?? null;
    }
    if (dto.file_name !== undefined) {
      setPayload.fileName = dto.file_name.trim();
    }
    if (dto.mime_type !== undefined) {
      setPayload.mimeType = dto.mime_type.trim();
    }
    if (dto.file_base64 !== undefined) {
      setPayload.fileBase64 = dto.file_base64;
    }
    if (dto.summary !== undefined) {
      setPayload.summaryJson = JSON.stringify(dto.summary);
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(reports)
      .set(setPayload)
      .where(eq(reports.id, id))
      .returning({
        id: reports.id,
        company_id: reports.companyId,
        generated_by_company_membership_id: reports.generatedByCompanyMembershipId,
        generated_by_name: reports.generatedByName,
        report_type: reports.reportType,
        period_type: reports.periodType,
        period_start: reports.periodStart,
        period_end: reports.periodEnd,
        title: reports.title,
        file_name: reports.fileName,
        mime_type: reports.mimeType,
        summary_json: reports.summaryJson,
        created_at: reports.createdAt,
      });

    return updated[0] ? this.mapSummary(updated[0]) : null;
  }

  async remove(id: string, requester: Requester) {
    const current = await this.findReportById(id);
    if (!current) {
      return false;
    }

    await this.companiesService.assertAdminAccess(requester.id, current.company_id);

    const deleted = await db
      .delete(reports)
      .where(eq(reports.id, id))
      .returning({ id: reports.id });

    return deleted.length > 0;
  }

  private async findReportById(id: string) {
    const rows = await db
      .select({
        id: reports.id,
        company_id: reports.companyId,
        generated_by_company_membership_id: reports.generatedByCompanyMembershipId,
        generated_by_name: reports.generatedByName,
        report_type: reports.reportType,
        period_type: reports.periodType,
        period_start: reports.periodStart,
        period_end: reports.periodEnd,
        title: reports.title,
        file_name: reports.fileName,
        mime_type: reports.mimeType,
        file_base64: reports.fileBase64,
        summary_json: reports.summaryJson,
        created_at: reports.createdAt,
      })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  private mapSummary<T extends { summary_json: string | null }>(row: T) {
    const { summary_json, ...rest } = row;

    return {
      ...rest,
      summary: this.parseSummaryJson(summary_json),
    };
  }

  private parseSummaryJson(raw: string | null) {
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}
