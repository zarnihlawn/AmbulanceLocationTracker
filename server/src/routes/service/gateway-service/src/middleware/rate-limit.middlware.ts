import type { Context, Next } from 'hono';

// Simple in-memory rate limiter (use Redis in production)
const requestCounts = new Map<
  string,
  { count: number; resetTime: number }
>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

export const rateLimitMiddleware = (
  config: RateLimitConfig = defaultConfig,
) => {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header('x-forwarded-for') ||
      c.req.header('x-real-ip') ||
      'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      await next();
      return;
    }

    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      c.header(
        'X-RateLimit-Limit',
        config.maxRequests.toString(),
      );
      c.header('X-RateLimit-Remaining', '0');
      c.header(
        'X-RateLimit-Reset',
        new Date(record.resetTime).toISOString(),
      );

      return c.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Max ${config.maxRequests} requests per ${config.windowMs / 1000} seconds.`,
          retryAfter: Math.ceil(
            (record.resetTime - now) / 1000,
          ),
        },
        429,
      );
    }

    // Increment count
    record.count++;
    requestCounts.set(ip, record);

    c.header(
      'X-RateLimit-Limit',
      config.maxRequests.toString(),
    );
    c.header(
      'X-RateLimit-Remaining',
      (config.maxRequests - record.count).toString(),
    );
    c.header(
      'X-RateLimit-Reset',
      new Date(record.resetTime).toISOString(),
    );

    await next();
  };
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(requestCounts.entries());
  for (const [ip, record] of entries) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000); // Clean up every minute
