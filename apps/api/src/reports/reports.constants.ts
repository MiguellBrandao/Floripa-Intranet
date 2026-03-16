export const reportTypes = ['general'] as const;

export type ReportType = (typeof reportTypes)[number];

export const reportPeriodTypes = [
  'this_month',
  'last_month',
  'last_year',
  'all_time',
  'custom',
] as const;

export type ReportPeriodType = (typeof reportPeriodTypes)[number];
