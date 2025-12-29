import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { workspaceRoutes } from './handler/workspace.handler';
import { appEnv } from './config/app.config';

const app = new Hono();

app.use('*', gatewayAuthMiddleware);

app.get('/health', (c) => {
  return c.json({
    message: 'Workspace App API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/', workspaceRoutes);

const port = appEnv.WORKSPACE_PORT;
const hostname = appEnv.WORKSPACE_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
