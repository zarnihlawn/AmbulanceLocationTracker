import type { Context, Next } from 'hono';

export const corsMiddleware = async (
  c: Context,
  next: Next,
) => {
  const origin = c.req.header('origin');

  // CORS disabled - allow all origins
  if (origin) {
    c.header('Access-Control-Allow-Origin', origin);
  } else {
    c.header('Access-Control-Allow-Origin', '*');
  }

  c.header('Access-Control-Allow-Credentials', 'true');
  c.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  c.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  );
  c.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests - return response with CORS headers
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
};
