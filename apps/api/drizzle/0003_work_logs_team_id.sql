ALTER TABLE "work_logs" ADD COLUMN "team_id" uuid;
--> statement-breakpoint
UPDATE "work_logs" AS "wl"
SET "team_id" = "t"."team_id"
FROM "tasks" AS "t"
WHERE "wl"."task_id" = "t"."id";
--> statement-breakpoint
DELETE FROM "work_logs"
WHERE "team_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "work_logs" ALTER COLUMN "team_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "work_logs" DROP CONSTRAINT IF EXISTS "work_logs_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "work_logs" DROP COLUMN IF EXISTS "employee_id";
