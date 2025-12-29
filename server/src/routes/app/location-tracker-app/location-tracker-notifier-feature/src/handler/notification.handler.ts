import { Hono } from 'hono';
import { db } from '../db';
import type { CreateNotificationDto } from '../interface/notification.interface';
import { NotificationRepository } from '../repo/notification.repo';
import { NotificationService } from '../service/notification.service';

// Create service instances directly
const notificationRepo = new NotificationRepository(db);
const notificationService = new NotificationService(notificationRepo);

export const notificationRoutes = new Hono()
  // POST /webhook/web-to-android - Webhook endpoint for web -> android notifications
  .post('/webhook/web-to-android', async (c) => {
    try {
      const body = await c.req.json<CreateNotificationDto>();

      if (!body || !body.deviceId) {
        return c.json({ error: 'deviceId is required' }, 400);
      }

      if (body.direction !== 'web_to_android') {
        return c.json(
          { error: 'direction must be web_to_android' },
          400,
        );
      }

      console.log(
        `[Notification Handler] Received web-to-android notification for device: ${body.deviceId}`,
      );

      const notification =
        await notificationService.createNotification({
          ...body,
          direction: 'web_to_android',
        });

      return c.json(notification, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create notification';
      console.error(
        `[Notification Handler] Error creating web-to-android notification: ${message}`,
        error,
      );
      return c.json({ error: message }, 500);
    }
  })
  // POST /webhook/android-to-web - Webhook endpoint for android -> web notifications
  .post('/webhook/android-to-web', async (c) => {
    try {
      const body = await c.req.json<CreateNotificationDto>();

      if (!body || !body.deviceId) {
        return c.json({ error: 'deviceId is required' }, 400);
      }

      if (body.direction !== 'android_to_web') {
        return c.json(
          { error: 'direction must be android_to_web' },
          400,
        );
      }

      console.log(
        `[Notification Handler] Received android-to-web notification for device: ${body.deviceId}`,
      );

      const notification =
        await notificationService.createNotification({
          ...body,
          direction: 'android_to_web',
        });

      return c.json(notification, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create notification';
      console.error(
        `[Notification Handler] Error creating android-to-web notification: ${message}`,
        error,
      );
      return c.json({ error: message }, 500);
    }
  })
  // GET /device/:deviceId - Get notifications for a device
  .get('/device/:deviceId', async (c) => {
    try {
      const deviceId = c.req.param('deviceId');
      const limit = c.req.query('limit')
        ? parseInt(c.req.query('limit') || '100')
        : 100;
      const notifications =
        await notificationService.getNotificationsByDeviceId(
          deviceId,
          limit,
        );
      return c.json(notifications);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch notifications';
      return c.json({ error: message }, 500);
    }
  })
  // GET /:id - Get a specific notification
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const notification =
        await notificationService.getNotificationById(id);
      if (!notification) {
        return c.json({ error: 'Notification not found' }, 404);
      }
      return c.json(notification);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch notification';
      return c.json({ error: message }, 500);
    }
  });

