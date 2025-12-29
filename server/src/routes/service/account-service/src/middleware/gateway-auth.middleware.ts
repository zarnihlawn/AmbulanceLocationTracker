import type { Context, Next } from 'hono';

/**
 * Middleware to ensure requests come from the gateway
 * Checks for x-forwarded-by header that the gateway sets
 */
export const gatewayAuthMiddleware = async (
  c: Context,
  next: Next,
) => {
  const forwardedBy = c.req.header('x-forwarded-by');

  if (forwardedBy !== 'gateway') {
    return c.json(
      {
        error: 'Forbidden',
        message:
          'Direct access not allowed. Requests must come through the gateway.',
      },
      403,
    );
  }

  await next();
};
