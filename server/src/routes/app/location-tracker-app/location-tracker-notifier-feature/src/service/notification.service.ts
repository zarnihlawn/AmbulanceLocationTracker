import type { NotificationRepository } from '../repo/notification.repo';
import type { CreateNotificationDto } from '../interface/notification.interface';

export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
  ) {}

  async createNotification(
    data: CreateNotificationDto,
  ) {
    const notification = await this.notificationRepo.create({
      deviceId: data.deviceId,
      direction: data.direction,
      title: data.title || null,
      message: data.message || null,
      payload: data.payload || null,
      webhookUrl: data.webhookUrl || null,
      status: 'pending',
      retryCount: 0,
    });

    // Process the notification asynchronously
    this.processNotification(notification.id).catch((error) => {
      console.error(
        `[NotificationService] Error processing notification ${notification.id}:`,
        error,
      );
    });

    return notification;
  }

  async processNotification(notificationId: string) {
    const notification =
      await this.notificationRepo.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.status !== 'pending') {
      return; // Already processed
    }

    try {
      if (notification.direction === 'web_to_android') {
        await this.sendToAndroid(notification);
      } else if (notification.direction === 'android_to_web') {
        await this.sendToWeb(notification);
      }

      await this.notificationRepo.updateStatus(
        notification.id,
        'sent',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const retryCount = (notification.retryCount || 0) + 1;

      await this.notificationRepo.update(notification.id, {
        status: retryCount >= 3 ? 'failed' : 'pending',
        retryCount: retryCount,
        errorMessage,
      });

      // Retry if not exceeded max retries
      if (retryCount < 3) {
        setTimeout(() => {
          this.processNotification(notificationId).catch(
            console.error,
          );
        }, 5000 * retryCount); // Exponential backoff
      }
    }
  }

  private async sendToAndroid(notification: any) {
    // TODO: Implement Android push notification via FCM
    // For now, we'll use the webhook URL if provided
    if (!notification.webhookUrl) {
      throw new Error('Webhook URL is required for Android notifications');
    }

    const response = await fetch(notification.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: notification.deviceId,
        title: notification.title,
        message: notification.message,
        payload: notification.payload,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send notification to Android: ${response.statusText}`,
      );
    }
  }

  private async sendToWeb(notification: any) {
    // Send webhook to web frontend
    if (!notification.webhookUrl) {
      throw new Error('Webhook URL is required for web notifications');
    }

    const response = await fetch(notification.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: notification.deviceId,
        title: notification.title,
        message: notification.message,
        payload: notification.payload,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send notification to web: ${response.statusText}`,
      );
    }
  }

  async getNotificationsByDeviceId(
    deviceId: string,
    limit: number = 100,
  ) {
    return await this.notificationRepo.findByDeviceId(
      deviceId,
      limit,
    );
  }

  async getNotificationById(id: string) {
    return await this.notificationRepo.findById(id);
  }
}

