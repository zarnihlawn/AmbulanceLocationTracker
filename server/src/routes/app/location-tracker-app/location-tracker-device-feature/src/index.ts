import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { locationTrackerDeviceRoutes } from './handler/location-tracker-device.handler';
import { locationTrackerTaskRoutes } from './handler/location-tracker-task.handler';
import { appEnv } from './config/app.config';

const app = new Hono();

app.use('*', gatewayAuthMiddleware);

app.get('/health', (c) => {
  return c.json({
    message: 'Location Tracker Device Feature API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/', locationTrackerDeviceRoutes);
app.route('/task', locationTrackerTaskRoutes);

const port = appEnv.LOCATION_TRACKER_DEVICE_PORT;
const hostname =
  appEnv.LOCATION_TRACKER_DEVICE_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
