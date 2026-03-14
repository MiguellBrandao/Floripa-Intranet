CREATE TABLE "employee_teams" (
	"employee_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_teams_employee_id_team_id_pk" PRIMARY KEY("employee_id","team_id")
);
--> statement-breakpoint
ALTER TABLE "employee_teams" ADD CONSTRAINT "employee_teams_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "employee_teams" ADD CONSTRAINT "employee_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "employee_teams" ("employee_id", "team_id")
SELECT "id", "team_id"
FROM "employees"
WHERE "team_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "employees_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN IF EXISTS "team_id";
