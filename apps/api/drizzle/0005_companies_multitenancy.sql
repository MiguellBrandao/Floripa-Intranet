CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"nif" varchar(50) NOT NULL,
	"mobile_phone" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"iban" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_unique" ON "companies" ("slug");
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "employee_teams" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "work_logs" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "product_usage" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "employees")
		OR EXISTS (SELECT 1 FROM "employee_teams")
		OR EXISTS (SELECT 1 FROM "teams")
		OR EXISTS (SELECT 1 FROM "gardens")
		OR EXISTS (SELECT 1 FROM "tasks")
		OR EXISTS (SELECT 1 FROM "work_logs")
		OR EXISTS (SELECT 1 FROM "products")
		OR EXISTS (SELECT 1 FROM "product_usage")
		OR EXISTS (SELECT 1 FROM "payments")
		OR EXISTS (SELECT 1 FROM "quotes") THEN
		RAISE EXCEPTION '0005_companies_multitenancy requires manual migration of existing pre-multitenancy data before applying this version.';
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "employee_teams" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "gardens" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "work_logs" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_usage" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "company_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "employee_teams" ADD CONSTRAINT "employee_teams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_usage" ADD CONSTRAINT "product_usage_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "employees_user_company_unique" ON "employees" ("user_id", "company_id");
