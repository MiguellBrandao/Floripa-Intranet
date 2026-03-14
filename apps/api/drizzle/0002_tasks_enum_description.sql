CREATE TYPE "task_type_enum" AS ENUM (
  'maintenance',
  'pruning',
  'cleaning',
  'installation',
  'inspection',
  'emergency'
);
--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "notes" TO "description";
--> statement-breakpoint
ALTER TABLE "tasks"
ALTER COLUMN "task_type" TYPE "task_type_enum"
USING (
  CASE
    WHEN "task_type" IN ('maintenance', 'pruning', 'cleaning', 'installation', 'inspection', 'emergency')
      THEN "task_type"::"task_type_enum"
    ELSE 'maintenance'::"task_type_enum"
  END
);
--> statement-breakpoint
UPDATE "tasks"
SET "task_type" = 'maintenance'
WHERE "task_type" IS NULL;
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "task_type" SET DEFAULT 'maintenance';
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "task_type" SET NOT NULL;
