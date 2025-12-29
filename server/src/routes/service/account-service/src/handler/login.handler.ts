import { Hono } from 'hono';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repo/user.repo';
import { RefreshTokenRepository } from '../repo/token.repo';
import { AuthService } from '../service/auth.service';
import { db } from '../db';
import type { LoginDto } from '../type/user.type';

// Initialize dependencies
const userRepo = new UserRepository(db);
const tokenRepo = new RefreshTokenRepository(db);
const userService = new UserService(userRepo);
const authService = new AuthService(userRepo, tokenRepo);

// Login route that returns user info and JWT tokens
export const loginRoute = new Hono()
  .post('/login', async (c) => {
    try {
      const body = await c.req.json<LoginDto>();
      const loginResult = await userService.login(
        body.emailOrUsername,
        body.password,
      );

      // Generate JWT tokens for authenticated users
      const tokens = await authService.generateTokens({
        id: loginResult.id,
        email: loginResult.email,
        username: loginResult.username,
      });

      // Return user info and tokens
      return c.json({
        user: loginResult,
        ...tokens,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login failed';
      return c.json({ error: message }, 401);
    }
  })
  // Refresh token endpoint (auto-refresh)
  .post('/refresh', async (c) => {
    try {
      const body = await c.req.json<{
        refreshToken: string;
      }>();
      
      if (!body.refreshToken) {
        return c.json({ error: 'Refresh token is required' }, 400);
      }
      
      const tokens = await authService.refreshAccessToken(
        body.refreshToken,
      );
      
      return c.json({
        ...tokens,
        message: 'Tokens refreshed successfully',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Token refresh failed';
      return c.json({ error: message }, 401);
    }
  })
  // Logout endpoint (revoke refresh token or all tokens)
  .post('/logout', async (c) => {
    try {
      const body = await c.req.json<{
        refreshToken?: string;
        revokeAll?: boolean;
      }>();
      
      // If revokeAll is true, revoke all tokens for the user
      if (body.revokeAll) {
        // Get user from access token in Authorization header
        const authHeader = c.req.header('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const payload = authService.verifyAccessToken(token);
          if (payload) {
            await authService.revokeAllUserTokens(payload.userId);
            return c.json({ message: 'All sessions logged out successfully' });
          }
        }
        return c.json({ error: 'Invalid or missing access token' }, 401);
      }
      
      // Otherwise, revoke just the refresh token
      if (body.refreshToken) {
        await authService.revokeRefreshToken(body.refreshToken);
        return c.json({ message: 'Logged out successfully' });
      }
      
      return c.json({ error: 'refreshToken is required' }, 400);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Logout failed';
      return c.json({ error: message }, 400);
    }
  });
