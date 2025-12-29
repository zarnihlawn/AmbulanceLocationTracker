import type { Context, Next } from 'hono';

export const loggingMiddleware = async (
  c: Context,
  next: Next,
) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('user-agent') || 'Unknown';
  const ip =
    c.req.header('x-forwarded-for') ||
    c.req.header('x-real-ip') ||
    'Unknown';

  // Log request
  console.log(
    `[${new Date().toISOString()}] ${method} ${path} - IP: ${ip} - UA: ${userAgent.substring(0, 50)}`,
  );

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Log response
  console.log(
    `[${new Date().toISOString()}] ${method} ${path} - ${status} - ${duration}ms`,
  );
};
