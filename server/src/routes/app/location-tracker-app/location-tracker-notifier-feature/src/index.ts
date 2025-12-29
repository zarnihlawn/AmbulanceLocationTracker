import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { notificationRoutes } from './handler/notification.handler';
import { appEnv } from './config/app.config';

const app = new Hono();

app.use('*', gatewayAuthMiddleware);

app.get('/health', (c) => {
  return c.json({
    message: 'Location Tracker Notifier Feature API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/', notificationRoutes);

const port = appEnv.LOCATION_TRACKER_NOTIFIER_PORT;
const hostname = appEnv.LOCATION_TRACKER_NOTIFIER_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};

