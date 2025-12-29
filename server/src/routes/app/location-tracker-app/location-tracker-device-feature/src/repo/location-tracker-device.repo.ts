import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  type NewLocationTrackerDevice,
  type LocationTrackerDevice,
  locationTrackerDeviceSchema,
} from '../schema/location-tracker-device.schema';

export class LocationTrackerDeviceRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(
    data: NewLocationTrackerDevice,
  ): Promise<LocationTrackerDevice> {
    const result = await this.db
      .insert(locationTrackerDeviceSchema)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error(
        'Failed to create location tracker device',
      );
    }

    return result[0];
  }

  async findAll(): Promise<LocationTrackerDevice[]> {
    return await this.db
      .select()
      .from(locationTrackerDeviceSchema);
  }

  async findById(
    id: string,
  ): Promise<LocationTrackerDevice | null> {
    const [result] = await this.db
      .select()
      .from(locationTrackerDeviceSchema)
      .where(eq(locationTrackerDeviceSchema.id, id))
      .limit(1);

    return result || null;
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<LocationTrackerDevice[]> {
    return await this.db
      .select()
      .from(locationTrackerDeviceSchema)
      .where(
        eq(
          locationTrackerDeviceSchema.workspaceId,
          workspaceId,
        ),
      );
  }

  async findBySecretKeyAndWorkspaceId(
    secretKey: string,
    workspaceId: string,
  ): Promise<LocationTrackerDevice | null> {
    const [result] = await this.db
      .select()
      .from(locationTrackerDeviceSchema)
      .where(
        and(
          eq(
            locationTrackerDeviceSchema.secretKey,
            secretKey,
          ),
          eq(
            locationTrackerDeviceSchema.workspaceId,
            workspaceId,
          ),
        ),
      )
      .limit(1);
    return result || null;
  }

  async findByDeviceKey(
    deviceKey: string,
  ): Promise<LocationTrackerDevice | null> {
    const [result] = await this.db
      .select()
      .from(locationTrackerDeviceSchema)
      .where(
        eq(
          locationTrackerDeviceSchema.deviceKey,
          deviceKey,
        ),
      )
      .limit(1);
    return result || null;
  }

  async update(
    id: string,
    data: Partial<NewLocationTrackerDevice>,
  ): Promise<LocationTrackerDevice | null> {
    const [result] = await this.db
      .update(locationTrackerDeviceSchema)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(locationTrackerDeviceSchema.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(locationTrackerDeviceSchema)
      .where(eq(locationTrackerDeviceSchema.id, id))
      .returning();
    return result.length > 0;
  }
}
