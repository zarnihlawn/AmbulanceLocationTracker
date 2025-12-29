CREATE TABLE "visitor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"from_url" varchar(2048) NOT NULL,
	"to_url" varchar(2048),
	"method" varchar(10) NOT NULL,
	"user_agent" varchar(500),
	"referer" varchar(2048),
	"status_code" integer,
	"response_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
