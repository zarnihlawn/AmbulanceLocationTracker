import { desc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  type NewLocationTracking,
  type LocationTracking,
  locationTrackingSchema,
} from '../schema/location-tracking.schema';
import { Pool } from 'pg';
import { getDatabaseUrl } from '../db/migrate';

export class LocationTrackingRepository {
  private pool: Pool;
  
  constructor(private db: NodePgDatabase<any>) {
    this.pool = new Pool({ connectionString: getDatabaseUrl() });
  }

  async create(
    data: NewLocationTracking,
  ): Promise<LocationTracking> {
    // Use raw SQL to avoid Drizzle ORM circular reference issues
    const query = `
      INSERT INTO location_tracking_tracker (device_id, latitude, longitude, accuracy, altitude, speed, heading, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, device_id, latitude, longitude, accuracy, altitude, speed, heading, created_at
    `;
    
    const result = await this.pool.query(query, [
      data.deviceId,
      data.latitude,
      data.longitude,
      data.accuracy ?? null,
      data.altitude ?? null,
      data.speed ?? null,
      data.heading ?? null,
    ]);

    if (!result.rows[0]) {
      throw new Error('Failed to create location tracking');
    }

    // Return plain object directly from PostgreSQL
    return {
      id: result.rows[0].id,
      deviceId: result.rows[0].device_id,
      latitude: Number(result.rows[0].latitude),
      longitude: Number(result.rows[0].longitude),
      accuracy: result.rows[0].accuracy ? Number(result.rows[0].accuracy) : null,
      altitude: result.rows[0].altitude ? Number(result.rows[0].altitude) : null,
      speed: result.rows[0].speed ? Number(result.rows[0].speed) : null,
      heading: result.rows[0].heading ? Number(result.rows[0].heading) : null,
      createdAt: result.rows[0].created_at,
    } as LocationTracking;
  }

  async findByDeviceId(
    deviceId: string,
    limit: number = 100,
  ): Promise<LocationTracking[]> {
    // Use raw SQL to avoid Drizzle ORM circular reference issues
    const query = `
      SELECT id, device_id, latitude, longitude, accuracy, altitude, speed, heading, created_at
      FROM location_tracking_tracker
      WHERE device_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [deviceId, limit]);
    
    // Return plain objects directly from PostgreSQL
    return result.rows.map((row: any) => ({
      id: row.id,
      deviceId: row.device_id,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      accuracy: row.accuracy ? Number(row.accuracy) : null,
      altitude: row.altitude ? Number(row.altitude) : null,
      speed: row.speed ? Number(row.speed) : null,
      heading: row.heading ? Number(row.heading) : null,
      createdAt: row.created_at,
    })) as LocationTracking[];
  }

  async findLatestByDeviceId(
    deviceId: string,
  ): Promise<LocationTracking | null> {
    // Use raw SQL to avoid Drizzle ORM circular reference issues
    const query = `
      SELECT id, device_id, latitude, longitude, accuracy, altitude, speed, heading, created_at
      FROM location_tracking_tracker
      WHERE device_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [deviceId]);
    
    if (!result.rows[0]) {
      return null;
    }
    
    // Return plain object directly from PostgreSQL
    return {
      id: result.rows[0].id,
      deviceId: result.rows[0].device_id,
      latitude: Number(result.rows[0].latitude),
      longitude: Number(result.rows[0].longitude),
      accuracy: result.rows[0].accuracy ? Number(result.rows[0].accuracy) : null,
      altitude: result.rows[0].altitude ? Number(result.rows[0].altitude) : null,
      speed: result.rows[0].speed ? Number(result.rows[0].speed) : null,
      heading: result.rows[0].heading ? Number(result.rows[0].heading) : null,
      createdAt: result.rows[0].created_at,
    } as LocationTracking;
  }

  async deleteByDeviceId(deviceId: string): Promise<number> {
    // Use raw SQL to avoid Drizzle ORM circular reference issues
    const query = `DELETE FROM location_tracking_tracker WHERE device_id = $1`;
    const result = await this.pool.query(query, [deviceId]);
    return result.rowCount || 0;
  }
}

