import { eq, desc, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  locationTrackerTaskSchema,
  type LocationTrackerTask,
  type NewLocationTrackerTask,
} from '../schema/location-tracker-task.schema';

export class LocationTrackerTaskRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(data: NewLocationTrackerTask): Promise<LocationTrackerTask> {
    const [task] = await this.db
      .insert(locationTrackerTaskSchema)
      .values(data)
      .returning();
    return task;
  }

  async findById(id: string): Promise<LocationTrackerTask | null> {
    const [task] = await this.db
      .select()
      .from(locationTrackerTaskSchema)
      .where(eq(locationTrackerTaskSchema.id, id))
      .limit(1);
    return task || null;
  }

  async findByDeviceId(
    deviceId: string,
    limit: number = 100,
  ): Promise<LocationTrackerTask[]> {
    return await this.db
      .select()
      .from(locationTrackerTaskSchema)
      .where(eq(locationTrackerTaskSchema.deviceId, deviceId))
      .orderBy(desc(locationTrackerTaskSchema.createdAt))
      .limit(limit);
  }

  async findByDeviceIdAndStatus(
    deviceId: string,
    status: string,
    limit: number = 100,
  ): Promise<LocationTrackerTask[]> {
    return await this.db
      .select()
      .from(locationTrackerTaskSchema)
      .where(
        and(
          eq(locationTrackerTaskSchema.deviceId, deviceId),
          eq(locationTrackerTaskSchema.status, status),
        ),
      )
      .orderBy(desc(locationTrackerTaskSchema.createdAt))
      .limit(limit);
  }

  async update(
    id: string,
    data: Partial<NewLocationTrackerTask>,
  ): Promise<LocationTrackerTask | null> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [task] = await this.db
      .update(locationTrackerTaskSchema)
      .set(updateData)
      .where(eq(locationTrackerTaskSchema.id, id))
      .returning();
    return task || null;
  }

  async updateStatus(
    id: string,
    status: string,
    responseMessage?: string,
  ): Promise<LocationTrackerTask | null> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
      respondedAt: new Date(),
    };

    if (responseMessage) {
      updateData.responseMessage = responseMessage;
    }

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const [task] = await this.db
      .update(locationTrackerTaskSchema)
      .set(updateData)
      .where(eq(locationTrackerTaskSchema.id, id))
      .returning();
    return task || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(locationTrackerTaskSchema)
      .where(eq(locationTrackerTaskSchema.id, id));
    return result.rowCount > 0;
  }
}

