import { apiFetch } from "@/lib/api/http"
import {
  appendCompanyId,
  requireActiveCompanyId,
} from "@/lib/auth/company"

import type {
  Report,
  ReportPeriodType,
  SaveReportPayload,
  UpdateReportPayload,
} from "@/features/reports/types"

type ListReportsFilters = {
  search?: string
  period_type?: ReportPeriodType
}

export function listReports(authToken: string, filters?: ListReportsFilters) {
  const companyId = requireActiveCompanyId()
  const params = new URLSearchParams({ company_id: companyId })

  if (filters?.search?.trim()) {
    params.set("search", filters.search.trim())
  }
  if (filters?.period_type) {
    params.set("period_type", filters.period_type)
  }

  return apiFetch<Report[]>(`/reports?${params.toString()}`, {
    authToken,
    requireAuth: true,
  })
}

export function getReportById(authToken: string, reportId: string) {
  const companyId = requireActiveCompanyId()

  return apiFetch<Report>(appendCompanyId(`/reports/${reportId}`, companyId), {
    authToken,
    requireAuth: true,
  })
}

export function createReport(authToken: string, payload: SaveReportPayload) {
  const companyId = requireActiveCompanyId()

  return apiFetch<Report>("/reports", {
    method: "POST",
    authToken,
    requireAuth: true,
    body: JSON.stringify({ ...payload, company_id: companyId }),
  })
}

export function updateReport(
  authToken: string,
  reportId: string,
  payload: UpdateReportPayload
) {
  const companyId = requireActiveCompanyId()

  return apiFetch<Report>(`/reports/${reportId}`, {
    method: "PATCH",
    authToken,
    requireAuth: true,
    body: JSON.stringify({ ...payload, company_id: companyId }),
  })
}

export function deleteReport(authToken: string, reportId: string) {
  return apiFetch<void>(`/reports/${reportId}`, {
    method: "DELETE",
    authToken,
    requireAuth: true,
  })
}
