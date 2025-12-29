import type { Context, Next } from 'hono';
import { UserRepository } from '../repo/user.repo';
import { RefreshTokenRepository } from '../repo/token.repo';
import { db } from '../db';
import { AuthService } from '../service/auth.service';

// Initialize auth service for middleware
const userRepo = new UserRepository(db);
const tokenRepo = new RefreshTokenRepository(db);
const authService = new AuthService(userRepo, tokenRepo);

/**
 * Middleware to verify JWT access token
 * Adds user info to context if token is valid
 */
export const authMiddleware = async (
  c: Context,
  next: Next,
) => {
  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      },
      401,
    );
  }

  const token = authHeader.substring(7);
  const payload = authService.verifyAccessToken(token);

  if (!payload) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      },
      401,
    );
  }

  // Add user info to context
  c.set('user', payload);

  await next();
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
export const optionalAuthMiddleware = async (
  c: Context,
  next: Next,
) => {
  const authHeader = c.req.header('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = authService.verifyAccessToken(token);
    if (payload) {
      c.set('user', payload);
    }
  }

  await next();
};

/**
 * Auto-refresh token middleware
 * Automatically refreshes access token if it's expired or about to expire
 * Adds new tokens to response headers
 */
export const autoRefreshTokenMiddleware = async (
  c: Context,
  next: Next,
) => {
  const authHeader = c.req.header('authorization');
  const refreshToken = c.req.header('x-refresh-token');

  // If access token is provided, check if it needs refresh
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = authService.verifyAccessToken(token);

    // If token is invalid or expired, try to refresh
    if (!payload && refreshToken) {
      try {
        const newTokens = await authService.refreshAccessToken(refreshToken);
        
        // Add new tokens to response headers
        c.header('x-new-access-token', newTokens.accessToken);
        c.header('x-new-refresh-token', newTokens.refreshToken);
        c.header('x-token-refreshed', 'true');
        
        // Set user in context from new token
        const newPayload = authService.verifyAccessToken(newTokens.accessToken);
        if (newPayload) {
          c.set('user', newPayload);
        }
      } catch (error) {
        // Refresh failed - continue with original request
        // The route handler will handle authentication
      }
    } else if (payload) {
      // Token is valid - check if it's about to expire (within 1 hour)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
          );
          const expiresAt = decoded.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          
          // If token expires within 1 hour, refresh it
          if (timeUntilExpiry > 0 && timeUntilExpiry < 60 * 60 * 1000 && refreshToken) {
            try {
              const newTokens = await authService.refreshAccessToken(refreshToken);
              c.header('x-new-access-token', newTokens.accessToken);
              c.header('x-new-refresh-token', newTokens.refreshToken);
              c.header('x-token-refreshed', 'true');
            } catch (error) {
              // Refresh failed - continue with current token
            }
          }
        }
      } catch (error) {
        // Error parsing token - continue
      }
    }
  }

  await next();
};
