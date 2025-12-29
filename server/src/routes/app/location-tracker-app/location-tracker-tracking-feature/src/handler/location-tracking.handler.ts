import { Hono } from 'hono';
import { db } from '../db';
import type { CreateLocationTrackingDto } from '../interface/location-tracking.interface';
import { LocationTrackingRepository } from '../repo/location-tracking.repo';
import { LocationTrackingService } from '../service/location-tracking.service';

// Create service instances directly (same pattern as other handlers)
const locationTrackingRepo = new LocationTrackingRepository(db);
const locationTrackingService = new LocationTrackingService(locationTrackingRepo);

export const locationTrackingRoutes = new Hono()
  // POST / - Create location tracking entry
  .post('/', async (c) => {
    try {
      const body = await c.req.json<CreateLocationTrackingDto>();
      
      if (!body || !body.deviceId) {
        return c.json({ error: 'deviceId is required' }, 400);
      }
      
      const deviceId = body.deviceId;
      const latitude = Number(body.latitude ?? 0);
      const longitude = Number(body.longitude ?? 0);
      
      // Log device ID and current location
      console.log(`[Tracking Service] HTTP POST - Device ID: ${deviceId}, Location: lat=${latitude}, lng=${longitude}, accuracy=${body.accuracy ?? 'N/A'}, speed=${body.speed ?? 'N/A'}`);
      
      const locationData: CreateLocationTrackingDto = {
        deviceId: deviceId,
        latitude: latitude,
        longitude: longitude,
        accuracy: body.accuracy != null ? Number(body.accuracy) : null,
        altitude: body.altitude != null ? Number(body.altitude) : null,
        speed: body.speed != null ? Number(body.speed) : null,
        heading: body.heading != null ? Number(body.heading) : null,
      };
      
      const locationTracking = await locationTrackingService.createLocationTracking(locationData);
      
      console.log(`[Tracking Service] Location saved to database for device ${deviceId} - ID: ${locationTracking.id}, Timestamp: ${locationTracking.createdAt}`);
      
      // Return response matching Android app's LocationTrackingResponse format
      return c.json({
        id: locationTracking.id,
        deviceId: locationTracking.deviceId,
        latitude: locationTracking.latitude,
        longitude: locationTracking.longitude,
        accuracy: locationTracking.accuracy,
        altitude: locationTracking.altitude,
        speed: locationTracking.speed,
        heading: locationTracking.heading,
        createdAt: locationTracking.createdAt,
      }, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create location tracking';
      console.error(`[Tracking Service] Error processing HTTP POST: ${message}`, error);
      return c.json({ error: message }, 500);
    }
  })
  // GET /device/:deviceId - Get location history for a device
  .get('/device/:deviceId', async (c) => {
    try {
      const deviceId = c.req.param('deviceId');
      const limit = c.req.query('limit')
        ? parseInt(c.req.query('limit') || '100')
        : 100;
      const locations = await locationTrackingService.getLocationTrackingByDeviceId(
          deviceId,
          limit,
        );
      return c.json(locations);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch location tracking';
      return c.json({ error: message }, 500);
    }
  })
  // GET /device/:deviceId/latest - Get latest location for a device
  .get('/device/:deviceId/latest', async (c) => {
    try {
      const deviceId = c.req.param('deviceId');
      const location = await locationTrackingService.getLatestLocationByDeviceId(deviceId);
      return c.json(location);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Location not found';
      return c.json({ error: message }, 404);
    }
  });
