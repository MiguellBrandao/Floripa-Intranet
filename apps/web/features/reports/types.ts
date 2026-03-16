import type { DateRange } from "react-day-picker"

export type ReportType = "general"

export type ReportPeriodType =
  | "this_month"
  | "last_month"
  | "last_year"
  | "all_time"
  | "custom"

export type ReportSummary = {
  revenue: number
  expected_revenue: number
  open_amount: number
  direct_expenses: number
  product_usage_expenses: number
  total_expenses: number
  gross: number
  gardens_active: number
  tasks_total: number
  tasks_completed: number
  tasks_pending: number
  teams_with_activity: number
  members_with_activity: number
  stock_alerts: number
  quotes_created: number
  quotes_value: number
}

export type Report = {
  id: string
  company_id: string
  generated_by_company_membership_id: string | null
  generated_by_name: string
  report_type: ReportType
  period_type: ReportPeriodType
  period_start: string | null
  period_end: string | null
  title: string
  file_name: string
  mime_type: string
  file_base64?: string
  summary: ReportSummary
  created_at: string
}

export type SaveReportPayload = {
  title: string
  report_type: ReportType
  period_type: ReportPeriodType
  period_start?: string
  period_end?: string
  file_name: string
  mime_type: string
  file_base64: string
  summary: ReportSummary
}

export type UpdateReportPayload = {
  title?: string
  file_name?: string
}

export type ReportDateRange = {
  from: Date | null
  to: Date | null
}

export type ReportPeriodState = {
  periodType: ReportPeriodType
  customRange?: DateRange
}
