import { Hono } from 'hono';
import { gatewayAuthMiddleware } from './middleware/gateway-auth.middleware';
import { appEnv } from './config/app.config';
import { userRoutes } from './handler/user.handler';
import { loginRoute } from './handler/login.handler';
import { passwordRoutes } from './handler/password.handler';

const app = new Hono();

// Health check (no auth required)
app.get('/health', (c) => {
  return c.json({
    message: 'Account App API',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Public routes (no gateway auth required)
// Register login route (includes /login, /refresh, /logout)
app.route('/', loginRoute);

// Register password reset routes (includes /forgot-password, /reset-password)
app.route('/', passwordRoutes);

// Protected routes (require gateway auth)
// Create a separate router for protected routes
const protectedRoutes = new Hono();
protectedRoutes.use('*', gatewayAuthMiddleware);
protectedRoutes.route('/', userRoutes);
app.route('/', protectedRoutes);

const port = appEnv.ACCOUNT_PORT;
const hostname = appEnv.ACCOUNT_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
