ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_super_admin" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");
