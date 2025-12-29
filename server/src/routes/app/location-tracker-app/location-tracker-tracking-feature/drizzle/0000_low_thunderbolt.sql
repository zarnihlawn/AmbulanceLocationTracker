CREATE TABLE "location_tracking_tracker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"accuracy" double precision,
	"altitude" double precision,
	"speed" double precision,
	"heading" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
