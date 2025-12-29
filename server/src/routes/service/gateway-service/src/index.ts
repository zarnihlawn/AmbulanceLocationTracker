import { Hono } from 'hono';
import { GatewayService } from './service/gateway.service';
import type { BodyInit } from 'bun';
import { db } from './db';
import { corsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/log.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middlware';
import { visitorLogMiddleware } from './middleware/visitor.middleware';
import { VisitorRepository } from './repo/visitor.repo';
import { VisitorService } from './service/visitor.service';
import { appEnv } from './config/app.config';

const app = new Hono();
const gatewayService = new GatewayService(30000); // 30 second timeout

// Initialize visitor log service
const visitorRepo = new VisitorRepository(db);
const visitorService = new VisitorService(visitorRepo);

// Middleware
app.use('*', corsMiddleware); // Custom CORS middleware
app.use('*', loggingMiddleware); // Request/response logging
app.use(
  '*',
  rateLimitMiddleware({
    windowMs: 60000,
    maxRequests: 100,
  }),
); // Rate limiting
app.use('*', visitorLogMiddleware); // Visitor logging to database

// Health check
app.get('/', (c) => {
  return c.json({
    message: 'API Gateway',
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Admin endpoint to view visitor logs
app.get('/admin/visitor-logs', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const logs = await visitorService.getAllLogs(
      Math.min(limit, 100),
    );
    const count = await visitorService.getLogCount();

    return c.json({
      total: count,
      logs,
    });
  } catch (error) {
    return c.json(
      {
        error: 'Failed to fetch visitor logs',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      500,
    );
  }
});

// Proxy all requests to appropriate services
app.all('*', async (c) => {
  const path = c.req.path;
  const method = c.req.method;
  const headers = c.req.header();

  // Get request body if present (for POST, PUT, PATCH)
  let body: BodyInit | null = null;
  if (
    method !== 'GET' &&
    method !== 'HEAD' &&
    method !== 'DELETE'
  ) {
    try {
      const contentType = headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await c.req.json());
      } else {
        // For other content types, get raw body
        body = await c.req.text();
      }
    } catch {
      body = null;
    }
  }

  // Proxy the request
  return gatewayService.proxyRequest(
    path,
    method,
    headers,
    body,
  );
});

// Error handling
app.onError(errorMiddleware);

const port = appEnv.GATEWAY_PORT;
const hostname = appEnv.GATEWAY_HOST || '0.0.0.0';

export default {
  port,
  hostname,
  fetch: app.fetch,
};
