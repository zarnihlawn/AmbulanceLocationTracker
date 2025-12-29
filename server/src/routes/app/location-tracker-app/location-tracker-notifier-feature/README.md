# location-tracker-notifier-feature

Notification service for handling webhooks between web and Android app.

## Features

- Webhook endpoints for web-to-android notifications
- Webhook endpoints for android-to-web notifications
- Notification tracking and status management
- Retry mechanism with exponential backoff

## Endpoints

- `POST /webhook/web-to-android` - Receive notification from web, forward to Android
- `POST /webhook/android-to-web` - Receive notification from Android, forward to web
- `GET /device/:deviceId` - Get notifications for a device
- `GET /:id` - Get a specific notification
- `GET /health` - Health check

## To install dependencies:

```bash
bun install
```

## To run:

```bash
bun run src/index.ts
```

## To generate migrations:

```bash
bunx drizzle-kit generate
```

## To run migrations:

```bash
bun run src/db/migrate-run.ts
```

