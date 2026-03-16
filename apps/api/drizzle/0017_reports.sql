DO $$ BEGIN
 CREATE TYPE "public"."report_type_enum" AS ENUM('general');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."report_period_type_enum" AS ENUM('this_month', 'last_month', 'last_year', 'all_time', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"generated_by_company_membership_id" uuid,
	"generated_by_name" varchar(255) NOT NULL,
	"report_type" "report_type_enum" DEFAULT 'general' NOT NULL,
	"period_type" "report_period_type_enum" NOT NULL,
	"period_start" date,
	"period_end" date,
	"title" varchar(255) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_base64" text NOT NULL,
	"summary_json" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_company_membership_id_company_memberships_id_fk" FOREIGN KEY ("generated_by_company_membership_id") REFERENCES "public"."company_memberships"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
