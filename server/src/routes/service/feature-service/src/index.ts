import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { featureRoutes } from './handler/feature.handler';
import { appEnv } from './config/app.config';

const app = new Hono();

app.use('*', gatewayAuthMiddleware);

app.get('/health', (c) => {
  return c.json({
    message: 'Feature App API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/', featureRoutes);

const port = appEnv.FEATURE_PORT;
const hostname = appEnv.FEATURE_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
