import { z } from 'zod';

export const createNotificationDtoSchema = z.object({
  deviceId: z.string().uuid(),
  direction: z.enum(['web_to_android', 'android_to_web']),
  title: z.string().optional(),
  message: z.string().optional(),
  payload: z.record(z.any()).optional(),
  webhookUrl: z.string().url().optional(),
});

export type CreateNotificationDto = z.infer<
  typeof createNotificationDtoSchema
>;

export interface NotificationResponse {
  id: string;
  deviceId: string;
  direction: 'web_to_android' | 'android_to_web';
  title: string | null;
  message: string | null;
  payload: Record<string, any> | null;
  status: string;
  webhookUrl: string | null;
  retryCount: string;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
}

