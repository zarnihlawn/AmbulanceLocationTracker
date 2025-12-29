import { Hono } from 'hono';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repo/user.repo';
import { db } from '../db';
import type {
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../type/user.type';

// Initialize dependencies
const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);

// Password reset routes
export const passwordRoutes = new Hono()
  // Forgot password - generate reset token
  .post('/forgot-password', async (c) => {
    try {
      const body = await c.req.json<ForgotPasswordDto>();
      
      if (!body.email) {
        return c.json({ error: 'Email is required' }, 400);
      }

      const resetToken = await userService.generatePasswordResetToken(
        body.email,
      );

      // In production, send email with reset link
      // For now, return token (remove this in production!)
      console.log(`[Password Reset] Reset token for ${body.email}: ${resetToken}`);
      
      return c.json({
        message:
          'If an account with that email exists, a password reset link has been sent',
        // Remove this in production - only for development
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process password reset request';
      return c.json({ error: message }, 400);
    }
  })
  // Reset password - use reset token to set new password
  .post('/reset-password', async (c) => {
    try {
      const body = await c.req.json<ResetPasswordDto>();
      
      if (!body.resetToken) {
        return c.json({ error: 'Reset token is required' }, 400);
      }
      
      if (!body.newPassword || body.newPassword.length < 6) {
        return c.json(
          { error: 'Password must be at least 6 characters' },
          400,
        );
      }

      await userService.resetPassword(body.resetToken, body.newPassword);

      return c.json({
        message: 'Password reset successfully. You can now login with your new password.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to reset password';
      return c.json({ error: message }, 400);
    }
  });

