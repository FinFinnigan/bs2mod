CREATE TABLE "order_transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"from_state" text NOT NULL,
	"to_state" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_transitions" ADD CONSTRAINT "order_transitions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check" CHECK ("orders"."status" IN ('draft', 'placed', 'confirmed', 'fulfilled', 'cancelled', 'failed'));