import { eq, and, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  notificationSchema,
  type NewNotification,
  type Notification,
} from '../schema/notification.schema';

export class NotificationRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(
    data: NewNotification,
  ): Promise<Notification> {
    const result = await this.db
      .insert(notificationSchema)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create notification');
    }

    return result[0];
  }

  async findById(id: string): Promise<Notification | null> {
    const [result] = await this.db
      .select()
      .from(notificationSchema)
      .where(eq(notificationSchema.id, id))
      .limit(1);

    return result || null;
  }

  async findByDeviceId(
    deviceId: string,
    limit: number = 100,
  ): Promise<Notification[]> {
    return await this.db
      .select()
      .from(notificationSchema)
      .where(eq(notificationSchema.deviceId, deviceId))
      .orderBy(desc(notificationSchema.createdAt))
      .limit(limit);
  }

  async update(
    id: string,
    data: Partial<NewNotification>,
  ): Promise<Notification | null> {
    const [result] = await this.db
      .update(notificationSchema)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationSchema.id, id))
      .returning();
    return result || null;
  }

  async updateStatus(
    id: string,
    status: string,
    errorMessage?: string | null,
  ): Promise<Notification | null> {
    const updateData: Partial<NewNotification> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'sent' || status === 'delivered') {
      updateData.sentAt = new Date();
    }

    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }

    return this.update(id, updateData);
  }
}

