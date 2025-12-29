import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { appEnv } from './config/app.config';
import { organizationRoutes } from './handler/organization.handler';

const app = new Hono();

app.use('*', gatewayAuthMiddleware);

app.get('/health', (c) => {
  return c.json({
    message: 'Organization App API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/', organizationRoutes);

const port = appEnv.ORGANIZATION_PORT;
const hostname = appEnv.ORGANIZATION_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
