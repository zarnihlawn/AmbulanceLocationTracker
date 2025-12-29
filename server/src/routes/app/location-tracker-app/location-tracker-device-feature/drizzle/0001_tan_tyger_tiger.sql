CREATE TABLE "location_tracker_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"target_latitude" text,
	"target_longitude" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"response_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"responded_at" timestamp
);
