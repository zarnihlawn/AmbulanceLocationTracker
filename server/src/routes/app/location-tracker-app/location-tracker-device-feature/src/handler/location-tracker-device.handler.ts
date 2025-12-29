import { Hono } from 'hono';
import { db } from '../db';
import type {
  CreateLocationTrackerDeviceDto,
  AcceptLocationTrackerDeviceDto,
} from '../interface/location-tracker-device.inteface';
import { LocationTrackerDeviceRepository } from '../repo/location-tracker-device.repo';
import { LocationTrackerDeviceService } from '../service/location-tracker-device.service';

const locationTrackerDeviceRepo =
  new LocationTrackerDeviceRepository(db);
const locationTrackerDeviceService =
  new LocationTrackerDeviceService(
    locationTrackerDeviceRepo,
  );

export const locationTrackerDeviceRoutes = new Hono()
  // Create device with secret key (from website)
  .post('/with-secret-key', async (c) => {
    try {
      const body = await c.req.json<{
        workspaceId: string;
        secretKey: string;
      }>();
      const locationTrackerDevice =
        await locationTrackerDeviceService.createLocationTrackerDeviceWithSecretKey(
          body,
        );
      return c.json(locationTrackerDevice, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create location tracker device';
      return c.json({ error: message }, 500);
    }
  })
  // Register device from Android app (with secret key validation)
  .post('/', async (c) => {
    try {
      const body =
        await c.req.json<CreateLocationTrackerDeviceDto>();
      const locationTrackerDevice =
        await locationTrackerDeviceService.createLocationTrackerDevice(
          body,
        );
      return c.json(locationTrackerDevice, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create location tracker device';
      return c.json({ error: message }, 500);
    }
  })
  // Accept device (from website)
  .patch('/:id/accept', async (c) => {
    try {
      const id = c.req.param('id');
      const body =
        await c.req.json<AcceptLocationTrackerDeviceDto>();
      const locationTrackerDevice =
        await locationTrackerDeviceService.acceptLocationTrackerDevice(
          id,
          body,
        );
      return c.json(locationTrackerDevice);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to accept device';
      return c.json({ error: message }, 500);
    }
  })
  .get('/', async (c) => {
    try {
      const locationTrackerDevices =
        await locationTrackerDeviceService.getLocationTrackerDevices();
      return c.json(locationTrackerDevices);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch location tracker devices';
      return c.json({ error: message }, 500);
    }
  })
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const locationTrackerDevice =
        await locationTrackerDeviceService.getLocationTrackerDeviceById(
          id,
        );
      return c.json(locationTrackerDevice);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Location Tracker Device not found';
      return c.json({ error: message }, 404);
    }
  })
  .get('/workspaceId/:workspaceId', async (c) => {
    try {
      const workspaceId = c.req.param('workspaceId');
      const locationTrackerDevices =
        await locationTrackerDeviceService.getLocationTrackerDevicesByWorkspaceId(
          workspaceId,
        );
      return c.json(locationTrackerDevices);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch location tracker devices by workspace id';
      return c.json({ error: message }, 500);
    }
  })
  .get('/deviceKey/:deviceKey', async (c) => {
    try {
      const deviceKey = c.req.param('deviceKey');
      const locationTrackerDevice =
        await locationTrackerDeviceService.getLocationTrackerDeviceByDeviceKey(
          deviceKey,
        );
      return c.json(locationTrackerDevice);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Device not found';
      return c.json({ error: message }, 404);
    }
  })
  .delete('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      await locationTrackerDeviceService.deleteLocationTrackerDevice(
        id,
      );
      return c.json(
        { message: 'Device deleted successfully' },
        200,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete device';
      return c.json({ error: message }, 500);
    }
  });
