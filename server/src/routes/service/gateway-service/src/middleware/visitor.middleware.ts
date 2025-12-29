import type { Context, Next } from 'hono';
import { db } from '../db';
import { VisitorRepository } from '../repo/visitor.repo';
import { VisitorService } from '../service/visitor.service';

// Initialize service (could be moved to dependency injection if needed)
const visitorRepo = new VisitorRepository(db);
const visitorLogService = new VisitorService(visitorRepo);

export const visitorLogMiddleware = async (
  c: Context,
  next: Next,
) => {
  const startTime = Date.now();
  const method = c.req.method;
  const fromUrl = c.req.path;
  const ipAddress =
    c.req.header('x-forwarded-for') ||
    c.req.header('x-real-ip') ||
    'unknown';
  const userAgent = c.req.header('user-agent') || undefined;
  const referer = c.req.header('referer') || undefined;

  // Execute the request
  await next();

  // Calculate response time
  const responseTime = Date.now() - startTime;
  const statusCode = c.res.status;

  // Get the toUrl from the response headers if available (where we proxied to)
  const toUrl =
    c.res.headers.get('x-gateway-upstream') || undefined;

  // Log the visit asynchronously (don't block the response)
  visitorLogService
    .logVisit({
      ipAddress,
      fromUrl,
      toUrl,
      method,
      userAgent,
      referer,
      statusCode,
      responseTime,
    })
    .catch((error: any) => {
      // Suppress table-not-found errors (migrations may not have run yet)
      if (error?.code !== '42P01') {
        console.error('Failed to log visitor:', error);
      }
    });

  // Don't wait for logging to complete
};
