import type { Context } from 'hono';

export const errorMiddleware = async (
  error: Error,
  c: Context,
) => {
  console.error(
    `[${new Date().toISOString()}] Error:`,
    error,
  );

  return c.json(
    {
      error: 'Internal Server Error',
      message:
        error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
    500,
  );
};
