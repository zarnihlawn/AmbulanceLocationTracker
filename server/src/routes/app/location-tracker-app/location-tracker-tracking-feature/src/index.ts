import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { locationTrackingRoutes } from './handler/location-tracking.handler';
import { appEnv } from './config/app.config';

const app = new Hono();

app.use('*', gatewayAuthMiddleware);

app.get('/health', (c) => {
  return c.json({
    message: 'Location Tracker Tracking Feature API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/', locationTrackingRoutes);

const port = appEnv.LOCATION_TRACKER_TRACKING_PORT;
const hostname = appEnv.LOCATION_TRACKER_TRACKING_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
