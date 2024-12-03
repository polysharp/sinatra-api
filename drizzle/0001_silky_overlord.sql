CREATE TABLE IF NOT EXISTS "analyses" (
	"id" varchar PRIMARY KEY NOT NULL,
	"site_id" varchar NOT NULL,
	"performance" integer DEFAULT 0 NOT NULL,
	"accessibility" integer DEFAULT 0 NOT NULL,
	"best_practices" integer DEFAULT 0 NOT NULL,
	"seo" integer DEFAULT 0 NOT NULL,
	"status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "analyses_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analyses" ADD CONSTRAINT "analyses_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyses_site_id_index" ON "analyses" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyses_updated_at_index" ON "analyses" USING btree ("updated_at");