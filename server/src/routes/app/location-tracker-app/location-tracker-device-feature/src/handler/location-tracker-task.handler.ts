import { Hono } from 'hono';
import type {
  CreateLocationTrackerTaskDto,
  UpdateTaskStatusDto,
} from '../interface/location-tracker-task.interface';
import { LocationTrackerTaskRepository } from '../repo/location-tracker-task.repo';
import { LocationTrackerTaskService } from '../service/location-tracker-task.service';
import { db } from '../db';

const taskRepo = new LocationTrackerTaskRepository(db);
const taskService = new LocationTrackerTaskService(taskRepo);

export const locationTrackerTaskRoutes = new Hono()
  // POST / - Create a new task
  .post('/', async (c) => {
    try {
      const body = await c.req.json<CreateLocationTrackerTaskDto>();

      if (!body.deviceId || !body.type || !body.title) {
        return c.json(
          { error: 'deviceId, type, and title are required' },
          400,
        );
      }

      if (body.type !== 'text' && body.type !== 'location') {
        return c.json(
          { error: 'type must be either "text" or "location"' },
          400,
        );
      }

      const task = await taskService.createTask(body);

      // Send notification to Android via notifier service
      try {
        // Use gateway route to notifier service
        const gatewayBaseUrl = process.env.GATEWAY_BASE_URL || 'http://localhost:1025';
        const notifierWebhookUrl = `${gatewayBaseUrl}/api/location-tracker-notifier/webhook/web-to-android`;
        
        // Get device webhook URL (FCM token or device endpoint)
        // For now, we'll use a placeholder - this should be configured per device
        // In production, this would come from device registration (FCM token)
        const deviceWebhookUrl = process.env.ANDROID_WEBHOOK_BASE_URL || 
          `http://localhost:8080/api/task/notification`; // Android app endpoint

        await fetch(notifierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || '',
          },
          body: JSON.stringify({
            deviceId: body.deviceId,
            direction: 'web_to_android',
            title: `New Task: ${body.title}`,
            message: body.description || body.title,
            payload: {
              taskId: task.id,
              type: body.type,
              title: body.title,
              description: body.description,
              targetLatitude: body.targetLatitude,
              targetLongitude: body.targetLongitude,
              metadata: body.metadata,
            },
            webhookUrl: deviceWebhookUrl,
          }),
        }).catch((err) => {
          console.error('[Task Handler] Failed to send notification:', err);
          // Don't fail the task creation if notification fails
        });
      } catch (err) {
        console.error('[Task Handler] Error sending notification:', err);
        // Continue even if notification fails
      }

      return c.json(task, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create task';
      console.error('[Task Handler] Error creating task:', error);
      return c.json({ error: message }, 500);
    }
  })
  // GET /device/:deviceId - Get all tasks for a device
  .get('/device/:deviceId', async (c) => {
    try {
      const deviceId = c.req.param('deviceId');
      const limit = c.req.query('limit')
        ? parseInt(c.req.query('limit') || '100')
        : 100;
      const status = c.req.query('status');

      let tasks;
      if (status) {
        tasks = await taskRepo.findByDeviceIdAndStatus(deviceId, status, limit);
      } else {
        tasks = await taskService.getTasksByDeviceId(deviceId, limit);
      }

      return c.json(tasks);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch tasks';
      return c.json({ error: message }, 500);
    }
  })
  // GET /:id - Get a specific task
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const task = await taskService.getTaskById(id);
      if (!task) {
        return c.json({ error: 'Task not found' }, 404);
      }
      return c.json(task);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch task';
      return c.json({ error: message }, 500);
    }
  })
  // PATCH /:id/status - Update task status (from Android)
  .patch('/:id/status', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateTaskStatusDto>();

      if (!body.status) {
        return c.json({ error: 'status is required' }, 400);
      }

      const validStatuses = ['accepted', 'rejected', 'na', 'completed'];
      if (!validStatuses.includes(body.status)) {
        return c.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          400,
        );
      }

      const task = await taskService.updateTaskStatus(id, body);
      if (!task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      return c.json(task);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update task';
      return c.json({ error: message }, 500);
    }
  })
  // DELETE /:id - Delete a task
  .delete('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const deleted = await taskService.deleteTask(id);
      if (!deleted) {
        return c.json({ error: 'Task not found' }, 404);
      }
      return c.json({ message: 'Task deleted successfully' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete task';
      return c.json({ error: message }, 500);
    }
  });

