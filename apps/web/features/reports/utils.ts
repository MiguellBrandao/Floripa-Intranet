import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subMonths,
  subYears,
} from "date-fns"
import type { DateRange } from "react-day-picker"

import type {
  Report,
  ReportDateRange,
  ReportPeriodType,
  ReportSummary,
} from "@/features/reports/types"

export const reportPeriodLabels: Record<ReportPeriodType, string> = {
  this_month: "Este mes",
  last_month: "Mes passado",
  last_year: "Ultimo 1 ano",
  all_time: "Todo o tempo",
  custom: "Customizado",
}

const emptyReportSummary: ReportSummary = {
  revenue: 0,
  expected_revenue: 0,
  open_amount: 0,
  direct_expenses: 0,
  product_usage_expenses: 0,
  total_expenses: 0,
  gross: 0,
  gardens_active: 0,
  tasks_total: 0,
  tasks_completed: 0,
  tasks_pending: 0,
  teams_with_activity: 0,
  members_with_activity: 0,
  stock_alerts: 0,
  quotes_created: 0,
  quotes_value: 0,
}

export function resolveReportDateRange(
  periodType: ReportPeriodType,
  customRange: DateRange | undefined,
  now = new Date()
): ReportDateRange {
  if (periodType === "all_time") {
    return { from: null, to: null }
  }

  if (periodType === "custom") {
    return {
      from: customRange?.from ? startOfDay(customRange.from) : null,
      to: customRange?.to
        ? endOfDay(customRange.to)
        : customRange?.from
          ? endOfDay(customRange.from)
          : null,
    }
  }

  if (periodType === "last_month") {
    const previousMonth = subMonths(now, 1)

    return {
      from: startOfMonth(previousMonth),
      to: endOfMonth(previousMonth),
    }
  }

  if (periodType === "last_year") {
    return {
      from: startOfDay(subYears(now, 1)),
      to: endOfDay(now),
    }
  }

  return {
    from: startOfMonth(now),
    to: endOfDay(now),
  }
}

export function formatReportDateRangeLabel(
  periodType: ReportPeriodType,
  range: ReportDateRange
) {
  if (periodType === "all_time") {
    return reportPeriodLabels[periodType]
  }

  if (!range.from) {
    return "Selecionar intervalo"
  }

  if (!range.to) {
    return format(range.from, "dd/MM/yyyy")
  }

  return `${format(range.from, "dd/MM/yyyy")} ate ${format(range.to, "dd/MM/yyyy")}`
}

export function buildDefaultReportTitle(
  periodType: ReportPeriodType,
  range: ReportDateRange
) {
  const suffix =
    periodType === "custom"
      ? formatReportDateRangeLabel(periodType, range)
      : reportPeriodLabels[periodType]

  return `Relatorio geral - ${suffix}`
}

export function buildReportFileName(title: string, createdAt = new Date()) {
  const safeTitle = sanitizeFileName(title) || "relatorio"
  return `${safeTitle}-${format(createdAt, "yyyyMMdd-HHmm")}.pdf`
}

export function formatReportCreatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

export function formatReportPeriodValue(report: Pick<Report, "period_type" | "period_start" | "period_end">) {
  if (report.period_type !== "custom") {
    return reportPeriodLabels[report.period_type]
  }

  if (!report.period_start) {
    return "Customizado"
  }

  if (!report.period_end) {
    return formatDate(report.period_start)
  }

  return `${formatDate(report.period_start)} ate ${formatDate(report.period_end)}`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(new Date(value))
}

export function normalizeReportSummary(summary: Partial<ReportSummary> | null | undefined): ReportSummary {
  if (!summary) {
    return emptyReportSummary
  }

  return {
    revenue: toFiniteNumber(summary.revenue),
    expected_revenue: toFiniteNumber(summary.expected_revenue),
    open_amount: toFiniteNumber(summary.open_amount),
    direct_expenses: toFiniteNumber(summary.direct_expenses),
    product_usage_expenses: toFiniteNumber(summary.product_usage_expenses),
    total_expenses: toFiniteNumber(summary.total_expenses),
    gross: toFiniteNumber(summary.gross),
    gardens_active: toFiniteNumber(summary.gardens_active),
    tasks_total: toFiniteNumber(summary.tasks_total),
    tasks_completed: toFiniteNumber(summary.tasks_completed),
    tasks_pending: toFiniteNumber(summary.tasks_pending),
    teams_with_activity: toFiniteNumber(summary.teams_with_activity),
    members_with_activity: toFiniteNumber(summary.members_with_activity),
    stock_alerts: toFiniteNumber(summary.stock_alerts),
    quotes_created: toFiniteNumber(summary.quotes_created),
    quotes_value: toFiniteNumber(summary.quotes_value),
  }
}

export function toDateOnly(value: Date | null) {
  return value ? format(value, "yyyy-MM-dd") : undefined
}

export function toDateTimeIso(value: Date | null, edge: "start" | "end") {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (edge === "start") {
    date.setHours(0, 0, 0, 0)
  } else {
    date.setHours(23, 59, 59, 999)
  }

  return date.toISOString()
}

export function isDateWithinRange(value: string, range: ReportDateRange) {
  const date = new Date(value)

  if (range.from && date < range.from) {
    return false
  }

  if (range.to && date > range.to) {
    return false
  }

  return true
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toFiniteNumber(value: unknown) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}
