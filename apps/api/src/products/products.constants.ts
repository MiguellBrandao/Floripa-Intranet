export const PRODUCT_UNITS = [
  'unit',
  'kg',
  'g',
  'l',
  'ml',
  'm',
  'm2',
  'm3',
  'pack',
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

