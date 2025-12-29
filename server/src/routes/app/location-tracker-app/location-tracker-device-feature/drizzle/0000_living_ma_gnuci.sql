CREATE TABLE "location_tracker_device" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"secret_key" varchar,
	"device_key" varchar,
	"device_os" varchar,
	"device_os_version" varchar,
	"device_model" varchar,
	"app_version" varchar,
	"name" varchar(200),
	"description" text,
	"is_accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
