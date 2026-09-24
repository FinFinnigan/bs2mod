ALTER TABLE "orders" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "public_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_public_token_unique" UNIQUE("public_token");