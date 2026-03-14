CREATE TYPE "product_unit_enum" AS ENUM (
  'unit',
  'kg',
  'g',
  'l',
  'ml',
  'm',
  'm2',
  'm3',
  'pack'
);
--> statement-breakpoint
ALTER TABLE "products"
ALTER COLUMN "unit" TYPE "product_unit_enum"
USING (
  CASE
    WHEN lower(trim("unit")) IN ('unit', 'kg', 'g', 'l', 'ml', 'm', 'm2', 'm3', 'pack')
      THEN lower(trim("unit"))::"product_unit_enum"
    ELSE 'unit'::"product_unit_enum"
  END
);
