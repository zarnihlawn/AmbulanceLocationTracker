import type {
  CreateLocationTrackingDto,
} from '../interface/location-tracking.interface';
import type { LocationTrackingRepository } from '../repo/location-tracking.repo';

export class LocationTrackingService {
  constructor(
    private locationTrackingRepo: LocationTrackingRepository,
  ) {}

  async createLocationTracking(data: CreateLocationTrackingDto) {
    if (!data.deviceId || data.latitude === undefined || data.longitude === undefined) {
      throw new Error('Device ID, latitude, and longitude are required');
    }

    if (data.latitude < -90 || data.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (data.longitude < -180 || data.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const locationTracking = await this.locationTrackingRepo.create({
      deviceId: data.deviceId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy ?? null,
      altitude: data.altitude ?? null,
      speed: data.speed ?? null,
      heading: data.heading ?? null,
    });

    // locationTracking is already a plain object from raw SQL query
    // Use bracket notation to access properties to avoid any potential getter/proxy issues
    const createdAtValue = locationTracking['createdAt'];
    const createdAt = createdAtValue instanceof Date 
      ? createdAtValue.toISOString() 
      : String(createdAtValue ?? '');
    
    return {
      id: String(locationTracking['id'] ?? ''),
      deviceId: String(locationTracking['deviceId'] ?? ''),
      latitude: Number(locationTracking['latitude'] ?? 0),
      longitude: Number(locationTracking['longitude'] ?? 0),
      accuracy: locationTracking['accuracy'] != null ? Number(locationTracking['accuracy']) : null,
      altitude: locationTracking['altitude'] != null ? Number(locationTracking['altitude']) : null,
      speed: locationTracking['speed'] != null ? Number(locationTracking['speed']) : null,
      heading: locationTracking['heading'] != null ? Number(locationTracking['heading']) : null,
      createdAt: createdAt,
    };
  }

  async getLocationTrackingByDeviceId(deviceId: string, limit?: number) {
    const locations = await this.locationTrackingRepo.findByDeviceId(
      deviceId,
      limit,
    );
    // locations are already plain objects from raw SQL query
    // Use bracket notation to access properties to avoid any potential getter/proxy issues
    return locations.map((loc) => {
      const createdAtValue = loc['createdAt'];
      const createdAt = createdAtValue instanceof Date 
        ? createdAtValue.toISOString() 
        : String(createdAtValue ?? '');
      
      return {
        id: String(loc['id'] ?? ''),
        deviceId: String(loc['deviceId'] ?? ''),
        latitude: Number(loc['latitude'] ?? 0),
        longitude: Number(loc['longitude'] ?? 0),
        accuracy: loc['accuracy'] != null ? Number(loc['accuracy']) : null,
        altitude: loc['altitude'] != null ? Number(loc['altitude']) : null,
        speed: loc['speed'] != null ? Number(loc['speed']) : null,
        heading: loc['heading'] != null ? Number(loc['heading']) : null,
        createdAt: createdAt,
      };
    });
  }

  async getLatestLocationByDeviceId(deviceId: string) {
    const location = await this.locationTrackingRepo.findLatestByDeviceId(
      deviceId,
    );
    if (!location) {
      throw new Error(`No location found for device ${deviceId}`);
    }
    // location is already a plain object from raw SQL query
    // Use bracket notation to access properties to avoid any potential getter/proxy issues
    const createdAtValue = location['createdAt'];
    const createdAt = createdAtValue instanceof Date 
      ? createdAtValue.toISOString() 
      : String(createdAtValue ?? '');
    
    return {
      id: String(location['id'] ?? ''),
      deviceId: String(location['deviceId'] ?? ''),
      latitude: Number(location['latitude'] ?? 0),
      longitude: Number(location['longitude'] ?? 0),
      accuracy: location['accuracy'] != null ? Number(location['accuracy']) : null,
      altitude: location['altitude'] != null ? Number(location['altitude']) : null,
      speed: location['speed'] != null ? Number(location['speed']) : null,
      heading: location['heading'] != null ? Number(location['heading']) : null,
      createdAt: createdAt,
    };
  }
}

